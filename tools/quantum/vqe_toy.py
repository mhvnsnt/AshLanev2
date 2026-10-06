#!/usr/bin/env python3
"""
vqe_toy.py — Variational Quantum Eigensolver on a toy "pose energy".

HONEST FRAMING, read before running:
  Real pose/skin-weight optimization is CONTINUOUS and high-dimensional.
  Classical gradient methods (L-BFGS, Adam) dominate it completely — there is
  no credible near-term quantum advantage here, and this script does NOT claim
  one. Its purpose is narrower: prove the variational loop (ansatz ->
  expectation -> classical optimizer) RUNS in our toolchain, so that if a
  discrete subproblem ever needs it, the bridge is already built and tested.

  Toy: 2 qubits, H = 0.5*Z0 + 0.3*Z1 + 0.4*X0*X1. Find the ground-state energy
  with VQE (PennyLane, default.qubit simulator) vs exact diagonalization.

Usage:  ./vqe_toy.py [--steps 120]
"""
import argparse
import json
import time

import numpy as np
import pennylane as qml
from pennylane import numpy as pnp


def exact_ground_state():
    """Exact answer by diagonalization (the classical 'competitor')."""
    Z = np.array([[1, 0], [0, -1]])
    X = np.array([[0, 1], [1, 0]])
    I = np.eye(2)
    H = 0.5 * np.kron(Z, I) + 0.3 * np.kron(I, Z) + 0.4 * np.kron(X, X)
    w = np.linalg.eigvalsh(H)
    return float(w[0])


def vqe(steps):
    dev = qml.device("default.qubit", wires=2)

    @qml.qnode(dev)
    def circuit(params):
        # hardware-efficient ansatz: 2 layers
        qml.RY(params[0], wires=0)
        qml.RY(params[1], wires=1)
        qml.CNOT(wires=[0, 1])
        qml.RY(params[2], wires=0)
        qml.RY(params[3], wires=1)
        return (qml.expval(qml.PauliZ(0)),
                qml.expval(qml.PauliZ(1)),
                qml.expval(qml.PauliX(0) @ qml.PauliX(1)))

    def energy(params):
        z0, z1, xx = circuit(params)
        return 0.5 * z0 + 0.3 * z1 + 0.4 * xx

    t0 = time.time()
    opt = qml.AdamOptimizer(stepsize=0.15)
    params = pnp.random.uniform(0, 2 * np.pi, 4, requires_grad=True)
    for _ in range(steps):
        params = opt.step(energy, params)
    e = float(energy(params))
    dt = time.time() - t0
    return e, dt, [float(p) for p in params]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--steps", type=int, default=120)
    a = ap.parse_args()

    t0 = time.time()
    exact = exact_ground_state()
    edt = (time.time() - t0) * 1000
    print(f"[classical exact] {edt:.2f} ms  ground energy = {exact:.6f}")

    e, dt, params = vqe(a.steps)
    print(f"[VQE simulator]  {dt:.1f} s   ground energy = {e:.6f}")
    print(f"  error vs exact: {abs(e - exact):.2e}")

    with open("vqe_toy_result.json", "w") as f:
        json.dump({"exact": exact, "exact_ms": edt,
                   "vqe": e, "vqe_seconds": dt,
                   "error": abs(e - exact)}, f, indent=2)
    print("\nwrote vqe_toy_result.json")


if __name__ == "__main__":
    main()
