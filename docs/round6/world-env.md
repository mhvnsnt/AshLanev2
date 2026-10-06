# Round 6 — World & Environment

Research-only harvest: interior asset packs, three.js weather, skybox generators,
road-network tools, graffiti/decal libraries, streetlight/signage packs,
subway/tunnel kits, rooftop detail packs, day/night cycle systems.
Skips (rounds 1–5): Kenney city kits, KayKit city/dungeon/restaurant, Icosa props,
Poly Haven, ambientCG, building-gen.py, OSM ingestion, SeedThree, Smithsonian/NASA,
Prelinger.

## procedural-weather-threejs (CK42BB)
- **URL:** https://github.com/CK42BB/procedural-weather-threejs
- **What:** Complete three.js weather skill: 12-state weather state machine (clear,
  cloudy, drizzle, rain, heavyRain, storm, lightSnow, snow, blizzard, fog, sandstorm,
  aurora) with smooth 2–3s parameter interpolation between states. GPU rain
  (LineSegments, wind-angled, ground splashes, wet-lens camera overlay), snow
  (Points, flutter/tumble/sparkle, frost overlay), exponential + ground fog,
  procedural branching lightning bolts with PointLight flash, dust/sandstorm,
  aurora, rainbow. WebGPU compute with WebGL2 vertex-shader fallback. All effects
  under 5 draw calls / ~100K particles.
- **License:** MIT — stated in README ("MIT — use freely in your projects").
- **Verdict:** commercial-safe
- **Notes:** Best-in-class drop-in weather brain for AshLane's districts. Pair with
  Open-Meteo (already wired, round 2) so in-game weather matches the player's real
  location. Works with three r170+; TSL path needs WebGPU-capable browser.

## threejs-conference (ektogamat)
- **URL:** https://github.com/ektogamat/threejs-conference
- **What:** WebGPU + three.js + TSL rainy cyberpunk alley demo with techniques
  directly portable to AshLane streets: GPU rain that respects rooftops and props
  (collision-height "hit" texture so rain splashes on geometry instead of falling
  through), wet pavement (ripples + planar reflection), neon billboards, cinematic
  post-processing, first-person exploration with BVH collision, rain-on-glass intro
  effect. README includes a "Replication recipe" for the collision rain.
- **License:** MIT License (per repo metadata; LICENSE file in root).
- **Verdict:** commercial-safe
- **Notes:** The collision-height rain technique is the key prize — rain that
  visibly strikes rooftops/awnings is a huge realism step for a city brawler.
  WebGPU-only path; AshLane targets WebGL2 fallback too, so port the height-texture
  idea rather than the code verbatim.
