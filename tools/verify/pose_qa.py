#!/usr/bin/env python3
"""pose_qa.py — MediaPipe Pose automated QA gate for model renders (still images).

The verification gate for character renders: scans every PNG/JPG in a directory
with MediaPipe Pose (Apache-2.0, CPU, local .task bundle — no network, no key)
and flags broken poses:

  no_person        — no pose detected (empty render / wrong framing)
  head_cutoff      — nose/eyes above the frame top (head cut off)
  feet_cutoff      — ankles at/below the frame bottom (feet cut off; the T-pose
                     framing law requires full arm reach AND feet in frame)
  knee_collapse    — knee angle far from straight on a standing pose
  elbow_asymmetry  — L/R elbow angles differ badly (broken arm / bad retarget)
  shoulder_tilt    — shoulders tilted beyond threshold (broken spine / bad pose)
  upside_down      — head below hips (inverted render)

Usage:
  tools/verify/.venv/bin/python tools/verify/pose_qa.py \
      --dir docs/art-refs/glb-renders --out /tmp/pose_qa.json

Exit code: 0 if every image PASSes, 1 if any image is FLAGged (gate semantics —
wire into CI / the eyes_on_gate evidence bundle).
"""
import argparse
import json
import math
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)

try:
    import cv2
    import numpy as np
except ImportError:
    sys.exit("pose_qa.py needs the tools/verify venv: "
             "tools/verify/.venv/bin/python tools/verify/pose_qa.py ...")

from video_qa import get_landmarker  # noqa: E402  (shared PoseLandmarker loader)

# MediaPipe 33-landmark indices
NOSE, L_EYE, R_EYE = 0, 2, 5
L_SH, R_SH = 11, 12
L_EL, R_EL = 13, 14
L_WR, R_WR = 15, 16
L_HIP, R_HIP = 23, 24
L_KNEE, R_KNEE = 25, 26
L_ANK, R_ANK = 27, 28


def angle_deg(a, b, c):
    """Angle at b between segments b->a and b->c, in degrees."""
    v1 = (a[0] - b[0], a[1] - b[1])
    v2 = (c[0] - b[0], c[1] - b[1])
    n1 = math.hypot(*v1) or 1e-9
    n2 = math.hypot(*v2) or 1e-9
    cosv = max(-1.0, min(1.0, (v1[0] * v2[0] + v1[1] * v2[1]) / (n1 * n2)))
    return math.degrees(math.acos(cosv))


def check_image(landmarker, path, opts):
    img = cv2.imread(path)
    if img is None:
        return {"file": os.path.basename(path), "verdict": "FLAG",
                "reasons": ["unreadable_image"], "metrics": {}}
    rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    import mediapipe as mp
    mp_img = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb)
    res = landmarker.detect(mp_img)
    h, w = img.shape[:2]
    name = os.path.basename(path)

    if not res.pose_landmarks:
        return {"file": name, "verdict": "FLAG", "reasons": ["no_person"],
                "metrics": {}}
    lm = res.pose_landmarks[0]
    vis = np.mean([p.visibility for p in lm])
    if vis < 0.35:
        return {"file": name, "verdict": "FLAG",
                "reasons": [f"low_visibility_{vis:.2f}"], "metrics": {"visibility": round(vis, 3)}}

    P = lambda i: (lm[i].x, lm[i].y)  # normalized 0..1, y down
    V = lambda i: lm[i].visibility
    reasons = []
    m = {"visibility": round(float(vis), 3)}

    # head cutoff: nose/eyes near or above top edge
    head_y = min(P(NOSE)[1], P(L_EYE)[1], P(R_EYE)[1])
    m["head_top_y"] = round(float(head_y), 3)
    if head_y < 0.015:
        reasons.append("head_cutoff")

    # feet cutoff: ankles at/below bottom edge (feet below ground / out of frame)
    ank_y = max(P(L_ANK)[1], P(R_ANK)[1]) if V(L_ANK) > 0.3 and V(R_ANK) > 0.3 else None
    if ank_y is None:
        reasons.append("feet_not_detected")
    else:
        m["ankle_bottom_y"] = round(float(ank_y), 3)
        if ank_y > 0.985:
            reasons.append("feet_cutoff")

    # upside-down sanity
    if P(NOSE)[1] > P(L_HIP)[1] and P(NOSE)[1] > P(R_HIP)[1]:
        reasons.append("upside_down")

    # shoulder tilt — modulo 180: MediaPipe labels from the subject's
    # perspective, so a front-facing render reads ~180° when level.
    # Skipped for profile views (shoulders vertically aligned in 2D).
    shoulder_span_x = abs(P(R_SH)[0] - P(L_SH)[0])
    m["shoulder_span_x"] = round(float(shoulder_span_x), 3)
    if shoulder_span_x < 0.08:
        m["shoulder_tilt_deg"] = None  # profile view — tilt meaningless
    else:
        raw_tilt = abs(math.degrees(math.atan2(P(R_SH)[1] - P(L_SH)[1],
                                               P(R_SH)[0] - P(L_SH)[0])))
        tilt = min(raw_tilt, 180.0 - raw_tilt)
        m["shoulder_tilt_deg"] = round(float(tilt), 1)
        if tilt > opts.tilt_deg:
            reasons.append(f"shoulder_tilt_{tilt:.1f}deg")

    # knee angles (straight leg ~= 180). Only gated in tpose mode —
    # action/street renders legitimately bend knees.
    if V(L_KNEE) > 0.3 and V(R_KNEE) > 0.3:
        kl = angle_deg(P(L_HIP), P(L_KNEE), P(L_ANK))
        kr = angle_deg(P(R_HIP), P(R_KNEE), P(R_ANK))
        m["knee_l_deg"] = round(kl, 1)
        m["knee_r_deg"] = round(kr, 1)
        if opts.pose_mode == "tpose" and min(kl, kr) < opts.knee_min_deg:
            reasons.append(f"knee_collapse_L{kl:.0f}_R{kr:.0f}")

    # elbow angles + L/R asymmetry (tpose mode only — action poses bend arms)
    if all(V(i) > 0.3 for i in (L_SH, L_EL, L_WR, R_SH, R_EL, R_WR)):
        el = angle_deg(P(L_SH), P(L_EL), P(L_WR))
        er = angle_deg(P(R_SH), P(R_EL), P(R_WR))
        m["elbow_l_deg"] = round(el, 1)
        m["elbow_r_deg"] = round(er, 1)
        if opts.pose_mode == "tpose" and abs(el - er) > opts.elbow_asym_deg:
            reasons.append(f"elbow_asymmetry_L{el:.0f}_R{er:.0f}")

    return {"file": name,
            "verdict": "FLAG" if reasons else "PASS",
            "reasons": reasons, "metrics": m}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dir", help="directory of render images")
    ap.add_argument("--images", nargs="*", help="explicit image files")
    ap.add_argument("--out", required=True, help="JSON report path")
    ap.add_argument("--tilt-deg", type=float, default=10.0)
    ap.add_argument("--knee-min-deg", type=float, default=150.0)
    ap.add_argument("--elbow-asym-deg", type=float, default=25.0)
    ap.add_argument("--pose-mode", choices=["tpose", "action"], default="tpose",
                    help="tpose: full joint gates for reference renders; "
                         "action: only framing/person gates for street/action shots")
    opts = ap.parse_args()

    files = []
    if opts.dir:
        for f in sorted(os.listdir(opts.dir)):
            if f.lower().endswith((".png", ".jpg", ".jpeg", ".webp")):
                files.append(os.path.join(opts.dir, f))
    files += opts.images or []
    if not files:
        sys.exit("pose_qa: no images found")

    landmarker = get_landmarker()
    if landmarker is None:
        sys.exit("pose_qa: pose model unavailable (offline?) — failing closed")

    results = [check_image(landmarker, f, opts) for f in files]
    flagged = [r for r in results if r["verdict"] == "FLAG"]
    report = {"tool": "pose_qa", "images": len(results),
              "passed": len(results) - len(flagged),
              "flagged": len(flagged), "results": results}
    with open(opts.out, "w") as fh:
        json.dump(report, fh, indent=2)
    print(f"pose_qa: {report['passed']}/{report['images']} PASS, "
          f"{report['flagged']} FLAGged -> {opts.out}")
    for r in flagged:
        print(f"  FLAG {r['file']}: {', '.join(r['reasons'])}")
    sys.exit(1 if flagged else 0)


if __name__ == "__main__":
    main()
