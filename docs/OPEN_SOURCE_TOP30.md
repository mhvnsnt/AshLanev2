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
