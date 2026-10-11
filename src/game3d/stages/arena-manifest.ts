/**
 * AshLane Arena Manifest — every arena wired as a selectable versus stage,
 * a selectable arena screen, and an open-world story anchor.
 *
 * Source art: ~/workspace/ashlane-art/arenas/ (working area — never referenced
 * at runtime). Runtime thumbnails live in public/stages/arenas/.
 *
 * Each entry maps onto a proven procedural scene look (lookLike: one of the
 * six legacy stage looks view.ts already renders) plus a sky key, so any
 * arena id works in a fight without new 3D geometry. The crowd flag feeds
 * the tiered-stands arena crowd (arena-crowd.ts).
 *
 * District: one of the 9 open-city districts (src/game3d/city/districts.ts)
 * the arena is anchored to. Area: the named area from the cross-game
 * connection map (docs: CROSS-GAME-ARENA-BRIEF.md) — e.g. "Stadium" for the
 * wrestling-company district proposal.
 *
 * artReady: true once the thumbnail exists in public/stages/arenas/. The
 * arenas menu only lists ready arenas; pending ones stay in the manifest so
 * the next art drop lights them up without code changes.
 */

import type { CityDistrictId } from "../city/districts";
import type { DistrictId } from "../worldgen";

/** Legacy procedural scene looks view.ts already knows how to render. */
export type ArenaLook = "ward" | "dock" | "pit" | "high" | "yard" | "under";

export interface ArenaEntry {
  /** Matches the art filename slug (public/stages/arenas/<id>.webp). */
  id: string;
  /** Display name on the select screen. */
  name: string;
  /** One-line menu description. Descriptive only — never canon narrative. */
  blurb: string;
  /** Open-city district this arena is anchored to. */
  district: CityDistrictId;
  /** Named area from the cross-game connection map. */
  area: string;
  /** Public art path (relative to public/). */
  art: string;
  /** True once the thumbnail exists in public/stages/arenas/. */
  artReady: boolean;
  /** Sky system key (src/game3d/sky.ts). */
  sky: DistrictId;
  /** Procedural scene look to reuse for fights. */
  lookLike: ArenaLook;
  /** Show the tiered-stands arena crowd. */
  crowd: boolean;
  /** Usable in versus (exhibition/practice) stage select. */
  versus: boolean;
  /** Walkable from the arenas menu ("Walk it"). */
  walkable: boolean;
  /** Anchored in the open world / story layer. */
  openWorld: boolean;
  /** Story hook — where this arena shows up in fights and events. */
  hook: string;
}

const READY = true;
// Flip to READY when the thumbnail lands in public/stages/arenas/.

export const ARENA_MANIFEST: readonly ArenaEntry[] = [
  // ---- Batch 1: Malakor castle ----
  {
    id: "arena-malakor-courtyard-day",
    name: "MALAKOR COURTYARD",
    blurb: "Castle courtyard in daylight. Stone and banners.",
    district: "outskirts", area: "Malakor",
    art: "stages/arenas/arena-malakor-courtyard-day.webp", artReady: READY,
    sky: "alleys", lookLike: "ward", crowd: false,
    versus: true, walkable: true, openWorld: true,
    hook: "Castle grounds of the Onyx crew's turf — duels in the courtyard.",
  },
  {
    id: "arena-malakor-courtyard-night",
    name: "MALAKOR COURTYARD (NIGHT)",
    blurb: "Castle courtyard under torchlight.",
    district: "outskirts", area: "Malakor",
    art: "stages/arenas/arena-malakor-courtyard-night.webp", artReady: READY,
    sky: "alleys", lookLike: "ward", crowd: false,
    versus: true, walkable: true, openWorld: true,
    hook: "Night watch at the castle — courtyard fights by torchlight.",
  },
  {
    id: "arena-malakor-throne-hall",
    name: "MALAKOR THRONE HALL",
    blurb: "The seat of castle power. Stone pillars, high ceiling.",
    district: "outskirts", area: "Malakor",
    art: "stages/arenas/arena-malakor-throne-hall.webp", artReady: READY,
    sky: "alleys", lookLike: "ward", crowd: false,
    versus: true, walkable: true, openWorld: true,
    hook: "Audience fights before the throne — high-stakes grudges.",
  },
  {
    id: "arena-malakor-dungeon",
    name: "MALAKOR DUNGEON",
    blurb: "Below the castle. Chains, cells, no way out but winning.",
    district: "outskirts", area: "Malakor",
    art: "stages/arenas/arena-malakor-dungeon.webp", artReady: READY,
    sky: "subway", lookLike: "under", crowd: false,
    versus: true, walkable: true, openWorld: true,
    hook: "Prisoners' pit beneath the castle — grudge matches with no refs.",
  },
  {
    id: "arena-malakor-ramparts",
    name: "MALAKOR RAMPARTS",
    blurb: "The castle walls. High ground, long drop.",
    district: "outskirts", area: "Malakor",
    art: "stages/arenas/arena-malakor-ramparts.webp", artReady: READY,
    sky: "rooftops", lookLike: "high", crowd: false,
    versus: true, walkable: true, openWorld: true,
    hook: "Rooftop-style fights on the ramparts — edge ring-outs.",
  },
  {
    id: "arena-malakor-gatehouse",
    name: "MALAKOR GATEHOUSE",
    blurb: "The castle gate. Everyone enters through here.",
    district: "outskirts", area: "Malakor",
    art: "stages/arenas/arena-malakor-gatehouse.webp", artReady: READY,
    sky: "alleys", lookLike: "ward", crowd: false,
    versus: true, walkable: true, openWorld: true,
    hook: "Gate-crash fights — challengers stopped at the doors.",
  },
  // ---- Batch 1: industrial ----
  {
    id: "arena-crane-yard-day",
    name: "CRANE YARD (DAY)",
    blurb: "Sky cranes over the industrial yard. Day shift.",
    district: "industrial", area: "The Yards",
    art: "stages/arenas/arena-crane-yard-day.webp", artReady: READY,
    sky: "warehouses", lookLike: "yard", crowd: false,
    versus: true, walkable: true, openWorld: true,
    hook: "Contested Combine turf — day-shift brawls between the cranes.",
  },
  {
    id: "arena-crane-yard-night",
    name: "CRANE YARD (NIGHT)",
    blurb: "Sky cranes over the industrial yard. Night shift.",
    district: "industrial", area: "The Yards",
    art: "stages/arenas/arena-crane-yard-night.webp", artReady: READY,
    sky: "warehouses", lookLike: "yard", crowd: false,
    versus: true, walkable: true, openWorld: true,
    hook: "Night-shift turf fights under the floodlights.",
  },
  {
    id: "arena-warehouse-pit",
    name: "WAREHOUSE PIT",
    blurb: "Sunken pit inside a warehouse. Concrete walls.",
    district: "industrial", area: "The Yards",
    art: "stages/arenas/arena-warehouse-pit.webp", artReady: READY,
    sky: "warehouses", lookLike: "yard", crowd: false,
    versus: true, walkable: true, openWorld: true,
    hook: "Underground fight club pit in a rented warehouse.",
  },
  // ---- Batch 1: underground ----
  {
    id: "arena-underground-cage",
    name: "UNDERGROUND CAGE",
    blurb: "A cage below the city. Eight sides, no mercy.",
    district: "underground", area: "The Tunnels",
    art: "stages/arenas/arena-underground-cage.webp", artReady: READY,
    sky: "subway", lookLike: "under", crowd: false,
    versus: true, walkable: true, openWorld: true,
    hook: "Hollows-domain cage fights — what happens below stays below.",
  },
  {
    id: "arena-subway-platform",
    name: "SUBWAY PLATFORM",
    blurb: "The platform. Mind the gap — and the third rail.",
    district: "underground", area: "The Tunnels",
    art: "stages/arenas/arena-subway-platform.webp", artReady: READY,
    sky: "subway", lookLike: "under", crowd: false,
    versus: true, walkable: true, openWorld: true,
    hook: "Platform brawls between trains — the train runs on schedule.",
  },
  {
    id: "arena-subway-tunnel",
    name: "SUBWAY TUNNEL",
    blurb: "Inside the tunnel. Fluorescent tomb.",
    district: "underground", area: "The Tunnels",
    art: "stages/arenas/arena-subway-tunnel.webp", artReady: READY,
    sky: "subway", lookLike: "under", crowd: false,
    versus: true, walkable: true, openWorld: true,
    hook: "Tunnel ambushes — no witnesses, no lights past the work lamps.",
  },
  // ---- Batch 1: rooftops ----
  {
    id: "arena-rooftop-gated-day",
    name: "GATED ROOF (DAY)",
    blurb: "Urban Reign-style gated rooftop. Chain-link all around.",
    district: "neon-district", area: "Neon District",
    art: "stages/arenas/arena-rooftop-gated-day.webp", artReady: READY,
    sky: "rooftops", lookLike: "high", crowd: false,
    versus: true, walkable: true, openWorld: true,
    hook: "Neutral-ground rooftop fights above the Neon District.",
  },
  {
    id: "arena-rooftop-gated-night",
    name: "GATED ROOF (NIGHT)",
    blurb: "The gated rooftop under neon. Nowhere to run.",
    district: "neon-district", area: "Neon District",
    art: "stages/arenas/arena-rooftop-gated-night.webp", artReady: READY,
    sky: "rooftops", lookLike: "high", crowd: false,
    versus: true, walkable: true, openWorld: true,
    hook: "Night rooftop meetups — neon-noir grudge fights.",
  },
  {
    id: "arena-rooftop-garden",
    name: "ROOFTOP GARDEN",
    blurb: "A garden on top of the city. Quiet — until it isn't.",
    district: "neon-district", area: "Neon District",
    art: "stages/arenas/arena-rooftop-garden.webp", artReady: READY,
    sky: "rooftops", lookLike: "high", crowd: false,
    versus: true, walkable: true, openWorld: true,
    hook: "High-society rooftop — corporate crews settle it in the garden.",
  },
  {
    id: "arena-helipad",
    name: "HELIPAD",
    blurb: "A helipad over the skyline. Wind and rotors.",
    district: "neon-district", area: "Neon District",
    art: "stages/arenas/arena-helipad.webp", artReady: READY,
    sky: "rooftops", lookLike: "high", crowd: false,
    versus: true, walkable: true, openWorld: true,
    hook: "Corporate extraction gone wrong — fight on the pad.",
  },
  // ---- Batch 1: street / civic / outskirts ----
  {
    id: "arena-alley",
    name: "THE ALLEY",
    blurb: "Brick canyon between the blocks. Classic brawl.",
    district: "projects", area: "The Projects",
    art: "stages/arenas/arena-alley.webp", artReady: READY,
    sky: "alleys", lookLike: "ward", crowd: false,
    versus: true, walkable: true, openWorld: true,
    hook: "Street-crew scraps in the Projects alleys.",
  },
  {
    id: "arena-boxing-gym",
    name: "BOXING GYM",
    blurb: "Mats, bags, and bad intentions.",
    district: "marquee-mile", area: "Marquee Mile",
    art: "stages/arenas/arena-boxing-gym.webp", artReady: READY,
    sky: "strip", lookLike: "ward", crowd: false,
    versus: true, walkable: true, openWorld: true,
    hook: "Sparring goes sideways when the wrong crew walks in.",
  },
  {
    id: "arena-cathedral",
    name: "CATHEDRAL",
    blurb: "An old stone cathedral on the edge of town.",
    district: "outskirts", area: "Outskirts",
    art: "stages/arenas/arena-cathedral.webp", artReady: READY,
    sky: "alleys", lookLike: "ward", crowd: false,
    versus: true, walkable: true, openWorld: true,
    hook: "Sanctuary fights — zealots and crews clash among the pews.",
  },
  {
    id: "arena-junkyard-day",
    name: "JUNKYARD",
    blurb: "Scrap piles for walls. Crash through them.",
    district: "outskirts", area: "Outskirts",
    art: "stages/arenas/arena-junkyard-day.webp", artReady: READY,
    sky: "warehouses", lookLike: "yard", crowd: false,
    versus: true, walkable: true, openWorld: true,
    hook: "Scrappers' proving ground — anything loose is a weapon.",
  },
  {
    id: "arena-motel-lot",
    name: "MOTEL LOT",
    blurb: "A roadside motel parking lot. Neon vacancy.",
    district: "outskirts", area: "Outskirts",
    art: "stages/arenas/arena-motel-lot.webp", artReady: READY,
    sky: "alleys", lookLike: "yard", crowd: false,
    versus: true, walkable: true, openWorld: true,
    hook: "Roadside ambushes off the highway corridor.",
  },
  {
    id: "arena-night-market",
    name: "NIGHT MARKET",
    blurb: "Stalls, lanterns, and crowds that scatter.",
    district: "marquee-mile", area: "Marquee Mile",
    art: "stages/arenas/arena-night-market.webp", artReady: READY,
    sky: "strip", lookLike: "ward", crowd: false,
    versus: true, walkable: true, openWorld: true,
    hook: "Market crews protect their stalls — fight between them.",
  },
  {
    id: "arena-parking-garage",
    name: "PARKING GARAGE",
    blurb: "Concrete deck, parked cars, sodium lamps.",
    district: "civic", area: "Civic Center",
    art: "stages/arenas/arena-parking-garage.webp", artReady: READY,
    sky: "warehouses", lookLike: "yard", crowd: false,
    versus: true, walkable: true, openWorld: true,
    hook: "Downtown Civic brawls — the cars are the walls.",
  },
  {
    id: "arena-docks",
    name: "THE DOCKS",
    blurb: "Containers like canyons. Foghorns and secrets.",
    district: "waterfront", area: "Waterfront",
    art: "stages/arenas/arena-docks.webp", artReady: READY,
    sky: "warehouses", lookLike: "dock", crowd: false,
    versus: true, walkable: true, openWorld: true,
    hook: "Port smuggling turf — Combine crews hold the docks.",
  },
  // ---- Batch 2: Stadium district (wrestling-company venues) ----
  {
    id: "arena-ring-square",
    name: "RING SQUARE",
    blurb: "Regulation wrestling ring under the house lights.",
    district: "civic", area: "Stadium",
    art: "stages/arenas/arena-ring-square.webp", artReady: READY,
    sky: "strip", lookLike: "ward", crowd: true,
    versus: true, walkable: true, openWorld: true,
    hook: "Company wrestling events — the purest fight in the city.",
  },
  {
    id: "arena-backstage",
    name: "BACKSTAGE",
    blurb: "Behind the curtain. Crates, cables, and grudges.",
    district: "civic", area: "Stadium",
    art: "stages/arenas/arena-backstage.webp", artReady: READY,
    sky: "warehouses", lookLike: "ward", crowd: false,
    versus: true, walkable: true, openWorld: true,
    hook: "Wrestling-company backstage brawls — settle it off-camera.",
  },
  {
    id: "arena-mma-octagon",
    name: "MMA OCTAGON",
    blurb: "Eight-sided steel cage. No escape from the walls.",
    district: "civic", area: "Stadium",
    art: "stages/arenas/arena-mma-octagon.webp", artReady: READY,
    sky: "strip", lookLike: "ward", crowd: true,
    versus: true, walkable: true, openWorld: true,
    hook: "Cage-fight events — eight sides, one winner.",
  },
  {
    id: "arena-jpcw",
    name: "JPCW ARENA",
    blurb: "Tokyo corporate wrestling cathedral. Giant screens, big ring.",
    district: "civic", area: "Stadium",
    art: "stages/arenas/arena-jpcw.webp", artReady: READY,
    sky: "strip", lookLike: "ward", crowd: true,
    versus: true, walkable: true, openWorld: true,
    hook: "Visiting-promotion special — JPCW runs the cathedral tonight.",
  },
  // ---- Batch 2: downtown strip interiors ----
  {
    id: "arena-bar-interior",
    name: "THE BAR",
    blurb: "Brick walls, wooden bar, broken bottles. Classic brawl.",
    district: "marquee-mile", area: "Marquee Mile",
    art: "stages/arenas/arena-bar-interior.webp", artReady: READY,
    sky: "strip", lookLike: "ward", crowd: false,
    versus: true, walkable: true, openWorld: true,
    hook: "Brawler-gang fight nights at the bar — bottles fly.",
  },
  {
    id: "arena-arcade-interior",
    name: "ARCADE",
    blurb: "Neon arcade interior. Rows of cabinets, late night.",
    district: "marquee-mile", area: "Marquee Mile",
    art: "stages/arenas/arena-arcade-interior.webp", artReady: READY,
    sky: "strip", lookLike: "ward", crowd: false,
    versus: true, walkable: true, openWorld: true,
    hook: "Crew hangout on the strip — tokens and teeth get knocked out.",
  },
  {
    id: "arena-hotel-lobby",
    name: "HOTEL LOBBY",
    blurb: "Grand lobby. Marble columns, chandelier. Five stars, zero mercy.",
    district: "marquee-mile", area: "Marquee Mile",
    art: "stages/arenas/arena-hotel-lobby.webp", artReady: READY,
    sky: "strip", lookLike: "ward", crowd: false,
    versus: true, walkable: true, openWorld: true,
    hook: "Corporate muscle settles contracts in the lobby.",
  },
  {
    id: "arena-studio",
    name: "STUDIO",
    blurb: "TV studio set. Cameras rolling, lights hot.",
    district: "marquee-mile", area: "Marquee Mile",
    art: "stages/arenas/arena-studio.webp", artReady: READY,
    sky: "strip", lookLike: "ward", crowd: false,
    versus: true, walkable: true, openWorld: true,
    hook: "Some fights are staged for the cameras. This one isn't.",
  },
  {
    id: "arena-club-onyx",
    name: "CLUB ONYX",
    blurb: "Underground nightclub. Neon dance floor, VIP rails for walls.",
    district: "waterfront", area: "Waterfront",
    art: "stages/arenas/arena-club-onyx.webp", artReady: READY,
    sky: "strip", lookLike: "ward", crowd: false,
    versus: true, walkable: true, openWorld: true,
    hook: "Club brawls — the VIP rails are the ropes.",
  },
  // ---- Batch 2: projects / street ----
  {
    id: "arena-street-court",
    name: "STREET COURT",
    blurb: "Basketball blacktop at dusk. Chain nets, sodium lights.",
    district: "projects", area: "The Projects",
    art: "stages/arenas/arena-street-court.webp", artReady: READY,
    sky: "alleys", lookLike: "yard", crowd: false,
    versus: true, walkable: true, openWorld: true,
    hook: "Projects courtyard pickup games that turn into fights.",
  },
  {
    id: "arena-ghetto-streets",
    name: "GHETTO STREETS",
    blurb: "Open street, no boundaries. Stoops and corner stores.",
    district: "projects", area: "The Projects",
    art: "stages/arenas/arena-ghetto-streets.webp", artReady: READY,
    sky: "alleys", lookLike: "ward", crowd: false,
    versus: true, walkable: true, openWorld: true,
    hook: "Multi-crew street brawl — anything goes, anywhere.",
  },
  // ---- Batch 2: outskirts ----
  {
    id: "arena-prison-yard",
    name: "PRISON YARD",
    blurb: "Concrete and fences. Guard tower, harsh day.",
    district: "outskirts", area: "Outskirts",
    art: "stages/arenas/arena-prison-yard.webp", artReady: READY,
    sky: "park", lookLike: "yard", crowd: false,
    versus: true, walkable: true, openWorld: true,
    hook: "Yard fights with lifers watching — rep is currency.",
  },
  {
    id: "arena-trailer-park",
    name: "TRAILER PARK",
    blurb: "Rust, gravel, and grudges at dusk.",
    district: "outskirts", area: "Vesper",
    art: "stages/arenas/arena-trailer-park.webp", artReady: READY,
    sky: "park", lookLike: "yard", crowd: false,
    versus: true, walkable: true, openWorld: true,
    hook: "Small-town turf — trailer-park grudges go back years.",
  },
  {
    id: "arena-cemetery",
    name: "CEMETERY",
    blurb: "Among the stones at night. Moonlight.",
    district: "outskirts", area: "Outskirts",
    art: "stages/arenas/arena-cemetery.webp", artReady: READY,
    sky: "park", lookLike: "ward", crowd: false,
    versus: true, walkable: true, openWorld: true,
    hook: "Night fights among the stones. Fitting.",
  },
  {
    id: "arena-black-swamp",
    name: "BLACK SWAMP",
    blurb: "Fog, mud, and a gothic ruin. Cypress logs for walls.",
    district: "outskirts", area: "Outskirts",
    art: "stages/arenas/arena-black-swamp.webp", artReady: READY,
    sky: "park", lookLike: "ward", crowd: false,
    versus: true, walkable: true, openWorld: true,
    hook: "Swamp meetups — fog covers everything.",
  },
  // ---- Batch 2: civic ----
  {
    id: "arena-police-yard",
    name: "POLICE YARD",
    blurb: "Impound lot at night. Cop cars for cover.",
    district: "civic", area: "Civic Center",
    art: "stages/arenas/arena-police-yard.webp", artReady: READY,
    sky: "warehouses", lookLike: "yard", crowd: false,
    versus: true, walkable: true, openWorld: true,
    hook: "Authority turf — raid the impound or fight off a crew raid.",
  },
  {
    id: "arena-hospital",
    name: "HOSPITAL",
    blurb: "Hospital interior. Harsh fluorescents.",
    district: "civic", area: "Civic Center",
    art: "stages/arenas/arena-hospital.webp", artReady: READY,
    sky: "warehouses", lookLike: "ward", crowd: false,
    versus: true, walkable: true, openWorld: true,
    hook: "Authority turf — unfinished business in the corridors.",
  },
  {
    id: "arena-school-yard",
    name: "SCHOOL YARD",
    blurb: "Suburban school yard at dusk. Too clean.",
    district: "suburbs", area: "Suburbs",
    art: "stages/arenas/arena-school-yard.webp", artReady: READY,
    sky: "park", lookLike: "yard", crowd: false,
    versus: true, walkable: true, openWorld: true,
    hook: "After-hours suburban meetups — playground rules.",
  },
  // ---- Batch 2: industrial hazards ----
  {
    id: "arena-foundry",
    name: "FOUNDRY",
    blurb: "Industrial foundry. Catwalk over molten metal.",
    district: "industrial", area: "The Yards",
    art: "stages/arenas/arena-foundry.webp", artReady: READY,
    sky: "warehouses", lookLike: "yard", crowd: false,
    versus: true, walkable: true, openWorld: true,
    hook: "Foundry hazard fights — the catwalk is the whole game.",
  },
  {
    id: "arena-grinder-pit",
    name: "GRINDER PIT",
    blurb: "Catwalk above spinning industrial grinders.",
    district: "industrial", area: "The Yards",
    art: "stages/arenas/arena-grinder-pit.webp", artReady: READY,
    sky: "warehouses", lookLike: "yard", crowd: false,
    versus: true, walkable: true, openWorld: true,
    hook: "Grinder hazard fights — one slam ends it.",
  },
  // ---- Batch 2: new-district key art ----
  {
    id: "district-port-silas",
    name: "PORT SILAS",
    blurb: "Coastal port district. Warehouses, historic grid, cranes, fog.",
    district: "waterfront", area: "Port Silas",
    art: "stages/arenas/district-port-silas.webp", artReady: READY,
    sky: "warehouses", lookLike: "dock", crowd: false,
    versus: true, walkable: true, openWorld: true,
    hook: "Black-market port — smuggling crews and old money.",
  },
  {
    id: "district-altair-city",
    name: "ALTAIR CITY",
    blurb: "Metro downtown. Highrise core, highways, corporate towers.",
    district: "marquee-mile", area: "Altair City",
    art: "stages/arenas/district-altair-city.webp", artReady: READY,
    sky: "strip", lookLike: "ward", crowd: false,
    versus: true, walkable: true, openWorld: true,
    hook: "Corporate-syndicate metro — highrise turf, highway runs.",
  },
  {
    id: "district-vesper",
    name: "VESPER",
    blurb: "Small southern town. Historic main street, golden hour.",
    district: "outskirts", area: "Vesper",
    art: "stages/arenas/district-vesper.webp", artReady: READY,
    sky: "park", lookLike: "yard", crowd: false,
    versus: true, walkable: true, openWorld: true,
    hook: "Small-town roots — the tutorial turf where it all starts.",
  },
  // ---- Batch 2: Malakor expansion ----
  {
    id: "arena-malakor-shrine",
    name: "MALAKOR SHRINE",
    blurb: "Stone temple shrine. Pillars, stepped pyramid, braziers.",
    district: "outskirts", area: "Malakor",
    art: "stages/arenas/arena-malakor-shrine.webp", artReady: READY,
    sky: "alleys", lookLike: "ward", crowd: false,
    versus: true, walkable: true, openWorld: true,
    hook: "Outer shrine of the castle — ritual duels by brazier light.",
  },
  // ---- Batch 2: exotic / event ----
  {
    id: "arena-dojo",
    name: "DOJO",
    blurb: "Wooden dojo interior. Breakable floor panels.",
    district: "suburbs", area: "Suburbs",
    art: "stages/arenas/arena-dojo.webp", artReady: READY,
    sky: "alleys", lookLike: "ward", crowd: false,
    versus: true, walkable: true, openWorld: true,
    hook: "Training dojo — slam them through the floor.",
  },
  {
    id: "arena-bridge",
    name: "THE BRIDGE",
    blurb: "Bridge over the water at dusk. Faction-war chokepoint.",
    district: "waterfront", area: "Waterfront",
    art: "stages/arenas/arena-bridge.webp", artReady: READY,
    sky: "warehouses", lookLike: "dock", crowd: false,
    versus: true, walkable: true, openWorld: true,
    hook: "Chokepoint bridge — hold the line or fall in the water.",
  },
  {
    id: "arena-banyan-tree",
    name: "BANYAN TREE",
    blurb: "The Mother Tree clearing. Roots for walls, fungi for light.",
    district: "outskirts", area: "Outskirts",
    art: "stages/arenas/arena-banyan-tree.webp", artReady: READY,
    sky: "park", lookLike: "ward", crowd: false,
    versus: true, walkable: true, openWorld: true,
    hook: "Exotic zone — the clearing walled by living roots.",
  },
];

/** Look up a manifest entry by arena id (null for legacy ids like "ward"). */
export function getArena(id: string): ArenaEntry | undefined {
  return ARENA_MANIFEST.find((a) => a.id === id);
}

/** All art-ready arenas selectable in versus mode. */
export function getVersusArenas(): ArenaEntry[] {
  return ARENA_MANIFEST.filter((a) => a.versus && a.artReady);
}

/** All art-ready arenas, grouped for the arena-select screen. */
export function getSelectableArenas(): ArenaEntry[] {
  return ARENA_MANIFEST.filter((a) => a.artReady);
}

/** Arenas whose art hasn't landed yet (kept in the manifest as future picks). */
export function getPendingArenas(): ArenaEntry[] {
  return ARENA_MANIFEST.filter((a) => !a.artReady);
}

/** Open-world-anchored arenas in a given district. */
export function getArenasByDistrict(district: CityDistrictId): ArenaEntry[] {
  return ARENA_MANIFEST.filter((a) => a.district === district && a.openWorld && a.artReady);
}

/** Arena ids that get the tiered-stands crowd (merged with legacy "pit"). */
export const CROWD_ARENA_IDS: readonly string[] = ARENA_MANIFEST.filter((a) => a.crowd).map((a) => a.id);
