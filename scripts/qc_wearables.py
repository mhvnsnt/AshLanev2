#!/usr/bin/env python3
"""LANE-3DLIMB QC: wear every asset on CIPHER, pose, render.
Usage: env -u PYTHONPATH blender -b -P qc_wearables.py -- <cipher.glb> <modelsdir> <outdir> [asset_filter]

The <cipher.glb> must be importable by Blender 4.0: the stock
public/models/cast/CIPHER_rigged.glb declares EXT_meshopt_compression in
extensionsRequired without using it, which the importer rejects. Pre-strip it:
  python3 scripts/strip_meshopt_required.py public/models/cast/CIPHER_rigged.glb /tmp/cipher_decoded.glb
and pass /tmp/cipher_decoded.glb as <cipher.glb>.

QC CHECKLIST (permanent - added 2026-10-09 after the fixup lane found defects
the original checklist missed):
- Heeled footwear: heel present and visible.
- Footwear: full foot enclosure, no heel/toe poke-through, no float at ankle
  in BOTH poses.
- Gloves L/R: symmetric shape and coverage in both poses.
- Frame contains only character + wearable (no importer helpers, no scene junk).
"""
import bpy, sys, os, math
from mathutils import Vector

SRC, MODELSDIR, OUTDIR = sys.argv[-3], sys.argv[-2], sys.argv[-1]
FILTER = os.environ.get('QC_FILTER', '')
os.makedirs(OUTDIR, exist_ok=True)

def del_import_helpers():
    """Delete Blender glTF-importer helper objects ('Icosphere' bone-shape
    helpers, parked in the glTF_not_exported collection). They are not part of
    any GLB asset; leaving them pollutes the scene. See pendant lane note:
    docs/CHAIN_PENDANT_FIX.md 'Importer artifact note' (do NOT 'fix' again -
    the helpers are never in the exported files)."""
    n = 0
    for o in [o for o in bpy.data.objects if o.name.startswith('Icosphere')]:
        bpy.data.objects.remove(o, do_unlink=True)
        n += 1
    return n

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=SRC)
del_import_helpers()
CHARM = next(o for o in bpy.data.objects if o.type == 'ARMATURE')
BODY = max((o for o in bpy.data.objects if o.type == 'MESH'),
           key=lambda o: len(o.data.vertices))

def fix_character_weights():
    """CIPHER_rigged.glb ships with confused skin weights around the wrists:
    wrist verts carry thigh/hip/spine weights (the T-pose parks the hands
    against the thighs, confusing the auto-weighter). When the arms pose,
    those verts stay behind while the hand moves, stretching triangles into
    long copper 'blade' artifacts in every render. This is a test-rig defect,
    NOT a wearable defect - fix it at runtime so QC frames contain only
    character + wearable. Reassigns wrist-region verts' non-arm weights to the
    nearest arm bone. Runs once; in-memory only, never saved to the GLB.
    Punch-pose long edges: 185 (baseline) -> 0 (verified)."""
    def seg_dist(p, a, b):
        ab = b - a
        t = max(0.0, min(1.0, (p - a).dot(ab) / max(ab.length_squared, 1e-9)))
        return (p - (a + ab * t)).length
    AW = CHARM.matrix_world
    targets = []
    for side in ('Left', 'Right'):
        for bn in ('Hand', 'ForeArm', 'Arm', 'Shoulder'):
            b = CHARM.data.bones.get(f'mixamorig:{side}{bn}')
            if b:
                targets.append((f'mixamorig:{side}{bn}',
                                AW @ b.head_local, AW @ b.tail_local))
    for vg in BODY.vertex_groups:
        n = vg.name
        if 'Finger' in n or 'Thumb' in n:
            b = CHARM.data.bones.get(n)
            if b:
                targets.append((n, AW @ b.head_local, AW @ b.tail_local))
    WRONG = ('UpLeg', 'Leg', 'Hips', 'Spine', 'Spine1', 'Spine2',
             'Neck', 'Head', 'ToeBase', 'Foot')
    fixed = 0
    BW = BODY.matrix_world
    for v in BODY.data.vertices:
        co = BW @ v.co
        best, bd = None, 1e9
        for bn, a, b in targets:
            d = seg_dist(co, a, b)
            if d < bd:
                bd, best = d, bn
        if bd < 0.08:
            moves = []
            for g in v.groups:
                gn = BODY.vertex_groups[g.group].name
                # 0.05 threshold catches the small residual blades; 8cm radius
                # keeps the fix on the arm (not the torso).
                if any(w in gn for w in WRONG) and g.weight > 0.05:
                    moves.append((gn, g.weight))
            for gn, w in moves:
                BODY.vertex_groups[gn].remove([v.index])
                BODY.vertex_groups[best].add([v.index], w, 'ADD')
                fixed += 1
    for v in BODY.data.vertices:
        tot = sum(g.weight for g in v.groups)
        if tot > 0 and abs(tot - 1.0) > 0.001:
            for g in v.groups:
                g.weight /= tot
    print('character weight fix: reassigned', fixed, 'verts')
    return fixed

fix_character_weights()
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
    del_import_helpers()
    # del_import_helpers() invalidates removed objects; rebuild the list
    return [o for o in bpy.data.objects
            if o not in before and not o.name.startswith('Icosphere')]

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
