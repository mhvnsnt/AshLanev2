# Voice Pipeline

Two synthesis paths. Piper is the workhorse today; Chatterbox is the
voice-likeness upgrade path.

## Path 1 — Piper (default, MIT, offline, commercial-safe*)
`tools/free-apis/piper-voice.py` — neural TTS, runs fully offline, no API keys.
Binary + voices auto-download once into `tools/free-apis/.piper/` (gitignored).
Only generated WAVs are committed — never the Piper binary or voice models.

```bash
# one line
python3 tools/free-apis/piper-voice.py --cast static \
  --text "How YOU doin'?" --out /tmp/static_test.wav

# rate/energy knobs (also per-cast in CAST_TUNING)
python3 tools/free-apis/piper-voice.py --cast static --length-scale 0.8 \
  --text "..." --out out.wav

# canonical samples
python3 tools/free-apis/piper-voice.py --samples
```

Character → voice casting lives in `CASTS` in that script; vocal direction in
`VOICE_PROFILES.md`. Knobs: `--length-scale` (<1 faster), `--noise-scale`,
`--noise-w`, `--sentence-silence`. Voices under the new piper-voices path
layout (bryce, danny) are mapped in `VOICE_URLS`.

\* Piper release tarball embeds espeak-ng (GPL-3.0) — fine for offline
build-time use, never bundle Piper itself in the game. Per-voice MODEL_CARDs
should be re-verified before bundling any `.onnx` (we don't today).

## Path 2 — Chatterbox voice cloning (MIT, prototype → verify before ship)
`tools/voice/clone-voice.py` — zero-shot voice cloning from a ~10s reference
clip. Resemble AI Chatterbox: code + weights MIT (verified 2026-10-06), output
carries an inaudible Perth watermark.

```bash
# 1. CPU torch FIRST (else pip pulls the ~800MB CUDA wheel and stalls)
pip install --break-system-packages \
  --index-url https://download.pytorch.org/whl/cpu \
  "torch==2.6.0+cpu" "torchaudio==2.6.0+cpu"
# 2. chatterbox (pins match torch 2.6.0; --ignore-installed works around
#    debian-owned typing_extensions)
pip install --break-system-packages --ignore-installed typing_extensions \
  chatterbox-tts
# 3. clone (weights ~3.2GB first run; use --weights-dir on proxy'd VMs —
#    huggingface_hub's downloader breaks on this egress proxy, curl works)
python3 tools/voice/clone-voice.py \
  --ref tools/voice/refs/static.wav \
  --weights-dir ~/workspace/voice-clone-work/cb_weights \
  --text "They counted me out..." \
  --out /tmp/static_clone.wav \
  --exaggeration 0.6
```

Reference clips live in `tools/voice/refs/<character>.wav` (NOT committed —
likeness references stay local). Parody framing per owner: South Park / Robot
Chicken rules.

**Status flags:** `prototype` = works, license recorded, not cleared for paid
ship. `commercial-safe` = cleared. See `tools/voice/LICENSES.md`.

## Owner-recorded lines
Real records some characters himself. Drop WAVs (16-bit mono, 22050 Hz+) in:

```
public/audio/voices/owner/<character>/<line_name>.wav
```

then set `"source": "owner"` for that character in `tools/voice/voices.json`.
The game resolves owner lines first, AI lines as fallback — both can coexist
per character (e.g. owner does promos, AI does barks).

## Game wiring
Committed AI lines live in `public/audio/voices/<character>/<line>.wav`.
`voices.json` is the manifest: character → source (ai|owner), cast voice,
sample rate, line list. The runtime reads it to pick lines.

## License log
Every tool's license is recorded in `tools/voice/LICENSES.md` with
prototype-only vs commercial-safe flags. Nothing ships for money until the
pre-ship audit clears it.
