/**
 * City screenshot entry — builds the full AshLane city in a headless
 * browser page and exposes camera/turf controls for the shoot script.
 */
import * as THREE from "three";
import {
  buildCityAsync, CITY_DISTRICT_IDS, districtWorldPos, playerAttack,
  type City, type CityDistrictId,
} from "../../../src/game3d/city/index";

const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = false;
document.body.style.margin = "0";
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a10);

const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 600);

let city: City;
let simT = 0;

// Build asynchronously (one yield per district) so the page load event
// fires promptly; the shoot script waits for window.__cityReady.
const yieldFrame = () => new Promise<void>((r) => setTimeout(r, 0));

async function boot(): Promise<void> {
  const w = window as unknown as Record<string, unknown>;
  try {
    city = await buildCityAsync({ blocks: 1 }, (_id, done, total) => {
      w.__bootProgress = `${done}/${total}`;
    });
    scene.add(city.group);
    for (let i = 0; i < 10; i++) tickFrame(1 / 30);
    w.__city = api;
    w.__cityReady = true;
  } catch (e) {
    w.__bootError = String((e as Error)?.stack || e).slice(0, 2000);
  }
}

// per-district fog comes from group.userData — apply the active district's
function applyFog(id: CityDistrictId): void {
  const inst = city.districts[id];
  const fog = inst.district.group.userData.fog as { color: number; near: number; far: number };
  if (fog) scene.fog = new THREE.Fog(fog.color, fog.near, fog.far);
}

function tickFrame(dt: number): void {
  simT += dt;
  city.tick(simT, dt, simT);
}


function render(): void {
  renderer.render(scene, camera);
}

function lookAtDistrict(id: CityDistrictId, angle: "aerial" | "street" | "wide"): void {
  const [x, z] = districtWorldPos(id);
  applyFog(id);
  city.focus.x = x;
  city.focus.z = z;
  if (angle === "aerial") {
    camera.position.set(x + 55, 70, z + 55);
    camera.lookAt(x, 6, z);
  } else if (angle === "street") {
    // district center is the street grid (buildings ring the perimeter)
    camera.position.set(x, 3.2, z + 16);
    camera.lookAt(x, 5, z - 16);
  } else {
    camera.position.set(x + 90, 26, z + 90);
    camera.lookAt(x, 6, z);
  }
  // settle so flicker/tick/sky-drift state is stable
  for (let i = 0; i < 40; i++) tickFrame(1 / 30);
  render();
}

function lookUnderground(): void {
  const n = city.underground.nodes[2]; // st-neon
  scene.fog = new THREE.Fog(0x0a0c0a, 4, 40);
  camera.position.set(n.x - 7, -9 + 2.6, n.z + 2);
  camera.lookAt(n.x + 8, -9 + 1.6, n.z - 2);
  for (let i = 0; i < 10; i++) tickFrame(1 / 30);
  render();
}

function forceTurfFlip(id: CityDistrictId): void {
  // simulate a full capture: run attacks until it flips, then settle the blend
  const t = city.turf.districts[id];
  for (let i = 0; i < 40 && t.owner !== "player"; i++) {
    playerAttack(city.turf, id, simT + i);
    for (let j = 0; j < 30; j++) tickFrame(1 / 30);
  }
  for (let i = 0; i < 200; i++) tickFrame(1 / 30); // settle the 5s blend
}

function forceContest(id: CityDistrictId): void {
  const t = city.turf.districts[id];
  t.challenger = "hollows";
  t.control = 0.55;
  for (let i = 0; i < 60; i++) tickFrame(1 / 30);
}

const api = {
  lookAtDistrict, lookUnderground, forceTurfFlip, forceContest, tickFrame,
  districts: CITY_DISTRICT_IDS,
  debugSky: () => {
    const out: Record<string, unknown> = { focus: { x: city.focus.x, z: city.focus.z } };
    city.citySky.group.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.isMesh && (m.material as THREE.ShaderMaterial)?.uniforms?.uTop) {
        const u = (m.material as THREE.ShaderMaterial).uniforms as Record<string, { value: THREE.Color | number }>;
        out.dome = {
          top: (u.uTop.value as THREE.Color).getHexString(),
          bottom: (u.uBottom.value as THREE.Color).getHexString(),
          uDay: (u.uDay.value as number).toFixed(2),
        };
      }
      if (m.isMesh && m.renderOrder === -8) {
        const mat = m.material as THREE.MeshBasicMaterial;
        out.orb = { color: mat.color.getHexString(), opacity: mat.opacity.toFixed(2) };
      }
    });
    return out;
  },
};

boot();
