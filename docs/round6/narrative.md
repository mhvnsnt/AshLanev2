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

## Twine (+ Tweego, story formats)

- **URL:** https://github.com/klembot/twinejs (editor), https://github.com/tmedwards/tweego (CLI compiler)
- **What:** The classic choice-based interactive fiction authoring tool —
  visual passage-map editor, stories written in Twee notation, compiled to
  self-contained HTML. Story formats: Harlowe, SugarCube, Snowman, Chapbook.
  Tweego is the command-line Twee compiler for pipeline use.
- **License:** Twine editor GPL-3.0 (LICENSE file). Tweego BSD-2-Clause.
  Bundled formats carry their own licenses: SugarCube BSD-2-Clause, Snowman
  MIT, Chapbook GPL-3.0.
- **Verdict:** prototype-only (Twine editor is GPL; Twee/Tweego + SugarCube or
  Snowman formats are the commercial-safe path — write in Twee, compile with
  Tweego, ship the MIT/BSD format runtime)
- **Notes:** Useful as a WRITING environment for branching side-stories, and
  the passage-map is a good authoring UX reference. For the game itself, prefer
  ink/inkjs or Tweego+SugarCube over embedding the GPL editor.

## Squiffy

- **URL:** https://github.com/textadventures/squiffy
- **What:** JavaScript interactive-fiction framework by textadventures
  (Alex Warren) — write branching stories in a Markdown-like script, compiles
  to HTML/JS playable in any browser. Sections, passages, attributes,
  conditional text.
- **License:** MIT ("The MIT License (MIT), Copyright (c) 2014-2026
  Alex Warren, textadventures.co.uk and contributors").
- **Verdict:** commercial-safe
- **Notes:** Dead simple for web text interludes (mission debrief screens,
  JCPW backstage text segments). Pure JS, no build step needed for output.

## Quest 5 / QuestJS

- **URL:** https://github.com/textadventures/quest (Quest 5),
  https://github.com/ThePix/QuestJS (QuestJS)
- **What:** Quest 5 is the desktop text-adventure authoring system
  (rooms, objects, NPCs, quests/objectives, timers, turnscripts) with a GUI
  editor. QuestJS is its JavaScript successor — a code-first IF engine for the
  browser with built-in quest/objective tracking, NPC agendas, and combat.
- **License:** MIT (Quest 5 LICENSE: "The MIT License (MIT), Copyright (c)
  Alex Warren, Andy Joel and contributors"; QuestJS LICENSE: "MIT License,
  Copyright (c) 2019 Andy Joel").
- **Verdict:** commercial-safe
- **Notes:** QuestJS is the interesting one for us: JS-native, and its
  quest/objective + NPC-agenda model maps directly onto AshLane story missions
  and faction NPCs. Study its quest-state machine design; reuse permitted.

## Undum

- **URL:** https://github.com/idmillington/undum
- **What:** Client-side framework for narrative hypertext interactive fiction —
  situation-based (not parser-based) branching stories with character
  qualities/stats, clean HTML/CSS presentation, save support.
- **License:** MIT (GitHub API: spdx MIT; "A client-side framework for
  narrative hypertext interactive fiction").
- **Verdict:** commercial-safe
- **Notes:** Quality/progress-tracking ("qualities") system is a neat model for
  faction reputation meters in a hypertext UI. Lightweight; good reference for
  a web-native story UI layer.
