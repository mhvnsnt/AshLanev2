#!/usr/bin/env python3
"""
Buffalo Bill character generator for AshLane.
Based on BILL $ABER — big, buff, ram horn dread braids.

Reference: docs/art-refs/bill-aber-ref.jpg

Pipeline:
1. Start from reference image (Bill $ABER photo)
2. Generate 3D via TripoSR (fast) or TRELLIS (quality)
3. Post-process for game
4. Output ready for rigging

Usage:
    # Full pipeline (TripoSR - fast):
    python3 buffalo_bill.py --method triposr

    # Quality pipeline (TRELLIS - slower, better):
    python3 buffalo_bill.py --method trellis

    # Just postprocess an existing generation:
    python3 buffalo_bill.py --input my-bill-raw.glb

Character spec (owner 2026-10-05):
- BILL $ABER likeness: dark skin, massive ram horn dread braids
- Body: BIG, BUFF — wrestler build, wide shoulders, thick arms
- Vibe: boss energy, Ashes faction leader
- Art direction: hooded figure (Malakor/SWMG style), hood off = Bill $ABER face
- In-game name: BUFFALO BILL (replaces non-canon "Ash Lane")
"""

import argparse
import os
import subprocess
import sys

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
# Default output: AshLanev2 public/models/generated/
# Override with --output-dir
DEFAULT_OUTPUT = os.path.expanduser("~/workspace/gen-pipe/output")

def run(cmd, desc):
    print(f"\n>>> {desc}")
    print(f"    {' '.join(cmd)}")
    result = subprocess.run(cmd)
    if result.returncode != 0:
        print(f"FAILED: {desc}")
        sys.exit(1)

def main():
    parser = argparse.ArgumentParser(description="Generate Buffalo Bill for AshLane")
    parser.add_argument("--method", choices=["triposr", "trellis"], default="triposr",
                        help="Generation method (triposr=fast, trellis=quality)")
    parser.add_argument("--input", default=None,
                        help="Skip generation, postprocess this file")
    parser.add_argument("--reference",
                        default=os.path.expanduser("~/workspace/gen-pipe/bill_aber.jpg"),
                        help="Reference image path")
    parser.add_argument("--output-dir", default=DEFAULT_OUTPUT,
                        help="Output directory")
    args = parser.parse_args()

    os.makedirs(args.output_dir, exist_ok=True)
    raw_path = os.path.join(args.output_dir, "buffalo-bill-raw.glb")
    final_path = os.path.join(args.output_dir, "buffalo-bill.glb")

    if args.input:
        raw_path = args.input
        print(f"Using existing: {raw_path}")
    else:
        # Check reference exists
        if not os.path.exists(args.reference):
            print(f"Reference not found: {args.reference}")
            print("Download from: AshLanev2 docs/art-refs/bill-aber-ref.jpg")
            sys.exit(1)

        print("=" * 60)
        print("BUFFALO BILL GENERATION")
        print("Based on BILL $ABER — big, buff, ram horn dread braids")
        print("=" * 60)

        if args.method == "triposr":
            gen_script = os.path.join(SCRIPT_DIR, "triposr_generate.py")
            # Activate triposr env if it exists
            env_activate = os.path.join(SCRIPT_DIR, "triposr-env", "bin", "activate")
            if os.path.exists(env_activate):
                # Run via bash with env activated
                cmd = ["bash", "-c",
                       f"source {env_activate} && python3 {gen_script} "
                       f"--input {args.reference} --output {raw_path} "
                       f"--mc-resolution 256"]
            else:
                cmd = ["python3", gen_script,
                       "--input", args.reference,
                       "--output", raw_path,
                       "--mc-resolution", "256"]
            run(cmd, "TripoSR generation (image → 3D)")

        elif args.method == "trellis":
            gen_script = os.path.join(SCRIPT_DIR, "trellis_generate.py")
            env_activate = os.path.join(SCRIPT_DIR, "trellis-env", "bin", "activate")
            if os.path.exists(env_activate):
                cmd = ["bash", "-c",
                       f"source {env_activate} && python3 {gen_script} "
                       f"--input {args.reference} --output {raw_path}"]
            else:
                cmd = ["python3", gen_script,
                       "--input", args.reference,
                       "--output", raw_path]
            run(cmd, "TRELLIS generation (image → 3D, high quality)")

    # Post-process for game
    pp_script = os.path.join(SCRIPT_DIR, "postprocess.py")
    run(["python3", pp_script,
         "--input", raw_path,
         "--output", final_path,
         "--character"],
        "Post-processing (decimate, clean, normalize)")

    print("")
    print("=" * 60)
    print("BUFFALO BILL READY")
    print(f"  Model: {final_path}")
    print("")
    print("Next steps:")
    print("  1. Copy to AshLanev2: public/models/generated/buffalo-bill.glb")
    print("  2. Rig to 52-bone Mixamo skeleton (docs/BONE_STANDARD.md)")
    print("     - Use weight transfer from existing character")
    print("     - Ram horn braids: rigid bind to head bone (no floppy physics yet)")
    print("  3. Add to roster.ts as Buffalo Bill (Ashes boss)")
    print("  4. Moveset already exists in movesets.ts (was 'Ash Lane')")
    print("=" * 60)

if __name__ == "__main__":
    main()
