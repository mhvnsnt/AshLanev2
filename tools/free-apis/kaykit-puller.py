#!/usr/bin/env python3
"""
KayKit CC0 3D Asset Puller for AshLane
Downloads CC0 low-poly 3D packs from KayKit's GitHub (stylized, game-ready).
No API key needed — uses GitHub codeload.

Usage:
  python3 kaykit-puller.py --pack KayKit-City-Builder-Bits-1.0 --out /tmp/kaykit
  python3 kaykit-puller.py --list

All KayKit assets are CC0 — free for commercial use, no attribution required.
Source: https://github.com/KayKit-Game-Assets | https://kaykit.com
"""
import argparse, os, sys, urllib.request, zipfile

ORG = "KayKit-Game-Assets"

# Curated packs relevant to AshLane's urban brawler theme
PACKS = {
    "KayKit-City-Builder-Bits-1.0": "City buildings, roads, urban props",
    "KayKit-Character-Pack-Adventures-1.0": "Stylized characters (crowd NPCs)",
    "KayKit-Character-Pack-Skeletons-1.0": "Skeleton characters",
    "KayKit-Dungeon-Remastered-1.0": "Dungeon tiles and props (underground)",
    "KayKit-Furniture-Bits-1.0": "Furniture (interiors)",
    "KayKit-Halloween-Bits-1.0": "Spooky props and decorations",
    "KayKit-Medieval-Hexagon-Pack-1.0": "Hexagon tiles (not urban, skip unless needed)",
    "KayKit-Prototype-Bits-1.0": "Greybox prototyping pieces",
    "KayKit-Restaurant-Bits-1.0": "Restaurant interior (club/bar interiors)",
    "KayKit-Space-Base-Bits-1.0": "Sci-fi pieces (not urban, skip unless needed)",
}

def download_pack(repo, out_dir):
    os.makedirs(out_dir, exist_ok=True)
    url = f"https://codeload.github.com/{ORG}/{repo}/zip/refs/heads/main"
    zip_path = os.path.join(out_dir, f"{repo}.zip")
    if os.path.exists(zip_path):
        print(f"  Already downloaded: {repo}")
    else:
        print(f"  Downloading {repo}...")
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (AshLane Asset Pipeline)"})
        try:
            with urllib.request.urlopen(req, timeout=180) as resp, open(zip_path, "wb") as f:
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
            print(f"  ERROR: {e}", file=sys.stderr)
            return False
    try:
        with zipfile.ZipFile(zip_path) as z:
            names = z.namelist()
            glbs = [n for n in names if n.endswith((".glb", ".gltf"))]
            print(f"  OK: {len(names)} files, {len(glbs)} GLB/glTF models")
            extract_dir = os.path.join(out_dir, repo)
            if not os.path.exists(extract_dir):
                z.extractall(extract_dir)
                print(f"  Extracted to {extract_dir}")
    except Exception as e:
        print(f"  ERROR reading zip: {e}", file=sys.stderr)
        return False
    return True

def main():
    p = argparse.ArgumentParser(description="Download CC0 3D packs from KayKit GitHub")
    p.add_argument("--pack", help="Repo name to download")
    p.add_argument("--all-urban", action="store_true",
                   help="Download all urban-relevant packs (city, characters, dungeon, furniture, restaurant)")
    p.add_argument("--list", action="store_true", help="List curated packs")
    p.add_argument("--out", default="/tmp/kaykit", help="Output directory")
    args = p.parse_args()

    if args.list:
        print("Curated KayKit packs for AshLane (all CC0):\n")
        for repo, desc in PACKS.items():
            print(f"  {repo:45s} {desc}")
        return

    urban = ["KayKit-City-Builder-Bits-1.0", "KayKit-Character-Pack-Adventures-1.0",
             "KayKit-Dungeon-Remastered-1.0", "KayKit-Furniture-Bits-1.0",
             "KayKit-Restaurant-Bits-1.0", "KayKit-Prototype-Bits-1.0"]
    if args.all_urban:
        packs = urban
    elif args.pack:
        packs = [args.pack]
    else:
        p.print_help()
        return

    ok = sum(download_pack(r, args.out) for r in packs)
    print(f"\nDone: {ok}/{len(packs)} packs downloaded")
    print("All KayKit assets are CC0 — commercial-safe, no attribution required.")

if __name__ == "__main__":
    main()
