/**
 * real-motion.js — real motion-capture clip playback for the promo pipeline.
 *
 * REPLACES the old procedural `setBone` sine-wiggle animation (banned).
 * Every pose comes from real baked clips (bank.json / cmu-bank.json);
 * the director below only selects, loops, holds, and crossfades them.
 *
 * Deterministic: poseAt(t) is a pure function of t (the headless renderer
 * re-runs from 0 for every frame), so no THREE.AnimationMixer wall-clock.
 */
import * as THREE from 'three';

// bank.json Role slots -> stripped Mixamo bone names (matches the promo
// model's bones dict, which strips the mixamorig: prefix).
const SLOT_TO_BONE = {
  hips: 'Hips', spine: 'Spine', chest: 'Spine2', head: 'Head',
  upperArmL: 'LeftArm', lowerArmL: 'LeftForeArm', handL: 'LeftHand',
  upperArmR: 'RightArm', lowerArmR: 'RightForeArm', handR: 'RightHand',
  upperLegL: 'LeftUpLeg', lowerLegL: 'LeftLeg', footL: 'LeftFoot',
  upperLegR: 'RightUpLeg', lowerLegR: 'RightLeg', footR: 'RightFoot',
};

export async function loadMotionBanks() {
  const [bank, cmu] = await Promise.all([
    fetch('/motion/bank.json').then((r) => r.json()),
    fetch('/motion/cmu-bank.json').then((r) => r.json()),
  ]);
  return { bank: bank.clips, cmu: cmu.clips };
}

/**
 * Bake a bank clip onto the model's rest pose.
 * Same math as src/game3d/motion-bank.ts bakeRole: out = rest * key.
 * Returns { dur, times, bones: { boneName: [Quaternion] } }.
 */
export function bakeClip(clip, rest) {
  const times = clip.times;
  const bones = {};
  const role = clip.atk || {};
  for (const [slot, keys] of Object.entries(role)) {
    const bone = SLOT_TO_BONE[slot];
    const q0 = bone && rest[bone];
    if (!bone || !q0 || keys.length !== times.length) continue;
    const qs = [];
    const q = new THREE.Quaternion();
    const out = new THREE.Quaternion();
    for (const key of keys) {
      q.set(key[0], key[1], key[2], key[3]);
      out.copy(q0).multiply(q);
      qs.push(out.clone());
    }
    bones[bone] = qs;
  }
  return { dur: times[times.length - 1] ?? 1, times, bones };
}

/** Sample a baked clip at time t (looping). Returns {bone: Quaternion}. */
function sampleLoop(baked, t, out) {
  const tt = ((t % baked.dur) + baked.dur) % baked.dur;
  return sampleAt(baked, tt, out);
}

/** Sample a baked clip at an exact time (no loop). */
function sampleAt(baked, t, out) {
  out = out || {};
  const { times, bones } = baked;
  let i = 0;
  while (i < times.length - 2 && times[i + 1] < t) i++;
  const t0 = times[i], t1 = times[i + 1];
  const f = t1 > t0 ? Math.min(1, Math.max(0, (t - t0) / (t1 - t0))) : 0;
  for (const [bone, qs] of Object.entries(bones)) {
    out[bone] = (out[bone] || new THREE.Quaternion()).copy(qs[i]).slerp(qs[i + 1], f);
  }
  return out;
}

// ---------------------------------------------------------------------------
// Director: 50s promo choreography as REAL clips. Verified by proof renders
// (tools/anim-retarget). Hold frames are frozen mocap poses, not procedural.
// ---------------------------------------------------------------------------
const CHOREO = [
  { t0: 0,  t1: 5,  clip: 'boxidle',   mode: 'loop' },
  { t0: 5,  t1: 14, clip: 'walk',      mode: 'loop', bank: 'cmu' },
  { t0: 14, t1: 22, clip: 'guardhigh', mode: 'hold', holdT: 1.9 },
  { t0: 22, t1: 30, clip: 'esquiva',   mode: 'loop' },
  { t0: 30, t1: 38, clip: 'capoeira',  mode: 'hold', holdT: 1.93 },
  { t0: 38, t1: 50, clip: 'rise',      mode: 'hold', holdT: 0.93 },
];
const FADE = 0.6; // crossfade seconds at segment boundaries

export function makeDirector(banks, rest, bones) {
  const baked = {};
  const get = (name, bankName) => {
    const key = `${bankName}:${name}`;
    if (!baked[key]) {
      const clip = banks[bankName][name];
      if (!clip) throw new Error(`motion clip missing: ${bankName}/${name}`);
      baked[key] = bakeClip(clip, rest);
    }
    return baked[key];
  };

  const poseA = {}, poseB = {};
  const tmpQ = new THREE.Quaternion();

  function poseFor(seg, t, out) {
    const b = get(seg.clip, seg.bank || 'bank');
    if (seg.mode === 'hold') sampleAt(b, seg.holdT, out);
    else sampleLoop(b, t - seg.t0, out);
    return out;
  }

  function segAt(t) {
    for (let i = 0; i < CHOREO.length; i++) {
      if (t < CHOREO[i].t1 || i === CHOREO.length - 1) return i;
    }
    return 0;
  }

  return {
    /** Set every bone from real clips at promo-time t. */
    poseAt(t) {
      // reset to rest
      for (const k in bones) bones[k].quaternion.copy(rest[k]);
      const si = segAt(t);
      const seg = CHOREO[si];
      poseFor(seg, t, poseA);
      // crossfade from previous segment
      const dt = t - seg.t0;
      if (si > 0 && dt < FADE) {
        const prev = CHOREO[si - 1];
        poseFor(prev, prev.t1 - 0.001, poseB);
        const f = dt / FADE;
        const e = f * f * (3 - 2 * f);
        for (const k in poseA) {
          if (poseB[k]) {
            tmpQ.copy(poseB[k]).slerp(poseA[k], e);
            bones[k].quaternion.copy(tmpQ);
          } else {
            bones[k].quaternion.copy(poseA[k]);
          }
        }
      } else {
        for (const k in poseA) bones[k].quaternion.copy(poseA[k]);
      }
    },
    /** 0..1 walk amount (drives the root staging translation, kept). */
    walkAmt(t) {
      const sstep = (a, b, x) => {
        const k = Math.min(1, Math.max(0, (x - a) / (b - a)));
        return k * k * (3 - 2 * k);
      };
      if (t < 5) return 0;
      if (t < 14) return sstep(5, 6.5, t) * (1 - sstep(12.5, 14, t));
      if (t >= 30 && t < 34)
        return sstep(30, 31, t) * (1 - sstep(33, 34, t)) * 0.7;
      return 0;
    },
  };
}
