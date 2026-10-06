# AshLane Wrestling Move System

**Real paired animations. Both fighters. Correct positions. No faking.**

## Overview

Every wrestling move has TWO synchronized animations:
- **Deliverer** — performs the move (attacker)
- **Receiver** — takes the move (victim)

Both are baked from real wrestling game mocap FBX files that contain
two full skeletons (`J_Hips` and `J_Hips_2`).

## Wrestling Moves (6 converted, more coming)

| Move | Duration | Category | Position | Damage |
|------|----------|----------|----------|--------|
| wrestling_suplex | 6.0s | grapple | face_to_face | 35 |
| wrestling_ddt | 5.7s | grapple | face_to_face | 30 |
| wrestling_german | 7.8s | grapple | behind | 40 |
| wrestling_chokeslam | 5.7s | grapple | face_to_face | 50 |
| wrestling_tombstone | 8.0s | grapple | face_to_face | 65 |
| wrestling_brainbuster | 7.5s | grapple | face_to_face | 45 |

All have 16/16 bones for BOTH deliverer and receiver.

### Source
Drive folder `1chJYomdZW6E7jqUUHZTn1w9wLTakRfvG` — 95 wrestling FBX files.
Converted via `tools/wrestling/convert-one.html` (browser-based FBXLoader).

### Bone mapping (J_ skeleton → 16 bank slots)
```
J_Hips → hips          J_Shoulder_L/R → upperArmL/R
J_Spine1 → spine       J_Elbow_L/R → lowerArmL/R
J_Chest → chest        J_Wrist_L/R → handL/R
J_Head → head          J_Leg_L/R → upperLegL/R
                       J_Knee_L/R → lowerLegL/R
                       J_Foot_L/R → footL/R
```

## Position Contexts

| Context | Description | Example moves |
|---------|-------------|---------------|
| face_to_face | Standing, facing each other | Suplex, DDT, Chokeslam, Tombstone |
| behind | Attacker behind opponent | German Suplex |
| running | Attacker running at opponent | Spear, Crossbody |
| corner | Opponent in corner | Buckle Bomb |
| ropes | Near ropes | Rope-assisted moves |
| ground | Opponent down | Ground-and-pound, submissions |
| top_rope | Attacker elevated | Diving moves |
| apron | Attacker on apron | Apron moves |

## Move Categories

- **grapple** — throws, slams, suplexes (paired)
- **strike** — punches, kicks, elbows
- **submission** — holds
- **dive** — from elevation
- **corner_move** — requires corner
- **ground_move** — opponent must be down
- **tag_move** — requires partner
- **taunt** — showboating
- **weapon** — uses held weapon

## Architecture

```
wrestling-moves.ts     — Move database with categories, positions, damage
grapple-system.ts      — Position detection, validation, pre-move positioning
animation-system.ts    — State machine, paired playback, locks
motion-bank.ts         — Bakes bank.json clips onto rigs
bank.json              — 65 clips (13 paired with vic tracks)
```

### Key functions

**`analyzePosition(attacker, victim, context)`** → `PositionAnalysis`
Detects: face_to_face, behind, running, corner, ropes, ground, top_rope.

**`canPerformMove(moveId, context)`** → `boolean`
Validates the move can be done from current position.

**`getMovePosition(move, attackerPos, victimPos)`** → `PositionTarget`
Calculates correct spacing (0.65m face-to-face, 0.45m behind).

**`executeWrestlingMove(attacker, victim, moveId, ...)`** → `boolean`
Full pipeline: validate → position → play synchronized → lock.

**`playPairedGrapple(attacker, victim, state)`**
Plays deliverer clip + `:vic` receiver clip on same timeline.

## Bank.json Structure

```json
{
  "clips": {
    "wrestling_suplex": {
      "dur": 6.0,
      "times": [0, 0.042, ...],
      "atk": { "hips": [[x,y,z,w], ...], ... },  // deliverer (J_Hips)
      "vic": { "hips": [[x,y,z,w], ...], ... }   // receiver (J_Hips_2)
    }
  }
}
```

## Adding New Moves

1. Download FBX from Drive wrestling folder
2. Convert: load `tools/wrestling/convert-one.html?fbx=X.fbx&name=wrestling_x`
3. Merge JSON into `public/motion/bank.json`
4. Add entry to `WRESTLING_MOVES` in `wrestling-moves.ts`
5. Add to CLIPS/PAIRED_GRAPPLES/LOCKED_STATES in `animation-system.ts`

## Proof

`docs/playtest/wrestling-suplex-proof.mp4` — Suplex, DDT, and Chokeslam
with synchronized deliverer + receiver. Both fighters moving together.
