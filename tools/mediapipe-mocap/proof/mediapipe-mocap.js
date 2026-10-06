/**
 * mediapipe-mocap.ts — Webcam motion capture for AshLane.
 *
 * MediaPipe (Apache-2.0, https://github.com/google/mediapipe) Pose gives 33
 * body landmarks per frame. This module converts them into per-joint bone
 * DIRECTIONS and retargets those onto any AshLane character rig.
 *
 * Retargeting method (swing-only, world-space):
 *   For each joint J:
 *     d_user   = bone direction from landmarks (MediaPipe space)
 *     d_target = yawAlign * d_user            (model world space)
 *     D        = shortestArc(d_rest(J), d_target)
 *     B_new(J) = D * B_rest(J)
 *   then bone.quaternion = inv(parentWorld) * B_new(J)
 *
 * Where d_rest(J) is the model's own rest bone direction and yawAlign is the
 * yaw taking MediaPipe's +z-facing convention to the model's facing. This is
 * immune to bone-axis convention mismatches and pole-vector flips. The cost
 * is losing axial twist (forearm roll) — acceptable for v1.
 *
 * Layout:
 *  - Pure math (no DOM): PoseLandmark, boneDirectionsFromLandmarks,
 *    MocapClip, MocapRecorder — unit-testable in Node.
 *  - Rig: mapRigBones, captureRigState, applyMocapToRig — needs three.js.
 *  - Browser: loadPoseLandmarker — dynamic CDN import of @mediapipe/tasks-vision.
 *  - Synthetic: tposeLandmarks, punchSequence, modelRestLandmarks (proof).
 */
import * as THREE from "three";
/** MediaPipe Pose landmark indices (0-32). */
export const MP = {
    NOSE: 0,
    LEFT_EYE_INNER: 1, LEFT_EYE: 2, LEFT_EYE_OUTER: 3,
    RIGHT_EYE_INNER: 4, RIGHT_EYE: 5, RIGHT_EYE_OUTER: 6,
    LEFT_EAR: 7, RIGHT_EAR: 8,
    MOUTH_LEFT: 9, MOUTH_RIGHT: 10,
    LEFT_SHOULDER: 11, RIGHT_SHOULDER: 12,
    LEFT_ELBOW: 13, RIGHT_ELBOW: 14,
    LEFT_WRIST: 15, RIGHT_WRIST: 16,
    LEFT_PINKY: 17, RIGHT_PINKY: 18,
    LEFT_INDEX: 19, RIGHT_INDEX: 20,
    LEFT_THUMB: 21, RIGHT_THUMB: 22,
    LEFT_HIP: 23, RIGHT_HIP: 24,
    LEFT_KNEE: 25, RIGHT_KNEE: 26,
    LEFT_ANKLE: 27, RIGHT_ANKLE: 28,
    LEFT_HEEL: 29, RIGHT_HEEL: 30,
    LEFT_FOOT_INDEX: 31, RIGHT_FOOT_INDEX: 32,
};
/** Canonical joint slots we drive. */
export const MOCAP_JOINTS = [
    "Hips",
    "Spine", "Spine1", "Spine2",
    "Neck", "Head",
    "LeftShoulder", "LeftArm", "LeftForeArm", "LeftHand",
    "RightShoulder", "RightArm", "RightForeArm", "RightHand",
    "LeftUpLeg", "LeftLeg", "LeftFoot",
    "RightUpLeg", "RightLeg", "RightFoot",
];
const v3 = (l) => [l.x, l.y, l.z];
const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const scale = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
const len = (a) => Math.hypot(a[0], a[1], a[2]);
const mid = (a, b) => scale(add(a, b), 0.5);
const lerp3 = (a, b, t) => add(scale(a, 1 - t), scale(b, t));
/**
 * For each driven joint, the world-space bone direction inferred from
 * landmarks. Output is in MediaPipe space; applyMocapToRig maps it into
 * the model's space via the rig's yawAlign.
 */
export function boneDirectionsFromLandmarks(lm) {
    const L = (i) => v3(lm[i]);
    const dir = (a, b) => {
        const d = sub(b, a);
        const l = len(d) || 1;
        return new THREE.Vector3(d[0] / l, d[1] / l, d[2] / l);
    };
    const hipL = L(MP.LEFT_HIP), hipR = L(MP.RIGHT_HIP);
    const shoL = L(MP.LEFT_SHOULDER), shoR = L(MP.RIGHT_SHOULDER);
    const hipMid = mid(hipL, hipR), shoMid = mid(shoL, shoR);
    const earMid = mid(L(MP.LEFT_EAR), L(MP.RIGHT_EAR));
    const neckPos = lerp3(shoMid, earMid, 0.35);
    const torsoUp = dir(hipMid, shoMid);
    return {
        Hips: torsoUp,
        Spine: torsoUp, Spine1: torsoUp, Spine2: torsoUp,
        Neck: dir(shoMid, neckPos),
        Head: dir(neckPos, L(MP.NOSE)),
        LeftShoulder: dir(neckPos, shoL),
        LeftArm: dir(shoL, L(MP.LEFT_ELBOW)),
        LeftForeArm: dir(L(MP.LEFT_ELBOW), L(MP.LEFT_WRIST)),
        LeftHand: dir(L(MP.LEFT_WRIST), L(MP.LEFT_INDEX)),
        RightShoulder: dir(neckPos, shoR),
        RightArm: dir(shoR, L(MP.RIGHT_ELBOW)),
        RightForeArm: dir(L(MP.RIGHT_ELBOW), L(MP.RIGHT_WRIST)),
        RightHand: dir(L(MP.RIGHT_WRIST), L(MP.RIGHT_INDEX)),
        LeftUpLeg: dir(hipL, L(MP.LEFT_KNEE)),
        LeftLeg: dir(L(MP.LEFT_KNEE), L(MP.LEFT_ANKLE)),
        LeftFoot: dir(L(MP.LEFT_ANKLE), mid(L(MP.LEFT_FOOT_INDEX), L(MP.LEFT_HEEL))),
        RightUpLeg: dir(hipR, L(MP.RIGHT_KNEE)),
        RightLeg: dir(L(MP.RIGHT_KNEE), L(MP.RIGHT_ANKLE)),
        RightFoot: dir(L(MP.RIGHT_ANKLE), mid(L(MP.RIGHT_FOOT_INDEX), L(MP.RIGHT_HEEL))),
    };
}
/* ------------------------------------------------------------------ */
/* Smoothing (exponential moving average on direction vectors)         */
/* ------------------------------------------------------------------ */
export class DirectionSmoother {
    prev = null;
    alpha;
    constructor(alpha = 0.45) { this.alpha = alpha; }
    smooth(d) {
        const out = {};
        for (const j of MOCAP_JOINTS) {
            if (!this.prev)
                out[j] = d[j].clone();
            else {
                out[j] = this.prev[j].clone().lerp(d[j], this.alpha).normalize();
            }
        }
        this.prev = out;
        return out;
    }
    reset() { this.prev = null; }
}
export class MocapRecorder {
    frames = [];
    fps;
    smoother;
    constructor(fps = 30, smoother = new DirectionSmoother()) {
        this.fps = fps;
        this.smoother = smoother;
    }
    /** Feed one landmark frame; returns the smoothed bone directions. */
    push(landmarks) {
        const d = this.smoother.smooth(boneDirectionsFromLandmarks(landmarks));
        this.frames.push(d);
        return d;
    }
    /** Feed precomputed directions (e.g. from a test harness). */
    pushDirections(d) {
        const s = this.smoother.smooth(d);
        this.frames.push(s);
        return s;
    }
    get frameCount() { return this.frames.length; }
    reset() { this.frames = []; this.smoother.reset(); }
    toClip(name) {
        return {
            name,
            fps: this.fps,
            jointOrder: [...MOCAP_JOINTS],
            frames: this.frames.map((f) => MOCAP_JOINTS.flatMap((j) => [f[j].x, f[j].y, f[j].z])),
        };
    }
    static clipFromJson(json) {
        return JSON.parse(json);
    }
    /** Sample a clip at time t (seconds), lerping between frames. */
    static sample(clip, t) {
        const n = clip.frames.length;
        if (n === 0)
            throw new Error("empty clip");
        const ft = Math.max(0, Math.min(n - 1, t * clip.fps));
        const i0 = Math.floor(ft), i1 = Math.min(n - 1, i0 + 1), a = ft - i0;
        const out = {};
        for (let k = 0; k < clip.jointOrder.length; k++) {
            const j = clip.jointOrder[k];
            const v0 = new THREE.Vector3(clip.frames[i0][k * 3], clip.frames[i0][k * 3 + 1], clip.frames[i0][k * 3 + 2]);
            const v1 = new THREE.Vector3(clip.frames[i1][k * 3], clip.frames[i1][k * 3 + 1], clip.frames[i1][k * 3 + 2]);
            out[j] = v0.lerp(v1, a).normalize();
        }
        return out;
    }
}
/* ------------------------------------------------------------------ */
/* Rig mapping + capture                                               */
/* ------------------------------------------------------------------ */
/**
 * Build a slot -> THREE.Bone map by matching bone names against the
 * canonical slot names (handles mixamo-colon "mixamorig:Hips", packed
 * "mixamorigHips", stripped "Hips", UE "pelvis", etc.).
 */
export function mapRigBones(root) {
    const bones = [];
    root.traverse((o) => { if (o.isBone)
        bones.push(o); });
    const normName = (s) => s.replace(/^mixamorig:/, "").replace(/^mixamorig/, "").toLowerCase();
    const aliases = {
        Hips: ["hips", "pelvis", "def-hips"],
        Spine: ["spine", "spine_01", "def-spine"],
        Spine1: ["spine1", "spine_02", "def-spine001"],
        Spine2: ["spine2", "spine_03", "def-spine002", "chest"],
        Neck: ["neck", "neck_01", "def-neck"],
        Head: ["head", "def-head"],
        LeftShoulder: ["leftshoulder", "clavicle_l", "shoulder.l"],
        LeftArm: ["leftarm", "upperarm_l", "upperarm.l"],
        LeftForeArm: ["leftforearm", "lowerarm_l", "lowerarm.l", "forearm.l"],
        LeftHand: ["lefthand", "hand_l", "hand.l"],
        RightShoulder: ["rightshoulder", "clavicle_r", "shoulder.r"],
        RightArm: ["rightarm", "upperarm_r", "upperarm.r"],
        RightForeArm: ["rightforearm", "lowerarm_r", "lowerarm.r", "forearm.r"],
        RightHand: ["righthand", "hand_r", "hand.r"],
        LeftUpLeg: ["leftupleg", "thigh_l", "upperleg.l"],
        LeftLeg: ["leftleg", "calf_l", "lowerleg.l", "shin.l"],
        LeftFoot: ["leftfoot", "foot_l", "foot.l"],
        RightUpLeg: ["rightupleg", "thigh_r", "upperleg.r"],
        RightLeg: ["rightleg", "calf_r", "lowerleg.r", "shin.r"],
        RightFoot: ["rightfoot", "foot_r", "foot.r"],
    };
    const map = new Map();
    for (const j of MOCAP_JOINTS) {
        const want = aliases[j];
        const hit = bones.find((b) => want.includes(normName(b.name)));
        if (hit)
            map.set(j, hit);
    }
    return map;
}
/** Capture a rig's rest state. Call while the rig is at rest. */
export function captureRigState(root, boneMap) {
    root.updateMatrixWorld(true);
    const restWorld = new Map();
    boneMap.forEach((bone, j) => {
        restWorld.set(j, bone.getWorldQuaternion(new THREE.Quaternion()));
    });
    // Model forward from the shoulder line; yaw aligns MediaPipe +z to it.
    let fwd = new THREE.Vector3(0, 0, 1);
    const shoL = boneMap.get("LeftShoulder"), shoR = boneMap.get("RightShoulder");
    const up = new THREE.Vector3(0, 1, 0);
    if (shoL && shoR) {
        const pL = shoL.getWorldPosition(new THREE.Vector3());
        const pR = shoR.getWorldPosition(new THREE.Vector3());
        const leftDir = pL.sub(pR).normalize();
        fwd = new THREE.Vector3().crossVectors(leftDir, up);
        if (fwd.lengthSq() < 1e-6)
            fwd.set(0, 0, 1);
        fwd.normalize();
    }
    const yaw = Math.atan2(fwd.x, fwd.z);
    const yawAlign = new THREE.Quaternion().setFromAxisAngle(up, yaw);
    // Calibrate rest directions: synthesize the model's rest landmarks, run
    // them through the SAME direction function used at runtime, and map to
    // model space. Guarantees D=identity at rest.
    const partial = { boneMap, yawAlign };
    const restLm = modelRestLandmarks(partial);
    const dirsMp = boneDirectionsFromLandmarks(restLm);
    const restDirs = {};
    for (const j of MOCAP_JOINTS) {
        restDirs[j] = dirsMp[j].clone().applyQuaternion(yawAlign).normalize();
    }
    return { boneMap, restWorld, restDirs, yawAlign };
}
/* ------------------------------------------------------------------ */
/* Apply mocap to rig                                                  */
/* ------------------------------------------------------------------ */
/**
 * Drive a rig from bone directions (MediaPipe space, e.g. from
 * boneDirectionsFromLandmarks or MocapRecorder.sample).
 *
 * For each joint: D = swing(d_rest, yawAlign * d_user); B_new = D * B_rest;
 * bone.quaternion = inv(parentWorld) * B_new.
 */
export function applyMocapToRig(dirs, rig) {
    const desired = new Map();
    rig.boneMap.forEach((bone, j) => {
        const dTarget = dirs[j].clone().applyQuaternion(rig.yawAlign).normalize();
        const D = new THREE.Quaternion().setFromUnitVectors(rig.restDirs[j], dTarget);
        desired.set(j, D.multiply(rig.restWorld.get(j)));
    });
    // Apply in THREE-hierarchy order so each bone's parent world matrix is fresh.
    const entries = [...rig.boneMap.entries()];
    const threeDepth = (b) => {
        let d = 0, o = b.parent;
        while (o) {
            d++;
            o = o.parent;
        }
        return d;
    };
    entries.sort((a, b) => threeDepth(a[1]) - threeDepth(b[1]));
    for (const [j, bone] of entries) {
        const parent = bone.parent;
        if (parent)
            parent.updateWorldMatrix(true, false);
        const parentWorld = parent
            ? parent.getWorldQuaternion(new THREE.Quaternion())
            : new THREE.Quaternion();
        bone.quaternion.copy(parentWorld.invert().multiply(desired.get(j)));
        bone.updateMatrix();
    }
    rig.boneMap.forEach((bone) => bone.updateWorldMatrix(false, true));
}
const MP_CDN = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.20";
const POSE_MODEL_URL = "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/latest/pose_landmarker_full.task";
/**
 * Dynamically import @mediapipe/tasks-vision from CDN and create a
 * PoseLandmarker in VIDEO running mode. Browser only.
 */
export async function loadPoseLandmarker() {
    const vision = await import(/* @vite-ignore */ `${MP_CDN}/vision_bundle.mjs`);
    const { FilesetResolver, PoseLandmarker } = vision;
    const fileset = await FilesetResolver.forVisionTasks(`${MP_CDN}/wasm`);
    const landmarker = await PoseLandmarker.createFromOptions(fileset, {
        baseOptions: { modelAssetPath: POSE_MODEL_URL, delegate: "GPU" },
        runningMode: "VIDEO",
        numPoses: 1,
        minPoseDetectionConfidence: 0.5,
        minPosePresenceConfidence: 0.5,
        minTrackingConfidence: 0.5,
    });
    return landmarker;
}
/* ------------------------------------------------------------------ */
/* Synthetic test data (headless proof, no webcam)                     */
/* ------------------------------------------------------------------ */
/**
 * Build a rest landmark set FROM THE MODEL: takes bone world positions,
 * converts to MediaPipe space (hips at origin, facing +z). Guarantees the
 * synthetic rest matches the model's rest pose exactly.
 */
export function modelRestLandmarks(rig) {
    const inv = rig.yawAlign.clone().invert();
    const hips = rig.boneMap.get("Hips").getWorldPosition(new THREE.Vector3());
    const toMp = (p) => {
        const q = p.clone().sub(hips).applyQuaternion(inv);
        return { x: q.x, y: q.y, z: q.z, visibility: 1 };
    };
    const bp = (j) => rig.boneMap.get(j).getWorldPosition(new THREE.Vector3());
    const lm = Array.from({ length: 33 }, () => ({ x: 0, y: 0, z: 0, visibility: 0 }));
    const set = (i, p) => { lm[i] = toMp(p); };
    set(MP.LEFT_SHOULDER, bp("LeftShoulder"));
    set(MP.RIGHT_SHOULDER, bp("RightShoulder"));
    set(MP.LEFT_ELBOW, bp("LeftForeArm"));
    set(MP.RIGHT_ELBOW, bp("RightForeArm"));
    set(MP.LEFT_WRIST, bp("LeftHand"));
    set(MP.RIGHT_WRIST, bp("RightHand"));
    set(MP.LEFT_HIP, bp("LeftUpLeg"));
    set(MP.RIGHT_HIP, bp("RightUpLeg"));
    set(MP.LEFT_KNEE, bp("LeftLeg"));
    set(MP.RIGHT_KNEE, bp("RightLeg"));
    set(MP.LEFT_ANKLE, bp("LeftFoot"));
    set(MP.RIGHT_ANKLE, bp("RightFoot"));
    // Head: from Head bone + anatomical offsets (MediaPipe space: +z fwd, +x left).
    const head = bp("Head");
    const up = new THREE.Vector3(0, 1, 0);
    set(MP.NOSE, head.clone().addScaledVector(up, 0.1).add(new THREE.Vector3(0, 0, 0.03).applyQuaternion(inv)));
    set(MP.LEFT_EAR, head.clone().addScaledVector(up, 0.06).add(new THREE.Vector3(0.09, 0, 0).applyQuaternion(inv)));
    set(MP.RIGHT_EAR, head.clone().addScaledVector(up, 0.06).add(new THREE.Vector3(-0.09, 0, 0).applyQuaternion(inv)));
    set(MP.LEFT_EYE, head.clone().addScaledVector(up, 0.08).add(new THREE.Vector3(0.04, 0, 0.02).applyQuaternion(inv)));
    set(MP.RIGHT_EYE, head.clone().addScaledVector(up, 0.08).add(new THREE.Vector3(-0.04, 0, 0.02).applyQuaternion(inv)));
    // Hands: extend past wrist continuing the forearm direction (wrist - elbow).
    const ext = (w, e, d) => w.clone().add(w.clone().sub(e).normalize().multiplyScalar(d));
    const lw = bp("LeftHand"), le = bp("LeftForeArm");
    const rw = bp("RightHand"), re = bp("RightForeArm");
    set(MP.LEFT_INDEX, ext(lw, le, 0.18));
    set(MP.RIGHT_INDEX, ext(rw, re, 0.18));
    set(MP.LEFT_PINKY, ext(lw, le, 0.16));
    set(MP.RIGHT_PINKY, ext(rw, re, 0.16));
    set(MP.LEFT_THUMB, ext(lw, le, 0.1));
    set(MP.RIGHT_THUMB, ext(rw, re, 0.1));
    // Feet: toe forward, heel back (model space forward = yawAlign * +z).
    const fwd = new THREE.Vector3(0, 0, 1).applyQuaternion(rig.yawAlign);
    const la = bp("LeftFoot"), ra = bp("RightFoot");
    set(MP.LEFT_FOOT_INDEX, la.clone().addScaledVector(fwd, 0.16));
    set(MP.RIGHT_FOOT_INDEX, ra.clone().addScaledVector(fwd, 0.16));
    set(MP.LEFT_HEEL, la.clone().addScaledVector(fwd, -0.06));
    set(MP.RIGHT_HEEL, ra.clone().addScaledVector(fwd, -0.06));
    return lm;
}
/**
 * Right-hand straight punch built on modelRestLandmarks: rest -> extend ->
 * hold -> return. The punch drives along +z (MediaPipe forward).
 */
export function punchFromRest(restLm, fps = 30, seconds = 2) {
    const frames = [];
    const n = Math.round(fps * seconds);
    const env = (t) => {
        if (t < 0.25)
            return t / 0.25;
        if (t < 0.45)
            return 1;
        if (t < 0.75)
            return 1 - (t - 0.45) / 0.3;
        return 0;
    };
    for (let f = 0; f < n; f++) {
        const t = f / (n - 1);
        const e = env(t);
        const lm = restLm.map((p) => ({ ...p }));
        // Right wrist drives straight forward (+z) and slightly up; elbow follows
        // with a smaller forward motion so the arm extends rather than folds.
        const w = restLm[MP.RIGHT_WRIST], el = restLm[MP.RIGHT_ELBOW];
        const drive = 0.45 * e, lift = 0.1 * e;
        lm[MP.RIGHT_WRIST] = { ...w, z: w.z + drive, y: w.y + lift };
        lm[MP.RIGHT_ELBOW] = { ...el, z: el.z + drive * 0.35, y: el.y + lift * 0.5 };
        lm[MP.RIGHT_INDEX] = { ...lm[MP.RIGHT_INDEX], z: lm[MP.RIGHT_INDEX].z + drive, y: lm[MP.RIGHT_INDEX].y + lift };
        // Torso coils: left shoulder back, hips twist.
        lm[MP.LEFT_SHOULDER] = { ...lm[MP.LEFT_SHOULDER], z: lm[MP.LEFT_SHOULDER].z - 0.07 * e };
        lm[MP.RIGHT_SHOULDER] = { ...lm[MP.RIGHT_SHOULDER], z: lm[MP.RIGHT_SHOULDER].z + 0.04 * e };
        lm[MP.LEFT_HIP] = { ...lm[MP.LEFT_HIP], z: lm[MP.LEFT_HIP].z - 0.03 * e };
        lm[MP.RIGHT_HIP] = { ...lm[MP.RIGHT_HIP], z: lm[MP.RIGHT_HIP].z + 0.03 * e };
        frames.push(lm);
    }
    return frames;
}
