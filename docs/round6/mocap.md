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

## AIST++ (dance)

- **URL:** https://google.github.io/aistplusplus_dataset/ · API: https://github.com/google/aistplusplus_api
- **What:** 10,108,015 frames of 3D keypoints / 1,408 dance motion sequences across 10 dance genres (street, ballet, etc.) with music, 9 camera views, train/val/test splits, SMPL pose parameters. The standard dance-motion corpus (ICCV 2021, "AI Choreographer"). Built from the AIST Dance Video Database via a multi-view 3D reconstruction pipeline.
- **License:** SPLIT — **annotations licensed by Google LLC under CC BY 4.0** (official factsfigures page: "The annotations are licensed by Google LLC under CC BY 4.0 license"); API starter code is Apache 2.0; the underlying AIST Dance Video Database has its own separate terms of use (aistdancedb.ongaaccel.jp/terms_of_use/) — check those before using the source videos.
- **Verdict:** ✅ **commercial-safe** for the 3D motion annotations with attribution (credit Li et al., ICCV 2021 / Google). Do not ship the source dance videos without clearing the AIST terms.
- **Notes:** AshLane's dance/taunt/celebration animations + rhythm-synced moves. 10 genres x 30 subjects gives huge variety for crowd dancers and character taunts. Retarget SMPL params -> 58-bone skeleton via tools/anim-retarget/.

## KIT Whole-Body Human Motion Database

- **URL:** https://motion-database.humanoids.kit.edu/ · motion-language subset: https://motion-annotation.humanoids.kit.edu/dataset/
- **What:** ~4,000+ high-quality whole-body mocap recordings (Vicon, C3D + MMM XML normalized format) with video previews, searchable by motion description. Includes grasping/object-interaction sets and the KIT Motion-Language subset (3,911 motions + 6,353 natural-language annotations, 3.9 GB) — a text-annotated corpus like a smaller HumanML3D. Master Motor Map (MMM) normalizes everything to a reference skeleton independent of capture system.
- **License:** Free account required; site FAQ: "we aim to make content freely available to the whole scientific community." Research-oriented terms — no commercial grant stated. MMM reference implementation is GPL.
- **Verdict:** ⚠️ **prototype-only** — research-community terms, no commercial license. Good local corpus for retargeting tests and text-to-motion experiments; do not ship.
- **Notes:** MMM XML is a clean normalized format worth supporting in the retargeter's importer list (alongside BVH/FBX/C3D). KIT-ML annotations pair with HumanML3D for text-driven move prototyping.

## HDM05

- **URL:** https://resources.mpi-inf.mpg.de/HDM05/
- **What:** 3+ hours of systematically recorded, well-documented Vicon mocap (C3D + ASF/AMC, 120 Hz) in ~100 manually cut motion classes: sports, kicks, punches, throws, dances, locomotion, cartwheels, handstands — 10-50 realizations per class by 5 actors. The classic "clean, labeled" corpus; ships a Matlab parser for C3D/ASF/AMC.
- **License:** Site states objective is "to supply free motion capture data for research purposes"; copyright line: "licensed under a Creative Commons Attribution-ShareAlike 3.0 Unported License." Research framing + share-alike copyleft = not shippable cleanly. Acknowledgment requested: "The data used in this project was obtained from HDM05."
- **Verdict:** ⚠️ **prototype-only** — research-framed terms and CC BY-SA 3.0 share-alike; use locally for retargeting/segmentation experiments, do not ship clips.
- **Notes:** Pre-cut labeled clips (1,500 cuts / ~50 min) are ideal for training the motion-bank indexer and testing clip-trimming heuristics. ASF/AMC importer needed (same family as CMU).

## orangeduck/Motion-Matching (Learned Motion Matching reference)

- **URL:** https://github.com/orangeduck/Motion-Matching
- **What:** Daniel Holden's reference implementation of Motion Matching + Learned Motion Matching (SIGGRAPH 2020) in C++ with a raylib demo compilable to WebAssembly. Builds a pose database from mocap, searches it every frame for the pose best matching current state + desired trajectory — no hand-authored transitions. Includes decompressor/stepper/projector training scripts that compress a 590 MB database to ~8.5 MB (~70x).
- **License:** **Code = MIT** (repo LICENSE, verified on repo page). The bundled demo database is from a dataset under **CC BY-NC-ND 4.0** — explicitly "unlike the code, which is licensed under MIT" (repo README).
- **Verdict:** ✅ **commercial-safe (code)** — port the MIT search/database/feature code to TS for our runtime; ⚠️ **prototype-only (bundled data)** — rebuild the pose database from commercial-safe corpora (CMU, Mesh2Motion CC0, AIST++).
- **Notes:** The single most important animation-tech entry in this wave: motion matching kills the state-machine authoring bottleneck for locomotion. Deterministic by construction (database lookup). Pair with foot-IK (below) for planted feet.

## godot-motion-matching

- **URL:** https://github.com/guilhermegsousa/godot-motion-matching
- **What:** Motion Matching as a Godot 4.4 GDExtension + AnimationTree node: builds the pose database from an animation library, queries it at runtime, integrates with Godot's state machines/blend trees/IK. KD-tree queries (20-30x over naive), bone-feature support, editor tooling for baking databases. Demo data taken from the O3DE MotionMatching Gem.
- **License:** **MIT** (LICENSE.md, verified on repo page).
- **Verdict:** ✅ **commercial-safe** — MIT. Godot-specific, but the feature-extraction + KD-tree query design ports directly to our three.js runtime; also the fastest way to prototype motion matching today (Godot 4.4 is free).
- **Notes:** Read alongside orangeduck's C++ reference: this shows how to productize MM inside an engine's animation graph. O3DE's MotionMatching Gem (Apache 2.0) is a second commercial-safe reference implementation.

## PlayCanvas AnimStateGraph

- **URL:** https://github.com/playcanvas/engine (src/framework/anim/*: AnimStateGraph, AnimComponent, AnimBlendTree)
- **What:** A complete, engine-grade JS animation state machine: states, transitions with conditions/exitTime/priority/interruptionSource, parameters (bool/int/float/trigger), blend trees (1D/2D/direct), animation layers with weights + bone masks, animation events, and a visual graph editor (playcanvas/editor, ~1800 lines). Pure TypeScript, no engine lock-in for the graph logic.
- **License:** **MIT** (PlayCanvas engine).
- **Verdict:** ✅ **commercial-safe** — the reference design for our JS animation state machine. Port the graph/transition/parameter semantics to three.js; study the blend-tree math for upper-body/locomotion layering.
- **Notes:** Covers the "JS animation state machines" ask outright. AnimComponentLayer's weight/blendType/mask model is exactly what AshLane needs for punch-while-walking layering. Editor is a bonus reference for a future in-house anim graph UI.

## Foot IK for three.js (fullik / THREE.IK)

- **URL:** https://github.com/lo-th/fullik · https://github.com/jsantell/THREE.IK
- **What:** Two JS IK solvers for three.js. **fullik** (lo-th): full-body FABRIK solver (port of Java Caliko by Andreas Aristidou) — Bone3D/Chain3D/Structure3D with joint constraints, demo-proven for feet planting, reaching, full-body posing. **THREE.IK** (jsantell): CCD/FABRIK-style per-chain solver with a clean three.js-native API (IKChain, IKJoint, targets).
- **License:** THREE.IK = **MIT** (Copyright 2018 Jordan Santell, repo README). fullik: no LICENSE file found in the repo snapshot — lo-th's projects are conventionally MIT, but **unverified; confirm the LICENSE file before shipping**.
- **Verdict:** ✅ **commercial-safe (THREE.IK, MIT)** — archived 2018 but the math doesn't rot; ⚠️ **prototype-only (fullik) until its LICENSE is confirmed**.
- **Notes:** Foot IK is the mandatory companion to motion matching and retargeted mocap: lock feet to the ground plane, kill foot-skate on locomotion, plant feet for wrestling grapples. FABRIK is cheap enough to run per-frame on multiple fighters.

## Rokoko Studio Live for Blender (retarget engine)

- **URL:** https://github.com/Rokoko/rokoko-studio-live-blender · battle-tested port: https://github.com/mesh2motion/mesh2motion-assets (motion-capture/blender-plugin, NOTICE.md)
- **What:** Official Rokoko Blender plugin: streams mocap into Blender in real time and retargets between arbitrary rigs (multi-actor). The retarget engine — helper bones in a throwaway copy of the source armature, constraints on the target, chunked bake, F-curve stitch + cleanup — is the proven recipe; Mesh2Motion ported exactly that mechanism (dropping Rokoko's UI/auto-detection) for their mocopi->M2M retargeter, with Blender 4.4/5.0 slotted-action fixes.
- **License:** The retarget code is **LGPL-3.0-or-later**, © Rokoko Electronics ApS (per Mesh2Motion's NOTICE.md citing Rokoko sources core/utils.py, operators/retargeting.py). Some community forks badge MIT — the LGPL attribution from the porter is the authoritative record for the retarget engine.
- **Verdict:** ✅ **commercial-safe as a tool** — LGPL governs the addon code, not the animations it bakes; output clips are yours. Keep the LGPL attribution if redistributing the addon itself.
- **Notes:** Don't re-derive retargeting from scratch: this engine's constraint-bake-stitch pipeline is the reference for hardening tools/anim-retarget/. The Mesh2Motion port is the cleaner codebase to study (fixed bone maps instead of auto-detection).

## Blender retargeting addons (Rigify / Mr Mannequins Tools / Auto-Rig Pro)

- **URL:** Rigify — bundled with Blender (blender.org) · Mr Mannequins Tools — https://github.com/JamesTKane/mr-mannequins-tools (James Taylor) · Auto-Rig Pro — https://blendermarket.com/products/auto-rig-pro (~$40)
- **What:** Three tiers of Blender-side retargeting/rigging. **Rigify**: Blender's built-in auto-rig generator — full humanoid meta-rig with IK/FK, bendy bones, face rig; the standard free baseline. **Mr Mannequins Tools**: free addon for retargeting any mocap onto the Unreal mannequin (and back) — bone-map driven, batch-friendly. **Auto-Rig Pro**: the paid workhorse ($40) — smart auto-rig, one-click Mixamo/UE retarget, corrective shape keys, export presets; the tool most indie studios actually use.
- **License:** Rigify = **GPL** (bundled with Blender — tool use is fine; GPL covers the addon code, not the rigs/animations you bake). Mr Mannequins Tools = **GPL** (Blender addon). Auto-Rig Pro = **proprietary paid**, commercial use allowed with purchase.
- **Verdict:** ✅ **commercial-safe as tools** (all three) — output rigs/animations are yours. Budget note: Auto-Rig Pro is the only paid item in this whole wave (~$40 one-time).
- **Notes:** Pipeline recommendation: Rigify (free) for in-house rigs, Mr Mannequins Tools for UE-mannequin-sourced mocap, Auto-Rig Pro if retarget volume justifies $40. All three feed baked actions into tools/anim-retarget/.

## Assimp (BVH/FBX → glTF converter)

- **URL:** https://github.com/assimp/assimp
- **What:** The Open Asset Import Library: reads 40+ 3D formats (BVH, FBX, Collada, C3D-adjacent pipelines) and writes glTF 2.0. The `assimp` CLI does batch conversion (`assimp export in.bvh out.glb`) — the missing link for turning BVH mocap corpora (CMU, LaFAN1, HDM05) into engine-ready GLB clips without opening Blender.
- **License:** **BSD 3-Clause** (repo LICENSE).
- **Verdict:** ✅ **commercial-safe** — BSD tool; converted output is yours.
- **Notes:** Wire into the ingest pipeline as the first conversion stage: BVH/FBX → GLB → tools/anim-retarget/ → 58-bone skeleton. Also useful for validating downloaded mocap before retargeting.

## License ledger

| Project | License (source) | Verdict |
|---|---|---|
| Mesh2Motion | MIT code / CC0 assets (repo README) | commercial-safe |
| AMASS | non-commercial scientific research (LICENSE + license.html) | prototype-only |
| BABEL | non-commercial scientific research (repo README) | prototype-only |
| HumanML3D | MIT code / AMASS-derived data = non-commercial research | prototype-only (data) |
| LaFAN1 | Ubisoft license.txt, non-commercial (BY-NC-ND) | prototype-only |
| AIST++ | CC BY 4.0 annotations (Google); AIST video DB separate terms | commercial-safe (attribution) |
| KIT Whole-Body Motion DB | research-community terms, no commercial grant | prototype-only |
| Rokoko Studio Live Blender | LGPL-3.0 retarget engine (Mesh2Motion NOTICE.md) | commercial-safe (tool) |
| Rigify / Mr Mannequins / Auto-Rig Pro | GPL / GPL / proprietary paid (~$40) | commercial-safe (tools) |
