/**
 * Rapier WASM physics for AshLane — ragdoll KOs, hit reactions, destructible props.
 *
 * Package: @dimforge/rapier3d-compat (Apache-2.0, commercial-safe, verified).
 * The `-compat` build runs without SharedArrayBuffer / COOP-COEP headers, so it
 * works inside the Vite PWA build and in headless Playwright with zero config.
 *
 * Integration point for combat: when a fighter is KO'd, call
 *   const ragdoll = HumanoidRagdoll.fromFighter(physics, fighterRoot);
 *   ragdoll.knockout(direction, power);
 * and each frame call `ragdoll.sync()` instead of driving the bones from the
 * animation mixer. See `src/routes/ragdoll-demo.tsx` for the live in-game proof.
 */
import RAPIER from "@dimforge/rapier3d-compat";
import * as THREE from "three";

let rapierInit: Promise<void> | null = null;

/** Idempotent: resolves once the Rapier WASM module is ready. */
export function ensureRapier(): Promise<void> {
  if (!rapierInit) rapierInit = RAPIER.init();
  return rapierInit;
}

// ---------------------------------------------------------------------------
// PhysicsWorld — one per fight/demo
// ---------------------------------------------------------------------------

export class PhysicsWorld {
  readonly world: RAPIER.World;

  constructor(gravity = -9.81) {
    this.world = new RAPIER.World({ x: 0, y: gravity, z: 0 });
  }

  /** Static ground slab. half = half-extents, y = top surface height. */
  addGround(half = 12, topY = 0, friction = 1.0): RAPIER.RigidBody {
    const body = this.world.createRigidBody(
      RAPIER.RigidBodyDesc.fixed().setTranslation(0, topY - 0.5, 0),
    );
    this.world.createCollider(
      RAPIER.ColliderDesc.cuboid(half, 0.5, half).setFriction(friction),
      body,
    );
    return body;
  }

  step(dt: number): void {
    this.world.timestep = Math.min(dt, 1 / 30);
    this.world.step();
  }

  free(): void {
    this.world.free();
  }
}

// ---------------------------------------------------------------------------
// HumanoidRagdoll — builds rigid bodies from Mixamo-standard bones
// (see docs/BONE_STANDARD.md: mixamorig:Hips … 52 bones)
// ---------------------------------------------------------------------------

interface PartDef {
  key: string;
  /** bone that owns this rigid body */
  bone: string;
  /** joint connects parentPart -> this part, anchored at this bone's rest pos */
  parent: string | null;
  kind: "capsule" | "ball";
  radius: number;
  /** capsule segment end bone (defaults: first child) */
  endBone?: string;
}

const PARTS: PartDef[] = [
  { key: "pelvis", bone: "Hips", parent: null, kind: "ball", radius: 0.16 },
  { key: "torso", bone: "Spine", parent: "pelvis", kind: "capsule", radius: 0.17, endBone: "Spine1" },
  { key: "head", bone: "Neck", parent: "torso", kind: "ball", radius: 0.13 },
  { key: "upperArmR", bone: "RightArm", parent: "torso", kind: "capsule", radius: 0.07, endBone: "RightForeArm" },
  { key: "forearmR", bone: "RightForeArm", parent: "upperArmR", kind: "capsule", radius: 0.06, endBone: "RightHand" },
  { key: "upperArmL", bone: "LeftArm", parent: "torso", kind: "capsule", radius: 0.07, endBone: "LeftForeArm" },
  { key: "forearmL", bone: "LeftForeArm", parent: "upperArmL", kind: "capsule", radius: 0.06, endBone: "LeftHand" },
  { key: "thighR", bone: "RightUpLeg", parent: "pelvis", kind: "capsule", radius: 0.1, endBone: "RightLeg" },
  { key: "shinR", bone: "RightLeg", parent: "thighR", kind: "capsule", radius: 0.07, endBone: "RightFoot" },
  { key: "thighL", bone: "LeftUpLeg", parent: "pelvis", kind: "capsule", radius: 0.1, endBone: "LeftLeg" },
  { key: "shinL", bone: "LeftLeg", parent: "thighL", kind: "capsule", radius: 0.07, endBone: "LeftFoot" },
];

function findBone(root: THREE.Object3D, name: string): THREE.Bone | null {
  let found: THREE.Bone | null = null;
  root.traverse((o) => {
    if (found || !(o instanceof THREE.Bone)) return;
    const n = o.name;
    if (n === name || n === `mixamorig:${name}` || n.endsWith(`:${name}`)) found = o;
  });
  return found;
}

const _v1 = new THREE.Vector3();
const _v2 = new THREE.Vector3();
const _q = new THREE.Quaternion();
const _m = new THREE.Matrix4();
const Y_AXIS = new THREE.Vector3(0, 1, 0);

export interface RagdollPart {
  key: string;
  bone: THREE.Bone;
  body: RAPIER.RigidBody;
}

export class HumanoidRagdoll {
  readonly parts: RagdollPart[] = [];
  /** world-space rest position of the pelvis, for KO-reset */
  readonly restRoot = new THREE.Vector3();
  readonly physics: PhysicsWorld;

  private constructor(physics: PhysicsWorld) {
    this.physics = physics;
  }

  /** Build from a loaded fighter (THREE.Group / skinned mesh root). Throws if Hips missing. */
  static fromFighter(physics: PhysicsWorld, root: THREE.Object3D): HumanoidRagdoll {
    const r = new HumanoidRagdoll(physics);
    root.updateWorldMatrix(true, true);
    const bones = new Map<string, THREE.Bone>();
    for (const p of PARTS) {
      const b = findBone(root, p.bone);
      if (!b) throw new Error(`[ragdoll] bone not found: ${p.bone}`);
      bones.set(p.key, b);
    }
    const bodies = new Map<string, RAPIER.RigidBody>();

    for (const p of PARTS) {
      const bone = bones.get(p.key)!;
      const start = bone.getWorldPosition(new THREE.Vector3());
      let desc: RAPIER.ColliderDesc;
      let center = start.clone();
      let quat = new THREE.Quaternion();

      if (p.kind === "capsule") {
        const endBone = p.endBone ? findBone(root, p.endBone) : bone.children[0];
        const end = (endBone instanceof THREE.Bone ? endBone : bone.children[0])
          ? ((endBone as THREE.Bone).getWorldPosition(new THREE.Vector3()))
          : start.clone().add(new THREE.Vector3(0, 0.25, 0));
        const dir = _v1.copy(end).sub(start);
        const len = Math.max(dir.length(), 0.05);
        dir.normalize();
        quat = new THREE.Quaternion().setFromUnitVectors(Y_AXIS, dir);
        center = _v2.copy(start).add(end).multiplyScalar(0.5).clone();
        const halfH = Math.max(len / 2 - p.radius, 0.02);
        desc = RAPIER.ColliderDesc.capsule(halfH, p.radius);
      } else {
        // head ball sits at the Head bone, not the Neck joint
        if (p.key === "head") {
          const head = findBone(root, "Head");
          if (head) head.getWorldPosition(center);
        }
        desc = RAPIER.ColliderDesc.ball(p.radius);
        bone.getWorldQuaternion(quat);
      }

      const body = physics.world.createRigidBody(
        RAPIER.RigidBodyDesc.dynamic()
          .setTranslation(center.x, center.y, center.z)
          .setRotation({ x: quat.x, y: quat.y, z: quat.z, w: quat.w })
          .setLinearDamping(0.05)
          .setAngularDamping(0.6)
          .setCcdEnabled(true)
          .lockRotations(), // start locked; knockout() unlocks -> clean standing start
      );
      physics.world.createCollider(
        desc.setDensity(1.0).setFriction(0.9).setRestitution(0.1),
        body,
      );
      bodies.set(p.key, body);
      r.parts.push({ key: p.key, bone, body });
      if (p.key === "pelvis") r.restRoot.copy(center);
    }

    // Spherical impulse joints, anchored at each child part's rest position.
    for (const p of PARTS) {
      if (!p.parent) continue;
      const childBone = bones.get(p.key)!;
      const anchor = childBone.getWorldPosition(new THREE.Vector3());
      const a = bodies.get(p.parent)!;
      const b = bodies.get(p.key)!;
      const aPos = a.translation();
      const bPos = b.translation();
      const joint = RAPIER.JointData.spherical(
        { x: anchor.x - aPos.x, y: anchor.y - aPos.y, z: anchor.z - aPos.z },
        { x: anchor.x - bPos.x, y: anchor.y - bPos.y, z: anchor.z - bPos.z },
      );
      physics.world.createImpulseJoint(joint, a, b, true);
    }
    return r;
  }

  /**
   * The KO: unlock rotations, wake everything, and slam a punch through the
   * torso/head. dir = punch direction (world), speed = torso launch speed in
   * m/s (try 5–9). Impulses are mass-scaled per body so small limbs don't
   * get launched into orbit.
   */
  knockout(dir: THREE.Vector3, speed = 7): void {
    const d = dir.clone().normalize();
    for (const part of this.parts) {
      part.body.lockRotations(false, true);
      part.body.wakeUp();
      const mass = part.body.mass();
      const t = part.body.translation();
      const boost = part.key === "torso" || part.key === "head" ? 1.6 : 1.0;
      const k = speed * boost * mass;
      part.body.applyImpulseAtPoint(
        { x: d.x * k, y: d.y * k + speed * 0.35 * boost * mass, z: d.z * k },
        { x: t.x, y: t.y, z: t.z },
        true,
      );
      // a little spin so it doesn't fall like a plank
      const tq = speed * mass * 0.25;
      part.body.applyTorqueImpulse(
        { x: (Math.random() - 0.5) * tq, y: 0, z: (Math.random() - 0.5) * tq },
        true,
      );
    }
  }

  /** Copy rigid-body transforms back onto the skinned-mesh bones. Call after physics.step(). */
  sync(): void {
    for (const part of this.parts) {
      const t = part.body.translation();
      const rot = part.body.rotation();
      _v1.set(t.x, t.y, t.z);
      _q.set(rot.x, rot.y, rot.z, rot.w);
      _m.compose(_v1, _q, part.bone.scale);
      if (part.bone.parent) {
        part.bone.parent.updateWorldMatrix(true, false);
        _m.premultiply(new THREE.Matrix4().copy(part.bone.parent.matrixWorld).invert());
      }
      _m.decompose(part.bone.position, part.bone.quaternion, part.bone.scale);
      part.bone.updateMatrix();
    }
  }

  /** Total distance all parts moved from rest — used by the playtest harness as proof. */
  displacementFromRest(): number {
    let d = 0;
    for (const part of this.parts) {
      const t = part.body.translation();
      d += Math.hypot(t.x - this.restRoot.x, t.y - this.restRoot.y, t.z - this.restRoot.z);
    }
    return d;
  }

  dispose(physics: PhysicsWorld): void {
    for (const part of this.parts) physics.world.removeRigidBody(part.body);
    this.parts.length = 0;
  }
}
