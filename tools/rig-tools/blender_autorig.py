#!/usr/bin/env python3
"""
Blender auto-rig: fit a Mixamo-compatible armature to an unrigged GLB
and skin with automatic weights.

Usage:
  blender -b --python blender_autorig.py -- <input.glb> <output.glb> <hierarchy.json>

The hierarchy JSON is a list of [name, parent_name, translation] from a
reference rigged model. The armature is scaled to the target model's
bounding box and positioned at its center.

License: MIT (written for AshLanev2, 2026-10-07)
"""
import bpy
import json
import sys
import os
from mathutils import Vector

# Parse args after --
argv = sys.argv
try:
    idx = argv.index("--")
    args = argv[idx + 1:]
except ValueError:
    args = []
if len(args) < 3:
    print("Usage: blender -b --python blender_autorig.py -- <input.glb> <output.glb> <hierarchy.json>")
    sys.exit(1)

input_glb, output_glb, hier_path = args[0], args[1], args[2]

# Clear scene
bpy.ops.wm.read_factory_settings(use_empty=True)

# Import GLB
bpy.ops.import_scene.gltf(filepath=input_glb)
print(f"Imported {input_glb}")

# Collect meshes, bake parent transforms, compute combined bounding box
meshes = [o for o in bpy.context.scene.objects if o.type == 'MESH']
if not meshes:
    print("ERROR: no meshes found")
    sys.exit(1)

# Clear parents (keep world transforms) and apply scale — prevents
# scaled-empty hierarchies from exploding on armature parent
bpy.ops.object.select_all(action='DESELECT')
for m in meshes:
    m.select_set(True)
bpy.context.view_layer.objects.active = meshes[0]
bpy.ops.object.parent_clear(type='CLEAR_KEEP_TRANSFORM')
bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
print(f"Baked transforms on {len(meshes)} meshes")

# World-space bounding box
all_corners = []
for m in meshes:
    # Ensure transforms applied for bbox calc
    for c in m.bound_box:
        all_corners.append(m.matrix_world @ Vector(c))
xs = [c.x for c in all_corners]
ys = [c.y for c in all_corners]
zs = [c.z for c in all_corners]
bbox_min = Vector((min(xs), min(ys), min(zs)))
bbox_max = Vector((max(xs), max(ys), max(zs)))
bbox_size = bbox_max - bbox_min
bbox_center = (bbox_min + bbox_max) / 2
print(f"BBox: min={bbox_min}, max={bbox_max}, size={bbox_size}")

# Load hierarchy
with open(hier_path) as f:
    hierarchy = json.load(f)  # [name, parent, [tx, ty, tz]]


model_height = bbox_size.z  # Z-up in Blender
print(f"Model height: {model_height:.3f}, using anatomical proportions")

# Anatomical proportions (height fraction from ground) for T-pose humanoid
PROPORTIONS = {
    "Hips": 0.52, "Spine": 0.58, "Spine1": 0.64, "Spine2": 0.70,
    "Neck": 0.80, "Head": 0.86,
    "RightShoulder": 0.78, "LeftShoulder": 0.78,
    "RightArm": 0.78, "LeftArm": 0.78,
    "RightForeArm": 0.78, "LeftForeArm": 0.78,
    "RightHand": 0.78, "LeftHand": 0.78,
    "RightUpLeg": 0.50, "LeftUpLeg": 0.50,
    "RightLeg": 0.28, "LeftLeg": 0.28,
    "RightFoot": 0.05, "LeftFoot": 0.05,
    "RightToeBase": 0.02, "LeftToeBase": 0.02,
}
# Lateral (X) positions as fraction of bbox width from center
# Right = -X, Left = +X (Blender Z-up, model faces +Y)
LATERAL = {
    "RightShoulder": -0.22, "LeftShoulder": 0.22,
    "RightArm": -0.30, "LeftArm": 0.30,
    "RightForeArm": -0.42, "LeftForeArm": 0.42,
    "RightHand": -0.52, "LeftHand": 0.52,
    "RightUpLeg": -0.10, "LeftUpLeg": 0.10,
    "RightLeg": -0.10, "LeftLeg": 0.10,
    "RightFoot": -0.10, "LeftFoot": 0.10,
    "RightToeBase": -0.10, "LeftToeBase": 0.10,
}

# Create armature
arm_data = bpy.data.armatures.new("MixamoRig")
arm_obj = bpy.data.objects.new("MixamoRig", arm_data)
bpy.context.scene.collection.objects.link(arm_obj)
bpy.context.view_layer.objects.active = arm_obj
bpy.ops.object.mode_set(mode='EDIT')

def joint_world(name):
    """World position for a joint using proportions."""
    h_frac = PROPORTIONS.get(name)
    if h_frac is None:
        return None
    x_frac = LATERAL.get(name, 0.0)
    return Vector((
        bbox_center.x + x_frac * bbox_size.x,
        bbox_center.y,
        bbox_min.z + h_frac * bbox_size.z,
    ))

# Build bones in hierarchy order
edit_bones = {}
world_heads = {}
for name, parent, t in hierarchy:
    pos = joint_world(name)
    if pos is None:
        # Finger bones etc: place relative to parent with small offset
        if parent and parent in world_heads:
            # Small offset in the direction parent was going, or downward
            ppos = world_heads[parent]
            # Fingers extend outward from hand
            if 'Thumb' in name:
                off = Vector((0.03 if 'Left' in name else -0.03, 0.02, -0.01))
            else:
                off = Vector((0.02 if 'Left' in name else -0.02, 0, -0.01))
            # Chain: each subsequent bone goes further
            idx = 1
            for suffix in ['1', '2', '3']:
                if name.endswith(suffix):
                    idx = int(suffix)
                    break
            pos = ppos + off * idx
        else:
            pos = bbox_center
    world_heads[name] = pos

for name, parent, t in hierarchy:
    b = arm_data.edit_bones.new(name)
    head = world_heads[name]
    b.head = head
    children = [h for h in hierarchy if h[1] == name]
    if children:
        b.tail = world_heads[children[0][0]]
    else:
        if parent and parent in world_heads:
            d = (head - world_heads[parent])
            if d.length > 0.001:
                b.tail = head + d.normalized() * 0.03
            else:
                b.tail = head + Vector((0, 0, 0.03))
        else:
            b.tail = head + Vector((0, 0, 0.03))
    edit_bones[name] = b

# Set parents
for name, parent, t in hierarchy:
    if parent and parent in edit_bones:
        edit_bones[name].parent = edit_bones[parent]

# Validate: no zero-length bones (breaks glTF export)
for name, b in edit_bones.items():
    if (b.tail - b.head).length < 0.001:
        # Extend along Z
        b.tail = b.head + Vector((0, 0, 0.05))
        print(f"  Fixed zero-length bone: {name}")

bpy.ops.object.mode_set(mode='OBJECT')

# Decimate high-poly meshes before weighting (Blender chokes on 1M+ verts)
for m in meshes:
    vert_count = len(m.data.vertices)
    if vert_count > 100000:
        ratio = 100000 / vert_count
        dec = m.modifiers.new(name="Decimate", type='DECIMATE')
        dec.ratio = max(ratio, 0.05)
        bpy.ops.object.select_all(action='DESELECT')
        m.select_set(True)
        bpy.context.view_layer.objects.active = m
        bpy.ops.object.modifier_apply(modifier=dec.name)
        print(f"  Decimated {m.name}: {vert_count:,} -> {len(m.data.vertices):,} verts")

# Parent meshes to armature with automatic weights
# First join meshes? No — keep separate, parent each
bpy.context.view_layer.objects.active = arm_obj
for m in meshes:
    # Select mesh then armature
    bpy.ops.object.select_all(action='DESELECT')
    m.select_set(True)
    arm_obj.select_set(True)
    bpy.context.view_layer.objects.active = arm_obj
    try:
        bpy.ops.object.parent_set(type='ARMATURE_AUTO')
        print(f"  Parented {m.name} with automatic weights")
    except Exception as e:
        print(f"  WARNING: auto weights failed for {m.name}: {e}")
        # Fallback: parent with empty groups
        bpy.ops.object.parent_set(type='ARMATURE')

bpy.ops.object.select_all(action='DESELECT')

# Cleanup: drop empty vertex groups; unparent meshes with no weights at all
# (auto-weights can fail on props/weapons; a skin with zero-weighted groups
# crashes the glTF exporter in add_neutral_bones, Blender 4.0.2)
for m in meshes:
    if m.type != 'MESH':
        continue
    idx_of = {g.index: g for g in m.vertex_groups}
    totals = {gi: 0.0 for gi in idx_of}
    for v in m.data.vertices:
        for ge in v.groups:
            if ge.group in totals:
                totals[ge.group] += ge.weight
    for gi, t in totals.items():
        if t < 1e-6:
            m.vertex_groups.remove(idx_of[gi])
    if not m.vertex_groups:
        # No weights: unparent, keep world transform; props ride along statically
        mat = m.matrix_world.copy()
        m.parent = None
        m.matrix_world = mat
        for mod in [x for x in m.modifiers if x.type == 'ARMATURE']:
            m.modifiers.remove(mod)
        print(f"  Unparented {m.name}: no skin weights (prop)")
    else:
        print(f"  {m.name}: {len(m.vertex_groups)} weighted groups")

# Export GLB
bpy.ops.export_scene.gltf(
    filepath=output_glb,
    export_format='GLB',
    export_skins=True,
    export_animations=False,
)
print(f"Exported {output_glb}")
print("DONE")
