# Playtest attempt — 2026-10-06 (ground-truth coordinator)

## What was verified this session

### 1. Base-path bug: FIXED in code (not yet pixel-proven in a live run)
- Commit `360096a` "Fix asset base-path bug: all public/ URLs via assetUrl()
  (BASE_URL-aware)" is on main.
- `src/game3d/asset-base.ts`: `ASSET_BASE = import.meta.env.BASE_URL || "/"`,
  `assetUrl(path)` strips leading slashes and prefixes the base.
- Adopters (8 files): `view.ts`, `env-assets.ts`, `motion-bank.ts`,
  `quaternius.ts`, `stage-select.ts`, `stage-dressing.ts`, `routes/mocap.tsx`.
- Grep over `src/` (ts/tsx): zero remaining root-absolute asset URLs
  (`/models/…`, `/textures/…`, `/motion/…`). Only `/api/rtc` API calls remain
  root-absolute (server API, unrelated to the asset bug).
- `vite.config.ts`: `base: "/AshLanev2/"`.
- Assets exist in `public/`: UAL animation library
  (`motion/ual/` — gltf+bin+2 GLBs, LICENSE.txt present), 6 humanoid rigs
  (`models/humanoid/` incl. Soldier_Male.glb), street textures, `motion/bank.json`.
- Menu renders post-fix: `docs/playtest/boot-fixed-2026-10-06.png` (ASHLANE /
  CINDER WARD menu, STORY / EXHIBITION / PRACTICE / WALK THE WARD buttons).

### 2. Production build: `npm run build` exits 0 (verified once)
One full build completed and produced `.output/public/` (1.6 GB, index.html +
assets). The output was later wiped by a concurrent lane's rebuild
(`emptyOutDir`); subsequent rebuild attempts were OOM-killed (exit 137) by
concurrent lanes' memory use (observed two simultaneous vite builds at
31%+18% RSS, plus puppeteer chrome + tsc from other lanes; 8 GB box).

### 3. Generative tooling port (per corrected license policy)
- Ported `tools/generative/motion/glb_anim.py` (from Bannon lane): appends
  baked animations to a GLB without re-encoding meshes; stdlib + numpy only;
  syntax-verified. Genuinely new — no AshLanev2 equivalent as a standalone
  primitive.
- Wrote `tools/generative/LICENSE-MANIFEST.md`: tracks the port + license,
  documents the 6 evaluated-and-skipped Bannon tools with reasons
  (retarget/mesh/LOD covered by `tools/anim-retarget/` and `3d/postprocess.py`;
  arena/crowd generators are wrestling-venue-specific, not street-brawler;
  procedural wrestling moves deferred pending UAL load verification).
- Policy applied: prototype freely; GPL/AGPL kept out of ship paths; manifest
  makes the pre-ship audit mechanical.

## What is NOT verified (blocked, not skipped)
- **Live post-fix gameplay with real rigs/textures/animations.** The last
  pixel-backed playtest is the 2026-10-05 pre-fix session (blob fighters,
  131 asset 404s). A post-fix live run was attempted 6+ times:
  - Static build: serves 200, but headless Chromium (SwiftShader) crashes the
    renderer on this page ("Target crashed"); Xvfb + full Chromium survives.
  - Dev server: serves 200 with real SSR HTML, but dies under memory pressure
    (OOM) before/during browser automation; also hit a transient 500 from the
    vite module runner once.
  - Root cause is environmental (8 GB box shared with multiple heavy lanes),
    not the game code.
- **The 131-404 fix is therefore code-verified, NOT pixel-verified.** Do not
  claim the deployed PWA renders correctly until a live run proves it.

## Prioritized fix/next list
1. Re-run this playtest when the box is quiet (or on a GPU host / CI with
   artifacts): boot static build → menu → PRACTICE → move/punch/grab/jump →
   confirm rigs/textures/UAL animations load (0 asset 404s), capture screenshots
   + video.
2. If headless still crashes, keep Xvfb as the capture rig (proven to survive).
3. Then judge animation quality per FOUNDATION BEFORE FEEL (rigs/skeletons/
   animations first; no feel work until characters animate correctly).
4. UAL library license: `public/motion/ual/LICENSE.txt` exists — confirm its
   terms allow the game's use before ship (audit item).
