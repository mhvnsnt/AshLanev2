import bpy, sys
argv = sys.argv[sys.argv.index('--')+1:]
bpy.ops.import_scene.gltf(filepath=argv[0])
print('import1 ok', len(bpy.data.objects))
bpy.ops.import_scene.gltf(filepath=argv[1])
print('import2 ok', len(bpy.data.objects))
