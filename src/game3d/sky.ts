/**
 * AshLane per-district sky system.
 *
 * Every district gets its own sky: gradient colors, sun/moon, stars,
 * clouds, horizon glow, and a full light rig. The environment tells you
 * whose turf you're on before you see a single fighter.
 *
 * Owner direction (2026-10-05):
 * - alleys: hazy orange sodium glow
 * - strip: deep blue night with neon bleed
 * - warehouses: cold grey industrial
 * - subway: pitch black with purple/green Malakor accents
 * - rooftops: open sky, dawn/dusk
 * - park: natural daylight
 *
 * High graphics, mobile-optimized: the sky is one shader dome + instanced
 * stars + a few meshes. No per-frame CPU cost beyond the existing tick.
 *
 * Pure three.js. No external dependencies.
 */

import * as THREE from "three";
import type { DistrictDef, DistrictId } from "./worldgen";

export type { DistrictId };

// ---------------------------------------------------------------------------
// Sky definition
// ---------------------------------------------------------------------------

export interface SkyDef {
  /** gradient top (zenith) */
  top: number;
  /** gradient bottom (horizon base) */
  bottom: number;
  /** horizon glow band color */
  horizon: number;
  /** horizon glow intensity 0..1 */
  horizonIntensity: number;
  /** sun/moon orb color (0 = no orb) */
  orb: number;
  /** orb size multiplier */
  orbSize: number;
  /** orb position [x, y, z] */
  orbPos: [number, number, number];
  /** is the orb a moon (cool) vs sun (warm) — affects light color */
  orbIsMoon: boolean;
  /** star field opacity 0..1 (0 = no stars) */
  stars: number;
  /** star count */
  starCount: number;
  /** cloud tint */
  cloudColor: number;
  /** cloud opacity 0..1 */
  cloudOpacity: number;
  /** hemisphere sky color */
  hemiSky: number;
  /** hemisphere ground color */
  hemiGround: number;
  /** hemisphere intensity */
  hemiIntensity: number;
  /** key light color */
  keyColor: number;
  /** key light intensity */
  keyIntensity: number;
  /** key light position */
  keyPos: [number, number, number];
  /** rim/accent light color */
  rimColor: number;
  /** rim light intensity */
  rimIntensity: number;
  /** fog color */
  fogColor: number;
  fogNear: number;
  fogFar: number;
  /** Malakor accent: purple wash light color (0 = none) */
  malakorPurple: number;
  /** Malakor accent: toxic green wash light color (0 = none) */
  malakorGreen: number;
  /** ambient occlusion-ish ground tint under sky */
  groundBounce: number;
}

export const SKIES: Record<DistrictId, SkyDef> = {
  // -- The Alleys: hazy orange sodium glow, perpetual late evening --
  alleys: {
    top: 0x1a1218, bottom: 0x4a2a18, horizon: 0xff7b2e, horizonIntensity: 0.85,
    orb: 0xffb347, orbSize: 1.4, orbPos: [-30, 22, -60], orbIsMoon: false,
    stars: 0.15, starCount: 60,
    cloudColor: 0x5a3a2a, cloudOpacity: 0.35,
    hemiSky: 0x8a6a5a, hemiGround: 0x2a1e18, hemiIntensity: 0.9,
    keyColor: 0xffb347, keyIntensity: 0.55, keyPos: [-20, 30, 12],
    rimColor: 0xe4572e, rimIntensity: 0.35,
    fogColor: 0x1a1418, fogNear: 14, fogFar: 65,
    malakorPurple: 0, malakorGreen: 0,
    groundBounce: 0x3a2a20,
  },
  // -- The Strip: deep blue night, neon bleed on the horizon --
  strip: {
    top: 0x050510, bottom: 0x0e1a3a, horizon: 0x00e5ff, horizonIntensity: 0.5,
    orb: 0xe8f4ff, orbSize: 1.0, orbPos: [25, 35, -55], orbIsMoon: true,
    stars: 0.8, starCount: 220,
    cloudColor: 0x1a2a4a, cloudOpacity: 0.25,
    hemiSky: 0x3a4a6a, hemiGround: 0x14141c, hemiIntensity: 0.7,
    keyColor: 0x8ab4ff, keyIntensity: 0.45, keyPos: [25, 35, -20],
    rimColor: 0x00e5ff, rimIntensity: 0.4,
    fogColor: 0x14141c, fogNear: 20, fogFar: 90,
    malakorPurple: 0x6a2aff, malakorGreen: 0,
    groundBounce: 0x1a1a2a,
  },
  // -- The Yards: cold grey industrial, overcast noon --
  warehouses: {
    top: 0x3a4048, bottom: 0x6a7078, horizon: 0x9aa2ac, horizonIntensity: 0.3,
    orb: 0xd8e0e8, orbSize: 1.8, orbPos: [0, 45, -40], orbIsMoon: false,
    stars: 0, starCount: 0,
    cloudColor: 0x5a6068, cloudOpacity: 0.55,
    hemiSky: 0x8a94a0, hemiGround: 0x3a3e44, hemiIntensity: 1.1,
    keyColor: 0xcfe0f0, keyIntensity: 0.8, keyPos: [0, 45, -20],
    rimColor: 0x2e9bff, rimIntensity: 0.2,
    fogColor: 0x161a20, fogNear: 18, fogFar: 85,
    malakorPurple: 0, malakorGreen: 0,
    groundBounce: 0x4a4e54,
  },
  // -- The Tunnels: pitch black, Malakor purple + toxic green --
  subway: {
    top: 0x000000, bottom: 0x0a0a14, horizon: 0x9d4edd, horizonIntensity: 0.6,
    orb: 0, orbSize: 0, orbPos: [0, 50, 0], orbIsMoon: true,
    stars: 0.3, starCount: 40,
    cloudColor: 0x0a0a0a, cloudOpacity: 0.1,
    hemiSky: 0x2a1a3a, hemiGround: 0x0a0a0c, hemiIntensity: 0.5,
    keyColor: 0x9d4edd, keyIntensity: 0.35, keyPos: [-15, 25, 10],
    rimColor: 0xb8ff9e, rimIntensity: 0.3,
    fogColor: 0x0c0c12, fogNear: 8, fogFar: 45,
    malakorPurple: 0x9d4edd, malakorGreen: 0xb8ff9e,
    groundBounce: 0x1a0a1a,
  },
  // -- The High Line: open sky, dawn/dusk gold --
  rooftops: {
    top: 0x2a3a5e, bottom: 0xd47a3a, horizon: 0xffb347, horizonIntensity: 0.9,
    orb: 0xffd9a0, orbSize: 2.2, orbPos: [-45, 14, -50], orbIsMoon: false,
    stars: 0.25, starCount: 80,
    cloudColor: 0xffd0a0, cloudOpacity: 0.4,
    hemiSky: 0x9a8ab0, hemiGround: 0x4a3a30, hemiIntensity: 1.0,
    keyColor: 0xffd9a0, keyIntensity: 1.0, keyPos: [-30, 18, -25],
    rimColor: 0xff8a3a, rimIntensity: 0.45,
    fogColor: 0x1c1a24, fogNear: 25, fogFar: 120,
    malakorPurple: 0, malakorGreen: 0,
    groundBounce: 0x5a4a3a,
  },
  // -- Ember Park: natural daylight, clear --
  park: {
    top: 0x4a7ab8, bottom: 0xb8d4ea, horizon: 0xffe8c0, horizonIntensity: 0.4,
    orb: 0xfff4d0, orbSize: 1.6, orbPos: [20, 50, -30], orbIsMoon: false,
    stars: 0, starCount: 0,
    cloudColor: 0xffffff, cloudOpacity: 0.5,
    hemiSky: 0xb8d4f0, hemiGround: 0x4a5a3a, hemiIntensity: 1.2,
    keyColor: 0xfff4e0, keyIntensity: 1.1, keyPos: [20, 50, -15],
    rimColor: 0x7bc96f, rimIntensity: 0.25,
    fogColor: 0x141a14, fogNear: 20, fogFar: 80,
    malakorPurple: 0, malakorGreen: 0,
    groundBounce: 0x5a6a4a,
  },
};

// ---------------------------------------------------------------------------
// Sky dome shader — per-district gradient + horizon glow
// ---------------------------------------------------------------------------

const SKY_VERT = `
varying vec3 vP;
void main() {
  vP = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

const SKY_FRAG = `
uniform vec3 uTop;
uniform vec3 uBottom;
uniform vec3 uHorizon;
uniform float uHorizonIntensity;
uniform float uDay;
varying vec3 vP;
void main() {
  vec3 d = normalize(vP);
  float h = d.y;
  // base gradient: bottom -> top
  vec3 col = mix(uBottom, uTop, smoothstep(-0.1, 0.7, h));
  // horizon glow band
  float band = (1.0 - smoothstep(0.0, 0.35, abs(h - 0.05))) * uHorizonIntensity;
  col = mix(col, uHorizon, band * 0.7);
  // below-horizon fade to fog color (passed as bottom)
  col = mix(uBottom * 0.4, col, smoothstep(-0.4, 0.0, h));
  // subtle day/night modulation (for weather system compatibility)
  float day = smoothstep(0.08, 0.62, uDay);
  col *= mix(0.35, 1.0, max(day, 0.25));
  gl_FragColor = vec4(col, 1.0);
  #include <colorspace_fragment>
}`;

export interface BuiltSky {
  group: THREE.Group;
  /** update per frame (orb drift, subtle shimmer) */
  tick: (t: number) => void;
  /** change day/night blend 0..1 (weather system) */
  setDay: (v: number) => void;
  dispose: () => void;
}

/**
 * Build the full sky for a district: dome, stars, sun/moon orb, clouds,
 * and Malakor accent washes. Add the group to your scene.
 */
export function buildSky(id: DistrictId): BuiltSky {
  const def = SKIES[id];
  const group = new THREE.Group();
  group.name = `sky-${id}`;

  const c = (hex: number) => new THREE.Color(hex);

  // -- Sky dome --
  const skyMat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    fog: false,
    uniforms: {
      uTop: { value: c(def.top) },
      uBottom: { value: c(def.bottom) },
      uHorizon: { value: c(def.horizon) },
      uHorizonIntensity: { value: def.horizonIntensity },
      uDay: { value: 0.65 },
    },
    vertexShader: SKY_VERT,
    fragmentShader: SKY_FRAG,
  });
  const dome = new THREE.Mesh(new THREE.SphereGeometry(140, 24, 16), skyMat);
  dome.frustumCulled = false;
  dome.renderOrder = -10;
  group.add(dome);

  // -- Stars --
  let starMat: THREE.PointsMaterial | null = null;
  if (def.starCount > 0) {
    const pos = new Float32Array(def.starCount * 3);
    for (let i = 0; i < def.starCount; i++) {
      const th = Math.random() * Math.PI * 2;
      const ph = Math.random() * 1.1 + 0.1; // upper hemisphere bias
      const r = 120;
      pos[i * 3] = Math.cos(th) * Math.sin(ph) * r;
      pos[i * 3 + 1] = Math.cos(ph) * r;
      pos[i * 3 + 2] = Math.sin(th) * Math.sin(ph) * r;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    starMat = new THREE.PointsMaterial({
      color: 0xf7f1dd, size: 0.6, sizeAttenuation: false,
      transparent: true, opacity: def.stars, fog: false, depthWrite: false,
    });
    const stars = new THREE.Points(g, starMat);
    stars.frustumCulled = false;
    stars.renderOrder = -9;
    group.add(stars);
  }

  // -- Sun/moon orb --
  let orb: THREE.Mesh | null = null;
  if (def.orb !== 0) {
    orb = new THREE.Mesh(
      new THREE.SphereGeometry(2.2 * def.orbSize, 16, 12),
      new THREE.MeshBasicMaterial({ color: def.orb, fog: false, transparent: true, opacity: 0.95 })
    );
    orb.position.set(...def.orbPos);
    orb.renderOrder = -8;
    group.add(orb);
    // soft glow sprite behind orb (radial gradient so the sprite has no visible square edge)
    const glowCanvas = document.createElement("canvas");
    glowCanvas.width = glowCanvas.height = 128;
    const gg = glowCanvas.getContext("2d")!;
    const grad = gg.createRadialGradient(64, 64, 4, 64, 64, 64);
    const orbCss = "#" + def.orb.toString(16).padStart(6, "0");
    grad.addColorStop(0, orbCss);
    grad.addColorStop(0.4, orbCss + "55");
    grad.addColorStop(1, orbCss + "00");
    gg.fillStyle = grad;
    gg.fillRect(0, 0, 128, 128);
    const glowTex = new THREE.CanvasTexture(glowCanvas);
    const glowMat = new THREE.SpriteMaterial({
      map: glowTex, transparent: true, opacity: 0.6,
      fog: false, depthWrite: false, blending: THREE.AdditiveBlending,
    });
    const glow = new THREE.Sprite(glowMat);
    glow.scale.setScalar(14 * def.orbSize);
    glow.position.copy(orb.position);
    group.add(glow);
  }

  // -- Clouds --
  const clouds: THREE.Mesh[] = [];
  for (let i = 0; i < 5; i++) {
    const cloud = new THREE.Mesh(
      new THREE.PlaneGeometry(30 + i * 8, 9),
      new THREE.MeshBasicMaterial({
        color: def.cloudColor, transparent: true,
        opacity: def.cloudOpacity, depthWrite: false, fog: false,
      })
    );
    cloud.rotation.x = -Math.PI / 2;
    cloud.position.set((i - 2) * 22, 52 + (i % 3) * 4, (i % 2 === 0 ? -18 : 20));
    cloud.renderOrder = -7;
    group.add(cloud);
    clouds.push(cloud);
  }

  // -- Malakor accent washes (purple + green point lights, high up) --
  const washes: THREE.PointLight[] = [];
  if (def.malakorPurple !== 0) {
    const p = new THREE.PointLight(def.malakorPurple, 12, 60, 1.6);
    p.position.set(-15, 18, -10);
    group.add(p);
    washes.push(p);
  }
  if (def.malakorGreen !== 0) {
    const g2 = new THREE.PointLight(def.malakorGreen, 8, 50, 1.6);
    g2.position.set(15, 14, 12);
    group.add(g2);
    washes.push(g2);
  }

  const tick = (t: number) => {
    // slow cloud drift
    for (let i = 0; i < clouds.length; i++) {
      clouds[i].position.x += Math.sin(t * 0.02 + i) * 0.008;
    }
    // Malakor wash pulse (slow, heavy — not strobing)
    for (let i = 0; i < washes.length; i++) {
      const base = washes[i].userData.base ?? washes[i].intensity;
      if (washes[i].userData.base === undefined) washes[i].userData.base = base;
      washes[i].intensity = base * (0.85 + 0.15 * Math.sin(t * 0.7 + i * 2.1));
    }
  };

  return {
    group,
    tick,
    setDay: (v: number) => { skyMat.uniforms.uDay.value = v; },
    dispose: () => {
      group.traverse((o) => {
        const m = o as THREE.Mesh;
        if (m.isMesh) {
          m.geometry.dispose();
          const mat = m.material as THREE.Material | THREE.Material[];
          if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
          else mat?.dispose();
        }
        const pts = o as THREE.Points;
        if (pts.isPoints) {
          pts.geometry.dispose();
          (pts.material as THREE.Material)?.dispose();
        }
      });
    },
  };
}

/**
 * Apply a district's light rig to an existing scene/group.
 * Use for view.ts integration — replaces inline district overrides.
 */
export function applySkyLights(
  target: THREE.Object3D,
  id: DistrictId,
  opts: { hemi?: THREE.HemisphereLight; key?: THREE.DirectionalLight; rim?: THREE.DirectionalLight } = {}
): void {
  const def = SKIES[id];
  const c = (hex: number) => new THREE.Color(hex);

  let hemi = opts.hemi;
  if (!hemi) {
    hemi = new THREE.HemisphereLight(def.hemiSky, def.hemiGround, def.hemiIntensity);
    target.add(hemi);
  } else {
    hemi.color.setHex(def.hemiSky);
    hemi.groundColor.setHex(def.hemiGround);
    hemi.intensity = def.hemiIntensity;
  }

  let key = opts.key;
  if (!key) {
    key = new THREE.DirectionalLight(def.keyColor, def.keyIntensity);
    key.position.set(...def.keyPos);
    target.add(key);
  } else {
    key.color.setHex(def.keyColor);
    key.intensity = def.keyIntensity;
    key.position.set(...def.keyPos);
  }

  let rim = opts.rim;
  if (!rim) {
    rim = new THREE.DirectionalLight(def.rimColor, def.rimIntensity);
    rim.position.set(-def.keyPos[0], 8, -def.keyPos[2]);
    target.add(rim);
  } else {
    rim.color.setHex(def.rimColor);
    rim.intensity = def.rimIntensity;
  }

  // fog
  const scene = target as THREE.Scene;
  if (scene.isScene) {
    scene.fog = new THREE.Fog(def.fogColor, def.fogNear, def.fogFar);
    if (scene.background instanceof THREE.Color) {
      scene.background.setHex(def.fogColor);
    } else {
      scene.background = c(def.fogColor);
    }
  }
}

/** Sky def for a district (read-only). */
export function skyFor(id: DistrictId): SkyDef {
  return SKIES[id];
}

/**
 * Attach a district sky to a generated district group.
 * Call from generateDistrict() — the sky travels with the district.
 */
export function attachSkyToDistrict(
  group: THREE.Group,
  district: DistrictDef
): BuiltSky {
  const sky = buildSky(district.id);
  group.add(sky.group);
  // store for view.ts handoff
  group.userData.sky = sky;
  group.userData.skyId = district.id;
  return sky;
}
