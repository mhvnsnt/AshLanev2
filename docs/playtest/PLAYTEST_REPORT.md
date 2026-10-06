# AshLane Playtest — First Real Gameplay Session (2026-10-05)

**Build:** commit `34096c7` (latest main), `npm run build` clean, played via local dev server
at `/AshLanev2/` base path, headless Chromium + SwiftShader WebGL, 1280×720.
**Driver:** Playwright — clicked SCRAP STREET, walked (WASD), attacked (J), grabbed (K),
jumped (Space), dashed (Shift), blasted (X). Screenshots + full video below.
This is the first time anyone has actually played the game on record.

## What works ✅

- **App boots.** No fatal errors; menu renders with logo, mode buttons, arena picker.
- **Mode starts.** SCRAP STREET loads a 3D scene, spawns the player + enemies
  ("PITON REYES · LONG GUARD"), VS intro splash plays with live HUD.
- **Combat sim runs.** Attack inputs register; the enemy HP bar visibly drops
  after punch volleys (`04-combat-hp-dropping.png`). Third fighter joins later —
  the encounter escalates.
- **HUD works.** HP/KI bars, H/C/L counters, PAUSE button all render and update.
- **Movement works.** Fighter position changes with WASD input.

## What's broken ❌ (all evidenced)

### 1. CRITICAL: every game asset 404s under the `/AshLanev2/` base path
`src/game3d/view.ts` hardcodes absolute asset URLs (`/models/...`, `/textures/...`,
`/motion/...`) instead of using `import.meta.env.BASE_URL`. Under the Pages base
path **131 requests 404**, including:
- All fighter rigs (`/models/humanoid/Soldier_Male.glb` etc.) → fighters fall back
  to procedural box-grunts
- All street textures (`/textures/asphalt.jpg`, `brick.jpg`, …) → ground is pure black
- The entire UAL animation library (`/motion/ual/*.glb`) + `motion/bank.json`
  → no real animations load
- KayKit/Kenney prop + building models → empty black street
- `models/cast/BANNON_muscular_skinned.glb` requested 6×, 404s

**The files all exist in `public/`.** This is purely a base-path bug — and it means
the deployed PWA at `mhvnsnt.github.io/AshLanev2/` would look exactly like these
screenshots: black streets, blob fighters, no animations. The menu-art worker
already solved this pattern with `import.meta.env.BASE_URL` in `menu-art.tsx`;
the game code needs the same fix.

### 2. Fighters render as near-invisible dark blobs
With rigs 404ing, the fallback `makeFighter` box-grunts spawn — but the scene is
so dark only their brown head-spheres show against the black. They read as
bowling balls, not fighters (`03-combat-start.png`).

### 3. Belt-mode scene lighting is far too dark
Red sky renders, but the street is a black void. No visible ground plane,
no readable environment. Unplayable-looking even where the sim is fine.

### 4. Debug text leaking into the HUD
- Bottom-left: *"commit. Scuffle is on. It stays until this block is quiet."*
- Spawn banner: *"DROPPED"*
Both visible in every combat screenshot.

### 5. Console noise
- 131 asset 404s, React hydration-mismatch warning (SSR vs client attributes),
  2× `ERR_EMPTY_RESPONSE` (Google Fonts / grok extensions in sandbox).

### 6. Minor: menu visual overlap
A red background sign letter ("N" from NOODLE LANE) bleeds through the
STORY button (`01-main-menu.png`).

## Files

- `gameplay.mp4` — full session: menu → VS splash → combat (5:20)
- `01-main-menu.png` — main menu renders
- `02-vs-intro-splash.png` — new VS art + live HUD
- `03-combat-start.png` — blob fighters, black street
- `04-combat-hp-dropping.png` — HP bar dropping after attacks (combat works)
- `05-three-fighters.png` — third fighter joins, player moved right

## Recommended fix order

1. Prefix all asset URLs with `import.meta.env.BASE_URL` (unblocks models,
   textures, animations on the real PWA URL — single biggest win).
2. Raise belt-mode lighting / add street lights so the scene is readable.
3. Remove HUD debug strings ("commit…", "DROPPED").
4. Fix SSR hydration mismatch.
5. Then re-playtest with real rigs + animations and judge animation quality.
## 2026-10-06 — automated harness run (2026-10-06-2117)

**Verdict:** FAIL — 0/1 steps passed, 1 JS errors, 0 failed requests.

| Step | Result | Detail |
|---|---|---|
| harness completed | FAIL | page.goto: Protocol error (Page.navigate): Cannot navigate to invalid URL
Call log:
  - navigating to "--no-build/", wai |

- Combat pixel-diff: undefined
- Roam pixel-diff: undefined
- Ragdoll KO proof: null
- JS errors:
  - HARNESS: page.goto: Protocol error (Page.navigate): Cannot navigate to invalid URL
Call log:
  - navigating to "--no-build/", waiting until "domcontentloaded"

- Failed requests: none

Captures: `docs/playtest/2026-10-06-2117/` (01-menu … 07-ragdoll-ko.png + playtest.webm)

## 2026-10-06 — automated harness run (2026-10-06-2117)

**Verdict:** FAIL — 0/2 steps passed, 2 JS errors, 1 failed requests.

| Step | Result | Detail |
|---|---|---|
| boot: menu renders | FAIL | 1 js errors |
| harness completed | FAIL | locator.click: Timeout 5000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: 'Fighters' }).first()
 |

- Combat pixel-diff: undefined
- Roam pixel-diff: undefined
- Ragdoll KO proof: null
- JS errors:
  - CONSOLE: Failed to load resource: net::ERR_TUNNEL_CONNECTION_FAILED
  - HARNESS: locator.click: Timeout 5000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: 'Fighters' }).first()

- Failed requests:
  - GET https://fonts.googleapis.com/css2?family=Anton&family=Outfit:wght@500;600;700&family=Silkscreen:wght@400;700&display=swa :: net::ERR_TUNNEL_CONNECTION_FAILED

Captures: `docs/playtest/2026-10-06-2117/` (01-menu … 07-ragdoll-ko.png + playtest.webm)

## 2026-10-06 — automated harness run (2026-10-06-2119)

**Verdict:** FAIL — 0/4 steps passed, 2 JS errors, 0 failed requests.

| Step | Result | Detail |
|---|---|---|
| boot: menu renders | FAIL | 1 js errors |
| menu -> fighter select | FAIL |  |
| fighter select -> pick fighter | FAIL |  |
| harness completed | FAIL | only RGBA PNG supported, got colorType 2 |

- Combat pixel-diff: undefined
- Roam pixel-diff: undefined
- Ragdoll KO proof: null
- JS errors:
  - CONSOLE: Failed to load resource: net::ERR_TUNNEL_CONNECTION_FAILED
  - HARNESS: only RGBA PNG supported, got colorType 2
- Failed requests: none

Captures: `docs/playtest/2026-10-06-2119/` (01-menu … 07-ragdoll-ko.png + playtest.webm)

## 2026-10-06 — automated harness run (2026-10-06-2144)

**Verdict:** FAIL — 4/6 steps passed, 1 JS errors, 0 failed requests.

| Step | Result | Detail |
|---|---|---|
| boot: menu renders | FAIL | 1 js errors |
| menu -> fighter select | PASS |  |
| fighter select -> pick fighter | PASS | BannonPOWSPDTGH |
| combat: canvas animates on input | PASS | 18728 px changed (5.69%) (threwDown clicked: null) |
| roam: canvas animates on input | PASS | 113673 px changed (34.53%) (roam clicked: Cinder Ward) |
| ragdoll-demo: fighter KO'd with Rapier ragdoll | FAIL | displaced=0.00 err=route /ragdoll-demo not in this build (stale PWA?) — rebuild to include it |

- Combat pixel-diff: {"changed":18728,"pct":5.69}
- Roam pixel-diff: {"changed":113673,"pct":34.53}
- Ragdoll KO proof: {"ok":false,"displaced":0,"error":"route /ragdoll-demo not in this build (stale PWA?) — rebuild to include it"}
- JS errors:
  - CONSOLE: Failed to load resource: net::ERR_TIMED_OUT
- Failed requests: none

Captures: `docs/playtest/2026-10-06-2144/` (01-menu … 07-ragdoll-ko.png + playtest.webm)

