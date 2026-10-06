# OpenStreetMap Attribution & License (ODbL 1.0)

AshLane's city generator can ingest real-city street layouts via
`tools/city/osm-ingest.py` (Overpass API). This document records the
license compatibility analysis.

## License

OpenStreetMap data is published under the **Open Database License (ODbL) 1.0**
© OpenStreetMap contributors.

## What we take from OSM

- Road network geometry (way node coordinates) and `highway=*` classification.
- Used as a *basis* for district street layouts — converted to AshLane's
  internal street-graph JSON, then re-laid with procedural buildings/props.

## Compatibility analysis

1. **Attribution (required):** Every street-graph JSON emitted by
   `osm-ingest.py` carries `"attribution": "© OpenStreetMap contributors"`.
   The game credits screen must include "© OpenStreetMap contributors"
   with a link to https://www.openstreetmap.org/copyright. This satisfies
   ODbL §4.3 for Produced Works.

2. **Share-Alike scope:** ODbL share-alike applies to the *database*, not to
   Produced Works (rendered images, the game itself). Our street-graph JSON
   files derived from OSM are kept in a separate directory
   (`public/data/osm/`) and remain available under ODbL — the game code,
   art, and models are NOT infected.

3. **No DRM restriction issues:** ODbL §4.7 prohibits DRM that restricts
   exercise of ODbL rights on the database. The street-graph files ship
   unencrypted alongside the game; fine.

4. **Procedural-only fallback:** Districts generate fully procedurally without
   OSM. OSM ingestion is an *enhancement layer* — the game never depends on
   ODbL data to run, which keeps the core asset pipeline clean.

## Verdict

**Compatible for commercial use** provided:
- [ ] "© OpenStreetMap contributors" appears in the game credits + on
      https://mhvnsnt.github.io/AshLanev2/ (attribution page).
- [ ] `public/data/osm/*.json` files keep their ODbL header and are not
      DRM-locked.

Owner decision noted 2026-10-06: combine useful characteristics from
different real cities (Nashville Broadway, Chicago Loop, New Orleans French
Quarter presets in `osm-ingest.py`).
