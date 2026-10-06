/**
 * env-textures.ts — CC0 PBR environment textures for the game city.
 *
 * Sources (all CC0 1.0, no attribution required — see docs/round6/env-assets.md):
 *   asphalt_03 ............ Poly Haven (Charlotte Baglioni / Dario Barresi)
 *   concrete_floor_worn_001 Poly Haven (Charlotte Baglioni)
 *   red_brick_03 .......... Poly Haven (Dimitrios Savva)
 * Files live in public/textures/env/<set>/<set>_{diff,nor,rough,ao}_1k.jpg
 */
import * as THREE from "three";

const BASE = "/textures/env";

export interface PbrSet {
  map: THREE.Texture;
  normalMap: THREE.Texture;
  roughnessMap: THREE.Texture;
  aoMap: THREE.Texture;
}

const cache = new Map<string, PbrSet>();

function tex(loader: THREE.TextureLoader, url: string, srgb: boolean): THREE.Texture {
  const t = loader.load(url);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

export function loadPbrSet(name: string): PbrSet {
  const hit = cache.get(name);
  if (hit) return hit;
  const loader = new THREE.TextureLoader();
  const set: PbrSet = {
    map: tex(loader, `${BASE}/${name}/${name}_diff_1k.jpg`, true),
    normalMap: tex(loader, `${BASE}/${name}/${name}_nor_1k.jpg`, false),
    roughnessMap: tex(loader, `${BASE}/${name}/${name}_rough_1k.jpg`, false),
    aoMap: tex(loader, `${BASE}/${name}/${name}_ao_1k.jpg`, false),
  };
  cache.set(name, set);
  return set;
}

function repeat(set: PbrSet, rx: number, ry: number): PbrSet {
  for (const t of Object.values(set)) t.repeat.set(rx, ry);
  return set;
}

/** Night asphalt for roads. */
export function asphaltMaterial(rx = 2, ry = 6): THREE.MeshStandardMaterial {
  const s = repeat(loadPbrSet("asphalt_03"), rx, ry);
  return new THREE.MeshStandardMaterial({
    ...s,
    roughness: 1.0,
    metalness: 0.08,
    color: 0x8a8a92,
    envMapIntensity: 0.7,
  });
}

/** Worn concrete for sidewalks/plazas. */
export function concreteMaterial(rx = 3, ry = 3): THREE.MeshStandardMaterial {
  const s = repeat(loadPbrSet("concrete_floor_worn_001"), rx, ry);
  return new THREE.MeshStandardMaterial({
    ...s,
    roughness: 1.0,
    metalness: 0.02,
    color: 0x9a9aa0,
  });
}

/** Brick for building facades. */
export function brickMaterial(rx = 2, ry = 2): THREE.MeshStandardMaterial {
  const s = repeat(loadPbrSet("red_brick_03"), rx, ry);
  return new THREE.MeshStandardMaterial({
    ...s,
    roughness: 1.0,
    metalness: 0.0,
    color: 0x9a8f86,
  });
}
