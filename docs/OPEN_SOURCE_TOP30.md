# OPEN SOURCE TOP 30 — Federation Targets

> Research: 2026-10-05. Three categories, 10 each, ranked by impact for our work.
> License rule: only MIT / Apache-2.0 / BSD / CC0 go into the commercial build.
> Anything else is marked ⚠️ — strategy/lessons only, no code merged.

All repos: AshLane (3D urban brawler, PWA), Bannon (wrestling), Brutal-Fist (PS1 fighter),
money-machine-hq (Code Doctor / Asset Doctor), TRIPPEDD (video pipeline).

---

## 1. MOST HIGH-TECH / CUTTING-EDGE

Ranked: what moves our rendering, physics, and animation furthest, fastest.

### 1.1 Babylon.js — Apache-2.0
- https://github.com/BabylonJS/Babylon.js
- Microsoft-sponsored, TypeScript-first 3D engine. **Stable WebGPU since 2022** (three.js WebGPU is still experimental), raw WGSL access, documented Web Worker rendering path, Babylon Native (iOS/Android).
- Why: our WebGPU upgrade path. If three.js WebGPU stays experimental, Babylon is the proven alternative — same TypeScript, better GPU-driven rendering story.
- Fits: AshLane (renderer research), all 3D repos.

### 1.2 JoltPhysics — MIT
- https://github.com/jrouwe/JoltPhysics (+ https://github.com/jrouwe/JoltPhysics.js for WASM)
- AAA rigid-body physics — ships in Horizon Forbidden West and Death Stranding 2. Multi-core friendly, deterministic.
- Why: the highest-quality physics we can legally drop into a browser game. Destructible environments, ragdoll knockdowns, vehicle mayhem.
- Fits: AshLane (ragdoll finishers, destructibles), Bannon.

### 1.3 Rapier — Apache-2.0
- https://github.com/dimforge/rapier (JS: `@dimforge/rapier3d-compat`)
- Rust → WASM 2D/3D physics **with a soft-body solver**. Character controller built in.
- Why: soft-body = cloth, jiggle, deformable props without faking it. Already pairs with `ecctrl` (§3.1).
- Fits: AshLane (crowd/props), character pipeline.

### 1.4 NVIDIA MotionBricks — open model + dataset (⚠️ verify license)
- Announced via NVIDIA Research; model + 700hrs mocap (350k clips, 9,300 skills) released publicly.
- Why: generative character animation in ~2ms — replaces thousands of hand-wired clips. This is the "quantum" answer to our animation library problem. Even if we only study the paper + dataset format, it changes our pipeline thinking.
- Fits: AshLane, Bannon (animation pipeline), Asset Doctor.

### 1.5 valentil/gaussian-splats — MIT
- https://github.com/valentil/gaussian-splats
- From-scratch WebGL 3D Gaussian Splatting viewer on Three.js — PLY parser, spherical harmonics, sorted-quad rasterizer. No heavy deps.
- Why: the owner explicitly wants Gaussian splat in the world pipeline. This is the smallest pullable 3DGS renderer.
- Fits: AshLane (worldgen), TRIPPEDD (video backgrounds).

### 1.6 reall3d-com/Reall3dViewer — MIT
- https://github.com/reall3d-com/Reall3dViewer
- Production 3DGS viewer: LOD, measurements, SPX compression, 756 commits.
- Why: when splats get big, LOD + compression is what keeps mobile alive. Study their LOD strategy.
- Fits: AshLane (mobile perf), TRIPPEDD.

### 1.7 PlayCanvas Engine — MIT
- https://github.com/playcanvas/engine
- Full browser engine: WebGL2 + WebGPU, animation, audio, physics, WebXR. Editor optional.
- Why: a complete engine reference for PWA game architecture — asset pipeline, scene graph, mobile profiling.
- Fits: AshLane (architecture reference).

### 1.8 three-mesh-bvh — MIT
- https://github.com/gkjohnson/three-mesh-bvh
- GPU-accelerated bounding-volume hierarchy for three.js; includes a character-movement collision example (capsule vs. world, no physics engine).
- Why: collision without a physics engine — ~200 lines to own, zero WASM. Perfect for street-level movement against procedural buildings.
- Fits: AshLane (movement/collision).

### 1.9 Infinigen — BSD-3 (verify per-file)
- https://github.com/princeton-vl/infinigen
- Princeton procedural 3D world generator — infinite photoreal terrain, vegetation, creatures, fully procedural.
- Why: the academic state of the art in procedural worlds. Our worldgen can steal techniques (not code verbatim until license verified per file).
- Fits: AshLane (worldgen), Asset Doctor.

### 1.10 TypeGPU — MIT (verify)
- https://github.com/software-mansion/TypeGPU
- Typed WebGPU compute shaders in TypeScript — GPU physics, particles, crowd sim without raw WGSL pain.
- Why: our boids/crowd/particles could run on GPU. This is the practical path.
- Fits: AshLane (crowds, particles, Malakor glow effects).

---

## 2. MOST PROFITABLE / SUCCESSFUL

Ranked: what teaches us to make money, or is a money-making machine we can ride.

### 2.1 Godot — MIT
- https://github.com/godotengine/godot
- 50+ Godot games now earn **$1M+/year** (was 2, three years ago). W4 Games raised **$33M** (Tencent-led) selling enterprise support for it.
- Why: proof that MIT-licensed engines print money *around* the engine, not from it. Our pipeline (Asset Doctor / Code Doctor) is the same play: free tech, paid service.
- Fits: money-machine-hq (business model), all repos.

### 2.2 Commercial Godot hits — strategy, not code
- Buckshot Roulette **$6.9M**, Dome Keeper **$6.1M**, Brotato, Backpack Battles **$5.2M** (per godotawesome.com/Gamalytic).
- Why: the pattern is *tight scope + streamable hook + fast loop*. Buckshot Roulette is 1–3 hours long. AshLane's "Urban Reign 2" pitch needs the same discipline: one great loop, not everything at once.
- Fits: AshLane (scope discipline), TRIPPEDD (trailer hooks).

### 2.3 W4 Games — the OSS monetization blueprint
- https://w4games.com — $33M raised; sells support, cloud, console ports for a free engine.
- Why: this is exactly the Code Doctor / Asset Doctor model — free pipeline, paid "we'll fix/ship it for you." Copy the structure: free tier (lead magnet) → support contracts (revenue).
- Fits: money-machine-hq.

### 2.4 Kenney.nl — CC0
- https://kenney.nl — thousands of CC0 game assets, funded by donations/Patreon.
- Why: the Asset Doctor endgame — a trusted free-asset brand that funnels into paid services. Kenney proves the funnel works at scale.
- Fits: Asset Doctor, AshLane (assets now).

### 2.5 Poly Haven — CC0
- https://polyhaven.com — CC0 HDRIs, PBR textures, models; Patreon-funded.
- Why: HDRIs alone would upgrade our PWA lighting to "expensive" for free. And the funding model (free assets → patrons) is another proven template.
- Fits: AshLane (lighting/textures), Malakor layer.

### 2.6 Bevy — MIT/Apache
- https://github.com/bevyengine/bevy
- Rust ECS engine; games like Punchy ship on it. Data-oriented = performance.
- Why: ECS is how you get 100+ characters fighting without frame drops. Our sim.ts can steal the *pattern* even staying in TS.
- Fits: AshLane (sim architecture).

### 2.7 Phaser — MIT
- https://www.phaser.io — the HTML5 2D engine behind countless profitable web/mobile games.
- Why: Phaser's *marketplace + templates* economy is the model for selling AshLane-adjacent tools later (menu kits, combat templates).
- Fits: money-machine-hq (product ideas).

### 2.8 Veloren — ⚠️ GPL-3.0 (lessons only, no code in commercial build)
- https://github.com/veloren/veloren — community-built open-world voxel RPG, 100s of contributors.
- Why: proof that volunteers will build your game *with* you if the vision is strong. Our "federation" approach is the commercial-safe version of this.
- Fits: community strategy, not code.

### 2.9 OpenRA — ⚠️ GPL-3.0 (lessons only)
- https://github.com/OpenRA/OpenRA — open C&C engine; survives on donations + modding community.
- Why: the *modding platform* play — give players tools, they extend the game forever. AshLane's character generator + worldgen could become this.
- Fits: AshLane (UGC strategy).

### 2.10 itch.io open-revenue games — strategy
- Games like *Dome Keeper* and *Buckshot Roulette* launched on itch.io first, then Steam.
- Why: the launch ladder — free/prototype on itch → paid on Steam. Our PWA *is* the itch.io equivalent: free in browser, proof before price.
- Fits: AshLane (launch plan), TRIPPEDD (promo).

---

## 3. MOST HELPFUL TO OUR WORK

Ranked: what we can pull in *this week* and feel the difference.

### 3.1 pmndrs/ecctrl — MIT
- https://github.com/pmndrs/ecctrl
- Production character controller (Rapier + three.js): float-spring capsule, slopes, steps, snap-to-ground, third-person camera with collision, touch input.
- Why: the single biggest "feel" upgrade available — our hand-rolled controller vs. this is night and day.
- Fits: AshLane (player controller), Bannon.

### 3.2 yuka — MIT
- https://github.com/mugen87/yuka
- Steering behaviors (seek/flee/separation/alignment/wander), vision cones, state machines for NPC agents.
- Why: drop-in crowd/pedestrian AI brains. Our boids + yuka steering = living streets.
- Fits: AshLane (pedestrians, group AI).

### 3.3 sinusphi/stickman-fighter — MIT
- https://github.com/sinusphi/stickman-fighter
- Deterministic combat sim: frame data, hitboxes, block/whiff punish, training mode with frame-stepping, replay import/export.
- Why: the *reference implementation* for doing fighting-game combat correctly — deterministic tick, frame stepping for debugging our own combat.
- Fits: AshLane (combat), Brutal-Fist.

### 3.4 OpenBOR — BSD-3-Clause
- https://github.com/DCurrent/openbor
- THE open beat-'em-up engine (Streets of Rage-likes), ships on Android/Linux/Mac/Windows.
- Why: 20 years of brawler design decisions in one codebase — enemy AI, spawning, combo scoring. Read it like a textbook.
- Fits: AshLane (brawler design bible).

### 3.5 vineetsharma96/nexuscity — MIT
- https://github.com/vineetsharma96/nexuscity
- Procedural cyberpunk city in browser: **zero external models/textures/audio** — everything synthesized, seeded deterministic, NPCs + traffic + enterable interiors.
- Why: the closest existing proof of our "generative world" vision. Steal the seeded-city architecture and procedural audio approach.
- Fits: AshLane (worldgen), audio.

### 3.6 Kenney City Kits — CC0
- https://kenney.nl/assets?q=city — City Kit, Roads, Commercial, Industrial packs as GLB.
- Why: instant street scaffolding — drop in, then replace piece-by-piece with our procedural buildings. Already license-clean.
- Fits: AshLane (worldgen now).

### 3.7 catsjuice/random-city — MIT (verify)
- https://github.com/catsjuice/random-city
- Procedural city with rivers, traffic, pedestrians, day/night + weather, seeded.
- Why: traffic + pedestrian systems we can study for our street life.
- Fits: AshLane (traffic/peds).

### 3.8 vite-plugin-pwa — MIT
- https://github.com/vite-pwa/vite-plugin-pwa
- Workbox service workers for Vite — offline, precache, auto-update.
- Why: our PWA needs proper offline + update flow for mobile. This is the standard.
- Fits: AshLane (PWA).

### 3.9 Tone.js — MIT
- https://github.com/Tonejs/Tone.js
- Web Audio framework: synths, samplers, effects, transport scheduling.
- Why: our procedural music (music.ts) could graduate from hand-rolled oscillators to real synthesized instruments. Adaptive boom-bap with actual drum synthesis.
- Fits: AshLane (music), TRIPPEDD (video audio).

### 3.10 howler.js — MIT
- https://github.com/goldfire/howler.js
- Bulletproof web audio: sprites, spatial, mobile unlock handling.
- Why: mobile browsers kill audio in 10 creative ways — howler has solved all of them. Our combat SFX should route through it.
- Fits: AshLane (SFX reliability on Android).

---

## Pull order (suggested)

**This week:** ecctrl, yuka, Kenney City Kits, vite-plugin-pwa, howler.js
**This month:** Jolt or Rapier, three-mesh-bvh, nexuscity architecture study, Tone.js music upgrade
**Research bets:** Babylon.js WebGPU eval, MotionBricks paper, Infinigen techniques, Reall3dViewer LOD

*License gate stands: MIT/Apache/BSD/CC0 only into the build. ⚠️ items are strategy-only.*

---

## 4. GENERATIVE AI — Permissive Licenses Only

> Research: 2026-10-05 (round 2). Beyond TripoSR/TRELLIS/Shap-E already in `tools/generative/`.
> Every entry here is MIT, Apache-2.0, BSD, or CC0 — safe for the commercial build.

### 4.1 OpenX Clay — MIT
- https://github.com/openx-inc/clay
- **What:** Image/text → game-ready 3D. The killer feature isn't generation — it's **post-processing**: remesh/decimate to poly budget, clean UVs, pack PBR maps, export GLB/FBX. Turns AI blobs into shippable assets.
- **Integration:** Add as the post-process stage in `tools/generative/`. Pipeline becomes: TRELLIS.2 (generate) → Clay (clean + retopo + UV) → our rig pipeline (animate). This closes the loop from prompt to game-ready character.
- **Fits:** AshLane (character/prop pipeline), Asset Doctor (the sellable service).

### 4.2 TRELLIS.2 — MIT (Microsoft)
- https://github.com/microsoft/TRELLIS
- **What:** Single-image → 3D mesh with **full PBR** (albedo, roughness, metallic, opacity). ~3s at 512³ on H100, ~60s at 1536³. 4B params. Strongest open image-to-3D for production PBR.
- **Integration:** GPU backend for `tools/generative/`. Run on Modal/RunPod (no local GPU needed). Output GLBs feed directly into Clay for cleanup.
- **Fits:** AshLane (props, environment pieces), Asset Doctor.

### 4.3 Material Anything — MIT (3DTopia, CVPR 2025 Highlight)
- https://github.com/3DTopia/MaterialAnything
- **What:** Generates PBR materials (albedo, roughness, metallic, normal) for **any existing 3D mesh** — texture-less, scanned, or AI-generated. The highest-value texturing tool because our problem is texturing meshes we already have.
- **Integration:** Add as `tools/generative/texture_pbr.py`. Feed it untextured GLBs (our generated characters, Sombra variants) → get PBR maps → apply in three.js.
- **Fits:** AshLane (character texturing), Asset Doctor.

### 4.4 Poly Haven — CC0
- https://polyhaven.org
- **What:** Hundreds of CC0 PBR materials + HDRIs. No attribution needed, commercial-safe.
- **Integration:** Bulk-download district-appropriate materials (concrete, asphalt, brick, neon) into `public/textures/`. Wire into worldgen-textures.ts.
- **Fits:** AshLane (worldgen — immediate).

### 4.5 ambientCG — CC0
- https://ambientcg.com
- **What:** Another large CC0 PBR material library. Complements Poly Haven.
- **Integration:** Same as 4.4 — fill gaps in material variety.
- **Fits:** AshLane (worldgen).

### 4.6 Material Maker — MIT
- https://github.com/RodZill4/material-maker
- **What:** Procedural PBR material authoring tool (Godot-based, exports to standard PBR). Create custom materials without painting.
- **Integration:** Author AshLane-specific materials (Hollows concrete, Malakor neon trim) → export → `public/textures/`.
- **Fits:** AshLane (art direction).

### 4.7 MDM (Human Motion Diffusion Model) — ⚠️ verify license
- https://github.com/GuyTevet/motion-diffusion-model
- **What:** Text-to-motion: describe an action ("a person throws a punch") → generates 3D human motion. ICLR 2023, mature, strong HumanML3D benchmarks.
- **Integration:** Generate fight choreography from text descriptions → retarget to our 52-bone skeleton via universal-retarget → new moveset animations without mocap.
- **Fits:** AshLane (moveset expansion), Bannon.
- **Note:** Verify license before merging code. The HumanML3D dataset itself is MIT.

### 4.8 HumanML3D — MIT
- https://github.com/EricGuo5513/HumanML3D
- **What:** The standard text↔motion dataset + 263-dim representation. 14,616 motions with text descriptions.
- **Integration:** Training/fine-tuning data for any motion generation. The representation format is the lingua franca — our retargeting should speak it.
- **Fits:** AshLane (animation pipeline research).

### 4.9 NVIDIA kimodo / ardy — Apache-2.0
- https://github.com/nv-tlabs/kimodo
- **What:** SE(2)-invariant motion representation with foot-contact heuristics. The modern successor to HumanML3D-style encodings.
- **Integration:** Study the representation for our animation compression. If we build text-to-motion, this is the encoding to use.
- **Fits:** AshLane (animation research).

---

## 5. VOICE & AUDIO GENERATION

> All permissive. These give AshLane voiced dialogue and generated music without licensing fees.

### 5.1 Piper — MIT
- https://github.com/rhasspy/piper
- **What:** Real-time neural TTS. Runs on CPU (even Raspberry Pi). 30+ languages. ~50-150ms latency.
- **Integration:** Pre-generate all NPC dialogue lines as audio files → `public/audio/dialogue/`. Wire into dialogue system. Zero runtime cost.
- **Fits:** AshLane (NPC voices — immediate win).

### 5.2 Kokoro-82M — Apache-2.0
- https://github.com/hexgrad/kokoro
- **What:** 82M param TTS that punches far above its weight. Near-XTTS quality at 1/6th the size. 54 voice presets with blending.
- **Integration:** Higher-quality voice for main characters (Buffalo Bill, Onyx, etc.). Generate → `public/audio/dialogue/main/`.
- **Fits:** AshLane (hero character voices).

### 5.3 Chatterbox — MIT (Resemble AI)
- https://github.com/resemble-ai/chatterbox
- **What:** TTS with emotion/exaggeration control + zero-shot voice cloning. Built-in watermarking.
- **Integration:** Emotional dialogue variants (angry, scared, mocking). Clone a voice from a short sample for consistent character voices.
- **Fits:** AshLane (emotional range in story scenes).

### 5.4 Bark — MIT (Suno)
- https://github.com/suno-ai/bark
- **What:** Expressive TTS that handles non-verbal sounds — laughter, sighs, hesitations, sound effects mid-sentence.
- **Integration:** Ambient NPC barks, crowd reactions, effort grunts in combat.
- **Fits:** AshLane (crowd life, combat SFX).

### 5.5 sherpa-onnx — Apache-2.0
- https://github.com/k2-fsa/sherpa-onnx
- **What:** Unified ONNX runtime that loads Piper, Kokoro, and other models through one API. Can switch voices at runtime.
- **Integration:** If we ever need runtime TTS (dynamic dialogue), this is the engine. For now, pre-generate.
- **Fits:** AshLane (future runtime TTS).

### 5.6 GPT-SoVITS — MIT
- https://github.com/RVC-Boss/GPT-SoVITS
- **What:** Voice cloning from 1-2 minutes of audio. CPU/Apple Silicon support.
- **Integration:** Clone distinctive voices for major characters from short reference clips. Consistent voice identity across all their lines.
- **Fits:** AshLane (character voice consistency).

### 5.7 AudioCraft (MusicGen + AudioGen) — MIT (Meta)
- https://github.com/facebookresearch/audiocraft
- **What:** Text-to-music (MusicGen) + text-to-sound-effects (AudioGen). `pip install audiocraft`.
- **Integration:** Generate district ambient tracks ("dark urban alley, rain, distant bass") → `public/audio/music/`. Generate SFX ("punch impact", "glass break").
- **Fits:** AshLane (soundtrack + SFX — immediate).

### 5.8 ACE-Step — Apache-2.0
- https://github.com/ace-step/ACE-Step
- **What:** 3.5B param music foundation model. Up to 4 min of music in 20s. 19 languages, all mainstream styles.
- **Integration:** Higher-quality menu/loading music, faction themes.
- **Fits:** AshLane (music).

### 5.9 Stable Audio Tools — MIT (Stability AI)
- https://github.com/Stability-AI/stable-audio-tools
- **What:** Open-weight music/sound generation up to 47s stereo.
- **Integration:** Alternative to AudioCraft for music beds.
- **Fits:** AshLane (music).

---

## 6. ANIMATION SYSTEMS

### 6.1 Ossos — MIT
- https://github.com/fuleinist/immersive-3d-ar-cricket/issues/11 (spec — find the actual repo)
- **What:** Pure TypeScript skeletal animation: 12 IK solvers (FABRIK, CCD, Limb, SwingTwist, etc.), GLTF2 parser, BVH parser, full retargeting with bone mapping, dual-quaternion skinning, bone springs for secondary motion.
- **Integration:** Could replace/augment our universal-retarget.ts. The BVH parser + retargeting directly serves our CMU mocap ingestion.
- **Fits:** AshLane (animation pipeline).

### 6.2 ik-test (foot-locking IK) — ⚠️ verify license
- https://github.com/mulualem-tekle/ik-test
- **What:** Copy-pasteable `ik.ts` — pure math, no React. Foot contact detection → ground locking → two-bone IK → no foot sliding. The exact fix for our "wobbly" walk cycles.
- **Integration:** Copy `src/ik.ts` into `src/game3d/foot-lock-ik.ts`. Run as a post-process after animation mixer.
- **Fits:** AshLane (locomotion quality — high priority).

### 6.3 threejs-procedural-spider — ⚠️ verify license
- https://github.com/tyler-mitchell/threejs-procedural-spider
- **What:** Analytic IK legs, terrain-adaptive gait, ~1,200 lines, three.js only. Demonstrates procedural locomotion without any animation clips.
- **Integration:** Study the gait state machine for our quadruped/creature NPCs. Techniques transfer to biped procedural idle/walk.
- **Fits:** AshLane (creature NPCs, procedural animation research).

### 6.4 CMU Motion Capture Database — Unrestricted (public-domain-like)
- https://github.com/konyshevgmbh/cmu-mocap (BVH mirror)
- **What:** 2,500+ professionally captured BVH motions across 144 subjects. **License: "free for use in research and commercial projects worldwide"** — no restrictions from CMU or the BVH converter.
- **Key clips for us:** 143_23/143_24 (punching, kicking), 144_20/144_13 (punch sequences), 144_05/144_09 (front kicks), 144_07/144_26 (blocks), 135_xx (karate), 86_06 (kicking/punching/knee).
- **Integration:** Download target clips → parse BVH → retarget to 52-bone skeleton via universal-retarget → new combat animations. This is hundreds of free fight animations.
- **Fits:** AshLane (moveset expansion — HIGHEST VALUE), Bannon.

---

## 7. WORLD BUILDING

### 7.1 city-pcg — MIT
- https://github.com/jason9075/city-pcg
- **What:** Browser-based procedural city generator. **Three.js renderer, seeded PRNG, pure-function generator** (`generateCity(params) → CityModel`) with no Three.js dependency in the core. Instanced buildings, ribbon roads.
- **Integration:** Port `generator.js` logic into our worldgen.ts. The clean separation (pure data → thin renderer) matches our architecture.
- **Fits:** AshLane (worldgen upgrade — immediate).

### 7.2 NexusCity — MIT
- https://github.com/vineetsharma96/nexuscity
- **What:** Full procedural cyberpunk open world in the browser — **zero external models/textures/audio**. Everything procedural: buildings, NPCs, traffic, enterable interiors, dynamic weather, procedural audio. React + Three.js + TypeScript.
- **Integration:** Study their interior generation + NPC/traffic systems. The "zero external assets" philosophy matches our PWA constraints. Cherry-pick the interior room generator and traffic AI.
- **Fits:** AshLane (interiors, traffic, NPCs).

### 7.3 ProceduralCityGeneration (Grzybojad) — MIT
- https://github.com/Grzybojad/ProceduralCityGeneration
- **What:** Terrain (Perlin) + roads (Voronoi) + buildings (plot extrusion with shrinking-layer stacking).
- **Integration:** The shrinking-layer technique gives buildings distinctive silhouettes cheaply. Port the algorithm to our worldgen-buildings.ts.
- **Fits:** AshLane (building variety).

### 7.4 configurator-unreal-building — Apache-2.0
- https://github.com/VladimirKobranov/configurator-unreal-building
- **What:** Modular building assembly with seed-based randomization.
- **Integration:** Adapt the modular-piece approach for our storefront/industrial building variants.
- **Fits:** AshLane (building modularity).

---

## 8. GAME SYSTEMS

### 8.1 stickman-fighter — MIT
- https://github.com/sinusphi/stickman-fighter
- **What:** Complete fighting game in TypeScript: **deterministic 60Hz combat**, 33 attacks, frame data, hitbox display, training mode with frame stepping, replay recording, CPU opponents.
- **Integration:** Study the deterministic sim architecture (`src/simulation/`) for our combat netcode. The training-mode hitbox display is exactly what our moveset debugger needs.
- **Fits:** AshLane (combat architecture, debug tools).

### 8.2 bash-fighter — ⚠️ verify license
- https://github.com/bashentertainment/bash-fighter
- **What:** **Moves as data** — declarative state machine, frame windows (startup/active/endlag) as typed data, fixed-point hitboxes, knockback model, schema validator for character data.
- **Integration:** The "moves as data" philosophy matches our movesets.ts. Adopt their validation approach — a schema validator that catches bad frame data before it ships.
- **Fits:** AshLane (moveset validation).

### 8.3 dot-npc-ai — MIT
- https://github.com/modcommunity/dot-npc-ai
- **What:** NPC behavior trees with running-state memory, blackboard that forgets, steering behaviors for crowds.
- **Integration:** Replace/augment our pedestrian AI with proper behavior trees. The "blackboard that forgets" is the right model for ambient NPC memory.
- **Fits:** AshLane (NPC AI upgrade).

### 8.4 sprout-brawl — ⚠️ verify license
- https://github.com/tobinschleifer1/sprout-brawl
- **What:** Fighter state machine + combat engine + **bot AI where difficulty is a perception handicap** (not an aggression dial). Generative music per stage.
- **Integration:** The perception-handicap AI model is smarter than difficulty sliders — adopt for our enemy AI tiers.
- **Fits:** AshLane (enemy AI).

---

## Integration Priority (new entries)

1. **CMU mocap → combat animations** (§6.4) — hundreds of free fight moves, immediate moveset expansion
2. **Foot-locking IK** (§6.2) — fixes foot sliding, highest visual-quality ROI
3. **Piper/Kokoro → NPC voices** (§5.1/5.2) — voiced world, zero runtime cost
4. **AudioCraft → music/SFX** (§5.7) — generated soundtrack
5. **Poly Haven/ambientCG → worldgen textures** (§4.4/4.5) — immediate visual upgrade
6. **Material Anything → character texturing** (§4.3) — PBR for generated characters
7. **OpenX Clay → pipeline post-processing** (§4.1) — closes the generative loop
8. **city-pcg → worldgen algorithm** (§7.1) — cleaner city generation
9. **stickman-fighter → combat debug tools** (§8.1) — hitbox display, frame stepping
10. **dot-npc-ai → behavior trees** (§8.3) — smarter NPCs
