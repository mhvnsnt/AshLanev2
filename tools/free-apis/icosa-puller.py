#!/usr/bin/env python3
"""
AshLane 3D Model Puller — searches Icosa Gallery (open-source Google Poly
successor) for CC-licensed glTF models and downloads them.

API: https://api.icosa.gallery/v1/assets (no auth needed for search)
License: models are CC-licensed (check per-asset; filter for CC0/CC-BY)

Usage:
    python3 icosa-puller.py --query "dumpster" --out ./models --limit 5
    python3 icosa-puller.py --query "streetlight" --license CC0 --limit 3
"""
import argparse
import json
import os
import sys
import urllib.request
import urllib.parse
import zipfile
import tempfile

API_BASE = "https://api.icosa.gallery/v1"


def search_assets(query, limit=10):
    """Search Icosa Gallery for assets."""
    params = urllib.parse.urlencode({"q": query, "limit": limit})
    req = urllib.request.Request(
        f"{API_BASE}/assets?{params}",
        headers={"User-Agent": "AshLane-Model-Puller/1.0"},
    )
    with urllib.request.urlopen(req, timeout=20) as resp:
        data = json.loads(resp.read())
    return data.get("assets", [])


def get_asset_detail(asset_name):
    """Get full asset details including download URLs."""
    req = urllib.request.Request(
        f"{API_BASE}/{asset_name}",
        headers={"User-Agent": "AshLane-Model-Puller/1.0"},
    )
    with urllib.request.urlopen(req, timeout=20) as resp:
        return json.loads(resp.read())


def download_asset(asset, out_dir):
    """Download the glTF format of an asset via its zip archive."""
    name = asset.get("name", "")
    display = asset.get("displayName", name.split("/")[-1])

    # Find the preferred GLTF2 format (or any GLTF2)
    formats = asset.get("formats", [])
    gltf_format = None
    for f in formats:
        if f.get("formatType", "") == "GLTF2" and f.get("isPreferredForDownload"):
            gltf_format = f
            break
    if not gltf_format:
        for f in formats:
            if f.get("formatType", "") == "GLTF2":
                gltf_format = f
                break
    if not gltf_format:
        print(f"  SKIP (no GLTF2): {display}")
        return None

    zip_url = gltf_format.get("zip_archive_url", "")
    if not zip_url:
        print(f"  SKIP (no zip URL): {display}")
        return None

    safe = "".join(c if c.isalnum() or c in "-_" else "_" for c in display)[:50]
    asset_dir = os.path.join(out_dir, safe)
    os.makedirs(asset_dir, exist_ok=True)

    # Download and extract zip
    with tempfile.NamedTemporaryFile(suffix=".zip", delete=False) as tmp:
        tmp_path = tmp.name
    try:
        req = urllib.request.Request(zip_url, headers={"User-Agent": "AshLane-Model-Puller/1.0"})
        with urllib.request.urlopen(req, timeout=120) as resp, open(tmp_path, "wb") as f:
            f.write(resp.read())
        with zipfile.ZipFile(tmp_path, "r") as z:
            z.extractall(asset_dir)
        size = sum(
            os.path.getsize(os.path.join(dp, f))
            for dp, _, fns in os.walk(asset_dir) for f in fns
        )
        print(f"  OK: {safe}/ ({size} bytes)")
        return asset_dir
    except Exception as e:
        print(f"  FAIL: {display}: {e}")
        return None
    finally:
        if os.path.exists(tmp_path):
            os.unlink(tmp_path)


def main():
    parser = argparse.ArgumentParser(description="Pull CC 3D models from Icosa Gallery")
    parser.add_argument("--query", required=True, help="Search query")
    parser.add_argument("--out", default="./models", help="Output directory")
    parser.add_argument("--limit", type=int, default=5, help="Max results")
    args = parser.parse_args()

    os.makedirs(args.out, exist_ok=True)
    print(f"Searching Icosa Gallery: {args.query}")

    try:
        assets = search_assets(args.query, limit=args.limit)
    except Exception as e:
        print(f"Search failed: {e}", file=sys.stderr)
        sys.exit(1)

    print(f"Found {len(assets)} assets")
    for a in assets:
        display = a.get("displayName", a.get("name", "unknown"))
        license = a.get("license", "unknown")
        print(f"Downloading: {display} (license: {license})")
        try:
            download_asset(a, args.out)
        except Exception as e:
            print(f"  FAIL: {e}")


if __name__ == "__main__":
    main()
