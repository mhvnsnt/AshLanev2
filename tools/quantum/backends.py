#!/usr/bin/env python3
"""
backends.py — backend swap paths for the quantum pipeline.

Every prototype in tools/quantum runs on LOCAL simulators (no credentials).
This module documents the code path to swap each simulator for a real
free-tier backend LATER, when the owner supplies their own token.

NO TOKENS ARE COLLECTED OR STORED HERE. All swap functions raise a clear
error naming the exact env var / signup step the owner would take.

Free-tier landscape (2026-10-06, verify before signup — tiers change):
  IBM Quantum   : free plan historically ~10 min QPU/month. Needs IBM Quantum
                  API token (owner creates at quantum.ibm.com, sets
                  IBQ_TOKEN env var). Qiskit provider: qiskit-ibm-runtime.
  D-Wave Leap   : free tier historically 1 min QPU/month + unlimited hybrid
                  solvers. Needs Leap API token (owner signs up at
                  cloud.dwavesys.com, sets DWAVE_TOKEN). Our QUBO dicts are
                  already in BinaryQuadraticModel-compatible form.
  IonQ / Braket : no meaningful free tier (pay-per-shot). NOT wired; the
                  swap pattern is identical to IBM's if ever wanted.
"""
import os


def get_backend(name="aer"):
    """Return a backend handle for QAOA/VQE prototypes.

    name="aer"     -> qiskit_aer.AerSimulator (default, no token)
    name="qulacs"  -> Qulacs-based statevector sim (fast CPU, no token)
    name="qsim"    -> cirq+qsim simulator (fast CPU, no token)
    name="ibm"     -> IBM Quantum real QPU (needs IBQ_TOKEN env var)
    name="dwave"   -> D-Wave Leap hybrid/annealer (needs DWAVE_TOKEN env var)
    """
    if name == "aer":
        from qiskit_aer import AerSimulator
        return AerSimulator()
    if name == "qulacs":
        return "qulacs"  # marker: use qulacs_qaoa.solve_with_qulacs(qubo)
    if name == "qsim":
        return "qsim"  # marker: use cirq_qsim.solve_with_qsim(qubo)
    if name == "ibm":
        token = os.environ.get("IBQ_TOKEN")
        if not token:
            raise RuntimeError(
                "IBM Quantum backend needs the owner's free-tier token: "
                "sign up at https://quantum.ibm.com, create an API token, "
                "then run with IBQ_TOKEN=<token>. No token is stored by us.")
        from qiskit_ibm_runtime import QiskitRuntimeService
        return QiskitRuntimeService(channel="ibm_quantum", token=token)
    if name == "dwave":
        token = os.environ.get("DWAVE_TOKEN")
        if not token:
            raise RuntimeError(
                "D-Wave Leap backend needs the owner's free-tier token: "
                "sign up at https://cloud.dwavesys.com, copy the API token, "
                "then run with DWAVE_TOKEN=<token>. Our QUBO dicts convert "
                "directly via dimod.BinaryQuadraticModel.from_qubo().")
        import dwave.system
        return dwave.system.DWaveSampler(token=token)
    raise ValueError(f"unknown backend: {name}")


def qubo_to_dimod(Q):
    """Convert our Q dict {(a,b): v} to a dimod BQM (for D-Wave later).

    dimod is Apache-2.0; only imported when actually targeting D-Wave.
    """
    import dimod
    return dimod.BinaryQuadraticModel.from_qubo(Q)


if __name__ == "__main__":
    b = get_backend("aer")
    print("aer backend OK:", type(b).__name__)
    for name in ("ibm", "dwave"):
        try:
            get_backend(name)
        except RuntimeError as e:
            print(f"{name}: correctly blocked without token -> {str(e)[:80]}...")
