/**
 * Round 3 visuals — arena spectators (separate from the STREET crowd in
 * federated/pedestrians.ts — this one is seated tiered-stands spectators for
 * fight venues like the pit).
 *
 * Two InstancedMeshes (bodies + heads) with per-instance clothing/skin color
 * variety, idle bounce phase per spectator, and an `excitement` 0..1 driver.
 * `crowdReact('hit' | 'knockdown' | 'ko' | 'round')` spikes the cheer.
 * Distance culling: the whole group hides past `cullDistance`, and matrix
 * updates are skipped while culled or in reduced mode.
 */
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

export type CrowdReaction = "hit" | "knockdown" | "ko" | "round";

/** Stage ids that get the tiered-stands arena crowd (see applyStage in view.ts). */
export const ARENA_STAGES = ["pit"] as const;

const CLOTHING = [
  0xe4572e, 0x5c6b73, 0x3e5c4a, 0x6a3a4a, 0x3a465c, 0xd9a441, 0x7a4a8c,
  0x2e6f8e, 0xb03a2e, 0x4a7c59, 0xd4d4d4, 0x22262e, 0x8c6a3a, 0x9c4a6e,
];
const SKIN = [
  0xe6c2a2, 0xd2b39a, 0xc4a484, 0xd7c0a4, 0xe0c2a8, 0xd8bea6,
  0x8d5a3b, 0x6e4530, 0xa06a42, 0x4a3222,
];

const REACT_AMP: Record<CrowdReaction, number> = {
  hit: 0.14,
  knockdown: 0.32,
  ko: 0.55,
  round: 0.26,
};

export interface ArenaCrowdOpts {
  center?: { x: number; z: number };
  /** Radius of the inner edge of the first tier. */
  baseRadius?: number;
  tiers?: number;
  rowsPerTier?: number;
  seatsPerRow?: number;
  tierDepth?: number;
  tierHeight?: number;
  /** Hide the whole crowd beyond this camera distance. */
  cullDistance?: number;
}

function mulberry(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export class ArenaCrowd {
  readonly group = new THREE.Group();
  /** 0..1 — drives cheer amplitude. Decays toward a rest baseline. */
  excitement = 0.22;
  cullDistance: number;

  private readonly bodies: THREE.InstancedMesh;
  private readonly heads: THREE.InstancedMesh;
  private readonly count: number;
  private readonly baseX: Float32Array;
  private readonly baseY: Float32Array;
  private readonly baseZ: Float32Array;
  private readonly yaw: Float32Array;
  private readonly phase: Float32Array;
  private readonly speed: Float32Array;
  private readonly scale: Float32Array;
  private reactAmp = 0;
  private stageVisible = false;
  private readonly center: { x: number; z: number };
  private readonly m = new THREE.Matrix4();
  private readonly q = new THREE.Quaternion();
  private readonly e = new THREE.Euler();
  private readonly v = new THREE.Vector3();
  private readonly s = new THREE.Vector3();

  constructor(opts: ArenaCrowdOpts = {}) {
    const rnd = mulberry(90210);
    const center = opts.center ?? { x: 0, z: 0 };
    this.center = center;
    const baseRadius = opts.baseRadius ?? 5.2;
    const tiers = opts.tiers ?? 3;
    const rowsPerTier = opts.rowsPerTier ?? 2;
    const seatsPerRow = opts.seatsPerRow ?? 34;
    const tierDepth = opts.tierDepth ?? 2.6;
    const tierHeight = opts.tierHeight ?? 1.5;
    this.cullDistance = opts.cullDistance ?? 60;

    // ---- tiered stands: stepped ring via lathe profile ----
    const pts: THREE.Vector2[] = [];
    pts.push(new THREE.Vector2(baseRadius - 1.2, -0.05));
    for (let t = 0; t < tiers; t++) {
      const r0 = baseRadius + t * tierDepth;
      const y0 = t * tierHeight;
      pts.push(new THREE.Vector2(r0, y0));
      pts.push(new THREE.Vector2(r0 + tierDepth * 0.55, y0)); // tread
      pts.push(new THREE.Vector2(r0 + tierDepth * 0.55, y0 + tierHeight * 0.5)); // riser
      pts.push(new THREE.Vector2(r0 + tierDepth, y0 + tierHeight * 0.5));
    }
    const topR = baseRadius + tiers * tierDepth;
    const topY = (tiers - 1) * tierHeight + tierHeight * 0.5;
    pts.push(new THREE.Vector2(topR + 0.8, topY));
    pts.push(new THREE.Vector2(topR + 0.8, -0.05));
    const standsGeo = new THREE.LatheGeometry(pts, 56);
    const stands = new THREE.Mesh(
      standsGeo,
      new THREE.MeshLambertMaterial({ color: 0x2c3138 }),
    );
    stands.position.set(center.x, 0, center.z);
    this.group.add(stands);
    // guard rail ring
    const rail = new THREE.Mesh(
      new THREE.TorusGeometry(baseRadius - 0.35, 0.045, 6, 64),
      new THREE.MeshLambertMaterial({ color: 0x8a93a0 }),
    );
    rail.rotation.x = Math.PI / 2;
    rail.position.set(center.x, 1.02, center.z);
    this.group.add(rail);

    // ---- spectator geometry ----
    // seated body: torso box + thigh box merged (single draw call)
    const torso = new THREE.BoxGeometry(0.44, 0.62, 0.28);
    torso.translate(0, 0.76, 0);
    const thighs = new THREE.BoxGeometry(0.42, 0.2, 0.52);
    thighs.translate(0, 0.42, 0.14);
    const bodyGeo = mergeGeometries([torso, thighs])!;
    const headGeo = new THREE.SphereGeometry(0.14, 10, 8);
    headGeo.translate(0, 1.22, 0);
    const bodyMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
    const headMat = new THREE.MeshLambertMaterial({ color: 0xffffff });

    // ---- seat layout ----
    const seats: { x: number; y: number; z: number; yaw: number }[] = [];
    const aisleHalf = 0.28; // radians skipped for an aisle
    for (let t = 0; t < tiers; t++) {
      for (let r = 0; r < rowsPerTier; r++) {
        const radius = baseRadius + t * tierDepth + r * (tierDepth / rowsPerTier) + 0.55;
        const y = t * tierHeight + r * (tierHeight / rowsPerTier) * 0.5;
        for (let sIdx = 0; sIdx < seatsPerRow; sIdx++) {
          const a = (sIdx / seatsPerRow) * Math.PI * 2;
          if (Math.abs(a - Math.PI) < aisleHalf) continue; // aisle gap
          const x = center.x + Math.cos(a) * radius;
          const z = center.z + Math.sin(a) * radius;
          const yaw = Math.atan2(center.x - x, center.z - z);
          seats.push({ x, y, z, yaw });
        }
      }
    }
    this.count = seats.length;
    this.bodies = new THREE.InstancedMesh(bodyGeo, bodyMat, this.count);
    this.heads = new THREE.InstancedMesh(headGeo, headMat, this.count);
    this.baseX = new Float32Array(this.count);
    this.baseY = new Float32Array(this.count);
    this.baseZ = new Float32Array(this.count);
    this.yaw = new Float32Array(this.count);
    this.phase = new Float32Array(this.count);
    this.speed = new Float32Array(this.count);
    this.scale = new Float32Array(this.count);
    const c = new THREE.Color();
    for (let i = 0; i < this.count; i++) {
      const st = seats[i];
      this.baseX[i] = st.x + (rnd() - 0.5) * 0.1;
      this.baseY[i] = st.y;
      this.baseZ[i] = st.z + (rnd() - 0.5) * 0.1;
      this.yaw[i] = st.yaw + (rnd() - 0.5) * 0.5;
      this.phase[i] = rnd() * Math.PI * 2;
      this.speed[i] = 1.6 + rnd() * 1.8;
      this.scale[i] = 0.88 + rnd() * 0.24; // body variety
      c.setHex(CLOTHING[(rnd() * CLOTHING.length) | 0]);
      c.offsetHSL((rnd() - 0.5) * 0.03, 0, (rnd() - 0.5) * 0.12);
      this.bodies.setColorAt(i, c);
      c.setHex(SKIN[(rnd() * SKIN.length) | 0]);
      this.heads.setColorAt(i, c);
      this.writeMatrix(i, 0);
    }
    const bc = this.bodies.instanceColor;
    const hc = this.heads.instanceColor;
    if (bc) bc.needsUpdate = true;
    if (hc) hc.needsUpdate = true;
    this.bodies.instanceMatrix.needsUpdate = true;
    this.heads.instanceMatrix.needsUpdate = true;
    this.bodies.frustumCulled = false;
    this.heads.frustumCulled = false;
    this.group.add(this.bodies);
    this.group.add(this.heads);
    this.group.visible = false;
  }

  private writeMatrix(i: number, bounce: number): void {
    this.e.set(0, this.yaw[i], Math.sin(this.phase[i]) * 0.02 * bounce * 8);
    this.q.setFromEuler(this.e);
    this.v.set(this.baseX[i], this.baseY[i] + bounce, this.baseZ[i]);
    const sc = this.scale[i];
    this.s.set(sc, sc, sc);
    this.m.compose(this.v, this.q, this.s);
    this.bodies.setMatrixAt(i, this.m);
    this.heads.setMatrixAt(i, this.m);
  }

  /** Show the crowd only on arena stages (see ARENA_STAGES). */
  setStage(stageId: string): void {
    this.stageVisible = (ARENA_STAGES as readonly string[]).includes(stageId);
    if (!this.stageVisible) this.group.visible = false;
  }

  /** Spike the cheer: hit / knockdown / ko / round. */
  crowdReact(kind: CrowdReaction): void {
    this.reactAmp = Math.max(this.reactAmp, REACT_AMP[kind]);
    this.excitement = Math.min(1, this.excitement + REACT_AMP[kind] * 0.7);
  }

  update(dt: number, time: number, camPos: { x: number; y: number; z: number }, reduced = false): void {
    const dx = camPos.x - this.center.x;
    const dz = camPos.z - this.center.z;
    const dist = Math.sqrt(dx * dx + dz * dz);
    const inRange = this.stageVisible && dist < this.cullDistance;
    this.group.visible = inRange;
    if (!inRange || reduced || dt <= 0) return;

    // excitement decays toward a rest murmur; reaction spikes decay fast
    this.excitement += (0.22 - this.excitement) * Math.min(1, dt * 0.45);
    this.reactAmp = Math.max(0, this.reactAmp - dt * 0.9);

    const amp = 0.018 + this.excitement * 0.09 + this.reactAmp;
    const rate = 1 + this.excitement * 1.6 + this.reactAmp * 2.2;
    for (let i = 0; i < this.count; i++) {
      const bounce = Math.abs(Math.sin(time * this.speed[i] * rate + this.phase[i])) * amp;
      this.writeMatrix(i, bounce);
    }
    this.bodies.instanceMatrix.needsUpdate = true;
    this.heads.instanceMatrix.needsUpdate = true;
  }

  dispose(): void {
    this.bodies.geometry.dispose();
    (this.bodies.material as THREE.Material).dispose();
    this.heads.geometry.dispose();
    (this.heads.material as THREE.Material).dispose();
    // stands + rail meshes
    for (const child of [...this.group.children]) {
      if (child === this.bodies || child === this.heads) continue;
      const mesh = child as THREE.Mesh;
      mesh.geometry?.dispose();
      (mesh.material as THREE.Material | undefined)?.dispose();
    }
  }
}
