# Stage Destruction Teardown — Tekken / Yakuza / Urban Reign

How the reference games do interactive, breakable environments — and what AshLane adapts.
Mechanics described in our own words for original implementation. No proprietary code or assets reproduced.

Sources: Tekken Wiki (Balcony Break, Floor Break, Wall Break, Wall Bound, Wall Blast),
gamingbolt.com Tekken 8 guide, Yakuza Wiki (Heat Actions), Steam community Yakuza guides.

---

## 1. Tekken — the stage-gimmick system (T6 → T8)

Tekken treats stage destruction as a **combo-extension economy**: breaks don't just look cool,
they hand the attacker more damage. Key design rules:

### Floor Break
- Trigger: slamming the opponent **down into** a marked floor section (bounce/slam moves).
- T6: only specific floor zones. **T7+: can trigger anywhere on the floor** of marked stages
  (except special cases like Pac-Pixels, center-only).
- Effect: both fighters drop to the lower level; the victim lands in a **Bound-like state**
  so the attacker can continue the combo. (T6 beta grounded them immediately — changed because
  it killed the reward.)
- T8 adds **Hard Floor Break**: needs **two** hits instead of one (Heat Smash can do it in one).
- Restriction: after a Floor Break, Wall Bounds and Floor Blasts **cannot** occur — the
  gimmick budget is spent.

### Balcony Break (introduced TTT2)
- Trigger: knocking the opponent **through a balcony/railing**. Shares the trigger with Wall Break.
- Victim falls to the lower floor in a Bound state. Attacker follows down and lands in front.
- Angle matters: side/back hits change where the victim lands.
- Certain throws can trigger it. Cannot co-occur with Floor Break on the same stage.

### Wall Break
- Trigger: wallsplat-level impact against a marked wall section.
- T8 adds **Hard Wall Break**: two hits (or one Heat Smash). Victim is thrown **away** from the
  attacker and lands Bound, attacker rushes in.
- Wallsplat KO does **not** trigger a break (no reward for a dead opponent).

### Wall Blast / Wall Bound (T8)
- **Wall Blast**: heavy blow on a wallsplatted opponent → explosion launches them **up**,
  feet-forward on their back, always the same orientation regardless of entry angle.
  +5 damage. Combo continues.
- **Wall Bound**: like Wall Blast but sends the opponent **behind** the attacker. +5 damage.

### Camera & staging (observed)
- Breaks trigger a brief **camera pull / slow-down beat** so the player reads the transition.
- The lower level is a **fully staged second arena** — different lighting, different walls.
  Stages chain: Balcony Break → lower level → Floor Break → even lower (e.g. Ortiz Farm:
  balcony → floor → 8 wall bounds).
- Gimmicks are **one-shot per match** (per level) — once broken, that section stays broken.

### What AshLane adapts
- Break = combo reward, not just spectacle. Victim lands in a juggleable state.
- Marked weak sections (visual telegraph: cracked floor, damaged railing).
- One-shot per fight; lower level is staged, not empty.
- Camera beat on the break so it reads as an EVENT.

---

## 2. Yakuza — environmental heat actions

Yakuza's approach is **positional finishers**, not combo extensions:
- **Trigger**: grab opponent + Heat gauge filled + near a marked environmental feature
  (wall, car, railing, shop sign, bike rack...).
- **Weapons have durability**: each weapon lasts N hits; Heat Actions cost only 1 durability,
  which makes weapons worth carrying. Broken pieces can become new weapons.
- **Wall/fence/river**: dedicated heat actions per feature type (Wall Crush, Fence Crush,
  Riverfall...). The environment is a **move list**.
- **Thrown through doors**: Dragon Engine lets fighters crash through doors/windows into
  new areas — the fight space expands mid-combat.
- Design lesson: the environment should read as **a second moveset**. Players learn
  "near wall + heat = special" the way they learn combos.

### What AshLane adapts
- Door/window crashes that open new space mid-fight (our door system already breaks —
  extend to room transitions).
- Weapon durability economy (our props break; add the durability counter).
- Environmental finishers keyed to features (wall, car, railing).

---

## 3. Urban Reign — multi-area stages

- Stages are **multi-room**: fights flow through doorways between areas; enemies hold
  positions per area (see AI_BEHAVIOR_TEARDOWN.md).
- No scripted destruction — the interactivity is **spatial**: using the whole floor plan,
  weapons scattered per area, chokepoints.
- Design lesson: connected areas with distinct identities beat one big room.

---

## 4. AshLane implementation map

| Gimmick | Sim support | View support | Status |
|---|---|---|---|
| Weak walls (break → open) | `crack()` + `role:"weak"` | mesh hides on `"open"` | DONE |
| Door open on approach | `updateDoor()` | slides via `sim.door` | DONE (needs visual verify) |
| Door break (2 hits) | `doorHits`/`doorBroke` | slides fully open | DONE |
| **Breakable floor (proof arena)** | **NEW: weak `plat` + impact crack** | **mesh hides; lower level staged** | **THIS TASK** |
| Doorway room transitions | extend door zones | second room staging | queued |
| Weapon durability | extend prop hp | — | queued |

### Breakable floor spec (proof arena)
1. Upper `plat` box with `role: "weak"`, hp 1, at height H (e.g. 3m) over a lower area.
2. Trigger: body lands on the weak plat with **impact** — downward velocity below
   threshold (e.g. vy < -9) OR body in `slam`/`launch` state from a throw.
3. On break: `crack()` → kind `"open"` → mesh hides → both bodies fall to y=0.
   Victim gets a brief juggleable window (attacker reward, Tekken-style).
4. One-shot per fight. Banner + shake + sfx on break (already have all three channels).
5. Camera: the existing fight camera follows y — verify it tracks the drop.

---

## 5. Arena roster design (owner's vision)

Each arena gets **one environmental gimmick** as its identity:

1. **The Foundry** (proof arena) — breakable mezzanine floor over the furnace pit.
   Weak section marked with cracked-plate texture + flickering hazard light.
2. **Rookery Ruins** — castle-like ruins; **balcony break** off the collapsed gallery
   into the courtyard below.
3. **The Tenement** — abandoned run-down apartments; **wall breaks** between rooms,
   doors that open on approach, working stairwell doorway.
4. **The Docks** — **floor blast** variant: weak cargo-hatch covers over the hold.
5. **The Subway** — no breaks; gimmick is the **train doorway** (timed door + passing train
   hazard) — queued.

Gimmick rule: one per arena, telegraphed visually, one-shot per fight, always a
combo reward — never a random event.
