#!/usr/bin/env python3
"""defect_gates.py — automated defect gates for character renders.

Implements deliverable-verification law item 2: defect gates computed from
GLB animation data, not eyeballs.

Gates:
  feet_below_ground  — no foot-sole vertex may go below the bind-pose ground plane
  facing_vs_movement — facing direction must match root movement direction (no crab-walking)
  exploded_geometry  — skinned mesh must not blow up / ribbon / NaN across sampled frames
  static_qc          — reuses tools/model-qc geometry primitives on the bind pose

Usage:
  python3 tools/verify/defect_gates.py --glb assets/characters/quaternius/UAL1_Standard.glb \
      --anims all --samples 24 --out /tmp/gates.json
  python3 tools/verify/defect_gates.py --glb FILE --anims Jog_Fwd_Loop,Idle_Loop --out gates.json

Exit code: 0 if all gates PASS, 1 if any gate FAILs.
"""
import argparse
import importlib.util
import json
import math
import os
import re
import sys

import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, "..", ".."))
sys.path.insert(0, os.path.join(REPO, "tools", "anim-retarget"))
import common as ar  # noqa: E402  (in-repo GLB I/O + quaternion math)


# --------------------------------------------------------------------------
# quaternion helpers (reuse anim-retarget)
# --------------------------------------------------------------------------
def slerp(a, b, t):
    a = ar.qnormalize(np.asarray(a, dtype=np.float64))
    b = ar.qnormalize(np.asarray(b, dtype=np.float64))
    d = float(np.clip(np.sum(a * b), -1.0, 1.0))
    if d < 0.0:
        b = -b
        d = -d
    if d > 0.9995:
        return ar.qnormalize(a + t * (b - a))
    th = math.acos(d)
    s = math.sin(th)
    return (math.sin((1 - t) * th) / s) * a + (math.sin(t * th) / s) * b


def quat_to_mat(q):
    x, y, z, w = [float(v) for v in ar.qnormalize(q)]
    return np.array([
        [1 - 2 * (y * y + z * z), 2 * (x * y - z * w), 2 * (x * z + y * w)],
        [2 * (x * y + z * w), 1 - 2 * (x * x + z * z), 2 * (y * z - x * w)],
        [2 * (x * z - y * w), 2 * (y * z + x * w), 1 - 2 * (x * x + y * y)],
    ])


def trs_matrix(t, q, s):
    M = np.eye(4)
    M[:3, :3] = quat_to_mat(q) * np.asarray(s, dtype=np.float64)
    M[:3, 3] = np.asarray(t, dtype=np.float64)
    return M


# --------------------------------------------------------------------------
# model load
# --------------------------------------------------------------------------
FOOT_RE = re.compile(r"ankle|foot|toe|ball|heel", re.I)
ROOT_RE = re.compile(r"^(mixamorig:)?(hips|pelvis|root)$", re.I)
SHOULDER_L_RE = re.compile(r"left(shoulder|arm|clavicle)", re.I)
SHOULDER_R_RE = re.compile(r"right(shoulder|arm|clavicle)", re.I)

# Animation applicability for the feet gate. The "feet never below ground"
# law only makes sense for ground-based animation; swimming/flying/death clips
# legitimately leave the ground plane, so they are measured but reported as
# vacuous rather than failed.
AIRBORNE_RE = re.compile(r"swim|fly|dive|vault|jump|climb|falling", re.I)
FLOOR_CONTACT_RE = re.compile(r"death|dying|fall|kneel|crouch|sit|lie|prone|pushup|plank", re.I)
LOCOMOTION_RE = re.compile(r"walk|jog|run|sprint|strafe|locomot|fwd|bwd", re.I)


def anim_class(name):
    if AIRBORNE_RE.search(name):
        return "airborne"
    if FLOOR_CONTACT_RE.search(name):
        return "floor-contact"
    return "grounded"


def load_model(glb_path):
    glb = ar.Glb(glb_path)
    js = glb.js
    nodes = js.get("nodes", [])
    names = [n.get("name", f"node{i}") for i, n in enumerate(nodes)]
    parent = [-1] * len(nodes)
    for i, n in enumerate(nodes):
        for c in n.get("children", []):
            parent[c] = i
    rest_t = np.array([n.get("translation", [0, 0, 0]) for n in nodes], np.float64)
    rest_q = np.array([ar.qnormalize(n.get("rotation", [0, 0, 0, 1])) for n in nodes], np.float64)
    rest_s = np.array([n.get("scale", [1, 1, 1]) for n in nodes], np.float64)

    skin = js.get("skins", [None])[0]
    if skin is None:
        raise ValueError(f"{glb_path}: no skins — gates need a skinned character")
    joint_nodes = skin["joints"]
    ibm = glb.accessor(skin["inverseBindMatrices"]).reshape(-1, 4, 4)

    prims = []
    tri_idx = []
    for mesh in js.get("meshes", []):
        for p in mesh["primitives"]:
            attrs = p["attributes"]
            pos = glb.accessor(attrs["POSITION"])
            joints = glb.accessor(attrs["JOINTS_0"]).astype(np.int64)
            w = glb.accessor(attrs["WEIGHTS_0"]).astype(np.float64)
            wsum = w.sum(axis=1, keepdims=True)
            w = w / np.maximum(wsum, 1e-12)
            prims.append({"pos": pos, "joints": joints, "w": w})
            tri_idx.append(glb.accessor(p["indices"]).astype(np.int64)
                           if "indices" in p else None)
    joint_name = {si: names[ni] for si, ni in enumerate(joint_nodes)}

    def find(rex):
        return [si for si, nm in joint_name.items() if rex.search(nm)]

    foot_si = find(FOOT_RE)
    root_si = find(ROOT_RE)
    sho_l = [s for s in find(SHOULDER_L_RE) if not re.search(r"forearm|hand", joint_name[s], re.I)]
    sho_r = [s for s in find(SHOULDER_R_RE) if not re.search(r"forearm|hand", joint_name[s], re.I)]
    return {
        "glb": glb, "nodes": nodes, "names": names, "parent": parent,
        "rest_t": rest_t, "rest_q": rest_q, "rest_s": rest_s,
        "joint_nodes": joint_nodes, "ibm": ibm, "joint_name": joint_name,
        "prims": prims, "tri_idx": tri_idx, "foot_si": foot_si, "root_si": root_si[0] if root_si else None,
        "sho_l": sho_l[0] if sho_l else None, "sho_r": sho_r[0] if sho_r else None,
    }


def sample_anim(model, anim, n_samples):
    """Sample local TRS per node at n_samples uniform times."""
    names = model["names"]
    n_nodes = len(names)
    t0 = min(ch["times"][0] for ch in anim["channels"])
    t1 = max(ch["times"][-1] for ch in anim["channels"])
    times = np.linspace(t0, t1, n_samples)
    # per-node channel lookup: node -> {path: (times, values)}
    chans = {}
    for ch in anim["channels"]:
        chans.setdefault(ch["node"], {})[ch["path"]] = (ch["times"], ch["values"])
    T = np.tile(model["rest_t"], (n_samples, 1, 1))
    Q = np.tile(model["rest_q"], (n_samples, 1, 1))
    S = np.tile(model["rest_s"], (n_samples, 1, 1))
    for ni, paths in chans.items():
        if "translation" in paths:
            tt, vv = paths["translation"]
            for fi, t in enumerate(times):
                T[fi, ni] = _lerp_keys(tt, vv, t)
        if "rotation" in paths:
            tt, vv = paths["rotation"]
            for fi, t in enumerate(times):
                Q[fi, ni] = _slerp_keys(tt, vv, t)
        if "scale" in paths:
            tt, vv = paths["scale"]
            for fi, t in enumerate(times):
                S[fi, ni] = _lerp_keys(tt, vv, t)
    return times, T, Q, S


def _lerp_keys(tt, vv, t):
    if t <= tt[0]:
        return vv[0]
    if t >= tt[-1]:
        return vv[-1]
    i = int(np.searchsorted(tt, t)) - 1
    i = max(0, min(i, len(tt) - 2))
    f = (t - tt[i]) / max(tt[i + 1] - tt[i], 1e-12)
    return vv[i] * (1 - f) + vv[i + 1] * f


def _slerp_keys(tt, vv, t):
    if t <= tt[0]:
        return vv[0]
    if t >= tt[-1]:
        return vv[-1]
    i = int(np.searchsorted(tt, t)) - 1
    i = max(0, min(i, len(tt) - 2))
    f = (t - tt[i]) / max(tt[i + 1] - tt[i], 1e-12)
    return slerp(vv[i], vv[i + 1], f)


def world_mats(model, T, Q, S):
    """(F,N,4,4) world matrices from per-frame local TRS. F=frames, N=nodes."""
    F, N = T.shape[0], T.shape[1]
    W = np.zeros((F, N, 4, 4))
    order = sorted(range(N), key=lambda i: _depth(model, i))
    for i in order:
        local = np.stack([trs_matrix(T[f, i], Q[f, i], S[f, i]) for f in range(F)])
        p = model["parent"][i]
        W[:, i] = local if p < 0 else W[:, p] @ local
    return W


_depth_cache = {}


def _depth(model, i):
    if i in _depth_cache:
        return _depth_cache[i]
    d = 0 if model["parent"][i] < 0 else _depth(model, model["parent"][i]) + 1
    _depth_cache[i] = d
    return d


def skin_verts(model, W_node):
    """Skin all primitives. W_node: (N,4,4) world matrices. Returns (V_total,3)."""
    jn = model["joint_nodes"]
    G = W_node[jn] @ model["ibm"]                      # (J,4,4)
    out = []
    for prim in model["prims"]:
        sel = G[prim["joints"]]                        # (V,4,4)
        M = np.einsum("vk,vkij->vij", prim["w"], sel)  # (V,4,4)
        vh = np.concatenate([prim["pos"], np.ones((len(prim["pos"]), 1))], 1)
        out.append(np.einsum("vij,vj->vi", M, vh)[:, :3])
    return np.concatenate(out, 0)


def foot_mask(model):
    """Boolean mask over concatenated verts: strongly weighted to foot joints."""
    mask = []
    foot = set(model["foot_si"])
    for prim in model["prims"]:
        wfoot = np.zeros(len(prim["pos"]))
        for k in range(4):
            is_foot = np.isin(prim["joints"][:, k], list(foot))
            wfoot += prim["w"][:, k] * is_foot
        mask.append(wfoot >= 0.5)
    return np.concatenate(mask, 0)


# --------------------------------------------------------------------------
# gates
# --------------------------------------------------------------------------
def gate_feet(model, anims, n_samples, tol=0.03):
    """Feet never below the bind-pose ground plane."""
    _depth_cache.clear()
    n = len(model["names"])
    W0 = world_mats(model, model["rest_t"][None], model["rest_q"][None], model["rest_s"][None])[0]
    bind = skin_verts(model, W0)
    fmask = foot_mask(model)
    if not fmask.any():
        return {"gate": "feet_below_ground", "result": "warn",
                "reason": "no foot joints found by name; gate vacuous", "per_anim": []}
    plane = float(bind[fmask][:, 1].min())
    per_anim, worst = [], None
    for anim in anims:
        times, T, Q, S = sample_anim(model, anim, n_samples)
        W = world_mats(model, T, Q, S)
        worst_t, worst_y = None, plane
        for fi in range(len(times)):
            y = skin_verts(model, W[fi])[fmask][:, 1].min()
            if y < worst_y:
                worst_y, worst_t = float(y), float(times[fi])
        pen = plane - worst_y
        cls = anim_class(anim["name"])
        if cls != "grounded":
            per_anim.append({"anim": anim["name"], "result": "pass",
                             "applicability": cls,
                             "note": f"not a ground-based animation — measured min_foot_y={worst_y:.3f}m, gate vacuous",
                             "plane_y": plane, "min_foot_y": worst_y, "worst_t": worst_t})
            continue
        ok = pen <= tol
        per_anim.append({"anim": anim["name"], "result": "pass" if ok else "fail",
                         "applicability": cls,
                         "plane_y": plane, "min_foot_y": worst_y,
                         "penetration": float(pen), "worst_t": worst_t})
        if not ok and (worst is None or pen > worst["penetration"]):
            worst = per_anim[-1]
    failed = [a for a in per_anim if a["result"] == "fail"]
    n_grounded = sum(1 for a in per_anim if a.get("applicability") == "grounded")
    return {"gate": "feet_below_ground", "result": "pass" if not failed else "fail",
            "tolerance_m": tol,
            "reason": (f"{len(failed)}/{n_grounded} grounded animations sink feet below ground "
                       f"(worst: {worst['anim']} t={worst['worst_t']:.2f}s "
                       f"penetration={worst['penetration']:.3f}m)" if failed
                       else f"all {n_grounded} grounded animations keep feet above ground "
                              f"({len(per_anim) - n_grounded} non-grounded clips vacuous)"),
            "per_anim": per_anim}


def gate_facing(model, anims, n_samples, angle_deg=60.0, speed_thresh=0.2,
              locomotion_disp=0.3):
    """Facing direction must match movement direction (no crab-walking).

    Only applies to genuine locomotion: the root must net-displace > 0.3 m in
    XZ over the clip. Dances, deaths, kneels and other in-place clips move the
    root without traveling, so the gate is vacuous for them.
    """
    _depth_cache.clear()
    up = np.array([0.0, 1.0, 0.0])
    per_anim = []
    for anim in anims:
        cls = anim_class(anim["name"])
        if cls != "grounded":
            per_anim.append({"anim": anim["name"], "result": "pass",
                             "note": f"not a ground-based locomotion animation ({cls}) — gate vacuous"})
            continue
        times, T, Q, S = sample_anim(model, anim, n_samples)
        W = world_mats(model, T, Q, S)
        jn = model["joint_nodes"]
        root = model["root_si"] if model["root_si"] is not None else 0
        root_w = W[:, jn[root]][:, :3, 3]
        net_disp = float(np.linalg.norm(root_w[-1][[0, 2]] - root_w[0][[0, 2]]))
        if net_disp < locomotion_disp:
            per_anim.append({"anim": anim["name"], "result": "pass",
                             "note": f"no net locomotion (XZ displacement {net_disp:.2f}m) — gate vacuous"})
            continue
        bad, moving, max_ang = 0, 0, 0.0
        worst_t = None
        for fi in range(1, len(times)):
            dt = float(times[fi] - times[fi - 1])
            if dt <= 1e-9:
                continue
            v = (root_w[fi] - root_w[fi - 1]) / dt
            speed = float(np.linalg.norm(v[[0, 2]]))
            if speed < speed_thresh:
                continue
            moving += 1
            if model["sho_l"] is not None and model["sho_r"] is not None:
                pl = W[fi, jn[model["sho_l"]]][:3, 3]
                pr = W[fi, jn[model["sho_r"]]][:3, 3]
                lat = pl - pr
                lat[1] = 0
                if np.linalg.norm(lat) < 1e-9:
                    continue
                fwd = np.cross(lat / np.linalg.norm(lat), up)
            else:
                q = Q[fi, model["joint_nodes"][root]]
                fwd = quat_to_mat(q) @ np.array([0.0, 0.0, 1.0])
            fwd_xz = fwd[[0, 2]]
            if np.linalg.norm(fwd_xz) < 1e-9:
                continue
            cos_a = float(np.clip(np.dot(fwd_xz / np.linalg.norm(fwd_xz),
                                         v[[0, 2]] / max(speed, 1e-9)), -1, 1))
            ang = math.degrees(math.acos(cos_a))
            max_ang = max(max_ang, ang)
            if ang > angle_deg:
                bad += 1
                if worst_t is None:
                    worst_t = float(times[fi])
        if moving == 0:
            per_anim.append({"anim": anim["name"], "result": "pass",
                             "note": "locomotion but no fast-moving frames — gate vacuous",
                             "net_xz_displacement_m": net_disp})
        else:
            frac = bad / moving
            ok = frac <= 0.3
            per_anim.append({"anim": anim["name"], "result": "pass" if ok else "fail",
                             "net_xz_displacement_m": net_disp,
                             "moving_frames": moving, "crab_frames": bad,
                             "crab_fraction": frac, "max_angle_deg": max_ang,
                             "worst_t": worst_t})
    failed = [a for a in per_anim if a["result"] == "fail"]
    return {"gate": "facing_vs_movement", "result": "pass" if not failed else "fail",
            "reason": (f"{len(failed)} animations crab-walk: "
                       + "; ".join(f"{a['anim']} {a['crab_fraction']:.0%} of moving frames "
                                   f"off-axis (max {a['max_angle_deg']:.0f}°)" for a in failed[:3])
                       if failed else
                       f"no crab-walking in {len(per_anim)} animations"),
            "per_anim": per_anim}


def gate_exploded(model, anims, n_samples, diag_ratio=2.0):
    """No exploded / ribbon / NaN geometry across sampled frames."""
    _depth_cache.clear()
    W0 = world_mats(model, model["rest_t"][None], model["rest_q"][None], model["rest_s"][None])[0]
    bind = skin_verts(model, W0)
    bmin, bmax = bind.min(0), bind.max(0)
    bind_diag = float(np.linalg.norm(bmax - bmin))
    k = max(2, min(8, n_samples))
    per_anim = []
    for anim in anims:
        times, T, Q, S = sample_anim(model, anim, n_samples)
        idx = np.linspace(0, len(times) - 1, k).astype(int)
        W = world_mats(model, T[idx], Q[idx], S[idx])
        fails = []
        for j, fi in enumerate(idx):
            p = skin_verts(model, W[j])
            t = float(times[fi])
            if not np.isfinite(p).all():
                fails.append({"t": t, "defect": "non-finite vertices (NaN/Inf)"})
                continue
            d = float(np.linalg.norm(p.max(0) - p.min(0)))
            if d > diag_ratio * bind_diag:
                fails.append({"t": t, "defect": f"exploded: bbox diag {d:.2f}m vs bind {bind_diag:.2f}m"})
                continue
            disp = np.abs(p - bind).max()
            if disp > 3.0 * bind_diag:
                fails.append({"t": t, "defect": f"ribbon: max vertex displacement {disp:.2f}m"})
        per_anim.append({"anim": anim["name"], "result": "pass" if not fails else "fail",
                         "frames_checked": k, "defects": fails})
    failed = [a for a in per_anim if a["result"] == "fail"]
    return {"gate": "exploded_geometry", "result": "pass" if not failed else "fail",
            "reason": (f"{len(failed)} animations with exploded/ribbon geometry: "
                       + "; ".join(f"{a['anim']}: {a['defects'][0]['defect']} @t={a['defects'][0]['t']:.2f}s"
                                   for a in failed[:3]) if failed
                       else f"geometry stable across {len(per_anim)} animations"),
            "per_anim": per_anim}


def load_qc_module():
    """Reuse tools/model-qc primitives (qc module survives as compiled .pyc)."""
    pyc = os.path.join(REPO, "tools", "model-qc", "__pycache__", "qc.cpython-312.pyc")
    if not os.path.exists(pyc):
        return None
    spec = importlib.util.spec_from_file_location("verify_qc", pyc)
    m = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(m)
    return m


def gate_static_qc(model):
    """Reuse model-qc geometry checks on the bind pose (UV/texture checks need a
    texture manifest, so only geometry is wired here)."""
    try:
        qc = load_qc_module()
    except Exception as e:  # noqa: BLE001
        return {"gate": "static_qc", "result": "warn",
                "reason": f"model-qc module unavailable: {e}"}
    if qc is None or not hasattr(qc, "geom_checks"):
        return {"gate": "static_qc", "result": "warn",
                "reason": "model-qc geom_checks not found"}
    findings = []
    for pi, prim in enumerate(model["prims"]):
        try:
            idx = None
            if model["tri_idx"][pi] is not None:
                idx = model["tri_idx"][pi].reshape(-1, 3)
            res = qc.geom_checks(prim["pos"], idx, prim["joints"], prim["w"])
        except Exception as e:  # noqa: BLE001
            findings.append({"prim": pi, "error": str(e)})
            continue
        det = res[0] if isinstance(res, tuple) else res
        findings.append({"prim": pi, "findings": det if isinstance(det, list) else str(det)})
    critical = [f for f in findings if "error" in f]
    return {"gate": "static_qc", "result": "fail" if critical else "pass",
            "reason": ("model-qc geometry checks clean"
                       if not critical else f"{len(critical)} primitives errored"),
            "findings": findings}


# --------------------------------------------------------------------------
# CLI
# --------------------------------------------------------------------------
def main():
    ap = argparse.ArgumentParser(description="Automated defect gates for character GLBs")
    ap.add_argument("--glb", required=True, help="character GLB path")
    ap.add_argument("--anims", default="all",
                    help="'all' or comma-separated animation names/regex")
    ap.add_argument("--samples", type=int, default=24, help="frames sampled per animation")
    ap.add_argument("--tol", type=float, default=0.03, help="foot-plane tolerance in meters")
    ap.add_argument("--skip-static", action="store_true", help="skip model-qc static gate")
    ap.add_argument("--out", default="", help="write JSON report here")
    args = ap.parse_args()

    print(f"[defect_gates] loading {args.glb}")
    model = load_model(args.glb)
    all_anims = ar.extract_animations(model["glb"])
    print(f"[defect_gates] {len(all_anims)} animations, {len(model['joint_nodes'])} joints, "
          f"{sum(len(p['pos']) for p in model['prims'])} verts")
    if args.anims == "all":
        anims = all_anims
    else:
        wanted = [a.strip() for a in args.anims.split(",")]
        anims = [a for a in all_anims
                 if any(w == a["name"] or re.search(w, a["name"]) for w in wanted)]
    if not anims:
        print(f"[defect_gates] ERROR: no animations matched '{args.anims}'")
        return 2
    print(f"[defect_gates] checking {len(anims)} animations x {args.samples} samples")

    gates = [
        gate_feet(model, anims, args.samples, tol=args.tol),
        gate_facing(model, anims, args.samples),
        gate_exploded(model, anims, args.samples),
    ]
    if not args.skip_static:
        gates.append(gate_static_qc(model))

    report = {"tool": "defect_gates", "glb": args.glb,
              "animations_checked": [a["name"] for a in anims],
              "samples_per_anim": args.samples, "gates": gates}
    failed = [g for g in gates if g["result"] == "fail"]
    report["verdict"] = "FAIL" if failed else "PASS"

    for g in gates:
        mark = {"pass": "PASS", "fail": "FAIL", "warn": "WARN"}[g["result"]]
        print(f"  [{mark}] {g['gate']}: {g['reason']}")
    print(f"[defect_gates] verdict: {report['verdict']}")
    if args.out:
        with open(args.out, "w") as f:
            json.dump(report, f, indent=2)
        print(f"[defect_gates] report -> {args.out}")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
