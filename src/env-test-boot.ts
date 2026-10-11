/** Temporary visual test boot for env-quality.ts — deleted after verification. */
import * as THREE from "three";
import { EnvQuality, registerSway } from "./game3d/env-quality";

const canvas = document.getElementById("c") as HTMLCanvasElement;
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.12;
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1c2422);
scene.fog = new THREE.Fog(0x1c2422, 14, 60);
const camera = new THREE.PerspectiveCamera(58, 16 / 9, 0.1, 240);
camera.position.set(0, 3, 12);
camera.lookAt(0, 2, 0);

const envQ = new EnvQuality(scene, { phone: false, renderer, camera });
envQ.setStage("ward", "neon-district");
const groundMat = new THREE.MeshPhongMaterial({ color: 0x2a3544, shininess: 22 });
envQ.treatGround(groundMat, true);
const ground = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), groundMat);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

// Swaying banner test
const bgeo = new THREE.PlaneGeometry(1, 2, 4, 6);
bgeo.translate(0, -1, 0);
const banner = new THREE.Mesh(
  bgeo,
  new THREE.MeshLambertMaterial({ color: 0x1f6f5c, side: THREE.DoubleSide }),
);
banner.position.set(-3, 5, 0);
registerSway(banner, { amp: 0.22, freq: 1.4 });
scene.add(banner);

const hemi = new THREE.HemisphereLight(0xd5e4f4, 0x2a2428, 1.0);
scene.add(hemi);

let last = performance.now();
function frame(now: number) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  envQ.tick(dt);
  renderer.render(scene, camera);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
(window as unknown as { __envReady: boolean }).__envReady = true;
