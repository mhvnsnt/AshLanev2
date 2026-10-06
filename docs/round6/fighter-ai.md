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
