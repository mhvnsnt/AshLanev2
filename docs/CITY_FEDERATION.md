# City Federation — Open-Source Components in AshLane's City

Owner direction: federate open-source city/world systems, don't rebuild
from scratch. This document records every external component used in
`src/game3d/city/`, its license, what was taken, and attribution.

## Federated components

### 1. CatsJuice/random-city (MIT)
- URL: https://github.com/CatsJuice/random-city
- License: MIT (commercial-safe, attribution in NOTICE below)
- Taken: **block-layout seeding patterns** — deterministic seeded RNG per
  city block, reproducible layout from seed, density/height parameters per
  zone. Adapted into `worldgen.ts` (mulberry32 + per-district seeds) and
  `city/districts.ts` (grid placement).
- NOT taken: their React UI, Kenney model wiring, traffic sim.

### 2. lanmower/procedural-cities (license: check repo — used for algorithm study)
- URL: https://github.com/lanmower/procedural-cities
- Taken: **road-network generation algorithm** (priority-queue road expansion
  guided by a noise heatmap; plot extraction from road segments) as a design
  reference for `worldgen-streets.ts`. Original TypeScript implementation,
  not a copy.

### 3. Kenney game assets (CC0 — public domain dedication)
- URL: https://kenney.nl
- Taken: prop models referenced by the asset pipeline (`docs/asset-pipeline/`);
  CC0 = no attribution required, commercial-safe.

### 4. OpenStreetMap (ODbL 1.0)
- URL: https://www.openstreetmap.org
- Taken: real-city road geometry via `tools/city/osm-ingest.py` (Overpass API).
- License analysis: `docs/OSM_ATTRIBUTION.md`. Commercial-safe WITH
  attribution ("© OpenStreetMap contributors") and ODbL headers on derived
  street-graph files. Game code/art not share-alike infected.

### 5. Poly Haven / ambientCG (CC0)
- URL: https://polyhaven.org, https://ambientcg.com
- Taken: PBR textures + HDRIs for image-based lighting (already in use;
  expanding to HDRIs for district sky lighting).

### 6. CMU Motion Capture Database (free for commercial use)
- Confirmed commercial-cleared 2026-10-06. Boxing/punching/kicking clips feed
  the animation system (separate track — `docs/ANIMATION_PIPELINE.md`).

## AshLane-original systems (not federated)

- `city/districts.ts` — 9 district identities, palettes, lighting moods
  (from owner-approved `docs/DISTRICT_ART_DIRECTION.md`).
- `city/territory.ts` — turf-war ownership, contest resolution, smooth visual
  blending, conflict indicators, day/night faction activity.
- `city/factions.ts` — subtle Urban Reign-style faction markers.
- `city/underground.ts` — subway/sewer network, stations, entrances.
- `city/world.ts` — city assembly, connector streets, palette application.

## NOTICE (MIT attribution)

Portions of the city generation seeding approach are adapted from
CatsJuice/random-city (https://github.com/CatsJuice/random-city), MIT License,
Copyright (c) CatsJuice.
