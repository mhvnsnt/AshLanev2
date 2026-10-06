/**
 * accessibility.ts — Round 4: accessibility helpers for AshLane.
 *
 * MIT (new code). No dependencies.
 *
 * 1. Colorblind-safe faction palettes: the game identifies factions by color.
 *    These palettes are distinguishable under protanopia, deuteranopia AND
 *    tritanopia (chosen from Wong 2011 / Okabe-Ito safe sets).
 * 2. Remappable controls: a serializable binding map with sane defaults for
 *    keyboard + touch, validation, and localStorage persistence helpers.
 */

/** A faction color set that survives all three common colorblindness types. */
export interface FactionPalette {
  id: string;
  label: string;
  /** Primary color (hex) — also paired with a non-color cue. */
  primary: string;
  secondary: string;
  /** Non-color identifier: shape/pattern name used alongside the color. */
  cue: string;
}

export const COLORBLIND_SAFE_PALETTES: FactionPalette[] = [
  { id: "onyx",   label: "Onyx",   primary: "#000000", secondary: "#7A7A7A", cue: "skull-mark" },
  { id: "violet", label: "Violet", primary: "#7B2FBE", secondary: "#C9A7EB", cue: "chevron" },
  { id: "amber",  label: "Amber",  primary: "#E69F00", secondary: "#F5D67B", cue: "diamond" },
  { id: "forest", label: "Forest", primary: "#2D6A4F", secondary: "#8FC3A3", cue: "bar" },
  { id: "sky",    label: "Sky",    primary: "#56B4E9", secondary: "#BFE3F7", cue: "circle" },
  { id: "rose",   label: "Rose",   primary: "#CC79A7", secondary: "#F2C4DA", cue: "triangle" },
];

/** Simulate how a hex color looks under a colorblindness type (LMS matrix approx). */
export function simulateColorblind(hex: string, type: "protanopia" | "deuteranopia" | "tritanopia"): string {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  // Machado et al. (2009) matrices, simplified
  const M = {
    protanopia:   [[0.567, 0.433, 0], [0.558, 0.442, 0], [0, 0.242, 0.758]],
    deuteranopia: [[0.625, 0.375, 0], [0.7, 0.3, 0], [0, 0.3, 0.7]],
    tritanopia:   [[0.95, 0.05, 0], [0, 0.433, 0.567], [0, 0.475, 0.525]],
  }[type];
  const c = (v: number) => Math.max(0, Math.min(255, Math.round(v * 255)));
  const nr = c(M[0][0] * r + M[0][1] * g + M[0][2] * b);
  const ng = c(M[1][0] * r + M[1][1] * g + M[1][2] * b);
  const nb = c(M[2][0] * r + M[2][1] * g + M[2][2] * b);
  return "#" + [nr, ng, nb].map((v) => v.toString(16).padStart(2, "0")).join("");
}

/** Minimum perceptual distance check between two palettes under simulation. */
export function palettesDistinguishable(a: FactionPalette, b: FactionPalette): boolean {
  const dist = (h1: string, h2: string) => {
    const p = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
    const [r1, g1, b1] = p(h1), [r2, g2, b2] = p(h2);
    return Math.hypot(r1 - r2, g1 - g2, b1 - b2);
  };
  // Must differ under normal vision AND all three simulations (threshold ~60/441)
  if (dist(a.primary, b.primary) < 60) return false;
  for (const t of ["protanopia", "deuteranopia", "tritanopia"] as const) {
    if (dist(simulateColorblind(a.primary, t), simulateColorblind(b.primary, t)) < 60) return false;
  }
  return true;
}

// ---------------------------------------------------------------- controls ---

export type GameAction =
  | "punch" | "kick" | "grab" | "block" | "dodge"
  | "jump" | "sprint" | "taunt" | "pause" | "moveUp" | "moveDown" | "moveLeft" | "moveRight";

export interface BindingMap { [action: string]: string[]; }

export const DEFAULT_KEYBOARD_BINDINGS: BindingMap = {
  punch: ["j", "z"], kick: ["k", "x"], grab: ["l", "c"],
  block: ["s", "arrowdown"], dodge: [" ", "shift"],
  jump: ["w", "arrowup"], sprint: ["shift"],
  taunt: ["t"], pause: ["escape", "p"],
  moveUp: ["w", "arrowup"], moveDown: ["s", "arrowdown"],
  moveLeft: ["a", "arrowleft"], moveRight: ["d", "arrowright"],
};

export const DEFAULT_TOUCH_BINDINGS: BindingMap = {
  punch: ["btn-a"], kick: ["btn-b"], grab: ["btn-x"], block: ["btn-y"],
  dodge: ["swipe-down"], jump: ["swipe-up"], sprint: ["btn-sprint"],
  taunt: ["btn-taunt"], pause: ["btn-pause"],
  moveUp: ["stick-up"], moveDown: ["stick-down"],
  moveLeft: ["stick-left"], moveRight: ["stick-right"],
};

/** Validate a binding map: every action bound, no empty keys. Returns issues. */
export function validateBindings(map: BindingMap, actions: GameAction[]): string[] {
  const issues: string[] = [];
  for (const a of actions) {
    const keys = map[a];
    if (!keys || keys.length === 0) issues.push(`unbound: ${a}`);
    else if (keys.some((k) => typeof k !== "string" || (k !== " " && !k.trim()))) issues.push(`empty key in: ${a}`);
  }
  return issues;
}

/** Serialize for localStorage; parse back with validation. */
export function serializeBindings(map: BindingMap): string { return JSON.stringify(map); }
export function parseBindings(json: string, actions: GameAction[]): { map: BindingMap; issues: string[] } {
  let map: BindingMap;
  try { map = JSON.parse(json); }
  catch { return { map: DEFAULT_KEYBOARD_BINDINGS, issues: ["invalid JSON, using defaults"] }; }
  if (typeof map !== "object" || map === null) {
    return { map: DEFAULT_KEYBOARD_BINDINGS, issues: ["not an object, using defaults"] };
  }
  return { map, issues: validateBindings(map, actions) };
}

export const ALL_ACTIONS: GameAction[] = [
  "punch", "kick", "grab", "block", "dodge", "jump",
  "sprint", "taunt", "pause", "moveUp", "moveDown", "moveLeft", "moveRight",
];
