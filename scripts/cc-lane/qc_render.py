"""LANE-3DHEAD QC: render accessory assets on a character. Usage:
blender --background --python qc_render.py -- <char_glb> <asset_glb> <out_prefix> [views] [acc_scale]
views: comma list among front,side,turn (default front,side,turn)
acc_scale: uniform scale applied to the accessory armature (default 1.0).
Face=-Y, up=+Z (Blender import space). Workbench render for speed."""
import bpy, os, sys, math

argv = sys.argv[sys.argv.index('--') + 1:]
CHAR, ASSET, PREFIX = argv[0], argv[1], argv[2]
VIEWS = argv[3].split(',') if len(argv) > 3 else ['front', 'side', 'turn']
ACC_SCALE = float(argv[4]) if len(argv) > 4 else 1.0
HIDE = argv[5] if len(argv) > 5 else ''

bpy.ops.import_scene.gltf(filepath=CHAR)
if HIDE:
    for o in bpy.data.objects:
        if o.type == 'MESH':
            mats = [s.material.name if s.material else '' for s in o.material_slots]
            if HIDE in o.name or any(HIDE in m for m in mats):
                o.hide_render = True
                o.hide_viewport = True
    print('hid meshes containing:', HIDE)
char_arm = None
for o in bpy.data.objects:
    if o.type == 'ARMATURE':
        char_arm = o
        break
head_bn = [b.name for b in char_arm.pose.bones if 'Head' in b.name][0]
head_world = char_arm.matrix_world @ char_arm.pose.bones[head_bn].head
print('CHAR', CHAR, 'headbone', head_bn, 'at', tuple(round(v, 3) for v in head_world))

bpy.ops.import_scene.gltf(filepath=ASSET)
acc_arm = None
for o in bpy.data.objects:
    if o.type == 'ARMATURE' and o != char_arm:
        acc_arm = o
        break
# what the game does: bind accessory rig bones onto the character's bones
acc_arm.scale = (ACC_SCALE, ACC_SCALE, ACC_SCALE)
for pb in acc_arm.pose.bones:
    if 'Head' in pb.name:
        c = pb.constraints.new('COPY_TRANSFORMS')
        c.target = char_arm
        c.subtarget = head_bn

sc = bpy.context.scene
sc.render.engine = 'BLENDER_EEVEE'
sc.eevee.taa_render_samples = 24
sc.render.resolution_x = 512
sc.render.resolution_y = 512
sc.render.film_transparent = False
for o in list(bpy.data.objects):
    if o.type in ('LIGHT', 'CAMERA'):
        bpy.data.objects.remove(o)
bpy.ops.object.camera_add(location=(0.45, -1.05, 1.66))
cam = bpy.context.view_layer.objects.active
sc.camera = cam
bpy.ops.object.empty_add(location=(0, -0.02, 1.55))
tgt = bpy.context.view_layer.objects.active
tc = cam.constraints.new('TRACK_TO')
tc.target = tgt
tc.track_axis = 'TRACK_NEGATIVE_Z'
tc.up_axis = 'UP_Y'

def frame(v):
    hx, hy, hz = head_world
    if v == 'front':
        cam.location = (hx + 0.42, hy - 1.02, hz + 0.10)
    elif v == 'side':
        cam.location = (hx + 1.05, hy - 0.02, hz + 0.05)
    elif v == 'turn':
        cam.location = (hx + 0.42, hy - 1.02, hz + 0.10)
    tgt.location = (hx, hy - 0.01, hz + 0.03)

for v in VIEWS:
    char_arm.pose.bones[head_bn].rotation_mode = 'XYZ'
    if v == 'turn':
        char_arm.pose.bones[head_bn].rotation_euler = (0, 0, 0.45)
    else:
        char_arm.pose.bones[head_bn].rotation_euler = (0, 0, 0)
    bpy.context.view_layer.update()
    frame(v)
    sc.render.filepath = '%s_%s.png' % (PREFIX, v)
    bpy.ops.render.render(write_still=True)
    print('wrote', sc.render.filepath)
