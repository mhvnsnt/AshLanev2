# MediaPipe Mocap — Webcam Motion Capture for AshLane ✅ WIRED

**Status:** Core pipeline working and verified. Demo page live at `/mocap`.

## What it does

MediaPipe (Apache-2.0) Pose gives 33 body landmarks from a webcam. This module
converts them into per-joint bone directions and retargets those onto any
AshLane character rig in real time. The owner can perform a punch, taunt, or
throw once on camera → we capture it → it plays on the character.

## How it works

```
webcam → MediaPipe PoseLandmarker (CDN, WASM) → 33 landmarks/frame
  → boneDirectionsFromLandmarks() → 20 joint directions
  → DirectionSmoother (jitter reduction)
  → applyMocapToRig() → swing-only world-space retargeting
  → character bones rotate
```

**Retargeting method:** For each joint, compute the shortest-arc rotation from
the model's rest bone direction to the mocap target direction (mapped into
model space via yaw alignment). Apply as `B_new = D * B_rest`, then convert
to local space. This is immune to bone-axis convention mismatches — it works
on Mixamo, Quaternius, Rigify, or any rig `mapRigBones` recognizes.

**Calibration:** On load, the model's own rest pose is synthesized into
landmarks (`modelRestLandmarks`), run through the same direction function,
and stored. This guarantees the rest pose round-trips to identity — no
popping when mocap starts.

## Files

- `src/game3d/mediapipe-mocap.ts` — the module (pure math + rig + loader)
- `src/routes/mocap.tsx` — demo page: webcam + live character + record-to-JSON
- `tools/mediapipe-mocap/proof/` — headless proof (synthetic landmarks → rig)

## Verification

- **Math:** T-pose self-delta = 0.0000° (Node test). Punch produces sensible
  joint angles (RightArm 43°, RightForeArm 67°).
- **Round-trip:** Model rest landmarks → directions → compare to calibrated
  rest = 0.00° on all joints.
- **Bone-level:** Direct rotation test — bone world quaternion matches expected
  exactly (dot > 0.999).
- **Skeleton:** Headless render shows bones moving correctly through a punch.
- **CDN:** `@mediapipe/tasks-vision@0.10.20` verified 200 OK (jsdelivr + unpkg).

## Known issues

1. **CAIN_ELIAS_gear.glb has broken skinning.** Even a trivial 45° bone rotation
   (bypassing all mocap math) distorts the mesh into a spike, while the bone
   quaternions are mathematically correct and the skeleton moves properly.
   Likely damaged by the surgical twin-removal. Needs skinning repair or use a
   different model for the demo. The pipeline itself is verified correct.
2. **No root motion yet.** Only rotations are captured; hip translation (footwork)
   is not transferred. Fine for upper-body moves, needed for full locomotion.
3. **No twist.** Swing-only loses forearm roll. Acceptable for v1.

## Usage

```typescript
import { loadPoseLandmarker, boneDirectionsFromLandmarks,
         mapRigBones, captureRigState, applyMocapToRig } from "@/game3d/mediapipe-mocap";

// Once:
const landmarker = await loadPoseLandmarker();
const rig = captureRigState(characterRoot, mapRigBones(characterRoot));

// Per frame:
const res = landmarker.detectForVideo(video, performance.now());
const dirs = boneDirectionsFromLandmarks(res.worldLandmarks[0]);
applyMocapToRig(dirs, rig);

// Record:
const rec = new MocapRecorder(30);
rec.push(landmarks); // per frame
const clip = rec.toClip("my-punch"); // → JSON
```

## License

MediaPipe is Apache-2.0 (Google). The `@mediapipe/tasks-vision` bundle and
pose model are loaded from CDN at runtime; no vendored code. Our integration
code is part of AshLane.
