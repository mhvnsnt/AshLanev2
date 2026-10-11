"""LANE-3DHEAD: hairstyles. FACE=-Y, up=+Z (Blender import space).
Authored in ASTRID space (head bone y=1.5232 glTF meters); manifest scale=1.0.
Sources: quaternius Hair_Long/Hair_Beard (CC0), toon dread ponytail (CC0, tiko479)."""
import bpy, os, math, json
import numpy as np

WORK = os.path.expanduser('~/workspace/game-sweep/cc-3dhead')
PULLS = os.path.expanduser('~/workspace/customization-pulls')
OUT = os.path.join(WORK, 'public/models/hair')
os.makedirs(os.path.join(OUT, 'qc'), exist_ok=True)

bpy.ops.import_scene.gltf(filepath=os.path.join(WORK, 'public/models/cast/ASTRID.glb'))
ref_arm = [o for o in bpy.data.objects if o.type == 'ARMATURE'][0]
ASTRID_HEAD = ref_arm.matrix_world @ ref_arm.pose.bones['Head'].head
print('ASTRID head:', tuple(round(v, 4) for v in ASTRID_HEAD))

CHAIN_SRC = ['Spine2', 'Neck', 'Head']
CHAIN = ['mixamorig:Spine2', 'mixamorig:Neck', 'mixamorig:Head']
BONE_XF = {}
for bs, bn in zip(CHAIN_SRC, CHAIN):
    b = ref_arm.pose.bones[bs]
    BONE_XF[bn] = (ref_arm.matrix_world @ b.head, ref_arm.matrix_world @ b.tail)
Z_HEAD = BONE_XF['mixamorig:Head'][0].z
Z_NECK = BONE_XF['mixamorig:Neck'][0].z
Z_SP2 = BONE_XF['mixamorig:Spine2'][0].z


def clear_asset():
    for o in list(bpy.data.objects):
        if o.get('asset'):
            bpy.data.objects.remove(o, do_unlink=True)


def tag(o, name):
    o['asset'] = name
    return o


def mat_flat(name, color, rough=0.75):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    bsdf = m.node_tree.nodes['Principled BSDF']
    bsdf.inputs['Base Color'].default_value = (*color, 1.0)
    bsdf.inputs['Roughness'].default_value = rough
    return m


def new_obj(name, material, aname):
    o = bpy.context.view_layer.objects.active
    o.name = name
    tag(o, aname)
    if material:
        o.data.materials.clear()
        o.data.materials.append(material)
    return o


def apply_all(o):
    bpy.context.view_layer.objects.active = o
    o.select_set(True)
    bpy.context.view_layer.update()
    for md in list(o.modifiers):
        try:
            bpy.ops.object.modifier_apply(modifier=md.name)
        except Exception as e:
            print('mod apply fail', o.name, md.name, e)
    o.select_set(False)


def make_rig(aname, rig_name):
    ad = bpy.data.armatures.new(rig_name)
    ao = bpy.data.objects.new(rig_name, ad)
    tag(ao, aname)
    bpy.context.scene.collection.objects.link(ao)
    bpy.context.view_layer.objects.active = ao
    bpy.ops.object.mode_set(mode='EDIT')
    parent = None
    for bn in CHAIN:
        eb = ad.edit_bones.new(bn)
        eb.head, eb.tail = BONE_XF[bn]
        if parent:
            eb.parent = parent
        parent = eb
    bpy.ops.object.mode_set(mode='OBJECT')
    return ao


def skin_height_blend(o, rig):
    vgs = {bn: o.vertex_groups.new(name=bn) for bn in CHAIN}
    mw = o.matrix_world
    for i, v in enumerate(o.data.vertices):
        z = (mw @ v.co).z
        if z >= Z_NECK + 0.05:
            w = {'mixamorig:Head': 1.0}
        elif z >= Z_NECK - 0.07:
            t = (z - (Z_NECK - 0.07)) / 0.12
            w = {'mixamorig:Head': t, 'mixamorig:Neck': 1 - t}
        elif z >= Z_SP2 - 0.05:
            t = (z - (Z_SP2 - 0.05)) / ((Z_NECK - 0.07) - (Z_SP2 - 0.05))
            w = {'mixamorig:Neck': t, 'mixamorig:Spine2': 1 - t}
        else:
            w = {'mixamorig:Spine2': 1.0}
        for bn, wt in w.items():
            vgs[bn].add([i], wt, 'REPLACE')
    md = o.modifiers.new('Arm', 'ARMATURE')
    md.object = rig


def skin100(o, rig, bone='mixamorig:Head'):
    vg = o.vertex_groups.new(name=bone)
    vg.add(range(len(o.data.vertices)), 1.0, 'REPLACE')
    md = o.modifiers.new('Arm', 'ARMATURE')
    md.object = rig


def export_asset(aname, meshes, rig, note):
    for o in meshes:
        o.select_set(True)
    rig.select_set(True)
    bpy.context.view_layer.objects.active = rig
    fp = os.path.join(OUT, aname + '.glb')
    bpy.ops.export_scene.gltf(filepath=fp, export_format='GLB', use_selection=True,
                               export_skins=True, export_apply=True,
                               export_yup=True, export_materials='EXPORT')
    print('exported', fp)
    return {'asset': aname, 'file': 'public/models/hair/' + aname + '.glb',
            'attachBone': 'mixamorig:Head', 'offset': [0, 0, 0], 'scale': 1.0,
            'canonNotes': note}


def import_quat_hair(gltf_path, keep_name):
    """Import quaternius hair, retarget onto ASTRID head. Returns mesh."""
    before = set(bpy.data.objects)
    bpy.ops.import_scene.gltf(filepath=gltf_path)
    new = [o for o in bpy.data.objects if o not in before]
    arm = [o for o in new if o.type == 'ARMATURE'][0]
    qhead = arm.matrix_world @ arm.pose.bones['Head'].head
    delta = ASTRID_HEAD - qhead
    print('retarget delta for', keep_name, tuple(round(v, 4) for v in delta))
    mesh = [o for o in new if o.type == 'MESH' and o.name == keep_name][0]
    mesh.location += delta
    for o in new:
        if o is not mesh:
            bpy.data.objects.remove(o, do_unlink=True)
    return mesh


MANIFEST = []

# ============ 1. Echo — long green hair ============
AN = 'hair_echo_long_green'
clear_asset()
m = import_quat_hair(os.path.join(PULLS, 'quaternius/hair/Hair_Long.gltf'), 'Hair_Long')
tag(m, AN)
green = mat_flat('echo_green', (0.10, 0.58, 0.24), rough=0.7)
m.data.materials.clear(); m.data.materials.append(green)
apply_all(m)
rig = make_rig(AN, 'EchoHairRig')
skin_height_blend(m, rig)
MANIFEST.append(export_asset(AN, [m], rig,
    'Echo long green hair (quaternius Hair_Long, CC0, recolored vivid green). Height-blended head/neck/spine2 weights for springbones.'))

# ============ 2. Static — white-blond shoulder-length + beard ============
AN = 'hair_static_blond_beard'
clear_asset()
mh = import_quat_hair(os.path.join(PULLS, 'quaternius/hair/Hair_Long.gltf'), 'Hair_Long')
mb = import_quat_hair(os.path.join(PULLS, 'quaternius/hair/Hair_Beard.gltf'), 'Hair_Beard')
for o in (mh, mb):
    tag(o, AN)
blond = mat_flat('static_blond', (0.93, 0.90, 0.78), rough=0.65)
wblond = mat_flat('static_wblond', (0.96, 0.94, 0.88), rough=0.7)
mh.data.materials.clear(); mh.data.materials.append(blond)
mb.data.materials.clear(); mb.data.materials.append(wblond)
for o in (mh, mb):
    apply_all(o)
rig = make_rig(AN, 'StaticHairRig')
for o in (mh, mb):
    skin_height_blend(o, rig)
MANIFEST.append(export_asset(AN, [mh, mb], rig,
    'Static white-blond shoulder-length hair + matching beard (quaternius Hair_Long + Hair_Beard, CC0, recolored).'))

# ============ 3. Hollow — long black hair ============
AN = 'hair_hollow_long_black'
clear_asset()
m = import_quat_hair(os.path.join(PULLS, 'quaternius/hair/Hair_Long.gltf'), 'Hair_Long')
tag(m, AN)
black = mat_flat('hollow_black_hair', (0.02, 0.02, 0.025), rough=0.6)
m.data.materials.clear(); m.data.materials.append(black)
apply_all(m)
rig = make_rig(AN, 'HollowHairRig')
skin_height_blend(m, rig)
MANIFEST.append(export_asset(AN, [m], rig,
    'Hollow long black hair (quaternius Hair_Long, CC0, recolored black). Worn under/with the Super Dragon lucha mask.'))

# ============ 4. Theory — medium locs with beads (toon dread ponytail, CC0) ============
AN = 'hair_theory_locs_beads'
clear_asset()
before = set(bpy.data.objects)
bpy.ops.import_scene.gltf(filepath=os.path.join(PULLS, 'hair/toon_dread_ponytail/Toon Dread Ponytail.glb'))
new = [o for o in bpy.data.objects if o not in before]
dreads = [o for o in new if o.type == 'MESH' and 'Gradient' in o.name][0]
for o in new:
    if o is not dreads:
        bpy.data.objects.remove(o, do_unlink=True)
tag(dreads, AN)
locmat = mat_flat('theory_locs', (0.10, 0.065, 0.04), rough=0.85)
dreads.data.materials.clear(); dreads.data.materials.append(locmat)
# natural ponytail orientation (no rotation): root -> ASTRID back-crown
dreads.scale = (0.75, 0.75, 0.75)
dreads.location = (0, -0.050, 1.605)  # = (0,-0.05,1.68) - 0.75*(0,0,0.1)
bpy.context.view_layer.update()
apply_all(dreads)
# beads at loc tips: farthest-back verts (+Y) clustered by x
n = len(dreads.data.vertices)
co = np.empty(n * 3); dreads.data.vertices.foreach_get('co', co); co = co.reshape(-1, 3)
M = np.array(dreads.matrix_world); w = (M[:3, :3] @ co.T).T + M[:3, 3]
ymax = w[:, 1].max()
tips = w[w[:, 1] > ymax - 0.045]
xs = np.sort(tips[:, 0])
clusters = []
for x in xs:
    if not clusters or x - clusters[-1][-1] > 0.02:
        clusters.append([x])
    else:
        clusters[-1].append(x)
beadmat = mat_flat('theory_beads', (0.80, 0.60, 0.25), rough=0.35)
beads = []
for cl in clusters[:10]:
    cx = sum(cl) / len(cl)
    sel = tips[np.abs(tips[:, 0] - cx) < 0.012]
    cy, cz = sel[:, 1].mean(), sel[:, 2].mean()
    bpy.ops.mesh.primitive_torus_add(major_radius=0.011, minor_radius=0.005,
                                     major_segments=12, minor_segments=8,
                                     location=(cx, cy, cz),
                                     rotation=(0, math.pi / 2, 0))
    b = new_obj('bead', beadmat, AN)
    apply_all(b)
    beads.append(b)
rig = make_rig(AN, 'TheoryLocsRig')
skin_height_blend(dreads, rig)
for b in beads:
    skin100(b, rig)
MANIFEST.append(export_asset(AN, [dreads] + beads, rig,
    'Theory medium locs with beads (toon dread ponytail, CC0 tiko479, recolored dark brown; brass beads at loc tips).'))

# ============ 5. Theory — short twisted locs pinned up ============
AN = 'hair_theory_locs_pinned'
clear_asset()
locmat2 = mat_flat('theory_locs2', (0.14, 0.10, 0.07), rough=0.85)
locs = []
import random, bmesh
from mathutils import Vector, Euler
random.seed(11)
nloc = 20
for i in range(nloc):
    phi = (i / nloc) * 2 * math.pi
    sx, cy = math.sin(phi), math.cos(phi)
    if cy < -0.30 and abs(sx) < 0.70:
        continue  # keep the face clear
    # base ring on the upper head; locs swept up-and-back (pinned look)
    bx = 0.100 * sx
    by = -0.041 + 0.100 * cy
    bz = 1.680 + 0.030 * cy + random.uniform(-0.015, 0.015)
    length = random.uniform(0.060, 0.095)
    e = Euler((-0.55 * cy - 0.18, 0.55 * sx, random.uniform(0, 6.28)), 'XYZ')
    axis = e.to_matrix() @ Vector((0, 0, 1))
    cx, cyy, cz = bx + axis.x * length * 0.18, by + axis.y * length * 0.18, bz + axis.z * length * 0.18
    bpy.ops.mesh.primitive_cylinder_add(vertices=10, radius=0.0125, depth=length,
                                        location=(cx, cyy, cz))
    loc = new_obj('loc', locmat2, AN)
    loc.rotation_euler = e
    bpy.context.view_layer.objects.active = loc
    bpy.ops.object.mode_set(mode='EDIT')
    bm = bmesh.from_edit_mesh(loc.data)
    for v in bm.verts:
        t = (v.co.z + length / 2) / length  # 0..1 along loc
        ang = t * 6.0 * math.pi             # 3 full twists
        vx, vy = v.co.x, v.co.y
        taper = 1.0 - 0.50 * t
        wob = 1.0 + 0.14 * math.sin(t * 9.0 + i * 1.7)
        v.co.x = (vx * math.cos(ang) - vy * math.sin(ang)) * taper * wob
        v.co.y = (vx * math.sin(ang) + vy * math.cos(ang)) * taper * wob
    bmesh.update_edit_mesh(loc.data)
    bpy.ops.object.mode_set(mode='OBJECT')
    apply_all(loc)
    locs.append(loc)
rig = make_rig(AN, 'TheoryPinnedRig')
for o in locs:
    skin100(o, rig)
MANIFEST.append(export_asset(AN, locs, rig,
    'Theory short twisted locs pinned up (procedural, %d twisted tapered locs swept up/back from the crown).' % len(locs)))

with open(os.path.join(OUT, 'manifest.json'), 'w') as f:
    json.dump(MANIFEST, f, indent=2)
print('HAIR DONE:', len(MANIFEST))
