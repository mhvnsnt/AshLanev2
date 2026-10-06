# QUANTUM-v2 work log (2026-10-06)

Three builds, in order. Evidence-linked; honest accounting at the end.

## 1. `tools/qrng_seed.py` — build-time quantum seed service (DONE)

Stdlib-only, BUILD-TIME ONLY (never in the runtime game loop).

- **Source priority** (first success wins; every call returns
  `(value, provenance)` honestly labeled):
  - (a) ANU Quantum Numbers new API (`api.quantumnumbers.anu.edu.au`,
    `x-api-key` header, key via `ANU_QRNG_KEY`) — graceful skip when unset.
    Endpoint format verified against ANU's documented client wrapper;
    no wrapper code copied (wrapper is GPL-3.0 — see manifest).
  - (b) ANU legacy API (`qrng.anu.edu.au/API/jsonI.php`) — **reused**
    `fetch_anu()` from `tools/generative/quantum/qrng.py` by import,
    not duplicated.
  - (c) `secrets` fallback, labeled `classical-fallback`.
- **Disk pool** `tools/qrng_seed_pool.json` (gitignored build cache):
  fetched in ≤1024B batches with timestamps + per-batch source, drawn at
  build time, auto-refill below 512B low-water (target 4096B).
- **Manifest stamping**: `stamp_manifest()` writes `qrng_source`, `seed`,
  `timestamp` (+ provenance, pool batch ids) into any build manifest.
- **Verified**: `selftest` (offline) OK; `status` probes show anu-key
  SKIP (no env var, clear instructions) + anu-legacy OK with real bytes
  (`d9688515…`); bad-key → HTTP 403 → clean fall-through to legacy;
  `refill` pulled 4096B in 4 batches, all `anu-qrng`.
- **PILOT wired**: `tools/generative/quantum/demo_variant.py` now draws
  from `SeedPool()` instead of a one-shot `SeedPack.new(sources=("anu",))`,
  and stamps the variant JSON with the `quantum_seed` record. Before/after
  runs both green (`seed pack verify(): True`).

## 2. Qiskit + QuantumBlur (DONE, verdict: NOT wired in)

- `qiskit 2.5.2` present in `/tmp/qvenv` (prior lane); added
  `pillow` + `scipy` (QuantumBlur deps). System pip is broken on
  Debian-managed numpy — venvs only; pip needs `TMPDIR=~/workspace/tmp`
  (/tmp is a 95%-full 512M tmpfs).
- Forked `qiskit-community/QuantumBlur` → `mhvnsnt/QuantumBlur`
  (Apache-2.0, archived upstream); `pip install git+https://…` into
  `/tmp/qvenv`. **Not vendored into the repo.**
- **A/B** (`tools/quantumblur/ab_terrain.py`, 32×32 value-noise terrain +
  hill + crater): QuantumBlur `blur_height` vs Gaussian blur at matched
  smoothness (3 xi/sigma pairs). Result: at equal smoothness the outputs
  are visually near-identical; quantum keeps slightly less detail
  (corr 0.976–0.9999 vs 0.9976–0.9999) and runs **~300× slower**
  (0.1s vs 0.0003s). Evidence: `tools/quantumblur/proof/ab_report.json`
  + PNGs. **Verdict: skip — no richness gain. Not wired in.**
- **IBM Quantum batch path**: token-gated (`IBM_QUANTUM_TOKEN`),
  free tier verified = Open Plan, 10 QPU-min/month (28-day rolling),
  R&D only. `tools/qrng/ibm_batch_seeds.py` fails LOUDLY without a token
  (exit 2 + prints the 3-step setup); `tools/qrng/IBM_QUANTUM_TOKEN_SETUP.md`
  has the exact owner instructions. No account created (needs owner email).

## 3. Classical stop-guessing stack (DONE)

- **Hypothesis property tests** (`tools/tests/test_pipeline_properties.py`,
  7 tests, all passing): derive() determinism + label separation,
  SeedPack save/load round-trip, `quantum_random_bytes` contract,
  pool draw accounting (no byte reuse), manifest stamp overwrite.
  CI-able: `~/workspace/venvs/svenv/bin/python -m pytest tools/tests/ -q`
  (no network). Note: hypothesis rejects function-scoped fixtures
  (`tmp_path`, `monkeypatch`) under `@given` — tests use in-test tempdirs.
- **AFL++** (`tools/search/AFLPP_FEASIBILITY.md` — full evidence):
  `python-afl` 0.7.3 installs on 3.12 (MIT); built AFL++ 5.03c from source
  (gcc); pure-Python target can't take compile-time instrumentation, so
  the realistic path is `py-afl-fuzz` (dumb forkserver + persistent mode,
  input via stdin — mechanism verified by probe). Coverage-guided mode
  needs an instrumented CPython rebuild — documented as upgrade path.
  **Real 4m35s campaign on the GLB parser** (`tools/anim-retarget/common.py::Glb`,
  the ingest-QC gate's parser): **14 unique crashers → 2 real bugs, both
  fixed**: (1) JSON chunk decoding to non-object crashed everything
  downstream — now a clean `ValueError` in `Glb.__init__`; (2) no error
  boundary at the ingest gate — `defect_gates.main()` now turns malformed
  GLBs into `FAIL` verdicts (exit 1) instead of tracebacks. All 14
  crashers replayed clean after the fixes.
- **Parallel-portfolio repair search**
  (`tools/search/portfolio_repair.py`): real problem = mesh-cleanup
  parameter search (weld eps / degenerate threshold / smoothing /
  normal mode) on corrupted meshes; the verifier (same check family as
  `defect_gates.py` static QC + shape-drift) is the oracle. Arms: random
  restarts, simulated annealing, OR-Tools CP-SAT (least-invasive-first
  under real repair constraints: compute budget, normal/smooth guard).
  Two portfolio variants: parallel (split budget, shared cache) and
  successive-halving (algorithm selection). 20 instances, 48-call budget
  — results below. Plug-in contract documented in
  `tools/search/PLUG_IN.md` (`repair_search()` for the ingest-QC gate).

### Portfolio experiment results — DEFINITIVE (48 verifier calls, 10 seeds × 2 profiles, fixed budget semantics)

| strategy | profile A pass% (15/192 pass) | profile B pass% (3/192 pass) | overall | uniquely solved |
|---|---|---|---|---|
| random | 100% (11.1 calls) | 70% (28.4) | **85%** | 1 |
| anneal | 50% (7.6) | 30% (13.0) | 40% | 0 |
| cpsat | 80% (22.5) | 0% (n/a) | 40% | 0 |
| portfolio-parallel | 90% (14.7) | 20% (16.0) | 55% | 1 |
| **portfolio-halving** | **90% (14.0)** | **50% (23.0)** | **70%** | **2** |

Honest reading (no hype): on these small discrete instances with a cheap
verifier, **random restarts is the best single strategy** (85%) — a known
result for low-dimensional search (Bergstra & Bengio 2012). The
successive-halving portfolio is the best portfolio and 2nd overall (70%):
it beats anneal, cpsat, and the parallel portfolio; it uniquely solved 2
instances no single strategy could (profile B seeds 3, 8); it never
finishes last on any profile. The parallel split-budget portfolio is
**deprecated by this evidence** (55% — splitting starves the arms).
The portfolio's structural value is robustness insurance across unknown
instance types, not beating a dominant single strategy. An earlier run
with a budget-accounting bug (arm-local vs shared call counters) gave
weaker portfolio numbers; the bug is fixed (`SearchState(shared=…)`
views) and these are the corrected figures.

### Threading landmines found (documented in `tools/search/PLUG_IN.md`)

1. **OR-Tools aborts (SIGABRT, no traceback) under Python threads** —
   cpsat arm runs in the calling thread; stochastic arms in workers.
2. **OpenBLAS aborts (SIGABRT, no traceback) under Python threads** —
   `portfolio_repair.py` forces `OPENBLAS_NUM_THREADS=1` /
   `OMP_NUM_THREADS=1` before numpy loads.
3. Portfolio budget bug (fixed): arm-local vs shared call counters —
   `SearchState(shared=…)` views give each arm its own budget against
   the shared evaluated cache.

## License manifest

`tools/qrng/LICENSE-MANIFEST.md` — everything above (qiskit/qiskit-aer/
QuantumBlur Apache-2.0; hypothesis MPL-2.0 test-only; ortools Apache-2.0;
python-afl MIT; AFL++ Apache-2.0 not vendored; qranode GPL-3.0 NOT used).
Prototype status; audit before ship.

## Queued next

- IBM Quantum real-hardware batch pull — blocked on owner pasting
  `IBM_QUANTUM_TOKEN` (3 steps in `tools/qrng/IBM_QUANTUM_TOKEN_SETUP.md`).
- ANU keyed API path — live but untested with a real key (needs owner to
  create one at quantumnumbers.anu.edu.au; legacy path covers us).
- Wire `repair_search()` into `tools/verify/defect_gates.py` static-QC
  FAIL branch — needs owner go-ahead (changes gate behavior).
- Fuzz upgrade path: instrumented CPython for coverage guidance; expand
  corpus with real character GLBs.
- `/tmp/qvenv` is on a 95%-full tmpfs — migrate the qiskit stack to
  `~/workspace/venvs/qvenv` before it breaks.
