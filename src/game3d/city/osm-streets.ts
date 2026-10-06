/**
 * OSM street-graph consumer — real-city road layouts as district street basis.
 *
 * Takes the JSON emitted by tools/city/osm-ingest.py (Overpass API) and
 * builds a THREE.Group of road ribbons + sidewalks clipped to a district
 * footprint. The district's own palette/props/buildings stay procedural;
 * the STREET LAYOUT comes from the real city.
 *
 * License: input data is ODbL 1.0 — see docs/OSM_ATTRIBUTION.md.
 * The emitted JSON carries its attribution header; keep it with the file.
 */

import * as THREE from "three";

export interface OsmWay {
  highway: string;
  width: number;
  length: number;
  points: [number, number][];
  name: string;
}

export interface OsmStreetGraph {
  attribution: string;
  license: string;
  bbox: [number, number, number, number];
  center_m: [number, number];
  ways: OsmWay[];
  stats: { ways: number; total_road_m: number };
}

export interface OsmStreetsOpts {
  graph: OsmStreetGraph;
  /** district footprint half-extents (meters) — ways are clipped to this */
  halfW: number;
  halfD: number;
  /** road surface color */
  roadColor: number;
  /** scale: OSM meters -> world units (default 1) */
  scale?: number;
}

/**
 * Build road ribbons from an OSM street graph, centered on the graph center
 * and clipped to the district footprint.
 */
export function buildOsmStreets(opts: OsmStreetsOpts): THREE.Group {
  const { graph, halfW, halfD, roadColor, scale = 1 } = opts;
  const group = new THREE.Group();
  group.name = "osm-streets";

  const [ccx, ccz] = graph.center_m;
  const roadMat = new THREE.MeshLambertMaterial({ color: roadColor });

  let built = 0;
  for (const way of graph.ways) {
    // transform to district-local coords, drop ways fully outside
    const pts = way.points
      .map(([x, z]) => [(x - ccx) * scale, (z - ccz) * scale] as [number, number])
      .filter(([x, z]) => Math.abs(x) < halfW * 1.2 && Math.abs(z) < halfD * 1.2);
    if (pts.length < 2) continue;

    const w = Math.max(2.5, way.width * scale * 0.8);
    // ribbon segments between consecutive points
    for (let i = 0; i < pts.length - 1; i++) {
      const [ax, az] = pts[i];
      const [bx, bz] = pts[i + 1];
      // clip to footprint
      if (Math.abs(ax) > halfW || Math.abs(az) > halfD) continue;
      if (Math.abs(bx) > halfW || Math.abs(bz) > halfD) continue;
      const dx = bx - ax, dz = bz - az;
      const len = Math.hypot(dx, dz);
      if (len < 0.5) continue;
      const seg = new THREE.Mesh(new THREE.PlaneGeometry(w, len + w * 0.5), roadMat);
      seg.rotation.x = -Math.PI / 2;
      seg.rotation.z = Math.atan2(dx, dz);
      seg.position.set((ax + bx) / 2, 0.02, (az + bz) / 2);
      group.add(seg);
      built++;
      if (built > 900) break; // cap for perf
    }
    if (built > 900) break;
  }

  group.userData.attribution = graph.attribution;
  group.userData.wayCount = graph.ways.length;
  return group;
}

/**
 * Fetch a street graph JSON (bundled under public/data/osm/) at runtime.
 * Returns null if unavailable — districts fall back to procedural streets.
 */
export async function loadOsmGraph(url: string): Promise<OsmStreetGraph | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const g = (await res.json()) as OsmStreetGraph;
    if (!g.ways || !g.attribution) return null;
    return g;
  } catch {
    return null;
  }
}
