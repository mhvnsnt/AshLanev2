/**
 * env-textures.js — CC0 PBR environment texture sets for the promo pipeline.
 *
 * Sources (all CC0 1.0, no attribution required — see docs/round6/env-assets.md):
 *   asphalt_03 ............ Poly Haven (Charlotte Baglioni / Dario Barresi)
 *   concrete_floor_worn_001 Poly Haven (Charlotte Baglioni)
 *   red_brick_03 .......... Poly Haven (Dimitrios Savva)
 * Served at /textures/env/<set>/<set>_{diff,nor,rough,ao}_1k.jpg
 */
import * as THREE from 'three';

const BASE = '/textures/env';

function loadSet(loader, name, srgb = true) {
  const tex = (suffix, colorSpace) => {
    const t = loader.load(`${BASE}/${name}/${name}_${suffix}_1k.jpg`);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    if (colorSpace) t.colorSpace = colorSpace;
    t.anisotropy = 8;
    return t;
  };
  return {
    map: tex('diff', THREE.SRGBColorSpace),
    normalMap: tex('nor'),
    roughnessMap: tex('rough'),
    aoMap: tex('ao'),
  };
}

function applyRepeat(set, rx, ry) {
  for (const t of Object.values(set)) { t.repeat.set(rx, ry); }
  return set;
}

/** Wet night asphalt — street surface. */
export function asphaltMaterial(rx = 3, ry = 8) {
  const loader = new THREE.TextureLoader();
  const s = applyRepeat(loadSet(loader, 'asphalt_03'), rx, ry);
  return new THREE.MeshStandardMaterial({
    ...s,
    roughness: 1.0,          // multiplied by roughnessMap
    metalness: 0.08,
    envMapIntensity: 0.9,
    color: 0x9a9aa2,         // slight cool tint; night scenes darken it
  });
}

/** Worn concrete — sidewalks, curbs. */
export function concreteMaterial(rx = 2, ry = 6) {
  const loader = new THREE.TextureLoader();
  const s = applyRepeat(loadSet(loader, 'concrete_floor_worn_001'), rx, ry);
  return new THREE.MeshStandardMaterial({
    ...s,
    roughness: 1.0,
    metalness: 0.02,
    color: 0x8f8f96,
  });
}

/**
 * Brick facade with emissive lit windows.
 * windowsTex: canvas texture with window grid (white = lit). Used as emissiveMap.
 */
export function brickBuildingMaterial(windowsTex, emissiveColor = 0xffc37a, rx = 2, ry = 2) {
  const loader = new THREE.TextureLoader();
  const s = applyRepeat(loadSet(loader, 'red_brick_03'), rx, ry);
  if (windowsTex) {
    windowsTex.wrapS = windowsTex.wrapT = THREE.RepeatWrapping;
    windowsTex.repeat.set(rx, ry);
  }
  return new THREE.MeshStandardMaterial({
    ...s,
    roughness: 1.0,
    metalness: 0.0,
    color: 0x8a8078, // darken/desaturate brick for night
    emissive: new THREE.Color(emissiveColor),
    emissiveMap: windowsTex || null,
    emissiveIntensity: 1.6,
  });
}

/** Procedural lit-window grid (emissive use). Returns CanvasTexture. */
export function windowGridTexture(litRatio = 0.3, w = 128, h = 256) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const g = c.getContext('2d');
  g.fillStyle = '#000000'; g.fillRect(0, 0, w, h);
  for (let y = 8; y < h - 8; y += 22) {
    for (let x = 8; x < w - 8; x += 20) {
      if (Math.random() < litRatio) {
        const warm = Math.random() < 0.7;
        g.fillStyle = warm ? '#ffffff' : '#cfe6ff';
        g.fillRect(x, y, 12, 14);
      }
    }
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}
