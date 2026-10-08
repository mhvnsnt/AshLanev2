# Character Repair — Manual Punchlist (Wave 4)

**Date:** 2026-10-08
**Status:** 61/68 models fixed and live. 7 remain blocked.
**Why manual:** Automated tools exhausted. probreg weight transfer runs but does not fix these defects. `regen_ibm.py` is BROKEN (do not use — it destroys working models).

---

## 1. CAIN_ELIAS_gear
**Problem:** All 58 joints have identity transforms (no bind pose data). Mesh cannot be posed.
**Blender steps:**
1. Import `public/models/cast/CAIN_ELIAS_gear.glb`
2. Import `public/models/cast/CAIN_ELIAS_snakeskin.glb` (working, same character) as reference
3. In Object Mode, select gear mesh → copy the Armature modifier from snakeskin reference
4. With gear mesh selected, go to Weight Paint mode. For each major bone (Hips, Spine, arms, legs):
   - Select the bone, use "Assign Automatic from Bones" as starting point
   - Manually clean up: ensure no verts have >4 bone influences, normalize all
5. In Pose Mode, test: rotate LeftArm/Shoulder 45°. Verify arm follows without distortion.
6. Export as GLB, replace `public/models/cast/CAIN_ELIAS_gear.glb`
7. Verify in game before committing.

## 2. MAIME_skinned
**Problem:** Arm bones do not drive arm vertices. In armsup/punch poses, arms stay at sides. Brown "wing" artifacts appear at hips (verts incorrectly assigned to arm joints).
**Blender steps:**
1. Import `public/models/cast/MAIME_skinned.glb`
2. Select mesh (note: 15 primitives — join into single mesh with Ctrl+J first, preserving materials)
3. Weight Paint mode → select `mixamorig:LeftArm` bone
   - The upper arm verts should be RED (weight 1.0), fading to BLUE at shoulder
   - Currently they are likely BLUE (weight 0) — paint them RED
4. Select `mixamorig:LeftForeArm` → paint forearm verts RED
5. Repeat for right arm
6. Find the "wing" artifact verts at hips (they'll be RED for arm bones but located at torso) → select them in Edit Mode → Weights panel → Remove from arm bones, assign to `mixamorig:Hips` or `mixamorig:Spine`
7. Normalize all weights (Weights → Normalize All)
8. Pose test: armsup and punch. Arms must follow. No spikes.
9. Export, replace, verify.

## 3. MAIME_tattered_skinned
**Problem:** Same as MAIME_skinned (arms don't follow).
**Blender steps:** Same as #2 above.

## 4. ONYX_corset_skinned
**Problem:** Renders correctly in T-pose. In punch pose, a brown "spike" artifact erupts from the left armpit/shoulder.
**Blender steps:**
1. Import `public/models/cast/ONYX_corset_skinned.glb`
2. Pose the model: rotate `mixamorig:RightArm` as in punch (Z -1.0, Y -0.2)
3. In Weight Paint mode, select `mixamorig:RightArm`
   - Find the spiking verts (they'll be stretched far from body) — these are incorrectly weighted to RightArm
   - They are likely part of the corset/shoulder pad that should be weighted to `mixamorig:RightShoulder` or `mixamorig:Spine2`
4. Select the spike verts in Edit Mode → remove from RightArm → assign to RightShoulder (weight 0.7) + Spine2 (weight 0.3)
5. Use "Smooth" brush on the shoulder transition zone
6. Normalize all, re-test punch. Spike must be gone.
7. Export, replace, verify.

## 5. ONYX_straightjacket
**Problem:** Complex clothing (straightjacket binds arms). Punch pose shows arm spike similar to #4.
**Blender steps:**
1. Import `public/models/cast/ONYX_straightjacket.glb`
2. Since arms are bound by the jacket, the arm bones should have MINIMAL influence on jacket verts
3. Weight Paint → select arm bones → use "Subtract" brush on jacket verts to reduce arm influence
4. Assign jacket verts primarily to `mixamorig:Spine`, `mixamorig:Spine1`, `mixamorig:Spine2` (torso follows body, not arms)
5. Smooth transitions, normalize, test poses
6. Export, replace, verify.

## 6. TARZANIAN_DEVIL_skinned
**Problem:** Severe torso distortion in armsup/punch. Chest/torso polygons stretch and mangle.
**Blender steps:**
1. Import `public/models/cast/TARZANIAN_DEVIL_skinned.glb`
2. The torso verts are likely assigned to arm/shoulder bones instead of spine bones
3. Weight Paint → select `mixamorig:Spine`, `mixamorig:Spine1`, `mixamorig:Spine2`
   - Torso verts should be RED for spine bones
   - Use "Add" brush to paint torso verts to spine bones
4. Select arm bones (`mixamorig:LeftArm`, `mixamorig:RightArm`) → "Subtract" brush on torso verts
5. The pectoral/delt transition needs smooth blending: use "Blur" brush on the boundary
6. Normalize all, test armsup. Torso must stay solid.
7. Export, replace, verify.

## 7. BRIAN_CAGE_source
**Problem:** 12-skin, 380-node source file with non-Mixamo skeleton (J_Hips, J_Spine1, etc.). Not game-ready. Does not respond to the game's Mixamo-based pose system.
**Blender steps:**
1. Import `public/models/cast/BRIAN_CAGE_source.glb`
2. This needs FULL RETARGETING to the Mixamo 58-joint skeleton:
   - Option A: Use Blender's "Mixamo" addon or manual bone mapping
   - Map: J_Hips→mixamorig:Hips, J_Spine1→mixamorig:Spine, etc. (create full mapping table)
   - Option B: Import a working Mixamo character (e.g., BRUTUS.glb), copy its armature, then use "Transfer Weights" (Weight Paint → Weights → Transfer Weights) with "Nearest Face Interpolated"
3. Delete the original 12 skins/armatures, keep only the Mixamo armature
4. Ensure all 58 Mixamo joints exist with correct names (mixamorig: prefix, colon format)
5. Normalize weights, test all poses (tpose, armsup, punch, walk)
6. Export as single-skin GLB, replace `public/models/cast/BRIAN_CAGE_source.glb`
7. Verify in game before committing.

---

## Tools Available
- `~/workspace/charfix/probreg-venv/` — Python venv with probreg 0.3.8 (MIT), open3d, scikit-learn, meshoptimizer. Activate with `source ~/workspace/charfix/probreg-venv/bin/activate`
- `~/workspace/charfix/tools/weight_transfer.py` — Automated weight transfer (donor→target). Useful as a STARTING POINT, but manual cleanup is still needed for the above.
- `~/workspace/charfix/tools/meshopt_decompress.py` — Decompress meshopt GLBs before Blender import (Blender may not read EXT_meshopt_compression)

## Verification
After each manual fix:
1. Render tpose, armsup, punch via `node _charfix_verify.mjs <model.glb> <outdir>`
2. Visually inspect all three — no spikes, no distortion, arms follow bones
3. Commit per model to a branch, never directly to main
