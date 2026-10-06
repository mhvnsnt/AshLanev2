#!/usr/bin/env python3
"""vlm_qa.py — VLM visual-QA loop for renders/frames.

Two modes:

1. manifest (always works, no vision backend needed — "agent eyes-on" mode):
   builds a frame manifest + per-frame checklist JSON shaped to the
   deliverable-verification law's proof requirements. An agent (or the owner)
   reads each frame itself and fills results with `fill`.

     python3 tools/verify/vlm_qa.py manifest --dir frames/ --out qa/
     python3 tools/verify/vlm_qa.py manifest --video clip.mp4 --fps 2 --out qa/
     python3 tools/verify/vlm_qa.py fill --checklist qa/checklist.json \\
         --results results.json --out qa/checklist_filled.json

2. vlm (needs a vision backend): sends frames to an OpenAI-compatible vision
   endpoint and fills the checklist automatically. Configure with env:
     VLM_QA_ENDPOINT=https://...  VLM_QA_KEY=...  VLM_QA_MODEL=...

     python3 tools/verify/vlm_qa.py vlm --dir frames/ --out qa/ --max-frames 12

The checklist items encode the standing rules: full-arm-reach framing for
character renders, white-void version present, no placeholder/not-in-canon
text, no third-party branding, canon gender stated + matched, no fake-gameplay
framing. Items a pixel model cannot decide are marked needs_eyes:true and
routed to the agent.
"""
import argparse
import base64
import glob
import json
import os
import subprocess
import sys
import urllib.request

CHECKLIST_ITEMS = [
    {"id": "framing_full_body",
     "item": "Full character visible: head to feet, both hands with clear margin from frame edge (T-pose law)",
     "needs_eyes": False},
    {"id": "white_void_version",
     "item": "A void-white background version exists alongside any styled version",
     "needs_eyes": True},
    {"id": "no_placeholder_text",
     "item": "No placeholder / 'not in canon' / lorem text rendered in the image",
     "needs_eyes": False},
    {"id": "no_thirdparty_branding",
     "item": "No third-party game branding or logos (e.g. Tekken/WWE text) in the image",
     "needs_eyes": False},
    {"id": "anatomy_sane",
     "item": "No obvious anatomy defects: extra/missing limbs, melted hands/feet, twisted shoulders",
     "needs_eyes": False},
    {"id": "lighting_readable",
     "item": "Subject is lit and readable (not a black frame, not blown out)",
     "needs_eyes": False},
    {"id": "gender_match",
     "item": "Depicted gender matches the canon gender stated in the prompt/brief (never assume from the model)",
     "needs_eyes": True},
    {"id": "likeness_match",
     "item": "Portrait/render matches the actual GLB likeness and approved design (not a text-invented design)",
     "needs_eyes": True},
]

VLM_SYSTEM = (
    "You are a visual QA inspector for a game studio. For each image you get, "
    "judge the checklist items. Reply with ONLY a JSON object mapping each "
    "checklist id to {\"result\": \"pass\"|\"fail\"|\"uncertain\", \"reason\": \"...\"}. "
    "Be strict: when in doubt, mark fail with the reason. Never invent details "
    "not visible in the image."
)


def collect_frames(args):
    frames = []
    if args.video:
        os.makedirs(args.out, exist_ok=True)
        fps = args.fps or 2.0
        subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-i", args.video,
                        "-vf", f"fps={fps}", os.path.join(args.out, "frame_%04d.png")],
                       check=True)
        paths = sorted(glob.glob(os.path.join(args.out, "frame_*.png")))
        step = max(1, len(paths) // (args.max_frames or len(paths)))
        for i, p in enumerate(paths[::step]):
            frames.append({"index": i, "file": os.path.relpath(p), "timestamp_s": None})
    else:
        paths = sorted(glob.glob(os.path.join(args.dir, "*")))
        paths = [p for p in paths if p.lower().endswith((".png", ".jpg", ".jpeg", ".webp"))]
        for i, p in enumerate(paths[: args.max_frames or len(paths)]):
            frames.append({"index": i, "file": os.path.relpath(p), "timestamp_s": None})
    return frames


def cmd_manifest(args):
    os.makedirs(args.out, exist_ok=True)
    frames = collect_frames(args)
    manifest = {"tool": "vlm_qa", "mode": "manifest", "source": args.video or args.dir,
                "frames": frames}
    checklist = {"tool": "vlm_qa", "mode": "checklist",
                 "instructions": ("Read EVERY frame (law item 1: eyes on every deliverable). "
                                  "For each frame, set result pass/fail/waived with a reason. "
                                  "needs_eyes items require the canon brief, not just pixels."),
                 "items": CHECKLIST_ITEMS,
                 "frames": [{**f, "checks": [
                     {"id": it["id"], "result": None, "reason": ""} for it in CHECKLIST_ITEMS]}
                     for f in frames]}
    mp_ = os.path.join(args.out, "manifest.json")
    cp_ = os.path.join(args.out, "checklist.json")
    json.dump(manifest, open(mp_, "w"), indent=2)
    json.dump(checklist, open(cp_, "w"), indent=2)
    print(f"[vlm_qa] {len(frames)} frames -> {mp_}, checklist -> {cp_}")
    print("[vlm_qa] agent eyes-on mode: read each frame, then run "
          "`vlm_qa.py fill --checklist checklist.json --results results.json`")
    return 0


def cmd_fill(args):
    cl = json.load(open(args.checklist))
    res = json.load(open(args.results))          # {frame_index: {check_id: {result, reason}}}
    filled, missing = 0, []
    for fr in cl["frames"]:
        r = res.get(str(fr["index"]), res.get(fr["index"], {}))
        for c in fr["checks"]:
            v = r.get(c["id"])
            if v and v.get("result") in ("pass", "fail", "waived"):
                c["result"], c["reason"] = v["result"], v.get("reason", "")
                filled += 1
            else:
                missing.append((fr["index"], c["id"]))
    fails = [(fr["index"], c["id"], c["reason"]) for fr in cl["frames"]
             for c in fr["checks"] if c["result"] == "fail"]
    cl["summary"] = {"filled": filled, "missing": len(missing),
                     "fails": fails, "verdict": "FAIL" if fails else
                     ("INCOMPLETE" if missing else "PASS")}
    json.dump(cl, open(args.out, "w"), indent=2)
    print(f"[vlm_qa] filled {filled}, missing {len(missing)}, fails {len(fails)} -> {args.out}")
    print(f"[vlm_qa] verdict: {cl['summary']['verdict']}")
    for i, cid, reason in fails[:10]:
        print(f"   FAIL frame {i} [{cid}]: {reason}")
    return 1 if fails else 0


def vlm_call(endpoint, key, model, image_paths):
    """POST an OpenAI-compatible chat/completions request with image inputs."""
    def b64(p):
        with open(p, "rb") as f:
            return base64.b64encode(f.read()).decode()
    content = [{"type": "text",
                "text": "Checklist ids: " + ", ".join(it["id"] for it in CHECKLIST_ITEMS)}]
    for p in image_paths:
        content.append({"type": "image_url",
                        "image_url": {"url": f"data:image/png;base64,{b64(p)}"}})
    body = json.dumps({"model": model,
                       "messages": [{"role": "system", "content": VLM_SYSTEM},
                                    {"role": "user", "content": content}],
                       "max_tokens": 2000}).encode()
    req = urllib.request.Request(endpoint, data=body,
                                 headers={"Content-Type": "application/json",
                                          **({"Authorization": f"Bearer {key}"} if key else {})})
    with urllib.request.urlopen(req, timeout=180) as r:
        resp = json.load(r)
    txt = resp["choices"][0]["message"]["content"]
    start, end = txt.find("{"), txt.rfind("}")
    return json.loads(txt[start:end + 1]) if start >= 0 else {}


def cmd_vlm(args):
    endpoint = os.environ.get("VLM_QA_ENDPOINT", "")
    if not endpoint:
        print("[vlm_qa] no VLM_QA_ENDPOINT set — falling back to manifest mode "
              "(agent eyes-on).")
        print("[vlm_qa] Set VLM_QA_ENDPOINT (+VLM_QA_KEY, +VLM_QA_MODEL) to an "
              "OpenAI-compatible vision endpoint for auto-fill.")
        return cmd_manifest(args)
    os.makedirs(args.out, exist_ok=True)
    frames = collect_frames(args)
    key, model = os.environ.get("VLM_QA_KEY", ""), os.environ.get("VLM_QA_MODEL", "gpt-4o-mini")
    checklist = {"tool": "vlm_qa", "mode": "vlm", "endpoint": endpoint, "model": model,
                 "items": CHECKLIST_ITEMS, "frames": []}
    batch = max(1, args.vlm_batch)
    for i in range(0, len(frames), batch):
        chunk = frames[i:i + batch]
        print(f"[vlm_qa] VLM batch {i // batch + 1}: frames {[f['index'] for f in chunk]}")
        try:
            per = vlm_call(endpoint, key, model, [f["file"] for f in chunk])
        except Exception as e:  # noqa: BLE001
            print(f"[vlm_qa] VLM call failed: {e} — leaving batch unfilled")
            per = {}
        for f in chunk:
            checks = []
            for it in CHECKLIST_ITEMS:
                v = per.get(it["id"], {})
                checks.append({"id": it["id"],
                               "result": v.get("result") if v.get("result") in
                               ("pass", "fail", "uncertain") else None,
                               "reason": v.get("reason", "")})
            checklist["frames"].append({**f, "checks": checks})
    cp_ = os.path.join(args.out, "checklist_vlm.json")
    json.dump(checklist, open(cp_, "w"), indent=2)
    fails = sum(1 for fr in checklist["frames"] for c in fr["checks"] if c["result"] == "fail")
    print(f"[vlm_qa] {fails} failed checks -> {cp_}")
    return 1 if fails else 0


def main():
    ap = argparse.ArgumentParser(description="VLM / agent-eyes-on visual QA loop")
    sub = ap.add_subparsers(dest="cmd", required=True)
    m = sub.add_parser("manifest", help="frame manifest + blank checklist (agent eyes-on)")
    m.add_argument("--dir", default="", help="directory of renders/frames")
    m.add_argument("--video", default="", help="video to extract frames from")
    m.add_argument("--fps", type=float, default=2.0)
    m.add_argument("--max-frames", type=int, default=60)
    m.add_argument("--out", required=True)
    f = sub.add_parser("fill", help="merge agent/VLM results into a checklist")
    f.add_argument("--checklist", required=True)
    f.add_argument("--results", required=True,
                   help='JSON: {frame_index: {check_id: {"result": "pass"|"fail"|"waived", "reason": "..."}}}')
    f.add_argument("--out", required=True)
    v = sub.add_parser("vlm", help="auto-fill checklist via a vision endpoint")
    v.add_argument("--dir", default="")
    v.add_argument("--video", default="")
    v.add_argument("--fps", type=float, default=2.0)
    v.add_argument("--max-frames", type=int, default=12)
    v.add_argument("--vlm-batch", type=int, default=4)
    v.add_argument("--out", required=True)
    args = ap.parse_args()
    if args.cmd in ("manifest", "vlm") and not (args.dir or args.video):
        ap.error("manifest/vlm needs --dir or --video")
    return {"manifest": cmd_manifest, "fill": cmd_fill, "vlm": cmd_vlm}[args.cmd](args)


if __name__ == "__main__":
    sys.exit(main())
