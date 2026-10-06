# Universal Animation Retarget Pipeline

The permanent fix for procedural-bone-animation garbage. Every animation that
enters AshLane goes through this pipeline: detect skeleton family, retarget
to the 58-bone cast skeleton with rest-pose compensation, validate
automatically, render visual proof.

## The rule

**Real motion capture, properly retargeted. Never procedural bone-wiggling.**

The old approach (manual `setBone` Euler offsets on sine curves, as was in
`tools/promo-video/cinematic.html`) produced the rejected "ballerina dancing"
promo. It is banned. This pipeline is the replacement.

## Modules

| File | What it does |
|------|--------------|
| `skeletons.py` | Registry of all 9 skeleton families -> canonical Mixamo slots. Detects family from bone names, handles C4D `_2`/`_3` multi-character suffixes. Mirrors `src/game3d/universal-retarget.ts` — keep in sync. |
| `common.py` | GLB read/write, quaternion math, skeleton loading. |
| `retarget.py` | `out = targetRest * inv(sourceRest) * key` per bone; splits paired (multi-character) sources; scales root motion to target proportions. CLI: `--src --ref --out`. |
| `canonical.py` | The cast GLB node offsets do NOT form an anatomical figure (verified vs three.js). Proofs and position analysis remap onto canonical standing offsets while keeping every bone's true animated orientation. |
| `validate.py` | Automated checks per clip: coverage, sanity (NaN/pops), T-pose contamination, knee/elbow hinge limits, foot skate (root-motion clips). Grades PASS/WARN/FAIL. |
| `proof.py` | Matplotlib stick-figure strips (front + side, N frames). The SEE-don't-guess evidence. |
| `batch.py` | Runs the whole `public/motion/` library: wrestling GLBs -> `public/motion/retargeted/`, UAL/bank/cmu validated + proofed. Writes `out/report.json` + `out/REPORT.md`. |
| `ingest.py` | Forward pipeline for NEW animations: `--src clip.glb|clip.bvh --name move_name`. PASS/WARN ship to `public/motion/retargeted/`; FAIL quarantines to `out/quarantine/`. |

## Workflows

**Batch the library:**
```
python3 batch.py
```

**Ingest one new animation:**
```
python3 ingest.py --src new_move.glb --name wrest_spear_01
python3 ingest.py --src capture.bvh --name street_walk_01
```

**Retarget a single file:**
```
python3 retarget.py --src in.glb --ref ../../public/models/cast/BRUTUS.glb --out out.glb
```

## Validation grades

- **PASS** — ships automatically.
- **WARN** — ships, but a human should look at the proof strip.
- **FAIL** — quarantined. Fix the source or the mapping, never ship.

Checks: `coverage` (>=80% of 20 core slots), `sanity` (no NaN, no pops),
`tpose` (no mid-clip rest collapse), `joints` (hinges stay one-sided),
`feet` (skate < 0.6 m/s during contact, root-motion clips only).

## Runtime companions

- `src/game3d/universal-retarget.ts` — same math live in the engine (add new
  families to BOTH files).
- `src/game3d/motion-bank.ts` — `bakeMotion` / `retargetUal` use identical
  rest-relative transfer for bank.json and UAL clips.
- `tools/promo-video/real-motion.js` — the promo pipeline's real-clip
  playback engine (replaces procedural `setBone` code).

## Known skeleton quirk

three.js strips the colon from `mixamorig:` names at load (`mixamorigHips`),
so runtime family detection sees cast models as `mixamo-packed`. The maps
handle both; retarget output uses colon names on disk.
