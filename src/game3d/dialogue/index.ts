/**
 * dialogue — character dialogue generation system for AshLane/Bannon.
 *
 * In-character promos, backstage segments, trash talk, and story lines —
 * every fighter talks like THEMSELVES, never generic.
 *
 * Modules:
 *   voice-bibles.ts — HOW each character talks (pace, register, signature
 *                      phrases, vocab, what they'd never say). `basedOn` is
 *                      only set when the owner confirmed it. `streetVoice`
 *                      notes how the corner register differs from the ring.
 *                      Includes 4 street archetypes (lieutenant, fixer,
 *                      hustler, beat cop) — original, zero invented casting.
 *   generator.ts    — seeded fighter × situation → lines. Deterministic:
 *                      same inputs always yield the same promo.
 *   samples.ts      — hand-written showcase pack. The quality bar.
 *   director.ts     — game wiring: pre-match promo cinematics, pause-menu
 *                      story beats, JCPW backstage segments, subtitle overlay,
 *                      PLUS street wiring: streetEncounter, turfWarBeat,
 *                      missionBriefing (Urban Reign street life, not wrestling).
 *
 * Two worlds, never mixed:
 *   - Wrestling contexts (promo/callout/backstage/victory/...) → arena,
 *     wrestler factions, wrestling storylines.
 *   - Street contexts (confront/parley/corpo/hustle/claim/civilian/loyalty/heat)
 *     → roam mode, turf war, missions. Wrestlers AND gangsters AND corpo
 *     bosses AND civilians.
 *
 * Quick use:
 *   import { generateDialogue, DialogueDirector, buildPromoCinematic } from "@/game3d/dialogue";
 *   const d = generateDialogue("static", "promo", { opponent: "Wreck Patterson", place: "Cinder Plaza" });
 *   // d.lines → Static's voice, seeded, reproducible
 *   import { streetEncounter } from "@/game3d/dialogue";
 *   const s = streetEncounter("static", { situation: "claim", place: "the bodega corner" });
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
  // street world (Urban Reign street life — not the wrestling world)
  streetEncounter,
  playStreetEncounter,
  turfWarBeat,
  missionBriefing,
} from "./director";
export type {
  DialogueCue,
  PromoOptions,
  PauseBeat,
  BackstageSegment,
  StreetSituation,
  StreetEncounterOptions,
  StreetEncounter,
  TurfWarOptions,
  TurfWarBeat,
  MissionBriefing,
} from "./director";
