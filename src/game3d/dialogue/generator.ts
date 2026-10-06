/**
 * generator.ts — in-character dialogue generator for AshLane/Bannon.
 *
 * generateDialogue(fighterId, situation, ctx, seed) → lines that sound like
 * THAT fighter, not generic wrestling talk. Seeded RNG (mulberry32) so the
 * same seed always yields the same promo — deterministic for replays.
 *
 * How it stays in voice:
 *  - Every bible'd character owns line banks per situation (openers/middles/closers).
 *  - Slots {opponent} {place} {title} get filled from context.
 *  - Signature phrases and vocab from the bible are woven through the banks.
 *  - Characters WITHOUT a bible fall back to an archetype generator built from
 *    their roster bio + martial style — voiced, but honest about being generic.
 *
 * This is the runtime-safe path (no LLM needed in-game). The hand-written
 * showcase lives in samples.ts — the bar this generator has to clear.
 */

import { VOICE_BIBLES, bibleFor, type Situation, type VoiceBible } from "./voice-bibles";
import { fighterById } from "../roster";

export interface DialogueContext {
  opponent?: string;
  place?: string;
  title?: string;
  seed?: number;
}

export interface GeneratedDialogue {
  fighterId: string;
  fighterName: string;
  situation: Situation;
  lines: string[];
  seed: number;
}

/** Deterministic PRNG — same seed, same promo. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Bank = Partial<Record<Situation, string[]>>;

function fill(line: string, ctx: DialogueContext): string {
  return line
    .replace(/\{opponent\}/g, ctx.opponent ?? "you")
    .replace(/\{place\}/g, ctx.place ?? "the ward")
    .replace(/\{title\}/g, ctx.title ?? "everything");
}

/* ------------------------------------------------------------------ */
/* Line banks — written to each bible's voice. This is the soul of it. */
/* ------------------------------------------------------------------ */

const BANKS: Record<string, Bank> = {
  static: {
    promo: [
      "That's funny, man. Y'all really put {opponent} in front of ME? At {place}? That's funny.",
      "I'm not a d*ck. I'm just a really good guy, but you take my kindness for weakness, I immediately throw hands. Ask around. Actually — don't. Nobody talks. That's the code.",
      "I had to fight for everything I got. I didn't get where the f*ck I got being some pushover slump. Never. Not once. Not ever.",
      "How you doin', {place}? Your boy Static's in the building, and {opponent} is about to learn what certified looks like up close.",
      "F*ck AWE and their leakin' asses. What happens in the JCPW locker room STAYS in the JCPW locker room — 'cause real ones handle it, my guy.",
    ],
    callout: [
      "{opponent}? That's funny, man. I've never heard anybody talk about you ever — and there's a reason for that.",
      "Yo, {opponent} — you want some? Come get some. {place}. Me and you. One-on-one, behind closed doors, and whatever happens, happens. It stays there.",
      "Listen, {opponent}, I'm a really good guy. But you keep runnin' that mouth, and I'ma have to throw hands. That's not a threat, that's a schedule.",
    ],
    backstage: [
      "That's funny, man. I've never heard anybody talk about that incident ever. I'm not a d*ck — I'm just a really good guy, but you take my kindness for weakness I immediately throw hands. I never spoke about this and I never really will.",
      "Hey bro, I had to fight for everything I got. When sh*t hit the fan backstage, when I had to walk in a room and speak to Edwin Kennedy one-on-one, when I had to talk to Triple X and Stan Combs one-on-one — those conversations stayed there.",
      "With the boys, same bullsh*t. If I fistfought another guy in the locker room you probably never heard of it — because I probably f*cking won. F*ck AWE for all the p*ssy-ass fighting they do over there and letting it leak.",
    ],
    weighin: [
      "Look at this guy. LOOK at him. {opponent} thinkin' he ready — that's funny, man.",
      "Get this camera off me? Nah, keep it rollin'. I want {opponent} to see this later from the hospital.",
    ],
    victory: [
      "Told you. TOLD you. Certified, bona fide, and {opponent} just got the receipt.",
      "And that's why they don't let the boys talk about what happens in that locker room — 'cause it looks like THIS.",
    ],
    defeat: [
      "That's funny, man. Y'all really gonna act like that was clean? Run it back. RUN IT BACK.",
      "A'ight. A'ight. {opponent} got one. Enjoy it — 'cause now it's personal, my guy.",
    ],
    street: [
      "Yo, it's your boy Static, live from {place}, and let me tell you somethin' about {opponent} — actually, nah. What happens in JCPW stays in JCPW. But let's just say... it got handled.",
    ],
    title: [
      "This? This right here? I fought for EVERYTHING I got, and now the whole ward gotta say my name with respect. STATIC. How you doin'?",
    ],
  },
  cipher: {
    promo: [
      "Man of the hour. That's me. {opponent} is just the guy standin' across from the hour.",
      "I don't chase moments — I AM the moment. {place} about to find out why.",
      "Too sweet to be stressed, too blessed to be bothered. Watch me work.",
    ],
    callout: [
      "{opponent}, you got forty-eight hours to get your affairs in order. The hour is coming.",
      "I'm the main event with or without you, {opponent}. You're just the opening act that bleeds.",
    ],
    victory: [
      "Man. Of. The. Hour. Say it with me, {place}!",
      "Never miss. All gas. That's the motto, {opponent} — you just lived it.",
    ],
    defeat: [
      "The hour got delayed, not denied. Run it back — I'll be shinier.",
    ],
    weighin: [
      "Look at the shine, {opponent}. You can't outshine the hour.",
    ],
  },
  echo: {
    promo: [
      "Ooh, {place} — you brought me {opponent}? I LOVE new toys. Echo echo echo...",
      "You fight like that? Cute. Watch this — ooh, I like that one. MINE now.",
    ],
    callout: [
      "{opponent} said WHAT about me? Say it again — slower — so I can do it back to you in the ring. Heheheh.",
      "I'm gonna borrow your best move, {opponent}, and do it BETTER. That's not stealin'. That's... upgradin'.",
    ],
    victory: [
      "AGAIN! AGAIN! ...what, too much? Never too much. Echo wins, {opponent} naps.",
    ],
    defeat: [
      "Okay okay — that was FUN. Do it again! ...wait, I lost? Heheh. REMATCH. Right now.",
    ],
    backstage: [
      "Did you SEE what {opponent} did out there? I'm doin' it next time. Don't tell 'em. Shhh. Heheh.",
    ],
  },
  stickup: {
    promo: [
      "The system made me. The streets kept me. {opponent} — you already know what it is.",
      "{place}. {opponent}. No long talk. Talk is cheap — hands ain't.",
    ],
    callout: [
      "{opponent}. You standin' where I need to be. Move, or get moved.",
      "I don't do warnings twice. This is the first one, {opponent}.",
    ],
    victory: [
      "Stand on it. That's all I ever do.",
    ],
    defeat: [
      "Took an L. Won't take another. {opponent}, enjoy it while it lasts.",
    ],
    backstage: [
      "The system's weapon turned rebel — that's the story they tell. Truth is simpler: I do what I want now. {opponent} found that out.",
    ],
    faction: [
      "The Ashes don't recruit. We recognize. You either built for this block or you ain't.",
    ],
  },
  maime: {
    promo: [
      "You don't know me. You know the version that SURVIVED. {opponent} is about to meet the other one.",
      "I'm the part he locks in the basement — and tonight the basement's OPEN, {place}.",
      "Burn it down and dance in it. That's the whole plan, {opponent}. There is no plan B.",
    ],
    callout: [
      "{opponent}... you smell like fear and bad decisions. My two favorite things.",
      "Come here. Let me show you what the mirror's been hiding.",
    ],
    victory: [
      "HA! Did you feel that? Tell me you felt that. I felt EVERYTHING.",
    ],
    defeat: [
      "Oh, that HURT. Do it again — I wanna see if I can break before you do.",
    ],
    backstage: [
      "They ask why I'm like this. Like THIS is a problem. Like the basement wasn't built for a REASON, {opponent}.",
    ],
  },
  sombra_negra: {
    promo: [
      "I don't hate you, {opponent}. You're just the job. Negocios son negocios.",
      "I've studied your best move. It's a good one. Soon it'll be MY favorite weapon. La trampa de plata.",
    ],
    callout: [
      "{opponent}: I've already invoiced this fight. You're just... paperwork now.",
      "Show me your finisher tonight, {opponent}. I collect them.",
    ],
    victory: [
      "Your best move. My favorite weapon. Gracias, {opponent}.",
    ],
    defeat: [
      "A miscalculation. It won't happen twice — I don't do repeats.",
    ],
    weighin: [
      "Look closely, {opponent}. Memorize my face. It's the last professional thing you'll see.",
    ],
  },
  onyx: {
    promo: [
      "Welcome to the show, {opponent}. You're the finale. Smile — it'll be your last good look.",
      "The paint never comes off, baby. And after tonight, neither will the memory of what I do to you at {place}.",
    ],
    callout: [
      "Oh, {opponent} — the big top's been waitin' for a clown like you. Come. Perform for me.",
    ],
    victory: [
      "Curtain. Beautiful. {opponent}, you played your part PERFECTLY.",
    ],
    faction: [
      "The Painted don't ask you to join, darling. We just... paint over what's left.",
    ],
    title: [
      "The crown looks better with a smile painted under it. The show goes on — FOREVER.",
    ],
  },
  toro: {
    promo: [
      "¡El toro no se arrodilla! {opponent}, you face not a man — you face the herd's pride.",
      "Oro en la sangre. Fuego en los cuernos. At {place}, the bull runs THROUGH you.",
    ],
    callout: [
      "{opponent}: I challenge you with honor. Refuse, and keep your cowardice. Accept, and keep your scars.",
    ],
    victory: [
      "¡La faena está completa! The bull stands. As always.",
    ],
    defeat: [
      "A bull falls seven times and rises eight. Count your days, {opponent}.",
    ],
    weighin: [
      "Look into the eyes of the toro, {opponent}. See your ending.",
    ],
  },
  cain: {
    promo: [
      "This is just business, {opponent}. Your file's already closed — tonight we process the termination.",
      "The Combine doesn't send messages. It sends ME. {place} is now a compliance zone.",
    ],
    callout: [
      "{opponent}: you've been flagged as a liability. Restructuring begins tonight.",
    ],
    victory: [
      "Processed. Filed. Next.",
    ],
    defeat: [
      "An anomaly in the quarterly report. It will be corrected.",
    ],
  },
  edwin: {
    promo: [
      "EDWIN... KENNEDY! ...You're welcome, {place}.",
      "{opponent} gets to share a ring with a SUPERSTAR tonight. Tell your grandkids.",
    ],
    callout: [
      "{opponent} — the mic drops itself when I'm done with you. Which will be... soon.",
    ],
    victory: [
      "As expected. As DESERVED. EDWIN... KENNEDY!",
    ],
    defeat: [
      "A fluke. A clerical error. The superstar does NOT lose — the paperwork was wrong.",
    ],
  },
  triplex: {
    promo: [
      "It's not personal, {opponent}. It's just... the game. And I don't play checkers.",
      "You already lost, {opponent}. I'm just letting you finish — it's polite.",
    ],
    callout: [
      "{opponent}: every move you've made brought you here. That was the design.",
    ],
    victory: [
      "Inevitable. As calculated.",
    ],
    title: [
      "The throne was never empty. It was just... waiting for its schedule to clear.",
    ],
  },
  stan: {
    promo: [
      "I've ended tougher, kid. {opponent} — talk's over.",
      "You don't want this smoke. Last chance to walk, {opponent}.",
    ],
    callout: [
      "{opponent}. Old school. One lesson. Free of charge.",
    ],
    victory: [
      "Lesson delivered.",
    ],
    defeat: [
      "...Hm. Kid's got somethin'. I'll give him that. Once.",
    ],
  },
};

/* Fallback banks for fighters without bibles — voiced by archetype, honest. */
const ARCHETYPE_BANKS: Record<string, Bank> = {
  wrestling: {
    promo: ["{opponent} — {place} is MY ring tonight. Come take it.", "I wrestle. I win. Simple math, {opponent}."],
    victory: ["Another one filed under W.", "The ring remembers who owns it."],
    defeat: ["Noted. Next time, different ending."],
  },
  boxing: {
    promo: ["Hands up, {opponent}. These irons don't miss at {place}.", "You got heart? Good. I'm gonna need you to have it — for the highlight reel."],
    victory: ["Iron hands. Told you.", "Count it."],
    defeat: ["Caught one. Won't catch me twice."],
  },
  lucha: {
    promo: ["¡Lucha! At {place}, I fly and {opponent} falls.", "The mask stays on. The legend grows."],
    victory: ["¡Victoria! The high-flyers own the sky."],
    defeat: ["Even eagles land hard sometimes."],
  },
  mma: {
    promo: ["{opponent}: anywhere you go, I follow. Stand-up, ground — pick your poison at {place}.", "No single style. No single answer for me."],
    victory: ["Complete fighter. Complete victory.", "Anywhere the fight goes, I end it."],
    defeat: ["Back to the lab. The lab always answers."],
  },
  striking: {
    promo: ["{opponent}, my range is a no-fly zone. Test it at {place}.", "One clean shot changes everything. I throw clean."],
    victory: ["Range. Timing. Done.", "Clean work."],
    defeat: ["Got inside my range once. Once."],
  },
};

function archetypeFor(martial: string): string {
  if (martial.includes("box")) return "boxing";
  if (martial.includes("lucha")) return "lucha";
  if (martial.includes("mma") || martial.includes("sambo") || martial.includes("catch")) return "mma";
  if (martial.includes("kick") || martial.includes("muay") || martial.includes("savate") || martial.includes("karate") || martial.includes("kenpo") || martial.includes("jeet"))
    return "striking";
  return "wrestling";
}

/**
 * Generate in-character dialogue.
 * - Picks 1–3 lines from the fighter's bank for the situation (opener-heavy).
 * - Falls back: bank missing the situation → bank's promo → archetype bank → generic.
 * - Seeded: same inputs → same output, every time.
 */
export function generateDialogue(
  fighterId: string,
  situation: Situation,
  ctx: DialogueContext = {},
): GeneratedDialogue {
  const seed = ctx.seed ?? hashSeed(`${fighterId}:${situation}:${ctx.opponent ?? ""}:${ctx.place ?? ""}`);
  const rng = mulberry32(seed);
  const fighter = fighterById(fighterId);
  const bible = bibleFor(fighterId);

  let pool: string[] | undefined = BANKS[fighterId]?.[situation];
  if (!pool?.length) pool = BANKS[fighterId]?.promo;
  if (!pool?.length) {
    const arch = ARCHETYPE_BANKS[archetypeFor(fighter.martial)];
    pool = arch[situation] ?? arch.promo ?? ["{opponent} — let's go."];
  }
  const lines = pool as string[];

  const count = lines.length >= 3 ? (rng() < 0.5 ? 2 : 3) : lines.length;
  const picked: string[] = [];
  const idxs = [...lines.keys()];
  for (let i = 0; i < count && idxs.length; i++) {
    const k = Math.floor(rng() * idxs.length);
    picked.push(fill(lines[idxs.splice(k, 1)[0]], ctx));
  }

  return {
    fighterId,
    fighterName: bible?.name ?? fighter.name,
    situation,
    lines: picked,
    seed,
  };
}

/** Batch: a full promo exchange — fighter promo + opponent response. */
export function promoExchange(
  fighterId: string,
  opponentId: string,
  ctx: Omit<DialogueContext, "opponent"> = {},
): { a: GeneratedDialogue; b: GeneratedDialogue } {
  const aName = bibleFor(fighterId)?.name ?? fighterById(fighterId).name;
  const bName = bibleFor(opponentId)?.name ?? fighterById(opponentId).name;
  const seed = ctx.seed ?? hashSeed(`promo:${fighterId}:vs:${opponentId}`);
  return {
    a: generateDialogue(fighterId, "callout", { ...ctx, opponent: bName, seed }),
    b: generateDialogue(opponentId, "callout", { ...ctx, opponent: aName, seed: seed ^ 0x9e37 }),
  };
}

export function hashSeed(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Which situations a fighter has dedicated banks for (for UI/menus). */
export function supportedSituations(fighterId: string): Situation[] {
  const bank = BANKS[fighterId];
  if (!bank) return ["promo", "victory", "defeat"];
  return Object.keys(bank) as Situation[];
}

export { VOICE_BIBLES, type Situation, type VoiceBible };
