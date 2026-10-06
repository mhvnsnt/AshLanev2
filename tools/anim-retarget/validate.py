#!/usr/bin/env python3
"""Automated validation for retargeted animation clips.

Checks (each PASS/WARN/FAIL):
  coverage   - % of 20 core body slots carrying tracks
  sanity     - no NaN/Inf, quaternions normalized, no wild pops
  tpose      - no mid-clip collapse back to rest pose (T-pose contamination)
  joints     - knees/elbows bend on one hinge side only (no hyperextension)
  feet       - no excessive foot skate during ground contact (root-motion
               clips only; in-place clips skip)

Position-based checks (feet) use canonical.canonical_offsets: the cast GLB
node offsets do not form an anatomical figure, so raw FK would corrupt them.
"""
import os
import sys
import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import (Glb, extract_animations, qmul, qnormalize, qangle,
                    qinv, IDENTITY_Q)
from skeletons import (CORE_SLOTS, from_canonical, to_canonical)
from canonical import fk_canonical, canonical_offsets

TARGET_FAMILY = "mixamo-colon"

# bank.json Role slots -> canonical
BANK_SLOT = {
    "hips": "Hips", "spine": "Spine", "chest": "Spine2", "head": "Head",
    "upperArmL": "LeftArm", "upperArmR": "RightArm",
    "lowerArmL": "LeftForeArm", "lowerArmR": "RightForeArm",
    "handL": "LeftHand", "handR": "RightHand",
    "upperLegL": "LeftUpLeg", "upperLegR": "RightUpLeg",
    "lowerLegL": "LeftLeg", "lowerLegR": "RightLeg",
    "footL": "LeftFoot", "footR": "RightFoot",
}


def _slerp(q0, q1, t):
    q0 = qnormalize(q0)
    q1 = qnormalize(q1)
    d = np.sum(q0 * q1)
    if d < 0:
        q1 = -q1
        d = -d
    d = min(1.0, max(-1.0, d))
    if d > 0.9995:
        return qnormalize(q0 + t * (q1 - q0))
    th = np.arccos(d)
    s = np.sin(th)
    return (np.sin((1 - t) * th) / s) * q0 + (np.sin(t * th) / s) * q1


def resample_vec(times, vecs, fps=30):
    """Resample a VEC3 track to uniform fps (linear interp)."""
    times = np.asarray(times, dtype=np.float64).ravel()
    vecs = np.asarray(vecs, dtype=np.float64).reshape(-1, 3)
    if len(times) < 2:
        return times, vecs
    dur = times[-1] - times[0]
    if dur <= 1e-6:
        return np.array([times[0]]), vecs[:1]
    n = max(2, int(round(dur * fps)) + 1)
    tn = np.linspace(times[0], times[-1], n)
    out = np.zeros((n, 3))
    j = 0
    for i, t in enumerate(tn):
        while j + 1 < len(times) - 1 and times[j + 1] < t:
            j += 1
        t0, t1 = times[j], times[j + 1]
        f = 0.0 if t1 <= t0 else min(1.0, max(0.0, (t - t0) / (t1 - t0)))
        out[i] = vecs[j] * (1 - f) + vecs[j + 1] * f
    return tn, out


def resample_track(times, quats, fps=30):
    """Resample a rotation track to uniform fps. Returns (t_new, q_new)."""
    times = np.asarray(times, dtype=np.float64).ravel()
    quats = qnormalize(np.asarray(quats, dtype=np.float64).reshape(-1, 4))
    if len(times) < 2:
        return times, quats
    dur = times[-1] - times[0]
    if dur <= 1e-6:
        return np.array([times[0]]), quats[:1]
    n = max(2, int(round(dur * fps)) + 1)
    tn = np.linspace(times[0], times[-1], n)
    out = np.zeros((n, 4))
    j = 0
    for i, t in enumerate(tn):
        while j + 1 < len(times) - 1 and times[j + 1] < t:
            j += 1
        t0, t1 = times[j], times[j + 1]
        f = 0.0 if t1 <= t0 else (t - t0) / (t1 - t0)
        out[i] = _slerp(quats[j], quats[j + 1], min(1.0, max(0.0, f)))
    return tn, out


def _bone_frames(anim, skel, fps=30):
    """Resample all rotation tracks of an animation to uniform fps.

    Returns (times, {bone: quats[N,4]})."""
    tracks = {}
    for ch in anim["channels"]:
        if ch["path"] != "rotation":
            continue
        tracks[ch["bone"]] = (ch["times"], ch["values"].reshape(-1, 4))
    if not tracks:
        return np.zeros(0), {}
    dur = max(float(t[0][-1]) for t in tracks.values())
    n = max(2, int(round(dur * fps)) + 1)
    times = np.linspace(0, dur, n)
    out = {}
    for bone, (t, q) in tracks.items():
        _, qq = resample_track(t, q, fps)
        if len(qq) < n:
            pad = np.tile(qq[-1:], (n - len(qq), 1))
            qq = np.vstack([qq, pad])
        out[bone] = qq[:n]
    return times, out


def validate_clip(name, anim, skel, fps=30):
    """Full validation of one animation dict (from extract_animations).

    anim channels must target mixamorig: bone names (post-retarget)."""
    checks = {}
    times, bones = _bone_frames(anim, skel, fps)
    n = len(times)
    dur = float(times[-1]) if n else 0.0

    # ---- coverage ----
    have = set()
    for bone in bones:
        slot, _ = to_canonical(bone, "mixamo-colon")
        if slot in CORE_SLOTS:
            have.add(slot)
    cov = len(have) / len(CORE_SLOTS)
    checks["coverage"] = {
        "grade": "PASS" if cov >= 0.8 else ("WARN" if cov >= 0.5 else "FAIL"),
        "value": round(cov, 3),
        "missing": sorted(set(CORE_SLOTS) - have),
    }

    if n < 2:
        checks["sanity"] = {"grade": "FAIL", "value": 0,
                            "detail": "fewer than 2 frames"}
        return {"name": name, "duration": dur, "frames": n,
                "checks": checks, "overall": "FAIL"}

    # ---- sanity: NaN / norms / pops ----
    bad = 0
    pops = 0
    max_vel = 0.0
    dt = (times[-1] - times[0]) / max(1, n - 1)
    for bone, qq in bones.items():
        if not np.all(np.isfinite(qq)):
            bad += 1
            continue
        norms = np.sqrt(np.sum(qq ** 2, axis=1))
        if np.any(np.abs(norms - 1.0) > 0.05):
            bad += 1
        if n > 1:
            ang = qangle(qq[:-1], qq[1:]) / max(dt, 1e-6)
            max_vel = max(max_vel, float(np.max(ang)))
            pops += int(np.sum(ang > 20.0))
    checks["sanity"] = {
        "grade": "FAIL" if bad else ("WARN" if pops > n * 0.05 else "PASS"),
        "bad_tracks": bad, "pops": pops,
        "max_angvel_rad_s": round(max_vel, 2),
    }

    # ---- T-pose contamination ----
    core_bones = [from_canonical(s, TARGET_FAMILY) for s in CORE_SLOTS
                  if s != "Hips"]
    dist = np.zeros(n)
    cnt = 0
    for bone in core_bones:
        qq = bones.get(bone)
        if qq is None:
            continue
        rest = skel["rest_quat"][bone]
        dist += qangle(qq, np.tile(rest, (n, 1)))
        cnt += 1
    dist /= max(1, cnt)
    peak = float(np.max(dist))
    at_rest = dist < 0.06
    margin = max(1, n // 12)
    interior = at_rest.copy()
    interior[:margin] = False
    interior[-margin:] = False
    interior_frac = float(np.mean(interior)) if n else 0.0
    contaminated = interior_frac > 0.10 and peak > 0.5
    checks["tpose"] = {
        "grade": "FAIL" if contaminated else (
            "WARN" if interior_frac > 0.03 and peak > 0.5 else "PASS"),
        "interior_rest_frac": round(interior_frac, 3),
        "peak_motion_rad": round(peak, 3),
    }

    # ---- joint limits: knees + elbows hinge on one side ----
    jl_detail = {}
    jl_bad = 0
    for joint, label in [("mixamorig:LeftLeg", "kneeL"),
                         ("mixamorig:RightLeg", "kneeR"),
                         ("mixamorig:LeftForeArm", "elbowL"),
                         ("mixamorig:RightForeArm", "elbowR")]:
        qq = bones.get(joint)
        if qq is None:
            jl_detail[label] = "no track"
            continue
        rest = skel["rest_quat"][joint]
        rel = qmul(qinv(rest)[None, :], qnormalize(qq))
        w = np.clip(rel[:, 3], -1, 1)
        ang = 2 * np.arccos(np.abs(w))
        s = np.sqrt(np.maximum(1 - w ** 2, 1e-12))
        axis = rel[:, :3] / s[:, None]
        # hinge = dominant axis; quiet joints (<0.6 rad peak) skip the check
        # because near-zero motion has no stable hinge axis (false flips)
        dom = np.argmax(np.mean(np.abs(axis * ang[:, None]), axis=0))
        signed = (axis * ang[:, None])[:, dom]
        pos = float(np.max(signed))
        neg = float(np.min(signed))
        peak_j = max(abs(pos), abs(neg))
        if peak_j < 0.6:
            jl_detail[label] = {"max": round(pos, 3), "min": round(neg, 3),
                                "flip": False, "note": "quiet"}
        else:
            flip = pos > 0.45 and neg < -0.45
            jl_detail[label] = {"max": round(pos, 3), "min": round(neg, 3),
                                "flip": bool(flip)}
            if flip:
                jl_bad += 1
            elif pos > 0.3 and neg < -0.3:
                jl_detail[label]["warn"] = "mild both-ways bend"
    mild = sum(1 for d in jl_detail.values()
               if isinstance(d, dict) and d.get("warn"))
    checks["joints"] = {
        "grade": "FAIL" if jl_bad >= 2 else (
            "WARN" if (jl_bad or mild) else "PASS"),
        "detail": jl_detail,
    }

    # ---- foot skate (root-motion clips only) ----
    has_root = any(ch["path"] == "translation" and
                   ch["bone"] == "mixamorig:Hips" for ch in anim["channels"])
    root_track = next((ch for ch in anim["channels"]
                       if ch["path"] == "translation" and
                       ch["bone"] == "mixamorig:Hips"), None)
    skate = {"grade": "PASS", "skate_m_s": 0.0,
             "note": "in-place clip, no root motion"}
    if has_root:
        offsets = canonical_offsets(skel, "mixamo-colon")
        foot_bones = ["mixamorig:LeftFoot", "mixamorig:RightFoot"]
        step = max(1, n // 60)
        idx = list(range(0, n, step))
        prev = {}
        contact_t = 0.0
        skate_d = 0.0
        for k, fi in enumerate(idx):
            lq = {b: (bones[b][fi] if b in bones
                      else skel["rest_quat"][b]) for b in skel["names"]
                  if b in skel["rest_quat"]}
            rp = np.zeros(3)
            if root_track is not None:
                _, rv = resample_vec(root_track["times"],
                                     root_track["values"].reshape(-1, 3),
                                     fps)
                rp = rv[min(fi, len(rv) - 1)]
            wp = fk_canonical(skel, lq, offsets, rp)
            for fb in foot_bones:
                p = wp.get(fb)
                if p is None:
                    continue
                if k > 0 and fb in prev:
                    pp, py = prev[fb]
                    if py < 0.12:  # foot near ground -> contact
                        d = float(np.hypot(p[0] - pp[0], p[2] - pp[2]))
                        skate_d += d
                        contact_t += dt * step
                prev[fb] = (p.copy(), float(p[1]))
        rate = skate_d / max(contact_t, 1e-6)
        skate = {"grade": "FAIL" if rate > 1.2 else (
                 "WARN" if rate > 0.6 else "PASS"),
                 "skate_m_s": round(rate, 3)}
    checks["feet"] = skate

    order = {"FAIL": 3, "WARN": 2, "PASS": 1}
    overall = max(checks.values(), key=lambda c: order[c["grade"]])["grade"]
    return {"name": name, "duration": round(dur, 3), "frames": n,
            "checks": checks, "overall": overall}


def clip_from_bank(name, bank_clip, skel):
    """Convert a bank.json-style clip ({times, atk:{slot:[quats]}}) into an
    animation dict on the 58-bone target.

    Bake replicates the runtime exactly (motion-bank.ts bakeRole):
        out = targetRest * key
    so validation sees what the player sees.
    """
    times = np.asarray(bank_clip["times"], dtype=np.float64)
    channels = []
    role = bank_clip.get("atk", {})
    for slot, keys in role.items():
        canon = BANK_SLOT.get(slot)
        if not canon:
            continue
        bone = from_canonical(canon, TARGET_FAMILY)
        qT = skel["rest_quat"][bone]
        keys = qnormalize(np.asarray(keys, dtype=np.float64).reshape(-1, 4))
        out = qmul(qT[None, :], keys)
        channels.append({"node": -1, "bone": bone, "path": "rotation",
                         "times": times, "values": out, "interp": "LINEAR"})
    return {"name": name, "channels": channels}
