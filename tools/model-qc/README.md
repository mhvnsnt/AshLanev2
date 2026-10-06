# Model QC Pipeline

Permanent automated quality gate for every 3D model entering the games.
Generalizes the Bannon black-blotch fix (3D-aware texture repaint) from a
bespoke script into a pipeline step that runs on **every** incoming model.

## What it catches

| Check | Severity | Auto-repair? |
|---|---|---|
| NaN/Inf vertex positions | error | no — flag |
| Orphan vertices (unreferenced) | warn | no — flag |
| Degenerate (zero-area) triangles | error/warn | no — flag |
| Unweighted skinned vertices | error | no — flag |
| Textured prim with no TEXCOORD_0 | error | no — flag |
| UVs outside [0,1] | warn | no — flag |
| Misclassified texels (blotch) via 3D-neighborhood zone voting | warn | **yes** — 3D-aware repaint, capped at 15% of texture |
| UV seam color discontinuity | warn | no — flag |
| Tiny / non-power-of-two textures | info | no |

## How the blotch repair works

1. Sample texture color at every vertex UV.
2. Discover material zones automatically with k-means (no hardcoded colors).
3. Vote a 3D consensus zone per vertex (distance-weighted KD-tree, k=12).
4. Flag verts whose zone disagrees with strong local consensus.
5. Rasterize only affected triangles (zone-unanimous), repaint disagreeing
   texels with the median color of clean texels in that zone.
6. Rebuild the GLB with the fixed texture (surgical bufferView replacement).

Repairs beyond the confidence cap are **never** applied silently — they're
reported for human review with proof renders.

## Files

- `extract.mjs` — GLB geometry decode (handles `EXT_meshopt_compression`,
  `EXT_texture_webp` source relocation, quantized attrs) → flat binaries
- `extract_tex.py` — verbatim texture byte extraction
- `qc.py` — detection + repair + `findings.json` / `REPORT.md`
- `rebuild.py` — GLB texture swap with byteOffset fixup + re-parse validation
- `proof-render.mjs` — front/back/left/right renders (three.js studio rig)
- `qc-model.sh` — single-model gate: extract → detect → repair → rebuild → proof
- `qc-batch.sh` — detection sweep over a directory → `BATCH_REPORT.md`

## Quick start

```bash
# single model, full gate with proof renders
./qc-model.sh /path/to/model.glb ./out/NAME --repair --proof

# detection-only sweep of the roster
./qc-batch.sh ../../public/models/cast ./out/batch 4
```

## Requirements

- Node 18+ with the repo's `node_modules/three`
- Python 3 with `numpy`, `Pillow`, `scipy`
- puppeteer via `/home/hatch/workspace/glb-renders/renderer/node_modules`
  (proof renders only)

## Origin

Built from the Bannon `BANNON_muscular_skinned.glb` black-blotch fix
(`~/workspace/bannon-texture/`, commit `ea594e3` in `mhvnsnt/Bannon`):
UV-atlas misclassification repaired with 3D-aware texel voting.
