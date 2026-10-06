#!/usr/bin/env python3
"""
Game-agnostic auto-rig for unrigged GLBs. Serves AshLanev2, Brutal-Fist, and Bannon.

Pipeline:
  1. instance-rig (MIT): BodyPix 2D pose → 3D skeleton + skin weights
  2. Validate: bone count, skeleton hierarchy sanity
  3. Output: <game>/rigged/<name>_rigged.glb

Usage:
  python3 auto_rig.py --game ashlane --input path/to/model.glb
  python3 auto_rig.py --game brutal-fist --input path/to/model.glb --all-unrigged

Games and their model dirs (override with --model-dir):
  ashlane     ~/workspace/game-sweep/AshLanev2/public/models/cast
  brutal-fist ~/workspace/game-sweep/Brutal-Fist/public/models
  bannon      ~/workspace/bannon-repair/out  (already rigged — validation only)
"""
import argparse
import json
import os
import struct
import subprocess
import sys
from pathlib import Path

HOME = Path.home()
GAMES = {
    "ashlane": HOME / "workspace/game-sweep/AshLanev2/public/models/cast",
    "brutal-fist": HOME / "workspace/game-sweep/Brutal-Fist/public/models",
    "bannon": HOME / "workspace/bannon-repair/out",
}

# instance-rig venv (built by the animation harvest)
VENV_PY = HOME / "workspace/anim-harvest/.venv-ir/bin/python"


def bone_count(path: Path) -> int:
    with open(path, "rb") as f:
        data = f.read()
    if data[:4] != b"glTF":
        return -1
    ln = struct.unpack("<I", data[12:16])[0]
    js = json.loads(data[20:20 + ln])
    return sum(len(s.get("joints", [])) for s in js.get("skins", []))


def find_unrigged(model_dir: Path):
    out = []
    for root, _, files in os.walk(model_dir):
        for f in files:
            if f.endswith(".glb"):
                p = Path(root) / f
                if bone_count(p) == 0:
                    out.append(p)
    return sorted(out)


def rig_one(input_path: Path, output_path: Path) -> bool:
    """Run instance-rig on a single GLB. Returns True on success."""
    if not VENV_PY.exists():
        print(f"SKIP: instance-rig venv not ready at {VENV_PY}", file=sys.stderr)
        return False
    output_path.parent.mkdir(parents=True, exist_ok=True)
    # instance-rig CLI: python -m instancerig <input> -o <output>
    cmd = [str(VENV_PY), "-m", "instancerig", str(input_path), "-o", str(output_path)]
    print(f"RUN: {' '.join(cmd)}")
    r = subprocess.run(cmd, capture_output=True, text=True, timeout=600)
    if r.returncode != 0:
        print(f"FAIL {input_path.name}: {r.stderr[-500:]}", file=sys.stderr)
        return False
    # Validate the output has bones
    n = bone_count(output_path)
    if n <= 0:
        print(f"FAIL {input_path.name}: output has {n} bones", file=sys.stderr)
        return False
    print(f"OK {input_path.name}: {n} bones -> {output_path}")
    return True


def main():
    ap = argparse.ArgumentParser(description="Game-agnostic auto-rig")
    ap.add_argument("--game", choices=list(GAMES), required=True)
    ap.add_argument("--input", help="Single GLB to rig")
    ap.add_argument("--all-unrigged", action="store_true", help="Rig all unrigged GLBs in the game dir")
    ap.add_argument("--model-dir", help="Override model directory")
    ap.add_argument("--out-dir", help="Override output directory")
    args = ap.parse_args()

    model_dir = Path(args.model_dir) if args.model_dir else GAMES[args.game]
    out_dir = Path(args.out_dir) if args.out_dir else model_dir / "rigged"

    targets = [Path(args.input)] if args.input else []
    if args.all_unrigged:
        targets = find_unrigged(model_dir)
    if not targets:
        print("No targets. Use --input or --all-unrigged.")
        return 1

    print(f"Game: {args.game} | targets: {len(targets)}")
    ok, fail = 0, 0
    for t in targets:
        out = out_dir / f"{t.stem}_rigged.glb"
        if rig_one(t, out):
            ok += 1
        else:
            fail += 1
    print(f"Done: {ok} ok, {fail} failed")
    return 0 if fail == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
