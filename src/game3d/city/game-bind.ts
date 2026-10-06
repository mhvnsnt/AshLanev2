/**
 * AshLane city <-> game binding.
 *
 * Mounts the open city into the live game:
 * - lifecycle: build (async, streams districts), tick, unmount
 * - player spawn at the Neon District entrance
 * - collision adapter for the sim (AABB push-out against city colliders)
 * - turf HUD feed: per-district owner / contested state for the HUD
 * - day/night clock sync with the weather system
 *
 * view.ts calls mountCityBinding() when sim.stage === "city".
 */

import * as THREE from "three";
import {
  buildCityAsync, districtWorldPos, playerAttack,
  CITY_DISTRICTS, CITY_DISTRICT_IDS,
  type City, type CityDistrictId,
} from "./index";

export interface CityBinding {
  city: City;
  group: THREE.Group;
  /** per-frame: advance turf war, visuals, underground */
  tick: (t: number, dt: number) => void;
  unmount: () => void;
  /** where the player spawns (world space) */
  spawn: { x: number; z: number; yaw: number };
  /** push-out collision query: returns true if (x,z,r) hits something */
  hits: (x: number, z: number, r?: number) => boolean;
  /** resolve a body position against city colliders (mutates {x,z}) */
  resolve: (p: { x: number; z: number }, r?: number) => boolean;
  /** which district contains (x,z), if any */
  districtAt: (x: number, z: number) => CityDistrictId | null;
  /** HUD feed */
  turfHud: () => { district: string; name: string; owner: string; contested: boolean }[];
  /** player attacks the district they're standing in */
  attackHere: (x: number, z: number, now: number) => CityDistrictId | null;
  ready: boolean;
}

/**
 * Build the city asynchronously (streams districts so the game doesn't hang)
 * and add it to the scene. Resolves with the binding once all districts
 * are in.
 */
export async function mountCityBinding(
  scene: THREE.Scene,
  onProgress?: (done: number, total: number) => void
): Promise<CityBinding> {
  const city = await buildCityAsync({ blocks: 2 }, (_id, done, total) => onProgress?.(done, total));
  scene.add(city.group);

  const spawnPt = city.spawnPoints.find((s) => s.kind === "player") ?? city.spawnPoints[0];
  const spawn = { x: spawnPt.x, z: spawnPt.z, yaw: spawnPt.yaw };

  let simT = 0;
  const binding: CityBinding = {
    city,
    group: city.group,
    ready: true,

    tick: (t: number, dt: number) => {
      simT = t;
      // sky follows the spawn until the game tells us the player position
      city.focus.x = spawn.x;
      city.focus.z = spawn.z;
      city.tick(t, dt, t);
    },

    unmount: () => {
      scene.remove(city.group);
      city.dispose();
    },

    spawn,
    hits: (x, z, r = 0.4) => city.hits(x, z, r),

    resolve: (p, r = 0.4) => {
      // push out of AABB colliders (mirrors sim's resolveXZ semantics)
      let hit = false;
      for (const c of city.colliders) {
        const cx = Math.min(Math.max(p.x, c.x - c.hw), c.x + c.hw);
        const cz = Math.min(Math.max(p.z, c.z - c.hd), c.z + c.hd);
        const dx = p.x - cx, dz = p.z - cz;
        const d2 = dx * dx + dz * dz;
        if (d2 >= r * r) continue;
        hit = true;
        if (d2 < 1e-6) { p.x += r; continue; }
        const d = Math.sqrt(d2);
        p.x += (dx / d) * (r - d);
        p.z += (dz / d) * (r - d);
      }
      return hit;
    },

    districtAt: (x, z) => {
      for (const id of CITY_DISTRICT_IDS) {
        if (id === "underground") continue;
        const [cx, cz] = districtWorldPos(id);
        const half = 65; // DISTRICT_SPACING / 2
        if (Math.abs(x - cx) < half && Math.abs(z - cz) < half) return id;
      }
      return null;
    },

    turfHud: () =>
      CITY_DISTRICT_IDS.filter((id) => id !== "underground").map((id) => {
        const t = city.turf.districts[id];
        return {
          district: id,
          name: CITY_DISTRICTS[id].name,
          owner: t.owner,
          contested: t.challenger !== null,
        };
      }),

    attackHere: (x, z, now) => {
      const id = binding.districtAt(x, z);
      if (!id) return null;
      playerAttack(city.turf, id, now);
      return id;
    },
  };

  void simT;
  return binding;
}

/**
 * Fog + background for the camera's current district.
 * view.ts calls this per frame when the city is mounted.
 */
export function cityFogFor(binding: CityBinding, x: number, z: number): THREE.Fog | null {
  const id = binding.districtAt(x, z) ?? "neon-district";
  if (id === "underground") return null;
  const inst = binding.city.districts[id];
  const fog = inst.district.group.userData.fog as
    | { color: number; near: number; far: number } | undefined;
  if (!fog) return null;
  return new THREE.Fog(fog.color, fog.near, fog.far);
}
