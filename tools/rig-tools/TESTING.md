# rig-tools — verification log

## blender_autorig.py — VERIFIED (2026-10-07)

End-to-end proof on `public/models/humanoid/Soldier_Male.glb` (stripped of its
original rig with `strip_rig.py`, then re-rigged):

| Step | Result |
|---|---|
| Import unrigged GLB | OK |
| Fit 85-bone Mixamo-compatible skeleton from `mixamo_hierarchy.json`, scaled to model bbox | OK (armature `MixamoRig`, 85 bones) |
| Automatic weights | OK — main body mesh: **58 weighted groups**; 2 tiny prop sub-meshes had no weights and were cleanly unparented (kept in GLB as static meshes) |
| Export GLB | OK — 260 KB, 1 skin, valid glTF 2.0 |
| Deformation QA (`pose_test.py`: rotate Hips 30° in pose mode) | **DEFORM_OK** — max vertex displacement 0.8848 units; mesh center moved 0.0908 |

### Bug fixed during verification
Blender 4.0.2's glTF exporter crashes in `add_neutral_bones`
(`AttributeError: 'NoneType' object has no attribute 'joints'`) when any mesh
carries a skin with all-zero weights (happens when Bone Heat fails on props).
Fix: cleanup pass drops empty vertex groups and unparents zero-weight meshes
(keeping world transform) before export. Export now succeeds on messy inputs.

### Known caveat
Bone Heat can fail on very messy meshes (e.g. Kaykit `Knight_Body`: 1092
non-manifold edges — got 0 weights while sibling meshes on the same model
rigged fine). The tool handles this gracefully (unparent, continue), but a
future improvement is an envelope-weights fallback for the main body mesh.
Heuristic: if the largest mesh ends up unparented, warn loudly.

## blender_render_check.py
Renders a rigged GLB front-on with armature visible (octahedral) for visual QA.
Used to confirm the auto-rigged Knight/ Soldier renders intact with skeleton
inside the body volume.

## strip_rig.py / pose_test.py
Test harness only: strip skeleton+skinning from a GLB to make an unrigged
input; rotate Hips 30° and measure max vertex displacement (`DEFORM_OK` /
`DEFORM_FAIL`).

## Still to pull in (checkpoint: researched)
- UniRig (MIT) — skeleton prediction transformer; needs GPU + weight download
- SkinTokens / TokenRig (MIT/Apache-2.0) — skinning model for existing skeletons
- MKA / mka_v3 (Apache-2.0) — full pipeline bundling the above
- Pinocchio — QUARANTINED (LGPL core; evaluate only, do not integrate)
- Mixamo / AccuRIG — web services, already in Forge3D catalog
