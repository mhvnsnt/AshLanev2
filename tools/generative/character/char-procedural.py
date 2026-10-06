#!/usr/bin/env python3
"""
char-procedural.py — AshLane character pipeline (CPU assembly stage).

Builds a stylized fighter character from primitives with trimesh.
This is the fallback/proof stage of the character pipeline: it proves
assembly -> postprocess -> rig -> validate -> render works end to end
on CPU. The AI stage (TripoSR/TRELLIS/Shap-E, GPU-gated) feeds the same
downstream stages.

Usage:
    python3 char-procedural.py --output fighter-raw.glb [--style brawler]

License: MIT.
"""
import argparse
import numpy as np
import trimesh

def limb(r1, r2, length, color):
    """Tapered limb segment along +Y, base at origin."""
    m = trimesh.creation.cylinder(radius=r1, height=length * 0.5)
    # taper: scale top verts
    v = m.vertices.copy()
    top = v[:, 1] > 0
    v[top, 0] *= r2 / r1; v[top, 2] *= r2 / r1
    m.vertices = v
    m.visual = trimesh.visual.ColorVisuals(m, vertex_colors=np.tile(
        (np.array(color) * 255).astype(np.uint8), (len(v), 1)))
    return m

def ball(r, color):
    m = trimesh.creation.icosphere(radius=r, subdivisions=2)
    m.visual = trimesh.visual.ColorVisuals(m, vertex_colors=np.tile(
        (np.array(color) * 255).astype(np.uint8), (len(m.vertices), 1)))
    return m

def box(w, h, d, color):
    m = trimesh.creation.box(extents=(w, h, d))
    m.visual = trimesh.visual.ColorVisuals(m, vertex_colors=np.tile(
        (np.array(color) * 255).astype(np.uint8), (len(m.vertices), 1)))
    return m

def place(mesh, x, y, z, rx=0, ry=0, rz=0):
    T = trimesh.transformations.euler_matrix(rx, ry, rz)
    T[:3, 3] = [x, y, z]
    mesh.apply_transform(T)
    return mesh

SKIN = [0.72, 0.53, 0.38]
SHIRT = [0.16, 0.18, 0.24]
PANTS = [0.22, 0.24, 0.30]
GLOVE = [0.75, 0.18, 0.16]
BOOT = [0.12, 0.11, 0.10]

def build_fighter():
    parts = []
    # torso
    parts.append(place(box(0.52, 0.62, 0.30, SHIRT), 0, 1.32, 0))
    # head
    parts.append(place(ball(0.16, SKIN), 0, 1.86, 0))
    # mohawk
    parts.append(place(box(0.06, 0.14, 0.30, GLOVE), 0, 2.02, -0.02))
    # arms: shoulder -> elbow -> hand
    for s in (-1, 1):
        parts.append(place(limb(0.09, 0.075, 0.34, SHIRT), s * 0.34, 1.52, 0, rz=s * -0.25))
        parts.append(place(limb(0.075, 0.06, 0.32, SKIN), s * 0.44, 1.22, 0, rz=s * -0.15))
        parts.append(place(ball(0.11, GLOVE), s * 0.50, 1.02, 0))  # boxing glove
    # legs
    for s in (-1, 1):
        parts.append(place(limb(0.11, 0.09, 0.46, PANTS), s * 0.15, 0.78, 0))
        parts.append(place(limb(0.09, 0.07, 0.44, SKIN), s * 0.15, 0.34, 0))
        parts.append(place(box(0.14, 0.12, 0.28, BOOT), s * 0.15, 0.06, 0.05))
    # belt
    parts.append(place(box(0.54, 0.08, 0.32, GLOVE), 0, 1.02, 0))
    mesh = trimesh.util.concatenate(parts)
    return mesh

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--output', required=True)
    ap.add_argument('--style', default='brawler')
    args = ap.parse_args()
    mesh = build_fighter()
    # trimesh scene export keeps vertex colors
    scene = trimesh.Scene(mesh)
    scene.export(args.output)
    print(f'OK: {args.output} ({len(mesh.faces)} faces, height {mesh.bounds[1][1]:.2f}m)')

if __name__ == '__main__':
    main()
