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

## BinaryConstruct Skybox Editor
- **URL:** https://github.com/binaryconstruct/skyboxeditor
- **What:** Free, fully client-side (TypeScript + React + three.js/WebGL2) stellar
  skybox editor at skyboxeditor.com — an open-source rewrite inspired by the
  original Spacescape (Alex Peterson, MIT). Layered nebulae, star fields, hero
  galaxies, positional suns/planets, and Schwarzschild-geodesic black holes,
  composited on a sky sphere. Exports game-ready cubemaps (PNG), equirectangular
  images, Radiance HDR, and OpenEXR. Deterministic seeded generation; project
  bundles are plain zips (project.json + sprites + preview).
- **License:** MIT (LICENSE file in root; © BinaryConstruct. Original Spacescape
  app © Alex Peterson, MIT; bundled flare textures/presets derive from the
  original distribution).
- **Verdict:** commercial-safe
- **Notes:** Author per-district night skies + menu/lore skyboxes (e.g. SWMG
  cosmic imagery) without AI generation or paid tools. Bake once to cubemap/HDR,
  ship the texture — no runtime dependency.

## procedural-stars-threejs (CK42BB)
- **URL:** https://github.com/CK42BB/procedural-stars-threejs
- **What:** Companion to the weather skill above: procedural night skies in
  three.js — starfields (2K–20K stars), Milky Way, nebulae, celestial phenomena,
  meteor showers. Sky mood presets (Pristine Mountain, Full Moon Night, Suburban,
  Meteor Shower, Deep Space, Fantasy). WebGPU compute with WebGL2 fallback.
- **License:** MIT ("MIT — use freely in your projects").
- **Verdict:** commercial-safe
- **Notes:** Use for the night side of the day/night cycle — crossfade from the
  Sky addon at dusk to this starfield at night. The "Suburban" preset fits
  AshLane's urban night (light-polluted, faint Milky Way); "Fantasy" for SWMG
  cosmic set-pieces.

## procedural-clouds-threejs (CK42BB)
- **URL:** https://github.com/CK42BB/procedural-clouds-threejs
- **What:** Third skill in the CK42BB teaching series: procedural three.js clouds —
  WebGPU raymarching with WebGL2 billboard/mesh fallbacks. Henyey-Greenstein phase
  scattering, Beer-Lambert + powder shading, silver linings, self-shadowing, and
  time-of-day palettes (peach dawn → purple twilight). Cloud genera reference:
  cumulus, stratus, cumulonimbus, cirrus, etc.
- **License:** MIT ("MIT — use freely in your projects").
- **Verdict:** commercial-safe
- **Notes:** Sky-dome cloud layer that reacts to the day/night cycle and weather
  state machine — storm clouds for the storm state, wispy cirrus for clear days.
  Gives AshLane's skyline depth without HDRI downloads (Poly Haven HDRIs are a
  skipped/covered source).

## procedural-cities roadGen.js (lanmower)
- **URL:** https://github.com/lanmower/procedural-cities
- **What:** Browser-based procedural city generator (three.js, live demo on
  GitHub Pages). The prize is `roadGen.js`: priority-queue road expansion guided
  by a simplex-noise heatmap — min-heap processes road candidates ordered by noise
  value, each accepted segment spawns forward continuation + left/right branches,
  main roads branch into main/secondary roads, loose ends extend to connect nearby
  roads. Companion `plotGen.js` extracts city-block polygons from the road network
  and `buildingGen.js` subdivides/extrudes plots. Faithful JS port of an Unreal
  Engine C++ implementation (master's thesis).
- **License:** MIT (stated in README).
- **Verdict:** commercial-safe
- **Notes:** roadGen.js is the missing piece for taking AshLane's city DEEPER:
  generate organic road networks procedurally per district, then feed the road
  graph into the existing building-gen.py block pipeline. Runs entirely in the
  browser — no server, no downloads.

## BlenderGIS (domlysz)
- **URL:** https://github.com/domlysz/BlenderGIS
- **What:** Blender addon bridging Blender and geographic data (9.4K stars):
  imports OpenStreetMap roads/buildings, terrain DEMs, basemaps, shapefiles,
  georeferenced raster into Blender scenes. The offline counterpart to the
  Overpass-API OSM ingestion already wired in round 2 — useful when API quotas
  bite or when an artist needs to hand-tune a district in Blender first.
- **License:** GPL-3.0 (LICENSE file in root; confirmed via GitHub repo metadata).
- **Verdict:** prototype-only (GPL-3.0 is viral — fails the owner's commercial
  license rule; keep quarantined out of the shipped codebase per standing policy)
- **Notes:** Use only as an offline authoring tool: import real-world street
  layouts in Blender, export clean geometry, ingest the GLB. Never link its code
  into the game or build pipeline. Note: download ONLY from the official GitHub
  repo — fake "blendergis.com" sites distribute malware.

## OpenGameArt Environment Decals (Savino)
- **URL:** https://opengameart.org/content/environment-decals-sign82usedpng?destination=node%2F152041
- **What:** CC0 environment decal pack — miscellaneous worn/used and clean signs
  as 2048×2048 PNGs (sign_82_used, sign_84_used, sign_46_used, sign_41_used,
  sign_38_clean, sign_80_clean, sign_84_clean, sign_59_clean, sign_05_used…).
  Grungy used variants fit AshLane's street-level urban art direction; clean
  variants fit commercial districts.
- **License:** CC0 (stated on each OpenGameArt page; authors agree to later
  license versions).
- **Verdict:** commercial-safe
- **Notes:** Project onto walls via three.js DecalGeometry (next entry) for
  graffiti-adjacent signage, posters, and worn storefront decals. Combine with
  the Google Fonts graffiti typefaces (already wired, round 2) rendered to canvas
  textures for custom faction tags.

## three.js DecalGeometry
- **URL:** https://threejs.org
- **What:** `three/addons/geometries/DecalGeometry.js` — projects a decal mesh
  onto arbitrary scene geometry (walls, ground, vehicles). The engine-side half
  of the graffiti/decal system: takes a position, orientation, size, and source
  mesh, and generates a clipped decal mesh that hugs the surface.
- **License:** MIT (part of three.js).
- **Verdict:** commercial-safe
- **Notes:** Core tech for the graffiti system: spray tags (canvas-rendered with
  Rock Salt / Rubik Spray Paint fonts), bullet holes, blood splatter, worn
  posters, faction turf markings — all as decals on the procedural buildings.
  Zero downloads, already inside AshLane's three.js dependency.

## OpenGameArt Neon Sign 2 (plaggy)
- **URL:** https://Opengameart.org/content/neon-sign-2
- **What:** CC0 3D neon sign — music/guitar-store neon sign with the sign texture
  included (background plate not included, easy to rebuild). 608KB zip.
- **License:** CC0 (stated on the OpenGameArt page).
- **Verdict:** commercial-safe
- **Notes:** Template for AshLane's district signage: swap the texture for
  canvas-rendered neon text (club names, bar names, faction tags in Bungee Shade
  / Bangers) and pair with UnrealBloomPass (already available, round 2) for the
  neon-district look. Neon is approved for ONE specific district per the owner's
  art direction — use sparingly elsewhere.

## Sketchfab "low poly street lamps collection" (woulfric)
- **URL:** https://sketchfab.com/3d-models/low-poly-street-lamps-collection-2c94ef2518904a219acea289e8fda159
- **What:** Set of 6 low-poly street lamps for small games/scenes, made in
  Blender, ~2K–4K faces each. Downloadable. (Also of note on Sketchfab: "Street
  Light" by Algirdas Lalys — 358 tris, CC-BY; "Street Light" by Pyrgen — modern
  UE5-made lamp, CC-BY.)
- **License:** CC-BY (Creative Commons Attribution, per Sketchfab page).
- **Verdict:** commercial-safe with attribution (CC-BY is permissive; credit the
  author in the credits file)
- **Notes:** building-gen.py already places simple streetlights; these give
  varied, textured hero lamps for key streets and plazas. Download via the
  Sketchfab channel already documented in round 2 (free account + OAuth token).
  Verify the CC-BY license on the page at download time — Sketchfab licenses are
  per-model.

## OpenGameArt Medieval Tavern Props Pack (System G6 / Qoma)
- **URL:** https://OpenGameart.org/content/medieval-tavern-props-pack
- **What:** 19 bar/tavern props (tables, mugs, barrels, etc.), 12–374 tris each,
  256×256–1024×1024 PNG textures, packed in a single .blend. Medieval styling,
  but the prop types (bar counter dressing, tankards, barrels, tables) transfer
  to a dive-bar interior with a texture pass.
- **License:** Unclear — no formal license on the page; author writes "You don't
  need to credit me, but if you like you can mention me as System G6 or Qoma."
  Treat as author-permission, not a standard license.
- **Verdict:** prototype-only (no standard license on file — re-verify with the
  author before ship)
- **Notes:** Interior props are the thinnest CC0 category found this round (bar/
  gym/club packs are overwhelmingly paid: CGTrader, Fab, ArtStation). This pack
  is a workable dive-bar dresser for prototypes. Harvest gap flagged: a proper
  CC0 modern bar/gym/club interior kit is still wanted.
