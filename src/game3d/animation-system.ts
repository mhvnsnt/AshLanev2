/**
 * AshLane Animation System — real-clip state machine.
 *
 * Every combat state plays a REAL animation clip. No procedural faking
 * for core combat. Clips come from bank.json (59 clips: 50 original +
 * 9 converted from Drive FBX mocap), CMU Mocap additions, and the UAL
 * library, all baked onto the fighter's rig by motion-bank.ts.
 *
 * Paired grapples synchronize attacker + victim on the same timeline
 * using the bank's vic tracks (baked as "<clip>:vic" by motion-bank).
 */
import * as THREE from "three";
import { motionDur } from "./motion-bank";

// ---------------------------------------------------------------------------
// Clip catalog — every state maps to a real clip name in the bank.
// Fallbacks chain to the closest available clip so nothing ever T-poses.
// ---------------------------------------------------------------------------

type ClipRef = string | string[]; // string[] = try in order, first with dur > 0 wins

const CLIPS: Record<string, ClipRef> = {
  // Locomotion
  idle: ["boxidle", "boxing", "au"],
  walk: ["walk", "drunkwalk", "boxidle"],
  run: ["run", "walk", "boxidle"],
  strafe_left: ["walk", "boxidle"],
  strafe_right: ["walk", "boxidle"],
  backpedal: ["walk", "drunkwalk", "boxidle"],
  dash: ["evade", "corkscrew", "run"],
  jump: ["bigjump", "crossjump"],
  land: ["crouch", "boxidle"],
  fall: ["crouch", "boxidle"],
  climb: ["climb", "walk", "boxidle"],

  // Hurt / dazed locomotion (Drive FBX: injured mocap)
  hurt_idle: ["hurt_idle", "drunkidle", "boxidle"],
  hurt_walk: ["hurt_run", "drunkwalk", "walk"],

  // Strikes — punches
  jab: ["jabcross", "boxing", "combo"],
  cross: ["boxing", "jabcross", "combo"],
  hook: ["boxing1", "boxing", "combo"],
  uppercut: ["boxing2", "boxing", "combo"],
  overhand: ["boxing3", "boxing", "combo"],
  body_blow: ["bodyblow", "boxing", "combo"],
  slugger: ["slugger", "boxing"],

  // Strikes — elbows / knees
  elbow: ["elbow", "boxing"],
  knee: ["knee", "boxing"],

  // Strikes — kicks
  front_kick: ["front_kick", "kick_punch_knee", "dropkick"],
  roundhouse: ["karate_mawashi", "hurricane", "front_kick"],
  side_kick: ["karate_maegeri", "front_kick"],
  low_kick: ["front_kick_left", "front_kick"],
  dropkick: ["dropkick", "front_kick"],
  hurricane_kick: ["hurricane", "front_kick"],

  // Strikes — capoeira / style
  capoeira: ["capoeira", "ginga"],
  ginga: ["ginga", "gingaback", "gingaside"],

  // Defense
  block_high: ["guardhigh", "block", "defender"],
  block_low: ["guardlow", "block", "defender"],
  dodge: ["esquiva", "evade", "corkscrew"],
  parry: ["defender", "block"],

  // Hit reactions
  hit_head: ["hithead", "hit", "rib"],
  hit_body: ["hitbody", "hit", "rib"],
  hit_side: ["hitside", "hit"],
  hit_back: ["hitback", "hit"],
  hit_low: ["hitbody", "hit"],
  stagger: ["hit", "rib"],

  // Knockdowns & recovery
  knockdown: ["fallflat", "flat", "backdrop"],
  knockdown_back: ["fallflat", "flat"],
  knockdown_fwd: ["flat", "fallflat"],
  getup: ["kip", "rise", "corkscrew"],
  getup_kip: ["kip", "rise"],
  getup_cover: ["getup_cover", "kip", "rise"],
  dazed: ["drunkidle", "boxidle"],

  // Knockouts (Drive FBX: death mocap)
  ko_headshot: ["ko_headshot", "fallflat", "flat"],
  ko_defeat: ["ko_defeat", "fallflat", "flat"],

  // Grapples — PAIRED (attacker + victim play synchronized via vic tracks)
  clinch: ["takedown", "combo"],
  takedown: ["takedown", "combo"],       // double-leg, has vic track
  suplex: ["suplex", "backdrop"],        // has vic track
  german_suplex: ["german", "suplex"],   // has vic track
  ddt: ["ddt", "suplex"],               // has vic track
  brainbuster: ["brainbuster", "suplex"],
  chokeslam: ["chokeslam", "suplex"],    // has vic track
  backdrop: ["backdrop", "suplex"],      // has vic track
  feral_maul: ["feral", "takedown"],     // has vic track

  // Ground
  ground_mount: ["takedown", "combo"],
  ground_strikes: ["combo", "boxing"],
  ground_transition: ["evade", "corkscrew"],

  // Finishers (per fighting style)
  finisher_haymaker: ["slugger", "boxing"],
  finisher_clinch: ["takedown", "combo"],
  finisher_wall: ["suplex", "backdrop"],
  finisher_limb: ["combo", "boxing"],
  finisher_assassination: ["finisher_assassination", "slugger", "boxing"],

  // Weapons (Drive FBX: real weapon mocap)
  weapon_swing: ["weapon_swing", "weapon_swing2", "combo"],
  weapon_swing_alt: ["weapon_swing2", "weapon_swing", "combo"],
  weapon_pickup: ["crouch", "boxidle"],
  weapon_throw: ["boxing", "combo"],

  // Environmental
  wall_splat: ["hitback", "hit"],
  ring_out: ["fallflat", "flat"],

  // Crowd
  crowd_cheer: ["au", "boxidle"],
  crowd_jeer: ["feral", "boxidle"],
  crowd_shove: ["hit", "hitback"],
};

const PAIRED_GRAPPLES = new Set([
  "clinch", "takedown", "suplex", "german_suplex",
  "ddt", "brainbuster", "chokeslam", "backdrop", "feral_maul",
]);

// States that lock the fighter until the animation completes
// (committed attacks, grapples, knockdowns — can't be interrupted)
const LOCKED_STATES = new Set([
  "jab", "cross", "hook", "uppercut", "overhand", "body_blow", "slugger",
  "elbow", "knee", "front_kick", "roundhouse", "side_kick", "low_kick",
  "dropkick", "hurricane_kick", "capoeira",
  "takedown", "suplex", "german_suplex", "ddt", "brainbuster",
  "chokeslam", "backdrop", "feral_maul", "clinch",
  "knockdown", "knockdown_back", "knockdown_fwd",
  "ko_headshot", "ko_defeat",
  "getup", "getup_kip", "getup_cover",
  "finisher_haymaker", "finisher_clinch", "finisher_wall",
  "finisher_limb", "finisher_assassination",
  "weapon_swing", "weapon_swing_alt", "weapon_throw",
]);

// ---------------------------------------------------------------------------
// Rig-pipeline Slot → AnimState mapping
// Bridges the sim's slot system to this animation state machine.
// ---------------------------------------------------------------------------

export function slotToState(
  slot: string,
  opts: { armed?: boolean; swing?: number; hurt?: boolean } = {}
): string {
  // Hurt variants
  if (opts.hurt) {
    if (slot === "idle") return "hurt_idle";
    if (slot === "walk" || slot === "run" || slot === "back") return "hurt_walk";
  }
  switch (slot) {
    // Locomotion
    case "idle": return "idle";
    case "walk": return "walk";
    case "run": return "run";
    case "strafeL": return "strafe_left";
    case "strafeR": return "strafe_right";
    case "back": return "backpedal";
    case "jump": return "jump";
    case "fall": return "fall";
    case "dodge": return "dodge";
    case "spin": return "hurricane_kick";
    case "climb": return "climb";

    // Attacks — map swing number to specific strikes
    case "jab": return opts.armed ? "weapon_swing" : "jab";
    case "cross": return opts.armed ? "weapon_swing" : "cross";
    case "hook": return "hook";
    case "lunge": return opts.armed ? "weapon_swing_alt" : "cross";
    case "sweep": return "low_kick";
    case "launch": return "uppercut";

    // Armed variants
    case "armedJab":
    case "armedCross":
    case "armedLunge": return "weapon_swing";
    case "armedSweep": return "weapon_swing_alt";
    case "armedLaunch": return "weapon_swing";

    // Defense / reactions
    case "hit": return "hit_body";
    case "down": return "knockdown";
    case "death": return "ko_defeat";
    case "grab": return "clinch";
    case "pickup": return "weapon_pickup";
    case "throw": return "weapon_throw";

    default: return "idle";
  }
}

/** Should this state lock the fighter until the animation completes? */
export function stateIsLocked(state: string): boolean {
  return LOCKED_STATES.has(state);
}

// ---------------------------------------------------------------------------
// Animation state machine
// ---------------------------------------------------------------------------

export type AnimState = keyof typeof CLIPS;

export interface FighterAnim {
  mixer: THREE.AnimationMixer;
  actions: Record<string, THREE.AnimationAction>;
  current: string;       // current clip name
  currentState: string;  // current logical state
  blendTime: number;
  lockUntil: number;     // timestamp — no interrupt until this time (for committed attacks)
  pairedWith: FighterAnim | null;
  pairRole: "atk" | "vic" | null;
}

export function createFighterAnim(
  mixer: THREE.AnimationMixer,
  actions: Record<string, THREE.AnimationAction>
): FighterAnim {
  return {
    mixer, actions,
    current: "", currentState: "idle",
    blendTime: 0.15, lockUntil: 0,
    pairedWith: null, pairRole: null,
  };
}

/** Resolve a state to the best available clip name. */
export function resolveClip(state: string): string {
  const ref = CLIPS[state];
  if (!ref) return "";
  const candidates = Array.isArray(ref) ? ref : [ref];
  for (const name of candidates) {
    try {
      if (motionDur(name) > 0) return name;
    } catch { /* motion bank not loaded yet */ }
  }
  return candidates[0] || "";
}

/**
 * Play a state on a fighter. Crossfades from current clip.
 * If `lock` is true (or the state is in LOCKED_STATES), the animation
 * cannot be interrupted until it finishes (committed attacks, grapples,
 * knockdowns).
 */
export function playState(
  fa: FighterAnim,
  state: string,
  opts: { lock?: boolean; blendTime?: number; timeScale?: number } = {}
): boolean {
  const now = performance.now() / 1000;
  if (now < fa.lockUntil) return false; // committed — no interrupt

  const clipName = resolveClip(state);
  if (!clipName) return false;
  const action = fa.actions[clipName];
  if (!action) return false;

  const blend = opts.blendTime ?? fa.blendTime;
  // Fade out current
  if (fa.current && fa.current !== clipName) {
    const prev = fa.actions[fa.current];
    if (prev && prev.isRunning()) prev.fadeOut(blend);
  }
  // Play new
  action.reset();
  action.setEffectiveTimeScale(opts.timeScale ?? 1);
  action.fadeIn(blend);
  action.play();

  fa.current = clipName;
  fa.currentState = state;
  const shouldLock = opts.lock ?? stateIsLocked(state);
  if (shouldLock) {
    let dur = 0;
    try { dur = motionDur(clipName); } catch { dur = action.getClip().duration; }
    fa.lockUntil = now + dur / (opts.timeScale ?? 1);
  }
  return true;
}

/** Interrupt any lock (for hit reactions — getting hit breaks your attack). */
export function forceState(fa: FighterAnim, state: string, opts?: { blendTime?: number }): boolean {
  fa.lockUntil = 0;
  return playState(fa, state, opts);
}

// ---------------------------------------------------------------------------
// Paired grapples — both fighters on the same timeline
// ---------------------------------------------------------------------------

/**
 * Start a paired grapple. The attacker's bank clip contains both
 * atk and vic tracks; the victim plays the vic role.
 * motion-bank bakes vic tracks as "<clip>:vic" actions.
 * Both fighters lock until the grapple completes.
 */
export function playPairedGrapple(
  attacker: FighterAnim,
  victim: FighterAnim,
  grappleState: string
): boolean {
  const clipName = resolveClip(grappleState);
  if (!clipName) return false;

  const atkAction = attacker.actions[clipName];
  // Victim uses the same clip but the bank's vic track.
  // motion-bank bakes vic tracks as "<clip>:vic" actions.
  const vicClipName = `${clipName}:vic`;
  const vicAction = victim.actions[vicClipName] || victim.actions[clipName];
  if (!atkAction || !vicAction) return false;

  const now = performance.now() / 1000;
  let dur = 0;
  try { dur = motionDur(clipName); } catch { dur = atkAction.getClip().duration; }

  // Stop current actions
  for (const fa of [attacker, victim]) {
    if (fa.current && fa.actions[fa.current]?.isRunning()) {
      fa.actions[fa.current].fadeOut(0.1);
    }
    fa.lockUntil = 0;
  }

  atkAction.reset(); atkAction.fadeIn(0.1); atkAction.play();
  vicAction.reset(); vicAction.fadeIn(0.1); vicAction.play();

  attacker.current = clipName;
  attacker.currentState = grappleState;
  attacker.lockUntil = now + dur;
  attacker.pairedWith = victim;
  attacker.pairRole = "atk";

  victim.current = vicAction === victim.actions[vicClipName] ? vicClipName : clipName;
  victim.currentState = `${grappleState}_victim`;
  victim.lockUntil = now + dur;
  victim.pairedWith = attacker;
  victim.pairRole = "vic";

  return true;
}

/** Break a paired grapple early (e.g. reversal). */
export function breakPairedGrapple(fa: FighterAnim): void {
  const other = fa.pairedWith;
  fa.pairedWith = null; fa.pairRole = null; fa.lockUntil = 0;
  if (other) { other.pairedWith = null; other.pairRole = null; other.lockUntil = 0; }
}

export function isPairedGrapple(state: string): boolean {
  return PAIRED_GRAPPLES.has(state);
}

// ---------------------------------------------------------------------------
// Combat helpers — map game events to animation states
// ---------------------------------------------------------------------------

/** Map a sim attack to the right animation by style + attack type. */
export function attackAnimFor(
  style: "street" | "kickbox" | "martial" | "wrestle" | "submit",
  kind: "jab" | "cross" | "hook" | "uppercut" | "elbow" | "knee" | "kick" | "special"
): string {
  const table: Record<string, Record<string, string>> = {
    street:   { jab: "jab", cross: "cross", hook: "hook", uppercut: "uppercut", elbow: "elbow", knee: "knee", kick: "low_kick", special: "slugger" },
    kickbox:  { jab: "jab", cross: "cross", hook: "hook", uppercut: "uppercut", elbow: "elbow", knee: "knee", kick: "roundhouse", special: "hurricane_kick" },
    martial:  { jab: "jab", cross: "cross", hook: "hook", uppercut: "uppercut", elbow: "elbow", knee: "knee", kick: "side_kick", special: "capoeira" },
    wrestle:  { jab: "jab", cross: "cross", hook: "hook", uppercut: "uppercut", elbow: "elbow", knee: "knee", kick: "front_kick", special: "takedown" },
    submit:   { jab: "jab", cross: "cross", hook: "hook", uppercut: "uppercut", elbow: "elbow", knee: "knee", kick: "low_kick", special: "clinch" },
  };
  return table[style]?.[kind] ?? "jab";
}

/** Map a hit location to the right reaction. */
export function hitAnimFor(location: "head" | "body" | "side" | "back" | "low"): string {
  return { head: "hit_head", body: "hit_body", side: "hit_side", back: "hit_back", low: "hit_low" }[location];
}

/** Update all fighter mixers — call every frame with delta time. */
export function updateAnimations(fighters: FighterAnim[], dt: number): void {
  for (const fa of fighters) {
    fa.mixer.update(dt);
  }
}
