#!/usr/bin/env python3
"""
Kenney.nl CC0 Asset Puller for AshLane
Downloads CC0 game asset packs from Kenney.nl (60,000+ assets, all public domain).
No API key needed — resolves direct zip URLs from asset pages.

Usage:
  python3 kenney-puller.py --pack impact-sounds --out /tmp/kenney
  python3 kenney-puller.py --pack ui-pack --out /tmp/kenney
  python3 kenney-puller.py --list                    # show curated packs

All Kenney assets are CC0 — free for commercial use, no attribution required.
Source: https://kenney.nl/assets
"""
import argparse, os, re, sys, urllib.request, zipfile, json

# Curated packs relevant to AshLane (slug -> description)
PACKS = {
    # Audio
    "impact-sounds": "130 SFX: punches, footsteps, glass, metal, wood impacts",
    "interface-sounds": "103 UI SFX: clicks, confirms, errors, toggles",
    "rpg-audio": "BGM tracks + fantasy SFX",
    "music-jingles": "85 short music stingers (CC0)",
    "digital-audio": "Electronic/UI beeps and tones",
    # 3D models
    "city-kit-commercial": "Low-poly city buildings",
    "city-kit-suburban": "Suburban houses and props",
    "car-kit": "Low-poly vehicles",
    "character-kit": "Modular low-poly characters",
    "nature-kit": "Trees, rocks, plants",
    "street-kit": "Roads, sidewalks, street props",
    "urban-kit": "Urban buildings and details",
    # 2D / UI
    "ui-pack": "UI panels, buttons, windows",
    "ui-pack-rpg-expansion": "RPG-style UI elements",
    "game-icons": "700+ game icons",
    "game-icons-expansion": "More game icons",
    # Fonts
    "kenney-fonts": "CC0 pixel/display fonts",
}

def resolve_zip_url(slug):
    """Fetch the asset page and extract the direct zip download URL."""
    page_url = f"https://kenney.nl/assets/{slug}"
    req = urllib.request.Request(page_url, headers={"User-Agent": "Mozilla/5.0 (AshLane Asset Pipeline)"})
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            html = resp.read().decode("utf-8", errors="ignore")
    except Exception as e:
        print(f"  ERROR fetching page: {e}", file=sys.stderr)
        return None
    matches = re.findall(r'https://kenney\.nl/media/pages/assets/[^"]+\.zip', html)
    # Prefer the pack-specific zip (kenney_<slug>.zip)
    for m in matches:
        if slug.replace("-", "_") in m or slug in m:
            return m
    return matches[0] if matches else None

def download_pack(slug, out_dir):
    os.makedirs(out_dir, exist_ok=True)
    print(f"Resolving {slug}...")
    url = resolve_zip_url(slug)
    if not url:
        print(f"  FAILED: could not resolve zip URL for {slug}")
        return False
    print(f"  URL: {url[:80]}...")
    zip_path = os.path.join(out_dir, f"kenney_{slug}.zip")
    if os.path.exists(zip_path):
        print(f"  Already downloaded: {zip_path}")
    else:
        print(f"  Downloading...")
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (AshLane Asset Pipeline)"})
        try:
            with urllib.request.urlopen(req, timeout=120) as resp, open(zip_path, "wb") as f:
                total = int(resp.headers.get("Content-Length", 0))
                downloaded = 0
                while True:
                    chunk = resp.read(65536)
                    if not chunk:
                        break
                    f.write(chunk)
                    downloaded += len(chunk)
                    if total:
                        pct = downloaded * 100 // total
                        print(f"\r  {pct}% ({downloaded//1024//1024}MB/{total//1024//1024}MB)", end="", flush=True)
                print()
        except Exception as e:
            print(f"  ERROR downloading: {e}", file=sys.stderr)
            return False
    # List contents
    try:
        with zipfile.ZipFile(zip_path) as z:
            names = z.namelist()
            print(f"  OK: {len(names)} files in pack")
            # Extract to pack dir
            extract_dir = os.path.join(out_dir, slug)
            if not os.path.exists(extract_dir):
                z.extractall(extract_dir)
                print(f"  Extracted to {extract_dir}")
    except Exception as e:
        print(f"  ERROR reading zip: {e}", file=sys.stderr)
        return False
    return True

def main():
    p = argparse.ArgumentParser(description="Download CC0 asset packs from Kenney.nl")
    p.add_argument("--pack", help="Pack slug to download")
    p.add_argument("--all-audio", action="store_true", help="Download all audio packs")
    p.add_argument("--list", action="store_true", help="List curated packs")
    p.add_argument("--out", default="/tmp/kenney", help="Output directory")
    args = p.parse_args()

    if args.list:
        print("Curated Kenney packs for AshLane (all CC0):\n")
        for slug, desc in PACKS.items():
            print(f"  {slug:30s} {desc}")
        return

    packs = []
    if args.all_audio:
        packs = [s for s in PACKS if any(k in s for k in ("sounds", "audio", "jingles"))]
    elif args.pack:
        packs = [args.pack]
    else:
        p.print_help()
        return

    results = {}
    for slug in packs:
        ok = download_pack(slug, args.out)
        results[slug] = ok

    print(f"\nDone: {sum(results.values())}/{len(results)} packs downloaded")
    print("All Kenney assets are CC0 — commercial-safe, no attribution required.")

if __name__ == "__main__":
    main()
