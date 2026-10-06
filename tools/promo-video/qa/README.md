# video-qa — Automated defect gates for promo renders

No more relying on eyeballing still frames. This QA runs MediaPipe Pose
(PoseLandmarker, full model) over every Nth frame and fails the build on:

| Check      | What it catches |
|------------|-----------------|
| `ground`   | Characters sunk through the floor (head+shoulders+hips visible, feet gone) |
| `crabwalk` | Facing direction vs movement direction disagree >30° sustained (~1s) |
| `geometry` | Exploded/ribbon limbs (segment length >2.5x running median) |
| `frozen`   | ~Zero pixel change for >3s (frozen-splash class bug) |

## Usage

```bash
# frames directory (f_%05d.png)
./run-qa.sh --frames ../frames-faction-draft --out /tmp/qa-report

# video file directly
./run-qa.sh --video promo.mp4 --out /tmp/qa-report

# options
./run-qa.sh --frames <dir> --sample 2 --fps 24 \
  --allow-frozen "0-5,46-50"   # intentional stills (dark open, title cards)
```

Exit code: `0` = PASS, `1` = FAIL, `2` = error.
Output: `report.json` + `REPORT.md` + `fail_<check>_f<NNNNN>.png` in `--out`.

Set `QA_SAMPLE` env to override sampling. Set `QA_SKIP=1` to bypass the gate
in the build scripts (emergencies only — the bypass is logged).

## How it works

- **Multi-person**: PoseLandmarker with `num_poses=5`, run at full frame plus a
  1.5x center crop (catches small/dark figures), deduplicated by nose proximity.
- **Ground**: sunk = head/shoulders visible (>0.7) + hips detected (>0.5) +
  ankles missing (<0.3). Aggregated: FAIL only if >30% of a 2s window has hits
  (isolated misses don't fail).
- **Crab-walk**: facing = shoulder-axis perpendicular oriented by nose;
  motion = hip displacement over ~6 frames. Angle >30° for 12+ consecutive
  sampled frames while moving = sustained crab-walk.
- **Geometry**: per-track running median of 10 limb segments; spike >2.5x =
  exploded. Medians only adapt on clean frames.
- **Frozen**: mean abs diff of downscaled grayscale <1.0 for >3s.

## Setup

```bash
python3 -m venv .venv
.venv/bin/pip install mediapipe opencv-python-headless numpy
# system libs (apt): libegl1 libgl1 libgles2
# model: pose_landmarker_full.task (auto-checked; download URL in video-qa.py)
```

## Integration

`build-video.sh` and `build-faction-video.sh` run this gate on the frames
directory before assembly. A render that fails QA aborts the build — a broken
video can never be presented as done.
