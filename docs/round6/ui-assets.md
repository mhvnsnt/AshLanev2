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

## 2. RPG Awesome
- **URL:** https://github.com/uaktags/rpg-awesome (maintained fork) · original https://github.com/nagoshiashumari/Rpg-Awesome · demo https://nagoshiashumari.github.io/Rpg-Awesome/
- **What:** 495 fantasy/RPG pictographic icons (swords, shields, potions, dice, skulls, armor) as a webfont + CSS toolkit — the game-flavored counterpart to neutral icon sets.
- **License:** Font **SIL OFL 1.1** · CSS/SCSS **MIT** · docs CC-BY 3.0 — per the repo's own License section ("Attribution is appreciated but not required"). Verified from README license block (checked 2026-10-06).
- **Verdict:** ✅ Commercial-safe (OFL font + MIT code).
- **Notes:** Purpose-built for game UI: faction symbols, move/skill icons, inventory glyphs, achievement badges. Mature/stable (feature-complete, low churn). Icon style is fantasy-RPG — use for move lists, faction emblems, and loot/gear UI; pair with Phosphor for neutral chrome.
- **AshLane use:** Move/skill icons, faction symbols, inventory glyphs.

## 3. Font Awesome Free
- **URL:** https://github.com/fortawesome/font-awesome · https://fontawesome.com
- **What:** 2,000+ free icons as SVG sprites, webfonts, and JS — the largest general-purpose icon set with a free tier (solid/regular/brands styles).
- **License:** **Icons CC-BY 4.0** (all .svg/.js) · **Fonts SIL OFL 1.1** (web/desktop fonts) · **Code MIT** — per the official README license section. Attribution required, but downloaded files carry embedded attribution comments, so normal use needs nothing extra (checked 2026-10-06).
- **Verdict:** ✅ Commercial-safe with attribution (CC-BY on the icons — add one line to credits/ATTRIBUTION.md; the OFL/MIT parts need no action).
- **Notes:** The free **brands** set covers social/share icons (Twitch/YouTube/Discord) for menu share buttons and streamer-mode UI. Solid style matches heavy street headers; `fa-burst`-style layered icons work for combo-counter badges. Heavier than Phosphor — cherry-pick SVGs.
- **AshLane use:** Social/brand icons, settings glyphs, share buttons, achievement badges.

## 4. Remix Icon
- **URL:** https://github.com/Remix-Design/RemixIcon · https://remixicon.com
- **What:** 3,000+ neutral-style system icons, every icon in `-line` (outline) and `-fill` (solid) variants. SVG, icon font, and framework packages.
- **License:** **Apache-2.0** — per the repo's `License` file ("free for personal and commercial use; mention appreciated but not required; icons are not for sale" — i.e. don't resell the set itself). Verified via upstream license file references (checked 2026-10-06).
- **Verdict:** ✅ Commercial-safe (Apache-2.0; keep the license notice with the icons).
- **Notes:** The line/fill duality maps perfectly onto menu active/inactive and HUD on/off states (e.g. `volume-up-line` vs `volume-up-fill`). Neutral geometric style takes the Concrete Jungle theme well (tint + texture does the work). Largest Apache-licensed set — good default when Phosphor lacks a glyph.
- **AshLane use:** Menu chrome icons, HUD toggles, settings glyphs (active/inactive pairs).

## 5. Xelu's Controller & Keyboard Prompts
- **URL:** https://thoseawesomeguys.com/prompts/ (official pack by Nicolae "Xelu" Berbece)
- **What:** 600+ button/key prompt icons — Xbox 360/One/Series, PS3/PS4/PS5, Switch Pro/Joy-Con, Steam Controller, plus full keyboard keycap sets. PNG (with light/dark variants) + SVG sources. The standard free prompt set used across indie games.
- **License:** **CC0 1.0 public domain** — the pack's bundled readme/LICENSE.txt states CC0, commercial use permitted, attribution optional. Confirmed by multiple downstream packagers shipping the unmodified LICENSE.txt (checked 2026-10-06).
- **Verdict:** ✅ Commercial-safe (CC0 — no attribution required).
- **Notes:** Critical for the remappable-controls work (R4 accessibility module): render the *detected pad's* glyphs (Xbox A vs PlayStation Cross vs Switch B are different buttons in the same position — see the position-not-letters rule). Keyboard keycaps cover the tutorial/tooltip layer. Light + dark variants theme with Concrete Jungle palettes.
- **AshLane use:** Input prompts, control-remap screen, tutorial tooltips, pause-menu legends.
