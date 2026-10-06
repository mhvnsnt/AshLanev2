#!/usr/bin/env python3
"""
simulator_shootout.py — which local simulator is fastest for OUR workload?

Same QAOA ansatz circuit (n=6 qubits, p=1, cost Hamiltonian from a small
bone-map QUBO) simulated on: Qiskit Aer, Qulacs, Cirq+qsim. Plus QuTiP exact
diagonalization of the same Hamiltonian as the classical reference.

This decides which backend our future variational experiments should use.
No QPU, no tokens — all local CPU simulators.

Usage:  ./simulator_shootout.py [--n 6] [--shots 0]
Writes: simulator_shootout_result.json
"""
import argparse
import json
import time

import numpy as np

# --- build a small QUBO (6-qubit bone-map style assignment, n=2 bones) ---
# Use a simple 6-qubit MaxCut-ish QUBO so every SDK builds the same circuit.


def build_hamiltonian(n):
    """Return (pauli_terms, qubo_Q) for an n-qubit test Hamiltonian."""
    rng = np.random.default_rng(42)
    Q = {}
    for i in range(n):
        Q[(i, i)] = rng.uniform(-1, 1)
        for j in range(i + 1, n):
            if rng.random() < 0.4:
                Q[(i, j)] = rng.uniform(-1, 1)
    return Q


def qubo_to_ising(Q, n):
    """Convert QUBO dict to Ising (Z) coefficients for circuit building."""
    # H = sum_i h_i Z_i + sum_{i<j} J_ij Z_i Z_j  (+ const, dropped)
    h = np.zeros(n)
    J = np.zeros((n, n))
    for (a, b), v in Q.items():
        if a == b:
            h[a] += v / 2.0
        else:
            J[a, b] += v / 4.0
            h[a] += v / 4.0
            h[b] += v / 4.0
    return h, J


def qaoa_angles(n, p=1, seed=1):
    rng = np.random.default_rng(seed)
    return rng.uniform(0, 2 * np.pi, 2 * p)


# --- Aer ---
def run_aer(Q, n, angles, p=1):
    from qiskit import QuantumCircuit
    from qiskit_aer import AerSimulator
    h, J = qubo_to_ising(Q, n)
    t0 = time.perf_counter()
    qc = QuantumCircuit(n)
    qc.h(range(n))
    ai = 0
    for _ in range(p):
        gamma, beta = angles[ai], angles[ai + 1]
        ai += 2
        for i in range(n):
            if abs(h[i]) > 1e-12:
                qc.rz(2 * gamma * h[i], i)
        for i in range(n):
            for j in range(i + 1, n):
                if abs(J[i, j]) > 1e-12:
                    qc.rzz(2 * gamma * J[i, j], i, j)
        qc.rx(2 * beta, range(n))
    qc.save_statevector()
    sim = AerSimulator(method="statevector")
    res = sim.run(qc).result()
    sv = np.asarray(res.get_statevector())
    dt = time.perf_counter() - t0
    return dt, float(np.sum(np.abs(sv) ** 2))


# --- Qulacs ---
def run_qulacs(Q, n, angles, p=1):
    from qulacs import QuantumState, QuantumCircuit as QC
    from qulacs.gate import H, RZ, RX, DenseMatrix
    h, J = qubo_to_ising(Q, n)
    t0 = time.perf_counter()
    circ = QC(n)
    for i in range(n):
        circ.add_gate(H(i))
    ai = 0
    for _ in range(p):
        gamma, beta = angles[ai], angles[ai + 1]
        ai += 2
        for i in range(n):
            if abs(h[i]) > 1e-12:
                circ.add_gate(RZ(i, 2 * gamma * h[i]))
        for i in range(n):
            for j in range(i + 1, n):
                if abs(J[i, j]) > 1e-12:
                    # RZZ via dense 4x4
                    th = 2 * gamma * J[i, j]
                    mat = np.diag([np.exp(-1j * th / 2), np.exp(1j * th / 2),
                                   np.exp(1j * th / 2), np.exp(-1j * th / 2)])
                    circ.add_gate(DenseMatrix([i, j], mat))
        for i in range(n):
            circ.add_gate(RX(i, 2 * beta))
    state = QuantumState(n)
    circ.update_quantum_state(state)
    vec = state.get_vector()
    dt = time.perf_counter() - t0
    return dt, float(np.sum(np.abs(vec) ** 2))


# --- Cirq + qsim ---
def run_qsim(Q, n, angles, p=1):
    import cirq
    import qsimcirq
    h, J = qubo_to_ising(Q, n)
    t0 = time.perf_counter()
    qs = [cirq.LineQubit(i) for i in range(n)]
    circ = cirq.Circuit(cirq.H(q) for q in qs)
    ai = 0
    for _ in range(p):
        gamma, beta = angles[ai], angles[ai + 1]
        ai += 2
        for i in range(n):
            if abs(h[i]) > 1e-12:
                circ.append(cirq.rz(2 * gamma * h[i])(qs[i]))
        for i in range(n):
            for j in range(i + 1, n):
                if abs(J[i, j]) > 1e-12:
                    circ.append(cirq.ZZ(qs[i], qs[j]) ** (2 * gamma * J[i, j] / np.pi))
        circ.append(cirq.rx(2 * beta)(q) for q in qs)
    sim = qsimcirq.QSimSimulator()
    res = sim.simulate(circ)
    vec = np.asarray(res.final_state_vector)
    dt = time.perf_counter() - t0
    return dt, float(np.sum(np.abs(vec) ** 2))


# --- QuTiP exact ---
def run_qutip(Q, n):
    import qutip
    h, J = qubo_to_ising(Q, n)
    t0 = time.perf_counter()
    sz = qutip.sigmaz()
    H = 0
    for i in range(n):
        ops = [qutip.qeye(2)] * n
        ops[i] = sz
        H = H + h[i] * qutip.tensor(ops)
    for i in range(n):
        for j in range(i + 1, n):
            if abs(J[i, j]) > 1e-12:
                ops = [qutip.qeye(2)] * n
                ops[i] = sz
                ops[j] = sz
                H = H + J[i, j] * qutip.tensor(ops)
    evals = H.eigenenergies()
    dt = time.perf_counter() - t0
    return dt, float(np.min(evals))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--n", type=int, default=6)
    ap.add_argument("--p", type=int, default=1)
    args = ap.parse_args()

    Q = build_hamiltonian(args.n)
    angles = qaoa_angles(args.n, args.p)
    out = {"n_qubits": args.n, "p": args.p, "results": {}}

    for name, fn in [("aer", run_aer), ("qulacs", run_qulacs), ("qsim", run_qsim)]:
        try:
            dt, norm = fn(Q, args.n, angles, args.p)
            out["results"][name] = {"seconds": round(dt, 3), "norm": round(norm, 6), "ok": True}
            print(f"{name}: {dt:.3f}s norm={norm:.6f}")
        except Exception as e:
            out["results"][name] = {"ok": False, "error": str(e)[:200]}
            print(f"{name}: FAILED {e}")

    try:
        dt, e0 = run_qutip(Q, args.n)
        out["results"]["qutip_exact"] = {"seconds": round(dt, 3), "ground_energy": round(e0, 6), "ok": True}
        print(f"qutip_exact: {dt:.3f}s E0={e0:.6f}")
    except Exception as e:
        out["results"]["qutip_exact"] = {"ok": False, "error": str(e)[:200]}
        print(f"qutip_exact: FAILED {e}")

    with open("simulator_shootout_result.json", "w") as f:
        json.dump(out, f, indent=2)


if __name__ == "__main__":
    main()
