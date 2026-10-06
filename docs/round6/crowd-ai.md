# Round 6 — Crowd AI

**Scope:** NPC / crowd / pedestrian / ambient-life AI for AshLane (Urban Reign/Def Jam-style 3D brawler, three.js mobile, 9-district city) and Bannon (wrestling) reactive arena crowds. Builds on R3's instanced `arena-crowd.ts` and the earlier boids / crowds-system-js research — those are not duplicated here.

**Rule (unchanged):** only CC0 / public-domain / permissive (MIT/Apache-2.0/BSD/Unlicense/OFL) goes in the game build. CC-BY allowed with written attribution. Everything below was license-checked at research time — re-verify before shipping.

## Yuka
- **URL:** https://github.com/mugen87/yuka
- **What:** Standalone JavaScript game-AI library: vehicle model + steering behaviors (seek, flee, arrive, wander, pursuit, evade, flocking, follow-path, obstacle avoidance, interpose), navmesh + graph pathfinding, perception (vision component + short-term memory), triggers, fuzzy logic, state-driven and goal-driven agent design. Engine-agnostic; examples use three.js.
- **License:** MIT (badge on README links to LICENSE file)
- **Verdict:** commercial-safe
- **Notes:** The pedestrian-AI core. Wander + obstacle-avoidance + follow-path gives sidewalk crowds; flocking gives group movement; perception/vision gives NPCs that notice the player or a fight breaking out. Pairs with a navmesh lib (recast/navcat) for paths and Yuka for movement. Zero dependencies, three.js-friendly.

## recast-navigation-js
- **URL:** https://github.com/isaac-mason/recast-navigation-js
- **What:** WebAssembly port of Recast Navigation: runtime navmesh generation from level geometry, Detour pathfinding queries, **DetourCrowd** crowd simulation (local agent avoidance), temporary obstacles, off-mesh connections, tiled navmeshes. Ships `@recast-navigation/three` helpers and a web navmesh-generator for offline bakes.
- **License:** MIT (repo page license field, LICENSE file at root)
- **Verdict:** commercial-safe
- **Notes:** The heavy-duty crowd option: hundreds of agents with real collision avoidance in 3D districts. Cost is the WASM payload + init — prefer navcat (pure JS, below) on tight mobile budgets. Also useful: `donmccurdy/glTF-Transform-Recast-Config` bakes navmeshes inside the glTF asset pipeline.

## navcat
- **URL:** https://github.com/isaac-mason/navcat
- **What:** Pure-JavaScript navmesh generation + querying by the recast-navigation-js author — same algorithms, no WASM. Solo + tiled navmeshes, fully JSON-serializable data structures, tree-shakeable, `navcat/blocks` generation presets, optional crowd modules, `navcat/three` three.js entrypoint, live examples including crowd simulation, crowd stress test, and flow-field pathfinding.
- **License:** MIT (repo page license field, LICENSE file at root)
- **Verdict:** commercial-safe
- **Notes:** Best default for AshLane's streets: no WASM init cost on mobile, navmesh data serializes to JSON (replay/network friendly), and the flow-field example is exactly how to move hundreds of pedestrians cheaply — one field, many agents. Pair with Yuka steering for local avoidance.

## three-pathfinding
- **URL:** https://github.com/donmccurdy/three-pathfinding
- **What:** Lightweight navmesh pathfinding toolkit for three.js (PatrolJS-based): build zones from a BufferGeometry, `findPath` / `getClosestNode` / `getRandomNode` / `getGroup`, and `clampStep` to constrain movement to the navmesh. No navmesh generation — import baked geometry (Blender, Recast CLI, navcat/recast-navigation-js export).
- **License:** MIT (repo page license field, LICENSE file at root)
- **Verdict:** commercial-safe
- **Notes:** The simplest three.js-native option when the navmesh is baked offline. Good for scripted NPC routes, arena staff, and vendors with fixed patrol loops. One zone per district keeps queries cheap.
