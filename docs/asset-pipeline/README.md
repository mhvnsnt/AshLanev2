# AshLane GLB Asset Pipeline

One-command GLB optimization for the game build. MIT-licensed tools only.

## Tools

| Tool | License | Role |
|------|---------|------|
| [glTF-Transform](https://github.com/donmccurdy/glTF-Transform) | MIT | CLI/SDK: prune, dedup, weld, simplify, Draco/Meshopt compression, WebP/KTX2 texture conversion |
| [meshoptimizer](https://github.com/zeux/meshoptimizer/blob/HEAD/gltf/README.md) (gltfpack) | MIT | mesh simplification, vertex-cache optimization, quantization, `MESHOPT_compression` |
| [Basis Universal](https://github.com/BinomialLLC/basis_universal) | Apache-2.0 | GPU texture supercompression (KTX2/ETC1S/UASTC) for mobile VRAM |
| [Draco](https://github.com/google/draco) | Apache-2.0 | geometry compression (alternative to meshopt) |

Install once:

```bash
npm install -g @gltf-transform/cli
```

## Usage

```bash
./optimize-glb.sh path/to/CHARACTER.glb ./out
```

Produces:

- `<name>.game.glb` — full-quality, meshopt-compressed, WebP textures. **This is what ships in `public/models/`.**
- `<name>.lod1.glb` / `<name>.lod2.glb` — distance LODs for `THREE.LOD`.

## Verified results (2026-10-06)

Input: `TARZANIAN_DEVIL_dec_repaired.glb` — 5.86 MB, 82,306 tris, skinned.

| Output | Size | Tris | Notes |
|--------|------|------|-------|
| `.game.glb` | 1.26 MB (**−78%**) | 82,306 | skinning attrs intact (`JOINTS_0`/`WEIGHTS_0`), `gltf-transform validate` clean |
| `.lod1.glb` | 1.06 MB | ~63k | |
| `.lod2.glb` | 1.06 MB | ~62k | |

## Honest limitation: triangle reduction on skinned meshes

meshoptimizer's `simplify` is **error-bound conservative on skinned meshes** — even
`--ratio 0.1 --error 0.15` only reached ~63k tris on the test model. It protects
deformation quality, which is good, but it means:

- **File-size / download wins** come from this pipeline (`optimize`: −78% observed).
- **Triangle-count wins** (the 15–25k mobile target) still belong in the **repair/decimation
  stage** (Blender decimate / remesh *before* weight transfer), not here.

Do not crank `--error` past 0.05 on hero characters without a visual check —
fingers and faces pinch first. Always render LODs in the render rig before shipping.

## three.js loader note

`.game.glb` files use `MESHOPT_compression` + `EXT_texture_webp`. The three.js
`GLTFLoader` needs the decoders wired once at startup:

```js
import { MeshoptDecoder } from 'three/addons/loaders/MeshoptDecoder.js';
loader.setMeshoptDecoder(MeshoptDecoder);
// WebP textures work out of the box in modern browsers.
```

KTX2/Basis variants (for lowest mobile VRAM) need `KTX2Loader` + a transcoder —
see `gltf-transform uastc` / `etc1s` commands. Not yet wired; tracked as follow-up.
