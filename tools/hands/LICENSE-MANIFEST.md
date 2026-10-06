# tools/hands — license manifest

Owner policy (2026-10-06): prototype freely; keep GPL/AGPL-viral code
**quarantined out of ship paths**; audit before ship. This file tracks every
pulled tool's license so the pre-ship audit is mechanical.

**Ship boundary**: nothing under `tools/` ships to players. These are
dev-time/agent-time tools only (repo `tools/`, never bundled into the game
build). The pre-ship audit must confirm no tool dependency leaked into
`src/` imports or the production bundle.

## Pulled tools

| Tool | License | Version / source | Ship risk |
|---|---|---|---|
| Blender (if installed) | GPL-3.0 | apt `blender` or blender.org tarball | **Quarantined**: CLI use only, headless. Never link libblender into the game. GPL viral only if we distribute Blender-derived code — we don't; we run the binary. |
| trimesh | BSD-3-Clause | pip, 5.1.1 (preinstalled) | None — but only used in `tools/hands/mesh/`, not shipped |
| numpy | BSD-3-Clause | pip, 1.26.4 (preinstalled) | None — tool-only |
| pygltflib | Apache-2.0 | pip (preinstalled) | None — tool-only |
| fast-simplification | Apache-2.0 | pip (installed 2026-10-06 for mesh decimate) | None — tool-only |
| networkx | BSD-3-Clause | pip (installed 2026-10-06 for mesh hole-fill) | None — tool-only |
| Playwright (node) | Apache-2.0 | npm, 1.63.0 (`tools/hands/playtest/`) | None — devDependency-style local install, never in game bundle |
| Chromium (Playwright build) | BSD-3-Clause (+ third-party notices) | `~/.cache/ms-playwright/chromium-1243` | None — test browser only |
| ffmpeg | LGPL-2.1+ / GPL (build-dependent) | system `/usr/bin/ffmpeg` | **CLI use only** — invoked as a subprocess to encode run videos. Never link libav* into the game. |

## Pending / not yet pulled

| Tool | License | Note |
|---|---|---|
| bpy (Blender as Python module) | GPL-3.0 | Fallback if no system Blender. Same quarantine as Blender. |

## Pre-ship audit checklist

- [ ] `grep -r "trimesh\|bpy\|fast_simplification\|networkx" src/` returns nothing
- [ ] `tools/hands/playtest/node_modules` not referenced by game build
- [ ] `vite build` output contains no `playwright` chunk
- [ ] `window.__ashlane` is `undefined` in the production build (dev-hooks are `import.meta.env.DEV`-gated; verify with `?debug=1` absent)
