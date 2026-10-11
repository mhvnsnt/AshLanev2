import bpy
sc=bpy.context.scene
sc.render.engine='BLENDER_EEVEE'
sc.render.resolution_x=256; sc.render.resolution_y=256
sc.render.filepath='/tmp/eevee_test.png'
bpy.ops.render.render(write_still=True)
print('EEVEE_RENDER_OK')
