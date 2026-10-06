# Round 6 — UI Assets

**Rule (unchanged): only CC0 / public-domain / permissive (MIT/Apache-2.0/BSD/Unlicense/OFL/ISC) goes in the game build.** CC-BY allowed with written attribution. Everything below was license-checked at research time — re-verify before shipping.

Skips (rounds 1–5 / prior research): game-icons.net (CC-BY), Kenney UI packs + interface sounds, 13 OFL street fonts, lucide-react (ISC), shadcn/ui (MIT), motion / framer-motion (MIT).

AshLane menu direction ("Concrete Jungle"): street-art kit — graffiti logo, textured boxes, custom cursors, SVG decorations. Shadow Wizard Money Gang underlying, Tekken/Urban Reign overlying.

## 1. Phosphor Icons
- **URL:** https://github.com/phosphor-icons/core · https://phosphoricons.com
- **What:** 1,512+ SVG icons in 6 weights (thin, light, regular, bold, fill, duotone). Framework packages for React/Vue; raw SVGs importable individually.
- **License:** **MIT** — confirmed in repo-root `LICENSE`, Copyright (c) 2023 Phosphor Icons (Helena Zhang & Tobias Fried). Verified via multiple third-party license notices citing the upstream LICENSE file (checked 2026-10-06).
- **Verdict:** ✅ Commercial-safe (MIT, no attribution required — keep a notice line in credits anyway).
- **Notes:** The weight system is the killer feature for a street menu kit — same icon in thin (ghosted/disabled states) through fill (active states). Use for menu icons, HUD pictograms, settings glyphs, damage-type indicators. Pull individual SVGs, not the whole set.
- **AshLane use:** Menu/HUD iconography layer under the Concrete Jungle theme.
