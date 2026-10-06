/**
 * dialogue — character dialogue generation system for AshLane/Bannon.
 *
 * In-character promos, backstage segments, trash talk, and story lines —
 * every fighter talks like THEMSELVES, never generic.
 *
 * Modules:
 *   voice-bibles.ts — HOW each character talks (pace, register, signature
 *                      phrases, vocab, what they'd never say). `basedOn` is
 *                      only set when the owner confirmed it.
 *   generator.ts    — seeded fighter × situation → lines. Deterministic:
 *                      same inputs always yield the same promo.
 *   samples.ts      — hand-written showcase pack. The quality bar.
 *   director.ts     — game wiring: pre-match promo cinematics, pause-menu
 *                      story beats, JCPW backstage segments, subtitle overlay.
 *
 * Quick use:
 *   import { generateDialogue, DialogueDirector, buildPromoCinematic } from "@/game3d/dialogue";
 *   const d = generateDialogue("static", "promo", { opponent: "Wreck Patterson", place: "Cinder Plaza" });
 *   // d.lines → Static's voice, seeded, reproducible
 */

export { VOICE_BIBLES, bibleFor, bibleForName } from "./voice-bibles";
export type { VoiceBible, SpeechProfile, Situation, Pace } from "./voice-bibles";

export {
  generateDialogue,
  promoExchange,
  supportedSituations,
  hashSeed,
  mulberry32,
} from "./generator";
export type { DialogueContext, GeneratedDialogue } from "./generator";

export { SAMPLE_PACK, samplesFor, sampleSituations } from "./samples";
export type { DialogueSample } from "./samples";

export {
  DialogueDirector,
  buildPromoCinematic,
  pauseMenuBeat,
  backstageSegment,
  attachSubtitleOverlay,
} from "./director";
export type { DialogueCue, PromoOptions, PauseBeat, BackstageSegment } from "./director";
