# AshLane Modding — Round 4

Players can add their own fighters and stages without touching game source.

## Mod manifest (`ashlane.mod.json`)

```json
{
  "id": "my-fighter-pack",
  "name": "My Fighter Pack",
  "version": "1.0.0",
  "author": "you",
  "gameVersion": ">=0.9.0",
  "assets": {
    "fighters": [
      { "id": "myfighter", "model": "models/myfighter.glb", "portrait": "portraits/myfighter.webp",
        "height": 1.82, "moveset": "brawler" }
    ],
    "stages": [
      { "id": "mystage", "model": "models/mystage.glb", "thumbnail": "stages/mystage.webp" }
    ]
  }
}
```

## Rules
- Mods live in `mods/<mod-id>/` next to the game. The loader scans on boot.
- Only `.glb` models, `.webp/.png` images, `.json` data. **No code execution** — mods are data-only (XSS safety).
- `gameVersion` uses semver range; incompatible mods are listed but not loaded.
- Duplicate fighter/stage `id`s: first-loaded wins, conflict logged to console.
- Fighter models must be humanoid-ish; the loader validates the GLB parses and has at least one mesh (hard validation of skeletons is the game's import pipeline job).

## Studied prior art
- **Stardew Valley / SMAPI**: manifest + content packs, version ranges — the model for our manifest shape (SMAPI is MIT).
- **Friday Night Funkin'**: data-driven character/stage JSON + asset folders, no-code mods — the model for data-only safety.
- **Lethal Company / BepInEx**: code mods — explicitly NOT our model (code execution risk in a web game).
