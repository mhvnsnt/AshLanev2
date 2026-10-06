#!/usr/bin/env python3
"""video_qa.py — dense frame sampling + MediaPipe pose checks across a WHOLE video.

Law item 2: verify across the whole timeline (dense frame sampling + automated
pose/motion checks), not a handful of stills.

Runs on tools/verify/.venv (needs opencv-python-headless + mediapipe):

    tools/verify/.venv/bin/python tools/verify/video_qa.py --video docs/playtest/gameplay.mp4 \\
        --out /tmp/video_qa.json --sheet /tmp/qa_sheet.png

Checks per segment (scene-cut delimited):
  - person_detected_ratio : MediaPipe Pose finds a person in enough frames
  - head_cutoff           : head landmarks missing / nose at frame edge while body present
  - framing_too_small     : person < 15% of frame height (subject lost in frame)
  - frozen                : near-zero motion for > 2s (dead / stuck render)
  - jitter_spike          : landmark teleport > 50% torso size between samples (glitchy/seizure motion)

Exit code: 0 if every segment passes, 1 if any fails.
"""
import argparse
import json
import math
import os
import shutil
import subprocess
import sys
import urllib.request

try:
    import cv2
    import mediapipe as mp
    import numpy as np
except ImportError as e:  # noqa: F401
    sys.exit("video_qa.py needs the tools/verify venv: "
             "python3 -m venv tools/verify/.venv && "
             "tools/verify/.venv/bin/pip install opencv-python-headless mediapipe")

HERE = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(HERE, "models")
MODEL_URL = ("https://storage.googleapis.com/mediapipe-models/pose_landmarker/"
             "pose_landmarker_full/float16/1/pose_landmarker_full.task")
MODEL_PATH = os.path.join(MODEL_DIR, "pose_landmarker_full.task")

# PoseLandmark indices (MediaPipe 33-landmark topology)
IDX = {"nose": 0, "l_shoulder": 11, "r_shoulder": 12,
       "l_hip": 23, "r_hip": 24, "l_ankle": 27, "r_ankle": 28}
KEY_IDX = [IDX["nose"], IDX["l_shoulder"], IDX["r_shoulder"],
           IDX["l_hip"], IDX["r_hip"], IDX["l_ankle"], IDX["r_ankle"]]


def get_landmarker():
    """Return a PoseLandmarker, downloading the model bundle on first use.
    Returns None if the model cannot be obtained (offline) — QA then runs in
    no-pose mode (sampling, cuts, pixel-diff frozen detection still work)."""
    if not os.path.exists(MODEL_PATH):
        try:
            os.makedirs(MODEL_DIR, exist_ok=True)
            print(f"[video_qa] downloading pose model -> {MODEL_PATH}")
            urllib.request.urlretrieve(MODEL_URL, MODEL_PATH)
        except Exception as e:  # noqa: BLE001
            print(f"[video_qa] WARN: pose model unavailable ({e}) — no-pose mode")
            return None
    try:
        from mediapipe.tasks.python import vision
        from mediapipe.tasks.python.vision.core.vision_task_running_mode import (
            VisionTaskRunningMode)
        base = mp.tasks.BaseOptions(model_asset_path=MODEL_PATH)
        opts = vision.PoseLandmarkerOptions(base_options=base,
                                            running_mode=VisionTaskRunningMode.IMAGE)
        return vision.PoseLandmarker.create_from_options(opts)
    except Exception as e:  # noqa: BLE001
        print(f"[video_qa] WARN: PoseLandmarker init failed ({e}) — no-pose mode")
        return None


def ffprobe(path):
    cmd = ["ffprobe", "-v", "error", "-show_entries",
           "format=duration:stream=width,height,avg_frame_rate,nb_frames",
           "-of", "json", path]
    out = subprocess.run(cmd, capture_output=True, text=True, check=True).stdout
    d = json.loads(out)
    st = d["streams"][0]
    num, den = (int(x) for x in st.get("avg_frame_rate", "30/1").split("/"))
    fps = num / den if den else 30.0
    return {"duration": float(d["format"]["duration"]),
            "width": int(st["width"]), "height": int(st["height"]), "fps": fps}


def scene_cuts(path, threshold=0.35):
    """Return list of scene-cut timestamps (s) via ffmpeg scene filter."""
    cmd = ["ffmpeg", "-hide_banner", "-i", path,
           "-filter:v", f"select='gt(scene,{threshold})',showinfo",
           "-f", "null", "-"]
    r = subprocess.run(cmd, capture_output=True, text=True)
    cuts = []
    for line in r.stderr.splitlines():
        if "pts_time:" in line:
            try:
                cuts.append(float(line.split("pts_time:")[1].split()[0]))
            except (ValueError, IndexError):
                pass
    return sorted(cuts)


def sample_frames(path, target_fps=6.0, max_frames=600):
    """Sample uniformly across the WHOLE timeline (law item 2: not a handful
    of stills from the start). Stride is derived from total frame count so
    max_frames always spans the full duration."""
    info = ffprobe(path)
    cap = cv2.VideoCapture(path)
    total = int(cap.get(cv2.CAP_PROP_FRAME_COUNT)) or int(info["duration"] * info["fps"])
    stride = max(1, total // max_frames)
    frames, ts = [], []
    for fi in range(0, total, stride):
        if len(frames) >= max_frames:
            break
        cap.set(cv2.CAP_PROP_POS_FRAMES, fi)
        ok, img = cap.read()
        if not ok:
            break
        frames.append(cv2.cvtColor(img, cv2.COLOR_BGR2RGB))
        ts.append(fi / info["fps"])
    cap.release()
    return info, np.array(ts), frames


def analyze_frame(landmarker, img):
    """Run MediaPipe pose on one RGB frame. Returns dict of measurements."""
    if landmarker is None:
        return {"present": None}  # no-pose mode: measurement unavailable
    mp_img = mp.Image(image_format=mp.ImageFormat.SRGB, data=np.ascontiguousarray(img))
    res = landmarker.detect(mp_img)
    if not res.pose_landmarks:
        return {"present": False}
    lm = res.pose_landmarks[0]
    h, w = img.shape[:2]
    xs = [lm[k].x * w for k in KEY_IDX]
    ys = [lm[k].y * h for k in KEY_IDX]
    nose = lm[IDX["nose"]]
    sh_l, sh_r = lm[IDX["l_shoulder"]], lm[IDX["r_shoulder"]]
    torso = math.hypot((sh_l.x - sh_r.x) * w, (sh_l.y - sh_r.y) * h)
    vis = {str(k): float(getattr(lm[k], "visibility", 1.0)) for k in KEY_IDX}
    return {
        "present": True,
        "bbox": [min(xs), min(ys), max(xs), max(ys)],
        "person_h_frac": (max(ys) - min(ys)) / h,
        "person_w_frac": (max(xs) - min(xs)) / w,
        "nose_y": nose.y, "nose_vis": float(getattr(nose, "visibility", 1.0)),
        "torso_px": torso, "vis": vis,
        "pts": np.array([[lm[k].x, lm[k].y] for k in KEY_IDX]),
    }


def main():
    ap = argparse.ArgumentParser(description="Dense-frame MediaPipe QA for videos")
    ap.add_argument("--video", required=True)
    ap.add_argument("--target-fps", type=float, default=6.0)
    ap.add_argument("--max-frames", type=int, default=600)
    ap.add_argument("--out", default="", help="JSON report path")
    ap.add_argument("--sheet", default="", help="contact-sheet PNG path")
    args = ap.parse_args()

    info, ts, frames = sample_frames(args.video, args.target_fps, args.max_frames)
    print(f"[video_qa] {args.video}: {info['duration']:.1f}s @ {info['fps']:.1f}fps, "
          f"sampled {len(frames)} frames")

    cuts = scene_cuts(args.video)
    bounds = [0.0] + [c for c in cuts if c < info["duration"]] + [info["duration"]]
    segments, seen = [], set()
    for a, b in zip(bounds, bounds[1:]):
        if b - a < 1.5 and segments:          # merge slivers into previous
            segments[-1][1] = b
        else:
            segments.append([a, b])
    seg_of = lambda t: next(i for i, (a, b) in enumerate(segments) if a <= t <= b + 1e-6)

    landmarker = get_landmarker()
    pose_mode = landmarker is not None
    meas = [analyze_frame(landmarker, f) for f in frames]
    if landmarker is not None:
        landmarker.close()

    # per-frame jitter (keypoint teleport between consecutive samples)
    jitter = [0.0] * len(frames)
    for i in range(1, len(frames)):
        a, b = meas[i - 1], meas[i]
        if a.get("present") and b.get("present") and a["torso_px"] > 1 and b["torso_px"] > 1:
            d = np.linalg.norm((b["pts"] - a["pts"]), axis=1)
            scale = (a["torso_px"] + b["torso_px"]) / 2 / info["width"]
            jitter[i] = float(np.median(d) / max(scale, 1e-6))

    # pixel-diff motion (works in no-pose mode too): mean abs diff, downscaled
    small = [cv2.resize(f, (64, 64)).astype(np.float32) for f in frames]
    pixdiff = [0.0] * len(frames)
    for i in range(1, len(frames)):
        pixdiff[i] = float(np.abs(small[i] - small[i - 1]).mean())

    seg_frames = {}
    for i, m in enumerate(meas):
        seg_frames.setdefault(seg_of(ts[i]), []).append(i)

    results, sheet_imgs = [], []
    for si, (a, b) in enumerate(segments):
        idxs = seg_frames.get(si, [])
        fails, notes = [], []
        n = len(idxs)
        if n == 0:
            results.append({"segment": si, "t0": round(a, 2), "t1": round(b, 2),
                            "frames_sampled": 0, "person_ratio": None,
                            "pose_mode": pose_mode, "result": "warn",
                            "reasons": ["no sampled frames in segment"], "notes": []})
            print(f"  [?] seg {si} [{a:6.1f}-{b:6.1f}s] WARN: no sampled frames in segment")
            continue
        present = sum(1 for i in idxs if meas[i].get("present"))
        pratio = present / n if pose_mode else None
        confident = pose_mode and pratio is not None and pratio >= 0.8
        if pose_mode and pratio < 0.6:
            fails.append(f"person detected in only {pratio:.0%} of frames")
        if pose_mode:
            head_cut = sum(1 for i in idxs
                           if meas[i].get("present") and
                           (meas[i]["nose_y"] < 0.02 or meas[i]["nose_vis"] < 0.3))
            msg = f"head cut off / missing in {head_cut}/{n} frames"
            if head_cut / n > 0.25:
                (fails if confident else notes).append(
                    msg if confident else f"UNCERTAIN (low detection): {msg}")
            small = sum(1 for i in idxs
                        if meas[i].get("present") and meas[i]["person_h_frac"] < 0.15)
            msg = f"subject tiny in frame ({small}/{n} frames <15% height)"
            if small / n > 0.5:
                (fails if confident else notes).append(
                    msg if confident else f"UNCERTAIN (low detection): {msg}")
        else:
            notes.append("pose model unavailable — person/framing checks skipped (no-pose mode)")
        # frozen: near-zero motion across a long run (keypoint jitter, else pixel diff)
        motion = ([jitter[i] for i in idxs] if pose_mode else [pixdiff[i] for i in idxs])
        frozen_eps = 0.002 if pose_mode else 0.6
        frozen_runs, run = 0, 0
        for v in motion:
            if v < frozen_eps:
                run += 1
            else:
                frozen_runs = max(frozen_runs, run)
                run = 0
        frozen_runs = max(frozen_runs, run)
        dt = (ts[idxs[-1]] - ts[idxs[0]]) / max(n - 1, 1)
        if frozen_runs * dt > 2.0 and n > 4:
            fails.append(f"frozen segment: ~{frozen_runs * dt:.1f}s with no motion")
        if pose_mode:
            spikes = sum(1 for i in idxs if jitter[i] > 0.5)
            if spikes / n > 0.15:
                fails.append(f"jitter spikes in {spikes}/{n} frames (glitchy teleport motion)")
            notes.append(f"avg jitter {np.mean([jitter[i] for i in idxs]):.3f} torso-units")
        else:
            notes.append(f"avg pixel-diff {np.mean([pixdiff[i] for i in idxs]):.2f}")
        results.append({
            "segment": si, "t0": round(a, 2), "t1": round(b, 2),
            "frames_sampled": n,
            "person_ratio": round(pratio, 3) if pratio is not None else None,
            "pose_mode": pose_mode,
            "result": "fail" if fails else "pass",
            "reasons": fails, "notes": notes,
        })
        status = "FAIL" if fails else "PASS"
        print(f"  [{'✗' if fails else '✓'}] seg {si} [{a:6.1f}-{b:6.1f}s] {status}: "
              f"{'; '.join(fails) if fails else notes[0]}")
        if args.sheet:
            mid = idxs[len(idxs) // 2]
            img = frames[mid].copy()
            m = meas[mid]
            if m.get("present"):
                x0, y0, x1, y1 = (int(v) for v in m["bbox"])
                cv2.rectangle(img, (x0, y0), (x1, y1),
                              (0, 255, 0) if not fails else (255, 0, 0), 3)
            cv2.putText(img, f"seg{si} {status}", (20, 40),
                        cv2.FONT_HERSHEY_SIMPLEX, 1.2,
                        (0, 255, 0) if not fails else (255, 0, 0), 3)
            sheet_imgs.append(cv2.resize(img, (320, int(320 * img.shape[0] / img.shape[1]))))

    report = {"tool": "video_qa", "video": args.video, "info": info,
              "pose_mode": pose_mode,
              "scene_cuts": [round(c, 2) for c in cuts],
              "frames_sampled": len(frames),
              "segments": results,
              "verdict": "FAIL" if any(r["result"] == "fail" for r in results) else "PASS"}
    if args.out:
        with open(args.out, "w") as f:
            json.dump(report, f, indent=2)
        print(f"[video_qa] report -> {args.out}")
    if args.sheet and sheet_imgs:
        cols = 4
        rows = (len(sheet_imgs) + cols - 1) // cols
        hh, ww = sheet_imgs[0].shape[:2]
        sheet = np.zeros((rows * hh, cols * ww, 3), np.uint8)
        for i, im in enumerate(sheet_imgs):
            sheet[(i // cols) * hh:(i // cols + 1) * hh,
                  (i % cols) * ww:(i % cols + 1) * ww] = im
        cv2.imwrite(args.sheet, cv2.cvtColor(sheet, cv2.COLOR_RGB2BGR))
        print(f"[video_qa] contact sheet -> {args.sheet}")
    print(f"[video_qa] verdict: {report['verdict']} "
          f"({len(frames)} frames across {len(results)} segments)")
    return 1 if report["verdict"] == "FAIL" else 0


if __name__ == "__main__":
    sys.exit(main())
