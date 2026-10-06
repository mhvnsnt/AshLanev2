# QUANTUM_PIPELINE.md — quantum computing bridge for the AshLane character pipeline

Owner directive (2026-10-06): hook up real quantum computing — free/open-source
SDKs and APIs — into the character/animation workflow. This doc records what
was wired up, the genuine intersections found, measured benchmarks, and a
brutally honest assessment of what quantum can and can't do for us today.

**One-line verdict: classical wins on every problem we tested. The bridge is
built, working, and kept — the field moves fast, and the formulations are
ready when hardware catches up.**

## 1. What was installed (all free, all open-source)

| Package | Version | License | Role |
|---|---|---|---|
| qiskit | 2.5.2 | Apache 2.0 | circuits, QAOA framework |
| qiskit-aer | (bundled) | Apache 2.0 | local statevector simulator |
| pennylane | 0.45.1 | Apache 2.0 | VQE / variational loops |
| scipy, numpy | (deps) | BSD | classical optimizers (COBYLA, Adam), exact baselines |

Location: `tools/quantum/.venv` (git-ignored). Prototypes: `tools/quantum/`.
No GPL/AGPL anywhere in the quantum path.

**No credentials were used or needed.** Everything runs on local simulators.
IBM Quantum's free tier exists (10 min QPU time/month at last check) and the
code is structured so `AerSimulator` can be swapped for a real backend later —
but the owner would need to supply their own free-tier API token; nothing here
requires it, and no token is stored anywhere.

## 2. Real intersections with OUR pipeline

### 2a. Bone-name mapping → QUBO assignment (`qubo_bone_map.py`)

Real problem: `tools/anim-retarget/skeletons.py` maps 9 skeleton families to
58 canonical slots. The combinatorial core: assign N source bone names to N
canonical slots, one-to-one, maximizing name similarity.

- Binary var `x[i,j]` = source bone *i* → canonical slot *j*.
- Objective: `-sim(i,j)` (difflib + side-token bonus, real quaternius names).
- Constraints as penalties: `P·(Σx−1)²` per row and column, `P > max sim`.

Solvers: exact brute force (production equivalent: Hungarian, O(n³)) vs QAOA
(p=2, COBYLA, Aer statevector simulator), n=3 (9 qubits).

**Result: classical exact wins outright** — 0.4 ms vs 5.1 s for QAOA (~12,000×).
Notably, QAOA *did* decode the optimal mapping (matching the pipeline's
explicit ground-truth map), which verifies the QUBO formulation is correct —
it's just far slower than the polynomial classical method. Name-only mapping
is polynomial; there is no quantum angle here, and we say so.

**The real research direction** this unlocks: *hierarchy-aware* mapping. Add a
bonus when a parent→child pair in the source maps to a parent→child pair in
the canonical skeleton. That turns assignment into the **Quadratic Assignment
Problem — NP-hard**, where quantum heuristics (QAOA, quantum annealing) are a
legitimate research bet. Formulated, not yet benchmarked: our current
explicit maps already solve the easy cases, so this waits until we hit a
skeleton family the rules can't map.

### 2b. Clip-set selection → QUBO set cover (`qaoa_clip_setcover.py`)

Real problem: the retarget batch produced 220 clips (88 PASS / 72 WARN /
60 FAIL). For a character we need the smallest set of clips covering every
required move slot (walk, idle, punch, kick, grapple, taunt, hit-react,
knockdown), preferring high-quality clips. **Minimum set cover is NP-hard** —
the most honest quantum candidate in the pipeline.

- Binary var `x_i` = include clip *i*.
- Objective: `Σx_i − 0.5·Σq_i·x_i` (few clips, high quality; FAIL excluded).
- Coverage: `P·(1 − Σ_{i∋u} x_i)²` per slot *u*.

Clip data modeled on the real batch (12 attacker/receiver pair names +
locomotion banks; quality from PASS/WARN verdicts). 10 clips → 10 qubits.
Solvers: exact brute force (2^10) vs QAOA (p=2, Aer).

**Result: classical exact wins** — 54.8 ms vs 10.5 s for QAOA (~190×).
QAOA decoded the true optimum (4 clips: cmu_walk, ual_idle, ddt:vic, feral —
covering all 8 slots), verifying the set-cover QUBO is correct. At production
scale (hundreds of clips × dozens of slots) brute force dies and
greedy+local-search is the classical champion to beat — QAOA/annealing get
interesting there, but we did not measure a win at this scale and do not
claim one.

### 2c. Variational loop smoke test (`vqe_toy.py`)

Toy 2-qubit Hamiltonian framed as a "pose energy". VQE (PennyLane,
hardware-efficient ansatz, Adam) vs exact diagonalization.

**Result: VQE converges to the exact ground energy** (error ~2.5e-07),
proving the variational bridge works end-to-end in our toolchain.

**Honest framing:** real pose/skin-weight optimization is continuous and
high-dimensional — classical L-BFGS/Adam dominate it completely, and no
near-term quantum method credibly competes. This script is a bridge test,
not a claim.

## 3. Benchmarks (measured 2026-10-06, local CPU, simulators)

| Problem | Classical | Quantum (simulator) | Winner |
|---|---|---|---|
| Bone map, n=3 (9 qubits) | exact, 0.4 ms, optimal, matches pipeline ground truth | QAOA p=2, 5.1 s, decoded optimal (top-bitstring p=0.19), matches ground truth | **classical** (~12,000× faster) |
| Clip set cover, 10 clips (10 qubits) | exact brute force, 54.8 ms, optimal (4 clips: cmu_walk, ual_idle, ddt:vic, feral) | QAOA p=2, 10.5 s, decoded optimal, optimal match | **classical** (~190× faster) |
| VQE toy (2 qubits) | diagonalization, 7.5 ms, exact | VQE, 9.9 s, error 2.5e-07 | **classical** (bridge verified) |

No quantum speedup was measured on any problem. None is claimed.

## 4. What does NOT benefit (don't waste time here)

- **Rendering / shaders / lighting** — GPUs own this, by design and by physics.
- **Texture work** (PBR, UVs, texel density) — classical image processing.
- **Direct mesh deformation / skinning** — dense linear algebra; GPUs.
- **Name-only bone mapping** — polynomial (Hungarian). Solved.
- **Continuous pose optimization** — classical gradients dominate.

## 5. What MIGHT benefit later (kept warm, not hyped)

1. **Hierarchy-aware bone mapping as QAP** (NP-hard) — formulate when a new
   skeleton family defeats the rule-based maps.
2. **Large clip-set cover** (hundreds of clips) — QAOA/annealing vs
   greedy+local search; needs a real benchmark at scale.
3. **D-Wave Leap free tier** — quantum annealing is the natural solver for
   both QUBOs above. Not wired (requires owner signup + API token); the QUBO
   dicts in `tools/quantum/` are already in the right form (`BinaryQuadraticModel`
   accepts the same coefficients).
4. **Quantum ML for motion-style classification** — research-grade only.

## 6. Reproducing

```sh
cd tools/quantum
python3 -m venv .venv && .venv/bin/pip install qiskit qiskit-aer pennylane qulacs qutip cirq qsimcirq simanneal
.venv/bin/python qubo_bone_map.py --n 3 --p 2
.venv/bin/python qaoa_clip_setcover.py --p 2
.venv/bin/python vqe_toy.py --steps 150
.venv/bin/python quantum_inspired.py --seed 7
.venv/bin/python simulator_shootout.py --n 6 --p 1
.venv/bin/python backends.py
```

Each script writes a `*_result.json` with the measured numbers.

## 7. Expansion (2026-10-06) — new SDKs, quantum-inspired solvers, QAP, backend paths

### 7a. New SDKs installed (all free, all local simulators, no tokens)

| Package | Version | License | Role |
|---|---|---|---|
| qulacs | 0.6.14 | MIT | fast CPU statevector simulator |
| qutip | 5.3.1 | BSD-3 | exact diagonalization / open quantum systems reference |
| cirq | 1.7.0 | Apache 2.0 | Google's circuit framework |
| qsimcirq | (bundled) | Apache 2.0 | qsim high-performance simulator for Cirq |
| simanneal | 0.5.0 | MIT | (not used directly — we wrote our own SA; listed for the manifest) |

### 7b. Simulator shootout (`simulator_shootout.py`)

Same QAOA ansatz circuit simulated on Aer vs Qulacs vs qsim, plus QuTiP exact
diagonalization as the classical reference. All simulators agree (norm = 1.0).

| n qubits | Aer | Qulacs | qsim | QuTiP exact |
|---|---|---|---|---|
| 6 | 0.029 s | **0.002 s** | 0.021 s | 0.101 s |
| 10 | 0.013 s | **0.001 s** | 0.011 s | 1.419 s |
| 14 | 0.011 s | 0.086 s | **0.010 s** | OOM (2^14 dense matrix, by design) |

Honest notes: Qulacs wins at small n; at n=14 our Qulacs RZZ-via-DenseMatrix
implementation is the bottleneck (native parametric gates would fix it —
implementation matters more than the library). All three stay under 0.1 s at
n=14. **Decision: Qulacs is the default for small variational experiments;
Aer/qsim for larger circuits.** QuTiP stays as the exact-reference tool for
small Hamiltonians.

### 7c. Quantum-inspired classical solvers (`quantum_inspired.py`)

Classical heuristics that borrow from annealing — the strongest baseline any
quantum method must beat. No simulator, no qubits, just CPU.

**Larger clip set cover (40 clips × 12 slots):** greedy found 4 clips covering
everything in **0.08 ms**; simulated annealing matched it (4 clips, same cost)
in 899 ms. **Greedy wins outright** — SA adds nothing at this structure.

**Hierarchy-aware bone mapping as QAP (n=6, parent→child bonuses):**
exact permutation scan found the optimum in **3.56 ms**; SA found the *same*
optimum in 72.8 ms. The mapping matches the pipeline's ground truth
(pelvis→Hips, spine_01→Spine, neck_01→Neck, upperarm_l→LeftArm,
lowerarm_l→LeftForeArm, hand_l→LeftHand).

**Honest verdict:** at these scales classical exact/greedy still wins on every
problem. SA's value proposition is at scales where exact is infeasible
(50+ bones, 200+ clips) — formulated and ready, not yet needed. A future
quantum annealer (D-Wave) or QAOA must beat *greedy+SA*, not brute force, to
matter. We do not claim otherwise.

### 7d. Backend swap paths (`backends.py`)

`get_backend(name)` centralizes simulator→QPU swaps. `"aer"` (default),
`"qulacs"`, `"qsim"` work with zero credentials. `"ibm"` and `"dwave"` raise a
clear error naming the exact signup step and env var (`IBQ_TOKEN`,
`DWAVE_TOKEN`) — **no tokens collected, none stored, none needed**. Our QUBO
dicts convert directly via `dimod.BinaryQuadraticModel.from_qubo()` for D-Wave
later. IonQ/Braket: no meaningful free tier — not wired.

### 7e. Updated benchmark table

| Problem | Classical best | Quantum (simulator) | Winner |
|---|---|---|---|
| Bone map, n=3 | exact, 0.4 ms | QAOA p=2, 5.1 s | **classical** |
| Clip set cover, 10 clips | brute force, 54.8 ms | QAOA p=2, 10.5 s | **classical** |
| VQE toy, 2 qubits | diagonalization, 7.5 ms | VQE, 9.9 s | **classical** |
| Clip set cover, 40 clips | greedy, 0.08 ms | SA 899 ms (matched) | **classical (greedy)** |
| QAP bone map, n=6 | exact, 3.56 ms | SA 72.8 ms (optimal) | **classical** |
| Simulator speed, n=6–14 | — | Qulacs/Aer/qsim all < 0.1 s | **Qulacs (small), Aer/qsim (large)** |

No quantum speedup measured on any problem. None claimed. The bridge is
built, benchmarked, and kept warm — formulations ready when hardware or
problem scale catches up.
