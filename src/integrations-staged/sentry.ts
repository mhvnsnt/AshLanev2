/**
 * Sentry crash reporting — STAGED, DORMANT. Not imported anywhere in the app.
 *
 * Activation (owner or key-harvester only — workers NEVER create accounts):
 *   1. Create a free Sentry account (free tier: 5k errors/mo).
 *   2. `npm install @sentry/browser`  (deliberately NOT in package.json yet —
 *      keeps the dormant bundle at zero cost).
 *   3. Put the DSN in `.env` as VITE_SENTRY_DSN=.
 *   4. Call initSentry() once at app boot (see README.md).
 *
 * Until then this module is a documented no-op: it tries a dynamic import of
 * @sentry/browser only when a DSN is configured, so an uninstalled package
 * can never throw at boot.
 *
 * Money link: crash tracking — every unhandled exception in the PWA becomes
 * a ticket instead of a 1-star review. Ship quality = store ratings = revenue.
 */
let installed = false;

/** Call once at boot. No-ops unless VITE_SENTRY_DSN is set. */
export async function initSentry(opts?: { dsn?: string; env?: string }): Promise<boolean> {
  const dsn =
    opts?.dsn ||
    (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_SENTRY_DSN ||
    "";
  if (!dsn || installed) return false; // dormant
  try {
    const mod = await import("@sentry/browser");
    mod.init({
      dsn,
      environment: opts?.env || "production",
      // PWA: keep the sample rate modest on the free tier.
      tracesSampleRate: 0.1,
      // Scrub the one thing that must never leave the device.
      beforeSend(event) {
        if (event.request?.url) event.request.url = "[scrubbed]";
        return event;
      },
    });
    // Last-resort net: unhandled promise rejections from the game loop.
    window.addEventListener("unhandledrejection", (e) => {
      try {
        mod.captureException(e.reason ?? new Error("unhandledrejection"));
      } catch {
        /* never break the game */
      }
    });
    installed = true;
    return true;
  } catch {
    // @sentry/browser not installed (expected while dormant).
    return false;
  }
}

/** Manual breadcrumb/exception helpers — safe to call while dormant. */
export async function reportError(err: unknown, context: Record<string, unknown> = {}): Promise<void> {
  if (!installed) return;
  try {
    const mod = await import("@sentry/browser");
    mod.captureException(err, { extra: context });
  } catch {
    /* dormant */
  }
}
