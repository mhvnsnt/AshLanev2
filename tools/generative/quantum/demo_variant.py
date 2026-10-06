#!/usr/bin/env python3
"""
demo_variant.py — proof that the quantum seed pipeline actually works.

1. Pulls fresh quantum bytes (ANU real QRNG hardware by default).
2. Derives a crowd-variant seed pack (seeds.py, deterministic).
3. Generates one concrete crowd-layout variant: JSON describing six crowd
   sections (density, body-type mix, clothing palette mix) + a rendered
   top-down schematic PNG.
4. Prints the provenance so anyone can see exactly where the randomness
   came from.

Run: python3 demo_variant.py
Outputs: ./proof/<name>_crowd.json  ./proof/<name>_crowd.png
"""

import json
import os
import random
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
# Build-time quantum seed service: disk-cached pool + manifest stamping.
sys.path.insert(0, os.path.abspath(os.path.join(HERE, "..", "..")))
from qrng_seed import SeedPool, stamp_manifest  # noqa: E402

from seeds import SeedPack  # noqa: E402


# Clothing palette: street crowd, varied (no matching uniforms — owner rule).
CLOTHING = [
    "#c0392b", "#e67e22", "#f1c40f", "#27ae60", "#2980b9", "#8e44ad",
    "#ecf0f1", "#2c3e50", "#7f8c8d", "#d35400", "#16a085", "#c0c0c0",
    "#5d4037", "#37474f", "#880e4f", "#1b5e20",
]

BODY_SIZES = [4, 5, 6, 7, 8]  # dot radius px: varied body sizes (owner rule)

# Six crowd sections around a street fight pit: [x, y, w, h] in schematic px.
SECTIONS = [
    ("section_a", (60, 60, 260, 160), "north stand"),
    ("section_b", (580, 60, 260, 160), "north stand"),
    ("section_c", (40, 300, 180, 260), "west alley"),
    ("section_d", (680, 300, 180, 260), "east alley"),
    ("section_e", (60, 580, 260, 120), "south curb"),
    ("section_f", (580, 580, 260, 120), "south curb"),
]

PIT = (330, 250, 240, 240)  # the fight area, center


def generate_crowd_variant(pack):
    """Build the crowd variant dict from derived quantum seeds."""
    sections = []
    total = 0
    for key, box, label in SECTIONS:
        seed = pack.pack["crowd"][key]
        rng = random.Random(seed)
        density = rng.uniform(0.35, 0.95)  # fraction of seats filled
        x, y, w, h = box
        seats = []
        cols, rows = 16, 10
        for ci in range(cols):
            for ri in range(rows):
                if rng.random() > density:
                    continue
                px = x + (ci + 0.5) * w / cols + rng.uniform(-4, 4)
                py = y + (ri + 0.5) * h / rows + rng.uniform(-4, 4)
                seats.append({
                    "x": round(px, 1), "y": round(py, 1),
                    "size": rng.choice(BODY_SIZES),
                    "color": rng.choice(CLOTHING),
                })
        total += len(seats)
        sections.append({
            "key": key, "label": label, "box": box,
            "density": round(density, 3),
            "seed": seed,
            "headcount": len(seats),
            "seats": seats,
        })
    return {
        "variant_name": pack.name,
        "provenance": pack.provenance,
        "quantum_bytes_hex": pack.qbytes.hex(),
        "total_headcount": total,
        "sections": sections,
        "pit": {"box": PIT, "label": "fight pit"},
    }


def render_schematic(variant, png_path):
    """Render a top-down crowd schematic PNG with PIL."""
    from PIL import Image, ImageDraw, ImageFont

    W, H = 900, 760
    img = Image.new("RGB", (W, H), "#14100d")
    d = ImageDraw.Draw(img)

    # Street grid backdrop
    for gx in range(0, W, 60):
        d.line([(gx, 0), (gx, H)], fill="#1f1a16", width=1)
    for gy in range(0, H, 60):
        d.line([(0, gy), (W, gy)], fill="#1f1a16", width=1)

    # Fight pit: concrete
    px, py, pw, ph = variant["pit"]["box"]
    d.rectangle([px, py, px + pw, py + ph], fill="#3a3a3c",
                outline="#e33d2e", width=3)
    try:
        font = ImageFont.truetype("DejaVuSans-Bold.ttf", 20)
        sfont = ImageFont.truetype("DejaVuSans.ttf", 14)
    except OSError:
        font = ImageFont.load_default()
        sfont = font
    d.text((px + pw / 2, py + ph / 2), "FIGHT PIT", font=font,
           fill="#e8e0d4", anchor="mm")

    # Crowd sections: barrier + heads
    for sec in variant["sections"]:
        x, y, w, h = sec["box"]
        d.rectangle([x, y, x + w, y + h], outline="#8a7a5c", width=2)
        for s in sec["seats"]:
            d.ellipse([s["x"] - s["size"], s["y"] - s["size"],
                       s["x"] + s["size"], s["y"] + s["size"]],
                      fill=s["color"])
        d.text((x + 6, y + 6),
               f"{sec['key']} · {sec['headcount']}",
               font=sfont, fill="#cbb98a")

    # Header: provenance summary (centered above the fight pit — clear space)
    d.text((W / 2, 24), "ASHLANE — crowd layout variant", font=font,
           fill="#f2ede3", anchor="mt")
    d.text((W / 2, 52), f"variant: {variant['variant_name']}", font=sfont,
           fill="#cbb98a", anchor="mt")
    d.text((W / 2, 70), f"headcount: {variant['total_headcount']}", font=sfont,
           fill="#cbb98a", anchor="mt")
    prov = variant["provenance"]
    d.text((20, H - 34), prov[:112], font=sfont, fill="#7d7466")

    img.save(png_path)
    return png_path


def main():
    name = "quantum_crowd_v1"
    proof_dir = os.path.join(HERE, "proof")
    os.makedirs(proof_dir, exist_ok=True)

    print("== AshLane quantum crowd-variant demo ==")
    # PILOT (QUANTUM-v2): bytes now come from the build-time seed service
    # (tools/qrng_seed.py) — disk-cached pool with per-batch provenance,
    # instead of a direct one-shot ANU call. The pool refills itself when
    # low; the draw_info carries qrng_source/seed/timestamp for the manifest.
    pool = SeedPool()  # tools/qrng_seed_pool.json (default)
    qbytes, draw_info = pool.draw(64)
    pack = SeedPack(qbytes, draw_info["provenance"], name=name)
    print(f"quantum bytes ({len(pack.qbytes)}): {pack.qbytes.hex()[:64]}...")
    print(f"provenance: {pack.provenance}\n")

    variant = generate_crowd_variant(pack)
    # Stamp the build manifest: qrng_source / seed / timestamp make this
    # variant's "quantum-seeded" claim auditable and reproducible.
    stamp_manifest(variant, draw_info["qrng_source"], draw_info["seed"],
                   draw_info["seed_hex"], draw_info["provenance"],
                   timestamp=draw_info["timestamp"],
                   extra={"pool_batch_ids": draw_info["pool_batch_ids"]})
    json_path = os.path.join(proof_dir, f"{name}_crowd.json")
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(variant, f, indent=2)

    png_path = os.path.join(proof_dir, f"{name}_crowd.png")
    render_schematic(variant, png_path)

    print(f"crowd variant JSON : {json_path}")
    print(f"schematic PNG      : {png_path}")
    print(f"total headcount    : {variant['total_headcount']}")
    print(f"seed pack verify() : {pack.verify()}  "
          "(variant is byte-reproducible from stored bytes)")

    # Save the seed pack itself so this exact variant can be regenerated.
    seed_path = os.path.join(proof_dir, f"{name}_seeds.json")
    pack.save(seed_path)
    print(f"seed pack JSON     : {seed_path}")


if __name__ == "__main__":
    main()
