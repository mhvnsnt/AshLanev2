#!/usr/bin/env python3
"""
AshLane SFX Downloader — pulls free/CC0 sound effects via the Openverse API.
Openverse indexes Freesound and serves direct MP3 preview URLs with no auth.

Usage:
    python3 sfx-downloader.py --query "body punch" --out ./sfx --limit 5
    python3 sfx-downloader.py --pack combat  # downloads a curated combat SFX pack

License filter: defaults to CC0 only (commercial-safe). Use --license to change.
"""
import argparse
import json
import os
import sys
import urllib.request
import urllib.parse

API_BASE = "https://api.openverse.org/v1/audio/"

# Curated SFX packs for AshLane — all searched with CC0 filter
SFX_PACKS = {
    "combat": [
        "body punch", "punch impact", "kick impact", "body fall",
        "bone crack", "whoosh", "crowd cheer", "crowd boo",
    ],
    "urban": [
        "city ambience night", "traffic", "siren distant", "rain city",
        "subway", "car horn", "footsteps concrete", "door slam",
    ],
    "ui": [
        "menu click", "menu select", "countdown beep", "victory fanfare",
        "defeat sound", "button press",
    ],
    "weapons": [
        "baseball bat swing", "bat hit", "glass break", "metal clang",
        "chain rattle", "table break",
    ],
}


def search_sfx(query, limit=5, license_type="cc0"):
    """Search Openverse for audio, return list of (title, url, license)."""
    params = urllib.parse.urlencode({
        "q": query,
        "page_size": limit,
        "license": license_type,
        "fields": "id,title,url,license",
    })
    req = urllib.request.Request(
        f"{API_BASE}?{params}",
        headers={"User-Agent": "AshLane-SFX-Downloader/1.0"},
    )
    with urllib.request.urlopen(req, timeout=20) as resp:
        data = json.loads(resp.read())
    results = []
    for r in data.get("results", []):
        if r.get("url"):
            results.append({
                "title": r.get("title", "untitled"),
                "url": r["url"],
                "license": r.get("license", "unknown"),
            })
    return results


def download_sfx(url, out_path):
    """Download an SFX file."""
    req = urllib.request.Request(
        url, headers={"User-Agent": "AshLane-SFX-Downloader/1.0"}
    )
    with urllib.request.urlopen(req, timeout=30) as resp, open(out_path, "wb") as f:
        f.write(resp.read())
    return out_path


def safe_filename(title):
    """Make a safe filename from a title."""
    safe = "".join(c if c.isalnum() or c in " -_" else "_" for c in title)
    return safe.strip().replace(" ", "_")[:60]


def main():
    parser = argparse.ArgumentParser(description="Download free SFX for AshLane")
    parser.add_argument("--query", help="Search query")
    parser.add_argument("--pack", choices=SFX_PACKS.keys(), help="Download a curated pack")
    parser.add_argument("--out", default="./sfx", help="Output directory")
    parser.add_argument("--limit", type=int, default=3, help="Results per query")
    parser.add_argument("--license", default="cc0", help="License filter (cc0, by, etc.)")
    args = parser.parse_args()

    os.makedirs(args.out, exist_ok=True)
    queries = SFX_PACKS[args.pack] if args.pack else [args.query]
    if not queries or not queries[0]:
        print("Provide --query or --pack", file=sys.stderr)
        sys.exit(1)

    manifest = []
    for q in queries:
        print(f"Searching: {q}")
        try:
            results = search_sfx(q, limit=args.limit, license_type=args.license)
        except Exception as e:
            print(f"  ERROR: {e}")
            continue
        for r in results:
            fname = f"{safe_filename(r['title'])}.mp3"
            out_path = os.path.join(args.out, fname)
            # Skip if already downloaded
            if os.path.exists(out_path):
                print(f"  SKIP (exists): {fname}")
                continue
            try:
                download_sfx(r["url"], out_path)
                size = os.path.getsize(out_path)
                print(f"  OK: {fname} ({size} bytes, {r['license']})")
                manifest.append({
                    "file": fname, "title": r["title"],
                    "license": r["license"], "query": q,
                })
            except Exception as e:
                print(f"  FAIL: {fname}: {e}")

    manifest_path = os.path.join(args.out, "manifest.json")
    with open(manifest_path, "w") as f:
        json.dump(manifest, f, indent=2)
    print(f"\nDone. Manifest: {manifest_path}")


if __name__ == "__main__":
    main()
