#!/usr/bin/env python3
"""
llm-dialogue-gen.py — LLM-powered dialogue/commentary/quest-text generator for AshLane.

Generates trash-talk lines, announcer calls, and quest text using free,
permissively-licensed models. Complements dialogue-gen.py (hand-written lines):
LLM output is batch-generated OFFLINE, human-reviewed, then saved as a
commentary-pack JSON (see DYNAMIC_COMMENTARY.md, "LLM-generated packs").

Backends
--------
hf    : Hugging Face serverless Inference API
        (https://router.huggingface.co/hf-inference). Requires a FREE HF token
        in the HF_TOKEN env var (create one at https://huggingface.co/settings/tokens
        — no card needed). Without a token the API returns 401; this script
        exits with a clear message instead of fake output.
local : Runs an instruct model locally on CPU with transformers. Default is
        HuggingFaceTB/SmolLM2-360M-Instruct (Apache-2.0, verified 2026-10-05),
        but Qwen/Qwen2.5-0.5B-Instruct (Apache-2.0) gives notably more coherent
        lines for a small speed cost — recommended: --model Qwen/Qwen2.5-0.5B-Instruct.
        No token, no network after the weights are local. Weights load from
        --model-dir if given (recommended: pre-download with curl, see below),
        else from the HF cache. Slower per line, but fully offline and
        reproducible — the recommended path for batch-generating packs.

        Sandbox-proof weight download (curl handles proxies that break httpx):
            D=~/.models/SmolLM2-360M-Instruct; mkdir -p $D; cd $D
            for f in config.json generation_config.json tokenizer.json \
                     tokenizer_config.json special_tokens_map.json model.safetensors; do
              curl -sL -o "$f" "https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct/resolve/main/$f"
            done
            python3 llm-dialogue-gen.py --kind announcer --count 5 \
                --backend local --model-dir $D

Usage
-----
    python3 llm-dialogue-gen.py --kind trashtalk --character "Stick Up" --count 3
    python3 llm-dialogue-gen.py --kind announcer --count 5 --backend hf
    python3 llm-dialogue-gen.py --kind quest --character "Mama Rosa" --count 2 --out quests.json

Content policy baked into every prompt: gritty street-brawler attitude,
PG-13, no slurs, no hate speech, no real-world people/places as targets.

Exit codes: 0 = success, 2 = backend unavailable (auth/rate-limit/network),
3 = local backend missing deps.
"""

import argparse
import json
import os
import re
import sys
import urllib.request
import urllib.error

DEFAULT_MODEL = "HuggingFaceTB/SmolLM2-360M-Instruct"  # Apache-2.0 (verified 2026-10-05)
HF_ROUTER = "https://router.huggingface.co/hf-inference/models"

# ---------------------------------------------------------------- prompts ---

SYSTEM = (
    "You are a writer for ASHLANE, a gritty urban street-brawler video game in the "
    "spirit of Def Jam and Urban Reign. Write short, punchy, in-character lines. "
    "Rules: street attitude is fine, but NO slurs, NO hate speech, NO threats toward "
    "real people, and no real-world locations or celebrities. Keep it PG-13. "
    "Output ONLY the lines, one per line, no numbering, no quotes, no commentary."
)

FEWSHOT_TRASHTALK = [
    ("You're stepping to me? This sidewalk's about to teach you manners.",),
    ("Nice chain. Shame it's gonna watch you nap on the concrete.",),
    ("I don't need a referee. I need a mop for after.",),
]

FEWSHOT_ANNOUNCER = [
    ("HE'S DOWN! One clean shot and the whole block just went silent!",),
    ("Knockout! Somebody check the pavement, it just caught a body!",),
    ("IT'S OVER! The crowd came for a fight and got a highlight reel!",),
]

FEWSHOT_QUEST = [
    ("Word is the Iron Wolves are taxing corner stores on 5th. Go remind them who runs that block.",),
    ("My cousin saw your last fight. Prove it wasn't luck — take the back-alley circuit, three bouts, no breaks.",),
]

KIND_PROMPTS = {
    "trashtalk": (
        "trash-talk lines that the fighter {character} says to an opponent "
        "right before a street brawl starts. Each line under 18 words. Make each one different: "
        "cocky, menacing, funny."
    ),
    "announcer": (
        "hype announcer calls for an underground street-fighting league. "
        "Mix: knockout calls, fight-start hype, comeback moments, and crowd-pump lines. "
        "Each line under 20 words, high energy, like a fight MC with a megaphone."
    ),
    "quest": (
        "short mission-giver lines spoken by {character}, a neighborhood fixer "
        "handing the player street brawls to win. Each line is one mission hook, under 25 words: "
        "who to fight, where, and what's at stake."
    ),
}

KIND_FEWSHOT = {
    "trashtalk": FEWSHOT_TRASHTALK,
    "announcer": FEWSHOT_ANNOUNCER,
    "quest": FEWSHOT_QUEST,
}

# flat set of few-shot example lines, so we never ship regurgitated examples
_EXAMPLE_SET = {line.lower() for group in KIND_FEWSHOT.values() for (line,) in group}


def build_messages(kind: str, character: str, count: int) -> list:
    task = KIND_PROMPTS[kind].format(count=count, character=character or "the fighter")
    examples = "\n".join(f"- {line}" for (line,) in KIND_FEWSHOT[kind])
    user = (
        f"Write in the style of these examples:\n{examples}\n\n"
        f"Now write {count} NEW {task} "
        "Each line on its own line. No numbering, no quotes, no brackets, "
        "no extra commentary, no repeating the examples."
    )
    return [
        {"role": "system", "content": SYSTEM},
        {"role": "user", "content": user},
    ]


def clean_lines(text: str, want: int) -> list:
    """Parse model output into clean one-per-line strings. No fabrication:
    only returns lines the model actually produced."""
    lines = []
    for raw in text.splitlines():
        s = raw.strip()
        s = re.sub(r"^[\d\s]+[.)\-:]\s*", "", s)   # "1. ", "2) "
        s = re.sub(r"^[-*•>]+\s*", "", s)          # bullets / quote markers
        s = re.sub(r"^\*{1,2}", "", s)             # **bold opener
        s = re.sub(r"^[A-Za-z][\w '\-]{0,30}#\d+\s*:\*{0,2}\s*", "", s)  # "**Label #1:**"
        s = s.strip().strip("*")
        s = re.sub(r"\s*[-–—]\s*[A-Z][a-z]+$", "", s).strip()  # trailing "- Name" attribution
        s = re.sub(r'^["\u201c](.*)["\u201d],?\s*$', r"\1", s)  # surrounding quotes
        s = s.strip().rstrip(",").strip()
        s = s.strip('"').strip("'").strip()
        s = re.sub(r"\s*\([^)]{2,60}\)\s*", " ", s).strip()  # (STAGE DIRECTIONS)
        s = re.sub(r"\s+", " ", s)
        if len(s.split()) < 3 or len(s.split()) > 30:
            continue
        if re.search(r"[\[\]{}]", s):            # [KOING] style artifacts
            continue
        if re.match(r"^[A-Z '\-]+:?$", s):       # stray labels like "KOING:"
            continue
        if re.search(r"(slur|example lines|here are|as an ai|new lines)", s, re.I):
            continue
        lines.append(s)
    # de-dupe, keep order; drop regurgitated few-shot examples
    seen, out = set(), []
    for l in lines:
        if l.lower() not in seen and l.lower() not in _EXAMPLE_SET:
            seen.add(l.lower())
            out.append(l)
    return out[:want]


# ------------------------------------------------------------------ hf -------

def generate_hf(messages: list, model: str, count: int, temperature: float = 0.7) -> tuple:
    token = os.environ.get("HF_TOKEN", "").strip()
    if not token:
        sys.stderr.write(
            "ERROR [hf backend]: Hugging Face serverless inference now requires a free\n"
            "token (HTTP 401 without one — verified 2026-10-05). Get one free at\n"
            "https://huggingface.co/settings/tokens (no card), then:\n"
            "    export HF_TOKEN=hf_...\n"
            "Or use the offline path: --backend local\n"
        )
        sys.exit(2)
    url = f"{HF_ROUTER}/{model}/v1/chat/completions"
    payload = json.dumps({
        "model": model,
        "messages": messages,
        "max_tokens": max(120, count * 40),
        "temperature": temperature,
    }).encode()
    req = urllib.request.Request(
        url, data=payload,
        headers={"Content-Type": "application/json",
                 "Authorization": f"Bearer {token}"},
    )
    try:
        with urllib.request.urlopen(req, timeout=120) as resp:
            data = json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        body = e.read().decode(errors="replace")[:400]
        if e.code == 401:
            sys.stderr.write("ERROR [hf backend]: 401 — token rejected. Check HF_TOKEN.\n")
        elif e.code == 429:
            sys.stderr.write("ERROR [hf backend]: 429 — rate limited. Wait and retry, or use --backend local.\n")
        elif e.code in (502, 503):
            sys.stderr.write("ERROR [hf backend]: model is loading/cold. Retry in ~30s, or use --backend local.\n")
        else:
            sys.stderr.write(f"ERROR [hf backend]: HTTP {e.code}: {body}\n")
        sys.exit(2)
    except Exception as e:
        sys.stderr.write(f"ERROR [hf backend]: request failed ({e}). Try --backend local.\n")
        sys.exit(2)
    try:
        text = data["choices"][0]["message"]["content"]
    except (KeyError, IndexError):
        sys.stderr.write(f"ERROR [hf backend]: unexpected response shape: {str(data)[:300]}\n")
        sys.exit(2)
    return clean_lines(text, count), text


# ---------------------------------------------------------------- local -------

_LOCAL_PIPE = None

def generate_local(messages: list, model: str, count: int, model_dir: str = "",
                   temperature: float = 0.7) -> tuple:
    global _LOCAL_PIPE
    try:
        import torch
        from transformers import AutoModelForCausalLM, AutoTokenizer
    except ImportError:
        sys.stderr.write(
            "ERROR [local backend]: transformers/torch not installed.\n"
            "Use a venv: python3 -m venv .venv && .venv/bin/pip install torch\n"
            "transformers safetensors  (CPU torch: "
            "https://download.pytorch.org/whl/cpu)\n"
        )
        sys.exit(3)
    src = model_dir or model  # local dir avoids any network entirely
    key = src
    if _LOCAL_PIPE is None or _LOCAL_PIPE[0] != key:
        sys.stderr.write(f"[local] loading {src} on CPU...\n")
        tok = AutoTokenizer.from_pretrained(src, local_files_only=bool(model_dir))
        mdl = AutoModelForCausalLM.from_pretrained(
            src, dtype=torch.float16, low_cpu_mem_usage=True,
            local_files_only=bool(model_dir))
        mdl.eval()
        _LOCAL_PIPE = (key, tok, mdl)
    _, tok, mdl = _LOCAL_PIPE
    prompt = tok.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
    import torch as _t
    inputs = tok(prompt, return_tensors="pt")
    with _t.no_grad():
        out = mdl.generate(
            **inputs, max_new_tokens=max(120, count * 40),
            temperature=temperature, do_sample=True, top_p=0.92,
            repetition_penalty=1.2,
            pad_token_id=tok.eos_token_id,
        )
    text = tok.decode(out[0][inputs["input_ids"].shape[1]:], skip_special_tokens=True)
    return clean_lines(text, count), text


# ------------------------------------------------------------------ main ------

def main() -> None:
    ap = argparse.ArgumentParser(description="AshLane LLM dialogue generator (offline batch)")
    ap.add_argument("--kind", required=True, choices=["trashtalk", "announcer", "quest"])
    ap.add_argument("--character", default="", help="fighter / mission-giver name")
    ap.add_argument("--count", type=int, default=3)
    ap.add_argument("--backend", default="auto", choices=["auto", "hf", "local"])
    ap.add_argument("--model", default=DEFAULT_MODEL)
    ap.add_argument("--model-dir", default="",
                    help="local directory with pre-downloaded weights (offline load)")
    ap.add_argument("--raw-out", default="",
                    help="also save the raw model text (for prompt tuning)")
    ap.add_argument("--temperature", type=float, default=0.7,
                    help="sampling temperature (default 0.7; lower = more coherent)")
    ap.add_argument("--out", default="", help="write JSON lines to file")
    args = ap.parse_args()

    messages = build_messages(args.kind, args.character, args.count)
    backend = args.backend
    if backend == "auto":
        backend = "hf" if os.environ.get("HF_TOKEN") else "local"

    if backend == "hf":
        lines, raw = generate_hf(messages, args.model, args.count, args.temperature)
    else:
        lines, raw = generate_local(messages, args.model, args.count,
                                    args.model_dir, args.temperature)

    if args.raw_out:
        with open(args.raw_out, "w", encoding="utf-8") as f:
            f.write(raw)
        print(f"raw output -> {args.raw_out}", file=sys.stderr)

    if len(lines) < args.count:
        sys.stderr.write(
            f"WARNING: model returned {len(lines)} usable lines of {args.count} requested. "
            "No filler added — re-run for more.\n"
        )
    payload = {"kind": args.kind, "character": args.character,
               "model": args.model_dir or args.model, "backend": backend, "lines": lines}
    text = json.dumps(payload, indent=2, ensure_ascii=False)
    if args.out:
        with open(args.out, "w", encoding="utf-8") as f:
            f.write(text + "\n")
        print(f"wrote {len(lines)} lines -> {args.out}")
    else:
        print(text)


if __name__ == "__main__":
    main()
