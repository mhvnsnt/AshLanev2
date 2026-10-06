# License Manifest — tools/generative/

Owner policy (2026-10-06): license purity does NOT gate prototyping — use whatever
works. Audit + cleanup happens before ship. Guardrails: keep GPL/AGPL-viral code
quarantined out of ship code paths; this file makes the pre-ship audit mechanical.

Format per entry: tool | license | where used | notes.

## Ported into AshLanev2 (2026-10-06)

| Tool | License | Where used | Notes |
|------|---------|------------|-------|
| `motion/glb_anim.py` (from Bannon lane, ported 2026-10-06) | No third-party deps — stdlib (json, struct) + numpy; authored in-repo (Bannon `tools/generative` lane) | Standalone primitive: append baked animations to a GLB without re-encoding meshes (skin/materials survive); auto-converts `matrix` nodes to TRS per glTF spec | numpy is BSD-3-Clause; safe for ship as-is |

## Evaluated from Bannon lane — NOT ported (2026-10-06)

| Tool | License | Reason skipped |
|------|---------|----------------|
| `motion/procedural_moves.py` (34 wrestling moves) | In-repo authored | Wrestling-centric (suplexes/piledrivers/chokeslams); AshLanev2 already has UAL animation library + `src/game3d/wrestling-moves.ts`. Strike/locomotion subsets may be adapted later if UAL fails to load. |
| `retarget/mediapipe_to_glb.py`, `retarget/bvh_retarget.py` | Apache-2.0 (MediaPipe), MIT (stdlib parser) | Covered by `tools/anim-retarget/` (active lane, GLB output verified). |
| `mesh/mesh_doctor.py` (trimesh) | MIT | Covered by `3d/postprocess.py` + `character/postprocess.py` (trimesh repair already). |
| `mesh/lod_chain.py` | MIT (fast-simplification) | LOD referenced in `3d/` + `tools/free-apis/mobile-lod-pipeline.py` (gltf-transform). |
| `mesh/optimize_glb.sh` (gltf-transform) | Apache-2.0 | gltf-transform already referenced in `tools/free-apis/mobile-lod-pipeline.py`. |
| `world/arena_generator.py`, `world/crowd_generator.py`, `world/ring_variants.py` | In-repo authored | Wrestling-venue specific; AshLanev2 uses `worldgen-*`, `city/`, `arena-crowd.ts` for streets. |

## Pre-existing AshLanev2 generative tooling (licenses per GENERATIVE_PIPELINE.md)

TripoSR, TRELLIS, Shap-E (MIT wrappers), Real-ESRGAN (BSD), character pipeline
(`character/`), upscale, textures, graffiti, city-seed, audio-gen. All accepted
MIT/Apache-2.0/BSD/CC0. GPU-bound on this machine — setup-only until run on a GPU host.

## Flags for the pre-ship audit

- Stable Fast 3D / Hunyuan3D-2: earlier rejected for license restrictions — still NOT pulled into AshLanev2. Under the corrected policy they may be used for prototyping if they prove to be what works; not used to date.
- No GPL/AGPL-viral code currently in ship code paths.
