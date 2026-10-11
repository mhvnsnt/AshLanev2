/**
 * AshLane environmental takedowns — research-driven combat depth (owner 2026-10-07).
 *
 * References (patterns only, original implementation):
 *  - Urban Reign: wall/floor context attacks, weapon-vs-environment sparks
 *  - Def Jam: crowd-ringed street fights, environmental finishers
 *  - Yakuza: HEAT actions keyed to nearby objects (bike, sign, wall)
 *  - Sleeping Dogs: environmental kills (dumpster, phone booth, car)
 *
 * How it works: when a grapple is available, this module checks the
 * attacker's surroundings for registered solid props (from env-assets.ts).
 * If a matching prop is within range, it offers a context takedown with
 * a damage bonus and a camera-friendly name. The caller (view.ts) decides
 * whether to offer it as a prompt or auto-trigger on heavy grapple.
 */

export interface EnvTakedown {
  /** stable id */
  id: string;
  /** display name (fight UI) */
  name: string;
  /** prop kinds that enable this takedown */
  propKinds: readonly string[];
  /** extra damage multiplier over a normal grapple */
  damageMult: number;
  /** does it knock the victim down? */
  knockdown: boolean;
  /** does it use the prop as a weapon (prop takes a hit)? */
  propHit: boolean;
}

/** Takedown catalog — keyed by prop model filename fragment. */
export const ENV_TAKEDOWNS: readonly EnvTakedown[] = [
  {
    id: "dumpster-slam", name: "DUMPSTER SLAM",
    propKinds: ["dumpster"],
    damageMult: 1.6, knockdown: true, propHit: true,
  },
  {
    id: "wall-splat", name: "WALL SPLAT",
    propKinds: ["wall", "building", "fence", "chainlink-fence"],
    damageMult: 1.4, knockdown: true, propHit: false,
  },
  {
    id: "hydrant-bash", name: "HYDRANT BASH",
    propKinds: ["fire-hydrant"],
    damageMult: 1.3, knockdown: false, propHit: true,
  },
  {
    id: "container-crush", name: "CONTAINER CRUSH",
    propKinds: ["shipping-container"],
    damageMult: 1.8, knockdown: true, propHit: true,
  },
  {
    id: "stall-smash", name: "STALL SMASH",
    propKinds: ["market-stall"],
    damageMult: 1.5, knockdown: true, propHit: true,
  },
  {
    id: "lamp-post-swing", name: "LAMP POST SWING",
    propKinds: ["lamp-post", "neon-lamp", "streetlight"],
    damageMult: 1.4, knockdown: true, propHit: false,
  },
  {
    id: "barrel-roll", name: "BARREL ROLL",
    propKinds: ["barrel"],
    damageMult: 1.2, knockdown: false, propHit: true,
  },
  {
    id: "sign-decap", name: "SIGN DECAP",
    propKinds: ["sign", "billboard", "neon"],
    damageMult: 1.5, knockdown: true, propHit: true,
  },
];

export interface NearbyProp {
  /** model filename (for kind matching) */
  model: string;
  /** world position */
  x: number; z: number;
  /** distance from attacker */
  dist: number;
}

/**
 * Find the best environmental takedown for the attacker's position.
 * Returns null when no suitable prop is in range.
 */
export function findEnvTakedown(
  attackerX: number, attackerZ: number,
  nearbyProps: NearbyProp[],
  range = 3.5,
): { takedown: EnvTakedown; prop: NearbyProp } | null {
  let best: { takedown: EnvTakedown; prop: NearbyProp } | null = null;
  for (const prop of nearbyProps) {
    if (prop.dist > range) continue;
    const model = prop.model.toLowerCase();
    for (const td of ENV_TAKEDOWNS) {
      if (td.propKinds.some((k) => model.includes(k))) {
        if (!best || prop.dist < best.prop.dist) {
          best = { takedown: td, prop };
        }
        break;
      }
    }
  }
  return best;
}

/** All takedown ids (for UI/prompt lists). */
export function envTakedownIds(): string[] {
  return ENV_TAKEDOWNS.map((t) => t.id);
}
