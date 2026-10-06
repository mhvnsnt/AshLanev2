# Round 6 — Generative Art

Research-only wave: a REAL generative 2D-art pipeline for AshLane (Urban Reign/Def Jam-style brawler) and Bannon (wrestling). Covers image upscalers, background removal, Stable Diffusion tooling, free image-gen APIs, SVG libs, graffiti/tag art, logo makers, texture synthesis, pixel-art tools, sprite sheet packers.

**License rule (owner binding):** prototype may use whatever WORKS (murky training-data models OK for PROTOTYPE art). Every license below was read from the actual LICENSE file (or the service's published terms) on 2026-10-06. Verdict per project: **commercial-safe** or **prototype-only**. No shipped art from unclear sources without owner sign-off.

**Skipped (done in rounds 1–5):** Google Fonts OFL set, game-icons.net, street-fonts-puller, pixy.js, materialab, TexGen Pro, proc-texture-gen.py, Poly Haven/ambientCG textures, html-to-video, menu-art.tsx (see docs/FREE_APIS_AND_PUBLIC_DOMAIN.md).

## Background removal — rembg + BiRefNet

- **URL:** https://github.com/danielgatis/rembg · https://github.com/ZhengPeng7/BiRefNet
- **What:** rembg = Python CLI/library that strips backgrounds via U²-Net (and other models); one-liner `rembg i input.png output.png`, also a server mode. BiRefNet = newer, higher-quality dichotomous segmentation model (bilateral reference) — noticeably cleaner edges/hair than U²-Net; runs under rembg with `--model birefnet-general` or standalone via its repo.
- **License:** rembg **MIT** (LICENSE file, Daniel Gatis). BiRefNet **MIT** (LICENSE file, ZhengPeng7). Underlying U²-Net weights are Apache-2.0; BiRefNet weights released by the author — re-verify the weight license on the model card before shipping the .pth in a redistributable.
- **Verdict:** **commercial-safe** (MIT code). Output images are our own pixels — no model-output licensing friction for cutouts.
- **Notes:** The cutout step for every AI-generated character sprite, menu portrait, sticker/slap graphic, and promo-video composite. AshLane use: batch `rembg` over generated concept art → transparent PNGs → feed into vtracer (entry below) for vector stickers, or straight into sprite sheets. rembg's `u2net_human_seg` model is tuned for people — good for fighter cutouts.

## Real-ESRGAN (+ ncnn-vulkan builds)

- **URL:** https://github.com/xinntao/Real-ESRGAN · https://github.com/xinntao/Real-ESRGAN-ncnn-vulkan
- **What:** The standard open-source blind image super-resolution model (4× general, 2×, anime-optimized 6B variant). `realesr-ncnn-vulkan` = portable prebuilt binaries (Windows/Linux/macOS, no Python/PyTorch needed) — the practical way to batch-upscale on any machine, including the owner's.
- **License:** Real-ESRGAN repo **BSD-3-Clause** (LICENSE file). ncnn-vulkan code **MIT** (LICENSE file bundles MIT for Real-ESRGAN + MIT for nihui's realsr-ncnn-vulkan + ncnn's BSD-3-Clause). Pretrained weights (RealESRGAN_x4plus etc.) are released by xinntao under **BSD-3-Clause with attribution** — keep the credit line. Nuance: DIV2K training data restricts *dataset* use to academic research; prevailing practice (and the author's choice) treats the *weights* as BSD-3-Clause artifacts. **Excluded:** GFPGAN face-enhance weights (embed NVIDIA StyleGAN2 non-commercial + DFDNet CC-BY-NC-SA) — do NOT bundle those.
- **Verdict:** **commercial-safe** (BSD-3-Clause/MIT, attribution kept). Ship upscaled art freely; keep a THIRD_PARTY_LICENSES note.
- **Notes:** The pipeline's resolution ladder: generate small/fast (512px SD drafts) → upscale 4× to 2048px for menu art, character cards, posters, promo-video title plates. AshLane use: upscale AI-generated graffiti pieces, faction logos, and crowd-variety portraits. Anime-6B model is the right pick for cel-shaded/stylized art; x4plus for photoreal textures.

## chaiNNer

- **URL:** https://github.com/chaiNNer-org/chaiNNer
- **What:** Node-based GUI for chaining image-processing models — upscale (Real-ESRGAN/SwinIR), inpaint, background removal, NCNN/PyTorch/ONNX runtimes — with a visual workflow you can save, share, and run headless via its CLI. The practical "art department workstation" for non-coders (the owner can run saved chains himself).
- **License:** **GPL-3.0** (LICENSE file).
- **Verdict:** **prototype-only as a tool** — GPL-3.0 is fine for *build-time* art processing (GPL governs the program, not images it outputs), but never bundle chaiNNer itself into the game or a shipped tool. Output PNGs are ours.
- **Notes:** AshLane use: build saved chains like "concept art → 4× upscale → background-remove → export PNG" and hand the owner one-click workflows. Pairs with Real-ESRGAN (entry above) and rembg. The node graph maps 1:1 onto a future headless batch script when volume grows.

## Hugging Face diffusers (programmatic SD pipeline)

- **URL:** https://github.com/huggingface/diffusers
- **What:** The Python library for *scripted* Stable Diffusion: text-to-image, img2img, inpainting, ControlNet, LoRAs — all from code, no GUI. This is the backbone of a REAL generative pipeline: seeded, batched, reproducible art generation (e.g. "generate 50 graffiti wall variants, seed 1000–1049, 768px, save with prompt metadata").
- **License:** **Apache-2.0** (LICENSE file) — the library itself is commercial-safe.
- **Verdict:** **commercial-safe (library); per-checkpoint verdicts:** checkpoints carry their own licenses. SD 1.5/2.1/XL = **CreativeML Open RAIL-M** (allows commercial use but with behavioral use-restrictions + the murky-training-data caveat) → **prototype-only** for shipped art per the owner rule. **FLUX.1-schnell = Apache-2.0 weights** → **commercial-safe** and the recommended checkpoint for any art that might ship.
- **Notes:** AshLane use: `tools/gen-art/` scripts — `gen-batch.py --prompt ... --checkpoint <id> --seeds ...` writing PNG + JSON sidecars (prompt, seed, checkpoint, license). Deterministic seeds = regenerable art. Runs on free Colab/Kaggle GPUs or the owner's machine; no paid key (owner has no paid Tripo key and the same frugality applies here).

## Stable Diffusion WebUI — AUTOMATIC1111 (API server)

- **URL:** https://github.com/AUTOMATIC1111/stable-diffusion-webui
- **What:** The classic SD web UI with a full REST API (`--api` flag): POST prompts → get PNGs back. Mature extension ecosystem (ControlNet, Adetailer for faces/hands, regional prompter). Easiest way to stand up a *local* image-gen API the rest of the pipeline (and agents) can call over HTTP.
- **License:** **AGPL-3.0** (LICENSE file).
- **Verdict:** **prototype-only as a server tool** — AGPL-3.0's network clause means: run it locally/behind our own firewall for art generation, never expose it as a public service or bundle it into a shipped product. Generated images are our own work product.
- **Notes:** AshLane use: one local SD API endpoint (`http://127.0.0.1:7860/sdapi/v1/txt2img`) that batch scripts hit for concept art, textures, menu backgrounds. Adetailer extension specifically helps the "AI hands/faces" problem on character portraits. Superseded for scripted work by diffusers (above), but unmatched for interactive prompt iteration.

## ComfyUI (headless workflow API)

- **URL:** https://github.com/Comfy-Org/ComfyUI (moved from comfyanonymous/ComfyUI)
- **What:** Node-graph SD frontend that doubles as a *headless* batch engine: design a workflow once in the UI, save the JSON, then execute it via the `/prompt` API with different inputs — no GUI needed. The serious pipeline choice for multi-stage art (generate → upscale → detail-fix → outpaint) because the whole chain is one versioned JSON file.
- **License:** **GPL-3.0** (LICENSE file).
- **Verdict:** **prototype-only as a tool** — same reasoning as chaiNNer: GPL-3.0 is fine for build-time art generation, never ship or publicly host the server itself. Workflow JSONs and output images are ours.
- **Notes:** AshLane use: canonical workflows in `tools/gen-art/workflows/` — e.g. `character-portrait.json` (txt2img → face detail → 2× upscale), `graffiti-wall.json` (txt2img → outpaint to 21:9), `texture-tile.json` (txt2img → make tileable). Agents and scripts queue jobs by POSTing workflow JSON + prompt text. The "one workflow file = reproducible art factory" model is exactly what the owner asked for.

## InvokeAI

- **URL:** https://github.com/invoke-ai/InvokeAI
- **What:** The commercially-licensed SD studio: unified canvas (inpaint/outpaint by brushing), layer-based compositing, workflow builder, and a node API — aimed at production art teams rather than hobbyists. The pick when the owner's art needs *directed* generation (e.g. "keep this exact character, change the background") instead of prompt roulette.
- **License:** **Apache-2.0** (LICENSE file) — verified.
- **Verdict:** **commercial-safe** (tool). Same checkpoint caveat as diffusers: pair it with Apache-2.0 checkpoints (FLUX.1-schnell) for shippable art; RAIL-M checkpoints stay prototype-only.
- **Notes:** AshLane use: the canvas/inpainting workflow is the fix for "almost-right" character art — generate a fighter portrait, brush-mask the broken hand, regenerate just that region. Also the friendliest UI to hand the owner for art direction ("paint what you want changed"). Heavier than A1111 but purpose-built for iterative production art.

## Pollinations.ai (free image-gen API)

- **URL:** https://pollinations.ai · API docs in https://github.com/pollinations/pollinations
- **What:** Free, no-signup image generation API — a GET request with the prompt in the URL returns a JPEG/PNG (`https://image.pollinations.ai/prompt/{prompt}?width=1280&height=720&seed=42&model=flux&nologo=true`). Also text and audio endpoints. No API key for the anonymous tier; rate-limited, queue-based.
- **License:** Service ToS (from their repo `terms.md`, read 2026-10-06): "You retain ownership and responsibility for the content you generate… Content produced through our services can be utilized for commercial purposes within the bounds of legality and ethical standards." **BUT** they explicitly add: "We encourage you to review the licenses of the open-source models used in the creation process." Underlying models include FLUX (Apache-2.0 weights for schnell) and SD-family (RAIL-M).
- **Verdict:** **prototype-only for shipped art** — the ToS allows commercial use, but the underlying-model-license caveat plus the owner's murky-training-data rule keeps generated art in the concept/mockup tier until the model is verified (use `model=flux` and treat schnell outputs as the commercial-safe lane).
- **Notes:** AshLane use: zero-setup concept art — agents and scripts can pull draft art with curl, no GPU, no keys, no cost. Perfect for rapid iteration ("20 graffiti wall concepts by breakfast") and for the owner's own experimentation. Anonymous tier is slow at peak; fine for batch/offline work, not for runtime game use. `private=true` keeps prompts out of the public feed.

## AI Horde (free distributed generation)

- **URL:** https://stablehorde.net · API: https://stablehorde.net/api/
- **What:** Crowdsourced volunteer-GPU cluster for Stable Diffusion image (and LLM text) generation, with a REST API and a kudos priority system (earn priority by contributing GPU, never by paying — it's a registered non-profit). Free anonymous tier exists; registered API key raises queue priority.
- **License:** The service is explicitly positioned as a **non-commercial** public alternative ("a non-commercial alternative must also exist" — their mission). Community guidance: free for non-commercial use; paid/ad-based integrations are asked to share profits back with the horde. All workers run open-source models only.
- **Verdict:** **prototype-only** — the non-commercial ethos rules out shipped art; ideal for free concept batches.
- **Notes:** AshLane use: backup free GPU when local hardware is busy — queue overnight batches of texture/mural concepts. Slower than Pollinations at peak, but supports more exotic community models and img2img/alchemy post-processing. Good citizen rule: contribute idle GPU as a worker to earn kudos rather than hammering the anonymous queue.

## vtracer (raster → SVG vectorizer)

- **URL:** https://github.com/visioncortex/vtracer
- **What:** Rust raster-to-vector tracer with color mode — turns PNG logos, graffiti pieces, and sticker art into clean multi-color SVGs with smooth splines. Ships as CLI, Rust lib, Python bindings (`pip install vtracer`), and WASM (runs in-browser). Benchmarks put it at/near potrace quality for color art, without potrace's GPL.
- **License:** **MIT** (LICENSE file, visioncortex).
- **Verdict:** **commercial-safe** — the MIT-licensed workhorse of the vector pipeline.
- **Notes:** AshLane use: THE logo/sticker pipeline step — AI-generated or hand-drawn graffiti → vtracer → crisp SVG faction logos, wall tags, menu emblems that scale from phone HUD to 4K title screens. Alternatives noted: `mringler/image-tracer-ts` (MIT, TypeScript port of imagetracerjs — browser/Node, jagged curves on detail) and potrace (next entry) for pure black-and-white work. vtracer is the default for anything with color.

## potrace (bitmap tracer)

- **URL:** https://potrace.sourceforge.net
- **What:** The reference bitmap tracer (Peter Selinger): bitmap → smooth vector outlines, best-in-class for high-contrast black-and-white art — stencil logos, one-color tags, silhouette shapes. CLI (`potrace input.pbm -s -o out.svg`); the algorithm every other tracer is measured against.
- **License:** **GPL-2.0**.
- **Verdict:** **commercial-safe as a build-time tool** — GPL covers the program, not the SVGs it produces. Trace all day; just don't embed/link potrace's code into shipped software without GPL compliance.
- **Notes:** AshLane use: stencil-style faction marks, single-color spray tags, and silhouette cutouts where vtracer's color mode is overkill. Practical pattern from production pipelines: quantize art to flat colors → trace one binary mask per color with potrace → merge layers (preserves small interior details like eyes/highlights better than whole-image color tracing). For color logos prefer vtracer (MIT, no GPL surface at all).

## resvg (@resvg/resvg-js)

- **URL:** https://github.com/linebender/resvg
- **What:** Fast, correct SVG renderer in Rust with first-class Node.js bindings (`@resvg/resvg-js`, npm). Renders any SVG → PNG at arbitrary resolution — the missing link that makes SVG a *generative* format: author logos/tags programmatically as SVG, then rasterize to PNG/WebP textures, sprite sheets, and title cards at exactly the size each use needs.
- **License:** **Apache-2.0** (LICENSE file — relicensed from MPL-2.0; GitHub detection confirms Apache-2.0).
- **Verdict:** **commercial-safe** — can be bundled into build tools and even the game toolchain.
- **Notes:** AshLane use: `svg → resvg → PNG` bake step for all vector art (faction logos on arena aprons, HUD emblems, spray-tag decals). Pairs with opentype.js (next): text → SVG paths → resvg → texture. Related: `scour` (Apache-2.0, now at scour-project/scour) and `svgo` (MIT) for optimizing SVG file size before rasterizing.

## opentype.js (text → SVG paths for logos)

- **URL:** https://github.com/opentypejs/opentype.js
- **What:** JavaScript font parser: load any TTF/OTF/WOFF and convert text to raw SVG path data (`font.getPath('ASHLANE', x, y, size).toSVG()`). The programmatic logo engine — take the Round-2 OFL street fonts (Rubik Spray Paint, Permanent Marker, Bangers, Bungee Shade…), render words as vector paths, then warp/skew/outline/drip them in code.
- **License:** **MIT** (LICENSE file).
- **Verdict:** **commercial-safe** — and the fonts it consumes are OFL (already cleared in Round 2).
- **Notes:** AshLane use: generative wordmarks — faction names, fighter nicknames ("SOMBRA NEGRA"), menu titles as SVG paths with code-driven effects (offset drop shadows, outlines, gradient fills, drip distortions). No font files ship in the game if paths are baked at build time. This + resvg + vtracer = the complete "type → logo → texture" chain.
