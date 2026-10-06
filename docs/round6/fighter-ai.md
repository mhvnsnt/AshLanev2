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
