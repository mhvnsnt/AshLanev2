# AshLane Voice Profiles

Every roster character's voice: who they're based on, vocal DNA, and the Piper
cast (or clone ref) that performs them. Parody framing: South Park / Robot
Chicken rules — these are parody voices, not impersonations.

Legend: `AI` = synthesized by the pipeline (default). `OWNER` = Real records
the lines himself — drop WAVs in `public/audio/voices/owner/<character>/` and
flip the flag in `voices.json`.

## Leads

### Static — AI — `en_US-danny-low` @ 0.82x
- **Based on:** Enzo Amore (owner-confirmed).
- **Vocal DNA:** Fast-talking North Jersey. High energy, machine-gun cadence,
  sells every syllable. Brags, chirps, never shuts up. Drops "how you doin'?",
  "my G", "certified", "SAWFT".
- **Never:** quiet, humble, slow. Static whispers only to set up a scream.
- **Signature situations:** backstage shoot promos ("f*ck AWE" energy),
  pre-match taunts, post-win victory laps.

### Bannon — AI — `en_US-bryce-medium` @ 1.0x
- **Based on:** original (AshLane protagonist).
- **Vocal DNA:** Measured, gravel-under-concrete. Says little, means all of it.
  The lane raised him — he talks like someone who's seen the worst of it twice.
- **Never:** shouting without cause, comedy, filler words.

### Judas — AI — `en_US-ryan-medium` @ 1.06x
- **Based on:** Chris Jericho (model is the Jericho model → Judas).
- **Vocal DNA:** Theatrical rockstar showman. Big pauses, bigger promises.
  Talks to the crowd like an arena is a living thing. Slight sing-song on
  catchphrases.
- **Never:** mumbling, understated.

### Cipher — AI — `en_US-joe-medium`
- **Based on:** original (Painted faction psycho).
- **Vocal DNA:** Gravelly menacing heel. Low, wet, deliberate — every word
  sounds like a threat he's already decided to carry out.
- **Never:** jokes, warmth.

### Onyx — AI — `en_US-lessac-medium`
- **Based on:** original (Black woman, green hair, Dark Clown Faction leader).
- **Vocal DNA:** Cold femme fatale. Velvet over a knife. Amused by your
  suffering, bored by your best shot.
- **Never:** shrill, panicked.

## Roster (casting in progress)

| Character | Based on | Voice direction | Cast | Src |
|---|---|---|---|---|
| maime | TBD (owner) | — | uncast | AI |
| cain_elias | TBD | preacher-menace, sermon cadence | uncast | AI |
| titan | TBD | mountain that talks, slow bass | uncast | AI |
| stickup | GMG JackBoy (inspiration) | flamboyant street, rapid-fire | uncast | AI |
| pablo | TBD | — | uncast | AI |
| echo | TBD | — | uncast | AI |
| hollow | TBD | hollow reverb, dead-eyed | uncast | AI |
| finxsse | TBD | smooth, dreadlocked cool | uncast | AI |
| master_sensei | TBD | calm iron, old master | uncast | AI |
| cody | TBD | blue-collar brawler | uncast | AI |
| jager | TBD | authority bark | uncast | AI |
| sombra_negra | original (NOT Razor/Crux) | calculated mercenary, quiet menace | uncast | AI |
| edwin_kennedy | TBD | — | uncast | AI |
| triple_xxx | TBD | — | uncast | AI |
| stan_combs | TBD | — | uncast | AI |
| bill_dozer | Goldberg→Dozer (book canon) | wrecking-machine grunts, few words | uncast | AI |
| marks | Cole→Marks (commentator) | play-by-play hype | uncast | AI |
| announcer | — | ring announcer hype | ryan @ 0.92x | AI |
| crowd | — | hype bed | ryan (pitched in post) | AI |

**Rule:** never invent a "based on" to fill a gap. `TBD (owner)` means Real
names the inspiration or the character stays original.

## Adding a voice
1. Pick a Piper voice (`--list-casts`, or download another from
   `rhasspy/piper-voices`), or drop a 10s reference clip in
   `tools/voice/refs/<character>.wav` for the Chatterbox clone path.
2. Add the cast to `tools/free-apis/piper-voice.py` `CASTS` (+ tuning).
3. Add the profile row above. 4. Generate a test line, listen, adjust.
