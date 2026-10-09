/**
 * customizer/accessories.ts — accessory slots driven by lane manifests.
 *
 * The modeling lanes (masks/hoods/hair, gloves/shoes, chains) ship
 * public/models/<category>/manifest.json files describing each accessory and
 * how it attaches. This module:
 *  - fetches and merges those manifests at runtime (no code change per lane),
 *  - loads the accessory GLB,
 *  - hangs it from a named bone (exact name, then case-insensitive pattern
 *    fallback, then a slot-default bone heuristic),
 *  - keeps a per-slot registry on the model root so swaps are clean.
 *
 * Manifest contract (authored by the lanes, read docs/customization/customizer.md):
 *   { "accessories": [ { id, label, slot, file, attach: { bone, position, rotation, scale? } } ] }
 */

import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { assetUrl } from "../../asset-base";
import type { AccessoryManifest, AccessorySlotId } from "./types";

/** Manifest locations the customizer scans (lanes add theirs here as they merge). */
const MANIFEST_URLS = [
  "models/accessories/manifest.json",
  "models/hair/manifest.json",
  "models/masks/manifest.json",
  "models/hoods/manifest.json",
  "models/gloves/manifest.json",
  "models/shoes/manifest.json",
];

/** Slot -> bone-name patterns tried when a manifest names no exact bone. */
const SLOT_BONE_FALLBACK: Record<AccessorySlotId, RegExp[]> = {
  hair: [/head/i],
  facialHair: [/head/i, /jaw/i],
  mask: [/head/i],
  hood: [/head/i, /neck/i],
  chain: [/neck/i, /spine2/i, /chest/i],
  gloves: [/hand/i],
  shoes: [/foot/i, /toe/i],
};

const REGISTRY_KEY = "__customizerAccessories";

type Registry = Map<AccessorySlotId, { id: string; node: THREE.Object3D }>;

function registry(root: THREE.Object3D): Registry {
  let reg = (root.userData as Record<string, unknown>)[REGISTRY_KEY] as Registry | undefined;
  if (!reg) {
    reg = new Map();
    (root.userData as Record<string, unknown>)[REGISTRY_KEY] = reg;
  }
  return reg;
}

let manifestCache: AccessoryManifest[] | null = null;

/** Load and merge every accessory manifest. Cached after first call. */
export async function loadAccessoryManifests(): Promise<AccessoryManifest[]> {
  if (manifestCache) return manifestCache;
  const out: AccessoryManifest[] = [];
  await Promise.all(
    MANIFEST_URLS.map(async (url) => {
      try {
        const res = await fetch(assetUrl(url));
        if (!res.ok) return;
        const json = (await res.json()) as { accessories?: AccessoryManifest[] };
        for (const a of json.accessories ?? []) out.push(a);
      } catch {
        // Manifest not merged yet (parallel lane) — skip silently.
      }
    }),
  );
  manifestCache = out;
  return out;
}

export function manifestsForSlot(
  manifests: AccessoryManifest[],
  slot: AccessorySlotId,
): AccessoryManifest[] {
  return manifests.filter((m) => m.slot === slot);
}

/** Find the best bone for an accessory: exact name -> pattern -> slot fallback. */
function findBone(root: THREE.Object3D, want: string, slot: AccessorySlotId): THREE.Bone | null {
  const bones: THREE.Bone[] = [];
  root.traverse((o) => {
    if ((o as THREE.Bone).isBone) bones.push(o as THREE.Bone);
  });
  const exact = bones.find((b) => b.name === want);
  if (exact) return exact;
  const wantRe = new RegExp(want.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
  const fuzzy = bones.find((b) => wantRe.test(b.name));
  if (fuzzy) return fuzzy;
  for (const re of SLOT_BONE_FALLBACK[slot]) {
    const fb = bones.find((b) => re.test(b.name));
    if (fb) return fb;
  }
  return bones[0] ?? null;
}

/** Normalize a bone name for fuzzy matching: lowercase, strip common rig
 * prefixes (mixamorig:, J_, H_, N_, F_) and non-alphanumerics. */
function normBone(name: string): string {
  return name
    .toLowerCase()
    .replace(/^mixamorig:/, "")
    .replace(/^[jhnf]_/, "")
    .replace(/[^a-z0-9]/g, "");
}

const sharedLoader = new GLTFLoader();

/**
 * Rebind an accessory's skinned meshes onto the fighter's bones by name
 * (exact, then normalized-fuzzy). Mirrors quaternius.attachPart. Returns the
 * rebound meshes — the caller must bind() them AFTER they are placed in the
 * scene graph, so the bind matrix matches their final world transform.
 */
function rebindAccessoryBones(
  root: THREE.Object3D,
  node: THREE.Object3D,
): THREE.SkinnedMesh[] {
  const bodyBones = new Map<string, THREE.Bone>();
  const fuzzy = new Map<string, THREE.Bone>();
  root.traverse((o) => {
    const bone = o as THREE.Bone;
    if (!bone.isBone) return;
    bodyBones.set(bone.name, bone);
    const n = normBone(bone.name);
    if (!fuzzy.has(n)) fuzzy.set(n, bone);
  });
  if (bodyBones.size === 0) return [];

  const rebound: THREE.SkinnedMesh[] = [];
  node.traverse((o) => {
    const mesh = o as THREE.SkinnedMesh;
    if (!mesh.isSkinnedMesh || !mesh.skeleton) return;
    const src = mesh.skeleton;
    const remapped: THREE.Bone[] = [];
    const inverses: THREE.Matrix4[] = [];
    for (let i = 0; i < src.bones.length; i++) {
      const name = src.bones[i].name;
      const target = bodyBones.get(name) ?? fuzzy.get(normBone(name));
      if (!target) return []; // incomplete bind — fall back to bone-hang
      remapped.push(target);
      inverses.push(src.boneInverses[i].clone());
    }
    mesh.skeleton = new THREE.Skeleton(remapped, inverses);
    rebound.push(mesh);
  });
  return rebound;
}

/**
 * Attach an accessory manifest to the model root. Replaces whatever was in
 * that slot before. Returns the attached node, or null on failure.
 *
 * Strategy: accessories that ship their own rig (the chains are skinned to
 * Neck/Spine2) are REBOUND onto the fighter's matching bones so they move
 * with the body. Non-skinned accessories fall back to hanging from the
 * manifest's attach bone with the authored offset/rotation.
 */
export async function attachAccessory(
  root: THREE.Object3D,
  manifest: AccessoryManifest,
): Promise<THREE.Object3D | null> {
  detachAccessory(root, manifest.slot);
  const gltf = await sharedLoader.loadAsync(assetUrl(manifest.file)).catch(() => null);
  if (!gltf) return null;
  const node = gltf.scene;
  node.traverse((o) => {
    o.frustumCulled = true;
  });

  const rebound = rebindAccessoryBones(root, node);
  if (rebound.length > 0) {
    // Skinned to the fighter now — collect the rebound meshes in a holder so
    // detachAccessory can remove them cleanly, then bind in final position.
    //
    // DCC scale fix: accessory bind space rarely matches the fighter (the
    // chains are authored ~8x oversize). Scaling the holder would break the
    // skinning math (bind matrix vs bone matrices), so instead bake the
    // manifest scale into the geometry AND the bone-inverse translations,
    // then bind with the holder at scale 1.
    const s = manifest.attach.scale ?? 1;
    const holder = new THREE.Group();
    holder.name = `accessory:${manifest.id}`;
    // Optional orientation fix for the rebind path (rigid rotation is safe:
    // it is baked into the bind matrices, unlike holder scale). Lets the
    // chain lane tune pendant direction without touching code.
    const [rx, ry, rz] = manifest.attach.rotation;
    holder.rotation.set(
      (rx * Math.PI) / 180,
      (ry * Math.PI) / 180,
      (rz * Math.PI) / 180,
    );
    for (const mesh of rebound) {
      if (s !== 1) {
        mesh.geometry.scale(s, s, s);
        const inv = mesh.skeleton.boneInverses;
        for (let i = 0; i < inv.length; i++) {
          const e = inv[i].elements;
          e[12] *= s;
          e[13] *= s;
          e[14] *= s;
        }
      }
      holder.add(mesh);
    }
    root.add(holder);
    root.updateMatrixWorld(true);
    for (const mesh of rebound) mesh.bind(mesh.skeleton, mesh.matrixWorld);
    registry(root).set(manifest.slot, { id: manifest.id, node: holder });
    return holder;
  } else {
    const bone = findBone(root, manifest.attach.bone, manifest.slot);
    if (!bone) return null;
    const { position, rotation, scale } = manifest.attach;
    node.position.set(position[0], position[1], position[2]);
    node.rotation.set(
      (rotation[0] * Math.PI) / 180,
      (rotation[1] * Math.PI) / 180,
      (rotation[2] * Math.PI) / 180,
    );
    node.scale.setScalar(scale ?? 1);
    bone.add(node);
  }

  registry(root).set(manifest.slot, { id: manifest.id, node });
  return node;
}

/** Remove the accessory currently in a slot (no-op when empty). */
export function detachAccessory(root: THREE.Object3D, slot: AccessorySlotId): void {
  const reg = registry(root);
  const entry = reg.get(slot);
  if (!entry) return;
  entry.node.parent?.remove(entry.node);
  reg.delete(slot);
}

/** Remove every accessory the customizer attached. */
export function detachAllAccessories(root: THREE.Object3D): void {
  const reg = registry(root);
  for (const slot of [...reg.keys()]) detachAccessory(root, slot);
}

/** Manifest id currently attached in a slot, or null. */
export function accessoryInSlot(root: THREE.Object3D, slot: AccessorySlotId): string | null {
  return registry(root).get(slot)?.id ?? null;
}
