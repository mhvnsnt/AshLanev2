"""LANE-3DHEAD: purple hooded-robe hoods. FACE=-Y, up=+Z (Blender import space).
Narrator Ashes purple robe + Theory attire-4 purple hooded robe (THEORY pendant).
Authored in ASTRID space (head bone y=1.5232 glTF meters); manifest scale=1.0."""
import bpy, os, math, json

WORK = os.path.expanduser('~/workspace/game-sweep/cc-3dhead')
OUT = os.path.join(WORK, 'public/models/hoods')
os.makedirs(os.path.join(OUT, 'qc'), exist_ok=True)

bpy.ops.import_scene.gltf(filepath=os.path.join(WORK, 'public/models/cast/ASTRID.glb'))
ref_arm = [o for o in bpy.data.objects if o.type == 'ARMATURE'][0]

CHAIN_SRC = ['Spine2', 'Neck', 'Head']
CHAIN = ['mixamorig:Spine2', 'mixamorig:Neck', 'mixamorig:Head']
BONE_XF = {}
for bs, bn in zip(CHAIN_SRC, CHAIN):
    b = ref_arm.pose.bones[bs]
    BONE_XF[bn] = (ref_arm.matrix_world @ b.head, ref_arm.matrix_world @ b.tail)
Z_HEAD = BONE_XF['mixamorig:Head'][0].z
Z_NECK = BONE_XF['mixamorig:Neck'][0].z
Z_SP2 = BONE_XF['mixamorig:Spine2'][0].z
print('z head/neck/spine2:', round(Z_HEAD, 3), round(Z_NECK, 3), round(Z_SP2, 3))


def clear_asset():
    for o in list(bpy.data.objects):
        if o.get('asset'):
            bpy.data.objects.remove(o, do_unlink=True)


def tag(o, name):
    o['asset'] = name
    return o


def mat(name, color, rough=0.92, metallic=0.0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    bsdf = m.node_tree.nodes['Principled BSDF']
    bsdf.inputs['Base Color'].default_value = (*color, 1.0)
    bsdf.inputs['Roughness'].default_value = rough
    bsdf.inputs['Metallic'].default_value = metallic
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
    """Weight verts across head/neck/spine2 by world z (enables springbones)."""
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
    return {'asset': aname, 'file': 'public/models/hoods/' + aname + '.glb',
            'attachBone': 'mixamorig:Head', 'offset': [0, 0, 0], 'scale': 1.0,
            'canonNotes': note}


MANIFEST = []


def build_hood(aname, color, note):
    clear_asset()
    m = mat(aname + '_mat', color)
    # hood shell: generous sphere over head, face opening cut at -Y
    bpy.ops.mesh.primitive_uv_sphere_add(segments=40, ring_count=24, radius=1.0,
                                         location=(0, -0.010, 1.610))
    hood = new_obj('hood', m, aname)
    hood.scale = (0.155, 0.160, 0.205)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, -0.210, 1.545))
    cut = bpy.context.view_layer.objects.active
    cut.scale = (0.260, 0.220, 0.300)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    md = hood.modifiers.new('Cut', 'BOOLEAN')
    md.operation = 'DIFFERENCE'
    md.object = cut
    apply_all(hood)
    bpy.data.objects.remove(cut, do_unlink=True)
    so = hood.modifiers.new('Solid', 'SOLIDIFY')
    so.thickness = 0.005
    apply_all(hood)
    parts = [hood]
    # pointed peak at top-front (classic robe hood)
    bpy.ops.mesh.primitive_cone_add(vertices=16, radius1=0.045, depth=0.090,
                                    location=(0, -0.120, 1.790),
                                    rotation=(0.5, 0, 0))
    peak = new_obj('peak', m, aname)
    apply_all(peak)
    parts.append(peak)
    # shoulder drape: flared cone from neck to chest
    bpy.ops.mesh.primitive_cylinder_add(vertices=32, radius=0.105, depth=0.38,
                                        location=(0, -0.025, 1.240))
    drape = new_obj('drape', m, aname)
    bpy.context.view_layer.objects.active = drape
    bpy.ops.object.mode_set(mode='EDIT')
    import bmesh
    bm = bmesh.from_edit_mesh(drape.data)
    for v in bm.verts:
        if v.co.z < -0.05:
            v.co.x *= 1.9
            v.co.y *= 1.9
    bmesh.update_edit_mesh(drape.data)
    bpy.ops.object.mode_set(mode='OBJECT')
    so2 = drape.modifiers.new('Solid', 'SOLIDIFY')
    so2.thickness = 0.005
    apply_all(drape)
    parts.append(drape)
    rig = make_rig(aname, aname + 'Rig')
    for o in parts:
        skin_height_blend(o, rig)
    MANIFEST.append(export_asset(aname, parts, rig, note))


build_hood('hood_purple_robe', (0.28, 0.09, 0.48),
           'Purple hooded robe hood — Narrator Ashes purple robe; Theory attire-4 purple hooded robe (worn with THEORY pendant). Deep violet, pointed peak, shoulder drape. Authored in ASTRID space; scale to target head height / 1.5232.')
build_hood('hood_purple_robe_dark', (0.13, 0.04, 0.26),
           'Purple hooded robe hood — dark violet variant for low-light scenes.')

with open(os.path.join(OUT, 'manifest.json'), 'w') as f:
    json.dump(MANIFEST, f, indent=2)
print('HOODS DONE:', len(MANIFEST))
