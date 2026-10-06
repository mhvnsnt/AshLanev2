# tools/verify — visual verification & automated QA (the EYES workstream)

Enforces the owner's [deliverable-verification law](VERIFY_LAW.md): no deliverable
reaches the owner without proof.

## Quickstart

```bash
cd <repo root>

# 1) character GLB defect gates (feet / facing / exploded geometry, from animation data)
python3 tools/verify/defect_gates.py --glb public/models/cast/CIPHER_rigged.glb --out /tmp/gates.json

# 2) whole-timeline video QA (needs the bundled venv: cv2 + mediapipe)
tools/verify/.venv/bin/python tools/verify/video_qa.py --video docs/playtest/gameplay.mp4 \
    --out /tmp/video_qa.json --sheet /tmp/qa_sheet.png

# 3) render regression diff (before/after, thresholded + annotated)
python3 tools/verify/render_diff.py --before before.png --after after.png --out /tmp/diff.png --stats /tmp/diff.json

# 4) VLM / agent eyes-on loop for renders
python3 tools/verify/vlm_qa.py manifest --dir renders/ --out qa/     # then read every frame
python3 tools/verify/vlm_qa.py fill --checklist qa/checklist.json --results results.json --out qa/filled.json

# 5) THE GATE — run this, attach output to your completion report
python3 tools/verify/eyes_on_gate.py --proof qa/proof.json
```

## Tools

| Script | What it does | Needs |
|---|---|---|
| `defect_gates.py` | Law item 2 for characters: `feet_below_ground`, `facing_vs_movement` (no crab-walking), `exploded_geometry` (no ribbon/NaN) computed from GLB skinning sampled across animations; plus `static_qc` reusing `tools/model-qc` geometry primitives. JSON report; exit 1 on FAIL. | numpy, pygltflib (system python OK) |
| `video_qa.py` | Law item 2 for video: dense frame sampling across the WHOLE video, MediaPipe pose per frame, per scene-cut segment pass/fail (person detection, head cutoff, framing, frozen, jitter spikes). JSON report + contact sheet PNG. | `tools/verify/.venv` (opencv + mediapipe) |
| `render_diff.py` | Before/after render regression: thresholded pixel diff, % changed, changed-cell grid, annotated diff PNG + JSON stats. | PIL, numpy (system python OK) |
| `vlm_qa.py` | Law item 1: `manifest` builds a frame manifest + per-frame checklist (agent eyes-on mode — read every frame, then `fill`); `vlm` auto-fills via an OpenAI-compatible vision endpoint (`VLM_QA_ENDPOINT`); falls back to manifest mode when unset. | system python; ffmpeg for `--video` |
| `eyes_on_gate.py` | Law item 3: the mandatory gate. FAILs unless the proof JSON exists, every referenced frame file exists, every frame/shot carries a checklist with pass/fail+reasons, and automated gate reports are attached. Exit 0 = GATE PASS. | system python |
| `proof_template.json` | The completion-report proof format: which frames checked, per-shot checklist results, automated-gate refs, `new_defects_found` (law item 4). | — |

## The mandatory workflow

1. Build the thing.
2. Run the matching verify tool(s) for real — on the actual deliverable.
3. Copy `proof_template.json`, fill it with the actual frames you checked and the actual tool reports.
4. Run `eyes_on_gate.py --proof <proof>.json`.
5. **Attach the gate's output (and the tool reports) to your completion report.** Without it, the report is incomplete — it gets sent back.

## Environment

`tools/verify/.venv` is a repo-local virtualenv with `opencv-python-headless`,
`mediapipe`, `numpy`, `pillow`, `pygltflib` for `video_qa.py`. Rebuild it with:

```bash
python3 -m venv tools/verify/.venv
tools/verify/.venv/bin/pip install -r tools/verify/requirements.txt
```

## Licenses

See [LICENSE-MANIFEST.md](LICENSE-MANIFEST.md). Prototype rule applies: use what
works; GPL/AGPL-viral code stays quarantined out of ship paths; audit before ship.
