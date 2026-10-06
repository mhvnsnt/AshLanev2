# tools/generative/quantum — quantum randomness for procedural variation

Honest quantum integration: **real quantum randomness** (not quantum
computing) as an entropy source for the AshLane generative pipeline. Same
seeds = same output, every time — the quantum bytes are the one-shot
ingredient, the derivation is deterministic.

## What this is

A small Python module that pulls genuine quantum random bytes (from real
photonic quantum hardware over the internet), derives reproducible per-domain
seeds from them (arena layout, crowd, textures, props), and proves the whole
chain with a runnable demo.

Precedent: a Roblox game generating levels live from real quantum hardware
(thequantuminsider.com, Sept 2026); MiTale's C.L.A.Y. using IBM Qiskit for
story/environment generation (Gamescom 2026). We follow the same pattern —
quantum hardware as a **randomness oracle** — at zero cost.

## Files

| File | What it does |
|------|--------------|
| `qrng.py` | Unified randomness source. Every function returns `(bytes, provenance_string)`. Sources, in order: ANU QRNG (real photonic hardware) → IBM Quantum (real superconducting hardware, token-gated) → Qiskit Aer (**classical simulation** of quantum circuits, labeled honestly) → `secrets` classical fallback (labeled `classical-fallback`). Never mislabels a source. |
| `seeds.py` | Deterministic seed derivation (SHA-256: `domain ∥ label ∥ quantum_bytes` → uint64). Domain packs for arena layout, crowd, textures, props. `SeedPack` saves bytes + provenance + seeds to JSON so any variant is byte-reproducible. Interop: seeds feed the JS `mulberry32` RNG in `tools/generative/rng.js` (mask to 32 bits: `seed >>> 0`). |
| `demo_variant.py` | Proof script. Pulls 64 quantum bytes, derives a crowd-variant pack, writes a crowd-layout JSON + renders a top-down schematic PNG. Prints provenance. |
| `LICENSE-MANIFEST.md` | Every dependency + license (per build policy). |
| `proof/` | Demo outputs (JSON, PNG, seed pack). |

## Quick start

```sh
cd tools/generative/quantum
python3 qrng.py          # self-test: probes each source, prints provenance
python3 demo_variant.py  # full proof: quantum bytes -> crowd variant JSON + PNG
```

No installs needed for the default path — ANU + classical fallback use only
the Python standard library. Qiskit is optional (see below).

## Which parts touch real quantum hardware vs simulation vs classical

| Source | Hardware? | Needs | When used |
|--------|-----------|-------|-----------|
| `anu` (default) | **YES — real.** ANU photonic QRNG, vacuum-fluctuation measurement, free public API, no signup | internet | always, unless you pass different `sources` |
| `ibm` | **YES — real.** IBM superconducting QPUs via Qiskit Runtime | `IBM_QUANTUM_TOKEN` env var (free at quantum.ibm.com) + `pip install qiskit-ibm-runtime` | only when listed in `sources` and token present; skipped gracefully otherwise |
| `aer` | **NO — classical simulation.** Hadamard circuits sampled on your CPU. The circuit math is quantum; the execution is not. | `pip install qiskit qiskit-aer` | only when listed in `sources` |
| `classical-fallback` | **NO — OS CSPRNG** (`secrets`). | nothing | only when all quantum sources fail (e.g. offline); provenance says so explicitly |

`quantum_bytes(n, sources=("anu",))` tries sources in order, returns the first
success. If everything fails it falls back to `secrets` with an honest
`classical-fallback` provenance string — gameplay still works, nobody is
misled. Pass `allow_classical_fallback=False` to raise instead.

## What quantum randomness actually buys here

**True unpredictability for procedural variation.** That's it. That's the
whole list.

- Variant seeds that are not reproducible-by-adversary, not seeded-from-clock,
  not patternable. Genuine "nobody could have predicted this layout" for
  crowd/arena/prop variation.
- NOT speed. ANU round-trips are ~100ms; a local PRNG is nanoseconds.
- NOT better art. Quantum bytes don't make textures prettier — the art comes
  from the generators in `tools/generative/`.
- NOT optimization. Nothing here is QAOA/VQE/annealing (see
  `tools/quantum/` for that separate, older lane).

Use it where unpredictability is the point (variant generation, daily
seeds, tournament brackets). Use `rng.js`'s plain mulberry32 where it isn't.

## NO QUANTUM ANGLE

Read this before asking. The following are **classical problems** with no
credible quantum advantage, and this module makes no claim otherwise:

- **Skinning / skeletons / rigging** — classical linear algebra (matrix
  palettes, quaternion blends). Solved, deterministic, runs on GPUs.
- **Mesh repair** — geometry processing, classical algorithms.
- **Animation retargeting** — linear algebra + optimization; classical
  solvers (including the quantum-*inspired* ones in `tools/quantum/`) are the
  practical tool.
- **Rendering, physics, collision** — GPUs already optimal; quantum hardware
  offers nothing here and nothing credible is on the horizon.

If someone pitches "quantum-accelerated rigging," that is theater. The
honest statement: **quantum hardware today is a randomness oracle and a
research machine.** We use the randomness oracle. Full stop.

## License policy (standing)

Prototype freely with whatever works; licenses don't gate prototyping.
GPL/AGPL-viral code is quarantined out of ship paths; audit before ship.
Current dependency footprint is stdlib-only on the default path — see
`LICENSE-MANIFEST.md`.
