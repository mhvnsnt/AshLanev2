/**
 * AshLane open-world arena anchors.
 *
 * Connects every arena in the manifest to the open city: which district it
 * lives in, how the story layer reaches it (travel note), and the story
 * hook the open world uses to surface it (fight nights, crew meetups,
 * company events). Descriptive anchors only — no invented canon, no new
 * narrative. See CROSS-GAME-ARENA-BRIEF.md for the cross-game source map.
 */

import { CITY_DISTRICTS, type CityDistrictId } from "./districts";
import { getArenasByDistrict } from "../stages/arena-manifest";

export interface DistrictArenaAnchor {
  district: CityDistrictId;
  districtName: string;
  /** Where each arena sits inside the district (generic anchor text). */
  placement: string;
  /** How the open world surfaces these arenas in story play. */
  storyNote: string;
  arenas: Array<{ id: string; name: string; hook: string }>;
}

const PLACEMENT: Record<CityDistrictId, { placement: string; storyNote: string }> = {
  "neon-district": {
    placement: "Rooftop access points across the Neon District.",
    storyNote: "Neutral-ground meetups — rooftop fights brokered above the neon.",
  },
  "marquee-mile": {
    placement: "Storefronts and back rooms along Marquee Mile.",
    storyNote: "Strip venues — bar, arcade, hotel, and studio fight nights.",
  },
  "civic": {
    placement: "Civic institutions and the Stadium block.",
    storyNote: "Authority turf and wrestling-company events at the Stadium.",
  },
  "projects": {
    placement: "Courtyards and back alleys in the Projects.",
    storyNote: "Street-crew scraps — alley and court fights between blocks.",
  },
  "industrial": {
    placement: "Warehouses, yards, and foundries in the industrial zone.",
    storyNote: "Contested Combine turf — crane-yard shifts and hazard fights.",
  },
  "waterfront": {
    placement: "Docks, clubs, and the chokepoint bridge.",
    storyNote: "Port turf — smuggling crews and underground club brawls.",
  },
  "underground": {
    placement: "Platforms, tunnels, and cages below the city.",
    storyNote: "Hollows domain — cage fights and tunnel ambushes, no witnesses.",
  },
  "outskirts": {
    placement: "Forgotten places the city pretends don't exist — plus the Malakor castle grounds.",
    storyNote: "Outskirts grudges — junkyard, cemetery, swamp, and the castle.",
  },
  "suburbs": {
    placement: "Clean suburban lots and the training dojo.",
    storyNote: "Too-clean meetups — school-yard and dojo fights after hours.",
  },
};

export function districtArenaAnchors(): DistrictArenaAnchor[] {
  return (Object.keys(PLACEMENT) as CityDistrictId[]).map((district) => {
    const { placement, storyNote } = PLACEMENT[district];
    const arenas = getArenasByDistrict(district).map((a) => ({ id: a.id, name: a.name, hook: a.hook }));
    return {
      district,
      districtName: CITY_DISTRICTS[district].name,
      placement,
      storyNote,
      arenas,
    };
  });
}

/** Story hooks for every open-world-anchored arena, flat list for the event layer. */
export function arenaStoryHooks(): Array<{ arenaId: string; district: CityDistrictId; hook: string }> {
  return districtArenaAnchors().flatMap((d) =>
    d.arenas.map((a) => ({ arenaId: a.id, district: d.district, hook: a.hook })),
  );
}
