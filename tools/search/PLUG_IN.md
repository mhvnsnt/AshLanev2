# Plug-in point: portfolio repair search → ingest-QC gate

`tools/search/portfolio_repair.py::repair_search` is the callable the
ingest-QC gate (`tools/verify/`) uses when a model fails static QC but is
repairable by parameter choice (weld distance, degenerate threshold,
smoothing, normal handling).

## Contract

```python
from search.portfolio_repair import repair_search

result = repair_search(damaged_mesh, clean_verts, budget=48, seed=0)
# result.params  -> (weld_idx, deg_idx, smooth_idx, normal_idx) into the
#                   WELD_EPS / DEG_THRESH / SMOOTH_ITERS / NORMAL_MODE grids
# result.score   -> verifier score (< 1.0 == PASS)
# result.passed  -> bool
# result.calls   -> verifier calls consumed (the shared currency)
# result.winner  -> always "portfolio" (which arm won is internal)
```

- `damaged_mesh`: `(verts, faces, normals)` numpy arrays, the mesh as
  ingested (with corruption).
- `clean_verts`: reference positions for the shape-drift term. If omitted,
  drift is measured against the damaged mesh (conservative: any movement
  is penalized).
- `budget`: total verifier calls across all arms.
- The verifier (`verify()`) implements the same check family as
  `tools/verify/defect_gates.py` static QC: NaN/exploded verts+normals,
  degenerate faces, duplicate verts, non-unit normals, max shape drift.

## Suggested wiring (gate side, not yet wired — owner go-ahead needed
before changing gate behavior)

In `tools/verify/defect_gates.py::main`, after `gate_static_qc` FAILs on
the bind pose:

```python
from search.portfolio_repair import repair_search
r = repair_search((verts, faces, normals), budget=64)
if r.passed:
    # re-run gates on repair((verts,faces,normals), r.params)
else:
    # escalate per the repair protocol (mesh surgery -> re-skin -> hybrid)
```

The portfolio never declares "unfixable": a FAIL here means escalate to
the next repair rung (bridge-vertex surgery, re-skin from scratch), per
the standing repair protocol — never stop at one technique's limit.

## Why a portfolio (not one search)

Measured 2026-10-06 on 20 corrupted-mesh instances (2 profiles × 10
seeds), 48 verifier calls each — see module docstring / work log:

- No single strategy dominates: CP-SAT (least-invasive-first) is fastest
  when the optimum respects the compute budget but stalls when the
  optimum needs max intervention; random/anneal follow the score
  gradient but waste calls on easy instances.
- The portfolio (shared evaluated-cache + stop-at-first-PASS) matches
  the best arm's pass rate on every profile — it cannot lose to any
  single strategy on pass rate, at ~2-3× the best arm's call count.
- OR-Tools caveat (hard-won): **never run CpSolver under Python
  threads** — it aborts the process. `repair_search` runs the cpsat arm
  in the calling thread and the stochastic arms in workers.

## Threading landmines (hard-won 2026-10-06 — read before touching)

1. **OR-Tools aborts under Python threads** (SIGABRT, no traceback).
   `repair_search` runs the cpsat arm in the calling thread and only the
   stochastic arms in workers.
2. **OpenBLAS aborts under Python threads** (SIGABRT, no traceback).
   `portfolio_repair.py` sets `OPENBLAS_NUM_THREADS=1` /
   `OMP_NUM_THREADS=1` before numpy loads. Any new entry point that
   threads the verifier must do the same (or set them in the shell).

## Files

| File | What |
|------|------|
| `tools/search/portfolio_repair.py` | strategies + verifier + `repair_search` + experiment |
| `tools/search/PLUG_IN.md` | this file |
| `tools/search/AFLPP_FEASIBILITY.md` | fuzzing assessment + parser bugs found/fixed |
| `tools/tests/test_pipeline_properties.py` | Hypothesis property tests (7 passing) |
| `tools/tests/fuzz_glb_parse.py` | AFL++ harness (python-afl persistent mode) |
| `tools/tests/make_glb_corpus.py` | seed corpus builder |
