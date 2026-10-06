/**
 * AshLane Position-Aware Grapple System
 *
 * Handles the full context for wrestling moves:
 * 1. Position detection — where are the fighters relative to each other?
 * 2. Position validation — can this move be done from here?
 * 3. Pre-move positioning — move fighters to correct spots before the animation
 * 4. Paired playback — synchronized deliverer + receiver
 *
 * The owner wants to SEE a suplex look like a suplex:
 * both guys moving together, correct positions, no clipping, no faking.
 */
import * as THREE from "three";
import {
  type WrestlingMove,
  type PositionContext,
  WRESTLING_MOVES,
  canPerformMove,
} from "./wrestling-moves";
import {
  type FighterAnim,
  playPairedGrapple,
  resolveClip,
} from "./animation-system";
import { motionDur } from "./motion-bank";

// ---------------------------------------------------------------------------
// Position detection
// ---------------------------------------------------------------------------

export interface FighterPosition {
  position: THREE.Vector3;
  facing: number; // yaw in radians
}

export interface PositionAnalysis {
  context: PositionContext;
  distance: number;
  /** Angle between attacker's facing and direction to victim (0 = facing them) */
  facingAngle: number;
  /** Is attacker behind victim? (> 90° = behind) */
  isBehind: boolean;
  /** Detailed info for debugging */
  detail: string;
}

/**
 * Analyze the positional relationship between attacker and victim.
 */
export function analyzePosition(
  attacker: FighterPosition,
  victim: FighterPosition,
  context?: {
    victimDown?: boolean;
    nearCorner?: boolean;
    nearRopes?: boolean;
    attackerRunning?: boolean;
    attackerElevated?: boolean; // top rope / apron
  }
): PositionAnalysis {
  const dx = victim.position.x - attacker.position.x;
  const dz = victim.position.z - attacker.position.z;
  const distance = Math.hypot(dx, dz);

  // Direction from attacker to victim
  const dirToVictim = Math.atan2(dx, dz);

  // Angle between attacker's facing and direction to victim
  let facingAngle = Math.abs(dirToVictim - attacker.facing);
  if (facingAngle > Math.PI) facingAngle = 2 * Math.PI - facingAngle;

  // Is attacker behind victim? Check victim's facing vs direction to attacker
  const dirToAttacker = Math.atan2(-dx, -dz);
  let victimFacingAngle = Math.abs(dirToAttacker - victim.facing);
  if (victimFacingAngle > Math.PI) victimFacingAngle = 2 * Math.PI - victimFacingAngle;
  const isBehind = victimFacingAngle > Math.PI * 0.6; // > 108° = behind

  // Determine context (priority order)
  let context_: PositionContext = "face_to_face";
  let detail = "face-to-face";

  if (context?.victimDown) {
    context_ = "ground";
    detail = "opponent down";
  } else if (context?.attackerElevated) {
    context_ = "top_rope";
    detail = "attacker elevated";
  } else if (context?.nearCorner) {
    context_ = "corner";
    detail = "near corner";
  } else if (context?.nearRopes) {
    context_ = "ropes";
    detail = "near ropes";
  } else if (context?.attackerRunning && distance > 2) {
    context_ = "running";
    detail = "running attack";
  } else if (isBehind) {
    context_ = "behind";
    detail = "attacker behind";
  }

  return { context: context_, distance, facingAngle, isBehind, detail };
}

// ---------------------------------------------------------------------------
// Pre-move positioning
// ---------------------------------------------------------------------------

export interface PositionTarget {
  attackerPos: THREE.Vector3;
  attackerFacing: number;
  victimPos: THREE.Vector3;
  victimFacing: number;
}

/**
 * Calculate where fighters should be for a move to look correct.
 * The wrestling FBX files have both characters at specific relative positions —
 * we replicate that spacing here.
 *
 * Most paired moves: attacker and victim ~0.6m apart, facing each other.
 * Behind moves (German suplex): attacker directly behind victim, ~0.4m.
 */
export function getMovePosition(
  move: WrestlingMove,
  attackerPos: THREE.Vector3,
  victimPos: THREE.Vector3
): PositionTarget {
  // Direction from attacker to victim (keep current orientation)
  const dx = victimPos.x - attackerPos.x;
  const dz = victimPos.z - attackerPos.z;
  const dist = Math.hypot(dx, dz) || 1;
  const nx = dx / dist;
  const nz = dz / dist;

  // Midpoint between fighters (keep the action centered where it is)
  const midX = (attackerPos.x + victimPos.x) / 2;
  const midZ = (attackerPos.z + victimPos.z) / 2;

  let spacing: number;
  let attackerFacing: number;
  let victimFacing: number;

  switch (move.position) {
    case "behind":
      // Attacker behind victim, both facing same direction
      spacing = 0.45;
      attackerFacing = Math.atan2(nx, nz);
      victimFacing = attackerFacing; // same direction
      break;
    case "face_to_face":
    default:
      // Face-to-face, ~0.65m apart (wrestling clinch distance)
      spacing = 0.65;
      attackerFacing = Math.atan2(nx, nz);
      victimFacing = Math.atan2(-nx, -nz);
      break;
    case "ground":
      // Attacker standing over downed victim
      spacing = 0.5;
      attackerFacing = Math.atan2(nx, nz);
      victimFacing = Math.atan2(-nx, -nz); // victim on ground, facing up-ish
      break;
    case "corner":
      // Victim against corner, attacker in front
      spacing = 0.7;
      attackerFacing = Math.atan2(nx, nz);
      victimFacing = Math.atan2(-nx, -nz);
      break;
  }

  const half = spacing / 2;
  return {
    attackerPos: new THREE.Vector3(midX - nx * half, attackerPos.y, midZ - nz * half),
    attackerFacing,
    victimPos: new THREE.Vector3(midX + nx * half, victimPos.y, midZ + nz * half),
    victimFacing,
  };
}

// ---------------------------------------------------------------------------
// Position-aware paired grapple
// ---------------------------------------------------------------------------

export interface GrappleOptions {
  /** Snap fighters to correct positions before playing (default: true) */
  snapPosition?: boolean;
  /** Blend time for position snap (default: 0.15) */
  snapBlend?: number;
}

/**
 * Execute a wrestling move with full position awareness.
 *
 * 1. Validates the move can be performed from current position
 * 2. Positions fighters correctly (no clipping, proper spacing)
 * 3. Plays synchronized deliverer + receiver animations
 * 4. Locks both fighters until complete
 *
 * Returns false if the move cannot be performed.
 */
export function executeWrestlingMove(
  attacker: FighterAnim,
  victim: FighterAnim,
  moveId: string,
  attackerPos: FighterPosition,
  victimPos: FighterPosition,
  gameContext?: {
    victimDown?: boolean;
    nearCorner?: boolean;
    nearRopes?: boolean;
    attackerRunning?: boolean;
    attackerElevated?: boolean;
    hasPartner?: boolean;
    hasWeapon?: boolean;
  },
  opts: GrappleOptions = {}
): boolean {
  const move = WRESTLING_MOVES[moveId];
  if (!move) {
    console.warn(`[grapple] Unknown move: ${moveId}`);
    return false;
  }

  // 1. Analyze current position
  const analysis = analyzePosition(attackerPos, victimPos, gameContext);

  // 2. Validate move can be performed
  const canDo = canPerformMove(moveId, {
    position: analysis.context,
    hasPartner: gameContext?.hasPartner,
    opponentDown: gameContext?.victimDown,
    hasWeapon: gameContext?.hasWeapon,
  });

  if (!canDo) {
    console.warn(
      `[grapple] Cannot perform ${move.name} from ${analysis.context} ` +
      `(requires ${move.position}). ${analysis.detail}.`
    );
    return false;
  }

  // 3. Position fighters correctly
  if (opts.snapPosition !== false) {
    const target = getMovePosition(move, attackerPos.position, victimPos.position);
    // Note: actual position setting is done by the caller (view.ts)
    // which has access to the THREE.Group objects.
    // We store the targets for the caller to apply.
    (attacker as any).__moveTarget = target.attackerPos;
    (attacker as any).__moveFacing = target.attackerFacing;
    (victim as any).__moveTarget = target.victimPos;
    (victim as any).__moveFacing = target.victimFacing;
  }

  // 4. Play synchronized animations
  if (move.paired) {
    return playPairedGrapple(attacker, victim, move.delivererClip);
  } else {
    // Single animation (taunts, etc.)
    const clipName = resolveClip(move.delivererClip);
    if (!clipName || !attacker.actions[clipName]) return false;
    const action = attacker.actions[clipName];
    action.reset();
    action.setLoop(THREE.LoopOnce, 1);
    action.clampWhenFinished = true;
    action.fadeIn(0.15);
    action.play();
    attacker.current = clipName;
    attacker.currentState = moveId;
    const dur = motionDur(clipName) || action.getClip().duration;
    attacker.lockUntil = performance.now() / 1000 + dur;
    return true;
  }
}

/**
 * Get the move targets set by executeWrestlingMove.
 * Called by view.ts to apply positions to THREE.Group objects.
 */
export function getMoveTargets(fa: FighterAnim): {
  position: THREE.Vector3 | null;
  facing: number | null;
} {
  return {
    position: (fa as any).__moveTarget || null,
    facing: (fa as any).__moveFacing ?? null,
  };
}

/** Clear move targets after applying. */
export function clearMoveTargets(fa: FighterAnim): void {
  delete (fa as any).__moveTarget;
  delete (fa as any).__moveFacing;
}
