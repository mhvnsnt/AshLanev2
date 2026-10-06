/**
 * Ambient roster cast — GTA/Urban Reign style city life for AshLane.
 *
 * Every roster fighter is playable, but AI-driven versions live in the city:
 * they roam between waypoints in districts that make sense for them, hang out
 * in groups, and occasionally scuffle. Placement is curated, not random —
 * Onyx holds her street, Static hangs around the ring, Hollow lurks underground.
 *
 * Owner directive 2026-10-06: replace KayKit characters with real humanoids,
 * no duplicate attires of the same person in the same spot, characters roam
 * and have life instead of standing around.
 */

import { ROSTER } from "./roster";
import { yawFromDir, type Body, type Home, type Sim } from "./sim";

export type AmbientState = {
  /** Waypoints the character roams between (x, z). */
  waypoints: [number, number][];
  wpIndex: number;
  /** Hangout idle timer at the current waypoint. */
  idleT: number;
  /** True once the player (or a grunt) has attacked them — they fight back. */
  provoked: boolean;
  /** Id of the ambient scuffle partner, -1 when not scuffling. */
  scuffleId: number;
  scuffleT: number;
};

export type AmbientSpec = {
  fighterId: string;
  /** Attire index into the roster entry's attires (default 0). */
  attire: number;
  home: Home;
  /** Extra waypoint offsets around the district center. */
  spread: number;
};

const DROP: Record<Home, [number, number]> = {
  plaza: [0, 2],
  street: [-4, -18],
  market: [28, -18],
  yard: [-34, 0],
  dock: [0, 32],
  under: [0, -36],
  ring: [70, 32],
  cage: [-70, 0],
  subway: [0, -64],
  crane: [0, 70],
  office: [74, -24],
  scaffold: [0, 18],
};

/**
 * Curated ambient cast. Each fighter appears ONCE (no duplicate attires in the
 * same spot — or anywhere). Districts match the character's vibe.
 */
export const AMBIENT_CAST: AmbientSpec[] = [
  { fighterId: "onyx", attire: 0, home: "street", spread: 10 },
  { fighterId: "hollow", attire: 0, home: "under", spread: 8 },
  { fighterId: "static", attire: 0, home: "ring", spread: 8 },
  { fighterId: "echo", attire: 0, home: "market", spread: 10 },
  { fighterId: "cipher", attire: 0, home: "street", spread: 12 },
  { fighterId: "toro", attire: 0, home: "ring", spread: 10 },
  { fighterId: "bannon", attire: 0, home: "plaza", spread: 10 },
  { fighterId: "stickup", attire: 0, home: "market", spread: 8 },
  { fighterId: "sombra_negra", attire: 0, home: "cage", spread: 8 },
  { fighterId: "titan", attire: 0, home: "yard", spread: 10 },
  { fighterId: "brutus", attire: 0, home: "dock", spread: 10 },
  { fighterId: "maime", attire: 0, home: "subway", spread: 8 },
];

function waypointsFor(home: Home, spread: number, seed: number): [number, number][] {
  const [cx, cz] = DROP[home] ?? [0, 0];
  // Deterministic pseudo-random from seed — stable layout, not a slot machine.
  let s = seed * 7919 + 13;
  const rnd = () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
  const pts: [number, number][] = [[cx, cz]];
  for (let i = 0; i < 3; i++) {
    const a = rnd() * Math.PI * 2;
    const r = spread * (0.45 + rnd() * 0.55);
    pts.push([cx + Math.cos(a) * r, cz + Math.sin(a) * r]);
  }
  return pts;
}

/**
 * Spawn the ambient cast into the sim. Called from spawnBodies (sim.ts).
 * Each entry is unique — one fighter, one attire, one home turf.
 */
export function spawnAmbientCast(
  sim: Sim,
  blankBody: (sim: Sim, partial: Pick<Body, "kind" | "x" | "z"> & Partial<Body>) => Body
): void {
  const used = new Set<string>();
  for (const spec of AMBIENT_CAST) {
    const fighter = ROSTER.find((f) => f.id === spec.fighterId);
    if (!fighter) continue;
    const attire = fighter.attires[Math.min(spec.attire, fighter.attires.length - 1)];
    const key = `${fighter.id}:${attire.id}`;
    if (used.has(key)) continue; // never duplicate an attire
    used.add(key);
    const [cx, cz] = DROP[spec.home] ?? [0, 0];
    const b = blankBody(sim, {
      kind: "ambient",
      x: cx,
      z: cz,
      y: 0,
      name: fighter.name,
      home: spec.home,
      homeX: cx,
      homeZ: cz,
      arch: "brawler",
      castFile: attire.file,
    });
    // Roster fighters are tougher than street grunts.
    b.hp = 140;
    b.maxHp = 140;
    b.ambient = {
      waypoints: waypointsFor(spec.home, spec.spread, b.id),
      wpIndex: 0,
      idleT: 2 + (b.id % 5),
      provoked: false,
      scuffleId: -1,
      scuffleT: 0,
    };
    sim.bodies.push(b);
  }
}

/**
 * Step ambient life: waypoint roaming, hangouts, ambient scuffles.
 * Called each tick for bodies of kind "ambient" that aren't provoked.
 * Provoked ambients are driven by the standard combat brain in sim.ts.
 */
export function stepAmbientRoam(sim: Sim, e: Body, dt: number): void {
  const a = e.ambient;
  if (!a || e.state !== "free") return;

  // Ambient scuffle: face a nearby idle ambient and trade shadow blows.
  if (a.scuffleId >= 0) {
    const partner = sim.bodies.find((o) => o.id === a.scuffleId && o.alive);
    if (!partner || partner.kind !== "ambient") {
      a.scuffleId = -1;
      return;
    }
    a.scuffleT -= dt;
    const dx = partner.x - e.x;
    const dz = partner.z - e.z;
    e.yaw = yawFromDir(dx, dz);
    // Alternate attack flurries — visual only, no damage.
    if (a.scuffleT <= 0) {
      a.scuffleT = 0.9 + Math.random() * 0.8;
      e.state = "windup";
      e.stateT = 0.22;
      e.swing = 0;
    }
    e.vx = 0;
    e.vz = 0;
    // End the scuffle after a while; both walk it off.
    if (Math.random() < dt * 0.08) {
      a.scuffleId = -1;
      const pa = partner.ambient;
      if (pa) pa.scuffleId = -1;
      a.idleT = 3 + Math.random() * 4;
    }
    return;
  }

  // Maybe start a scuffle with a nearby idle ambient (not too often).
  if (a.idleT > 1 && Math.random() < dt * 0.05) {
    const partner = sim.bodies.find(
      (o) =>
        o.kind === "ambient" &&
        o.id !== e.id &&
        o.alive &&
        o.state === "free" &&
        (!o.ambient || o.ambient.scuffleId < 0) &&
        Math.hypot(o.x - e.x, o.z - e.z) < 7
    );
    if (partner && partner.ambient) {
      a.scuffleId = partner.id;
      a.scuffleT = 0.5;
      partner.ambient.scuffleId = e.id;
      partner.ambient.scuffleT = 1.2;
      partner.ambient.idleT = 0;
      return;
    }
  }

  // Hang out at the waypoint for a bit.
  if (a.idleT > 0) {
    a.idleT -= dt;
    e.vx = 0;
    e.vz = 0;
    return;
  }

  // Walk to the next waypoint.
  const wp = a.waypoints[a.wpIndex % a.waypoints.length];
  const dx = wp[0] - e.x;
  const dz = wp[1] - e.z;
  const d = Math.hypot(dx, dz);
  if (d < 0.6) {
    a.wpIndex = (a.wpIndex + 1) % a.waypoints.length;
    a.idleT = 3 + Math.random() * 6; // hang out, not too random
    e.vx = 0;
    e.vz = 0;
    return;
  }
  const sp = 2.2; // ambient stroll speed
  e.vx = (dx / d) * sp;
  e.vz = (dz / d) * sp;
  e.yaw = yawFromDir(e.vx, e.vz);
}
