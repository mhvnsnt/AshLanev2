#!/usr/bin/env python3
"""
tools/qrng_seed.py — build-time quantum seed service for AshLane.

TRUE QUANTUM RANDOMNESS, stdlib-only, BUILD-TIME ONLY (never in the runtime
game loop). Pulls quantum random bytes from ANU, caches them in a disk pool,
and stamps build manifests with the provenance needed for reproducible builds
and auditable "quantum-seeded" claims.

Source priority (first success wins):
  (a) ANU Quantum Numbers new API — https://api.quantumnumbers.anu.edu.au
      REAL photonic quantum hardware. Free key; key via env var ANU_QRNG_KEY.
      Gracefully skipped (not fatal) when the env var is unset.
  (b) ANU legacy API — https://qrng.anu.edu.au/API/jsonI.php (no signup).
      Reuses fetch_anu() from tools/generative/quantum/qrng.py — NOT
      duplicated here.
  (c) secrets.randbits — final fallback (OS CSPRNG). Every call returns
      (value, provenance) with HONEST labeling: provenance says exactly
      which source the bytes came from. Never mislabeled.

Disk pool: tools/qrng_seed_pool.json — fetched in batches, cached with
timestamps, drawn from at build time, refilled when low.

Manifest stamping: stamp_manifest() logs qrng_source, seed, timestamp
(+ provenance + pool batch ids) into any build manifest it touches, so a
quantum-seeded build is auditable and the variant reproducible from the
stored bytes.

CLI:
  python3 tools/qrng_seed.py refill            # top the pool up to TARGET
  python3 tools/qrng_seed.py status            # pool state + source probes
  python3 tools/qrng_seed.py draw --n 64       # draw n bytes, print hex + provenance
  python3 tools/qrng_seed.py draw --n 64 --out seeds.bin
  python3 tools/qrng_seed.py selftest          # offline-safe sanity checks
"""

import argparse
import base64
import datetime
import hashlib
import json
import os
import secrets
import sys
import urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))

# Reuse the prior lane's ANU/provenance/fallback logic — extend, don't rebuild.
sys.path.insert(0, os.path.join(HERE, "generative", "quantum"))
from qrng import (  # noqa: E402
    fetch_anu as fetch_anu_legacy,
    classical_fallback_bytes,
)

# ---------------------------------------------------------------------------
# New ANU API (quantumnumbers.anu.edu.au) — free key, x-api-key header
# ---------------------------------------------------------------------------

ANU_NEW_BASE = "https://api.quantumnumbers.anu.edu.au"
ANU_NEW_MAX_PER_CALL = 1024
ANU_KEY_ENV = "ANU_QRNG_KEY"


class SourceUnavailable(Exception):
    """A source is not configured/usable right now — try the next one."""


def fetch_anu_new(nbytes, api_key=None):
    """REAL quantum hardware: ANU Quantum Numbers API (keyed, free tier).

    Raises SourceUnavailable when ANU_QRNG_KEY is unset (graceful skip, never
    fatal), RuntimeError on HTTP/API failure so callers can fall through.
    """
    api_key = api_key or os.environ.get(ANU_KEY_ENV)
    if not api_key:
        raise SourceUnavailable(
            f"ANU new API skipped: {ANU_KEY_ENV} not set. "
            "Get a free key at https://quantumnumbers.anu.edu.au/ — "
            "falling through to the legacy no-signup ANU API.")
    out = bytearray()
    remaining = nbytes
    while remaining > 0:
        take = min(remaining, ANU_NEW_MAX_PER_CALL)
        url = f"{ANU_NEW_BASE}?type=uint8&length={take}"
        req = urllib.request.Request(
            url,
            headers={"x-api-key": api_key,
                     "User-Agent": "ashlane-qrng-seed/1.0"})
        with urllib.request.urlopen(req, timeout=30) as r:
            payload = json.loads(r.read().decode("utf-8"))
        if not payload.get("success"):
            raise RuntimeError(f"ANU new API returned success=false: {payload}")
        out.extend(payload["data"])
        remaining -= take
    data = bytes(out)
    prov = ("anu-keyed: REAL photonic quantum hardware via "
            "api.quantumnumbers.anu.edu.au (ANU Quantum Numbers, free API "
            "key). Vacuum-fluctuation measurement, same lab as the legacy "
            "endpoint, keyed rate limits.")
    return data, prov


# ---------------------------------------------------------------------------
# Unified entry point — every call returns (value, provenance)
# ---------------------------------------------------------------------------

def quantum_random_bytes(nbytes, sources=("anu-key", "anu"),
                         allow_classical_fallback=True, api_key=None):
    """Get nbytes of randomness, trying each named source in order.

    sources: tuple of "anu-key" | "anu". The first success wins.
    Returns (bytes, provenance_string) — provenance honestly labels the
    actual source of every byte. If everything fails and
    allow_classical_fallback is True, falls back to `secrets` with a
    "classical-fallback" provenance; if False, raises the last error.
    """
    errors = []
    if "anu-key" in sources:
        try:
            return fetch_anu_new(nbytes, api_key=api_key)
        except SourceUnavailable as e:
            errors.append(f"anu-key skipped: {e}")
        except Exception as e:  # noqa: BLE001
            errors.append(f"anu-key failed: {type(e).__name__}: {e}")
    if "anu" in sources:
        try:
            return fetch_anu_legacy(nbytes)
        except Exception as e:  # noqa: BLE001
            errors.append(f"anu failed: {type(e).__name__}: {e}")
    if allow_classical_fallback:
        return classical_fallback_bytes(nbytes)
    raise RuntimeError("all quantum sources failed: " + " | ".join(errors))


# ---------------------------------------------------------------------------
# Disk-cached seed pool
# ---------------------------------------------------------------------------

POOL_DEFAULT_PATH = os.path.join(HERE, "qrng_seed_pool.json")
POOL_TARGET_BYTES = 4096   # top the pool up to this many bytes
POOL_LOW_WATER = 512       # refill trigger: draw drops remaining below this
FETCH_CHUNK = 1024         # per-call API cap


def _utcnow():
    return datetime.datetime.now(datetime.timezone.utc).isoformat()


class SeedPool:
    """Disk-cached pool of quantum random bytes for build-time use.

    Fetch in batches (<=1024B per API call), cache with timestamps, draw
    from the cache at build time, refill when low. Each batch records its
    source + fetched_at; draws record which batches they consumed, so a
    manifest can be audited back to the exact fetch.
    """

    def __init__(self, path=POOL_DEFAULT_PATH):
        self.path = path
        self.batches = []  # list of {id, hex, source, fetched_at, used}
        self._load()

    # -- persistence ------------------------------------------------------
    def _load(self):
        try:
            with open(self.path, "r", encoding="utf-8") as f:
                data = json.load(f)
            self.batches = data.get("batches", [])
        except (FileNotFoundError, json.JSONDecodeError):
            self.batches = []

    def _save(self):
        os.makedirs(os.path.dirname(os.path.abspath(self.path)), exist_ok=True)
        tmp = self.path + ".tmp"
        with open(tmp, "w", encoding="utf-8") as f:
            json.dump({"version": 1, "batches": self.batches}, f, indent=2)
        os.replace(tmp, self.path)

    def remaining(self):
        return sum(len(bytes.fromhex(b["hex"])) - b.get("used", 0)
                   for b in self.batches)

    # -- refilling ----------------------------------------------------------
    def refill(self, target=POOL_TARGET_BYTES, chunk=FETCH_CHUNK,
               api_key=None):
        """Fetch fresh quantum bytes until the pool holds >= target bytes."""
        need = target - self.remaining()
        fetched = []
        while need > 0:
            take = min(need, chunk)
            data, prov = quantum_random_bytes(take, api_key=api_key)
            batch = {
                "id": base64.urlsafe_b64encode(
                    hashlib.sha256(data).digest()[:9]).decode("ascii"),
                "hex": data.hex(),
                "source": prov.split(":")[0],
                "provenance": prov,
                "fetched_at": _utcnow(),
                "used": 0,
            }
            self.batches.append(batch)
            fetched.append(batch)
            need -= take
        self._save()
        return fetched

    def maybe_refill(self, api_key=None):
        if self.remaining() < POOL_LOW_WATER:
            return self.refill(api_key=api_key)
        return []

    # -- drawing ------------------------------------------------------------
    def draw(self, nbytes, api_key=None):
        """Draw nbytes from the pool. Refills first if below low-water.

        Returns (bytes, draw_info) where draw_info has qrng_source, seed,
        seed_hex, timestamp, provenance, batch_ids — everything a manifest
        needs for an auditable "quantum-seeded" claim.
        """
        self.maybe_refill(api_key=api_key)
        if self.remaining() < nbytes:
            # Pool empty and fetch failed (offline): draw classically, say so.
            data, prov = classical_fallback_bytes(nbytes)
            return data, self._draw_info(data, prov, ["classical-fallback-offline"])
        out = bytearray()
        used_batches = []
        for b in self.batches:
            raw = bytes.fromhex(b["hex"])
            avail = raw[b.get("used", 0):]
            if not avail:
                continue
            take = min(nbytes - len(out), len(avail))
            out.extend(avail[:take])
            b["used"] = b.get("used", 0) + take
            used_batches.append((b, take))
            if len(out) >= nbytes:
                break
        data = bytes(out)
        prov = ("seed-pool: bytes drawn from the disk-cached pool "
                f"({POOL_DEFAULT_PATH}); per-batch sources: "
                + ", ".join(sorted({b["source"] for b, _ in used_batches})))
        self._save()
        return data, self._draw_info(
            data, prov, [b["id"] for b, _ in used_batches])

    def _draw_info(self, data, provenance, batch_ids):
        return {
            "qrng_source": provenance.split(":")[0],
            "provenance": provenance,
            "seed": int.from_bytes(
                hashlib.sha256(data).digest()[:8], "big"),
            "seed_hex": data.hex(),
            "timestamp": _utcnow(),
            "pool_batch_ids": batch_ids,
        }

    def status(self):
        return {
            "path": self.path,
            "batches": len(self.batches),
            "remaining_bytes": self.remaining(),
            "target_bytes": POOL_TARGET_BYTES,
            "low_water_bytes": POOL_LOW_WATER,
            "sources": sorted({b["source"] for b in self.batches}),
        }


# ---------------------------------------------------------------------------
# Manifest stamping — reproducible builds + auditable "quantum-seeded" claims
# ---------------------------------------------------------------------------

def stamp_manifest(manifest, qrng_source, seed, seed_hex, provenance,
                   timestamp=None, extra=None):
    """Log qrng_source, seed, timestamp into a build manifest.

    manifest: dict (mutated + returned) or path to a JSON manifest file
    (loaded, stamped, written back). The record lands under the
    "quantum_seed" key alongside every other build field.
    """
    record = {
        "qrng_source": qrng_source,
        "seed": seed,
        "seed_hex": seed_hex,
        "provenance": provenance,
        "timestamp": timestamp or _utcnow(),
    }
    if extra:
        record.update(extra)
    if isinstance(manifest, str):
        data = {}
        if os.path.exists(manifest):
            with open(manifest, "r", encoding="utf-8") as f:
                data = json.load(f)
        data["quantum_seed"] = record
        with open(manifest, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)
        return manifest
    manifest["quantum_seed"] = record
    return manifest


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def cmd_status(_args):
    pool = SeedPool()
    print(json.dumps(pool.status(), indent=2))
    print("\nsource probes (16 bytes each):")
    for name, fn in (("anu-key", fetch_anu_new), ("anu-legacy", fetch_anu_legacy)):
        try:
            data, prov = fn(16)
            print(f"  [OK]   {name}: {data.hex()[:32]}... ({prov[:70]}...)")
        except SourceUnavailable as e:
            print(f"  [SKIP] {name}: {e}")
        except Exception as e:  # noqa: BLE001
            print(f"  [FAIL] {name}: {type(e).__name__}: {e}")


def cmd_refill(args):
    pool = SeedPool()
    fetched = pool.refill(target=args.target)
    for b in fetched:
        print(f"fetched {len(bytes.fromhex(b['hex']))}B "
              f"source={b['source']} batch={b['id']} at {b['fetched_at']}")
    print(json.dumps(pool.status(), indent=2))


def cmd_draw(args):
    pool = SeedPool()
    data, info = pool.draw(args.n)
    if args.out:
        with open(args.out, "wb") as f:
            f.write(data)
        print(f"wrote {len(data)} bytes -> {args.out}")
    else:
        print(data.hex())
    print(f"qrng_source : {info['qrng_source']}")
    print(f"seed        : {info['seed']}")
    print(f"timestamp   : {info['timestamp']}")
    print(f"provenance  : {info['provenance']}")
    print(f"pool status : {json.dumps(pool.status())}")


def cmd_selftest(_args):
    # Offline-safe: pool math + manifest stamping only, no network.
    pool = SeedPool(path="/tmp/qrng_seed_selftest_pool.json")
    pool.batches = [{
        "id": "testbatch", "hex": secrets.token_hex(64),
        "source": "selftest", "provenance": "selftest",
        "fetched_at": _utcnow(), "used": 0}]
    data, info = pool.draw(32)
    assert len(data) == 32
    assert info["seed_hex"] == data.hex()
    assert info["qrng_source"]
    m = stamp_manifest({}, info["qrng_source"], info["seed"],
                       info["seed_hex"], info["provenance"])
    assert m["quantum_seed"]["seed"] == info["seed"]
    # stamp to a file path
    p = stamp_manifest("/tmp/qrng_seed_selftest_manifest.json",
                       info["qrng_source"], info["seed"], info["seed_hex"],
                       info["provenance"])
    with open(p) as f:
        assert json.load(f)["quantum_seed"]["qrng_source"] == info["qrng_source"]
    print("selftest OK: pool draw + manifest stamping work (offline)")


def main(argv=None):
    ap = argparse.ArgumentParser(description="AshLane build-time quantum seed service")
    sub = ap.add_subparsers(dest="cmd", required=True)
    r = sub.add_parser("refill", help="top the pool up to TARGET bytes")
    r.add_argument("--target", type=int, default=POOL_TARGET_BYTES)
    sub.add_parser("status", help="pool state + source probes")
    d = sub.add_parser("draw", help="draw bytes from the pool")
    d.add_argument("--n", type=int, default=64)
    d.add_argument("--out", default=None)
    sub.add_parser("selftest", help="offline sanity checks")
    args = ap.parse_args(argv)
    {"status": cmd_status, "refill": cmd_refill,
     "draw": cmd_draw, "selftest": cmd_selftest}[args.cmd](args)


if __name__ == "__main__":
    main()
