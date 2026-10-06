/**
 * city-3d.js — Seeded 3D city block generator for AshLane.
 *
 * Takes a city plan from city-seed.js and emits deterministic 3D geometry
 * (boxes for buildings, instanced window planes, neon signs, props,
 * streetlights) as JSON the engine loads to build real levels.
 * Same seed = same city, every time.
 *
 * No external assets: all geometry is procedural boxes/planes, all colors
 * are seeded. Textures come from tools/generative/svg-textures.js at runtime.
 *
 * Usage:
 *   import { cityTo3D } from './city-3d.js';
 *   import { generateCity } from '../city-seed.js';
 *   const scene = cityTo3D(generateCity({ seed: 'ashlane-01' }));
 *   fs.writeFileSync('city-3d.json', JSON.stringify(scene));
 */
import { rng } from "../rng.js";

// Night-city palette (Malakor underneath: dark urban, purple/blue/green/gold)
const PALETTES = {
  commercial: [0x2a2438, 0x35304a, 0x1f1b2e, 0x3d3654],
  alley:      [0x1c1a24, 0x242130, 0x191720],
  industrial: [0x2e2a26, 0x38322b, 0x26221e],
  park:       [0x1a2b1e, 0x223626, 0x16241a],
  transit:    [0x232733, 0x2c3340, 0x1d2129],
  vertical:   [0x2a2438, 0x35304a, 0x1f1b2e],
};
const WINDOW_LIT = 0xffd97a;   // warm lit windows
const WINDOW_DARK = 0x11131c;  // dark windows
const NEON = [0xff2d78, 0x27e0ff, 0x9dff2d, 0xffa02d, 0xb44dff]; // street neon

/**
 * Convert a city plan into 3D scene JSON.
 * @param {object} city - output of generateCity()
 * @param {object} opts - { detailSeed, windowDensity }
 */
export function cityTo3D(city, { detailSeed = "detail", windowDensity = 0.35 } = {}) {
  const R = rng(detailSeed + "::" + city.seed);
  const blockSize = city.size.blockSize;
  const buildings = [];
  const windows = [];   // instanced small emissive planes
  const neons = [];     // neon sign boxes
  const props = [];     // dumpsters, crates, barrels, hydrants
  const streetlights = [];

  for (const block of city.blocks) {
    const palette = PALETTES[block.district] || PALETTES.commercial;
    const bx = block.cx, bz = block.cz, bs = blockSize;

    // 3D buildings: 1-4 per block depending on district kind
    const nB = block.district === "park" ? 0
             : block.district === "alleys" ? 3
             : 1 + R.int(0, 2);
    for (let i = 0; i < nB; i++) {
      const w = bs * R.range(0.28, 0.63);
      const d = bs * R.range(0.28, 0.63);
      const h = block.district === "warehouses" ? R.range(8, 18)
              : block.district === "alleys" ? R.range(12, 34)
              : R.range(15, 70);
      const px = bx + R.range(-0.5, 0.5) * (bs - w);
      const pz = bz + R.range(-0.5, 0.5) * (bs - d);
      const color = R.pick(palette);
      const b = { x: +px.toFixed(2), z: +pz.toFixed(2), w: +w.toFixed(2), d: +d.toFixed(2), h: +h.toFixed(2), color };
      buildings.push(b);

      // Windows on the street-facing side (instanced planes)
      const cols = Math.max(2, Math.floor(w / 4));
      const rows = Math.max(2, Math.floor(h / 4));
      for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
          if (!R.chance(windowDensity)) continue;
          const lit = R.chance(0.28);
          windows.push({
            x: +(px - w / 2 + (c + 0.5) * (w / cols)).toFixed(2),
            y: +(3 + r * 4).toFixed(2),
            z: +(pz + d / 2 + 0.06).toFixed(2),
            color: lit ? WINDOW_LIT : WINDOW_DARK,
            emissive: lit,
          });
        }
      }

      // Occasional neon sign on commercial buildings
      if ((block.district === "commercial" || block.district === "alleys") && R.chance(0.45)) {
        neons.push({
          x: +(px + R.range(-0.3, 0.3) * w).toFixed(2),
          y: +(6 + R.rand() * h * 0.5).toFixed(2),
          z: +(pz + d / 2 + 0.4).toFixed(2),
          w: +R.range(3, 7).toFixed(2),
          color: R.pick(NEON),
        });
      }
    }

    // Park trees as cone-ish props
    if (block.park) {
      for (const t of block.park.trees) {
        props.push({ kind: "tree", x: t.x, z: t.z, s: t.s, ry: 0 });
      }
    }

    // Props scattered around blocks
    const nProps = R.int(2, 6);
    for (let i = 0; i < nProps; i++) {
      props.push({
        kind: R.pick(["dumpster", "crate", "barrel", "hydrant"]),
        x: +(bx + R.range(-0.45, 0.45) * bs).toFixed(2),
        z: +(bz + R.range(-0.45, 0.45) * bs).toFixed(2),
        s: +R.range(0.8, 2.2).toFixed(2),
        ry: +R.range(0, Math.PI * 2).toFixed(3),
      });
    }
  }

  // Streetlights along streets
  for (const st of city.streets || []) {
    const n = Math.floor(st.to / 18);
    for (let i = 0; i < n; i++) {
      const t = (i + 0.5) * 18;
      streetlights.push(st.axis === "z"
        ? { x: +(st.at + 6).toFixed(2), z: +t.toFixed(2) }
        : { x: +t.toFixed(2), z: +(st.at + 6).toFixed(2) });
    }
  }

  return {
    meta: { generator: "city-3d.js", seed: String(city.seed), version: 1 },
    size: city.size,
    buildings, windows, neons, props, streetlights,
    streets: (city.streets || []).map(s => ({ ...s })),
    stats: {
      buildings: buildings.length,
      windows: windows.length,
      neons: neons.length,
      props: props.length,
      streetlights: streetlights.length,
    },
  };
}

/**
 * Determinism check: generate twice, compare canonical JSON.
 */
export function isDeterministic(cityPlan, detailSeed = "detail") {
  const a = JSON.stringify(cityTo3D(cityPlan, { detailSeed }));
  const b = JSON.stringify(cityTo3D(cityPlan, { detailSeed }));
  return a === b;
}
