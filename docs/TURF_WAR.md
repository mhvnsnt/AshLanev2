# AshLane Turf War — Design & Implementation

**Status:** Implemented in `src/game3d/city/territory.ts`. GTA San Andreas turf
mechanics are inspiration only — this system is AshLane-original and the full
takeover mechanic is not final canon until the owner approves.

## Ownership model

Each district has a `DistrictTurf`:
- `owner` — current faction (`ashes | combine | hollows | authority | painted | unaffiliated | player`)
- `challenger` — attacking faction, if any
- `control` — 0..1, attacker's progress
- `blend` — 0..1, visual blend toward the current owner
- `pressure` — AI border-pressure accumulator

## How wars play out

1. **AI pressure:** rival factions bordering a district build `pressure`
   (scaled by their day/night activity). At 1.0 they attack.
2. **Contest:** attacker's `control` rises by activity-weighted rate;
   defender claws some back. At `control >= 1` ownership flips; at 0 the
   attack is repelled.
3. **Player capture:** `playerAttack(map, districtId, now)` — each attack
   pushes control +0.12 for the player's crew. Take a district by fighting
   there repeatedly.
4. **Day/night activity** (`factionActivity`):
   - Hollows: strongest at night (21:00–05:00)
   - Authority: strongest by day (08:00–18:00)
   - Ashes: strongest at dusk (16:00–22:00)
   - Combine: constant (money never sleeps)
   - Player: 1.2x always (the player is always dangerous)

## Visible ownership (never a pop)

Faction color is a **blend layer** over the district's own identity
(`docs/DISTRICT_ART_DIRECTION.md`), transitioning over ~5 seconds:

- **Fog tint:** district fog lerps 25% toward the owner color.
- **Ambient tint:** 15% toward the owner color.
- **Wash light:** faction accent light follows the owner.
- **Graffiti swap:** wall tags rebuild for the new owner; old layer
  crossfades out, new layer fades in. Authority cleans (graffiti → ~0);
  Ashes/Painted tag heavily.
- **Cleanliness:** grime overlay opacity from the faction's cleanliness
  (Combine 0.95 pristine … Ashes 0.25 scorched).
- **Contested:** challenger color bleeds into fog/wash by `control`;
  conflict indicators appear — drifting smoke columns, scorch decals,
  flickering work-light. Both factions' tags show on walls.

## Faction identifiers (Urban Reign law)

Members are NOT color-coded uniforms. Each faction has ONE subtle marker
(`src/game3d/city/factions.ts`):

| Faction | Marker | Worn as |
|---------|--------|---------|
| Ashes | charred cloth armband, scarlet | left upper arm |
| Combine | gold hexagonal lapel pin | left lapel |
| Hollows | carved bone charm, orange thread | neck cord |
| Authority | thin steel-blue shoulder stripe | right shoulder |
| Painted | paint-splatter wrist wrap | wrist |

`drawFactionPatch()` renders the marker as an SVG patch texture for NPCs.
Members otherwise dress as individuals.

## HUD

`game-bind.ts` → `turfHud()` feeds per-district `{ name, owner, contested }`
for the HUD. `attackHere(x, z)` lets the player attack the district they're
standing in.
