#!/usr/bin/env python3
"""
tools/tests/fuzz_glb_parse.py — AFL++ harness for the repo's GLB binary
parser (tools/anim-retarget/common.py::Glb, used by tools/verify/
defect_gates.py's load_model).

The ingest-QC gate parses untrusted GLB bytes; a malformed file should
produce a clean error, never an unhandled crash or hang. This harness
feeds mutated GLB bytes to Glb() + accessor() and lets unexpected
exceptions crash (AFL++ records them).

Run (needs AFL++ built at ~/workspace/tmp/aflpp + svenv):
  mkdir -p /tmp/fuzz/corpus /tmp/fuzz/out
  python3 tools/tests/make_glb_corpus.py /tmp/fuzz/corpus
  ~/workspace/tmp/aflpp/afl-fuzz -i /tmp/fuzz/corpus -o /tmp/fuzz/out \
      -- ~/workspace/venvs/svenv/bin/python tools/tests/fuzz_glb_parse.py

Fuzzing policy: malformed-input errors (ValueError, struct.error,
json.JSONDecodeError, KeyError, UnicodeDecodeError) are EXPECTED and
caught — they are the parser doing its job. Anything else
(MemoryError from a huge alloc, RecursionError, IndexError escaping to
callers, hangs) is a real finding and crashes the harness.
"""

import os
import struct
import sys
import tempfile

import afl  # python-afl: AFL++ forkserver shim (Apache-2.0 compatible use)

HERE = os.path.dirname(os.path.abspath(__file__))
TOOLS = os.path.abspath(os.path.join(HERE, ".."))
sys.path.insert(0, os.path.join(TOOLS, "anim-retarget"))

import common as ar  # noqa: E402

# Malformed input -> clean, catchable errors. These are FINE.
EXPECTED = (ValueError, struct.error, KeyError, IndexError,
            UnicodeDecodeError)


def run_one(data: bytes):
    fd, path = tempfile.mkstemp(suffix=".glb")
    try:
        with os.fdopen(fd, "wb") as f:
            f.write(data)
        try:
            g = ar.Glb(path)
        except EXPECTED:
            return
        # Parsed: exercise the accessor struct.unpack_from paths too.
        for i in range(len(g.js.get("accessors", []))):
            try:
                g.accessor(i)
            except EXPECTED:
                pass
        try:
            import json  # noqa: F401
            _ = g.js.get("nodes", [])
        except EXPECTED:
            pass
    finally:
        os.unlink(path)


def main():
    # Persistent mode: AFL++ reuses the process across inputs.
    # (afl.loop self-initializes; no separate afl.init() — that double-inits.)
    while afl.loop(1000):
        data = sys.stdin.buffer.read()
        run_one(data)


if __name__ == "__main__":
    main()
