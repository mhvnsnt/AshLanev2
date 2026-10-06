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
# ROUND 4 — Voice, AI Content, Netcode, Physics, Worldgen, Mobile, Accessibility, Modding

**Rule (unchanged): only CC0 / public-domain / permissive (MIT/Apache-2.0/BSD/Unlicense/OFL) goes in the game build.** CC-BY allowed with written attribution. Everything below was license-checked at research time — re-verify before shipping.

## 23. Piper TTS — Free Offline Character Voices ⭐ WIRE IN NOW
- **What:** Neural text-to-speech, runs fully offline. https://github.com/OHF-Voice/piper
- **License:** MIT (binary + voices from rhasspy/piper-voices, model card tagged MIT) — commercial-safe.
- **Integration:** `tools/free-apis/piper-voice.py` — `--character announcer|cipher|onyx|hype` `--text "..."` `--out out.wav`. Auto-downloads binary+voice on first run into `tools/free-apis/.piper/` (NOT committed). Generate at build time, commit the WAVs.
- **Character presets:** announcer → en_US-ryan-medium (clear male); cipher → en_US-joe-medium slowed (menace); onyx → en_US-lessac-medium (female); hype → ryan-medium fast.
- **Status:** ✅ TESTED — 5 voice lines generated and verified as valid WAVs in `tools/free-apis/samples/`: announcer_ko, announcer_round_one, cipher_menacing, crowd_hype, onyx_taunt.
- **AshLane use:** announcer calls, KO shouts, character taunts, crowd hype stingers, menu VO. Zero runtime cost (baked WAVs).

## 24. Rapier Physics — Destruction, Knockback, Ragdoll ⭐ WIRE IN NOW
- **What:** `@dimforge/rapier3d-compat` — deterministic rigid-body physics, WASM, no native deps. https://rapier.rs
- **License:** Apache-2.0 — commercial-safe (verified in package).
- **Proof:** `tools/physics/rapier-proof/rapier-proof.mjs` — `node rapier-proof.mjs`:
  - 5-box stack falls and settles ✅
  - Impulse knockback moves body 19+ units ✅ (hit-reaction base)
  - Bit-identical positions across runs ✅ (rollback-netcode requirement)
- **AshLane use:** destructible props (tables, crates), KO ragdoll, debris. Determinism = compatible with rollback netcode.
- **Integration plan:** one Rapier World per fight; static colliders for stage; fighters kinematic, switch to dynamic on KO.

## 25. Procedural City Blocks ⭐ WIRE IN NOW
- **What:** `tools/worldgen/building-gen.py` — generates GLB city blocks with trimesh (MIT). No downloads, no assets.
- **Features:** buildings with lit window grids, rooftop water towers + AC units, streetlights, open fight plaza in the center. Per-district palettes: `neon`, `industrial`, `residential`, `waterfront` (matches the owner's district-identity direction).
- **Usage:** `python3 building-gen.py --seed 7 --blocks 2 --palette neon --out district.glb`
- **Status:** ✅ TESTED — 1-block (424 geoms) and 2×2 district (1953 geoms, 120m span) generate and reload cleanly. Sample: `tools/worldgen/samples/district-neon-2x2.glb`.
- **AshLane use:** background city geometry, district backdrops, stage surroundings. Seedable = reproducible.

## 26. Mobile Pipeline — LODs + Texture Variants ⭐ WIRE IN NOW
- **What:** `tools/free-apis/mobile-lod-pipeline.py` — wraps @gltf-transform/cli (Apache-2.0).
- **Does:** generates LOD levels (50%/25% via meshopt simplify) + optional WebP texture variant + JSON size report.
- **Status:** ✅ TESTED on STICKUP.glb: 18,000 → 8,970 → 4,492 tris; LOD files 49%/41% of source size. WebP texture step warns-and-skips on models with unreadable textures (KTX2 needs the external `ktx` binary — documented in script).
- **AshLane use:** run on every character/stage GLB at build time; serve LODs by device tier / distance.

## 27. Accessibility Module ⭐ WIRE IN NOW
- **What:** `tools/accessibility/accessibility.ts` — zero-dependency TS module + node tests.
- **Colorblind-safe faction palettes:** 6 palettes verified pairwise-distinguishable under normal vision AND protanopia/deuteranopia/tritanopia simulation (Machado matrices). Every palette also carries a non-color cue (shape/mark) — color is never the only identifier.
- **Remappable controls:** serializable binding maps, keyboard + touch defaults covering all 13 game actions, validation, localStorage round-trip with safe fallback.
- **Status:** ✅ TESTED — 8/8 node tests pass (`node --test`).
- **AshLane use:** import into game settings; faction colors in HUD/menus use these palettes.

## 28. Modding — Data-Only Mod Loader ⭐
- **What:** `docs/MODDING.md` spec + `tools/modding/mod-loader-prototype.ts` (tested).
- **Design:** mods are folders with `ashlane.mod.json` (id, version, semver gameVersion range, fighter/stage asset lists). Data-only — no code execution. Validates ids, blocks path traversal, resolves duplicate ids, checks asset files exist.
- **Status:** ✅ TESTED — 7/7 node tests pass (valid load, missing files skipped, duplicates resolved, bad manifests rejected).
- **Studied:** SMAPI (manifest shape), Friday Night Funkin' (data-only safety). BepInEx-style code mods explicitly rejected for web-game safety.

## Scripts in `tools/` (round 4)
| Path | What | License | Status |
|---|---|---|---|
| `free-apis/piper-voice.py` | Offline TTS, character presets | MIT | ✅ tested |
| `free-apis/mobile-lod-pipeline.py` | LOD + texture variants | Apache-2.0 (tool) | ✅ tested |
| `worldgen/building-gen.py` | Procedural city blocks → GLB | MIT (new) | ✅ tested |
| `physics/rapier-proof/rapier-proof.mjs` | Physics determinism proof | Apache-2.0 | ✅ PASS |
| `accessibility/accessibility.ts` | Colorblind palettes + remappable controls | MIT (new) | ✅ 8/8 tests |
| `modding/mod-loader-prototype.ts` | Data-only mod loader | MIT (new) | ✅ 7/7 tests |

## Round 4 — Voice / TTS (free & permissive)

### Piper TTS — ✅ build-time voice generator
- **What:** fast offline neural TTS. `tools/free-apis/piper-voice.py` auto-downloads the pinned Piper release (`2023.11.14-2`) and voices into `tools/free-apis/.piper/` (gitignored), then synthesizes 16-bit mono 22050 Hz WAVs.
- **URLs:** https://github.com/rhasspy/piper · https://huggingface.co/rhasspy/piper-voices
- **License:** rhasspy/piper **MIT**; piper-voices repo card tagged **MIT**. Piper is a build-time tool only — never shipped in the game; only the generated WAVs are committed.
- **⚠️ Nuance (verified 2026-10-06):** (a) the Piper release tarball embeds espeak-ng (GPL-3.0) as a shared library — irrelevant for offline build-time use but never bundle Piper itself; (b) newer Piper development moved to the GPL-3.0 fork OHF-Voice/piper1-gpl — we pin the MIT 2023.11.14-2 release; (c) individual voices carry their own MODEL_CARD provenance — one third-party review flags Lessac (and Ryan, fine-tuned from Lessac) as possibly carrying a restrictive research license. **Before bundling the voice .onnx files themselves (we don't today), re-verify per-voice MODEL_CARDs. Generated WAVs are unaffected.**
- **Test evidence (2026-10-06):** `python3 tools/free-apis/piper-voice.py --character announcer --text "Test line" --out /tmp/piper-test.wav` → exit 0, valid WAV (0.91 s, max amplitude 32767 = real audio). All 5 samples re-verified non-silent.

### Generated samples (`tools/free-apis/samples/`)
| File | Duration | Use |
|---|---|---|
| `announcer_ko.wav` | 0.64 s | KO call |
| `announcer_round_one.wav` | 1.37 s | Round intro |
| `cipher_menacing.wav` | 3.22 s | Cipher taunt |
| `crowd_hype.wav` | 2.06 s | Hype stinger |
| `onyx_taunt.wav` | 3.22 s | Onyx one-liner |

### Character presets (in `piper-voice.py`)
- `announcer` → en_US-ryan-medium (clear male announcer)
- `cipher` → en_US-joe-medium, slowed 1.18× (menacing)
- `onyx` → en_US-lessac-medium (female)
- `hype` → en_US-ryan-medium, sped 0.82× (crowd-hype energy)
- Knobs: `--voice`, `--length-scale`, `--noise-scale`, `--noise-w`, `--sentence-silence`

### Coqui TTS / XTTS — ❌ DO NOT USE
- Code repo (https://github.com/coqui-ai/TTS): MPL-2.0, but the **XTTS-v2 weights are under the Coqui Public Model License — non-commercial only** (commercial use needs a paid Coqui license). Fails the LICENSE RULE. GPU-hungry (~2 GB model, CUDA 4+ GB VRAM recommended; CPU ~0.5–1× realtime).

### OpenVoice — ✅ batch-only alternative
- https://github.com/myshell-ai/OpenVoice — **MIT** (V1 + V2 MIT since April 2024, commercial use free). Ignore stale forks showing CC-BY-NC. Zero-shot voice cloning. Rule: only clone voices we own/rights-hold.

### StyleTTS 2 — ❌ DO NOT USE
- Code MIT, but pretrained models require speaker permission or public synthesized-voice disclosure — not a standard permissive license. Fails the LICENSE RULE.

## Round 4 — Netcode: rollback + P2P for versus mode

**Architecture:** P2P WebRTC data channels + rollback netcode as the primary 1v1 path; Nakama relay (rounds 1–3 wiring) as the NAT-failure fallback and for 3+ player modes/ranked. Rollback beats input-delay for a brawler — 9 frames of built-in delay at 150ms RTT kills footsies; rollback gives zero local lag with 1–3f visual snaps hidden inside committed move animations.

**Transport:** PeerJS (MIT) or trystero (MIT, zero-server via BitTorrent/Nostr/MQTT trackers) — both verified MIT live. Keep the transport behind a tiny `sendInputs`/`onInputs` interface; spike both in Phase 2.

**Rollback lib:** no JS port of GGRS/GGPO exists (GGRS is Rust-only; browser path is Rust+WASM via Matchbox — wrong call for a three.js/TS game). Leading candidate: `@zakkster/lite-rollback` (MIT, zero-GC typed-array ring buffer + GGPO-shaped Session, pluggable transports). Backup: `rollback-netcode` (MIT, v0.0.6, fuller-featured but young). Reference: klokwork (MIT deterministic three.js engine — study, don't adopt). Spike lite-rollback vs hand-rolled (~300–500 lines for 2P) before committing.

**What syncs:** inputs @60Hz as bitmasks (~120 B/s/player, sent redundantly); RNG seed once at match start (poison `Math.random` in the sim); hit confirmations are NOT synced — determinism computes them identically on both sides; checksums every ~30 ticks with snapshot resync on mismatch. Cosmetic (animation, particles, crowd, audio) never crosses the wire.

**Phases:** 0 determinism foundation (fixed timestep, seeded PRNG, SyncTest) → 1 local versus + replays → 2 P2P transport with small input-delay → 3 rollback → 4 Nakama relay fallback → 5 polish (quality indicator, spectators, ranked).

**Prototype:** `tools/netcode/p2p-prototype/` — PeerJS host/client running a 60-tick state-sync loop with RTT stats (`host.js`/`client.js`), plus `NETCODE_PLAN.md` with the full plan.

**Caveats:** WebRTC data channels are always DTLS-encrypted; budget TURN (`coturn`, BSD) or accept the Nakama-relay fallback for the ~10–15% of NAT pairs where ICE fails. Sandbox blocks outbound WebSockets and all UDP, so the P2P loop is documented untested-but-complete — run `host.js`/`client.js` in two real browsers.

---

# ROUND 5 — Cinematics, HUD/Saves/i18n, Visual Testing, Analytics, CI/CD, itch.io

**Rule (unchanged): only CC0 / public-domain / permissive (MIT/Apache-2.0/BSD/Unlicense/OFL/ISC) goes in the game build.** CC-BY allowed with written attribution. Everything below was license-checked at research time — re-verify before shipping.

## 29. In-Engine Cinematics ⭐ WIRE IN NOW
- **What:** `src/game3d/cinematics.ts` — shot-based camera direction system (new MIT code).
- **Features:** shot lists (camera path + look-at path + duration + easing + FOV punch), timeline events per shot (lighting changes, SFX, animation triggers), letterbox bars with CSS transform-only animation, ESC/tap skip, `onComplete`/`onSkip` callbacks.
- **Preset:** `entranceShots(focus)` — a 50-second entrance-kit shot list matching the promo video pipeline: dark open (5s) → hero reveal → orbit → face close-up → low-angle power → wide stage → title hold.
- **Engine-agnostic:** depends only on a minimal `CameraLike` interface — works with the real three.js camera or a mock in tests.
- **AshLane use:** fighter entrances, KO slow-mo replays, round intros, story-mode cutscenes. Player-visible immediately.
- **Status:** ✅ BUILT — typechecks clean (`tsc --noEmit`).

## 30. Promo Video Rendering — html-to-video (MIT) ⭐
- **URL:** https://github.com/vfxmajmuni/html-to-video
- **What:** Renders any animated HTML page (React / three.js / WebGL) to MP4 via headless Chromium, **frame-by-frame deterministic** — freezes the RAF clock, renders each frame fully, screenshots, then advances. No dropped frames like realtime screen recorders.
- **License:** **MIT** (verified live in repo README, 2026-10-06) — commercial-safe.
- **Stack:** Playwright + @sparticuz/chromium + ffmpeg on PATH.
- **Modes:** deterministic (RAF-driven three.js scenes) and realtime (CSS/setInterval); chunked capture for long videos.
- **AshLane use:** the promo-video pipeline's renderer — feed it the staged entrance HTML built on `cinematics.ts` shot lists → 50-second entrance-kit MP4s. ffmpeg `drawtext` with the Round-2 OFL street fonts for title cards.
- **Status:** Documented — license verified, ready for the promo pipeline.

## 31. HUD Store — zustand Bridge ⭐ WIRE IN NOW
- **What:** `src/game3d/hud-store.ts` — React ↔ three.js HUD bridge on zustand (MIT, already a dependency).
- **Pattern:** the engine writes to the store only on CHANGE; HUD components subscribe to slices. Zero per-frame React work. Timer display throttled to 1 Hz (sim stays 60 Hz). CSS animates width/opacity/transform only (GPU-composited).
- **Includes:** player + enemy HP, combo counter, round, timer, pooled DOM damage numbers (24 max), `worldToScreen()` helper to project 3D hit points to DOM damage-number coords.
- **Honest finding:** no MIT three.js-specific HUD library exists — DOM/CSS overlay IS the industry standard (all shipping three.js games use it). This is the correct architecture, not a compromise.
- **Status:** ✅ BUILT — typechecks clean.

## 32. Save System — Versioned Envelope ⭐ WIRE IN NOW
- **What:** `src/game3d/saves.ts` — versioned game saves (new MIT code).
- **Backend:** idb-keyval (Apache-2.0 — verified live) when installed (`npm i idb-keyval`); automatic localStorage fallback when it's not. IndexedDB preferred: async, bigger quota.
- **Schema discipline:** every save is `{ schemaVersion, updatedAt, data }`; forward-only N→N+1 migrations; migrate-on-copy (never overwrites the good save in place); newer-version saves return "newer-version" instead of corrupting; automatic backup of previous save before overwrite; JSON file export for offline backup/transfer.
- **Status:** ✅ BUILT — typechecks clean.

## 33. Localization — String Tables ⭐ WIRE IN NOW
- **What:** `src/game3d/i18n.ts` — zero-dependency localization (new MIT code).
- **Includes:** namespaced tables (menu/hud/settings/fighters), `{{name}}` interpolation, en + es shipped, locale persistence to localStorage + save envelope, safe fallback (en → key, never blank, never throws).
- **Upgrade path:** i18next + react-i18next (both MIT, verified) when string count justifies it — the namespace/key layout maps 1:1 onto i18next resources.
- **Status:** ✅ BUILT — typechecks clean.

## 34. Visual Regression Testing — Playwright ⭐ WIRE IN NOW
- **What:** `tests/visual/` — Playwright (Apache-2.0, verified) screenshot-diff tests.
- **Includes:** `playwright.config.ts` (fixed viewport, deviceScaleFactor 1, Vite preview server), `menu.spec.ts`, `character-select.spec.ts`. Game signals readiness via `window.__ASHLANE_SCENE_READY__`.
- **CI:** `.github/workflows/visual-tests.yml` — builds, installs Chromium, runs tests, uploads artifacts on failure.
- **Determinism rules:** baselines generated on Linux CI (same OS as runner), `animations: 'disabled'`, fixed 1280×720, mask dynamic HUD.
- **Status:** ✅ BUILT — config + specs + workflow committed. Baselines to be generated on first green build.

## 35. Asset Validation CI ⭐ WIRE IN NOW
- **What:** `.github/workflows/asset-validation.yml`.
- **Does:** lints every GLB against the glTF 2.0 spec with Khronos gltf-validator (Apache-2.0 — spec errors fail, warnings pass); per-file size gate (25MB max per GLB); total `public/models` budget warning (1.2GB).
- **Status:** ✅ BUILT — workflow committed.

## 36. Privacy-Friendly Analytics — Umami ⭐ WIRE IN NOW
- **What:** `src/game3d/analytics.ts` — game event tracking (new MIT code).
- **Provider:** Umami (MIT, verified) — self-hostable, 2 containers, first-party subdomain dodges ad-blockers.
- **Design:** analytics NEVER breaks the game — safe wrapper, try/catch everywhere, pre-load events queue and flush on init.
- **Events:** fight_started, character_picked, stage_picked, fight_finished, ko, round_started, menu_opened, settings_changed, promo_watched — with typed payloads.
- **Setup:** self-host Umami → `VITE_UMAMI_URL` + `VITE_UMAMI_WEBSITE_ID` → tracker script in root layout → `initAnalytics()` at boot.
- **Rejected:** Plausible CE (AGPL copyleft friction), Countly Lite (non-commercial — NOT commercial-safe), PostHog self-host (MIT core but ops-heavy; graduate to it if funnels needed).
- **Status:** ✅ BUILT — typechecks clean.

## 37. itch.io Deployment — butler ⭐ WIRE IN NOW
- **What:** `.github/workflows/publish-itch.yml` — tag-triggered (`v*`) build → butler push.
- **Tool:** butler (MIT, verified live) — incremental delta uploads to `user/game:html5` channel.
- **Owner setup:** create HTML-kind game on itch.io → API key → repo secrets (`BUTLER_API_KEY`) + variables (`ITCH_USER`, `ITCH_GAME`) → first push → enable "played in the browser".
- **Status:** ✅ BUILT — workflow committed.

## Round 5 — Menu Stack (verified, not yet installed)
| Piece | License | Role |
|---|---|---|
| shadcn/ui | MIT (components copied into repo) | Accessible menu components |
| motion (framer-motion successor) | MIT | Menu transitions, select screen animations |
| react-ts-gamepads | MIT | Gamepad/D-pad menu navigation |
| lucide-react | ISC | Menu icons |
- **Gamepad nav hook:** `useMenuNav(count, onConfirm)` pattern documented — arrow keys + gamepad D-pad/stick move focus, A/Enter confirms. One hook serves every menu.
- **Architecture:** TanStack Router routes `/` → `/select/fighter` → `/select/stage` → `/fight` → `/results`, settings/pause as modal overlays.
- **Blocker:** none. Theme shadcn away from SaaS-dashboard defaults to street style.

## Do NOT ship (reconfirmed R5)
- **Plausible CE** — AGPL-3.0 copyleft; Umami (MIT) covers the need.
- **Countly Lite** — non-commercial license.
- **ffmpeg.wasm with libx264 in shipped builds** — GPL encoder concern; fine as a server-side/build-time tool (promo pipeline), never bundle into the game client.
- **Coqui XTTS weights** — non-commercial model license (from R4, reconfirmed).

## New modules in `src/game3d/` (round 5)
| Module | What | Deps |
|---|---|---|
| `cinematics.ts` | Shot-based cutscene camera + 50s entrance preset | none |
| `hud-store.ts` | zustand HUD bridge, damage numbers, worldToScreen | zustand (installed) |
| `saves.ts` | Versioned saves, migrations, backup, export | idb-keyval (optional) |
| `i18n.ts` | Namespaced string tables, en+es | none |
| `analytics.ts` | Umami event tracking, safe wrapper | none (script tag) |
# ROUND 3 — In-Game Wiring (2026-10-06)

**Rule (unchanged): only CC0 / public-domain / permissive (MIT/Apache-2.0/BSD/Unlicense/OFL) goes in the game build.** CC-BY allowed with written attribution. Everything below was license-checked at research time — re-verify before shipping.

All four workstreams branched from `c4de9eb`, merged to `main` 2026-10-06.
Branches: `round3/nakama`, `round3/visuals`, `round3/audio`, `round3/content`
(pushed to origin for review history).

## 23. Procedural audio — ZzFX ✅ WIRED IN

- **What:** ZzFX v1.4.0 (Frank Force, KilledByAPixel) — tiny procedural WebAudio
  SFX synth. https://github.com/KilledByAPixel/ZzFX — **MIT** (verified in repo).
- **jsfxr** (Unlicense) evaluated — ZzFX chosen: smaller, maintained, TS-friendly.
- **Integration:** `src/game3d/zzfx.ts` (vendored, license header kept) +
  `src/game3d/zxfx-sfx.ts` (recipes: zxPunch/zxKick/zxBlock/zxWhoosh/
  zxKnockdown/zxCheer/zxBoo) augmenting the hand-rolled `combat-sfx.ts`.
- **API:** `setSfxEngine('classic' | 'zzfx' | 'both')` (default `'both'`) —
  punch/kick/block/whoosh/bodyfall/knockout route through ZzFX. All existing
  exports keep working; lazy AudioContext, SSR-safe, null-guarded.
- **Status:** ✅ committed on `round3/audio`, tsc-clean.

## 24. Post-processing — three.js EffectComposer ✅ WIRED IN

- **What:** three.js addons (RenderPass + UnrealBloomPass + VignetteShader +
  OutputPass) — **MIT** (part of three.js, already a dependency).
- **Integration:** `src/game3d/postfx.ts` — `graphics.postFx` toggle, bloom
  threshold 0.85 (neon/signage pop without washing the fight), vignette for
  cinematic framing. On by default on desktop, off on phones.
- **Status:** ✅ committed on `round3/visuals`, hooked into `view.ts`/`mount.ts`.

## 25. Impact particles ✅ WIRED IN

- **What:** hand-rolled GPU particle pool (THREE.Points, 2048 particles) —
  no new dependency, no license surface. (three.quarks evaluated; custom pool
  chosen for zero-overhead combat use.)
- **Integration:** `src/game3d/impact-particles.ts` —
  `spawnImpactBurst(pos, kind)` with kinds: punch / kick / block / knockdown /
  blood / dust / spark. Fired from combat hit resolution in `mount.ts`.
- **Status:** ✅ committed on `round3/visuals`.

## 26. Arena crowd ✅ WIRED IN

- **What:** InstancedMesh spectator system (custom, no dependency) informed by
  boids flocking (Ben Eater, MIT) and crowds-system-js (MIT) research.
  (The federated street-pedestrian/boids system is separate — this is the
  arena bowl crowd.)
- **Integration:** `src/game3d/arena-crowd.ts` — instanced spectators with
  per-instance excitement 0..1, `crowdReact()` spikes excitement on KOs and
  big moments; idle/clap/cheer variation.
- **Status:** ✅ committed on `round3/visuals`.

## 27. Procedural textures ✅ WIRED IN

- **What:** `tools/free-apis/proc-texture-gen.py` — numpy/PIL generator for
  tileable asphalt / concrete / brick albedo + roughness maps (512px).
  Fully procedural, zero license baggage (pixy.js/materialab/TexGen Pro from
  R2 remain documented alternatives).
- **Integration:** `public/textures/procedural/*.png` +
  `src/game3d/stage-dressing.ts` — asphalt ground overlay (y=0.012,
  polygon-offset, roughnessMap) hooked into `view.ts` via `dressStage(scene)`.
- **Status:** ✅ TESTED — textures visually verified (asphalt aggregate,
  brick running bond, concrete with formwork seams); tsc-clean.

## 28. Public-domain films — Prelinger Archive ✅ WIRED IN

- **What:** Three 512kb MP4s from the Prelinger Archive (all public domain):
  `DuckandC1951_512kb.mp4` (Duck and Cover, 1951), `MakeMine1948_512kb.mp4`
  (Make Mine Freedom, 1948), `hindenberg_explodes_512kb.mp4` (Hindenburg, 1937).
- **Integration:** `src/game3d/stage-dressing.ts` — three freestanding in-world
  TV screens (VideoTexture, muted/loop/playsinline, gesture fallback for
  autoplay policies) placed around the arena.
- **Status:** ✅ TESTED — MP4s verified valid (ftyp headers), wired into the
  stage via `dressStage(scene)`.

## 29. Voice / TTS — Piper ✅ WIRED IN (build-time)

- **What:** Piper neural TTS (https://github.com/rhasspy/piper) — **MIT**,
  pinned to the MIT 2023.11.14-2 release (newer dev moved to a GPL-3.0 fork).
  Fully offline: no API keys, no per-line fees.
- **Integration:** `tools/free-apis/piper-voice.py` — character casts
  (announcer→ryan, cipher→joe, onyx→lessac, crowd→ryan), `--samples`
  regenerates the 5 canonical WAVs in `tools/free-apis/samples/`
  (announcer_ko, announcer_round_one, cipher_menacing, crowd_hype,
  onyx_taunt). Binary+voices auto-download to `.piper/` (gitignored).
  `dialogue-gen.py` authors per-character line scripts (`--synthesize`
  renders them). `DYNAMIC_COMMENTARY.md` documents the runtime
  event/priority/cooldown design.
- **License nuance:** Piper is build-time only (never bundled); the release
  tarball embeds espeak-ng (GPL-3.0) as a shared lib — irrelevant for
  offline build use. One third-party review flags Lessac/Ryan voices as
  possibly research-licensed — re-verify per-voice MODEL_CARDs before
  bundling .onnx files (we don't today). Generated WAVs unaffected.
- **Status:** ✅ TESTED — all 5 WAVs synthesized and valid.

## 30. Mobile asset pipeline ✅

- **What:** `tools/free-apis/mobile-pipeline.py` — PNG/JPG → downscaled WebP
  (lossy q80 albedo, lossless data maps) + `manifest.json`. Never touches sources.
- **Status:** ✅ TESTED — 6 procedural textures: 376KB → 112KB (70% smaller).

## 31. More mocap — Rokoko free packs ✅ PULLED & TESTED

- **What:** Rokoko's free mocap sample packs (fight, martial arts, idles,
  dance, sports, walk/run, zombies) — FBX, Mixamo skeleton, 30 FPS.
  Rokoko's site: usable "in any animation, VFX, game, 3D art etc project
  you want, from passion project to commercial use."
  (TrueBones evaluated — coupon-gated Gumroad checkout, no scriptable
  downloads, not automatable. MoCap Online noted for later — manual download.)
- **Integration:** `tools/free-apis/rokoko-mocap-puller.py` — pulls from the
  archive.org mirror (`rokoko-free-mocap-archive`); `--list`, `--pack`,
  `--combat` (fight + martial arts). Tested: 13 fight clips
  (Idle_FightStance, WrestlingIntro, StepForwardandPunch, FightScene A/B…)
  + 6 martial-arts clips (kata, Muay Thai, GetUp_WipeBloodfromMouth…),
  all valid FBX binary. Drops into the existing retargeting pipeline
  (`src/game3d/universal-retarget.ts`).
- **Status:** ✅ TESTED — download + enumerate verified 2026-10-06.

## 32. Nakama backend ✅ WIRED IN (client + local server)

- **What:** Nakama (Heroic Labs) — **Apache-2.0** (server) / client MIT.
- **Integration:** `tools/nakama/docker-compose.yml` + `data.yml` (one-command
  local server), `src/game3d/nakama-client.ts` (device-ID auth, wallet,
  leaderboard — fail-soft offline), `@heroiclabs/nakama-js` dependency,
  `tools/nakama/proof-login.js`, `docs/NAKAMA_SETUP.md`.
- **Status:** ✅ committed on `round3/nakama`. Live-server proof not possible
  in this sandbox (no docker/postgres) — run `docker compose up` in
  `tools/nakama/` on a real machine, then `node proof-login.js`.

## Scripts added (round 3)

| Script | Source | License | Status |
|---|---|---|---|
| `tools/free-apis/rokoko-mocap-puller.py` | Rokoko via archive.org | commercial-OK (rokoko.com) | ✅ tested |
| `tools/free-apis/proc-texture-gen.py` | procedural (new) | none (own code) | ✅ tested |
| `tools/free-apis/piper-voice.py` | Piper TTS | MIT | ✅ tested |
| `tools/free-apis/dialogue-gen.py` | own line scripts | none (own code) | ✅ tested |
| `tools/free-apis/mobile-pipeline.py` | PIL/WebP | none (own code) | ✅ tested |

## In-game modules added (round 3)

| Module | What | Branch |
|---|---|---|
| `src/game3d/zzfx.ts` + `zzfx-sfx.ts` | ZzFX procedural SFX engine | `round3/audio` |
| `src/game3d/postfx.ts` | EffectComposer: bloom + vignette | `round3/visuals` |
| `src/game3d/impact-particles.ts` | GPU impact bursts | `round3/visuals` |
| `src/game3d/arena-crowd.ts` | instanced arena crowd | `round3/visuals` |
| `src/game3d/stage-dressing.ts` | asphalt overlay + Prelinger TVs | `round3/content` |
| `src/game3d/nakama-client.ts` | Nakama auth/wallet/leaderboard | `round3/nakama` |

## 29. LLM Dialogue / Commentary Generation ⭐ BATCH PIPELINE
- **Script:** `tools/free-apis/llm-dialogue-gen.py` — `--kind trashtalk|announcer|quest --character NAME --count N`; backends `hf` (needs free `HF_TOKEN`) / `local` (CPU, offline). Fails gracefully, never fabricates output.
- **Models (Apache-2.0, licenses verified live 2026-10-05):** `Qwen/Qwen2.5-0.5B-Instruct` (recommended — coherent at temp 0.7, ~8 min/120 tokens on CPU, ~60% keeper rate after human review); `HuggingFaceTB/SmolLM2-360M-Instruct` (faster, low quality — degenerate ALL-CAPS rambling rejected).
- **Design:** `tools/free-apis/LLM_COMMENTARY.md` — offline batch → human review → commentary-pack JSON → event/cooldown line picker (zero runtime LLM calls). Sample: `samples/commentary-pack.json` (13 curated lines, 7 events, CC0).
- **HF Inference findings (verified live):** legacy `api-inference.huggingface.co` endpoint dead (empty reply); new `router.huggingface.co` 401s without token — free token required even on free tier.
- **Free-tier verdicts:** Groq free tier = best quality batch option (no card, no training on data, commercial OK, needs free key); Google AI Studio free tier usable but prompts may train Google models; Pollinations.ai broken (HTTP 500); public Gradio Spaces unreliable. **Never call an LLM during a match — batch/offline only.**
- **Companion:** `tools/free-apis/dialogue-gen.py` (TTS track) writes curated per-character line packs as JSON ready to feed into `piper-voice.py` — LLM drafts → human review → curated packs → WAVs.
