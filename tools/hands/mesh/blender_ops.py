"""blender_ops.py — headless Blender mesh ops (Blender 5.1.2, --background).

Run: blender --background --python blender_ops.py -- <op> --in in.glb --out out.glb [args]
Ops mirror mesh_ops.py (trimesh backend): info, decimate, weld, transform, merge, rescale.
Prints a single JSON report to stdout.

Use Blender for anything trimesh can't do (armatures, weight transfer, modifiers);
use mesh_ops.py for fast pure-mesh ops.
"""
import argparse
import json
import math
import os
import sys

import bpy

# ---- arg parsing (blender eats argv; ours follow the literal "--") ----
argv = sys.argv
argv = argv[argv.index("--") + 1:] if "--" in argv else []

parser = argparse.ArgumentParser()
parser.add_argument("op", choices=["info", "decimate", "weld", "transform", "merge", "rescale"])
parser.add_argument("--in", dest="in_", action="append", required=True)
parser.add_argument("--out", required=False)
parser.add_argument("--ratio", type=float, default=0.5)
parser.add_argument("--translate", default="0,0,0")
parser.add_argument("--rotate", default="0,0,0", help="euler degrees XYZ")
parser.add_argument("--scale", default="1,1,1")
parser.add_argument("--height", type=float, default=1.8)
args = parser.parse_args(argv)


def triplet(s):
    return [float(x) for x in s.split(",")]


def clear_scene():
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)


def import_glb(path):
    bpy.ops.import_scene.gltf(filepath=path)
    return [o for o in bpy.context.selected_objects]


def stats(objs):
    v = f = 0
    meshes = 0
    for o in objs:
        if o.type == "MESH":
            meshes += 1
            me = o.data
            v += len(me.vertices)
            f += len(me.polygons)
    return {"objects": len(objs), "meshes": meshes, "vertices": v, "faces": f}


def select(objs):
    bpy.ops.object.select_all(action="DESELECT")
    for o in objs:
        o.select_set(True)
    bpy.context.view_layer.objects.active = next((o for o in objs if o.type == "MESH"), objs[0] if objs else None)


def export_glb(path, objs):
    select(objs)
    bpy.ops.export_scene.gltf(filepath=path, export_format="GLB", use_selection=True)


def apply_matrix(objs, mat):
    for o in objs:
        o.matrix_world = mat @ o.matrix_world
    bpy.ops.object.select_all(action="DESELECT")
    for o in objs:
        o.select_set(True)
    bpy.context.view_layer.objects.active = objs[0]
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)


def euler_matrix(rx_deg, ry_deg, rz_deg, scale, trans):
    from mathutils import Euler, Matrix, Vector
    e = Euler((math.radians(rx_deg), math.radians(ry_deg), math.radians(rz_deg)), "XYZ")
    m = Matrix.Translation(Vector(trans)) @ e.to_matrix().to_4x4()
    s = Matrix.Diagonal(Vector((*scale, 1.0)))
    return m @ s


def main():
    clear_scene()
    report = {"ok": True, "op": args.op, "in": args.in_, "out": args.out}
    if args.op == "merge":
        all_objs = []
        for p in args.in_:
            all_objs += import_glb(p)
    else:
        all_objs = import_glb(args.in_[0])
    report["before"] = stats(all_objs)

    if args.op == "info":
        pass
    elif args.op == "decimate":
        for o in all_objs:
            if o.type != "MESH":
                continue
            select([o])
            mod = o.modifiers.new("Decimate", "DECIMATE")
            mod.ratio = max(0.01, min(1.0, args.ratio))
            bpy.context.view_layer.objects.active = o
            bpy.ops.object.modifier_apply(modifier=mod.name)
    elif args.op == "weld":
        for o in all_objs:
            if o.type != "MESH":
                continue
            select([o])
            bpy.ops.object.mode_set(mode="EDIT")
            bpy.ops.mesh.select_all(action="SELECT")
            bpy.ops.mesh.remove_doubles()
            bpy.ops.object.mode_set(mode="OBJECT")
    elif args.op == "transform":
        t, r, s = triplet(args.translate), triplet(args.rotate), triplet(args.scale)
        apply_matrix(all_objs, euler_matrix(r[0], r[1], r[2], s, t))
    elif args.op == "merge":
        select(all_objs)
        bpy.ops.object.join()
        all_objs = [bpy.context.view_layer.objects.active]
    elif args.op == "rescale":
        # scale about base so Y height == target, feet stay grounded
        mins = [o.matrix_world @ v.co for o in all_objs if o.type == "MESH" for v in o.data.vertices]
        if not mins:
            raise RuntimeError("no mesh vertices")
        min_y = min(v.y for v in mins)
        max_y = max(v.y for v in mins)
        h = max_y - min_y
        if h <= 0:
            raise RuntimeError("zero height")
        k = args.height / h
        from mathutils import Matrix
        m = Matrix.Translation((0, min_y * (1 - k), 0)) @ Matrix.Scale(k, 4)
        apply_matrix(all_objs, m)
        report["scale"] = k

    report["after"] = stats(all_objs)
    if args.op != "info":
        if not args.out:
            raise RuntimeError(f"{args.op} requires --out")
        export_glb(args.out, all_objs)
        report["out_bytes"] = os.path.getsize(args.out)
    print("REPORT_JSON:" + json.dumps(report))


try:
    main()
except Exception as e:  # noqa: BLE001 - must surface as JSON for agents
    print("REPORT_JSON:" + json.dumps({"ok": False, "op": args.op, "error": str(e)[:300]}))
    sys.exit(1)
