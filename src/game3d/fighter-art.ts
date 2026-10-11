/**
 * ASHLANE v4 — real fighter art mapping.
 *
 * Maps roster fighter ids to their real portrait renders in public/portraits/.
 * Returns null when no real portrait exists → caller falls back to the
 * procedural FighterPortrait SVG.
 *
 * Owner rule: every attire/version gets a card; the main portrait is the
 * default/primary look. White-void versions exist for model-gen, not menus.
 */

import { assetUrl } from "./asset-base";

const PORTRAIT_MAP: Record<string, string> = {
  maime: "maime.webp",
  brutus: "brutus.webp",
  cain: "cain.webp",
  viper: "viper.webp",
  titan: "titan-unmasked.webp",
  stickup: "stickup.webp",
  finxsse: "finxsse.webp",
  tyneshia: "tyneshia-street.webp",
  onyx: "onyx.webp",
  cody: "cody.webp",
  cipher: "cipher.webp",
  echo: "echo.webp",
  pablo: "pablo.webp",
  kobra: "kobra.webp",
  hollow: "hollow.webp",
  hall: "hall-nighter.webp",
  edwin: "edwin-kennedy.webp",
  aaron: "aaron-ruben.webp",
  sensei: "master-sensei.webp",
  toro: "el-toro-de-oro.webp",
  static: "static.webp",
  stan: "stan-combs.webp",
  triplex: "triple-xxx.webp",
  wreck: "wreck-patterson.webp",
  devil: "tarzanian-devil.webp",
  jager: "jager-nobeard.webp",
  sombra_negra: "sombra-negra.webp",
  // bannon, quaternius_male, quaternius_female → no portrait file yet (procedural fallback)
};

/** Action-variant portraits for featured/hero spots (more dynamic poses). */
const ACTION_MAP: Record<string, string> = {
  brutus: "brutus-action.webp",
  toro: "el-toro-de-oro-action.webp",
  aaron: "aaron-ruben-action.webp",
  kobra: "kobra-action.webp",
  wreck: "wreck-patterson-action.webp",
  tyneshia: "tyneshia-action.webp",
};

/** Curated hero rotation for the main-menu featured fighter strip. */
export const HERO_ROTATION = [
  "toro",
  "static",
  "cain",
  "tyneshia",
  "brutus",
  "sombra_negra",
  "hollow",
  "stickup",
];

/** Real portrait URL for a fighter, or null when none exists. */
export function portraitFor(fighterId: string): string | null {
  const file = PORTRAIT_MAP[fighterId];
  return file ? assetUrl(`portraits/${file}`) : null;
}

/** Action-variant portrait URL (falls back to the main portrait). */
export function actionPortraitFor(fighterId: string): string | null {
  const file = ACTION_MAP[fighterId] ?? PORTRAIT_MAP[fighterId];
  return file ? assetUrl(`portraits/${file}`) : null;
}
