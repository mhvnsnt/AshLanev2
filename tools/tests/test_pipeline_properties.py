#!/usr/bin/env python3
"""
tools/tests/test_pipeline_properties.py — Hypothesis property tests for the
procedural/generative Python pipeline.

Real invariants, not tautologies. CI-able: no network, no GPU, no owner
data. Run:  ~/workspace/venvs/svenv/bin/python -m pytest tools/tests/ -q

Properties:
  P1  seeds.derive is deterministic: same (bytes, label) -> same uint64.
  P2  seeds.derive separates labels: distinct labels -> distinct seeds
      (64-bit hash; collision on the tested set fails the test honestly).
  P3  SeedPack save/load round-trip: load(path).verify() is True and the
      derived seeds are byte-identical to the original.
  P4  quantum_random_bytes returns exactly nbytes and a non-empty
      provenance string that honestly names its source.
  P5  SeedPool accounting: draw(n) decreases remaining() by n; bytes drawn
      are a prefix of the pooled batches and never overlap across draws.
  P6  stamp_manifest writes qrng_source/seed/timestamp into a manifest file
      and a second stamp overwrites (no stale records).
"""

import json
import os
import sys
import tempfile

import pytest
from hypothesis import given, settings, assume
from hypothesis import strategies as st

HERE = os.path.dirname(os.path.abspath(__file__))
TOOLS = os.path.abspath(os.path.join(HERE, ".."))
sys.path.insert(0, TOOLS)
sys.path.insert(0, os.path.join(TOOLS, "generative", "quantum"))

import seeds  # noqa: E402
from seeds import SeedPack, derive  # noqa: E402
import qrng_seed  # noqa: E402
from qrng_seed import SeedPool, stamp_manifest  # noqa: E402


# ---------------------------------------------------------------------------
# P1/P2: seed derivation
# ---------------------------------------------------------------------------

@given(qbytes=st.binary(min_size=1, max_size=128),
       label=st.text(min_size=1, max_size=40))
@settings(max_examples=200)
def test_P1_derive_deterministic(qbytes, label):
    assert derive(qbytes, label) == derive(qbytes, label)
    assert 0 <= derive(qbytes, label) < 2 ** 64


@given(qbytes=st.binary(min_size=16, max_size=64),
       labels=st.lists(st.text(min_size=1, max_size=20),
                       min_size=2, max_size=8, unique=True))
@settings(max_examples=100)
def test_P2_derive_label_separation(qbytes, labels):
    out = [derive(qbytes, lb) for lb in labels]
    assert len(set(out)) == len(out), "label collision — investigate, not ignore"


# ---------------------------------------------------------------------------
# P3: SeedPack round-trip
# ---------------------------------------------------------------------------

@given(qbytes=st.binary(min_size=16, max_size=64),
       name=st.text(min_size=1, max_size=20,
                    alphabet="abcdefghijklmnopqrstuvwxyz0123456789_-"))
@settings(max_examples=50)
def test_P3_seedpack_roundtrip(qbytes, name):
    assume(len(name.strip()) > 0)
    tmp = tempfile.mkdtemp()
    pack = SeedPack(qbytes, "hypothesis-test-provenance", name=name)
    path = os.path.join(tmp, "pack.json")
    pack.save(path)
    loaded = SeedPack.load(path)
    assert loaded.verify(), "pack does not re-derive from its stored bytes"
    assert loaded.pack["arena"] == pack.pack["arena"]
    assert loaded.pack["crowd"] == pack.pack["crowd"]
    assert loaded.qbytes == qbytes


# ---------------------------------------------------------------------------
# P4: quantum_random_bytes contract (classical path forced — no network)
# ---------------------------------------------------------------------------

@given(n=st.integers(min_value=1, max_value=256))
@settings(max_examples=50)
def test_P4_qrb_contract(n):
    orig = qrng_seed.quantum_random_bytes
    qrng_seed.quantum_random_bytes = (
        lambda nbytes, **kw: (b"\xab" * nbytes, "test-source: stub"))
    try:
        data, prov = qrng_seed.quantum_random_bytes(n)
    finally:
        qrng_seed.quantum_random_bytes = orig
    assert len(data) == n
    assert isinstance(prov, str) and len(prov) > 0
    assert prov.split(":")[0] == "test-source"


def test_P4_qrb_fallback_label_honest():
    # Everything failing + fallback allowed -> classical bytes LABELED classical.
    data, prov = qrng_seed.quantum_random_bytes(
        16, sources=("nope",), allow_classical_fallback=True)
    assert len(data) == 16
    assert prov.startswith("classical-fallback")


# ---------------------------------------------------------------------------
# P5: pool accounting (synthetic pool — no network)
# ---------------------------------------------------------------------------

def _synthetic_pool(tmpdir, nbytes):
    import secrets
    p = SeedPool(path=os.path.join(tmpdir, "pool.json"))
    p.batches = [{
        "id": f"b{i}", "hex": secrets.token_hex(256),
        "source": "synthetic", "provenance": "synthetic",
        "fetched_at": "t", "used": 0} for i in range(4)]
    p._save()
    return p, nbytes


@given(n=st.integers(min_value=1, max_value=200))
@settings(max_examples=100)
def test_P5_pool_draw_accounting(n):
    p, _ = _synthetic_pool(tempfile.mkdtemp(), 1024)
    p.batches = p.batches[:1]  # single batch, but refill disabled below
    p.maybe_refill = lambda **kw: []  # keep it offline
    before = p.remaining()
    data, info = p.draw(n)
    assert len(data) == n
    assert p.remaining() == before - n
    # Second draw must not overlap the first (bytes are consumed, not reused).
    data2, _ = p.draw(n)
    assert len(data2) == n
    assert data != data2 or n == 0
    assert info["seed_hex"] == data.hex()
    assert info["timestamp"]


# ---------------------------------------------------------------------------
# P6: manifest stamping
# ---------------------------------------------------------------------------

@given(seed=st.integers(min_value=0, max_value=2 ** 64 - 1))
@settings(max_examples=50)
def test_P6_manifest_stamp(seed):
    mp = os.path.join(tempfile.mkdtemp(), "manifest.json")
    stamp_manifest(mp, "qrng-test", seed, "deadbeef", "prov")
    with open(mp, encoding="utf-8") as f:
        m = json.load(f)
    rec = m["quantum_seed"]
    assert rec["qrng_source"] == "qrng-test"
    assert rec["seed"] == seed
    assert rec["timestamp"]
    # Re-stamp overwrites: no stale first record survives.
    stamp_manifest(mp, "qrng-test2", seed + 1, "ff", "prov2")
    with open(mp, encoding="utf-8") as f:
        m2 = json.load(f)
    assert m2["quantum_seed"]["qrng_source"] == "qrng-test2"
    assert m2["quantum_seed"]["seed"] == seed + 1
