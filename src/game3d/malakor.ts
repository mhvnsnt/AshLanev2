/**
 * Malakor visual layer — underlying atmosphere for AshLane.
 *
 * Owner direction (2026-10-05, corrected):
 * - MODERN, HIGH graphics. NEVER low-poly / PS1 / retro / pixelated.
 * - What we take from Malakor: the COLOR PALETTE (pitch-black x neon
 *   purples, deep blues, toxic greens), urban glamour mood, cultural
 *   mashup energy (street culture injected into imposing visuals),
 *   slightly menacing slow-heavy atmosphere, structured worldbuilding.
 * - This is a FEEL layered onto existing concrete/asphalt/brick.
 *   It does not replace districts, change gameplay, or add "magic".
 *
 * Mobile optimization (owner direction):
 * - LOD-aware light counts: fewer dynamic lights on phone, emissive
 *   materials + fog carry the glow feel instead.
 * - Instanced meshes for repeated glow elements.
 * - Frustum culling left on (default). No per-frame allocations in tick().
 * - Premium look, mobile-friendly performance.
 *
 * Wiring: view.ts creates one MalakorLayer per scene, calls
 * setStage(stageId) from applyStage(), and ticks it in the render loop.
 */

import * as THREE from "three";
import type { DistrictId } from "./worldgen";

/** Malakor palette — high-saturation neon on pitch black. */
export const MALAKOR = {
  black: 0x050508,
  blackPurple: 0x0a0812,
  purple: 0x9d4edd,
  purpleDeep: 0x5a189a,
  purpleNeon: 0xc77dff,
  blueDeep: 0x1e3a8a,
  blueNeon: 0x00e5ff,
  green: 0x39ff14,
  greenDim: 0x1a7a0a,
  greenNeon: 0x7dff5e,
  gold: 0xffd700,
  ice: 0xb8f0ff,
} as const;

export type MalakorIntensity = 0 | 1 | 2; // off | subtle | full

/**
 * Stage -> Malakor intensity. Keyed to view.ts applyStage() ids.
 * "under" is the Hollows/underpass stage: full treatment.
 */
export const STAGE_MALAKOR: Record<string, MalakorIntensity> = {
  under: 2,
  ward: 1,
  dock: 1,
  pit: 1,
  yard: 0,
  high: 0,
};

/** District -> Malakor intensity, for worldgen/streaming integration. */
export const DISTRICT_MALAKOR: Record<DistrictId, MalakorIntensity> = {
  subway: 2, // Hollows domain
  alleys: 1,
  strip: 1, // neon already; Malakor deepens it
  warehouses: 1,
  rooftops: 0,
  park: 0,
};

export function malakorForStage(stageId: string): MalakorIntensity {
  return STAGE_MALAKOR[stageId] ?? 0;
}

export function malakorForDistrict(d: DistrictId): MalakorIntensity {
  return DISTRICT_MALAKOR[d] ?? 0;
}

export interface MalakorLayerOpts {
  /** true on coarse-pointer (phone) devices: fewer dynamic lights. */
  mobile: boolean;
}

interface PulseMat {
  mat: THREE.MeshBasicMaterial | THREE.MeshStandardMaterial;
  base: number;
  rate: number;
  phase: number;
}

const tmpColor = new THREE.Color();

/**
 * Owns all Malakor atmosphere for one scene: accent lights, fog retint,
 * pulsing emissive glows, eyes-in-the-dark, imposing silhouettes.
 * All lights are created once and reused — setStage() only retunes them.
 */
export class MalakorLayer {
  private scene: THREE.Scene;
  private mobile: boolean;
  private intensity: MalakorIntensity = 0;
  private accents: THREE.PointLight[] = [];
  private washes: THREE.PointLight[] = [];
  private pulses: PulseMat[] = [];
  private eyes: THREE.Mesh[] = [];
  private silhouettes: THREE.Group | null = null;
  private eyeMats: THREE.MeshBasicMaterial[] = [];
  private baseFog = new THREE.Color(0x12161c);

  constructor(scene: THREE.Scene, opts: MalakorLayerOpts) {
    this.scene = scene;
    this.mobile = opts.mobile;
    // Pre-create the accent light pool (max desktop count). Unused lights
    // stay at intensity 0 — no per-frame allocation, no add/remove churn.
    const accentCount = this.mobile ? 3 : 6;
    for (let i = 0; i < accentCount; i++) {
      const l = new THREE.PointLight(0x9d4edd, 0, 26, 1.8);
      l.position.set(0, 6, 0);
      scene.add(l);
      this.accents.push(l);
    }
    const washCount = this.mobile ? 1 : 2;
    for (let i = 0; i < washCount; i++) {
      const l = new THREE.PointLight(0x00e5ff, 0, 40, 2.0);
      l.position.set(0, 10, 0);
      scene.add(l);
      this.washes.push(l);
    }
    this.buildEyes();
    this.buildSilhouettes();
  }

  /**
   * Retune the layer for a stage. Called from view.ts applyStage().
   * Also captures the stage's base fog color so we can blend, not fight,
   * the existing art direction.
   */
  setStage(stageId: string, stageFog: number): void {
    const level = malakorForStage(stageId);
    this.intensity = level;
    this.baseFog.setHex(stageFog);

    const on = level > 0;
    const full = level === 2;

    // Fog: crush toward near-black purple. Full = almost black,
    // subtle = blend halfway with the stage's own fog color.
    const fog = this.scene.fog as THREE.Fog | null;
    if (fog && on) {
      tmpColor.setHex(MALAKOR.blackPurple);
      if (!full) tmpColor.lerp(this.baseFog, 0.55);
      fog.color.setHex(tmpColor.getHex());
      this.scene.background = new THREE.Color(tmpColor.getHex());
      if (full) {
        fog.near = Math.min(fog.near, 10);
        fog.far = Math.min(fog.far, 48);
      }
    }

    // Accent lights: purple wash + green/blue rims, placed around the arena.
    const spots: Array<[number, number, number, number, number]> = full
      ? [
          [MALAKOR.purple, -14, 7, -14, 2.2],
          [MALAKOR.purple, 14, 7, 10, 2.2],
          [MALAKOR.green, 0, 4, -20, 1.4],
          [MALAKOR.blueNeon, -6, 8, 16, 1.2],
          [MALAKOR.purpleDeep, 10, 3, -6, 1.6],
          [MALAKOR.greenDim, -12, 2, 4, 1.0],
        ]
      : [
          [MALAKOR.purple, -12, 7, -12, 1.1],
          [MALAKOR.blueNeon, 12, 7, 12, 0.9],
          [MALAKOR.greenDim, 0, 3, -18, 0.7],
        ];
    for (let i = 0; i < this.accents.length; i++) {
      const l = this.accents[i];
      const s = spots[i];
      if (on && s) {
        l.color.setHex(s[0]);
        l.position.set(s[1], s[2], s[3]);
        l.intensity = s[4];
      } else {
        l.intensity = 0;
      }
    }
    // Wash lights: broad cool fill so crushed blacks keep detail.
    for (let i = 0; i < this.washes.length; i++) {
      const l = this.washes[i];
      if (on) {
        l.color.setHex(full ? MALAKOR.blueDeep : MALAKOR.blueNeon);
        l.position.set(i === 0 ? -8 : 8, 12, i === 0 ? 8 : -8);
        l.intensity = full ? 0.55 : 0.3;
      } else {
        l.intensity = 0;
      }
    }

    // Eyes + silhouettes only read at full intensity.
    for (const e of this.eyes) e.visible = full;
    if (this.silhouettes) this.silhouettes.visible = full;
  }

  /** Slow pulse — heavy and nostalgic, never strobing. */
  tick(time: number): void {
    if (this.intensity === 0) return;
    for (const p of this.pulses) {
      // 0.25–0.45 Hz: slow breathing glow.
      const v = p.base + Math.sin(time * p.rate + p.phase) * p.base * 0.35;
      if (p.mat instanceof THREE.MeshBasicMaterial) {
        p.mat.opacity = Math.max(0.05, Math.min(1, v));
      } else {
        p.mat.emissiveIntensity = Math.max(0.05, v);
      }
    }
    // Eye pairs drift in opacity on a slower cycle — menacing, not jumpy.
    for (let i = 0; i < this.eyeMats.length; i++) {
      const m = this.eyeMats[i];
      m.opacity = 0.12 + 0.22 * (0.5 + 0.5 * Math.sin(time * 0.32 + i * 1.7));
    }
  }

  /** Register an emissive material for the slow pulse. */
  addPulse(
    mat: THREE.MeshBasicMaterial | THREE.MeshStandardMaterial,
    base: number,
    rate = 0.35,
  ): void {
    this.pulses.push({
      mat,
      base,
      rate: rate + Math.random() * 0.15,
      phase: Math.random() * Math.PI * 2,
    });
  }

  /** Glowing eyes in the dark — distant, subtle, slightly menacing. */
  private buildEyes(): void {
    const geo = new THREE.SphereGeometry(0.09, 8, 6);
    // Fixed seed-ish placement: high on walls, far from the action.
    const spots: Array<[number, number, number]> = [
      [-20, 6.5, -24], [18, 7, -22], [-24, 5.5, 6],
      [22, 6, 10], [-8, 8, -26], [8, 7.5, 24],
      [-26, 6, -8], [26, 5.5, -4],
    ];
    for (const [x, y, z] of spots) {
      const mat = new THREE.MeshBasicMaterial({
        color: MALAKOR.greenNeon,
        transparent: true,
        opacity: 0.2,
        fog: false,
      });
      this.eyeMats.push(mat);
      for (const dx of [-0.22, 0.22]) {
        const eye = new THREE.Mesh(geo, mat);
        eye.position.set(x + dx, y, z);
        eye.visible = false;
        this.scene.add(eye);
        this.eyes.push(eye);
      }
    }
  }

  /** Imposing background silhouettes — tall dark figures at the edges. */
  private buildSilhouettes(): void {
    const g = new THREE.Group();
    const bodyMat = new THREE.MeshBasicMaterial({ color: 0x030304 });
    const rimMat = new THREE.MeshBasicMaterial({
      color: MALAKOR.purple,
      transparent: true,
      opacity: 0.5,
      fog: false,
    });
    this.addPulse(rimMat, 0.5, 0.28);
    const spots: Array<[number, number, number, number]> = [
      [-30, 0, -30, 9], [28, 0, -28, 11], [-32, 0, 12, 8], [30, 0, 16, 10],
    ];
    for (const [x, y, z, h] of spots) {
      const body = new THREE.Mesh(new THREE.BoxGeometry(1.6, h, 1.1), bodyMat);
      body.position.set(x, y + h / 2, z);
      const rim = new THREE.Mesh(new THREE.PlaneGeometry(0.12, h * 0.9), rimMat);
      rim.position.set(x + 0.86, y + h / 2, z);
      // Face the arena center.
      const yaw = Math.atan2(-x, -z);
      body.rotation.y = yaw;
      rim.rotation.y = yaw;
      g.add(body, rim);
    }
    g.visible = false;
    this.scene.add(g);
    this.silhouettes = g;
  }

  dispose(): void {
    for (const l of [...this.accents, ...this.washes]) {
      this.scene.remove(l);
      l.dispose();
    }
    for (const e of this.eyes) {
      this.scene.remove(e);
      e.geometry.dispose();
    }
    for (const m of this.eyeMats) m.dispose();
    if (this.silhouettes) {
      this.scene.remove(this.silhouettes);
      this.silhouettes.traverse((o: THREE.Object3D) => {
        const mesh = o as THREE.Mesh;
        mesh.geometry?.dispose();
      });
    }
    this.pulses.length = 0;
  }
}

/**
 * Modern cinematic grade — ACES filmic tone mapping. This is the
 * "expensive" look: rich blacks, controlled highlights. NOT a retro filter.
 */
export function applyMalakorGrade(renderer: THREE.WebGLRenderer): void {
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;
}

/**
 * CSS vignette overlay — cheapest possible vignette (GPU-composited,
 * zero WebGL cost, mobile-friendly). Subtle: darkens edges ~35%.
 */
export function addMalakorVignette(canvas: HTMLCanvasElement): HTMLDivElement {
  const div = document.createElement("div");
  div.style.cssText =
    "position:absolute;inset:0;pointer-events:none;z-index:5;" +
    "background:radial-gradient(ellipse at center, transparent 52%, rgba(3,2,8,0.42) 100%);";
  const parent = canvas.parentElement;
  if (parent) {
    const cs = window.getComputedStyle(parent);
    if (cs.position === "static") parent.style.position = "relative";
    parent.appendChild(div);
  }
  return div;
}

// ---------------------------------------------------------------------------
// Cultural mashup materials — street culture injected into imposing visuals.
// High-fidelity PBR: metalness/roughness, NOT flat colors.
// ---------------------------------------------------------------------------

/** Gold chain — heavy, iced-out. For NPC accents, belts, jewelry. */
export function goldChainMaterial(): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: MALAKOR.gold,
    metalness: 1.0,
    roughness: 0.22,
    emissive: 0x664d00,
    emissiveIntensity: 0.35,
  });
}

/** Icy shine — diamond/grill gloss. For teeth, jewelry, eyewear. */
export function iceMaterial(): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: MALAKOR.ice,
    metalness: 0.9,
    roughness: 0.08,
    emissive: 0x223a44,
    emissiveIntensity: 0.5,
  });
}

/** Neon sign slab — unlit basic material reads as "glowing" for free. */
export function neonSlabMaterial(color: number, opacity = 0.95): THREE.MeshBasicMaterial {
  return new THREE.MeshBasicMaterial({
    color,
    transparent: opacity < 1,
    opacity,
    fog: false,
  });
}

/**
 * Procedural mashup props for worldgen: gold-trimmed barriers and
 * neon totems. Seeded placement; call once per district build.
 * Uses shared geometries/materials — no per-prop texture cost.
 */
export function addMalakorProps(
  scene: THREE.Scene,
  rng: () => number,
  intensity: MalakorIntensity,
): void {
  if (intensity === 0) return;
  const gold = goldChainMaterial();
  const neonPurple = neonSlabMaterial(MALAKOR.purpleNeon);
  const neonGreen = neonSlabMaterial(MALAKOR.greenNeon);

  // Gold-trimmed barriers — street barricades with iced trim.
  const barGeo = new THREE.BoxGeometry(2.2, 0.9, 0.25);
  const trimGeo = new THREE.BoxGeometry(2.24, 0.1, 0.27);
  const barMat = new THREE.MeshStandardMaterial({ color: 0x14141a, roughness: 0.7, metalness: 0.3 });
  const count = intensity === 2 ? 8 : 4;
  for (let i = 0; i < count; i++) {
    const x = (rng() - 0.5) * 44;
    const z = (rng() - 0.5) * 40 - 4;
    const g = new THREE.Group();
    const bar = new THREE.Mesh(barGeo, barMat);
    bar.position.y = 0.45;
    const trim = new THREE.Mesh(trimGeo, gold);
    trim.position.y = 0.92;
    g.add(bar, trim);
    g.position.set(x, 0, z);
    g.rotation.y = rng() * Math.PI;
    scene.add(g);
  }

  // Neon totems — tall thin slabs, imposing at district edges.
  const totemGeo = new THREE.BoxGeometry(0.5, 7, 0.5);
  const totemSpots: Array<[number, number, number, THREE.Material]> = [
    [-22, 3.5, -26, neonPurple],
    [22, 3.5, -26, neonGreen],
    [-24, 3.5, 18, neonGreen],
    [24, 3.5, 18, neonPurple],
  ];
  const n = intensity === 2 ? totemSpots.length : 2;
  for (let i = 0; i < n; i++) {
    const [x, y, z, m] = totemSpots[i];
    const t = new THREE.Mesh(totemGeo, m);
    t.position.set(x, y, z);
    scene.add(t);
  }
}
