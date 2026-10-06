#!/usr/bin/env python3
"""
tools/quantumblur/ab_terrain.py — QuantumBlur A/B vs the classical noise pipeline.

Question: is QuantumBlur's blur RICHER than the classical filters the
procedural pipeline already uses? If yes, wire the winner in; if no, say so
plainly and leave it out.

Setup:
  A: QuantumBlur blur_height() — heightmap -> quantum circuit (sqrt-amplitude
     encoding over a Gray-code grid) -> rx/ry "blur" rotations -> read back.
     Runs on Qiskit Aer (CLASSICAL simulation of the circuit math — the blur
     is quantum-computed in the math, simulated on CPU).
  B: Classical Gaussian blur (numpy), sigma tuned to match A's smoothness.

Baseline: 32x32 value-noise terrain (seeded, representative of the classical
noise family the pipeline already uses — SVG feTurbulence, mulberry32 value
noise) + macro features (hill, crater).

Metrics (all computed, not vibes):
  smoothness   — mean |Laplacian| (lower = smoother)
  detail       — Pearson correlation with the unblurred original
  richness     — entropy of the 8-bit quantized height histogram (higher =
                 more distinct terrain levels, less banding)
  terracing    — fraction of flat-adjacent pixel pairs (banding artifacts)
  wall_time    — seconds per blur

Needs: /tmp/qvenv (qiskit, qiskit-aer, numpy, scipy, pillow, quantumblur).
Run: /tmp/qvenv/bin/python tools/quantumblur/ab_terrain.py
Out: tools/quantumblur/proof/*.png + ab_report.json
"""

import json
import math
import os
import sys
import time

import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
PROOF = os.path.join(HERE, "proof")
os.makedirs(PROOF, exist_ok=True)

from quantumblur import blur_height, circuit2height  # noqa: E402


# ---------------------------------------------------------------------------
# Baseline terrain (classical value noise — the pipeline's current family)
# ---------------------------------------------------------------------------

def value_noise(shape, seed, cells=8):
    rng = np.random.default_rng(seed)
    grid = rng.random((cells + 1, cells + 1))
    ys = np.linspace(0, cells, shape[0])
    xs = np.linspace(0, cells, shape[1])
    y0 = np.floor(ys).astype(int).clip(0, cells - 1)
    x0 = np.floor(xs).astype(int).clip(0, cells - 1)
    fy = (ys - y0)[:, None]
    fx = (xs - x0)[None, :]
    sy = fy * fy * (3 - 2 * fy)
    sx = fx * fx * (3 - 2 * fx)
    return (grid[y0][:, x0] * (1 - sx) * (1 - sy)
            + grid[y0][:, x0 + 1] * sx * (1 - sy)
            + grid[y0 + 1][:, x0] * (1 - sx) * sy
            + grid[y0 + 1][:, x0 + 1] * sx * sy)


def baseline_terrain(n=32, seed=1234):
    t = value_noise((n, n), seed, cells=6) * 0.5
    t += value_noise((n, n), seed + 1, cells=16) * 0.3
    t += value_noise((n, n), seed + 2, cells=32) * 0.2
    yy, xx = np.mgrid[0:n, 0:n]
    hill = np.exp(-((xx - n * 0.3) ** 2 + (yy - n * 0.7) ** 2) / (2 * (n / 8) ** 2))
    crater = -0.6 * np.exp(-((xx - n * 0.72) ** 2 + (yy - n * 0.28) ** 2) / (2 * (n / 10) ** 2))
    return (t + 0.7 * hill + crater).astype(np.float64)


# ---------------------------------------------------------------------------
# The two contenders
# ---------------------------------------------------------------------------

def qblur(arr, xi, locality=1.0, axis="x"):
    """QuantumBlur: dict-height -> circuit -> blur rotations -> heights."""
    n = arr.shape[0]
    h = {(x, y): float(arr[y, x]) - float(arr.min()) + 1e-9
         for x in range(n) for y in range(n)}
    qc = blur_height(h, xi=xi, locality=locality, axis=axis)
    out = circuit2height(qc)
    res = np.zeros_like(arr)
    for x in range(n):
        for y in range(n):
            res[y, x] = out.get((x, y), 0.0)
    # circuit2height normalizes; restore original scale
    span = arr.max() - arr.min()
    if res.max() > res.min():
        res = res / res.max() * span + arr.min()
    return res


def gaussian_blur(arr, sigma):
    """Classical Gaussian blur (numpy, separable, reflective edges)."""
    r = int(math.ceil(3 * sigma))
    xs = np.arange(-r, r + 1)
    k = np.exp(-xs ** 2 / (2 * sigma ** 2))
    k /= k.sum()
    pad = np.pad(arr, r, mode="reflect")
    tmp = np.apply_along_axis(lambda row: np.convolve(row, k, mode="valid"), 1, pad)
    return np.apply_along_axis(lambda col: np.convolve(col, k, mode="valid"), 0, tmp)


# ---------------------------------------------------------------------------
# Metrics
# ---------------------------------------------------------------------------

def laplacian(arr):
    return (np.roll(arr, 1, 0) + np.roll(arr, -1, 0)
            + np.roll(arr, 1, 1) + np.roll(arr, -1, 1) - 4 * arr)


def metrics(arr, original):
    q = np.clip((arr - arr.min()) / (arr.max() - arr.min() + 1e-12), 0, 1)
    hist, _ = np.histogram((q * 255).astype(np.uint8), bins=256, range=(0, 256))
    p = hist / hist.sum()
    p = p[p > 0]
    ent = float(-np.sum(p * np.log2(p)))
    flat = float(np.mean(np.abs(np.diff(arr, axis=0)) < 1e-4)
                 + np.mean(np.abs(np.diff(arr, axis=1)) < 1e-4)) / 2
    return {
        "smoothness_laplacian": float(np.mean(np.abs(laplacian(arr)))),
        "detail_corr": float(np.corrcoef(arr.ravel(), original.ravel())[0, 1]),
        "richness_entropy_bits": ent,
        "terracing_flat_frac": flat,
    }


def save_png(arr, path):
    from PIL import Image
    q = np.clip((arr - arr.min()) / (arr.max() - arr.min() + 1e-12), 0, 1)
    img = Image.fromarray((q * 255).astype(np.uint8), mode="L").resize((256, 256), Image.NEAREST)
    img.save(path)


# ---------------------------------------------------------------------------
# A/B
# ---------------------------------------------------------------------------

def main():
    base = baseline_terrain(32, seed=1234)
    save_png(base, os.path.join(PROOF, "terrain_baseline.png"))
    print(f"baseline: mean|L|={metrics(base, base)['smoothness_laplacian']:.4f}")

    report = {"baseline_smoothness": metrics(base, base)["smoothness_laplacian"],
              "quantum": [], "classical": []}

    # Sweep quantum xi, then match each with a classical sigma at equal smoothness.
    for xi in (0.05, 0.10, 0.20):
        t0 = time.time()
        qa = qblur(base, xi=xi)
        qt = time.time() - t0
        qm = metrics(qa, base)
        qm.update({"xi": xi, "wall_s": round(qt, 2)})
        report["quantum"].append(qm)
        save_png(qa, os.path.join(PROOF, f"terrain_quantum_xi{xi}.png"))
        print(f"quantum xi={xi}: L={qm['smoothness_laplacian']:.4f} "
              f"corr={qm['detail_corr']:.4f} ent={qm['richness_entropy_bits']:.3f} "
              f"flat={qm['terracing_flat_frac']:.4f} t={qt:.1f}s")

        # Find classical sigma with matching smoothness (bisection on sigma).
        lo, hi = 0.2, 6.0
        target = qm["smoothness_laplacian"]
        sigma = 1.0
        for _ in range(12):
            sigma = (lo + hi) / 2
            if metrics(gaussian_blur(base, sigma), base)["smoothness_laplacian"] > target:
                lo = sigma
            else:
                hi = sigma
        t0 = time.time()
        ca = gaussian_blur(base, sigma)
        ct = time.time() - t0
        cm = metrics(ca, base)
        cm.update({"sigma": round(sigma, 3), "matched_xi": xi,
                   "wall_s": round(ct, 4)})
        report["classical"].append(cm)
        save_png(ca, os.path.join(PROOF, f"terrain_classical_s{sigma:.2f}.png"))
        print(f"classical sigma={sigma:.3f} (smoothness-matched): "
              f"corr={cm['detail_corr']:.4f} ent={cm['richness_entropy_bits']:.3f} "
              f"flat={cm['terracing_flat_frac']:.4f} t={ct:.4f}s")

    with open(os.path.join(PROOF, "ab_report.json"), "w") as f:
        json.dump(report, f, indent=2)
    print("\nreport ->", os.path.join(PROOF, "ab_report.json"))


if __name__ == "__main__":
    main()
