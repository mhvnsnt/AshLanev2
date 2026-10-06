# LLM-Generated Commentary Packs (Round 4 — AI content generation track)

> NOTE (2026-10-06): a parallel Round 4 track (offline TTS) owns
> `DYNAMIC_COMMENTARY.md` / `dialogue-gen.py` in this directory and overwrote
> this doc's first home twice during active work. This file is the collision-free
> home for the LLM-generation design. Coordinator: merge with
> `DYNAMIC_COMMENTARY.md` at push time if desired — the two designs compose
> (LLM lines → human review → `dialogue-gen.py` DIALOGUE dicts → piper WAVs,
> or straight to subtitle packs).

Batch-generate large volumes of candidate dialogue with a free LLM **offline**,
human-review them, then feed the keepers into the commentary pipeline
(`DYNAMIC_COMMENTARY.md`: `dialogue-gen.py` → `piper-voice.py` → WAVs, or the
subtitle-pack path below). **Nothing calls an LLM at runtime** — in-game
selection stays event → cooldown → line lookup, zero network.

## Why offline

- Free inference tiers are rate-limited and too slow for real-time fight pacing.
  Verified 2026-10-05: HF's legacy `api-inference.huggingface.co` endpoint is
  dead (empty reply); the new `router.huggingface.co/hf-inference` returns
  **HTTP 401 without a token**; community Gradio spaces sleep; Pollinations'
  legacy text API is currently HTTP 500 on every call. See "Free-tier LLM API
  verdicts" below.
- A 0.5B-parameter local model (Qwen2.5-0.5B-Instruct, Apache-2.0) generates a
  full pack on CPU in under an hour, once, at build time.
- Runtime stays deterministic, testable, and shippable with zero network deps.

## Tool

`tools/free-apis/llm-dialogue-gen.py`:

```
python3 llm-dialogue-gen.py --kind trashtalk --character "Cipher" --count 4
python3 llm-dialogue-gen.py --kind announcer --count 8 --backend local \
    --model-dir ~/.models/Qwen2.5-0.5B-Instruct
```

- `--kind trashtalk|announcer|quest`, `--character NAME`, `--count N`,
  `--backend auto|hf|local`, `--model`, `--model-dir`, `--temperature`,
  `--raw-out` (save raw model text for prompt tuning), `--out`.
- **Models (licenses verified live via `https://huggingface.co/api/models/{id}`
  cardData on 2026-10-05):**
  - `Qwen/Qwen2.5-0.5B-Instruct` — **Apache-2.0**. Recommended: notably more
    coherent than SmolLM2-360M at modest speed cost (~8 min / 120 tokens on a
    loaded CPU-only VM).
  - `HuggingFaceTB/SmolLM2-360M-Instruct` — **Apache-2.0**. Faster, but output
    quality too low for this task (degenerate ALL-CAPS rambling at temp 0.9;
    cleaner rejected 100% of one test batch). Kept as default fallback.
  - `mistralai/Mistral-7B-Instruct-v0.3` — **Apache-2.0** but cardData flags
    `inference: false` (not on serverless free tier); too heavy for CPU local.
- **hf backend:** posts to the HF router's OpenAI-compatible chat endpoint.
  Without `HF_TOKEN` it exits 2 with a clear message (get a free token at
  huggingface.co/settings/tokens — no card). Handles 401/429/503 distinctly.
  **Never fabricates output** — on any failure it exits non-zero with the
  reason on stderr.
- **local backend:** transformers + CPU torch, weights pre-downloaded with
  curl into `--model-dir` (sandbox-proof: this sandbox's proxy env breaks
  httpx, which `huggingface_hub` uses — curl works fine).
- Prompt templates bake in the content policy: gritty Def Jam / Urban Reign
  attitude, PG-13, no slurs, no hate speech, no real people/places. Few-shot
  examples per kind; mechanical output cleaner strips numbering, markdown
  labels (`**Call #1:**`), quote wrappers, `(STAGE DIRECTIONS)`, trailing
  `- Name` attributions, bracket artifacts, and regurgitated examples.

## Workflow (content team / build step)

```bash
# 1. Generate raw candidates (offline, free) — keep batches small (count 3-4);
#    small models follow "one per line" better on short outputs.
python3 llm-dialogue-gen.py --kind announcer --count 3 --backend local \
    --model Qwen/Qwen2.5-0.5B-Instruct --model-dir ~/.models/Qwen2.5-0.5B-Instruct \
    --out /tmp/raw-announcer.json

# 2. Human review (MANDATORY): ~50-60% keeper rate on Qwen-0.5B. Delete duds,
#    artifacts, off-policy lines; fix fighter names.

# 3a. Feed keepers to TTS: add to DIALOGUE in dialogue-gen.py, synthesize WAVs.
# 3b. Or assemble a subtitle pack per the schema below.
```

## Event → template → line selection (game side)

```
game event ──► event bus ──► commentary director ──► commentary pack (JSON)
                                        │
                              picks line by event type,
                              cooldowns, no immediate repeats,
                              optional per-fighter voice tag
                                        │
                                        ▼
                              subtitle bar / TTS queue / crowd hype meter
```

Events: `fight_start`, `ko`, `knockdown`, `comeback`, `crowd_hype`,
`fight_end`, `taunt` — a subset of the runtime events in
`DYNAMIC_COMMENTARY.md`, so packs plug straight into the planned
`commentary.ts` picker (uniform random within section, per-event cooldowns,
`ko` > `knockdown` > `round_start` > `taunt` priority).

## Commentary-pack JSON schema

```jsonc
{
  "pack_id": "ashlane-vol1",
  "pack_version": 1,
  "generated_by": "Qwen/Qwen2.5-0.5B-Instruct (Apache-2.0), local CPU",
  "generated_on": "2026-10-06",
  "license": "CC0",            // generated lines are released as CC0 for the game
  "review_notes": "...",       // what was cut and why
  "events": {
    "<event_name>": {
      "cooldown_sec": 15,
      "lines": [
        { "text": "...", "voice": "generic" }   // voice: generic | announcer | fighter name
      ]
    }
  }
}
```

## Sample pack

`samples/commentary-pack.json` — **13 lines, really generated** with the local
Qwen backend on 2026-10-06 across 5 runs (~21 raw lines, ~60% keeper rate),
human-curated, duds removed. Cut in review: gibberish artifacts (`KOINNOR`,
`COUGH`), one suggestive line ("Take off your clothes…"), weak fillers
("What's next on my list?"). Lines are verbatim model output after mechanical
cleanup only — no hand-written lines.

## Free-tier LLM API verdicts (Round 4 research, verified 2026-10-05/06)

**Verdict: none recommended for runtime (in-match) calls.** All are viable for
offline batch generation with a free key; latency + rate limits rule out
real-time use.

| API | Free tier | Game-integration verdict |
|---|---|---|
| **HF serverless Inference** | Free with account; **token now required (401 without)** | ✅ batch generation with `HF_TOKEN`; ❌ real-time (cold starts, queues) |
| **Groq** | No card, OpenAI-compatible; free models incl. `openai/gpt-oss-20b` (**Apache-2.0**), `qwen/qwen3.8-27b` (**Apache-2.0**); ~30 RPM / 1K req/day / 8K TPM / 200K TPD; **no training on inputs/outputs**; commercial use OK | ✅ best free batch quality; needs free key; ❌ real-time (rate limits) |
| **Google AI Studio (Gemini)** | Flash/Flash-Lite free; ~10–15 RPM; limits per project | ⚠️ **free-tier prompts may train Google models (human review possible)** — keep lore/prompts out or pay; ✅ batch; ❌ real-time |
| **Pollinations.ai legacy text** | Anonymous, no key | ❌ **HTTP 500 `ENOSPC` on every call 2026-10-05**; endpoint deprecated — do not build on it |
| **Public Gradio Spaces** | Free | ❌ 3 tested SmolLM chat spaces: 1 in error, 2 unreachable (free CPU sleeps) — not dependable |

Bottom line for AshLane: generate packs offline with Qwen-0.5B locally (zero
cost, zero key, Apache-2.0) or Groq free tier (better quality, free key);
ship the curated JSON/WAVs; never call an LLM during a match.
