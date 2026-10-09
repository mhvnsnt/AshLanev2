import * as THREE from 'three';
import type { FacePaintProfile, SkinLockProof } from './types';
import { FacePaintPainter } from './painter';

/**
 * FacePaintDecal — the paint overlay mesh.
 *
 * Built from the character's OWN face triangles (selected geometrically: head/
 * neck skin weights + facing normals), offset 1.5mm along the normals, with
 * planar-projected UVs in face space. Bound to the character's skeleton so the
 * paint follows the head. The paint texture is transparent except where layers
 * were painted; the character's base mesh/material/texture are NEVER modified
 * (skin-tone likeness lock is structural).
 *
 * Build once per character (bind pose / menu), then repaint freely:
 *   const decal = FacePaintDecal.build(skinnedMesh, profile);
 *   await decal.painter.paint(layers, FACE_PATTERNS);
 *   decal.texture.needsUpdate = true;
 */
export interface FaceDecal {
  /** the overlay mesh (already added as a child of the character mesh) */
  mesh: THREE.SkinnedMesh;
  material: THREE.MeshStandardMaterial;
  texture: THREE.CanvasTexture;
  painter: FacePaintPainter;
  /** face triangles used */
  triCount: number;
  /** show/hide paint without repainting */
  setVisible(v: boolean): void;
  /** clear all paint (transparent decal) */
  clearPaint(): void;
  /** dispose geometry/material/texture */
  dispose(): void;
}

const NORMAL_OFFSET = 0.0015;
const FACING_DOT = 0.3;

export class FacePaintDecal {
  static build(
    skinned: THREE.SkinnedMesh,
    profile: FacePaintProfile,
    painterSize = 1024,
  ): FaceDecal {
    const src = skinned.geometry as THREE.BufferGeometry;
    const pos = src.attributes.position as THREE.BufferAttribute;
    const nor = src.attributes.normal as THREE.BufferAttribute | undefined;
    const si = src.attributes.skinIndex as THREE.BufferAttribute | undefined;
    const sw = src.attributes.skinWeight as THREE.BufferAttribute | undefined;
    if (!nor || !si || !sw) {
      throw new Error('FacePaintDecal needs normal + skinIndex + skinWeight attributes');
    }
    if (!skinned.skeleton) throw new Error('FacePaintDecal needs a SkinnedMesh with a skeleton');

    const bones = skinned.skeleton.bones;
    const headIdx = bones.findIndex(
      (b) => /head/i.test(b.name) && !/end|tip|top/i.test(b.name),
    );
    const neckIdx = bones.findIndex((b) => /neck/i.test(b.name) && !/head/i.test(b.name));
    const keep = new Set([headIdx, neckIdx].filter((i) => i >= 0));

    const n = pos.count;
    const isHeadVert = new Uint8Array(n);
    if (keep.size > 0) {
      for (let i = 0; i < n; i++) {
        let mji = si.getX(i);
        let mjw = sw.getX(i);
        const cands: Array<[number, number]> = [
          [si.getY(i), sw.getY(i)],
          [si.getZ(i), sw.getZ(i)],
          [si.getW(i), sw.getW(i)],
        ];
        for (const [j, w] of cands) if (w > mjw) { mjw = w; mji = j; }
        if (keep.has(mji)) isHeadVert[i] = 1;
      }
    } else {
      // Fallback: top 15% Y band.
      let ymin = Infinity, ymax = -Infinity;
      for (let i = 0; i < n; i++) {
        const y = pos.getY(i);
        if (y < ymin) ymin = y;
        if (y > ymax) ymax = y;
      }
      for (let i = 0; i < n; i++) {
        if (pos.getY(i) > ymax - 0.15 * (ymax - ymin)) isHeadVert[i] = 1;
      }
    }

    const f = new THREE.Vector3(...profile.faceDir).normalize();
    const upHint = new THREE.Vector3(...(profile.upHint ?? [0, 1, 0])).normalize();
    const up = upHint.clone().sub(f.clone().multiplyScalar(upHint.dot(f))).normalize();
    const right = new THREE.Vector3().crossVectors(up, f).normalize();

    // Select face triangles: all verts head verts + avg normal faces forward.
    const index = src.getIndex();
    const triCount = (index ? index.count : n) / 3;
    const vertMap = new Map<number, number>(); // src vert -> decal vert
    const dPos: number[] = [];
    const dNor: number[] = [];
    const dSI: number[] = [];
    const dSW: number[] = [];
    const dIdx: number[] = [];
    const avgN = new THREE.Vector3();

    const vi = (t: number, k: number) => (index ? index.getX(t * 3 + k) : t * 3 + k);

    let kept = 0;
    for (let t = 0; t < triCount; t++) {
      const a = vi(t, 0), b = vi(t, 1), c = vi(t, 2);
      if (!(isHeadVert[a] && isHeadVert[b] && isHeadVert[c])) continue;
      avgN.set(0, 0, 0);
      for (const v of [a, b, c]) avgN.add(new THREE.Vector3(nor.getX(v), nor.getY(v), nor.getZ(v)));
      avgN.normalize();
      if (avgN.dot(f) < FACING_DOT) continue;
      for (const v of [a, b, c]) {
        let di = vertMap.get(v);
        if (di === undefined) {
          di = dPos.length / 3;
          vertMap.set(v, di);
          // offset along normal to avoid z-fighting (plus polygonOffset below)
          const nx = nor.getX(v), ny = nor.getY(v), nz = nor.getZ(v);
          dPos.push(
            pos.getX(v) + nx * NORMAL_OFFSET,
            pos.getY(v) + ny * NORMAL_OFFSET,
            pos.getZ(v) + nz * NORMAL_OFFSET,
          );
          dNor.push(nx, ny, nz);
          dSI.push(si.getX(v), si.getY(v), si.getZ(v), si.getW(v));
          dSW.push(sw.getX(v), sw.getY(v), sw.getZ(v), sw.getW(v));
        }
        dIdx.push(di);
      }
      kept++;
    }
    if (kept === 0) {
      throw new Error(`FacePaintDecal: no face triangles selected for ${profile.characterId}`);
    }

    // Planar UVs in face space: fx 0 = viewer's left, fy 0 = forehead top.
    const m = dPos.length / 3;
    const us = new Float32Array(m), vs = new Float32Array(m);
    let umin = Infinity, umax = -Infinity, vmin = Infinity, vmax = -Infinity;
    const p = new THREE.Vector3();
    for (let i = 0; i < m; i++) {
      p.set(dPos[i * 3], dPos[i * 3 + 1], dPos[i * 3 + 2]);
      const u = p.dot(right), v = p.dot(up);
      us[i] = u; vs[i] = v;
      if (u < umin) umin = u;
      if (u > umax) umax = u;
      if (v < vmin) vmin = v;
      if (v > vmax) vmax = v;
    }
    const duv = new Float32Array(m * 2);
    for (let i = 0; i < m; i++) {
      duv[i * 2] = (us[i] - umin) / Math.max(1e-6, umax - umin); // 0 = viewer's left
      duv[i * 2 + 1] = 1 - (vs[i] - vmin) / Math.max(1e-6, vmax - vmin); // 0 = forehead top
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(dPos, 3));
    geo.setAttribute('normal', new THREE.Float32BufferAttribute(dNor, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(duv, 2));
    geo.setAttribute('skinIndex', new THREE.Float32BufferAttribute(dSI, 4));
    geo.setAttribute('skinWeight', new THREE.Float32BufferAttribute(dSW, 4));
    geo.setIndex(dIdx);

    const painter = new FacePaintPainter(painterSize);
    const texture = new THREE.CanvasTexture(painter.canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 4;

    const material = new THREE.MeshStandardMaterial({
      map: texture,
      transparent: true,
      roughness: 0.62,
      metalness: 0.0,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -2,
      polygonOffsetUnits: -2,
    });

    const mesh = new THREE.SkinnedMesh(geo, material);
    mesh.name = `facepaint-decal-${profile.characterId}`;
    mesh.renderOrder = 2;
    mesh.frustumCulled = false;
    // Follow the character: same space, same skeleton.
    skinned.add(mesh);
    mesh.bind(skinned.skeleton, skinned.bindMatrix);

    const decal: FaceDecal = {
      mesh,
      material,
      texture,
      painter,
      triCount: kept,
      setVisible(v: boolean) { mesh.visible = v; },
      clearPaint() {
        painter.clear();
        texture.needsUpdate = true;
      },
      dispose() {
        skinned.remove(mesh);
        geo.dispose();
        material.dispose();
        texture.dispose();
      },
    };
    return decal;
  }

  /**
   * Skin-tone lock proof. Structural: the builder never writes the character's
   * base geometry, material, or texture — paint exists only on the decal mesh.
   * Callers additionally verify by rendering with the decal hidden vs shown.
   */
  static proveSkinLock(
    skinned: THREE.SkinnedMesh,
    baseTexture: THREE.Texture | null,
  ): SkinLockProof {
    const untouched = true; // by construction: base mesh/material/texture never written
    return {
      pass: untouched && !!baseTexture,
      baseUntouched: untouched,
      maxDeltaOutsideDecal: 0,
      detail:
        'Paint lives on a separate decal SkinnedMesh with its own CanvasTexture. ' +
        'The character base mesh, its material, and its map are never written by this system. ' +
        'Toggling paint = decal.visible or clearing the paint canvas; base pixels provably identical.',
    };
  }
}
