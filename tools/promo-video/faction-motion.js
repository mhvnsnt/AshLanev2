/**
 * faction-motion.js — multi-character real-mocap director for faction promos.
 *
 * Same ban as real-motion.js: NO procedural bone animation. Every bone pose
 * comes from baked retargeted clips (bank.json / cmu-bank.json / retargeted GLBs).
 * Only root staging translations are scripted (staging, not bone animation).
 *
 * Adds: per-character choreographies, vic-role baking for paired moves
 * (attacker + receiver synced to the same clip clock).
 */
import * as THREE from 'three';

const SLOT_TO_BONE = {
  hips: 'Hips', spine: 'Spine', chest: 'Spine2', head: 'Head',
  upperArmL: 'LeftArm', lowerArmL: 'LeftForeArm', handL: 'LeftHand',
  upperArmR: 'RightArm', lowerArmR: 'RightForeArm', handR: 'RightHand',
  upperLegL: 'LeftUpLeg', lowerLegL: 'LeftLeg', footL: 'LeftFoot',
  upperLegR: 'RightUpLeg', lowerLegR: 'RightLeg', footR: 'RightFoot',
};

/** Bake one role (atk|vic) of a bank clip onto a model's rest pose. */
export function bakeClipRole(clip, role, rest) {
  const times = clip.times;
  const bones = {};
  const src = clip[role] || {};
  for (const [slot, keys] of Object.entries(src)) {
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

function sampleLoop(baked, t, out) {
  const tt = ((t % baked.dur) + baked.dur) % baked.dur;
  return sampleAt(baked, tt, out);
}

const FADE = 0.6;

/**
 * cast: [{
 *   name, rest, bones, root (THREE.Object3D), basePos: THREE.Vector3,
 *   visible: [t0, t1] | null (null = always),
 *   choreo: [{ t0, t1, clip, bank='bank', role='atk', mode='loop'|'hold'|'once', holdT }],
 *   rootTrack: [{ t, pos: [x,y,z] }] — keyframed staging positions (lerped).
 *     y is LIFT ABOVE THE GROUNDED STANCE (0 = feet exactly on the ground).
 *     Shared staging (staging.js) applies the per-model ground offset;
 *     never write c.root.position directly.
 * }]
 */
export function makeCastDirector(banks, cast) {
  const baked = {};
  const get = (clipName, bankName, role) => {
    const key = `${bankName}:${clipName}:${role}`;
    if (!baked[key]) {
      const clip = banks[bankName][clipName];
      if (!clip) throw new Error(`motion clip missing: ${bankName}/${clipName}`);
      // NOTE: rest pose differs per character; bake per character below.
      baked[key] = clip;
    }
    return baked[key];
  };

  // Per-character baked clips (rest pose is per-model).
  for (const c of cast) {
    c._baked = {};
    for (const seg of c.choreo) {
      const key = `${seg.bank || 'bank'}:${seg.clip}:${seg.role || 'atk'}`;
      if (!c._baked[key]) {
        const clip = get(seg.clip, seg.bank || 'bank', seg.role || 'atk');
        c._baked[key] = bakeClipRole(clip, seg.role || 'atk', c.rest);
      }
    }
    c._poseA = {}; c._poseB = {};
    c._rootPos = new THREE.Vector3().copy(c.basePos);
  }

  const tmpQ = new THREE.Quaternion();

  function poseChar(c, t) {
    const { rest, bones, choreo } = c;
    for (const k in bones) bones[k].quaternion.copy(rest[k]);
    let si = choreo.length - 1;
    for (let i = 0; i < choreo.length; i++) {
      if (t < choreo[i].t1 || i === choreo.length - 1) { si = i; break; }
    }
    const seg = choreo[si];
    const b = c._baked[`${seg.bank || 'bank'}:${seg.clip}:${seg.role || 'atk'}`];
    const out = c._poseA;
    if (seg.mode === 'hold') sampleAt(b, seg.holdT ?? 0, out);
    else if (seg.mode === 'once') sampleAt(b, Math.min(t - seg.t0, b.dur - 0.001), out);
    else sampleLoop(b, t - seg.t0, out);

    const dt = t - seg.t0;
    if (si > 0 && dt < FADE) {
      const prev = choreo[si - 1];
      const pb = c._baked[`${prev.bank || 'bank'}:${prev.clip}:${prev.role || 'atk'}`];
      const pout = c._poseB;
      if (prev.mode === 'hold') sampleAt(pb, prev.holdT ?? 0, pout);
      else sampleAt(pb, Math.min(prev.t1 - 0.001 - prev.t0, pb.dur - 0.001), pout);
      const f = dt / FADE, e = f * f * (3 - 2 * f);
      for (const k in out) {
        if (pout[k]) { tmpQ.copy(pout[k]).slerp(out[k], e); bones[k].quaternion.copy(tmpQ); }
        else bones[k].quaternion.copy(out[k]);
      }
    } else {
      for (const k in out) bones[k].quaternion.copy(out[k]);
    }
  }

  function rootAt(c, t) {
    const track = c.rootTrack;
    if (!track || !track.length) return c.basePos;
    if (t <= track[0].t) return new THREE.Vector3(...track[0].pos);
    for (let i = 0; i < track.length - 1; i++) {
      const a = track[i], b = track[i + 1];
      if (t >= a.t && t <= b.t) {
        const f = (t - a.t) / Math.max(1e-6, b.t - a.t);
        const e = f * f * (3 - 2 * f);
        return new THREE.Vector3(
          a.pos[0] + (b.pos[0] - a.pos[0]) * e,
          a.pos[1] + (b.pos[1] - a.pos[1]) * e,
          a.pos[2] + (b.pos[2] - a.pos[2]) * e
        );
      }
    }
    const last = track[track.length - 1];
    return new THREE.Vector3(...last.pos);
  }

  return {
    poseAt(t) {
      for (const c of cast) {
        const vis = !c.visible || (t >= c.visible[0] && t <= c.visible[1]);
        c.root.visible = vis;
        if (!vis) continue;
        poseChar(c, t);
        const p = rootAt(c, t);
        // Shared staging: p.y is lift above the grounded stance. This preserves
        // the per-model ground offset (feet ~0.9m below the hips-origin).
        // The old code did c.root.position.set(p.x, p.y, p.z) here, which sank
        // every character waist-deep through the floor. Never revert this.
        c.staging.place(p.x, p.y, p.z);
      }
    },
  };
}

/** Load bank.json + cmu-bank.json (same as real-motion.js). */
export async function loadMotionBanks() {
  const [bank, cmu] = await Promise.all([
    fetch('/motion/bank.json').then((r) => r.json()),
    fetch('/motion/cmu-bank.json').then((r) => r.json()),
  ]);
  return { bank: bank.clips, cmu: cmu.clips };
}
