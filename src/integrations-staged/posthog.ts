/**
 * PostHog analytics — STAGED, DORMANT. Not imported anywhere in the app.
 *
 * Activation (owner or key-harvester only — workers NEVER create accounts):
 *   1. Create a free PostHog Cloud account (1M events/mo free).
 *   2. Put the project API key in `.env` as VITE_POSTHOG_KEY=
 *      (and optionally VITE_POSTHOG_HOST=, defaults to https://us.i.posthog.com).
 *   3. Call initPostHog() once at app boot (see README.md).
 *
 * Until then every function below is a documented no-op: zero network calls,
 * zero bundle cost (no posthog-js dependency), events are dropped silently.
 *
 * Money link: retention analytics — see which fighters/modes keep players,
 * which screens they bounce from. You can't improve what you don't measure.
 */

interface PostHogState {
  ready: boolean;
  apiKey: string;
  host: string;
  distinctId: string;
}

const state: PostHogState = {
  ready: false,
  apiKey: "",
  host: "https://us.i.posthog.com",
  distinctId: "",
};

function getDistinctId(): string {
  try {
    let id = localStorage.getItem("ashlane_distinct_id");
    if (!id) {
      id = "anon_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
      localStorage.setItem("ashlane_distinct_id", id);
    }
    return id;
  } catch {
    return "anon_" + Math.random().toString(36).slice(2);
  }
}

/** Call once at boot. No-ops unless VITE_POSTHOG_KEY is set. */
export function initPostHog(opts?: { apiKey?: string; host?: string }): boolean {
  const key =
    opts?.apiKey ||
    (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_POSTHOG_KEY ||
    "";
  if (!key) return false; // dormant
  state.apiKey = key;
  state.host = opts?.host ||
    (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_POSTHOG_HOST ||
    "https://us.i.posthog.com";
  state.distinctId = getDistinctId();
  state.ready = true;
  // Dormant-mode safety: never send in dev unless explicitly allowed.
  capture("$app_boot", { build: "pwa" });
  return true;
}

/** Track an event. Dropped silently while dormant. */
export function capture(event: string, properties: Record<string, unknown> = {}): void {
  if (!state.ready) return;
  const payload = {
    api_key: state.apiKey,
    event,
    distinct_id: state.distinctId,
    properties: { ...properties, $lib: "ashlane-staged", ts: Date.now() },
  };
  try {
    const body = JSON.stringify(payload);
    if (navigator.sendBeacon) {
      navigator.sendBeacon(`${state.host}/capture/`, body);
    } else {
      void fetch(`${state.host}/capture/`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body,
        keepalive: true,
      });
    }
  } catch {
    /* analytics must never break the game */
  }
}

/** Suggested AshLane events (wire these at the call sites when activated):
 *  capture("bout_start", { mode, fighter, arena })
 *  capture("bout_end", { mode, winner, rounds, duration_s })
 *  capture("ko", { mode, fighter, move })
 *  capture("roam_enter", { stage })
 *  capture("fighter_select", { fighter })
 */
export const AshlaneEvents = {
  boutStart: "bout_start",
  boutEnd: "bout_end",
  ko: "ko",
  roamEnter: "roam_enter",
  fighterSelect: "fighter_select",
} as const;
