/**
 * AshLane environment asset registry.
 *
 * Organizes all CC0 environment GLBs by district. Every asset here is
 * license-clean:
 * - Kenney.nl assets: CC0 (https://kenney.nl/assets)
 * - Quaternius packs: CC0 (https://quaternius.com)
 *
 * Usage: import { DISTRICT_ASSETS } and feed the GLB paths into your
 * loader. The worldgen procedural modules use these as hero pieces
 * alongside procedural geometry.
 */

import type { DistrictId } from "./worldgen";

export interface EnvAsset {
  /** path under public/, RELATIVE (no leading slash) — wrap with assetUrl() from ./asset-base */
  path: string;
  /** category for placement logic */
  kind: "building" | "street" | "prop" | "nature" | "sign" | "vehicle";
  /** relative scale multiplier */
  scale: number;
  /** does it block movement? */
  solid: boolean;
  /** source pack (for license tracking) */
  source: string;
}

export const DISTRICT_ASSETS: Record<DistrictId, EnvAsset[]> = {
  alleys: [
    { path: "models/kenney/building-a.glb", kind: "building", scale: 1.0, solid: true, source: "kenney-city-kit" },
    { path: "models/kenney/low-detail-building-a.glb", kind: "building", scale: 1.0, solid: true, source: "kenney-city-kit" },
    { path: "models/kenney/low-detail-building-b.glb", kind: "building", scale: 1.0, solid: true, source: "kenney-city-kit" },
    { path: "models/env/street/Street_Straight.glb", kind: "street", scale: 1.0, solid: false, source: "quaternius-street-pack" },
    { path: "models/env/street/Street_Curve.glb", kind: "street", scale: 1.0, solid: false, source: "quaternius-street-pack" },
    { path: "models/env/street/Street_Deadend.glb", kind: "street", scale: 1.0, solid: false, source: "quaternius-street-pack" },
    { path: "models/env/street/Streetlight_Double.glb", kind: "street", scale: 1.0, solid: true, source: "quaternius-street-pack" },
    { path: "models/env/street/Sign_Stop.glb", kind: "sign", scale: 1.0, solid: true, source: "quaternius-street-pack" },
    { path: "models/env/street/Sign_NoParking.glb", kind: "sign", scale: 1.0, solid: true, source: "quaternius-street-pack" },
  ],
  strip: [
    { path: "models/kenney/building-skyscraper-a.glb", kind: "building", scale: 1.2, solid: true, source: "kenney-city-kit" },
    { path: "models/kenney/building-a.glb", kind: "building", scale: 1.1, solid: true, source: "kenney-city-kit" },
    { path: "models/kenney/low-detail-building-wide-a.glb", kind: "building", scale: 1.0, solid: true, source: "kenney-city-kit" },
    { path: "models/env/street/Street_4Way.glb", kind: "street", scale: 1.0, solid: false, source: "quaternius-street-pack" },
    { path: "models/env/street/Street_4Way_2.glb", kind: "street", scale: 1.0, solid: false, source: "quaternius-street-pack" },
    { path: "models/env/street/Street_3Way.glb", kind: "street", scale: 1.0, solid: false, source: "quaternius-street-pack" },
    { path: "models/env/street/Streetlight_Double.glb", kind: "street", scale: 1.0, solid: true, source: "quaternius-street-pack" },
    { path: "models/env/street/Sign_Triangle.glb", kind: "sign", scale: 1.0, solid: true, source: "quaternius-street-pack" },
  ],
  warehouses: [
    { path: "models/kenney/low-detail-building-c.glb", kind: "building", scale: 1.3, solid: true, source: "kenney-city-kit" },
    { path: "models/kenney/low-detail-building-a.glb", kind: "building", scale: 1.2, solid: true, source: "kenney-city-kit" },
    { path: "models/kenney/low-detail-building-b.glb", kind: "building", scale: 1.2, solid: true, source: "kenney-city-kit" },
    { path: "models/env/street/Street_Straight.glb", kind: "street", scale: 1.0, solid: false, source: "quaternius-street-pack" },
    { path: "models/env/street/Street_Elevated.glb", kind: "street", scale: 1.0, solid: false, source: "quaternius-street-pack" },
    { path: "models/env/street/Street_Bridge.glb", kind: "street", scale: 1.0, solid: true, source: "quaternius-street-pack" },
    { path: "models/props/Desk.glb", kind: "prop", scale: 1.0, solid: true, source: "quaternius-furniture-pack" },
    { path: "models/props/Bookcase.glb", kind: "prop", scale: 1.0, solid: true, source: "quaternius-furniture-pack" },
  ],
  subway: [
    { path: "models/env/street/Street_Bridge_Underpass.glb", kind: "street", scale: 1.0, solid: true, source: "quaternius-street-pack" },
    { path: "models/env/street/Street_Deadend.glb", kind: "street", scale: 1.0, solid: false, source: "quaternius-street-pack" },
    { path: "models/env/street/Street_Curve.glb", kind: "street", scale: 1.0, solid: false, source: "quaternius-street-pack" },
    // subway is primarily procedural (tunnels, platforms) — minimal GLBs
  ],
  rooftops: [
    { path: "models/kenney/building-skyscraper-a.glb", kind: "building", scale: 1.0, solid: true, source: "kenney-city-kit" },
    { path: "models/kenney/low-detail-building-wide-a.glb", kind: "building", scale: 1.0, solid: true, source: "kenney-city-kit" },
    { path: "models/env/street/Street_Elevated.glb", kind: "street", scale: 1.0, solid: false, source: "quaternius-street-pack" },
    { path: "models/env/street/Street_Elevated_Ramp.glb", kind: "street", scale: 1.0, solid: false, source: "quaternius-street-pack" },
    { path: "models/env/street/Street_Bridge.glb", kind: "street", scale: 1.0, solid: true, source: "quaternius-street-pack" },
  ],
  park: [
    { path: "models/kenney/nature/tree_oak.glb", kind: "nature", scale: 1.0, solid: true, source: "kenney-nature-kit" },
    { path: "models/kenney/nature/tree_default.glb", kind: "nature", scale: 1.0, solid: true, source: "kenney-nature-kit" },
    { path: "models/kenney/nature/plant_bush.glb", kind: "nature", scale: 1.0, solid: false, source: "kenney-nature-kit" },
    { path: "models/kenney/nature/grass_large.glb", kind: "nature", scale: 1.0, solid: false, source: "kenney-nature-kit" },
    { path: "models/kenney/nature/rock_largeA.glb", kind: "nature", scale: 1.0, solid: true, source: "kenney-nature-kit" },
    { path: "models/kenney/nature/fence_simple.glb", kind: "nature", scale: 1.0, solid: true, source: "kenney-nature-kit" },
    { path: "models/kenney/nature/flower_redA.glb", kind: "nature", scale: 1.0, solid: false, source: "kenney-nature-kit" },
    { path: "models/props/Bench.glb", kind: "prop", scale: 1.0, solid: true, source: "quaternius-furniture-pack" },
  ],
};

/** All assets for a district, filtered by kind. */
export function assetsFor(id: DistrictId, kind?: EnvAsset["kind"]): EnvAsset[] {
  const all = DISTRICT_ASSETS[id] ?? [];
  return kind ? all.filter((a) => a.kind === kind) : all;
}

/** Flat list of every registered asset path (for preloading). */
export function allAssetPaths(): string[] {
  const seen = new Set<string>();
  for (const id of Object.keys(DISTRICT_ASSETS) as DistrictId[]) {
    for (const a of DISTRICT_ASSETS[id]) seen.add(a.path);
  }
  return [...seen];
}

// ---------------------------------------------------------------------------
// License manifest — every source pack and its license
// ---------------------------------------------------------------------------

export const ASSET_LICENSES: Record<string, { license: string; url: string }> = {
  "kenney-city-kit": { license: "CC0", url: "https://kenney.nl/assets" },
  "kenney-nature-kit": { license: "CC0", url: "https://kenney.nl/assets" },
  "quaternius-street-pack": { license: "CC0", url: "https://quaternius.com" },
  "quaternius-furniture-pack": { license: "CC0", url: "https://quaternius.com" },
};
