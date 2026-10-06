# VERIFY LAW — the owner's deliverable-verification law (binding)

Quoted verbatim from `~/AGENTS.md` ("Deliverable verification law — the faction promo incident", owner 2026-10-06):

> A worker's "verified" is a CLAIM, not a fact. Never relay it as done until I have checked it myself.
> 1. **My eyes on every deliverable before it reaches the owner.** For video: sample frames from EVERY shot/beat, not 2 frames out of 1200. For images: open and read each one. For audio: confirm duration AND audible content, and confirm it plays through the actual delivery path (in-chat attachments show 0:00 on his phone — use Messenger or streaming links).
> 2. **Automated defect gates for character renders** (build into pipelines, run per frame): feet never below ground plane; facing direction matches movement direction (no crab-walking); no ribbon/exploded geometry. Compute these from the animation data — don't rely on eyeballs alone. For video: verify across the WHOLE timeline (dense frame sampling + automated pose/motion checks with open-source tools like MediaPipe).
> 3. **Worker completion reports must include their proof**: which frames they checked, per-shot checklist results (feet/facing/clipping). A report that says "verified" with no attached evidence gets sent back, not forwarded.
> 4. When I catch a defect the worker missed, the worker fixes it AND the checklist gets the new defect added so it never passes again.

## How `tools/verify/` enforces it

| Law item | Tool | Enforcement |
|---|---|---|
| 1 — eyes on every deliverable | `vlm_qa.py manifest` | Produces a frame manifest + per-frame checklist; the agent (or owner) must read every frame and `fill` results. No bulk "looks good". |
| 2 — defect gates from animation data | `defect_gates.py` | feet-below-ground, facing-vs-movement, exploded/ribbon geometry — all computed from GLB skinning sampled across animations. Reuses `tools/model-qc` geometry primitives for the static bind-pose check. |
| 2 — whole-timeline video verification | `video_qa.py` | Dense frame sampling + MediaPipe pose per frame: person detection, head-cutoff, framing, frozen segments, jitter spikes — reported per scene-cut segment. |
| 3 — proof with every report | `proof_template.json` + `eyes_on_gate.py` | The completion report is not complete without a filled proof JSON. `eyes_on_gate.py` FAILs the deliverable if proof artifacts are missing, frames don't exist, or automated gate reports aren't attached. **Run it and attach its output.** |
| 4 — new defects extend the checklist | `proof_template.json` `new_defects_found` | Caught defects get a permanent checklist item; `vlm_qa.py`'s checklist is the living list. |
| regression on renders | `render_diff.py` | Thresholded before/after diffs with annotated output for repair/reskin proofs. |

**The gate is the law, in code.** `eyes_on_gate.py` exits non-zero on missing proof. Agents MUST run it and attach the output. A completion report without that output is incomplete by definition.
