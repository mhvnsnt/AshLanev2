# Round 6 — Narrative Systems

Research wave: dialogue-tree runtimes + editors, quest/mission frameworks,
procedural mission generators, branching narrative engines, interactive
fiction engines, narrative design tools, cutscene script formats.
RESEARCH ONLY — no game code this wave.
AshLane needs: story missions / factions / JCPW backstage (three.js web game).

License rule (owner binding): prototype may use whatever WORKS. Every license
recorded from the actual LICENSE/README file. Verdict: commercial-safe or
prototype-only. Unclear = prototype-only.

## Yarn Spinner

- **URL:** https://github.com/YarnSpinnerTool/YarnSpinner
- **What:** Dialogue/narrative scripting language (`.yarn`) + compiler +
  runtime. Writer-friendly branching dialogue with variables, functions,
  commands; runs on Unity, Godot, Bevy; Rust crates
  (yarnspinner_core/compiler/runtime, MIT/Apache-2.0). Shipped in
  Night in the Woods and others.
- **License:** MIT (LICENSE.md — "Yarn Spinner is available under the MIT
  License... you can use it in any commercial or noncommercial project").
- **Verdict:** commercial-safe
- **Notes:** The standard pick for AshLane backstage/mission dialogue. Three.js
  path: compile `.yarn` with the Rust compiler to bytecode, run in JS/WASM, or
  port the small runtime — no official JS runtime, so budget a thin runner.

## ink + inkjs + Inky

- **URL:** https://github.com/inkle/ink (engine), https://github.com/y-lohse/inkjs (JS runtime), https://github.com/inkle/inky (editor)
- **What:** inkle's narrative scripting language — markup-based branching
  story with knots/stitches, diverts, variables, functions, lists. inkjs is the
  full JavaScript port (runs natively in three.js/web). Inky is the Electron
  IDE for writing/testing ink.
- **License:** MIT (ink repo: MIT; inkjs LICENSE: MIT; Inky README embeds the
  full MIT license text: "Inky and ink are released under the MIT license").
- **Verdict:** commercial-safe
- **Notes:** inkjs is the fastest route to branching narrative in AshLane —
  drop-in JS runtime, JSON story format, save/load state built in. Best fit for
  mission briefings, faction storylines, JCPW backstage segments.
