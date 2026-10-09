#!/usr/bin/env python3
"""Strip a bogus EXT_meshopt_compression declaration from a GLB so Blender 4.0
can import it.

public/models/cast/CIPHER_rigged.glb lists EXT_meshopt_compression in
extensionsRequired but no bufferView actually uses it (and it is absent from
extensionsUsed). Blender's glTF importer rejects that inconsistency
("Extension required must be in Extension Used too"). This rewrites only the
JSON chunk header, removing the extension name from extensionsRequired (and
extensionsUsed if present). Geometry, skins and images are untouched.

Usage: python3 strip_meshopt_required.py <in.glb> <out.glb>
"""
import struct, json, sys

def main():
    src, dst = sys.argv[1], sys.argv[2]
    data = open(src, 'rb').read()
    assert data[:4] == b'glTF', 'not a GLB'
    jlen = struct.unpack('<I', data[12:16])[0]
    j = json.loads(data[20:20 + jlen])
    changed = []
    # safety: refuse if any bufferView really does use the extension
    for bv in j.get('bufferViews', []):
        ext = (bv.get('extensions') or {})
        assert 'EXT_meshopt_compression' not in ext, \
            'bufferView really uses EXT_meshopt_compression - decode it instead'
    if 'EXT_meshopt_compression' in j.get('extensionsRequired', []):
        j['extensionsRequired'] = [e for e in j['extensionsRequired']
                                   if e != 'EXT_meshopt_compression']
        changed.append('extensionsRequired')
    if 'EXT_meshopt_compression' in j.get('extensionsUsed', []):
        j['extensionsUsed'] = [e for e in j['extensionsUsed']
                               if e != 'EXT_meshopt_compression']
        changed.append('extensionsUsed')
    newj = json.dumps(j, separators=(',', ':')).encode()
    newj += b' ' * ((-len(newj)) % 4)  # 4-byte align
    out = data[:12] + struct.pack('<I', len(newj)) + b'JSON' + newj + data[20 + jlen:]
    open(dst, 'wb').write(out)
    print(f'wrote {dst} (stripped: {", ".join(changed) or "nothing"})')

if __name__ == '__main__':
    main()
