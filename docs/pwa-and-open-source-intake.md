# AshLane playable PWA and open-source intake

## PWA behavior

The app already had a dynamic web manifest and platform install metadata from the Grok PWA middleware. `public/sw.js` adds a same-origin service worker for a reliable installed launch and best-effort offline play:

- navigation is network-first, with the cached home document as the offline fallback;
- static JS/CSS, GLB/Gltf animation/model files, the motion bank, and icons are cached after successful requests;
- API/auth and other dynamic routes are never cached;
- runtime asset cache is bounded to 55 entries and individual assets larger than 15 MiB are skipped when their response declares a size;
- failed optional precache entries do not prevent service-worker installation.

Offline availability is best-effort: open the game online first, visit the characters/arenas you intend to play so their model assets enter cache, and then test airplane mode. Browser quota and eviction rules still apply. The first launch cannot promise offline availability of every model.

Install on Android: open the deployed HTTPS app in Chrome, use the browser menu, and choose **Install app** or **Add to Home screen**. A successful CI build is not the same as a deployed build; confirm the live host is serving the latest main commit before testing.

## Existing assets already integrated

- `public/motion/ual/AnimationLibrary_Godot_Standard.gltf` and `.bin`: Quaternius Universal Animation Library, CC0 (license file shipped beside the assets).
- `public/models/kaykit/`: KayKit Adventurers, Skeletons, and props; CC0 provenance is recorded in `public/models/kaykit/NOTICE.txt`.
- `public/models/humanoid/`: Quaternius CC0 humanoid bodies, provenance documented in the KayKit notice.

These are actual checked-in files, not just recommendations. Their presence does not certify every animation/rig combination as playable; runtime clip names, retarget quality, and each combat slot still need testing.

## Open-source fighting-game and beat-'em-up intake queue

| Project | License / rights caution | AshLane use |
|---|---|---|
| [Ikemen GO](https://github.com/ikemen-engine/Ikemen-GO) | Engine MIT; bundled screenpack and community character assets have separate licenses. | Study character state machines, hit definitions, cancels, input commands, and move data. Do not copy characters or screenpack art by default. |
| [SlopArena](https://github.com/Binoui/SlopArena) | Repository MIT; Unity/C# and platform-fighter architecture are not drop-in Three.js code. | Study modular character packages, move-slot contracts, combat simulation tests, hitstop/hitstun, and deterministic move validation. |
| [Fury-Fist](https://github.com/KFCheems/Fury-Fist) | Code MIT; README flags upstream/extracted asset provenance for separate review. | Study beat-'em-up combat loop, crowd/arena flow, combo handling, and controller modes; do not import its assets until each is cleared. |
| [Deathblood Lazer](https://github.com/ironmoose/deathblood-lazer) | Code MIT; art/audio/character designs are explicitly All Rights Reserved. | Code-only reference for belt-scroll beat-'em-up flow, co-op and enemy wave structure. No asset import. |
| [Godot Mugen](https://github.com/jefersondaniel/godot-mugen) | BSD-3-Clause; early/incomplete project and data pack must be audited separately. | Compare browser-targeted fighting-game state architecture; not a production engine replacement. |
| [Quaternius UAL](https://quaternius.com/packs/universalanimationlibrary.html) | CC0; AshLane's current copy includes its license file. | Candidate source for unarmed movement/combat clips; only map a clip after exact clip inventory and live rig checks. |
| [KayKit Adventurers](https://github.com/KayKit-Game-Assets/KayKit-Character-Pack-Adventures-1.0) | CC0; notice is checked in. | Existing selectable source-style bodies and animation targets. |

## Import gate (no guesswork)

Every new game/code/asset source must be classified as one of:

1. **Code reference** — read and adapt concepts; record the source license and any copyleft obligations.
2. **Asset candidate** — exact files and per-file license verified, then added with a provenance notice.
3. **Integrated** — files are in the repo and referenced by code.
4. **Runtime verified** — exact fighter, rig, input, animation role, hit reaction, and gameplay loop tested.
5. **Rejected/blocked** — incompatible rig, unclear rights, missing source files, or license conflict.

Do not call a source "integrated" because a URL was found, or call a move "working" because its metadata exists. Keep AshLane's Urban Reign-inspired input grammar and its existing 3D GLB roster; do not replace the game with a different engine or a 2D MUGEN port.
