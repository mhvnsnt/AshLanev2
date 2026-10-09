"""Inspect CC0 hair sources: rig, bounds, materials."""
import bpy, sys, numpy as np

f = sys.argv[sys.argv.index('--') + 1]
bpy.ops.import_scene.gltf(filepath=f)
out = ['== ' + f]
for o in bpy.data.objects:
    if o.type == 'ARMATURE':
        out.append('ARM ' + o.name)
        for b in o.pose.bones:
            if any(k in b.name for k in ('Head', 'neck_01', 'spine_03')):
                p = o.matrix_world @ b.head
                out.append('  bone %s %.4f %.4f %.4f' % (b.name, p.x, p.y, p.z))
    if o.type == 'MESH':
        n = len(o.data.vertices)
        co = np.empty(n * 3)
        o.data.vertices.foreach_get('co', co)
        co = co.reshape(-1, 3)
        M = np.array(o.matrix_world)
        w = (M[:3, :3] @ co.T).T + M[:3, 3]
        mats = [s.material.name if s.material else '?' for s in o.material_slots]
        out.append('MESH %s nv=%d x[%.3f,%.3f] y[%.3f,%.3f] z[%.3f,%.3f] mats=%s' % (
            o.name, n, w[:, 0].min(), w[:, 0].max(), w[:, 1].min(), w[:, 1].max(),
            w[:, 2].min(), w[:, 2].max(), mats))
open('/tmp/hair_inspect.txt', 'a').write('\n'.join(out) + '\n')
print('\n'.join(out))
