/**
 * director.ts — wires dialogue into the game.
 *
 * Three integration points (the owner's spec):
 *   1. Pre-match promos  → playPromo() builds a 3-shot Cinematic with timed
 *      subtitle cues. The fighter talks their talk before the bell.
 *   2. Pause-menu story beats → pauseMenuBeat() returns 1–3 in-character lines
 *      about the current mission for the pause screen to display.
 *   3. JCPW backstage segments → backstageSegment() returns a multi-turn
 *      interview-style segment (Judas' street-corner energy).
 *
 * The director is UI-agnostic: it emits DialogueCues via subscribe(). The game
 * renders them however it wants (the built-in subtitle overlay is provided as
 * the default). All dialogue comes from generator.ts / samples.ts — always in
 * the fighter's voice, never generic.
 */

import { Cinematic, type Shot } from "../cinematics";
import { generateDialogue, promoExchange, type DialogueContext } from "./generator";
import { samplesFor, type DialogueSample } from "./samples";
import { bibleFor } from "./voice-bibles";
import { fighterById } from "../roster";
import { missionAt, placeName, type Mission } from "../campaign";
import type { CameraLike } from "../cinematics";

export interface DialogueCue {
  speaker: string;
  fighterId: string;
  text: string;
  /** how long the cue stays up, ms */
  durationMs: number;
}

type CueHandler = (cue: DialogueCue) => void;

/**
 * DialogueDirector — owns cue timing + delivery.
 * UI subscribes via onCue(); cinematics fire cues through say().
 */
export class DialogueDirector {
  private handlers = new Set<CueHandler>();
  private timers: ReturnType<typeof setTimeout>[] = [];

  onCue(fn: CueHandler): () => void {
    this.handlers.add(fn);
    return () => this.handlers.delete(fn);
  }

  /** Emit one cue now, auto-cleared after durationMs. */
  say(speaker: string, fighterId: string, text: string, durationMs = 3600): void {
    const cue: DialogueCue = { speaker, fighterId, text, durationMs };
    for (const h of this.handlers) {
      try { h(cue); } catch { /* subscriber errors don't kill dialogue */ }
    }
  }

  /** Queue a sequence of cues with per-line timing. */
  playSequence(seq: { speaker: string; fighterId: string; text: string }[], msPerLine = 3600): void {
    this.stop();
    let t = 400;
    for (const line of seq) {
      const at = t;
      this.timers.push(setTimeout(() => this.say(line.speaker, line.fighterId, line.text, msPerLine), at));
      t += msPerLine + 350;
    }
  }

  stop(): void {
    for (const t of this.timers) clearTimeout(t);
    this.timers = [];
  }
}

/* ------------------------------------------------------------------ */
/* 1. Pre-match promo cinematic                                        */
/* ------------------------------------------------------------------ */

export interface PromoOptions {
  camera: CameraLike;
  place?: string;
  title?: string;
  seed?: number;
  /** when false, no DOM subtitle overlay is created (game renders cues itself) */
  subtitles?: boolean;
  onDone?: () => void;
}

/**
 * Build + return a promo Cinematic. Three shots:
 *   1. Wide — the venue, fighter's name hits.
 *   2. Push-in — the fighter talks (their callout lines).
 *   3. Face-off — the opponent answers.
 *
 * Camera framing is generic arena units; tune per-venue in game code.
 */
export function buildPromoCinematic(
  director: DialogueDirector,
  fighterId: string,
  opponentId: string,
  opts: PromoOptions,
): Cinematic {
  const place = opts.place ?? "the ward";
  const aName = bibleFor(fighterId)?.name ?? fighterById(fighterId).name;
  const bName = bibleFor(opponentId)?.name ?? fighterById(opponentId).name;
  const { a, b } = promoExchange(fighterId, opponentId, {
    place,
    title: opts.title,
    seed: opts.seed,
  });

  const lineMs = 3800;
  const shots: Shot[] = [
    {
      name: "promo-wide",
      camFrom: { x: 0, y: 6, z: 18 },
      camTo: { x: 0, y: 4.5, z: 13 },
      lookFrom: { x: 0, y: 1.5, z: 0 },
      lookTo: { x: 0, y: 1.2, z: 0 },
      duration: 3,
      ease: "inOut",
      events: [
        [0.3, () => director.say(aName, fighterId, a.lines[0] ?? "", lineMs)],
      ],
    },
    {
      name: "promo-pushin",
      camFrom: { x: 3.5, y: 2.2, z: 7 },
      camTo: { x: 1.6, y: 1.8, z: 4.2 },
      lookFrom: { x: 0, y: 1.4, z: 0 },
      lookTo: { x: 0, y: 1.4, z: 0 },
      duration: Math.max(4, (a.lines.length - 1) * (lineMs / 1000)),
      ease: "out",
      events: a.lines.slice(1).map((line, i) => [0.4 + i * (lineMs / 1000), () => director.say(aName, fighterId, line, lineMs)] as [number, () => void]),
    },
    {
      name: "promo-faceoff",
      camFrom: { x: -4.5, y: 2.4, z: 6.5 },
      camTo: { x: -2.2, y: 1.9, z: 4.6 },
      lookFrom: { x: 1.5, y: 1.4, z: 0 },
      lookTo: { x: 1.2, y: 1.4, z: 0 },
      duration: Math.max(4, b.lines.length * (lineMs / 1000)),
      ease: "inOut",
      fovFrom: 55,
      fovTo: 42,
      events: b.lines.map((line, i) => [0.4 + i * (lineMs / 1000), () => director.say(bName, opponentId, line, lineMs)] as [number, () => void]),
    },
  ];

  const cinematic = new Cinematic({
    camera: opts.camera,
    shots,
    letterbox: true,
    skippable: true,
    onComplete: () => { director.stop(); opts.onDone?.(); },
    onSkip: () => { director.stop(); opts.onDone?.(); },
  });
  return cinematic;
}

/* ------------------------------------------------------------------ */
/* 2. Pause-menu story beats                                           */
/* ------------------------------------------------------------------ */

export interface PauseBeat {
  speaker: string;
  fighterId: string;
  lines: string[];
  /** why this beat fired — for the pause menu to label it */
  label: string;
}

/**
 * In-character lines for the pause menu, grounded in the current mission.
 * Boss missions get callout energy; reach missions get travel talk; the rest
 * get backstage-style reflection. Uses the hand-written samples when they fit,
 * generated lines otherwise.
 */
export function pauseMenuBeat(fighterId: string, missionIndex: number, seed?: number): PauseBeat {
  const mission: Mission = missionAt(missionIndex);
  const name = bibleFor(fighterId)?.name ?? fighterById(fighterId).name;
  const placeName: Record<string, string> = {
    plaza: "Cinder Plaza", street: "Scrap Street", scaffold: "the Coil Roofs",
    market: "Night Market", yard: "the Yard", dock: "the Pier", under: "Under the Ward",
    ring: "the Ring", cage: "the Cage", subway: "the Platform", crane: "the Crane Roof",
    office: "the Back Room",
  };
  const place = placeName[mission.home] ?? mission.home;
  const ctx: DialogueContext = { place, title: mission.title, seed };

  let lines: string[];
  let label: string;
  if (mission.boss) {
    label = `Boss — ${mission.title}`;
    lines = generateDialogue(fighterId, "callout", { ...ctx, opponent: "this boss" }).lines.slice(0, 2);
  } else if (mission.rule === "reach") {
    label = `On the move — ${mission.title}`;
    lines = generateDialogue(fighterId, "promo", ctx).lines.slice(0, 2);
  } else {
    label = `Between rounds — ${mission.title}`;
    const sample: DialogueSample | undefined = samplesFor(fighterId).find((s) => s.situation === "backstage");
    lines = sample ? sample.lines.slice(0, 3) : generateDialogue(fighterId, "backstage", ctx).lines.slice(0, 2);
  }
  return { speaker: name, fighterId, lines, label };
}

/* ------------------------------------------------------------------ */
/* 3. JCPW backstage segments                                          */
/* ------------------------------------------------------------------ */

export interface BackstageSegment {
  title: string;
  turns: { speaker: string; fighterId: string; text: string }[];
}

/**
 * Judas-style street-corner interview: the interviewer asks, the fighter
 * answers in full voice. Two to four turns. Feed it to the dialogue overlay
 * or the backstage screen.
 */
const INTERVIEWER_LINES = [
  "Word on the street is things got heated. What really happened?",
  "The fans want to know — what's the real story?",
  "AWE's been running their mouths. Your response?",
  "Last question — anything you want to say directly to them?",
];

export function backstageSegment(
  fighterId: string,
  opponentName?: string,
  seed?: number,
): BackstageSegment {
  const name = bibleFor(fighterId)?.name ?? fighterById(fighterId).name;
  const rngSeed = seed ?? 0;
  const backstage = generateDialogue(fighterId, "backstage", { opponent: opponentName, seed: rngSeed });
  const street = generateDialogue(fighterId, "street", { opponent: opponentName, seed: rngSeed ^ 0x51 });

  const turns: BackstageSegment["turns"] = [];
  const iv = INTERVIEWER_LINES[rngSeed % INTERVIEWER_LINES.length];
  turns.push({ speaker: "Judas", fighterId: "__interviewer", text: `${name} — ${iv}` });

  const answer = [...backstage.lines, ...street.lines].slice(0, 3);
  for (const line of answer) turns.push({ speaker: name, fighterId, text: line });

  // Static's signature: the interviewer pushes once, he closes the door.
  if (fighterId === "static") {
    turns.push({ speaker: "Judas", fighterId: "__interviewer", text: "Come on — give us ONE name." });
    turns.push({
      speaker: name, fighterId,
      text: "That's funny, man. What happens in the JCPW locker room stays in the JCPW locker room. Next question.",
    });
  }
  return { title: `JCPW Backstage — ${name}`, turns };
}

/* ------------------------------------------------------------------ */
/* 4. Street encounters — Urban Reign street life, NOT the wrestling    */
/*    world. Roam mode, turf war events, mission briefings. Wrestling   */
/*    promos stay in wrestling contexts (arena, wrestler factions).     */
/* ------------------------------------------------------------------ */

export type StreetSituation =
  | "confront" | "parley" | "corpo" | "hustle"
  | "claim" | "civilian" | "loyalty" | "heat";

export interface StreetEncounterOptions {
  situation: StreetSituation;
  place?: string;
  /** who they're facing — crew name, rival, "the block", etc. */
  opponent?: string;
  /** second speaker for two-sided scenes (parley, confront) */
  otherId?: string;
  seed?: number;
  msPerLine?: number;
}

export interface StreetEncounter {
  title: string;
  turns: { speaker: string; fighterId: string; text: string }[];
}

const STREET_TITLES: Record<StreetSituation, string> = {
  confront: "Corner Standoff",
  parley: "Parley",
  corpo: "The Suit",
  hustle: "The Deal",
  claim: "Territory Claim",
  civilian: "Caught In It",
  loyalty: "Crew Business",
  heat: "Heat",
};

/**
 * A street scene: one voice (or two, for parley/confront) talking in the
 * corner register. Prefers hand-written samples, falls back to the generator.
 * Feed turns to director.playSequence() or the subtitle overlay.
 */
export function streetEncounter(
  fighterId: string,
  opts: StreetEncounterOptions,
): StreetEncounter {
  const name = bibleFor(fighterId)?.name ?? fighterById(fighterId).name;
  const place = opts.place ?? "the ward";
  const seed = opts.seed ?? 0;
  const ctx: DialogueContext = { place, opponent: opts.opponent, seed };

  const turns: StreetEncounter["turns"] = [];
  const sample: DialogueSample | undefined = samplesFor(fighterId).find(
    (s) => s.situation === opts.situation,
  );
  const lines = sample
    ? sample.lines.slice(0, 3)
    : generateDialogue(fighterId, opts.situation, ctx).lines.slice(0, 3);
  for (const line of lines) turns.push({ speaker: name, fighterId, text: line });

  // Two-sided scenes: the other side answers.
  if (opts.otherId) {
    const otherName = bibleFor(opts.otherId)?.name ?? fighterById(opts.otherId).name;
    const answer = generateDialogue(opts.otherId, opts.situation, {
      ...ctx,
      opponent: name,
      seed: seed ^ 0x3c6e,
    }).lines.slice(0, 2);
    for (const line of answer) turns.push({ speaker: otherName, fighterId: opts.otherId, text: line });
  }

  return { title: `${STREET_TITLES[opts.situation]} — ${name}`, turns };
}

/** Play a street encounter through the director's cue system. */
export function playStreetEncounter(
  director: DialogueDirector,
  fighterId: string,
  opts: StreetEncounterOptions,
): StreetEncounter {
  const enc = streetEncounter(fighterId, opts);
  director.playSequence(
    enc.turns.map((t) => ({ speaker: t.speaker, fighterId: t.fighterId, text: t.text })),
    opts.msPerLine ?? 4200,
  );
  return enc;
}

/* ------------------------------------------------------------------ */
/* 5. Turf war beats — territory changes hands                         */
/* ------------------------------------------------------------------ */

export interface TurfWarOptions {
  blockName: string;
  /** fighterId of the crew/character taking the block */
  takenById: string;
  /** display name of the crew that lost it */
  lostByName?: string;
  seed?: number;
  msPerLine?: number;
}

export interface TurfWarBeat {
  title: string;
  turns: { speaker: string; fighterId: string; text: string }[];
}

/**
 * The block changed hands. The taker claims it (claim register); if we know
 * who lost it, they get a confront line about it. For turf-war HUD events,
 * roam-mode takeovers, story territory shifts.
 */
export function turfWarBeat(
  director: DialogueDirector,
  opts: TurfWarOptions,
): TurfWarBeat {
  const takerName = bibleFor(opts.takenById)?.name ?? fighterById(opts.takenById).name;
  const seed = opts.seed ?? 0;
  const turns: TurfWarBeat["turns"] = [];

  const claimSample = samplesFor(opts.takenById).find((s) => s.situation === "claim");
  const claimLines = claimSample
    ? claimSample.lines.slice(0, 2)
    : generateDialogue(opts.takenById, "claim", {
        place: opts.blockName,
        opponent: opts.lostByName,
        seed,
      }).lines.slice(0, 2);
  for (const line of claimLines) {
    turns.push({ speaker: takerName, fighterId: opts.takenById, text: line });
  }

  if (opts.lostByName) {
    turns.push({
      speaker: opts.lostByName,
      fighterId: "__lieutenant",
      text: generateDialogue("__lieutenant", "confront", {
        place: opts.blockName,
        opponent: takerName,
        seed: seed ^ 0x77,
      }).lines[0] ?? "That block was ours. It ain't over.",
    });
  }

  director.playSequence(
    turns.map((t) => ({ speaker: t.speaker, fighterId: t.fighterId, text: t.text })),
    opts.msPerLine ?? 4200,
  );
  return { title: `Turf War — ${opts.blockName}`, turns };
}

/* ------------------------------------------------------------------ */
/* 6. Mission briefings — street-context job intros                    */
/* ------------------------------------------------------------------ */

export interface MissionBriefing {
  speaker: string;
  fighterId: string;
  lines: string[];
  label: string;
}

/**
 * In-character lines for a mission intro, grounded in the street — not the
 * ring. Situation follows the mission rule: clear → confront, reach → claim,
 * rival → callout (named fighter, wrestling register is correct there),
 * inside → parley, second → loyalty.
 */
export function missionBriefing(
  fighterId: string,
  missionIndex: number,
  seed?: number,
): MissionBriefing {
  const mission: Mission = missionAt(missionIndex);
  const name = bibleFor(fighterId)?.name ?? fighterById(fighterId).name;
  const place = placeName(mission.home);
  const ctx: DialogueContext = { place, title: mission.title, seed };

  let situation: Situation;
  let label: string;
  switch (mission.rule) {
    case "clear":
      situation = "confront";
      label = `Street job — ${mission.title}`;
      break;
    case "reach":
      situation = "claim";
      label = `Take the block — ${mission.title}`;
      break;
    case "rival":
      situation = "callout";
      label = `One name — ${mission.title}`;
      break;
    case "inside":
      situation = "parley";
      label = `The room — ${mission.title}`;
      break;
    case "second":
      situation = "loyalty";
      label = `They send more — ${mission.title}`;
      break;
    default:
      situation = "confront";
      label = `Street job — ${mission.title}`;
  }

  const sample: DialogueSample | undefined = samplesFor(fighterId).find(
    (s) => s.situation === situation,
  );
  const lines = sample
    ? sample.lines.slice(0, 2)
    : generateDialogue(fighterId, situation, ctx).lines.slice(0, 2);
  return { speaker: name, fighterId, lines, label };
}

/* ------------------------------------------------------------------ */
/* Default DOM subtitle overlay (optional; game can render cues itself) */
/* ------------------------------------------------------------------ */

export function attachSubtitleOverlay(director: DialogueDirector): () => void {
  const el = document.createElement("div");
  el.className = "ashlane-dialogue-cue";
  const css = document.createElement("style");
  css.textContent = `
    .ashlane-dialogue-cue {
      position: fixed; left: 50%; bottom: 12vh; transform: translateX(-50%);
      max-width: min(88vw, 720px); z-index: 42; pointer-events: none;
      opacity: 0; transition: opacity .25s ease; text-align: center;
    }
    .ashlane-dialogue-cue.show { opacity: 1; }
    .ashlane-dialogue-cue .al-dq-speaker {
      display: inline-block; font-family: var(--font-display, sans-serif);
      font-size: 11px; letter-spacing: .3em; text-transform: uppercase;
      color: var(--color-brass, #f0b429); margin-bottom: 6px;
      background: rgba(0,0,0,.55); padding: 3px 10px; border: 1px solid var(--color-line, #333);
    }
    .ashlane-dialogue-cue .al-dq-text {
      font-family: var(--font-headline, sans-serif); font-size: clamp(16px, 2.6vw, 24px);
      color: var(--color-cream, #f5efe4); text-transform: uppercase; line-height: 1.25;
      text-shadow: 2px 2px 0 #000, 0 0 18px rgba(0,0,0,.8);
      background: linear-gradient(180deg, rgba(10,8,6,.72), rgba(10,8,6,.55));
      padding: 10px 18px; border-left: 4px solid var(--color-ember, #e4572e);
    }
  `;
  document.head.appendChild(css);
  document.body.appendChild(el);

  let hide: ReturnType<typeof setTimeout> | null = null;
  const off = director.onCue((cue) => {
    if (hide) clearTimeout(hide);
    el.innerHTML =
      `<div class="al-dq-speaker">${escapeHtml(cue.speaker)}</div>` +
      `<div class="al-dq-text">${escapeHtml(cue.text)}</div>`;
    el.classList.add("show");
    hide = setTimeout(() => el.classList.remove("show"), cue.durationMs);
  });

  return () => {
    off();
    if (hide) clearTimeout(hide);
    el.remove();
    css.remove();
  };
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
