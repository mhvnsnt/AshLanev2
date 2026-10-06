# AshLane Promo Video Pipeline — "Entrance Kit" style

Produces **50-second staged entrance cinematics** for any AshLane character:
dark opening → walk-in → power pose → taunt → signature pose → title card → hero pose → ASHLANE outro.

This is **not** gameplay screen capture. Every frame is a staged 3D cinematic
render with directed cameras, dramatic lighting, and procedural character
animation — per the owner's promo video standard.

## Quick start

```bash
cd tools/promo-video
./make-promo.sh EL_TORO_DE_ORO.glb "EL TORO DE ORO" "" -1.57
# output: output/EL_TORO_DE_ORO.mp4  (50s, 1080p, H.264 + AAC)
```

Arguments: `<MODEL.glb> "CHARACTER NAME" [output.mp4] [ry]`

- `ry` = manual facing override in radians (per-character; find it with a test frame)
- Set `PROMO_WORK=/path` to change the scratch dir (default `~/workspace/promo-work/<MODEL>/`)

Requires: node + puppeteer (uses the `glb-renders/renderer` node_modules),
python3 + numpy + PIL, ffmpeg. All open-source.

## Pipeline stages

| Script | What it does |
|---|---|
| `cinematic.html` | The 3D scene: dark arena stage, spotlights, light beams, dust, Mixamo-rig procedural animation (walk / power pose / taunt / signature / hero), 6 camera shots, lighting timeline. Deterministic `window.__renderAt(t)`. |
| `render-frames.cjs` | Puppeteer driver: headless three.js via SwiftShader, 1200 frames @ 24fps → PNG sequence. `--extra "ry=-1.57"` passes page params. |
| `make-music.py` | Procedural 50s entrance theme (numpy synth: drone → 92 BPM groove → breakdown → final hit). Original composition, no copyrighted material. |
| `make-titles.py` | Title cards with OFL street fonts (Bangers / Anton): name slam, ASHLANE sub, end card. Transparent PNGs. |
| `build-video.sh` | ffmpeg composite: frames + music + title overlays + fades → 1080p MP4. |
| `make-promo.sh` | Orchestrates all four stages. |

## The 50-second shot list

| Time | Shot |
|---|---|
| 0–5s | Dark opening (intentional). Silhouette, spotlight ramps from behind. |
| 5–14s | Low-angle hero: character walks toward camera. |
| 14–22s | Slow orbit + power pose (arms up, chest out). Rim light shifts red→gold. |
| 22–30s | Close-up taunt: fist pump, head shake, side lighting. |
| 30–38s | Wide signature pose (arms spread like horns) + sweeping light beams. |
| 38–46s | Title card slam: character name + ASHLANE, hero slow push-in. |
| 46–50s | ASHLANE end card, fade to black. |

## Character notes

- Models need a Mixamo-style rig (`mixamorig*` bones, colon or no colon).
- Facing is auto-detected (thinnest horizontal axis) + `?ry=` manual override.
- Feet are auto-planted on the stage from the mesh bbox.
- Per-character `ry` values live here as they're calibrated:
  - `EL_TORO_DE_ORO.glb`: `-1.57`

## Fonts & music licensing

- Fonts: Google Fonts, SIL OFL / Apache 2.0 (commercial-safe). Pulled by `tools/free-apis/street-fonts-puller.py`.
- Music: 100% procedural, original — no samples, no copyrighted material.
- Character art: owner's own models.

## Output

`output/<CHARACTER>.mp4` — 50s, 1920×1080, H.264 (CRF 18), AAC 192k, faststart.
Also committed under `docs/promo/` for the first videos.
