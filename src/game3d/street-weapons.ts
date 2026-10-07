/**
 * AshLane street weapon registry — wave 7c melee weapons (owner 2026-10-07).
 *
 * 14 CC0 street weapons from 3dassets.dev (Mega Weapon Pack + Halloween
 * Slasher Street), per-asset API-verified CC0 1.0. Staged from
 * game/assets/staging/parts/w7c-ashlane-weapons-creatures/for-ashlane/3dassets-melee-weapons/.
 *
 * All paths go through assetUrl() from ./asset-base (Pages base-path safe).
 */

import { assetUrl } from "./asset-base";

export interface StreetWeapon {
  /** stable id for save/game logic */
  id: string;
  /** display name */
  label: string;
  /** path under public/, relative */
  file: string;
  /** blunt | blade | heavy — drives sound + damage profile hooks */
  kind: "blunt" | "blade" | "heavy";
  /** approximate reach in meters (for hit-range tuning) */
  reach: number;
}

const W = (id: string, label: string, file: string, kind: StreetWeapon["kind"], reach: number): StreetWeapon => ({
  id, label, file: `models/weapons/street/${file}`, kind, reach,
});

export const STREET_WEAPONS: readonly StreetWeapon[] = [
  W("baseball-bat", "Baseball Bat", "baseball-bat.glb", "blunt", 0.9),
  W("nailed-bat", "Nailed Bat", "nailed-bat.glb", "blunt", 0.9),
  W("crowbar", "Crowbar", "crowbar.glb", "blunt", 0.7),
  W("telescopic-baton", "Telescopic Baton", "telescopic-baton.glb", "blunt", 0.6),
  W("adjustable-wrench", "Wrench", "adjustable-wrench.glb", "blunt", 0.45),
  W("metal-trash-can", "Trash Can", "metal-trash-can.glb", "blunt", 0.5),
  W("machete", "Machete", "machete.glb", "blade", 0.7),
  W("combat-knife", "Combat Knife", "combat-knife.glb", "blade", 0.35),
  W("bowie-knife", "Bowie Knife", "bowie-knife.glb", "blade", 0.35),
  W("kitchen-knife", "Kitchen Knife", "kitchen-knife.glb", "blade", 0.3),
  W("tomahawk", "Tomahawk", "tomahawk.glb", "blade", 0.55),
  W("fire-axe", "Fire Axe", "fire-axe.glb", "heavy", 0.9),
  W("sledgehammer", "Sledgehammer", "sledgehammer.glb", "heavy", 0.9),
  W("chainsaw", "Chainsaw", "chainsaw.glb", "heavy", 0.7),
];

/** Look up a street weapon by id. */
export function streetWeapon(id: string): StreetWeapon | undefined {
  return STREET_WEAPONS.find((w) => w.id === id);
}

/** Full deploy-safe URL for a street weapon model. */
export function streetWeaponUrl(id: string): string | undefined {
  const w = streetWeapon(id);
  return w ? assetUrl(w.file) : undefined;
}

/** All street weapon model URLs (for preloading). */
export function allStreetWeaponUrls(): string[] {
  return STREET_WEAPONS.map((w) => assetUrl(w.file));
}

// License: 3dassets.dev — CC0 1.0 Universal, per-asset API-verified.
// See ASSET_LICENSES["3dassets-melee-weapons"] in ./env-assets.
