#!/usr/bin/env python3
"""Deformation test: import rigged GLB, rotate Hips 30deg in pose mode,
measure how far a hip-region vertex moved in the evaluated mesh.
Usage: blender -b --python pose_test.py -- <input.glb>
"""
import bpy, sys
from mathutils import Vector
argv = sys.argv
args = argv[argv.index("--") + 1:]
assert args, "usage: pose_test.py <in.glb>"
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=args[0])
arms = [o for o in bpy.data.objects if o.type == 'ARMATURE']
assert arms, "no armature found"
arm = arms[0]
print("armature:", arm.name, "bones:", len(arm.data.bones))
meshes = [o for o in bpy.data.objects if o.type == 'MESH']
print("meshes:", len(meshes))

# pick body mesh: the one with most verts
body = max(meshes, key=lambda m: len(m.data.vertices))

def mesh_bbox_center_eval(obj):
    dg = bpy.context.evaluated_depsgraph_get()
    ev = obj.evaluated_get(dg)
    me = ev.to_mesh()
    vs = [ev.matrix_world @ v.co for v in me.vertices]
    ev.to_mesh_clear()
    c = Vector((0,0,0))
    for v in vs: c += v
    return c / len(vs), vs

rest_center, _ = mesh_bbox_center_eval(body)
print("rest center:", tuple(round(x,4) for x in rest_center))

# pose Hips 30 deg around X
bpy.context.view_layer.objects.active = arm
bpy.ops.object.mode_set(mode='POSE')
pb = arm.pose.bones.get('Hips')
assert pb is not None, "Hips bone missing"
pb.rotation_mode = 'XYZ'
pb.rotation_euler[0] = 0.5236
bpy.context.view_layer.update()

posed_center, posed_vs = mesh_bbox_center_eval(body)
print("posed center:", tuple(round(x,4) for x in posed_center))
disp = (posed_center - rest_center).length
print("center displacement:", round(disp, 4))
# max vertex displacement on the posed mesh vs rest
dg = bpy.context.evaluated_depsgraph_get()
bpy.ops.object.mode_set(mode='OBJECT')
bpy.context.view_layer.objects.active = arm
bpy.ops.object.mode_set(mode='POSE')
pb.rotation_euler[0] = 0.0
bpy.context.view_layer.update()
rest_center2, rest_vs = mesh_bbox_center_eval(body)
bpy.ops.object.mode_set(mode='POSE')
pb.rotation_euler[0] = 0.5236
bpy.context.view_layer.update()
_, posed_vs = mesh_bbox_center_eval(body)
bpy.ops.object.mode_set(mode='OBJECT')
maxd = max((a-b).length for a,b in zip(rest_vs, posed_vs))
print("max vertex displacement:", round(maxd, 4))
print("DEFORM_OK" if maxd > 0.05 else "DEFORM_FAIL")
