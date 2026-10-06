#!/usr/bin/env python3
"""
video-qa.py — Automated defect gates for promo renders.

Checks EVERY sampled frame (default every 2nd frame) for:
  1. ground    — characters sunk through the floor (upper body visible, feet occluded)
  2. crabwalk  — facing direction vs movement direction disagree >30 deg sustained
  3. geometry  — exploded/ribbon limbs (segment length spikes vs running median)
  4. frozen    — video segments with ~zero pixel change (frozen-splash class bug)

Usage:
  video-qa.py --frames <dir> [--pattern f_%05d.png] [--out <report_dir>]
              [--sample 2] [--fps 24]
  video-qa.py --video <file.mp4> [same opts]

Output: report.json + REPORT.md + fail_*.png in <out>.
Exit code: 0 = PASS, 1 = FAIL, 2 = usage/runtime error.
"""
import argparse, json, math, os, shutil, subprocess, sys, tempfile
from collections import defaultdict, deque

import numpy as np

# ---------------------------------------------------------------- constants
NOSE, L_SH, R_SH = 0, 11, 12
L_ELB, R_ELB, L_WR, R_WR = 13, 14, 15, 16
L_HIP, R_HIP, L_KNEE, R_KNEE = 23, 24, 25, 26
L_ANK, R_ANK = 27, 28
UPPER_LM = (NOSE, L_SH, R_SH, L_HIP, R_HIP)
ANKLE_LM = (L_ANK, R_ANK, 29, 30, 31, 32)

LIMBS = {
    "upperarm_l": (L_SH, L_ELB), "upperarm_r": (R_SH, R_ELB),
    "forearm_l": (L_ELB, L_WR),  "forearm_r": (R_ELB, R_WR),
    "thigh_l": (L_HIP, L_KNEE),  "thigh_r": (R_HIP, R_KNEE),
    "shin_l": (L_KNEE, L_ANK),   "shin_r": (R_KNEE, R_ANK),
    "torso_l": (L_SH, L_HIP),    "torso_r": (R_SH, R_HIP),
}

CRAB_ANGLE_DEG = 30.0
CRAB_SUSTAIN_FRAMES = 12          # consecutive sampled frames (~1s at sample=2)
GEO_SPIKE_RATIO = 2.5
FROZEN_DIFF_THRESH = 1.0          # mean abs diff of 0..255 grayscale
FROZEN_MIN_SEC = 3.0
SUNK_WINDOW_SEC = 2.0
SUNK_FRAC_THRESH = 0.30


def fail(msg):
    print(f"video-qa: {msg}", file=sys.stderr)
    sys.exit(2)


# ---------------------------------------------------------------- frame source
def iter_frames(args):
    """Yield (index, bgr ndarray)."""
    import cv2
    if args.video:
        tmp = tempfile.mkdtemp(prefix="videoqa_")
        args._tmp = tmp
        r = subprocess.run(
            ["ffmpeg", "-y", "-v", "error", "-i", args.video,
             os.path.join(tmp, "f_%05d.png")],
            capture_output=True, text=True)
        if r.returncode != 0:
            fail(f"ffmpeg extract failed: {r.stderr[:300]}")
        frames_dir, pattern = tmp, "f_%05d.png"
    else:
        frames_dir, pattern = args.frames, args.pattern
    files = sorted(f for f in os.listdir(frames_dir)
                   if f.endswith(".png") and f.startswith(pattern.split("%")[0]))
    if not files:
        fail(f"no frames matching {pattern} in {frames_dir}")
    idx = 0
    for f in files:
        img = cv2.imread(os.path.join(frames_dir, f))
        if img is None:
            continue
        if idx % args.sample == 0:
            yield idx, img
        idx += 1


# ---------------------------------------------------------------- pose
class PoseBank:
    """MediaPipe PoseLandmarker (tasks API), up to 5 people per frame."""

    MODEL = os.path.join(os.path.dirname(os.path.abspath(__file__)),
                         "pose_landmarker_full.task")
    MODEL_URL = ("https://storage.googleapis.com/mediapipe-models/pose_landmarker/"
                 "pose_landmarker_full/float16/1/pose_landmarker_full.task")

    def __init__(self):
        from mediapipe.tasks.python import vision as mp_vision
        from mediapipe.tasks.python import BaseOptions
        if not os.path.exists(self.MODEL):
            print(f"video-qa: downloading pose model (~10MB)...", file=sys.stderr)
            import urllib.request
            try:
                urllib.request.urlretrieve(self.MODEL_URL, self.MODEL)
            except Exception as e:
                fail(f"pose model download failed: {e} — manually place "
                     f"pose_landmarker_full.task next to video-qa.py "
                     f"(from {self.MODEL_URL})")
        opts = mp_vision.PoseLandmarkerOptions(
            base_options=BaseOptions(model_asset_path=self.MODEL),
            running_mode=mp_vision.RunningMode.IMAGE,
            num_poses=5,
            min_pose_detection_confidence=0.3,
            min_pose_presence_confidence=0.3,
            min_tracking_confidence=0.3)
        self._mp = __import__("mediapipe")
        self.landmarker = mp_vision.PoseLandmarker.create_from_options(opts)

    def detect(self, bgr):
        """Return list of dicts: {'xy': (33,2) norm, 'vis': (33,), 'conf': float}.

        Multi-scale: full frame + 1.5x center crop (catches small/dark figures
        the full-frame pass misses). Deduplicated by nose proximity.
        """
        import cv2
        h, w = bgr.shape[:2]
        views = [(bgr, 0, 0, 1, 1)]  # (img, x0, y0, x1, y1) in full-frame norm
        cx0, cy0 = int(w * 0.2), int(h * 0.2)
        crop = bgr[cy0:cy0 + int(h * 0.6), cx0:cx0 + int(w * 0.6)]
        crop = cv2.resize(crop, None, fx=1.5, fy=1.5,
                          interpolation=cv2.INTER_CUBIC)
        views.append((crop, 0.2, 0.2, 0.8, 0.8))

        out = []
        for view, vx0, vy0, vx1, vy1 in views:
            mp_image = self._mp.Image(
                image_format=self._mp.ImageFormat.SRGB,
                data=cv2.cvtColor(view, cv2.COLOR_BGR2RGB))
            res = self.landmarker.detect(mp_image)
            for lms in (res.pose_landmarks or []):
                xy = np.zeros((33, 2)); vis = np.zeros(33)
                for i, p in enumerate(lms[:33]):
                    # map view-local norm coords back to full-frame norm coords
                    xy[i, 0] = vx0 + p.x * (vx1 - vx0)
                    xy[i, 1] = vy0 + p.y * (vy1 - vy0)
                    vis[i] = getattr(p, "visibility", 1.0) or 0.0
                conf = float(np.mean(vis[list(UPPER_LM)]))
                out.append({"xy": xy, "vis": vis, "conf": conf})
        # dedupe by nose proximity, keep highest-confidence
        uniq = []
        for d in sorted(out, key=lambda d: -d["conf"]):
            if all(np.linalg.norm(d["xy"][NOSE] - u["xy"][NOSE]) > 0.06
                   for u in uniq):
                uniq.append(d)
        return uniq


# ---------------------------------------------------------------- trackers
class Track:
    def __init__(self, tid):
        self.id = tid
        self.hip_hist = deque(maxlen=CRAB_SUSTAIN_FRAMES + 8)
        self.face_hist = deque(maxlen=CRAB_SUSTAIN_FRAMES + 8)
        self.crab_streak = 0
        self.crab_flagged = False
        self.limb_meds = {}   # name -> running median
        self.limb_n = defaultdict(int)

    def update_limbs(self, d):
        for name, (a, b) in LIMBS.items():
            if d["vis"][a] < 0.4 or d["vis"][b] < 0.4:
                continue
            L = float(np.linalg.norm(d["xy"][a] - d["xy"][b]))
            n = self.limb_n[name]
            med = self.limb_meds.get(name, L)
            # incremental median approx via running mean of order stats is overkill;
            # use exponential moving median-ish: slow adapt
            self.limb_meds[name] = med + 0.05 * (L - med) if n > 10 else L
            self.limb_n[name] = n + 1


def match_tracks(tracks, dets, next_id):
    """Greedy match detections to tracks by hip proximity."""
    used, pairs = set(), []
    for di, d in enumerate(dets):
        hip = (d["xy"][L_HIP] + d["xy"][R_HIP]) / 2
        best, bestd = None, 0.15
        for t in tracks:
            if t.id in used or not t.hip_hist:
                continue
            dist = float(np.linalg.norm(hip - t.hip_hist[-1]))
            if dist < bestd:
                best, bestd = t, dist
        if best:
            used.add(best.id)
            pairs.append((best, d))
        else:
            t = Track(next_id[0]); next_id[0] += 1
            tracks.append(t)
            pairs.append((t, d))
    return pairs

# ---------------------------------------------------------------- checks (part 2)
def facing_vector(d):
    """Screen-space facing unit vector from shoulders, oriented by nose."""
    sh = d["xy"][R_SH] - d["xy"][L_SH]
    n = np.linalg.norm(sh)
    if n < 1e-6:
        return None
    perp = np.array([-sh[1], sh[0]]) / n
    nose = d["xy"][NOSE] - (d["xy"][L_SH] + d["xy"][R_SH]) / 2
    if float(np.dot(perp, nose)) < 0:
        perp = -perp
    return perp


def check_crab(track, d, t, failures):
    """Flag sustained >30deg disagreement between facing and motion."""
    hip = (d["xy"][L_HIP] + d["xy"][R_HIP]) / 2
    face = facing_vector(d)
    if face is None or d["vis"][L_HIP] < 0.4 or d["vis"][R_HIP] < 0.4:
        track.hip_hist.append(hip); track.face_hist.append(None)
        return
    track.hip_hist.append(hip); track.face_hist.append(face)
    if len(track.hip_hist) < 6:
        return
    motion = track.hip_hist[-1] - track.hip_hist[-6]
    speed = float(np.linalg.norm(motion))
    if speed < 0.008:          # stationary — facing is free
        track.crab_streak = 0
        return
    mv = motion / speed
    cosang = float(np.clip(np.dot(face, mv), -1, 1))
    ang = math.degrees(math.acos(cosang))
    if ang > CRAB_ANGLE_DEG:
        track.crab_streak += 1
    else:
        track.crab_streak = 0
    if track.crab_streak >= CRAB_SUSTAIN_FRAMES and not track.crab_flagged:
        track.crab_flagged = True
        failures.append({"t": round(t, 2), "track": track.id, "angle_deg": round(ang, 1),
                         "detail": f"facing vs motion {ang:.0f}deg sustained"})


def check_geometry(track, d, t, frame_idx, failures):
    """Flag limb-length spikes vs running median (ribbon/exploded geometry)."""
    spiked = False
    for name, (a, b) in LIMBS.items():
        if d["vis"][a] < 0.4 or d["vis"][b] < 0.4:
            continue
        L = float(np.linalg.norm(d["xy"][a] - d["xy"][b]))
        med = track.limb_meds.get(name)
        n = track.limb_n[name]
        if med and n > 10 and med > 0.01 and L > med * GEO_SPIKE_RATIO:
            failures.append({"t": round(t, 2), "frame": frame_idx, "track": track.id,
                             "limb": name,
                             "detail": f"{name} {L:.3f} vs median {med:.3f} "
                                       f"({L/med:.1f}x)"})
            spiked = True
    if not spiked:
        # only adapt medians on clean frames — spikes must not poison them
        track.update_limbs(d)


def check_ground(d, t, frame_idx):
    """Sunk heuristic: head+shoulders present, hips detected (body should
    continue below), but ankles/feet missing -> sunk through the floor."""
    vis = d["vis"]
    head_sh = float(np.mean(vis[[NOSE, L_SH, R_SH]]))
    hips = float(np.mean(vis[[L_HIP, R_HIP]]))
    ank = float(np.mean(vis[list(ANKLE_LM)]))
    if head_sh > 0.7 and hips > 0.5 and ank < 0.3:
        return {"t": round(t, 2), "frame": frame_idx,
                "detail": f"head/shoulder vis {head_sh:.2f}, hip vis {hips:.2f}, "
                          f"ankle vis {ank:.2f} — feet missing below frame "
                          f"(sunk through floor?)"}
    return None


# ---------------------------------------------------------------- main
def main():
    ap = argparse.ArgumentParser()
    src = ap.add_mutually_exclusive_group(required=True)
    src.add_argument("--frames")
    src.add_argument("--video")
    ap.add_argument("--pattern", default="f_%05d.png")
    ap.add_argument("--out", required=True)
    ap.add_argument("--sample", type=int, default=2)
    ap.add_argument("--fps", type=float, default=24)
    ap.add_argument("--allow-frozen", default="",
                    help="comma-separated t0-t1 ranges (seconds) where a static "
                         "image is intentional, e.g. '0-5,46-50'")
    args = ap.parse_args()
    args._tmp = None

    # parse intentional-frozen windows
    allow = []
    for part in args.allow_frozen.split(","):
        part = part.strip()
        if part and "-" in part:
            a, b = part.split("-", 1)
            allow.append((float(a), float(b)))

    def frozen_allowed(t0, t1):
        return any(a <= t0 and t1 <= b for a, b in allow)

    os.makedirs(args.out, exist_ok=True)
    import cv2

    bank = PoseBank()
    tracks, next_id = [], [0]
    ground_hits, crab_hits, geo_hits = [], [], []
    frozen_runs, fail_imgs = [], []
    prev_small, frozen_start, frozen_len = None, None, 0
    n_checked, saved = 0, set()
    n_with_person = 0

    def save_fail(tag, idx, img):
        key = (tag, idx)
        if key in saved:
            return None
        saved.add(key)
        p = os.path.join(args.out, f"fail_{tag}_f{idx:05d}.png")
        cv2.imwrite(p, img)
        return os.path.basename(p)

    for idx, img in iter_frames(args):
        t = idx / args.fps
        n_checked += 1

        # --- frozen check (cheap, full sampled stream)
        small = cv2.resize(cv2.cvtColor(img, cv2.COLOR_BGR2GRAY), (160, 90))
        if prev_small is not None:
            diff = float(np.mean(cv2.absdiff(small, prev_small)))
            if diff < FROZEN_DIFF_THRESH:
                if frozen_start is None:
                    frozen_start, frozen_len = t, 1
                else:
                    frozen_len += 1
            else:
                if frozen_start is not None and \
                   frozen_len * args.sample / args.fps >= FROZEN_MIN_SEC:
                    t1 = t
                    if not frozen_allowed(frozen_start, t1):
                        frozen_runs.append(
                            {"t0": round(frozen_start, 2),
                             "t1": round(t1, 2),
                             "detail": f"~zero pixel change for "
                                       f"{frozen_len * args.sample / args.fps:.1f}s"})
                        save_fail("frozen", idx, img)
                frozen_start, frozen_len = None, 0
        prev_small = small

        # --- pose checks
        dets = bank.detect(img)
        if dets:
            n_with_person += 1
        for track, d in match_tracks(tracks, dets, next_id):
            g = check_ground(d, t, idx)
            if g:
                g["track"] = track.id
                g["img"] = save_fail("ground", idx, img)
                ground_hits.append(g)
            check_crab(track, d, t, crab_hits)
            check_geometry(track, d, t, idx, geo_hits)
        # attach failure images for crab/geo (first occurrence per track)
        for h in crab_hits:
            if "img" not in h:
                h["img"] = save_fail("crab", int(h["t"] * args.fps), img)
                h["frame"] = int(h["t"] * args.fps)
        for h in geo_hits:
            if "img" not in h:
                h["img"] = save_fail("geo", h["frame"], img)

    # trailing frozen run
    if frozen_start is not None and \
       frozen_len * args.sample / args.fps >= FROZEN_MIN_SEC:
        t1 = idx / args.fps
        if not frozen_allowed(frozen_start, t1):
            frozen_runs.append({"t0": round(frozen_start, 2),
                                "t1": round(t1, 2),
                                "detail": "trailing frozen segment"})

    # --- aggregate sunk: fail if >30% of a 2s window has sunk persons
    ground_fail = []
    if ground_hits:
        times = sorted(h["t"] for h in ground_hits)
        flagged = []
        for t0 in np.arange(0, (times[-1] if times else 0) + 0.5, 0.5):
            win = [x for x in times if t0 <= x < t0 + SUNK_WINDOW_SEC]
            # expected samples in window:
            exp = SUNK_WINDOW_SEC * args.fps / args.sample
            if len(win) / exp >= SUNK_FRAC_THRESH:
                flagged.append(round(float(t0), 1))
        # compress consecutive windows into ranges
        ranges = []
        for t0 in flagged:
            if ranges and t0 - ranges[-1][1] <= 0.6:
                ranges[-1][1] = t0
            else:
                ranges.append([t0, t0])
        rstr = ", ".join(f"{a:.1f}-{b:.1f}" if a != b else f"{a:.1f}"
                         for a, b in ranges)
        if flagged:
            ground_fail = {"windows_sec": rstr, "hits": len(ground_hits)}

    checks = {
        "ground": {"status": "FAIL" if ground_fail else "PASS",
                   "failures": ground_hits[:50],
                   "summary": ground_fail or "no sunk persons detected"},
        "crabwalk": {"status": "FAIL" if crab_hits else "PASS",
                     "failures": crab_hits[:50],
                     "summary": f"{len(crab_hits)} sustained crab-walk events"
                                if crab_hits else "facing matches motion"},
        "geometry": {"status": "FAIL" if geo_hits else "PASS",
                     "failures": geo_hits[:50],
                     "summary": f"{len(geo_hits)} limb-spike events"
                                if geo_hits else "no exploded geometry"},
        "frozen": {"status": "FAIL" if frozen_runs else "PASS",
                   "failures": frozen_runs,
                   "summary": f"{len(frozen_runs)} frozen segments"
                              if frozen_runs else "no frozen segments"},
    }
    overall = "FAIL" if any(c["status"] == "FAIL" for c in checks.values()) else "PASS"
    det_rate = n_with_person / max(n_checked, 1)
    coverage_note = (f"pose detected in {n_with_person}/{n_checked} sampled "
                     f"frames ({det_rate:.0%})")
    if det_rate < 0.5:
        coverage_note += " — WARNING: sparse detection, manual review advised"
    report = {"input": args.video or args.frames, "frames_checked": n_checked,
              "sample": args.sample, "fps": args.fps,
              "persons_tracked": len(tracks),
              "detection_coverage": coverage_note,
              "checks": checks, "overall": overall}
    with open(os.path.join(args.out, "report.json"), "w") as f:
        json.dump(report, f, indent=1)

    lines = [f"# Video QA report — {overall}",
             f"input: `{report['input']}` | frames checked: {n_checked} "
             f"(every {args.sample}) | persons tracked: {len(tracks)}",
             coverage_note, ""]
    for name, c in checks.items():
        lines.append(f"## {name}: {c['status']}")
        lines.append(f"{c['summary']}")
        for fl in c["failures"][:20]:
            img = f" ![]({fl['img']})" if fl.get("img") else ""
            lines.append(f"- t={fl.get('t', fl.get('t0', '?'))}s "
                         f"track={fl.get('track', '-')} {fl.get('detail', '')}{img}")
        lines.append("")
    with open(os.path.join(args.out, "REPORT.md"), "w") as f:
        f.write("\n".join(lines))

    print(f"video-qa: {overall} "
          f"(ground={checks['ground']['status']} "
          f"crabwalk={checks['crabwalk']['status']} "
          f"geometry={checks['geometry']['status']} "
          f"frozen={checks['frozen']['status']}) "
          f"report: {args.out}/REPORT.md")
    if args._tmp:
        shutil.rmtree(args._tmp, ignore_errors=True)
    sys.exit(0 if overall == "PASS" else 1)


if __name__ == "__main__":
    main()
