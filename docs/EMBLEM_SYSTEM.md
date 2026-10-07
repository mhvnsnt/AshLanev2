# ASHLANE EMBLEM SYSTEM

> Player-selectable emblems for profiles, menus, and customization.
> Owner directive (2026-10-05): Save the SVG icon style — he likes them and wants more in the same style.

## What This Is

The emblem system provides proprietary SVG icons that players select as their personal emblem/logo. Used in:
- Player profile header
- Character select (next to fighter name)
- Leaderboards / VS screens
- Menu decorations

## The Style Guide

### How They Were Made

All emblems are **hand-built SVG** — no AI generation, no external assets, no icon libraries. Each is drawn as raw SVG path data in React components (`src/game3d/menu-icons.tsx`).

**Design principles:**
1. **Bold silhouette first** — each emblem reads at 16px. If it doesn't work tiny, it doesn't work.
2. **2-3 colors max** — faction gradient (primary → secondary) on dark `#140d08` background
3. **Circular badge format** — 48×48 viewBox, 22px radius circle, 2.5px stroke
4. **Concrete Jungle palette:**
   - Ashes: fire orange `#ff7a4d` → deep red `#a83215`
   - Combine: steel blue `#4a90d9` → dark navy `#1a2b4a`
   - Hollows: toxic purple `#9d4edd` → black `#0a0a0a`
   - Painted: clown red `#ff2e4d` → white `#f5f0e8`
   - Authority: badge gold `#f0b429` → bronze `#8a6d1a`
   - Unaffiliated: coin silver `#c0c0c0` → grey `#6a6a6a`

### The 6 Faction Emblems

| Faction | Symbol | SVG Approach |
|---------|--------|--------------|
| Ashes | Flame | Layered bezier paths — outer flame + inner cutout for depth |
| Combine | Corporate shield/tower | Geometric shield outline with horizontal bar details |
| Hollows | Cracked skull | Ellipse cranium + rect jaw + circle eye cutouts + crack accent |
| Painted | Clown mask | Ellipse face + dot eyes + exaggerated smile path + red nose |
| Authority | Police badge star | 5-point star polygon + center circle cutout |
| Unaffiliated | Coin | Circle + vertical slash + horizontal marks (dollar nod) |

### The 10 Fighting Style Icons

Stroke-based (not filled), gold `#f0b429` on transparent, 32×32 viewBox:
- **Boxing**: glove shape (rounded rect + thumb curve + wrist lines)
- **Kickboxing/Muay Thai**: boot profile (L-shape + sole lines)
- **Wrestling/Grappling**: two interlocking arm curves + center dot
- **MMA**: octagon polygon + cross mark
- **Lucha**: mask shape (rounded top + eye holes + mouth curve)
- **Capoeira**: spinning kick arc (bezier + arrowhead + pivot dot)
- **Karate**: open hand chop (vertical rect + finger lines)
- **Street**: brass knuckles (3 circles + bar)
- **Fallback**: clenched fist

### The 12 Menu Navigation Icons

Minimal line icons, `currentColor` stroke, 24×24 viewBox, 2px stroke, round caps:
story (book), fight (two figures), trophy (cup), gear (settings), map, user, music (notes), back (chevron), lock, check, flame

### The ASHLANE Logo

Graffiti/street wordmark:
- Fire gradient text (`#ff7a4d` → `#e4572e` → `#a83215`)
- Hazard stripe underline (rotated -2°, alternating orange/black chevrons)
- Spray splatter accents (ellipses + circles, 55% opacity)
- Optional glow filter (feGaussianBlur + merge)
- "CONCRETE JUNGLE" tagline in steel gradient

## Making More Emblems in This Style

### Step-by-step for new faction emblems:
1. Start with the badge template: 48×48 viewBox, dark circle bg, gradient stroke
2. Pick 2 colors (primary → secondary) for the gradient
3. Draw the symbol with 3-5 SVG primitives (path, ellipse, circle, rect, polygon)
4. Use cutouts (dark `#140d08` shapes) for eye holes, inner details — creates depth without extra colors
5. Test at 16px, 40px, and 120px — must read at all sizes

### Step-by-step for new style icons:
1. 32×32 viewBox, transparent background
2. Gold `#f0b429` stroke, 2px width, `fill="none"`
3. Single recognizable silhouette (glove, boot, mask, etc.)
4. 2-4 path elements max — simplicity is the style

### Code location
All components in `src/game3d/menu-icons.tsx`:
- `<AshlaneLogo />` — main wordmark
- `<FactionEmblem faction="..." />` — 6 faction badges
- `<StyleIcon style="..." />` — 10 fighting style icons
- `<MenuIcon name="..." />` — 12 nav icons

### Player selection
Emblems are selectable in the Customize suite (`src/components/ashlane-app.tsx`).
Selected emblem stored in player profile state, displayed in menu header.
See "Emblem Picker" section in ashlane-app.tsx.

---
*Style established 2026-10-05. Owner-approved. Extend, don't replace.*

---

## Art Emblems (2026-10-07 — art-wiring)

The SVG system above stays (owner-approved, "extend don't replace"). Added alongside it:
**38 sliced PNG emblems** from the canon faction-emblem sheets, wired via
`src/game3d/ui-art.ts` (`EMBLEMS`) and rendered by `EmblemImage` /
`EmblemPickerGrid` in `src/components/ui-art-components.tsx`.

### The 32 canon emblems

| Sheet | Emblems (ids) |
|-------|---------------|
| 1 — AshLane core | `ashes`, `combine`, `hollows`, `dynasty-authority`, `halcyon-kennedy`, `kennedy-security` |
| 2 — AshLane extras | `unaffiliated`, `onyx-crew`, `circuit`, `old-guard`, `pit`, `hollow-points` |
| 3 — wrestling companies | `awe`, `jpcw`, `nwc`, `lucha-temple`, `slaughterhouse`, `hollywood` |
| 4 — book factions | `corporate-structure`, `dynasty`, `resistance`, `sanctuary`, `straight-shooters`, `iron-directorate` |
| 5 — book factions 2 | `administration`, `gallery`, `noise`, `temple`, `pit-jack-slade`, `agents-of-chaos` |
| 6 — book factions 3 | `independent-variables`, `gamer-regime` |

Sheet order was confirmed by visually reading each sheet (row-major).
The two Pits are distinct canon entries: `pit` (wrestling-factions) and
`pit-jack-slade` (Book 5, Jack Slade's Pit) — never merged.

### The 6 generic emblems

`generic-wizard-hat`, `generic-crown`, `generic-dice`, `generic-skull`,
`generic-dragon`, `generic-moon` — from menu-kit sheet 28. These stay
**generic and unassigned** by owner directive: selectable as personal/menu
emblems, never attached to a canon faction.

### Canon rules (hard)

- Names come only from `FACTION_CATALOG.md` — never invented.
- Onyx's group is "Onyx's Crew" / "Onyx's crew" — never "gang", never "The Painted".
- "Corporate Authority" does not exist — never used.
- Slicing: `~/workspace/art-wiring/slice-emblems.py` (circular crop, transparent WebP → `public/emblems/`).
