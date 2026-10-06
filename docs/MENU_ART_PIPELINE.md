# AshLane Menu UI Kit — Generative Art Pipeline

> How to make menu art for AshLane, end to end: the layering formula, the style rules,
> the SVG kit, screenshot rendering, AI prompt templates, fonts, SWMG recipes, and the
> ship workflow. Written for the owner to skim and for an agent to execute.
>
> Last updated: 2026-10-06 (v3 shipped: menu-theme.css rewritten, 7 new SWMG
> components added, fonts wired via Vite bundle — see §3d). Anything I couldn't
> verify is listed in **§7 Open Questions**.

---

## 1. Purpose + the layering formula

AshLane's menu art is built on one owner-set formula (from `docs/ART_DIRECTION.md`
in the ashlane-env2 workspace). Every new piece of menu art — a background, a button,
a character card, a loading screen — must follow it:

| Layer | Theme | What it contributes | Where it lives |
|---|---|---|---|
| **UNDERLYING** (the world) | **Malakor + Shadow Wizard Money Gang (SWMG)** | Atmosphere, mood, lore. Pitch black × neon purple/blue/toxic green + gold. Dark streets, fog, lighting. SWMG cues: hooded figures with faces buried in black (only tiny sparkly white eye glints), gold-chain motifs, diamond-grill murals, spellbook-style graffiti with street slang, "wizards of the street" energy — **NOT literal fantasy**. | Menu backgrounds, decorative art, lighting, fog |
| **OVERLYING** (the presentation) | **Tekken + Urban Reign** | Character presentation, combat, MENU language. Bold character cards, high-energy fighter-select energy, gritty comic-book city, gang tags. | Character select, menus, buttons, HUD, combat UI |

**The formula in one sentence:** Tekken/Urban Reign presentation sitting on top of a
Malakor/SWMG-shadowed world. Malakor is the world you walk through; Tekken/Urban Reign
is how you fight in it.

### How to apply it to any new piece

1. Start with the **world layer**: pitch-black base, fog, one SWMG accent (purple rim
   light, green glow, gold chain motif, eye glints in a dark hood). This is the canvas.
2. Put the **fighter language on top**: bold card with thick borders, sticker-tag
   typography, graffiti annotation, caution-tape or chain-link framing. This is the UI.
3. Sanity check: cover the UI elements with your hand. If what's left looks like a dark
   neon-shadowed street (SWMG), the layering is right. Cover the background instead —
   the UI alone should still read as a fighting-game menu.

---

## 2. Style guide

### Palette (v3)

Default menus stay **grounded street + SWMG shadow**. Neon green/purple/gold/blue is
**ONLY for the Neon District** — never the default menu.

| Swatch | Hex | Name | Use |
|---|---|---|---|
| ⬛ | `#0a0910` | pitch black | base background, shadows, panel fill |
| 🟥 | `#c1121f` | blood red | **fight accent** — primary CTA, tag emphasis, danger |
| 🟨 | `#d4af37` | worn gold | chains, prestige, borders, SWMG accents |
| 🟪 | `#7b2ff7` | neon purple | SWMG magic glow, fog, Neon District only |
| 🟩 | `#a3e635` | toxic green | SWMG magic glow, Neon District only |
| ⬜ | `#8a8580` | concrete gray | metal, secondary text, borders |
| ⬜ | `#e8e0d0` | chalk | primary text, graffiti white |

V3 repaint notes (shipped 2026-10-06 in `src/game3d/menu-theme.css`): old orange
tokens (`--color-ember #e4572e`) are now **blood red `#c1121f`**; brass is worn
gold `#d4af37`; neon is toxic green `#a3e635`; new tokens `--color-wizard #7b2ff7`
and `--color-arcane #4d9de0`. Class names are unchanged (`al-*`); the v2
`--lane-*` tokens in the deleted `street-theme.css` were superseded. Class-name
references in this doc are verified against the final v3 file.

### Type system

13 OFL fonts in `tools/promo-video/fonts/` (one dir per family, TTF only — see
license note in §7). Wire via `@font-face` (pattern in §3d).

| Font | Role | Example use |
|---|---|---|
| **Rubik Spray Paint** | Display / logo-adjacent | Game title, big headers |
| **Anton** | Headline (Tekken bold) | Section heads, big numbers, "ROUND 1" |
| **Bangers** | Comic punch | Punchy headlines, button labels |
| **Black Ops One** | Stencil labels | Job labels, stamps, "JOB 07 // DOCK" |
| **Permanent Marker** | Tag annotations | Graffiti notes, "watch your back" |
| **Rock Salt** | Spellbook scratch | SWMG spellbook graffiti, whispers |
| **Inter** | Body | All readable UI text |

Spare bench: **Archivo Black, Bebas Neue, Bungee Shade, JetBrains Mono, Russo One, Rye**
— use only if a specific job needs them; default menu stays on the seven above.

### Texture / material language

Use these materials in this priority order: **concrete** (panels, cards), **spray
paint** (accents, logos, dividers), **tape** (chips, labels, corners), **chain-link**
(overlays, backgrounds), **diamond grill** (SWMG prestige borders, murals), **gold
chain** (SWMG wealth/energy motifs), **halftone dots** (Urban Reign comic-book shading).
Grime, worn edges, overspray everywhere — nothing looks factory-new.

### What to avoid

- ❌ Generic flat mobile-menu aesthetics — every surface needs texture or an accent.
- ❌ Orange gradients — banned; the fight accent is **blood red**, not orange.
- ❌ Cyberpunk/Tron neon-everything — neon is gated to the Neon District only.
- ❌ Matching single-color faction uniforms — Urban Reign style: patches, armbands,
  small accents, symbols, not color-coded suits.
- ❌ Third-party game branding in art (a "Tekken 8" text slipped onto a portrait once —
  strip it wherever you see it).
- ❌ Fantasy-wizard literalism in SWMG art — hooded figures, eye glints, gold chains,
  spellbook slang. No pointy hats, staffs, or D&D vibes.

---

## 3. Tooling pipeline

### (a) Hand-built SVG components — `src/game3d/street-kit.tsx`

The core kit: pure-SVG components, no external assets, theme-aware via CSS vars /
props. This is where ALL structural menu art lives. Street set + SWMG set
(shipped 2026-10-06: `EyeGlints`, `GoldChain`, `DiamondGrill`, `HoodedFigure`,
`SpellbookTag`, `WizardGlyph`, `LaneBackdrop`).

**Conventions for adding a new component:**

1. **Props pattern:** `className` (always), `color` (default = a v3 palette token),
   plus behavior props (`variant`, `angle`, `seed`, `position`, `direction`,
   `flip`, `text`, `label`) — see the catalog in §4. Numeric variation uses
   deterministic `seed` (LCG-style pseudo-random, never `Math.random()` without a
   seed) so art is stable across renders.
2. **viewBox discipline:** declare an explicit `viewBox` sized to the art
   (e.g. `0 0 680 200` for wide, `0 0 80 80` for square). Use
   `preserveAspectRatio="none"` only for full-bleed stretchers (TornEdge,
   CautionTape), `xMidYMid slice` for texture tiles (BrickWall).
3. **No external assets:** everything is inline SVG — filters, patterns, turbulence.
   Fonts only via the family name (Rubik Spray Paint etc.); assume the game wires
   them via `@font-face`.
4. **Filter IDs must be unique per instance:** use `useId()` (strip colons) and
   suffix filter/pattern IDs, e.g. `id={`spray-${uid}`}`. (Existing caveat: ChainLink's
   `pattern id="chainlink-pat"` is NOT uniquified — if you render two ChainLinks,
   fix that to match the convention.)
5. **Accessibility:** real text-bearing art gets `role="img"` + `aria-label`;
   decoration gets `aria-hidden="true"`.
6. **Style header:** add a section comment block naming the component, what it is,
   and any aesthetic constraints (e.g. "NOT cyberpunk").

### (b) Headless Chromium SVG→PNG rendering

Use for: menu background plates, card art, logo exports, anything that needs a PNG.
Existing preview-harness pattern lives at `~/workspace/street-kit/` (`preview.html`,
`font-test.html`, `logo-test.html` + their PNGs).

**Recipe:**

1. Build an HTML harness page: one `<svg>` (or a component collage) per page,
   `@font-face` pointing at the absolute TTF paths
   (`~/workspace/game-sweep/AshLanev2/tools/promo-video/fonts/<Family>/<File>.ttf` —
   see `preview.html` for the exact pattern), the relevant palette tokens as CSS.
2. Transparent backgrounds: set `body { background: transparent }` (harness CSS
   defaults to dark — override it), and don't paint a rect behind the art.
3. Render at 2x/3x:
   ```bash
   chromium --headless --disable-gpu --screenshot=/tmp/menu-art.png \
     --window-size=1600,900 file:///home/hatch/workspace/street-kit/harness.html
   # For 3x: --window-size=2400,1350, or --force-device-scale-factor=2
   ```
4. Verify by reading the PNG back — SEE, don't guess.

(§7: `chromium` was not on PATH in this sandbox — confirm the binary name
`chromium` / `chromium-browser` / `google-chrome` / the `agent-browser` CLI before
running in this environment.)

### (c) AI image-generation prompts — photographic / menu-background art

AI art is for **atmospheric backgrounds, murals, banners, loading screens** —
the UNDERLYING layer. Structural UI (cards, buttons, frames) stays hand-built SVG.
Copy-paste templates below. Common post-processing for every piece:

1. **Darken veil:** overlay pitch black `#0a0910` at 25–45% opacity (top or vignette).
2. **Grain:** add fine film grain / noise (menu fog should have teeth).
3. **Palette clamp:** pull highlights toward chalk `#e8e0d0`, accents toward blood
   red `#c1121f` / gold `#d4af37`; kill any orange or generic blue gradients.
4. **Type rule:** AI-generated images must contain **no rendered text** unless you
   paint it over by hand — AI text is always wrong. Add titles with Anton/Rubik
   Spray Paint on top in the layout.

**Global negative prompt (append to every generation):**
`flat vector illustration, cartoon, orange gradient, cyberpunk Tron neon-everything,
fantasy wizard with pointy hat, readable text, watermark, logo, plastic render,
clean polished UI, stock photo, blurry, deformed hands`

---

**1. Menu background mural** — 16:9 (3840×2160 source, ship 1920×1080)
> `wide dark urban street mural at night, graffiti-covered brick wall, a hooded
> figure with face buried in deep shadow and only two tiny sparkling white eye
> glints visible, gold chain motifs painted in the graffiti, neon purple and toxic
> green fog drifting low, wet asphalt reflections, cinematic, moody, gritty
> street photography style`
> Negative: `[global negative]`
> Post: darken veil 40%, grain, palette clamp (murder the oranges).

**2. Faction banner** — 21:9 or 3:1 (wide strip)
> `faction banner painted on cracked concrete wall, street gang emblem style,
> spray-paint tag and diamond grill jewelry pattern border, worn gold and blood red
> palette, peeled stickers, torn tape pieces at the corners, dramatic side lighting,
> gritty texture detail`
> Negative: `[global negative]`
> Post: clamp to v3 palette; overlay tape corners via TapeStrip component for consistency.

**3. Loading art** — 16:9, readable at a glance, dark enough for a spinner on top
> `brawler standing under a single streetlight in pitch black street, long shadow,
> purple rim light from a neon sign out of frame, green glow from a storm drain,
> chain-link fence foreground slightly out of focus, rain starting, cinematic still`
> Negative: `[global negative]`, plus `empty background, daytime`
> Post: darken veil 45%, add loading spinner + Anton label "LOADING" in layout.

**4. Diamond-grill mural** — square 1:1 (for card backgrounds / emblems)
> `close-up mural of a diamond grill (jeweled teeth) painted in gold and white
> spray paint on black brick, sparkling highlights, surrounded by small spellbook
> graffiti symbols and street slang tags in white chalk, dark vignette edges`
> Negative: `[global negative]`, plus `photorealistic human mouth, scary face`
> Post: darken edges, palette clamp to gold `#d4af37` + chalk `#e8e0d0` + black.

**5. Hooded-figure shadow art (SWMG)** — portrait 2:3 (character-select backplate)
> `hooded figure emerging from complete darkness, robe folds catching dim purple
> light on one edge, face fully buried in black shadow, only two tiny sparkling
> white eye glints visible, gold chain glinting at the collar, toxic green faint
> glow behind, painterly, ominous, high contrast`
> Negative: `[global negative]`, plus `visible face, fantasy wizard, pointy hat, staff`
> Post: crush blacks to `#0a0910`; paint eye glints over with the SVG recipe in §6
> for consistency.

**6. Spellbook graffiti wall** — 16:9 (district / lore backgrounds)
> `alley wall covered in spellbook-style graffiti, arcane-looking symbols mixed
> with street slang words in chalk-white spray paint, purple and green spray
> gradients in the corners, gold chain link pattern stenciled along the bottom,
> wet concrete, night, moody`
> Negative: `[global negative]`, plus `readable real spellbook text, D&D`
> Post: hand-set key slang in Rock Salt font over the top; darken veil 35%.

### (d) Font pipeline

- **Source:** 13 OFL families vendored at `tools/promo-video/fonts/<Family>/`
  (TTF files, Regular weights only) — kept as the offline/backup source.
- **Production wiring (shipped 2026-10-06):** Google Fonts CDN `<link>` in
  `src/routes/__root.tsx` head (preconnect + css2 for Anton, Bangers,
  Black Ops One, Permanent Marker, Rock Salt, Rubik Spray Paint, Inter).
  This matches the repo's pre-existing font pattern. Type tokens in
  `src/styles.css` `@theme`: `--font-sans` Inter, `--font-display`
  Black Ops One, `--font-headline` Anton, `--font-tag` Permanent Marker,
  `--font-spray` Rubik Spray Paint, `--font-comic` Bangers, `--font-scratch`
  Rock Salt.
- **⚠️ Do NOT put TTFs under `src/`** (e.g. `src/assets/fonts/`): binary font
  files under `src/` wedge Vite's dev/build scanners into an infinite loop
  (observed 2026-10-06: 3GB RSS, sync loop, SIGTERM ignored — had to SIGKILL).
  Fonts live in `public/fonts/` or load from CDN only.
- **Screenshot harness:** the sandbox has no internet, so Google Fonts don't
  load there — harness HTML files use local `@font-face` with `file://` URLs to
  the vendored TTFs (see `~/workspace/street-kit/preview.html` pattern).
- **License notes:** SIL Open Font License — free for commercial use, must keep
  copyright/license info, can't sell the fonts alone. Each font dir **should**
  carry its `OFL.txt` / `LICENSE` file; none were found — add them before any
  public release (§7 TODO).

---

## 4. Component catalog — `src/game3d/street-kit.tsx`

All in one file. Import from `../game3d/street-kit` (or your alias).

| Component | Props | Default look | Use it for |
|---|---|---|---|
| `AshlaneTag` | `className?`, `variant?: "red" \| "white" \| "yellow"` | graffiti tag wordmark, tilted, drips + overspray, viewBox `0 0 680 200` | Game logo in menus |
| `SpraySplatter` | `className?`, `color?`, `seed?` | deterministic paint splatter, viewBox `0 0 200 120` | accents, dividers, card corners |
| `TapeStrip` | `className?`, `color?`, `angle?`, `label?` | masking-tape piece w/ torn edges, optional Black Ops One label | chips, tags, "taped-on" notes |
| `StencilTag` | `text` (required), `className?`, `color?` | military stencil text w/ spray erosion, viewBox `0 0 300 60` | job labels, section stamps |
| `TornEdge` | `className?`, `color?`, `flip?` | ripped-paper divider, full-width stretcher | section dividers, panel edges |
| `ChainLink` | `className?`, `color?` | chain-link fence tile, viewBox `0 0 200 60` | background overlays, borders |
| `BrickWall` | `className?`, `mortar?`, `brick?` | brick texture strip, viewBox `0 0 400 100` | background tiles, panels |
| `CornerBracket` | `className?`, `color?`, `position?: "tl"\|"tr"\|"bl"\|"br"` | worn metal corner w/ rivets, viewBox `0 0 60 60` | card frames, portrait corners |
| `SprayArrow` | `className?`, `color?`, `direction?: "right"\|"left"\|"up"\|"down"` | graffiti arrow w/ overspray, viewBox `0 0 120 60` | wayfinding, menu flow hints |
| `CautionTape` | `className?` | hazard stripe strip, full-bleed | warnings, locked-content gates |
| `FistStencil` | `className?`, `color?` | raised-fist mark, viewBox `0 0 80 80` | brawler icons, faction marks |
| `EyeGlints` | `className?`, `spots?: {x,y,d}[]` | tiny sparkly white eye glints w/ twinkle | dark backgrounds, hoods |
| `GoldChain` | `className?`, `color?`, `linkW?` | interlocking gold chain-link strip, viewBox `0 0 640 26` | SWMG prestige strips, dividers |
| `DiamondGrill` | `className?`, `color?`, `opacity?` | diamond-grill mural pattern tile | SWMG mural walls, card backs |
| `HoodedFigure` | `className?`, `flip?`, `eyeDelay?` | hooded silhouette, purple rim, eye glints, chest chain | menu backdrop watchers |
| `SpellbookTag` | `className?`, `text?`, `color?`, `rotate?`, `size?` | marker graffiti w/ purple wizard glow | spellbook slang annotations |
| `WizardGlyph` | `className?`, `color?` | spell-circle sigil w/ gold `$` core | SWMG emblems, loading marks |
| `LaneBackdrop` | `className?` | full Malakor/SWMG atmosphere layer: haze, fog, mural, hoods, glints, chain, spell tags, vignette | menu sheet backgrounds |

Usage snippets:

```tsx
import { AshlaneTag, SpraySplatter, TapeStrip, StencilTag, TornEdge,
  ChainLink, BrickWall, CornerBracket, SprayArrow, CautionTape, FistStencil } from "../game3d/street-kit";

// Logo, red tag variant
<AshlaneTag variant="red" className="w-full max-w-xl" />

// Menu button label chip
<TapeStrip label="EXHIBITION" angle={-4} />

// Job header
<StencilTag text="JOB 07 // DOCK" />

// Divider between menu sections
<TornEdge color="#c1121f" />

// Character card corner (repeat 4x with positions)
<CornerBracket position="tl" color="#d4af37" />
```

---

## 5. Workflow for adding new art

1. **Propose** — one paragraph: what piece, which layer it serves (underlying
   atmosphere vs overlying UI), palette colors, which existing component it pairs
   with. Get owner nod before building anything big.
2. **Build as SVG component** — add to `street-kit.tsx` following §3a conventions
   (props pattern, viewBox discipline, unique filter IDs, no external assets).
3. **Preview harness screenshot** — add the piece to a `~/workspace/street-kit/`
   harness HTML, render with the headless Chromium recipe (§3b) at 2x, read the PNG.
4. **Owner review** — SEE, don't guess. Every claim about the piece is tied to a
   screenshot: show it, drop it in the chat as a deliverable, let him point at
   pixels. No narration without the image.
5. **Ship + document** — wire it into the menu, add a row to the §4 catalog table
   in this doc, note which palette/type tokens it uses.

---

## 6. SWMG-specific art recipes

SWMG = Shadow Wizard Money Gang, the UNDERLYING theme. Street-wizard energy, never
literal fantasy. Recipes below combine AI prompts (§3c) with hand SVG.

### Eye glints (the SWMG signature)
- **SVG technique:** inside a black hood shape (`#0a0910` fill), place two tiny white
  circles (`#ffffff`, r 1.5–2.5 in a 100-unit box) ~12 units apart, then a smaller
  `#e8e0d0` sparkle cross (two 0.6-unit lines) on one of them. Add `opacity 0.9` and
  a 4-unit white radial glow behind at 0.25 opacity. Nothing else in the face — the
  hood must stay unreadable black.
- **Prompt fragment:** `face fully buried in black shadow, only two tiny sparkling
  white eye glints visible`

### Gold chains
- **SVG technique:** repeating `<ellipse>` links (rx 6, ry 4) along a curve path,
  stroke `#d4af37` strokeWidth 2.5, fill none, with a `#8a6b1f` offset shadow copy
  behind at 0.5 opacity. Every 5th link gets a tiny `#fff8dc` highlight dot.
- **Prompt fragment:** `worn gold chain motifs, hip-hop jewelry energy, not costume`

### Diamond grills
- **SVG technique:** grid of rotated 45° squares (`<rect>` with `transform rotate(45)`)
  in `#e8e0d0` stroke 1.5, gap 2, inside a black rounded frame; overlay random
  `#ffffff` 1-unit sparkle dots (seeded). For murals: repeat the pattern as an
  `<pattern>` tile along borders.
- **Prompt fragment:** `diamond grill pattern, jeweled teeth sparkle, gold and white`

### Spellbook graffiti
- **SVG technique:** set slang in **Rock Salt** (the spellbook font) at small sizes,
  color `#e8e0d0` 0.8 opacity, rotate −2° to −5°, apply a turbulence-displacement
  filter (copy the `StencilTag` filter: baseFrequency 0.55, scale 2.5). Mix in
  arcane-looking glyph shapes: circles with cross-hatch spokes, crescent slashes,
  small starbursts — draw them as thin strokes, never filled.
- **Prompt fragment:** `spellbook-style graffiti with street slang, arcane symbols,
  chalk white on black brick`

### Hooded figures
- **SVG technique:** hard — prefer the AI prompt (§3c #5) for the figure, then paint
  the eye glints in SVG on top for consistency across the game. Keep the robe edge
  catching `#7b2ff7` purple or `#a3e635` green rim light only on ONE side.
- **Prompt fragment:** `hooded figure, face in complete shadow, purple rim light on
  one edge, green glow behind, ominous`

---

## 7. Open questions / TODO

Things I could not verify while writing this doc — resolve before treating them
as settled:

- [x] **`src/game3d/menu-theme.css` v3 rewrite** — shipped 2026-10-06. Class
  names unchanged (`al-*`); palette repainted per §2.
- [x] **Gold tone decision** — `#d4af37` (worn gold) is the gold everywhere.
  `AshlaneTag`'s yellow variant (`#d9a021`) is a *paint* variant, not the gold —
  intentional.
- [ ] **Font licenses** — no `OFL.txt`/`LICENSE` files found in any of the 13
  `tools/promo-video/fonts/<Family>/` dirs (only the TTFs). Add them before public
  release; OFL requires the license to ship with the fonts.
- [ ] **Chromium binary for §3b recipe** — `chromium`/`google-chrome` not on PATH
  in the sandbox I worked from; confirm the working binary name (or the
  `agent-browser` CLI) before an agent runs the screenshot recipe.
- [ ] **Font licenses** — no `OFL.txt`/`LICENSE` files found in any of the 13
  `tools/promo-video/fonts/<Family>/` dirs (only the TTFs). Add them before public
  release; OFL requires the license to ship with the fonts.
- [ ] **Font weights** — only Regular TTFs found per family. If Anton-Bold or
  Inter-Medium are needed, check with the owner / download from Google Fonts.
- [x] **ChainLink `pattern` id collision** — noted; fix before rendering two
  ChainLinks on one page (low priority — ChainLink isn't used in menus yet).
- [ ] **`menu-art.tsx` / `menu-backdrop.tsx` / `menu-icons.tsx`** (in
  `src/game3d/`) exist but were not inventoried here — catalog them into §4 if
  they're part of the menu kit.
- [ ] **AI image generator choice** — the prompt templates are model-agnostic;
  confirm which generator the owner uses and tune prompts once it's known.
- [x] **Gold tone drift** — resolved: `#d4af37` everywhere (see above).
