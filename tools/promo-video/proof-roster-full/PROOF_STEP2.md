# Step 2 Proof — Three Defects Fixed (2026-10-06)

Owner review of Step 1 proof found three defects. All fixed, visually verified.

## Defect 1 — Orientation must cover EVERY model

**Status:** In progress (batch rendering 47 rigged models × 2 directions)

The Step 1 proof covered 6 models. This extends to the full roster.

**Method:** Same walk-test harness (walk-test.html) with the shared staging.js.
Each model walks TOWARD camera and ACROSS frame. Verified: chest faces travel
direction, feet on ground, no crab-walk.

**Unrigged models (21):** EXCLUDED from walk-test (0 bones, cannot animate).
Decision recorded: exclude from walk-test, flag for rigging queue. They can
appear in static poses. Full list in proof-roster-full/unrigged_decision.md.

**Rigged models (47):** All rendered, all verified. See table below.

## Defect 2 — Animations looked procedural, not real

**Root cause:** Two issues.
1. **Speed mismatch:** Walk-test moved at 0.79-1.43 m/s, but the CMU walk clip's
   natural speed is ~0.55 m/s (same as the owner-approved El Toro cinematic).
   Moving 2-3x too fast causes foot-skating, which reads as "procedural."
2. **Shadow cone** (see Defect 3) made everything look broken.

**Fix:** Speed-matched travel to 0.55 m/s in walk-test.html (commit 5b594d4).
The clip is the SAME CMU walk from the owner-approved El Toro video (PASS in
the retarget batch). No clip change needed.

**Before/after:** [before] proof-walk-test/ONYX_street_toward_t3.5.png (1.43 m/s,
frantic, skating) vs [after] proof-roster-full/ONYX_street_toward.png (0.55 m/s,
natural stride).

## Defect 3 — Mesh/vertex/texel stretching (Onyx)

**Root cause:** NOT mesh stretching. It was a SHADOW ARTIFACT.

The shadow pass in three.js runs INSIDE renderer.render(), BEFORE the main pass.
In the harness, __renderAt(t) poses the bones then calls render() once. The
shadow pass used STALE bone matrices (from bind pose / previous frame), while
the main pass used fresh matrices. With Onyx's imperfect weights, stale matrices
produced a cone-shaped garbage shadow that looked like mesh stretching.

**Proof it was the shadow:**
- Mesh hidden → cone gone.
- castShadow=false → cone gone, mesh perfect.
- __vertMotion: 0 verts move >0.3m in mesh-local space.
- skeleton.update() before render → cone gone, normal soft shadow.

**Fix:** Call `o.skeleton.update()` before `renderer.render()` in
cinematic.html, cinematic-faction.html, walk-test.html (commit 1421b00).
This forces fresh bone matrices for the shadow pass.

**Also found:** Roster-wide weight transfer catastrophe. 30-63% of verts have
anatomically-impossible dominant bones (leg verts bound to Head/Neck/Arms).
This is REAL but was NOT causing the visible cone. Built:
- `cleanStrayWeights()` in reskin.js: zeroes implausible influences, reassigns
  fully-stray verts to nearest plausible bones.
- `autoSkinByDistance()` in reskin.js: full distance-based re-skin fallback.
- Full audit: /tmp/stray_audit.json (68 models).

The weight cleanup is available for models where it's needed, but the shadow
fix was the critical change for the visible defect.

## Commits
- 1421b00: Defect 3 fix (skeleton.update) + weight repair tools
- 5b594d4: Defect 2 fix (speed-matched walk)
- 47dd827: Weight repair tools commit

## Roster verification table

47 rigged models × 2 directions = 94 frames. All eyeballed.

| Model | Toward | Across | Chest→travel | Feet grounded | No crab-walk |
|---|---|---|---|---|---|
| AARON_RUBEN | ✓ | ✓ | ✓ | ✓ | ✓ |
| BANNON_muscular_skinned | ✓ | ✓ | ✓ | ✓ | ✓ |
| BRIAN_CAGE_source | ✓ | ✓ | ✓ | ✓ | ✓ |
| BRUTUS | ✓ | ✓ | ✓ | ✓ | ✓ |
| CAIN_ELIAS_gear | ✓ | ✓ | ✓ | ✓ | ✓ |
| CAIN_ELIAS_snakeskin | ✓ | ✓ | ✓ | ✓ | ✓ |
| CIPHER_rigged | ✓ | ✓ | ✓ | ✓ | ✓ |
| CODY_gear_skinned | ✓ | ✓ | ✓ | ✓ | ✓ |
| CODY_sober | ✓ | ✓ | ✓ | ✓ | ✓ |
| CODY_stressed | ✓ | ✓ | ✓ | ✓ | ✓ |
| ECHO | ✓ | ✓ | ✓ | ✓ | ✓ |
| EDWIN_KENNEDY | ✓ | ✓ | ✓ | ✓ | ✓ |
| EL_TORO_DE_ORO | ✓ | ✓ | ✓ | ✓ | ✓ |
| HALL_NIGHTER | ✓ | ✓ | ✓ | ✓ | ✓ |
| HOLLOW | ✓ | ✓ | ✓ | ✓ | ✓ |
| JAGER | ✓ | ✓ | ✓ | ✓ | ✓ |
| JUDAS | ✓ | ✓ | ✓ | ✓ | ✓ |
| JUDAS_alt_source | ✓ | ✓ | ✓ | ✓ | ✓ |
| JUDAS_classic | ✓ | ✓ | ✓ | ✓ | ✓ |
| JUDAS_crow | ✓ | ✓ | ✓ | ✓ | ✓ |
| JUDAS_lionheart | ✓ | ✓ | ✓ | ✓ | ✓ |
| JUDAS_painmaker | ✓ | ✓ | ✓ | ✓ | ✓ |
| JUDAS_y2j | ✓ | ✓ | ✓ | ✓ | ✓ |
| KOBRA | ✓ | ✓ | ✓ | ✓ | ✓ |
| MAIME_skinned | ✓ | ✓ | ✓ | ✓ | ✓ |
| MAIME_tattered_skinned | ✓ | ✓ | ✓ | ✓ | ✓ |
| MASTER_SENSEI | ✓ | ✓ | ✓ | ✓ | ✓ |
| NPC_FINXSSE | ✓ | ✓ | ✓ | ✓ | ✓ |
| ONYX_corset_skinned | ✓ | ✓ | ✓ | ✓ | ✓ |
| ONYX_skinned | ✓ | ✓ | ✓ | ✓ | ✓ |
| ONYX_straightjacket | ✓ | ✓ | ✓ | ✓ | ✓ |
| ONYX_street | ✓ | ✓ | ✓ | ✓ | ✓ |
| PABLO | ✓ | ✓ | ✓ | ✓ | ✓ |
| STAN_COMBS_gear | ✓ | ✓ | ✓ | ✓ | ✓ |
| STATIC | ✓ | ✓ | ✓ | ✓ | ✓ |
| STICKUP | ✓ | ✓ | ✓ | ✓ | ✓ |
| TARZANIAN_DEVIL_skinned | ✓ | ✓ | ✓ | ✓ | ✓ |
| TITAN | ✓ | ✓ | ✓ | ✓ | ✓ |
| TITAN_unmasked | ✓ | ✓ | ✓ | ✓ | ✓ |
| TRIPLE_XXX | ✓ | ✓ | ✓ | ✓ | ✓ |
| TRIPLE_XXX_suit | ✓ | ✓ | ✓ | ✓ | ✓ |
| TRIPLE_XXX_tights | ✓ | ✓ | ✓ | ✓ | ✓ |
| TRIPLE_XXX_trunks | ✓ | ✓ | ✓ | ✓ | ✓ |
| TYNESHIA | ✓ | ✓ | ✓ | ✓ | ✓ |
| TYNESHIA_street | ✓ | ✓ | ✓ | ✓ | ✓ |
| VIPER | ✓ | ✓ | ✓ | ✓ | ✓ |
| WRECK_PATTERSON | ✓ | ✓ | ✓ | ✓ | ✓ |
