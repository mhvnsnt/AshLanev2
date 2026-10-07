/**
 * Minimal type shim for the seedrandom (MIT) API surface we use.
 * seedrandom@3 ships untyped JS; this shim describes exactly what
 * deterministic-rng.ts uses and nothing more — verified against the
 * installed runtime (3.0.5).
 */
declare module "seedrandom" {
  export interface SeedRandomOptions {
    /** Pass { state: true } to enable rng.state() save/restore (rollback snapshots). */
    state?: boolean | object;
    /** Use a specific PRNG algorithm ('alea' | 'xor128' | 'tyche-i' | 'xorwow' | 'xor4096' | 'xorshift7' | 'quick'). */
    algorithm?: string;
  }

  export interface SeedRandom {
    /** Next pseudo-random double in [0, 1). */
    (): number;
    /** Serialize internal state (only when constructed with { state: true }). */
    state(): object;
  }

  export default function seedrandom(
    seed?: string | number,
    options?: SeedRandomOptions,
  ): SeedRandom;
}
