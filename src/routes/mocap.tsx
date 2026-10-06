import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import {
  loadPoseLandmarker,
  boneDirectionsFromLandmarks,
  DirectionSmoother,
  mapRigBones,
  captureRigState,
  applyMocapToRig,
  MocapRecorder,
  type PoseLandmarkerLike,
  type RigState,
  type BoneDirections,
} from "@/game3d/mediapipe-mocap";
import { assetUrl } from "@/game3d/asset-base";

export const Route = createFileRoute("/mocap")({ component: MocapDemo });

function MocapDemo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const threeRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState("Click Start to enable webcam + MediaPipe");
  const [recording, setRecording] = useState(false);
  const stateRef = useRef<{
    landmarker: PoseLandmarkerLike | null;
    rig: RigState | null;
    smoother: DirectionSmoother;
    recorder: MocapRecorder | null;
    renderer: THREE.WebGLRenderer | null;
    scene: THREE.Scene | null;
    camera: THREE.PerspectiveCamera | null;
    running: boolean;
  }>({ landmarker: null, rig: null, smoother: new DirectionSmoother(0.5), recorder: null, renderer: null, scene: null, camera: null, running: false });

  useEffect(() => {
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
      // Three.js scene
      const mount = threeRef.current!;
      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(480, 480);
      mount.appendChild(renderer.domElement);
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x14141c);
      const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 50);
      camera.position.set(0, 1.35, 3.4);
      camera.lookAt(0, 1.0, 0);
      scene.add(new THREE.HemisphereLight(0xffffff, 0x334, 1.1));
      const key = new THREE.DirectionalLight(0xffffff, 2.2);
      key.position.set(2.5, 4, 3);
      scene.add(key);
      const gltf = await new GLTFLoader().loadAsync(assetUrl("models/cast/CAIN_ELIAS_gear.glb"));
      const root = gltf.scene;
      const bbox = new THREE.Box3().setFromObject(root);
      root.scale.setScalar(1.8 / (bbox.max.y - bbox.min.y));
      const bbox2 = new THREE.Box3().setFromObject(root);
      root.position.y -= bbox2.min.y;
      scene.add(root);
      root.updateMatrixWorld(true);
      st.rig = captureRigState(root, mapRigBones(root));
      st.renderer = renderer; st.scene = scene; st.camera = camera;

      setStatus("Requesting webcam…");
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
      const video = videoRef.current!;
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
          const res = st.landmarker!.detectForVideo(video, now);
          const wl = res.worldLandmarks?.[0];
          if (wl && wl.length >= 33 && st.rig) {
            const dirs = st.smoother.smooth(boneDirectionsFromLandmarks(wl));
            applyMocapToRig(dirs, st.rig);
            if (st.recorder) st.recorder.pushDirections(dirs);
            drawSkeleton(canvasRef.current!, res.landmarks?.[0] ?? null);
          }
        }
        st.renderer!.render(st.scene!, st.camera!);
        requestAnimationFrame(loop);
      };
      loop();
    } catch (e) {
      setStatus("Error: " + (e as Error).message);
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

  return (
    <div style={{ padding: 24, color: "#eee", background: "#14141c", minHeight: "100vh", fontFamily: "monospace" }}>
      <h1>🎥 MediaPipe Mocap → AshLane Rig</h1>
      <p style={{ maxWidth: 700, color: "#aaa" }}>
        Webcam pose estimation (MediaPipe, Apache-2.0) drives a game character in real time.
        Bone directions from 33 landmarks are retargeted via swing-only world-space mapping.
        Hit Record to capture a clip as JSON.
      </p>
      <p><strong>Status:</strong> {status}</p>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <button onClick={start} style={btn}>Start Webcam</button>
        <button onClick={toggleRecord} style={btn} disabled={!stateRef.current.landmarker}>
          {recording ? "⏹ Stop & Download Clip" : "⏺ Record Clip"}
        </button>
      </div>
      <div style={{ display: "flex", gap: 16, marginTop: 16, flexWrap: "wrap" }}>
        <div>
          <div style={{ color: "#888", marginBottom: 4 }}>Webcam + skeleton</div>
          <video ref={videoRef} width={480} height={360} style={{ background: "#000", borderRadius: 8 }} muted playsInline />
          <canvas ref={canvasRef} width={480} height={360} style={{ position: "absolute", marginLeft: -480, borderRadius: 8, pointerEvents: "none" }} />
        </div>
        <div>
          <div style={{ color: "#888", marginBottom: 4 }}>Live-driven character</div>
          <div ref={threeRef} style={{ width: 480, height: 480, borderRadius: 8, overflow: "hidden" }} />
        </div>
      </div>
    </div>
  );
}

const btn: React.CSSProperties = {
  padding: "10px 18px", fontSize: 15, borderRadius: 8, border: "1px solid #555",
  background: "#2a2a3a", color: "#fff", cursor: "pointer", fontFamily: "monospace",
};

/** Draw MediaPipe skeleton overlay on a 2D canvas (image-space landmarks). */
function drawSkeleton(canvas: HTMLCanvasElement, lm: { x: number; y: number }[] | null) {
  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (!lm) return;
  const EDGES = [
    [11, 12], [11, 13], [13, 15], [12, 14], [14, 16],
    [11, 23], [12, 24], [23, 24],
    [23, 25], [25, 27], [24, 26], [26, 28],
  ];
  ctx.strokeStyle = "#00ff88"; ctx.lineWidth = 3;
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
