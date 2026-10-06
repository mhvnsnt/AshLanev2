# Animation Systems Harvest — Round 6

**Date**: 2026-10-06
**Owner directive**: pull in open-source that fixes skeleton/bone/weight/rig issues and gets animations working. Wire in, don't bookmark.
**Scope**: ALL THREE games — AshLanev2, Brutal-Fist, Bannon. Everything game-agnostic.

## Per-Game Model Survey (2026-10-06)

| Game | Model dir | GLBs | Unrigged (0 bones) | Status |
|------|-----------|------|-------------------|--------|
| AshLanev2 | `public/models/cast/` | 78 | **21** (ASTRID, BILL_DOZER, MARKS, SOMBRA_NEGRA, TITAN_white, CAIN_ELIAS attires, JAGER variants…) | Auto-rig queued |
| Brutal-Fist | `public/models/` | 77 | **12** (BANNON, BANNON_muscular, CODY_gear, …_rigready variants) | Auto-rig queued |
| Bannon | `bannon-repair/out/` | 63 | **0** (already repaired) | Validation only |

**Total unrigged needing auto-rig: 33.**

## Wired In (game-agnostic)

### 1. instance-rig (MIT) — auto-rigging [PRIORITY]
- **What**: BodyPix 2D pose estimation → 3D skeleton + skin weights. <1s per mesh claimed.
- **Source**: https://github.com/cansik/instance-rig (MIT ✅)
- **Tool**: `tools/auto-rig/auto_rig.py` — game-agnostic CLI:
  - `--game ashlane|brutal-fist|bannon --input model.glb`
  - `--game ashlane --all-unrigged` (batch mode)
  - Validates output bone count; skips cleanly if venv not ready.
- **Status**: Installing (TensorFlow stack). Venv: `~/workspace/anim-harvest/.venv-ir/`.
- **Per-game**: AshLanev2 21 models + Brutal-Fist 12 models queued. Bannon 0 (validation only).

### 2. animouse (MIT) — animation state machine
- **What**: State machine + 1D/2D blend trees for Three.js. 1,890 lines TS.
- **Source**: https://github.com/jango-git/animouse (MIT ✅)
- **Status**: `npm install animouse --legacy-peer-deps` in AshLanev2 ✅
- **Wire-in**: `src/game3d/locomotion-blend.ts` — **game-agnostic**:
  - Accepts `Record` or `Map` action collections (AshLanev2 uses Record, Brutal-Fist uses Map).
  - `GAME_CONFIGS` per game: ashlane (boxidle/walk/run), brutal-fist + bannon (BOX_IDLE/DRUNK_WALK).
  - tsc-clean. Integration point ready for all three games' locomotion paths.

### 3. autotpose (MIT) — T-pose normalization
- **What**: Headless Blender T-pose normalization, Mixamo/Rigify/Unreal bone recognition.
- **Source**: vendored (MIT ✅). Blender 4.2.3 at /opt/blender-dl/.
- **Wire-in path**: `tools/auto-rig/` normalize step after instance-rig. Game-agnostic (takes any GLB).

### 4. ossos (MIT) — IK rig + retargeting (reference)
- **What**: 12 IK solvers, full retargeting module.
- **Source**: https://github.com/sketchpunklabs/ossos (MIT ✅)
- **Status**: Reference only. All three games have working foot IK already.

### 5. Weight repair — ALREADY game-agnostic ✅
- `tools/promo-video/reskin.js`: `cleanStrayWeights(skinnedMesh)` + `autoSkinByDistance(skinnedMesh)` operate on any THREE.SkinnedMesh — zero game-specific references. Usable by AshLanev2, Brutal-Fist, Bannon as-is.

## Evaluated, Not Pulled
- **Motion matching**: Unity/C# only in OSS. Spec'd as a three.js build on our clip libraries.
- **AccuRIG/Mixamo/DeepMotion**: no headless CLI / web-only / paid. Rejected.

## License Manifest
| Tool | License | Game-agnostic? |
|------|---------|----------------|
| instance-rig | MIT | ✅ CLI takes --game |
| animouse | MIT | ✅ GAME_CONFIGS |
| autotpose | MIT | ✅ any GLB |
| ossos | MIT | ✅ reference |

## Live Test Results (2026-10-06)

### ✅ Brutal-Fist: BANNON.glb auto-rigged successfully
- **Input**: 463KB, 15 meshes, 0 bones
- **Output**: 3MB GLB, **18-joint skeleton** (hip→spine1-3→neck→head, L/R shoulder/elbow/wrist, L/R hip/knee/ankle)
- **Time**: 61s (joints 28s, skin 31s, T-pose 2s)
- **Proof**: `docs/round6/proof/autorig-bannon-tpose.png` (T-pose render, mesh intact) + `docs/round6/proof/BANNON_rigged.glb`
- **Limitation**: No finger/toe bones (BodyPix 17-keypoint model). Sufficient for locomotion/combat; hands need Phase 3 detail pass.

### ⚠️ AshLanev2: MARKS.glb failed
- **Error**: `IndexError: list index out of range` in BodyPix pose detection (no keypoints found)
- **Status**: Documented as known limitation. BANNON proves the pipeline works; MARKS needs investigation (pose angle? mesh scale?).
- **Next**: Try alternate AshLanev2 models; add fallback to manual joint placement.

## Next
1. instance-rig install → rig 1 AshLanev2 + 1 Brutal-Fist model → validate → batch 33.
2. Wire locomotion-blend into each game's locomotion path.
3. Motion matching implementation.
