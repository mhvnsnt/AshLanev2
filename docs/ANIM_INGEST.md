# Animation Ingest Pipeline (STANDARD PROCESS)

> **Law:** Every animation that enters AshLane goes through the retargeter.
> No procedural bone animation (sine-wiggle walk cycles, manual Euler poses)
> is allowed in any shipped path — it produced the rejected "ballerina" promo.

## Pipeline location

`tools/anim-retarget/` — `ingest.py` (forward), `batch.py` (backfill),
`retarget.py` (core), `validate.py` (checks), `proof.py` (visual evidence),
`skeletons.py` (9-family registry), `canonical.py` (FK ground truth).

## Ingesting a NEW animation

```bash
cd tools/anim-retarget

# 1. Retarget a Mixamo/CMU/Rokoko/wrestling clip to the cast skeleton:
python3 ingest.py --src path/to/clip.glb --name suplex --kind wrestling
python3 ingest.py --src path/to/clip.bvh  --name idle2   --kind bvh

# 2. The tool:
#    - detects the source skeleton family (skeletons.py)
#    - retargets with rest-pose compensation: out = targetRest * inv(sourceRest) * key
#    - splits multi-character sources (C4D J_*_2/_3) into __p0/__p1 clips
#    - validates: coverage, T-pose contamination, joint limits, foot skate
#    - PASS  -> writes public/motion/retargeted/<name>.glb
#    - WARN  -> writes it + flags for review in out/REPORT.md
#    - FAIL  -> quarantines to out/quarantine/<name>/ with proof strip
```

## Rules

1. **SEE, don't guess.** Every ingested clip gets a proof strip
   (`proof.py` renders front+side stick figures on a canonical standing
   skeleton). Look at it before approving.
2. **Validation gates.** FAIL clips (T-pose contamination, exploded joints,
   missing core bones) do NOT ship — they quarantine with evidence.
3. **Rest-pose compensation is mandatory.** Retargeting without
   `targetRest * inv(sourceRest)` compensation is what causes T-pose
   contamination and ballerina limbs. The runtime retargeter
   (`src/game3d/universal-retarget.ts`, kept in sync with `skeletons.py`)
   applies the same math at load.
4. **Root motion:** clips with hip translation > 0.3 m keep root motion
   (scaled to target proportions); in-place clips are zeroed to origin.
5. **Promo pipeline** (`tools/promo-video/`) plays only baked real clips via
   `real-motion.js` — never procedural posing.

## Batch re-run (after library changes)

```bash
cd tools/anim-retarget && python3 batch.py
# -> public/motion/retargeted/*.glb + out/report.json + out/REPORT.md
```

Review `out/REPORT.md`: every WARN/FAIL links a proof strip. Fix or
quarantine; do not ship FAILs.
