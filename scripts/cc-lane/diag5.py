import bpy, numpy as np
bpy.ops.import_scene.gltf(filepath='public/models/cast/ASTRID.glb')
bpy.ops.import_scene.gltf(filepath='public/models/masks/mask_luchador_sombra.glb')
def center(o):
    n=len(o.data.vertices)
    co=np.empty(n*3); o.data.vertices.foreach_get('co',co); co=co.reshape(-1,3)
    M=np.array(o.matrix_world); w=(M[:3,:3]@co.T).T+M[:3,3]
    return w.mean(axis=0)
out=[]
for o in bpy.data.objects:
    if o.type!='MESH': continue
    n=len(o.data.vertices)
    # eye meshes: small, near head
    if 'eyetrim' in o.name:
        c=center(o); out.append('TRIM %s (%.4f, %.4f, %.4f)'%(o.name,c[0],c[1],c[2]))
# astrid eye region: find small meshes near eyes
for o in bpy.data.objects:
    if o.type!='MESH' or 'eyetrim' in o.name: continue
    n=len(o.data.vertices)
    if 500<n<3000:
        c=center(o)
        if 1.50<c[2]<1.60 and abs(c[0])<0.08:
            out.append('EYE? %s nv=%d (%.4f, %.4f, %.4f)'%(o.name,n,c[0],c[1],c[2]))
print('\n'.join(out))
