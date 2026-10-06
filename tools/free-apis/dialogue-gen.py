#!/usr/bin/env python3
"""
dialogue-gen.py — Fighter dialogue line generator for AshLane.

Outputs per-character voice line scripts (intros, taunts, win/lose barks)
as JSON, ready to feed into piper-voice.py for offline TTS synthesis.
See DYNAMIC_COMMENTARY.md for how the game picks lines at runtime.

Usage:
  python3 dialogue-gen.py --list
  python3 dialogue-gen.py --character cipher --out dialogue/cipher.json
  python3 dialogue-gen.py --all --out dialogue/
  python3 dialogue-gen.py --all --synthesize   # render every line via piper
"""

import argparse
import json
import os
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))

# Lines are keyed by game event. Keep them short: fighting-game barks,
# not paragraphs. Characters stay in their established voice.
DIALOGUE = {
    "announcer": {
        "cast": "announcer",
        "round_one": ["Round one! Fight!"],
        "round_two": ["Round two! Keep it clean, keep it mean!"],
        "final_round": ["Final round! Everything on the line!"],
        "ko": ["KNOCKOUT! It's OVER!", "Down goes the challenger!"],
        "decision": ["We go to the judges' scorecards!"],
        "upset": ["Nobody saw THAT coming!"],
    },
    "cipher": {
        "cast": "cipher",
        "intro": [
            "You stepped into MY alley. Bad move.",
            "I don't fight for fame. I fight because I like it.",
        ],
        "taunt": [
            "Is that your best? Pathetic.",
            "Come on. Show me something real.",
        ],
        "win": [
            "Stay down. It's safer there.",
            "Told you. My alley, my rules.",
        ],
        "lose": ["Lucky shot. Run it back."],
    },
    "onyx": {
        "cast": "onyx",
        "intro": [
            "Try to keep up, darling.",
            "I hope you stretched. You'll need it.",
        ],
        "taunt": [
            "Is that all? I barely felt it.",
            "You're boring me. Hit harder.",
        ],
        "win": [
            "Done already? Pity.",
            "Better luck next lifetime.",
        ],
        "lose": ["Enjoy it. It won't happen twice."],
    },
    "crowd": {
        "cast": "crowd",
        "hype": ["Let's go! Let's go! Let's go!"],
        "oooh": ["Ooooooh!"],
        "boo": ["Booo! Get 'em outta here!"],
    },
}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--list", action="store_true")
    ap.add_argument("--character")
    ap.add_argument("--all", action="store_true")
    ap.add_argument("--out", default=os.path.join(HERE, "dialogue"))
    ap.add_argument("--synthesize", action="store_true",
                    help="render every line to WAV via piper-voice.py")
    args = ap.parse_args()

    if args.list:
        for name, data in DIALOGUE.items():
            events = [k for k in data if k != "cast"]
            print(f"  {name:10s} cast={data['cast']:10s} events={', '.join(events)}")
        return

    names = list(DIALOGUE) if args.all else [args.character]
    if not names or names == [None]:
        ap.error("pass --character NAME, --all, or --list")

    os.makedirs(args.out, exist_ok=True)
    for name in names:
        if name not in DIALOGUE:
            print(f"unknown character: {name}", file=sys.stderr)
            sys.exit(1)
        data = DIALOGUE[name]
        if args.all or not args.character:
            path = os.path.join(args.out, f"{name}.json")
        else:
            path = args.out if args.out.endswith(".json") else os.path.join(args.out, f"{name}.json")
            os.makedirs(os.path.dirname(path) or ".", exist_ok=True)
        with open(path, "w") as f:
            json.dump(data, f, indent=2)
        n_lines = sum(len(v) for k, v in data.items() if k != "cast")
        print(f"wrote {path} ({n_lines} lines)")

        if args.synthesize:
            wav_dir = os.path.join(args.out, name)
            for event, lines in data.items():
                if event == "cast":
                    continue
                for i, line in enumerate(lines):
                    wav = os.path.join(wav_dir, f"{event}_{i}.wav")
                    subprocess.run(
                        [sys.executable, os.path.join(HERE, "piper-voice.py"),
                         "--text", line, "--cast", data["cast"], "--out", wav],
                        check=True,
                    )


if __name__ == "__main__":
    main()
