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
