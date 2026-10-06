# AshLane Procedural World Generation

> "The environment tells you whose turf you're on before you see a single fighter."

## Overview

`src/game3d/worldgen*.ts` generates full playable districts procedurally at load.
Same seed = same district, every time. No hand-placed levels.

## Modules

| File | Purpose |
|------|---------|
| `worldgen.ts` | RNG, district definitions, main `generateDistrict()` API |
| `worldgen-textures.ts` | Procedural canvas textures (asphalt, brick, facades, graffiti, neon) |
| `worldgen-buildings.ts` | Building generator (facades, storefronts, fire escapes, signage) |
| `worldgen-streets.ts` | Street blocks, prop scattering, territory storytelling |
| `sky.ts` | **Per-district sky system** — gradient dome, sun/moon, stars, clouds, light rig |
| `env-assets.ts` | **CC0 asset registry** — Kenney + Quaternius GLBs organized by district |

## Districts

| District | Faction | Identity |
|----------|---------|----------|
| **The Alleys** | Ashes | Narrow brick canyons, fire escapes, graffiti everywhere, barrel fires |
| **The Strip** | Unaffiliated | Wide boulevards, neon signs, storefronts with awnings |
| **The Yards** | Combine | Industrial sprawl, chain-link, corporate signage, security cameras |
| **The Tunnels** | Hollows | Underground, flickering fluorescents, purple graffiti, wrongness |
| **The High Line** | Unaffiliated | Rooftops, AC units, water towers, skyline views |
| **Ember Park** | Unaffiliated | Trees, benches, paths, lamps |

Each district has distinct: street width, building style, prop distribution,
graffiti density, neon density, lighting color, fog, and faction storytelling.

## API

```typescript
import { generateDistrict, DISTRICTS } from "./worldgen";

// Generate a district (deterministic)
const d = generateDistrict("alleys"); // uses default seed
const d2 = generateDistrict("strip", 12345); // custom seed

// Add to scene
scene.add(d.group);

// Per-frame (flicker lights, flame animation)
d.tick(t, dt);

// Collision
import { hitsCollider, clampToDistrict } from "./worldgen";
if (hitsCollider(d, playerX, playerZ)) { /* blocked */ }
const [cx, cz] = clampToDistrict(d, x, z);

// Cleanup
d.dispose();
```

## World Storytelling

The environment communicates faction territory without UI:

- **Ashes (Alleys):** Orange/red graffiti tags ("ASHES", "EMBER", "RISE"),
  barrel fires, warm sodium lighting
- **Combine (Yards):** Blue corporate signage ("KENNEDY CORP", "SECURED BY KCS"),
  security cameras with red eyes, chain-link fences, hazard stripes
- **Hollows (Tunnels):** Purple tags ("HOLLOW", "THE QUIET", "IT SEES"),
  flickering green fluorescents, oppressive darkness
- **Strip:** Neon blade signs, colorful storefronts, commercial energy

## Textures

All procedural canvas textures — no external image dependencies:
- Worn asphalt with cracks and patches
- Brick with mortar and color variation
- Building facades with lit/unlit windows
- Concrete with water stains
- Spray-paint graffiti with drips and overspray
- Glowing neon signs
- Corporate plate signs

## Integration

**Streaming:** Works with `federated/streaming.ts` chunk system.
Generate one district per chunk, or one large district with sub-chunks.

**Sim:** Use `hitsCollider()` for building/prop collision,
`spawnPoints` for player/enemy/NPC placement.

**View:** Call `d.tick(t, dt)` per frame for animated elements.
Set scene fog from `d.group.userData.fog`.
The district sky travels with the group (`d.group.userData.sky`).

## Sky System (`sky.ts`)

Every district gets its own sky — not just fog color, but a full atmospheric
identity: gradient dome shader, sun/moon orb, star field, clouds, horizon glow,
and a complete light rig (hemisphere + key + rim).

| District | Sky | Feel |
|----------|-----|------|
| **The Alleys** | Hazy orange sodium glow, low sun | Perpetual late evening, warm |
| **The Strip** | Deep blue night, neon horizon bleed | Electric night, stars visible |
| **The Yards** | Cold grey overcast, hidden sun | Industrial noon, flat light |
| **The Tunnels** | Pitch black, purple + toxic green Malakor wash | Menacing, otherworldly |
| **The High Line** | Dawn/dusk gold, large low sun | Golden hour, open sky |
| **Ember Park** | Natural daylight blue, bright sun | Clear day, fresh |

API:
```ts
import { buildSky, applySkyLights, skyFor } from "./sky";

// Build and add to scene
const sky = buildSky("subway");
scene.add(sky.group);

// Per-frame (cloud drift, Malakor pulse)
sky.tick(t);

// Weather integration
sky.setDay(0.5); // 0=night, 1=noon

// Apply light rig to existing scene (view.ts integration)
applySkyLights(scene, "strip", { hemi, key: sun, rim });

// Cleanup
sky.dispose();
```

The sky dome follows the camera (position.copy in render loop).
Malakor accents (purple/green point lights) pulse slowly — heavy, not strobing.

**view.ts integration:** `applyStage()` now builds per-stage skies via
`STAGE_SKY` mapping (ward→alleys, dock→strip, pit→alleys, high→rooftops,
yard→warehouses, under→subway). The legacy inline fog overrides are kept
for ground-skin switching; the sky system handles all lighting.

## Environment Assets (`env-assets.ts`)

All CC0 environment GLBs organized by district. Kenney.nl (CC0) + Quaternius (CC0).
See `ASSET_LICENSES` in the module for source URLs.

```ts
import { DISTRICT_ASSETS, assetsFor, allAssetPaths } from "./env-assets";

// Get buildings for a district
const buildings = assetsFor("warehouses", "building");

// Preload everything
const paths = allAssetPaths();
```

| District | Key Assets |
|----------|------------|
| Alleys | Kenney buildings, Quaternius street pieces, streetlights, signs |
| Strip | Skyscrapers, 4-way intersections, streetlights |
| Warehouses | Industrial buildings, elevated streets, bridges |
| Tunnels | Underpass pieces (primarily procedural) |
| Rooftops | Skyscrapers, elevated streets, bridges |
| Park | Oak trees, bushes, rocks, fences, benches |

## Future

- [ ] CC0 GLB prop loading (`loadPropGLB` hook for street pieces)
- [ ] Interior lots for warehouses/park districts
- [ ] Subway tunnel geometry (currently surface-level)
- [ ] Rooftop interconnection (bridges between buildings)
- [ ] Day/night variants per district
