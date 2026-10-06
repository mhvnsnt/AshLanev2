import { i as __toESM } from "../_runtime.mjs";
import { t as assetUrl } from "./asset-base-DeZoSF86.mjs";
import { G as require_jsx_runtime, K as require_react } from "../_libs/@tanstack/react-router+[...].mjs";
import { A as HemisphereLight, G as PerspectiveCamera, S as Color, T as DirectionalLight, X as Quaternion, c as GLTFLoader, d as WebGLRenderer, et as Scene, lt as Vector3, m as Box3 } from "../_libs/three.mjs";
//#region ../game-sweep/AshLanev2/node_modules/.nitro/vite/services/ssr/assets/mocap-qjOUWq9N.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
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
/** MediaPipe Pose landmark indices (0-32). */
var MP = {
	NOSE: 0,
	LEFT_EYE_INNER: 1,
	LEFT_EYE: 2,
	LEFT_EYE_OUTER: 3,
	RIGHT_EYE_INNER: 4,
	RIGHT_EYE: 5,
	RIGHT_EYE_OUTER: 6,
	LEFT_EAR: 7,
	RIGHT_EAR: 8,
	MOUTH_LEFT: 9,
	MOUTH_RIGHT: 10,
	LEFT_SHOULDER: 11,
	RIGHT_SHOULDER: 12,
	LEFT_ELBOW: 13,
	RIGHT_ELBOW: 14,
	LEFT_WRIST: 15,
	RIGHT_WRIST: 16,
	LEFT_PINKY: 17,
	RIGHT_PINKY: 18,
	LEFT_INDEX: 19,
	RIGHT_INDEX: 20,
	LEFT_THUMB: 21,
	RIGHT_THUMB: 22,
	LEFT_HIP: 23,
	RIGHT_HIP: 24,
	LEFT_KNEE: 25,
	RIGHT_KNEE: 26,
	LEFT_ANKLE: 27,
	RIGHT_ANKLE: 28,
	LEFT_HEEL: 29,
	RIGHT_HEEL: 30,
	LEFT_FOOT_INDEX: 31,
	RIGHT_FOOT_INDEX: 32
};
/** Canonical joint slots we drive. */
var MOCAP_JOINTS = [
	"Hips",
	"Spine",
	"Spine1",
	"Spine2",
	"Neck",
	"Head",
	"LeftShoulder",
	"LeftArm",
	"LeftForeArm",
	"LeftHand",
	"RightShoulder",
	"RightArm",
	"RightForeArm",
	"RightHand",
	"LeftUpLeg",
	"LeftLeg",
	"LeftFoot",
	"RightUpLeg",
	"RightLeg",
	"RightFoot"
];
var v3 = (l) => [
	l.x,
	l.y,
	l.z
];
var add = (a, b) => [
	a[0] + b[0],
	a[1] + b[1],
	a[2] + b[2]
];
var sub = (a, b) => [
	a[0] - b[0],
	a[1] - b[1],
	a[2] - b[2]
];
var scale = (a, s) => [
	a[0] * s,
	a[1] * s,
	a[2] * s
];
var len = (a) => Math.hypot(a[0], a[1], a[2]);
var mid = (a, b) => scale(add(a, b), .5);
var lerp3 = (a, b, t) => add(scale(a, 1 - t), scale(b, t));
/**
* For each driven joint, the world-space bone direction inferred from
* landmarks. Output is in MediaPipe space; applyMocapToRig maps it into
* the model's space via the rig's yawAlign.
*/
function boneDirectionsFromLandmarks(lm) {
	const L = (i) => v3(lm[i]);
	const dir = (a, b) => {
		const d = sub(b, a);
		const l = len(d) || 1;
		return new Vector3(d[0] / l, d[1] / l, d[2] / l);
	};
	const hipL = L(MP.LEFT_HIP), hipR = L(MP.RIGHT_HIP);
	const shoL = L(MP.LEFT_SHOULDER), shoR = L(MP.RIGHT_SHOULDER);
	const hipMid = mid(hipL, hipR), shoMid = mid(shoL, shoR);
	const neckPos = lerp3(shoMid, mid(L(MP.LEFT_EAR), L(MP.RIGHT_EAR)), .35);
	const torsoUp = dir(hipMid, shoMid);
	return {
		Hips: torsoUp,
		Spine: torsoUp,
		Spine1: torsoUp,
		Spine2: torsoUp,
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
		RightFoot: dir(L(MP.RIGHT_ANKLE), mid(L(MP.RIGHT_FOOT_INDEX), L(MP.RIGHT_HEEL)))
	};
}
var DirectionSmoother = class {
	prev = null;
	alpha;
	constructor(alpha = .45) {
		this.alpha = alpha;
	}
	smooth(d) {
		const out = {};
		for (const j of MOCAP_JOINTS) if (!this.prev) out[j] = d[j].clone();
		else out[j] = this.prev[j].clone().lerp(d[j], this.alpha).normalize();
		this.prev = out;
		return out;
	}
	reset() {
		this.prev = null;
	}
};
var MocapRecorder = class {
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
	get frameCount() {
		return this.frames.length;
	}
	reset() {
		this.frames = [];
		this.smoother.reset();
	}
	toClip(name) {
		return {
			name,
			fps: this.fps,
			jointOrder: [...MOCAP_JOINTS],
			frames: this.frames.map((f) => MOCAP_JOINTS.flatMap((j) => [
				f[j].x,
				f[j].y,
				f[j].z
			]))
		};
	}
	static clipFromJson(json) {
		return JSON.parse(json);
	}
	/** Sample a clip at time t (seconds), lerping between frames. */
	static sample(clip, t) {
		const n = clip.frames.length;
		if (n === 0) throw new Error("empty clip");
		const ft = Math.max(0, Math.min(n - 1, t * clip.fps));
		const i0 = Math.floor(ft), i1 = Math.min(n - 1, i0 + 1), a = ft - i0;
		const out = {};
		for (let k = 0; k < clip.jointOrder.length; k++) {
			const j = clip.jointOrder[k];
			const v0 = new Vector3(clip.frames[i0][k * 3], clip.frames[i0][k * 3 + 1], clip.frames[i0][k * 3 + 2]);
			const v1 = new Vector3(clip.frames[i1][k * 3], clip.frames[i1][k * 3 + 1], clip.frames[i1][k * 3 + 2]);
			out[j] = v0.lerp(v1, a).normalize();
		}
		return out;
	}
};
/**
* Build a slot -> THREE.Bone map by matching bone names against the
* canonical slot names (handles mixamo-colon "mixamorig:Hips", packed
* "mixamorigHips", stripped "Hips", UE "pelvis", etc.).
*/
function mapRigBones(root) {
	const bones = [];
	root.traverse((o) => {
		if (o.isBone) bones.push(o);
	});
	const normName = (s) => s.replace(/^mixamorig:/, "").replace(/^mixamorig/, "").toLowerCase();
	const aliases = {
		Hips: [
			"hips",
			"pelvis",
			"def-hips"
		],
		Spine: [
			"spine",
			"spine_01",
			"def-spine"
		],
		Spine1: [
			"spine1",
			"spine_02",
			"def-spine001"
		],
		Spine2: [
			"spine2",
			"spine_03",
			"def-spine002",
			"chest"
		],
		Neck: [
			"neck",
			"neck_01",
			"def-neck"
		],
		Head: ["head", "def-head"],
		LeftShoulder: [
			"leftshoulder",
			"clavicle_l",
			"shoulder.l"
		],
		LeftArm: [
			"leftarm",
			"upperarm_l",
			"upperarm.l"
		],
		LeftForeArm: [
			"leftforearm",
			"lowerarm_l",
			"lowerarm.l",
			"forearm.l"
		],
		LeftHand: [
			"lefthand",
			"hand_l",
			"hand.l"
		],
		RightShoulder: [
			"rightshoulder",
			"clavicle_r",
			"shoulder.r"
		],
		RightArm: [
			"rightarm",
			"upperarm_r",
			"upperarm.r"
		],
		RightForeArm: [
			"rightforearm",
			"lowerarm_r",
			"lowerarm.r",
			"forearm.r"
		],
		RightHand: [
			"righthand",
			"hand_r",
			"hand.r"
		],
		LeftUpLeg: [
			"leftupleg",
			"thigh_l",
			"upperleg.l"
		],
		LeftLeg: [
			"leftleg",
			"calf_l",
			"lowerleg.l",
			"shin.l"
		],
		LeftFoot: [
			"leftfoot",
			"foot_l",
			"foot.l"
		],
		RightUpLeg: [
			"rightupleg",
			"thigh_r",
			"upperleg.r"
		],
		RightLeg: [
			"rightleg",
			"calf_r",
			"lowerleg.r",
			"shin.r"
		],
		RightFoot: [
			"rightfoot",
			"foot_r",
			"foot.r"
		]
	};
	const map = /* @__PURE__ */ new Map();
	for (const j of MOCAP_JOINTS) {
		const want = aliases[j];
		const hit = bones.find((b) => want.includes(normName(b.name)));
		if (hit) map.set(j, hit);
	}
	return map;
}
/** Capture a rig's rest state. Call while the rig is at rest. */
function captureRigState(root, boneMap) {
	root.updateMatrixWorld(true);
	const restWorld = /* @__PURE__ */ new Map();
	boneMap.forEach((bone, j) => {
		restWorld.set(j, bone.getWorldQuaternion(new Quaternion()));
	});
	let fwd = new Vector3(0, 0, 1);
	const shoL = boneMap.get("LeftShoulder"), shoR = boneMap.get("RightShoulder");
	const up = new Vector3(0, 1, 0);
	if (shoL && shoR) {
		const pL = shoL.getWorldPosition(new Vector3());
		const pR = shoR.getWorldPosition(new Vector3());
		const leftDir = pL.sub(pR).normalize();
		fwd = new Vector3().crossVectors(leftDir, up);
		if (fwd.lengthSq() < 1e-6) fwd.set(0, 0, 1);
		fwd.normalize();
	}
	const yaw = Math.atan2(fwd.x, fwd.z);
	const yawAlign = new Quaternion().setFromAxisAngle(up, yaw);
	const dirsMp = boneDirectionsFromLandmarks(modelRestLandmarks({
		boneMap,
		yawAlign
	}));
	const restDirs = {};
	for (const j of MOCAP_JOINTS) restDirs[j] = dirsMp[j].clone().applyQuaternion(yawAlign).normalize();
	return {
		boneMap,
		restWorld,
		restDirs,
		yawAlign
	};
}
/**
* Drive a rig from bone directions (MediaPipe space, e.g. from
* boneDirectionsFromLandmarks or MocapRecorder.sample).
*
* For each joint: D = swing(d_rest, yawAlign * d_user); B_new = D * B_rest;
* bone.quaternion = inv(parentWorld) * B_new.
*/
function applyMocapToRig(dirs, rig) {
	const desired = /* @__PURE__ */ new Map();
	rig.boneMap.forEach((bone, j) => {
		const dTarget = dirs[j].clone().applyQuaternion(rig.yawAlign).normalize();
		const D = new Quaternion().setFromUnitVectors(rig.restDirs[j], dTarget);
		desired.set(j, D.multiply(rig.restWorld.get(j)));
	});
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
		if (parent) parent.updateWorldMatrix(true, false);
		const parentWorld = parent ? parent.getWorldQuaternion(new Quaternion()) : new Quaternion();
		bone.quaternion.copy(parentWorld.invert().multiply(desired.get(j)));
		bone.updateMatrix();
	}
	rig.boneMap.forEach((bone) => bone.updateWorldMatrix(false, true));
}
var MP_CDN = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.20";
var POSE_MODEL_URL = "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/latest/pose_landmarker_full.task";
/**
* Dynamically import @mediapipe/tasks-vision from CDN and create a
* PoseLandmarker in VIDEO running mode. Browser only.
*/
async function loadPoseLandmarker() {
	const { FilesetResolver, PoseLandmarker } = await import(
		/* @vite-ignore */
		`${MP_CDN}/vision_bundle.mjs`
);
	const fileset = await FilesetResolver.forVisionTasks(`${MP_CDN}/wasm`);
	return await PoseLandmarker.createFromOptions(fileset, {
		baseOptions: {
			modelAssetPath: POSE_MODEL_URL,
			delegate: "GPU"
		},
		runningMode: "VIDEO",
		numPoses: 1,
		minPoseDetectionConfidence: .5,
		minPosePresenceConfidence: .5,
		minTrackingConfidence: .5
	});
}
/**
* Build a rest landmark set FROM THE MODEL: takes bone world positions,
* converts to MediaPipe space (hips at origin, facing +z). Guarantees the
* synthetic rest matches the model's rest pose exactly.
*/
function modelRestLandmarks(rig) {
	const inv = rig.yawAlign.clone().invert();
	const hips = rig.boneMap.get("Hips").getWorldPosition(new Vector3());
	const toMp = (p) => {
		const q = p.clone().sub(hips).applyQuaternion(inv);
		return {
			x: q.x,
			y: q.y,
			z: q.z,
			visibility: 1
		};
	};
	const bp = (j) => rig.boneMap.get(j).getWorldPosition(new Vector3());
	const lm = Array.from({ length: 33 }, () => ({
		x: 0,
		y: 0,
		z: 0,
		visibility: 0
	}));
	const set = (i, p) => {
		lm[i] = toMp(p);
	};
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
	const head = bp("Head");
	const up = new Vector3(0, 1, 0);
	set(MP.NOSE, head.clone().addScaledVector(up, .1).add(new Vector3(0, 0, .03).applyQuaternion(inv)));
	set(MP.LEFT_EAR, head.clone().addScaledVector(up, .06).add(new Vector3(.09, 0, 0).applyQuaternion(inv)));
	set(MP.RIGHT_EAR, head.clone().addScaledVector(up, .06).add(new Vector3(-.09, 0, 0).applyQuaternion(inv)));
	set(MP.LEFT_EYE, head.clone().addScaledVector(up, .08).add(new Vector3(.04, 0, .02).applyQuaternion(inv)));
	set(MP.RIGHT_EYE, head.clone().addScaledVector(up, .08).add(new Vector3(-.04, 0, .02).applyQuaternion(inv)));
	const ext = (w, e, d) => w.clone().add(w.clone().sub(e).normalize().multiplyScalar(d));
	const lw = bp("LeftHand"), le = bp("LeftForeArm");
	const rw = bp("RightHand"), re = bp("RightForeArm");
	set(MP.LEFT_INDEX, ext(lw, le, .18));
	set(MP.RIGHT_INDEX, ext(rw, re, .18));
	set(MP.LEFT_PINKY, ext(lw, le, .16));
	set(MP.RIGHT_PINKY, ext(rw, re, .16));
	set(MP.LEFT_THUMB, ext(lw, le, .1));
	set(MP.RIGHT_THUMB, ext(rw, re, .1));
	const fwd = new Vector3(0, 0, 1).applyQuaternion(rig.yawAlign);
	const la = bp("LeftFoot"), ra = bp("RightFoot");
	set(MP.LEFT_FOOT_INDEX, la.clone().addScaledVector(fwd, .16));
	set(MP.RIGHT_FOOT_INDEX, ra.clone().addScaledVector(fwd, .16));
	set(MP.LEFT_HEEL, la.clone().addScaledVector(fwd, -.06));
	set(MP.RIGHT_HEEL, ra.clone().addScaledVector(fwd, -.06));
	return lm;
}
function MocapDemo() {
	const videoRef = (0, import_react.useRef)(null);
	const canvasRef = (0, import_react.useRef)(null);
	const threeRef = (0, import_react.useRef)(null);
	const [status, setStatus] = (0, import_react.useState)("Click Start to enable webcam + MediaPipe");
	const [recording, setRecording] = (0, import_react.useState)(false);
	const stateRef = (0, import_react.useRef)({
		landmarker: null,
		rig: null,
		smoother: new DirectionSmoother(.5),
		recorder: null,
		renderer: null,
		scene: null,
		camera: null,
		running: false
	});
	(0, import_react.useEffect)(() => {
		return () => {
			stateRef.current.running = false;
			stateRef.current.landmarker?.close();
			stateRef.current.renderer?.dispose();
		};
	}, []);
	async function start() {
		const st = stateRef.current;
		try {
			setStatus("Loading MediaPipe PoseLandmarker (CDN)…");
			st.landmarker = await loadPoseLandmarker();
			setStatus("Loading character…");
			const mount = threeRef.current;
			const renderer = new WebGLRenderer({ antialias: true });
			renderer.setSize(480, 480);
			mount.appendChild(renderer.domElement);
			const scene = new Scene();
			scene.background = new Color(1315868);
			const camera = new PerspectiveCamera(32, 1, .1, 50);
			camera.position.set(0, 1.35, 3.4);
			camera.lookAt(0, 1, 0);
			scene.add(new HemisphereLight(16777215, 820, 1.1));
			const key = new DirectionalLight(16777215, 2.2);
			key.position.set(2.5, 4, 3);
			scene.add(key);
			const root = (await new GLTFLoader().loadAsync(assetUrl("models/cast/CAIN_ELIAS_gear.glb"))).scene;
			const bbox = new Box3().setFromObject(root);
			root.scale.setScalar(1.8 / (bbox.max.y - bbox.min.y));
			const bbox2 = new Box3().setFromObject(root);
			root.position.y -= bbox2.min.y;
			scene.add(root);
			root.updateMatrixWorld(true);
			st.rig = captureRigState(root, mapRigBones(root));
			st.renderer = renderer;
			st.scene = scene;
			st.camera = camera;
			setStatus("Requesting webcam…");
			const stream = await navigator.mediaDevices.getUserMedia({ video: {
				width: 640,
				height: 480
			} });
			const video = videoRef.current;
			video.srcObject = stream;
			await video.play();
			setStatus("Running — move in front of the camera!");
			st.running = true;
			let lastT = -1;
			const loop = () => {
				if (!st.running) return;
				const now = performance.now();
				if (video.currentTime !== lastT && video.readyState >= 2) {
					lastT = video.currentTime;
					const res = st.landmarker.detectForVideo(video, now);
					const wl = res.worldLandmarks?.[0];
					if (wl && wl.length >= 33 && st.rig) {
						const dirs = st.smoother.smooth(boneDirectionsFromLandmarks(wl));
						applyMocapToRig(dirs, st.rig);
						if (st.recorder) st.recorder.pushDirections(dirs);
						drawSkeleton(canvasRef.current, res.landmarks?.[0] ?? null);
					}
				}
				st.renderer.render(st.scene, st.camera);
				requestAnimationFrame(loop);
			};
			loop();
		} catch (e) {
			setStatus("Error: " + e.message);
		}
	}
	function toggleRecord() {
		const st = stateRef.current;
		if (!st.recorder) {
			st.recorder = new MocapRecorder(30);
			setRecording(true);
			setStatus("Recording… perform your move!");
		} else {
			const clip = st.recorder.toClip("webcam-" + Date.now());
			st.recorder = null;
			setRecording(false);
			const blob = new Blob([JSON.stringify(clip)], { type: "application/json" });
			const a = document.createElement("a");
			a.href = URL.createObjectURL(blob);
			a.download = clip.name + ".json";
			a.click();
			setStatus(`Saved ${clip.frames.length} frames → ${clip.name}.json`);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		style: {
			padding: 24,
			color: "#eee",
			background: "#14141c",
			minHeight: "100vh",
			fontFamily: "monospace"
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: "🎥 MediaPipe Mocap → AshLane Rig" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				style: {
					maxWidth: 700,
					color: "#aaa"
				},
				children: "Webcam pose estimation (MediaPipe, Apache-2.0) drives a game character in real time. Bone directions from 33 landmarks are retargeted via swing-only world-space mapping. Hit Record to capture a clip as JSON."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Status:" }),
				" ",
				status
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: {
					display: "flex",
					gap: 16,
					flexWrap: "wrap"
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: start,
					style: btn,
					children: "Start Webcam"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: toggleRecord,
					style: btn,
					disabled: !stateRef.current.landmarker,
					children: recording ? "⏹ Stop & Download Clip" : "⏺ Record Clip"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: {
					display: "flex",
					gap: 16,
					marginTop: 16,
					flexWrap: "wrap"
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						style: {
							color: "#888",
							marginBottom: 4
						},
						children: "Webcam + skeleton"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
						ref: videoRef,
						width: 480,
						height: 360,
						style: {
							background: "#000",
							borderRadius: 8
						},
						muted: true,
						playsInline: true
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
						ref: canvasRef,
						width: 480,
						height: 360,
						style: {
							position: "absolute",
							marginLeft: -480,
							borderRadius: 8,
							pointerEvents: "none"
						}
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					style: {
						color: "#888",
						marginBottom: 4
					},
					children: "Live-driven character"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					ref: threeRef,
					style: {
						width: 480,
						height: 480,
						borderRadius: 8,
						overflow: "hidden"
					}
				})] })]
			})
		]
	});
}
var btn = {
	padding: "10px 18px",
	fontSize: 15,
	borderRadius: 8,
	border: "1px solid #555",
	background: "#2a2a3a",
	color: "#fff",
	cursor: "pointer",
	fontFamily: "monospace"
};
/** Draw MediaPipe skeleton overlay on a 2D canvas (image-space landmarks). */
function drawSkeleton(canvas, lm) {
	const ctx = canvas.getContext("2d");
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	if (!lm) return;
	const EDGES = [
		[11, 12],
		[11, 13],
		[13, 15],
		[12, 14],
		[14, 16],
		[11, 23],
		[12, 24],
		[23, 24],
		[23, 25],
		[25, 27],
		[24, 26],
		[26, 28]
	];
	ctx.strokeStyle = "#00ff88";
	ctx.lineWidth = 3;
	for (const [a, b] of EDGES) {
		if (!lm[a] || !lm[b]) continue;
		ctx.beginPath();
		ctx.moveTo(lm[a].x * canvas.width, lm[a].y * canvas.height);
		ctx.lineTo(lm[b].x * canvas.width, lm[b].y * canvas.height);
		ctx.stroke();
	}
	ctx.fillStyle = "#ff4488";
	for (const p of lm) {
		ctx.beginPath();
		ctx.arc(p.x * canvas.width, p.y * canvas.height, 4, 0, Math.PI * 2);
		ctx.fill();
	}
}
//#endregion
export { MocapDemo as component };
