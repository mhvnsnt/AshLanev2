#!/usr/bin/env python3
"""
apply-texture.py — AshLane texture/material pipeline.

Replaces the base-color image in a GLB with a new PBR texture
(e.g. CC0 from Poly Haven). Used to rescue untextured/white models
and to give procedural world geometry real surface detail.

Usage:
    python3 apply-texture.py --input model.glb --texture concrete.jpg \
        --output model-textured.glb [--roughness 0.9] [--metallic 0.0]

License: textures must be CC0 / MIT / Apache-2.0 / BSD. Poly Haven = CC0.
"""
import argparse, base64, struct, json
from pygltflib import GLTF2

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--input', required=True)
    ap.add_argument('--texture', required=True)
    ap.add_argument('--output', required=True)
    ap.add_argument('--roughness', type=float, default=0.9)
    ap.add_argument('--metallic', type=float, default=0.0)
    args = ap.parse_args()

    with open(args.input, 'rb') as f:
        data = bytearray(f.read())

    # Parse GLB chunks
    magic, version, length = struct.unpack('<III', data[:12])
    assert magic == 0x46546C67, 'not a GLB'
    off = 12
    json_bytes, bin_bytes, json_off, bin_off = None, None, 0, 0
    while off < len(data):
        clen, ctype = struct.unpack('<II', data[off:off+8])
        if ctype == 0x4E4F534A:  # JSON
            json_bytes = bytes(data[off+8:off+8+clen]); json_off = off + 8
        elif ctype == 0x004E4942:  # BIN
            bin_bytes = bytearray(data[off+8:off+8+clen]); bin_off = off + 8
        off += 8 + clen

    gltf_json = json.loads(json_bytes)
    with open(args.texture, 'rb') as f:
        tex_bytes = f.read()
    mime = 'image/png' if args.texture.lower().endswith('.png') else 'image/jpeg'

    # Replace image 0's bufferView bytes in place (pad if smaller)
    img = gltf_json['images'][0]
    bv = gltf_json['bufferViews'][img['bufferView']]
    assert bv['buffer'] == 0, 'image not in buffer 0'
    old_off, old_len = bv['byteOffset'], bv['byteLength']
    if len(tex_bytes) > old_len:
        raise SystemExit(f'texture {len(tex_bytes)}b larger than original image slot {old_len}b — use a smaller texture')
    bin_bytes[old_off:old_off+len(tex_bytes)] = tex_bytes
    # zero the remainder
    for i in range(old_off + len(tex_bytes), old_off + old_len):
        bin_bytes[i] = 0
    bv['byteLength'] = len(tex_bytes)
    img['mimeType'] = mime

    # Ensure material points at texture 0 with our roughness/metallic
    for m in gltf_json.get('materials', []):
        pbr = m.setdefault('pbrMetallicRoughness', {})
        pbr['baseColorTexture'] = {'index': 0}
        pbr['roughnessFactor'] = args.roughness
        pbr['metallicFactor'] = args.metallic

    # Rebuild GLB
    new_json = json.dumps(gltf_json, separators=(',', ':')).encode()
    while len(new_json) % 4: new_json += b' '
    out = bytearray()
    out += struct.pack('<III', 0x46546C67, 2, 12 + 8 + len(new_json) + 8 + len(bin_bytes))
    out += struct.pack('<II', len(new_json), 0x4E4F534A) + new_json
    out += struct.pack('<II', len(bin_bytes), 0x004E4942) + bytes(bin_bytes)
    with open(args.output, 'wb') as f:
        f.write(out)
    print(f'OK: {args.output} (image 0 replaced, {len(tex_bytes)} bytes)')

if __name__ == '__main__':
    main()
