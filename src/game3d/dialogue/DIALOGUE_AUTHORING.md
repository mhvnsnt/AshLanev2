# Dialogue authoring for AshLane

Two ways to write dialogue. Both play through the **same in-game dialogue UI**
(`openDialogue` / `openInkDialogue` / `openBeatsDialogue` in `services.ts`).

## Option A — ink (recommended for writers)

**Runtime:** [inkjs](https://github.com/yannickloriot/inkjs) (MIT, inkle's ink
ported to JS). **Commercial-safe.**

Write a `.ink` file in `src/game3d/dialogue/stories/`:

```ink
VAR met_static = false

-> start

== start ==
Yo, {player_name}. You heard what happened? # speaker:STATIC
* [Nah, what happened?] -> bus
* [Let's fight.] -> fight

== bus ==
I don't start it, but I FINISH it. # speaker:STATIC
~ met_static = true
-> END

== fight ==
Lace up. # speaker:STATIC
-> END
```

Rules that matter for our runtime:

- **Speaker tags go at the END of the line**: `...text. # speaker:STATIC`.
  (A tag on its own line attaches to the *previous* line in ink.)
- `{variable}` interpolation works in lines and choice labels.
- `~ var = value` sets variables; read them in game code via
  `runner.getVariable("met_static")`.
- `-> END` ends the story.

Compile to JSON (uses the compiler bundled with inkjs — no extra installs):

```sh
node tools/dialogue/compile-ink.mjs src/game3d/dialogue/stories/my-story.ink
# or compile every story:
node tools/dialogue/compile-ink.mjs --all
```

Commit **both** the `.ink` source and the `.ink.json`. The game loads the JSON:

```ts
import compiled from "./dialogue/stories/static-backstage.ink.json";
openInkDialogue(services, compiled);
```

## Option B — beats (quick scripts, no tooling)

Plain TypeScript in `dialogue-runtime.ts` style:

```ts
const beats: Beat[] = [
  { id: "start", speaker: "STATIC", line: "Yo, {player}.",
    choices: [{ label: "Fight", next: "fight" }] },
  { id: "fight", speaker: "STATIC", line: "Lace up." },
];
openBeatsDialogue(services, beats, "start", { player: "Real" });
```

Supports `{var}` interpolation and `set: { flag: true }` per beat.

## License ledger

| Item | License | Status |
|---|---|---|
| inkjs (runtime + bundled compiler) | MIT (inkle) | **commercial-safe** |
| stories/*.ink + *.ink.json (ours) | ours | commercial-safe |
