# Environment Asset Harvest — Round 6

Owner directive (2026-10-06): higher-quality open-world environments — streets, sidewalks,
buildings, windows, lights, light emanation/reflection, textures (asphalt, concrete, dirt,
brick), props. Pull in open source, wire it in, don't just bookmark.

## WIRED IN (this round)

### CC0 PBR texture sets → `public/textures/env/`
| Set | Source | License | Maps | Used for |
|-----|--------|---------|------|----------|
| `asphalt_03` | Poly Haven (Baglioni/Barresi) | CC0 1.0 | diff, nor_gl, rough, ao @1k | Promo street, city roads |
| `concrete_floor_worn_001` | Poly Haven (Baglioni) | CC0 1.0 | diff, nor_gl, rough, ao @1k | Promo sidewalks/curbs |
| `red_brick_03` | Poly Haven (Savva) | CC0 1.0 | diff, nor_gl, rough, ao @1k | Promo building facades |

- Promo pipeline: `tools/promo-video/env-textures.js` (`asphaltMaterial`, `concreteMaterial`,
  `brickBuildingMaterial` + `windowGridTexture` emissive windows). Wired into
  `cinematic-faction.html` — street, sidewalks/curbs, brick facades with glowing windows.
  Servers (`render-frames.cjs`, `test-frames.cjs`) now serve `/textures/` and `/env-textures.js`.
- Game: `src/game3d/env-textures.ts` (`asphaltMaterial`, `concreteMaterial`, `brickMaterial`
  loading `/textures/env/...`); `src/game3d/city/world.ts` connector roads now use PBR asphalt.
- Verified: 12/12 textures load in headless render; screenshot-verified brick relief +
  emissive windows + asphalt grain. tsc clean.

## TEXTURE LIBRARIES (cataloged)

| Source | License (verified) | What | AshLane use |
|--------|-------------------|------|-------------|
| **Poly Haven** (polyhaven.com) | **CC0** — polyhaven.com/license: all assets CC0, commercial OK, no attribution, redistribution allowed | ~hundreds of PBR sets, 1k–8k, photoscanned | Primary texture source. API: `api.polyhaven.com/files/<name>` (needs User-Agent header). More sets to pull: `sidewalk`, `pavement`, `graffiti`, `metal`, `roof` |
| **ambientCG** (ambientcg.com) | **CC0 1.0** — docs.ambientcg.com/license | 2000+ PBR materials to 8k, broader catalog than Poly Haven | Backup/breadth source: dirt, grass, building facades, Ground081 dirt, Grass001 |
| 3DTextures.me | CC0 | PBR sets ≤4k | Secondary |
| Texture Ninja | CC0 | Photos only | Albedo reference |

## BUILDING / STREET / PROP MODELS (cataloged)

| Source | License | What | AshLane use |
|--------|---------|------|-------------|
| **Quaternius Downtown City MegaKit** (quaternius.com) | **CC0**, 315 modular Boston/NYC-style pieces, glTF | Buildings, streetlights, urban props, roads/sidewalks | **Top pick for game city props** — modular, game-ready, matches street-brawler scale. Pull streetlights, dumpsters, fences, storefront pieces |
| **KayKit City Builder Bits** (kaylousberg.com) | **CC0** | Buildings, roads, cars, street props | Already in use (crowd options); extend to street props |
| **Kenney city kits** (kenney.nl) | **CC0** (models), MIT (code) | City/roads/nature packs | Prototyping, background skylines |
| Poly Pizza (poly.pizza) | CC0/CC-BY per asset | Aggregated low-poly incl. Google Poly rescue | Quick prop variety |

## LIGHTING TECH (techniques, not just assets)

| Technique | Source | License | AshLane use |
|-----------|--------|---------|-------------|
| **UnrealBloomPass** (three/addons) | MIT (three.js) | Selective emissive bloom | Neon signs, lit windows, lamp glow — the "light emanation" the owner asked for. Next wire-in for promo + game |
| **Reflector** (three/addons/objects/Reflector.js) | MIT | Planar reflections | Wet asphalt mirror reflections — cheap, huge payoff for night streets |
| **SSRPass** (three/addons) | MIT | Screen-space reflections | Higher-end alternative if Reflector isn't enough |
| Emissive-carries-reflection trick | ektogamat/threejs-conference (check LICENSE) | — | Wet areas pick up neon via emissive × (1−roughness), no SSR pass needed |
| Volumetric-ish light cones | three.js examples (spotlight cone meshes, additive) | MIT | Streetlight pools, flickering fluorescent cones |
| Flickering fluorescents | trivial shader/uniform animation | — | Keep the owner's beloved flicker; drive via emissiveIntensity noise |

**Recommended promo lighting stack:** emissive windows/signs + UnrealBloomPass (threshold ~0.85) +
Reflector wet-street plane + flicker uniforms. **Game stack:** emissive + bloom only (mobile budget).

## PROCEDURAL CITY TOOLS (cataloged)

| Tool | License | What | AshLane use |
|------|---------|------|-------------|
| **achrefelouafi/BuildingGeneratorThreeJS** | MIT (333★) | Parametric building generator, three.js | Higher-quality building massing than current boxes |
| **vineetsharma96/nexuscity** | MIT | Procedural cyberpunk city; canvas-generated asphalt/concrete/window textures | Technique reference: their canvas PBR generators complement our photo textures |
| **beriki770-ship-it/werkstadt** (BuildingKit) | check repo LICENSE | Seeded buildings, 9 styles, LOD 0–2, night window emissive, instanced | LOD strategy + `setNight()` window glow pattern to steal |
| **catsjuice/random-city** | check repo LICENSE | Seeded city gen, Kenney CC0 models | Reference |
| threejs-towers skill (MengTo/Skills) | MIT | Parametric architecture vocabulary | Rooftop/civic landmarks |

## NEXT PULLS (queued)
1. UnrealBloomPass + Reflector into promo pipeline (after faction character fix lands)
2. Quaternius Downtown City MegaKit streetlights/props → `public/models/props/`
3. More Poly Haven sets: sidewalk/pavement, dirt, grass, graffiti wall, rooftop
4. ambientCG dirt/grass for outskirts/suburbs districts

## LICENSE LEDGER
All texture assets this round: **CC0 1.0** — commercial-safe, no attribution required,
redistribution allowed. No GPL/AGPL anywhere in this harvest. Pre-ship audit: re-verify
`quaternius.com` and `kenney.nl` asset pages before bundling models.
