#!/usr/bin/env python3
"""
colab-batch.py — Generate a Colab-ready BATCH config for AshLane_CharacterGen.ipynb.

Usage:
    # from a JSON file:
    python3 colab-batch.py characters.json

    # from stdin:
    echo '[{"name": "brawler-01", "prompt": "muscular street brawler"}]' | python3 colab-batch.py

    # with pretty character descriptions (auto-names):
    python3 colab-batch.py --auto-name characters.json

Input JSON: list of objects, each with:
    {"name": "brawler-01", "prompt": "muscular street brawler, green mohawk"}
    {"name": "ref-char",   "image": "/content/ref.png"}

Output: a Python snippet — paste it into the BATCH = [...] cell in the notebook.

Pairs with: tools/generative/character/AshLane_CharacterGen.ipynb
"""
import json
import re
import sys


def slugify(text: str) -> str:
    s = text.lower()
    s = re.sub(r"[^a-z0-9]+", "-", s).strip("-")
    return s[:40] or "character"


def build_batch(items, auto_name=False):
    batch = []
    for i, item in enumerate(items):
        entry = {}
        if auto_name or "name" not in item:
            base = item.get("prompt", item.get("image", f"character-{i+1}"))
            entry["name"] = f"{slugify(base)}-{i+1:02d}"
        else:
            entry["name"] = item["name"]
        if "prompt" in item:
            entry["prompt"] = item["prompt"]
        if "image" in item:
            entry["image"] = item["image"]
        if "prompt" not in entry and "image" not in entry:
            raise ValueError(f"item {i} needs 'prompt' or 'image': {item}")
        batch.append(entry)
    return batch


def render_snippet(batch):
    lines = ["BATCH = ["]
    for entry in batch:
        parts = [f'"{k}": {json.dumps(v)}' for k, v in entry.items()]
        lines.append("    {" + ", ".join(parts) + "},")
    lines.append("]")
    return "\n".join(lines)


def main():
    auto_name = "--auto-name" in sys.argv
    args = [a for a in sys.argv[1:] if not a.startswith("--")]

    if args:
        with open(args[0]) as f:
            items = json.load(f)
    else:
        items = json.load(sys.stdin)

    if isinstance(items, dict):
        items = [items]
    if not isinstance(items, list):
        raise ValueError("input must be a JSON list (or single object)")

    batch = build_batch(items, auto_name=auto_name)
    snippet = render_snippet(batch)
    print("# Paste this into the CONFIG cell of AshLane_CharacterGen.ipynb:")
    print(snippet)
    print(f"\n# ({len(batch)} character(s) queued)", file=sys.stderr)


if __name__ == "__main__":
    main()
