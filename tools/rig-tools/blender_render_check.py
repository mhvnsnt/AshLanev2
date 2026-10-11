#!/usr/bin/env python3
"""
Render a rigged GLB for visual QA: front view with armature visible.
Usage: blender -b --python blender_render_check.py -- <input.glb> <output.png>
"""
import bpy
import sys

argv = sys.argv
try:
    args = argv[argv.index("--") + 1:]
except ValueError:
    args = []
if len(args) < 2:
    print("Usage: blender -b --python blender_render_check.py -- <input.glb> <output.png>")
    sys.exit(1)

input_glb, output_png = args[0], args[1]
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=input_glb)

# Show armature
for o in bpy.context.scene.objects:
    if o.type == 'ARMATURE':
        o.show_in_front = True
        # Show as octahedral
        o.data.display_type = 'OCTAHEDRAL'

# Camera: front view, framed on bounding box
import math
from mathutils import Vector
# Compute scene bounds
all_cos = []
for o in bpy.context.scene.objects:
    if o.type == 'MESH':
        for c in o.bound_box:
            all_cos.append(o.matrix_world @ Vector(c))
if all_cos:
    mn = Vector((min(c.x for c in all_cos), min(c.y for c in all_cos), min(c.z for c in all_cos)))
    mx = Vector((max(c.x for c in all_cos), max(c.y for c in all_cos), max(c.z for c in all_cos)))
    center = (mn + mx) / 2
    height = mx.z - mn.z
else:
    center = Vector((0, 0, 1.0))
    height = 1.8
dist = height * 2.2
bpy.ops.object.camera_add(location=(center.x, center.y - dist, center.z))
cam = bpy.context.active_object
cam.data.lens = 50
direction = center - cam.location
cam.rotation_euler = direction.to_track_quat('-Z', 'Y').to_euler()

# Light
bpy.ops.object.light_add(type='SUN', location=(2, -2, 4))
sun = bpy.context.active_object
sun.data.energy = 3.0
bpy.ops.object.light_add(type='SUN', location=(-2, -2, 2))
fill = bpy.context.active_object
fill.data.energy = 1.0

# Render settings
scene = bpy.context.scene
scene.camera = cam
scene.render.engine = 'BLENDER_EEVEE'
scene.render.resolution_x = 800
scene.render.resolution_y = 1000
scene.render.resolution_percentage = 100
scene.render.film_transparent = True
scene.render.filepath = output_png
scene.render.image_settings.file_format = 'PNG'

bpy.ops.render.render(write_still=True)
print(f"Rendered {output_png}")
