#!/usr/bin/env python3
"""
TRELLIS image-to-3D generator for AshLane.
MIT licensed (Microsoft). Higher quality than TripoSR, slower.

Usage:
    python3 trellis_generate.py --input photo.jpg --output model.glb

Best for: hero characters, important props where quality matters.
For speed, use triposr_generate.py instead.
"""

import argparse
import os
import sys

def main():
    parser = argparse.ArgumentParser(description="TRELLIS: image → high-quality 3D GLB")
    parser.add_argument("--input", required=True, help="Input image (jpg/png)")
    parser.add_argument("--output", required=True, help="Output GLB path")
    parser.add_argument("--device", default=None, help="cuda or cpu")
    args = parser.parse_args()

    trellis_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "TRELLIS")
    if os.path.isdir(trellis_dir):
        sys.path.insert(0, trellis_dir)

    import torch
    from PIL import Image
    from trellis.pipelines import TrellisImageTo3DPipeline

    device = args.device or ("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Using device: {device}")
    if device == "cpu":
        print("WARNING: TRELLIS on CPU will be very slow (30+ min). GPU recommended.")

    print("Loading TRELLIS pipeline...")
    pipeline = TrellisImageTo3DPipeline.from_pretrained("microsoft/TRELLIS-image-large")
    pipeline.to(device)

    print(f"Loading image: {args.input}")
    image = Image.open(args.input).convert("RGB")

    print("Generating (this takes a while)...")
    outputs = pipeline.run(
        image,
        seed=42,
        # SLAT mode for textured mesh
        formats=["mesh"],
    )

    os.makedirs(os.path.dirname(os.path.abspath(args.output)) or ".", exist_ok=True)
    glb = outputs["mesh"][0]
    # TRELLIS outputs a GLB object with export method
    if hasattr(glb, 'export'):
        glb.export(args.output)
    else:
        # Save raw
        with open(args.output, 'wb') as f:
            f.write(glb if isinstance(glb, bytes) else glb.read())
    print(f"Saved: {args.output}")
    print("")
    print("Next: python3 postprocess.py --input", args.output, "--output game-ready.glb")

if __name__ == "__main__":
    main()
