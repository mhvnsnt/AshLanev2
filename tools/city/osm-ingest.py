#!/usr/bin/env python3
"""
AshLane OSM street ingestion — real-city street/map data as a basis for districts.

Queries the Overpass API for road networks in a bounding box, then emits a
street-graph JSON that worldgen-streets can consume (nodes + ways with
highway classification -> street width).

Usage:
    python3 osm-ingest.py --bbox "40.70,-74.02,40.73,-73.98" --out williamsburg.json
    python3 osm-ingest.py --preset nashville-broadway --out broadway.json

Presets combine useful characteristics from different real cities:
  - nashville-broadway : honky-tonk strip grid (Marquee Mile basis)
  - chicago-loop      : rigid grid, alleys (Projects basis)
  - new-orleans-fq    : organic French Quarter blocks (Neon District basis)

License: see docs/OSM_ATTRIBUTION.md. OSM data is ODbL 1.0 — in-game use
requires "© OpenStreetMap contributors" attribution. The emitted street
graph is a Produced Work; attribution is included in the JSON header.
"""

import argparse
import json
import math
import sys
import urllib.request
import urllib.parse

OVERPASS = "https://overpass-api.de/api/interpreter"

PRESETS = {
    "nashville-broadway": (36.1580, -86.7820, 36.1680, -86.7680),
    "chicago-loop": (41.8750, -87.6350, 41.8880, -87.6200),
    "new-orleans-fq": (29.9500, -90.0700, 29.9620, -90.0550),
}

# highway tag -> AshLane street width in meters
WIDTHS = {
    "motorway": 16, "trunk": 14, "primary": 12, "secondary": 10,
    "tertiary": 8, "residential": 7, "service": 5, "unclassified": 6,
    "pedestrian": 4, "footway": 3, "alley": 4, "living_street": 6,
}


def fetch(bbox):
    s, w, n, e = bbox
    q = f"""
    [out:json][timeout:60];
    (
      way["highway"~"^(motorway|trunk|primary|secondary|tertiary|residential|service|unclassified|pedestrian|footway|living_street)$"]({s},{w},{n},{e});
    );
    out body;
    >;
    out skel qt;
    """
    data = urllib.parse.urlencode({"data": q}).encode()
    req = urllib.request.Request(OVERPASS, data=data, method="POST",
                                 headers={"User-Agent": "AshLane-city-ingest/1.0"})
    with urllib.request.urlopen(req, timeout=90) as r:
        return json.load(r)


def to_graph(osm, bbox):
    s, w, n, e = bbox
    # local meters: equirectangular around bbox center
    lat0 = math.radians((s + n) / 2)
    kx = 111320 * math.cos(lat0)
    kz = 110540

    nodes = {}
    for el in osm.get("elements", []):
        if el["type"] == "node":
            nodes[el["id"]] = ((el["lon"] - w) * kx, (el["lat"] - s) * kz)

    ways = []
    for el in osm.get("elements", []):
        if el["type"] != "way":
            continue
        tags = el.get("tags", {})
        hw = tags.get("highway", "unclassified")
        pts = [nodes[i] for i in el.get("nodes", []) if i in nodes]
        if len(pts) < 2:
            continue
        length = sum(math.hypot(pts[i+1][0]-pts[i][0], pts[i+1][1]-pts[i][1])
                     for i in range(len(pts)-1))
        ways.append({
            "highway": hw,
            "width": WIDTHS.get(hw, 6),
            "length": round(length, 1),
            "points": [[round(x, 1), round(z, 1)] for x, z in pts],
            "name": tags.get("name", ""),
        })

    return {
        "attribution": "© OpenStreetMap contributors (ODbL 1.0) — see docs/OSM_ATTRIBUTION.md",
        "license": "ODbL-1.0",
        "bbox": list(bbox),
        "center_m": [round((e-w)*111320*math.cos(lat0)/2, 1), round((n-s)*110540/2, 1)],
        "ways": ways,
        "stats": {
            "ways": len(ways),
            "total_road_m": round(sum(x["length"] for x in ways), 1),
        },
    }


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--bbox", help='"s,w,n,e" lat/lon box')
    ap.add_argument("--preset", choices=list(PRESETS))
    ap.add_argument("--out", required=True)
    a = ap.parse_args()
    bbox = tuple(map(float, a.bbox.split(","))) if a.bbox else PRESETS[a.preset]
    if not a.bbox and not a.preset:
        ap.error("need --bbox or --preset")
    print(f"Querying Overpass for bbox {bbox} ...", file=sys.stderr)
    osm = fetch(bbox)
    graph = to_graph(osm, bbox)
    with open(a.out, "w") as f:
        json.dump(graph, f)
    print(f"Wrote {a.out}: {graph['stats']['ways']} ways, "
          f"{graph['stats']['total_road_m']}m of road", file=sys.stderr)


if __name__ == "__main__":
    main()
