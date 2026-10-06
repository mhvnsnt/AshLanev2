/**
 * AshLane Wrestling Move Database
 *
 * Every grapple/throw has TWO roles (deliverer + receiver) with synchronized
 * animations. Moves are tagged by category and position requirements so the
 * game knows WHEN and WHERE each move can be performed.
 *
 * Position contexts:
 * - "face_to_face" — standing, facing each other (default for most grapples)
 * - "behind" — attacker behind opponent (German suplex, sleeper, etc.)
 * - "running" — attacker running toward opponent (spears, crossbody)
 * - "corner" — opponent in/near corner (buckle bomb, corner splashes)
 * - "ropes" — near ropes (rope-assisted moves)
 * - "ground" — opponent down (ground-and-pound, submissions)
 * - "top_rope" — attacker on top rope (diving moves)
 * - "apron" — attacker on ring apron
 *
 * Move categories:
 * - "grapple" — throws, slams, suplexes (paired deliverer/receiver)
 * - "strike" — punches, kicks, elbows, knees
 * - "submission" — holds (single or paired)
 * - "dive" — from top rope / elevation
 * - "corner_move" — requires corner positioning
 * - "ground_move" — opponent must be down
 * - "tag_move" — requires partner
 * - "taunt" — no opponent needed
 * - "weapon" — uses held weapon
 */

export type PositionContext =
  | "face_to_face"
  | "behind"
  | "running"
  | "corner"
  | "ropes"
  | "ground"
  | "top_rope"
  | "apron";

export type MoveCategory =
  | "grapple"
  | "strike"
  | "submission"
  | "dive"
  | "corner_move"
  | "ground_move"
  | "tag_move"
  | "taunt"
  | "weapon";

export interface WrestlingMove {
  /** Unique ID matching the bank.json clip name */
  id: string;
  /** Display name */
  name: string;
  /** Move category */
  category: MoveCategory;
  /** Required starting position */
  position: PositionContext;
  /** Does this move have a paired receiver animation? */
  paired: boolean;
  /** Clip name for deliverer (in bank.json) */
  delivererClip: string;
  /** Clip name for receiver (in bank.json, usually "<id>:vic") */
  receiverClip: string | null;
  /** Damage (0-100 scale) */
  damage: number;
  /** Can this move be reversed? */
  reversible: boolean;
  /** Style affinity — which fighting styles favor this move */
  styles: string[];
  /** Description for UI */
  description: string;
}

export const WRESTLING_MOVES: Record<string, WrestlingMove> = {
  // ─── Suplex family ───
  wrestling_suplex: {
    id: "wrestling_suplex",
    name: "Suplex",
    category: "grapple",
    position: "face_to_face",
    paired: true,
    delivererClip: "wrestling_suplex",
    receiverClip: "wrestling_suplex:vic",
    damage: 35,
    reversible: true,
    styles: ["wrestle", "street"],
    description: "Classic vertical suplex — lift and bridge over.",
  },
  wrestling_german: {
    id: "wrestling_german",
    name: "German Suplex",
    category: "grapple",
    position: "behind",
    paired: true,
    delivererClip: "wrestling_german",
    receiverClip: "wrestling_german:vic",
    damage: 40,
    reversible: true,
    styles: ["wrestle", "martial"],
    description: "Release German suplex from behind — bridge for the pin.",
  },
  wrestling_brainbuster: {
    id: "wrestling_brainbuster",
    name: "Brainbuster",
    category: "grapple",
    position: "face_to_face",
    paired: true,
    delivererClip: "wrestling_brainbuster",
    receiverClip: "wrestling_brainbuster:vic",
    damage: 45,
    reversible: true,
    styles: ["wrestle"],
    description: "Vertical drop brainbuster — spike them head-first.",
  },

  // ─── DDT family ───
  wrestling_ddt: {
    id: "wrestling_ddt",
    name: "DDT",
    category: "grapple",
    position: "face_to_face",
    paired: true,
    delivererClip: "wrestling_ddt",
    receiverClip: "wrestling_ddt:vic",
    damage: 30,
    reversible: true,
    styles: ["wrestle", "street"],
    description: "Snap DDT — drive their head into the mat.",
  },

  // ─── Power moves ───
  wrestling_chokeslam: {
    id: "wrestling_chokeslam",
    name: "Chokeslam",
    category: "grapple",
    position: "face_to_face",
    paired: true,
    delivererClip: "wrestling_chokeslam",
    receiverClip: "wrestling_chokeslam:vic",
    damage: 50,
    reversible: false,
    styles: ["wrestle"],
    description: "Two-handed chokeslam — lift by the throat and drive down.",
  },
  wrestling_tombstone: {
    id: "wrestling_tombstone",
    name: "Tombstone Piledriver",
    category: "grapple",
    position: "face_to_face",
    paired: true,
    delivererClip: "wrestling_tombstone",
    receiverClip: "wrestling_tombstone:vic",
    damage: 65,
    reversible: false,
    styles: ["wrestle"],
    description: "Tombstone piledriver — the match ender.",
  },

  // ─── Neckbreaker family ───
  wrestling_neckbreaker: {
    id: "wrestling_neckbreaker",
    name: "Neckbreaker",
    category: "grapple",
    position: "face_to_face",
    paired: true,
    delivererClip: "wrestling_neckbreaker",
    receiverClip: "wrestling_neckbreaker:vic",
    damage: 32,
    reversible: true,
    styles: ["wrestle", "street"],
    description: "Swinging neckbreaker — snap their neck across your shoulder.",
  },
  wrestling_hurricanerana: {
    id: "wrestling_hurricanerana",
    name: "Hurricanrana",
    category: "grapple",
    position: "running",
    paired: true,
    delivererClip: "wrestling_hurricanerana",
    receiverClip: "wrestling_hurricanerana:vic",
    damage: 38,
    reversible: true,
    styles: ["wrestle", "martial"],
    description: "Frankensteiner — flip over them and drive their head down.",
  },
  wrestling_powerbomb: {
    id: "wrestling_powerbomb",
    name: "Powerbomb",
    category: "grapple",
    position: "face_to_face",
    paired: true,
    delivererClip: "wrestling_powerbomb",
    receiverClip: "wrestling_powerbomb:vic",
    damage: 55,
    reversible: false,
    styles: ["wrestle"],
    description: "Powerbomb — lift them high and drive them into the mat.",
  },
  wrestling_piledriver: {
    id: "wrestling_piledriver",
    name: "Piledriver",
    category: "grapple",
    position: "face_to_face",
    paired: true,
    delivererClip: "wrestling_piledriver",
    receiverClip: "wrestling_piledriver:vic",
    damage: 60,
    reversible: false,
    styles: ["wrestle"],
    description: "Snap piledriver — sit-out spike.",
  },
  suplex: {
    id: "suplex",
    name: "Suplex (Classic)",
    category: "grapple",
    position: "face_to_face",
    paired: true,
    delivererClip: "suplex",
    receiverClip: "suplex:vic",
    damage: 35,
    reversible: true,
    styles: ["wrestle", "street"],
    description: "Classic suplex from the original bank.",
  },
  german: {
    id: "german",
    name: "German Suplex (Classic)",
    category: "grapple",
    position: "behind",
    paired: true,
    delivererClip: "german",
    receiverClip: "german:vic",
    damage: 40,
    reversible: true,
    styles: ["wrestle"],
    description: "Classic German suplex from the original bank.",
  },
  ddt: {
    id: "ddt",
    name: "DDT (Classic)",
    category: "grapple",
    position: "face_to_face",
    paired: true,
    delivererClip: "ddt",
    receiverClip: "ddt:vic",
    damage: 30,
    reversible: true,
    styles: ["wrestle", "street"],
    description: "Classic DDT from the original bank.",
  },
  chokeslam: {
    id: "chokeslam",
    name: "Chokeslam (Classic)",
    category: "grapple",
    position: "face_to_face",
    paired: true,
    delivererClip: "chokeslam",
    receiverClip: "chokeslam:vic",
    damage: 50,
    reversible: false,
    styles: ["wrestle"],
    description: "Classic chokeslam from the original bank.",
  },
  takedown: {
    id: "takedown",
    name: "Double Leg Takedown",
    category: "grapple",
    position: "face_to_face",
    paired: true,
    delivererClip: "takedown",
    receiverClip: "takedown:vic",
    damage: 15,
    reversible: true,
    styles: ["wrestle", "martial", "street"],
    description: "Shoot for the legs and drive through.",
  },
  backdrop: {
    id: "backdrop",
    name: "Backdrop",
    category: "grapple",
    position: "face_to_face",
    paired: true,
    delivererClip: "backdrop",
    receiverClip: "backdrop:vic",
    damage: 25,
    reversible: true,
    styles: ["wrestle"],
    description: "Back body drop — launch them overhead.",
  },
};

/**
 * Get all moves available from a given position.
 */
export function movesForPosition(position: PositionContext): WrestlingMove[] {
  return Object.values(WRESTLING_MOVES).filter((m) => m.position === position);
}

/**
 * Get all moves in a category.
 */
export function movesForCategory(category: MoveCategory): WrestlingMove[] {
  return Object.values(WRESTLING_MOVES).filter((m) => m.category === category);
}

/**
 * Get moves a fighting style can use.
 */
export function movesForStyle(style: string): WrestlingMove[] {
  return Object.values(WRESTLING_MOVES).filter((m) => m.styles.includes(style));
}

/**
 * Check if a move can be performed from the current game context.
 */
export function canPerformMove(
  moveId: string,
  context: {
    position: PositionContext;
    hasPartner?: boolean;
    opponentDown?: boolean;
    hasWeapon?: boolean;
  }
): boolean {
  const move = WRESTLING_MOVES[moveId];
  if (!move) return false;
  if (move.position !== context.position) return false;
  if (move.category === "tag_move" && !context.hasPartner) return false;
  if (move.category === "ground_move" && !context.opponentDown) return false;
  if (move.category === "weapon" && !context.hasWeapon) return false;
  return true;
}
