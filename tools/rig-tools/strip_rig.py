#!/usr/bin/env python3
"""Strip skeleton + skinning from a GLB -> unrigged test input.
Usage: blender -b --python strip_rig.py -- <input.glb> <output.glb>
"""
import bpy, sys
argv = sys.argv
try: args = argv[argv.index("--") + 1:]
except ValueError: args = []
assert len(args) >= 2, "usage: strip_rig.py <in.glb> <out.glb>"
inp, outp = args[0], args[1]
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=inp)
# Delete all armatures; clear vertex groups + modifiers
for o in list(bpy.data.objects):
    if o.type == 'ARMATURE':
        bpy.data.objects.remove(o, do_unlink=True)
for o in bpy.data.objects:
    if o.type == 'MESH':
        o.vertex_groups.clear()
        for m in list(o.modifiers):
            if m.type == 'ARMATURE':
                o.modifiers.remove(m)
bpy.ops.object.select_all(action='DESELECT')
for o in bpy.data.objects:
    if o.type == 'MESH':
        o.select_set(True)
bpy.ops.export_scene.gltf(
    filepath=outp, export_format='GLB',
    export_skins=False, export_animations=False,
    use_selection=True,
)
print("STRIP_DONE", outp)
