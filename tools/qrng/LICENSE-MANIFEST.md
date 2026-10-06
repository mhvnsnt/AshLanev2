# License Manifest — QUANTUM-v2 (tools/qrng, tools/quantumblur, tools/search)

Per standing policy: prototype freely, manifest everything, GPL/AGPL-viral
code quarantined out of ship paths, audit before ship.
Status: PROTOTYPE (audit required before ship).
Extends: tools/generative/quantum/LICENSE-MANIFEST.md (the prior lane).

## Environment notes (what worked)

- System `pip install` fails on Debian-managed numpy → do NOT use
  `pip3 --user` on this box. Two venvs:
  - `/tmp/qvenv` — qiskit stack (pre-existing from the prior lane;
    qiskit 2.5.2, qiskit-aer, numpy 2.5.3; pillow + scipy added by this
    lane). Ephemeral (/tmp is a 512M tmpfs — 95% full; do not grow it).
  - `~/workspace/venvs/svenv` — search stack (hypothesis, pytest,
    ortools, python-afl). Durable (home dir).
- pip needs temp space: /tmp was full → `export TMPDIR=~/workspace/tmp`
  before every pip install. Remember this or installs fail with
  `OSError: [Errno 28] No space left on device`.

## Task 1 — tools/qrng_seed.py (stdlib-only, zero new deps)

| Component | License | Notes |
|-----------|---------|-------|
| Python 3 stdlib | PSF 2.1 | the whole module; build-time only |
| ANU Quantum Numbers keyed API | service ToS (free tier, key via `ANU_QRNG_KEY`) | endpoint format verified against ANU's documented client wrapper; no client code copied |
| ANU legacy API | public research API | reused from `tools/generative/quantum/qrng.py` (import, not copy) |

GPL note: the keyed endpoint format was read from the `qranode` npm
wrapper (**GPL-3.0**). No qranode code was copied — only the factual
endpoint shape (base URL, `x-api-key` header, `type`/`length` params),
which is not copyrightable expression. The Python implementation is
original. qranode itself is NOT a dependency.

## Task 2 — tools/quantumblur (Qiskit + QuantumBlur)

| Package | License | Notes |
|---------|---------|-------|
| `qiskit` 2.5.2 | Apache-2.0 | /tmp/qvenv (prior lane) |
| `qiskit-aer` | Apache-2.0 | /tmp/qvenv (prior lane) |
| `quantumblur` (fork: `mhvnsnt/QuantumBlur`, upstream `qiskit-community/QuantumBlur` archived) | Apache-2.0 | `pip install git+https://github.com/mhvnsnt/QuantumBlur.git` into /tmp/qvenv; NOT vendored into the repo |
| `qiskit-ibm-runtime` | Apache-2.0 | NOT installed; needed only if `IBM_QUANTUM_TOKEN` is ever set |
| `scipy`, `Pillow`, `numpy` | BSD-3 / HPND | /tmp/qvenv (QuantumBlur deps) |

A/B verdict (2026-10-06): QuantumBlur is **NOT wired in** — at matched
smoothness it ≈ Gaussian blur on detail/entropy and runs ~300× slower.
Evidence: `tools/quantumblur/proof/ab_report.json` + PNGs.

## Task 3 — tools/search (classical stop-guessing stack)

| Package | License | Notes |
|---------|---------|-------|
| `hypothesis` 6.168.5 | MPL-2.0 | svenv; property tests only (dev/test dep, never ships in game) |
| `pytest` | MIT | svenv; test runner |
| `ortools` 9.15.6755 | Apache-2.0 | svenv; CP-SAT repair search (build-time tool) |
| `python-afl` 0.7.3 | MIT | svenv; AFL++ forkserver shim for the fuzz harness |
| AFL++ 5.03c | Apache-2.0 | built from source at `~/workspace/tmp/aflpp` (NOT vendored, NOT in repo) |

No GPL/AGPL code in any prototype path. MPL-2.0 (hypothesis) is
file-scoped copyleft and test-only — quarantined from ship paths by
construction (lives in `tools/tests/`, imported by nothing at runtime).

## Ship-path quarantine status

- `tools/qrng_seed.py`: stdlib-only → shippable as-is (build-time tool).
- `tools/quantumblur/`: NOT wired into any pipeline (verdict: skip) —
  nothing to quarantine; the experiment dir is research-only.
- `tools/search/`: build-time/QA tooling. `repair_search` is designed as
  a gate plug-in (build-time); not imported by the game runtime.
- Pre-ship audit must: re-verify no GPL/AGPL entered via transitive
  upgrades of qiskit/ortools/hypothesis; confirm venv-only deps never
  leak into `public/` or the web build.
