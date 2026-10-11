# CHARFIX STATUS MATRIX

Generated 2026-10-07. 68 cast models assessed.

## ⚠️ CORRECTION (2026-10-07)
The "zero-weight verts" counts below are INVALID — pygltflib cannot decode Meshopt-compressed GLBs, so it was reading compressed bytes as weights. Actual decoded weights have ZERO zero-weight verts.

**Real defect found:** Auto-rigger assigned verts to WRONG bones (e.g., BANNON: 671 thigh verts weighted to arm bones, causing spike deformation when arms move). **Fix:** `~/workspace/charfix/tools/reskin_proximity.mjs` — decodes Meshopt, finds verts whose dominant bone is far (>0.30) vs a much closer bone (<0.20), reassigns by proximity. Validated: BANNON spike eliminated, committed.

## Summary (skeleton/naming assessment still valid)

- 33 models: Mixamo colon-format bones, have skins (fix weights only)
- 5 models: partial Mixamo naming (standardize remainder)
- 9 models: other naming (full standardization needed)
- 21 models: NO skeleton/skin — cannot animate (mostly alternate attires + ASTRID, BILL_DOZER, MARKS, MASTER_SENSEI_gokublack, SOMBRA_NEGRA)
- Dominant defect: thousands of zero-weight verts per model (collapse to origin when animated)

## Priority 1 — Main cast (fix first)

- [x] BANNON_muscular_skinned: FIXED 2026-10-07 — 671 mis-weighted verts reassigned (thigh→arm bone error). Verified clean. Commit bfc63bb5.
- [ ] EDWIN_KENNEDY: joints=58 naming=mixamo-colon skins=1 issues=['weight check failed: unpack requires a buffer of 16 bytes']
- [ ] STAN_COMBS_gear: joints=58 naming=mixamo-colon skins=1 issues=['weight check failed: unpack requires a buffer of 16 bytes']
- [ ] CAIN_ELIAS_gear: joints=58 naming=other skins=1 issues=[]
- [ ] CAIN_ELIAS_snakeskin: joints=58 naming=mixamo-colon skins=1 issues=['6245 zero-weight verts']
- [ ] CODY_gear_skinned: joints=58 naming=mixamo-colon skins=1 issues=['5255 zero-weight verts']
- [ ] CODY_sober: joints=58 naming=mixamo-colon skins=1 issues=['6096 zero-weight verts']
- [ ] CODY_stressed: joints=58 naming=mixamo-colon skins=1 issues=['weight check failed: unpack requires a buffer of 16 bytes']
- [ ] NPC_FINXSSE: joints=58 naming=mixamo-colon skins=1 issues=['weight check failed: unpack requires a buffer of 16 bytes']
- [ ] STICKUP: joints=58 naming=mixamo-colon skins=1 issues=['weight check failed: unpack requires a buffer of 16 bytes']
- [ ] ONYX_skinned: joints=58 naming=mixamo-colon skins=1 issues=['weight check failed: unpack requires a buffer of 16 bytes']
- [ ] ONYX_corset_skinned: joints=58 naming=mixamo-colon skins=1 issues=['7200 zero-weight verts']
- [ ] ONYX_straightjacket: joints=58 naming=mixamo-colon skins=1 issues=['6721 zero-weight verts']
- [ ] ONYX_street: joints=58 naming=mixamo-colon skins=1 issues=['6557 zero-weight verts']
- [ ] ECHO: joints=85 naming=partial-mixamo skins=1 issues=[]
- [ ] CIPHER_rigged: joints=52 naming=mixamo-colon skins=1 issues=['weight check failed: unpack requires a buffer of 16 bytes']
- [ ] STATIC: joints=58 naming=mixamo-colon skins=1 issues=['6383 zero-weight verts']
- [ ] HOLLOW: joints=58 naming=mixamo-colon skins=1 issues=['weight check failed: unpack requires a buffer of 16 bytes']
- [ ] EL_TORO_DE_ORO: joints=58 naming=mixamo-colon skins=1 issues=['5977 zero-weight verts']
- [ ] SOMBRA_NEGRA: joints=0 naming=none skins=0 issues=['NO SKIN — cannot animate']
- [ ] BILL_DOZER: joints=0 naming=none skins=0 issues=['NO SKIN — cannot animate']
- [ ] ASTRID: joints=0 naming=none skins=0 issues=['NO SKIN — cannot animate']

## All models

- 🟢 AARON_RUBEN: joints=58 naming=mixamo-colon skins=1 anims=0 issues=['weight check failed: unpack requires a buffer of 16 bytes']
- 🔴 ASTRID: joints=0 naming=none skins=0 anims=0 issues=['NO SKIN — cannot animate']
- 🟢 BANNON_muscular_skinned: joints=58 naming=mixamo-colon skins=1 anims=0 issues=['6450 zero-weight verts']
- 🔴 BILL_DOZER: joints=0 naming=none skins=0 anims=0 issues=['NO SKIN — cannot animate']
- 🟡 BRIAN_CAGE_source: joints=315 naming=other skins=12 anims=0 issues=[]
- 🟡 BRUTUS: joints=85 naming=partial-mixamo skins=1 anims=0 issues=[]
- 🔴 CAIN_ELIAS_attire2: joints=0 naming=none skins=0 anims=0 issues=['NO SKIN — cannot animate']
- 🔴 CAIN_ELIAS_attire3: joints=0 naming=none skins=0 anims=0 issues=['NO SKIN — cannot animate']
- 🔴 CAIN_ELIAS_attire4: joints=0 naming=none skins=0 anims=0 issues=['NO SKIN — cannot animate']
- 🟡 CAIN_ELIAS_gear: joints=58 naming=other skins=1 anims=0 issues=[]
- 🟢 CAIN_ELIAS_snakeskin: joints=58 naming=mixamo-colon skins=1 anims=0 issues=['6245 zero-weight verts']
- 🟢 CIPHER_rigged: joints=52 naming=mixamo-colon skins=1 anims=0 issues=['weight check failed: unpack requires a buffer of 16 bytes']
- 🟢 CODY_gear_skinned: joints=58 naming=mixamo-colon skins=1 anims=0 issues=['5255 zero-weight verts']
- 🟢 CODY_sober: joints=58 naming=mixamo-colon skins=1 anims=0 issues=['6096 zero-weight verts']
- 🟢 CODY_stressed: joints=58 naming=mixamo-colon skins=1 anims=0 issues=['weight check failed: unpack requires a buffer of 16 bytes']
- 🟡 ECHO: joints=85 naming=partial-mixamo skins=1 anims=0 issues=[]
- 🟢 EDWIN_KENNEDY: joints=58 naming=mixamo-colon skins=1 anims=0 issues=['weight check failed: unpack requires a buffer of 16 bytes']
- 🔴 EDWIN_KENNEDY_attire3: joints=0 naming=none skins=0 anims=0 issues=['NO SKIN — cannot animate']
- 🔴 EDWIN_KENNEDY_ring1: joints=0 naming=none skins=0 anims=0 issues=['NO SKIN — cannot animate']
- 🟢 EL_TORO_DE_ORO: joints=58 naming=mixamo-colon skins=1 anims=0 issues=['5977 zero-weight verts']
- 🟢 HALL_NIGHTER: joints=58 naming=mixamo-colon skins=1 anims=0 issues=['6303 zero-weight verts']
- 🟢 HOLLOW: joints=58 naming=mixamo-colon skins=1 anims=0 issues=['weight check failed: unpack requires a buffer of 16 bytes']
- 🟢 JAGER: joints=58 naming=mixamo-colon skins=1 anims=0 issues=[]
- 🔴 JAGER_model1: joints=0 naming=none skins=0 anims=0 issues=['NO SKIN — cannot animate']
- 🔴 JAGER_nobeard: joints=0 naming=none skins=0 anims=0 issues=['NO SKIN — cannot animate']
- 🔴 JAGER_trench: joints=0 naming=none skins=0 anims=0 issues=['NO SKIN — cannot animate']
- 🟡 JUDAS: joints=315 naming=other skins=13 anims=0 issues=[]
- 🟡 JUDAS_alt_source: joints=315 naming=other skins=13 anims=0 issues=[]
- 🟡 JUDAS_classic: joints=315 naming=other skins=13 anims=0 issues=[]
- 🟡 JUDAS_crow: joints=315 naming=other skins=13 anims=0 issues=[]
- 🟡 JUDAS_lionheart: joints=315 naming=other skins=13 anims=0 issues=[]
- 🟡 JUDAS_painmaker: joints=315 naming=other skins=13 anims=0 issues=[]
- 🟡 JUDAS_y2j: joints=315 naming=other skins=13 anims=0 issues=[]
- 🟢 KOBRA: joints=58 naming=mixamo-colon skins=1 anims=0 issues=['6267 zero-weight verts']
- 🟢 MAIME_skinned: joints=58 naming=mixamo-colon skins=1 anims=0 issues=[]
- 🟢 MAIME_tattered_skinned: joints=58 naming=mixamo-colon skins=1 anims=0 issues=[]
- 🔴 MARKS: joints=0 naming=none skins=0 anims=0 issues=['NO SKIN — cannot animate']
- 🟢 MASTER_SENSEI: joints=58 naming=mixamo-colon skins=1 anims=0 issues=['6488 zero-weight verts']
- 🔴 MASTER_SENSEI_gokublack: joints=0 naming=none skins=0 anims=0 issues=['NO SKIN — cannot animate']
- 🟢 NPC_FINXSSE: joints=58 naming=mixamo-colon skins=1 anims=0 issues=['weight check failed: unpack requires a buffer of 16 bytes']
- 🟢 ONYX_corset_skinned: joints=58 naming=mixamo-colon skins=1 anims=0 issues=['7200 zero-weight verts']
- 🟢 ONYX_skinned: joints=58 naming=mixamo-colon skins=1 anims=0 issues=['weight check failed: unpack requires a buffer of 16 bytes']
- 🟢 ONYX_straightjacket: joints=58 naming=mixamo-colon skins=1 anims=0 issues=['6721 zero-weight verts']
- 🟢 ONYX_street: joints=58 naming=mixamo-colon skins=1 anims=0 issues=['6557 zero-weight verts']
- 🟢 PABLO: joints=58 naming=mixamo-colon skins=1 anims=0 issues=['6093 zero-weight verts']
- 🔴 PABLO_attire2: joints=0 naming=none skins=0 anims=0 issues=['NO SKIN — cannot animate']
- 🔴 PABLO_attire3: joints=0 naming=none skins=0 anims=0 issues=['NO SKIN — cannot animate']
- 🔴 SOMBRA_NEGRA: joints=0 naming=none skins=0 anims=0 issues=['NO SKIN — cannot animate']
- 🟢 STAN_COMBS_gear: joints=58 naming=mixamo-colon skins=1 anims=0 issues=['weight check failed: unpack requires a buffer of 16 bytes']
- 🟢 STATIC: joints=58 naming=mixamo-colon skins=1 anims=0 issues=['6383 zero-weight verts']
- 🟢 STICKUP: joints=58 naming=mixamo-colon skins=1 anims=0 issues=['weight check failed: unpack requires a buffer of 16 bytes']
- 🔴 TARZANIAN_DEVIL_attire2: joints=0 naming=none skins=0 anims=0 issues=['NO SKIN — cannot animate']
- 🟢 TARZANIAN_DEVIL_skinned: joints=58 naming=mixamo-colon skins=1 anims=0 issues=['6937 zero-weight verts']
- 🟢 TITAN: joints=58 naming=mixamo-colon skins=1 anims=0 issues=['6065 zero-weight verts']
- 🔴 TITAN_attire1: joints=0 naming=none skins=0 anims=0 issues=['NO SKIN — cannot animate']
- 🟢 TITAN_unmasked: joints=58 naming=mixamo-colon skins=1 anims=0 issues=['6179 zero-weight verts']
- 🔴 TITAN_white: joints=0 naming=none skins=0 anims=0 issues=['NO SKIN — cannot animate']
- 🟢 TRIPLE_XXX: joints=58 naming=mixamo-colon skins=1 anims=0 issues=['weight check failed: unpack requires a buffer of 16 bytes']
- 🟡 TRIPLE_XXX_suit: joints=58 naming=partial-mixamo skins=1 anims=0 issues=['3831 zero-weight verts']
- 🟡 TRIPLE_XXX_tights: joints=58 naming=partial-mixamo skins=1 anims=0 issues=['3831 zero-weight verts']
- 🟡 TRIPLE_XXX_trunks: joints=58 naming=partial-mixamo skins=1 anims=0 issues=['3981 zero-weight verts']
- 🟢 TYNESHIA: joints=58 naming=mixamo-colon skins=1 anims=0 issues=['7573 zero-weight verts']
- 🟢 TYNESHIA_street: joints=58 naming=mixamo-colon skins=1 anims=0 issues=['6869 zero-weight verts']
- 🟢 VIPER: joints=58 naming=mixamo-colon skins=1 anims=0 issues=['6035 zero-weight verts']
- 🟢 WRECK_PATTERSON: joints=58 naming=mixamo-colon skins=1 anims=0 issues=['weight check failed: unpack requires a buffer of 16 bytes']
- 🔴 WRECK_PATTERSON_attire2: joints=0 naming=none skins=0 anims=0 issues=['NO SKIN — cannot animate']
- 🔴 WRECK_PATTERSON_attire3: joints=0 naming=none skins=0 anims=0 issues=['NO SKIN — cannot animate']
- 🔴 WRECK_PATTERSON_attire4: joints=0 naming=none skins=0 anims=0 issues=['NO SKIN — cannot animate']

Legend: 🔴 no skeleton/skin (blocked or needs full rig) · 🟡 naming needs standardization · 🟢 standard bones, weights need fixing
