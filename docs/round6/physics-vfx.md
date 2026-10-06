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

