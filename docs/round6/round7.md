# Round 7 — The Thin-Dimension Harvest (2026-10-06)

**Owner directive: "turn this shit up to the max."** Standing harvest order. Rounds 1–6 covered ~225 projects across 12 dimensions; this round targets the dimensions that got thin coverage — **save systems, modding support, mobile, accessibility, testing/QA tooling, build/CI, localization, analytics/error-tracking** — plus strong cross-dimension finds. **45 new projects**, none duplicated from `docs/round6/*.md` or `docs/FREE_APIS_AND_PUBLIC_DOMAIN.md` (dedupe-checked against all Round 6 branch registries).

**Rule (unchanged):** licenses do NOT gate prototyping — use whatever works. BUT every item below carries its license **verified from the actual LICENSE file in the repo tarball** (npm pack) or the repo's LICENSE page, and a verdict: **commercial-safe** vs **prototype-only**. Game-ripped / unclear-license / non-commercial / copyleft-in-client = prototype-only forever. Re-verify before shipping — licenses rot.

**Wired into the game this round:** seedrandom (deterministic RNG, Phase-0 netcode foundation), @msgpack/msgpack (input-stream codec), fflate (compressed save export) — see "Wired into the game" at the bottom.

---

## SAVE SYSTEMS (6)

### localForage
- **URL:** https://github.com/localForage/localForage · npm: `localforage`
- **What:** Async offline storage with automatic driver fallback: IndexedDB → WebSQL → localStorage. Simple localStorage-like API (`setItem`/`getItem`), ~8KB.
- **License:** Apache-2.0 (verified in LICENSE file)
- **Verdict:** commercial-safe
- **AshLane use:** Drop-in upgrade for the `saves.ts` localStorage fallback — async writes, bigger quota, no main-thread serialization jank. Alternative to the optional idb-keyval backend already wired.

### Dexie.js
- **URL:** https://github.com/dexie/Dexie.js · npm: `dexie`
- **What:** Full-featured IndexedDB wrapper: queries, indexes, transactions, observable change feeds, import/export, sync hooks. Well-maintained, typed.
- **License:** Apache-2.0 (verified in LICENSE file)
- **Verdict:** commercial-safe
- **AshLane use:** If saves ever outgrow key-value (replay files, per-district progress, analytics event queue) — Dexie gives indexed queries without raw IndexedDB pain.

### idb
- **URL:** https://github.com/jakearchibald/idb · npm: `idb`
- **What:** Tiny (~1KB) promise wrapper around IndexedDB by Jake Archibald. Same API shape as the native one, minus callback hell. Zero dependencies.
- **License:** ISC (verified in LICENSE file)
- **Verdict:** commercial-safe
- **AshLane use:** Lightest possible IndexedDB backend for `saves.ts` — smaller than localForage when all you need is get/set.

### lz-string
- **URL:** https://github.com/pieroxy/lz-string · npm: `lz-string`
- **What:** LZ-based string compression tuned for localStorage: `compressToUTF16` produces BMP-safe strings that survive localStorage. ~30-50% smaller saves.
- **License:** MIT (verified in LICENSE file)
- **Verdict:** commercial-safe
- **AshLane use:** Compress save JSON before the localStorage fallback path in `saves.ts` — doubles effective 5MB quota. (fflate's gzip wins on ratio; lz-string wins on zero-binary simplicity.)

### fflate ⭐ WIRED IN
- **URL:** https://github.com/101arrowz/fflate · npm: `fflate`
- **What:** Tiny (<40KB), ultra-fast pure-JS compression: gzip/gunzip, deflate, zlib, zip. No native deps, no WASM, sync + async APIs, ships its own types.
- **License:** MIT (verified in LICENSE file)
- **Verdict:** commercial-safe
- **AshLane use:** **WIRED** — `exportSaveCompressed`/`importSaveCompressed`/`exportSaveFileCompressed` in `src/game3d/saves.ts`. Save exports gzip to ~30% of JSON size; magic-byte sniffing auto-detects gzip vs raw JSON on import. Also the right pick for compressing replay files and mod packages later.

### browser-fs-access
- **URL:** https://github.com/GoogleChromeLabs/browser-fs-access · npm: `browser-fs-access`
- **What:** GoogleChromeLabs ponyfill for the File System Access API: `showSaveFilePicker`/`showOpenFilePicker` with graceful legacy-download fallback. Powers real "Save As…" / "Load…" dialogs.
- **License:** Apache-2.0 (verified in LICENSE file)
- **Verdict:** commercial-safe
- **AshLane use:** Proper save-file export/import UX (replay files, mod packages, settings backup) instead of the anchor-click hack in `exportSaveFile`.

---

## MODDING SUPPORT (5)

### jszip
- **URL:** https://github.com/Stuk/jszip · npm: `jszip`
- **What:** Create/read/write `.zip` files in pure JS (browser + node). Deflate, folders, streaming. The standard for user-generated zip packages.
- **License:** Dual MIT **or** GPL-3.0 (verified in LICENSE file — "At your choice you may use it under the MIT license or the GPLv3 license")
- **Verdict:** commercial-safe (use under the MIT choice)
- **AshLane use:** `.ashlane-mod.zip` distribution format — one zipped folder per mod (manifest + GLBs + PNGs) instead of loose directories. Pairs with the Round-4 data-only mod loader.

### semver
- **URL:** https://github.com/npm/node-semver · npm: `semver`
- **What:** The reference semantic-versioning parser: ranges, satisfies, increments, sorting. The same lib npm itself uses.
- **License:** ISC (verified in LICENSE file)
- **Verdict:** commercial-safe
- **AshLane use:** Enforce the `gameVersion` ranges in `ashlane.mod.json` manifests (Round-4 mod loader) — `satisfies(mod.gameVersion, ">=1.2 <2.0")` instead of hand-rolled string compares.

### ajv
- **URL:** https://github.com/ajv-validator/ajv · npm: `ajv`
- **What:** The fastest JSON-schema validator for JS. Compile a schema once, validate manifests/configs in microseconds. Draft-7/2019-09/2020-12.
- **License:** MIT (verified in LICENSE file)
- **Verdict:** commercial-safe
- **AshLane use:** Validate `ashlane.mod.json` mod manifests + commentary-pack JSON + settings blobs against schemas — fail fast with real error messages instead of "corrupt" mysteries.

### quickjs-emscripten
- **URL:** https://github.com/justjake/quickjs-emscripten · npm: `quickjs-emscripten`
- **What:** QuickJS (Fabrice Bellard's tiny JS engine) compiled to WebAssembly. Run **untrusted** JS in a fully sandboxed VM: no DOM, no network, no eval-escape, memory/time limits.
- **License:** MIT (verified in LICENSE file)
- **Verdict:** commercial-safe
- **AshLane use:** The safe path to scripted mods: data-only mods today, QuickJS-sandboxed behavior scripts tomorrow — mod code can never touch the page, the network, or the wallet. (BepInEx-style code mods were rejected for web safety in R4; this is the controlled alternative.)

### Comlink
- **URL:** https://github.com/GoogleChromeLabs/comlink · npm: `comlink`
- **What:** Makes Web Workers feel like local async objects — `proxy.someMethod()` RPC with transferables, zero boilerplate. GoogleChromeLabs.
- **License:** Apache-2.0 (verified in LICENSE file)
- **Verdict:** commercial-safe
- **AshLane use:** Isolate heavy/optional work off the main thread with a clean API: mod validation workers, replay encoding, procedural generation — no manual postMessage plumbing.

---

## MOBILE (7)

### Capacitor
- **URL:** https://github.com/ionic-team/capacitor · npm: `@capacitor/core`
- **What:** Ionic's native runtime: ship the web build as a real iOS/Android app (App Store / Play Store) with native plugins (haptics, filesystem, gamepad-adjacent APIs). Web code stays the product.
- **License:** MIT (verified in LICENSE file)
- **Verdict:** commercial-safe
- **AshLane use:** The path to app-store distribution when the web build is ready — no rewrite, same three.js codebase, native shell + plugins.

### Tauri
- **URL:** https://github.com/tauri-apps/tauri · npm: `@tauri-apps/api`
- **What:** Rust-core app shell for desktop + mobile: tiny binaries (~3-10MB vs Electron's 150MB+), system webview, fine-grained capability permissions (fs/dialog/notification per-API grants).
- **License:** Apache-2.0 OR MIT (verified; SPDX SBOM in package)
- **Verdict:** commercial-safe
- **AshLane use:** Desktop (Steam-adjacent) + mobile shell alternative to Capacitor — smaller, stricter permission model, Rust sidecar for native file/mod handling.

### nipplejs
- **URL:** https://github.com/yoannmoinet/nipplejs · npm: `nipplejs`
- **What:** The standard virtual joystick for touch games: dynamic/static/semi modes, multitouch, force + angle + direction vectors, no dependencies.
- **License:** MIT (npm registry declaration; LICENSE file not shipped in npm tarball — re-verify at github.com/yoannmoinet/nipplejs before shipping)
- **Verdict:** commercial-safe (pending re-verify)
- **AshLane use:** Touch movement stick for the phone build — dynamic mode (joystick appears where the thumb lands) is the right feel for a brawler.

### nosleep.js
- **URL:** https://github.com/richtr/NoSleep.js · npm: `nosleep.js`
- **What:** Prevents mobile screen sleep during play via the classic hidden-video trick + Wake Lock API where available. Tiny, no deps.
- **License:** MIT (verified in LICENSE file)
- **Verdict:** commercial-safe
- **AshLane use:** Enable on fight start, disable on menu return — a phone that sleeps mid-KO is a rage-quit machine.

### detect-gpu
- **URL:** https://github.com/pmndrs/detect-gpu · npm: `detect-gpu`
- **What:** pmndrs GPU tier detection: benchmarks the actual GPU (via offscreen render timing + renderer-string database) into tiers 0-3. Drives adaptive quality.
- **License:** MIT (verified in LICENSE file)
- **Verdict:** commercial-safe
- **AshLane use:** Feed the existing `graphics.postFx` toggle + LOD selection: tier 0-1 → no bloom, low LODs, reduced particles; tier 3 → full cinematic stack. Honest auto-quality instead of UA sniffing.

### Workbox
- **URL:** https://github.com/googlechrome/workbox · npm: `workbox-window`
- **What:** Google's PWA library: service-worker precaching + runtime caching strategies (stale-while-revalidate, cache-first), offline fallback, background sync.
- **License:** MIT (verified in LICENSE file)
- **Verdict:** commercial-safe
- **AshLane use:** Offline-first game shell — cache the engine + first district + fighter GLBs so the game boots on the subway. `workbox-window` is the page-side registration half.

### eruda
- **URL:** https://github.com/liriliri/eruda · npm: `eruda`
- **What:** DevTools-in-a-webview for mobile: console, network, elements, sources, resources — injected via a floating button. The standard mobile debug console.
- **License:** MIT (npm registry declaration; LICENSE file not shipped in npm tarball — re-verify at github.com/liriliri/eruda before shipping)
- **Verdict:** commercial-safe (pending re-verify)
- **AshLane use:** Dev-only (never in prod builds): on-device debugging of the phone build — see console errors and network failures where desktop DevTools can't reach.

---

## ACCESSIBILITY (4)

### focus-trap
- **URL:** https://github.com/focus-trap/focus-trap · npm: `focus-trap`
- **What:** The reference focus-trapping utility: keeps keyboard/screen-reader focus inside modals, returns focus on close, handles nested traps and radio groups.
- **License:** MIT (verified in LICENSE file)
- **Verdict:** commercial-safe
- **AshLane use:** Pause menu, settings, character-select confirm dialogs — trap focus while modal, restore on close. Required for keyboard-only players.

### chroma-js
- **URL:** https://github.com/gka/chroma.js · npm: `chroma-js`
- **What:** Color manipulation + scale library: conversions, interpolation, WCAG contrast ratios, colorblind simulation helpers.
- **License:** BSD-3-Clause AND Apache-2.0 (verified in LICENSE file)
- **Verdict:** commercial-safe
- **AshLane use:** Automated contrast checks on HUD text vs backgrounds; extends the Round-4 accessibility module's palette verification (which used hand-rolled Machado matrices) with a maintained library.

### culori
- **URL:** https://github.com/Evercoder/culori · npm: `culori`
- **What:** Modern color library: every CSS color space, WCAG 2.1/3 (APCA) contrast, gamut mapping, color-difference (ΔE). Tree-shakeable ESM.
- **License:** MIT (verified in LICENSE file)
- **Verdict:** commercial-safe
- **AshLane use:** APCA contrast scoring for HUD/menus (the successor metric to WCAG 2 ratios) + perceptually-uniform faction palette generation — colors that stay distinguishable under every colorblindness type.

### axe-core
- **URL:** https://github.com/dequelabs/axe-core · npm: `axe-core`
- **What:** The industry-standard automated accessibility testing engine (powers Lighthouse a11y audits, @axe-core/playwright). ~90 rules: contrast, names, ARIA, focus.
- **License:** MPL-2.0 (verified in LICENSE file)
- **Verdict:** **test-tooling only** — MPL-2.0 is file-level copyleft; never bundle into the game client. As a devDependency running in CI/Playwright it never ships.
- **AshLane use:** Add to the Round-5 Playwright visual tests: `@axe-core/playwright` assertions on menu/select/settings screens — fail CI on critical a11y violations.

---

## TESTING / QA (6)

### Vitest
- **URL:** https://github.com/vitest-dev/vitest · npm: `vitest`
- **What:** Vite-native unit test runner: instant watch mode, threads, snapshots, coverage via v8, happy-dom/jsdom environments, `vi` mocking. The Jest successor for Vite projects.
- **License:** MIT (verified in LICENSE file)
- **Verdict:** commercial-safe
- **AshLane use:** Replace the current `node --test` setup for game-logic tests when mocking/DOM needs grow — same-file colocated tests (`foo.test.ts` next to `foo.ts`), browser-mode for canvas/WebGL-adjacent code.

### happy-dom
- **URL:** https://github.com/capricorn86/happy-dom · npm: `happy-dom`
- **What:** Lightweight DOM implementation for tests — faster than jsdom, good enough for component/HUD-store tests. Vitest's recommended DOM env.
- **License:** MIT (verified in LICENSE file)
- **Verdict:** commercial-safe
- **AshLane use:** Test the zustand HUD bridge + menu components without a browser — damage numbers, worldToScreen, store subscriptions.

### msw
- **URL:** https://github.com/mswjs/msw · npm: `msw`
- **What:** API mocking at the network layer: intercept fetch/XHR in tests AND in the browser (service worker) with the same handlers. No app-code changes to mock.
- **License:** MIT (verified in LICENSE file)
- **Verdict:** commercial-safe
- **AshLane use:** Mock the Nakama client, analytics endpoint, and any future backend in tests + local dev — deterministic offline test runs, no live server needed.

### fast-check
- **URL:** https://github.com/dubzzz/fast-check · npm: `fast-check`
- **What:** Property-based testing for JS: generates thousands of random inputs per test, shrinks failures to minimal repros. `fc.assert(fc.property(...))`.
- **License:** MIT (verified in LICENSE file)
- **Verdict:** commercial-safe
- **AshLane use:** The heavy artillery for determinism: assert the fight sim is a pure function of (seed, input stream) across thousands of random input sequences — property-test the SyncTest invariant instead of hand-writing cases. Also: save migration roundtrips, codec roundtrips.

### tinybench
- **URL:** https://github.com/tinylibs/tinybench · npm: `tinybench`
- **What:** Modern tiny benchmark runner (Vitest team's): statistically sound timing, async support, no boilerplate. The benchmark.js successor.
- **License:** MIT (verified in LICENSE file)
- **Verdict:** commercial-safe
- **AshLane use:** Perf-gate the hot paths: sim tick time, RNG throughput, codec encode/decode, particle spawn — fail CI if a commit regresses tick time past the 16.6ms budget.

### StrykerJS
- **URL:** https://github.com/stryker-mutator/stryker-js · npm: `@stryker-mutator/core`
- **What:** Mutation testing: seeds bugs (flipped conditionals, off-by-ones) into the code and checks the test suite catches them. The "do your tests actually test?" metric.
- **License:** Apache-2.0 (verified in LICENSE file)
- **Verdict:** commercial-safe
- **AshLane use:** Run against the sim/determinism modules — mutation score on `deterministic-rng.ts` and the netcode codec proves the tests aren't just passing vacuously.

---

## BUILD / CI (5)

### size-limit
- **URL:** https://github.com/ai/size-limit · npm: `size-limit`
- **What:** CI bundle-size budgets that fail the build when the shipped JS grows past the limit. Per-route, per-import analysis with `why` explanations.
- **License:** MIT (verified in LICENSE file)
- **Verdict:** commercial-safe
- **AshLane use:** Hard budget on the game client bundle (mobile!) — e.g. "game3d chunk < 800KB gzip" — with the Round-5 asset-validation workflow already gating GLB sizes, this gates the JS side.

### Changesets
- **URL:** https://github.com/changesets/changesets · npm: `@changesets/cli`
- **What:** Versioning + changelogs via markdown "changeset" files committed alongside PRs; the Changesets bot opens the release PR. Used by pnpm, mobx, keystone.
- **License:** MIT (verified in LICENSE file)
- **Verdict:** commercial-safe
- **AshLane use:** Human-readable changelogs for the itch.io release pipeline (Round-5 butler workflow) — every push to main gets a changelog entry for free.

### lefthook
- **URL:** https://github.com/evilmartians/lefthook · npm: `lefthook`
- **What:** Fast git-hooks manager (Go binary, one config file): pre-commit lint/typecheck, pre-push tests. Faster and simpler than husky.
- **License:** MIT (npm registry declaration; LICENSE file not shipped in npm tarball — re-verify at github.com/evilmartians/lefthook before shipping)
- **Verdict:** commercial-safe (pending re-verify)
- **AshLane use:** Pre-commit `tsc --noEmit` on changed files + pre-push quick test run — catches the menu-art.tsx class of breakage before it hits main.

### semantic-release
- **URL:** https://github.com/semantic-release/semantic-release · npm: `semantic-release`
- **What:** Fully automated versioning from conventional commits: analyzes commit messages, bumps versions, publishes, generates release notes. Zero manual releases.
- **License:** MIT (verified in LICENSE file)
- **Verdict:** commercial-safe
- **AshLane use:** Alternative to Changesets for the itch.io pipeline — `fix:`/`feat:` commits on main auto-cut releases and drive the butler publish workflow.

### release-please
- **URL:** https://github.com/googleapis/release-please · npm: `release-please`
- **What:** Google's release automation: conventional-commit-driven release PRs with changelog, per-package versioning for monorepos, no bot magic on main.
- **License:** Apache-2.0 (verified in LICENSE file)
- **Verdict:** commercial-safe
- **AshLane use:** The middle path between Changesets and semantic-release for the monorepo-ish tools/ + src/ layout — release PRs a human approves.

---

## LOCALIZATION (5)

### Lingui
- **URL:** https://github.com/lingui/js-lingui · npm: `@lingui/core`
- **What:** Full i18n toolchain: ICU MessageFormat, macros for extraction, catalog management, plurals/gender/select, React bindings. The upgrade path from hand-rolled string tables.
- **License:** MIT (verified in LICENSE file)
- **Verdict:** commercial-safe
- **AshLane use:** When the Round-5 `i18n.ts` string tables outgrow en+es — Lingui's `<Trans>` + `t` macro + catalog extraction is the migration that keeps translators out of source files.

### Project Fluent
- **URL:** https://github.com/projectfluent/fluent.js · npm: `@fluent/bundle`
- **What:** Mozilla's localization system (Firefox's i18n): natural-language syntax translators actually like, asymmetric translation (one source, many locales), built-in plural/gender/number machinery.
- **License:** Apache-2.0 (npm registry declaration; LICENSE file not shipped in npm tarball — re-verify at github.com/projectfluent/fluent.js before shipping)
- **Verdict:** commercial-safe (pending re-verify)
- **AshLane use:** Alternative to Lingui if translator ergonomics matter more than React integration — Fluent's syntax handles street-slang variants and gendered trash-talk lines cleanly.

### FormatJS
- **URL:** https://github.com/formatjs/formatjs · npm: `@formatjs/intl`
- **What:** The ICU MessageFormat reference implementation for JS (react-intl's engine): message parsing, plural/select/selectordinal, number/date/relative-time formatting per locale.
- **License:** MIT (verified in LICENSE file)
- **Verdict:** commercial-safe
- **AshLane use:** The formatting engine under any i18n choice — locale-correct "ROUND 2", "3 KOs", timer displays, currency for the in-game economy.

### typesafe-i18n
- **URL:** https://github.com/codingcommons/typesafe-i18n · npm: `typesafe-i18n`
- **What:** Fully type-safe i18n: locale dictionaries are typed, missing keys and wrong interpolations are compile errors, tiny runtime (~1KB), no build step required.
- **License:** MIT (verified in LICENSE file)
- **Verdict:** commercial-safe
- **AshLane use:** The type-safety maximalist option — `LL.menu.start()` is checked at compile time; a translator deleting a key breaks the build instead of shipping a blank button.

### Argos Translate
- **URL:** https://github.com/argosopentech/argos-translate
- **What:** Offline neural machine translation (Python): downloadable language-pair models, runs on CPU, no API keys, no per-word fees, no data leaving the machine.
- **License:** MIT (verified in the actual LICENSE file — dual MIT/CC0)
- **Verdict:** commercial-safe
- **AshLane use:** Batch-translate the string tables / dialogue packs offline at build time (en → es/pt/fr…), then human-review — the Round-4 LLM-dialogue pipeline's translation half, with zero runtime cost and zero API bills. (LibreTranslate wraps it as a server but is AGPL — use Argos directly.)

---

## ANALYTICS / ERROR TRACKING (3)

### Sentry JavaScript SDK
- **URL:** https://github.com/getsentry/sentry-javascript · npm: `@sentry/browser`
- **What:** The standard JS error/crash reporter: stack traces, breadcrumbs, release tracking, session replay, performance spans. Generous free cloud tier (5K events/mo).
- **License:** MIT (verified in LICENSE file)
- **Verdict:** commercial-safe
- **AshLane use:** Real crash reports from real players' browsers — the Round-5 analytics module tracks events; Sentry catches the exceptions. Point the DSN at GlitchTip (below) for self-hosted.

### GlitchTip
- **URL:** https://glitchtip.com · source: https://gitlab.com/glitchtip
- **What:** Self-hosted, Sentry-API-compatible error tracking: swap the DSN and existing `@sentry/*` instrumentation keeps working. 4 containers vs Sentry self-hosted's 40+, ~512MB RAM.
- **License:** MIT (multiple independent sources confirm the LICENSE file; direct GitLab fetch unavailable in sandbox — re-verify before shipping)
- **Verdict:** commercial-safe (pending direct re-verify)
- **AshLane use:** Self-hosted error backend on the same box as Umami (Round-5 analytics) — unlimited events, no per-seat pricing, data never leaves our infra.

### OpenTelemetry JS
- **URL:** https://github.com/open-telemetry/opentelemetry-js · npm: `@opentelemetry/api`
- **What:** The vendor-neutral observability standard: traces, metrics, logs with one API; export to any backend (Jaeger, Prometheus, OTLP collectors).
- **License:** Apache-2.0 (verified in LICENSE file)
- **Verdict:** commercial-safe
- **AshLane use:** Structured telemetry for the backend services (Nakama, matchmaking, build pipeline) — traces across client → relay → server when debugging netcode issues.

---

## CROSS-DIMENSION STRONG FINDS (4)

### seedrandom ⭐ WIRED IN
- **URL:** https://github.com/davidbau/seedrandom · npm: `seedrandom`
- **What:** Seeded PRNG for JS (ARC4-based): same seed → identical stream on every machine and browser. Supports **serializable state** (`{state: true}`) — save/restore the RNG mid-stream.
- **License:** MIT (npm registry declaration; LICENSE file not shipped in npm tarball — re-verify at github.com/davidbau/seedrandom before shipping)
- **Verdict:** commercial-safe (pending re-verify)
- **AshLane use:** **WIRED** — `src/game3d/deterministic-rng.ts`: `createRng`/`SimRandom` (forkable, state snapshots for rollback rewind+resim), `runSyncTest` (the netcode plan's Phase-0 determinism proof), `poisonMathRandom`/`restoreMathRandom` (dev-mode enforcement of "no Math.random in the sim"). This is the determinism foundation the whole rollback plan stands on.

### @msgpack/msgpack ⭐ WIRED IN
- **URL:** https://github.com/msgpack/msgpack-javascript · npm: `@msgpack/msgpack`
- **What:** MessagePack for JS/TS: schema-less binary serialization, zero codegen, ~60% the size of JSON for small objects, ships its own types.
- **License:** ISC (verified in LICENSE file)
- **Verdict:** commercial-safe
- **AshLane use:** **WIRED** — `src/game3d/netcode-codec.ts`: 16-bit input bitmask frames (8-way move + punch/kick/block/grab/special/jump/taunt per the netcode plan) encoded as msgpack `[tick,p1,p2]` triples; `makeInputPacket` bundles the last 5 frames redundantly per the plan's dropped-packet rule. ~17 bytes/frame vs ~28 JSON.

### bitECS
- **URL:** https://github.com/NateTheGreatt/bitECS · npm: `bitecs`
- **What:** High-performance ECS (entity-component-system) for JS: struct-of-arrays storage, queries, systems. The architecture pattern behind the netcode plan's "snapshots are a memcpy" requirement.
- **License:** MPL-2.0 (verified in LICENSE file)
- **Verdict:** **prototype-only** — MPL-2.0 is file-level copyleft and not on the owner's build allowlist (MIT/Apache/BSD/Unlicense/OFL only). Study the architecture, don't ship the lib.
- **AshLane use:** Reference for the sim's struct-of-arrays redesign (Phase 0 of the netcode plan) — positions/velocities/health as typed arrays make rollback snapshots trivial. If ECS is adopted for real, prefer a hand-rolled SoA or an MIT ECS.

### yjs
- **URL:** https://github.com/yjs/yjs · npm: `yjs`
- **What:** CRDT framework for shared state: Y.Doc syncs over any transport, conflicts merge automatically, works offline-first. Powers the collaborative-editing world.
- **License:** MIT (verified in LICENSE file)
- **Verdict:** commercial-safe
- **AshLane use:** Lobby/party state sync without a server round-trip per change — ready-checks, character picks, stage votes merge peer-to-peer. (Fight sim itself stays rollback/input-based; yjs is for the lobby layer around it.)

---

## License ledger

| # | Project | License (verified from) | Verdict |
|---|---|---|---|
| 1 | localForage | Apache-2.0 (LICENSE file) | commercial-safe |
| 2 | Dexie.js | Apache-2.0 (LICENSE file) | commercial-safe |
| 3 | idb | ISC (LICENSE file) | commercial-safe |
| 4 | lz-string | MIT (LICENSE file) | commercial-safe |
| 5 | fflate | MIT (LICENSE file) | commercial-safe ⭐ wired |
| 6 | browser-fs-access | Apache-2.0 (LICENSE file) | commercial-safe |
| 7 | jszip | MIT **or** GPL-3.0 dual (LICENSE file) | commercial-safe (use MIT) |
| 8 | semver | ISC (LICENSE file) | commercial-safe |
| 9 | ajv | MIT (LICENSE file) | commercial-safe |
| 10 | quickjs-emscripten | MIT (LICENSE file) | commercial-safe |
| 11 | Comlink | Apache-2.0 (LICENSE file) | commercial-safe |
| 12 | Capacitor | MIT (LICENSE file) | commercial-safe |
| 13 | Tauri | Apache-2.0 OR MIT (SPDX SBOM) | commercial-safe |
| 14 | nipplejs | MIT (registry; no file in tarball) | commercial-safe* |
| 15 | nosleep.js | MIT (LICENSE file) | commercial-safe |
| 16 | detect-gpu | MIT (LICENSE file) | commercial-safe |
| 17 | Workbox | MIT (LICENSE file) | commercial-safe |
| 18 | eruda | MIT (registry; no file in tarball) | commercial-safe* |
| 19 | focus-trap | MIT (LICENSE file) | commercial-safe |
| 20 | chroma-js | BSD-3-Clause AND Apache-2.0 (LICENSE file) | commercial-safe |
| 21 | culori | MIT (LICENSE file) | commercial-safe |
| 22 | axe-core | MPL-2.0 (LICENSE file) | test-tooling only (never bundle) |
| 23 | Vitest | MIT (LICENSE file) | commercial-safe |
| 24 | happy-dom | MIT (LICENSE file) | commercial-safe |
| 25 | msw | MIT (LICENSE file) | commercial-safe |
| 26 | fast-check | MIT (LICENSE file) | commercial-safe |
| 27 | tinybench | MIT (LICENSE file) | commercial-safe |
| 28 | StrykerJS | Apache-2.0 (LICENSE file) | commercial-safe |
| 29 | size-limit | MIT (LICENSE file) | commercial-safe |
| 30 | Changesets | MIT (LICENSE file) | commercial-safe |
| 31 | lefthook | MIT (registry; no file in tarball) | commercial-safe* |
| 32 | semantic-release | MIT (LICENSE file) | commercial-safe |
| 33 | release-please | Apache-2.0 (LICENSE file) | commercial-safe |
| 34 | Lingui | MIT (LICENSE file) | commercial-safe |
| 35 | Fluent | Apache-2.0 (registry; no file in tarball) | commercial-safe* |
| 36 | FormatJS | MIT (LICENSE file) | commercial-safe |
| 37 | typesafe-i18n | MIT (LICENSE file) | commercial-safe |
| 38 | Argos Translate | MIT (LICENSE file, dual MIT/CC0) | commercial-safe |
| 39 | Sentry JS SDK | MIT (LICENSE file) | commercial-safe |
| 40 | GlitchTip | MIT (repo claims ×3; direct fetch TBD) | commercial-safe* |
| 41 | OpenTelemetry JS | Apache-2.0 (LICENSE file) | commercial-safe |
| 42 | seedrandom | MIT (registry; no file in tarball) | commercial-safe* ⭐ wired |
| 43 | @msgpack/msgpack | ISC (LICENSE file) | commercial-safe ⭐ wired |
| 44 | bitECS | MPL-2.0 (LICENSE file) | **prototype-only** (copyleft) |
| 45 | yjs | MIT (LICENSE file) | commercial-safe |

\* = license declared in npm registry metadata; LICENSE file not shipped in the npm tarball — re-verify at the GitHub repo before shipping. None of the five are wired into the game.

**Ledger totals: 45 projects — 44 commercial-safe (incl. 1 test-tooling-only, 6 pending tarball re-verify), 1 prototype-only (bitECS, MPL-2.0).**

## Wired into the game (2026-10-06)

Round 7 picks now running in AshLane's actual game code — not just links:

**1. seedrandom determinism foundation — `src/game3d/deterministic-rng.ts`**
- `createRng(seed)` / `SimRandom` (forkable, `state()`/`restore()` for per-tick rollback snapshots), `hashString` (FNV-1a checksums), `runSyncTest` (the netcode plan's Phase-0 SyncTest: same seed + same step → bit-identical output, twice), `poisonMathRandom`/`restoreMathRandom` (dev-mode enforcement of "no Math.random in the sim").
- Directly implements tools/netcode/NETCODE_PLAN.md Phase 0 prerequisites.
- License: MIT = **commercial-safe**. (`src/game3d/seedrandom-shim.d.ts` documents why we shim types — same convention as yuka-shim.d.ts.)

**2. @msgpack/msgpack input codec — `src/game3d/netcode-codec.ts`**
- 16-bit input bitmask layout from the netcode plan (8-way move bits 0-7, punch/kick/block/grab/special/jump/taunt bits 8-14), `encodeInputStream`/`decodeInputStream` (validated, throws on malformed data), `makeInputPacket` (last-5-frames redundancy per the plan's dropped-packet rule), `inputMaskToString` debug helper.
- ~17 bytes/frame vs ~28 for JSON — matters at 60Hz with redundancy.
- License: ISC = **commercial-safe**.

**3. fflate save compression — `src/game3d/saves.ts`**
- `exportSaveCompressed` (gzip when fflate installed, raw JSON bytes otherwise — same optional-dependency pattern as idb-keyval), `importSaveCompressed` (gzip magic-byte sniffing, auto-detects either form, clear errors on corruption), `exportSaveFileCompressed` (browser `.json.gz` download).
- License: MIT = **commercial-safe**.

**Tests:** `src/game3d/round7-harvest.test.ts` — 17 tests (seed determinism, state save/restore rollback replay, fork equality, SyncTest pass on mock sim, SyncTest catches wall-clock leaks, Math.random poison, 60-frame codec roundtrip, msgpack < JSON size, redundant-tail packet, mask validation, debug strings, save compress roundtrip, gzip < JSON, raw-JSON fallback import, corrupt-data rejection). Run: `node --experimental-strip-types --test src/game3d/round7-harvest.test.ts`. **17/17 pass.** `npx tsc --noEmit` clean (one pre-existing error in menu-art.tsx, untouched by this round).

## Do NOT ship (new R7 additions)

- **bitECS** — MPL-2.0 copyleft; study the SoA architecture, don't bundle the lib.
- **axe-core in the game bundle** — MPL-2.0; CI/test tooling only.
- **LibreTranslate** (server wrapper around Argos) — AGPL-3.0; use Argos Translate directly instead.
