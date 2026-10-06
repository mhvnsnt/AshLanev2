/**
 * voice.ts — THE NARRATOR's voice plumbing.
 *
 * Voice = Bill $aber's voice.
 *
 * ⚠️ OWNER DECISION REQUIRED — DO NOT AI-generate the narrator's voice lines
 * until the owner answers: does he want to RECORD the narrator himself
 * (it's his persona's voice), or should the voice pipeline synthesize it?
 * Until then, the narrator is subtitle-only. This module is built so either
 * plugs in with zero code changes: drop mp3s in public/audio/narrator/
 * named <line-id>.mp3 and they play automatically.
 *
 * Recording spec for the owner (when he records):
 *   - Format: MP3 or WAV, 44.1kHz, mono is fine
 *   - Naming: <trigger>.mp3, e.g. first_boot.mp3, act_transition-2.mp3
 *   - Line ids are logged to console in dev when the narrator appears
 *   - Keep the Bill $aber cadence: measured, conspiratorial, amused
 */

import { assetUrl } from "../asset-base";

/** public/audio/narrator/<line-id>.mp3, via the deploy-aware asset helper. */
const narratorUrl = (lineId: string) => assetUrl(`audio/narrator/${lineId}.mp3`);

/** Cache of which line ids have a recording (probed once, lazily). */
const knownGood = new Set<string>();
const knownMissing = new Set<string>();

async function hasRecording(lineId: string): Promise<boolean> {
  if (knownGood.has(lineId)) return true;
  if (knownMissing.has(lineId)) return false;
  try {
    const res = await fetch(narratorUrl(lineId), { method: "HEAD" });
    if (res.ok) {
      knownGood.add(lineId);
      return true;
    }
  } catch {
    /* offline / missing — subtitle-only */
  }
  knownMissing.add(lineId);
  return false;
}

let current: HTMLAudioElement | null = null;

/** Stop any narrator audio currently playing. */
export function stopNarratorVoice(): void {
  if (current) {
    current.pause();
    current = null;
  }
}

export interface SpeakResult {
  /** true if a recording played, false if subtitle-only */
  voiced: boolean;
  /** ms the line should stay up (audio duration, or 0 = use subtitle timing) */
  durationMs: number;
}

/**
 * Speak a narrator line. Plays the owner's recording when present;
 * otherwise resolves subtitle-only. NEVER synthesizes — that decision
 * belongs to the owner (see module doc).
 */
export async function speakNarrator(lineId: string, text: string): Promise<SpeakResult> {
  stopNarratorVoice();
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.log(`[narrator] "${text}" (line id: ${lineId})`);
  }
  if (!(await hasRecording(lineId))) {
    return { voiced: false, durationMs: 0 };
  }
  return new Promise((resolve) => {
    const audio = new Audio(narratorUrl(lineId));
    current = audio;
    const done = (voiced: boolean, durationMs: number) => {
      if (current === audio) current = null;
      resolve({ voiced, durationMs });
    };
    audio.onloadedmetadata = () => {
      const ms = Math.max(1500, (audio.duration || 4) * 1000 + 400);
      audio.play().catch(() => done(false, 0));
      audio.onended = () => done(true, ms);
    };
    audio.onerror = () => done(false, 0);
    // safety: never hang the subtitle on a stuck file
    setTimeout(() => {
      if (current === audio) {
        audio.pause();
        done(true, 6000);
      }
    }, 30000);
  });
}
