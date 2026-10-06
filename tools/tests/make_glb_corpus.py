#!/usr/bin/env python3
"""Build a small seed corpus of valid GLBs for the parser fuzzer."""
import json
import os
import struct
import sys


def write_glb(path, gltf_dict, bin_data=b""):
    js = json.dumps(gltf_dict).encode("utf-8")
    # pad JSON chunk to 4-byte alignment (spaces, per spec)
    while len(js) % 4:
        js += b" "
    total = 12 + 8 + len(js)
    if bin_data:
        while len(bin_data) % 4:
            bin_data += b"\x00"
        total += 8 + len(bin_data)
    out = struct.pack("<III", 0x46546C67, 2, total)
    out += struct.pack("<II", len(js), 0x4E4F534A) + js
    if bin_data:
        out += struct.pack("<II", len(bin_data), 0x004E4942) + bin_data
    with open(path, "wb") as f:
        f.write(out)


def main():
    d = sys.argv[1] if len(sys.argv) > 1 else "/tmp/fuzz/corpus"
    os.makedirs(d, exist_ok=True)
    # 1. minimal asset-only
    write_glb(os.path.join(d, "minimal.glb"), {"asset": {"version": "2.0"}})
    # 2. with a mesh + accessors + BIN chunk (triangle positions)
    pos = struct.pack("<9f", 0, 0, 0, 1, 0, 0, 0, 1, 0)
    gltf = {
        "asset": {"version": "2.0"},
        "buffers": [{"byteLength": len(pos)}],
        "bufferViews": [{"buffer": 0, "byteOffset": 0, "byteLength": len(pos)}],
        "accessors": [{"bufferView": 0, "componentType": 5126,
                       "count": 3, "type": "VEC3"}],
        "meshes": [{"primitives": [{"attributes": {"POSITION": 0}}]}],
        "nodes": [{"mesh": 0, "name": "tri"}],
    }
    write_glb(os.path.join(d, "triangle.glb"), gltf, pos)
    # 3. truncated (parser must reject cleanly)
    with open(os.path.join(d, "triangle.glb"), "rb") as f:
        data = f.read()
    with open(os.path.join(d, "truncated.glb"), "wb") as f:
        f.write(data[:40])
    print("corpus ->", d, sorted(os.listdir(d)))


if __name__ == "__main__":
    main()
