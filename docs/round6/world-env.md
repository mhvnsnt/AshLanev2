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

## three.js official GPU rain/snow examples
- **URL:** https://threejs.org
- **What:** The three.js example set ships `webgpu_compute_particles_rain` and
  `webgpu_compute_particles_snow` — official GPU-compute particle demos for rain
  and snow. Snow uses static-geometry instancing with compute-driven flakes;
  rain uses the same compute-particle framework. Independently documented as
  MIT-licensed in third-party attribution files of downstream ports
  (e.g. takahirox/three-rs-wasm THIRD_PARTY.md cites the r186 MIT sources).
- **License:** MIT (three.js license covers examples).
- **Verdict:** commercial-safe
- **Notes:** Use as the canonical reference implementation when porting the
  CK42BB weather states or ektogamat rain into AshLane's pinned three.js version.
  Check which three revision AshLane pins — the compute examples track latest.

## threex.daynight (jeromeetienne)
- **URL:** https://github.com/jeromeetienne/threex.daynight/blob/HEAD/README.md
- **What:** Classic three.js day/night cycle extension: four modules driven by a
  single `sunAngle` — SunSphere (sun disc color/position), SunLight (directional
  light), SkyDome (sky color shifts), StarField (night stars). Dead simple API:
  create each, `scene.add()`, call `.update(sunAngle)` per frame. Old (pre-ES6,
  bower-era) but tiny and easy to modernize.
- **License:** MIT — per the author's stated convention across all threex.*
  modules ("It is released under MIT license" appears in threex READMEs); note
  this repo has no LICENSE file, so re-verify before ship.
- **Verdict:** commercial-safe (with the no-LICENSE-file caveat above)
- **Notes:** Reference design for wiring sun angle → sky + light + stars in one
  place. Pair with SunCalc below for astronomically correct sun positions; use
  three.js Sky addon for prettier skies.

## SunCalc (mourner)
- **URL:** https://github.com/mourner/suncalc
- **What:** Tiny (~2KB) JS library for sun/moon position, sunlight phases
  (sunrise, sunset, dawn/dusk/twilight times), and lunar phase for any
  lat/long + date. `SunCalc.getPosition(time, lat, lng)` → altitude/azimuth.
  The standard astronomy math behind countless day/night systems.
- **License:** BSD-2-Clause (confirmed via multiple downstream ASSETS/LICENSE
  manifests citing mourner/suncalc as BSD-2-Clause).
- **Verdict:** commercial-safe
- **Notes:** Feed its altitude/azimuth into the three.js sun light + Sky addon
  uniforms for a real-time day/night cycle that matches the player's actual
  location and time. Also usable for gameplay: night-only missions, shop hours.

## three.js Sky addon (Preetham atmospheric scattering)
- **URL:** https://threejs.org
- **What:** `three/addons/objects/Sky.js` — physical sky shader (Preetham et al.
  analytic skylight model) with sun position, turbidity, rayleigh, mie
  coefficients, and elevation/azimuth uniforms. The standard three.js dynamic sky;
  pairs with PMREMGenerator for image-based lighting that follows the sun.
- **License:** MIT (part of three.js).
- **Verdict:** commercial-safe
- **Notes:** The visual core of the day/night cycle: drive its sun-position
  uniform from SunCalc, lerp turbidity/rayleigh for dawn/dusk color, and
  regenerate the PMREM environment at intervals so PBR materials track the sky.
  Zero asset downloads — pure shader.
