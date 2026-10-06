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

## License ledger

| Project | License (source) | Verdict |
|---|---|---|
| Mesh2Motion | MIT code / CC0 assets (repo README) | commercial-safe |
| AMASS | non-commercial scientific research (LICENSE + license.html) | prototype-only |
