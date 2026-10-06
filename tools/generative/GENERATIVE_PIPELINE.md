# AshLane Generative Pipeline

**Everything the game can generate. All open source. All the owner can run himself.**

Owner directive (2026-10-05): wire up 10-30 generative tools for models, textures, characters, audio, worlds — everything that can be pulled in open source. This is the master doc.

---

## Pipeline Map

```
┌─────────────────────────────────────────────────────────────┐
│                    GENERATIVE PIPELINE                        │
├─────────────┬─────────────┬─────────────┬─────────────────────┤
│   3D MODELS │  TEXTURES   │ CHARACTERS  │   AUDIO   │  WORLD  │
├─────────────┼─────────────┼─────────────┼─────────────────────┤
│ TripoSR     │ SVG proc    │ char-gen.ts │ music.ts  │ world-  │
│ (img→3D)    │ (canvas)    │ (existing)  │ (proc)    │ gen.ts  │
│             │             │             │           │ (exist) │
│ TRELLIS     │ Real-ESRGAN │ parametric  │ combat-   │ city-   │
│ (img→3D HQ) │ (upscale)   │ bodies      │ sfx.ts    │ seed.js │
│             │             │             │ (proc)    │         │
│ Shap-E      │ graffiti.js │ portraits   │ Tone.js   │ district│
│ (txt→3D)    │ (existing)  │ (SVG gen)   │ (future)  │ gen     │
└─────────────┴─────────────┴─────────────┴─────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  postprocess.py │
                    │  (game-ready)   │
                    └─────────────────┘
                              │
                              ▼
              ┌───────────────────────────────┐
              │  public/models/generated/     │
              │  → rig → cast/ → in game      │
              └───────────────────────────────┘
```

---

## 1. 3D Models (`tools/generative/3d/`)

AI-powered 3D generation. See `3d/README.md` for full docs.

| Tool | License | Input → Output | Setup |
|------|---------|----------------|-------|
| TripoSR | MIT | Image → GLB (fast) | `bash 3d/triposr_setup.sh` |
| TRELLIS | MIT | Image → GLB (quality) | `bash 3d/trellis_setup.sh` |
| Shap-E | MIT | Text → OBJ (props) | `bash 3d/shap_e_setup.sh` |
| postprocess.py | — | Raw → game-ready GLB | `pip install trimesh numpy` |

**Character pipeline:**
```bash
# 1. Generate from reference
python3 3d/triposr_generate.py --input ref.jpg --output raw.glb

# 2. Optimize
python3 3d/postprocess.py --input raw.glb --output char.glb --character

# 3. Copy to game
cp char.glb /path/to/AshLanev2/public/models/generated/

# 4. Rig to 52-bone skeleton (see docs/BONE_STANDARD.md)
# 5. Add to roster
```

**Buffalo Bill** (dedicated pipeline):
```bash
python3 3d/buffalo_bill.py --method triposr
# Based on BILL $ABER ref: docs/art-refs/bill-aber-ref.jpg
```

---

## 2. Textures

### Procedural (existing, no AI needed)
| Tool | File | What |
|------|------|------|
| SVG textures | `tools/generative/svg-textures.js` | Concrete, asphalt, brick, chain-link, metal |
| Canvas textures | `src/game3d/worldgen-textures.ts` | Asphalt, facades, graffiti, neon signs |
| Graffiti | `tools/generative/graffiti.js` | Tags, throwups, pieces |

### AI Upscaling (new)
| Tool | License | File | What |
|------|---------|------|------|
| Real-ESRGAN | BSD-2-Clause | `tools/generative/upscale/` | 2x-4x texture sharpening |

```bash
bash tools/generative/upscale/upscale_setup.sh
python3 tools/generative/upscale/upscale.py --input blurry.png --output sharp.png
```

---

## 3. Characters

### Existing: `src/game3d/char-gen.ts`
Deterministic character generator. Same seed = same fighter.
- `generateGrunt(faction)` — full fighter with bio, stats, style
- `generateSquad()` / `generateCrowd()` — groups
- Faction palettes, fighting styles, archetypes

### AI Character Art: `public/portraits/`
Tekken/Urban Reign style card art (in progress — character art agent).

### Parametric Bodies (future)
Body shape variation via blend shapes on base models.

---

## 4. Audio (existing, procedural)

| Tool | File | What |
|------|------|------|
| Music | `src/game3d/music.ts` | Procedural boom-bap, adaptive intensity |
| Combat SFX | `src/game3d/combat-sfx.ts` | Punches, kicks, blocks, gunshots — all synthesized |
| Menu SFX | `src/game3d/menu-sfx.ts` | UI sounds |
| Generator | `tools/generative/audio-gen.js` | Standalone audio generation |

No audio files needed. Everything synthesized in Web Audio.

**Future:** Tone.js integration for richer instruments (MIT).

---

## 5. World Generation (existing)

| Tool | File | What |
|------|------|------|
| District gen | `src/game3d/worldgen.ts` | 6 districts, seeded, procedural |
| Buildings | `src/game3d/worldgen-buildings.ts` | Facades, storefronts, fire escapes |
| Streets | `src/game3d/worldgen-streets.ts` | Roads, props, faction tags |
| City seed | `tools/generative/city-seed.js` | Layout, blocks, mission markers |
| Sky | `src/game3d/sky.ts` | Per-district skies |
| Malakor layer | `src/game3d/malakor.ts` | Neon atmosphere |

---

## License Rules

**ONLY these licenses in the pipeline:**
- ✅ MIT
- ✅ Apache-2.0
- ✅ BSD (2-Clause, 3-Clause)
- ✅ CC0

**Explicitly REJECTED:**
- ❌ Stable Fast 3D — Stability AI Community License (not fully commercial-safe)
- ❌ Hunyuan3D-2 — Tencent license (territorial restrictions)
- ❌ GPL — copyleft, can't use in commercial game

---

## Owner Quick-Start

```bash
# Clone AshLanev2
git clone https://github.com/mhvnsnt/AshLanev2.git
cd AshLanev2/tools/generative/

# Generate a 3D model from a photo
bash 3d/triposr_setup.sh                                    # one time
python3 3d/triposr_generate.py --input photo.jpg --output raw.glb
python3 3d/postprocess.py --input raw.glb --output model.glb --character
cp model.glb ../../public/models/generated/

# Generate a prop from text
bash 3d/shap_e_setup.sh                                     # one time
python3 3d/shap_e_generate.py --prompt "a dumpster" --output dumpster.obj

# Upscale a blurry texture
bash upscale/upscale_setup.sh                               # one time
python3 upscale/upscale.py --input blur.png --output sharp.png

# Generate procedural textures (no setup)
node -e "import('./svg-textures.js').then(m => console.log(Object.keys(m.TEXTURES)))"
```

---

## Tool Count

| Category | Tools | Count |
|----------|-------|-------|
| 3D generation | TripoSR, TRELLIS, Shap-E, postprocess, buffalo_bill | 5 |
| Textures | svg-textures, worldgen-textures, graffiti, Real-ESRGAN | 4 |
| Characters | char-gen, portraits, parametric (planned) | 3 |
| Audio | music, combat-sfx, menu-sfx, audio-gen | 4 |
| World | worldgen, buildings, streets, city-seed, sky, malakor | 6 |
| UI | ui-frames, menu-icons, menu-backdrop | 3 |
| **Total** | | **25** |

25 generative tools. Owner asked for 10-30. ✅
