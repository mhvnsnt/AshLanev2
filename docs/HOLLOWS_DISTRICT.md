# HOLLOWS DISTRICT — Design Brief

> Onyx's gang territory. The Painted faction's home ground.
> Owner direction (2026-10-05): really urban + castle-y + medieval feeling,
> Malakor atmosphere, modern HIGH graphics (never low-poly).

## 1. Identity

The Hollows district is where The Painted live — Onyx (leader), Theory,
Cipher, Echo, Hollow, Static, and their grunts/minions, who are heavily
present here. Canon territory per `docs/DARK_CLOWN_FACTION.md`: the abandoned
carnival grounds on the edge of the Warehouse District — rusted Ferris wheel,
collapsed funhouse, ticket booths turned into lookouts — plus surrounding
blocks and the tunnel approaches (`worldgen.ts` "Tunnels" district).

This is the gang's fortress and recruiting ground. Hollow recruits here.
The paint is the invitation.

## 2. Visual Identity — Urban Medieval

The fusion rule: **medieval forms, urban materials, street culture inside.**

- **Castle-y grey brick**: the owner notes castle-wall-looking grey bricks
  already exist around the city. In Hollows they dominate — arched doorways,
  buttressed walls, crenellated rooflines, narrow slit windows — but built
  from the same concrete, asphalt, and rebar as the rest of AshLane.
- **Carnival gothic**: rusted Ferris wheel silhouette on the skyline,
  collapsed funhouse facade, ticket booths as guard posts. Painted over —
  every surface carries the gang's paint.
- **Brutalist + gothic**: concrete tower blocks with pointed-arch windows,
  chain-link fences hung with painted masks, gargoyles next to AC units.
- **Verticality**: scaffolds, fire escapes, and catwalks stacked like
  battlements. The gang holds the high ground.

## 3. Malakor Layer (from docs/MALAKOR.md — owner's research)

Applied at **modern high fidelity**. Themes, not polygon counts:

- **Palette**: pitch black `#050508` × neon purple `#9d4edd`, deep blue
  `#1e3a8a`, toxic green `#39ff14`, with gold `#ffd700` and ice `#b8f0ff`
  accents. Implemented via the existing `src/game3d/malakor.ts` layer
  (full intensity in Hollows).
- **Slow, heavy atmosphere**: no fast cuts in the visual language — long
  shadows, slow-pulsing neon, drifting fog. Menacing, not chaotic.
- **Surrealist threat**: glowing eyes in dark alleys, skull motifs worked
  into signage, imposing painted figures staring from walls.
- **Literal asset mashups (street culture IN the models)**: gold chains on
  lampposts and statues, diamond-grill-style ice detailing on the big
  painted sun mural, styrofoam-cup props on ledges — the Malakor move of
  building the culture clash directly into the assets.
- **NOT magical**: urban glamour. The menace comes from the gang, the
  paint, the dark — not spells.

## 4. Territory Marking — How Onyx's Gang Marks the District

- **Paint tags** (existing worldgen): "HOLLOW", "THE QUIET", "IT SEES" in
  purple across brick and concrete.
- **Neon sigils**: the cracked-skull faction emblem as buzzing neon on
  key corners — visible from blocks away.
- **Mask walls**: painted and physical masks hung on fences and booths —
  Hollow's Super Dragon-style mask silhouette is the recurring icon.
- **Carnival iconography reclaimed**: Ferris wheel lit in purple at night,
  funhouse mouth painted as a screaming clown face, ticket stubs and
  flyers littering the ground.
- **Sound**: distant carnival music warping through the blocks at night
  (per faction doc — "you can hear the music from three blocks away").

## 5. Inhabitants

- **Grunts/minions heavy**: hooded streetwear + face paint (their mask),
  gold chains, painted jackets. They hold corners, lean on booths, watch.
- **Lieutenants present**: Cipher (loud, brash), Static, Echo, Theory —
  mini-boss encounters in their marked spots.
- **Hollow**: recruiter — appears where the paint is thickest.
- **Onyx**: endgame presence. Rarely seen; the district feels like her.

## 6. Specific Malakor Elements to Implement

1. Full-intensity `malakor.ts` layer on the district (already built —
   wire Hollows to full treatment).
2. Gold-chain material on select props/figures (`goldChainMaterial()`).
3. Ice/grill detailing on the central sun mural (`iceMaterial()`).
4. Eyes-in-the-dark pairs in tunnel mouths and alley ends.
5. Imposing painted silhouettes on the tallest walls.
6. Purple neon blade-signs with faction sigil.
7. Slow pulse on all accent lighting (0.25–0.45 Hz — heavy, never strobe).
8. ACES cinematic grade + vignette (already in malakor layer).

## 7. What Makes It Feel "Urban Medieval"

- Arches, battlements, and slit windows — built from concrete and brick,
  tagged and painted.
- The carnival as a ruined castle: Ferris wheel = watchtower, funhouse =
  keep, ticket booths = gatehouses.
- Street culture occupying medieval forms: gold chains on gargoyles,
  grills on murals, hoodies under battlements.
- Darkness as architecture: the black isn't empty, it's the walls.

## 8. Technical Hooks

- `src/game3d/worldgen.ts` — district def "tunnels"/Hollows; extend with
  carnival-ground sub-biome props.
- `src/game3d/worldgen-buildings.ts` — add arched/battlement facade
  variants for the district.
- `src/game3d/worldgen-streets.ts` — mask walls, chain props, cup/litter
  scatter; faction tags already present.
- `src/game3d/malakor.ts` — full-intensity layer; district mapping
  already includes Hollows.

## References

- `~/workspace/malakor-tiktok-refs/` — art-direction images
  (reference only, not game assets):
  - `swmg-art-1.jpg` — hooded figure, gold rings/chain, grill (mashup study)
  - `shadow-wizard-money-gang.png` — robed crew, streetlamp, purple night
    (urban + medieval in one frame)
- `docs/MALAKOR.md` — owner's Malakor research (primary source)
- `docs/DARK_CLOWN_FACTION.md` — Painted faction canon + territory
- `docs/MALAKOR_LAYER.md` — malakor.ts implementation

---
*Owner-approved direction only. No invented Malakor lore. Modern high
graphics throughout — Malakor themes, never low-poly.*
