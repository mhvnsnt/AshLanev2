# Free APIs & Public Domain Resources for AshLane

Everything here is free to use. License notes flag what's commercial-safe vs research-only.
**Rule: only CC0/public-domain/permissive (MIT/Apache/BSD/OFL) goes in the game build.**

---

## 1. 3D Model APIs

### Icosa Gallery ⭐ WIRE IN NOW
- **URL:** https://icosa.gallery | **API:** `https://api.icosa.gallery/v1/assets`
- **What:** Open-source successor to Google Poly. Thousands of CC-licensed glTF models.
- **Free tier:** Fully free, no auth needed for search. No rate limits documented.
- **License:** Per-asset CC (CC0, CC-BY, CC-BY-SA). Filter for commercial-safe.
- **Integration:** REST API returns JSON with `zip_archive_url` per format. Download zip, extract glTF.
- **AshLane use:** Street props (dumpsters, hydrants, trash cans), furniture, background detail.
- **Script:** `tools/free-apis/icosa-puller.py` — `python3 icosa-puller.py --query "dumpster" --limit 5`
- **Status:** ✅ TESTED — downloads working glTF + bin files.

### Poly Haven
- **URL:** https://polyhaven.com | **API:** `https://api.polyhaven.com/assets?t=textures`
- **What:** 788+ CC0 PBR textures, 521 CC0 models, 981 CC0 HDRIs. Pristine quality.
- **Free tier:** Free. Note: API is free for non-commercial/academic; commercial API use needs sponsorship. **Manual downloads are always fine.**
- **License:** CC0 — fully commercial-safe.
- **Integration:** `api.polyhaven.com/files/{slug}` returns all PBR channels (diffuse, normal, roughness, AO, displacement) at 1K–8K.
- **AshLane use:** Already in use for textures. Expand to HDRIs for image-based lighting and models for props.
- **Status:** ✅ Already wired in texture pipeline.

### ambientCG
- **URL:** https://ambientcg.com | **API:** `https://ambientcg.com/api/v2/full_json`
- **What:** CC0 PBR materials, textures, models, HDRIs. No login.
- **Free tier:** Fully free, no auth.
- **License:** CC0 — fully commercial-safe.
- **Integration:** REST API v2 returns full catalog JSON. Direct download links.
- **AshLane use:** Backup/alternative PBR texture source. Good for variety (different artists, different styles than Poly Haven).

### Sketchfab
- **URL:** https://sketchfab.com | **API:** `https://api.sketchfab.com/v3/models`
- **What:** Millions of 3D models. Search is open without auth.
- **Free tier:** Search free. **Download requires free account + OAuth token** (`sketchfab.com/settings#api`).
- **License:** Per-model (filter `?license=cc0&downloadable=true` for commercial-safe).
- **Integration:** Data API v3 for search, Download API with OAuth token for GLB download.
- **AshLane use:** Largest pool of CC0 models. Worth the one-time free registration for the download token.
- **Caveat:** Sketchfab is transitioning to Fab.com (Epic). API lifetime is uncertain. Use Icosa as primary.

### Smithsonian Open Access
- **URL:** https://3d.si.edu | **API:** `https://api.si.edu/openaccess/api/v1.0/` (needs free api.data.gov key)
- **What:** 3,500+ museum 3D scans. Artifacts, sculptures, historical objects.
- **Free tier:** Free with API key. Also accessible via S3: `s3://smithsonian-open-access/media/3d/` (no sign-in).
- **License:** CC0 — fully commercial-safe.
- **Integration:** S3 direct download (GLB/glTF/OBJ + USDZ) or REST API.
- **AshLane use:** Museum/gallery level props, statue decorations, historical artifacts as set dressing.

### NASA 3D Resources
- **URL:** https://github.com/nasa/NASA-3D-Resources
- **What:** 257 GLB files. Spacecraft, rovers, astronauts, planets.
- **Free tier:** Fully free, GitHub raw download.
- **License:** Public domain (NASA). Cannot use NASA logo/insignia per usage guidelines.
- **Integration:** Enumerate via GitHub tree API, download raw GLBs.
- **AshLane use:** Sci-fi level props, easter eggs. Limited direct use for street brawler, but free.

### Objaverse / Objaverse-XL
- **URL:** https://objaverse.allenai.org
- **What:** 800K–10M+ 3D objects. LVIS subset (~46K) is category-tagged.
- **Free tier:** Free via Python package (`pip install objaverse`). No login.
- **License:** ODC-By corpus; **individual items carry their own license — check per item.**
- **Integration:** `objaverse.load_lvis_annotations()` → category dict → `objaverse.load_objects(uids)` pulls `.glb`.
- **AshLane use:** Massive prop library. Category search ("fire_hydrant", "bench", "trash_can") is the killer feature.

---

## 2. Texture / Material APIs

| Source | API | License | Notes |
|--------|-----|---------|-------|
| Poly Haven | `api.polyhaven.com/assets?t=textures` | CC0 | Already wired. Best quality. |
| ambientCG | `ambientcg.com/api/v2/full_json` | CC0 | No auth. Good variety. |
| 3DTextures.me | sitemap/RSS | CC0 | Cloudflare — may need proxy. |
| cgbookcase | sitemap | CC0 | Cloudflare — may need proxy. |

---

## 3. Audio APIs

### Openverse ⭐ WIRE IN NOW
- **URL:** https://openverse.org | **API:** `https://api.openverse.org/v1/audio/`
- **What:** Indexes Freesound + other sources. 240+ results for "punch" alone.
- **Free tier:** Fully free, **no auth needed**. Anonymous rate limits are generous.
- **License:** Filterable (`?license=cc0` for commercial-safe). Per-result license field.
- **Integration:** REST API returns direct MP3 preview URLs from Freesound CDN. No OAuth needed (unlike Freesound's own API).
- **AshLane use:** ALL game SFX — punches, kicks, crowd, UI, weapons, ambience.
- **Script:** `tools/free-apis/sfx-downloader.py` — `python3 sfx-downloader.py --pack combat`
- **Status:** ✅ TESTED — downloaded CC0 punch SFX successfully.

### Freesound (direct API)
- **URL:** https://freesound.org | **API:** `https://freesound.org/apiv2/`
- **What:** Hundreds of thousands of SFX and field recordings.
- **Free tier:** Free API key at `freesound.org/apiv2/apply/`. **Previews downloadable without OAuth.** Full-quality needs OAuth2.
- **License:** Per-sound CC (CC0, CC-BY, CC-BY-NC). Filter for commercial-safe.
- **Integration:** Use Openverse instead for simplicity (no key needed). Use Freesound API directly if you need full-quality WAVs.
- **AshLane use:** Same as Openverse — it's the underlying source.

### BBC Sound Effects ⚠️ RESEARCH ONLY
- **URL:** https://sound-effects.bbcrewind.co.uk
- **What:** 33,000+ professional recordings dating back to the 1920s.
- **License:** **RemArc license — NON-COMMERCIAL ONLY.** Cannot use in a sold game.
- **Verdict:** Great for prototyping and reference. **DO NOT ship in the game.**

### Pixabay Sounds
- **URL:** https://pixabay.com/sound-effects/
- **What:** Thousands of SFX and music.
- **License:** Pixabay Content License — free for commercial use, no attribution. Cannot redistribute standalone.
- **AshLane use:** Backup SFX source. Fine for in-game use.

---

## 4. Map Data APIs

### OpenStreetMap + Overpass API ⭐ WIRE IN NOW
- **URL:** https://www.openstreetmap.org | **API:** `https://overpass-api.de/api/interpreter`
- **What:** Real street layouts, building footprints, POIs for any city on Earth.
- **Free tier:** Free. Be polite — cache results, don't hammer. (Alternative instances: `overpass.kumi.systems`)
- **License:** ODbL — **must attribute OpenStreetMap contributors.** Compatible with game use.
- **Integration:** Overpass QL query → JSON with nodes/ways/relations → convert to building footprints + road network.
- **AshLane use:** Real city districts as level basis. Query a neighborhood → get building footprints → feed into city generator.
- **Example query (buildings near Times Square):**
  ```
  [out:json][timeout:25];
  way(around:200,40.758,-73.9855)["building"];
  out body;
  ```
- **Status:** City generator agent is building OSM ingestion now.

---

## 5. AI APIs (Free Tiers)

### Hugging Face Inference API
- **URL:** https://huggingface.co/inference-api
- **What:** Free inference on thousands of open models (text, image, audio).
- **Free tier:** Free with account. Rate-limited. Some models need Pro for GPU.
- **License:** Per-model (most are Apache/MIT).
- **Integration:** `POST https://api-inference.huggingface.co/models/{model_id}` with JSON input.
- **AshLane use:**
  - **Text generation:** Dialogue, flavor text, announcer lines (e.g., `mistralai/Mistral-7B`)
  - **Image generation:** Concept art, textures (e.g., `stabilityai/sd-turbo` — fast)
  - **Audio:** TTS for announcer/character voices (e.g., `suno/bark`, `microsoft/speecht5_tts`)
- **Caveat:** Free tier can be slow/queued. Good for batch/offline generation, not real-time gameplay.

### Hugging Face Spaces (Gradio API)
- **What:** Free hosted demos with API access via `gradio_client` Python package.
- **Free tier:** Free. Community Spaces have generous limits.
- **Integration:** `pip install gradio_client` → `Client("space-name").predict(...)`
- **AshLane use:** Access GPU models (TripoSR, TRELLIS) without own GPU. Find Spaces running 3D generation.
- **Status:** Auto-GPU agent is testing this now.

---

## 6. Motion Capture (Public Domain / Free Commercial)

### CMU Graphics Lab Mocap Database ⭐
- **URL:** http://mocap.cs.cmu.edu | **Mirror:** https://github.com/una-dinosauria/cmu-mocap
- **What:** 2,500+ motion clips (walk, run, punch, kick, dance, sports). BVH format.
- **License:** **"Free for use in research and commercial projects worldwide."** Cannot resell the data directly, but CAN ship in commercial products.
- **Integration:** Download BVH from GitHub mirror → retarget to game skeleton.
- **AshLane use:** Base animations for ALL character movement. Boxing (13_17, 14_01), punching (143_23, 144_20), kicking (144_05, 86_06), blocks (144_07).
- **Acknowledgment required:** "The data used in this project was obtained from mocap.cs.cmu.edu. The database was created with funding from NSF EIA-0196217."

### Mixamo
- **URL:** https://www.mixamo.com
- **What:** Thousands of rigged character animations. Auto-rigger.
- **Free tier:** Free with Adobe account.
- **License:** Free for commercial use (Adobe terms). Cannot redistribute raw files.
- **AshLane use:** Fight animations, idle/walk cycles. Already used in pipeline.

---

## 7. Fonts (OFL / Public Domain)

### Google Fonts
- **URL:** https://fonts.google.com | **API:** `https://www.googleapis.com/webfonts/v1/webfonts`
- **What:** 1,500+ open fonts.
- **License:** SIL Open Font License (OFL) — free for commercial use, embedding, redistribution. Cannot sell the font alone.
- **Integration:** Download TTF/WOFF2 directly, or use the API to list.
- **AshLane use:** UI typography, menu design, HUD. Street-style fonts: Anton, Archivo Black, Bebas Neue, Russo One.

---

## 8. Other Useful Free APIs

### Open-Meteo (Weather)
- **URL:** https://open-meteo.com | **API:** `https://api.open-meteo.com/v1/forecast`
- **What:** Weather forecasts, no API key needed.
- **Free tier:** Free, no auth, generous limits. CC-BY 4.0 (attribute).
- **License:** Data is CC-BY. Fine for game use with attribution.
- **AshLane use:** Dynamic weather matching player's real location. Rain in-game when it's raining outside.

---

## Integration Priority

| Priority | What | Effort | Impact |
|----------|------|--------|--------|
| 1 | Openverse SFX downloader | ✅ DONE | All game audio |
| 2 | Icosa Gallery model puller | ✅ DONE | Street props |
| 3 | OSM Overpass → city generator | In progress | Real city layouts |
| 4 | CMU Mocap → animation retarget | Next | All character animation |
| 5 | HF Inference (TTS/dialogue) | Next | Voice + text content |
| 6 | Poly Haven HDRI expansion | Easy | Image-based lighting |
| 7 | Sketchfab download token | One-time setup | Largest CC0 model pool |

---

## Scripts in `tools/free-apis/`

- `sfx-downloader.py` — Download CC0 SFX via Openverse. `--pack combat|urban|ui|weapons` or `--query "..."`.
- `icosa-puller.py` — Download CC 3D models from Icosa Gallery. `--query "..." --limit N`.

Both tested and working. No API keys needed.
