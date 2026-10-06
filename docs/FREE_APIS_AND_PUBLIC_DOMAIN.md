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

---

# ROUND 2 — Deeper Free / Public Domain / Open Source Research

**Rule (unchanged): only CC0 / public-domain / permissive (MIT/Apache/BSD/Unlicense/OFL/QAL-for-games) goes in the game build.** CC-BY is allowed with written attribution in credits. Everything below was license-checked at research time — re-verify before shipping.

## 9. Kenney.nl — CC0 Game Asset Packs ⭐ WIRE IN NOW
- **URL:** https://kenney.nl/assets
- **What:** 60,000+ cohesive game assets — UI packs, SFX, music jingles, low-poly 3D kits, game icons, input prompts.
- **License:** CC0 — confirmed commercial-safe on the official support page (https://kenney.nl/support): "all game assets are public domain licensed (CC0)... free to use them, even in commercial projects." No attribution required.
- **Access:** No official API, but asset pages carry direct zip links: `https://kenney.nl/media/pages/assets/{slug}/{hash}-{ts}/kenney_{slug}.zip` (pattern verified live). Script scrapes the asset page for the href.
- **AshLane use:** UI packs for menus/HUD, interface sounds, impact sounds, input-prompt icons, city/car low-poly kits for background detail.
- **Script:** `tools/free-apis/kenney-puller.py` — `python3 kenney-puller.py --pack interface-sounds --out ./kenney` / `--list`
- **Status:** ✅ TESTED — pulled 104 files from `interface-sounds` pack successfully.

## 10. KayKit — CC0 3D Packs (GitHub) ⭐ WIRE IN NOW
- **URL:** https://github.com/KayKit-Game-Assets | https://kaykit.com
- **What:** Stylized low-poly 3D packs — city builder bits, animated characters, dungeon, furniture, restaurant (club/bar interiors), skeletons (enemies).
- **License:** CC0 — commercial-safe, no attribution required.
- **Access:** GitHub repos, `git clone` or codeload zip. Each pack ships `gltf/`, `fbx/`, `obj/` variants — use the glTF ones.
- **AshLane use:** City Builder Bits for city background buildings, Restaurant Bits for club interiors, animated character packs for crowd NPCs, Dungeon Remastered for subway/tunnel tiles.
- **Script:** `tools/free-apis/kaykit-puller.py` — `python3 kaykit-puller.py --pack KayKit-City-Builder-Bits-1.0 --out ./kaykit` / `--list`
- **Status:** ✅ TESTED — pulled 215 files / 41 GLB-glTF models from City Builder Bits.

## 11. poly.pizza — CC0 Model Index (Kenney + Quaternius + Poly archive)
- **URL:** https://poly.pizza | **API:** `api.poly.pizza/v1.1/search/<query>`
- **What:** Searchable CC0 model index covering the old Google Poly archive, Quaternius, and Kenney packs with direct GLB download URLs.
- **License:** Per-model CC0 / CC-BY (verify the `license` field per model).
- **Access:** Free API key at poly.pizza/settings (`x-auth-token` header).
- **AshLane use:** Single-model discovery channel when Kenney/KayKit/Icosa don't have a specific prop.
- **Status:** Documented — needs free API key to test.

## 12. CMU Mocap as FBX — cMonkeys Huge FBX Mocap Library ⭐ WIRE IN NOW
- **URL:** https://archive.org/details/Huge_FBX_Mocap_Library
- **What:** 2,534 FBX mocap animations — FBX conversion of the CMU Graphics Lab database, organized by CMU subject number. Ready for game engines (no BVH conversion needed).
- **License:** CMU original data: "You may include this data in commercially-sold products, but you may not resell this data directly, even in converted form." Acknowledgment required: "The data used in this project was obtained from mocap.cs.cmu.edu. The database was created with funding from NSF EIA-0196217." Converter adds no extra restrictions.
- **Access:** Direct download: `https://archive.org/download/Huge_FBX_Mocap_Library/Huge%20FBX%20Mocap%20Library/mocap%20animations/{subject}/{file}.fbx`
- **AshLane use:** Boxing (subject 13 = 42 clips), martial arts (16), stunts (14) — feed the animation retargeting pipeline.
- **Script:** `tools/free-apis/cmu-mocap-puller.py` — `--list-subjects`, `--subject 13 --out ./mocap`, `--combat`
- **Status:** ✅ TESTED — listed subjects, downloaded valid FBX 6.1.0 files from subject 13 (boxing).

## 13. MoCap Online — Free Pack (explicit commercial license)
- **URL:** https://mocaponline.com (free pack)
- **What:** Professional optical-mocap animation pack — locomotion, combat, NPCs, idles — with an explicit commercial license, no subscription.
- **License:** Commercial-safe per the free pack terms (verify current terms on their site at download time).
- **AshLane use:** Highest-quality free mocap option for core combat moves; complements CMU.
- **Status:** Documented — download the free pack manually.

## 14. Mixamo — Verdict (use as tool, not as committed assets)
- **URL:** https://www.mixamo.com
- **License findings:** Adobe's terms permit Mixamo animations/models **inside a finished commercial game**. They **prohibit redistributing the raw files** standalone (asset packs, npm packages, public repos of raw FBX).
- **AshLane policy:** Use Mixamo for auto-rigging characters and previewing animations locally. Do NOT commit raw Mixamo FBX files to the repo. Requires free Adobe login; downloads are manual.
- **Related tool:** `squall01337/mixamo-llm-mocap` (MIT, GitHub) — turns any video into a Mixamo-rig FK animation via Blender MCP, agent-operable. Two-fighter support. Potential pipeline addition for custom moves.
- **Status:** Documented — policy set.

## 15. Quaternius — QAL v1.0 (license updated 2026-08-28)
- **URL:** https://quaternius.com | Packs: https://quaternius.com/packs.html
- **License:** ⚠️ Changed from CC0 to the **Quaternius Asset License (QAL) v1.0**: free for commercial games, no credit required, but you may **not resell or redistribute the assets themselves** standalone. (https://quaternius.com/license.html — read in full 2026-10-06.)
- **AshLane policy:** Commercial-safe for in-game use. Keep provenance notes. Universal Animation Library (250+ humanoid anims) already in the game — pull more packs (environments, creatures, props) as needed.
- **Status:** Documented — license change noted.

## 16. CC0 Music Puller ⭐ WIRE IN NOW
- **Script:** `tools/free-apis/music-puller.py`
- **Sources:**
  - **Incompetech (Kevin MacLeod)** — incompetech.com — huge catalog, direct MP3 download. **CC-BY 4.0** — commercial-safe WITH attribution ("Music: Kevin MacLeod (incompetech.com)"). Curated combat/menu/urban packs in the script.
  - **Kenney Music Jingles** — CC0, 85 stingers — via `kenney-puller.py`.
  - **Tallbeard Abstraction Music** — https://tallbeardstudios.github.io/AbstractionMusic/ — 200+ CC0 game music loops.
- **AshLane use:** Menu music, combat BGM, stingers for KOs / round ends.
- **Status:** ✅ TESTED — downloaded Incompetech tracks (CC-BY credit noted for the credits screen).
- **Also:** OpenGameArt.org — filter `license:"Creative Commons 0"` for CC0 music (the `webband` project ships a CC0-curated, loudness-normalized set as a model to copy).

## 17. Procedural Audio (no downloads needed)
- **jsfxr** — https://github.com/chr15m/jsfxr — **Unlicense** (public domain). Procedural retro SFX synthesis in the browser. AshLane use: UI bleeps, hit sweeteners, pickup sounds — generated at runtime.
- **Tone.js** — https://tonejs.github.io — **MIT**. WebAudio framework for interactive/adaptive music. AshLane use: dynamic combat music that intensifies with fight heat, procedural ambient beds per district.
- **Status:** Documented — both MIT/Unlicense, wire into game audio engine when ready.

## 18. Street-Style OFL Fonts ⭐ WIRE IN NOW
- **Script:** `tools/free-apis/street-fonts-puller.py` — `--list`, `--out ./fonts`
- **Fonts (all Google Fonts, SIL OFL / Apache 2.0 — commercial-safe, embedding allowed):**
  - Street/graffiti: **Rock Salt** (tags), **Permanent Marker** (accents), **Rubik Spray Paint** (spray headers), **Bangers** (KO text), **Bungee Shade** (menu headers), **Rye** (faction boards)
  - Heavy/HUD: **Anton**, **Black Ops One** (stencil), **Archivo Black**, **Bebas Neue**, **Russo One**
  - Body: **Inter**, **JetBrains Mono**
- **Access:** Public Google Fonts CSS API (no key). Script resolves latin-subset TTFs via fonts.googleapis.com.
- **AshLane use:** Character cards, graffiti tags, HUD, nameplates, menus.
- **Status:** ✅ TESTED — all 13 fonts downloaded as valid TrueType files.

## 19. game-icons.net — 4,000+ SVG Game Icons (CC-BY)
- **URL:** https://game-icons.net | Repo: `game-icons/icons` (GitHub)
- **License:** **CC-BY 3.0** — commercial-safe WITH attribution (credit the author, add line to credits/ATTRIBUTION.md).
- **AshLane use:** Move/skill icons, inventory, faction symbols, HUD pictograms. Customizable SVGs.
- **Status:** Documented — remember the attribution line.

## 20. Procedural PBR Textures (open source generators)
- **pixy.js** — https://github.com/mebiusbox/pixy.js — **MIT**. Procedural shader library (65+ effect types) powering ShaderBrew. AshLane use: generate grime, rust, concrete, neon-glow maps in-engine.
- **materialab** — https://github.com/kumikumi/materialab — procedural PBR materials as GLSL code, exports PNG sets for glTF. Live demo in browser. AshLane use: generate district-specific wall/floor materials.
- **TexGen Pro** — https://github.com/darealtoga/texture-generator — browser PBR map generator (normal/roughness/AO/height from any base image). AshLane use: derive full PBR sets from single photos.
- **ShaderBrew** — https://github.com/web3dev1337/shaderbrew — WebGL procedural texture editor + 119 sprite sheets for particles. ⚠️ License not verifiable from the repo root at research time — **research-only until license is confirmed**; its pixy.js dependency is MIT.
- **Status:** Documented — pixy.js/materialab/TexGen are the safe bets.

## 21. Particles, Post-Processing, Crowd (open source, three.js)
- **three.js EffectComposer** (UnrealBloomPass, SSAO, Vignette, etc.) — **MIT** (part of three.js). AshLane use: neon bloom for faction lighting, film grain, vignette. Already available — just wire it.
- **Boids (Ben Eater)** — https://github.com/beneater/boids — **MIT**. Classic flocking demo. AshLane use: crowd movement base — adapt for arena crowd flow.
- **crowds-system-js** — https://github.com/boona13/crowds-system-js — **MIT**. 2D crowd playground with character sprites. AshLane use: reference for crowd state machines (cheer/boo/wave).
- **SeedThree** — https://github.com/SkyeShark/SeedThree — **MIT**. Procedural trees/grass for WebGPU. AshLane use: park/green districts, rooftop gardens.
- **three.quarks** — three.js particle system plugin — reported MIT, **verify in repo before use**.
- **Status:** Documented — EffectComposer and boids are the immediate wins.

## 22. Public Domain Films & Archive.org (in-game flavor)
- **Prelinger Archive** — https://archive.org/details/prelinger — thousands of ephemeral films, **all public domain**. AshLane use: in-game TVs / bar screens playing vintage footage, loading-screen flavor.
- **Public-domain features** (verify PD status per title): *House on Haunted Hill* (1959), *Night of the Ghouls*, classic noir/horror collections at https://archive.org/details/sci-fi-horror. AshLane use: drive-in theater level, club projector visuals.
- **Public-domain characters/stories** (inspiration, not assets): Sherlock Holmes (fully PD), Lovecraft mythos, classic pulp heroes. AshLane use: faction lore flavor, fighter archetype inspiration.
- **Access:** archive.org advancedsearch API + direct download. `https://archive.org/advancedsearch.php?q=...&output=json`
- **Status:** Documented — all public domain, safe for in-game screens.

## Scripts in `tools/free-apis/` (round 1 + round 2)
| Script | Source | License | Status |
|---|---|---|---|
| `sfx-downloader.py` | Openverse/Freesound | CC0 | ✅ tested (R1) |
| `icosa-puller.py` | Icosa Gallery | CC per-asset | ✅ tested (R1) |
| `kenney-puller.py` | Kenney.nl | CC0 | ✅ tested (R2) |
| `kaykit-puller.py` | KayKit GitHub | CC0 | ✅ tested (R2) |
| `music-puller.py` | Incompetech/Kenney/Tallbeard | CC-BY/CC0 | ✅ tested (R2) |
| `cmu-mocap-puller.py` | archive.org (CMU conv.) | commercial-OK + ack | ✅ tested (R2) |
| `street-fonts-puller.py` | Google Fonts | OFL/Apache | ✅ tested (R2) |

## Do NOT ship (reconfirmed R2)
- **BBC Sound Effects** — RemArc license, non-commercial only.
- **Sketchfab raw downloads in public repos** — dying API; use Icosa/poly.pizza.
- **Raw Mixamo FBX in the repo** — redistribution violation; in-game use only.
- **Quaternius assets as standalone redistributables** — QAL prohibits; in-game use fine.
- **ShaderBrew** — license unverified; research-only until confirmed.
