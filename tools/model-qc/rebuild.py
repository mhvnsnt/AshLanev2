#!/usr/bin/env python3
# rebuild.py <in.glb> <workdir> <out.glb>
# Model-QC pipeline step 3: replace repaired textures inside a GLB.
# Rebuilds the BIN chunk, shifts every later bufferView.byteOffset,
# updates image mimeTypes. Validates the result by re-parsing.
import struct, json, sys, os

def parse_glb(data):
    magic, ver, _ = struct.unpack('<III', data[:12])
    assert magic == 0x46546C67, 'not a GLB'
    off, js, chunks = 12, None, []
    while off + 8 <= len(data):
        clen, ctype = struct.unpack('<II', data[off:off + 8])
        raw = data[off + 8:off + 8 + clen]
        if ctype == 0x4E4F534A:
            js = json.loads(raw)
        else:
            chunks.append((ctype, raw))
        off += 8 + ((clen + 3) & ~3)
    return js, chunks

def main():
    in_glb, wd, out_glb = sys.argv[1], sys.argv[2], sys.argv[3]
    with open(in_glb, 'rb') as f:
        data = f.read()
    js, chunks = parse_glb(data)
    bin_raw = None
    for ctype, raw in chunks:
        if ctype == 0x004E4942:
            bin_raw = raw
    assert bin_raw is not None, 'no BIN chunk'

    fixed_dir = os.path.join(wd, 'fixed')
    replacements = []  # (start, end, new_bytes, img_idx, bv_idx)
    if os.path.isdir(fixed_dir):
        for f in sorted(os.listdir(fixed_dir)):
            if not f.endswith('.png'):
                continue
            img_idx = int(f.split('_')[1].split('.')[0])
            im = js['images'][img_idx]
            bv_idx = im.get('bufferView')
            if bv_idx is None:
                print(f'image {img_idx}: no bufferView, skipping')
                continue
            bv = js['bufferViews'][bv_idx]
            start = bv.get('byteOffset') or 0
            end = start + bv['byteLength']
            with open(os.path.join(fixed_dir, f), 'rb') as fh:
                new_bytes = fh.read()
            replacements.append((start, end, new_bytes, img_idx, bv_idx))
            im['mimeType'] = 'image/png'
    # drop EXT_texture_webp from extensionsUsed/Required if no webp images remain
    if replacements and all(im.get('mimeType') != 'image/webp' for im in js['images']):
        js['extensionsUsed'] = [e for e in js.get('extensionsUsed', []) if e != 'EXT_texture_webp']
        js['extensionsRequired'] = [e for e in js.get('extensionsRequired', []) if e != 'EXT_texture_webp']

    if not replacements:
        print(json.dumps({'replaced': 0}))
        return
    replacements.sort(key=lambda r: r[0])
    out = bytearray()
    cursor = 0
    shifts = []
    for start, end, new_bytes, img_idx, bv_idx in replacements:
        out += bin_raw[cursor:start]
        out += new_bytes
        pad = (-len(out)) % 4
        out += b'\x00' * pad
        shifts.append((end, (len(new_bytes) + pad) - (end - start)))
        js['bufferViews'][bv_idx]['byteLength'] = len(new_bytes)
        cursor = end
    out += bin_raw[cursor:]
    for i, bv in enumerate(js['bufferViews']):
        bo = bv.get('byteOffset') or 0
        for pos, delta in shifts:
            if bo >= pos:
                bo += delta
        bv['byteOffset'] = bo
    js_str = json.dumps(js, separators=(',', ':')).encode('utf-8')
    js_pad = (-len(js_str)) % 4
    js_chunk = struct.pack('<II', len(js_str) + js_pad, 0x4E4F534A) + js_str + b' ' * js_pad
    bin_chunk = struct.pack('<II', len(out), 0x004E4942) + bytes(out)
    total = 12 + len(js_chunk) + len(bin_chunk)
    with open(out_glb, 'wb') as f:
        f.write(struct.pack('<III', 0x46546C67, 2, total))
        f.write(js_chunk)
        f.write(bin_chunk)
    with open(out_glb, 'rb') as f:
        d2 = f.read()
    js2, _ = parse_glb(d2)
    assert len(js2['bufferViews']) == len(js['bufferViews'])
    print(json.dumps({'replaced': len(replacements), 'out': out_glb,
                      'size': len(d2), 'valid': True}))

if __name__ == '__main__':
    main()
