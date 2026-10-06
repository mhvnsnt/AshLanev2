/**
 * AshLane underground layer — subways, tunnels, sewer access.
 *
 * Owner requirement: traversable underground — subways, tunnels, sewers.
 * The underground is its own district ("The Tunnels", Hollows territory)
 * physically beneath the city grid, connected by station entrances and
 * sewer manholes on the surface.
 *
 * Federation: tunnel-network layout seeded per district-grid coordinates;
 * original AshLane implementation.
 */

import * as THREE from "three";
import { createRng, type Rng } from "../worldgen";
import { CITY_DISTRICTS, DISTRICT_SPACING } from "./districts";

export interface UndergroundNode {
  /** station or junction id */
  id: string;
  /** world x,z (beneath a surface district) */
  x: number; z: number;
  kind: "station" | "junction" | "sewer-access";
  /** surface district above */
  above: string;
}

export interface TunnelSegment {
  from: string; to: string;
  /** world-space endpoints */
  ax: number; az: number; bx: number; bz: number;
  /** width of the tunnel bore */
  width: number;
  kind: "subway" | "sewer";
}

export interface Underground {
  group: THREE.Group;
  nodes: UndergroundNode[];
  segments: TunnelSegment[];
  /** entrances on the surface: {x, z, nodeId} */
  entrances: { x: number; z: number; nodeId: string }[];
  colliders: { x: number; z: number; hw: number; hd: number }[];
  tick: (t: number) => void;
  dispose: () => void;
}

const DEPTH = -9; // tunnel floor depth below street level

function lam(color: number): THREE.MeshLambertMaterial {
  return new THREE.MeshLambertMaterial({ color });
}

/**
 * Build the underground network beneath the city.
 * Subway line connects: projects -> marquee-mile -> neon-district -> civic,
 * with sewer branches reaching waterfront + industrial.
 */
export function buildUnderground(seed = 777): Underground {
  const rng = createRng(seed);
  const group = new THREE.Group();
  group.name = "underground";

  // station positions: beneath surface districts (offset from district centers)
  const stationDefs: { id: string; above: string; kind: UndergroundNode["kind"] }[] = [
    { id: "st-projects", above: "projects", kind: "station" },
    { id: "st-marquee", above: "marquee-mile", kind: "station" },
    { id: "st-neon", above: "neon-district", kind: "station" },
    { id: "st-civic", above: "civic", kind: "station" },
    { id: "sw-waterfront", above: "waterfront", kind: "sewer-access" },
    { id: "sw-industrial", above: "industrial", kind: "sewer-access" },
  ];

  const nodes: UndergroundNode[] = stationDefs.map((s) => {
    const d = CITY_DISTRICTS[s.above as keyof typeof CITY_DISTRICTS];
    const x = d.grid[0] * DISTRICT_SPACING + rng.range(-20, 20);
    const z = d.grid[1] * DISTRICT_SPACING + rng.range(-20, 20);
    return { id: s.id, x, z, kind: s.kind, above: s.above };
  });

  const segments: TunnelSegment[] = [
    seg(nodes, "st-projects", "st-marquee", 7, "subway"),
    seg(nodes, "st-marquee", "st-neon", 7, "subway"),
    seg(nodes, "st-neon", "st-civic", 7, "subway"),
    seg(nodes, "st-neon", "sw-waterfront", 3.5, "sewer"),
    seg(nodes, "st-civic", "sw-industrial", 3.5, "sewer"),
  ];

  const colliders: { x: number; z: number; hw: number; hd: number }[] = [];
  const flickers: THREE.PointLight[] = [];

  // dim green-white fluorescent ambience for the whole underground
  group.add(new THREE.HemisphereLight(0x4a5248, 0x0a0c0a, 0.5));

  for (const s of segments) buildTunnel(group, s, rng, colliders, flickers);
  for (const n of nodes) buildStation(group, n, rng, colliders, flickers);

  const entrances = nodes.map((n) => ({ x: n.x + 6, z: n.z + 6, nodeId: n.id }));

  const tick = (t: number) => {
    for (const f of flickers) {
      const base = (f.userData.baseIntensity ?? f.intensity) as number;
      if (f.userData.baseIntensity === undefined) f.userData.baseIntensity = f.intensity;
      // fluorescent stutter
      const stutter = Math.sin(t * 23 + f.position.x * 7) > 0.92 ? 0.25 : 1;
      f.intensity = base * stutter * (0.85 + 0.15 * Math.sin(t * 7 + f.position.z));
    }
  };

  const dispose = () => {
    group.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (mesh.isMesh) {
        mesh.geometry.dispose();
        const m = mesh.material as THREE.Material;
        if (m) m.dispose();
      }
    });
  };

  return { group, nodes, segments, entrances, colliders, tick, dispose };
}

function seg(
  nodes: UndergroundNode[], from: string, to: string,
  width: number, kind: TunnelSegment["kind"]
): TunnelSegment {
  const a = nodes.find((n) => n.id === from)!;
  const b = nodes.find((n) => n.id === to)!;
  return { from, to, ax: a.x, az: a.z, bx: b.x, bz: b.z, width, kind };
}

function buildTunnel(
  group: THREE.Group, s: TunnelSegment, rng: Rng,
  colliders: { x: number; z: number; hw: number; hd: number }[],
  flickers: THREE.PointLight[]
): void {
  const dx = s.bx - s.ax, dz = s.bz - s.az;
  const len = Math.hypot(dx, dz);
  const yaw = Math.atan2(dx, dz);
  const cx = (s.ax + s.bx) / 2, cz = (s.az + s.bz) / 2;
  const w = s.width, h = s.kind === "subway" ? 4.5 : 3;

  const concrete = lam(s.kind === "subway" ? 0x3a3c38 : 0x2e3230);

  // floor
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(w, len), lam(0x242624));
  floor.rotation.x = -Math.PI / 2;
  floor.rotation.z = yaw;
  floor.position.set(cx, DEPTH, cz);
  group.add(floor);

  // walls (two long boxes) — leave the ends open
  for (const side of [-1, 1]) {
    const wall = new THREE.Mesh(new THREE.BoxGeometry(0.6, h, len), concrete);
    wall.position.set(
      cx + Math.cos(yaw) * side * (w / 2),
      DEPTH + h / 2,
      cz - Math.sin(yaw) * side * (w / 2)
    );
    wall.rotation.y = yaw;
    group.add(wall);
    // tunnel walls block movement (approximate with segment colliders)
  }
  // ceiling
  const ceil = new THREE.Mesh(new THREE.BoxGeometry(w + 1.2, 0.6, len), lam(0x22241f));
  ceil.position.set(cx, DEPTH + h + 0.3, cz);
  ceil.rotation.y = yaw;
  group.add(ceil);

  // light strip down the tunnel
  const steps = Math.max(2, Math.floor(len / 14));
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const lx = s.ax + dx * t, lz = s.az + dz * t;
    const tube = new THREE.Mesh(
      new THREE.BoxGeometry(w * 0.5, 0.12, 0.5),
      new THREE.MeshBasicMaterial({ color: 0xd6ffe0 })
    );
    tube.position.set(lx, DEPTH + h - 0.2, lz);
    tube.rotation.y = yaw;
    group.add(tube);
    if (i % 2 === 0) {
      const pl = new THREE.PointLight(0xd6ffe0, 6, w * 2.4, 1.6);
      pl.position.set(lx, DEPTH + h - 0.6, lz);
      pl.userData.baseIntensity = 6;
      flickers.push(pl);
      group.add(pl);
    }
  }

  // subway rails for subway tunnels
  if (s.kind === "subway") {
    for (const side of [-1, 1]) {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.12, len), lam(0x555a60));
      rail.position.set(
        cx + Math.cos(yaw) * side * 1.1, DEPTH + 0.1,
        cz - Math.sin(yaw) * side * 1.1
      );
      rail.rotation.y = yaw;
      group.add(rail);
    }
  } else {
    // sewer water channel
    const water = new THREE.Mesh(
      new THREE.PlaneGeometry(w * 0.5, len),
      new THREE.MeshBasicMaterial({ color: 0x1a3a2a, transparent: true, opacity: 0.8 })
    );
    water.rotation.x = -Math.PI / 2;
    water.rotation.z = yaw;
    water.position.set(cx, DEPTH + 0.05, cz);
    group.add(water);
  }
}

function buildStation(
  group: THREE.Group, n: UndergroundNode, rng: Rng,
  colliders: { x: number; z: number; hw: number; hd: number }[],
  flickers: THREE.PointLight[]
): void {
  const w = n.kind === "station" ? 22 : 10;
  const d = n.kind === "station" ? 14 : 10;
  const h = 5;

  // platform floor
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(w, d), lam(0x2c2e2a));
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(n.x, DEPTH, n.z);
  group.add(floor);

  // back + side walls
  const wallMat = lam(0x3a3c38);
  const back = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.6), wallMat);
  back.position.set(n.x, DEPTH + h / 2, n.z - d / 2);
  group.add(back);
  for (const side of [-1, 1]) {
    const wall = new THREE.Mesh(new THREE.BoxGeometry(0.6, h, d), wallMat);
    wall.position.set(n.x + side * w / 2, DEPTH + h / 2, n.z);
    group.add(wall);
  }
  const ceil = new THREE.Mesh(new THREE.BoxGeometry(w, 0.6, d), lam(0x22241f));
  ceil.position.set(n.x, DEPTH + h + 0.3, n.z);
  group.add(ceil);

  // pillars
  for (let i = -1; i <= 1; i++) {
    const p = new THREE.Mesh(new THREE.BoxGeometry(0.8, h, 0.8), lam(0x44463f));
    p.position.set(n.x + i * w / 4, DEPTH + h / 2, n.z);
    group.add(p);
    colliders.push({ x: n.x + i * w / 4, z: n.z, hw: 0.4, hd: 0.4 });
  }

  // Hollows carved symbols on the station wall
  const sym = new THREE.Mesh(
    new THREE.PlaneGeometry(3, 3),
    new THREE.MeshBasicMaterial({ color: 0xcc6a1a, transparent: true, opacity: 0.7 })
  );
  sym.position.set(n.x, DEPTH + 2.5, n.z - d / 2 + 0.35);
  group.add(sym);

  // platform edge warning strip
  const strip = new THREE.Mesh(
    new THREE.BoxGeometry(w * 0.9, 0.04, 0.3),
    new THREE.MeshBasicMaterial({ color: 0xcc2222 })
  );
  strip.position.set(n.x, DEPTH + 0.03, n.z + d / 2 - 1);
  group.add(strip);

  // lights
  const pl = new THREE.PointLight(0xd6ffe0, 14, 20, 1.5);
  pl.position.set(n.x, DEPTH + h - 0.8, n.z);
  pl.userData.baseIntensity = 14;
  flickers.push(pl);
  group.add(pl);

  // bench
  const bench = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.5, 0.6), lam(0x4a4438));
  bench.position.set(n.x - 4, DEPTH + 0.45, n.z - 2);
  group.add(bench);
  colliders.push({ x: n.x - 4, z: n.z - 2, hw: 1.2, hd: 0.3 });

  void rng;
}
