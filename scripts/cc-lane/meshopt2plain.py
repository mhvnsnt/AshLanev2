"""Decode EXT_meshopt_compression bufferViews -> plain GLB (QC use only).
Usage: python3 meshopt2plain.py -- in.glb out_plain.glb"""
import struct, json, sys
import numpy as np
import meshopt

src, dst = sys.argv[sys.argv.index('--') + 1:sys.argv.index('--') + 3]
d = open(src, 'rb').read()
ln = struct.unpack('<I', d[12:16])[0]
js = json.loads(d[20:20 + ln])
bin0 = d[20 + ln + 8:]

MODE = {0: 'ATTRIBUTES', 1: 'TRIANGLES', 2: 'INDICES'}
new_bin = bytearray()
new_bvs = []
for bv in js.get('bufferViews', []):
    ext = (bv.get('extensions') or {}).get('EXT_meshopt_compression')
    if not ext:
        off = len(new_bin)
        chunk = bin0[bv['byteOffset']:bv['byteOffset'] + bv['byteLength']]
        new_bin += chunk
        nbv = dict(bv)
        nbv['byteOffset'] = off
        new_bvs.append(nbv)
        continue
    src_bytes = bin0[ext['byteOffset']:ext['byteOffset'] + ext['byteLength']]
    arr = meshopt.decode_gltf_buffer(src_bytes, ext['count'], ext['byteStride'],
                                     MODE[ext['mode']], ext.get('filter'))
    raw = arr.tobytes()
    off = len(new_bin)
    new_bin += raw
    nbv = dict(bv)
    nbv.pop('extensions', None)
    nbv['byteOffset'] = off
    nbv['byteLength'] = len(raw)
    new_bvs.append(nbv)

js['bufferViews'] = new_bvs
er = js.get('extensionsRequired', [])
if 'EXT_meshopt_compression' in er:
    er.remove('EXT_meshopt_compression')
js['extensionsRequired'] = er
total = len(new_bin)
js['buffers'] = [{'byteLength': total}]
j = json.dumps(js).encode()
j += b' ' * ((4 - len(j) % 4) % 4)
out = struct.pack('<III', 0x46546C67, 2, 12 + 8 + len(j) + 8 + total)
out += struct.pack('<II', len(j), 0x4E4F534A) + j
out += struct.pack('<II', total, 0x004E4942) + bytes(new_bin)
open(dst, 'wb').write(out)
print('wrote', dst, 'meshes:', len(js.get('meshes', [])))
