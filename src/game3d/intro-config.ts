/**
 * Intro sequence configuration.
 *
 * Swap `videoSrc` to change the intro video — any path served by the PWA
 * (relative to the app base) or an absolute URL. Set `enabled` to false to
 * skip the intro entirely and boot straight to the start screen.
 *
 * If the video file is missing or fails to load, the intro falls through to
 * the start screen automatically (never a black screen).
 */

const BASE = import.meta.env.BASE_URL || "/";

export const INTRO_CONFIG = {
  /** Fullscreen intro video played after tap-to-start. */
  videoSrc: `${BASE}intro/el-toro-de-oro.mp4`,
  /** Master switch — false boots straight to the start screen. */
  enabled: true,
  /** Skip affordances during the video. */
  skip: {
    showButton: true,
    buttonLabel: "SKIP",
    keys: ["Escape", "Enter"] as string[],
    /** Standard gamepad "Start" button index. */
    gamepadStartButton: 9,
  },
  /**
   * Watchdog: if the video hasn't reached a playable state within this many
   * ms (slow network, missing file with no error event), fall through to the
   * start screen instead of holding on black.
   */
  loadTimeoutMs: 6000,
} as const;
