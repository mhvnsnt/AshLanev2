#!/usr/bin/env python3
"""Batch-run the whole animation library through retarget + validate + proof.

    python3 batch.py [--ref <cast58.glb>] [--out <dir>]

Inputs:
  public/motion/wrestling/*.glb  -> retargeted (new capability), validated
  public/motion/ual/*.glb        -> validated (runtime path exists)
  public/motion/bank.json        -> validated (runtime bake path exists)
  public/motion/cmu-bank.json    -> validated

Outputs:
  public/motion/retargeted/*.glb - retargeted wrestling clips (shippable)
  out/proof/*.png                - stick-figure proof strips
  out/report.json / out/REPORT.md
"""
import argparse
import glob
import json
import os
import sys
import traceback

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import Glb, extract_animations, load_skeleton
from retarget import retarget_file
from validate import validate_clip, clip_from_bank
from proof import render_proof

REPO = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))


def _safe(name):
    return "".join(c if (c.isalnum() or c in "-_") else "_" for c in name)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--ref", default=None)
    ap.add_argument("--out", default=os.path.join(os.path.dirname(
        os.path.abspath(__file__)), "out"))
    a = ap.parse_args()

    ref_path = a.ref or sorted(glob.glob(
        os.path.join(REPO, "public/models/cast/*.glb")))[0]
    print("reference:", ref_path, flush=True)
    ref_skel = load_skeleton(ref_path)

    out = a.out
    proof_dir = os.path.join(out, "proof")
    retarget_dir = os.path.join(REPO, "public/motion/retargeted")
    os.makedirs(proof_dir, exist_ok=True)
    os.makedirs(retarget_dir, exist_ok=True)

    results = []
    counts = {"PASS": 0, "WARN": 0, "FAIL": 0}

    def record(name, kind, src, vres, proof_path=None, out_glb=None):
        overall = vres["overall"]
        counts[overall] += 1
        results.append({"name": name, "kind": kind, "src": src,
                        "overall": overall, "duration": vres["duration"],
                        "checks": vres["checks"], "proof": proof_path,
                        "retargeted": out_glb})
        flag = {"PASS": "ok", "WARN": "!!", "FAIL": "XX"}[overall]
        print(f"  [{flag}] {name} ({kind}) dur={vres['duration']:.2f}s",
              flush=True)

    # ---- 1. wrestling GLBs: full retarget ----
    wfiles = sorted(glob.glob(os.path.join(REPO, "public/motion/wrestling/*.glb")))
    print(f"\nwrestling GLBs: {len(wfiles)}", flush=True)
    for f in wfiles:
        stem = os.path.splitext(os.path.basename(f))[0]
        try:
            out_glb = os.path.join(retarget_dir, f"{stem}.retarget.glb")
            _, rep = retarget_file(f, ref_skel, out_glb)
            if rep.get("error"):
                results.append({"name": stem, "kind": "wrestling",
                                "src": f, "overall": "FAIL",
                                "error": rep["error"]})
                counts["FAIL"] += 1
                print(f"  [XX] {stem}: {rep['error']}", flush=True)
                continue
            rglb = Glb(out_glb)
            for anim in extract_animations(rglb):
                vres = validate_clip(anim["name"], anim, ref_skel)
                pp = os.path.join(proof_dir, f"wrestling_{_safe(anim['name'])}.png")
                render_proof(anim, ref_skel, pp,
                             title=f"{anim['name']} [{vres['overall']}]")
                record(anim["name"], "wrestling", f, vres, pp, out_glb)
        except Exception as e:
            traceback.print_exc()
            results.append({"name": stem, "kind": "wrestling", "src": f,
                            "overall": "FAIL", "error": str(e)})
            counts["FAIL"] += 1

    # ---- 2. UAL GLBs: retarget in-memory, validate, proof ----
    ufiles = sorted(glob.glob(os.path.join(REPO, "public/motion/ual/*.glb")))
    print(f"\nUAL GLBs: {len(ufiles)}", flush=True)
    for f in ufiles:
        stem = os.path.splitext(os.path.basename(f))[0]
        try:
            tmp = os.path.join(out, f"_tmp_{stem}.glb")
            _, rep = retarget_file(f, ref_skel, tmp)
            if rep.get("error"):
                print(f"  [XX] {stem}: {rep['error']}", flush=True)
                continue
            rglb = Glb(tmp)
            for anim in extract_animations(rglb):
                vres = validate_clip(anim["name"], anim, ref_skel)
                pp = os.path.join(proof_dir, f"ual_{stem}_{_safe(anim['name'])}.png")
                render_proof(anim, ref_skel, pp,
                             title=f"UAL {anim['name']} [{vres['overall']}]")
                record(f"{stem}/{anim['name']}", "ual", f, vres, pp)
            os.remove(tmp)
        except Exception:
            traceback.print_exc()

    # ---- 3. bank.json + cmu-bank.json ----
    for bank_file, kind in [("public/motion/bank.json", "bank"),
                            ("public/motion/cmu-bank.json", "cmu")]:
        p = os.path.join(REPO, bank_file)
        if not os.path.exists(p):
            continue
        data = json.load(open(p))
        clips = data.get("clips", data)
        print(f"\n{kind}: {len(clips)} clips", flush=True)
        for cname, clip in sorted(clips.items()):
            try:
                roles = [("atk", clip.get("atk", {}))]
                if clip.get("vic"):
                    roles.append(("vic", clip["vic"]))
                for role_name, role in roles:
                    nm = cname if role_name == "atk" else f"{cname}:vic"
                    anim = clip_from_bank(nm, {"times": clip["times"],
                                              "atk": role}, ref_skel)
                    vres = validate_clip(nm, anim, ref_skel)
                    pp = os.path.join(proof_dir, f"{kind}_{_safe(nm)}.png")
                    render_proof(anim, ref_skel, pp,
                                 title=f"{kind} {nm} [{vres['overall']}]")
                    record(nm, kind, p, vres, pp)
            except Exception:
                traceback.print_exc()
                results.append({"name": cname, "kind": kind, "src": p,
                                "overall": "FAIL", "error": "exception"})
                counts["FAIL"] += 1

    # ---- report ----
    with open(os.path.join(out, "report.json"), "w") as f:
        json.dump({"counts": counts, "results": results}, f, indent=1)

    fails = [r for r in results if r["overall"] == "FAIL"]
    warns = [r for r in results if r["overall"] == "WARN"]
    lines = ["# Animation retarget batch report",
             "",
             f"PASS {counts['PASS']} / WARN {counts['WARN']} / "
             f"FAIL {counts['FAIL']} (total {len(results)})",
             "",
             "## FAIL",
             ""]
    for r in fails:
        det = r.get("error") or "; ".join(
            f"{k}={v['grade']}" for k, v in r.get("checks", {}).items()
            if v["grade"] == "FAIL")
        lines.append(f"- {r['name']} ({r['kind']}): {det}")
    lines += ["", "## WARN (needs human look)", ""]
    for r in warns[:40]:
        det = "; ".join(f"{k}={v['grade']}" for k, v in r.get("checks", {}).items()
                        if v["grade"] == "WARN")
        lines.append(f"- {r['name']} ({r['kind']}): {det}")
    if len(warns) > 40:
        lines.append(f"- ... and {len(warns) - 40} more (see report.json)")
    lines += ["", "_Proof strips: out/proof/*.png_"]
    with open(os.path.join(out, "REPORT.md"), "w") as f:
        f.write("\n".join(lines) + "\n")
    print(f"\nPASS {counts['PASS']} WARN {counts['WARN']} FAIL {counts['FAIL']}",
          flush=True)
    print("report:", os.path.join(out, "REPORT.md"), flush=True)


if __name__ == "__main__":
    main()
