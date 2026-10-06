# Dialogue System

In-character dialogue for every fighter — promos, backstage segments, trash talk,
story lines, AND street-world dialogue. Every character talks like *themselves*,
never generic wrestling filler.

## Game identity (owner law, binding 2026-10-06)

AshLane = **Urban Reign-style STREET brawler**, NOT a wrestling game, NOT Bannon.
Wrestling exists in it (moves in the moveset, arenas as locations, wrestling
matches playable in those spots, wrestler factions) — but the core is street:
pre-match = rolling up on a block / turf standoff, post-win = the block is
yours / territory shifts. Never present versus/story with default wrestling-match
framing (ring entrances, announcers) — that's Bannon's language. `missionBriefing`
follows this: rival missions in the ring/cage use the wrestling register,
everywhere else they use the street register.

## Two worlds — never mixed (owner law)

AshLane is **Urban Reign street life**: wrestlers AND gangsters AND corpo bosses
AND civilians. It is NOT a wrestling-only world.

- **Wrestling contexts** (`promo`, `callout`, `backstage`, `weighin`, `victory`,
  `defeat`, `betrayal`, `faction`, `title`) belong to the arena, wrestler
  factions, and wrestling storylines. The existing wrestling dialogue is correct
  there and stays.
- **Street contexts** (`confront`, `parley`, `corpo`, `hustle`, `claim`,
  `civilian`, `loyalty`, `heat`) belong to roam mode, turf war, missions, and
  the street — the corner register, not the ring. Same voices, different stakes.

`streetVoice` on a voice bible documents how the corner register differs from
the ring for that character.

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
| `voice-bibles.ts` | 13 bibles + Narrator + 4 street archetypes (Corner Lieutenant, The Fixer, Corner Hustler, Beat Cop — original, zero invented casting). `streetVoice` register notes on the 12 fighters |
| `generator.ts` | Seeded `generateDialogue(fighterId, situation, ctx)` + `promoExchange(a, b)`. Same inputs → same lines, every time. `STREET_BANKS` for 16 voices + archetype street fallbacks |
| `samples.ts` | Hand-written showcase pack — the quality bar (Static gets 6 wrestling pieces + street pieces; 12 street samples across the new situations) |
| `director.ts` | Game wiring (below) |
| `index.ts` | Public API |

## Situations

**Wrestling:** `promo` · `callout` · `backstage` · `weighin` · `victory` ·
`defeat` · `betrayal` · `faction` · `street` (JCPW street interview) · `title`

**Street:** `confront` (turf dispute, corner standoff) · `parley` (gang
negotiation before it pops off) · `corpo` (suit threat, clean menace) ·
`hustle` (deal going down/wrong) · `claim` (rolling up on a block) ·
`civilian` (shopkeeper/bystander caught in it) · `loyalty` (crew loyalty /
street betrayal) · `heat` (police/authority pressure)

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

## Street wiring

```ts
import { streetEncounter, playStreetEncounter, turfWarBeat, missionBriefing } from "@/game3d/dialogue";

// Roam-mode encounter — one voice, or two for parley/confront
const enc = streetEncounter("stickup", {
  situation: "parley", place: "Scrap Street",
  opponent: "the Hollow crew", otherId: "__lieutenant", seed: 7,
});
playStreetEncounter(director, "stickup", { situation: "parley", place: "Scrap Street" });

// Turf war — the block changed hands
turfWarBeat(director, {
  blockName: "the bodega corner", takenById: "static", lostByName: "Hollows",
});

// Mission intro — street register by mission rule (rival in ring/cage = wrestling register)
const brief = missionBriefing("static", missionIndex);
// brief = { speaker, fighterId, lines, label } → mission intro card
```

## Adding a character

1. Add a `VoiceBible` to `voice-bibles.ts` (ground it in bio/faction — no invented casting). Add `streetVoice` if the corner register differs from the ring. Set `wrestlingCanon: true` ONLY for wrestling-industry characters by "Off The Top Rope" book canon (El Toro de Oro, Static, Hollow, and other wrestling-industry characters) — their wrestling voice stays AND bleeds into street talk.
2. Add line banks to `BANKS` (wrestling situations) and/or `STREET_BANKS` (street situations) in `generator.ts`.
3. Add 1–2 hand-written pieces to `SAMPLE_PACK` in `samples.ts`.
4. They work everywhere immediately — generator, promos, pause beats, backstage, street.

## Book port (Bannon repo → AshLane, owner directive 2026-10-06)

Character dialogue, personalities, and bios were pulled from `mhvnsnt/Bannon` — the
"Off The Top Rope" cast doc (bios, OTR personas, finishers) and Books 1–7 (verbatim
voice). The transform rule:

- **Default: wrestling-framed → street-framed.** Bios/personalities come over mostly
  intact (who they ARE doesn't change); dialogue situations get street conversion.
- **Exception: wrestling-canon characters keep their wrestling voice** (El Toro de Oro,
  Static, Hollow, Cipher, Echo, Edwin Kennedy, Stan Combs, Onyx). Their wrestling
  dialogue is authentic — don't flatten them into street talk. It also bleeds into
  their street lines as flavor (a wrestler talks like a wrestler even on a corner).

Ported book material (all grounded, zero invented casting):
- **Maime** — book-verbatim liturgy: "There is no return. There is only Bannon. And Bannon
  is Control." / "There is no Justice. There is only Consequence." Face-painted unhinged
  alter-ego, raw high-pitched whining/crying voice (Book 1).
- **Stick-Up** — REVEREND STICK UP sermon mode (Book 1, p.185): purple robes, pulpit,
  Isaiah 55:8, "I am the vessel!", "the Leap of Faith". Plus Cyborg Project weapon
  backstory (machine precision + conspiracy rants).
- **Edwin J. Kennedy** — OTR "Paralyzed Perfectionist" (classical history, Greek Tragedy,
  legacy); LP 33/6; finisher The Indefinite Suspension. Wrestling-canon.
- **Stan "Honey" Combs** — OTR "Avid Collector" (watches, classic cars, cold efficiency);
  JPCW Owner; Cyborg Project mastermind. Wrestling-canon.
- **Cain Elias** — OTR contrast "Dedicated Caregiver" (anonymous community-center volunteer)
  vs The Executioner; finisher The Final Verdict. Street conversion.
- **El Toro de Oro** — El Grito de la Bestia, El Cuerno Dorado; fiercely protective of
  partners. Wrestling-canon.
- **Sombra Negra** — La Trampa de Plata, El Robo de la Sombra; book: tempts Bannon back
  toward corporate control. Street conversion.
- **Onyx** — Book 7 entity: omniscient, detached, tries to corrupt code; green hair, white
  face paint; public face of the gang (Bill/Theory lead in secret); Club Onyx (Miami).
- **Triple X** — Administration enforcer, cold corporate violence.
- **Cipher / Echo / Static** — book: teamed with Onyx (Painted); Static = "Signal in the Static".

## Wrestling/street ratio (owner law)

Wrestling-flavored dialogue ≈ 5–10% of total; 90–95% street. Flavor-based accounting
(situation ≠ flavor — the 5 non-canon fighters' promo/callout/victory banks are
street-flavored):

- **Street-flavored:** all STREET_BANKS + street-fighter BANKS + street archetype
  fallbacks + street samples.
- **Wrestling-flavored:** canon wrestlers' wrestling BANKS (authentic, untouchable) +
  archetype promo/victory/defeat fallbacks (arena minimums) + wrestling samples.
- Current: ~85% street / ~15% wrestling. The remaining wrestling content is either
  canon-authentic voice or functional arena minimums — cutting further would strip
  the wrestlers (forbidden) or break arena features. New content defaults to street.
