# STORYBOARD — ONYX'S GANG: Faction Promo Cinematic
**Game:** AshLane (Urban Reign-inspired urban brawler)
**Faction:** Onyx's Gang — first FACTION promo (proof of concept for the faction video line)
**Duration:** 50 seconds | **Format:** 1920x1080, 24fps
**Pipeline:** `tools/promo-video/cinematic-faction.html` (new — street scene, multi-character)
**Status:** DRAFT — review before rendering. No video gets built without an approved storyboard.

---

## Why this exists

Individual promos sell a fighter. Faction promos sell the world: who runs with who,
who leads, who enforces, what their turf looks like, and what happens when someone
else walks onto it. This is the first one. If the formula works, every faction gets one.

## Narrative arc (one sentence)

Onyx walks her street at night, her crew falls in behind her one by one, their
personalities flash, a rival crew blocks the far end — and the gang takes the street.

## Cast

| Role | Model | Canon notes | Animation source |
|------|-------|-------------|------------------|
| Onyx (public face / leader) | `ONYX_street.glb` (backup: `ONYX_skinned.glb`) | Black woman, green hair, white face paint. Omniscient, detached. | cmu walk, boxidle, guardhigh |
| Hollow (the general) | `HOLLOW.glb` | Orange robe. Enforcer. | cmu walk, guardhigh, suplex (atk, paired) |
| Static (crew) | `STATIC.glb` | Fast-talking, Enzo-like energy. Deep blue robe. | cmu walk, boxidle, KofiKingston taunt mocap |
| Echo (crew) | `ECHO.glb` | Pink robe. | cmu walk, esquiva |
| Cipher (crew) | `CIPHER_rigged.glb` | Yellow robe. | cmu walk, capoeira |
| Rival crew (3) | Tinted clones (dark red silhouette) | Stand-ins — read as "the other crew," not canon characters | boxidle, hit/hitback/fallflat reactions, suplex (vic, paired) |

> **Canon guard:** Buffalo Bill and Theory are SECRET leaders of Onyx's gang — they do
> NOT appear. Onyx is the public face. This is enforced in the storyboard, not just docs.
> **Deliverable text policy:** No placeholder text. "ONYX'S GANG" and "ASHLANE" only.

## Environment

Night city street — NOT an arena. Procedural (no external assets):
- Wet asphalt street (reflective plane, painted center line, cracks)
- Building facades both sides (dark boxes, lit windows — some flickering)
- Neon signs (canvas-texture planes: greens/pinks — SWMG palette, no real business names)
- Overhead streetlights (pools of light, one flickering over the rival crew)
- Haze/fog + floating dust, distant city glow on the horizon
- Props: dumpster, trash bags, chain-link fence section, parked car silhouette

## Lighting design

- **Base:** near-black blue ambient. The street exists before the gang arrives.
- **Neon wash:** green + magenta point/rect lights from the signs — the SWMG look.
- **Streetlights:** warm sodium pools along the street; the far one flickers (rival reveal).
- **Rim:** cold blue rim on the gang as they walk — separates them from the dark.
- **Confrontation:** lights push red as the crews close distance. Haze at maximum.

---

## SHOT LIST

### Shot 1 — "The Empty Street" (0:00–0:05)
- **Camera:** Wide street establishing, slow push-in. Position (0, 2.2, 14) → (0, 2.0, 12), look at (0, 1.5, 0).
- **Action:** Nothing moves. Empty wet street, neon buzzing, haze drifting. No gang yet.
- **Lighting:** Near-black. Neon signs at 40%. One distant streetlight flickers.
- **Narrative beat:** Anticipation. Whose street is this? (Owner liked the dark-to-bright open — intentional.)
- **Audio cue:** Night ambience, distant traffic, neon hum.

### Shot 2 — "The Leader" (0:05–0:12)
- **Camera:** Low tracking shot beside Onyx. Position (2.6, 1.1, 6.5) → (2.2, 1.2, 3.0), look at Onyx head height.
- **Action:** Onyx walks into frame from the dark (z=10 → z=2), real cmu walk mocap, unhurried. She stops center, settles into boxidle. She owns this street.
- **Lighting:** A streetlight pool catches her as she enters it. Cold rim light on.
- **Narrative beat:** The reveal. This is her street and her video.

### Shot 3 — "The Gang Assembles" (0:12–0:20)
- **Camera:** Slow lateral track, widening. Position (-4.5, 1.6, 5.5) → (-5.5, 1.8, 7.5), look at gang center.
- **Action:** One by one from the dark behind her: Hollow (12.5s), Static (14s), Echo (15.5s), Cipher (17s) — each walks in (cmu walk) and takes a flanking position. By 20s all five stand in formation: Onyx front-center, Hollow at her right shoulder, the crew fanned behind. Hold.
- **Lighting:** Neon wash rises. Each arrival gets a subtle rim-light pop.
- **Narrative beat:** Faction identity. Leader, general, crew — the family business.

### Shot 4 — "Personalities" (0:20–0:26)
- **Camera:** Quick cuts (4 × ~1.5s): close-up each member.
  - Static (20–21.5s): **real Kofi Kingston taunt mocap** — arms out, head down, the showman.
  - Hollow (21.5–23s): guardhigh hold — coiled menace, the general.
  - Echo (23–24.5s): esquiva loop — slippery, hard to pin.
  - Cipher (24.5–26s): capoeira hold — unpredictable technician.
- **Lighting:** Each cut gets a colored edge (blue / orange / pink / yellow — their robe colors).
- **Narrative beat:** Character. Five people, five threats. Not interchangeable.

### Shot 5 — "The Rival Crew" (0:26–0:32)
- **Camera:** Hard cut — long lens down the street. Position (0, 2.0, -2), look at (0, 1.4, -14).
- **Action:** Three silhouettes under the flickering far streetlight. Backlit, underexposed. They've been waiting. One cracks his knuckles (boxidle variant — subtle).
- **Lighting:** Deliberate silhouette. Flickering sodium light. Red creeping into the haze.
- **Narrative beat:** Stakes. The gang isn't alone — someone else claims this street.

### Shot 6 — "The Takeover" (0:32–0:46)
- **Camera:** Wide, slowly pushing in. Position (3.0, 2.4, 9.0) → (2.0, 1.8, 5.5), look at (0, 1.3, -2). Both crews in frame.
- **Action:** The gang advances (walk, 32–36s). Crews meet at mid-street (z≈-4). Standoff hold (36–38s). Then Hollow hits a **PAIRED SUPLEX** on the lead rival — real atk/vic mocap, synced (38–42s): the rival goes up and over, lands flat (fallflat), the other two rivals flinch into hit reactions. The gang stands over the street (42–46s). Onyx doesn't move — she never had to.
- **Lighting:** Full intensity, red push. Haze maximum. Neon strobing subtly with the impact.
- **Narrative beat:** The payoff. This is what the gang DOES. The street is theirs.

### Shot 7 — "Title Cards" (0:46–0:50)
- **Camera:** Hold on the gang formation, slow fade.
- **Action:** Gang holds. Haze drifts.
- **Lighting:** Hold, then fade to black.
- **Narrative beat:** Branding. Text overlay:
  - **"ONYX'S GANG"** (green/white, large)
  - **"ASHLANE"** (gray, smaller, below)

---

## Animation sources (per shot) — REAL MOCAP ONLY

| Shot | Time | Who | Animation | Source | Verified |
|------|------|-----|-----------|--------|----------|
| 2 | 0:05–0:12 | Onyx | walk → boxidle | cmu walk / bank boxidle | ✅ proof strips |
| 3 | 0:12–0:20 | all five | walk → idle holds | cmu walk / bank idles | ✅ proof strips |
| 4 | 0:20–0:26 | each | taunt / guardhigh / esquiva / capoeira | KofiKingston retarget / bank | ✅ proof strips |
| 5 | 0:26–0:32 | rivals | silhouette idle | bank boxidle (tinted) | ✅ |
| 6 | 0:32–0:38 | all | walk → standoff | cmu walk | ✅ |
| 6 | 0:38–0:42 | Hollow + rival 1 | **paired suplex (atk + vic, synced)** | bank suplex atk/vic | ✅ proof strips (both PASS/WARN reviewed) |
| 6 | 0:38–0:42 | rivals 2–3 | hit / hitback reactions | bank hit, hitback | ✅ |
| 6 | 0:42–0:46 | gang | stance holds | bank guardhigh/boxidle | ✅ |

**Banned:** Procedural bone animation of any kind (docs/ANIM_INGEST.md). Every pose is a
baked retargeted clip. Root staging translations only. No exceptions.

## Known issues / stand-ins

1. **Rivals are tinted clones**, not canon characters — correct for this promo (they read
   as "the other crew"). A canon rival faction gets cast when the faction roster firms up.
2. **Paired suplex sync** is the highest-risk beat — attacker and receiver clips must start
   on the same frame with matched root positions. Frame-by-frame QA mandatory before the
   owner sees it. If the sync doesn't hold, fall back to: Hollow advances, rival hit-reaction
   + fallflat (no lift).
3. **Five GLBs + street scene** is heavier than the single-character pipeline — watch
   headless render memory. Reduce shadow map size / dust counts if the renderer chokes.
4. Cipher is 54 nodes vs the others' 76 — same Mixamo family, bakeClip is slot-based so
   this is fine, but verify in the first test frame.

## Template rule (going forward)

Faction promos follow this file's format: narrative arc, cast table with ROLES (not just
names), turf-tied environment, personality beats per member, a confrontation that shows
what the faction DOES, title cards. Copy as `STORYBOARD_<FACTION>.md`.
