#!/usr/bin/env python3
"""
tools/qrng/ibm_batch_seeds.py — batch-draw REAL quantum bytes from IBM
Quantum hardware (Qiskit Runtime). TOKEN-GATED.

Without IBM_QUANTUM_TOKEN set, this prints the 3-step setup instructions
(see IBM_QUANTUM_TOKEN_SETUP.md) and exits non-zero — NEVER silently.
With a token but no qiskit-ibm-runtime installed, it prints the pip
command and exits.

Usage:
  export IBM_QUANTUM_TOKEN="..."
  python3 tools/qrng/ibm_batch_seeds.py --batches 4 --bytes 64
Out: tools/qrng/proof/ibm_batch_<UTC>.json  (bytes + per-batch provenance)
"""

import argparse
import datetime
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
SETUP_DOC = os.path.join(HERE, "IBM_QUANTUM_TOKEN_SETUP.md")
TOKEN_ENV = "IBM_QUANTUM_TOKEN"
MAX_SHOTS_DEFAULT = 4096  # hard cost guardrail: stay inside the free tier

sys.path.insert(0, os.path.join(os.path.dirname(HERE), "generative", "quantum"))


def fail_loudly(reason):
    print(f"FATAL: {reason}\n", file=sys.stderr)
    try:
        with open(SETUP_DOC, encoding="utf-8") as f:
            print(f.read(), file=sys.stderr)
    except OSError:
        print(f"(setup doc missing; {TOKEN_ENV} env var holds the token)",
              file=sys.stderr)
    sys.exit(2)


def main(argv=None):
    ap = argparse.ArgumentParser(description="IBM Quantum batch seed pull (token-gated)")
    ap.add_argument("--batches", type=int, default=4)
    ap.add_argument("--bytes", type=int, default=64,
                    help="bytes per batch (1 shot/byte on 8 qubits)")
    ap.add_argument("--max-shots", type=int, default=MAX_SHOTS_DEFAULT)
    ap.add_argument("--out", default=None)
    args = ap.parse_args(argv)

    token = os.environ.get(TOKEN_ENV)
    if not token:
        fail_loudly(f"{TOKEN_ENV} is not set — IBM Quantum path is opt-in.")

    if args.batches * args.bytes > args.max_shots:
        fail_loudly(
            f"requested {args.batches * args.bytes} shots exceeds "
            f"--max-shots {args.max_shots} (free-tier guardrail).")

    try:
        from qrng import ibm_quantum_bytes
    except ImportError as e:
        fail_loudly(f"cannot import qrng helper: {e}")

    try:
        import qiskit_ibm_runtime  # noqa: F401
    except ImportError:
        fail_loudly("qiskit-ibm-runtime is not installed. Run:\n"
                    "  /tmp/qvenv/bin/pip install qiskit-ibm-runtime")

    batches = []
    for i in range(args.batches):
        data, prov = ibm_quantum_bytes(args.bytes)
        batches.append({
            "index": i,
            "bytes_hex": data.hex(),
            "provenance": prov,
            "fetched_at": datetime.datetime.now(
                datetime.timezone.utc).isoformat(),
        })
        print(f"batch {i}: {len(data)} bytes — {prov[:80]}...")

    out = args.out or os.path.join(
        HERE, "proof",
        "ibm_batch_" + datetime.datetime.now(
            datetime.timezone.utc).strftime("%Y%m%dT%H%M%SZ") + ".json")
    os.makedirs(os.path.dirname(out), exist_ok=True)
    with open(out, "w", encoding="utf-8") as f:
        json.dump({"source": "ibm-quantum-batch", "batches": batches}, f, indent=2)
    print(f"saved -> {out}")


if __name__ == "__main__":
    main()
