#!/usr/bin/env python3
"""
proc-texture-gen.py — Procedural PBR-ish textures for AshLane (Round 3).

Generates tileable asphalt / concrete / brick albedo + roughness maps with
numpy + PIL. No external assets, fully procedural, no license baggage.

Outputs (512x512, tileable, sRGB albedo + linear roughness):
    public/textures/procedural/asphalt.png (+ -roughness)
    public/textures/procedural/concrete.png (+ -roughness)
    public/textures/procedural/brick.png (+ -roughness)

Usage:
    python3 proc-texture-gen.py --out ../../public/textures/procedural
"""

import argparse
import os

import numpy as np
from PIL import Image


def periodic_value_noise(size, periods, seed=0):
    """Tileable value noise: lattice wraps every `periods` cells."""
    rng = np.random.default_rng(seed)
    lat = rng.random((periods, periods))
    # Bilinear upsample with wraparound.
    y = np.arange(size) * periods / size
    x = np.arange(size) * periods / size
    y0 = y.astype(int) % periods
    x0 = x.astype(int) % periods
    y1 = (y0 + 1) % periods
    x1 = (x0 + 1) % periods
    fy = (y - y.astype(int))[:, None]
    fx = (x - x.astype(int))[None, :]
    return (lat[y0][:, x0] * (1 - fy) * (1 - fx)
            + lat[y0][:, x1] * (1 - fy) * fx
            + lat[y1][:, x0] * fy * (1 - fx)
            + lat[y1][:, x1] * fy * fx)


def fbm(size, octaves=5, base_periods=4, seed=0):
    n = np.zeros((size, size))
    amp, tot = 1.0, 0.0
    for o in range(octaves):
        n += amp * periodic_value_noise(size, base_periods * 2 ** o, seed + o)
        tot += amp
        amp *= 0.5
    return n / tot


def speckle(size, count, seed=0):
    """Random bright/dark aggregate specks (asphalt aggregate, concrete pits)."""
    rng = np.random.default_rng(seed)
    m = np.zeros((size, size))
    ys = rng.integers(0, size, count)
    xs = rng.integers(0, size, count)
    vals = rng.normal(0, 1, count)
    m[ys, xs] = vals
    return m


def save(arr, path):
    arr = np.clip(arr, 0, 1)
    Image.fromarray((arr * 255).astype(np.uint8)).save(path)
    print("wrote", path)


def make_asphalt(out, size=512):
    base = fbm(size, seed=11)
    grain = fbm(size, base_periods=32, octaves=3, seed=12)
    agg = np.abs(speckle(size, 9000, seed=13))
    alb = 0.16 + 0.10 * base + 0.06 * grain + 0.10 * np.clip(agg, 0, 1)
    # Large-scale tonal variation (wear) — smooth, no hard edges.
    stains = fbm(size, base_periods=3, octaves=3, seed=14)
    alb *= 0.82 + 0.18 * stains
    rgb = np.stack([alb * 1.0, alb * 1.02, alb * 1.08], axis=-1)
    rough = 0.85 + 0.15 * grain - 0.25 * np.clip(agg, 0, 1)
    save(rgb, f"{out}/asphalt.png")
    save(rough, f"{out}/asphalt-roughness.png")


def make_concrete(out, size=512):
    base = fbm(size, seed=21)
    pits = np.abs(speckle(size, 5000, seed=22))
    alb = 0.52 + 0.12 * base - 0.10 * np.clip(pits, 0, 1)
    # Formwork seams: subtle horizontal lines every 128px.
    seams = np.zeros((size, size))
    seams[::128, :] = 1.0
    alb *= 1.0 - 0.06 * seams
    # Hairline cracks.
    rng = np.random.default_rng(23)
    for _ in range(6):
        y, x = rng.integers(0, size, 2)
        for _ in range(60):
            alb[max(0, y - 1):y + 2, max(0, x - 1):x + 2] *= 0.82
            y += rng.integers(-2, 3)
            x += rng.integers(-2, 3)
    rgb = np.stack([alb, alb * 0.99, alb * 0.97], axis=-1)
    rough = 0.9 + 0.1 * base
    save(rgb, f"{out}/concrete.png")
    save(rough, f"{out}/concrete-roughness.png")


def make_brick(out, size=512):
    bw, bh = 64, 32  # brick + mortar cell
    alb = np.zeros((size, size))
    rough = np.zeros((size, size))
    tint = fbm(size, seed=31)
    for row in range(size // bh):
        off = (bw // 2) if row % 2 else 0
        for col in range(-1, size // bw + 1):
            x0 = (col * bw + off) % size
            # Brick face with per-brick tint variation.
            v = 0.42 + 0.16 * tint[row * bh, x0 % size]
            alb[row * bh:(row + 1) * bh - 3, x0:x0 + bw - 4] = v
            rough[row * bh:(row + 1) * bh - 3, x0:x0 + bw - 4] = 0.85
    # Mortar.
    mortar = alb == 0
    alb[mortar] = 0.55
    rough[mortar] = 0.95
    # Grime.
    grime = fbm(size, base_periods=3, octaves=3, seed=32)
    alb *= 0.8 + 0.2 * grime
    rgb = np.stack([alb * 1.08, alb * 0.72, alb * 0.62], axis=-1)  # warm red brick
    save(rgb, f"{out}/brick.png")
    save(rough, f"{out}/brick-roughness.png")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", default="public/textures/procedural")
    ap.add_argument("--size", type=int, default=512)
    args = ap.parse_args()
    os.makedirs(args.out, exist_ok=True)
    make_asphalt(args.out, args.size)
    make_concrete(args.out, args.size)
    make_brick(args.out, args.size)
    print("done.")


if __name__ == "__main__":
    main()
