# Voice Reference Ledger (prototype-only clips — pre-ship audit required)

Every likeness reference clip's exact source. Clips live in
`tools/voice/refs/` (GITIGNORED — never committed). Parody framing per owner:
South Park / Robot Chicken rules. Prototype policy: use whatever works now;
no clip ships in a paid product until the pre-ship audit clears it.

## static (Enzo Amore / Eric Arndt)
- **Clip:** `enzo_ref_14s.wav` (14.0s, 22050Hz mono) + `enzo_ref_29s.wav` (29.0s backup)
- **Source:** YouTube — "Enzo Amore ROASTS WWE shoots on AWE, Paul Heyman, Eddie Kingston, Brian Pillman Jr (Great Promo)"
- **URL:** https://www.youtube.com/watch?v=g1KIH2TqIk8
- **Pulled:** 2026-10-06 via yt-dlp (android player client)
- **Segment:** 0:02.5–0:16.5 (continuous direct-to-camera speech, no music bed)
- **Status:** prototype-only — likeness of a real person; needs pre-ship clearance
- **Prior:** `~/workspace/bannon-video-pipe/repo/assets/voice_references/static.wav`
  VERIFIED 2026-10-06 — 42-byte mock stub ("RIFF mock wav data..."), NOT real
  audio. Unusable for cloning. Do not use.

## narrator (Bill $aber / Marquis Deshaun Whitacre)
- **Status:** pending — owner's own voice; research his music/socials for
  reference, or owner records a 10s reference directly (preferred — no
  third-party likeness involved).

## Engine evaluation (2026-10-06)
- **Chatterbox (Resemble AI, MIT):** SELECTED and **WORKING** — zero-shot
  cloning verified end-to-end on CPU 2026-10-06: cloned Static test line
  generated from the 14s Enzo reference (`static_cloned_test_16bit.wav`,
  12.9s). `tools/voice/clone-voice.py` (+ `--weights-dir` for local weights).
  Install recipe: CPU torch first
  (`--index-url https://download.pytorch.org/whl/cpu "torch==2.6.0+cpu"
  "torchaudio==2.6.0+cpu"`), then
  `pip install --ignore-installed typing_extensions chatterbox-tts`.
  NOTE: `huggingface_hub`'s downloader fails on this VM's egress proxy
  (httpx port-parse bug) — download weights with curl into a local dir and
  use `--weights-dir` (or `ChatterboxTTS.from_local`).
- **XTTS v2 (Coqui):** EVALUATED, DEPRIORITIZED — works offline/free but
  weights are Coqui Public Model License (non-commercial); heavier VRAM needs;
  adds nothing over Chatterbox for our use. Stays REJECTED for any ship path;
  prototype-only at best.
- **OpenVoice (MIT):** viable backup, not wired (Chatterbox covers the need).
- **Piper approximations:** RETIRED for based-on characters per owner verdict
  2026-10-06 ("not some random British guy's voice pretending to be Enzo
  Amore"). Piper stays for original characters + announcer/crowd.
