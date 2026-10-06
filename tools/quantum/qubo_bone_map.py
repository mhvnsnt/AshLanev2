#!/usr/bin/env python3
"""
qubo_bone_map.py — skeleton bone-name mapping as QUBO.

PROBLEM (real, from tools/anim-retarget/skeletons.py):
  Map each source-skeleton bone name to a canonical slot (Hips, Spine, ...).
  Today this is done with explicit dicts + prefix-strip rules. The combinatorial
  core is an ASSIGNMENT problem: N source bones -> N canonical slots, one-to-one,
  maximizing name-similarity scores.

  x[i,j] = 1  <=>  source bone i maps to canonical slot j
  minimize  sum_ij (-sim_ij) * x_ij
          + P * sum_i (sum_j x_ij - 1)^2      (each source -> exactly one slot)
          + P * sum_j (sum_i x_ij - 1)^2      (each slot <- exactly one source)

SOLVERS COMPARED:
  1. EXACT classical: brute-force over n! permutations (exact for small n;
     production uses the Hungarian algorithm, O(n^3), also exact).
  2. QAOA on a local statevector simulator (Qiskit Aer): heuristic, the
     "quantum" candidate. No real QPU is used — no credentials needed.

HONEST FRAMING: name-only mapping is solvable EXACTLY and FAST classically.
The quantum-relevant extension is hierarchy-aware mapping (parent-child
consistency bonuses make it a Quadratic Assignment Problem — NP-hard), which
is formulated in docs/QUANTUM_PIPELINE.md as the research direction.

Usage:  ./qubo_bone_map.py [--n 3] [--p 2] [--maxiter 60]
"""
import argparse
import difflib
import itertools
import json
import math
import sys
import time

import numpy as np

# ---------------------------------------------------------------- real data
# Source: quaternius family bone names (tools/anim-retarget/skeletons.py)
# Target: canonical slots (stripped Mixamo names)
SOURCE_BONES = ["pelvis", "spine_01", "upperarm_l", "hand_l",
                "lowerarm_l", "neck_01", "spine_02", "clavicle_l"]
CANON_SLOTS = ["Hips", "Spine", "LeftArm", "LeftHand",
               "LeftForeArm", "Neck", "Spine1", "LeftShoulder"]
# Ground truth from the pipeline's explicit map (what production uses today)
GROUND_TRUTH = {"pelvis": "Hips", "spine_01": "Spine", "spine_02": "Spine1",
                "neck_01": "Neck", "clavicle_l": "LeftShoulder",
                "upperarm_l": "LeftArm", "lowerarm_l": "LeftForeArm",
                "hand_l": "LeftHand"}


def name_sim(a, b):
    """Similarity in [0,1] between a source bone name and a canonical slot."""
    a, b = a.lower(), b.lower()
    base = difflib.SequenceMatcher(None, a, b).ratio()
    # side-token bonus: _l/_r <-> Left/Right
    side_a = "left" if a.endswith("_l") else ("right" if a.endswith("_r") else "")
    side_b = "left" if b.startswith("left") else ("right" if b.startswith("right") else "")
    bonus = 0.15 if (side_a and side_a == side_b) else 0.0
    return min(1.0, base + bonus)


def build_qubo(src, canon, penalty):
    """Return dict Q[(a,b)] (a<=b) for minimize x^T Q x, var a = i*n+j.

    Objective: -sim_ij * x_ij.
    Row/col constraints via  P*(sum x - 1)^2 = P*(-sum x + 2*sum_{pairs} x_a x_b)
    (binary x^2 = x; the +1 constant is dropped). With P > max sim, any
    one-to-one assignment beats every infeasible neighbor.
    """
    n = len(src)
    sim = np.zeros((n, n))
    for i, s in enumerate(src):
        for j, c in enumerate(canon):
            sim[i, j] = name_sim(s, c)

    Q = {}

    def add(a, b, v):
        if a > b:
            a, b = b, a
        Q[(a, b)] = Q.get((a, b), 0.0) + v

    for i in range(n):                      # objective
        for j in range(n):
            add(i * n + j, i * n + j, -sim[i, j])
    for i in range(n):                      # each source -> exactly one slot
        for j in range(n):
            add(i * n + j, i * n + j, -penalty)
        for j in range(n):
            for k in range(j + 1, n):
                add(i * n + j, i * n + k, 2 * penalty)
    for j in range(n):                      # each slot <- exactly one source
        for i in range(n):
            add(i * n + j, i * n + j, -penalty)
        for i in range(n):
            for k in range(i + 1, n):
                add(i * n + j, k * n + j, 2 * penalty)
    return Q, sim


def qubo_value(Q, bits):
    v = 0.0
    for (a, b), q in Q.items():
        v += q * bits[a] * bits[b]
    return v


def classical_exact(src, canon):
    """Brute-force exact assignment (production equivalent: Hungarian, O(n^3))."""
    n = len(src)
    t0 = time.time()
    best, best_perm = -1.0, None
    for perm in itertools.permutations(range(n)):
        s = sum(name_sim(src[i], canon[perm[i]]) for i in range(n))
        if s > best:
            best, best_perm = s, perm
    dt = time.time() - t0
    mapping = {src[i]: canon[best_perm[i]] for i in range(n)}
    return mapping, best, dt


def qaoa_solve(Q, n_vars, p, maxiter):
    """Manual QAOA with Qiskit statevector sim + scipy COBYLA. Returns best bitstring."""
    from qiskit import QuantumCircuit
    from qiskit_aer import AerSimulator
    from scipy.optimize import minimize

    sim = AerSimulator(method="statevector")
    # linear and quadratic coefficients of the cost Hamiltonian (Z basis)
    lin = np.zeros(n_vars)
    quad = {}
    for (a, b), q in Q.items():
        if a == b:
            lin[a] += q
        else:
            key = (a, b) if a < b else (b, a)
            quad[key] = quad.get(key, 0.0) + q

    def cost_of_bits(bits):
        v = 0.0
        for a in range(n_vars):
            v += lin[a] * bits[a]
        for (a, b), q in quad.items():
            v += q * bits[a] * bits[b]
        return v

    def expectation(params):
        gammas = params[:p]
        betas = params[p:]
        qc = QuantumCircuit(n_vars)
        qc.h(range(n_vars))
        for layer in range(p):
            g = gammas[layer]
            for a in range(n_vars):
                if lin[a]:
                    qc.rz(2 * g * lin[a], a)
            for (a, b), q in quad.items():
                qc.rzz(2 * g * q, a, b)
            qc.rx(2 * betas[layer], range(n_vars))
        qc.save_statevector()
        sv = sim.run(qc).result().get_statevector()
        probs = np.abs(np.asarray(sv)) ** 2
        e = 0.0
        for z in range(1 << n_vars):
            if probs[z] == 0:
                continue
            bits = [(z >> a) & 1 for a in range(n_vars)]
            e += probs[z] * cost_of_bits(bits)
        return e

    t0 = time.time()
    x0 = np.random.uniform(0, math.pi, 2 * p)
    res = minimize(expectation, x0, method="COBYLA",
                   options={"maxiter": maxiter, "disp": False})
    # final state -> most probable bitstring
    gammas, betas = res.x[:p], res.x[p:]
    qc = QuantumCircuit(n_vars)
    qc.h(range(n_vars))
    for layer in range(p):
        for a in range(n_vars):
            if lin[a]:
                qc.rz(2 * gammas[layer] * lin[a], a)
        for (a, b), q in quad.items():
            qc.rzz(2 * gammas[layer] * q, a, b)
        qc.rx(2 * betas[layer], range(n_vars))
    qc.save_statevector()
    sv = sim.run(qc).result().get_statevector()
    probs = np.abs(np.asarray(sv)) ** 2
    order = np.argsort(probs)[::-1]
    dt = time.time() - t0
    return order, probs, dt, float(res.fun)


def decode_mapping(order, probs, src, canon):
    """Best valid (one-to-one) bitstring among the top samples."""
    n = len(src)
    for z in order[:64]:
        bits = [(int(z) >> a) & 1 for a in range(n * n)]
        rows = [sum(bits[i * n + j] for j in range(n)) for i in range(n)]
        cols = [sum(bits[i * n + j] for i in range(n)) for j in range(n)]
        if all(r == 1 for r in rows) and all(c == 1 for c in cols):
            mapping = {}
            for i in range(n):
                for j in range(n):
                    if bits[i * n + j]:
                        mapping[src[i]] = canon[j]
            score = sum(name_sim(s, c) for s, c in mapping.items())
            return mapping, score, float(probs[z])
    return None, 0.0, 0.0


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--n", type=int, default=3, help="problem size (bones)")
    ap.add_argument("--p", type=int, default=2, help="QAOA layers (>=1)")
    ap.add_argument("--maxiter", type=int, default=60)
    ap.add_argument("--penalty", type=float, default=3.0)
    a = ap.parse_args()
    assert a.p >= 1, "--p must be >= 1"

    src, canon = SOURCE_BONES[:a.n], CANON_SLOTS[:a.n]
    print(f"== bone mapping: {a.n} source bones -> {a.n} canonical slots =="
         f"  ({a.n * a.n} binary vars)")

    # --- classical exact
    cmap, cscore, cdt = classical_exact(src, canon)
    print(f"\n[classical exact] {cdt*1000:.1f} ms  similarity={cscore:.3f}")
    print("  mapping:", cmap)

    # --- QAOA
    Q, sim = build_qubo(src, canon, a.penalty)
    order, probs, qdt, qenergy = qaoa_solve(Q, a.n * a.n, a.p, a.maxiter)
    qmap, qscore, qprob = decode_mapping(order, probs, src, canon)
    print(f"\n[QAOA simulator p={a.p}] {qdt:.1f} s  final energy={qenergy:.3f}")
    if qmap:
        print(f"  decoded (p={qprob:.3f}) similarity={qscore:.3f}")
        print("  mapping:", qmap)
    else:
        print("  no valid one-to-one assignment in top samples")

    # --- ground truth check
    gt = {s: GROUND_TRUTH[s] for s in src}
    print("\n[ground truth] pipeline explicit map:", gt)
    print("  classical matches truth:", cmap == gt,
          "| QAOA matches truth:", qmap == gt if qmap else False)

    out = {
        "n": a.n, "p": a.p,
        "classical": {"mapping": cmap, "similarity": cscore, "ms": cdt * 1000},
        "qaoa": {"mapping": qmap, "similarity": qscore,
                 "seconds": qdt, "energy": qenergy},
        "ground_truth": gt,
    }
    with open("qubo_bone_map_result.json", "w") as f:
        json.dump(out, f, indent=2)
    print("\nwrote qubo_bone_map_result.json")


if __name__ == "__main__":
    main()
