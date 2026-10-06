# tools/verify/LICENSE-MANIFEST.md

Every pulled tool/dependency used by `tools/verify/`, per the license policy:
prototype freely with whatever works; track every pulled tool here; keep
GPL/AGPL-viral code quarantined out of ship paths; audit before ship.

| Tool / package | License | Role | Viral risk |
|---|---|---|---|
| `mediapipe` 1.1.0 (pip, in `.venv`) | Apache-2.0 | pose detection in `video_qa.py` | none — permissive |
| `opencv-python-headless` 5.0.0 (pip, in `.venv`) | Apache-2.0 | frame decode in `video_qa.py` | none — permissive |
| `numpy` | BSD-3-Clause | math everywhere | none — permissive |
| `Pillow` | HPND (MIT-like) | image I/O in `render_diff.py` | none — permissive |
| `pygltflib` | Apache-2.0 | (available for GLB work; `defect_gates.py` uses in-repo reader) | none — permissive |
| `trimesh` | MIT | available | none — permissive |
| `ffmpeg` / `ffprobe` (system binaries, `/usr/bin`) | LGPL-2.1+ / GPL (build-dependent) | frame extraction, scene-cut detection; invoked as subprocess, NOT linked | none — process boundary; no code copied |
| `tools/model-qc/qc` (in-repo, compiled `.pyc` only — source not in repo) | unknown authorship — audit before ship | `geom_checks` reused by `defect_gates.py` static gate | none — in-repo, no external code |
| `tools/anim-retarget/common.py` (in-repo) | in-repo | GLB accessor + quaternion math reused by `defect_gates.py` | none — in-repo |

No GPL/AGPL-licensed code is imported or vendored by `tools/verify/`.
`ffmpeg` is only shelled out to; nothing is statically linked or copied.
Pre-ship: re-audit this manifest + confirm the `qc` module's provenance.

## Game integrations — AshLanev2 (wired 2026-10-06)

| Tool / package | License | Role | Viral risk |
|---|---|---|---|
| `@dimforge/rapier3d-compat` ^0.21.0 (npm, `src/game3d/physics/ragdoll.ts`) | Apache-2.0 | WASM rigid-body physics: ragdoll KOs, hit reactions, props | none — permissive; WASM blob, no copyleft |
| `playwright` + `playwright-core` (npm dev, `scripts/playtest.mjs`) | Apache-2.0 | headless playtest harness (menu→select→combat captures) | none — dev-only, not shipped |
| MediaPipe Pose via `mediapipe` 1.1.0 (pip, `.venv`) | Apache-2.0 | `pose_qa.py` automated pose gate on model renders (CPU) | none — permissive; dev/QA-only |
| Poly Haven textures `concrete_floor_02`, `asphalt_02` (1k, `public/textures/pbr/`) | CC0-1.0 | district ground materials | none — public domain; receipts in `*.LICENSE.txt` |
| Poly Haven HDRI `qwantani_afternoon` (2k, `public/textures/pbr/`) | CC0-1.0 | image-based lighting | none — public domain; receipt in `*.LICENSE.txt` |
| `src/integrations-staged/posthog.ts` (dormant) | in-repo (no dep) | PostHog analytics drop-in; zero bundle cost until key set | none — dormant, not imported |
| `src/integrations-staged/sentry.ts` (dormant) | in-repo (no dep) | Sentry crash-reporting drop-in; `@sentry/browser` intentionally NOT installed | none — dormant, not imported |

**Staged-activation rule:** PostHog/Sentry stay dormant until free-tier accounts
exist. Workers NEVER create accounts — the key harvester owns signups.
Activation steps: `src/integrations-staged/README.md`.

**GPL/AGPL quarantine:** none of the above is GPL/AGPL. If a GPL/AGPL tool is
ever pulled for prototyping, it goes in `tools/<name>/` with a
`GPL-QUARANTINE.txt` marker and MUST NOT be imported by `src/` or `public/`.
