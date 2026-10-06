#!/usr/bin/env python3
"""
Merge wrestling-moves.json (WWE 2K baked clips) into motion/bank.json.

Usage:
    python3 merge_wrestling_moves.py [--dry-run]

The wrestling moves use non-conflicting names (ddt2, suplex2, german2, ...)
so they merge cleanly alongside the existing bank clips. The animation
agent can then wire them into animation-system.ts clip fallbacks.

The `rootMotion` field on each clip is an optional extension ignored by
the current motion-bank.ts loader (it only reads dur/times/atk/vic).
"""
import json, argparse, shutil
from pathlib import Path

REPO = Path(__file__).resolve()
while not (REPO / "public" / "motion").exists():
    REPO = REPO.parent
BANK = REPO / "public" / "motion" / "bank.json"
MOVES = REPO / "public" / "motion" / "wrestling-moves.json"

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    bank = json.loads(BANK.read_text())
    moves = json.loads(MOVES.read_text())

    added, skipped = [], []
    for name, clip in moves.items():
        if name in bank["clips"]:
            skipped.append(name)
        else:
            bank["clips"][name] = clip
            added.append(name)

    print(f"Would add {len(added)} clips: {', '.join(sorted(added))}")
    if skipped:
        print(f"Skipped (already in bank): {', '.join(sorted(skipped))}")
    if args.dry_run:
        print("Dry run — bank.json unchanged.")
        return

    shutil.copy2(BANK, BANK.with_suffix(".json.bak"))
    BANK.write_text(json.dumps(bank, separators=(",", ":")))
    print(f"Merged into {BANK} (backup: {BANK}.json.bak)")
    print(f"Bank now has {len(bank['clips'])} clips.")

if __name__ == "__main__":
    main()
