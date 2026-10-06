#!/usr/bin/env python3
# extract_tex.py <in.glb> <outdir>
# Model-QC pipeline step 1b: dump embedded texture image bytes verbatim.
# Writes tex/img_<index>.<ext> and tex.json {index: filename}.
import struct, json, sys, os

MIME_EXT = {
    'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp',
    'image/ktx2': 'ktx2', 'image/basis': 'basis',
}

def main():
    in_glb, outdir = sys.argv[1], sys.argv[2]
    texdir = os.path.join(outdir, 'tex')
    os.makedirs(texdir, exist_ok=True)
    with open(in_glb, 'rb') as f:
        data = f.read()
    magic, ver, _ = struct.unpack('<III', data[:12])
    assert magic == 0x46546C67, 'not a GLB'
    off, js, bin_off, bin_len = 12, None, 0, 0
    while off + 8 <= len(data):
        clen, ctype = struct.unpack('<II', data[off:off + 8])
        if ctype == 0x4E4F534A:
            js = json.loads(data[off + 8:off + 8 + clen])
        elif ctype == 0x004E4942:
            bin_off, bin_len = off + 8, clen
        off += 8 + ((clen + 3) & ~3)
    assert js is not None and bin_len, 'GLB missing chunks'
    mapping = {}
    for i, im in enumerate(js.get('images', [])):
        bv = im.get('bufferView')
        if bv is None:
            continue  # external URI image; not handled
        b = js['bufferViews'][bv]
        start = bin_off + (b.get('byteOffset') or 0)
        end = start + b['byteLength']
        mime = im.get('mimeType', 'application/octet-stream')
        ext = MIME_EXT.get(mime, 'bin')
        fn = f'img_{i}.{ext}'
        with open(os.path.join(texdir, fn), 'wb') as f:
            f.write(data[start:end])
        mapping[str(i)] = fn
    with open(os.path.join(outdir, 'tex.json'), 'w') as f:
        json.dump(mapping, f)
    print(json.dumps({'images': len(mapping)}))

if __name__ == '__main__':
    main()
