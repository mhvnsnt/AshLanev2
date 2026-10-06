/**
 * AshLane shared city sky — ONE sky dome for the whole open city.
 *
 * Nine overlapping per-district domes z-fight and engulf the camera, so the
 * city uses a single dome that follows the player and crossfades its colors
 * toward whichever district's sky identity you're standing in. District
 * lighting/fog/props still carry the local mood; the sky is the blend.
 */

import * as THREE from "three";
import { buildSky, SKIES, type BuiltSky } from "../sky";
import { CITY_DISTRICTS, districtWorldPos, type CityDistrict, type CityDistrictId } from "./districts";

export interface CitySky {
  sky: BuiltSky;
  group: THREE.Group;
  /** per-frame: follow (x,z), drift colors toward the local district sky */
  update: (x: number, z: number, t: number, dt: number) => void;
  dispose: () => void;
}

function nearestDistrict(x: number, z: number): CityDistrictId {
  let best: CityDistrictId = "neon-district";
  let bestD = Infinity;
  for (const id of Object.keys(CITY_DISTRICTS) as CityDistrictId[]) {
    if (id === "underground") continue;
    const [cx, cz] = districtWorldPos(id);
    const d = (x - cx) * (x - cx) + (z - cz) * (z - cz);
    if (d < bestD) { bestD = d; best = id; }
  }
  return best;
}

export function buildCitySky(): CitySky {
  const sky = buildSky("strip"); // night neutral; update() drifts to local
  const group = sky.group;
  // city scale: dome radius 140 -> 420 so it covers the whole grid
  group.scale.setScalar(3);

  // grab the dome shader uniforms once
  let domeUniforms: Record<string, { value: unknown }> | null = null;
  group.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (mesh.isMesh && (mesh.material as THREE.ShaderMaterial)?.uniforms?.uTop && !domeUniforms) {
      domeUniforms = (mesh.material as THREE.ShaderMaterial).uniforms as Record<string, { value: unknown }>;
    }
  });

  const tmpA = new THREE.Color();

  const dayFor = (t: CityDistrict["timeOfDay"]): number =>
    t === "day" ? 0.95 : t === "dawn" ? 0.6 : t === "dusk" ? 0.45 : 0.12;

  const update = (x: number, z: number, t: number, dt: number) => {
    sky.tick(t);
    group.position.set(x, 0, z);
    const id = nearestDistrict(x, z);
    const cityDef = CITY_DISTRICTS[id];
    const def = SKIES[cityDef.skyBase];
    const day = dayFor(cityDef.timeOfDay);
    // Smooth drift toward the local district's sky (~1s) — never a pop.
    // (Note: SKY_FRAG must include <colorspace_fragment> or the gradient
    // renders dark; see src/game3d/sky.ts.)
    const k = Math.min(1, dt * 2.5);
    if (domeUniforms) {
      const u = domeUniforms as unknown as {
        uTop: { value: THREE.Color };
        uBottom: { value: THREE.Color };
        uHorizon: { value: THREE.Color };
        uHorizonIntensity: { value: number };
        uDay: { value: number };
      };
      u.uTop.value.lerp(tmpA.setHex(def.top), k);
      u.uBottom.value.lerp(tmpA.setHex(def.bottom), k);
      u.uHorizon.value.lerp(tmpA.setHex(def.horizon), k);
      u.uHorizonIntensity.value = THREE.MathUtils.lerp(u.uHorizonIntensity.value, def.horizonIntensity, k);
      u.uDay.value = THREE.MathUtils.lerp(u.uDay.value, day, k);
    }
  };

  return { sky, group, update, dispose: () => sky.dispose() };
}
