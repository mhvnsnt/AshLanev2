/**
 * staging.js — ONE shared character-staging code path for every promo cinematic.
 *
 * PORTABILITY (owner 2026-10-06): this module is game-agnostic — fix once,
 * apply everywhere (AshLane, Bannon, Brutal Fist). It has NO hardcoded game
 * paths, NO per-model constants, and handles multiple skeleton families via
 * FAMILY_ALIASES (Mixamo, C4D wrestling rigs). To port: copy staging.js +
 * reskin.js to the target repo's tools directory; the NEEDS_* sets in
 * reskin.js are per-game (different rosters), but the logic is shared.
 *
 * Game-specific differences flagged 2026-10-06:
 * - Brutal Fist: PS1-style low-poly is INTENTIONAL — do NOT apply weight
 *   repair or smoothing; the QA geometry gate (2.5x segment spike) may
 *   false-positive on long low-poly triangles, tune threshold per game.
 * - Bannon: same XFER weight-transfer pipeline as AshLane — NEEDS_WEIGHT_REPAIR
 *   applies to the same broken-transfer models; WWE/canon DO_NOT_TOUCH list
 *   must be maintained per roster.
 * - AshLane: 1.85m height normalization in walk-test.html is AshLane-specific
 *   (Bannon uses per-character scale metadata per GLOBAL height rule).
 *
 * Why this exists: cinematic-faction.html re-implemented character staging from
 * scratch and got two things wrong that cinematic.html had right —
 *   1. feet below the ground plane (root.position.y overwritten, discarding the
 *      bbox ground offset), and
 *   2. 90° yaw mismatch: mesh facing 90° off the travel direction ("crab walking").
 * A fix here fixes every promo at once; a new promo reuses this instead of
 * reinventing staging.
 *
 * UNIVERSAL FORWARD (owner step 1, 2026-10-06): every model's forward is
 * AUTO-DETECTED from its own skeleton at staging time — no per-model constants.
 *   - The shoulder line (Right - Left clavicle) gives the exact left-right axis;
 *     forward is perpendicular to it.
 *   - The toe direction (Toe - Foot) resolves the ± sign (feet point roughly
 *     forward even with turnout; the sign is unambiguous).
 * Verified 2026-10-06: 7 Mixamo GLBs face +X (side-view renders: face visible
 * from +X, back from -X; toe ≈ (0.89, 0.45) = +X with ~27° turnout).
 *
 * Usage:
 *   const st = new CharacterStaging(root);   // after GLTF load, before posing
 *   st.centerXZ().syncY();                     // feet on y=0, footprint centered
 *   st.face(new THREE.Vector3(0, 0, -1));       // face direction of travel
 *   // per frame (or after any root.position write):
 *   st.place(x, liftAboveGround, z);            // lift=0 → feet exactly on ground
 */
import * as THREE from 'three';

// Fallback when auto-detect can't run (e.g. unrigged mesh). Every verified
// model faces +X; a wrong fallback here reintroduces crab-walking, so detection
// failure is logged loudly.
export const FALLBACK_FORWARD = new THREE.Vector3(1, 0, 0);

// Canonical bone aliases per skeleton family (resolved to Mixamo-canonical names).
const FAMILY_ALIASES = [
  { test: (n) => n.startsWith('mixamorig'), canon: (n) => n.replace(/^mixamorig:?/, '') },
  {
    test: (n) => n.startsWith('J_'),
    canon: (n) => ({
      'J_Hips': 'Hips', 'J_Spine1': 'Spine', 'J_Spine2': 'Spine1',
      'J_Chest': 'Spine2', 'J_Neck': 'Neck', 'J_Head': 'Head',
      'J_Clavicle_L': 'LeftShoulder', 'J_Clavicle_R': 'RightShoulder',
      'J_Shoulder_L': 'LeftArm', 'J_Shoulder_R': 'RightArm',
      'J_Elbow_L': 'LeftForeArm', 'J_Elbow_R': 'RightForeArm',
      'J_Wrist_L': 'LeftHand', 'J_Wrist_R': 'RightHand',
      'J_Leg_L': 'LeftUpLeg', 'J_Leg_R': 'RightUpLeg',
      'J_Knee_L': 'LeftLeg', 'J_Knee_R': 'RightLeg',
      'J_Foot_L': 'LeftFoot', 'J_Foot_R': 'RightFoot',
      'J_Toe_L': 'LeftToeBase', 'J_Toe_R': 'RightToeBase',
    }[n] || n),
  },
];

function canonicalName(raw) {
  for (const f of FAMILY_ALIASES) if (f.test(raw)) return f.canon(raw);
  return raw;
}

/**
 * Detect a model's forward in its own local space (root at identity).
 * Shoulders give the exact axis; toes resolve the sign.
 * Returns { forward: THREE.Vector3, method: 'shoulder+toe' | 'fallback' }.
 */
export function detectModelForward(root) {
  root.updateWorldMatrix(true, true);
  const bones = {};
  root.traverse((o) => { if (o.isBone) bones[canonicalName(o.name)] = o; });
  const P = (b, out) => { bones[b].getWorldPosition(out); return out; };
  const a = new THREE.Vector3(), b = new THREE.Vector3(), t = new THREE.Vector3();
  try {
    if (bones['LeftShoulder'] && bones['RightShoulder']) {
      P('RightShoulder', a); P('LeftShoulder', b);
      const axis = a.sub(b); axis.y = 0;
      if (axis.length() > 1e-4) {
        axis.normalize();
        // perpendiculars of (x, z): (-z, x) and (z, -x)
        const p1 = new THREE.Vector3(-axis.z, 0, axis.x);
        const p2 = new THREE.Vector3(axis.z, 0, -axis.x);
        const toeBone = bones['LeftToeBase'] || bones['RightToeBase'] || bones['LeftToe'] || bones['RightToe'];
        const footBone = bones['LeftFoot'] || bones['RightFoot'];
        if (toeBone && footBone) {
          toeBone.getWorldPosition(t); footBone.getWorldPosition(a);
          t.sub(a); t.y = 0;
          if (t.length() > 1e-4) {
            t.normalize();
            const fwd = (p1.dot(t) >= p2.dot(t) ? p1 : p2).clone();
            return { forward: fwd, method: 'shoulder+toe' };
          }
        }
      }
    }
  } catch (e) { /* fall through to fallback */ }
  console.warn('[staging] forward auto-detect failed — using fallback (+X). Verify visually!');
  return { forward: FALLBACK_FORWARD.clone(), method: 'fallback' };
}

export class CharacterStaging {
  /**
   * @param {THREE.Object3D} root - gltf.scene of the character (unrotated)
   * @param {object} opts
   * @param {THREE.Vector3} opts.modelForward - explicit override (skips detect)
   */
  constructor(root, { modelForward = null } = {}) {
    this.root = root;
    if (modelForward) {
      this.modelForward = modelForward.clone().setY(0).normalize();
      this.forwardMethod = 'explicit';
    } else {
      const d = detectModelForward(root);
      this.modelForward = d.forward;
      this.forwardMethod = d.method;
    }
    const bbox = new THREE.Box3().setFromObject(root);
    this.center = bbox.getCenter(new THREE.Vector3());
    this.size = bbox.getSize(new THREE.Vector3());
    // Rest-pose feet sit at bbox.min.y (negative: origin is at hips).
    // Adding groundOffset to root.y puts feet exactly on y=0.
    this.groundOffset = -bbox.min.y;
    this.lift = 0; // extra height above the grounded stance (staging, e.g. suplex arc)
    this.yaw = 0;
  }

  /** Center the model's XZ footprint on the root (keeps Y). */
  centerXZ() {
    this.root.position.x -= this.center.x;
    this.root.position.z -= this.center.z;
    return this;
  }

  /**
   * Yaw the root so the model's forward faces world direction `dir`
   * (Y component ignored). E.g. face the walk/travel direction.
   */
  face(dir) {
    const dx = dir.x, dz = dir.z;
    const len = Math.hypot(dx, dz);
    if (len < 1e-6) return this;
    // yaw taking local +Z to dir, minus yaw taking local +Z to modelForward
    const thetaD = Math.atan2(dx / len, dz / len);
    const thetaF = Math.atan2(this.modelForward.x, this.modelForward.z);
    this.yaw = thetaD - thetaF;
    this.root.rotation.y = this.yaw;
    return this;
  }

  /** Explicit yaw override (radians). Prefer face() for new work. */
  setYaw(rad) {
    this.yaw = rad;
    this.root.rotation.y = rad;
    return this;
  }

  /**
   * Place the character: feet at worldY = lift above the ground plane.
   * lift = 0 → feet exactly on y=0. Use small positive lift for jump/suplex arcs.
   */
  place(x, lift, z) {
    this.lift = lift;
    this.root.position.set(x, lift + this.groundOffset, z);
    return this;
  }

  /** Re-assert ground alignment after external code touched root.position. */
  syncY() {
    this.root.position.y = this.lift + this.groundOffset;
    return this;
  }

  // ---------- automated defect gates (AGENTS.md verification law) ----------

  /**
   * Minimum world-space Y of the foot bones. Must be >= -0.05 (feet on floor).
   * @param {Object<string, THREE.Bone>} bones - canonical-name→bone map
   */
  minFootY(bones) {
    this.root.updateWorldMatrix(true, true);
    const v = new THREE.Vector3();
    let m = Infinity;
    for (const n of ['LeftFoot', 'RightFoot', 'LeftToeBase', 'RightToeBase']) {
      const b = bones[n];
      if (!b) continue;
      b.getWorldPosition(v);
      if (v.y < m) m = v.y;
    }
    return m;
  }

  /**
   * Angle (degrees, XZ plane) between where the mesh faces and `velocity`.
   * Crab-walking reads as ~90°. Returns null when nearly stationary.
   */
  facingVsVelocityDeg(velocity) {
    const sp = Math.hypot(velocity.x, velocity.z);
    if (sp < 0.15) return null;
    const f = this.modelForward.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw);
    const dot = (f.x * velocity.x + f.z * velocity.z) / (Math.hypot(f.x, f.z) * sp);
    return Math.acos(Math.min(1, Math.max(-1, dot))) * 180 / Math.PI;
  }
}
