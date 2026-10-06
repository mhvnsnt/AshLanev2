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

## 6. KeyCastOW
- **URL:** https://github.com/brookhong/KeyCastOW (original) · maintained fork https://github.com/ryanmossor/keycastow
- **What:** Keystroke visualizer for Windows — tiny (~100KB) overlay that displays pressed keys while recording screencasts. Hotkey toggle, configurable display/fade timing and opacity.
- **License:** **MIT** — stated in the repo README license section (both original and forks). Verified (checked 2026-10-06).
- **Verdict:** ✅ Commercial-safe (MIT) — as a tool, not shipped in the game.
- **Notes:** Dev-tooling entry: use for tutorial videos, move-lab recordings, and playtest footage so viewers see inputs. Windows-only binary — fine for capture machines. For the in-game equivalent (input display in training mode), pair Xelu glyphs (#5) with the HUD store's input feed — don't ship a keylogger-adjacent overlay in the client.
- **AshLane use:** Tutorial/promo video production (visible inputs), move-lab capture.

## 7. Ikemen GO
- **URL:** https://github.com/ikemen-engine/Ikemen-GO · default screenpack https://github.com/ikemen-engine/Ikemen-GO-Screenpack
- **What:** Open-source fighting-game engine (M.U.G.E.N-compatible) — and, for our purposes, a complete working reference of fighting-game UI: title → character select → versus screen → fight HUD (lifebars, combo counters, round announcements) → results, all data-driven from the "screenpack"/motif definition files.
- **License:** **Engine MIT** (LICENCE.txt). ⚠️ **Default screenpack/motif is CC-BY 3.0** — study the layout/code freely, but its art assets need attribution and can't be rebranded as ours. Links FFmpeg (LGPL v2.1) — irrelevant for UI reference. Verified from repo license section (checked 2026-10-06).
- **Verdict:** ✅ Commercial-safe as reference + MIT code; screenpack art = CC-BY (attribute or redraw).
- **Notes:** The highest-value artifact is the screenpack *system*: every screen is a declarative layout (positions, fonts, animations, state transitions) — exactly the architecture AshLane's menu kit needs. Study: character-select grid flow, versus-screen animation timing, lifebar/combo-counter anchoring, round-announcement sequencing. Redraw all art in Concrete Jungle style; borrow the structure, not the pixels.
- **AshLane use:** Fighting-game UI architecture reference — character select, versus screen, HUD layout, screenpack data-driven UI pattern.

## 8. Game UI Database
- **URL:** https://www.gameuidatabase.com — by Edd Coates (Double Eleven senior UI artist); also the book *The Game UI Bible* (Lost In Cult).
- **What:** 80,000+ game UI screenshots (v2.0, 1,000+ games), filterable by screen type (title screen, character select, HUD, pause, results…), UI elements, textures, patterns, color, animation. Search "fighting" for Tekken/Street Fighter/MK screen teardowns.
- **License:** **Reference-only** — screenshots are copyrighted by their respective games. Look, study, take notes; **do not lift art**.
- **Verdict:** ⚠️ Research-only by nature (inspiration, not assets). No license to record — nothing ships from here.
- **Notes:** The fastest way to answer "how does Tekken 8 lay out its character select?" or "how do fighting games stage versus screens?" with real pixels. Pair with #7 (Ikemen GO) — Game UI Database shows the *what*, Ikemen shows the *how*. Especially useful for the Concrete Jungle theme pass: filter by textures/materials (concrete, graffiti, metal) to see how shipped games dress street-style UI.
- **AshLane use:** UI/UX research — character select, versus screens, HUD layouts, street-style menu dressing from shipped fighters.

## 9. NES.css
- **URL:** https://github.com/nostalgic-css/NES.css (by B.C.Rikko)
- **What:** 8-bit pixel-art CSS framework — chunky pixel borders, pixel buttons/dialogs/badges, balloon tooltips, plus a built-in 16×16 pixel icon set (sword, heart, controller, star). Pure CSS, no JS. Pairs with the OFL Press Start 2P font.
- **License:** **MIT** (code) · docs CC — "Code and documentation copyright 2018 B.C.Rikko. Code released under the MIT License." Verified from README license section (checked 2026-10-06).
- **Verdict:** ✅ Commercial-safe (MIT).
- **Notes:** Not the main theme (Concrete Jungle is street, not retro) — but valuable as a *contrast layer*: arcade-mode screens, retro mini-game overlays, or a "classic" HUD skin option. The pixel-icon technique (box-shadow pixel art in pure CSS) is directly reusable for custom street-style pixel badges. Study its border-image/corner-cut patterns for textured menu boxes.
- **AshLane use:** Retro/arcade-mode UI skin, pixel badge technique reference, textured-box border patterns.

## 10. daisyUI
- **URL:** https://github.com/saadeghi/daisyui · https://daisyui.com
- **What:** Tailwind CSS component library — 61 component families (buttons, cards, modals, drawers, toasts, tabs, badges, menus, tooltips) as semantic CSS classes (`btn btn-primary`), framework-agnostic, no JS required. 35 built-in themes + custom theme tokens.
- **License:** **MIT** — confirmed in repo-root `LICENSE` and GitHub license metadata. Verified (checked 2026-10-06).
- **Verdict:** ✅ Commercial-safe (MIT).
- **Notes:** The pragmatic base for the street-art menu kit: take daisyUI's component *structure* (modal, drawer, menu, toast) and reskin with Concrete Jungle tokens — this is exactly how you avoid the "generic mobile-style menu" the owner rejected. Custom theme support means the SWMG palette (ember, brass, concrete) becomes a first-class theme. CSS-only = zero runtime cost, works with the existing Tailwind v4 setup.
- **AshLane use:** Menu component base (modals, drawers, toasts, tabs) reskinned to Concrete Jungle; settings screens.

## 11. Animate.css — ⚠️ LICENSE CHANGED, do not ship current version
- **URL:** https://github.com/animate-css/animate.css · https://animate.style
- **What:** The classic "just-add-water" CSS animation library — 80+ entrance/exit/attention animations as classes (`animate__bounceIn`, `animate__fadeOutUp`). Built-in `prefers-reduced-motion` support.
- **License:** ⚠️ **Hippocratic License 2.1** (current v4.x, per the README license badge + LICENSE file) — an *ethical-source* license with use restrictions, **NOT** MIT. It fails the owner's license rule (only MIT/Apache/BSD/Unlicense/OFL/ISC/CC0 in the build). Older **v3.x was MIT** (repo keeps old docs for v3.x and under).
- **Verdict:** 🔴 **Do NOT ship the current version.** If the keyframe vocabulary is wanted, pin `animate.css@3.7.2` (last MIT release) — or lift only the *easing/duration patterns* as inspiration and hand-write keyframes.
- **Notes:** This is exactly why the license rule says to check the actual LICENSE file: every third-party roundup still calls Animate.css "MIT". The keyframes themselves are the value — bounceIn/tada/wobble timing curves are great references for KO announcements and combo-counter pops. For new code, prefer anime.js (#13) or Motion (already in R5 stack).
- **AshLane use:** Animation *reference* only — KO text pops, combo-counter entrances, menu stagger timing. Never bundle v4+.

## 12. AutoAnimate (FormKit)
- **URL:** https://github.com/formkit/auto-animate · package `@formkit/auto-animate`
- **What:** Zero-config 3KB animation library — attach one ref/hook to a parent and list add/remove/reorder automatically animate. Framework-agnostic (React hook, Vue, Svelte, vanilla). Respects `prefers-reduced-motion` out of the box.
- **License:** **MIT** — confirmed across FormKit's package metadata and multiple downstream license records. Verified (checked 2026-10-06).
- **Verdict:** ✅ Commercial-safe (MIT).
- **Notes:** The cheapest way to make menus feel alive: mission lists, move lists, inventory grids, and toast stacks animate for free with one hook. Use for *structural* transitions (lists appearing/disappearing); use anime.js (#13) or the R5 Motion stack for choreographed sequences (versus-screen intros, round announcements). SSR-safe import pattern documented for TanStack Start.
- **AshLane use:** Animated menu lists (missions, moves, inventory), toast/notification stacks, settings toggles.

## 13. anime.js
- **URL:** https://github.com/juliangarnier/anime · https://animejs.com
- **What:** Lightweight JS animation engine (v4, ES modules): unified tween API for CSS, SVG, DOM attributes and JS objects; timelines, stagger, springs, scroll triggers, SVG morphing (`morphTo`), motion paths, text splitting. Optional Three.js adapter.
- **License:** **MIT** — "© Julian Garnier | MIT License", LICENSE.md in repo root. Verified via upstream license references (checked 2026-10-06). Active (v4.5.0, 2026).
- **Verdict:** ✅ Commercial-safe (MIT).
- **Notes:** The choreography engine for the menu kit: versus-screen build-ups, round-announcement sequences, combo-counter pops, graffiti-logo draw-on effects (SVG stroke animation via `createDrawable`), title-card text splits. SVG morphing is ideal for animated faction emblems and the SWMG wizard mark. Lighter and more controllable than CSS keyframes for sequenced UI; complements AutoAnimate (#12, structural) and Motion (R5, React components).
- **AshLane use:** Versus-screen/round-announcement choreography, graffiti-logo draw-on, combo-counter pops, animated SVG emblems.

## 14. Embla Carousel
- **URL:** https://github.com/davidjerleke/embla-carousel · https://www.embla-carousel.com
- **What:** Lightweight, dependency-free carousel with fluid swipe physics — framework packages for React/Vue/Svelte plus vanilla. Plugins: autoplay, auto-scroll (ticker/marquee), class-names, fade. Touch + gamepad-friendly.
- **License:** **MIT** — "Embla Carousel is an open source MIT licensed project", Copyright © 2019–present David Jerleke, LICENSE in repo root. Verified via release notes + third-party notices (checked 2026-10-06).
- **Verdict:** ✅ Commercial-safe (MIT).
- **Notes:** The character-select engine: swipeable fighter cards with snap physics feel right on both touch and gamepad-stick navigation. Auto-scroll plugin doubles as a marquee ticker for menu banners ("next fight" strips, faction news). Loop mode for attire selectors. Keep slides GPU-cheap (transform/opacity only) — portraits are already duotone CSS in the Concrete Jungle kit.
- **AshLane use:** Character select carousel, attire selectors, menu banner tickers, stage select.

## 15. ldrs (uiball loaders)
- **URL:** https://github.com/GriffinJohnston/ldrs · gallery https://uiball.com/ldrs
- **What:** 44 minimalist loading spinners as web components (`<l-ring-2>`, `<l-waveform>`, `<l-trefoil>`…) + React wrappers. Pure CSS/SVG, zero dependencies; size/color/speed/stroke tunable via attributes. Standalone HTML extraction supported (no npm needed).
- **License:** **MIT** — stated in the repo README license section. Verified (checked 2026-10-06).
- **Verdict:** ✅ Commercial-safe (MIT).
- **Notes:** Loading-screen kit: pair a themed loader (ember-colored `l-quantum` or `l-helix`) with the Narrator's curated appearances — the purple-robed wizard shows up at *narrative* moments (chapter/territory shifts), so loading screens split into two kinds: Narrator moments (custom art + line) and ordinary loads (ldrs spinner + tip text). Respect `prefers-reduced-motion` (ldrs speed can be paused via `speed="0"`).
- **AshLane use:** Loading screens (ordinary loads), matchmaking spinner, asset-load indicators.

## 16. Floating UI
- **URL:** https://github.com/floating-ui/floating-ui · https://floating-ui.com
- **What:** The positioning engine for tooltips, popovers, dropdowns, and anchored overlays — successor to Popper. Tiny modular core (`@floating-ui/dom`), collision-aware placement middleware, React hooks for accessible interactions.
- **License:** **MIT** — confirmed in GitHub license metadata + repo-root `LICENSE`. Verified (checked 2026-10-06).
- **Verdict:** ✅ Commercial-safe (MIT).
- **Notes:** The foundation under the tutorial/tooltip layer: move-list tooltips, control-remap popovers, and driver.js (#17) highlight popovers all need collision-aware anchoring — Floating UI is the standard engine. Style the tooltip chrome in Concrete Jungle (torn-paper clip-path, hazard-stripe border) while Floating UI handles placement. Works with the R4 remappable-controls data (show the *bound* key per action).
- **AshLane use:** Tooltip/popover positioning engine — move-list tooltips, remap-screen popovers, tutorial callouts.

## 17. driver.js
- **URL:** https://github.com/kamranahmedse/driver.js · https://driverjs.com
- **What:** Lightweight (~5KB, zero-dependency, vanilla TypeScript) guided-tour / focus engine: highlight any element with a dimmed overlay, step-by-step tours, popovers, focus shifters. Keyboard-controllable.
- **License:** **MIT** — "MIT © Kamran Ahmed", stated in README license section. Verified (checked 2026-10-06).
- **Verdict:** ✅ Commercial-safe (MIT).
- **Notes:** The tutorial system for onboarding: first-launch tour (menu → character select → first fight), contextual coach marks in move lab. Theme the popover/hole-overlay in Concrete Jungle. ⚠️ Do NOT substitute **intro.js** — the other popular tour library is **AGPL-licensed** (copyleft; commercial use requires a paid license). driver.js is the safe pick.
- **AshLane use:** First-launch onboarding tour, move-lab coach marks, contextual help overlays.

## 18. Hero Patterns
- **URL:** https://heropatterns.com/ — by Steve Schoger
- **What:** ~90 repeatable SVG background patterns (topography, brick wall, diagonal stripes, circuit board, skulls, wiggle, graph paper…) with live foreground/background color pickers — copy-paste as inline SVG or data-URI backgrounds. A Tailwind plugin (`@danielfgray/tw-heropatterns`) exists.
- **License:** **CC-BY 4.0** — confirmed by multiple downstream THIRD_PARTY_NOTICES files ("distributed under the Creative Commons Attribution 4.0 International License"). ⚠️ NOT CC0 as commonly assumed. Verified (checked 2026-10-06).
- **Verdict:** ✅ Commercial-safe with attribution (CC-BY — one credit line for Steve Schoger / heropatterns.com).
- **Notes:** The textured-box layer of the street-art menu kit: brick-wall behind faction panels, topography on district cards, diagonal-stripes as hazard fills — all tintable to the SWMG ember/brass/concrete palette. SVG data-URIs keep them resolution-independent and near-zero weight. Pick patterns that read "street" (brick, cage, stripes), skip the corporate ones.
- **AshLane use:** Textured menu/card backgrounds, district cards, loading-screen backdrops (SVG decorations layer).
