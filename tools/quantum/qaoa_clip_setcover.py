#!/usr/bin/env python3
"""
qaoa_clip_setcover.py — mocap clip-set selection as QUBO set cover.

PROBLEM (real, from tools/anim-retarget/out/report.json):
  The batch produced 220 retargeted clips: 88 PASS, 72 WARN, 60 FAIL.
  For a character we need a SET of clips covering every required move slot
  (walk, idle, punch, ...) with minimum count and maximum quality.
  FAIL clips are excluded; WARN clips are usable at reduced quality.

  Minimum set cover is NP-hard — a genuine combinatorial optimization problem,
  unlike name-only bone mapping (which is polynomial). This is the most honest
  "quantum candidate" in the character pipeline.

  x_i = 1  <=>  include clip i
  minimize  sum_i x_i - ALPHA * sum_i q_i x_i        (few clips, high quality)
          + P * sum_u (1 - sum_{i: u in cover_i} x_i)^2   (every slot covered)

SOLVERS COMPARED:
  1. EXACT classical: brute force over 2^10 (production: greedy + local search).
  2. QAOA on a local statevector simulator (Qiskit Aer).

Clip data below is modeled on the real batch: names from the 12
attacker/receiver pairs + locomotion banks; quality from PASS/WARN verdicts.

Usage:  ./qaoa_clip_setcover.py [--p 2] [--maxiter 80]
"""
import argparse
import itertools
import json
import math
import time

import numpy as np

SLOTS = ["walk", "idle", "punch", "kick", "grapple", "taunt", "hitreact", "knockdown"]

# (name, covered slots, batch verdict -> quality)
CLIPS = [
    ("cmu_walk",        ["walk"],                          "PASS"),
    ("ual_idle",        ["idle"],                          "PASS"),
    ("wrestling_suplex",["grapple"],                       "PASS"),
    ("suplex:vic",      ["grapple", "hitreact"],           "WARN"),
    ("ddt",             ["grapple"],                       "PASS"),
    ("ddt:vic",         ["grapple", "knockdown", "hitreact"], "WARN"),
    ("chokeslam",       ["grapple", "taunt"],              "WARN"),
    ("feral",           ["punch", "kick", "taunt"],        "WARN"),
    ("wrestling_brainbuster", ["grapple", "knockdown"],    "PASS"),
    ("ual_strike",      ["punch", "kick"],                 "WARN"),
]
QUALITY = {"PASS": 1.0, "WARN": 0.6, "FAIL": 0.0}

ALPHA = 0.5     # quality weight
PENALTY = 4.0   # must exceed any possible objective gain


def build_qubo(penalty= PENALTY, alpha=ALPHA):
    n = len(CLIPS)
    q = [QUALITY[v] for _, _, v in CLIPS]
    covers = [{s for s in SLOTS if s in cov} for _, cov, _ in CLIPS]
    Q = {}

    def add(a, b, v):
        if a > b:
            a, b = b, a
        Q[(a, b)] = Q.get((a, b), 0.0) + v

    for i in range(n):                       # minimize count, maximize quality
        add(i, i, 1.0 - alpha * q[i])
    for u in SLOTS:                          # P*(1 - sum_{i∋u} x_i)^2
        who = [i for i in range(n) if u in covers[i]]
        for i in who:                        # -2P*sum x_i  (+P*sum x_i from x^2=x)
            add(i, i, -penalty)               # net -P per var (see bone_map docstring)
        for a in range(len(who)):
            for b in range(a + 1, len(who)):
                add(who[a], who[b], 2 * penalty)
        # (no constant term needed for the argmin)
    return Q, covers, q


def qubo_value(Q, bits):
    return sum(qv * bits[a] * bits[b] for (a, b), qv in Q.items())


def classical_exact(Q, covers, q):
    n = len(CLIPS)
    t0 = time.time()
    best, best_bits = 1e18, None
    for z in range(1 << n):
        bits = [(z >> i) & 1 for i in range(n)]
        v = qubo_value(Q, bits)
        if v < best:
            best, best_bits = v, bits
    dt = time.time() - t0
    return best_bits, best, dt


def qaoa_solve(Q, n_vars, p, maxiter):
    from qiskit import QuantumCircuit
    from qiskit_aer import AerSimulator
    from scipy.optimize import minimize

    sim = AerSimulator(method="statevector")
    lin = np.zeros(n_vars)
    quad = {}
    for (a, b), qv in Q.items():
        if a == b:
            lin[a] += qv
        else:
            key = (a, b) if a < b else (b, a)
            quad[key] = quad.get(key, 0.0) + qv

    def cost_of_bits(bits):
        v = float(np.dot(lin, bits))
        for (a, b), qv in quad.items():
            v += qv * bits[a] * bits[b]
        return v

    def expectation(params):
        gammas, betas = params[:p], params[p:]
        qc = QuantumCircuit(n_vars)
        qc.h(range(n_vars))
        for layer in range(p):
            g = gammas[layer]
            for a in range(n_vars):
                if lin[a]:
                    qc.rz(2 * g * lin[a], a)
            for (a, b), qv in quad.items():
                qc.rzz(2 * g * qv, a, b)
            qc.rx(2 * betas[layer], range(n_vars))
        qc.save_statevector()
        sv = np.asarray(sim.run(qc).result().get_statevector())
        probs = np.abs(sv) ** 2
        e = 0.0
        for z in range(1 << n_vars):
            if probs[z]:
                bits = [(z >> a) & 1 for a in range(n_vars)]
                e += probs[z] * cost_of_bits(bits)
        return e

    t0 = time.time()
    x0 = np.random.uniform(0, math.pi, 2 * p)
    res = minimize(expectation, x0, method="COBYLA",
                   options={"maxiter": maxiter, "disp": False})
    gammas, betas = res.x[:p], res.x[p:]
    qc = QuantumCircuit(n_vars)
    qc.h(range(n_vars))
    for layer in range(p):
        for a in range(n_vars):
            if lin[a]:
                qc.rz(2 * gammas[layer] * lin[a], a)
        for (a, b), qv in quad.items():
            qc.rzz(2 * gammas[layer] * qv, a, b)
        qc.rx(2 * betas[layer], range(n_vars))
    qc.save_statevector()
    sv = np.asarray(sim.run(qc).result().get_statevector())
    probs = np.abs(sv) ** 2
    dt = time.time() - t0
    return np.argsort(probs)[::-1], probs, dt, float(res.fun)


def decode(order, probs, Q, covers):
    n = len(CLIPS)
    for z in order[:128]:
        bits = [(int(z) >> i) & 1 for i in range(n)]
        covered = set().union(*[covers[i] for i in range(n) if bits[i]]) if any(bits) else set()
        if set(SLOTS) <= covered:            # feasible: every slot covered
            chosen = [CLIPS[i][0] for i in range(n) if bits[i]]
            qual = sum(QUALITY[CLIPS[i][2]] for i in range(n) if bits[i])
            return chosen, len(chosen), qual, float(probs[z]), qubo_value(Q, bits)
    return None, 0, 0.0, 0.0, 1e18


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--p", type=int, default=2)
    ap.add_argument("--maxiter", type=int, default=80)
    a = ap.parse_args()

    Q, covers, q = build_qubo()
    print(f"== clip set cover: {len(CLIPS)} clips, {len(SLOTS)} slots =="
          f"  ({len(CLIPS)} binary vars)")

    cb, cv, cdt = classical_exact(Q, covers, q)
    cchosen = [CLIPS[i][0] for i in range(len(CLIPS)) if cb[i]]
    print(f"\n[classical exact] {cdt*1000:.1f} ms  energy={cv:.3f}")
    print(f"  clips ({len(cchosen)}): {cchosen}")

    order, probs, qdt, qe = qaoa_solve(Q, len(CLIPS), a.p, a.maxiter)
    chosen, cnt, qual, prob, qv = decode(order, probs, Q, covers)
    print(f"\n[QAOA simulator p={a.p}] {qdt:.1f} s  final energy={qe:.3f}")
    if chosen:
        print(f"  decoded (p={prob:.3f}) energy={qv:.3f}")
        print(f"  clips ({cnt}, quality {qual:.1f}): {chosen}")
        print(f"  optimal match: {set(chosen) == set(cchosen)}")
    else:
        print("  no feasible cover in top samples")

    with open("qaoa_clip_setcover_result.json", "w") as f:
        json.dump({
            "classical": {"clips": cchosen, "energy": cv, "ms": cdt * 1000},
            "qaoa": {"clips": chosen, "count": cnt, "quality": qual,
                     "seconds": qdt, "energy": qe},
        }, f, indent=2)
    print("\nwrote qaoa_clip_setcover_result.json")


if __name__ == "__main__":
    main()
