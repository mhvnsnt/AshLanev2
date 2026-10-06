# Round 6 — Mocap & Animation

Motion-capture datasets, converters, Blender retargeting addons, JS animation state machines, motion matching, additive animation, and foot-IK solutions for three.js. Research only — no downloads, no code.

Rule: prototype may use whatever WORKS. License recorded from the actual LICENSE file / official terms page. Verdict per project: **commercial-safe** (can ship in the game with noted conditions) or **prototype-only** (usable in local builds/research, must not ship).

Skipped per rounds 1–5 (already covered in `docs/FREE_APIS_AND_PUBLIC_DOMAIN.md`): CMU mocap + cMonkeys Huge FBX Mocap Library, Mixamo (tool only, no raw redistribution), MoCap Online free pack, Rokoko (Studio pipeline), Quaternius UAL (QAL v1.0), mediapipe-mocap.ts, `public/motion/wrestling/` GLBs.

---

## Mesh2Motion (app + assets)

- **URL:** https://github.com/Mesh2Motion/mesh2motion-app · assets: https://github.com/Mesh2Motion/mesh2motion-assets
- **What:** Free open-source web app (the "Mixamo alternative") that auto-rigs imported GLB/GLTF/DAE/FBX models to built-in human/animal rigs (birds, dragons, snakes, foxes, kaiju) and exports multiple animations bundled into one GLB — the format three.js/Babylon/Godot ingest natively. Ships a library of human animations (~150 game clips + fitness: Pushup, Jumping Jacks, Crawl, Jump, Crouch_Idle, Roll, Swim_Fwd, etc.) as compressed GLB files in the assets repo.
- **License:** Code = MIT; **all art assets (models, rigs, animations) = CC0** (README "Licenses" section: "The code and platform are all licensed under the very permissive MIT license. The art assets … are all licensed under CC0").
- **Verdict:** ✅ **commercial-safe** — CC0 animations can be retargeted to our 58-bone skeleton via `tools/anim-retarget/` and shipped; no attribution required. Human animation pack partially derived from Quaternius (CC0).
- **Notes:** Fastest commercial-safe mocap expansion for AshLane locomotion/combat-idle bases. Also bundles a mocopi→M2M Blender retarget plugin (port of Rokoko's LGPL retarget engine, see entry below) — useful reference for our retargeter.

---

## AMASS (Archive of Motion Capture as Surface Shapes)

- **URL:** https://amass.is.tue.mpg.de · code: https://github.com/nghorbani/amass
- **What:** The largest unified human-motion corpus: 15+ optical mocap datasets (CMU, HumanEva, TotalCapture, etc.) re-fit with MoSh++ onto the SMPL/SMPL+H/DMPL parametric body model. ~40-50+ hours, ~11k-18k distinct motions, several hundred subjects, shipped as compressed `.npz` SMPL+H pose+shape parameters (no RGB). Official loader/conversion code in `nghorbani/amass`.
- **License:** Custom "Software Copyright License for non-commercial scientific research purposes" (repo LICENSE + https://amass.is.tue.mpg.de/license.html). Commercial use requires contacting ps-license@tue.mpg.de. Gated behind registration + separate SMPL body-model license.
- **Verdict:** ⚠️ **prototype-only** — richest raw material for retargeting experiments and training generative motion models, but cannot ship in the game or train shipped models without a commercial license.
- **Notes:** Retarget path: AMASS SMPL joint angles -> our 58-bone skeleton via `tools/anim-retarget/` (joint-convention remap needed). Keep strictly out of shipped builds; good for the generative-pipeline motion prior.

## BABEL

- **URL:** https://babel.is.tue.mpg.de · code: https://github.com/abhinanda-punnakkal/BABEL
- **What:** Dense action annotations over AMASS: ~43 hours / 3.7k sequences with frame-aligned atomic action labels (60+ action classes, overlapping actions, transitions). The ontology layer for "find me every punch/kick/dodge in AMASS". Helper notebooks for loading, visualizing, and searching mocap by action label.
- **License:** "Software Copyright License for non-commercial scientific research purposes" (repo README License section, same MPI terms family as AMASS). Mocap sequences themselves download from AMASS under AMASS terms.
- **Verdict:** ⚠️ **prototype-only** — non-commercial research license. Use locally to mine action-labeled clips for retargeting experiments; do not ship clips or derived baked animations.
- **Notes:** Killer feature for AshLane: semantic search ("all kicking motions") to build combat move candidate sets before manual cleanup. Labels themselves are the valuable part for the motion-bank indexer.

## HumanML3D

- **URL:** https://github.com/EricGuo5513/HumanML3D
- **What:** 3D human motion-language dataset (CVPR 2022): 14,616 motion clips + 44,970 natural-language descriptions (3-4 sentences per clip, MTurk-annotated), 28.6 hours, 20 fps, covering daily activities, sports (swimming, golf), acrobatics (cartwheel), artistry (dancing). Ships the standard 263-dim motion representation + train/test splits used by nearly all text-to-motion research. Companion repo `text-to-motion` holds the generation code.
- **License:** SPLIT — **code is MIT** (Copyright (c) 2022 Chuan Guo, per repo LICENSE); the **motion data derives from AMASS + HumanAct12, so data inherits AMASS non-commercial research terms**. Multiple downstream audits confirm: "data is research/non-commercial; code is MIT."
- **Verdict:** ⚠️ **prototype-only for data** (cannot ship clips or train shipped models on it); ✅ code MIT is fine to adapt. Text annotations are the prize for the generative pipeline (text->move prototyping).
- **Notes:** KIT-ML subset (3,911 motions + 6,353 descriptions) also mirrored in the repo. Best pairing with our universal retargeter for text-driven move generation experiments.

## LaFAN1 (Ubisoft La Forge Animation Dataset)

- **URL:** https://github.com/ubisoft/ubisoft-laforge-animation-dataset · resolved re-release: https://github.com/lzj910/lafan1-resolved (BVH+FBX on a common skeleton)
- **What:** ~4.6 hours of high-quality production mocap (Ubisoft, "Robust Motion In-Betweening" SIGGRAPH 2020): locomotion, turns, jumps, punches, kicks, dances, sports, falls — captured for ML motion research. BVH format; the `lafan1-resolved` fork re-targets everything onto one common skeleton and ships both BVH and FBX zips.
- **License:** Ubisoft license.txt — **not licensed for commercial use** (independent audits list it as CC BY-NC-ND; the resolved-data README states plainly: "This means this data is NOT licensed for commercial use"). No registration needed for the resolved mirror.
- **Verdict:** ⚠️ **prototype-only** — excellent locomotion/transition test corpus for motion-matching and in-betweening experiments; cannot ship clips.
- **Notes:** No-gate download makes it the fastest corpus to exercise the retargeter + a motion-matching prototype against. Pairs naturally with orangeduck/Motion-Matching below (same research lineage).

## License ledger

| Project | License (source) | Verdict |
|---|---|---|
| Mesh2Motion | MIT code / CC0 assets (repo README) | commercial-safe |
| AMASS | non-commercial scientific research (LICENSE + license.html) | prototype-only |
| BABEL | non-commercial scientific research (repo README) | prototype-only |
| HumanML3D | MIT code / AMASS-derived data = non-commercial research | prototype-only (data) |
| LaFAN1 | Ubisoft license.txt, non-commercial (BY-NC-ND) | prototype-only |
