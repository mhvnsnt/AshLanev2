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

/* ------------------------------------------------------------------ */
/* STREET BANKS — Urban Reign street life, NOT the wrestling world.      */
/* Turf, parleys, corpo suits, hustles, claims, civilians, loyalty,     */
/* heat. Same voices, different register: the corner, not the ring.     */
/* ------------------------------------------------------------------ */

const STREET_BANKS: Record<string, Bank> = {
  static: {
    confront: [
      "That's funny, man. You really postin' up on THIS corner? My corner? In front of MY people? That's funny.",
      "Listen, I'm a really good guy — but you take my kindness for weakness on this block, I immediately throw hands. That's not a promo, that's policy.",
      "You got two choices: walk, or get walked. And I ain't talkin' about your legs, my guy.",
    ],
    parley: [
      "A'ight, we talkin'. But understand — I talk fast and I hit faster, so say what you came to say.",
      "Parley means nobody bleeds till the talkin's done. AFTER the talkin' — that's a different conversation.",
    ],
    corpo: [
      "A suit? On MY block? That's funny, man. Your money don't spend different here — it just spends quieter.",
      "Tell your employers the block ain't for sale. And tell 'em Static said it slow so they'd understand.",
    ],
    hustle: [
      "The deal's the deal. You short me, you don't get a second invoice — you get a closed casket of a conversation.",
      "Everybody eats on my corner. But everybody PAYS on my corner too. That's the menu, my guy.",
    ],
    claim: [
      "This block? This block's got a name on it now. Mine. How you doin', {place}?",
      "From this corner to that light — that's Static territory. Certified. Bona fide. Try me.",
    ],
    civilian: [
      "Nah nah, you good, you good — this ain't about you. Go on inside, lock up. Business is about to get loud.",
      "Ma'am, I apologize for the language you're about to hear. It's gonna get Jersey in a minute.",
    ],
    loyalty: [
      "The boys who stood with me when I had nothin' — they eat first. Forever. That's the whole code.",
      "You flip on the crew, you don't get a meeting. You get a memory — of the last time you could walk right.",
    ],
    heat: [
      "Officer, Officer — we was just talkin'. Loud talkin'. Jersey talkin'. You know how it is.",
      "Ain't nobody doin' nothin', my guy. Just a community gathering. A LOUD community gathering.",
    ],
  },
  stickup: {
    confront: [
      "{place}. My block. You already know what it is — so why you still standin' here?",
      "The system made me. The streets kept me. You? The streets about to forget you.",
    ],
    parley: [
      "Talk. I'll listen. Then I'll decide. That's the whole meeting.",
      "No long talk. State your terms or state your last words.",
    ],
    claim: [
      "This corner's under new management. The old management is... unavailable.",
      "The Ashes don't ask for blocks. We collect them.",
    ],
    loyalty: [
      "Loyalty ain't a word. It's a record. And I keep records.",
      "You stood with me when the system came callin'? Then you stand WITH me. Forever.",
    ],
    heat: [
      "Officer. We got an understanding, you and me. Let's keep understandin'.",
      "Nothin' to see. Just men standin' on a corner they built.",
    ],
  },
  cipher: {
    confront: [
      "Man of the hour — and the hour says you in the wrong place, baby. Watch me work.",
      "You want the shine? Come take it. Everybody tries. Nobody invoices.",
    ],
    hustle: [
      "The deal's clean, the product's clean, I'M clean — let's keep all three that way, yeah?",
      "I know a guy who knows a guy — and both those guys are me. So let's talk numbers.",
    ],
    claim: [
      "This block just got an upgrade. New management, same shine. You're welcome.",
    ],
  },
  echo: {
    confront: [
      "Ooh, a standoff! I LOVE standoffs. You go first — no wait, I'LL go first. Heheh.",
      "You gonna threaten me? In YOUR voice? Lemme try it back — 'you gonna threaten me?' — see, funnier when I do it.",
    ],
    hustle: [
      "Deal? DEAL! I love deals! What's in the bag — ooh, can I hold it? Can I RIDE it?",
      "You short me and I'll take it out in entertainment. I'm VERY entertaining when I'm mad.",
    ],
    heat: [
      "Officer! Hi! We were just — ooh, is that a real badge? Can I— no? Okay. Heheh.",
    ],
  },
  maime: {
    confront: [
      "You don't know me. You know the version that SURVIVED. The other one's been waitin' on this corner all night.",
      "This block? I don't claim it. I HAUNT it. There's a difference. You'll learn.",
    ],
    claim: [
      "Burn it down and dance in it. That's not a threat, {place} — that's a renovation plan.",
    ],
    heat: [
      "Officer... the badge. The UNIFORM. You look like every rule I ever broke. Come here.",
    ],
  },
  sombra_negra: {
    parley: [
      "State your terms. I bill by the minute, and you're already invoiced.",
      "Negocios son negocios. Talk — but understand I've already read the ending.",
    ],
    corpo: [
      "Your employers pay well. I know — I've cashed their checks. The question is whether you're worth the retainer.",
      "A suit with a proposition. How... professional. Name the target. Name the price. Then leave.",
    ],
    hustle: [
      "The deal is simple: you pay, I deliver, nobody remembers. Complicate it and I deliver something else.",
    ],
    claim: [
      "This territory has a new manager. Me. The transition will be quiet — if you're smart.",
    ],
  },
  onyx: {
    claim: [
      "Darling, this block just joined the show. The paint's already dry — you're just now noticing.",
      "The Painted don't ask for corners. We decorate them. You're standing in our gallery.",
    ],
    parley: [
      "Oh, a negotiation! How civilized. Sit, darling — let's discuss the terms of your surrender.",
      "You bring numbers. I bring the Painted. Let's see whose math is prettier.",
    ],
    loyalty: [
      "My painted ones eat first, laugh loudest, and never — NEVER — wash off. Betray that and the show closes. Permanently.",
    ],
  },
  toro: {
    confront: [
      "¡El toro no se arrodilla! Not in the ring, not on your corner. State your grievance with honor or leave it.",
      "You threaten shopkeepers and children? Then you face the horns. That is the whole negotiation.",
    ],
    civilian: [
      "Señora, vaya adentro. The bull handles the wolves — you handle the door. Lock it, por favor.",
      "Child, stand behind me. What comes next is not for young eyes — but it is for your safety.",
    ],
  },
  cain: {
    corpo: [
      "Your division's quarterly numbers are... concerning. I'm here to restructure the block. Starting with you.",
      "The Combine has reviewed your operation. Findings: liabilities. Recommendation: me.",
    ],
    heat: [
      "Officer. My paperwork is in order — is yours? I'd hate to file a complaint about the complaint.",
      "We're both in enforcement, you and I. The difference is my jurisdiction is... broader.",
    ],
    claim: [
      "Effective immediately, this block is a compliance zone. Tribute schedules will be posted. Non-compliance will be processed.",
    ],
  },
  edwin: {
    corpo: [
      "EDWIN... KENNEDY! ...What, you don't do entrances on the street? You're missing out, my guy.",
      "The Combine backs me — real money, real suits. You want in on the superstar's block? There's a fee. There's always a fee.",
    ],
    parley: [
      "Let's negotiate — and by negotiate I mean you listen while I explain why I'm right. It's faster.",
    ],
  },
  triplex: {
    corpo: [
      "Your employers sent you to negotiate. I've already read their offer. It's... quaint.",
      "Sit. The game is already in motion — you're just now noticing the board.",
    ],
    parley: [
      "Every move you've made brought you here. That was the design. Now — your terms, so I can decline them properly.",
      "It's not personal. It's just... the game. And you are several moves behind.",
    ],
    claim: [
      "This territory was mine before you arrived. You simply hadn't been informed. Consider yourself informed.",
    ],
  },
  stan: {
    confront: [
      "Kid. I've ended tougher on this exact corner. Walk.",
      "You don't want this smoke. Not here, not where your grandmother shops. Last chance.",
    ],
    loyalty: [
      "I taught half this block how to stand. You don't turn on family — and out here, the block IS family.",
      "Loyalty's earned in years and lost in seconds. I've got years on all of you. Act accordingly.",
    ],
    heat: [
      "Evening, officer. These kids are with me. No trouble — just old men rememberin' when this corner was ours too.",
    ],
  },
  /* --- street archetypes: full banks, they're street-native --- */
  __lieutenant: {
    confront: [
      "You standin' where? Say it again, slower — I want the runners to hear this.",
      "This is a taxed block. You ain't paid. So either pay or bleed — the crew accepts both.",
    ],
    parley: [
      "Talk. You got till my coffee's done. After that, the crew decides — and the crew's already decided.",
      "Parley means words first. It don't mean words ONLY. Choose 'em good.",
    ],
    claim: [
      "New management. Same tax, new collector. The block eats because I say so — and the block WILL eat.",
      "From the bodega to the laundromat — that's the set now. Boundaries are painted. Cross 'em and get erased.",
    ],
    loyalty: [
      "The crew feeds who the crew trusts. You proved trust? Then you eat. You break it? Then you're the meal.",
      "Runners talk. I listen. Somebody in my set's been talkin' to the wrong people — and runners just told me who.",
    ],
    heat: [
      "Officer. Quiet night, right? Let's keep it a quiet night. The block likes quiet. I like quiet.",
    ],
  },
  __fixer: {
    corpo: [
      "My employers admire your... operation. They'd like to discuss an arrangement. Over coffee. Somewhere without cameras.",
      "Everyone has a price. I've never met the exception — but I've met people who needed... convincing about theirs.",
    ],
    parley: [
      "Let's keep this civilized. I have a final offer, a pen, and — regrettably — an alternative. The pen is faster.",
      "This conversation didn't happen. But the arrangement we're about to make? That happens.",
    ],
    hustle: [
      "The deal on the table is generous. The deal OFF the table involves people you don't want to meet. Choose the table.",
    ],
    heat: [
      "Officer — a word? My employers contribute a great deal to the precinct's... community programs. I'm sure we can keep this cordial.",
    ],
  },
  __hustler: {
    hustle: [
      "Yo, I got you, I got you — pure, clean, best on the block. And if anybody asks — you didn't see me, I wasn't here.",
      "Look, look, look — the plug's dry, the pack's light, but I know a guy. I ALWAYS know a guy.",
    ],
    confront: [
      "Whoa whoa whoa — no beef, no beef! I'm just the messenger, baby! You want the guy BEHIND the guy — I can find him!",
      "I don't want problems! I got product, I got info, I got ANYTHING you need — just don't make me a problem!",
    ],
    heat: [
      "Officer! Just walkin', just walkin' — exercise! Doctor's orders! You want my pedometer?",
      "I seen nothin', I know nothin', I'm nothin' — I'm a ghost, baby, a GHOST.",
    ],
    civilian: [
      "Miss, miss — you drop somethin'? No? A'ight, a'ight — but if you ever need ANYTHING... anything at all... I'm everybody's guy.",
    ],
  },
  __cop: {
    heat: [
      "Curfew's in ten. I suggest you find somewhere to be that isn't HERE.",
      "I've seen how this ends — every time, same ending, different kids. Go home. All of you.",
      "Don't make me do paperwork. You do NOT want to see me do paperwork.",
    ],
    confront: [
      "Break it up. NOW. I don't care who started it — I care who finishes it, and that's gonna be ME with the cuffs.",
      "This block's got enough ghosts. Don't make me add to the collection.",
    ],
    civilian: [
      "Ma'am, get inside. Lock the door. Whatever's about to happen out here, you don't need to see it.",
      "Sir — take the kids in. I'll handle the corner. That's what the badge is for.",
    ],
  },
};

/* Fallback banks for fighters without bibles — voiced by archetype, honest. */
const ARCHETYPE_BANKS: Record<string, Bank> = {
  wrestling: {
    promo: ["{opponent} — {place} is MY ring tonight. Come take it.", "I wrestle. I win. Simple math, {opponent}."],
    victory: ["Another one filed under W.", "The ring remembers who owns it."],
    defeat: ["Noted. Next time, different ending."],
    confront: ["{place} ain't big enough for both of us. Back up.", "You want the block? Come take it — same as the ring."],
    parley: ["Talk. But the talkin' ends when I say it ends."],
    claim: ["This corner's mine now. The ring was just practice."],
    heat: ["We was just leavin', officer. Just... leavin'."],
  },
  boxing: {
    promo: ["Hands up, {opponent}. These irons don't miss at {place}.", "You got heart? Good. I'm gonna need you to have it — for the highlight reel."],
    victory: ["Iron hands. Told you.", "Count it."],
    defeat: ["Caught one. Won't catch me twice."],
    confront: ["These hands don't care about the venue, {opponent}. Corner, ring — same result."],
    parley: ["Say your piece. Then we see if your jaw's as good as your mouth."],
    claim: ["New management on this block. The management hits back."],
    heat: ["No trouble, officer. Just two athletes... discussin'."],
  },
  lucha: {
    promo: ["¡Lucha! At {place}, I fly and {opponent} falls.", "The mask stays on. The legend grows."],
    victory: ["¡Victoria! The high-flyers own the sky."],
    defeat: ["Even eagles land hard sometimes."],
    confront: ["¡El honor no conoce esquinas! You want this block? ¡Ven y tómalo!"],
    parley: ["Speak with honor or don't speak. The mask listens."],
    claim: ["This block flies under MY colors now. ¡Arriba!"],
    heat: ["Officer — the people love a show. No show tonight. Just... walking."],
  },
  mma: {
    promo: ["{opponent}: anywhere you go, I follow. Stand-up, ground — pick your poison at {place}.", "No single style. No single answer for me."],
    victory: ["Complete fighter. Complete victory.", "Anywhere the fight goes, I end it."],
    defeat: ["Back to the lab. The lab always answers."],
    confront: ["Anywhere you go, I follow — corner, cage, doesn't matter."],
    parley: ["Terms. Now. I don't negotiate twice."],
    claim: ["Complete fighter, complete block. It's mine."],
    heat: ["We're trainin', officer. Street conditioning. Very... legal."],
  },
  striking: {
    promo: ["{opponent}, my range is a no-fly zone. Test it at {place}.", "One clean shot changes everything. I throw clean."],
    victory: ["Range. Timing. Done.", "Clean work."],
    defeat: ["Got inside my range once. Once."],
    confront: ["My range is a no-fly zone — and this whole corner is my range."],
    parley: ["One clean conversation. Then we see."],
    claim: ["Range. Timing. Territory. Done."],
    heat: ["Just stretchin', officer. Range work."],
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

  // Wrestling banks first, then street banks (corner register), then promo
  // fallback, then honest archetype fallback. Wrestling dialogue stays in
  // wrestling contexts; street dialogue lives in the street — never mixed.
  let pool: string[] | undefined = BANKS[fighterId]?.[situation];
  if (!pool?.length) pool = STREET_BANKS[fighterId]?.[situation];
  if (!pool?.length) pool = BANKS[fighterId]?.promo;
  if (!pool?.length) pool = STREET_BANKS[fighterId]?.confront;
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
  const sbank = STREET_BANKS[fighterId];
  if (!bank && !sbank) return ["promo", "victory", "defeat"];
  return [...new Set([...Object.keys(bank ?? {}), ...Object.keys(sbank ?? {})])] as Situation[];
}

export { VOICE_BIBLES, type Situation, type VoiceBible };
