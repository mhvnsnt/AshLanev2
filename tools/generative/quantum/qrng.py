#!/usr/bin/env python3
"""
qrng.py — unified quantum randomness source for AshLane generative tools.

Every function returns (bytes, provenance_string). The provenance string is a
plain-English record of where the randomness actually came from — callers store
it alongside outputs so every variant can be traced to its source.

Source priority (first success wins):
  1. ANU QRNG API — REAL quantum hardware. Photonic quantum random number
     generator run by the Australian National University (qrng.anu.edu.au).
     Free, no signup, network required.
  2. IBM Quantum — REAL superconducting quantum hardware via Qiskit IBM
     Runtime. OPTIONAL and opt-in only: requires env var IBM_QUANTUM_TOKEN.
     Without a token this source is skipped with a clear message.
  3. Qiskit Aer — classical SIMULATION of quantum circuits (statevector/
     sampling of Hadamard circuits). Labeled honestly: not quantum hardware.
  4. Classical fallback — Python `secrets` (CSPRNG). Used only when offline.
     Provenance is labeled "classical-fallback" so nobody mistakes it for
     quantum randomness.

Design rule: provenance must never lie. If a byte came from a classical PRNG,
the string says so.
"""

import os
import secrets
import urllib.request
import json

ANU_URL = "https://qrng.anu.edu.au/API/jsonI.php?length={n}&type=uint8"
ANU_MAX_PER_CALL = 1024  # API-side limit; we chunk above this

IBM_TOKEN_ENV = "IBM_QUANTUM_TOKEN"


# ---------------------------------------------------------------------------
# Individual sources
# ---------------------------------------------------------------------------

def fetch_anu(nbytes):
    """REAL quantum hardware: ANU photonic QRNG over HTTPS.

    Raises URLError on network failure so callers can fall through.
    """
    chunks = []
    remaining = nbytes
    while remaining > 0:
        take = min(remaining, ANU_MAX_PER_CALL)
        with urllib.request.urlopen(ANU_URL.format(n=take), timeout=30) as r:
            payload = json.loads(r.read().decode("utf-8"))
        if not payload.get("success"):
            raise RuntimeError("ANU QRNG API returned success=false")
        chunks.append(bytes(payload["data"]))
        remaining -= take
    data = b"".join(chunks)
    prov = ("anu-qrng: REAL photonic quantum hardware via qrng.anu.edu.au "
            "(Australian National University, free public API, no signup). "
            "True unpredictability from quantum vacuum-fluctuation measurement.")
    return data, prov


def qiskit_aer_bytes(nbytes, qubits_per_shot=8):
    """Classical SIMULATION of quantum circuits — NOT quantum hardware.

    Builds an n-qubit Hadamard circuit (equal superposition) and samples it
    with Qiskit's Aer simulator. The math is quantum (uniform |0>/<|1>
    measurement), but it runs on a classical CPU, so the randomness quality
    is bounded by the simulator's classical PRNG underneath. Labeled as such.

    Requires: pip install qiskit qiskit-aer
    """
    try:
        from qiskit import QuantumCircuit
        from qiskit_aer import AerSimulator
    except ImportError:
        raise ImportError("qiskit_aer_bytes needs qiskit and qiskit-aer: "
                          "pip install qiskit qiskit-aer")
    sim = AerSimulator()
    bytes_per_shot = qubits_per_shot // 8
    shots_needed = -(-nbytes // bytes_per_shot)  # ceil: each shot yields 1 byte
    qc = QuantumCircuit(qubits_per_shot, qubits_per_shot)
    qc.h(range(qubits_per_shot))
    qc.measure(range(qubits_per_shot), range(qubits_per_shot))
    counts = sim.run(qc, shots=shots_needed).result().get_counts()
    # Expand shot counts into a bitstream (order of counts dict keys is not
    # reproducible across qiskit versions; the randomness content is what we
    # keep, and we always re-hash through derive functions downstream).
    out = bytearray()
    for bitstr, count in counts.items():
        b = int(bitstr, 2)
        out.extend(b.to_bytes(qubits_per_shot // 8, "big") * count)
        if len(out) >= nbytes:
            break
    data = bytes(out[:nbytes])
    prov = ("qiskit-aer: CLASSICAL SIMULATION of quantum circuits "
            "(Hadamard superposition sampled on a local CPU simulator). "
            "Not quantum hardware; randomness quality is that of the "
            "simulator's underlying classical PRNG. Honest label.")
    return data, prov


def ibm_quantum_bytes(nbytes):
    """REAL quantum hardware: IBM superconducting QPUs via Qiskit Runtime.

    Opt-in only. Requires env var IBM_QUANTUM_TOKEN (free IBM Quantum
    account: quantum.ibm.com). Skips gracefully without a token — raises
    RuntimeError with instructions, never crashes silently.
    """
    token = os.environ.get(IBM_TOKEN_ENV)
    if not token:
        raise RuntimeError(
            f"ibm_quantum_bytes skipped: no token. Set {IBM_TOKEN_ENV} "
            "(free at https://quantum.ibm.com) to enable REAL IBM quantum "
            "hardware sampling.")
    try:
        from qiskit import QuantumCircuit
        from qiskit_ibm_runtime import QiskitRuntimeService, SamplerV2 as Sampler
    except ImportError:
        raise ImportError("ibm_quantum_bytes needs qiskit and "
                          "qiskit-ibm-runtime: pip install qiskit-ibm-runtime")
    service = QiskitRuntimeService(channel="ibm_quantum_platform", token=token)
    backend = service.least_busy(min_num_qubits=8)
    qc = QuantumCircuit(8, 8)
    qc.h(range(8))
    qc.measure(range(8), range(8))
    shots = -(-nbytes // 1)  # one byte per shot
    job = Sampler(backend).run([qc], shots=shots)
    counts = job.result()[0].data.c.get_counts()
    out = bytearray()
    for bitstr, count in counts.items():
        out.extend(int(bitstr, 2).to_bytes(1, "big") * count)
        if len(out) >= nbytes:
            break
    data = bytes(out[:nbytes])
    prov = (f"ibm-quantum: REAL superconducting quantum hardware "
            f"(Qiskit Runtime, backend={backend.name}). Token-gated, opt-in.")
    return data, prov


def classical_fallback_bytes(nbytes):
    """Classical fallback: Python secrets (OS CSPRNG). NOT quantum.

    Used only when all quantum sources are unreachable. Provenance says so.
    """
    data = secrets.token_bytes(nbytes)
    prov = ("classical-fallback: NO quantum source available (offline / no "
            "token / no qiskit). Bytes from Python secrets (OS CSPRNG) — "
            "fine for gameplay variation, NOT quantum randomness.")
    return data, prov


# ---------------------------------------------------------------------------
# Unified entry point
# ---------------------------------------------------------------------------

def quantum_bytes(nbytes, sources=("anu",), allow_classical_fallback=True):
    """Get nbytes of randomness, trying each named source in order.

    sources: tuple of "anu" | "ibm" | "aer". Each is attempted; the first
      that succeeds wins. IBM is skipped without a token (logged, not fatal).
    Returns (bytes, provenance_string). Never returns silently-mislabeled data:
      if everything fails and allow_classical_fallback is True, falls back to
      `secrets` with an honest "classical-fallback" provenance string; if
      False, raises the last error instead.

    Default is ("anu",) — the always-available real quantum hardware.
    """
    attempts = {"anu": fetch_anu, "ibm": ibm_quantum_bytes, "aer": qiskit_aer_bytes}
    errors = []
    for name in sources:
        fn = attempts.get(name)
        if fn is None:
            errors.append(f"unknown source '{name}'")
            continue
        try:
            return fn(nbytes)
        except Exception as e:  # noqa: BLE001 — any failure means try next
            errors.append(f"{name}: {type(e).__name__}: {e}")
    if allow_classical_fallback:
        return classical_fallback_bytes(nbytes)
    raise RuntimeError("all quantum sources failed: " + " | ".join(errors))


def provenance_report(nbytes=16, sources=("anu", "aer")):
    """Diagnostic: try each source, print what worked and what didn't.

    Safe to run anywhere; used by README examples and CI smoke tests.
    """
    lines = []
    for name in sources:
        fn = {"anu": fetch_anu, "ibm": ibm_quantum_bytes,
              "aer": qiskit_aer_bytes}[name]
        try:
            data, prov = fn(nbytes)
            lines.append(f"[OK]   {name}: {len(data)} bytes — {prov[:90]}...")
        except Exception as e:  # noqa: BLE001
            lines.append(f"[SKIP] {name}: {type(e).__name__}: {e}")
    return "\n".join(lines)


if __name__ == "__main__":
    print("qrng.py self-test — per-source probe (16 bytes each):\n")
    print(provenance_report())
    print()
    data, prov = quantum_bytes(32)
    print(f"quantum_bytes(32) -> {data.hex()}")
    print(f"provenance: {prov}")
