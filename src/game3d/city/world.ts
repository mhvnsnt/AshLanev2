/**
 * AshLane open city — assembly of the 9 districts into one connected world.
 *
 * - Each district generates from its worldgen base + its own art-direction
 *   palette (DISTRICT_ART_DIRECTION.md). The green/purple neon look belongs
 *   to the Neon District ONLY.
 * - Turf ownership renders as a blend layer (territory.ts): fog tint, wash
 *   lights, graffiti swap, cleanliness — transitions blend over ~5s.
 * - The underground (subways/sewers) sits beneath the grid, wired to surface
 *   entrances.
 * - District chunks follow the streaming state machine (federated/streaming).
 */

import * as THREE from "three";
import {
  generateDistrict, hitsCollider as districtHits, clampToDistrict,
  type GeneratedDistrict, type Collider, type SpawnPoint,
} from "../worldgen";
import {
  CITY_DISTRICTS, CITY_DISTRICT_IDS, toWorldgenDef, districtWorldPos,
  type CityDistrictId,
} from "./districts";
import {
  createTurfMap, tickTurf, turfVisualTargets, buildMarkingLayer,
  buildConflictLayer, tickTurfVisuals, swapMarkingLayer,
  type TurfMap, type MarkingLayer,
} from "./territory";
import { buildUnderground, type Underground } from "./underground";
import { buildCitySky, type CitySky } from "./city-sky";

export interface CityDistrictInstance {
  id: CityDistrictId;
  district: GeneratedDistrict;
  turf: { markings: MarkingLayer[]; conflict: THREE.Group };
  contested: boolean;
  lastOwner: string;
}

export interface City {
  group: THREE.Group;
  districts: Record<CityDistrictId, CityDistrictInstance>;
  turf: TurfMap;
  underground: Underground;
  colliders: Collider[];
  spawnPoints: SpawnPoint[];
  tick: (t: number, dt: number, now: number) => void;
  dispose: () => void;
  /** world-space hit test across all districts + underground */
  hits: (x: number, z: number, r?: number) => boolean;
  /** camera/player focus for the shared sky + fog (game-bind sets this) */
  focus: { x: number; z: number };
  citySky: CitySky;
}

const DISTRICT_SEEDS: Record<CityDistrictId, number> = {
  "neon-district": 5505, "marquee-mile": 2202, "civic": 6607,
  "projects": 1101, "industrial": 3303, "waterfront": 7708,
  "underground": 4404, "outskirts": 8809, "suburbs": 9900,
};

export function buildCity(opts: { blocks?: number } = {}): City {
  const parts = createCityParts(opts.blocks ?? 2);
  for (const id of CITY_DISTRICT_IDS) {
    if (id === "underground") continue;
    buildDistrictInto(parts, id);
  }
  return finishCity(parts);
}

/**
 * Async variant — yields to the event loop between districts so the page
 * load event can fire while the city streams in. The returned City is
 * identical to buildCity()'s.
 */
export async function buildCityAsync(
  opts: { blocks?: number } = {},
  onDistrict?: (id: CityDistrictId, done: number, total: number) => void
): Promise<City> {
  const yieldFrame = () => new Promise<void>((r) => setTimeout(r, 0));
  const parts = createCityParts(opts.blocks ?? 2);
  const ids = CITY_DISTRICT_IDS.filter((id) => id !== "underground");
  let done = 0;
  for (const id of ids) {
    buildDistrictInto(parts, id);
    done++;
    onDistrict?.(id, done, ids.length);
    await yieldFrame();
  }
  return finishCity(parts);
}

interface CityParts {
  blocks: number;
  group: THREE.Group;
  turf: TurfMap;
  districts: Record<CityDistrictId, CityDistrictInstance>;
  colliders: Collider[];
  spawnPoints: SpawnPoint[];
}

function createCityParts(blocks: number): CityParts {
  return {
    blocks,
    group: new THREE.Group(),
    turf: createTurfMap(),
    districts: {} as Record<CityDistrictId, CityDistrictInstance>,
    colliders: [],
    spawnPoints: [],
  };
}

function buildDistrictInto(parts: CityParts, id: CityDistrictId): void {
  const def = CITY_DISTRICTS[id];
  const wdef = toWorldgenDef(def);
  const gen = generateDistrict(wdef.id, DISTRICT_SEEDS[id], { blocks: parts.blocks, storytelling: false, sky: false });

  const [wx, wz] = districtWorldPos(id);
  gen.group.position.set(wx, 0, wz);
  applyDistrictPalette(gen.group, def);
  parts.group.add(gen.group);

  const worldW = gen.bounds.maxX - gen.bounds.minX;
  const worldD = gen.bounds.maxZ - gen.bounds.minZ;
  const markings = buildMarkingLayer(def, parts.turf.districts[id].owner, DISTRICT_SEEDS[id] ^ 0x51ab, worldW, worldD);
  gen.group.add(markings.group);
  const conflict = buildConflictLayer(DISTRICT_SEEDS[id] ^ 0xc0f1, worldW, worldD);
  gen.group.add(conflict);

  for (const c of gen.colliders) parts.colliders.push({ x: c.x + wx, z: c.z + wz, hw: c.hw, hd: c.hd });
  for (const s of gen.spawnPoints) parts.spawnPoints.push({ ...s, x: s.x + wx, z: s.z + wz });

  parts.districts[id] = {
    id, district: gen,
    turf: { markings: [markings], conflict },
    contested: false,
    lastOwner: String(parts.turf.districts[id].owner),
  };
}

function finishCity(parts: CityParts): City {
  const { group, turf, districts, colliders, spawnPoints } = parts;

  // ONE shared sky for the whole city (per-district domes would overlap).
  const citySky = buildCitySky();
  group.add(citySky.group);
  const focus = { x: 0, z: 0 }; // neon-district center; game-bind moves this

  // underground beneath the grid
  const underground = buildUnderground(777);
  group.add(underground.group);
  for (const c of underground.colliders) colliders.push(c);

  // connector streets between districts
  buildConnectors(group, colliders);

  const tick = (t: number, dt: number, now: number) => {
    tickTurf(turf, dt, now);
    underground.tick(t);
    citySky.update(focus.x, focus.z, t, dt);

    for (const id of CITY_DISTRICT_IDS) {
      if (id === "underground") continue;
      const inst = districts[id];
      const td = turf.districts[id];
      inst.district.tick(t, dt);
      const ownerKey = String(td.owner);
      if (ownerKey !== inst.lastOwner) {
        const worldW = inst.district.bounds.maxX - inst.district.bounds.minX;
        const worldD = inst.district.bounds.maxZ - inst.district.bounds.minZ;
        const next = buildMarkingLayer(
          CITY_DISTRICTS[id], td.owner, (DISTRICT_SEEDS[id] ^ (now | 0)) >>> 0, worldW, worldD
        );
        swapMarkingLayer(inst.turf, next, inst.district.group);
        inst.lastOwner = ownerKey;
      }
      inst.contested = td.challenger !== null;
      inst.turf.conflict.visible = inst.contested;
      const targets = turfVisualTargets(turf, id, CITY_DISTRICTS[id]);
      driftDistrictMood(inst.district.group, targets, dt);
      tickTurfVisuals(inst.turf, inst.contested, t, dt);
    }
  };

  const dispose = () => {
    for (const id of CITY_DISTRICT_IDS) {
      if (id === "underground") continue;
      districts[id].district.dispose();
    }
    underground.dispose();
    citySky.dispose();
  };

  const hits = (x: number, z: number, r = 0.4): boolean => {
    for (const c of colliders) {
      if (Math.abs(x - c.x) < c.hw + r && Math.abs(z - c.z) < c.hd + r) return true;
    }
    return false;
  };

  group.name = "ashlane-city";
  return { group, districts, turf, underground, colliders, spawnPoints, tick, dispose, hits, focus, citySky };
}

/**
 * Apply the district's own art-direction palette over the generated base.
 * Walks the generated group: hemisphere/ambient tint, fog userData, and the
 * sky dome uniforms get the district's colors.
 */
function applyDistrictPalette(group: THREE.Group, def: (typeof CITY_DISTRICTS)[CityDistrictId]): void {
  const p = def.palette;
  group.traverse((o) => {
    if ((o as THREE.HemisphereLight).isHemisphereLight) {
      const h = o as THREE.HemisphereLight;
      h.color.setHex(p.ambient);
      h.groundColor.setHex(p.hemiGround);
    }
    if ((o as THREE.DirectionalLight).isDirectionalLight) {
      (o as THREE.DirectionalLight).color.setHex(p.lampColor);
    }
  });
  group.userData.fog = { color: p.fogColor, near: def.fogNear, far: def.fogFar };
  group.userData.districtPalette = p;
}

/** Ease fog/ambient/wash toward turf targets each frame (smooth, no pops). */
function driftDistrictMood(
  group: THREE.Group,
  targets: ReturnType<typeof turfVisualTargets>,
  dt: number
): void {
  const k = Math.min(1, dt * 1.5);
  const fog = group.userData.fog as { color: number } | undefined;
  if (fog) {
    const c = new THREE.Color(fog.color).lerp(targets.fogColor, k);
    fog.color = c.getHex();
  }
  group.traverse((o) => {
    if ((o as THREE.HemisphereLight).isHemisphereLight) {
      const h = o as THREE.HemisphereLight;
      h.color.lerp(targets.ambientColor, k);
    }
  });
  // faction wash light follows the owner color
  const wash = group.getObjectByName("turf-wash") as THREE.PointLight | undefined;
  if (wash) wash.color.lerp(targets.washColor, k);
}

/** Ground strips connecting district centers so the city reads as connected. */
function buildConnectors(
  group: THREE.Group,
  colliders: Collider[]
): void {
  const roadMat = new THREE.MeshLambertMaterial({ color: 0x232326 });
  const pairs: [CityDistrictId, CityDistrictId][] = [
    ["projects", "neon-district"], ["neon-district", "marquee-mile"],
    ["neon-district", "industrial"], ["neon-district", "waterfront"],
    ["industrial", "civic"], ["marquee-mile", "civic"],
    ["projects", "outskirts"], ["waterfront", "outskirts"],
    ["marquee-mile", "suburbs"],
  ];
  for (const [a, b] of pairs) {
    const [ax, az] = districtWorldPos(a);
    const [bx, bz] = districtWorldPos(b);
    const dx = bx - ax, dz = bz - az;
    const len = Math.hypot(dx, dz);
    if (len < 1) continue;
    const road = new THREE.Mesh(new THREE.PlaneGeometry(10, len), roadMat);
    road.rotation.x = -Math.PI / 2;
    road.rotation.z = Math.atan2(dx, dz);
    road.position.set((ax + bx) / 2, 0.02, (az + bz) / 2);
    group.add(road);
    // street lamps along connectors
    const lampMat = new THREE.MeshLambertMaterial({ color: 0x3a3a3e });
    const steps = Math.floor(len / 26);
    for (let i = 1; i < steps; i++) {
      const t = i / steps;
      const lx = ax + dx * t + 6, lz = az + dz * t;
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 7, 6), lampMat);
      pole.position.set(lx, 3.5, lz);
      group.add(pole);
      const head = new THREE.Mesh(
        new THREE.SphereGeometry(0.3, 8, 6),
        new THREE.MeshBasicMaterial({ color: 0xffd9a0 })
      );
      head.position.set(lx, 7, lz);
      group.add(head);
      colliders.push({ x: lx, z: lz, hw: 0.2, hd: 0.2 });
    }
  }
  void clampToDistrict;
  void districtHits;
}
