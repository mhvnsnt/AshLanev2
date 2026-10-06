#!/usr/bin/env python3
"""Canonical standing skeleton for visualization and analysis.

PROBLEM: the 58-bone cast GLBs store node translations that do NOT compose
to an anatomical standing figure (verified against three.js: Hips y=0.165,
Head y=0.679, Feet y=-0.819), and their inverse-bind matrices are
meshopt-compressed (undecodable here). FK on raw node offsets therefore
draws a crumpled heap — useless for SEE-don't-guess proof renders and it
corrupts foot-skate analysis.

SOLUTION: transfer the WORLD-space motion. For each bone we compute the
world-space rotation delta from rest to the animated pose
    delta = inv(W_rest) * W_anim
which is independent of the skeleton's quirky local frames. We then apply
those world deltas to a canonical standing skeleton (identity rest
orientations, anatomical offsets). The rendered motion is faithful: every
joint's world orientation change is preserved exactly.

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
    "LeftArm": (-0.13, 1.18, 0.0),
    "LeftForeArm": (-0.15, 0.92, 0.0),
    "LeftHand": (-0.15, 0.84, 0.0),
    "RightShoulder": (0.06, 1.44, 0.0),
    "RightArm": (0.13, 1.18, 0.0),
    "RightForeArm": (0.15, 0.92, 0.0),
    "RightHand": (0.15, 0.84, 0.0),
    "LeftUpLeg": (-0.10, 0.95, 0.0),
    "LeftLeg": (-0.10, 0.51, 0.0),
    "LeftFoot": (-0.10, 0.09, 0.0),
    "LeftToeBase": (-0.10, 0.05, 0.16),
    "RightUpLeg": (0.10, 0.95, 0.0),
    "RightLeg": (0.10, 0.51, 0.0),
    "RightFoot": (0.10, 0.09, 0.0),
    "RightToeBase": (0.10, 0.05, 0.16),
}


def _ordered(skel):
    names, parent = skel["names"], skel["parent"]
    order, seen = [], set()

    def visit(i):
        if i in seen:
            return
        if parent[i] >= 0:
            visit(parent[i])
        seen.add(i)
        order.append(i)

    for i in range(len(names)):
        visit(i)
    return order


def _rest_world_quats(skel):
    """Rest world orientation per bone (rotation-only FK)."""
    order = _ordered(skel)
    names, parent = skel["names"], skel["parent"]
    W = {}
    for i in order:
        nm = names[i]
        lq = qnormalize(skel["rest_quat"][nm])
        p = parent[i]
        W[nm] = lq if p < 0 else qmul(W[names[p]], lq)
    return W


def world_deltas(skel, local_quats):
    """World-space rotation delta per bone: inv(W_rest) * W_anim.

    local_quats: {bone_name: (4,)} animated LOCAL rotations.
    Returns {bone_name: (4,)} world-frame deltas. Frame-independent: the
    same physical motion on any skeleton yields the same deltas.
    """
    W_rest = _rest_world_quats(skel)
    order = _ordered(skel)
    names, parent = skel["names"], skel["parent"]
    W_anim = {}
    for i in order:
        nm = names[i]
        lq = qnormalize(np.asarray(local_quats.get(nm, IDENTITY_Q),
                                   dtype=np.float64))
        p = parent[i]
        W_anim[nm] = lq if p < 0 else qmul(W_anim[names[p]], lq)
    return {nm: qmul(qinv(W_rest[nm]), W_anim[nm]) for nm in names}


def canonical_definition(skel, family="mixamo-colon"):
    """Build a canonical skeleton definition mirroring skel's hierarchy.

    Returns (parents, offsets, bones_for_slot): parents {bone: parent_bone},
    offsets {bone: (3,) rest offset in parent frame}, bones_for_slot
    {canonical_slot: bone_name}. Rest world orientations are identity, so
    animating = setting world quats = world deltas directly.
    """
    from skeletons import CANONICAL_SLOTS
    names, parent = skel["names"], skel["parent"]
    slot_of = {}
    for nm in names:
        s = None
        if family == "mixamo-colon" and nm.startswith("mixamorig:"):
            cand = nm[len("mixamorig:"):]
            s = cand if cand in CANONICAL_SLOTS else None
        elif family == "mixamo-stripped":
            s = nm if nm in CANONICAL_SLOTS else None
        if s:
            slot_of[nm] = s
    P = {nm: (np.array(_ANATOMY[slot_of[nm]], dtype=np.float64)
              if nm in slot_of and slot_of[nm] in _ANATOMY else None)
         for nm in names}
    parents, offsets = {}, {}
    for i, nm in enumerate(names):
        p = parent[i]
        parents[nm] = names[p] if p >= 0 else None
        if P[nm] is None:
            offsets[nm] = np.array([0.0, -0.03, 0.0])
        elif p < 0 or P[names[p]] is None:
            offsets[nm] = P[nm].copy()
        else:
            # rest world orientations are identity -> offset is just the
            # anatomical difference
            offsets[nm] = P[nm] - P[names[p]]
    bones_for_slot = {s: nm for nm, s in slot_of.items()}
    return parents, offsets, bones_for_slot


def fk_world_deltas(parents, offsets, world_quats, root_pos=None):
    """Position FK given per-bone WORLD orientations.

    parents/offsets from canonical_definition; world_quats {bone: (4,)}.
    Returns {bone: world_pos}."""
    # order parents before children
    order, seen = [], set()
    children = {}
    for b, p in parents.items():
        children.setdefault(p, []).append(b)

    def visit(b):
        if b in seen:
            return
        p = parents[b]
        if p is not None:
            visit(p)
        seen.add(b)
        order.append(b)

    for b in parents:
        visit(b)
    wp = {}
    rp = np.zeros(3) if root_pos is None else np.asarray(root_pos,
                                                         dtype=np.float64)
    for b in order:
        wq = qnormalize(np.asarray(world_quats.get(b, IDENTITY_Q),
                                   dtype=np.float64))
        p = parents[b]
        if p is None:
            wp[b] = rp + offsets[b]
        else:
            qv = np.array([offsets[b][0], offsets[b][1], offsets[b][2], 0.0])
            pwq = qnormalize(np.asarray(world_quats.get(p, IDENTITY_Q),
                                       dtype=np.float64))
            rv = qmul(qmul(pwq, qv), qinv(pwq))[:3]
            wp[b] = wp[p] + rv
    return wp


# Backwards-compatible alias (old name, new semantics via world deltas).
def canonical_offsets(skel, family="mixamo-colon"):
    _, offsets, _ = canonical_definition(skel, family)
    return offsets


def fk_canonical(skel, local_quats, offsets, root_pos=None):
    """Legacy entry: converts local quats to world deltas, then FKs on the
    canonical definition. Prefer world_deltas + fk_world_deltas directly."""
    parents, _, _ = canonical_definition(skel, "mixamo-colon")
    wd = world_deltas(skel, local_quats)
    return fk_world_deltas(parents, offsets, wd, root_pos)
