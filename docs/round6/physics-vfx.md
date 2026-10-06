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

