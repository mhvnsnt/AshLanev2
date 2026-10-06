# Round 6 — Fighter AI

Opponent brains for AshLane (Urban Reign/Def Jam-style 3D brawler, three.js mobile)
and Bannon (wrestling game). Research wave only — no game code.
Rule: prototype may use whatever works; commercial build needs commercial-safe
licenses. License taken from the project's actual LICENSE file / GitHub API,
checked 2026-10-06. Re-verify before shipping.

---

## Yuka

- **URL:** https://github.com/Mugen87/yuka
- **What:** JavaScript game-AI library by Michael Herzog: state machines
  (`StateMachine`), steering behaviors (seek, arrive, follow-path, separation,
  obstacle avoidance), navigation (graphs, navmesh, A*), perception (vision +
  short-term memory), fuzzy-logic inference, JSON serialization of AI state.
  Zero dependencies, ~65KB minified, ESM + TypeScript types.
- **License:** MIT (LICENSE file: "The MIT License", Copyright © 2023 Yuka authors).
- **Verdict:** commercial-safe.
- **Notes:** Primary candidate for the opponent-brain foundation. AshLane use:
  `StateMachine` for fighter states (idle/approach/strike/block/stagger/knockdown),
  perception + fuzzy logic for "read the player" decisions (aggression vs
  spacing), navmesh + steering for multi-fighter positioning and tag-partner
  movement. Engine-independent (no three.js dependency). Last release 0.7.8
  (2022) — stable but slow maintenance.

---

## behavior3js

- **URL:** https://github.com/linchendev/behavior3js (fork of behavior3/behavior3js)
- **What:** JavaScript behavior-tree library: BehaviorTree, Blackboard (agent
  memory), composites (Sequence, Priority, MemSequence, MemPriority), decorators
  (Inverter, Limiter, MaxTime, Repeater, RepeaterUntilSuccess/Failure), actions
  and conditions as extensible node classes. Ships with a visual tree editor.
  Lightweight, `npm install behavior3js`.
- **License:** MIT (LICENSE file: "The MIT License (MIT)", Copyright (c)
  2015 Renato de Pontes Pereira).
- **Verdict:** commercial-safe.
- **Notes:** Best fit for opponent decision trees in a brawler: e.g. a root
  selector `Priority[ Sequence[PlayerInRange?, Attack], Sequence[LowHealth?,
  Retreat], Approach ]` with blackboard tracking player habits (blocks high,
  throws a lot). Visual editor lets designers (not just coders) author boss and
  faction AI. Pair with Yuka: behavior3js decides WHAT, Yuka executes movement.

---

## goap-minimal

- **URL:** https://github.com/rpsirois/goap-minimal
- **What:** Minimal Goal-Oriented Action Planner in JS (after Orkin's
  F.E.A.R. design). Declare world state, actions with preconditions/effects/
  costs, and prioritized goals; planner does forward A* search returning the
  cheapest action sequence. Includes a small three-state runtime
  (Goto/Animate/UseSmartObject) that executes plans and replans when the
  world changes. `npm install goap-minimal`.
- **License:** MIT (GitHub API: MIT).
- **Verdict:** commercial-safe.
- **Notes:** GOAP gives "smart" emergent opponents without scripted trees:
  a fighter can chain MoveInRange -> ThrowHeavy -> FollowUp naturally, and
  replan when the player interrupts. Ideal for wrestling AI (Bannon): goals
  like "PinOpponent" decompose into IrishWhip -> Grapple -> Slam -> Pin.
  Tiny codebase = easy to audit and fork for frame-budget planning
  (plan once per N frames, cache).

---

## ddap (Desire-Driven Adaptive Planning)

- **URL:** https://github.com/TandemWolf/ddap
- **What:** TypeScript GOAP library with optimized A* search, plan caching,
  early termination, priority queues, desire hierarchies (multi-tier goal
  priorities), skill-progression system, batch async agent management, and
  debug tooling for plan inspection. Claims <1ms tick for simple agents.
  `npm install ddap`.
- **License:** MIT (GitHub API: MIT).
- **Verdict:** commercial-safe.
- **Notes:** The heavier, production-flavored alternative to goap-minimal.
  Desire hierarchies map directly to a fighting game: survival > damage >
  style/heat. AshLane use: boss AI that re-plans mid-fight (goal shifts from
  "DealDamage" to "Survive" below 30% HP), tag partners with assist desires.
  Plan caching matters on mobile — budget planning to every Nth frame.

---

## javascript-state-machine

- **URL:** https://github.com/jakesgordon/javascript-state-machine
- **What:** Tiny, battle-tested finite-state-machine library for JS.
  Declarative transitions (`{ name: 'punch', from: 'idle', to: 'attacking' }`),
  lifecycle hooks (onBefore/onEnter/onAfter), async transitions, state
  history, visualization via a state-diagram plugin. Zero dependencies.
- **License:** MIT (LICENSE file: standard MIT text, Copyright (c) 2012–2018
  Jake Gordon and contributors).
- **Verdict:** commercial-safe.
- **Notes:** The pragmatic FSM for fighter state management — every
  opponent is idle/approach/attack/block/hitstun/knockdown/getup/KO with
  guarded transitions. Lifecycle hooks are the clean place to enforce
  fighting-game rules (cancel windows, hitstop, armor). Async transitions
  fit animation-driven state changes. Use it for the low-level combat
  statechart; layer behavior3js/Yuka on top for decisions/movement.

---

## XState

- **URL:** https://github.com/statelyai/xstate
- **What:** Actor-based statecharts for JS/TS: hierarchical + parallel
  states, guards, actions, delayed transitions, and a visual inspector/
  editor (Stately Studio). The standard for complex UI/game state logic in
  the JS ecosystem.
- **License:** MIT (GitHub API: MIT).
- **Verdict:** commercial-safe.
- **Notes:** javascript-state-machine covers flat fighter states; XState is
  the upgrade path when AI gets hierarchical (e.g. a "grappling" superstate
  containing clinch/throw/pin substates, running in parallel with a
  "stamina" region). Parallel regions model a wrestler's simultaneous
  concerns (position vs. limb damage vs. crowd heat in Bannon). Heavier than
  js-state-machine — adopt only if hierarchical AI proves necessary.

---

## Ego (decision trees + state machines)

- **URL:** https://github.com/oguzeroglu/Ego
- **What:** Lightweight decision-making library for game AI: decision trees
  (knowledge -> decisions -> tree evaluation) plus hierarchical state
  machines. Built for the ROYGBIV engine but engine-independent; client-side
  script tag or `npm i @oguz.eroglu/ego-js`.
- **License:** MIT (GitHub API: MIT).
- **Verdict:** commercial-safe.
- **Notes:** Decision trees are the classic fighting-game AI structure
  (Street Fighter II-style: distance bands -> probability tables ->
  actions). Ego's "knowledge" object maps cleanly to a fighter's sensed
  world (distance, opponent state, own health). Good reference for
  hand-tuned, designer-driven AI where a behavior tree feels like overkill.
  172 stars — smaller community than Yuka; audit the source before wiring.

---

## brain.js

- **URL:** https://github.com/BrainJS/brain.js
- **What:** GPU-accelerated neural networks in JavaScript (browser + Node):
  feedforward nets, recurrent/LSTM nets, with training in JS. ~15k stars,
  the de-facto JS neural-net library.
- **License:** MIT (GitHub API: MIT).
- **Verdict:** commercial-safe.
- **Notes:** Learning-based opponent AI path: train a small network on
  (game-state -> player-action) pairs to predict and counter the player's
  habits — a personalized "reads your tendencies" rival. Keep nets TINY
  (a few dozen neurons) for mobile frame budgets; train offline, ship
  frozen weights, run inference only. Pairs with Yuka's perception as the
  feature source. Never ship live training on-device in v1 — inference only.

---

## neataptic

- **URL:** https://github.com/wagenaartje/neataptic
- **What:** Neuroevolution (NEAT) + backpropagation for browser and Node:
  evolves neural-network topologies and weights by genetic algorithm,
  no training data needed — fitness function only.
- **License:** MIT (LICENSE file: "The MIT License (MIT)", Copyright 2017
  Thomas Wagenaar).
- **Verdict:** commercial-safe.
- **Notes:** Offline AI-tuning path: evolve opponent behavior networks
  against scripted sparring partners (fitness = damage dealt, damage
  avoided, match wins), then ship the winning genome frozen. NEAT discovers
  non-obvious counters a designer wouldn't script — useful for boss-tier
  opponents and the "Warpath"-style wildcards. Evolve on desktop, run the
  tiny evolved net on mobile. Research-only until the pipeline proves out;
  classic trees/FSM ship first.

---

## OpenBOR (study: beat-em-up AI scripting)

- **URL:** https://github.com/DCurrent/openbor
- **What:** Open-source 2D side-scrolling beat-em-up engine (the modern
  Beats of Rage lineage). Enemies, bosses, and allies are driven by
  scriptable AI: aggression ranges, approach/attack/retreat behaviors,
  group coordination hooks, difficulty-scaled stats, all exposed to mod
  scripts.
- **License:** BSD-3-Clause (GitHub API).
- **Verdict:** commercial-safe (BSD; re-verify before shipping).
- **Notes:** STUDY target #1 for AshLane. OpenBOR solved the exact problem
  20 years ago: multiple AI brawlers sharing a 2.5D plane without
  degenerating into a mosh pit — spacing rules, attack cooldowns so enemies
  don't all swing at once, off-screen approach logic, and per-enemy
  aggression tuning. Read its enemy AI scripts as the spec for our
  multi-fighter coordination layer. Its "one attacker at a time" fairness
  conventions are directly applicable.

---

## IKEMEN GO (study: fighting-game AI architecture)

- **URL:** https://github.com/ikemen-engine/Ikemen-GO
- **What:** Open-source 2D fighting-game engine compatible with MUGEN
  content (~1.6k stars). AI opponents are character-defined state machines
  (MUGEN CNS/AI scripting): per-state triggers, distance-based decision
  tables, reaction-timing parameters, and difficulty-scaled AI levels.
  The community has decades of documented AI-writing craft.
- **License:** NOASSERTION — no LICENSE file in the repo (checked
  2026-10-06).
- **Verdict:** prototype-only / study-only. Read and learn; do not ship its
  code.
- **Notes:** STUDY target #2 for Bannon. The MUGEN AI model is the closest
  public reference for wrestling/fighting opponent brains: AI "levels"
  (reaction speed, decision frequency, move-choice randomness) are exactly
  the difficulty-scaling knobs AshLane/Bannon need. Study how character
  authors write AI triggers (e.g. `trigger1 = p2stateno = 200 && random <
  300`) — this is the concrete pattern for our own difficulty-scaled
  fighter AI, reimplemented clean.

---

## Schwarzerblitz Engine (study: 3D fighter AI)

- **URL:** https://github.com/AndreaJens/SchwarzerblitzEngine
- **What:** Source code of Schwarzerblitz, an open 3D fighting game
  (Irrlicht-based). Includes its AI opponent implementation for a true 3D
  fighter — spacing, approach, attack selection, and blocking in three
  dimensions, a rarer reference than 2D fighter AI.
- **License:** NOASSERTION — no machine-readable license (checked 2026-10-06).
- **Verdict:** prototype-only / study-only. Read and learn; do not ship its
  code.
- **Notes:** One of the few open 3D fighting games with readable AI. Useful
  for Bannon's 3D ring movement (circling, cornering, rope awareness) and
  for AshLane's 3D brawler spacing. Smaller codebase than a commercial
  engine — tractable to read end-to-end in an afternoon.

---

## Game AI Pro (free book — study reference)

- **URL:** https://www.gameaipro.com
- **What:** Free online book series (3 volumes) of short chapters written
  by professional game AI programmers: behavior trees, utility AI, planning,
  steering, pathfinding, animation-driven AI, and — critically — chapters
  on fighting-game and sports-game AI, difficulty tuning, and "AI that
  feels fair."
- **License:** Free to read online; chapters are author-copyrighted, not
  open-source code.
- **Verdict:** study-only (concepts are free to reimplement; don't copy
  text/code verbatim into the repo).
- **Notes:** The canonical professional reference. Prioritize the chapters
  on utility scoring (for move selection), hierarchical AI (boss phases),
  and perceived fairness. Pair with Mat Buckland's "Programming Game AI by
  Example" (recommended by Yuka's docs) for steering/FSM fundamentals.
  Keep a reading list in the repo as we implement — cite chapter, not
  copied code.

---

## Dynamic Difficulty Adjustment (DDA) — technique notes

- **URL:** N/A — design technique survey (see Game AI Pro chapters on
  difficulty; classic case study: Resident Evil 4's hidden "difficulty
  scale").
- **What:** The AI silently adapts to the player's skill: track rolling
  performance metrics (damage taken/dealt ratio, combo success, deaths per
  minute) and adjust hidden parameters — opponent aggression, reaction
  delay, damage output, combo escape rates. Never shown to the player.
- **License:** N/A (technique, not code).
- **Verdict:** commercial-safe (our own implementation).
- **Notes:** AshLane design rule: DDA adjusts the AI's *inputs* (reaction
  time, decision frequency, move-pool randomness), never fakes the *rules*
  (no hidden damage multipliers that contradict the HUD — honesty rule).
  Concrete knobs for our fighter AI: AI tick rate (decisions/sec),
  block/counter probability, whiff-punish window, combo length cap.
  Wire metrics from day one so difficulty is data-driven, not vibes.
  Bannon use: jobber-to-main-eventer progression where early opponents
  have long reaction delays and small move pools, later ones replan and
  punish.
