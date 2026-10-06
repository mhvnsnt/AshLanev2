#!/usr/bin/env python3
"""
piper-voice.py — Offline neural TTS for AshLane (Piper, MIT license).

Piper (https://github.com/OHF-Voice/piper1-gpl, MIT) runs fully offline:
no API keys, no network at synthesis time, no per-character fees.
The binary + voice models auto-download on first run into
tools/free-apis/.piper/ (gitignored, ~258MB) and are reused afterwards.

Character -> voice casting (all en_US medium quality):
  announcer  en_US-ryan-medium   deep hype-man ring announcer
  cipher     en_US-joe-medium    gravelly menacing heel
  onyx       en_US-lessac-medium cold femme fatale
  crowd      en_US-ryan-medium   pitched/shifted in post for crowd beds

Usage:
  python3 piper-voice.py --text "ROUND ONE. FIGHT!" --cast announcer \\
      --out samples/announcer_round_one.wav
  python3 piper-voice.py --samples   # regenerate the 5 canonical samples
  python3 piper-voice.py --list-casts
"""

import argparse
import os
import shutil
import subprocess
import sys
import tarfile
import urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
PIPER_DIR = os.path.join(HERE, ".piper")
BIN = os.path.join(PIPER_DIR, "piper")
VOICE_DIR = os.path.join(PIPER_DIR, "voices")

PIPER_RELEASE = (
    "https://github.com/OHF-Voice/piper1-gpl/releases/download/v1.2.0/"
    "piper_linux_x86_64.tar.gz"
)
VOICE_BASE = "https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US"

CASTS = {
    "announcer": "en_US-ryan-medium",
    "cipher": "en_US-joe-medium",
    "onyx": "en_US-lessac-medium",
    "crowd": "en_US-ryan-medium",
}

# The 5 canonical in-game samples (also see DYNAMIC_COMMENTARY.md).
CANONICAL_SAMPLES = [
    ("announcer", "announcer_ko", "KNOCKOUT! It's OVER!"),
    ("announcer", "announcer_round_one", "Round one! Fight!"),
    ("cipher", "cipher_menacing", "You stepped into MY alley. Bad move."),
    ("crowd", "crowd_hype", "Let's go! Let's go! Let's go!"),
    ("onyx", "onyx_taunt", "Is that all? I barely felt it."),
]


def ensure_piper():
    os.makedirs(VOICE_DIR, exist_ok=True)
    # The tarball extracts to .piper/piper/piper; BIN may be that directory
    # from an earlier partial setup.
    if os.path.isdir(BIN):
        nested = os.path.join(BIN, "piper")
        if os.path.isfile(nested):
            return nested
    if not os.path.isfile(BIN):
        print("downloading piper binary ...")
        tgz = os.path.join(PIPER_DIR, "piper_linux_x86_64.tar.gz")
        if not os.path.exists(tgz):
            urllib.request.urlretrieve(PIPER_RELEASE, tgz)
        with tarfile.open(tgz) as t:
            t.extractall(PIPER_DIR)
        # Binary lands at .piper/piper/piper; hoist it.
        nested = os.path.join(PIPER_DIR, "piper", "piper")
        if os.path.exists(nested):
            shutil.move(nested, BIN)
        os.chmod(BIN, 0o755)
    return BIN


def ensure_voice(voice):
    onnx = os.path.join(VOICE_DIR, f"{voice}.onnx")
    cfg = onnx + ".json"
    if not (os.path.exists(onnx) and os.path.exists(cfg)):
        print(f"downloading voice {voice} ...")
        for f in (f"{voice}.onnx", f"{voice}.onnx.json"):
            dest = os.path.join(VOICE_DIR, f)
            if not os.path.exists(dest):
                urllib.request.urlretrieve(f"{VOICE_BASE}/{f}", dest)
    return onnx


def speak(text, voice, out_wav):
    piper_bin = ensure_piper()
    model = ensure_voice(voice)
    os.makedirs(os.path.dirname(os.path.abspath(out_wav)), exist_ok=True)
    p = subprocess.run(
        [piper_bin, "--model", model, "--output_file", out_wav],
        input=text.encode(), capture_output=True,
    )
    if p.returncode != 0:
        print(p.stderr.decode()[-500:], file=sys.stderr)
        raise RuntimeError(f"piper failed for: {text[:40]}")
    print(f"wrote {out_wav}")
    return out_wav


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--text")
    ap.add_argument("--cast", choices=sorted(CASTS))
    ap.add_argument("--voice", help="raw voice id, overrides --cast")
    ap.add_argument("--out")
    ap.add_argument("--samples", action="store_true")
    ap.add_argument("--samples-dir", default=os.path.join(HERE, "samples"))
    ap.add_argument("--list-casts", action="store_true")
    args = ap.parse_args()

    if args.list_casts:
        for c, v in CASTS.items():
            print(f"  {c:10s} -> {v}")
        return

    ensure_piper()

    if args.samples:
        for cast, name, text in CANONICAL_SAMPLES:
            speak(text, CASTS[cast], os.path.join(args.samples_dir, f"{name}.wav"))
        return

    if not (args.text and args.out):
        ap.error("--text and --out are required (or use --samples)")
    voice = args.voice or CASTS[args.cast or "announcer"]
    speak(args.text, voice, args.out)


if __name__ == "__main__":
    main()
