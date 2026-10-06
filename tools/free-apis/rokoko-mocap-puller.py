#!/usr/bin/env python3
"""
rokoko-mocap-puller.py — Free Rokoko mocap packs for AshLane.

Source: archive.org item "rokoko-free-mocap-archive" (Rokoko's free sample
packs, mirrored). Rokoko's own site states these free mocap assets may be
used "in any animation, VFX, game, 3D art etc project you want, from passion
project to commercial use":
  https://www.rokoko.com/resources/rokoko-mocap-13-free-fight-animations

Specs: FBX, Mixamo skeleton, 30 FPS — drops straight into AshLane's
retargeting pipeline (see src/game3d/universal-retarget.ts).

Packs of interest for a street brawler:
  FIGHT-MOTIONS-MOCAP.zip      13 fight animations
  MARTIAL-ARTS-MOCAP.zip        6 martial arts (kata, Muay Thai, sword)
  MotionLibrary_EricJacobus.zip stunt performer library
  MotionLibrary_Weapons.zip     weapon motions
  SUPERHEROES-IN-MOTION-MOCAP.zip
  EVERYDAY-IDLES-MOCAP.zip      idles
  DANCE-MOTIONS-MOCAP.zip
  SPORTS-MOTIONS-MOCAP.zip
  SHOTS-FIRED-MOCAP.zip

Usage:
    python3 rokoko-mocap-puller.py --list
    python3 rokoko-mocap-puller.py --pack MARTIAL-ARTS-MOCAP.zip --out ./mocap
    python3 rokoko-mocap-puller.py --combat --out ./mocap   # fight + martial arts
"""

import argparse
import json
import os
import sys
import urllib.request
import zipfile

ITEM = "rokoko-free-mocap-archive"
BASE = f"https://archive.org/download/{ITEM}"
META_URL = f"https://archive.org/metadata/{ITEM}"

COMBAT_PACKS = ["FIGHT-MOTIONS-MOCAP.zip", "MARTIAL-ARTS-MOCAP.zip"]


def fetch_packs():
    with urllib.request.urlopen(META_URL, timeout=60) as r:
        meta = json.load(r)
    packs = []
    for f in meta.get("files", []):
        name = f.get("name", "")
        if name.endswith(".zip") and "MOCAP" in name.upper():
            packs.append((name, f.get("size")))
    return packs


def download(url, dest):
    os.makedirs(os.path.dirname(dest) or ".", exist_ok=True)
    print(f"  downloading {url} ...")
    # Prefer curl: archive.org download nodes intermittently 500; curl's
    # retry + resume handles it far better than urllib.
    import shutil
    import subprocess
    if shutil.which("curl"):
        r = subprocess.run(
            ["curl", "-sSL", "--retry", "4", "--retry-delay", "3",
             "--max-time", "600", "-o", dest, url],
            capture_output=True, text=True,
        )
        if r.returncode == 0 and os.path.getsize(dest) > 1024:
            # Reject HTML error pages masquerading as zips.
            with open(dest, "rb") as f:
                if f.read(4) != b"<htm":
                    return dest
            print("  got an error page, retrying via urllib ...")
    urllib.request.urlretrieve(url, dest)
    return dest


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--list", action="store_true")
    ap.add_argument("--pack", help="pack filename, e.g. MARTIAL-ARTS-MOCAP.zip")
    ap.add_argument("--combat", action="store_true", help="fight + martial arts packs")
    ap.add_argument("--out", default="./rokoko-mocap")
    args = ap.parse_args()

    packs = fetch_packs()
    names = [p[0] for p in packs]

    if args.list:
        for name, size in packs:
            mb = f"{int(size) / 1048576:.1f}MB" if size else "?"
            print(f"  {name}  ({mb})")
        return

    wanted = []
    if args.combat:
        wanted = [n for n in COMBAT_PACKS if n in names]
    elif args.pack:
        if args.pack not in names:
            print(f"unknown pack: {args.pack}", file=sys.stderr)
            print("available:", ", ".join(names), file=sys.stderr)
            sys.exit(1)
        wanted = [args.pack]
    else:
        ap.print_help()
        sys.exit(1)

    os.makedirs(args.out, exist_ok=True)
    for pack in wanted:
        dest = os.path.join(args.out, pack)
        if not os.path.exists(dest):
            download(f"{BASE}/{pack}", dest)
        else:
            print(f"  already have {pack}")
        with zipfile.ZipFile(dest) as z:
            fbxs = [n for n in z.namelist() if n.lower().endswith(".fbx") and "__MACOSX" not in n]
            print(f"  {pack}: {len(fbxs)} FBX clips")
            for n in fbxs[:12]:
                print(f"    - {os.path.basename(n)}")
            if len(fbxs) > 12:
                print(f"    ... and {len(fbxs) - 12} more")


if __name__ == "__main__":
    main()
