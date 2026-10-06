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
