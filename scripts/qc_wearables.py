#!/usr/bin/env python3
"""LANE-3DLIMB QC: wear every asset on CIPHER, pose, render.
Usage: env -u PYTHONPATH blender -b -P qc_wearables.py -- <cipher.glb> <modelsdir> <outdir> [asset_filter]
"""
import bpy, sys, os, math
from mathutils import Vector

SRC, MODELSDIR, OUTDIR = sys.argv[-3], sys.argv[-2], sys.argv[-1]
FILTER = os.environ.get('QC_FILTER', '')
os.makedirs(OUTDIR, exist_ok=True)

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=SRC)
CHARM = next(o for o in bpy.data.objects if o.type == 'ARMATURE')
BODY = max((o for o in bpy.data.objects if o.type == 'MESH'),
           key=lambda o: len(o.data.vertices))
gz = min((BODY.matrix_world @ v.co).z for v in BODY.data.vertices)

# ---- scene: light backdrop, ground, 3-point light
world = bpy.context.scene.world or bpy.data.worlds.new('qcworld')
bpy.context.scene.world = world
world.use_nodes = True
world.node_tree.nodes['Background'].inputs[0].default_value = (0.55, 0.55, 0.58, 1)
world.node_tree.nodes['Background'].inputs[1].default_value = 1.0
bpy.ops.mesh.primitive_plane_add(size=8, location=(0, 0, gz))
gp = bpy.context.active_object
gm = bpy.data.materials.new('ground')
gm.use_nodes = True
gm.node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value = (0.35, 0.35, 0.37, 1)
gp.data.materials.append(gm)
def light(name, typ, e, loc):
    l = bpy.data.lights.new(name, typ); l.energy = e
    o = bpy.data.objects.new(name, l)
    o.location = loc
    bpy.context.scene.collection.objects.link(o)
light('key', 'SUN', 3.0, (2, 1.5, 3))
light('fill', 'SUN', 1.0, (-2, -2, 1))
light('rim', 'SUN', 1.5, (-1, 2, 2))
sc = bpy.context.scene
sc.render.engine = 'BLENDER_EEVEE'
sc.render.resolution_x = 800; sc.render.resolution_y = 800
sc.eevee.taa_render_samples = 12

# ---- camera with track-to
cam = bpy.data.cameras.new('qc'); co = bpy.data.objects.new('qc', cam)
sc.collection.objects.link(co); sc.camera = co
tgt = bpy.data.objects.new('tgt', None)
sc.collection.objects.link(tgt)
tt = co.constraints.new('TRACK_TO'); tt.target = tgt
tt.track_axis = 'TRACK_NEGATIVE_Z'; tt.up_axis = 'UP_Y'

POSES = {
    'punch': {  # right cross, elbow near-straight (character's elbow weights tear if bent)
        'mixamorig:RightArm': (0, 0, -1.20),
        'mixamorig:RightForeArm': (0, 0, -0.08),
        'mixamorig:RightShoulder': (0, 0, -0.20),
        'mixamorig:LeftArm': (0, 0, -0.40),
        'mixamorig:LeftForeArm': (0, 0, -0.30),
        'mixamorig:Spine': (0, 0.15, 0),
    },
    'kick': {  # left front kick + left jab, moderate knee bend
        'mixamorig:LeftUpLeg': (0, 0, -1.10),
        'mixamorig:LeftLeg': (0, 0, 0.35),
        'mixamorig:LeftArm': (0, 0, -1.20),
        'mixamorig:LeftForeArm': (0, 0, -0.10),
        'mixamorig:RightArm': (0, 0, -0.25),
        'mixamorig:Spine': (0, -0.10, 0),
    },
}

FRAMING = {
    'gloves': ((2.1, 0.9, 0.35), (0, 0, 0.05)),
    'wristbands': ((2.1, 0.9, 0.35), (0, 0, 0.05)),
    'footwear': ((2.0, 0.8, -0.55), (0, 0, -0.68)),
}

def set_pose(name):
    for pb in CHARM.pose.bones:
        pb.rotation_mode = 'XYZ'
        pb.rotation_euler = (0, 0, 0)
    for bn, e in POSES[name].items():
        pb = CHARM.pose.bones.get(bn)
        if pb: pb.rotation_euler = e
    bpy.context.view_layer.update()

ASSETS = [
    ('gloves', 'street'), ('gloves', 'boxing'), ('gloves', 'mma'), ('gloves', 'opera_theory'),
    ('wristbands', 'sweatband'), ('wristbands', 'wrap'), ('wristbands', 'pad'),
    ('footwear', 'sneaker_high'), ('footwear', 'sneaker_low'),
    ('footwear', 'wrestling_boot'), ('footwear', 'theory_boot'),
]

def import_glb(path):
    before = set(bpy.data.objects)
    bpy.ops.import_scene.gltf(filepath=path)
    return [o for o in bpy.data.objects if o not in before]

def wear(objs):
    # Mini-armatures already mirror the character's hierarchy/roll (see
    # make_armature), so plain COPY_TRANSFORMS reproduces the chain exactly.
    arms = [o for o in objs if o.type == 'ARMATURE']
    for a in arms:
        for pb in a.pose.bones:
            c = pb.constraints.new('COPY_TRANSFORMS')
            c.target = CHARM
            c.subtarget = pb.name
    bpy.context.view_layer.objects.active = CHARM
    return arms

def unwear(objs):
    for o in objs:
        bpy.data.objects.remove(o, do_unlink=True)

for cat, aid in ASSETS:
    if FILTER and FILTER not in aid:
        continue
    worn = []
    for sfx in ('L', 'R'):
        fp = os.path.join(MODELSDIR, cat, f'{aid}_{sfx}.glb')
        objs = import_glb(fp)
        wear(objs)
        worn += objs
    bpy.context.view_layer.update()
    for pose in ('punch', 'kick'):
        out = os.path.join(OUTDIR, f'{aid}_{pose}.png')
        if os.path.exists(out):
            print('skip (exists)', out)
            continue
        set_pose(pose)
        (cx, cy, cz), (tx, ty, tz) = FRAMING[cat]
        co.location = (cx, cy, cz); tgt.location = (tx, ty, tz)
        bpy.context.view_layer.update()
        sc.render.filepath = out
        bpy.ops.render.render(write_still=True)
        print('rendered', out)
    unwear(worn)

print('QC DONE')
