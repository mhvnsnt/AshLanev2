# Round 6 — Physics, Destruction & VFX

Research-only wave. No game code. Owner license law: prototype may use whatever
works, but every license is recorded from the actual LICENSE file. GPL/AGPL
physics stays OUT of the shipped client — quarantine or reject.

Skipped as done/duplicates of rounds 1–5: Rapier (proof done), `impact-particles.ts`,
`postfx.ts`, three.quarks (license TBD), pixy.js shaders.

---
## cannon-es
- **URL:** https://github.com/pmndrs/cannon-es
- **What:** Lightweight 3D rigid-body physics for the browser — maintained community fork of cannon.js. Bodies, constraints, vehicles, heightfields, compound shapes; ships as pure JS + optional worker builds.
- **License:** MIT (LICENSE file, pmndrs).
- **Verdict:** COMMERCIAL-SAFE.
- **Notes:** Best-fit debris/KO-ragdoll physics for mobile three.js: far lighter than a Bullet WASM build, easy per-body sleeping for perf, and its official ragdoll demo shows exactly the KO-tumble we want for Bannon. Pairs with three-mesh-bvh for collision meshes.

## ammo.js
- **URL:** https://github.com/kripken/ammo.js
- **What:** Emscripten port of the Bullet physics engine to WebAssembly/JS. Full Bullet feature set: soft bodies (cloth!), rigid bodies, constraints, vehicles, heightfields.
- **License:** zlib-style (LICENSE file: "Copyright (c) 2011 ammo.js contributors", as-is/no-warranty text — the zlib license text verbatim).
- **Verdict:** COMMERCIAL-SAFE.
- **Notes:** The only browser path to real Bullet soft-body cloth without GPL baggage (Bullet itself is zlib). WASM payload is heavy for low-end mobile, so quarantine to desktop/high-tier or lazy-load; cannon-es covers the light tier. Soft-body cloth = jackets/coats flapping on AshLane fighters.

## three.js physics examples (cloth, fracture, decals)
- **URL:** https://github.com/mrdoob/three.js/tree/dev/examples (demos: `webgl_animation_cloth`, `webgl_physics_convex_break`, `webgl_decals`)
- **What:** First-party three.js example scenes that ARE the reference implementations: Verlet-integration cloth (`Cloth` in examples/jsm), ConvexObjectBreaker rigid-fracture helper, and DecalGeometry for scorch/blood/damage decals.
- **License:** MIT (three.js LICENSE).
- **Verdict:** COMMERCIAL-SAFE.
- **Notes:** Zero-dependency starting points already matched to our three.js version. Cloth demo is the cheapest cloth win on mobile (verlet, no physics engine). ConvexObjectBreaker is the classic crate/barrel shatter for AshLane destructibles; DecalGeometry handles scorch marks and blood decals on floors/walls.

## three-nebula
- **URL:** https://github.com/creativelifeform/three-nebula
- **What:** GPU-accelerated particle system for three.js (successor to the old three.js ParticleEngine). Emitters, zones, behaviours, sprite/texture particles; CPU + GPU paths.
- **License:** MIT (LICENSE file, Luke Moody / creativelifeform).
- **Verdict:** COMMERCIAL-SAFE.
- **Notes:** Candidate upgrade path from our hand-rolled `impact-particles.ts` for smoke columns, dust kicks, muzzle flash and weather — GPU path keeps it viable on mobile. API surface is large; wrap behind our own emitter interface if adopted.

## ShaderParticleEngine (SPE)
- **URL:** https://github.com/squarefeet/ShaderParticleEngine
- **What:** Shader-based particle engine for three.js. Millions of GPU-driven particles; typed emitter groups (smoke, fire, sparks, rain); pool-based so zero per-frame allocation.
- **License:** MIT (LICENSE file, squarefeet).
- **Verdict:** COMMERCIAL-SAFE.
- **Notes:** The fire/smoke specialist: purpose-built emitter presets for flames, smoke plumes and sparks with shader-side turbulence — exactly the trash-can fires, barrel explosions and tire-smoke AshLane needs. Lighter-weight to integrate than three-nebula; evaluate both head-to-head in a prototype shootout.

## three-bvh-csg
- **URL:** https://github.com/gkjohnson/three-bvh-csg
- **What:** Fast constructive solid geometry (boolean union/subtraction/intersection) on three.js meshes, accelerated by three-mesh-bvh. Cuts holes, slices objects, merges geometry at runtime.
- **License:** MIT (LICENSE file, Garrett Johnson).
- **Verdict:** COMMERCIAL-SAFE.
- **Notes:** Runtime boolean = destructible walls, bullet-hole punching in doors, slicing tables in half mid-fight. BVH acceleration makes it fast enough to do live (not just pre-baked). Pair with cannon-es: CSG-sliced halves become physics bodies.

## three-mesh-bvh
- **URL:** https://github.com/gkjohnson/three-mesh-bvh
- **What:** Bounding Volume Hierarchy acceleration for three.js meshes: 10–100x faster raycasts, spatial queries, and closest-point tests. Powers three-bvh-csg slicing.
- **License:** MIT (LICENSE file, Garrett Johnson).
- **Verdict:** COMMERCIAL-SAFE.
- **Notes:** Infrastructure win for destruction AND combat: cheap per-frame melee hit-raycasts against complex arena geometry, fast ground-height queries, and the slicing backend for breakable props. Well-maintained, drop-in `acceleratedRaycast` patch.

## WebGL-Fluid-Simulation
- **URL:** https://github.com/PavelDoGreat/WebGL-Fluid-Simulation
- **What:** Stable-fluids (Navier-Stokes) solver running fully on the GPU in WebGL — colorful dye advection with mouse/touch interaction, multi-splat emitters, sunrays/bloom hooks.
- **License:** MIT (LICENSE file, Pavel Dobryakov).
- **Verdict:** COMMERCIAL-SAFE.
- **Notes:** Research-only tier for gameplay, but two real uses: (1) menu/loading-screen fluid backgrounds that react to touch — premium feel for AshLane's street-art UI; (2) technique reference for blood-spray/ink decals and smoke advection. Heavy on low-end GPUs — keep behind a quality gate, never in the combat loop.

## lygia
- **URL:** https://github.com/patriciogonzalezvivo/lygia
- **What:** Massive multi-language shader function library (GLSL/HLSL/MSL/WGSL/Metal): noise, SDFs, lighting, color, animation helpers, procedural patterns — the community successor to The Book of Shaders snippets.
- **License:** PROSPERITY PUBLIC LICENSE 3.0.0 (LICENSE.md) — free for non-commercial use, 30-day commercial trial only. NOT MIT.
- **Verdict:** PROTOTYPE-ONLY — cannot ship in the client. Reference inspiration only.
- **Notes:** Flagged explicitly because it looks permissive at first glance. Useful as a reference for how to write specific SDF/noise functions (fire distortion, smoke curl, damage-mask patterns), but any shipped shader must be rewritten clean-room or sourced from glsl-noise/MIT snippets instead.

## glsl-noise
- **URL:** https://github.com/hughsk/glsl-noise
- **What:** Classic/simplex 2D–4D noise GLSL snippets (Ashima/webgl-noise lineage, packaged for npm): snoise/vnoise/fbm ready to `#pragma`-include in three.js ShaderMaterials.
- **License:** MIT (LICENSE file, Hugh Kennedy).
- **Verdict:** COMMERCIAL-SAFE.
- **Notes:** The commercial-safe answer to lygia for our shaders: drives fire flicker, smoke billow, scorch-edge masks, and damage dissolve transitions. Already the de-facto standard — battle-tested on mobile GPUs.

