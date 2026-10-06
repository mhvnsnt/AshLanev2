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
