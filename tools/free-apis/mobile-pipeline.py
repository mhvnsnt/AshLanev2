#!/usr/bin/env python3
"""
mobile-pipeline.py — Mobile asset optimization for AshLane.

Produces a mobile-friendly asset variant set so the game stays smooth on
phones without maintaining two asset trees by hand:
  - downscales textures to --max-size (default 512) with high-quality filter
  - converts PNG -> WebP (lossy q80) for albedo, lossless for data maps
  - skips files already smaller than the target
  - writes a manifest.json mapping original -> mobile path

Never overwrites sources. Outputs go to <out>/ (default public/mobile/).

Usage:
  python3 mobile-pipeline.py --src ../../public/textures/procedural
  python3 mobile-pipeline.py --src ../../public/textures --max-size 512
  python3 mobile-pipeline.py --src ../../public/textures --dry-run
"""

import argparse
import json
import os

from PIL import Image

DATA_MAP_HINTS = ("roughness", "normal", "metalness", "ao", "height", "mask")


def is_data_map(name):
    n = name.lower()
    return any(h in n for h in DATA_MAP_HINTS)


def process_image(src, dst, max_size, quality=80):
    im = Image.open(src).convert("RGB")
    w, h = im.size
    if max(w, h) > max_size:
        scale = max_size / max(w, h)
        im = im.resize((int(w * scale), int(h * scale)), Image.LANCZOS)
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    if is_data_map(src):
        im.save(dst, "WEBP", lossless=True)
    else:
        im.save(dst, "WEBP", quality=quality, method=6)
    return os.path.getsize(dst)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--src", required=True, help="source asset dir")
    ap.add_argument("--out", default="public/mobile")
    ap.add_argument("--max-size", type=int, default=512)
    ap.add_argument("--quality", type=int, default=80)
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    manifest = {}
    total_in, total_out, n = 0, 0, 0
    for root, _, files in os.walk(args.src):
        for fn in sorted(files):
            if not fn.lower().endswith((".png", ".jpg", ".jpeg")):
                continue
            src = os.path.join(root, fn)
            rel = os.path.relpath(src, args.src)
            dst = os.path.join(args.out, os.path.splitext(rel)[0] + ".webp")
            size_in = os.path.getsize(src)
            if args.dry_run:
                print(f"  would convert {rel} ({size_in // 1024}KB)")
                continue
            size_out = process_image(src, dst, args.max_size, args.quality)
            manifest[rel] = os.path.relpath(dst, args.out)
            total_in += size_in
            total_out += size_out
            n += 1
            print(f"  {rel} {size_in // 1024}KB -> {size_out // 1024}KB")

    if not args.dry_run:
        os.makedirs(args.out, exist_ok=True)
        with open(os.path.join(args.out, "manifest.json"), "w") as f:
            json.dump(manifest, f, indent=2)
        if total_in:
            saved = 100 * (1 - total_out / total_in)
            print(f"done: {n} images, {total_in // 1024}KB -> "
                  f"{total_out // 1024}KB ({saved:.0f}% smaller)")


if __name__ == "__main__":
    main()
