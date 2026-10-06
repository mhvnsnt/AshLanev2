# THE NARRATOR

AshLane's 4th-wall-breaking mascot. A Shadow Wizard Money Gang wizard in a
**PURPLE** robe who exists **OUTSIDE** the game world and talks to **YOU the
player** — never the character. Reference: Navi (Zelda), Aku Aku (Crash
Bandicoot), the Afro Samurai mentor — a guide who lives outside the fiction.

## Canon (owner law)

- **PURPLE robe = The Narrator.** Outside the fiction. Breaks the 4th wall.
  Menus, loading, story-progression moments. Never a combatant, never in-world.
- **RED robe = "Ashes" / Buffalo Bill.** The IN-WORLD character who appears
  later in the story. Different role, different robe. **Never mix them.**
- **Scarcity is the point.** He appears SOMETIMES at curated story-progression
  moments — not constantly, no mid-match play-by-play, no banter. When he shows
  up, the player knows something important happened. (~12 appearances per full
  playthrough.)

## Appearance triggers (director.ts)

| Trigger | When | Size |
|---|---|---|
| `first_boot` | Once ever — the meeting | large |
| `act_transition` | Campaign enters a new act (6 acts) | large |
| `rival_down` | A boss/rival mission is cleared | corner |
| `campaign_complete` | The last paper | large |
| `level_milestone` | Fighter first hits level 5 | corner |

Cooldown: 120s minimum between appearances. One at a time, max one queued —
never interrupts, never stacks.

## Files

- `src/game3d/narrator/model.ts` — procedural three.js wizard + animation rig
  (idle / talk / point / shrug / facepalm / hype / appear / hide). He floats.
- `src/game3d/narrator/lines.ts` — dialogue bank. Few lines, each weighty.
- `src/game3d/narrator/narrator-store.ts` — zustand presence store.
- `src/game3d/narrator/director.ts` — watches story/campaign hud state.
- `src/game3d/narrator/voice.ts` — voice playback (see below).
- `src/game3d/narrator/NarratorOverlay.tsx` — picture-in-picture stage.
- `src/game3d/narrator/index.ts` — public API.

Wired in `src/components/ashlane-app.tsx`: `watchNarrator(hud)` on every hud
snapshot + `<NarratorOverlay />` inside the stage.

## Voice — ⚠️ OWNER DECISION REQUIRED

Voice = **Bill $aber's voice**. Two options:

1. **Owner records it himself** (it's his persona's voice). Drop MP3/WAV files
   in `public/audio/narrator/` named `<line-id>.mp3` (line ids log to console
   in dev when he appears). 44.1kHz mono is fine. Keep the measured,
   conspiratorial, amused cadence.
2. **AI synthesis** via the voice pipeline — only with his explicit go-ahead.

Until he answers, the narrator is **subtitle-only by design**. `voice.ts`
never synthesizes. Do not AI-generate narrator lines without his confirmation.

## Dialogue voice

Cocky, all-knowing, funny. Talks to "you". Knows he's outside the glass.
Never explains the joke twice. Voice bible: `src/game3d/dialogue/voice-bibles.ts`
(id `__narrator`). New lines go in `lines.ts` — keep them rare and weighty.

## Presentation

Own three.js canvas, own scene — rendered ABOVE the game, never in the world.
Corner bubble for lighter beats, large centered stage for events. Purple/gold
frame, "The Narrator" nameplate, subtitle bar. Click to dismiss. Never blocks
game input.
