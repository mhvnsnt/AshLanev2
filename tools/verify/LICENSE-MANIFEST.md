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
