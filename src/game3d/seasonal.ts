/**
 * AshLane seasonal decoration system — GTA-style calendar rotation (owner 2026-10-07).
 *
 * Halloween PROPS appear ONLY during Halloween month (October).
 * Christmas/snow props appear around Christmas (December).
 * Never year-round. Monsters/creatures are NOT seasonal props — they are
 * banned from AshLane entirely (owner law 2026-10-07, humans only).
 *
 * Staging flags: packs carrying SEASONAL.md are month-gated. The game reads
 * this registry — never hardcode month checks at call sites.
 */

import { assetUrl } from "./asset-base";

export interface SeasonalSet {
  /** stable id */
  id: "halloween" | "christmas";
  /** display label */
  label: string;
  /** 0-indexed months when this set is visible (0 = January) */
  months: readonly number[];
  /** model paths under public/, relative */
  props: readonly string[];
}

/** Halloween prop models (CC0, 3dassets.dev) — static decorations only. */
const HALLOWEEN_PROPS = [
  "bat-ornament.glb",
  "black-cat.glb",
  "burlap-scarecrow.glb",
  "cellar-spider.glb",
  "coffin.glb",
  "eclipse-pumpkin.glb",
  "gravestone.glb",
  "grinning-lantern-pumpkin.glb",
  "harvest-pumpkin.glb",
  "hockey-mask.glb",
  "sheet-ghost.glb",
  "wandering-sheet-ghost.glb",
  // ... 26 total in public/models/seasonal/halloween/
] as const;

/** Christmas prop models (CC0, Polygonal Mind via open-source-3d-assets registry). */
const CHRISTMAS_PROPS = [
  "xmastree.glb", "minitree.glb",
  "wreath01.glb", "wreath02.glb", "wreath03.glb", "wreath04.glb", "wreaths05.glb",
  "present01.glb", "present02.glb", "present03.glb",
  "presentsackxmas01.glb", "presentsackxmas02.glb",
  "lights01.glb", "lights02.glb", "lamp01.glb",
  "candle.glb", "fireplace.glb",
  "candycane.glb", "snowball.glb", "star.glb",
  "sockxmas.glb", "noelcap.glb",
] as const;

export const SEASONAL_SETS: readonly SeasonalSet[] = [
  {
    id: "halloween",
    label: "Halloween",
    months: [9], // October only
    props: HALLOWEEN_PROPS.map((f) => `models/seasonal/halloween/${f}`),
  },
  {
    id: "christmas",
    label: "Christmas",
    months: [11], // December only
    props: CHRISTMAS_PROPS.map((f) => `models/seasonal/christmas/${f}`),
  },
];

/** Which seasonal sets are active for the given date (default: now). */
export function activeSeasonalSets(date: Date = new Date()): SeasonalSet[] {
  const m = date.getMonth();
  return SEASONAL_SETS.filter((s) => s.months.includes(m));
}

/** True if the named seasonal set is active right now. */
export function isSeasonActive(id: SeasonalSet["id"], date: Date = new Date()): boolean {
  return activeSeasonalSets(date).some((s) => s.id === id);
}

/** Deploy-safe URLs for all props of the currently active seasonal sets. */
export function activeSeasonalPropUrls(date: Date = new Date()): string[] {
  const out: string[] = [];
  for (const s of activeSeasonalSets(date)) {
    for (const p of s.props) out.push(assetUrl(p));
  }
  return out;
}

/** For debug menus / testing: force a month (0-11) instead of the real date. */
export function seasonalSetsForMonth(month: number): SeasonalSet[] {
  return SEASONAL_SETS.filter((s) => s.months.includes(month));
}
