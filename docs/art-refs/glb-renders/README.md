# GLB Model Renders — Actual Screenshots

Real three.js renders of every character GLB in `public/models/cast/`, captured 2026-10-05.
These are NOT AI-generated — they are screenshots of the actual models.

**Contact sheet:** `contact-sheet.png` (all 30 at a glance)
**Individual renders:** 30 PNGs, one per model, front 3/4 view, studio lighting.

## Render info

| Model | Height | Meshes | Notes |
|---|---|---|---|
| AARON_RUBEN | 1.83m | 1 | OK |
| BANNON_muscular_skinned | 1.85m | 1 | **WHITE — texture load failure** |
| BRUTUS | 1.85m | 1 | OK |
| CAIN_ELIAS_gear | 1.85m | 1 | OK (dual-figure render — check model) |
| CAIN_ELIAS_snakeskin | 1.85m | 1 | OK |
| CIPHER_rigged | 1.85m | 1 | OK |
| CODY_gear_skinned | 1.90m | 1 | **WHITE — texture load failure** |
| CODY_sober | 1.85m | 1 | OK |
| CODY_stressed | 1.84m | 1 | OK |
| ECHO | 1.85m | 1 | OK (green hair) |
| EDWIN_KENNEDY | 1.88m | 1 | OK |
| EL_TORO_DE_ORO | 1.90m | 1 | OK |
| HALL_NIGHTER | 1.85m | 1 | OK |
| HOLLOW | 1.78m | 1 | OK |
| JAGER | 1.90m | 1 | Washed out — check textures |
| KOBRA | 1.82m | 1 | OK |
| MAIME_skinned | 1.88m | 15 | **WHITE — texture load failure** |
| MAIME_tattered_skinned | 1.80m | 14 | **Partial — broken/artifacted** |
| MASTER_SENSEI | 1.74m | 1 | OK |
| NPC_FINXSSE | 1.80m | 1 | OK |
| ONYX_corset_skinned | 1.85m | 1 | **WHITE — texture load failure** |
| ONYX_skinned | 1.85m | 1 | OK |
| ONYX_straightjacket | 1.72m | 1 | OK |
| ONYX_street | 1.85m | 1 | OK |
| PABLO | 1.95m | 1 | OK |
| SOMBRA_NEGRA_rigged | 1.61m* | 17 | **BROKEN — skinning collapses in three.js** (bone transforms invalid; renders as black blob). Needs rig repair. Non-rigged version has good turnaround in `~/workspace/sombra-negra/`. |
| STAN_COMBS_gear | 1.85m | 1 | OK |
| STATIC | 1.80m | 1 | OK |
| STICKUP | 1.84m | 1 | OK (pink pants) |
| TARZANIAN_DEVIL_skinned | 1.90m | 1 | OK |

*Bones-only bbox; bind-pose geometry bbox collapses.

## Issues to fix

1. **White models** (BANNON_muscular_skinned, CODY_gear_skinned, MAIME_skinned, ONYX_corset_skinned): textures not loading. Same root cause as the earlier "Bannon solid white" PWA issue. Likely missing embedded textures or broken material references.
2. **MAIME_tattered_skinned**: partially rendered with artifacts — geometry or material corruption.
3. **SOMBRA_NEGRA_rigged**: skeleton skinning is broken — `SkinnedMesh.applyBoneTransform` crashes on undefined bone matrices, and the mesh collapses to a black blob when rendered. The 58-joint rig needs validation/repair.
4. **CAIN_ELIAS_gear**: renders two overlapping figures — model may contain a duplicate mesh or incorrect node placement.

## How renders were made

`~/workspace/glb-renders/renderer/` — puppeteer + three.js headless batch renderer:
- `viewer2.html` — three.js viewer with meshopt decoder, auto-facing detection, bone-bbox fallback for skinned meshes
- `render2.js` — batch driver (single page, model swapping)
- Models served from `~/workspace/glb-renders/models/` via local HTTP
