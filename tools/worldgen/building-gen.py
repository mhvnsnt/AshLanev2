#!/usr/bin/env python3
"""
building-gen.py — Round 4: procedural city-block generation for AshLane.

Generates a textured GLB city block: buildings with lit windows, rooftop
props (water towers, AC units), sidewalks and street. No downloads needed.

License of this script: MIT (new code). Output geometry is original.
trimesh is MIT. No third-party assets involved.

Usage:
    python3 building-gen.py --seed 7 --blocks 1 --out ./city-block.glb
    python3 building-gen.py --seed 7 --blocks 4 --out ./district.glb --block-size 60
"""
import argparse
import math
import random
import numpy as np
import trimesh


def box(w, h, d, color):
    m = trimesh.creation.box(extents=(w, h, d))
    m.visual = trimesh.visual.ColorVisuals(
        m, vertex_colors=np.tile(np.array(color, dtype=np.uint8), (len(m.vertices), 1))
    )
    return m


def building(seed_rng, w, d, h, palette):
    """A single building: body + window grid + rooftop props. Returns list of (mesh, transform)."""
    parts = []
    body = box(w, h, d, palette["wall"])
    body.apply_translation((0, h / 2, 0))
    parts.append(body)

    # Window strips: emissive quads slightly off each facade
    win_w, win_h = 1.6, 1.2
    cols = max(2, int(w / 3.2))
    rows = max(2, int(h / 3.4))
    lit_ratio = palette.get("lit_ratio", 0.45)
    for face in range(4):
        for c in range(cols):
            for r in range(rows):
                if seed_rng.random() > lit_ratio:
                    continue
                lit = seed_rng.random() < 0.8
                col = palette["window_lit"] if lit else palette["window_dark"]
                q = trimesh.creation.box(extents=(win_w, win_h, 0.06))
                q.visual = trimesh.visual.ColorVisuals(
                    q, vertex_colors=np.tile(np.array(col, dtype=np.uint8), (len(q.vertices), 1))
                )
                u = -w / 2 + (c + 0.5) * (w / cols)
                v = 2.0 + r * 3.4
                if face == 0:   # +z
                    q.apply_translation((u, v, d / 2 + 0.02))
                elif face == 1:  # -z
                    q.apply_translation((u, v, -d / 2 - 0.02))
                elif face == 2:  # +x
                    q.apply_transform(trimesh.transformations.rotation_matrix(math.pi / 2, (0, 1, 0)))
                    q.apply_translation((w / 2 + 0.02, v, u))
                else:            # -x
                    q.apply_transform(trimesh.transformations.rotation_matrix(math.pi / 2, (0, 1, 0)))
                    q.apply_translation((-w / 2 - 0.02, v, u))
                parts.append(q)

    # Rooftop props: water tower + AC units
    if seed_rng.random() < 0.7:
        tower_r = seed_rng.uniform(1.2, 2.0)
        tank = trimesh.creation.cylinder(radius=tower_r, height=tower_r * 1.4)
        tank.visual = trimesh.visual.ColorVisuals(
            tank, vertex_colors=np.tile(np.array(palette["roof_prop"], dtype=np.uint8), (len(tank.vertices), 1))
        )
        tank.apply_translation((seed_rng.uniform(-w / 4, w / 4), h + tower_r * 1.2, seed_rng.uniform(-d / 4, d / 4)))
        parts.append(tank)
    for _ in range(seed_rng.randint(1, 3)):
        ac = box(seed_rng.uniform(1.0, 2.2), 1.0, seed_rng.uniform(1.0, 2.2), palette["roof_prop"])
        ac.apply_translation((seed_rng.uniform(-w / 3, w / 3), h + 0.5, seed_rng.uniform(-d / 3, d / 3)))
        parts.append(ac)

    return parts


PALETTES = {
    "neon": dict(wall=(28, 28, 40, 255), window_lit=(120, 255, 170, 255),
                 window_dark=(20, 26, 40, 255), roof_prop=(60, 60, 80, 255), lit_ratio=0.55),
    "industrial": dict(wall=(74, 66, 58, 255), window_lit=(255, 190, 110, 255),
                      window_dark=(30, 28, 26, 255), roof_prop=(90, 80, 70, 255), lit_ratio=0.3),
    "residential": dict(wall=(96, 88, 80, 255), window_lit=(255, 220, 150, 255),
                        window_dark=(34, 32, 30, 255), roof_prop=(100, 92, 84, 255), lit_ratio=0.5),
    "waterfront": dict(wall=(40, 52, 66, 255), window_lit=(150, 210, 255, 255),
                       window_dark=(22, 28, 38, 255), roof_prop=(70, 80, 95, 255), lit_ratio=0.4),
}


def city_block(seed, block_size=60.0, palette_name="neon"):
    rng = random.Random(seed)
    palette = PALETTES[palette_name]
    meshes = []

    # Ground: street + sidewalks
    street = box(block_size, 0.2, block_size, (18, 18, 22, 255))
    street.apply_translation((0, -0.1, 0))
    meshes.append(street)

    # Buildings around the perimeter, plaza/street in the middle
    margin = 8.0
    spots = []
    n = 4
    step = block_size / n
    for i in range(n):
        for j in range(n):
            x = -block_size / 2 + (i + 0.5) * step
            z = -block_size / 2 + (j + 0.5) * step
            if abs(x) < step * 0.75 and abs(z) < step * 0.75:
                continue  # keep center open (fight plaza)
            spots.append((x, z))
    for (x, z) in spots:
        w = rng.uniform(step * 0.55, step * 0.8)
        d = rng.uniform(step * 0.55, step * 0.8)
        h = rng.uniform(12, 42)
        for part in building(rng, w, d, h, palette):
            part.apply_translation((x, 0, z))
            meshes.append(part)

    # Streetlights around the plaza
    for angle in range(0, 360, 90):
        pole = trimesh.creation.cylinder(radius=0.12, height=7.0)
        pole.visual = trimesh.visual.ColorVisuals(
            pole, vertex_colors=np.tile(np.array((50, 50, 60, 255), dtype=np.uint8), (len(pole.vertices), 1)))
        px = math.cos(math.radians(angle)) * step * 0.9
        pz = math.sin(math.radians(angle)) * step * 0.9
        pole.apply_translation((px, 3.5, pz))
        meshes.append(pole)
        lamp = box(1.2, 0.25, 0.5, palette["window_lit"])
        lamp.apply_translation((px, 7.0, pz))
        meshes.append(lamp)

    scene = trimesh.Scene()
    for m in meshes:
        scene.add_geometry(m)
    return scene


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--seed", type=int, default=7)
    ap.add_argument("--blocks", type=int, default=1, help="blocks per side")
    ap.add_argument("--block-size", type=float, default=60.0)
    ap.add_argument("--palette", default="neon", choices=list(PALETTES))
    ap.add_argument("--out", default="city-block.glb")
    args = ap.parse_args()

    scenes = []
    for bx in range(args.blocks):
        for bz in range(args.blocks):
            s = city_block(args.seed + bx * 131 + bz * 17, args.block_size, args.palette)
            off = np.eye(4)
            off[:3, 3] = ((bx - (args.blocks - 1) / 2) * args.block_size, 0,
                          (bz - (args.blocks - 1) / 2) * args.block_size)
            s.apply_transform(off)
            scenes.append(s)
    combined = trimesh.Scene()
    for s in scenes:
        # dump() bakes node transforms into the returned meshes
        for mesh in s.dump(concatenate=False):
            if isinstance(mesh, trimesh.Trimesh):
                combined.add_geometry(mesh)
    combined.export(args.out)
    print(f"Wrote {args.out}: {len(combined.geometry)} geometries, bounds={combined.bounds.tolist()}")


if __name__ == "__main__":
    main()
