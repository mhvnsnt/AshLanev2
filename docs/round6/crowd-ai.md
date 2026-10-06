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

## PathFinding.js
- **URL:** https://github.com/qiao/PathFinding.js
- **What:** Grid-based pathfinding library: A*, bi-directional A*, Best-First, BFS, Dijkstra, Jump Point Search, Trace, IDA*. Browser + node.
- **License:** MIT (license section in the user guide)
- **Verdict:** commercial-safe
- **Notes:** For district-level street routing on a coarse grid (blocks, alleys, plazas) where a full 3D navmesh is overkill. Jump Point Search is the fast pick for long pedestrian routes. Use for macro routes, then Yuka steering for local movement.

## easystarjs
- **URL:** https://github.com/prettymuchbryce/easystarjs
- **What:** Asynchronous A* pathfinding API for tile grids: acceptable tiles, per-tile movement costs, directional conditions, avoidance points, and calculation spread across frames so repaths never hitch.
- **License:** MIT ("You may use it for commercial use." — README license section)
- **Verdict:** commercial-safe
- **Notes:** The lightweight tile-grid pick. Per-tile costs model "crowded sidewalk vs empty alley" naturally; async calculation keeps dozens of NPC repaths off the critical path. Good fit for block-grid district layouts.

## javascript-state-machine
- **URL:** https://github.com/jakesgordon/javascript-state-machine
- **What:** Finite state machine library: declarative states and transitions, lifecycle callbacks (onEnter/onLeave/onTransition), async transition support. Tiny, zero dependencies.
- **License:** MIT (README points to LICENSE file)
- **Verdict:** commercial-safe
- **Notes:** The NPC brain structure: idle → walk → watch-fight → heckle → flee. Combine with Yuka steering for movement and ink for dialogue to get complete ambient NPCs. One FSM definition shared across hundreds of NPC instances.

## ink + inkjs
- **URL:** https://github.com/inkle/ink · JS runtime: https://github.com/y-lohse/inkjs
- **What:** inkle's narrative scripting language for branching dialogue with variables, conditions, and knots; inkjs is the zero-dependency JavaScript port (~50KB, runs in browser and node). Inky is the writer-friendly editor with live preview.
- **License:** MIT (inkle org page lists MIT for ink; inkjs MIT)
- **Verdict:** commercial-safe
- **Notes:** The ambient-life dialogue engine: street-vendor barks, hustler pitches, crowd chants, NPC one-liners that react to game state (heat level, district, time of day). Compile `.ink` to JSON at build time; drive line selection from each NPC's state machine. Powers Bannon arena chants too.

## tracery
- **URL:** https://github.com/galaxykate/tracery
- **What:** Story-grammar text expansion library (Kate Compton): write grammar objects, get generative sentences and story fragments. The classic procedural-text tool.
- **License:** Apache (LICENSE.MD in repo root; downstream ports state they inherit the Apache license from Tracery — re-verify the file before shipping)
- **Verdict:** commercial-safe
- **Notes:** Cheaper than ink for pure ambient barks: hustler/vendor lines ("Yo, #product# — #price#, #pitch#"), crowd heckles, procedural graffiti and signage text. Pair with Piper TTS (R4) to voice the generated barks at build time.

## meyda
- **URL:** https://github.com/meyda/meyda
- **What:** Real-time audio feature extraction on the Web Audio API: loudness, RMS energy, spectral centroid, MFCCs, chroma, spectral flux / onset detection. Pure JavaScript, no WASM, works on live nodes or plain arrays.
- **License:** MIT (repo page license field, LICENSE.md at root)
- **Verdict:** commercial-safe
- **Notes:** The sound-reactive crowd bridge: feed game audio (music energy, hit-SFX loudness, KO stingers) into Meyda and drive `arena-crowd.ts` excitement, NPC reactions, and lighting pulses. Loudness/RMS is the cheap always-on signal; spectral flux gives beat-ish onsets for hype moments.
