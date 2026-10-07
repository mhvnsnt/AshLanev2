/**
 * AshLane background brawler registry — wave 7a animated humans (owner 2026-10-07).
 *
 * Quaternius CC0 animated humanoids with real fight clips (punches, kicks,
 * hit reactions, deaths). Used as background brawlers / street NPC fighters.
 * NO KayKit, NO monsters — humans only per owner law.
 *
 * Clip libraries verified from GLB JSON at staging time (see PACK_README.md
 * in game/assets/staging/parts/w7a-ashlane-brawlers/).
 */

import { assetUrl } from "./asset-base";

export interface BrawlerDef {
  /** rig slot id */
  id: string;
  /** display label */
  label: string;
  /** file under public/models/humanoid/brawlers/ */
  file: string;
  /** known animation clip name fragments (for moveset mapping) */
  clips: readonly string[];
  /** source pack (license tracking) */
  source: string;
}

export const BRAWLERS: readonly BrawlerDef[] = [
  {
    id: "brawler-farmer", label: "Farmer", file: "brawler-farmer.glb",
    clips: ["Punch_L", "Punch_R", "Kick_L", "Kick_R", "HitRecieve", "Death", "Roll"],
    source: "pp-quaternius-brawlers",
  },
  {
    id: "brawler-worker", label: "Worker", file: "brawler-worker.glb",
    clips: ["Punch_L", "Punch_R", "Kick_L", "Kick_R", "HitRecieve", "Death", "Roll"],
    source: "pp-quaternius-brawlers",
  },
  {
    id: "brawler-adventurer", label: "Adventurer", file: "brawler-adventurer.glb",
    clips: ["Punch_L", "Punch_R", "Kick_L", "Kick_R", "HitRecieve", "Death", "Roll"],
    source: "pp-quaternius-brawlers",
  },
  {
    id: "brawler-casual", label: "Casual", file: "brawler-casual.glb",
    clips: ["Punch_L", "Punch_R", "Kick_L", "Kick_R", "HitRecieve", "Death", "Roll"],
    source: "pp-quaternius-brawlers",
  },
  {
    id: "brawler-base", label: "Base", file: "brawler-base.glb",
    clips: ["Punch_Jab", "Punch_Cross", "Punch_Enter", "Hit_Chest", "Hit_Head", "Death01", "Dance_Loop"],
    source: "poly-pizza-quaternius", // CC-BY 3.0 — credited
  },
  {
    id: "brawler-woman", label: "Woman", file: "brawler-woman.glb",
    clips: ["Punch_Left", "Punch_Right", "Kick_Left", "Kick_Right", "HitRecieve", "Death"],
    source: "poly-pizza-quaternius",
  },
  {
    id: "brawler-hoodie", label: "Hoodie", file: "brawler-hoodie.glb",
    clips: ["Punch_Left", "Punch_Right", "Kick_Left", "Kick_Right", "HitRecieve", "Death"],
    source: "poly-pizza-quaternius",
  },
  {
    id: "brawler-business", label: "Business", file: "brawler-business.glb",
    clips: ["Man_Punch", "Man_Death", "Man_Idle", "Man_Walk", "Man_Run"],
    source: "poly-pizza-quaternius",
  },
  {
    id: "brawler-casual2", label: "Casual 2", file: "brawler-casual2.glb",
    clips: ["Punch_Left", "Punch_Right", "Kick_Left", "Kick_Right", "HitRecieve", "Death"],
    source: "poly-pizza-quaternius",
  },
];

/** Deploy-safe URL for a brawler model. */
export function brawlerUrl(id: string): string | undefined {
  const b = BRAWLERS.find((x) => x.id === id);
  return b ? assetUrl(`models/humanoid/brawlers/${b.file}`) : undefined;
}

/** All brawler model URLs (for preloading). */
export function allBrawlerUrls(): string[] {
  return BRAWLERS.map((b) => assetUrl(`models/humanoid/brawlers/${b.file}`));
}

// Licenses: Quaternius CC0 (https://quaternius.com); Poly Pizza per-model
// CC0/CC-BY 3.0 — CC-BY authors credited in env-assets.ts ASSET_LICENSES.
