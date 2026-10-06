# AshLanev2 — API/Tool Integrations Wired (2026-10-06)

Per-repo map: `~/workspace/api-wiring/REPO_INTEGRATION_MAP.md` §2.
License tracking: `tools/verify/LICENSE-MANIFEST.md` (repo manifest).
Policy: prototype freely; audit before ship; GPL/AGPL quarantined from ship paths.

## 1. Playwright headless playtest harness — WIRED + LIVE

- **What:** `scripts/playtest.mjs`, run with `npm run playtest` (`--no-build` reuses last build).
- **Does:** builds the PWA (`PAGES_BUILD=1`), serves `.output/public` on
  127.0.0.1:8901 with SPA fallback, then drives mobile-Chromium (390×844,
  touch) through: boot → menu → Fighters → pick fighter → Throw down
  (exhibit bout) → roam (Cinder Ward) → `/ragdoll-demo`.
- **Captures:** `docs/playtest/<timestamp>/` — `01-menu.png` …
  `07-ragdoll-ko.png`, `playtest.webm` (full session), `report.json`
  (steps, pixel-diffs, JS errors, failed requests, ragdoll proof).
- **Frozen-canvas detection:** minimal in-script PNG decoder + pixel-diff
  between pre/post-input screenshots (no new deps). >500 changed px = alive.
- **Report:** appends a dated section to `docs/playtest/PLAYTEST_REPORT.md`.
- **Decision:** screenshots go through CDP `Page.captureScreenshot` because
  Playwright's `page.screenshot()` hangs forever on pending webfonts
  (observed 2026-10-06).
- **Money link:** quality = reviews = revenue. Every build gets the same
  eyes-on pass a human QA would do, in one command.

## 2. Rapier WASM ragdoll — WIRED + LIVE

- **What:** `@dimforge/rapier3d-compat` ^0.21.0 (Apache-2.0) in `dependencies`.
  `--legacy-peer-deps` needed at install: pre-existing `animouse@0.8.0` peer
  conflict on `three` (`>=0.157.0 <0.180.0` vs installed 0.186) — unrelated
  to Rapier, do not "fix" by downgrading three.
- **Module:** `src/game3d/physics/ragdoll.ts` — `ensureRapier()`,
  `PhysicsWorld` (gravity, static ground, fixed-step), `HumanoidRagdoll`
  (builds capsule/ball rigid bodies + spherical impulse joints from
  Mixamo-standard bones per `docs/BONE_STANDARD.md`; `knockout(dir, power)`
  unlocks rotations and slams impulse through torso/head; `sync()` writes
  body transforms back onto the skinned-mesh bones each frame).
- **In-game proof:** `/ragdoll-demo` route (`src/routes/ragdoll-demo.tsx`) —
  loads the real roster model `CIPHER_rigged.glb` (512 KB, bone-standard
  reference), stands it on CC0 concrete, auto-KOs with impulse + slow-mo,
  exposes `window.__ragdollDemo` for the harness to assert displacement.
- **Combat integration point (next):** on KO, call
  `HumanoidRagdoll.fromFighter(physics, fighterRoot)` then `knockout()` and
  `sync()` per frame instead of the anim mixer. Left as a documented call
  site — not yet spliced into `mount.ts`'s KO path.
- **Combat-feel law (owner 2026-10-06):** slow-mo/hit-stop reserved for big
  moments only — the demo's KO slow-mo qualifies (KO blow); normal hits stay
  snappy.
- **Money link:** ragdoll KOs + hit reactions + destructible props are core
  game feel. Feel = retention = revenue.

## 3. MediaPipe Pose QA gate — WIRED + LIVE

- **What:** `tools/verify/pose_qa.py` — runs on `tools/verify/.venv`
  (mediapipe 1.1.0, Apache-2.0, CPU; local `pose_landmarker_full.task`, no
  network, no key). Reuses `video_qa.py`'s landmarker loader.
- **Gates:** `no_person`, `head_cutoff`, `feet_cutoff` (feet below frame
  bottom — the framing law), `upside_down`, `shoulder_tilt` (modulo-180
  corrected: MediaPipe labels from the subject's perspective; skipped for
  profile views), `knee_collapse` + `knee/elbow asymmetry` (tpose mode only).
- **Modes:** `--pose-mode tpose` (reference renders, full joint gates) vs
  `action` (street/action shots, framing gates only).
- **Proof (2026-10-06):** 35/38 PASS on `docs/art-refs/glb-renders`; the 3
  FLAGs were verified by eye as true positives — two broken renders
  (`SOMBRA_NEGRA_rigged.png`, `MAIME_tattered_skinned.png`: black/empty or
  fragmented — matches the GLB repair queue's white/textureless class) and
  one contact sheet (multi-person, correctly out of scope).
  Report: `tools/verify/proof/pose_qa_2026-10-06.json`.
- **Decision:** eyes-verified every flag before trusting the gate; fixed two
  systematic false positives found in calibration (subject-perspective
  mirroring, profile-view tilt).
- **Money link:** the verification gate — broken-model regressions get caught
  by a script instead of shipping to players.

## 4. CC0 district materials — WIRED + LIVE

- **What:** `asset_fetch.sh` (shared kit) extended with `polyhaven-tex`
  mode (Poly Haven PBR sets, CC0-1.0, verified via api.polyhaven.com).
  Note: the script's old `ambientcg` mode 404s — ambientCG changed their
  download endpoint; Poly Haven is the working path now.
- **Fetched into `public/textures/pbr/` (each with `.LICENSE.txt` receipt):**
  - `concrete_floor_02` 1k (Color/Normal/Roughness/AO) — district ground
  - `asphalt_02` 1k (Color/Normal/Roughness/AO) — streets
  - `qwantani_afternoon` 2k HDRI — image-based lighting
- **Used live:** the ragdoll demo's ground plane loads the CC0 concrete
  texture (falls back to flat color if missing).
- **Money link:** $0 art cost, richer districts.

## 5. PostHog + Sentry — STAGED (dormant, needs accounts)

- **What:** `src/integrations-staged/posthog.ts`, `sentry.ts`, `README.md`.
  Not imported anywhere (dormancy check documented in the README).
- **PostHog:** dependency-free `initPostHog()`/`capture()` posting to
  `/capture/`; no-ops without `VITE_POSTHOG_KEY`. Free tier: 1M events/mo.
- **Sentry:** `initSentry()` dynamic-imports `@sentry/browser` only when
  `VITE_SENTRY_DSN` is set — package deliberately NOT installed yet, so the
  dormant bundle costs zero bytes. Free tier: 5k errors/mo.
- **Blocked on:** free-tier accounts — harvester owns signups; workers NEVER
  create accounts in his name.
- **Money link:** retention analytics + crash tracking are the revenue rails
  (what gets measured gets fixed; crashes become tickets, not 1-star reviews).

## Deferred / not done

- Full combat splice of the ragdoll module into `mount.ts`'s KO path
  (module + demo + documented call site are done; splicing is next).
- netplayjs rollback multiplayer, Cloudflare Web Analytics (P1 per map).
- `npm run typecheck` has one pre-existing error in `src/game3d/menu-art.tsx`
  (`onyx_gang` not in `FactionId`) — untouched by this work.
