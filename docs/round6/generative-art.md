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
