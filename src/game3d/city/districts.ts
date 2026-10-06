/**
 * AshLane city districts — the 9 identities from docs/DISTRICT_ART_DIRECTION.md.
 *
 * Owner rule (2026-10-06): the green/purple/gold/blue neon palette is ONE
 * district's identity (Neon District), NOT the whole city. Every district
 * has its own visual identity — palette, lighting, weather, mood.
 *
 * Each CityDistrict maps onto a worldgen base (geometry + sky generator) and
 * then applies its own palette overrides: fog, ambient, lamp color, accent.
 * The district identity stays; faction ownership is a blend layer on top
 * (see territory.ts) — never a replacement.
 *
 * Federation: block-layout seeding patterns adapted from CatsJuice/random-city
 * (MIT). Original palette/lighting definitions are AshLane-original.
 */

import type { DistrictDef, DistrictId, FactionId } from "../worldgen";

export type CityDistrictId =
  | "neon-district"   // DOWNTOWN ROOFTOPS — "Neon Noir" (the only green/purple zone)
  | "marquee-mile"    // DOWNTOWN STRIP — "Marquee Mile" (hot magenta/cyan)
  | "civic"           // DOWNTOWN CIVIC — "Cold Authority" (steel blue)
  | "projects"        // THE PROJECTS — "Sodium Dusk" (sodium orange)
  | "industrial"      // INDUSTRIAL — "Rust Belt Day" (rust orange/grey, daylight)
  | "waterfront"      // WATERFRONT — "Cold Blue Fog" (steel blue/fog grey)
  | "underground"     // UNDERGROUND — "Fluorescent Tomb" (fluoro green-white)
  | "outskirts"       // OUTSKIRTS — "Dust and Bone" (dust brown/bone white)
  | "suburbs";        // SUBURBS — "Too Clean" (lawn green/sky blue, uncanny)

export interface CityDistrict {
  id: CityDistrictId;
  name: string;
  tagline: string;
  /** worldgen base used for geometry */
  base: DistrictId;
  /** sky identity (independent of geometry base) */
  skyBase: DistrictId;
  /** owning faction at game start */
  homeFaction: FactionId;
  /** full palette identity (hex) */
  palette: {
    ground: number; road: number;
    buildingTones: number[];
    accent: number;
    lampColor: number;
    fogColor: number;
    ambient: number;
    hemiGround: number;
  };
  fogNear: number; fogFar: number;
  /** 0..1 neon signage density */
  neon: number;
  /** 0..1 graffiti density */
  graffiti: number;
  /** 0..1 prop density */
  propDensity: number;
  /** preferred weather bias */
  weather: "rain" | "clear" | "overcast" | "fog" | "drizzle" | "windy";
  /** day or night identity */
  timeOfDay: "night" | "dusk" | "day" | "dawn";
  /** city grid position (district units) */
  grid: [number, number];
}

export const CITY_DISTRICTS: Record<CityDistrictId, CityDistrict> = {
  "neon-district": {
    id: "neon-district", name: "Neon District", base: "rooftops", skyBase: "strip",
    tagline: "Neon Noir. The only green/purple zone in the city — neutral ground.",
    homeFaction: "unaffiliated",
    palette: {
      ground: 0x2a2a30, road: 0x1c1c22,
      buildingTones: [0x3a3a44, 0x32323c, 0x44444e, 0x363640],
      accent: 0x39ff6e, lampColor: 0xb537f2,
      fogColor: 0x14101c, ambient: 0x6a5a8a, hemiGround: 0x1a1a1e,
    },
    fogNear: 20, fogFar: 110, neon: 1.0, graffiti: 0.35, propDensity: 0.7,
    weather: "rain", timeOfDay: "night", grid: [0, 0],
  },
  "marquee-mile": {
    id: "marquee-mile", name: "Marquee Mile", base: "strip", skyBase: "strip",
    tagline: "Hot magenta marquees and cyan arcade glow. The city's playground.",
    homeFaction: "unaffiliated",
    palette: {
      ground: 0x33303a, road: 0x242228,
      buildingTones: [0x4a3a4a, 0x3d2f3d, 0x554055, 0x423242],
      accent: 0xff2d78, lampColor: 0xfff3d6,
      fogColor: 0x16121a, ambient: 0x8a6a7a, hemiGround: 0x1e1a20,
    },
    fogNear: 18, fogFar: 95, neon: 0.95, graffiti: 0.3, propDensity: 0.65,
    weather: "clear", timeOfDay: "night", grid: [1, 0],
  },
  "civic": {
    id: "civic", name: "Civic Center", base: "warehouses", skyBase: "warehouses",
    tagline: "Cold Authority. Harsh fluorescents, surveilled, spotless.",
    homeFaction: "authority",
    palette: {
      ground: 0x3a4048, road: 0x2e343c,
      buildingTones: [0x5a6a7a, 0x4c5a68, 0x66727f, 0x545e6a],
      accent: 0x4a6fa5, lampColor: 0xe8f0ff,
      fogColor: 0x1a2028, ambient: 0x7a8a9a, hemiGround: 0x22262c,
    },
    fogNear: 22, fogFar: 100, neon: 0.1, graffiti: 0.0, propDensity: 0.5,
    weather: "overcast", timeOfDay: "day", grid: [1, 1],
  },
  "projects": {
    id: "projects", name: "The Projects", base: "alleys", skyBase: "alleys",
    tagline: "Sodium Dusk. Orange streetlights, warm windows, every wall tells you who runs the block.",
    homeFaction: "ashes",
    palette: {
      ground: 0x2e2620, road: 0x241e18,
      buildingTones: [0x6b4a3a, 0x5a3f34, 0x74584a, 0x4f3a30],
      accent: 0xff9a3c, lampColor: 0xff9a3c,
      fogColor: 0x1c1410, ambient: 0x8a6a4a, hemiGround: 0x241a12,
    },
    fogNear: 14, fogFar: 70, neon: 0.15, graffiti: 0.95, propDensity: 0.85,
    weather: "clear", timeOfDay: "dusk", grid: [-1, 0],
  },
  "industrial": {
    id: "industrial", name: "The Yards", base: "warehouses", skyBase: "warehouses",
    tagline: "Rust Belt Day. Harsh daylight, dust, cranes. Contested — nobody holds it long.",
    homeFaction: "combine",
    palette: {
      ground: 0x4a4238, road: 0x3a342c,
      buildingTones: [0x7a6a5a, 0x6b5d4e, 0x857567, 0x746556],
      accent: 0xb5541e, lampColor: 0xfff0d0,
      fogColor: 0x2a241c, ambient: 0xa89a7a, hemiGround: 0x4a4034,
    },
    fogNear: 30, fogFar: 140, neon: 0.05, graffiti: 0.25, propDensity: 0.9,
    weather: "clear", timeOfDay: "day", grid: [0, 1],
  },
  "waterfront": {
    id: "waterfront", name: "The Waterfront", base: "warehouses", skyBase: "warehouses",
    tagline: "Cold Blue Fog. Containers like canyons, foghorns, secrets.",
    homeFaction: "combine",
    palette: {
      ground: 0x2e3a40, road: 0x242e34,
      buildingTones: [0x3a4a52, 0x323e46, 0x44525a, 0x36424a],
      accent: 0x3a6b8a, lampColor: 0xffb347,
      fogColor: 0x232a2e, ambient: 0x5a6a72, hemiGround: 0x1e2428,
    },
    fogNear: 6, fogFar: 55, neon: 0.1, graffiti: 0.3, propDensity: 0.8,
    weather: "fog", timeOfDay: "dawn", grid: [0, -1],
  },
  "underground": {
    id: "underground", name: "The Tunnels", base: "subway", skyBase: "subway",
    tagline: "Fluorescent Tomb. Hollows domain — what happens below stays below.",
    homeFaction: "hollows",
    palette: {
      ground: 0x1c1e1c, road: 0x181a18,
      buildingTones: [0x3a3c38, 0x323430, 0x40423e, 0x363834],
      accent: 0xd6ffe0, lampColor: 0xd6ffe0,
      fogColor: 0x0a0c0a, ambient: 0x4a5248, hemiGround: 0x101210,
    },
    fogNear: 8, fogFar: 45, neon: 0.1, graffiti: 0.7, propDensity: 0.5,
    weather: "clear", timeOfDay: "night", grid: [0, 0], // vertical layer, see underground.ts
  },
  "outskirts": {
    id: "outskirts", name: "The Outskirts", base: "park", skyBase: "park",
    tagline: "Dust and Bone. Forgotten places the city pretends don't exist.",
    homeFaction: "ashes",
    palette: {
      ground: 0x4a3f30, road: 0x3a3226,
      buildingTones: [0x6b5d4a, 0x5d5140, 0x756652, 0x655a48],
      accent: 0x8a1a1a, lampColor: 0xe0d8c0,
      fogColor: 0x241e14, ambient: 0x9a8a6a, hemiGround: 0x3a3226,
    },
    fogNear: 35, fogFar: 160, neon: 0.0, graffiti: 0.4, propDensity: 0.4,
    weather: "windy", timeOfDay: "day", grid: [-1, -1],
  },
  "suburbs": {
    id: "suburbs", name: "The Suburbs", base: "park", skyBase: "park",
    tagline: "Too Clean. Bright, quiet, well-lit — suspiciously so.",
    homeFaction: "unaffiliated",
    palette: {
      ground: 0x3a5a34, road: 0x3a3a3c,
      buildingTones: [0xd4c5a0, 0xa04434, 0xc4b490, 0x8a4030],
      accent: 0x87ceeb, lampColor: 0xfff8e8,
      fogColor: 0x20242a, ambient: 0xb0c4d0, hemiGround: 0x3a4a3a,
    },
    fogNear: 40, fogFar: 180, neon: 0.0, graffiti: 0.0, propDensity: 0.3,
    weather: "clear", timeOfDay: "day", grid: [1, -1],
  },
};

export const CITY_DISTRICT_IDS = Object.keys(CITY_DISTRICTS) as CityDistrictId[];

/**
 * Convert a CityDistrict into a worldgen DistrictDef so the existing
 * procedural generators (streets/buildings/props/sky) can build it.
 * The district's own palette overrides the base — never the neon default.
 */
export function toWorldgenDef(d: CityDistrict): DistrictDef {
  return {
    id: d.base,
    name: d.name,
    faction: d.homeFaction,
    tagline: d.tagline,
    streetWidth: 10,
    blockSize: 34,
    buildingHeight: d.base === "rooftops" ? [12, 30]
      : d.base === "alleys" ? [8, 20]
      : d.base === "subway" ? [4, 8]
      : [8, 24],
    ground: d.palette.ground,
    road: d.palette.road,
    buildingTones: d.palette.buildingTones,
    accent: d.palette.accent,
    lampColor: d.palette.lampColor,
    fogColor: d.palette.fogColor,
    fogNear: d.fogNear,
    fogFar: d.fogFar,
    ambient: d.palette.ambient,
    graffiti: d.graffiti,
    neon: d.neon,
    propDensity: d.propDensity,
  };
}

/** World position of a district's center (districts are DISTRICT_SPACING apart). */
export const DISTRICT_SPACING = 130;

export function districtWorldPos(id: CityDistrictId): [number, number] {
  const d = CITY_DISTRICTS[id];
  return [d.grid[0] * DISTRICT_SPACING, d.grid[1] * DISTRICT_SPACING];
}
