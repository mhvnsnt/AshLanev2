#!/usr/bin/env python3
"""mesh_ops.py — headless mesh toolkit for the HANDS workstream.

Pure-Python fallback for the ops agents need most (no Blender required):
  info, decimate, weld, fill-holes, transform, bake, merge, rescale, convert.

Built on trimesh (BSD-3-Clause) + numpy. Decimation uses fast-simplification
(Apache-2.0) when installed; the script tells you the pip command when it isn't.

Every op prints a single JSON report to stdout:
  {"ok": true, "op": "...", "in": ..., "out": ..., "before": {...}, "after": {...}}

Usage:
  python3 mesh_ops.py info --in model.glb
  python3 mesh_ops.py decimate --in model.glb --out small.glb --ratio 0.5
  python3 mesh_ops.py weld --in model.glb --out welded.glb
  python3 mesh_ops.py fill-holes --in model.glb --out fixed.glb
  python3 mesh_ops.py transform --in model.glb --out moved.glb --translate 1,0,0 --rotate 0,90,0 --scale 1.2
  python3 mesh_ops.py bake --in model.glb --out baked.glb        # apply scene-graph transforms, one mesh
  python3 mesh_ops.py merge --in a.glb --in b.glb --out both.glb
  python3 mesh_ops.py rescale --in model.glb --out tall.glb --height 1.8
  python3 mesh_ops.py convert --in model.glb --out model.obj     # glb/gltf/obj/stl/ply

Repo home: tools/hands/mesh/
"""
import argparse
import json
import math
import os
import sys

import numpy as np
import trimesh


def stats_of(scene_or_mesh):
    """Compact stats dict for before/after comparisons."""
    if isinstance(scene_or_mesh, trimesh.Scene):
        geoms = list(scene_or_mesh.geometry.values())
        v = sum(len(g.vertices) for g in geoms)
        f = sum(len(g.faces) for g in geoms)
        nodes = len(scene_or_mesh.graph.nodes_geometry)
    else:
        v, f = len(scene_or_mesh.vertices), len(scene_or_mesh.faces)
        geoms, nodes = [scene_or_mesh], 1
    try:
        bounds = scene_or_mesh.bounds
        size = (bounds[1] - bounds[0]).tolist()
    except Exception:
        size = None
    watertight = all(getattr(g, "is_watertight", False) for g in geoms)
    return {"vertices": int(v), "faces": int(f), "meshes": len(geoms),
            "nodes": int(nodes), "size_xyz": size, "watertight": bool(watertight)}


def load(path):
    scene = trimesh.load(path, force="scene")
    if isinstance(scene, trimesh.Trimesh):
        s = trimesh.Scene()
        s.add_geometry(scene)
        return s
    return scene


def bake_scene(scene):
    """Concatenate every geometry with its node transform applied -> one Trimesh."""
    try:
        return scene.to_geometry()
    except Exception:
        dumped = scene.dump()
        if isinstance(dumped, trimesh.Scene):
            return dumped.to_geometry()
        return dumped


def save(mesh_or_scene, path):
    ext = os.path.splitext(path)[1].lower()
    if ext == ".glb":
        data = mesh_or_scene.export(file_type="glb")
    elif ext == ".gltf":
        data = mesh_or_scene.export(file_type="gltf")
    elif ext == ".obj":
        data = mesh_or_scene.export(file_type="obj")
    elif ext == ".stl":
        data = mesh_or_scene.export(file_type="stl")
    elif ext == ".ply":
        data = mesh_or_scene.export(file_type="ply")
    else:
        raise ValueError(f"unsupported output extension: {ext}")
    mode = "wb" if isinstance(data, (bytes, bytearray)) else "w"
    with open(path, mode) as f:
        f.write(data)


def op_info(args):
    scene = load(args.in_[0])
    return {"stats": stats_of(scene)}


def op_decimate(args):
    try:
        import fast_simplification  # noqa: F401
    except ImportError:
        raise SystemExit("decimate needs the 'fast-simplification' package: pip install fast-simplification")
    scene = load(args.in_[0])
    before = stats_of(scene)
    target = max(4, int(before["faces"] * args.ratio))
    geoms = []
    for name, geom in scene.geometry.items():
        if len(geom.faces) <= 4:
            geoms.append(geom)
            continue
        simp = geom.simplify_quadric_decimation(percent=max(0.01, min(1.0, args.ratio)))
        geoms.append(simp)
    out = trimesh.util.concatenate(geoms) if len(geoms) > 1 else geoms[0]
    save(out, args.out)
    return {"stats": stats_of(out)}


def _dedup_faces(geom):
    """Remove duplicate faces (trimesh 5.x dropped remove_duplicate_faces)."""
    if len(geom.faces) == 0:
        return geom
    order = np.sort(geom.faces, axis=1)
    _, unique = np.unique(order, axis=0, return_index=True)
    geom.update_faces(np.sort(unique))
    return geom


def op_weld(args):
    scene = load(args.in_[0])
    before = stats_of(scene)
    geoms = []
    for geom in scene.geometry.values():
        g = geom.copy()
        g.merge_vertices()
        _dedup_faces(g)
        g.remove_infinite_values()
        geoms.append(g)
    out = trimesh.util.concatenate(geoms) if len(geoms) > 1 else geoms[0]
    save(out, args.out)
    return {"before": before, "after": stats_of(out)}


def op_fill_holes(args):
    scene = load(args.in_[0])
    before = stats_of(scene)
    geoms = []
    for geom in scene.geometry.values():
        g = geom.copy()
        trimesh.repair.fill_holes(g)
        geoms.append(g)
    out = trimesh.util.concatenate(geoms) if len(geoms) > 1 else geoms[0]
    save(out, args.out)
    return {"before": before, "after": stats_of(out)}


def _matrix(translate, rotate_deg, scale):
    t = np.array(translate, dtype=float)
    r = np.radians(np.array(rotate_deg, dtype=float))
    cx, sx = math.cos(r[0]), math.sin(r[0])
    cy, sy = math.cos(r[1]), math.sin(r[1])
    cz, sz = math.cos(r[2]), math.sin(r[2])
    # XYZ euler
    Rx = np.array([[1, 0, 0], [0, cx, -sx], [0, sx, cx]])
    Ry = np.array([[cy, 0, sy], [0, 1, 0], [-sy, 0, cy]])
    Rz = np.array([[cz, -sz, 0], [sz, cz, 0], [0, 0, 1]])
    R = Rz @ Ry @ Rx
    s = np.array(scale, dtype=float)
    M = np.eye(4)
    M[:3, :3] = R * s
    M[:3, 3] = t
    return M


def op_transform(args):
    scene = load(args.in_[0])
    before = stats_of(scene)
    M = _matrix(args.translate, args.rotate, args.scale)
    scene.apply_transform(M)
    save(scene, args.out)
    return {"before": before, "after": stats_of(scene)}


def op_bake(args):
    """Apply all scene-graph node transforms and merge to a single mesh."""
    scene = load(args.in_[0])
    before = stats_of(scene)
    out = bake_scene(scene)
    save(out, args.out)
    return {"before": before, "after": stats_of(out)}


def op_merge(args):
    scenes = [load(p) for p in args.in_]
    before = [stats_of(s) for s in scenes]
    baked = [bake_scene(s) for s in scenes]
    out = trimesh.util.concatenate(baked)
    save(out, args.out)
    return {"inputs": before, "after": stats_of(out)}


def op_rescale(args):
    """Scale so the model's height (Y extent) equals --height meters."""
    scene = load(args.in_[0])
    before = stats_of(scene)
    bounds = scene.bounds
    h = bounds[1][1] - bounds[0][1]
    if h <= 0:
        raise ValueError("model has zero height, cannot rescale")
    s = args.height / h
    M = np.eye(4) * s
    M[3, 3] = 1.0
    # scale about the base (min Y) so feet stay on the ground
    scene.apply_translation([0, -bounds[0][1], 0])
    scene.apply_transform(M)
    save(scene, args.out)
    return {"before": before, "after": stats_of(scene), "scale": s}


def op_convert(args):
    scene = load(args.in_[0])
    before = stats_of(scene)
    save(scene, args.out)
    return {"stats": before}


def parse_triplet(s, name):
    try:
        parts = [float(x) for x in s.split(",")]
        assert len(parts) == 3
        return parts
    except Exception:
        raise argparse.ArgumentTypeError(f"--{name} expects x,y,z (got {s!r})")


def main():
    ap = argparse.ArgumentParser(description="Headless mesh toolkit (trimesh backend).")
    sub = ap.add_subparsers(dest="op", required=True)

    def common(p):
        p.add_argument("--in", dest="in_", action="append", required=True)
        p.add_argument("--out", required=False)

    p = sub.add_parser("info"); common(p)
    p = sub.add_parser("decimate"); common(p)
    p.add_argument("--ratio", type=float, required=True, help="target face fraction, e.g. 0.5")
    p = sub.add_parser("weld"); common(p)
    p = sub.add_parser("fill-holes"); common(p)
    p = sub.add_parser("transform"); common(p)
    p.add_argument("--translate", type=lambda s: parse_triplet(s, "translate"), default=[0, 0, 0])
    p.add_argument("--rotate", type=lambda s: parse_triplet(s, "rotate"), default=[0, 0, 0],
                   help="euler degrees XYZ")
    p.add_argument("--scale", type=lambda s: parse_triplet(s, "scale"), default=[1, 1, 1])
    p = sub.add_parser("bake"); common(p)
    p = sub.add_parser("merge"); common(p)
    p = sub.add_parser("rescale"); common(p)
    p.add_argument("--height", type=float, required=True, help="target Y height in meters")
    p = sub.add_parser("convert"); common(p)

    args = ap.parse_args()
    ops = {"info": op_info, "decimate": op_decimate, "weld": op_weld,
           "fill-holes": op_fill_holes, "transform": op_transform, "bake": op_bake,
           "merge": op_merge, "rescale": op_rescale, "convert": op_convert}
    if args.op != "info" and not args.out:
        ap.error(f"{args.op} requires --out")
    try:
        result = ops[args.op](args)
        print(json.dumps({"ok": True, "op": args.op, "in": args.in_, "out": args.out,
                          **result}, indent=1))
    except SystemExit:
        raise
    except Exception as e:
        print(json.dumps({"ok": False, "op": args.op, "error": str(e)[:300]}))
        sys.exit(1)


if __name__ == "__main__":
    main()
