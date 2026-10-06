# Dynamic Commentary — Design Doc (Round 3)

AshLane's commentary system: offline, data-driven, zero runtime cost beyond
playing a WAV. No streaming TTS, no API calls mid-match.

## Pipeline

```
dialogue-gen.py  →  dialogue/<character>.json   (lines per game event)
       │
       ▼
piper-voice.py --synthesize  →  WAVs per line (offline neural TTS, MIT)
       │
       ▼
game: src/game3d/commentary.ts (planned) picks line by event + cooldown
```

## Canonical samples (shipped)

`tools/free-apis/samples/` — generated 2026-10-06 via `piper-voice.py --samples`:

| File | Cast | Line |
|---|---|---|
| `announcer_ko.wav` | announcer (ryan) | "KNOCKOUT! It's OVER!" |
| `announcer_round_one.wav` | announcer (ryan) | "Round one! Fight!" |
| `cipher_menacing.wav` | cipher (joe) | "You stepped into MY alley. Bad move." |
| `crowd_hype.wav` | crowd (ryan) | "Let's go! Let's go! Let's go!" |
| `onyx_taunt.wav` | onyx (lessac) | "Is that all? I barely felt it." |

## Runtime behavior (planned `commentary.ts`)

- **Events:** `round_start`, `ko`, `knockdown`, `taunt`, `win`, `lose`, `crowd_swell`.
- **Cooldowns:** min 4s between barks, 12s between same-event repeats —
  commentary must never talk over itself.
- **Priority:** `ko` > `knockdown` > `round_start` > `taunt`. A KO bark
  interrupts a taunt; never the reverse.
- **Crowd bed:** `crowd_hype.wav` loops quietly under matches; swells
  (volume automation) on knockdowns — pairs with the arena crowd's
  `crowdReact()` excitement value (see `src/game3d/arena-crowd.ts`).
- **Ducking:** commentary WAVs duck the music bus by ~6dB while playing.

## Casting

| Cast | Piper voice | Character |
|---|---|---|
| announcer | en_US-ryan-medium | ring announcer |
| cipher | en_US-joe-medium | Cipher (heel) |
| onyx | en_US-lessac-medium | Onyx |
| crowd | en_US-ryan-medium | crowd beds / chants |

New lines: add to `DIALOGUE` in `dialogue-gen.py`, run
`python3 dialogue-gen.py --character <name> --synthesize`, commit the WAVs.

## License

Piper is MIT (OHF-Voice/piper1-gpl). Voice models from rhasspy/piper-voices
(CC0-ish dataset lineage — verify per voice before commercial ship).
Synthesized WAVs are original performances of our own scripts: no sample
clearance needed.
