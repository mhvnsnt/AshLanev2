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

---

# ROUND 3 — 2026-10-06: Urban Reign mechanics, mobile perf pipeline, monetization, netcode, crowd AI

> Research: 2026-10-06. Builds on Round 2 (2026-10-05) and §§4–8 (parallel round, same day).
> De-duplicated against §§4–8: entries already covered there are cross-referenced, not repeated.
> License rule unchanged: only MIT / Apache-2.0 / BSD / CC0 / ZLib / Unlicense go into the commercial build.
> ⚠️ = strategy/lessons only, no code merged.
> ✅ WIRED = actually installed, run, and measured this round (not just documented).

## TOP 3 most impactful this round

1. **meshoptimizer + glTF-Transform + Basis Universal** — ✅ WIRED. One-command GLB pipeline:
   `gltf-transform optimize` took a real repaired model 5.86 MB → 1.26 MB (−78%), skinning intact,
   validate clean. This is the download-size answer for the PWA and the 1.9M-face Tripo problem at
   the packaging stage. Script + verified numbers in `docs/asset-pipeline/`.
2. **Nakama (Apache-2.0)** — the monetization/live-ops backbone: accounts, inventory, virtual wallet
   (in-game currency), leaderboards, clans, authoritative multiplayer, server-side TS/Go/Lua logic for
   stores and battle passes. Self-hostable, no per-sale fees.
3. **TripoSR (MIT) + TRELLIS.2 (§4.2, MIT)** — the owner-mandated generative 3D pipeline,
   license-clean, in two tiers: TripoSR = fast (0.5s, 6GB VRAM) for props/backgrounds, same lineage
   as the owner's Tripo workflow; TRELLIS.2 = hero assets with PBR materials (~24GB VRAM, batch on
   a workstation).

---

## 3A. Urban Reign mechanics study (research, from Wikipedia / Fandom / GameSpot)

Urban Reign (Namco, PS2, 2005) — the game's explicit north star. What actually made it work:

- **4 simultaneous fighters** on screen (AI + human), 60-character roster, 100 missions.
- **Simplified controls, deep situations:** one strike button, one grapple button, one dash, one
  evade. No block — defense is a **timed dodge**; dodge + up/down at the right moment = **reversal**.
- **Grappling system:** low grapples, high grapples, **air grapples**, counters and re-counters,
  each with per-character animations (compared to Tobal 2's system).
- **Juggle launcher:** 3-hit string, third hit launches → choice of air grapple, special, reposition,
  or run for a weapon. No long combo memorization.
- **Weapons:** knives, pipes, bats, swords — pick up, use, throw. Environment as arsenal.
- **AI partners:** issue commands — come to aid, double-team move, **hand you their weapon**.
  Two fighters can grapple the same enemy simultaneously (tandem attacks).
- **Special arts:** strike+grapple, meter-gated, **uncounterable except by another special**, bufferable.

**AshLane mapping (what to build, in order):**
1. Timed dodge + reversal (replaces block) — biggest feel differentiator vs. Tekken-likes.
2. Low/high/air grapple taxonomy with per-character throw anims — foundation before finishers.
3. Weapon pickup/use/throw + throwable props — cheap, high-fun.
4. AI partner commands (aid / double-team / give weapon) — yuka (Round 2) + RVO2 (§3D.5).
5. Special-arts meter + uncounterable supers.

Open-source equivalents: Ikemen GO (§3B.1) for combat state machines, yuka + RVO2/recast for
partner/crowd AI, OpenBOR (Round 2) as the brawler design bible. No complete open-source 3D
Urban-Reign-like was found — this is a gap AshLane itself fills.

---

## 3B. Combat systems

### 3B.1 Ikemen GO — MIT ✅
- https://github.com/ikemen-engine/Ikemen-GO
- Open-source 2D fighting game engine (MUGEN-compatible), builds on Windows/Linux/macOS/Android.
  Engine is MIT (bundled screenpack assets are CC-BY — don't ship those).
- Why: the reference implementation for **combat state machines** — states, triggers, hitdefs,
  helpers, frame-precise logic. Our 3D combat sim should steal its state/trigger architecture
  even though we're 3D. Study how it does reversals, juggles, and helper-based double-team logic.
- Fits: AshLane combat sim, Brutal-Fist.

## 3C. Animation

### 3C.1 orangeduck/motion-matching — MIT code, ⚠️ dataset is NOT commercial
- https://github.com/orangeduck/motion-matching
- Learned Motion Matching: the modern answer to locomotion — search a motion database every frame
  instead of blending a handful of clips. Code is MIT; **the bundled Ubisoft La Forge dataset is
  CC-BY-NC-ND (research only)** — retrain on CMU data (§6.4) or own mocap before commercial use.
- Why: this is how AAA locomotion works now (Ubisoft's For Honor/AC). Our walk/run/idle could
  graduate from clip-blending to database search. Pairs with MediaPipe-captured custom data (§3C.2).
- Fits: AshLane locomotion, Bannon.

### 3C.2 MediaPipe — Apache-2.0 ✅ ✅ WIRED (2026-10-06)
- https://github.com/google/mediapipe
- Google's pose estimation: 33 body landmarks, runs **in the browser via WASM** (~30fps CPU),
  Apache-2.0 models + code. (RTMPose, also Apache-2.0, is the faster alternative if we need it.)
- Why: **webcam mocap pipeline** — the owner performs a throw/taunt once, we capture joint angles,
  retarget to the 58-bone skeleton. Zero-cost custom animation capture, no suits. This is the
  "generative animation" feedstock for motion matching.
- Fits: AshLane animation pipeline, Asset Doctor.
- **Wired:** `src/game3d/mediapipe-mocap.ts` — landmarks → 20 bone directions →
  swing-only world-space retargeting onto any rig. Demo page at `/mocap` (webcam +
  live character + record-to-JSON). Headless proof in `tools/mediapipe-mocap/proof/`.
  Verified: T-pose self-delta 0.0000°, rest round-trip 0.00°, bone quaternions exact.
  Docs: `tools/mediapipe-mocap/README.md`.

## 3D. Performance (mobile)

### 3D.1 meshoptimizer — MIT ✅ WIRED
- https://github.com/zeux/meshoptimizer/blob/HEAD/gltf/README.md
- Mesh optimization: simplification, vertex-cache optimization, quantization, overdraw reduction.
  `gltfpack` CLI + `clusterlod.h` for continuous LOD. WASM decoder (`meshopt_decoder.js`) for web.
- Why: the industry-standard mesh diet. Wired this round — see `docs/asset-pipeline/`.
- Fits: AshLane build pipeline, all 3D repos.

### 3D.2 glTF-Transform — MIT ✅ WIRED
- https://github.com/donmccurdy/glTF-Transform
- glTF 2.0 SDK + CLI for Node/browser: `prune`, `dedup`, `join`, `instance`, `simplify`,
  `draco`/`meshopt` geometry compression, WebP/KTX2 texture conversion, texture resize.
  One command — `gltf-transform optimize input.glb output.glb --texture-compress webp` — did
  −78% on a real model this round.
- Why: the asset-pipeline workhorse. Every GLB entering `public/models/` should pass through it.
- Fits: AshLane build pipeline.

### 3D.3 Basis Universal + Draco — Apache-2.0 ✅
- https://github.com/BinomialLLC/basis_universal · https://github.com/google/draco
- Basis Universal: GPU texture supercompression (KTX2/ETC1S/UASTC) — textures stay compressed
  **in VRAM**, the actual mobile bottleneck. Draco: geometry compression alternative to meshopt.
  Both reachable through glTF-Transform (`uastc`/`etc1s`/`draco` commands).
- Why: download size is only half the mobile story — VRAM is the other half. Basis is how the
  PWA holds street textures on a mid-range Android.
- Fits: AshLane mobile perf. (KTX2Loader wiring is a tracked follow-up.)

### 3D.4 recastnavigation — ZLib ✅
- https://github.com/recastnavigation/recastnavigation
- Industry-standard navmesh: Recast (bake) + Detour (runtime queries) + **DetourCrowd** (crowd
  movement with avoidance) + DetourTileCache (dynamic obstacles). ZLib = fully permissive.
- Why: bakes walkable streets from our procedural city geometry; DetourCrowd moves dozens of
  pedestrians/fighters with collision avoidance. The crowd-AI pathfinding answer.
- Fits: AshLane crowds, Bannon arenas.

### 3D.5 RVO2 — Apache-2.0 ✅
- https://github.com/snape/RVO2 (UNC original)
- Optimal Reciprocal Collision Avoidance: thousands of agents, collision-free, milliseconds per
  step, no inter-agent communication needed. Apache-2.0.
- Why: the lightweight alternative/complement to DetourCrowd for brawl scenes — 8+ fighters plus
  bystanders all steering without overlap. Simple C++98 API, portable.
- Fits: AshLane brawl AI.

## 3E. Generative pipelines (owner priority)

### 3E.1 TRELLIS.2 — see §4.2 (already covered)
- Round 3 note: pairs with TripoSR (§3E.2) as the two-tier pipeline — TRELLIS.2 for hero assets
  with PBR materials (~24GB VRAM, batch on a workstation), TripoSR for volume. Both MIT.

### 3E.2 TripoSR — MIT ✅
- https://github.com/VAST-AI-Research/TripoSR
- Stability AI × Tripo AI: feed-forward single-image→3D in ~0.5s on A100, runs on **6GB VRAM**,
  MIT including weights. (TripoSG, same org, is the higher-fidelity middle ground.)
- Why: same lineage as the owner's Tripo workflow, self-hostable, consumer-GPU friendly.
  Fast enough for background props, greebles, street clutter — the volume play.
- Fits: AshLane worldgen props, Asset Doctor.

### 3E.3 xatlas — MIT ✅
- https://github.com/jpcy/xatlas
- Automatic UV atlas generation. MIT.
- Why: generative models (TripoSR/TRELLIS) output meshes that need clean UVs before our
  texture pipeline touches them. xatlas closes that gap in the automated chain.
- Fits: asset pipeline.

### 3E.4 AudioCraft — see §5.7 (already covered)
- Round 3 note: the play is **offline generation** — per-district music beds ("dark boom-bap,
  minor key, 90 BPM") and per-move impact sweeteners generated once with MusicGen/AudioGen,
  shipped as static assets. Zero runtime cost, infinite variety.

### 3E.5 Bark — see §5.4 (already covered)
- Round 3 note: the killer feature for a brawler is Bark's **non-speech** output — laughter,
  shouts, exertion grunts, crowd noise. Generate fighter barks and ambient street voices
  instead of recording them.

## 3F. Monetization tech

### 3F.1 Nakama — Apache-2.0 ✅
- https://github.com/heroiclabs/nakama
- Heroic Labs' game backend: accounts/auth, friends/groups/chat, storage, **in-game currencies
  (virtual wallet)**, leaderboards/tournaments, realtime authoritative multiplayer + matchmaking,
  server runtime in Go/TypeScript/Lua. Self-hosted or managed.
- Why: THE monetization answer — player accounts, cosmetic inventory, virtual currency, battle
  pass state, leaderboards, and anti-cheat-authoritative multiplayer in one Apache-2.0 box.
  TypeScript server logic matches our stack.
- Fits: AshLane live-ops/monetization, Bannon online.

### 3F.2 Colyseus — MIT ✅
- https://github.com/colyseus/colyseus
- Node.js multiplayer framework: rooms, binary delta-compressed state sync, matchmaking,
  reconnection. v0.18 (2026) added **built-in client-side prediction + lag compensation**.
  MIT, self-hostable.
- Why: if Nakama is the full backend, Colyseus is the lightweight netcode for actual
  **online brawls** — 4-player Urban-Reign-style co-op over WebSocket. Prediction/lag-comp
  is exactly what a melee game needs.
- Fits: AshLane multiplayer.

### 3F.3 Medusa — MIT ✅
- https://github.com/medusajs/medusa
- Headless commerce platform (Node/TypeScript): products, carts, orders, promotions,
  multi-region/currency. Self-hosted, no per-sale fees.
- Why: the **real-money merch store** (AshLane apparel, physical goods) and digital-goods
  storefront without Shopify lock-in. Pairs with Nakama's virtual wallet: Medusa = real money,
  Nakama = in-game economy.
- Fits: money-machine-hq, AshLane merch.

## 3G. Audio (runtime)

### 3G.1 jsfxr — Unlicense (public domain) ✅
- https://github.com/chr15m/jsfxr
- JS port of sfxr: parameterized procedural SFX (pickup, explosion, hit/hurt, jump, UI).
  Tiny, Web Audio playback + WAV export.
- Why: zero-asset combat SFX synthesis — generate every punch/whiff/UI blip from parameters
  at build time. No sample licensing, bytes not megabytes.
- Fits: AshLane SFX.

### 3G.2 ZzFX — MIT ✅
- https://github.com/KilledByAPixel/ZzFX
- Absurdly small JS SFX synth — MIT, parameter-array API.
- Why: the fallback when even jsfxr is too big — procedural hit sounds in ~1KB of code.
- Fits: AshLane SFX, PWA size budget.

### 3G.3 Resonance Audio — Apache-2.0 ✅
- https://github.com/vecnode/resonance-audio-web-sdk (community fork; Google's original
  web SDK is archived — code is Apache-2.0 per Google's open-source announcement)
- Real-time spatial audio for the Web Audio API: HRTF binaural rendering, room reflections,
  reverb. Pure JS.
- Why: positional brawl audio — hear the punch land *behind* you, crowd swells by direction.
  The "expensive sound" upgrade for free.
- Fits: AshLane 3D audio.

---

## Updated pull order

**Wired this round:** glTF-Transform + meshoptimizer pipeline (`docs/asset-pipeline/` — run it on
every GLB before it enters `public/models/`).
**Next wire-ups (in order):** jsfxr/ZzFX for combat SFX → RVO2 or DetourCrowd for brawl AI →
MediaPipe webcam-mocap prototype → Nakama account + inventory spike → TripoSR prop pipeline.
**Research bets:** TRELLIS.2 workstation batch, AudioCraft music beds (§5.7), Colyseus online-brawl
spike, Ikemen GO state-machine study for the combat rewrite, motion-matching retrained on own
mocap (CMU data §6.4).

*License gate stands: MIT/Apache/BSD/CC0/ZLib/Unlicense only into the build. ⚠️ items are strategy-only.*
