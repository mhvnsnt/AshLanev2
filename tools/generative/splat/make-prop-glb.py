#!/usr/bin/env python3
"""
make-prop-glb.py — Build a simple procedural prop GLB (crate + barrel)
for the splat pipeline proof. Pure pygltflib, no compression.
"""
import struct
import numpy as np
from pygltflib import GLTF2, BufferView, Accessor, Mesh, Primitive, Node, Scene

def box(w, h, d, cx, cy, cz, color):
    hw, hh, hd = w/2, h/2, d/2
    v = np.array([
        [cx-hw, cy-hh, cz-hd], [cx+hw, cy-hh, cz-hd], [cx+hw, cy+hh, cz-hd], [cx-hw, cy+hh, cz-hd],
        [cx-hw, cy-hh, cz+hd], [cx+hw, cy-hh, cz+hd], [cx+hw, cy+hh, cz+hd], [cx-hw, cy+hh, cz+hd],
    ], dtype=np.float32)
    idx = np.array([0,1,2, 0,2,3, 4,6,5, 4,7,6, 0,4,5, 0,5,1,
                    2,6,7, 2,7,3, 0,3,7, 0,7,4, 1,5,6, 1,6,2], dtype=np.uint32)
    # simple per-face-ish normals (up) — splat only needs positions
    n = np.tile([[0, 1, 0]], (8, 1)).astype(np.float32)
    c = np.tile([color], (8, 1)).astype(np.float32)
    return v, n, c, idx

def main():
    parts = [
        box(1.2, 1.2, 1.2, 0, 0.6, 0, [0.55, 0.36, 0.18]),      # crate
        box(1.0, 0.15, 1.0, 0, 1.28, 0, [0.45, 0.29, 0.14]),    # crate lid
        box(0.5, 1.0, 0.5, 1.3, 0.5, 0.4, [0.6, 0.15, 0.1]),     # barrel body
        box(0.56, 0.12, 0.56, 1.3, 1.05, 0.4, [0.4, 0.4, 0.42]), # barrel lid
    ]
    V = np.vstack([p[0] for p in parts])
    N = np.vstack([p[1] for p in parts])
    C = np.vstack([p[2] for p in parts])
    I = np.concatenate([p[3] + i * 8 for i, p in enumerate(parts)]).astype(np.uint32)

    blob = bytearray()
    def add(arr):
        while len(blob) % 4: blob.append(0)
        off = len(blob)
        blob.extend(arr.tobytes())
        return off, arr.nbytes

    v_off, v_len = add(V)
    n_off, n_len = add(N)
    c_off, c_len = add(C)
    i_off, i_len = add(I)

    g = GLTF2()
    g.bufferViews = [
        BufferView(buffer=0, byteOffset=v_off, byteLength=v_len, target=34962),
        BufferView(buffer=0, byteOffset=n_off, byteLength=n_len, target=34962),
        BufferView(buffer=0, byteOffset=c_off, byteLength=c_len, target=34962),
        BufferView(buffer=0, byteOffset=i_off, byteLength=i_len, target=34963),
    ]
    g.accessors = [
        Accessor(bufferView=0, componentType=5126, count=len(V), type="VEC3",
                 min=V.min(0).tolist(), max=V.max(0).tolist(), name="POSITION"),
        Accessor(bufferView=1, componentType=5126, count=len(N), type="VEC3", name="NORMAL"),
        Accessor(bufferView=2, componentType=5126, count=len(C), type="VEC3", name="COLOR_0"),
        Accessor(bufferView=3, componentType=5125, count=len(I), type="SCALAR", name="INDICES"),
    ]
    from pygltflib import Material, PbrMetallicRoughness
    g.materials = [Material(pbrMetallicRoughness=PbrMetallicRoughness(baseColorFactor=[1, 1, 1, 1]))]
    from pygltflib import Attributes
    attrs = Attributes(POSITION=0, NORMAL=1, COLOR_0=2)
    prim = Primitive(attributes=attrs, indices=3, material=0)
    g.meshes = [Mesh(primitives=[prim])]
    g.nodes = [Node(mesh=0)]
    g.scenes = [Scene(nodes=[0])]
    g.scene = 0
    from pygltflib import Buffer
    g.buffers = [Buffer(byteLength=len(blob))]
    g.set_binary_blob(bytes(blob))
    # vertex color flag: set pbr baseColorFactor white and rely on COLOR_0
    g.save('/tmp/prop.glb')
    print(f'OK: /tmp/prop.glb ({len(V)} verts)')

if __name__ == '__main__':
    main()
