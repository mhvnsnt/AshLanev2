import bpy, sys, numpy as np
char = sys.argv[sys.argv.index('--')+1]
bpy.ops.import_scene.gltf(filepath=char)
arm = [o for o in bpy.data.objects if o.type=='ARMATURE'][0]
hb = [b for b in arm.pose.bones if 'Head' in b.name][0]
hw = arm.matrix_world @ hb.head
# biggest mesh = body; find nose = min-y vert in head z-band
best=None
for o in bpy.data.objects:
    if o.type!='MESH': continue
    n=len(o.data.vertices)
    if n<3000: continue
    co=np.empty(n*3); o.data.vertices.foreach_get('co',co); co=co.reshape(-1,3)
    M=np.array(o.matrix_world); w=(M[:3,:3]@co.T).T+M[:3,3]
    band=w[(w[:,2]>hw.z-0.03)&(w[:,2]<hw.z+0.08)&(np.abs(w[:,0]-hw.x)<0.05)]
    if len(band)>100:
        i=np.argmin(band[:,1])
        if best is None or band[i,2]>best[1]-0.05:
            best=(o.name,band[i])
if best:
    nose=np.array(best[1])-np.array(hw)
    print('CHAR',char.split('/')[-1],'nose rel headbone: y=%.4f z=%.4f'%(nose[1],nose[2]))
