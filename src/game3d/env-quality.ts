/**
 * AshLane environment quality bar (owner 2026-10-06).
 *
 * Closes the gap between the in-game arenas and the district key art
 * (~/workspace/ashlane-art/districts/): cinematic lighting, volumetric
 * light shafts, wind, cloth sway, jiggle physics — all performance-scaled
 * across high/medium/low quality tiers so phones stay smooth.
 *
 * Everything here runs in the real game (no fake visuals). All systems are
 * additive: they layer over the existing stage looks in view.ts.
 */
import * as THREE from "three";

export type QualityTier = "high" | "medium" | "low";

/** Auto-detect the quality tier. Desktop = high, phones scale by DPR/cores. */
export function detectTier(phone: boolean): QualityTier {
  if (!phone) return "high";
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const cores = navigator.hardwareConcurrency || 4;
  if (dpr >= 2.5 && cores >= 8) return "medium";
  return "low";
}

export interface TierBudget {
  pixelRatioCap: number;
  godRays: number;
  particles: number;
  postFx: boolean;
  shadows: boolean;
}

export const TIER_BUDGET: Record<QualityTier, TierBudget> = {
  high: { pixelRatioCap: 1.5, godRays: 10, particles: 260, postFx: true, shadows: true },
  medium: { pixelRatioCap: 1.25, godRays: 5, particles: 120, postFx: true, shadows: false },
  low: { pixelRatioCap: 1.0, godRays: 0, particles: 40, postFx: false, shadows: false },
};

// ---------------------------------------------------------------------------
// Global wind uniforms (shared by every swaying material).
// ---------------------------------------------------------------------------

export const windUniforms = {
  uTime: { value: 0 },
  uWindDir: { value: new THREE.Vector2(0.8, 0.35).normalize() },
  /** 0..1 gust strength, animated by EnvQuality.tick. */
  uGust: { value: 0.35 },
};

/**
 * Register a mesh for wind sway (banners, tassels, coat tails, scarves,
 * chains). Displaces vertices in the vertex shader — zero CPU cost.
 * Sway scales with local height so hanging cloth moves at the free end.
 */
export function registerSway(
  mesh: THREE.Mesh,
  opts: { amp?: number; freq?: number; stiff?: number } = {},
): void {
  const mat = mesh.material as THREE.Material;
  const amp = opts.amp ?? 0.08;
  const freq = opts.freq ?? 1.6;
  const stiff = opts.stiff ?? 0.0; // 0 = free end sways fully
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = windUniforms.uTime;
    shader.uniforms.uGust = windUniforms.uGust;
    shader.uniforms.uWindDir = windUniforms.uWindDir;
    shader.uniforms.uSwayAmp = { value: amp };
    shader.uniforms.uSwayFreq = { value: freq };
    shader.uniforms.uSwayStiff = { value: stiff };
    shader.vertexShader = shader.vertexShader
      .replace(
        "#include <common>",
        `#include <common>
         uniform float uTime; uniform float uGust; uniform vec2 uWindDir;
         uniform float uSwayAmp; uniform float uSwayFreq; uniform float uSwayStiff;`,
      )
      .replace(
        "#include <begin_vertex>",
        `#include <begin_vertex>
         {
           float h = smoothstep(uSwayStiff, uSwayStiff + 2.0, position.y + 1.0);
           float w = sin(uTime * uSwayFreq + position.x * 1.7 + position.z * 2.3);
           float g = 0.35 + uGust;
           transformed.x += uWindDir.x * w * uSwayAmp * h * g;
           transformed.z += uWindDir.y * w * uSwayAmp * h * g;
           transformed.y -= abs(w) * uSwayAmp * 0.35 * h * g;
         }`,
      );
  };
  mat.needsUpdate = true;
}

// ---------------------------------------------------------------------------
// God rays — fake volumetric light shafts (additive cones).
// Matches the stadium key art's visible spot cones.
// ---------------------------------------------------------------------------

const RAY_VERT = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;
const RAY_FRAG = `
uniform vec3 uColor; uniform float uIntensity; uniform float uTime;
varying vec2 vUv;
void main() {
  // Fade along the cone length (bright at the light source, gone at the
  // floor) and soften the silhouette edges. ConeGeometry uv.y = 1 at apex.
  float axial = pow(vUv.y, 1.6);
  float edge = smoothstep(0.0, 0.25, vUv.x) * smoothstep(1.0, 0.75, vUv.x);
  float flicker = 0.92 + 0.08 * sin(uTime * 2.1 + vUv.y * 6.0);
  float a = axial * edge * uIntensity * flicker;
  gl_FragColor = vec4(uColor, a);
}`;

export interface GodRaySpec {
  x: number; y: number; z: number;
  height: number; radius: number;
  color: number; intensity: number;
}

export class GodRayField {
  readonly group = new THREE.Group();
  private rays: THREE.Mesh[] = [];
  private mats: THREE.ShaderMaterial[] = [];
  private budget = 10;

  constructor() {
    this.group.renderOrder = 5;
  }

  setBudget(n: number): void {
    this.budget = n;
    for (let i = 0; i < this.rays.length; i++) {
      this.rays[i].visible = i < n;
    }
  }

  /** Replace the ray set (called per stage). */
  setRays(specs: GodRaySpec[]): void {
    // Reuse existing meshes where possible — no per-stage allocation churn.
    while (this.rays.length < specs.length) {
      const geo = new THREE.ConeGeometry(1, 1, 20, 1, true);
      geo.translate(0, -0.5, 0); // apex at origin, opens downward
      const mat = new THREE.ShaderMaterial({
        vertexShader: RAY_VERT,
        fragmentShader: RAY_FRAG,
        uniforms: {
          uColor: { value: new THREE.Color(0xffffff) },
          uIntensity: { value: 0.3 },
          uTime: windUniforms.uTime,
        },
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
        fog: false,
      });
      const m = new THREE.Mesh(geo, mat);
      m.frustumCulled = false;
      m.renderOrder = 5;
      this.group.add(m);
      this.rays.push(m);
      this.mats.push(mat);
    }
    for (let i = 0; i < this.rays.length; i++) {
      const m = this.rays[i];
      if (i < specs.length) {
        const s = specs[i];
        m.visible = i < this.budget;
        m.position.set(s.x, s.y, s.z);
        m.scale.set(s.radius, s.height, s.radius);
        this.mats[i].uniforms.uColor.value.setHex(s.color);
        this.mats[i].uniforms.uIntensity.value = s.intensity;
      } else {
        m.visible = false;
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Jiggle physics — bone spring-dampers. Tasteful, subtle, fighting-game
// standard. Bones are looked up by name; missing bones are a silent no-op.
// ---------------------------------------------------------------------------

export interface JiggleSpec {
  bone: string;
  /** Spring stiffness (higher = snappier). */
  stiffness?: number;
  /** Damping ratio. */
  damping?: number;
  /** Max offset in world units. */
  max?: number;
  /** Direction bias (local): which axes jiggle most. */
  bias?: [number, number, number];
}

interface JiggleBone {
  obj: THREE.Bone;
  base: THREE.Vector3;
  vel: THREE.Vector3;
  off: THREE.Vector3;
  stiffness: number;
  damping: number;
  max: number;
  bias: THREE.Vector3;
  lastWorld: THREE.Vector3;
}

export class JiggleSystem {
  private bones: JiggleBone[] = [];
  /** Master scale — 0 disables (low tier). */
  strength = 1;

  /**
   * Scan a character root for bones matching the specs and register them.
   * Safe to call on any model — non-matching specs are ignored.
   */
  register(root: THREE.Object3D, specs: JiggleSpec[]): number {
    let n = 0;
    const bones = new Map<string, THREE.Bone>();
    root.traverse((o) => {
      if ((o as THREE.Bone).isBone) bones.set(o.name.toLowerCase(), o as THREE.Bone);
    });
    for (const s of specs) {
      const b = bones.get(s.bone.toLowerCase());
      if (!b || this.bones.some((j) => j.obj === b)) continue;
      this.bones.push({
        obj: b,
        base: b.position.clone(),
        vel: new THREE.Vector3(),
        off: new THREE.Vector3(),
        stiffness: s.stiffness ?? 90,
        damping: s.damping ?? 7,
        max: s.max ?? 0.035,
        bias: new THREE.Vector3(...(s.bias ?? [0.4, 1, 0.4])),
        lastWorld: new THREE.Vector3(),
      });
      b.getWorldPosition(this.bones[this.bones.length - 1].lastWorld);
      n++;
    }
    return n;
  }

  /** Default specs for humanoid fighters (female + heavy variants). */
  static humanoidSpecs(kind: "female" | "heavy" | "standard"): JiggleSpec[] {
    const base: JiggleSpec[] = [
      { bone: "belly", stiffness: 70, damping: 6, max: 0.03, bias: [0.5, 1, 0.5] },
      { bone: "spine2", stiffness: 110, damping: 8, max: 0.015 },
    ];
    if (kind === "female") {
      base.push(
        { bone: "breast_l", stiffness: 95, damping: 6.5, max: 0.028, bias: [0.35, 1, 0.35] },
        { bone: "breast_r", stiffness: 95, damping: 6.5, max: 0.028, bias: [0.35, 1, 0.35] },
        // Fallback naming variants used by common rigs:
        { bone: "chest_l", stiffness: 95, damping: 6.5, max: 0.028, bias: [0.35, 1, 0.35] },
        { bone: "chest_r", stiffness: 95, damping: 6.5, max: 0.028, bias: [0.35, 1, 0.35] },
      );
    }
    if (kind === "heavy") {
      base.push({ bone: "belly", stiffness: 45, damping: 4.5, max: 0.05, bias: [0.6, 1, 0.6] });
    }
    return base;
  }

  update(dt: number): void {
    if (this.strength <= 0 || this.bones.length === 0) return;
    const dtc = Math.min(dt, 1 / 30);
    const tmp = new THREE.Vector3();
    for (const j of this.bones) {
      j.obj.getWorldPosition(tmp);
      // Acceleration of the bone's anchor drives the spring.
      const ax = (tmp.x - j.lastWorld.x) / dtc;
      const ay = (tmp.y - j.lastWorld.y) / dtc;
      const az = (tmp.z - j.lastWorld.z) / dtc;
      j.lastWorld.copy(tmp);
      // Spring toward rest, excited by anchor acceleration (inverted).
      const k = j.stiffness * this.strength;
      const c = j.damping;
      j.vel.x += (-k * j.off.x - c * j.vel.x - ax * 0.012 * j.bias.x) * dtc;
      j.vel.y += (-k * j.off.y - c * j.vel.y - ay * 0.012 * j.bias.y) * dtc;
      j.vel.z += (-k * j.off.z - c * j.vel.z - az * 0.012 * j.bias.z) * dtc;
      j.off.addScaledVector(j.vel, dtc);
      if (j.off.length() > j.max) j.off.setLength(j.max);
      j.obj.position.copy(j.base).add(j.off);
    }
  }

  clear(): void {
    for (const j of this.bones) j.obj.position.copy(j.base);
    this.bones = [];
  }
}

// ---------------------------------------------------------------------------
// Atmosphere — per-look fog, accent lights, dust/steam, god rays.
// Keyed off the six legacy stage looks + district overrides for the
// neon-market (lanterns + steam) and stadium (red wash + spot cones).
// ---------------------------------------------------------------------------

export interface AtmosphereConfig {
  fogColor: number;
  fogNear: number;
  fogFar: number;
  accents: Array<{ color: number; intensity: number; x: number; y: number; z: number; dist: number }>;
  rays: GodRaySpec[];
  particleColor: number;
  particleCount: number;
  particleRise: number;
}

const ATMOSPHERE: Record<string, AtmosphereConfig> = {
  ward: {
    fogColor: 0x1a2230, fogNear: 16, fogFar: 70,
    accents: [
      { color: 0xff9a3c, intensity: 22, x: -8, y: 4, z: -6, dist: 24 },
      { color: 0x3a6bd8, intensity: 14, x: 9, y: 5, z: 4, dist: 26 },
    ],
    rays: [],
    particleColor: 0x8fa3bf, particleCount: 90, particleRise: 0.25,
  },
  dock: {
    fogColor: 0x14333d, fogNear: 16, fogFar: 70,
    accents: [
      { color: 0x2dd4bf, intensity: 26, x: -6, y: 7, z: -8, dist: 30 },
      { color: 0xffb347, intensity: 16, x: 8, y: 3, z: 6, dist: 22 },
    ],
    rays: [{ x: -6, y: 9, z: -8, height: 9, radius: 2.2, color: 0x9df2e4, intensity: 0.22 }],
    particleColor: 0x7fb8ad, particleCount: 110, particleRise: 0.3,
  },
  pit: {
    fogColor: 0x5a3420, fogNear: 14, fogFar: 62,
    accents: [
      { color: 0xffb347, intensity: 30, x: 0, y: 6, z: -4, dist: 26 },
      { color: 0xff7a2a, intensity: 18, x: -7, y: 3, z: 5, dist: 20 },
    ],
    rays: [
      { x: 0, y: 8, z: -4, height: 8, radius: 2.6, color: 0xffd9a0, intensity: 0.3 },
      { x: -7, y: 6, z: 5, height: 6, radius: 1.8, color: 0xffc080, intensity: 0.22 },
    ],
    particleColor: 0xd8a06a, particleCount: 130, particleRise: 0.55,
  },
  high: {
    fogColor: 0x111a2c, fogNear: 24, fogFar: 96,
    accents: [
      { color: 0xff2fb3, intensity: 20, x: -10, y: 6, z: -6, dist: 30 },
      { color: 0x2bd8ff, intensity: 20, x: 10, y: 6, z: 6, dist: 30 },
      { color: 0xff9a3c, intensity: 12, x: 0, y: 2, z: -10, dist: 24 },
    ],
    rays: [],
    particleColor: 0x9db8dd, particleCount: 80, particleRise: 0.2,
  },
  yard: {
    fogColor: 0x2c3a2a, fogNear: 18, fogFar: 80,
    accents: [
      { color: 0xd8ffd8, intensity: 34, x: -5, y: 9, z: -6, dist: 32 },
      { color: 0xffb347, intensity: 14, x: 7, y: 3, z: 7, dist: 22 },
    ],
    rays: [
      { x: -5, y: 10, z: -6, height: 10, radius: 3, color: 0xe8ffe8, intensity: 0.28 },
      { x: 5, y: 10, z: 6, height: 10, radius: 3, color: 0xe8ffe8, intensity: 0.2 },
    ],
    particleColor: 0xa8b89a, particleCount: 120, particleRise: 0.35,
  },
  under: {
    fogColor: 0x141f28, fogNear: 12, fogFar: 52,
    accents: [
      { color: 0x9df2ff, intensity: 24, x: 0, y: 5, z: -5, dist: 24 },
      { color: 0xff3b30, intensity: 10, x: -8, y: 2, z: 6, dist: 18 },
    ],
    rays: [
      { x: 0, y: 7, z: -5, height: 7, radius: 2.4, color: 0xbdf3ff, intensity: 0.3 },
      { x: -8, y: 6, z: 6, height: 6, radius: 1.6, color: 0x9df2ff, intensity: 0.18 },
    ],
    particleColor: 0x7d94a8, particleCount: 100, particleRise: 0.15,
  },
};

/** District overrides — the key-art looks. */
const DISTRICT_ATMOSPHERE: Record<string, Partial<AtmosphereConfig>> = {
  // Neon market key art: warm lantern glow + teal neon + steam.
  "neon-district": {
    fogColor: 0x1c2422, fogNear: 14, fogFar: 60,
    accents: [
      { color: 0xff9a3c, intensity: 30, x: -6, y: 4, z: -4, dist: 26 },
      { color: 0xff9a3c, intensity: 22, x: 6, y: 4, z: 4, dist: 26 },
      { color: 0x2dd4bf, intensity: 20, x: 0, y: 6, z: -9, dist: 28 },
      { color: 0x2dd4bf, intensity: 14, x: -9, y: 5, z: 7, dist: 24 },
    ],
    rays: [
      { x: -6, y: 6, z: -4, height: 6, radius: 2, color: 0xffc98a, intensity: 0.25 },
      { x: 6, y: 6, z: 4, height: 6, radius: 2, color: 0xffc98a, intensity: 0.25 },
    ],
    particleColor: 0xd8c8b0, particleCount: 150, particleRise: 0.8,
  },
  "marquee-mile": {
    fogColor: 0x1c2422, fogNear: 14, fogFar: 60,
    accents: [
      { color: 0xff9a3c, intensity: 26, x: -6, y: 4, z: -4, dist: 26 },
      { color: 0x2dd4bf, intensity: 18, x: 6, y: 5, z: 5, dist: 26 },
      { color: 0xff2fb3, intensity: 14, x: 0, y: 6, z: -9, dist: 28 },
    ],
    particleColor: 0xd8c8b0, particleCount: 130, particleRise: 0.7,
  },
  // Stadium key art: red wash + white spot cones over the cage.
  civic: {
    fogColor: 0x2a1214, fogNear: 16, fogFar: 72,
    accents: [
      { color: 0xff2a1a, intensity: 26, x: -10, y: 8, z: -6, dist: 34 },
      { color: 0xff2a1a, intensity: 26, x: 10, y: 8, z: 6, dist: 34 },
      { color: 0xffffff, intensity: 30, x: 0, y: 10, z: 0, dist: 30 },
    ],
    rays: [
      { x: -3, y: 11, z: -2, height: 11, radius: 2.4, color: 0xffffff, intensity: 0.32 },
      { x: 3, y: 11, z: 2, height: 11, radius: 2.4, color: 0xffffff, intensity: 0.32 },
      { x: 0, y: 11, z: -5, height: 11, radius: 2, color: 0xffe8e8, intensity: 0.24 },
    ],
    particleColor: 0xc89898, particleCount: 120, particleRise: 0.4,
  },
};

export class StageAtmosphere {
  private lights: THREE.PointLight[] = [];
  private rays: GodRayField;
  private points: THREE.Points | null = null;
  private pGeo: THREE.BufferGeometry | null = null;
  private pVel: Float32Array = new Float32Array(0);
  private pCount = 0;
  private rise = 0.3;
  private budget: TierBudget = TIER_BUDGET.high;

  constructor(private scene: THREE.Scene) {
    this.rays = new GodRayField();
    scene.add(this.rays.group);
    // Pre-create accent light pool (max 6). Unused stay at intensity 0.
    for (let i = 0; i < 6; i++) {
      const l = new THREE.PointLight(0xffffff, 0, 30, 1.9);
      scene.add(l);
      this.lights.push(l);
    }
  }

  setTier(t: QualityTier): void {
    this.budget = TIER_BUDGET[t];
    this.rays.setBudget(this.budget.godRays);
    this.rebuildParticles(Math.min(this.pCount, this.budget.particles));
  }

  /** Apply atmosphere for a stage look + optional district override. */
  setStage(lookKey: string, district?: string): void {
    const base = ATMOSPHERE[lookKey] ?? ATMOSPHERE.ward;
    const over = district ? DISTRICT_ATMOSPHERE[district] : undefined;
    const cfg: AtmosphereConfig = { ...base, ...(over ?? {}) };
    const fog = this.scene.fog as THREE.Fog | null;
    if (fog) {
      fog.color.setHex(cfg.fogColor);
      fog.near = cfg.fogNear;
      fog.far = cfg.fogFar;
    }
    for (let i = 0; i < this.lights.length; i++) {
      const l = this.lights[i];
      const a = cfg.accents[i];
      if (a) {
        l.color.setHex(a.color);
        l.intensity = a.intensity;
        l.position.set(a.x, a.y, a.z);
        l.distance = a.dist;
      } else {
        l.intensity = 0;
      }
    }
    this.rays.setRays(cfg.rays);
    this.rise = cfg.particleRise;
    this.rebuildParticles(Math.min(cfg.particleCount, this.budget.particles), cfg.particleColor);
  }

  private rebuildParticles(count: number, color = 0xffffff): void {
    if (this.points) {
      this.scene.remove(this.points);
      this.pGeo?.dispose();
      (this.points.material as THREE.Material).dispose();
      this.points = null;
    }
    this.pCount = count;
    if (count <= 0) return;
    this.pGeo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    this.pVel = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 36;
      pos[i * 3 + 1] = Math.random() * 9;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 36;
      this.pVel[i * 3] = (Math.random() - 0.5) * 0.12;
      this.pVel[i * 3 + 1] = 0.15 + Math.random() * 0.4;
      this.pVel[i * 3 + 2] = (Math.random() - 0.5) * 0.12;
    }
    this.pGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({
      color,
      size: 0.09,
      transparent: true,
      opacity: 0.5,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });
    this.points = new THREE.Points(this.pGeo, mat);
    this.points.frustumCulled = false;
    this.points.renderOrder = 4;
    this.scene.add(this.points);
  }

  tick(dt: number, time: number): void {
    windUniforms.uTime.value = time;
    // Gust envelope: slow swell + faster ripple.
    windUniforms.uGust.value =
      0.35 + 0.25 * Math.sin(time * 0.4) + 0.12 * Math.sin(time * 1.7 + 1.3);
    if (this.points && this.pGeo) {
      const pos = this.pGeo.getAttribute("position") as THREE.BufferAttribute;
      const arr = pos.array as Float32Array;
      const n = this.pCount;
      for (let i = 0; i < n; i++) {
        arr[i * 3] += (this.pVel[i * 3] + windUniforms.uWindDir.value.x * windUniforms.uGust.value * 0.35) * dt;
        arr[i * 3 + 1] += this.pVel[i * 3 + 1] * this.rise * dt;
        arr[i * 3 + 2] += (this.pVel[i * 3 + 2] + windUniforms.uWindDir.value.y * windUniforms.uGust.value * 0.35) * dt;
        if (arr[i * 3 + 1] > 9) {
          arr[i * 3 + 1] = 0;
          arr[i * 3] = (Math.random() - 0.5) * 36;
          arr[i * 3 + 2] = (Math.random() - 0.5) * 36;
        }
      }
      pos.needsUpdate = true;
    }
  }
}

// ---------------------------------------------------------------------------
// EnvQuality — the whole package, wired into view.ts.
// ---------------------------------------------------------------------------

export class EnvQuality {
  readonly tier: QualityTier;
  readonly budget: TierBudget;
  readonly atmosphere: StageAtmosphere;
  readonly jiggle = new JiggleSystem();
  private time = 0;

  constructor(scene: THREE.Scene, opts: { phone: boolean }) {
    this.tier = detectTier(opts.phone);
    this.budget = TIER_BUDGET[this.tier];
    this.atmosphere = new StageAtmosphere(scene);
    this.atmosphere.setTier(this.tier);
    if (this.tier === "low") this.jiggle.strength = 0.5;
  }

  setStage(lookKey: string, district?: string): void {
    this.atmosphere.setStage(lookKey, district);
  }

  tick(dt: number): void {
    this.time += dt;
    this.atmosphere.tick(dt, this.time);
    this.jiggle.update(dt);
  }
}
