# Dialogue System

In-character dialogue for every fighter — promos, backstage segments, trash talk,
story lines. Every character talks like *themselves*, never generic wrestling filler.

## The rule

`basedOn` in a voice bible is only set when the owner confirmed it. Everyone else
is voiced from their in-game bio, faction, and role. **Never invent celebrity
casting** — casting comes from the books.

Confirmed bases: Static → Enzo Amore · Cipher → Lio Rush · Echo → Shotzi Blackheart ·
Stick-Up → GMG JackBoy (street inspiration) · Edwin Kennedy → Mr. Kennedy mic cadence.
Sombra Negra is explicitly an ORIGINAL character (no wrestler basis) despite the
Priest-based model.

## Files (`src/game3d/dialogue/`)

| File | What |
|---|---|
| `voice-bibles.ts` | 12 bibles: pace, register, signature phrases, vocab, `neverSays`, rhythm, attitude, narrative hooks |
| `generator.ts` | Seeded `generateDialogue(fighterId, situation, ctx)` + `promoExchange(a, b)`. Same inputs → same lines, every time |
| `samples.ts` | Hand-written showcase pack — the quality bar (Static gets 6 pieces) |
| `director.ts` | Game wiring (below) |
| `index.ts` | Public API |

## Situations

`promo` · `callout` · `backstage` · `weighin` · `victory` · `defeat` ·
`betrayal` · `faction` · `street` (JCPW street interview) · `title`

## Game wiring

```ts
import { DialogueDirector, buildPromoCinematic, pauseMenuBeat, backstageSegment } from "@/game3d/dialogue";

const director = new DialogueDirector();

// 1. Pre-match promo — 3-shot cinematic with timed subtitle cues
const cinematic = buildPromoCinematic(director, "static", "wreck", {
  camera, place: "Cinder Plaza", title: "Warm the corner",
  onDone: () => startFight(),
});
// in the game loop: cinematic.update(dt)

// 2. Pause-menu story beat — in-character lines about the current mission
const beat = pauseMenuBeat("static", missionIndex);
// beat = { speaker, fighterId, lines, label } → render in the pause sheet

// 3. JCPW backstage segment — Judas-style interview, 3–5 turns
const seg = backstageSegment("static", "Wreck Patterson");
// seg.turns → [{ speaker, fighterId, text }] → backstage screen

// Default DOM subtitle overlay (optional — the game can render cues itself)
const detach = attachSubtitleOverlay(director);
const unsub = director.onCue((cue) => mySubtitleRenderer(cue));
```

## Voice pipeline

Line text from this system feeds the AI voice pipeline (character voice profiles
per fighter). Text and voice meet at the `DialogueCue` — `{ speaker, fighterId,
text, durationMs }`. Owner-recorded lines drop in alongside AI voices per fighter.

## Adding a character

1. Add a `VoiceBible` to `voice-bibles.ts` (ground it in bio/faction — no invented casting).
2. Add line banks to `BANKS` in `generator.ts` for their key situations.
3. Add 1–2 hand-written pieces to `SAMPLE_PACK` in `samples.ts`.
4. They work everywhere immediately — generator, promos, pause beats, backstage.
