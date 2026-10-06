/**
 * zzfx-sfx.ts — ZzFX combat SFX recipes for AshLane (Round 3 audio).
 *
 * These AUGMENT (never replace) src/game3d/combat-sfx.ts: the engine switch
 * in combat-sfx.ts routes through these when the 'zzfx' engine is selected.
 * Every call is null-guarded like the existing `ac()` pattern — safe to call
 * when audio is unavailable or `window` is undefined.
 *
 * ZzFX parameter order:
 *   [volume, randomness, frequency, attack, sustain, release, shape,
 *    shapeCurve, slide, deltaSlide, pitchJump, pitchJumpTime, repeatTime,
 *    noise, modulation, bitCrush, delay, sustainVolume, decay, tremolo, filter]
 */
import { zzfx, zzfxAudioContext } from './zzfx';

/** True when a ZzFX sound can actually be played right now. */
function ready(): boolean {
  try {
    return zzfxAudioContext() !== null;
  } catch {
    return false;
  }
}

/** Play a ZzFX recipe, swallowing any audio failure. */
function playRecipe(params: number[]): void {
  if (!ready()) return;
  try {
    zzfx(...params);
  } catch {
    /* audio unavailable — stay silent */
  }
}

const PUNCH = [0.9, 0.15, 190, 0.005, 0.06, 0.14, 3, 1, -260, 0, 0, 0, 0, 1.6];
const PUNCH_HEAVY = [1.0, 0.12, 130, 0.005, 0.09, 0.22, 3, 1, -180, 0, 0, 0, 0, 2.0];
const KICK = [0.9, 0.15, 120, 0.008, 0.08, 0.18, 2, 1, -120, 0, 0, 0, 0, 1.4];
const KICK_HEAVY = [1.0, 0.12, 85, 0.01, 0.12, 0.28, 2, 1, -90, 0, 0, 0, 0, 1.8];
const BLOCK = [0.7, 0.2, 520, 0.004, 0.03, 0.09, 1, 1, -80, 0, 0, 0, 0, 0.8];
const WHOOSH = [0.5, 0.3, 950, 0.02, 0.16, 0.1, 0, 1, -1400, 0, 0, 0, 0, 3.0];
const KNOCKDOWN = [1.0, 0.1, 95, 0.01, 0.16, 0.34, 4, 1, -70, 0, 0, 0, 0, 2.2];
const CHEER = [0.6, 0.4, 750, 0.08, 0.5, 0.6, 4, 1, 300, 0, 0, 0, 0.06, 2.5];
const BOO = [0.6, 0.3, 260, 0.08, 0.5, 0.6, 2, 1, -160, 0, 0, 0, 0.05, 2.0];

/** ZzFX punch impact: distorted snap with a downward pitch slide. */
export function zxPunch(heavy = false): void {
  playRecipe(heavy ? PUNCH_HEAVY : PUNCH);
}

/** ZzFX kick impact: deeper saw-wave thump. */
export function zxKick(heavy = false): void {
  playRecipe(heavy ? KICK_HEAVY : KICK);
}

/** ZzFX blocked hit: short woody knock. */
export function zxBlock(): void {
  playRecipe(BLOCK);
}

/** ZzFX swing whoosh: banded noise sweep. */
export function zxWhoosh(): void {
  playRecipe(WHOOSH);
}

/** ZzFX body slam: noise-wave knockdown boom. */
export function zxKnockdown(): void {
  playRecipe(KNOCKDOWN);
}

/** ZzFX crowd cheer: stylized noise-wash swell. */
export function zxCheer(): void {
  playRecipe(CHEER);
}

/** ZzFX crowd boo: low disapproving wash. */
export function zxBoo(): void {
  playRecipe(BOO);
}
