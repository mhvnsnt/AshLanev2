/* Pure intro-flow state machine — no DOM, fully unit-testable.
 *
 * States:
 *   tap      — tap-to-start gate (also unlocks mobile audio on the tap).
 *   checking — probing whether the intro video exists/is reachable.
 *   video    — intro video playing.
 *   app      — hand off to the game. Terminal.
 *
 * Every path ends at `app`. A missing/unplayable video can never trap
 * the player on a black screen.
 */

export type IntroState = "tap" | "checking" | "video" | "app";

export type IntroEvent =
  | { type: "TAP" }
  | { type: "VIDEO_FOUND" }
  | { type: "VIDEO_MISSING" }
  | { type: "VIDEO_ENDED" }
  | { type: "SKIP" }
  | { type: "VIDEO_ERROR" };

export function introNext(state: IntroState, event: IntroEvent): IntroState {
  switch (state) {
    case "tap":
      return event.type === "TAP" ? "checking" : state;
    case "checking":
      if (event.type === "VIDEO_FOUND") return "video";
      if (event.type === "VIDEO_MISSING") return "app";
      return state;
    case "video":
      if (
        event.type === "VIDEO_ENDED" ||
        event.type === "SKIP" ||
        event.type === "VIDEO_ERROR"
      )
        return "app";
      return state;
    case "app":
      return state; // terminal — nothing leaves the game
  }
}

/** True once the game should be mounted. */
export function introDone(state: IntroState): boolean {
  return state === "app";
}
