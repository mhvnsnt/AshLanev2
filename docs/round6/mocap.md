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

## KIT Whole-Body Human Motion Database

- **URL:** https://motion-database.humanoids.kit.edu/ · motion-language subset: https://motion-annotation.humanoids.kit.edu/dataset/
- **What:** ~4,000+ high-quality whole-body mocap recordings (Vicon, C3D + MMM XML normalized format) with video previews, searchable by motion description. Includes grasping/object-interaction sets and the KIT Motion-Language subset (3,911 motions + 6,353 natural-language annotations, 3.9 GB) — a text-annotated corpus like a smaller HumanML3D. Master Motor Map (MMM) normalizes everything to a reference skeleton independent of capture system.
- **License:** Free account required; site FAQ: "we aim to make content freely available to the whole scientific community." Research-oriented terms — no commercial grant stated. MMM reference implementation is GPL.
- **Verdict:** ⚠️ **prototype-only** — research-community terms, no commercial license. Good local corpus for retargeting tests and text-to-motion experiments; do not ship.
- **Notes:** MMM XML is a clean normalized format worth supporting in the retargeter's importer list (alongside BVH/FBX/C3D). KIT-ML annotations pair with HumanML3D for text-driven move prototyping.

## License ledger

| Project | License (source) | Verdict |
|---|---|---|
| Mesh2Motion | MIT code / CC0 assets (repo README) | commercial-safe |
