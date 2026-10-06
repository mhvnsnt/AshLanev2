#!/usr/bin/env python3
"""render_diff.py — screenshot/render regression diffing.

Compares before/after renders, thresholds the difference, and writes an
annotated diff image (red overlay on changed pixels + changed-cell grid) plus
JSON stats. Used for: before/after repair proofs, reskin comparisons, and
checking that a re-render actually changed what it was supposed to.

Usage:
  python3 tools/verify/render_diff.py --before a.png --after b.png \\
      --out /tmp/diff.png --stats /tmp/diff.json --threshold 14

Exit code: 0 always (this is a measurement tool); verdict fields in --stats:
  'identical' (0 changed), 'changed' (< fail_pct), 'fail' (>= fail_pct).
"""
import argparse
import json
import sys

import numpy as np
from PIL import Image, ImageDraw


def load_rgb(path):
    return np.asarray(Image.open(path).convert("RGB"), dtype=np.float32)


def grid_cells(changed, cols=16, rows=9):
    """Return list of (cx, cy) grid cells with >2% changed pixels."""
    h, w = changed.shape
    cells = []
    for gy in range(rows):
        for gx in range(cols):
            x0, x1 = gx * w // cols, (gx + 1) * w // cols
            y0, y1 = gy * h // rows, (gy + 1) * h // rows
            cell = changed[y0:y1, x0:x1]
            if cell.size and cell.mean() > 0.02:
                cells.append((gx, gy))
    return cells


def main():
    ap = argparse.ArgumentParser(description="Thresholded render diff with annotation")
    ap.add_argument("--before", required=True)
    ap.add_argument("--after", required=True)
    ap.add_argument("--out", required=True, help="annotated diff PNG")
    ap.add_argument("--stats", default="", help="JSON stats path")
    ap.add_argument("--threshold", type=float, default=14.0,
                    help="per-pixel channel delta threshold (0-255)")
    ap.add_argument("--fail-pct", type=float, default=25.0,
                    help=">= this % changed => verdict 'fail'")
    ap.add_argument("--cols", type=int, default=16)
    ap.add_argument("--rows", type=int, default=9)
    args = ap.parse_args()

    a = load_rgb(args.before)
    b = load_rgb(args.after)
    if a.shape != b.shape:
        b_img = Image.open(args.after).convert("RGB").resize((a.shape[1], a.shape[0]))
        b = np.asarray(b_img, dtype=np.float32)
        print(f"[render_diff] resized after to match before: {a.shape[1]}x{a.shape[0]}")
    h, w = a.shape[:2]

    delta = np.abs(a - b).max(axis=2)
    changed = delta > args.threshold
    n_changed = int(changed.sum())
    pct = 100.0 * n_changed / changed.size
    mean_delta = float(delta[changed].mean()) if n_changed else 0.0

    cells = grid_cells(changed, args.cols, args.rows)
    verdict = "identical" if pct == 0 else ("fail" if pct >= args.fail_pct else "changed")

    # annotated output: before image, red overlay on changed pixels, grid of changed cells
    base = Image.fromarray(a.astype(np.uint8)).convert("RGBA")
    overlay = Image.new("RGBA", (w, h), (255, 0, 0, 0))
    ov = np.array(overlay)  # writable copy
    ov[changed] = (255, 0, 0, 110)
    out = Image.alpha_composite(base, Image.fromarray(ov))
    d = ImageDraw.Draw(out)
    for gx, gy in cells:
        x0, x1 = gx * w // args.cols, (gx + 1) * w // args.cols
        y0, y1 = gy * h // args.rows, (gy + 1) * h // args.rows
        d.rectangle([x0, y0, x1, y1], outline=(255, 255, 0), width=3)
    d.rectangle([2, 2, w - 2, h - 2], outline=(0, 255, 0) if verdict == "identical" else (255, 0, 0), width=6)
    out.convert("RGB").save(args.out)

    stats = {
        "tool": "render_diff", "before": args.before, "after": args.after,
        "size": [w, h], "threshold": args.threshold,
        "changed_pixels": n_changed, "changed_pct": round(pct, 3),
        "mean_delta_on_changed": round(mean_delta, 2),
        "changed_cells": cells, "verdict": verdict,
    }
    print(f"[render_diff] {n_changed}/{changed.size} px changed ({pct:.2f}%), "
          f"mean delta {mean_delta:.1f}, cells {len(cells)} -> verdict: {verdict}")
    print(f"[render_diff] annotated -> {args.out}")
    if args.stats:
        with open(args.stats, "w") as f:
            json.dump(stats, f, indent=2)
        print(f"[render_diff] stats -> {args.stats}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
