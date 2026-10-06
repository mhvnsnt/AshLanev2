# STORYBOARD — EL TORO DE ORO: Entrance Cinematic
**Game:** AshLane (Urban Reign-inspired urban brawler)
**Character:** El Toro de Oro (bull-headed monster heel)
**Duration:** 50 seconds | **Format:** 1920x1080, 24fps
**Pipeline:** `tools/promo-video/cinematic-arena.html` (branch `promo/video-pipeline`)
**Status:** DRAFT — review before rendering. No video gets built without an approved storyboard going forward.

---

## Why this exists

The v1 video had no storyboard. It strung procedural animation segments together with camera cuts and no narrative intent — which is why it felt like a possessed mannequin having a seizure instead of a promo. Every shot below has a narrative purpose. If a shot can't justify its existence in the story, it gets cut.

## Narrative arc (one sentence)

A monster emerges from darkness into a roaring arena, walks to the ring with menace, taunts the crowd, and confronts a rival waiting inside — the beast has arrived.

## Cast

| Role | Model | Animation source |
|------|-------|------------------|
| El Toro de Oro (protagonist) | `EL_TORO_DE_ORO.glb` (Mixamo rig, 58 bones) | Procedural walk (verified axes) + retargeted Kofi Kingston taunt mocap |
| The Rival (opponent) | Same rig, dark red tint (shadowy silhouette) | Slow procedural idle |
| Crowd | 400 instanced procedural figures | Excitement-driven bob/sway (0=calm → 1=wild) |

> **Note:** `CAIN_ELIAS_gear_FIXED.glb` was evaluated as the opponent but has corrupted skinning (vertices stretch to infinity in rest pose). It cannot be used until mesh surgery repair. The tinted-rig rival is the stand-in.

## Environment

Full wrestling arena (procedural, no void):
- Wrestling ring: canvas, 3 rope levels, turnbuckles, 4 steel posts, apron skirt, ring steps
- Entrance ramp (14m) with light rails
- 3-tier dark seating bowl surrounding the arena
- Haze particles + exponential fog for atmosphere

## Lighting design

- **6 volumetric beams** (custom shader: soft silhouette edges, length falloff, animated density) — gold/white shifting to red/blue
- **4 moving spotlight heads** — animated targets, color chasing (gold → red → blue → white)
- **Crowd wash** — dim blue hemisphere, rises with excitement
- **Haze** — opacity ramps up as the show builds

---

## SHOT LIST

### Shot 1 — "Darkness" (0:00–0:05)
- **Camera:** Wide arena establishing, slow push-in. Position (-8→-6, 6→5, 14→12), look at (0, 2, 2).
- **Action:** Nothing moves. El Toro is not yet visible. Crowd is still (excitement 0.1).
- **Lighting:** Near-black. Ambient 0.015. Beams off. Only faint crowd silhouettes.
- **Environment:** Full arena visible but unlit — the space exists before the star arrives.
- **Narrative beat:** Anticipation. The owner liked the dark-to-bright fade — it's intentional, not a defect. The audience leans in.
- **Audio cue (for edit):** Arena ambience, low crowd murmur.

### Shot 2 — "The Walk" (0:05–0:14)
- **Camera:** Tracking shot beside the ramp. Position (5.0→4.0, 2.4→2.0, tz+4.5→tz+4.0), look at (0, 1.4, tz-1.5). Stays clear of seating (r<14).
- **Action:** El Toro walks down the 14m ramp toward the ring. **Procedural walk** — verified Mixamo axes, natural gait: legs swing ±22°, knees bend on stride, arms counter-swing, slight forward lean. Moves from z=17 to z=5.5. NO ballerina dancing, NO crossed arms, NO pirouettes.
- **Lighting:** Beams fade in (0→0.35 intensity). One gold spotlight follows him down the ramp. Crowd wash rises.
- **Environment:** Ramp light rails glow. Crowd begins to stir (excitement 0.1→0.5).
- **Narrative beat:** The reveal. This is the money shot — the monster's entrance. The walk must read as powerful and deliberate, not goofy.

### Shot 3 — "Power Stance" (0:14–0:22)
- **Camera:** Slow orbit around El Toro at ringside. Angle 0.5→2.0 rad, radius 6m, height 2.2m. Look at (0, 1.3, tz-0.5).
- **Action:** El Toro stops at ringside (z≈5.4, clear of the apron). Holds a strong stance — very slow procedural idle at 60% blend, weight shifting. He is sizing up the ring.
- **Lighting:** Beams pulse. Spotlights orbit him. Colors shift gold→red.
- **Environment:** Ring is now prominent in frame. Crowd excitement 0.6.
- **Narrative beat:** Tension builds. He's here, he's ready, he's looking at what's waiting for him.

### Shot 4 — "The Taunt" (0:22–0:26)
- **Camera:** Close-up. Position (2.2→1.8, 1.9→1.75, tz+3.2→tz+2.6), look at (0, 1.45, tz).
- **Action:** **REAL MOCAP — retargeted Kofi Kingston taunt** (not procedural). El Toro bends forward, head down, arms out — aggressive wrestling taunt. Rest-pose-relative retarget, verified natural.
- **Lighting:** Red wash intensifies. Beams at 1.6x pulse.
- **Environment:** Crowd going wild (excitement 0.8).
- **Narrative beat:** Character. This is who he is — not just a monster, a showman. The taunt tells the audience he's confident.

### Shot 5 — "The Rival" (0:26–0:30)
- **Camera:** Hard cut to the ring. Position (0, 2.8, -6.5), look at (1.2, 1.5, -1.0). Medium shot, clear of ring posts.
- **Action:** The Rival stands in the ring — dark silhouette, backlit, menacing idle. He has been waiting.
- **Lighting:** Rival is deliberately underexposed (silhouette). Red rim light.
- **Environment:** The ring is the stage now. Crowd excitement 0.8.
- **Narrative beat:** Stakes. El Toro isn't alone — someone is waiting for him. The promo now has a conflict, not just a showcase.

### Shot 6 — "The Confrontation" (0:30–0:46)
- **Camera:** Wide, slowly pushing in. Position (2.5→3.5, 2.8→2.0, 8.5→5.5), look at (0.3, 1.3, 2.0→0). Both fighters in frame.
- **Action:** El Toro steps up onto the ring canvas (y rises 0.96m during 0:33–0:36) and walks to the center. Both bulls face each other. Slow, deliberate — no rushing.
- **Lighting:** Full intensity. Beams at 0.5, all colors. Haze at maximum. This is the visual climax.
- **Environment:** Crowd at maximum excitement (1.0 → 0.9). The arena is electric.
- **Narrative beat:** The payoff. Two monsters, one ring. The audience knows a fight is coming.

### Shot 7 — "Title Cards" (0:46–0:50)
- **Camera:** Hold on the faceoff, slow fade.
- **Action:** Fighters hold position.
- **Lighting:** Hold, then fade to black.
- **Narrative beat:** Branding. Text overlay:
  - **"EL TORO DE ORO"** (gold, large)
  - **"ASHLANE"** (gray, smaller, below)
- **Deliverable text policy:** No placeholder text. Confirmed names only.

---

## Animation sources (per shot)

| Shot | Time | Animation | Source | Verified |
|------|------|-----------|--------|----------|
| 2 | 0:05–0:14 | Walk | Procedural (verified Mixamo axes, correct quaternion order) | ✅ Render |
| 3 | 0:14–0:22 | Power stance | Procedural slow idle, 60% blend | ✅ Render |
| 4 | 0:22–0:26 | Taunt | **Retargeted Kofi Kingston mocap** (J_→Mixamo, rest-pose-relative) | ✅ Render |
| 5 | 0:26–0:30 | Rival idle | Procedural slow idle, 40% blend | ✅ Render |
| 6 | 0:30–0:46 | Ring entrance + faceoff | Procedural walk 70% blend | ✅ Render |

**Banned:** Unverified procedural bone wiggling. Any new animation must be either (a) retargeted mocap with rest-pose correction, or (b) procedural with documented axis verification and a rendered proof frame. No exceptions.

## Known issues / stand-ins

1. **Opponent is a tinted clone**, not a distinct character — acceptable for this promo (reads as "shadow rival"), but a canon opponent should be cast for future videos once Cain's skinning is repaired.
2. **CMU walk mocap is unusable** — bone space mismatch (legs kick up behind). Do not use `cmu-bank.json` walk without re-retargeting.
3. **Screenshot render infra is flaky** — full 1200-frame renders time out intermittently. Proof via key shots + short clips until infra is stable.

## Template rule (going forward)

No promo video gets built without an approved storyboard in this format. Copy this file as `STORYBOARD_<CHARACTER>.md`, fill in every shot, get it reviewed, then render. The storyboard is the contract — if the render doesn't match the board, the render is wrong.
