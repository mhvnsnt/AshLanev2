/**
 * netcode-codec.ts — compact input-stream codec for AshLane's rollback netcode.
 *
 * Follows tools/netcode/NETCODE_PLAN.md §4: sync INPUTS (never state) at 60Hz,
 * one 16-bit bitmask per player per tick. Packets carry the last N frames
 * redundantly so a dropped packet doesn't stall the remote sim.
 *
 * 16-bit input layout (matches the plan):
 *   bits 0-7 : 8-way movement (N, NE, E, SE, S, SW, W, NW)
 *   bit 8    : punch        bit 9  : kick       bit 10 : block
 *   bit 11   : grab         bit 12 : special    bit 13 : jump
 *   bit 14   : taunt        bit 15 : reserved
 *
 * Wire format: MessagePack array of [tick, p1, p2] triples.
 * Library: @msgpack/msgpack (ISC, https://github.com/msgpack/msgpack-javascript)
 * — ~17 bytes/frame vs ~28 for JSON, zero-schema, no codegen.
 *
 * Wired in Round 7 (open-source harvest). Commercial-safe (ISC).
 */

import { encode, decode } from "@msgpack/msgpack";

/** 8-way movement directions, bits 0-7. */
export const DIR = {
  N: 1 << 0,
  NE: 1 << 1,
  E: 1 << 2,
  SE: 1 << 3,
  S: 1 << 4,
  SW: 1 << 5,
  W: 1 << 6,
  NW: 1 << 7,
} as const;

/** Buttons, bits 8-14. */
export const BTN = {
  PUNCH: 1 << 8,
  KICK: 1 << 9,
  BLOCK: 1 << 10,
  GRAB: 1 << 11,
  SPECIAL: 1 << 12,
  JUMP: 1 << 13,
  TAUNT: 1 << 14,
} as const;

export const INPUT_MASK_BITS = 16;
const MAX_MASK = 0xffff;

/** One tick of 2-player input. */
export interface InputFrame {
  tick: number;
  p1: number;
  p2: number;
}

/** How many recent frames ride redundantly in each packet (plan §4: 3-10). */
export const REDUNDANT_FRAMES = 5;

function checkMask(mask: number, who: string): void {
  if (!Number.isInteger(mask) || mask < 0 || mask > MAX_MASK) {
    throw new Error(`netcode-codec: ${who} mask out of 16-bit range: ${mask}`);
  }
}

function checkFrame(f: InputFrame): void {
  if (!Number.isInteger(f.tick) || f.tick < 0) {
    throw new Error(`netcode-codec: bad tick: ${f.tick}`);
  }
  checkMask(f.p1, "p1");
  checkMask(f.p2, "p2");
}

/**
 * Encode frames as a MessagePack byte array: [[tick,p1,p2], ...].
 * Frames should be tick-ordered; the codec preserves order as given.
 */
export function encodeInputStream(frames: InputFrame[]): Uint8Array {
  for (const f of frames) checkFrame(f);
  const triples = frames.map((f) => [f.tick, f.p1, f.p2]);
  return encode(triples);
}

/** Decode a packet produced by encodeInputStream. Throws on malformed data. */
export function decodeInputStream(bytes: Uint8Array): InputFrame[] {
  const raw = decode(bytes) as unknown;
  if (!Array.isArray(raw)) throw new Error("netcode-codec: packet is not an array");
  return raw.map((t, i) => {
    if (!Array.isArray(t) || t.length !== 3) {
      throw new Error(`netcode-codec: frame ${i} is not a [tick,p1,p2] triple`);
    }
    const [tick, p1, p2] = t as unknown[];
    const frame = { tick, p1, p2 } as InputFrame;
    checkFrame(frame);
    return frame;
  });
}

/**
 * Build a network packet from the rolling input history: the newest
 * REDUNDANT_FRAMES frames, so a single dropped packet never stalls the
 * remote sim (plan §4). Returns the encoded bytes ready for the transport.
 */
export function makeInputPacket(history: InputFrame[]): Uint8Array {
  const tail = history.slice(-REDUNDANT_FRAMES);
  return encodeInputStream(tail);
}

/** Human-readable input mask for debug overlays / replay inspectors. */
export function inputMaskToString(mask: number): string {
  checkMask(mask, "debug");
  const parts: string[] = [];
  const dirNames = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"] as const;
  for (let i = 0; i < 8; i++) if (mask & (1 << i)) parts.push(dirNames[i]);
  const btnNames = ["PUNCH", "KICK", "BLOCK", "GRAB", "SPECIAL", "JUMP", "TAUNT"] as const;
  for (let i = 0; i < 7; i++) if (mask & (1 << (8 + i))) parts.push(btnNames[i]);
  return parts.length ? parts.join("+") : "—";
}

/** Combine direction + button bits into one 16-bit mask. */
export function makeMask(dirBits: number, btnBits: number): number {
  const mask = (dirBits & 0xff) | (btnBits & 0xff00);
  checkMask(mask, "makeMask");
  return mask;
}
