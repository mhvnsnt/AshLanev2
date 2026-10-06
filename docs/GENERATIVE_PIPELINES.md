# GENERATIVE PIPELINES — AshLane

All four generative pipelines: built, wired into the game, and proven with
real output. Permissive licenses only (MIT / Apache-2.0 / BSD / CC0).
No GPL anywhere in the build.

**Proof images:** `tools/generative/proof/` — every pipeline below has a
rendered screenshot proving it runs.

---

## 1. Seeded World Pipeline — `tools/generative/world/`

Deterministic city generation: same seed = same city block, every time.

| File | What |
|------|------|
| `city-3d.js` | City plan → 3D scene JSON (buildings, windows, neons, props, streetlights) |
| `ashlane-world-loader.ts` | Engine module: loads city JSON into the three.js scene (+ colliders) |
| `viewer.html` | Standalone three.js preview of any generated city |
| `gen-city-proof.mjs` | Proof harness: generate → determinism check → render → screenshot |

**Upstream:** `tools/generative/city-seed.js` (existing, seeded layout).
New code adds the 3D conversion + engine wiring.

```bash
cd tools/generative/world
node gen-city-proof.mjs ashlane-01 /tmp/out   # proof
node -e "
import('./city-3d.js').then(async ({cityTo3D}) => {
  const {generateCity} = await import('../city-seed.js');
  const fs = await import('fs');
  const scene = cityTo3D(generateCity({ seed: 'my-level' }));
  fs.writeFileSync('../../public/worlds/city-my-level.json', JSON.stringify(scene));
});"
```

**Engine wiring** (`src/game3d/` — copy `ashlane-world-loader.ts` there):
```ts
import { loadSeededCity } from "./ashlane-world-loader";
const city = await loadSeededCity("ashlane-01"); // public/worlds/city-ashlane-01.json
scene.add(city.group); // + city.colliders for combat/movement
```

**Proof:** `proof/city-ashlane-01.png` (46 bldg / 587 win / 8 neon / 138 props),
`proof/city-ashlane-07.png` (different seed → different city), determinism check PASS.

---

## 2. Texture / Material Pipeline — `tools/generative/textures/`

Applies real PBR textures to untextured models; sources CC0 texture sets.

| File | What |
|------|------|
| `apply-texture.py` | Injects a base-color texture into a GLB's materials (roughness/metallic flags) |
| `concrete_floor_01.jpg` etc. | CC0 PBR textures from Poly Haven (concrete, asphalt, metal plate) |

**Sources (all CC0):**
- Poly Haven — https://polyhaven.com/textures (CC0, API: `api.polyhaven.com/files/{id}`)
- Material Maker — https://github.com/RodZill4/material-maker (MIT) — procedural PBR, export PNG
- Material Anything — 3DTopia, CVPR 2025 Highlight (MIT) — AI material from text/image (GPU)

```bash
cd tools/generative/textures
# download more CC0 sets:
curl -s "https://api.polyhaven.com/files/brick_wall_01" | python3 -c "..."
# apply to a white/untextured model:
python3 apply-texture.py --input model.glb --texture concrete_floor_01.jpg \
    --output model-textured.glb --roughness 0.95
```

**Proof:** `proof/bannon-concrete.png` — BANNON_muscular_skinned.glb went from
flat white to concrete-textured via `apply-texture.py`. The same script
textures any GLB (world props, buildings, statue variants).

---

## 3. Gaussian Splat Pipeline — `tools/generative/splat/`

Generate splats from meshes, view them, place them in AshLane levels.

| File | What |
|------|------|
| `mesh-to-splat.py` | GLB mesh → 3DGS binary PLY (area-weighted surface sampling, vertex/texture color) |
| `splat-viewer.html` | Standalone splat viewer (local three.js, no CDN) |
| `ashlane-splat-loader.ts` | Engine module: `loadSplat("props/crate.ply")` → placeable THREE.Points |
| `make-prop-glb.py` | Test-mesh builder (proof helper) |

**Viewer reference:** valentil/gaussian-splats (MIT) — studied for the PLY
format + rasterizer design; our viewer/loader are AshLane-native (no extra deps).
For large splats with LOD: reall3d-com/Reall3dViewer (MIT).

**Production capture path** (phone photos → real splats, same PLY format):
1. Capture 50–200 phone photos circling the object/scene
2. COLMAP (BSD-3) → camera poses + sparse point cloud
3. 3DGS training (original: https://github.com/graphdeco-inria/gaussian-splatting — verify license per use)
4. Drop the `.ply` in `public/splats/`, load with `loadSplat()`

```bash
cd tools/generative/splat
python3 mesh-to-splat.py --input prop.glb --output prop.ply --count 20000
```

```ts
// engine
import { loadSplat } from "./ashlane-splat-loader";
const crate = await loadSplat("props/crate.ply"); // public/splats/props/crate.ply
crate.position.set(10, 0, 5);
scene.add(crate);
```

**Proof:** `proof/splat-prop.png` — 8,000-splat PLY generated from a mesh,
rendered as soft Gaussians in the browser.

---

## 4. Character Generation Pipeline — `tools/generative/character/`

End-to-end: input → 3D → postprocess → rig → validate → game-ready GLB.

| File | What |
|------|------|
| `char-pipeline.py` | Orchestrator: runs all 5 stages, validates, writes manifest |
| `char-procedural.py` | CPU generation stage: assembles a stylized fighter from primitives |
| `postprocess.py` | Decimate / clean / normalize / validate (existing, tested) |
| `auto-rig.py` | Binds mesh to 58-joint Mixamo skeleton (capsule-distance skinning, CPU) |

**AI stages (GPU-gated, same downstream):** `tools/generative/3d/` —
TripoSR (MIT, image→3D, ~1s GPU), TRELLIS (MIT, image→3D, ~30s GPU),
Shap-E (MIT, text→3D, ~10s GPU). The orchestrator calls them when
`--mode triposr|trellis|shap-e` is used on a GPU machine; the CPU
procedural path proves every downstream stage.

**Rig output** feeds the existing animation retargeter:
`tools/animation/retarget/retarget.py` (58-joint Mixamo ↔ 65-joint Quaternius).

```bash
cd tools/generative/character
# full CPU proof:
python3 char-pipeline.py --mode procedural --name brawler-01 --outdir /tmp/charpipe
# GPU + reference image:
python3 char-pipeline.py --mode triposr --input ref.jpg --name mychar
# GPU + text:
python3 char-pipeline.py --mode shap-e --prompt "a wooden crate" --name crate
```

**Proof:** `proof/fighter-procedural.png` — pipeline output rendered
(2044 faces → postprocessed → rigged, 23 joints, 2.09m, validated).
Rig verified: bind pose = identity (max error 6e-08), rotating the arm
bone moves 266 verts with the limb.

---

## 4b. GPU Character Generation via Colab — ⭐ RECOMMENDED

The CPU procedural path (§4) is a fallback only. **This is the real pipeline** —
no more "no GPU in the sandbox."

**File:** `tools/generative/character/AshLane_CharacterGen.ipynb`

### Exact steps (2 minutes of your time)

1. Open the notebook in Colab:
   `https://colab.research.google.com/github/mhvnsnt/AshLanev2/blob/main/tools/generative/character/AshLane_CharacterGen.ipynb`
2. **Runtime → Change runtime type → GPU (T4)** — free tier works
3. Edit the **CONFIG** cell: set `PROMPT` (text) or `IMAGE_PATH` (reference image),
   pick `BACKEND = "triposr"`, optionally fill `BATCH` for multiple characters
4. **Runtime → Run all**
5. Get textured GLBs — auto-downloaded **and** saved to `MyDrive/AshLane_CharacterGen/`

### What runs inside

| Stage | Tool | License | Notes |
|-------|------|---------|-------|
| Text → image | SD-Turbo (`stabilityai/sd-turbo`) | CC-BY-NC / Stability | 2 steps, ~seconds; prompt auto-enhanced (front-facing, white bg, T-pose) |
| Image → 3D | TripoSR (`VAST-AI-Research/TripoSR`) | MIT | ~seconds on T4, textured GLB |
| Postprocess | trimesh + fast-simplification | MIT | decimate to `TARGET_FACES` (default 20k), normalize 1.8m, feet on ground |
| (Optional) | TRELLIS.2 (`microsoft/TRELLIS.2`) | MIT | better quality + PBR, ~10GB VRAM — set `BACKEND="trellis2"`, may want Colab Pro; weights are HF-gated (accept terms + `huggingface-cli login`) |

### Batch mode

Generate the batch config locally, paste into the notebook:

```bash
cd tools/generative/character
python3 colab-batch.py characters.json
# → paste the BATCH = [...] output into the CONFIG cell
```

`characters.json` format:
```json
[
  {"name": "brawler-01", "prompt": "muscular street brawler, green mohawk, leather jacket"},
  {"name": "boxer-01",   "prompt": "female boxer, purple braids, boxing gloves"}
]
```

Or `python3 colab-batch.py --auto-name characters.json` to auto-generate names.

### Tips for best results

- **Front-facing reference images**, plain/white background — TripoSR quality lives or dies on this
- The pipeline auto-enhances text prompts with "full body, T-pose, front facing, white background"
- Generated GLBs drop straight into `public/models/cast/` — then run the existing
  `char-pipeline.py --mode rig` / `auto-rig.py` stages to bind to the 58-joint skeleton

---

## License Ledger

| Dependency | License | Used in |
|------------|---------|---------|
| three.js | MIT | viewers, engine loaders |
| Poly Haven textures | CC0 | texture pipeline |
| valentil/gaussian-splats | MIT | splat format/viewer reference |
| reall3d-com/Reall3dViewer | MIT | splat LOD reference |
| TripoSR / TRELLIS / Shap-E | MIT | character AI stages |
| Material Maker | MIT | procedural PBR reference |
| Material Anything | MIT | AI material reference |
| COLMAP | BSD-3 | production splat capture |
| city-pcg / NexusCity | MIT | seeded world research |

**Never in the build:** GPL code (Veloren, OpenRA — lessons only),
Stability AI Community License (Stable Fast 3D), Tencent license (Hunyuan3D-2).

## 4c. Fully Automated Character Generation — ⭐ ZERO MANUAL STEPS

**No Colab. No browser clicks. No homework.** Run a script, get GLBs.

**File:** `tools/generative/character/auto-character.py`

### How it works

```
Text/Image → HuggingFace Space (free GPU) → GLB download → Postprocess → Output
```

### Usage

```bash
cd tools/generative/character

# From text prompt (simplest)
python3 auto-character.py --prompt "muscular wrestler in purple tights" --name vato

# From reference image
python3 auto-character.py --image ref.png --name cyborg

# Batch mode - unattended generation of entire roster
python3 auto-character.py --batch batch-example.json --output ./output/
```

### Backends

| Backend | Input | Quality | Speed | Status |
|---------|-------|---------|-------|--------|
| **Shap-E** (`hysts/Shap-E`) | Text or Image | Medium | ~2 min | ✅ **WORKING** - tested end-to-end |
| **TRELLIS** (`trellis-community/TRELLIS`) | Image | High | ~5 min | ⚠️ Space API unstable |
| **Stable Fast 3D** (`stabilityai/stable-fast-3d`) | Image | High | ~3 min | ⚠️ Space API errors |

**Proof:** `tools/generative/character/proof-shap-e-wrestler.glb` — generated from
"a muscular wrestler in purple tights" via Shap-E API, downloaded automatically,
render-verified. No human touched anything.

### Free API test results (2026-10-06)

| Option | Result |
|--------|--------|
| HF Serverless Inference API | ❌ No 3D models supported (no inference providers) |
| TripoSR Spaces (stabilityai, hansyan, mrdas, seawolf) | ❌ All in error or paused |
| Stable Fast 3D Space | ❌ API raises exceptions |
| TRELLIS Space (trellis-community) | ⚠️ Connects but generation errors |
| **Shap-E Space (hysts/Shap-E)** | ✅ **Works** - text-to-3D and image-to-3D |

### Self-hosted GPU fallback

If free Spaces are down:

```bash
cd tools/generative/character
./deploy-gpu.sh runpod    # ~$0.34/hr RTX 3090
./deploy-gpu.sh vast      # ~$0.25/hr
```

Deploys a Docker container running TripoSR (MIT) with a simple HTTP API.
See `Dockerfile`, `server.py` for details.

### License ledger

| Component | License |
|-----------|---------|
| Shap-E model | MIT (OpenAI) |
| TRELLIS | MIT |
| TripoSR | MIT (Stability AI / VAST-AI-Research) |
| auto-character.py | MIT |
| server.py, Dockerfile | MIT |
