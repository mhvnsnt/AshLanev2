# Round 6 — Crowd AI

**Scope:** NPC / crowd / pedestrian / ambient-life AI for AshLane (Urban Reign/Def Jam-style 3D brawler, three.js mobile, 9-district city) and Bannon (wrestling) reactive arena crowds. Builds on R3's instanced `arena-crowd.ts` and the earlier boids / crowds-system-js research — those are not duplicated here.

**Rule (unchanged):** only CC0 / public-domain / permissive (MIT/Apache-2.0/BSD/Unlicense/OFL) goes in the game build. CC-BY allowed with written attribution. Everything below was license-checked at research time — re-verify before shipping.

## Yuka
- **URL:** https://github.com/mugen87/yuka
- **What:** Standalone JavaScript game-AI library: vehicle model + steering behaviors (seek, flee, arrive, wander, pursuit, evade, flocking, follow-path, obstacle avoidance, interpose), navmesh + graph pathfinding, perception (vision component + short-term memory), triggers, fuzzy logic, state-driven and goal-driven agent design. Engine-agnostic; examples use three.js.
- **License:** MIT (badge on README links to LICENSE file)
- **Verdict:** commercial-safe
- **Notes:** The pedestrian-AI core. Wander + obstacle-avoidance + follow-path gives sidewalk crowds; flocking gives group movement; perception/vision gives NPCs that notice the player or a fight breaking out. Pairs with a navmesh lib (recast/navcat) for paths and Yuka for movement. Zero dependencies, three.js-friendly.
