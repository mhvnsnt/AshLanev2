# Voice tooling licenses (verified 2026-10-06)

| Tool | License | Status | Notes |
|---|---|---|---|
| Piper TTS (rhasspy/piper release 2023.11.14-2) | MIT | **commercial-safe** (build-time only) | Tarball embeds espeak-ng (GPL-3.0) — never bundle Piper itself; only generated WAVs ship. |
| rhasspy/piper-voices (ryan/joe/lessac, flat path) | MIT (repo card) | **commercial-safe*** | \*One third-party review flags Lessac/Ryan lineage as possibly research-restricted. Re-verify per-voice MODEL_CARDs before bundling any `.onnx` (we don't). Generated WAVs unaffected. |
| rhasspy/piper-voices (bryce-medium) | public domain dataset (MODEL_CARD) | **commercial-safe** | US English male, single speaker; finetuned from an unreleased voice. |
| rhasspy/piper-voices (danny-low) | "see URL" (mimic3-voices), finetuned from Ryan-low | **prototype** | Build-time WAV generation only; re-verify before any voice-model bundling. |
| Chatterbox (Resemble AI) code + weights | MIT | **prototype** | Zero-shot cloning works; output carries inaudible Perth watermark (kept). Pre-ship audit must confirm watermark + parody-use posture before any paid release. |
| Coqui XTTS / XTTS-v2 weights | Coqui Public Model License (non-commercial) | **REJECTED** | Do not use. |
| StyleTTS 2 | code MIT, models require speaker permission / disclosure | **REJECTED** | Do not use. |
| OpenVoice (myshell-ai) | MIT (V1+V2) | **prototype** | Zero-shot cloning alternative; not wired yet. |

**Standing rule:** prototype with whatever works; record every license here;
pre-ship audit clears commercial-safe flags before anything ships for money.
