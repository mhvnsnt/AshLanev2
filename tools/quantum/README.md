# tools/quantum — quantum computing bridge for the AshLane character pipeline

Free/open-source quantum SDKs wired into our real pipeline problems.
No credentials needed: everything runs on **local simulators**.
Real QPUs (IBM Quantum free tier) are optional — see `docs/QUANTUM_PIPELINE.md`.

## Setup

```sh
cd tools/quantum
python3 -m venv .venv
.venv/bin/pip install qiskit qiskit-aer pennylane
```

(`.venv/` is git-ignored; the model/scripts are the deliverable, not the env.)

## Prototypes

| Script | Problem (real) | Formulation | Solvers compared |
|---|---|---|---|
| `qubo_bone_map.py` | Map source bone names → canonical slots (`tools/anim-retarget/skeletons.py`) | QUBO assignment | exact brute-force vs QAOA (Aer simulator) |
| `qaoa_clip_setcover.py` | Pick min clip set covering all move slots from the 220-clip batch (88 PASS / 72 WARN / 60 FAIL) | QUBO set cover (NP-hard) | exact brute-force vs QAOA (Aer simulator) |
| `vqe_toy.py` | Variational loop smoke test (toy 2-qubit "pose energy") | VQE | exact diagonalization vs VQE (PennyLane) |

Run: `./.venv/bin/python qubo_bone_map.py`, etc. Each writes a `*_result.json`.

## Licenses (prototype manifest)

- qiskit, qiskit-aer: Apache 2.0
- pennylane: Apache 2.0
- scipy, numpy: BSD
All permissive. No GPL/AGPL in the quantum path.

## Honest summary (see docs/QUANTUM_PIPELINE.md for the full assessment)

- Bone-name mapping is polynomial (Hungarian, O(n³), exact). QAOA is a
  heuristic that is slower and not better here. The quantum-relevant upgrade
  is hierarchy-aware mapping (Quadratic Assignment — NP-hard).
- Clip set cover is NP-hard and the most legitimate quantum candidate;
  at 10 clips classical brute force still wins outright.
- VQE converges on the toy, proving the variational bridge works. Real pose
  optimization stays classical (continuous, high-dimensional).
- Rendering, textures, mesh deformation: GPUs own these. Not quantum problems.
