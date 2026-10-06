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

## Inform 7

- **URL:** https://github.com/ganelson/inform
- **What:** The natural-language authoring system for parser interactive
  fiction ("The Kitchen is a room..."). Compiles to Glulx/Z-machine; full
  world model (rooms, things, people, rules, actions). The most sophisticated
  open IF world-simulation available.
- **License:** Artistic License 2.0 (LICENSE file — OSI-approved,
  GPL-compatible permissive license).
- **Verdict:** commercial-safe
- **Notes:** Parser IF isn't our genre, but Inform 7's RULEBOOK architecture
  (before/check/carry-out/after/report rules) is the best-studied design for
  emergent mission logic and NPC behavior. Study-only for AshLane; do not port
  the toolchain.

## Ren'Py (+ renpy-js)

- **URL:** https://github.com/renpy/renpy (engine),
  https://github.com/lee101/renpy-js (TS reimplementation)
- **What:** The standard visual-novel engine (Python): dialogue scripting,
  branching menus, rollback (rewind choices), save/load, screen language,
  transitions. renpy-js is an independent clean-room TypeScript
  reimplementation of the engine + language + toolchain that runs entirely in
  the browser.
- **License:** MIT (Ren'Py is MIT-licensed per Wikipedia and its license page
  renpy.org/doc/html/license.html; renpy-js README: "License: [MIT](LICENSE)").
- **Verdict:** commercial-safe
- **Notes:** renpy-js is the sleeper hit for AshLane: a TS Ren'Py that runs in
  the browser means story-mode cutscenes/dialogue could be authored in
  Ren'Py script and rendered in our three.js page. Verify its maturity before
  depending on it (prototype first).

## Monogatari

- **URL:** https://github.com/Monogatari/Monogatari
- **What:** Web visual-novel engine (TypeScript) — script-driven scenes,
  dialogue, choices, sprites, particles, save slots, multi-language; designed
  to bring VNs to the browser natively.
- **License:** MIT (GitHub API: spdx MIT).
- **Verdict:** commercial-safe
- **Notes:** Directly embeddable in a three.js page for JCPW backstage /
  story interludes. Simpler and more web-native than renpy-js; evaluate both
  for the story-mode presentation layer.

## TyranoScript

- **URL:** https://tyranoscript.jp/ (official; GitHub mirrors e.g.
  https://github.com/evanburchard/tyranoscript are stale forks)
- **What:** Japanese browser visual-novel engine — tag-based scenario script
  (`[bg]`, `[chara_show]`, `[if]`, `[iscript]` for embedded JS), character
  sprites, branching, saves. Huge commercial VN catalog built on it.
- **License:** Terms of use (not OSI): "Free for individuals or for businesses.
  Free to use as you wish, including commercially. Modifications and
  improvements are permitted." (evanburchard/tyranoscript README).
- **Verdict:** commercial-safe (explicit commercial-use grant in terms of use;
  not an OSI license — keep the terms text on file)
- **Notes:** Tag-script style is a proven format for writer-authored
  cutscenes. The `[iscript]` escape hatch (inline JS in scripts) is the right
  pattern for triggering three.js camera/fight events from dialogue.

## Fungus

- **URL:** https://github.com/snozbot/fungus
- **What:** Unity library for illustrated interactive fiction — Flowchart-based
  visual scripting for dialogue, branching choices, character portraits,
  narration, and cutscene sequencing. Writer-friendly block editor inside the
  engine.
- **License:** MIT (GitHub API: spdx MIT).
- **Verdict:** commercial-safe
- **Notes:** Unity-only runtime, so not directly usable — but its Flowchart UX
  (blocks = dialogue/choice/command, drag-wire authoring) is the best
  reference for what a three.js cutscene/dialogue editor should feel like.
  Borrow the interaction design, not the code.

## Dialogic (Godot)

- **URL:** https://github.com/dialogic-godot/dialogic
- **What:** Godot 4 dialogue system — visual timeline editor, character
  manager, portraits, choices, variables, text effects, voice support, VN/RPG
  presets. The most complete open-source dialogue editor+runtime in any
  engine.
- **License:** MIT (GitHub API: spdx MIT).
- **Verdict:** commercial-safe
- **Notes:** Godot-only, so study-only for AshLane — but mine it for feature
  checklist: timelines, character directory, glossary, text-effect tags, and
  its event-based save format are all directly portable concepts.

## Dialogue Manager (Godot)

- **URL:** https://github.com/nathanhoad/godot_dialogue_manager
- **What:** Nonlinear dialogue addon for Godot 4 — write branching dialogue
  in a script-like `.dialogue` text format (conditions, mutations, random
  lines, BBCode text effects), stateless runtime, built-in CSV/PO translation
  pipeline, visual editor tab, dialogue balloons.
- **License:** MIT (LICENSE file, author Nathan Hoad — confirmed via multiple
  downstream attributions).
- **Verdict:** commercial-safe
- **Notes:** The `.dialogue` TEXT format (not a node graph) is the key idea:
  writers prefer readable script text over boxes-and-wires for long
  conversations. Strong candidate format to imitate for AshLane writer
  tooling; pairs naturally with an ink/inkjs runtime underneath.

## Corkboard

- **URL:** https://github.com/skyaphid/corkboard
- **What:** Open-source, web-based, node-based branching dialogue editor — an
  Arcweave alternative. Runs in the browser, exports/imports easy-to-parse
  JSON, extensible node types, includes a sample JSON importer.
- **License:** MIT (GitHub API: spdx MIT).
- **Verdict:** commercial-safe
- **Notes:** Runs in-browser and exports plain JSON — the closest thing to a
  drop-in web dialogue editor for our pipeline. Evaluate as the authoring
  frontend with a custom three.js JSON runner on the game side.

## Dialogue Tree Editor (single-file)

- **URL:** https://github.com/abdullahasaadghalihamza/dialogue-tree-editor
- **What:** A visual node editor for NPC dialogue trees in ONE HTML file — no
  install, no internet. Start/NPC-line/Player-choice/End nodes, conditions,
  set-flags; exports to Ink, Twine/Twee, and JSON.
- **License:** MIT (GitHub API: spdx MIT).
- **Verdict:** commercial-safe
- **Notes:** Killer pipeline fit: writers draw trees in a single HTML file,
  export Ink, run it in the game via inkjs. Zero-dependency authoring that
  Real can use himself. Shortlist for the story pipeline.

## cutscene-script (Godot)

- **URL:** https://github.com/alexofp/cutscene-script
- **What:** A tiny bring-your-own-batteries scripting language for Godot 4
  cutscenes/dialogues — `say`, `ask`/`answer`, labels, jumps, `if`,
  variables, RNG — a plain-text script drives dialogue + scene direction.
- **License:** MIT (GitHub API: spdx MIT — "A simple bring-your-own-batteries
  scripting language for Godot 4.x designed for cutscenes/dialogues").
- **Verdict:** commercial-safe
- **Notes:** Godot runtime, but the LANGUAGE design is engine-agnostic and
  trivially reimplementable: a line-oriented cutscene script with labels and
  jumps is exactly what AshLane's 50s entrance-cinematic/stage-direction
  scripts want. Copy the syntax ideas, write our own runner.

## WebQuestEngine

- **URL:** https://github.com/webquestengine/webquestengine
- **What:** Browser-native point-and-click quest game engine + visual studio —
  project tree (chapters/scenes/characters/objects), parallax walk-path
  editor, WHEN/IF/THEN logic rule builder, branching dialogue tree studio with
  conditional choices/portraits/rewards, full-screen playtest mode.
- **License:** MIT ("MIT License. See LICENSE for details." — README).
- **Verdict:** commercial-safe
- **Notes:** The most complete web-native quest+dialogue authoring suite
  found. Its quest-flag scoping (`quest:labUnlocked`) and dialogue-studio
  data model are worth lifting for AshLane mission authoring; engine itself
  is 2D point-and-click, so take patterns, not the renderer.

## MZ Interaction Builder + MZ Scene Builder

- **URL:** https://github.com/charatobu/mz-interaction-builder,
  https://github.com/Wintersta7e/mz-scene-builder
- **What:** Visual node-graph editor (React/Electron/TS) for RPG Maker MZ
  dialogue trees — Start/Choice-Menu/Action/Comment nodes, exports to game
  event commands; companion Scene Builder is a visual TIMELINE editor for
  cutscenes/picture sequences. (Interaction Builder is archived but
  functional.)
- **License:** MIT for both (GitHub API: spdx MIT).
- **Verdict:** commercial-safe
- **Notes:** RPG Maker-specific export, but the node-graph dialogue editor and
  the timeline-based cutscene editor are the two halves of AshLane's
  story/cutscene authoring. TypeScript + React — the most portable
  implementation reference in this wave for building our own.

## novelWriter

- **URL:** https://github.com/vkbo/novelWriter
- **What:** Open-source plain-text novel-writing editor — project tree,
  outline, scene/chapter organization, notes, distraction-free writing. For
  the WRITING side of narrative design (bible, scripts, lore), not runtime.
- **License:** GPL-3.0 (GitHub API: spdx GPL-3.0).
- **Verdict:** prototype-only
- **Notes:** Editor is GPL so it can't be embedded/shipped, but it's a fine
  free tool for Real to write the AshLane story bible and mission scripts in.
  Use as a tool, not a component.

## Procedural quest/mission generators — GAP

- **URL:** n/a (no strong standalone candidate found)
- **What:** Searched for open-source procedural quest/mission generators
  (radiant-quest style). Findings: only toy repos, engine-specific skill
  docs, RPG-Maker/AI-text-adventure one-offs with restrictive or no licenses,
  and academic papers without usable code. Nothing at the quality bar of the
  engines above.
- **License:** n/a
- **Verdict:** n/a — do not adopt; build or borrow patterns
- **Notes:** The practical path is compositional, not a library: (1) quest
  templates + objective state machines modeled on QuestJS's quest/quality
  system and Inform 7's rulebooks; (2) LLM drafting already in-house
  (tools/free-apis/llm-dialogue-gen.py `--kind quest`) with human review.
  Revisit if a real open generator surfaces.

## License ledger

| Project | License (as recorded) | Verdict |
|---|---|---|
| Yarn Spinner | MIT (LICENSE.md) | commercial-safe |
| ink | MIT | commercial-safe |
| inkjs | MIT (LICENSE) | commercial-safe |
| Inky | MIT (README embeds full MIT text) | commercial-safe |
| Twine (editor) | GPL-3.0 (LICENSE) | prototype-only |
| Tweego | BSD-2-Clause | commercial-safe |
| Twine story formats (SugarCube / Snowman / Chapbook) | BSD-2-Clause / MIT / GPL-3.0 | commercial-safe (SugarCube, Snowman) |
| Squiffy | MIT (LICENSE) | commercial-safe |
| Quest 5 | MIT (LICENSE) | commercial-safe |
| QuestJS | MIT (LICENSE) | commercial-safe |
| Undum | MIT (GitHub API spdx) | commercial-safe |
| Inform 7 | Artistic License 2.0 (LICENSE) | commercial-safe |
| Ren'Py | MIT (license page) | commercial-safe |
| renpy-js | MIT (README -> LICENSE) | commercial-safe |
| Monogatari | MIT (GitHub API spdx) | commercial-safe |
| TyranoScript | Terms of use — commercial use explicitly granted (non-OSI) | commercial-safe (keep terms on file) |
| Fungus | MIT (GitHub API spdx) | commercial-safe |
| Dialogic | MIT (GitHub API spdx) | commercial-safe |
| Dialogue Manager (Godot) | MIT (LICENSE, Nathan Hoad) | commercial-safe |
| Corkboard | MIT (GitHub API spdx) | commercial-safe |
| Dialogue Tree Editor | MIT (GitHub API spdx) | commercial-safe |
| cutscene-script | MIT (GitHub API spdx) | commercial-safe |
| WebQuestEngine | MIT (README -> LICENSE) | commercial-safe |
| MZ Interaction Builder | MIT (GitHub API spdx) | commercial-safe |
| MZ Scene Builder | MIT (GitHub API spdx) | commercial-safe |
| novelWriter | GPL-3.0 (GitHub API spdx) | prototype-only |

Shortlist for AshLane story pipeline: inkjs (runtime) + Dialogue Tree Editor
or Corkboard (authoring) exporting Ink; Monogatari or renpy-js for VN-style
presentation; cutscene-script syntax ideas for stage-direction scripts.
