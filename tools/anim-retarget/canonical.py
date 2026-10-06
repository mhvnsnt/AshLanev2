#!/usr/bin/env python3
"""Canonical standing skeleton for visualization and analysis.

PROBLEM: the 58-bone cast GLBs store node translations that do NOT compose
to an anatomical standing figure (verified against three.js: Hips y=0.165,
Head y=0.679, Feet y=-0.819), and their inverse-bind matrices are
meshopt-compressed (undecodable here). FK on raw node offsets therefore
draws a crumpled heap — useless for SEE-don't-guess proof renders and it
corrupts foot-skate analysis.

SOLUTION: keep every bone's TRUE animated local orientation, but remap the
per-bone offsets onto canonical anatomical positions. Each offset is
expressed in its parent's rest local frame, so under the rest pose the
skeleton stands correctly, and under animation every joint keeps its true
orientation — the motion visualizes faithfully.

Coordinate convention: Y up, Z forward (game faces +Z), X lateral.
"""
import os
import sys
import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import qmul, qinv, qnormalize, IDENTITY_Q

# Canonical slot -> standing world position (meters). ~1.75m figure.
_ANATOMY = {
    "Hips": (0.0, 0.95, 0.0),
    "Spine": (0.0, 1.08, 0.0),
    "Spine1": (0.0, 1.21, 0.0),
    "Spine2": (0.0, 1.34, 0.0),
    "Neck": (0.0, 1.47, 0.0),
    "Head": (0.0, 1.60, 0.0),
    "LeftShoulder": (-0.06, 1.44, 0.0),
    "LeftArm": (-0.21, 1.44, 0.0),
    "LeftForeArm": (-0.21, 1.16, 0.0),
    "LeftHand": (-0.21, 0.90, 0.0),
    "RightShoulder": (0.06, 1.44, 0.0),
    "RightArm": (0.21, 1.44, 0.0),
    "RightForeArm": (0.21, 1.16, 0.0),
    "RightHand": (0.21, 0.90, 0.0),
    "LeftUpLeg": (-0.10, 0.95, 0.0),
    "LeftLeg": (-0.10, 0.51, 0.0),
    "LeftFoot": (-0.10, 0.09, 0.0),
    "LeftToeBase": (-0.10, 0.05, 0.16),
    "RightUpLeg": (0.10, 0.95, 0.0),
    "RightLeg": (0.10, 0.51, 0.0),
    "RightFoot": (0.10, 0.09, 0.0),
    "RightToeBase": (0.10, 0.05, 0.16),
}


def _rest_world_quats(skel):
    """Rest world orientation per bone (rotation-only FK)."""
    names, parent = skel["names"], skel["parent"]
    order = []
    seen = set()

    def visit(i):
        if i in seen:
            return
        if parent[i] >= 0:
            visit(parent[i])
        seen.add(i)
        order.append(i)

    for i in range(len(names)):
        visit(i)
    W = {}
    for i in order:
        nm = names[i]
        lq = qnormalize(skel["rest_quat"][nm])
        p = parent[i]
        W[nm] = lq if p < 0 else qmul(W[names[p]], lq)
    return W


def canonical_offsets(skel, family="mixamo-colon"):
    """Return {bone_name: local_offset (3,)} forming a standing figure under
    this skeleton's own rest orientations."""
    from skeletons import CANONICAL_SLOTS
    W = _rest_world_quats(skel)
    names, parent = skel["names"], skel["parent"]
    P = {}
    for nm in names:
        slot = None
        if family == "mixamo-colon" and nm.startswith("mixamorig:"):
            s = nm[len("mixamorig:"):]
            slot = s if s in CANONICAL_SLOTS else None
        elif family == "mixamo-stripped":
            slot = nm if nm in CANONICAL_SLOTS else None
        P[nm] = (np.array(_ANATOMY[slot], dtype=np.float64)
                 if slot and slot in _ANATOMY else None)
    out = {}
    for i, nm in enumerate(names):
        p = parent[i]
        if P[nm] is None:
            # unmapped bone (fingers etc.): small down-offset in the parent's
            # anatomical frame so chains don't collapse to a point
            out[nm] = np.array([0.0, -0.03, 0.0])
            continue
        if p < 0:
            out[nm] = P[nm].copy()
        else:
            pn = names[p]
            pp = P[pn] if P[pn] is not None else np.zeros(3)
            d = P[nm] - pp
            q = qinv(W[pn])
            qv = np.array([d[0], d[1], d[2], 0.0])
            out[nm] = qmul(qmul(q, qv), qinv(q))[:3]
    return out


def fk_canonical(skel, local_quats, offsets, root_pos=None):
    """FK using canonical offsets. local_quats: {bone: (4,)} animated local
    rotation. Returns {bone: world_pos}."""
    names, parent = skel["names"], skel["parent"]
    order = []
    seen = set()

    def visit(i):
        if i in seen:
            return
        if parent[i] >= 0:
            visit(parent[i])
        seen.add(i)
        order.append(i)

    for i in range(len(names)):
        visit(i)
    wq, wp = {}, {}
    rp = np.zeros(3) if root_pos is None else np.asarray(root_pos,
                                                         dtype=np.float64)
    for i in order:
        nm = names[i]
        lq = qnormalize(np.asarray(local_quats.get(nm, IDENTITY_Q),
                                   dtype=np.float64))
        lt = offsets[nm]
        p = parent[i]
        if p < 0:
            wq[nm] = lq
            wp[nm] = rp + lt
        else:
            pn = names[p]
            wq[nm] = qmul(wq[pn], lq)
            q = wq[pn]
            qv = np.array([lt[0], lt[1], lt[2], 0.0])
            rv = qmul(qmul(q, qv), qinv(q))[:3]
            wp[nm] = wp[pn] + rv
    return wp
