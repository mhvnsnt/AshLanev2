#!/usr/bin/env python3
"""
AI texture upscaler for AshLane.
Uses Real-ESRGAN (BSD-2-Clause) for high-quality upscaling.

Why: AI-generated models often have blurry/low-res textures.
Upscaling 2x-4x makes them game-ready without re-generating.

Usage:
    # Setup (one time):
    bash upscale_setup.sh

    # Upscale a texture:
    python3 upscale.py --input blurry.png --output sharp.png
    python3 upscale.py --input blurry.png --output sharp.png --scale 4

    # Batch upscale a directory:
    python3 upscale.py --input ./textures/ --output ./textures-hd/ --batch
"""

import argparse
import os
import sys

def main():
    parser = argparse.ArgumentParser(description="Real-ESRGAN texture upscaler")
    parser.add_argument("--input", required=True, help="Input image or directory")
    parser.add_argument("--output", required=True, help="Output image or directory")
    parser.add_argument("--scale", type=int, default=2, choices=[2, 3, 4],
                        help="Upscale factor")
    parser.add_argument("--batch", action="store_true", help="Batch process directory")
    parser.add_argument("--model", default="RealESRGAN_x4plus",
                        help="Model: RealESRGAN_x4plus (photo) or RealESRGAN_x4plus_anime_6B (art)")
    args = parser.parse_args()

    try:
        from realesrgan import RealESRGANer
        from basicsr.archs.rrdbnet_arch import RRDBNet
    except ImportError:
        print("Real-ESRGAN not installed. Run: bash upscale_setup.sh")
        sys.exit(1)

    import torch
    import cv2
    import numpy as np

    device = "cuda" if torch.cuda.is_available() else "cpu"
    print(f"Using device: {device}")

    # Model setup
    model = RRDBNet(num_in_ch=3, num_out_ch=3, num_feat=64,
                    num_block=23, num_grow_ch=32, scale=4)
    upsampler = RealESRGANer(
        scale=4,
        model_path=f"weights/{args.model}.pth",
        model=model,
        tile=256 if device == "cuda" else 128,
        tile_pad=10,
        pre_pad=0,
        half=(device == "cuda"),
        device=device,
    )

    def upscale_one(in_path, out_path):
        print(f"  {in_path} → {out_path}")
        img = cv2.imread(in_path, cv2.IMREAD_UNCHANGED)
        if img is None:
            print(f"    SKIP: could not read")
            return
        output, _ = upsampler.enhance(img, outscale=args.scale)
        os.makedirs(os.path.dirname(os.path.abspath(out_path)) or ".", exist_ok=True)
        cv2.imwrite(out_path, output)
        h, w = img.shape[:2]
        print(f"    {w}x{h} → {w*args.scale}x{h*args.scale}")

    if args.batch:
        import glob
        files = []
        for ext in ("*.png", "*.jpg", "*.jpeg", "*.webp"):
            files.extend(glob.glob(os.path.join(args.input, ext)))
        print(f"Batch upscaling {len(files)} files (x{args.scale})...")
        os.makedirs(args.output, exist_ok=True)
        for f in files:
            out = os.path.join(args.output, os.path.basename(f))
            upscale_one(f, out)
    else:
        print(f"Upscaling x{args.scale}...")
        upscale_one(args.input, args.output)

    print("Done.")

if __name__ == "__main__":
    main()
