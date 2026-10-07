/**
 * ASHLANE menu art — rich photographic backdrops for every menu screen.
 *
 * Layered theme:
 *   UNDERLYING: Malakor/SWMG — dark, moody, neon purple/green urban atmosphere
 *   OVERLYING: Tekken/Urban Reign — bold, high-energy fighter UI
 *
 * Art lives in public/menu/ (webp). Paths use import.meta.env.BASE_URL so they
 * resolve on both dev and the /AshLanev2/ GitHub Pages base.
 *
 * Usage:
 *   <MenuArt screen="main" />        — full-bleed backdrop for a menu screen
 *   <FactionBanner faction="hollows" /> — banner strip for faction pickers
 */

const base = import.meta.env.BASE_URL || "/";

export type MenuScreen =
  | "main"
  | "story"
  | "arenas"
  | "style"
  | "library"
  | "jobs";

const SCREEN_ART: Record<MenuScreen, string> = {
  main: "menu/menu-hero.webp",
  story: "menu/menu-story.webp",
  arenas: "menu/menu-arenas.webp",
  style: "menu/menu-fighters.webp",
  library: "menu/menu-loading.webp",
  jobs: "menu/menu-story.webp",
};

export type FactionId =
  | "ashes"
  | "combine"
  | "hollows"
  | "unaffiliated"
  | "onyx_crew"
  | "authority";

const FACTION_ART: Record<FactionId, string> = {
  ashes: "menu/faction-ashes.webp",
  combine: "menu/faction-combine.webp",
  hollows: "menu/faction-hollows.webp",
  unaffiliated: "menu/faction-unaffiliated.webp",
  onyx_crew: "menu/faction-onyx-crew.webp",
  authority: "menu/faction-authority.webp",
};

export function menuArtUrl(file: string): string {
  return `${base}${file}`;
}

/** Full-bleed photographic backdrop for a menu screen. Renders behind content. */
export function MenuArt({ screen }: { screen: MenuScreen }) {
  const src = menuArtUrl(SCREEN_ART[screen]);
  return (
    <div className="al-menu-art" aria-hidden="true">
      <img src={src} alt="" className="al-menu-art-img" loading="eager" />
      <div className="al-menu-art-veil" />
    </div>
  );
}

/** Wide banner strip for a faction — used behind emblem pickers / faction rows. */
export function FactionBanner({ faction }: { faction: string }) {
  const src = menuArtUrl(
    (FACTION_ART as Record<string, string>)[faction] ?? FACTION_ART.unaffiliated
  );
  return (
    <div className="al-faction-banner" aria-hidden="true">
      <img src={src} alt="" className="al-faction-banner-img" loading="lazy" />
      <div className="al-faction-banner-veil" />
    </div>
  );
}

/** VS splash shown behind the fight-intro banner. Click/Escape skips it. */
export function VsSplash({ onSkip }: { onSkip?: () => void }) {
  return (
    <div
      className={"al-vs-splash" + (onSkip ? " al-vs-splash-skip" : "")}
      aria-hidden={onSkip ? undefined : "true"}
      onClick={onSkip}
      role={onSkip ? "button" : undefined}
      aria-label={onSkip ? "Skip intro" : undefined}
    >
      <img src={menuArtUrl("menu/menu-vs.webp")} alt="" className="al-vs-splash-img" />
      <img
        src={menuArtUrl("ui/vs-medallion.webp")}
        alt=""
        aria-hidden="true"
        className="al-vs-splash-medallion"
      />
      <div className="al-vs-splash-veil" />
    </div>
  );
}

/** Full-screen loading art. */
export function LoadingArt() {
  return (
    <div className="al-loading-art" aria-hidden="true">
      <img src={menuArtUrl("menu/menu-loading.webp")} alt="" className="al-loading-art-img" />
      <div className="al-loading-art-veil" />
    </div>
  );
}
