import * as THREE from "three";
import { clone as cloneRig } from "three/examples/jsm/utils/SkeletonUtils.js";

const UP = new THREE.Vector3(0, 1, 0);

function sideVector(root: THREE.Object3D) {
  let hips: THREE.Object3D | null = null;
  let left: THREE.Object3D | null = null;
  root.traverse((obj) => {
    if (obj.name === "Hips" || obj.name === "mixamorigHips") hips = obj;
    if (obj.name === "LeftUpLeg" || obj.name === "mixamorigLeftUpLeg") left = obj;
  });
  const out = new THREE.Vector3(1, 0, 0);
  if (!hips || !left) return out;
  const a = new THREE.Vector3();
  const b = new THREE.Vector3();
  (hips as THREE.Object3D).getWorldPosition(a);
  (left as THREE.Object3D).getWorldPosition(b);
  out.subVectors(b, a);
  out.y = 0;
  if (out.lengthSq() < 1e-6) out.set(1, 0, 0);
  else out.normalize();
  return out;
}

function distToBone(p: THREE.Vector3, a: THREE.Vector3, b: THREE.Vector3) {
  const abx = b.x - a.x;
  const aby = b.y - a.y;
  const abz = b.z - a.z;
  const len = abx * abx + aby * aby + abz * abz;
  if (len < 1e-8) return p.distanceTo(a);
  let t = ((p.x - a.x) * abx + (p.y - a.y) * aby + (p.z - a.z) * abz) / len;
  t = Math.min(1, Math.max(0, t));
  const x = a.x + abx * t - p.x;
  const y = a.y + aby * t - p.y;
  const z = a.z + abz * t - p.z;
  return Math.sqrt(x * x + y * y + z * z);
}

export function wearMannequin(castRoot: THREE.Object3D, mannequinRoot: THREE.Object3D) {
  const donor = cloneRig(mannequinRoot) as THREE.Group;
  donor.position.set(0, 0, 0);
  donor.rotation.set(0, 0, 0);
  donor.scale.set(1, 1, 1);
  donor.updateMatrixWorld(true);
  castRoot.updateMatrixWorld(true);

  const manBox = new THREE.Box3();
  donor.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (mesh.isMesh) manBox.expandByObject(mesh);
  });
  const drop: THREE.Object3D[] = [];
  donor.traverse((obj) => {
    if ((obj as THREE.Mesh).isMesh) drop.push(obj);
  });
  for (const obj of drop) obj.removeFromParent();
  donor.updateMatrixWorld(true);

  const bones: THREE.Bone[] = [];
  donor.traverse((obj) => {
    if ((obj as THREE.Bone).isBone) bones.push(obj as THREE.Bone);
  });
  const start = bones.map(() => new THREE.Vector3());
  const end = bones.map(() => new THREE.Vector3());
  bones.forEach((bone, i) => {
    bone.getWorldPosition(start[i]);
    const child = bone.children.find((item) => (item as THREE.Bone).isBone) as THREE.Bone | undefined;
    if (child) child.getWorldPosition(end[i]);
    else bone.localToWorld(end[i].set(0, 0.06, 0));
  });

  const manSide = sideVector(donor);
  const castSide = sideVector(castRoot);
  const yaw = Math.atan2(manSide.x, manSide.z) - Math.atan2(castSide.x, castSide.z);

  const meshes: THREE.Mesh[] = [];
  castRoot.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (mesh.isMesh && mesh.geometry?.getAttribute("position")) meshes.push(mesh);
  });

  for (const mesh of meshes) {
    const src = mesh.geometry;
    const pos = src.getAttribute("position");
    const normal = src.getAttribute("normal");
    const uv = src.getAttribute("uv");
    const count = pos.count;
    const placed: THREE.Vector3[] = new Array(count);
    const box = new THREE.Box3();
    const point = new THREE.Vector3();
    for (let i = 0; i < count; i++) {
      point.fromBufferAttribute(pos, i);
      mesh.localToWorld(point);
      point.applyAxisAngle(UP, yaw);
      const kept = point.clone();
      placed[i] = kept;
      box.expandByPoint(kept);
    }
    const manSize = manBox.getSize(new THREE.Vector3());
    const castSize = box.getSize(new THREE.Vector3());
    const scale = manSize.y / Math.max(0.01, castSize.y);
    const manCenter = manBox.getCenter(new THREE.Vector3());
    const castCenter = box.getCenter(new THREE.Vector3());
    const shiftX = manCenter.x - castCenter.x * scale;
    const shiftY = manBox.min.y - box.min.y * scale;
    const shiftZ = manCenter.z - castCenter.z * scale;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = placed[i].x * scale + shiftX;
      positions[i * 3 + 1] = placed[i].y * scale + shiftY;
      positions[i * 3 + 2] = placed[i].z * scale + shiftZ;
      placed[i].set(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]);
    }
    const normals = new Float32Array(count * 3);
    const nmat = new THREE.Matrix3().getNormalMatrix(mesh.matrixWorld);
    if (normal) {
      for (let i = 0; i < count; i++) {
        point.fromBufferAttribute(normal, i).applyMatrix3(nmat).applyAxisAngle(UP, yaw).normalize();
        normals[i * 3] = point.x;
        normals[i * 3 + 1] = point.y;
        normals[i * 3 + 2] = point.z;
      }
    }
    const skinIndex = new Uint16Array(count * 4);
    const skinWeight = new Float32Array(count * 4);
    // Mission-start hitch fix: the old path allocated/sorted a distance object
    // array for every vertex. Keep only the four nearest bones in scalar slots.
    // This preserves the same inverse-distance weighting without the per-vertex
    // sort/GC cliff that could lock the main thread on larger cast meshes.
    for (let i = 0; i < count; i++) {
      let i0 = 0, i1 = 0, i2 = 0, i3 = 0;
      let d0 = Infinity, d1 = Infinity, d2 = Infinity, d3 = Infinity;
      const p = placed[i];
      for (let b = 0; b < bones.length; b++) {
        const d = distToBone(p, start[b], end[b]);
        if (d < d0) {
          d3 = d2; i3 = i2;
          d2 = d1; i2 = i1;
          d1 = d0; i1 = i0;
          d0 = d; i0 = b;
        } else if (d < d1) {
          d3 = d2; i3 = i2;
          d2 = d1; i2 = i1;
          d1 = d; i1 = b;
        } else if (d < d2) {
          d3 = d2; i3 = i2;
          d2 = d; i2 = b;
        } else if (d < d3) {
          d3 = d; i3 = b;
        }
      }
      const w0 = 1 / (d0 + 0.025);
      const w1 = 1 / (d1 + 0.025);
      const w2 = 1 / (d2 + 0.025);
      const w3 = 1 / (d3 + 0.025);
      const sum = w0 + w1 + w2 + w3;
      const o = i * 4;
      skinIndex[o] = i0; skinIndex[o + 1] = i1; skinIndex[o + 2] = i2; skinIndex[o + 3] = i3;
      skinWeight[o] = w0 / sum; skinWeight[o + 1] = w1 / sum; skinWeight[o + 2] = w2 / sum; skinWeight[o + 3] = w3 / sum;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("normal", new THREE.BufferAttribute(normals, 3));
    if (uv) geo.setAttribute("uv", uv.clone());
    if (src.index) geo.setIndex(src.index.clone());
    if (!normal) geo.computeVertexNormals();
    const material = Array.isArray(mesh.material) ? mesh.material.map((mat) => mat.clone()) : mesh.material.clone();
    const skinned = new THREE.SkinnedMesh(geo, material);
    skinned.name = mesh.name || "cast";
    skinned.frustumCulled = false;
    donor.add(skinned);
    skinned.updateMatrixWorld(true);
    skinned.bind(new THREE.Skeleton(bones));
  }

  donor.userData.fitted = true;
  return donor;
}
