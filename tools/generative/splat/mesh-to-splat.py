#!/usr/bin/env python3
"""
mesh-to-splat.py — AshLane Gaussian Splat pipeline (generation stage).

Converts a GLB mesh into a 3D Gaussian Splat PLY file by sampling the
mesh surface. Each sampled point becomes a Gaussian with position,
color (from texture/vertex color), small isotropic scale, and identity
rotation. Output loads in any 3DGS viewer (we use valentil/gaussian-splats,
MIT, for the AshLane viewer).

This is the offline/synthetic generation path: it proves the pipeline
(mesh -> splat -> in-engine render). The production path (phone photos ->
COLMAP -> 3DGS training) is documented in docs/GENERATIVE_PIPELINES.md
and produces the same PLY format.

Usage:
    python3 mesh-to-splat.py --input model.glb --output model.ply [--count 20000]

License: MIT (pipeline code). Input model/texture licenses apply to output.
"""
import argparse, struct, math, random
import numpy as np
from PIL import Image
from pygltflib import GLTF2

SH_C0 = 0.28209479177387814

def read_glb(path):
    gltf = GLTF2().load(path)
    with open(path, 'rb') as f:
        data = f.read()
    off = 12
    bin_data = None
    while off < len(data):
        clen, ctype = struct.unpack('<II', data[off:off+8])
        if ctype == 0x004E4942:
            bin_data = data[off+8:off+8+clen]
            break
        off += 8 + clen
    return gltf, bin_data

def get_accessor_data(gltf, bin_data, idx):
    acc = gltf.accessors[idx]
    bv = gltf.bufferViews[acc.bufferView]
    base = (bv.byteOffset or 0) + (acc.byteOffset or 0)
    comp = {5120: 'b', 5121: 'B', 5122: 'h', 5123: 'H', 5125: 'I', 5126: 'f'}[acc.componentType]
    ncomp = {'SCALAR': 1, 'VEC2': 2, 'VEC3': 3, 'VEC4': 4}[acc.type]
    dt = np.dtype(comp).newbyteorder('<')
    arr = np.frombuffer(bin_data, dtype=dt, count=acc.count * ncomp, offset=base)
    return arr.reshape(acc.count, ncomp).astype(np.float64)

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--input', required=True)
    ap.add_argument('--output', required=True)
    ap.add_argument('--count', type=int, default=20000)
    ap.add_argument('--seed', type=int, default=7)
    args = ap.parse_args()
    random.seed(args.seed); np.random.seed(args.seed)

    gltf, bin_data = read_glb(args.input)

    # Surface sampling: random points on triangles (area-weighted, barycentric)
    tri_list, tcol_list = [], []
    for mesh in gltf.meshes or []:
        for prim in mesh.primitives:
            pos = get_accessor_data(gltf, bin_data, prim.attributes.POSITION)
            idx_acc = get_accessor_data(gltf, bin_data, prim.indices).astype(int).ravel()
            tris = pos[idx_acc.reshape(-1, 3)]
            tri_list.append(tris)
            if hasattr(prim.attributes, 'COLOR_0') and prim.attributes.COLOR_0 is not None:
                col = get_accessor_data(gltf, bin_data, prim.attributes.COLOR_0)[:, :3]
                tcol_list.append(col[idx_acc.reshape(-1, 3)])
            else:
                tcol_list.append(np.zeros((len(tris), 3, 3)))
    all_tris = np.vstack(tri_list)
    all_tcols = np.vstack(tcol_list)
    has_vcolor = bool((all_tcols.sum() > 0))

    e1 = all_tris[:, 1] - all_tris[:, 0]
    e2 = all_tris[:, 2] - all_tris[:, 0]
    areas = np.clip(0.5 * np.linalg.norm(np.cross(e1, e2), axis=1), 1e-12, None)
    probs = areas / areas.sum()

    take = args.count
    tri_idx = np.random.choice(len(all_tris), take, p=probs)
    r1 = np.random.rand(take); r2 = np.random.rand(take)
    sq1 = np.sqrt(r1)
    b0 = 1 - sq1; b1 = sq1 * (1 - r2); b2 = sq1 * r2
    T = all_tris[tri_idx]
    pts = b0[:, None] * T[:, 0] + b1[:, None] * T[:, 1] + b2[:, None] * T[:, 2]
    TC = all_tcols[tri_idx]
    vcol = b0[:, None] * TC[:, 0] + b1[:, None] * TC[:, 1] + b2[:, None] * TC[:, 2]

    # Colors: vertex colors, else flat default (texture path needs UVs; skip for proof)
    cols = np.clip(vcol, 0, 1) if has_vcolor else np.full((take, 3), 0.75)

    # Normalize scale: splat size ~ local point spacing
    bbox = pts.max(0) - pts.min(0)
    diag = float(np.linalg.norm(bbox)) or 1.0
    s = diag / math.sqrt(take) * 1.6

    # Write binary PLY (3DGS format)
    # props: x,y,z, f_dc_0..2, opacity, scale_0..2, rot_0..3
    header = f"""ply
format binary_little_endian 1.0
element vertex {take}
property float x
property float y
property float z
property float f_dc_0
property float f_dc_1
property float f_dc_2
property float opacity
property float scale_0
property float scale_1
property float scale_2
property float rot_0
property float rot_1
property float rot_2
property float rot_3
end_header
""".encode()

    def inv_sigmoid(x): return math.log(x / (1 - x))
    op = inv_sigmoid(0.9)
    log_s = math.log(s)
    inv_c0 = [(c - 0.5) / SH_C0 for c in (0, 0, 0)]  # placeholder

    with open(args.output, 'wb') as f:
        f.write(header)
        for p, c in zip(pts, cols):
            f_dc = [(ch - 0.5) / SH_C0 for ch in c]
            f.write(struct.pack('<14f',
                p[0], p[1], p[2],
                f_dc[0], f_dc[1], f_dc[2],
                op, log_s, log_s, log_s,
                1.0, 0.0, 0.0, 0.0))
    print(f'OK: {args.output} ({take} splats, bbox diag {diag:.2f})')

if __name__ == '__main__':
    main()
