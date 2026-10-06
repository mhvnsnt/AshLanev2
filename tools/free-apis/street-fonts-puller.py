#!/usr/bin/env python3
"""
Street-Style OFL Font Puller for AshLane
Downloads open-licensed display fonts from Google Fonts for UI, character cards,
graffiti tags, and HUD text.

All fonts below are from Google Fonts and carry the SIL Open Font License (OFL)
or Apache 2.0 — free for commercial use, embedding, and redistribution.
(Verify per-font at https://fonts.google.com/specimen/<Name>)

Uses the public Google Fonts CSS API (no key needed) to resolve the actual
font file URLs, then downloads them.

Usage:
  python3 street-fonts-puller.py --out ./fonts
  python3 street-fonts-puller.py --font Bangers --out ./fonts
  python3 street-fonts-puller.py --list
"""
import argparse, os, re, sys, urllib.request, urllib.parse

FONTS = {
    # Street / graffiti / display — core AshLane vibe
    "Rock Salt": "handwritten graffiti marker, great for tags",
    "Permanent Marker": "bold marker strokes, UI accents",
    "Rubik Spray Paint": "drippy spray-paint display, graffiti headers",
    "Bangers": "comic-punch display, KO/impact text",
    "Bungee Shade": "layered urban display, menu headers",
    "Rye": "western wanted-poster, bounty/faction boards",
    # Heavy / condensed — HUD, nameplates, damage numbers
    "Anton": "condensed heavy sans, nameplates",
    "Black Ops One": "stencil military, faction stencil text",
    "Archivo Black": "heavy grotesque, HUD headlines",
    "Bebas Neue": "tall condensed, stats and timers",
    "Russo One": "techno display, cyber areas",
    # Body / readable — menus, dialogue, credits
    "Inter": "clean UI body text",
    "JetBrains Mono": "mono for debug/cyber terminals",
}

UA = {"User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36"}

def resolve_font_url(name):
    """Resolve the latin font file URL via the Google Fonts CSS API."""
    q = urllib.parse.quote(name)
    css_url = f"https://fonts.googleapis.com/css2?family={q}&display=swap"
    req = urllib.request.Request(css_url, headers=UA)
    with urllib.request.urlopen(req, timeout=30) as r:
        css = r.read().decode("utf-8", "replace")
    # Prefer the latin subset block (last /* latin */ comment before its src)
    blocks = re.findall(r"/\*\s*latin\s*\*/\s*.*?src:\s*url\((https://[^)]+)\)", css, re.S)
    urls = blocks or re.findall(r"url\((https://[^)]+)\)", css)
    return urls[0] if urls else None

def download_font(name, outdir):
    dest_dir = os.path.join(outdir, name.replace(" ", "-"))
    os.makedirs(dest_dir, exist_ok=True)
    try:
        url = resolve_font_url(name)
        if not url:
            print(f"  FAIL {name}: no URL resolved", file=sys.stderr)
            return False
        ext = ".ttf" if ".ttf" in url else ".woff2"
        target = os.path.join(dest_dir, name.replace(" ", "") + "-Regular" + ext)
        if not os.path.exists(target):
            req = urllib.request.Request(url, headers=UA)
            with urllib.request.urlopen(req, timeout=60) as r, open(target, "wb") as f:
                f.write(r.read())
        print(f"  OK {name} -> {os.path.basename(target)}")
        return True
    except Exception as e:
        print(f"  FAIL {name}: {e}", file=sys.stderr)
        return False

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", default="./fonts")
    ap.add_argument("--font", help="download a single font by name")
    ap.add_argument("--list", action="store_true", help="list curated fonts")
    a = ap.parse_args()

    if a.list:
        for name, desc in FONTS.items():
            print(f"{name:<20} {desc}")
        return

    names = [a.font] if a.font else list(FONTS.keys())
    ok = sum(download_font(n, a.out) for n in names)
    print(f"\nDone: {ok}/{len(names)} fonts -> {a.out}")
    print("LICENSE: all from Google Fonts, SIL OFL / Apache 2.0 — commercial-safe.")

if __name__ == "__main__":
    main()
