/**
 * AshLane territory-war system — persistent faction ownership per district.
 *
 * Owner requirements:
 * - Named districts with persistent faction ownership that VISIBLY changes:
 *   lighting colors, graffiti, props, cleanliness/grime, fog tint.
 * - Contested districts blend two factions' aesthetics + conflict indicators
 *   (smoke, damage, flickering lights).
 * - Turf war: player captures districts, AI factions try to reclaim border
 *   districts, ownership transitions blend (never pop), day/night affects
 *   which factions are active.
 * - GTA San Andreas turf mechanics are inspiration, not final canon.
 *
 * Faction color is a LAYER blended over the district's own identity
 * (docs/DISTRICT_ART_DIRECTION.md) — never a replacement.
 */

import * as THREE from "three";
import type { FactionId, Rng } from "../worldgen";
import { createRng } from "../worldgen";
import { addTerritoryMarkings } from "../worldgen-streets";
import { CITY_DISTRICTS, type CityDistrictId, type CityDistrict } from "./districts";
import { FACTION_VISUALS } from "./factions";

/** The player is their own force in the turf war. */
export type TurfOwner = FactionId | "player";

export interface DistrictTurf {
  district: CityDistrictId;
  /** current owner */
  owner: TurfOwner;
  /** faction currently attacking, if any */
  challenger: TurfOwner | null;
  /** 0..1 — challenger's progress toward taking the district */
  control: number;
  /** 0..1 — visual blend toward the CURRENT owner (1 = fully applied) */
  blend: number;
  /** previous owner, for blend-out during transitions */
  prevOwner: TurfOwner | null;
  /** game-time of the last attack (drives AI cooldowns) */
  lastAttack: number;
  /** AI reclaim timer for border pressure */
  pressure: number;
}

export interface TurfMap {
  districts: Record<CityDistrictId, DistrictTurf>;
  /** game time in hours 0..24 (drives day/night faction activity) */
  timeOfDay: number;
}

const BLEND_TIME = 5; // seconds for a full ownership visual transition

export function createTurfMap(): TurfMap {
  const districts = {} as Record<CityDistrictId, DistrictTurf>;
  for (const id of Object.keys(CITY_DISTRICTS) as CityDistrictId[]) {
    districts[id] = {
      district: id,
      owner: CITY_DISTRICTS[id].homeFaction,
      challenger: null,
      control: 0,
      blend: 1,
      prevOwner: null,
      lastAttack: -999,
      pressure: 0,
    };
  }
  return { districts, timeOfDay: 20 };
}

/** Adjacent districts on the city grid (border pressure + reclaim targets). */
export function neighbors(id: CityDistrictId): CityDistrictId[] {
  const g = CITY_DISTRICTS[id].grid;
  const out: CityDistrictId[] = [];
  for (const oid of Object.keys(CITY_DISTRICTS) as CityDistrictId[]) {
    if (oid === id || oid === "underground") continue;
    const og = CITY_DISTRICTS[oid].grid;
    if (Math.abs(og[0] - g[0]) + Math.abs(og[1] - g[1]) === 1) out.push(oid);
  }
  return out;
}

/**
 * Day/night activity multiplier per faction (owner direction: day/night
 * affects which factions are active).
 */
export function factionActivity(faction: TurfOwner, timeOfDay: number): number {
  const h = timeOfDay;
  const night = h >= 21 || h < 5 ? 1 : h >= 18 || h < 8 ? 0.7 : 0.35;
  const day = h >= 8 && h < 18 ? 1 : h >= 6 && h < 20 ? 0.7 : 0.4;
  switch (faction) {
    case "hollows": return 0.5 + 0.9 * night;      // own the night
    case "authority": return 0.5 + 0.9 * day;      // own the day
    case "ashes": return (h >= 16 && h < 22) ? 1.5 : 0.9; // dusk raiders
    case "combine": return 1.0;                    // money never sleeps
    case "player": return 1.2;                    // the player is always dangerous
    default: return 0.6;
  }
}

export interface TurfTickEvents {
  /** districts whose ownership flipped this tick */
  flipped: CityDistrictId[];
  /** districts newly contested this tick */
  contested: CityDistrictId[];
}

/**
 * Advance the turf war. AI factions build pressure on border districts owned
 * by rivals and eventually attack; contests resolve by activity-weighted
 * control; visuals blend smoothly toward the new owner.
 */
export function tickTurf(map: TurfMap, dt: number, now: number): TurfTickEvents {
  const events: TurfTickEvents = { flipped: [], contested: [] };
  map.timeOfDay = (map.timeOfDay + dt / 240) % 24; // full day = 4 min

  for (const id of Object.keys(map.districts) as CityDistrictId[]) {
    const t = map.districts[id];
    const wasContested = t.challenger !== null;

    // -- AI pressure: rivals on the border eye this district --
    if (!t.challenger && now - t.lastAttack > 45) {
      for (const n of neighbors(id)) {
        const nt = map.districts[n];
        if (nt.owner === t.owner || nt.owner === "player") continue;
        // rival faction bordering us builds pressure
        t.pressure += dt * factionActivity(nt.owner, map.timeOfDay) * 0.02;
        if (t.pressure > 1) {
          t.challenger = nt.owner;
          t.control = 0.15;
          t.lastAttack = now;
          t.pressure = 0;
          events.contested.push(id);
        }
        break; // one rival at a time
      }
    }

    // -- resolve active contest --
    if (t.challenger) {
      const atk = factionActivity(t.challenger, map.timeOfDay);
      const def = factionActivity(t.owner, map.timeOfDay);
      // attacker gains control; defender claws some back
      t.control += dt * 0.03 * atk;
      t.control -= dt * 0.015 * def * (t.owner === "player" ? 1.5 : 1);
      t.control = Math.max(0, Math.min(1.2, t.control));
      t.lastAttack = now;

      if (t.control >= 1) {
        t.prevOwner = t.owner;
        t.owner = t.challenger;
        t.challenger = null;
        t.control = 0;
        t.blend = 0; // start the 5s visual transition
        events.flipped.push(id);
      } else if (t.control <= 0) {
        t.challenger = null; // attack repelled
        t.control = 0;
      }
    } else {
      t.pressure = Math.max(0, t.pressure - dt * 0.01);
    }

    // -- smooth visual blend toward current owner --
    if (t.blend < 1) {
      t.blend = Math.min(1, t.blend + dt / BLEND_TIME);
    }
    if (!wasContested && t.challenger) events.contested.push(id);
  }
  return events;
}

/** Player starts (or joins) an attack on a district for their own crew. */
export function playerAttack(map: TurfMap, id: CityDistrictId, now: number): void {
  const t = map.districts[id];
  if (t.owner === "player") return;
  if (t.challenger !== "player") {
    t.challenger = "player";
    t.control = Math.max(t.control, 0.15);
  }
  t.control = Math.min(1.2, t.control + 0.12); // each attack pushes control
  t.lastAttack = now;
}

// ---------------------------------------------------------------------------
// Visuals — ownership as a blend layer over district identity
// ---------------------------------------------------------------------------

export interface TurfVisualTargets {
  fogColor: THREE.Color;
  ambientColor: THREE.Color;
  washColor: THREE.Color;   // faction accent light
  graffitiFaction: FactionId; // which faction's tags show
  graffitiOpacity: number;  // authority cleans -> 0
  grimeOpacity: number;     // 0 = pristine, 1 = scorched/ruined
}

function ownerColor(owner: TurfOwner): number {
  if (owner === "player") return 0x39ff6e;
  return FACTION_VISUALS[owner].colors[0];
}

/** Compute what the district should look like under this turf state. */
export function turfVisualTargets(
  map: TurfMap, id: CityDistrictId, base: CityDistrict
): TurfVisualTargets {
  const t = map.districts[id];
  const owner: TurfOwner = t.owner;
  const visual = owner === "player"
    ? { colors: [0x39ff6e], tagDensity: 0.7, cleanliness: 0.6 }
    : FACTION_VISUALS[owner as FactionId];

  // fog tint: district fog lerped toward faction color (subtle, 25%)
  const fog = new THREE.Color(base.palette.fogColor)
    .lerp(new THREE.Color(visual.colors[0]), 0.25 * t.blend);
  const ambient = new THREE.Color(base.palette.ambient)
    .lerp(new THREE.Color(visual.colors[0]), 0.15 * t.blend);
  const wash = new THREE.Color(ownerColor(owner));

  // contested: blend challenger in too
  let graffitiFaction: FactionId =
    owner === "player" ? base.homeFaction : (owner as FactionId);
  if (t.challenger) {
    const c: FactionId = t.challenger === "player" ? base.homeFaction : (t.challenger as FactionId);
    fog.lerp(new THREE.Color(ownerColor(t.challenger)), 0.2 * t.control);
    wash.lerp(new THREE.Color(ownerColor(t.challenger)), 0.5 * t.control);
    // contested walls show BOTH factions' tags
    graffitiFaction = t.control > 0.5 ? c : graffitiFaction;
  }

  const tagDensity = visual.tagDensity * base.graffiti;
  const cleanliness = visual.cleanliness;

  return {
    fogColor: fog,
    ambientColor: ambient,
    washColor: wash,
    graffitiFaction,
    graffitiOpacity: Math.min(1, tagDensity * 2) * (cleanliness < 0.9 ? 1 : 0.15),
    grimeOpacity: (1 - cleanliness) * 0.55,
  };
}

/**
 * Ownership marking layer: a swappable group holding faction tags + wash
 * light + grime overlay. On ownership flip, the old layer crossfades out
 * over ~5s while the new one fades in — never a pop.
 */
export interface MarkingLayer {
  group: THREE.Group;
  faction: TurfOwner;
  /** materials to fade */
  mats: THREE.Material[];
  lights: THREE.Light[];
}

export function buildMarkingLayer(
  base: CityDistrict, faction: TurfOwner, seed: number,
  worldW: number, worldD: number
): MarkingLayer {
  const rng = createRng(seed);
  const group = new THREE.Group();
  group.name = `markings-${faction}`;
  const mats: THREE.Material[] = [];
  const lights: THREE.Light[] = [];

  // wrap the existing territory markings in this layer so we can fade them
  const tmp = new THREE.Group();
  const def = {
    id: base.base, name: base.name,
    faction: (faction === "player" ? base.homeFaction : faction) as FactionId,
    tagline: base.tagline, streetWidth: 10, blockSize: 34,
    buildingHeight: [8, 24] as [number, number],
    ground: base.palette.ground, road: base.palette.road,
    buildingTones: base.palette.buildingTones, accent: ownerColor(faction),
    lampColor: base.palette.lampColor, fogColor: base.palette.fogColor,
    fogNear: base.fogNear, fogFar: base.fogFar, ambient: base.palette.ambient,
    graffiti: Math.max(0.15, base.graffiti), neon: base.neon, propDensity: base.propDensity,
  };
  addTerritoryMarkings(tmp, def, rng, worldW, worldD);
  tmp.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (mesh.isMesh) {
      const m = mesh.material as THREE.Material;
      if (m) { m.transparent = true; mats.push(m); }
    }
    const l = o as THREE.Light;
    if (l.isLight) lights.push(l);
  });
  group.add(tmp);

  // grime overlay: dark scorched patches on the ground for low-cleanliness factions
  const visual = faction === "player"
    ? { cleanliness: 0.6 } : FACTION_VISUALS[faction as FactionId];
  const grime = (1 - visual.cleanliness) * 0.5;
  if (grime > 0.05) {
    const gc = document.createElement("canvas");
    gc.width = gc.height = 128;
    const g = gc.getContext("2d")!;
    for (let i = 0; i < 40; i++) {
      g.fillStyle = `rgba(8,6,5,${(rng.next() * grime * 0.5).toFixed(2)})`;
      g.beginPath();
      g.ellipse(rng.next() * 128, rng.next() * 128, rng.range(8, 40), rng.range(6, 26), rng.next() * 3, 0, 7);
      g.fill();
    }
    const grimeTex = new THREE.CanvasTexture(gc);
    grimeTex.wrapS = grimeTex.wrapT = THREE.RepeatWrapping;
    grimeTex.repeat.set(3, 3);
    const grimeMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(worldW, worldD),
      new THREE.MeshBasicMaterial({ map: grimeTex, transparent: true, depthWrite: false })
    );
    grimeMesh.rotation.x = -Math.PI / 2;
    grimeMesh.position.y = 0.03;
    const gm = grimeMesh.material as THREE.MeshBasicMaterial;
    mats.push(gm);
    group.add(grimeMesh);
  }

  group.userData.mats = mats;
  return { group, faction, mats, lights };
}

/** Conflict indicators for contested districts: smoke, damage, flicker. */
export function buildConflictLayer(seed: number, worldW: number, worldD: number): THREE.Group {
  const rng = createRng(seed ^ 0x9e37);
  const group = new THREE.Group();
  group.name = "conflict";

  // smoke columns: translucent dark planes that drift (animated in tick)
  // placed near the district center so they're visible from street level
  for (let i = 0; i < 5; i++) {
    const h = rng.range(8, 14);
    const smoke = new THREE.Mesh(
      new THREE.PlaneGeometry(rng.range(3, 5), h),
      new THREE.MeshBasicMaterial({
        color: 0x1a1a1a, transparent: true, opacity: 0.45,
        depthWrite: false, side: THREE.DoubleSide,
      })
    );
    smoke.position.set(rng.range(-10, 10), h / 2, rng.range(-10, 10));
    smoke.userData.smoke = true;
    smoke.userData.phase = rng.next() * 10;
    group.add(smoke);
  }

  // damage: scorch decals on the ground
  for (let i = 0; i < 6; i++) {
    const scorch = new THREE.Mesh(
      new THREE.CircleGeometry(rng.range(1, 2.5), 12),
      new THREE.MeshBasicMaterial({ color: 0x0a0a0a, transparent: true, opacity: 0.6, depthWrite: false })
    );
    scorch.rotation.x = -Math.PI / 2;
    scorch.position.set(rng.range(-worldW / 3, worldW / 3), 0.02, rng.range(-worldD / 3, worldD / 3));
    group.add(scorch);
  }

  // flickering work-light: conflict zones lose stable power
  const flick = new THREE.PointLight(0xffb347, 10, 18, 1.6);
  flick.position.set(rng.range(-8, 8), 4, rng.range(-8, 8));
  flick.userData.conflictFlicker = true;
  flick.userData.baseIntensity = 10;
  group.add(flick);

  group.visible = false;
  return group;
}

/** Animate conflict layers + marking crossfades. Call per frame. */
export function tickTurfVisuals(
  turf: { markings: MarkingLayer[]; conflict: THREE.Group },
  contested: boolean,
  t: number, dt: number
): void {
  // crossfade marking layers toward their targets
  for (const m of turf.markings) {
    const target = m.group.userData.targetOpacity ?? 1;
    const cur = m.group.userData.opacity ?? 1;
    const next = cur + Math.sign(target - cur) * (dt / BLEND_TIME);
    const clamped = Math.max(0, Math.min(1, next));
    m.group.userData.opacity = clamped;
    for (const mat of m.mats) mat.opacity = clamped * (mat.userData.baseOpacity ?? 1);
    for (const l of m.lights) l.intensity = (l.userData.baseIntensity ?? l.intensity) * clamped;
  }
  // prune fully-faded layers
  const kept = turf.markings.filter((m) => {
    if (m.group.userData.targetOpacity === 0 && (m.group.userData.opacity ?? 1) <= 0.01) {
      m.group.parent?.remove(m.group);
      return false;
    }
    return true;
  });
  turf.markings.length = 0;
  turf.markings.push(...kept);
  // conflict indicators
  turf.conflict.visible = contested;
  if (contested) {
    turf.conflict.traverse((o) => {
      if (o.userData.smoke) {
        o.position.y += dt * 0.6;
        o.rotation.y += dt * 0.3;
        if (o.position.y > 14) o.position.y = 3;
      }
      if (o.userData.conflictFlicker) {
        const l = o as THREE.PointLight;
        const base = l.userData.baseIntensity as number;
        l.intensity = base * (0.25 + 0.75 * Math.abs(Math.sin(t * 17 + l.position.x * 3)));
      }
    });
  }
}

/**
 * Swap the visible marking layer when ownership flips.
 * Old layer fades out over ~5s, new layer fades in — never a pop.
 * (Pruning of fully-faded layers happens in tickTurfVisuals.)
 */
export function swapMarkingLayer(
  turf: { markings: MarkingLayer[] },
  next: MarkingLayer,
  parent: THREE.Group
): void {
  for (const m of turf.markings) m.group.userData.targetOpacity = 0;
  next.group.userData.opacity = 0;
  next.group.userData.targetOpacity = 1;
  for (const mat of next.mats) {
    mat.userData.baseOpacity = mat.opacity;
    mat.opacity = 0;
  }
  parent.add(next.group);
  turf.markings.push(next);
}
