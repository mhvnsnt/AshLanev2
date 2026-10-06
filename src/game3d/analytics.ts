/**
 * analytics.ts — privacy-friendly game event analytics for AshLane.
 *
 * Provider: Umami (MIT license, self-hostable, https://umami.is).
 * Ships with a safe wrapper: analytics NEVER breaks the game — if the
 * Umami script is blocked (ad-blocker) or the site isn't configured,
 * every call is a no-op.
 *
 * Setup (owner / ops):
 *   1. Self-host Umami (2 containers: app + postgres) on any VPS.
 *   2. Serve its tracker script from a first-party subdomain, e.g.
 *      https://stats.ashlane.gg/script.js (dodges ad-blockers).
 *   3. Add a website in Umami, grab the website ID.
 *   4. Set VITE_UMAMI_URL and VITE_UMAMI_WEBSITE_ID at build time.
 *   5. Load the tracker in __root.tsx / index.html:
 *      <script defer src={import.meta.env.VITE_UMAMI_URL}
 *              data-website-id={import.meta.env.VITE_UMAMI_WEBSITE_ID} />
 *
 * Events tracked (keep this list current — it doubles as the data dictionary):
 *   fight_started    { character, opponent, arena, game_mode }
 *   character_picked { character, game_mode }
 *   stage_picked     { stage }
 *   fight_finished   { winner, loser, duration_seconds, game_mode }
 *   ko               { attacker, defender, move }
 *   round_started    { round, fight_id }
 *   menu_opened      { menu }
 *   settings_changed { setting, value }
 *   promo_watched    { character, video }
 */

type AnalyticsData = Record<string, string | number | boolean>;

declare global {
  interface Window {
    umami?: { track(name: string, data?: AnalyticsData): void };
  }
}

/** Queue of events fired before the tracker script loads — flushed on init. */
const pending: Array<{ name: string; data?: AnalyticsData }> = [];
let initialized = false;

/**
 * Safe event tracker. Never throws, never blocks gameplay.
 * If Umami isn't loaded yet, events queue until initAnalytics() runs.
 */
export function trackEvent(name: string, data?: AnalyticsData): void {
  try {
    if (window.umami?.track) {
      window.umami.track(name, data);
    } else if (!initialized) {
      pending.push({ name, data });
      // Don't grow the queue forever on a tracker-blocked client.
      if (pending.length > 100) pending.shift();
    }
  } catch {
    /* analytics must never break the game */
  }
}

/**
 * Call once at app boot (after the tracker script tag has had a chance to
 * load). Flushes any events queued before load.
 */
export function initAnalytics(): void {
  initialized = true;
  try {
    if (window.umami?.track) {
      for (const e of pending) window.umami.track(e.name, e.data);
    }
  } catch {
    /* noop */
  }
  pending.length = 0;
}

/** Convenience helpers with typed payloads. */

export function trackFightStarted(
  character: string,
  opponent: string,
  arena: string,
  gameMode: string,
): void {
  trackEvent("fight_started", {
    character,
    opponent,
    arena,
    game_mode: gameMode,
  });
}

export function trackCharacterPicked(character: string, gameMode: string): void {
  trackEvent("character_picked", { character, game_mode: gameMode });
}

export function trackFightFinished(
  winner: string,
  loser: string,
  durationSeconds: number,
  gameMode: string,
): void {
  trackEvent("fight_finished", {
    winner,
    loser,
    duration_seconds: Math.round(durationSeconds),
    game_mode: gameMode,
  });
}

export function trackKO(attacker: string, defender: string, move: string): void {
  trackEvent("ko", { attacker, defender, move });
}
