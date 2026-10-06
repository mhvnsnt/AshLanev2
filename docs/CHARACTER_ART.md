# ASHLANE CHARACTER ART

> Character select card art + robed variants. Owner-directed.
> Style: Tekken 8 / Urban Reign. High-detail, cinematic, in-game canon.

## Character Cards (Tekken/Urban Reign Style)

Located in `public/portraits/`. Each card shows the character in a dynamic 3/4 pose
with dramatic lighting and a background that reflects their faction/territory.

### Dynasty Authority (6)
| File | Character | Notes |
|------|-----------|-------|
| `silas.webp` | Captain Silas "The System" | White shirt open, gun belt, mustache. Bureaucratic menace. |
| `titus.webp` | "Big Dawg" Titus | Full riot gear, no helmet. SWAT breacher. |
| `great-white-north.webp` | The Great White North | Red hair/beard, chain on fist. The Jailer. |
| `finn-mac.webp` | Finn "The Priest" Mac | Black clerical shirt, priest collar, gun belt. |
| `kiko-tanaka.webp` | Kiko Tanaka | Detective trench coat, subtle face paint. Five Animals. |
| `astrid.webp` | Astrid "The Ice Maiden" | Dark navy tactical gear, long black hair. The Warden. |

### Bosses
| File | Character | Notes |
|------|-----------|-------|
| `buffalo-bill.webp` | Buffalo Bill (hood off) | Based on BILL $ABER. Ram horn dread braids, buff wrestler build, gold chain, grill. Ashes boss. |
| `buffalo-bill-hood.webp` | Buffalo Bill (hood on) | SWMG style — purple hood, face in shadow. Mysterious. |
| `cain.webp` | Cain | Red hair, snake skin pants. Yakuza-boss energy. Cold. |
| `toro.webp` | El Toro de Oro | Golden bull mask. Loyal powerhouse. |
| `sombra-negra.webp` | Sombra Negra | Black bodysuit, skull facepaint, long black hair. |
| `onyx.webp` | Onyx | Dark clown face paint. Painted gang leader (public face). |

### Robed Variants (Secret Leadership — PLOT TWIST)

**These are the secret leaders of the Painted. Late-story reveal.**
**NEVER label them as leaders in UI, menus, or player-facing text.**

| File | Character | Robe Color | Role |
|------|-----------|------------|------|
| `buffalo-bill-robed.webp` | Buffalo Bill | Scarlet red (bright, neon) | **Secret leader** |
| `onyx-robed.webp` | Onyx | Green (sometimes) | Public face (not secret leader) |
| `sombra-negra-robed.webp` | Sombra Negra | Black/purple | TBD |

**Theory:** Secret leader. Robe color TBD. Owner has her model. Not yet generated.

**Style rules for robed variants:**
- Face completely shrouded in shadow
- Only TWO GLOWING WHITE EYES visible
- Signature robe color per character
- Gold chains/jewelry over the robe
- SWMG-inspired but NEVER called "Shadow Wizard Money Gang" in-game
- Proprietary name TBD
- Art feels mysterious and powerful — no leadership labels

See `docs/STORY_BIBLE.md` → "Narrative Secrets — The Painted Leadership" for full plot details.
**That section is writers-only. Never surface in game UI.**

## How to Generate More

### Character cards:
1. Reference: use `~/workspace/dynasty-authority-refs/` for Authority members
2. Or: use GLB model renders (front or 3/4 angle)
3. Prompt pattern: "Tekken 8 / Urban Reign style character select card art. [NAME] — [in-game description from lieutenants.ts]. [Personality]. Dramatic 3/4 angle, [faction-appropriate background]. High-detail fighting game portrait, cinematic lighting."
4. **Always style to GAME CANON** — not just the real person. Silas is the commissioner, not just Silas Young. Kiko is the detective, not just Great Muta.

### Robed variants:
1. Reference: `docs/art-refs/swmg-art-*.jpg` for style
2. Prompt pattern: "Shadow Wizard Money Gang style alternate form. [NAME] in wizard form: figure in [COLOR] hooded robe, face completely shrouded in black shadow with only TWO GLOWING WHITE EYES visible. [Character-specific details]. Dark background with [color] neon glow. Bold graphic style, high contrast."
3. White-background version: add "WHITE BACKGROUND, high contrast" and reference `swmg-art-1.jpg`

### Pushing to repo:
- Save to `public/portraits/` in AshLanev2
- WebP format, character cards ~800px wide
- Filename: `{character-id}.webp` or `{character-id}-robed.webp`

## Wiring into Character Select

Character select (`src/components/ashlane-app.tsx` → FighterCard) should use:
```tsx
// Portrait path by fighter id
const portraitSrc = `/portraits/${fighter.id}.webp`;
// Robed variant (for dramatic moments / Hollows district)
const robedSrc = `/portraits/${fighter.id}-robed.webp`;
```
Fallback to SVG FighterPortrait if webp missing.

---
*Owner art direction 2026-10-05. Buffalo Bill based on BILL $ABER (not Bill Sabre).*
