/**
 * Locomotion blend — animouse LinearBlendTree for speed-based locomotion.
 *
 * GAME-AGNOSTIC: works with AshLanev2, Brutal-Fist, and Bannon.
 * Takes any THREE.AnimationAction map (Record or Map) and configurable
 * clip names per game — no hardcoded paths or clip names.
 *
 * Replaces discrete idle/walk/run switching with smooth 1D blending.
 * Uses the animouse open-source animation library (MIT).
 */
import * as THREE from "three";
import { LinearBlendTree } from "animouse";

export type ActionMap = Record<string, THREE.AnimationAction> | Map<string, THREE.AnimationAction>;

export interface LocomotionConfig {
  /** Clip names for [idle, walk, run] in this game's naming convention */
  clips: { idle: string; walk: string; run: string };
  /** Blend axis positions in m/s */
  speeds?: { idle?: number; walk?: number; run?: number };
}

const DEFAULT_SPEEDS = { idle: 0, walk: 0.55, run: 2.2 };

/** Per-game configs. Add new games here. */
export const GAME_CONFIGS: Record<string, LocomotionConfig> = {
  // AshLanev2: bank clip names via resolveClip()
  ashlane: {
    clips: { idle: "boxidle", walk: "walk", run: "run" },
  },
  // Brutal-Fist: Bannon clip naming (no native run clip — walk doubles)
  "brutal-fist": {
    clips: { idle: "BOX_IDLE", walk: "DRUNK_WALK", run: "DRUNK_WALK" },
    speeds: { idle: 0, walk: 0.3, run: 1.5 },
  },
  // Bannon: same family as Brutal-Fist
  bannon: {
    clips: { idle: "BOX_IDLE", walk: "DRUNK_WALK", run: "DRUNK_WALK" },
    speeds: { idle: 0, walk: 0.3, run: 1.5 },
  },
};

export interface LocomotionBlend {
  tree: LinearBlendTree;
  update(speed: number): void;
}

function getAction(actions: ActionMap, name: string): THREE.AnimationAction | undefined {
  if (actions instanceof Map) return actions.get(name);
  return actions[name];
}

/**
 * Create a locomotion blend tree for any game.
 * Returns null if the required clips aren't available (caller falls back
 * to discrete switching).
 */
export function createLocomotionBlend(
  actions: ActionMap,
  game: keyof typeof GAME_CONFIGS | LocomotionConfig
): LocomotionBlend | null {
  const cfg = typeof game === "string" ? GAME_CONFIGS[game] : game;
  if (!cfg) return null;
  const speeds = { ...DEFAULT_SPEEDS, ...cfg.speeds };

  const idleAction = getAction(actions, cfg.clips.idle);
  const walkAction = getAction(actions, cfg.clips.walk);
  const runAction = getAction(actions, cfg.clips.run);
  if (!idleAction || !walkAction) return null;

  // Build the blend axis from distinct available clips
  const points: { action: THREE.AnimationAction; value: number }[] = [
    { action: idleAction, value: speeds.idle },
    { action: walkAction, value: speeds.walk },
  ];
  // Only add run as a separate point if it's a distinct action
  if (runAction && runAction !== walkAction && runAction !== idleAction) {
    points.push({ action: runAction, value: speeds.run });
  }
  if (points.length < 2) return null;

  const tree = new LinearBlendTree(points);
  const maxSpeed = points[points.length - 1].value;
  return {
    tree,
    update(speed: number) {
      tree.setBlend(Math.max(0, Math.min(maxSpeed, speed)));
    },
  };
}

/** Compute locomotion speed from velocity components. */
export function locomotionSpeed(vx: number, vz: number): number {
  return Math.hypot(vx, vz);
}
