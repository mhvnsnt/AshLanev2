#!/usr/bin/env python3
"""Visual proof renders: FK stick-figure strips for every clip.

Each PNG shows N evenly-spaced frames (front + side view) so a human can
SEE T-pose contamination, ballerina limbs, foot skate, and pops — no guessing.

Uses canonical.canonical_offsets: the cast GLB node offsets do not form an
anatomical figure, so proofs remap onto a standing skeleton while keeping
every bone's true animated orientation.
"""
import os
import sys
import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import qnormalize, IDENTITY_Q
from validate import _bone_frames, resample_vec
from canonical import (canonical_definition, world_deltas,
                       fk_world_deltas)
from skeletons import from_canonical

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

TARGET_FAMILY = "mixamo-colon"

# canonical bone chains for the stick figure
CHAINS = {
    "spine": ["Hips", "Spine", "Spine1", "Spine2", "Neck", "Head"],
    "armL": ["Spine2", "LeftShoulder", "LeftArm", "LeftForeArm", "LeftHand"],
    "armR": ["Spine2", "RightShoulder", "RightArm", "RightForeArm", "RightHand"],
    "legL": ["Hips", "LeftUpLeg", "LeftLeg", "LeftFoot", "LeftToeBase"],
    "legR": ["Hips", "RightUpLeg", "RightLeg", "RightFoot", "RightToeBase"],
}
COLORS = {"spine": "#e4572e", "armL": "#4d9de0", "armR": "#4d9de0",
          "legL": "#7bc96f", "legR": "#7bc96f"}


def _pose_at(anim, skel, bones, fi, root_pos, canon):
    parents, offsets = canon
    lq = {}
    for b in skel["names"]:
        if b in bones:
            lq[b] = bones[b][fi]
        else:
            lq[b] = skel["rest_quat"][b]
    wd = world_deltas(skel, lq)
    return fk_world_deltas(parents, offsets, wd, root_pos)


def render_proof(anim, skel, out_path, title="", nframes=8):
    """Render a front+side stick-figure strip. Returns out_path."""
    times, bones = _bone_frames(anim, skel)
    n = len(times)
    if n == 0:
        return None
    idx = np.linspace(0, n - 1, min(nframes, n)).astype(int)

    root_track = None
    for ch in anim["channels"]:
        if ch["path"] == "translation" and ch["bone"] == "mixamorig:Hips":
            root_track = ch
            break
    rv = None
    if root_track is not None:
        _, rv = resample_vec(root_track["times"],
                             root_track["values"].reshape(-1, 3))

    chains = {}
    for key, slots in CHAINS.items():
        bn = [from_canonical(s, TARGET_FAMILY) for s in slots]
        if all(b in skel["rest_quat"] for b in bn):
            chains[key] = bn

    # canonical skeleton: world-delta motion on a standing figure
    # (cast GLB node offsets do not form an anatomical skeleton)
    parents, offsets, _ = canonical_definition(skel, "mixamo-colon")
    canon = (parents, offsets)

    fig, axes = plt.subplots(2, len(idx),
                             figsize=(2.2 * len(idx), 4.6),
                             squeeze=False)
    allpts = []
    poses = []
    for fi in idx:
        rp = np.zeros(3)
        if rv is not None:
            rp = rv[min(fi, len(rv) - 1)]
        wp = _pose_at(anim, skel, bones, fi, rp, canon)
        hips = wp.get("mixamorig:Hips", np.zeros(3))
        c = np.array([hips[0], 0, hips[2]])
        wpc = {k: v - c for k, v in wp.items()}
        poses.append(wpc)
        for bname in chains.get("spine", []):
            allpts.append(wpc[bname])
    allpts = np.array(allpts)
    xymin = allpts.min(axis=0)
    xymax = allpts.max(axis=0)

    for col, (fi, wpc) in enumerate(zip(idx, poses)):
        for row, (xi, title_ax) in enumerate([(0, "front (X)"),
                                              (2, "side (Z)")]):
            ax = axes[row][col]
            for key, bn in chains.items():
                xs = [wpc[b][xi] for b in bn]
                ys = [wpc[b][1] for b in bn]
                ax.plot(xs, ys, "-o", color=COLORS[key], ms=3, lw=2)
            ax.axhline(0, color="#555", lw=1)
            ax.set_aspect("equal")
            ax.set_xlim(xymin[xi] - 0.25, xymax[xi] + 0.25)
            ax.set_ylim(-0.1, max(2.0, xymax[1] + 0.25))
            ax.set_xticks([])
            ax.set_yticks([])
            if col == 0:
                ax.set_ylabel(title_ax, fontsize=8, color="#aaa")
            ax.set_title(f"t={times[fi]:.2f}s", fontsize=7, color="#888")
            ax.set_facecolor("#14100d")
    for ax in axes.ravel():
        for s in ax.spines.values():
            s.set_color("#333")
    fig.suptitle(title, fontsize=10, color="#f0ead9")
    fig.patch.set_facecolor("#0d0b09")
    fig.tight_layout()
    fig.savefig(out_path, dpi=90, facecolor=fig.get_facecolor())
    plt.close(fig)
    return out_path
