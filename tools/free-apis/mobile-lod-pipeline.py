#!/usr/bin/env python3
"""
mobile-lod-pipeline.py — Round 4: LOD + texture-variant pipeline for AshLane.

Complements tools/free-apis/mobile-pipeline.py (round 3, texture downscaling):
this one generates GEOMETRY LODs for GLB models.

For a given GLB it produces:
  1. LOD levels (simplified geometry: 50% / 25% triangle counts, meshopt-compressed)
  2. Optional WebP texture variant (warns and skips on models with
     unreadable textures; KTX2/Basis needs the external `ktx` binary)
  3. A JSON size report comparing original vs variants.

Uses @gltf-transform/cli (Apache-2.0) via npx — no install needed.

Usage:
    python3 mobile-lod-pipeline.py --in ../../public/models/cast/STICKUP.glb --out ./mobile/STICKUP

Tested 2026-10-06 on STICKUP.glb: 18,000 -> 8,970 -> 4,492 tris;
LOD files 49% / 41% of source size. Verified reloadable.
"""
import argparse
import json
import os
import subprocess
import sys

CLI = ["npx", "--yes", "@gltf-transform/cli"]


def run(*args):
    r = subprocess.run([*CLI, *args], capture_output=True, text=True)
    if r.returncode != 0:
        print(r.stderr[-2000:], file=sys.stderr)
        raise SystemExit(f"gltf-transform failed: {' '.join(args[:3])}")
    return r.stdout


def fsize(p):
    return os.path.getsize(p)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--in", dest="src", required=True)
    ap.add_argument("--out", required=True, help="output prefix, e.g. ./mobile/STICKUP")
    ap.add_argument("--lods", default="0.5,0.25", help="simplify ratios")
    args = ap.parse_args()
    os.makedirs(os.path.dirname(os.path.abspath(args.out)), exist_ok=True)

    report = {"source": args.src, "source_bytes": fsize(args.src), "variants": []}

    # 1. LOD levels via standalone simplify + meshopt compression.
    #    (optimize's --simplify flag proved unreliable; standalone works.)
    for ratio in args.lods.split(","):
        ratio = ratio.strip()
        lod = f"{args.out}.lod{int(float(ratio) * 100)}.glb"
        tmp = lod + ".tmp.glb"
        print(f"[1/2] LOD {ratio} -> {lod}")
        run("simplify", args.src, tmp, "--ratio", ratio, "--error", "0.05")
        run("optimize", tmp, lod, "--compress", "meshopt",
            "--texture-compress", "false")
        os.remove(tmp)
        report["variants"].append({"file": lod, "bytes": fsize(lod), "kind": f"lod-{ratio}"})

    # 2. WebP texture variant (broad mobile browser support, no external tools).
    #    KTX2/Basis (better GPU upload) needs the external `ktx` binary from
    #    KhronosGroup/KTX-Software — install it and swap "webp" -> "ktx2" below.
    #    Some models' textures fail conversion (odd formats) — warn and continue.
    webp = args.out + ".webp.glb"
    print(f"[2/2] WebP textures -> {webp}")
    try:
        run("optimize", args.src, webp, "--compress", "false",
            "--texture-compress", "webp")
        report["variants"].append({"file": webp, "bytes": fsize(webp), "kind": "webp-textures"})
    except SystemExit as e:
        print(f"  WARNING: texture compression failed ({e}); skipping texture variant")

    # 3. Report
    print("[3/3] report")
    for v in report["variants"]:
        pct = 100 * v["bytes"] / report["source_bytes"]
        print(f"  {v['kind']:14s} {v['bytes'] / 1024:8.0f} KB  ({pct:.0f}% of source)")
    with open(args.out + ".report.json", "w") as f:
        json.dump(report, f, indent=2)
    print("OK")


if __name__ == "__main__":
    main()
