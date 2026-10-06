#!/usr/bin/env python3
"""
clone-voice.py — Zero-shot voice cloning via Chatterbox (Resemble AI).

MIT-licensed code + weights (verified 2026-10-06). Output carries an
inaudible Perth watermark (upstream behavior, kept as-is).

Setup (one time):  pip install --break-system-packages chatterbox-tts
Needs ~3GB download on first run (weights cached in ~/.cache).

Usage:
  python3 clone-voice.py --ref tools/voice/refs/static.wav \\
      --text "They counted me out..." --out /tmp/static_clone.wav
  python3 clone-voice.py --ref refs/static.wav --text "..." --out out.wav \\
      --exaggeration 0.7 --cfg 0.6

Reference clips (~10s, clean speech) live in tools/voice/refs/<character>.wav
and are NEVER committed — likeness references stay local.
Parody framing per owner: South Park / Robot Chicken rules.
"""

import argparse
import os
import sys

import torch
import torchaudio as ta


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--ref", required=True, help="10s reference WAV for the voice")
    ap.add_argument("--text", required=True)
    ap.add_argument("--out", required=True)
    ap.add_argument("--exaggeration", type=float, default=0.5)
    ap.add_argument("--cfg", type=float, default=0.5, help="cfg_weight")
    ap.add_argument("--model", default="turbo",
                    choices=["turbo", "base", "multilingual"])
    args = ap.parse_args()

    from chatterbox.tts import ChatterboxTTS

    device = "cuda" if torch.cuda.is_available() else "cpu"
    print(f"loading chatterbox ({args.model}) on {device} ...", flush=True)
    if args.model == "multilingual":
        from chatterbox.mtl_tts import ChatterboxMultilingualTTS
        model = ChatterboxMultilingualTTS.from_pretrained(device=device)
    else:
        model = ChatterboxTTS.from_pretrained(device=device)

    print("synthesizing ...", flush=True)
    wav = model.generate(
        args.text,
        audio_prompt_path=args.ref,
        exaggeration=args.exaggeration,
        cfg_weight=args.cfg,
    )
    os.makedirs(os.path.dirname(os.path.abspath(args.out)), exist_ok=True)
    ta.save(args.out, wav, model.sr)
    print(f"wrote {args.out} ({model.sr} Hz)")


if __name__ == "__main__":
    main()
