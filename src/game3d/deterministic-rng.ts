/**
 * deterministic-rng.ts — seeded PRNG foundation for AshLane's rollback netcode.
 *
 * This is Phase 0 of tools/netcode/NETCODE_PLAN.md ("Determinism foundation"):
 * the plan mandates that nothing in the sim may call Math.random(), Date.now(),
 * or iterate objects in insertion order. All randomness (hit sparks, AI rolls,
 * crowd reactions) must derive from a seeded PRNG exchanged once at match start.
 *
 * Library: seedrandom (MIT, https://github.com/davidbau/seedrandom) — ARC4-based
 * seeded PRNG with serializable state, which is exactly what rollback needs:
 * SimRandom.state() / .restore() give per-tick RNG snapshots for rewind+resim.
 *
 * Wired in Round 7 (open-source harvest). Commercial-safe (MIT).
 */

import seedrandom from "seedrandom";

/** A pseudo-random function returning doubles in [0, 1). */
export type Rng = () => number;

/**
 * Create a seeded PRNG. Same seed (string or number) => identical stream,
 * across runs, machines, and browsers. Use one instance per deterministic
 * domain (sim, particles, crowd) so cosmetic consumption can't shift the
 * sim's stream.
 */
export function createRng(seed: string | number): Rng {
  return seedrandom(seed);
}

/**
 * Forkable, snapshot-able RNG for the fight sim. State save/restore makes
 * per-tick RNG snapshots possible for rollback rewind+resim.
 */
export class SimRandom {
  private rng: ReturnType<typeof seedrandom>;
  private readonly seed: string | number;

  constructor(seed: string | number) {
    this.seed = seed;
    this.rng = seedrandom(seed, { state: true });
  }

  /** Next double in [0, 1). */
  next(): number {
    return this.rng();
  }

  /** Integer in [min, max] inclusive. */
  int(min: number, max: number): number {
    return min + Math.floor(this.rng() * (max - min + 1));
  }

  /** Pick a random element. */
  pick<T>(arr: readonly T[]): T {
    if (arr.length === 0) throw new Error("SimRandom.pick: empty array");
    return arr[Math.floor(this.rng() * arr.length)];
  }

  /** Chance roll: true with probability p. */
  chance(p: number): boolean {
    return this.rng() < p;
  }

  /**
   * Serialize the RNG's internal state. Opaque JSON-safe object — store it in
   * the per-tick snapshot alongside positions/health for rollback resim.
   */
  state(): unknown {
    return this.rng.state();
  }

  /** Restore a state previously captured with state(). */
  restore(s: unknown): void {
    this.rng = seedrandom("", { state: s as object });
  }

  /** Fresh SimRandom with the same original seed (for SyncTest replays). */
  fork(): SimRandom {
    return new SimRandom(this.seed);
  }
}

/** FNV-1a 32-bit hash — small, fast, deterministic checksum for SyncTest. */
export function hashString(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

export interface SyncTestResult {
  match: boolean;
  /** Hex checksum of each run's full output stream. */
  checksums: string[];
  ticks: number;
}

/**
 * Phase-0 SyncTest: run the same deterministic step function twice from the
 * same seed and require bit-identical output. The step returns a number per
 * tick (e.g. a hash of positions/health); we checksum the whole stream.
 *
 * A real sim wires this as: step(rng, tick) advances one 60Hz tick of the
 * fight sim using ONLY rng (never Math.random) and returns hashState().
 */
export function runSyncTest(
  seed: string | number,
  ticks: number,
  step: (rng: SimRandom, tick: number) => number,
): SyncTestResult {
  const checksums: string[] = [];
  for (let run = 0; run < 2; run++) {
    const rng = new SimRandom(seed);
    let h = 0x811c9dc5;
    for (let tick = 0; tick < ticks; tick++) {
      // Mix the step's output into the checksum as exact string bits —
      // String(double) is deterministic for identical doubles, which is all
      // an equality comparison needs.
      const bits = String(step(rng, tick));
      for (let i = 0; i < bits.length; i++) {
        h ^= bits.charCodeAt(i);
        h = Math.imul(h, 0x01000193);
      }
    }
    checksums.push((h >>> 0).toString(16).padStart(8, "0"));
  }
  return { match: checksums[0] === checksums[1], checksums, ticks };
}

// ---------------------------------------------------------------------------
// Dev-mode Math.random poison — the netcode plan's enforcement mechanism.
// In dev, wrap the sim tick: poisonMathRandom() → step() → restoreMathRandom().
// Any Math.random() call inside the sim throws immediately, catching the #1
// desync source at development time instead of in a live match.
// ---------------------------------------------------------------------------

const REAL_MATH_RANDOM = Math.random;
let poisoned = false;

export function poisonMathRandom(): void {
  if (poisoned) return;
  poisoned = true;
  Math.random = () => {
    throw new Error(
      "Math.random() called inside deterministic sim — use SimRandom instead (deterministic-rng.ts)",
    );
  };
}

export function restoreMathRandom(): void {
  if (!poisoned) return;
  Math.random = REAL_MATH_RANDOM;
  poisoned = false;
}

export function isMathRandomPoisoned(): boolean {
  return poisoned;
}
