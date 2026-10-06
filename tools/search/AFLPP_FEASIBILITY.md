# AFL++ feasibility assessment — honest accounting (2026-10-06)

**Verdict: fuzzing FITS this pipeline, and it already paid off.** Not
theater: a real 4.5-minute campaign found 2 real parser bugs, both fixed.
Coverage-*guided* mode needs an instrumented CPython build (out of scope);
the realistic path today is python-afl + AFL++ dumb-forkserver.

## What was tried (commands + outcomes)

1. `pip install python-afl` → **worked** (0.7.3, MIT license, builds on
   Python 3.12). Imports, `afl.loop()` persistent mode works.
2. System `afl-fuzz` → **not installed**. `which afl-fuzz` → nothing.
3. Built AFL++ from source: `git clone --depth 1
   https://github.com/AFLplusplus/AFLplusplus && make -j4` → **worked**
   (5.03c, gcc). Binary at `~/workspace/tmp/aflpp/afl-fuzz`.
4. Raw `afl-fuzz -i corpus -o out -- python harness.py` →
   **"No instrumentation detected"** (expected: pure-Python target has no
   compile-time instrumentation).
5. `py-afl-fuzz` (python-afl's wrapper: sets `AFL_DUMB_FORKSRV=1`,
   `PYTHON_AFL_PERSISTENT=1`, skips the bin check) → **worked**. Probe
   confirmed the mechanism: in persistent mode each test case arrives on
   stdin per `afl.loop()` iteration; the dumb forkserver avoids re-execing
   Python per input (~200+ execs/sec on this box).
6. Coverage-guided mode → **not feasible without rebuilding CPython**
   with `afl-clang-fast` (instrumented interpreter). That's a 10+ minute
   compile for a marginal gain on a parser this small. Documented as the
   upgrade path, not done.

## Real campaign (evidence, not vibes)

- Target: `tools/anim-retarget/common.py::Glb` — the binary GLB parser
  behind `tools/verify/defect_gates.py::load_model` (the ingest-QC gate
  parses untrusted GLB bytes).
- Harness: `tools/tests/fuzz_glb_parse.py` (python-afl persistent mode).
  Corpus: `tools/tests/make_glb_corpus.py` (valid minimal + triangle +
  truncated GLB).
- Run: `py-afl-fuzz -i /tmp/fuzz/corpus -o /tmp/fuzz/out3 -- python
  tools/tests/fuzz_glb_parse.py`, 4m35s wall, ~120k execs.
- Result: **14 unique crashers, 2 distinct root causes.**

### Bug 1 (13/14 crashers): JSON chunk decoding to a non-object
`Glb.__init__` did `self.js = json.loads(...)` with no type check. A GLB
whose JSON chunk is `5` or `[1,2]` (valid JSON, not an object) crashed
every downstream `.get()`/`[]` with `AttributeError`/`TypeError`.
**Fixed** in `tools/anim-retarget/common.py`: reject non-dict JSON chunk
with `ValueError` (clean error, catchable by callers).

### Bug 2 (1/14): no error boundary at the ingest gate
`defect_gates.main()` called `load_model()` unwrapped: any malformed GLB
(a `bufferViews` index given as a string, etc.) killed the whole gate
with a traceback instead of a verdict. **Fixed** in
`tools/verify/defect_gates.py`: `load_model` is wrapped; malformed input
now yields `verdict: FAIL` + JSON report with the reason, exit code 1.

### Verification of fixes
- All 14 crashers replayed against the fixed code: 13 now raise the clean
  `ValueError`; the 14th produces a FAIL verdict (exit 1) through the
  gate instead of a traceback.
- `defect_gates.py --glb <evil.glb>` → `FAIL: unparseable GLB` (shown in
  the work log; report JSON written).

## What this means for the pipeline

- Fuzzing is NOT theater here: the parser had no validation and the gate
  had no error boundary, and the campaign proved it in under 5 minutes.
- Keep the harness + corpus in `tools/tests/`; re-run before ship or when
  the parser changes. CI-able form: the replay check (all known crashers
  → clean errors) runs without AFL++.
- Upgrade path (not done): instrumented CPython for coverage guidance;
  expand corpus with real character GLBs; add a hang/timeout oracle
  (AFL++ already ships one — the harness had no hangs).
- python-afl is MIT — no license quarantine needed. AFL++ is Apache-2.0.

## Reproduce

```bash
# one-time: build AFL++ (gcc+make needed)
/tmp/fuzz/aflpp 2>/dev/null || { git clone --depth 1 https://github.com/AFLplusplus/AFLplusplus ~/workspace/tmp/aflpp && make -C ~/workspace/tmp/aflpp -j4; }
# campaign (5 min):
rm -rf /tmp/fuzz/out && mkdir -p /tmp/fuzz/out
~/workspace/venvs/svenv/bin/python tools/tests/make_glb_corpus.py /tmp/fuzz/corpus
PATH=~/workspace/tmp/aflpp:$PATH timeout 300 ~/workspace/venvs/svenv/bin/py-afl-fuzz \
  -i /tmp/fuzz/corpus -o /tmp/fuzz/out -- ~/workspace/venvs/svenv/bin/python tools/tests/fuzz_glb_parse.py
# triage: ls /tmp/fuzz/out/default/crashes/
```
