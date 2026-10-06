# Step 1 Proof — Universal Orientation Fix (2026-10-06)

**Owner ask:** fix orientation UNIVERSALLY (every model, every animation), then prove
visually: chest faces travel direction, no sideways slide, feet on ground.

## The fix — `tools/promo-video/staging.js`

`CharacterStaging` auto-detects each model's forward from its own skeleton at load:
- **Shoulder line** (Right−Left clavicle, XZ) → exact left-right axis; forward is perpendicular.
- **Toe direction** (Toe−Foot, XZ) → resolves the ± sign (turnout-proof: sign is unambiguous).

No per-model constants. Explicit override still available. Both cinematics
(`cinematic.html`, `cinematic-faction.html`) use this one code path.

**Ground truth (corrected 2026-10-06):** all cast GLBs face local **+X**.
Proven by side-view renders (face visible from +X camera, back from −X) and
toe data (+0.89, +0.45 = +X with ~27° turnout). An earlier −X read was wrong —
it would have faced everyone backwards.

## Visual proof — 24 frames, all eyeballed

Harness: `walk-test.html` (real CMU mocap walk, looped; travel arrow chevrons on
ground). Driver: `proof-walk.cjs`. Each model walked **toward camera** and
**across frame**, captured at t=3.5s and t=5.0s (different stride phases).

| Model | Family | Toward ×2 | Across ×2 | Chest→travel | Feet on ground | No crab-walk |
|---|---|---|---|---|---|---|
| ONYX_street | Mixamo | ✓ | ✓ | ✓ | ✓ | ✓ |
| HOLLOW | Mixamo | ✓ | ✓ | ✓ | ✓ | ✓ |
| STATIC | Mixamo | ✓ | ✓ | ✓ | ✓ | ✓ |
| EL_TORO_DE_ORO | Mixamo | ✓ | ✓ | ✓ | ✓ | ✓ |
| JUDAS_classic | C4D wrestling | ✓ | ✓ | ✓ | ✓ | ✓ |
| BRIAN_CAGE_source | C4D wrestling | ✓ | ✓ | ✓ | ✓ | ✓ |

**24/24 PASS.** Forward auto-detect returned `shoulder+toe → (1,0,0)` on the
Mixamo sample; C4D rigs detected via J_ bone aliases.

## Notes (non-blocking)
- C4D wrestling rips are giants (~5m); the harness normalizes to 1.85m before
  staging (mirrors the engine's per-character scale metadata).
- HOLLOW has thin pole-like accessories on his shoulders (consistent across
  frames — model geometry, not a render defect). Flagged for model review, not
  orientation.
- 22 unrigged GLBs (0 bones) can't walk; ground offset still applies via bbox.
  Facing falls back to +X with a loud console warning.

## Gate status
`window.__gates(t)` + `gates-check.cjs` remain in place for the promo timeline
(feet ≥ −0.05; facing-vs-velocity < 40° when locomoting; skips inverted bodies
and vertical-dominant motion). Re-run after step 2 staging changes.
