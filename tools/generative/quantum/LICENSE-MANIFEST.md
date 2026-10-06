# License Manifest — tools/generative/quantum

Per standing policy: every pulled tool's license is tracked so the pre-ship
audit is mechanical. GPL/AGPL-viral code is quarantined out of ship paths.
Status: PROTOTYPE (audit required before ship).

## Default path (ANU + classical fallback) — zero third-party dependencies

| Component | License | Notes |
|-----------|---------|-------|
| Python 3 stdlib (`urllib`, `json`, `hashlib`, `secrets`, `struct`, `os`) | PSF License 2.1 | ships with Python; no action needed |

`qrng.py` default `sources=("anu",)` and `classical_fallback_bytes` need
nothing beyond the standard library. ANU QRNG API is a free public web API
(terms: fair use of a public research service; no key, no signup).

## Optional dependencies (only loaded when that source is requested)

| Package | License | Used by | Status |
|---------|---------|---------|--------|
| `qiskit` | Apache-2.0 | `qiskit_aer_bytes`, `ibm_quantum_bytes` | optional; `pip install qiskit qiskit-aer` |
| `qiskit-aer` | Apache-2.0 | `qiskit_aer_bytes` (CPU simulator) | optional |
| `qiskit-ibm-runtime` | Apache-2.0 | `ibm_quantum_bytes` (real IBM QPUs) | optional; token-gated |
| `Pillow` (PIL) | HPND (permissive) | `demo_variant.py` PNG render only | demo-only; already present on this box |
| `numpy` | BSD-3-Clause | pulled in by qiskit (transitive) | optional/transitive |

No GPL/AGPL/LGPL code anywhere in this module's dependency tree
(qiskit is Apache-2.0; scipy/numpy are BSD).

## Non-code assets

- Quantum bytes from ANU QRNG: public research API output, no license
  encumbrance on the random data itself.
- Demo outputs in `proof/`: generated artifacts, owned by the repo.

## Ship-path quarantine status

The default ANU path is stdlib-only — nothing to quarantine. If Qiskit
sources are ever wired into a shipped game build (not currently planned —
quantum pulls happen at content-authoring time, not at runtime), the audit
must confirm no GPL/AGPL transitive deps entered via `qiskit-*` upgrades.
