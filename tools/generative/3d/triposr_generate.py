#!/usr/bin/env python3
"""
TripoSR image-to-3D generator for AshLane.
MIT licensed. Single image in → textured GLB out.

Usage:
    python3 triposr_generate.py --input photo.jpg --output model.glb
    python3 triposr_generate.py --input photo.jpg --output model.glb --no-remove-bg
    python3 triposr_generate.py --input photo.jpg --output model.glb --mc-resolution 256

Output goes to public/models/generated/ by default (use --output to override).
Then run postprocess.py to optimize for the game.
"""

import argparse
import os
import sys
import torch
from PIL import Image

def main():
    parser = argparse.ArgumentParser(description="TripoSR: image → 3D GLB")
    parser.add_argument("--input", required=True, help="Input image (jpg/png)")
    parser.add_argument("--output", required=True, help="Output GLB path")
    parser.add_argument("--no-remove-bg", action="store_true", help="Skip background removal")
    parser.add_argument("--mc-resolution", type=int, default=256, help="Marching cubes resolution (128/192/256)")
    parser.add_argument("--device", default=None, help="cuda or cpu (auto-detect if omitted)")
    args = parser.parse_args()

    # Add TripoSR to path
    tsr_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "TripoSR")
    if os.path.isdir(tsr_dir):
        sys.path.insert(0, tsr_dir)

    from tsr.utils import remove_background
    from tsr.system import TSR

    device = args.device or ("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Using device: {device}")

    # Load model
    print("Loading TripoSR...")
    model = TSR.from_pretrained(
        "stabilityai/TripoSR",
        config_name="config.yaml",
        weight_name="model.ckpt",
    )
    model.to(device)

    # Load image
    print(f"Loading image: {args.input}")
    image = Image.open(args.input).convert("RGB")

    if not args.no_remove_bg:
        print("Removing background...")
        image = remove_background(image)

    # Generate
    print(f"Generating 3D mesh (mc_resolution={args.mc_resolution})...")
    with torch.no_grad():
        scene = model(image, device=device, mc_resolution=args.mc_resolution)

    # Export
    os.makedirs(os.path.dirname(os.path.abspath(args.output)) or ".", exist_ok=True)
    # TripoSR exports via trimesh scene
    meshes = [m for m in scene.meshes] if hasattr(scene, 'meshes') else [scene]
    if meshes:
        # Combine and export as GLB
        import trimesh
        combined = trimesh.util.concatenate(meshes) if len(meshes) > 1 else meshes[0]
        combined.export(args.output)
        print(f"Saved: {args.output}")
    else:
        print("ERROR: No meshes generated")
        sys.exit(1)

    print("")
    print("Next: python3 postprocess.py --input", args.output, "--output game-ready.glb")

if __name__ == "__main__":
    main()
