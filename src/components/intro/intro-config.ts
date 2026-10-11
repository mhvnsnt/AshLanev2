/* Intro video wiring config.
 *
 * The intro video path is configurable: point INTRO_VIDEO_SRC at the real
 * 60-second roster intro when it lands. The placeholder is the El Toro
 * entrance cut (public/video/intro.mp4). The gate never depends on a
 * specific file existing — if the video is missing/unplayable the flow
 * falls through straight to the game.
 */

export interface IntroConfig {
  /** Video sources in preference order. First reachable+playable wins. */
  sources: string[];
  /** Milliseconds to wait for the availability probe before falling through. */
  probeTimeoutMs: number;
  /** Skip keys (KeyboardEvent.key values). */
  skipKeys: string[];
  /** Gamepad button index treated as "Start" for skipping. */
  gamepadSkipButton: number;
}

/** Resolve the app base ("/AshLanev2/" on GitHub Pages, "/" in dev). */
export function appBase(): string {
  try {
    const b =
      (import.meta as unknown as { env?: { BASE_URL?: string } }).env?.BASE_URL ??
      "/";
    return b.endsWith("/") ? b : `${b}/`;
  } catch {
    return "/";
  }
}

export const INTRO_CONFIG: IntroConfig = {
  sources: [
    // Real 60-second roster intro (drop it here when it lands).
    `${appBase()}video/intro.mp4`,
  ],
  probeTimeoutMs: 6000,
  skipKeys: ["Escape", "Enter", " "],
  gamepadSkipButton: 9,
};
