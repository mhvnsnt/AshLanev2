#!/usr/bin/env python3
"""
clone-voice.py — Zero-shot voice cloning via Chatterbox (Resemble AI).

MIT-licensed code + weights (verified 2026-10-06). Output carries an
inaudible Perth watermark (upstream behavior, kept as-is).

Setup (one time):
  # 1. CPU torch FIRST (else pip pulls the ~800MB CUDA wheel and times out)
  pip install --break-system-packages --index-url https://download.pytorch.org/whl/cpu \
      "torch==2.6.0+cpu" "torchaudio==2.6.0+cpu"
  # 2. then chatterbox (pins: torch/torchaudio 2.6.0, --ignore-installed
  #    typing_extensions works around debian-owned packages)
  pip install --break-system-packages --ignore-installed typing_extensions chatterbox-tts
Needs ~3GB download on first model run (weights cached in
~/workspace/voice-clone-work/cb_weights/ or ~/.cache).

  NOTE (2026-10-06): huggingface_hub's downloader chokes on this VM's egress
  proxy (httpx port-parse error). Workaround: download the 5 weight files
  with curl into a local dir and pass --weights-dir:
    for f in ve.safetensors t3_cfg.safetensors s3gen.safetensors tokenizer.json conds.pt; do
      curl -sL --retry 5 -o weights/$f \
        https://huggingface.co/ResembleAI/chatterbox/resolve/main/$f
    done

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
    ap.add_argument("--weights-dir", default=None,
                    help="local dir with the 5 weight files (bypasses HF download)")
    args = ap.parse_args()

    from chatterbox.tts import ChatterboxTTS

    device = "cuda" if torch.cuda.is_available() else "cpu"
    if args.weights_dir:
        from pathlib import Path
        print(f"loading chatterbox from {args.weights_dir} on {device} ...", flush=True)
        model = ChatterboxTTS.from_local(Path(args.weights_dir), device=device)
    elif args.model == "multilingual":
        from chatterbox.mtl_tts import ChatterboxMultilingualTTS
        model = ChatterboxMultilingualTTS.from_pretrained(device=device)
    else:
        print(f"loading chatterbox ({args.model}) on {device} ...", flush=True)
        model = ChatterboxTTS.from_pretrained(device=device)

    print("synthesizing ...", flush=True)
    wav = model.generate(
        args.text,
        audio_prompt_path=args.ref,
        exaggeration=args.exaggeration,
        cfg_weight=args.cfg,
    )
    os.makedirs(os.path.dirname(os.path.abspath(args.out)), exist_ok=True)
    # 16-bit PCM for max player compatibility (phones included)
    ta.save(args.out, wav, model.sr, encoding="PCM_S", bits_per_sample=16)
    print(f"wrote {args.out} ({model.sr} Hz)")


if __name__ == "__main__":
    main()
