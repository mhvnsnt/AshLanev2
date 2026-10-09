#!/usr/bin/env python3
"""LANE-3DLIMB: procedural wearable modeling for AshLanev2 customization suite.

Builds gloves / wristbands / footwear fitted to the CIPHER reference rig
(public/models/cast/CIPHER_rigged.glb, 52-bone Mixamo standard), each exported
as a GLB with a mini-armature whose bones carry the exact mixamorig:* names of
the character bones they follow. In-game: parent/pin each mini-armature bone
to the same-named character bone -> accessory follows animation with no
clipping (weights are computed from nearest-bone-segment distance, blended
across joint bands).

Usage: run inside Blender 4.0 headless:
  env -u PYTHONPATH blender -b -P build_wearables.py -- /tmp/cipher_decoded.glb <outdir>
"""
import bpy, sys, math, json, os
from mathutils import Vector

SRC = sys.argv[-2]
OUTDIR = sys.argv[-1]
os.makedirs(OUTDIR, exist_ok=True)
# BUILD_FILTER: comma-separated asset ids to build only (e.g. "theory_boot,boxing").
# Unset/empty builds everything.
BUILD_FILTER = set(f.strip() for f in os.environ.get('BUILD_FILTER', '').split(',') if f.strip())

# ---------------------------------------------------------------- setup
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=SRC)
ARM = next(o for o in bpy.data.objects if o.type == 'ARMATURE')
MESH = max((o for o in bpy.data.objects if o.type == 'MESH'),
           key=lambda o: len(o.data.vertices))
MW = MESH.matrix_world
AW = ARM.matrix_world
VERTS = [MW @ v.co for v in MESH.data.vertices]

def bone_seg(name):
    b = ARM.data.bones[name]
    return (AW @ b.head_local, AW @ b.tail_local)

BONES = {}
for n in ['mixamorig:LeftHand', 'mixamorig:RightHand',
          'mixamorig:LeftForeArm', 'mixamorig:RightForeArm',
          'mixamorig:LeftArm', 'mixamorig:RightArm',
          'mixamorig:LeftFoot', 'mixamorig:RightFoot',
          'mixamorig:LeftToeBase', 'mixamorig:RightToeBase',
          'mixamorig:LeftLeg', 'mixamorig:RightLeg']:
    BONES[n] = bone_seg(n)

GROUND_Z = min(v.z for v in VERTS)
print('ground z =', round(GROUND_Z, 3))

# bone rolls (EditBone-only attribute) for exact mini-armature cloning
bpy.context.view_layer.objects.active = ARM
bpy.ops.object.mode_set(mode='EDIT')
ROLLS = {eb.name: eb.roll for eb in ARM.data.edit_bones}
bpy.ops.object.mode_set(mode='OBJECT')
bpy.context.view_layer.objects.active = None

# ------------------------------------------------------- profile fitting
# Tight-window profilers around reference limb centerlines (Blender space).
# The loose "whole left half" filter inflated radii with torso verts; these
# windows isolate the limb. Reference lines measured off CIPHER (left side);
# side=+1 -> left (y<0), side=-1 mirrors y.

def _arm_ref(z, side):
    pts = [(-0.02, 0.051, -0.363), (0.262, -0.012, -0.348), (0.441, 0.004, -0.309)]
    if z <= pts[0][0]: return (pts[0][1], side * pts[0][2])
    for i in range(len(pts) - 1):
        z0, x0, y0 = pts[i]; z1, x1, y1 = pts[i + 1]
        if z0 <= z <= z1:
            t = (z - z0) / (z1 - z0)
            return (x0 + (x1 - x0) * t, side * (y0 + (y1 - y0) * t))
    return (pts[-1][1], side * pts[-1][2])

def _leg_ref(z, side):
    pts = [(-0.86, -0.020, -0.240), (-0.52, 0.012, -0.215), (-0.40, 0.012, -0.200)]
    if z <= pts[0][0]: return (pts[0][1], side * pts[0][2])
    for i in range(len(pts) - 1):
        z0, x0, y0 = pts[i]; z1, x1, y1 = pts[i + 1]
        if z0 <= z <= z1:
            t = (z - z0) / (z1 - z0)
            return (x0 + (x1 - x0) * t, side * (y0 + (y1 - y0) * t))
    return (pts[-1][1], side * pts[-1][2])

REFS = {
    'hand':    (lambda z, s: (0.052, s * -0.350), 0.09, 0.09),
    'forearm': (_arm_ref, 0.10, 0.10),
    'leg':     (_leg_ref, 0.11, 0.11),
}

def ring_profile_z(zc, side, ref='hand', half=0.012):
    fn, wx, wy = REFS[ref]
    cxr, cyr = fn(zc, side)
    xs, ys = [], []
    for v in VERTS:
        if abs(v.z - zc) < half and abs(v.x - cxr) < wx and abs(v.y - cyr) < wy:
            xs.append(v.x); ys.append(v.y)
    if len(xs) < 8:
        return None
    cx, cy = sum(xs) / len(xs), sum(ys) / len(ys)
    return (cx, cy, max(x - cx for x in xs), min(x - cx for x in xs),
            max(y - cy for y in ys), min(y - cy for y in ys), len(xs))

def ring_profile_x(xc, side, half=0.011):
    cyr = side * -0.265
    ys, zs = [], []
    for v in VERTS:
        # strict foot: below ankle (z < -0.80) to exclude shin
        if abs(v.x - xc) < half and abs(v.y - cyr) < 0.095 and v.z < -0.80:
            ys.append(v.y); zs.append(v.z)
    if len(ys) < 8:
        return None
    cy, cz = sum(ys) / len(ys), sum(zs) / len(zs)
    return (cy, cz, max(y - cy for y in ys), min(y - cy for y in ys),
            max(z - cz for z in zs), min(z - cz for z in zs), len(ys))

def prof_table_z(z0, z1, step, side, ref='hand'):
    out = []
    z = z0
    while (z1 > z0 and z <= z1) or (z1 < z0 and z >= z1):
        p = ring_profile_z(z, side, ref)
        if p: out.append((z,) + p)
        z += step if z1 > z0 else -step
    return out

def prof_table_x(x0, x1, step, side):
    out = []
    x = x0
    while x <= x1:
        p = ring_profile_x(x, side)
        if p: out.append((x,) + p)
        x += step
    return out

# ------------------------------------------------------------ mesh tools
def new_mesh(name, verts, faces):
    me = bpy.data.meshes.new(name)
    me.from_pydata([tuple(v) for v in verts], [], [tuple(f) for f in faces])
    me.update()
    ob = bpy.data.objects.new(name, me)
    bpy.context.scene.collection.objects.link(ob)
    for p in me.polygons:
        p.use_smooth = True
    return ob

def finish_normals(ob):
    bpy.ops.object.select_all(action='DESELECT')
    bpy.context.view_layer.objects.active = ob
    ob.select_set(True)
    bpy.ops.object.mode_set(mode='EDIT')
    bpy.ops.mesh.normals_make_consistent(inside=False)
    bpy.ops.object.mode_set(mode='OBJECT')
    bpy.ops.object.select_all(action='DESELECT')

def loft_z(stations, seg=18, cap0=True, cap1=True, rmod=None):
    """stations: list of (z, cx, cy, rx, ry); tube along z. rmod(theta,t)->scale"""
    verts, faces = [], []
    n = len(stations)
    for i, (z, cx, cy, rx, ry) in enumerate(stations):
        t = i / max(n - 1, 1)
        base = len(verts)
        for j in range(seg):
            th = 2 * math.pi * j / seg
            s = rmod(th, t) if rmod else 1.0
            verts.append((cx + rx * math.cos(th) * s, cy + ry * math.sin(th) * s, z))
        if i:
            p0 = base - seg
            for j in range(seg):
                faces.append((p0 + j, p0 + (j + 1) % seg, base + (j + 1) % seg, base + j))
    if cap0:
        c = len(verts); verts.append((stations[0][1], stations[0][2], stations[0][0]))
        for j in range(seg):
            faces.append((c, (j + 1) % seg, j))
    if cap1:
        c = len(verts); verts.append((stations[-1][1], stations[-1][2], stations[-1][0]))
        b = (n - 1) * seg
        for j in range(seg):
            faces.append((c, b + j, b + (j + 1) % seg))
    return verts, faces

def loft_x(stations, seg=18, cap0=True, cap1=True, rmod=None):
    """stations: list of (x, cy, cz, ry, rz); tube along x."""
    verts, faces = [], []
    n = len(stations)
    for i, (x, cy, cz, ry, rz) in enumerate(stations):
        t = i / max(n - 1, 1)
        base = len(verts)
        for j in range(seg):
            th = 2 * math.pi * j / seg
            s = rmod(th, t) if rmod else 1.0
            verts.append((x, cy + ry * math.cos(th) * s, cz + rz * math.sin(th) * s))
        if i:
            p0 = base - seg
            for j in range(seg):
                faces.append((p0 + j, p0 + (j + 1) % seg, base + (j + 1) % seg, base + j))
    if cap0:
        c = len(verts); verts.append((stations[0][0], stations[0][1], stations[0][2]))
        for j in range(seg):
            faces.append((c, j, (j + 1) % seg))
    if cap1:
        c = len(verts); verts.append((stations[-1][0], stations[-1][1], stations[-1][2]))
        b = (n - 1) * seg
        for j in range(seg):
            faces.append((c, b + (j + 1) % seg, b + j))
    return verts, faces

def merge_geo(parts):
    """parts: list of (verts, faces) -> combined."""
    verts, faces = [], []
    for v, f in parts:
        off = len(verts)
        verts += v
        faces += [tuple(i + off for i in fc) for fc in f]
    return verts, faces

def mirror_y(verts, faces):
    mv = [(x, -y, z) for (x, y, z) in verts]
    mf = [tuple(reversed(f)) for f in faces]
    return mv, mf

def mat(name, color, rough=0.6, metallic=0.0):
    m = bpy.data.materials.get(name) or bpy.data.materials.new(name)
    m.use_nodes = True
    bsdf = m.node_tree.nodes.get('Principled BSDF')
    bsdf.inputs['Base Color'].default_value = (*color, 1.0)
    bsdf.inputs['Roughness'].default_value = rough
    bsdf.inputs['Metallic'].default_value = metallic
    return m

# -------------------------------------------------------------- skinning
def pt_seg_dist(p, a, b):
    ab = b - a
    t = max(0.0, min(1.0, (p - a).dot(ab) / max(ab.length_squared, 1e-9)))
    return (p - (a + ab * t)).length

def skin_object(ob, bone_names, blend=0.02, pins=None):
    """weight verts to nearest of bone_names (blend band between 2 nearest).
    pins: optional list of (test_fn(co)->bool, bone_name); verts matching get
    100% to bone_name (used when auto-skinning straddles a joint badly)."""
    segs = [(n, BONES[n][0], BONES[n][1]) for n in bone_names]
    vgs = {}
    for n, _, _ in segs:
        vgs[n] = ob.vertex_groups.new(name=n)
    for i, co in enumerate([Vector(v) for v in [ob.data.vertices[i].co for i in range(len(ob.data.vertices))]]):
        pinned = None
        if pins:
            for test_fn, bn in pins:
                if test_fn(co):
                    pinned = bn
                    break
        if pinned:
            vgs[pinned].add([i], 1.0, 'REPLACE')
            continue
        ds = sorted(((pt_seg_dist(co, a, b), n) for n, a, b in segs))
        (d1, n1) = ds[0]
        if len(ds) > 1 and (ds[1][0] - d1) < blend:
            d2, n2 = ds[1]
            w1 = 0.5 + (d2 - d1) / (2 * blend)
            w1 = max(0.0, min(1.0, w1))
            vgs[n1].add([i], w1, 'REPLACE')
            vgs[n2].add([i], 1 - w1, 'REPLACE')
        else:
            vgs[n1].add([i], 1.0, 'REPLACE')

def make_armature(name, bone_names):
    adata = bpy.data.armatures.new(name + '_arm')
    aob = bpy.data.objects.new(name + '_rig', adata)
    bpy.context.scene.collection.objects.link(aob)
    bpy.context.view_layer.objects.active = aob
    bpy.ops.object.mode_set(mode='EDIT')
    for bn in bone_names:
        h, t = BONES[bn]
        eb = adata.edit_bones.new(bn)
        eb.head = h; eb.tail = t
        eb.roll = ROLLS[bn]  # match character roll exactly
    # mirror the character's bone hierarchy so COPY_TRANSFORMS / runtime
    # parenting reproduces the full chain and IBMs stay valid
    for bn in bone_names:
        cb = ARM.data.bones[bn]
        if cb.parent is not None and cb.parent.name in adata.edit_bones:
            adata.edit_bones[bn].parent = adata.edit_bones[cb.parent.name]
    bpy.ops.object.mode_set(mode='OBJECT')
    return aob

def export_asset(ob, aob, filepath, material):
    ob.data.materials.clear()
    ob.data.materials.append(material)
    mod = ob.modifiers.new('Skin', 'ARMATURE')
    mod.object = aob
    bpy.ops.object.select_all(action='DESELECT')
    ob.select_set(True); aob.select_set(True)
    bpy.context.view_layer.objects.active = aob
    bpy.ops.export_scene.gltf(filepath=filepath, export_format='GLB',
                              use_selection=True, export_skins=True,
                              export_animations=False, export_cameras=False,
                              export_lights=False, export_yup=True)
    bpy.ops.object.select_all(action='DESELECT')
    # cleanup for next asset
    bpy.data.objects.remove(ob, do_unlink=True)
    bpy.data.objects.remove(aob, do_unlink=True)

ASSETS = []  # (category, asset_id, filename, attachBone, bones_used, notes)

def register(cat, aid, fname, attach, bones, notes):
    ASSETS.append({'asset': aid, 'file': fname, 'attachBone': attach,
                   'bones': bones, 'offset': [0, 0, 0], 'scale': 1.0,
                   'canonNotes': notes, 'category': cat})

HAND_B = ['mixamorig:LeftHand', 'mixamorig:LeftForeArm']
ARM3_B = ['mixamorig:LeftHand', 'mixamorig:LeftForeArm', 'mixamorig:LeftArm']
FORE_B = ['mixamorig:LeftForeArm']
FOOT_B = ['mixamorig:LeftFoot', 'mixamorig:LeftToeBase', 'mixamorig:LeftLeg']

# ================================================================ GLOVES
def glove_palm_profile(side):
    tab = prof_table_z(0.05, -0.16, 0.02, 1)
    st = []
    for (z, cx, cy, rxp, rxn, ryp, ryn, cnt) in tab:
        st.append((z, cx, cy, max(rxp, -rxn) + 0.012, max(ryp, -ryn) + 0.012))
    return st

def finger_stubs(palm_st, side, z0, z1, r=0.016, count=4, spread=0.028):
    parts = []
    z, cx, cy, rx, ry = palm_st[-1]
    for k in range(count):
        fx = cx + (k - (count - 1) / 2) * spread
        fy = cy - 0.004
        st = [(z0, fx, fy, r, r), (z1, fx, fy, r * 0.92, r * 0.92)]
        parts.append(loft_z(st, seg=10))
    return parts

def thumb_stub(cx, cy, z, side, r=0.018):
    # thumb on the palm-side edge (+y, body-facing) and slightly forward (+x)
    parts = []
    for i, t in enumerate([0.0, 0.5, 1.0]):
        px = cx + 0.005 + 0.010 * t
        py = cy + 0.040 + 0.015 * t
        pz = -0.055 - 0.055 * t
        parts.append((pz, px, py, r * (1 - 0.15 * t), r * (1 - 0.15 * t)))
    return [loft_z(parts, seg=10)]

def knuckle_pad(cx, cy, z, rx, ry, side, thick=0.012, h=0.05, w=0.11):
    # rounded plate on dorsal (outer, -y) side
    y = cy - ry - thick / 2 - 0.004
    hw, hh = w / 2, h / 2
    v = [(-hw, -thick/2, -hh), (hw, -thick/2, -hh), (hw, -thick/2, hh), (-hw, -thick/2, hh),
         (-hw, thick/2, -hh), (hw, thick/2, -hh), (hw, thick/2, hh), (-hw, thick/2, hh)]
    v = [(cx + x, y + yy, z + zz) for x, yy, zz in v]
    f = [(0,1,2,3),(4,7,6,5),(0,4,5,1),(2,6,7,3),(1,5,6,2),(0,3,7,4)]
    return v, f

def cuff_band(side, z0, z1, r_extra=0.014, rib=False):
    tab = prof_table_z(z0, z1, 0.03, 1, ref='forearm')
    st = []
    for (z, cx, cy, rxp, rxn, ryp, ryn, cnt) in tab:
        st.append((z, cx, cy, max(rxp, -rxn) + r_extra, max(ryp, -ryn) + r_extra))
    def ribmod(th, t):
        return 1.0 + (0.06 * math.sin(th * 20) if rib else 0.0)
    return loft_z(st, seg=20, rmod=ribmod if rib else None)

def build_street_glove(side):
    palm = glove_palm_profile(side)
    parts = [loft_z(palm, seg=18, cap1=False)]
    parts += finger_stubs(palm, side, -0.155, -0.180)
    z, cx, cy, rx, ry = palm[-2]
    parts += thumb_stub(cx, cy, -0.06, side)
    parts.append(knuckle_pad(cx, cy, -0.135, rx, ry, side))
    parts.append(cuff_band(side, 0.06, -0.01, r_extra=0.012))
    return merge_geo(parts), HAND_B

def build_boxing_glove(side):
    palm = glove_palm_profile(side)
    z, cx, cy, rx, ry = palm[2]
    mitt = [(z, cx, cy, rx + 0.010, ry + 0.009),
            (-0.06, cx + 0.004, cy, rx + 0.015, ry + 0.013),
            (-0.13, cx + 0.008, cy, rx + 0.017, ry + 0.014),
            (-0.20, cx + 0.010, cy, rx + 0.015, ry + 0.012),
            (-0.250, cx + 0.010, cy, rx + 0.006, ry + 0.005)]
    parts = [loft_z(mitt, seg=20)]
    th = [(-0.06, cx + 0.012, cy + 0.045, 0.030, 0.028),
          (-0.10, cx + 0.016, cy + 0.052, 0.026, 0.024),
          (-0.13, cx + 0.020, cy + 0.056, 0.020, 0.018)]
    parts.append(loft_z(th, seg=12))
    parts.append(cuff_band(side, 0.09, -0.01, r_extra=0.012))
    # lace strip on dorsal cuff
    zz, ccx, ccy, crx, cry = 0.035, cx, cy, rx, ry
    parts.append(knuckle_pad(ccx, ccy, zz, crx, cry, side, thick=0.008, h=0.07, w=0.05))
    return merge_geo(parts), HAND_B

def build_mma_glove(side):
    palm = glove_palm_profile(side)
    parts = [loft_z(palm, seg=18, cap1=False)]
    parts += finger_stubs(palm, side, -0.150, -0.168, r=0.015)
    z, cx, cy, rx, ry = palm[-2]
    parts += thumb_stub(cx, cy, -0.06, side, r=0.016)
    # thick rounded knuckle pad
    parts.append(knuckle_pad(cx, cy, -0.135, rx, ry, side, thick=0.028, h=0.055, w=0.115))
    parts.append(cuff_band(side, 0.10, -0.01, r_extra=0.010, rib=True))
    return merge_geo(parts), HAND_B

def build_opera_glove(side):
    palm = glove_palm_profile(side)
    # fitted closed hand: taper to rounded fingertip
    st = [(z, cx, cy, rx + 0.007, ry + 0.007) for (z, cx, cy, rx, ry) in palm]
    st += [(-0.175, palm[-1][1], palm[-1][2], palm[-1][3] * 0.92 + 0.004, palm[-1][4] * 0.92 + 0.004),
           (-0.195, palm[-1][1] + 0.002, palm[-1][2], palm[-1][3] * 0.70 + 0.003, palm[-1][4] * 0.70 + 0.003),
           (-0.210, palm[-1][1] + 0.003, palm[-1][2], 0.012, 0.012)]
    parts = [loft_z(st, seg=18)]
    z, cx, cy, rx, ry = palm[-2]
    # fitted thumb
    th = []
    for i, t in enumerate([0.0, 0.33, 0.66, 1.0]):
        th.append((-0.060 - 0.050 * t, cx + 0.005 + 0.008 * t, cy + 0.038 + 0.012 * t,
                   0.017 * (1 - 0.25 * t), 0.017 * (1 - 0.25 * t)))
    parts.append(loft_z(th, seg=10))
    # long sleeve: wrist -> upper arm, following bone line with fitted radius
    tab = prof_table_z(-0.01, 0.44, 0.03, 1, ref='forearm')
    sst = []
    for (z, cx, cy, rxp, rxn, ryp, ryn, cnt) in tab:
        sst.append((z, cx, cy, max(rxp, -rxn) + 0.009, max(ryp, -ryn) + 0.009))
    parts.append(loft_z(sst, seg=20, cap0=False))
    # rolled cuff at top
    zt, cxt, cyt, rxt, ryt = sst[-1]
    ring = [(zt - 0.012, cxt, cyt, rxt + 0.006, ryt + 0.006),
            (zt + 0.006, cxt, cyt, rxt + 0.010, ryt + 0.010),
            (zt + 0.022, cxt, cyt, rxt + 0.010, ryt + 0.010),
            (zt + 0.030, cxt, cyt, rxt + 0.002, ryt + 0.002)]
    parts.append(loft_z(ring, seg=20, cap0=False, cap1=False))
    return merge_geo(parts), ARM3_B

# ============================================================ WRISTBANDS
def build_sweatband(side):
    return cuff_band(side, 0.055, 0.005, r_extra=0.016, rib=True), FORE_B

def build_wrist_wrap(side):
    parts = []
    tab = prof_table_z(0.10, -0.03, 0.025, 1, ref='forearm')
    for k in range(3):
        st = []
        for (z, cx, cy, rxp, rxn, ryp, ryn, cnt) in tab:
            r = max(rxp, -rxn, ryp, -ryn) + 0.011 + k * 0.0035
            st.append((z - k * 0.004, cx, cy, r, r))
        parts.append(loft_z(st, seg=18, cap0=(k == 0), cap1=(k == 2)))
    return merge_geo(parts), FORE_B

def build_wrist_pad(side):
    parts = [cuff_band(side, 0.09, -0.06, r_extra=0.022)]
    tab = prof_table_z(0.02, -0.02, 0.02, 1, ref='forearm')
    z, cx, cy, rxp, rxn, ryp, ryn, cnt = tab[0]
    ry = max(ryp, -ryn)
    parts.append(knuckle_pad(cx, cy, z, 0, ry, side, thick=0.030, h=0.10, w=0.10))
    return merge_geo(parts), FORE_B

# ============================================================= FOOTWEAR
def foot_profile(side):
    tab = prof_table_x(-0.14, 0.27, 0.02, 1)
    st = []
    for (x, cy, cz, ryp, ryn, rzp, rzn, cnt) in tab:
        st.append((x, cy, cz, max(ryp, -ryn), max(rzp, -rzn), min(rzn, -0.001)))
    return st  # (x, cy, cz, ry, rz, rzmin)

def shoe_last(st, clearance=0.013, toe_taper=1.0):
    out = []
    n = len(st)
    for i, (x, cy, cz, ry, rz, rzmin) in enumerate(st):
        t = i / max(n - 1, 1)
        taper = 1.0 - (1.0 - toe_taper) * max(0.0, (t - 0.75) / 0.25)
        out.append((x, cy, cz, (ry + clearance) * taper, rz + clearance))
    return out

def sole_geo(st, clearance=0.016, thick=0.022):
    parts = []
    n = len(st)
    for i, (x, cy, cz, ry, rz, rzmin) in enumerate(st):
        zb = GROUND_Z + 0.002
        zt = zb + thick
        parts.append((x, cy, (zb + zt) / 2, ry + clearance, (zt - zb) / 2))
    return [loft_x(parts, seg=14)]

def build_sneaker_high(side, low=False):
    st = foot_profile(side)
    # FIXUP 2026-10-09: low sneaker sat too far forward - heel skin poked out
    # the back. Shift the whole footbed rearward so the shoe fully encloses
    # the foot. (Collar stays on the leg line; tongue/laces shift with foot.)
    DX = -0.030 if low else 0.0
    if DX:
        st = [(x + DX, cy, cz, ry, rz, rzmin) for (x, cy, cz, ry, rz, rzmin) in st]
    last = shoe_last(st, clearance=0.013)
    # upper: loft full foot, then collar rises at ankle
    parts = [loft_x(last, seg=18)]
    top = 0.06 if not low else -0.02
    # ankle collar: rings from foot top up the ankle line
    leg = prof_table_z(-0.86, -0.86 + top + 0.10, 0.03, 1, ref='leg')
    collar = []
    for (z, cx, cy, rxp, rxn, ryp, ryn, cnt) in leg:
        if z > -0.70 + (0.0 if not low else 0.06):
            break
        collar.append((z, cx, cy, max(rxp, -rxn) + 0.016, max(ryp, -ryn) + 0.016))
    if collar:
        parts.append(loft_z(collar, seg=18, cap0=False))
    # tongue
    x0 = 0.02 + DX
    tongue = [(x0, st[0][1], -0.78, 0.035, 0.05),
              (x0 + 0.05, st[0][1], -0.74, 0.035, 0.05),
              (x0 + 0.09, st[0][1], -0.70 + (0.0 if not low else 0.05), 0.033, 0.045)]
    parts.append(loft_x(tongue, seg=12))
    # lace bars
    for k in range(4):
        xk = 0.03 + k * 0.035 + DX
        parts.append(knuckle_pad(xk, st[0][1], -0.745 + k * 0.008, 0, 0, side,
                                thick=0.010, h=0.018, w=0.075))
    parts += sole_geo(st, thick=0.030)
    # midsole stripe
    stripe = []
    for (x, cy, cz, ry, rz, rzmin) in st:
        stripe.append((x, cy, GROUND_Z + 0.020, ry + 0.017, 0.008))
    parts.append(loft_x(stripe, seg=14, cap0=False, cap1=False))
    return merge_geo(parts), FOOT_B

def build_wrestling_boot(side):
    st = foot_profile(side)
    last = shoe_last(st, clearance=0.012)
    # FIXUP 2026-10-09: toe poke-through - enlarge the toe box so the
    # character's foot stays fully enclosed.
    for i in range(len(last) - 5, len(last)):
        x, cy, cz, ry, rz = last[i]
        last[i] = (x + 0.008, cy, cz - 0.006, ry + 0.016, rz + 0.012)
    parts = [loft_x(last, seg=18)]
    leg = prof_table_z(-0.86, -0.58, 0.03, 1, ref='leg')
    shaft = []
    for (z, cx, cy, rxp, rxn, ryp, ryn, cnt) in leg:
        # FIXUP 2026-10-09: ankle float - hug the ankle (tighter clearance
        # below -0.70), ease off at the calf so the top doesn't gape.
        cl = 0.008 if z < -0.70 else 0.013
        shaft.append((z, cx, cy, max(rxp, -rxn) + cl, max(ryp, -ryn) + cl))
    # elastic top band: slight inward pull so the shaft mouth hugs the calf
    if shaft:
        z, cx, cy, rx, ry = shaft[-1]
        shaft[-1] = (z, cx, cy, rx - 0.004, ry - 0.004)
    parts.append(loft_z(shaft, seg=18, cap0=False))
    # lace bars up the front
    for k in range(6):
        z = -0.80 + k * 0.038
        parts.append(knuckle_pad(0.055 - k * 0.004, st[0][1], z, 0, 0, side,
                                thick=0.010, h=0.020, w=0.070))
    parts += sole_geo(st, thick=0.020)
    return merge_geo(parts), FOOT_B

def build_theory_boot(side):
    # Explicit clean stations (Blender coords, left side) - measured off CIPHER
    # Foot: heel x=-0.12 -> toe x=0.17, ground z=-0.925
    # CANON: knee-high HEEL boots for Theory. The foot is tilted onto a block
    # heel (rear raised HEEL_H, toe near ground); the character's flat foot
    # stays hidden inside the wedge sole + heel block.
    foot_st = [
        (-0.13, -0.215, -0.880, 0.050, 0.055),
        (-0.08, -0.225, -0.865, 0.072, 0.062),
        (-0.04, -0.260, -0.880, 0.095, 0.075),
        (0.00, -0.265, -0.875, 0.090, 0.070),
        (0.04, -0.272, -0.860, 0.080, 0.068),
        (0.08, -0.275, -0.865, 0.082, 0.060),
        (0.12, -0.285, -0.883, 0.062, 0.045),
        (0.155, -0.300, -0.892, 0.035, 0.028),
        (0.180, -0.305, -0.895, 0.012, 0.014),
    ]
    HEEL_H = 0.070
    X_HEEL, X_TOE = -0.13, 0.18
    def lift(x):
        t = (X_TOE - x) / (X_TOE - X_HEEL)
        t = max(0.0, min(1.0, t))
        return 0.004 + (HEEL_H - 0.004) * t
    # Tilt the foot onto the heel AND deepen the foot-box so its bottom stays
    # near the ground (hides the character's flat foot without a separate wedge
    # solid that would shear when the foot bends).
    foot_st = [(x, cy, cz + lift(x), ry, rz + lift(x) * 0.55)
               for (x, cy, cz, ry, rz) in foot_st]
    parts = [loft_x(foot_st, seg=20)]
    # ankle -> knee shaft: smooth taper (leg is thick; boot flares slightly at top)
    # bottom station dropped to -0.88 to stay buried in the raised foot
    shaft_st = [
        (-0.88, -0.010, -0.235, 0.082, 0.082),
        (-0.78, -0.005, -0.232, 0.075, 0.075),
        (-0.72, 0.000, -0.230, 0.078, 0.078),
        (-0.66, 0.005, -0.228, 0.082, 0.082),
        (-0.60, 0.008, -0.225, 0.095, 0.095),
        (-0.55, 0.010, -0.220, 0.105, 0.105),
        (-0.50, 0.012, -0.215, 0.125, 0.125),
        (-0.47, 0.012, -0.212, 0.132, 0.132),
    ]
    parts.append(loft_z(shaft_st, seg=22, cap0=False))
    # top cuff
    zt, cxt, cyt, rxt, ryt = shaft_st[-1]
    parts.append(loft_z([(zt - 0.020, cxt, cyt, rxt + 0.004, ryt + 0.004),
                        (zt + 0.012, cxt, cyt, rxt + 0.006, ryt + 0.006)], seg=22,
                       cap0=False, cap1=False))
    # block heel under rear: chunky, visible heeled silhouette
    hx, hy = -0.070, -0.225
    heel_bottom = GROUND_Z + 0.002
    heel_top = -0.860
    heel = [(heel_bottom, hx, hy, 0.080, 0.072),
            (heel_bottom + 0.030, hx - 0.002, hy, 0.084, 0.076),
            (heel_top, hx - 0.005, hy, 0.078, 0.070)]
    parts.append(loft_z(heel, seg=16))
    # Pin heel-block verts 100% to the foot bone: auto-skinning straddles
    # the ankle joint (50/50 leg/foot) which shears the heel when posed.
    # (Bone names are Left here; the main loop mirrors R.)
    def _pin_heel(co):
        return co.z < -0.855 and co.x < -0.02
    pins = [(_pin_heel, 'mixamorig:LeftFoot')]
    return merge_geo(parts), FOOT_B, pins

# ============================================================== assemble
BUILDERS = {
    'gloves': [
        ('street', build_street_glove, 'street fingerless biker gloves, knuckle plate',
         'Street wear.'),
        ('boxing', build_boxing_glove, 'red boxing gloves, lace cuff',
         'Boxing/MMA roster.'),
        ('mma', build_mma_glove, 'MMA 4oz gloves, thick knuckle pad, wrap cuff',
         'Boxing/MMA roster.'),
        ('opera_theory', build_opera_theory if False else build_opera_glove,
         "Theory attire-2 opera gloves, black satin, upper-arm length",
         'CANON: Theory attire-2 long gloves.'),
    ],
    'wristbands': [
        ('sweatband', build_sweatband, 'ribbed sweatband', 'Street wear.'),
        ('wrap', build_wrist_wrap, 'layered hand-wrap style wrist wrap', 'Fight wear.'),
        ('pad', build_wrist_pad, 'padded wrist cuff with dorsal pad', 'Fight wear.'),
    ],
    'footwear': [
        ('sneaker_high', lambda s: build_sneaker_high(s, low=False),
         'high-top street sneaker', 'Street wear.'),
        ('sneaker_low', lambda s: build_sneaker_high(s, low=True),
         'low-top skate sneaker', 'Street wear.'),
        ('wrestling_boot', build_wrestling_boot, 'lace-up roster wrestling boot, mid-calf',
         'Ring gear.'),
        ('theory_boot', build_theory_boot,
         "Theory knee-high block-heel boot, pointed toe, patent black",
         'CANON: Theory knee-high heeled boots.'),
    ],
}

COLORS = {
    'street': ((0.16, 0.13, 0.11), 0.7, 0.0),
    'boxing': ((0.55, 0.06, 0.06), 0.5, 0.0),
    'mma': ((0.10, 0.10, 0.12), 0.55, 0.0),
    'opera_theory': ((0.03, 0.03, 0.035), 0.25, 0.0),
    'sweatband': ((0.85, 0.82, 0.78), 0.9, 0.0),
    'wrap': ((0.25, 0.25, 0.27), 0.85, 0.0),
    'pad': ((0.08, 0.08, 0.09), 0.6, 0.0),
    'sneaker_high': ((0.70, 0.70, 0.72), 0.6, 0.0),
    'sneaker_low': ((0.12, 0.12, 0.14), 0.6, 0.0),
    'wrestling_boot': ((0.45, 0.05, 0.05), 0.55, 0.0),
    'theory_boot': ((0.02, 0.02, 0.025), 0.18, 0.1),
}

for cat, items in BUILDERS.items():
    catdir = os.path.join(OUTDIR, cat)
    os.makedirs(catdir, exist_ok=True)
    manifest = []
    for aid, fn, desc, canon in items:
        if BUILD_FILTER and aid not in BUILD_FILTER:
            continue
        for side, sfx in ((1, 'L'), (-1, 'R')):
            res = fn(side)
            if len(res) == 3:
                (verts, faces), bones, pins = res
                if side == -1:  # mirror pin bone names for R
                    pins = [(t, b.replace('Left', 'Right')) for (t, b) in pins]
            else:
                (verts, faces), bones = res
                pins = None
            if side == -1:
                verts, faces = mirror_y(verts, faces)
                bones = [b.replace('Left', 'Right') for b in bones]
            ob = new_mesh(f'{aid}_{sfx}', verts, faces)
            finish_normals(ob)
            aob = make_armature(f'{aid}_{sfx}', bones)
            skin_object(ob, bones, pins=pins)
            color, rough, metal = COLORS[aid]
            m = mat(f'{aid}_{sfx}', color, rough, metal)
            fp = os.path.join(catdir, f'{aid}_{sfx}.glb')
            export_asset(ob, aob, fp, m)
            ntri = len(faces)
            print('built', fp, ntri, 'tris')
            attach = bones[0].replace('Left', 'Right') if side == -1 else bones[0]
            register(cat, aid, f'{aid}_{sfx}.glb', attach, bones, canon)
    with open(os.path.join(catdir, 'manifest.json'), 'w') as f:
        json.dump([a for a in ASSETS if a['category'] == cat], f, indent=2)
    print('manifest ->', catdir)

print('DONE')
