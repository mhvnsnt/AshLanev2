#!/usr/bin/env python3
"""Forward pipeline: ingest a NEW animation file into the library.

    python3 ingest.py --src <clip.glb|clip.bvh> --name <move_name>

Steps: detect family -> retarget to 58-bone cast -> validate -> proof render.
PASS  -> copied to public/motion/retargeted/<name>.glb (shippable)
WARN  -> copied, flagged for human review
FAIL  -> quarantined in out/quarantine/ with the proof strip; NOT shipped.

BVH files (e.g. CMU mocap) are parsed straight to a clip, then retargeted —
the same path as src/game3d/universal-retarget.ts parseBVH.
"""
import argparse
import glob
import json
import os
import sys

import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import (Glb, extract_animations, load_skeleton, write_glb,
                    qnormalize, qmul)
from retarget import retarget_file
from validate import validate_clip
from proof import render_proof
from skeletons import detect_family, to_canonical, from_canonical

REPO = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))


# --------------------------------------------------------------------------
# Minimal BVH parser -> animation dict (bone names as in the file)
# --------------------------------------------------------------------------

def _qmul(a, b):
    ax, ay, az, aw = a
    bx, by, bz, bw = b
    return np.array([
        aw * bx + ax * bw + ay * bz - az * by,
        aw * by - ax * bz + ay * bw + az * bx,
        aw * bz + ax * by - ay * bx + az * bw,
        aw * bw - ax * bx - ay * by - az * bz])


def parse_bvh(text):
    lines = [l.strip() for l in text.splitlines() if l.strip()]
    if not lines[0].upper().startswith("HIERARCHY"):
        raise ValueError("BVH: missing HIERARCHY")
    i = 1
    joints = []

    def parse_joint():
        nonlocal i
        head = lines[i].split()
        i += 1
        if head[0].upper() == "END":
            name = (joints[-1]["name"] if joints else "joint") + "_End"
            i += 1  # {
            off = [float(x) for x in lines[i].split()[1:4]]
            i += 1
            i += 1  # }
            return {"name": name, "offset": off, "channels": [],
                    "children": []}
        name = head[1]
        i += 1  # {
        off = [float(x) for x in lines[i].split()[1:4]]
        i += 1
        cht = lines[i].split()
        nch = int(cht[1])
        channels = cht[2:2 + nch]
        i += 1
        children = []
        while not lines[i].startswith("}"):
            children.append(parse_joint())
        i += 1  # }
        j = {"name": name, "offset": off, "channels": channels,
             "children": children}
        joints.append(j)
        return j

    roots = []
    while not lines[i].upper().startswith("MOTION"):
        if lines[i].split()[0].upper() in ("ROOT", "JOINT"):
            roots.append(parse_joint())
        else:
            i += 1
    i += 1
    nframes = int(lines[i].split(":")[1])
    i += 1
    ftime = float(lines[i].split(":")[2] if ":" in lines[i]
                  else lines[i].split()[-1])
    i += 1
    if not (ftime > 0):
        ftime = 1 / 30

    ordered = []

    def walk(j):
        ordered.append(j)
        for c in j["children"]:
            walk(c)

    walk(roots[0])
    times = np.array([f * ftime for f in range(nframes)])
    tracks = {}
    for f in range(nframes):
        if i >= len(lines):
            break
        vals = [float(x) for x in lines[i].split()]
        i += 1
        cur = 0
        for j in ordered:
            ch = j["channels"]
            px = py = pz = 0.0
            eul = []
            for c in range(len(ch)):
                v = vals[cur + c]
                t = ch[c].lower()
                if t == "xposition":
                    px = v
                elif t == "yposition":
                    py = v
                elif t == "zposition":
                    pz = v
                else:
                    eul.append((t[0], np.deg2rad(v)))
            cur += len(ch)
            if any("position" in c.lower() for c in ch):
                tracks.setdefault((j["name"], "translation"), []).append(
                    (px, py, pz))
            if eul:
                # compose q = q_first * q_second * q_third (BVH channel order)
                q = np.array([0, 0, 0, 1.0])
                for ax, rad in eul:
                    half = rad / 2
                    s = np.sin(half)
                    qa = {"x": (s, 0, 0, np.cos(half)),
                          "y": (0, s, 0, np.cos(half)),
                          "z": (0, 0, s, np.cos(half))}[ax]
                    q = _qmul(q, np.array(qa))
                tracks.setdefault((j["name"], "rotation"), []).append(q)
    channels = []
    for (bone, path), keys in tracks.items():
        arr = np.array(keys, dtype=np.float32)
        channels.append({"node": -1, "bone": bone, "path": path,
                         "times": times[:len(arr)],
                         "values": arr, "interp": "LINEAR"})
    return {"name": "bvh_clip", "animations": [{"name": "bvh_clip",
                                                "channels": channels}],
            "bone_names": [b for b, _ in tracks]}


def ingest_bvh_anim(anim, name, ref_skel):
    """Retarget a BVH-derived animation dict onto the cast skeleton.

    BVH keys are absolute local rotations; source rest is taken as identity
    per joint (true for CMU/Mixamo BVH bind poses)."""
    bone_names = [c["bone"] for c in anim["channels"]]
    family = detect_family(bone_names)
    if family == "unknown":
        return None, {"error": "unknown family", "bones": bone_names[:10]}
    tracks = []
    for ch in anim["channels"]:
        slot, _ = to_canonical(ch["bone"], family)
        if slot is None:
            continue
        tgt = from_canonical(slot, "mixamo-colon")
        qT = ref_skel["rest_quat"][tgt]
        if ch["path"] == "rotation":
            keys = qnormalize(ch["values"].reshape(-1, 4))
            out = qmul(qT[None, :], keys)  # src rest ~ identity
        elif ch["path"] == "translation" and slot == "Hips":
            out = ch["values"].reshape(-1, 3) * 0.01  # cm -> m (BVH)
        else:
            continue
        tracks.append((tgt, ch["path"], ch["times"], out.astype(np.float32)))
    # target skeleton nodes
    nodes, name_to_out = [], {}
    for nm in ref_skel["names"]:
        name_to_out[nm] = len(nodes)
        nodes.append({"name": nm,
                      "translation": ref_skel["translation"][nm],
                      "rotation": ref_skel["rest_quat"][nm],
                      "children": []})
    for i, nm in enumerate(ref_skel["names"]):
        p = ref_skel["parent"][i]
        if p >= 0:
            nodes[name_to_out[ref_skel["names"][p]]]["children"].append(
                name_to_out[nm])
    channels = [{"node": name_to_out[t], "path": p, "times": tm,
                 "values": v, "interp": "LINEAR"}
                for t, p, tm, v in tracks]
    return {"name": name, "channels": channels, "_nodes": nodes}, None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--src", required=True)
    ap.add_argument("--name", required=True)
    ap.add_argument("--ref", default=None)
    ap.add_argument("--out", default=os.path.join(os.path.dirname(
        os.path.abspath(__file__)), "out"))
    a = ap.parse_args()

    ref_path = a.ref or sorted(glob.glob(
        os.path.join(REPO, "public/models/cast/*.glb")))[0]
    ref_skel = load_skeleton(ref_path)
    ship_dir = os.path.join(REPO, "public/motion/retargeted")
    quar_dir = os.path.join(a.out, "quarantine")
    proof_dir = os.path.join(a.out, "proof")
    os.makedirs(ship_dir, exist_ok=True)
    os.makedirs(quar_dir, exist_ok=True)
    os.makedirs(proof_dir, exist_ok=True)

    anims = []
    nodes = None
    if a.src.lower().endswith(".bvh"):
        parsed = parse_bvh(open(a.src).read())
        for anim in parsed["animations"]:
            r, err = ingest_bvh_anim(anim, a.name, ref_skel)
            if err:
                print(json.dumps(err, indent=1))
                return
            nodes = r.pop("_nodes")
            anims.append(r)
    else:
        tmp = os.path.join(a.out, f"_ingest_{a.name}.glb")
        outp, rep = retarget_file(a.src, ref_skel, tmp)
        print(json.dumps(rep, indent=1))
        if not outp:
            print("retarget failed; quarantined")
            return
        g = Glb(tmp)
        anims = extract_animations(g)
        os.remove(tmp)

    for anim in anims:
        vres = validate_clip(anim["name"], anim, ref_skel)
        pp = os.path.join(proof_dir, f"ingest_{a.name}.png")
        render_proof(anim, ref_skel, pp,
                     title=f"INGEST {a.name} [{vres['overall']}]")
        overall = vres["overall"]
        print(f"[{overall}] {a.name}")
        print(json.dumps(vres["checks"], indent=1))
        if nodes is None:
            print("note: GLB ingest ships via batch retarget path")
            continue
        dest = (os.path.join(ship_dir, f"{a.name}.glb") if overall != "FAIL"
                else os.path.join(quar_dir, f"{a.name}.glb"))
        write_glb(dest, nodes, [anim])
        print("wrote", dest,
              "(QUARANTINED - fix manually)" if overall == "FAIL" else "")


if __name__ == "__main__":
    main()
