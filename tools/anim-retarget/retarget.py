#!/usr/bin/env python3
"""Universal animation retargeter: ANY skeleton -> 58-bone cast skeleton.

Usage:
    python3 retarget.py --src <clip.glb> --ref <cast58.glb> --out <out.glb>

Rest-pose-relative rotation transfer (same math as
src/game3d/universal-retarget.ts):
    out = targetRest * inv(sourceRest) * key
so clips authored on one rest pose land correctly on another — this is the
fix for T-pose contamination and ballerina limbs.

Multi-character sources (C4D wrestling rigs with _2/_3 suffixes) are split
into one animation per character: <anim>__p0, <anim>__p1, ...
"""
import argparse
import os
import sys
import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import (Glb, extract_animations, load_skeleton, write_glb,
                    qmul, qinv, qnormalize, IDENTITY_Q)
from skeletons import detect_family, to_canonical, from_canonical, CORE_SLOTS

TARGET_FAMILY = "mixamo-colon"


def _hips_height(skel, family):
    """Bind-pose height of the Hips joint (for root-motion scaling).

    Uses the node's parent-chain translation sum. For skeletons whose node
    offsets are non-anatomical (cast), returns None -> no scaling."""
    hips = None
    for nm in skel["names"]:
        slot, _ = to_canonical(nm, family)
        if slot == "Hips":
            hips = nm
            break
    if hips is None:
        return None
    y = 0.0
    i = skel["index"][hips]
    while i >= 0:
        y += skel["translation"][skel["names"][i]][1]
        i = skel["parent"][i]
    return y if y > 0.3 else None  # sanity: hips must be well above ground


def retarget_file(src_path, ref_skel, out_path=None):
    """Retarget all animations in src_path onto the reference skeleton.

    Returns (out_path, report dict).
    """
    glb = Glb(src_path)
    anims = extract_animations(glb)
    skel = load_skeleton(src_path)
    bone_names = [c["bone"] for a in anims for c in a["channels"]]
    family = detect_family(bone_names)

    report = {"src": src_path, "family": family, "animations": [],
              "unmapped_bones": sorted(set(
                  b for b in bone_names
                  if to_canonical(b, family)[0] is None))}

    if family == "unknown":
        report["error"] = "unknown skeleton family"
        return None, report

    # root-motion scale: source hips height -> target hips height.
    # Target (cast) node offsets are non-anatomical, so use the canonical
    # 0.95m hips height as the target reference.
    src_h = _hips_height(skel, family)
    pos_scale = (0.95 / src_h) if src_h else 1.0
    report["pos_scale"] = round(pos_scale, 4)

    # target skeleton nodes for the output GLB (reference hierarchy)
    tgt_nodes = []
    name_to_out = {}
    for i, nm in enumerate(ref_skel["names"]):
        name_to_out[nm] = len(tgt_nodes)
        tgt_nodes.append({
            "name": nm,
            "translation": ref_skel["translation"][nm],
            "rotation": ref_skel["rest_quat"][nm],
            "children": [],
        })
    for i, nm in enumerate(ref_skel["names"]):
        p = ref_skel["parent"][i]
        if p >= 0:
            tgt_nodes[name_to_out[ref_skel["names"][p]]]["children"].append(
                name_to_out[nm])

    out_anims = []
    for anim in anims:
        # group channels per character
        chars = {}
        for ch in anim["channels"]:
            slot, ci = to_canonical(ch["bone"], family)
            if slot is None:
                continue
            chars.setdefault(ci, []).append((ch, slot))
        if not chars:
            report["animations"].append(
                {"name": anim["name"], "error": "no mappable channels"})
            continue
        for ci in sorted(chars):
            tracks = []
            mapped_core = set()
            for ch, slot in chars[ci]:
                tgt_bone = from_canonical(slot, TARGET_FAMILY)
                if tgt_bone not in name_to_out:
                    continue
                node = name_to_out[tgt_bone]
                if ch["path"] == "rotation":
                    qS = skel["rest_quat"].get(ch["bone"], IDENTITY_Q)
                    qT = ref_skel["rest_quat"][tgt_bone]
                    inv = qinv(qS)
                    keys = qnormalize(ch["values"].reshape(-1, 4))
                    # out = qT * inv(qS) * key   (vectorized)
                    rel = qmul(inv[None, :], keys)
                    outv = qmul(qT[None, :], rel)
                    tracks.append({"node": node, "path": "rotation",
                                   "times": ch["times"],
                                   "values": outv.astype(np.float32),
                                   "interp": ch["interp"]})
                elif ch["path"] == "translation" and slot == "Hips":
                    # root motion only; scaled to target proportions
                    outv = ch["values"].reshape(-1, 3) * pos_scale
                    tracks.append({"node": node, "path": "translation",
                                   "times": ch["times"],
                                   "values": outv.astype(np.float32),
                                   "interp": ch["interp"]})
                # scale tracks: skipped (unused by all sources)
                if slot in CORE_SLOTS:
                    mapped_core.add(slot)
            if not tracks:
                continue
            cname = anim["name"] if len(chars) == 1 else f"{anim['name']}__p{ci}"
            out_anims.append({"name": cname, "channels": tracks})
            report["animations"].append({
                "name": cname, "char": ci,
                "tracks": len(tracks),
                "core_coverage": round(len(mapped_core) / len(CORE_SLOTS), 3),
                "duration": float(max(
                    (float(t["times"][-1]) for t in tracks
                     if len(t["times"])), default=0)),
            })

    if out_anims and out_path:
        write_glb(out_path, tgt_nodes, out_anims)
        return out_path, report
    if not out_anims:
        report["error"] = "no retargetable animations produced"
    return None, report


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--src", required=True)
    ap.add_argument("--ref", required=True,
                    help="reference 58-bone cast GLB")
    ap.add_argument("--out", required=True)
    a = ap.parse_args()
    ref = load_skeleton(a.ref)
    out, rep = retarget_file(a.src, ref, a.out)
    import json
    print(json.dumps(rep, indent=1))
    if out:
        print("wrote", out)


if __name__ == "__main__":
    main()
