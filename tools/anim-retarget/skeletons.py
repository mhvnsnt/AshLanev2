#!/usr/bin/env python3
"""
Skeleton registry for the AshLane universal animation pipeline.

Every skeleton family in use maps to CANONICAL slots (stripped Mixamo names).
The canonical TARGET for all retargeting is the 58-bone cast skeleton
('mixamo-colon': mixamorig:Hips ...), which every cast model ships.

Families:
  mixamo-colon   - AshLane cast, 58 joints (mixamorig:Hips)
  mixamo-packed  - UAL clips (mixamorigHips)
  mixamo-stripped- generic Mixamo exports (Hips)
  quaternius     - 65-joint UE-style (pelvis, spine_01, upperarm_l)
  rigify         - Blender Rigify (DEF-hips)
  kaykit         - KayKit chibi (hips, upperarm.l)
  c4d            - C4D wrestling-move rigs (J_Hips, J_Elbow_L) incl. _2/_3
                   multi-character suffixes for paired moves
  quat           - Quaternius-lite game exports (UpperArmL, FistL)
  godot-ual      - Godot UAL library (DEF-hips -> packed mixamo)

This mirrors src/game3d/universal-retarget.ts — keep the two in sync.
"""
import re

# Canonical slots: stripped Mixamo names. The 22 core body slots are the
# validation-critical set; fingers/toes are nice-to-have.
CANONICAL_SLOTS = [
    "Hips", "Spine", "Spine1", "Spine2", "Neck", "Head", "HeadTop_End",
    "LeftShoulder", "LeftArm", "LeftForeArm", "LeftHand",
    "LeftHandThumb1", "LeftHandThumb2", "LeftHandThumb3",
    "LeftHandIndex1", "LeftHandIndex2", "LeftHandIndex3",
    "LeftHandMiddle1", "LeftHandMiddle2", "LeftHandMiddle3",
    "LeftHandRing1", "LeftHandRing2", "LeftHandRing3",
    "LeftHandPinky1", "LeftHandPinky2", "LeftHandPinky3",
    "RightShoulder", "RightArm", "RightForeArm", "RightHand",
    "RightHandThumb1", "RightHandThumb2", "RightHandThumb3",
    "RightHandIndex1", "RightHandIndex2", "RightHandIndex3",
    "RightHandMiddle1", "RightHandMiddle2", "RightHandMiddle3",
    "RightHandRing1", "RightHandRing2", "RightHandRing3",
    "RightHandPinky1", "RightHandPinky2", "RightHandPinky3",
    "LeftUpLeg", "LeftLeg", "LeftFoot", "LeftToeBase", "LeftToe_End",
    "RightUpLeg", "RightLeg", "RightFoot", "RightToeBase", "RightToe_End",
]

# Core body slots (no fingers/toes) — the set every clip must cover.
CORE_SLOTS = [
    "Hips", "Spine", "Spine1", "Spine2", "Neck", "Head",
    "LeftShoulder", "LeftArm", "LeftForeArm", "LeftHand",
    "RightShoulder", "RightArm", "RightForeArm", "RightHand",
    "LeftUpLeg", "LeftLeg", "LeftFoot",
    "RightUpLeg", "RightLeg", "RightFoot",
]

_C4D_SUFFIX = re.compile(r"_([23])$")


def _strip_c4d_suffix(name):
    """Split 'J_Elbow_L_2' -> ('J_Elbow_L', 1). Returns (name, 0) if no suffix."""
    m = _C4D_SUFFIX.search(name)
    if m and name.startswith("J_"):
        return name[: m.start()], int(m.group(1)) - 1
    return name, 0


# Explicit bone -> canonical maps (prefix-strip families handled by rule).
_EXPLICIT = {
    "quaternius": {
        "pelvis": "Hips", "spine_01": "Spine", "spine_02": "Spine1",
        "spine_03": "Spine2", "neck_01": "Neck", "Head": "Head",
        "clavicle_l": "LeftShoulder", "clavicle_r": "RightShoulder",
        "upperarm_l": "LeftArm", "upperarm_r": "RightArm",
        "lowerarm_l": "LeftForeArm", "lowerarm_r": "RightForeArm",
        "hand_l": "LeftHand", "hand_r": "RightHand",
        "thumb_01_l": "LeftHandThumb1", "thumb_02_l": "LeftHandThumb2",
        "thumb_03_l": "LeftHandThumb3",
        "thumb_01_r": "RightHandThumb1", "thumb_02_r": "RightHandThumb2",
        "thumb_03_r": "RightHandThumb3",
        "index_01_l": "LeftHandIndex1", "index_02_l": "LeftHandIndex2",
        "index_03_l": "LeftHandIndex3",
        "index_01_r": "RightHandIndex1", "index_02_r": "RightHandIndex2",
        "index_03_r": "RightHandIndex3",
        "middle_01_l": "LeftHandMiddle1", "middle_02_l": "LeftHandMiddle2",
        "middle_03_l": "LeftHandMiddle3",
        "middle_01_r": "RightHandMiddle1", "middle_02_r": "RightHandMiddle2",
        "middle_03_r": "RightHandMiddle3",
        "ring_01_l": "LeftHandRing1", "ring_02_l": "LeftHandRing2",
        "ring_03_l": "LeftHandRing3",
        "ring_01_r": "RightHandRing1", "ring_02_r": "RightHandRing2",
        "ring_03_r": "RightHandRing3",
        "pinky_01_l": "LeftHandPinky1", "pinky_02_l": "LeftHandPinky2",
        "pinky_03_l": "LeftHandPinky3",
        "pinky_01_r": "RightHandPinky1", "pinky_02_r": "RightHandPinky2",
        "pinky_03_r": "RightHandPinky3",
        "thigh_l": "LeftUpLeg", "thigh_r": "RightUpLeg",
        "calf_l": "LeftLeg", "calf_r": "RightLeg",
        "foot_l": "LeftFoot", "foot_r": "RightFoot",
        "ball_l": "LeftToeBase", "ball_r": "RightToeBase",
    },
    "rigify": {
        "DEF-hips": "Hips", "DEF-spine": "Spine", "DEF-spine001": "Spine1",
        "DEF-spine002": "Spine2", "DEF-spine003": "Spine2",
        "DEF-neck": "Neck", "DEF-head": "Head",
        "DEF-shoulderL": "LeftShoulder", "DEF-shoulderR": "RightShoulder",
        "DEF-upper_armL": "LeftArm", "DEF-upper_armR": "RightArm",
        "DEF-forearmL": "LeftForeArm", "DEF-forearmR": "RightForeArm",
        "DEF-handL": "LeftHand", "DEF-handR": "RightHand",
        "DEF-thighL": "LeftUpLeg", "DEF-thighR": "RightUpLeg",
        "DEF-shinL": "LeftLeg", "DEF-shinR": "RightLeg",
        "DEF-footL": "LeftFoot", "DEF-footR": "RightFoot",
        "DEF-toeL": "LeftToeBase", "DEF-toeR": "RightToeBase",
    },
    "kaykit": {
        "hips": "Hips", "spine": "Spine", "chest": "Spine2", "head": "Head",
        "upperarm.l": "LeftArm", "upperarm.r": "RightArm",
        "lowerarm.l": "LeftForeArm", "lowerarm.r": "RightForeArm",
        "hand.l": "LeftHand", "hand.r": "RightHand",
        "upperleg.l": "LeftUpLeg", "upperleg.r": "RightUpLeg",
        "lowerleg.l": "LeftLeg", "lowerleg.r": "RightLeg",
        "foot.l": "LeftFoot", "foot.r": "RightFoot",
    },
    # C4D wrestling rigs (public/motion/wrestling/*.glb). Finger chains:
    # Index/Middle/Ring/Pinky F0->F1->F2 (F3 is the tip, dropped);
    # Thumb F1->F2->F3.
    "c4d": {
        "J_Hips": "Hips", "J_Spine1": "Spine", "J_Spine2": "Spine1",
        "J_Chest": "Spine2", "J_Neck": "Neck", "J_Head": "Head",
        "J_Clavicle_L": "LeftShoulder", "J_Clavicle_R": "RightShoulder",
        "J_Shoulder_L": "LeftArm", "J_Shoulder_R": "RightArm",
        "J_Elbow_L": "LeftForeArm", "J_Elbow_R": "RightForeArm",
        "J_Wrist_L": "LeftHand", "J_Wrist_R": "RightHand",
        "J_Leg_L": "LeftUpLeg", "J_Leg_R": "RightUpLeg",
        "J_Knee_L": "LeftLeg", "J_Knee_R": "RightLeg",
        "J_Foot_L": "LeftFoot", "J_Foot_R": "RightFoot",
        "J_Toe_L": "LeftToeBase", "J_Toe_R": "RightToeBase",
        "J_ThumbF1_L": "LeftHandThumb1", "J_ThumbF2_L": "LeftHandThumb2",
        "J_ThumbF3_L": "LeftHandThumb3",
        "J_ThumbF1_R": "RightHandThumb1", "J_ThumbF2_R": "RightHandThumb2",
        "J_ThumbF3_R": "RightHandThumb3",
        "J_IndexF0_L": "LeftHandIndex1", "J_IndexF1_L": "LeftHandIndex2",
        "J_IndexF2_L": "LeftHandIndex3",
        "J_IndexF0_R": "RightHandIndex1", "J_IndexF1_R": "RightHandIndex2",
        "J_IndexF2_R": "RightHandIndex3",
        "J_MiddleF0_L": "LeftHandMiddle1", "J_MiddleF1_L": "LeftHandMiddle2",
        "J_MiddleF2_L": "LeftHandMiddle3",
        "J_MiddleF0_R": "RightHandMiddle1", "J_MiddleF1_R": "RightHandMiddle2",
        "J_MiddleF2_R": "RightHandMiddle3",
        "J_RingF0_L": "LeftHandRing1", "J_RingF1_L": "LeftHandRing2",
        "J_RingF2_L": "LeftHandRing3",
        "J_RingF0_R": "RightHandRing1", "J_RingF1_R": "RightHandRing2",
        "J_RingF2_R": "RightHandRing3",
        "J_PinkyF0_L": "LeftHandPinky1", "J_PinkyF1_L": "LeftHandPinky2",
        "J_PinkyF2_L": "LeftHandPinky3",
        "J_PinkyF0_R": "RightHandPinky1", "J_PinkyF1_R": "RightHandPinky2",
        "J_PinkyF2_R": "RightHandPinky3",
    },
    "quat": {
        "Hips": "Hips", "Abdomen": "Spine", "Torso": "Spine2", "Head": "Head",
        "UpperArmL": "LeftArm", "UpperArmR": "RightArm",
        "LowerArmL": "LeftForeArm", "LowerArmR": "RightForeArm",
        "FistL": "LeftHand", "FistR": "RightHand",
        "UpperLegL": "LeftUpLeg", "UpperLegR": "RightUpLeg",
        "LowerLegL": "LeftLeg", "LowerLegR": "RightLeg",
        "FootL": "LeftFoot", "FootR": "RightFoot",
    },
    # Godot UAL library ships on DEF-* but maps to PACKED mixamo names.
    "godot-ual": {
        "DEF-hips": "mixamorigHips", "DEF-spine001": "mixamorigSpine",
        "DEF-spine002": "mixamorigSpine1", "DEF-spine003": "mixamorigSpine2",
        "DEF-neck": "mixamorigNeck", "DEF-head": "mixamorigHead",
        "DEF-shoulderL": "mixamorigLeftShoulder",
        "DEF-shoulderR": "mixamorigRightShoulder",
        "DEF-upper_armL": "mixamorigLeftArm",
        "DEF-upper_armR": "mixamorigRightArm",
        "DEF-forearmL": "mixamorigLeftForeArm",
        "DEF-forearmR": "mixamorigRightForeArm",
        "DEF-handL": "mixamorigLeftHand", "DEF-handR": "mixamorigRightHand",
        "DEF-thighL": "mixamorigLeftUpLeg",
        "DEF-thighR": "mixamorigRightUpLeg",
        "DEF-shinL": "mixamorigLeftLeg", "DEF-shinR": "mixamorigRightLeg",
        "DEF-footL": "mixamorigLeftFoot", "DEF-footR": "mixamorigRightFoot",
        "DEF-toeL": "mixamorigLeftToeBase",
        "DEF-toeR": "mixamorigRightToeBase",
    },
}

# Reverse lookup cache: family -> canonical slot -> family bone name.
_REV = {}


def detect_family(names):
    """Auto-detect skeleton family from an iterable of bone names."""
    s = set(names)
    if any(n.startswith("mixamorig:") for n in s):
        return "mixamo-colon"
    if any(n.startswith("mixamorig") for n in s):
        return "mixamo-packed"
    if "J_Hips" in s or "J_Hips_2" in s:
        return "c4d"
    if "DEF-hips" in s:
        return "rigify"
    if "hips" in s and "upperarm.l" in s:
        return "kaykit"
    if "pelvis" in s and "spine_01" in s:
        return "quaternius"
    if "UpperArmL" in s and "FistL" in s:
        return "quat"
    if "Hips" in s and ("LeftArm" in s or "Spine" in s):
        return "mixamo-stripped"
    return "unknown"


def to_canonical(name, family):
    """Family bone name -> (canonical slot|None, char_index).

    Handles C4D _2/_3 multi-character suffixes."""
    char = 0
    if family == "c4d":
        name, char = _strip_c4d_suffix(name)
    if family == "mixamo-colon":
        slot = name[len("mixamorig:"):] if name.startswith("mixamorig:") else None
    elif family == "mixamo-packed":
        slot = name[len("mixamorig"):] if name.startswith("mixamorig") else None
    elif family == "mixamo-stripped":
        slot = name if name in CANONICAL_SLOTS else None
    else:
        slot = _EXPLICIT.get(family, {}).get(name)
        # godot-ual maps to packed mixamo names; normalize to canonical.
        if family == "godot-ual" and slot and slot.startswith("mixamorig"):
            slot = slot[len("mixamorig"):]
    if slot not in CANONICAL_SLOTS:
        return None, char
    return slot, char


def from_canonical(slot, family):
    """Canonical slot -> family bone name (or None)."""
    if family == "mixamo-colon":
        return f"mixamorig:{slot}"
    if family == "mixamo-packed":
        return f"mixamorig{slot}"
    if family == "mixamo-stripped":
        return slot if slot in CANONICAL_SLOTS else None
    rev = _REV.get(family)
    if rev is None:
        rev = {}
        for bone, s in _EXPLICIT.get(family, {}).items():
            norm = s
            if family == "godot-ual" and norm.startswith("mixamorig"):
                norm = norm[len("mixamorig"):]
            if norm not in rev:
                rev[norm] = bone
        _REV[family] = rev
    return rev.get(slot)


def families():
    return ["mixamo-colon", "mixamo-packed", "mixamo-stripped", "quaternius",
            "rigify", "kaykit", "c4d", "quat", "godot-ual"]


if __name__ == "__main__":
    print(f"{len(CANONICAL_SLOTS)} canonical slots, {len(CORE_SLOTS)} core")
    for f in families():
        n = len(_EXPLICIT.get(f, {})) or "prefix-rule"
        print(f"  {f}: {n} mapped bones")
