import bpy, sys
from mathutils import Matrix
char = sys.argv[sys.argv.index('--')+1]
bpy.ops.import_scene.gltf(filepath=char)
arm = [o for o in bpy.data.objects if o.type=='ARMATURE'][0]
for b in arm.pose.bones:
    if b.name in ('Head','mixamorig:Head'):
        m = arm.matrix_world @ b.matrix
        # basis vectors
        x,y,z = m.to_3x3().col
        print('CHAR',char.split('/')[-1],'bone',b.name)
        print('  X',tuple(round(v,3) for v in x))
        print('  Y',tuple(round(v,3) for v in y))
        print('  Z',tuple(round(v,3) for v in z))
        break
