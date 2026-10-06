#!/usr/bin/env python3
"""
CC0/CC-BY Music Puller for AshLane
Downloads commercial-safe background music from multiple sources.

Sources:
  - Incompetech (Kevin MacLeod): CC-BY 4.0 — huge catalog, direct MP3 download.
    Attribution required: credit "Kevin MacLeod (incompetech.com)" in game credits.
  - Kenney Music Jingles: CC0 — 85 short stingers, via kenney-puller.py.
  - Tallbeard Music Loops: CC0 — 200+ game music loops.
    https://tallbeardstudios.github.io/AbstractionMusic/

Usage:
  python3 music-puller.py --incompetech Hitman --out /tmp/music
  python3 music-puller.py --pack combat --out /tmp/music

Incompetech tracks are CC-BY — attribution required but commercial use is free.
"""
import argparse, os, sys, urllib.request, urllib.parse

INCOMPETECH_BASE = "https://incompetech.com/music/royalty-free/mp3-royaltyfree"

# Curated Incompetech tracks for AshLane's dark urban brawler vibe
# (Kevin MacLeod, CC-BY 4.0 — credit required)
PACKS = {
    "combat": [
        "Hitman",           # intense action
        "Five Armies",      # epic battle
        "Volatile Reaction",# aggressive electronic
        "Crypto",           # dark electronic
        "Killers",          # heavy action
    ],
    "urban": [
        "Acid Jazz",        # street vibe
        "Funky Chunk",      # funky street
        "Hip Hop Christmas",# hip-hop beat (seasonal alt available)
        "Night of Chaos",   # dark urban
    ],
    "menu": [
        "Cipher",           # mysterious electronic (fits Cipher character!)
        "Deep Haze",        # atmospheric
        "Ossuary 6 - Air",  # dark ambient
    ],
    "tense": [
        "Oppressive Gloom", # dark tension
        "Industrial Cinematic", # industrial dark
        "Nightmare Machine",# horror tension
    ],
}

ATTRIBUTION = "Music: Kevin MacLeod (incompetech.com) — Licensed under CC-BY 4.0"

def download_track(name, out_dir):
    os.makedirs(out_dir, exist_ok=True)
    safe = urllib.parse.quote(name)
    url = f"{INCOMPETECH_BASE}/{safe}.mp3"
    out_path = os.path.join(out_dir, f"incompetech_{name.replace(' ', '_')}.mp3")
    if os.path.exists(out_path) and os.path.getsize(out_path) > 100000:
        print(f"  Already have: {name}")
        return True
    print(f"  Downloading: {name}...")
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (AshLane Asset Pipeline)"})
    try:
        with urllib.request.urlopen(req, timeout=60) as resp, open(out_path, "wb") as f:
            while True:
                chunk = resp.read(65536)
                if not chunk:
                    break
                f.write(chunk)
        size_mb = os.path.getsize(out_path) / 1024 / 1024
        print(f"  OK: {size_mb:.1f}MB")
        return True
    except Exception as e:
        print(f"  ERROR: {e}", file=sys.stderr)
        if os.path.exists(out_path):
            os.remove(out_path)
        return False

def main():
    p = argparse.ArgumentParser(description="Download CC-BY music from Incompetech")
    p.add_argument("--incompetech", help="Single track name to download")
    p.add_argument("--pack", choices=list(PACKS.keys()), help="Download a curated pack")
    p.add_argument("--all", action="store_true", help="Download all packs")
    p.add_argument("--list", action="store_true", help="List packs and tracks")
    p.add_argument("--out", default="/tmp/music", help="Output directory")
    args = p.parse_args()

    if args.list:
        for pack, tracks in PACKS.items():
            print(f"\n{pack}:")
            for t in tracks:
                print(f"  - {t}")
        print(f"\n{ATTRIBUTION}")
        return

    tracks = []
    if args.incompetech:
        tracks = [args.incompetech]
    elif args.pack:
        tracks = PACKS[args.pack]
    elif args.all:
        tracks = [t for pack in PACKS.values() for t in pack]
    else:
        p.print_help()
        return

    ok = sum(download_track(t, args.out) for t in tracks)
    print(f"\nDone: {ok}/{len(tracks)} tracks downloaded")
    print(f"\nLICENSE: {ATTRIBUTION}")
    print("Add this credit to the game's credits screen.")

if __name__ == "__main__":
    main()
