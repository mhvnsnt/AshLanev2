# Malakor Visual Layer — Implementation

> Built 2026-10-05. Underlying atmosphere, not a replacement.
> Owner corrections honored: MODERN HIGH graphics (no PS1/low-poly/retro),
> HIGH GRAPHICS + MOBILE OPTIMIZED.

## What was built

**`src/game3d/malakor.ts`** (new) — the complete layer:
- `MALAKOR` palette: pitch black `#050508`, neon purple `#9d4edd`, deep blue
  `#1e3a8a`, toxic green `#39ff14`, gold `#ffd700`, ice `#b8f0ff`
- `MalakorLayer` class: owns accent lights, fog retint, pulse, eyes, silhouettes
- Per-stage intensity: `under`=full (2), `ward`/`dock`/`pit`=subtle (1), `yard`/`high`=off (0)
- Per-district mapping for worldgen: `subway`=full (Hollows), `alleys`/`strip`/`warehouses`=subtle
- Slow pulse (0.25–0.45 Hz breathing glow — never strobing)
- Eyes-in-the-dark: emissive pairs, slow opacity drift, full-intensity only
- Imposing silhouettes: tall dark figures with purple rim at arena edges
- `goldChainMaterial()` / `iceMaterial()`: high-fidelity PBR (metalness/roughness)
- `neonSlabMaterial()`: unlit neon (reads as glow for free)
- `addMalakorProps()`: gold-trimmed barriers + neon totems, seeded placement
- `applyMalakorGrade()`: ACES filmic tone mapping (modern cinematic)
- `addMalakorVignette()`: CSS radial vignette (zero WebGL cost)

**`src/game3d/view.ts`** — wiring:
- `MalakorLayer` created in `createView` (mobile-aware via coarse pointer)
- `malakor.setStage(id, fog)` in `applyStage()`
- `malakor.tick(sim.time)` in render loop (skipped in reduced mode)
- `malakor.dispose()` in dispose
- Seeded `mulberry(1337)` PRNG for deterministic prop placement

**Also ported** (were missing, sim.ts imports them):
- `src/game3d/services.ts` — GameServices hub (was breaking the build)
- `src/game3d/overlays.ts` — touch/dialogue/minigame DOM UI

## Mobile optimization
- Phone: 3 accent point lights + 1 wash. Desktop: 6 + 2.
- Emissive materials + fog carry glow feel (no extra lights needed)
- Shared geometries/materials for props (no per-prop texture cost)
- Zero per-frame allocations in tick()
- Frustum culling default on; vignette is CSS-composited

## What was NOT done (per owner)
- No low-poly / PS1 / retro rendering / pixelation
- No gameplay changes
- No district replacements
- No "magic" — urban glamour only
- No invented Malakor lore beyond docs/MALAKOR.md
