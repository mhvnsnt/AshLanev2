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
      "El Cuerno Dorado has ended careers. El Grito de la Bestia has ended ERAS. {opponent} — choose which one you want to be remembered by.",
      "The mask doesn't come off. The honor doesn't bend. The bull doesn't LOSE.",
      "¡El toro no se arrodilla! {opponent}, you face not a man — you face the herd's pride.",
      "Oro en la sangre. Fuego en los cuernos. At {place}, the bull runs THROUGH you.",
    ],
    callout: [
      "{opponent}: the plaza, the people, the pride. Bring your best — the bull eats BESTS.",
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
      "You call this a RIVALRY? I've read the classics, my guy — this isn't a rivalry, it's a TRAGEDY. And you're not the hero. You're the WARNING.",
      "They'll write about this one. They always do. The only question is whether you're the triumph or the FOOTNOTE.",
      "My legacy isn't built on matches — it's built on ERASURES. You're next on the syllabus.",
      "EDWIN... KENNEDY! ...You're welcome, {place}.",
      "{opponent} gets to share a ring with a SUPERSTAR tonight. Tell your grandkids.",
    ],
    callout: [
      "{opponent} — I've studied your career the way historians study RUINS. Thoroughly. And with pity.",
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
      "I've restored watches worth more than your career. Precision, patience, pressure — that's how you take apart a MAN.",
      "The Cyborg Project taught me: everything breaks on schedule. Your schedule just came up.",
      "I've ended tougher, kid. {opponent} — talk's over.",
      "You don't want this smoke. Last chance to walk, {opponent}.",
    ],
    callout: [
      "{opponent} — you're not an opponent. You're an ASSET. And assets get... liquidated.",
      "{opponent}. Old school. One lesson. Free of charge.",
    ],
    victory: [
      "Lesson delivered.",
    ],
    defeat: [
      "...Hm. Kid's got somethin'. I'll give him that. Once.",
    ],
  },
  hollow: {
    promo: [
      "The general doesn't do introductions. Onyx sends her regards — I'M the regards. Heh.",
      "{opponent}... you look nervous. Good. Stay nervous. It makes the painting EASIER.",
      "Empty versus hollow — heh — {place} is about to find out the difference. It's PAIN.",
    ],
    callout: [
      "{opponent}: the Painted have a wall with your name on it. Come. Get PAINTED.",
      "You want the general? Heh... the general's RIGHT HERE. Swaying. Waiting.",
    ],
    victory: [
      "Painted. General's orders. Heh.",
      "Onyx will hear about this one. She likes the MESSY ones. Heh heh.",
    ],
    defeat: [
      "...Heh. The general... miscalculated. It happens. ONCE.",
      "Empty... heh... the tank's EMPTY. But the ORANGE remains. Rematch. Soon.",
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
      "This ain't a negotiation, my guy — this is a MAIN EVENT and you're the opening match. You feel me?",
      "You stepped to the wrong corner. This corner's got a champion and a crowd. You're about to be a highlight.",
      "I'ma say this once, slow, so the cheap seats hear it: this block is TAKEN. Certified. Bona fide. Walk.",
      "You want smoke? I got a whole arena of it. But this corner? This corner's MY ring. And you ain't booked.",
      "Funny thing about corners — everybody wants to stand on one till somebody who OWNS one shows up. Hi. I'm somebody.",
    ],
    parley: [
      "A'ight, we talkin'. But understand — I talk fast and I hit faster, so say what you came to say.",
      "Parley means nobody bleeds till the talkin's done. AFTER the talkin' — that's a different conversation.",
      "We can do this the easy way or the Jersey way. The Jersey way's faster and I talk slower after.",
      "Sit down. Talk straight. And understand — I'm listenin' for the lie the way a ref listens for the bell.",
      "Parley's a courtesy, not a contract. Don't confuse the two, my guy.",
      "Say your piece. But if your piece wastes my time, your time's about to get real short.",
    ],
    corpo: [
      "A suit? On MY block? That's funny, man. Your money don't spend different here — it just spends quieter.",
      "Tell your employers the block ain't for sale. And tell 'em Static said it slow so they'd understand.",
      "Your boss wants to buy the block? Tell him the block's got an owner, a mortgage of BLOOD, and it ain't listed.",
      "I don't do boardrooms, my guy. I do corners. You want to negotiate, negotiate with the concrete.",
      "That suit cost more than this whole block makes in a month. And you STILL gotta ask permission to stand on it.",
    ],
    hustle: [
      "The deal's the deal. You short me, you don't get a second invoice — you get a closed casket of a conversation.",
      "Everybody eats on my corner. But everybody PAYS on my corner too. That's the menu, my guy.",
      "The product's good, the price is firm, and my patience is a limited-time offer. Buy or bounce.",
      "You count it twice, I count it once — because I TRUST my count. Don't make me recount with my hands.",
      "This ain't a flea market, my guy. The sticker price is the sticker price. The alternative is the emergency room price.",
      "Everybody on this corner eats because everybody on this corner PLAYS FAIR. You want to be the exception? Be the example.",
    ],
    claim: [
      "This block? This block's got a name on it now. Mine. How you doin', {place}?",
      "From this corner to that light — that's Static territory. Certified. Bona fide. Try me.",
      "New rule on {place}: what Static says, goes. What Static sees, keeps. What Static takes — stays took.",
      "I didn't come to ask, my guy. I came to ANNOUNCE. This block's got new management and the management is LOUD.",
      "From the bodega to the bus stop — that's mine now. You want to dispute it, dispute it with these hands.",
      "They'll tell stories about the night the corner changed hands. Make sure you're not the punchline.",
      "Certified. Bona fide. This block's got a new landlord and the rent is RESPECT.",
    ],
    civilian: [
      "Nah nah, you good, you good — this ain't about you. Go on inside, lock up. Business is about to get loud.",
      "Ma'am, I apologize for the language you're about to hear. It's gonna get Jersey in a minute.",
      "Sir, keep walkin', keep your head down — the block's about to have a conversation you don't want to overhear.",
      "Kid — KID. Go home. This ain't a show, there's no tickets, and the front row is a bad idea.",
      "You own the shop? Then you got NOTHIN' to worry about. We protect our own. You're our own.",
    ],
    loyalty: [
      "The boys who stood with me when I had nothin' — they eat first. Forever. That's the whole code.",
      "You flip on the crew, you don't get a meeting. You get a memory — of the last time you could walk right.",
      "The crew's a family, my guy — and in this family, we don't do reunions with rats.",
      "You ate at my table, you bleed for my table. That's the whole contract. No fine print.",
      "Loyalty's not a tattoo, it's a RECEIPT. Show me yours.",
      "I remember who was here when the lights were off. The lights are ON now. Where you standin'?",
      "Flip once, shame on you. Flip twice — there ain't no twice. There never was.",
    ],
    heat: [
      "Officer, Officer — we was just talkin'. Loud talkin'. Jersey talkin'. You know how it is.",
      "Ain't nobody doin' nothin', my guy. Just a community gathering. A LOUD community gathering.",
      "Officer, we're just — we're CELEBRATIN', my guy. Community event. Very loud community.",
      "Badges? On MY block? That's funny. You want a permit for this gathering? I'll get you a permit.",
      "Nobody's armed, nobody's dangerous, everybody's just... passionately conversatin'. Jersey style.",
      "You got a warrant for loud talkin'? Didn't think so. Have a good night, officer.",
    ],
    shakedown: [
      "Rent's due, my guy. And on this block, I'm the landlord, the super, AND the eviction notice.",
      "The envelope. Thick. On time. Every week. That's the whole lease agreement.",
      "You want protection? You GOT protection — it's me, standin' here, not breakin' your windows. Let's keep it that way.",
      "This ain't extortion, it's COMMUNITY DUES. Everybody pays. Everybody stays open. Everybody wins.",
      "Short me once, I remind you. Short me twice — there is no twice. Ask the last guy. Oh wait.",
    ],
    recruit: [
      "You got heart, kid. Heart's good. Heart plus MY corner? That's a career.",
      "I'm not askin' you to join a gang, I'm askin' you to join a FAMILY. The family's just... heavily armed with ambition.",
      "You want in? First lesson: the block provides. Second lesson: the block REMEMBERS. You good with both?",
      "Everybody starts runnin'. The smart ones end up OWNIN'. Which one are you?",
      "I see you watchin' the corner like you want it. Want it? EARN it. Start tonight.",
    ],
    informant: [
      "Information's a currency, my guy — and you're either rich or you're lyin'. Which is it?",
      "You heard somethin'? Then TALK. But if what you heard wastes my time, I'ma bill you for the minutes.",
      "A little bird told you? I don't do birds. I do RECEIPTS. Bring me somethin' I can use.",
      "Snitches get stitches — but SOURCES get paid. You a snitch or a source? Choose fast.",
    ],
    mourning: [
      "We lost one of ours. So tonight the block goes quiet — and tomorrow, somebody pays for the noise.",
      "He was block. He was FAMILY. You don't get over that, you get EVEN. When it's time.",
      "Pour one out. Say his name. And remember — the corner he stood on is STILL OURS.",
      "Grief's a luxury, my guy — we grieve fast and we remember forever. He'd want it that way.",
    ],
  },
  stickup: {
    confront: [
      "I have stared into the face of death — SEVEN TIMES — and the Lord used that chaos to forge me! You think YOU forge fear in ME?",
      "He wants a bridge back to safety! But I tell you, I AM the bridge — and the toll is PAID IN FULL.",
      "{place}. My block. You already know what it is — so why you still standin' here?",
      "The system made me. The streets kept me. You? The streets about to forget you.",
      "You got five seconds to explain why you're breathin' my air. Four. Three—",
      "The Ashes don't do warnings. We do CONSEQUENCES. You're lookin' at one.",
      "This corner raised me. You? You're just visitin'. And visitin' hours are OVER.",
      "I beat the system. You think YOU scare me? On MY block?",
    ],
    parley: [
      "The so-called peacemakers! They preach of deals and truces! But I say to you — a deal without HONOR is the Devil's first, most seductive lie!",
      "'My thoughts are not your thoughts' — Isaiah 55:8. Your terms are YOUR thoughts. My corner runs on HIGHER thoughts. Adjust.",
      "Talk. I'll listen. Then I'll decide. That's the whole meeting.",
      "No long talk. State your terms or state your last words.",
      "You got till my patience runs out. It's runnin'.",
      "Terms. Real ones. Not the kind you tell yourself in the mirror.",
      "We talk now so we don't bleed later. Your call which one's cheaper.",
    ],
    hustle: [
      "The product is BLESSED, my guy — no, don't laugh. Everything I touch is... inventory. Sanctified inventory.",
      "Count it. The Lord loves a cheerful giver — and I love a PRECISE counter.",
      "The package is what I said it is. The price is what I said it is. The only variable here is YOUR manners.",
      "You want to renegotiate? Renegotiate with the door. It's closer and it hits back less.",
      "Count it. Take it. And understand — the Ashes remember every serial number.",
      "Clean deal, dirty world. Don't mix the two.",
      "I don't do discounts and I don't do drama. Pick one to not do either.",
    ],
    claim: [
      "I am the only way out of the pit of your doubt — and this block? This block just found its WAY OUT. Through ME.",
      "This corner's under new management. The old management is... unavailable.",
      "The Ashes don't ask for blocks. We collect them.",
      "The Ashes plant flags. This one's ours. Water it with respect or watch it burn.",
      "{place} — new colors. Ours. The transition's already over; you just now noticed.",
      "Corners are like promises: easy to make, hard to keep. We keep ours.",
    ],
    civilian: [
      "Head inside. Lock the door. Whatever you hear — it wasn't us, and you didn't see nothin'.",
      "Your shop stays open. Your windows stay whole. That's the Ashes' guarantee. We keep our guarantees.",
      "Kid's got school in the morning? Then let's make sure the street's quiet by ten. OUR quiet.",
      "You been here twenty years? Then you know the drill. Inside. Now.",
    ],
    loyalty: [
      "The Lord made me a vessel — and vessels don't LEAK. You leak, you're not a vessel. You're a PUDDLE.",
      "I am the bridge! The only way out of the pit! You cross with me or you stay IN the pit. Choose.",
      "Loyalty ain't a word. It's a record. And I keep records.",
      "You stood with me when the system came callin'? Then you stand WITH me. Forever.",
      "The system tried to break me. The streets made me. The crew KEEPS me. In that order.",
      "You ride with the Ashes, the Ashes ride with you. That's not a slogan, that's a RECORD.",
      "Betrayal's a debt. And I'm EXCELLENT at collections.",
    ],
    heat: [
      "Officer! The Lord watches over this corner — and so do I! We're... co-watchmen! Very legal!",
      "Seven times I've stared down death, officer — your handcuffs are just... jewelry. Shiny, but jewelry.",
      "Officer. We got an understanding, you and me. Let's keep understandin'.",
      "Nothin' to see. Just men standin' on a corner they built.",
      "Officer. Same corner, same me, same nothin'-to-see. We good?",
      "We're just... congregatin'. Constitutionally. Loudly.",
      "You want the block quiet? So do we. Give us ten minutes and it'll be library-quiet.",
    ],
    shakedown: [
      "The church needs TITHES, my guy — and this block is my CONGREGATION. Pay up. Hallelujah.",
      "Sacrificing the structure of the wicked — that's what the envelope PREVENTS. You're welcome. Pay.",
      "The Ashes provide security. Security costs. You're lookin' at the invoice.",
      "Every Friday. Same envelope. Don't make me come back on a Saturday — Saturdays I'm less polite.",
      "This ain't a shakedown, it's a SUBSCRIPTION. Premium tier. Includes: your windows, unbroken.",
      "Pay the tax or pay the price. The tax is cheaper. The tax is ALWAYS cheaper.",
      "You eat because this block is safe. This block is safe because of US. Do the math.",
    ],
    recruit: [
      "The chaos you see in my life — that is not sloppy, it is DIVINE WILL! The Lord made me a vessel — you want to be a vessel too? Then FOLLOW.",
      "You want to be somebody? The Ashes make somebodies. But first you gotta be NOBODY for a while.",
      "I see the hunger. Hunger's good. Hunger plus discipline? That's a SOLDIER.",
      "The system threw me away. The streets picked me up. Which one are you waitin' on?",
      "Prove you can take orders before you dream about givin' 'em.",
    ],
    mourning: [
      "We lost a soldier. The Lord giveth, the street taketh away — and the street's about to GIVE BACK. With interest.",
      "He stared down death with me. Now he's... with the Lord. The LEAP OF FAITH finally landed.",
      "We lost a soldier. The block flies low tonight. Tomorrow we fly AT somebody.",
      "He stood on this corner. This corner stands for HIM now.",
      "No tears on the block. We save those for the people who did it — right before.",
      "Rest easy. We got the watch from here.",
    ],
  },
  cipher: {
    confront: [
      "Man of the hour — and the hour says you in the wrong place, baby. Watch me work.",
      "You want the shine? Come take it. Everybody tries. Nobody invoices.",
      "The hour is MINE, baby — and right now the hour says you're TRESPASSIN' on primetime.",
      "You want to dance with the man of the hour? The cover charge is your confidence.",
      "This is my spotlight, my block, my CLOSE-UP. You're blockin' the camera, baby.",
      "I've main-evented bigger corners than this. You're the pre-show.",
    ],
    parley: [
      "Talk to me. But make it INTERESTING — I get bored, and bored Cipher is DANGEROUS Cipher.",
      "Negotiation? Baby, I negotiate with the MIRROR every morning and WIN. Your turn.",
      "State your terms. I'll state mine LOUDER. That's just how I talk.",
      "We can deal — but the deal's got to SHINE. I don't do dull.",
    ],
    hustle: [
      "The deal's clean, the product's clean, I'M clean — let's keep all three that way, yeah?",
      "I know a guy who knows a guy — and both those guys are me. So let's talk numbers.",
      "The numbers are the numbers, baby — and my numbers are ALWAYS up. Don't argue with arithmetic.",
      "You want a discount? The discount is you get to do business with ME. That's the deal.",
      "Product's premium, price is premium, I'M premium. It's a theme.",
    ],
    claim: [
      "This block just got an upgrade. New management, same shine. You're welcome.",
      "This block just got BOOKED, baby — main event, every night, starring ME.",
      "{place}? More like CIPHER'S place. The sign's already up. You're just illiterate.",
      "New era on this corner. The Cipher Era. It shines. You're welcome.",
    ],
    heat: [
      "Officer! The man of the hour, in the flesh! We were just... rehearsing. Very loudly.",
      "No trouble here — just a PUBLIC APPEARANCE. The public loves me. Ask anybody.",
      "Badge? Baby, I've got FANS with badges. We're all friends here.",
      "We're leavin', we're leavin' — but the people DEMANDED an encore.",
    ],
    shakedown: [
      "The shine costs money, baby — and you're lookin' at the bill. Pay up, stay pretty.",
      "Everybody who glows under my spotlight pays for the electricity. That's you. Pay.",
      "This ain't a tax, it's a FAN CLUB fee. Membership includes: your shop, intact.",
      "The envelope, baby. Make it FAT. The hour demands it.",
    ],
    recruit: [
      "You want to shine? Stick with me, baby — I SWEAT charisma. Some of it'll rub off.",
      "I'm buildin' a roster. You could be on it. Or you could be in the CROWD. Choose.",
      "The man of the hour needs men OF the hour. You got the look. Show me the heart.",
      "First you're a fan. Then you're family. Then you're FAMOUS. That's the pipeline.",
    ],
    informant: [
      "You got tea, baby? SPILL it. I pay for premium gossip — and I gossip PREMIUM.",
      "Information's the real currency and I'm RICH, baby. Make me richer.",
      "Who told you? WHAT told you? Details, baby — the devil AND the dollars are in 'em.",
    ],
  },
  echo: {
    confront: [
      "Ooh, a standoff! I LOVE standoffs. You go first — no wait, I'LL go first. Heheh.",
      "You gonna threaten me? In YOUR voice? Lemme try it back — 'you gonna threaten me?' — see, funnier when I do it.",
      "Ooh ooh — is this the part where we FIGHT? I call dibs on the dramatic entrance!",
      "You brought friends? I brought ME. That's... that's actually way worse for you. Heheh.",
      "Threaten me again — no wait, do the VOICE again, I wanna get the impression right. 'I'm gonna—' heheh.",
      "This corner's MINE now. I licked it. That's the rule. You can't un-lick a corner.",
    ],
    hustle: [
      "Deal? DEAL! I love deals! What's in the bag — ooh, can I hold it? Can I RIDE it?",
      "You short me and I'll take it out in entertainment. I'm VERY entertaining when I'm mad.",
      "The bag! THE BAG! Okay okay — count it, take it, and NOBODY dies. That's my favorite kind of deal!",
      "You want to haggle? I haggle with my FISTS. They're very persuasive. Heheh.",
      "Deal's a deal! Unless it's a BETTER deal! Is it a better deal? TELL ME.",
    ],
    claim: [
      "{place} is MINE now! I'm gonna paint it... with CHAOS! And maybe actual paint! Heheh!",
      "New management! That's me! I'm management! First rule: MORE FUN. Second rule: see rule one!",
      "This block just got ECHO'D. That's a thing now. I decided.",
      "I claimed it, I named it, I already forgot the name — but it's MINE.",
    ],
    civilian: [
      "Hiiii! Don't mind us — we're just having a LOUD disagreement! Go back to your... groceries! Heheh!",
      "Sir! SIR! Cover your ears — it's about to get SPICY out here!",
      "You! Kid! Best seat in the house is INSIDE your house! GO!",
    ],
    heat: [
      "Officer! Hi! We were just — ooh, is that a real badge? Can I— no? Okay. Heheh.",
      "Officers! PLURAL! Is this a RAID or a FAN MEETUP? Either way — HI!",
      "We were JUST leaving! Like, RIGHT now! Watch — feet, moving, leaving! Heheh!",
      "No no, the sirens are just our EXIT MUSIC. Every show needs exit music!",
    ],
    shakedown: [
      "Rent time! PAY UP! ...please? The block needs your money! For... block stuff! Heheh!",
      "The envelope! Gimme! I mean — the block respectfully REQUESTS! Heheh.",
      "You pay, we stay, everybody plays! That's the... the thing! The saying!",
      "Protection money! It's like a subscription! But for NOT getting your windows broken! FUN!",
    ],
    mourning: [
      "He's gone? ...Oh. Oh no. Heheh — that's not funny. That's not funny at all.",
      "We don't laugh tonight. The block's quiet. For HIM.",
      "He was my FAVORITE audience. Now who's gonna laugh at my impressions? ...I'll do his laugh. Forever.",
      "Rest easy. And when we find who did it — I'm NOT gonna be funny about it.",
    ],
  },
  maime: {
    confront: [
      "There is no return. There is only Bannon. And Bannon is CONTROL — and this corner? This corner is BANNON'S.",
      "Your mommy can't save you! Nobody saves us! You have to feel the pain, you have to CONFESS!",
      "They took your voice, your name — the street took MINE. So I took the STREET.",
      "You don't know me. You know the version that SURVIVED. The other one's been waitin' on this corner all night.",
      "This block? I don't claim it. I HAUNT it. There's a difference. You'll learn.",
      "The other one's been waitin' — the one that don't TALK, just collects. You woke him.",
      "I used to be Marquis. Then the basement taught me better. Now I'm the LESSON.",
      "You smell like fear and cheap cologne. The fear I'll keep. The cologne — burn it.",
      "This corner ain't claimed, it's CURSED. And I'm the curse with legs.",
    ],
    hustle: [
      "The deal... the deal's FINE. But you're sloppy! That's how they take everything! Count it AGAIN. Perfectly.",
      "Weak. So soft. They lied to you about the price. The REAL price is... this.",
      "The deal? THE DEAL? The other one handles deals. I handle... consequences. Which do you want?",
      "Count it fast. My patience has TEETH and it's been a long night.",
      "You short me, I don't call the cops. I BECOME the thing cops warn about.",
      "Product, price, pain — pick two. The third picks YOU.",
    ],
    claim: [
      "This block? The mask is the new skin of {place}. It's the only skin they can't steal.",
      "I don't claim blocks. I HAUNT them. {place} is haunted now. Boo.",
      "Burn it down and dance in it. That's not a threat, {place} — that's a renovation plan.",
      "This block's got a new ghost. ME. Boo.",
      "{place} — I'm not claimin' it, I'm INFECTIN' it. There's a difference. You'll feel it.",
      "Every corner needs a monster. Congratulations — you found yours.",
    ],
    civilian: [
      "Run, lady. RUN. The nice one's counting your change and I'm counting your TEETH.",
      "Kid — KID. The street's about to get ME. And I'm already HERE.",
      "Run. RUN. The nice one's asleep and I'm AWAKE.",
      "Lady — LADY. Inside. NOW. The street's about to get... me.",
      "Kid, you don't want to meet me. Nobody wants to meet me. That's the POINT. Go home.",
      "Shhh... quiet now. The loud part's coming, and you don't want front-row.",
    ],
    loyalty: [
      "I built relationships! I built loyalty! I gave my freedom for partners who wouldn't even give a STATEMENT!",
      "There is no Justice. There is only Consequence. You want justice? The line's that way. You want CONSEQUENCE? Stay.",
      "Marquis had friends. I have WITNESSES. You want to be a friend or a witness?",
      "Loyalty? The other one believes in loyalty. I believe in LEFTOVERS. Don't be leftovers.",
      "You stood by HIM when he was weak. Now he's STRONG. Funny how that works. Stay.",
      "Betray us and I'll introduce you to the basement. The basement introduces itself... permanently.",
    ],
    heat: [
      "Officer... you want to take me in? TAKE ME. The basement's been waiting for company.",
      "Arrest me? The paperwork would need THERAPY. The cells would need EXORCISMS.",
      "Officer... the badge. The UNIFORM. You look like every rule I ever broke. Come here.",
      "Officer... the UNIFORM. Shiny. Official. You look like RULES. I EAT rules.",
      "Arrest me? ARREST ME? The paperwork alone would need THERAPY.",
      "I'm not resisting, I'm... EXISTING. Aggressively. At 3AM. On your corner.",
      "Cuffs? CUTE. The other one wore cuffs once. Then he didn't. Then the cuffs... disappeared.",
    ],
    informant: [
      "Control? You only control the ones who haven't hurt you yet. TALK — before you hurt me.",
      "You HEARD something? Whisper it. The dark likes whispers. So do I.",
      "Information... tasty. Give it. And if it's stale, I'll know — I can SMELL stale.",
      "Who told you? Tell ME. The basement has... questions. Just questions. Mostly.",
    ],
    mourning: [
      "They took him. They take EVERYTHING. There is no return — there is only... remembering. And Bannon. And Bannon is Control.",
      "He's GONE? ...The other one's crying. I'm not. I'm just... rearranging the furniture. With faces.",
      "The block lost one. The basement gained one. We'll visit. OFTEN.",
      "Pour one out. Then pour BLOOD out. Somebody's paying for the empty chair.",
      "Grief? No. HUNGER. Somebody made this block hungry, and hunger's got TEETH.",
    ],
  },
  sombra_negra: {
    confront: [
      "You've made an error in judgment. I'm the correction.",
      "La trampa ya está puesta. The trap is already set — you're standing in it.",
      "I don't do standoffs. I do conclusions. This is yours.",
      "Walk away and this never happened. Stay, and it happens PERMANENTLY.",
      "You have ten seconds. I've already counted them.",
    ],
    parley: [
      "Talk? TALK? The nice ones talk. Then they EXPOSE you. Then they take your work. So talk FAST.",
      "He's lying! Partnership is a lie! He wants to control me too! ...What were we discussing?",
      "The Combine pays better than the street. I've done the math — I ALWAYS do the math. Consider... an upgrade.",
      "You fight for corners. I fight for CONTRACTS. One of us is thinking bigger. It's me. Join the bigger thinking.",
      "State your terms. I bill by the minute, and you're already invoiced.",
      "Negocios son negocios. Talk — but understand I've already read the ending.",
      "Speak quickly. My rate just went up.",
      "I'll listen. Listening is free. Everything after costs.",
      "Terms, then silence. I prefer the silence.",
    ],
    corpo: [
      "Your employers pay well. I know — I've cashed their checks. The question is whether you're worth the retainer.",
      "A suit with a proposition. How... professional. Name the target. Name the price. Then leave.",
      "Your board wants deniability. I AM deniability. The invoice reflects that.",
      "I've worked for your competitors. They're all equally... temporary.",
      "Name the problem. I'll make it a RUMOR. Rumors don't testify.",
    ],
    hustle: [
      "The merchandise is premium. The price is firm. My reputation is... non-negotiable.",
      "You want a sample? The sample is my RESUME. Read it. Then pay.",
      "The deal is simple: you pay, I deliver, nobody remembers. Complicate it and I deliver something else.",
      "The exchange happens once. Clean. Anyone improvises, I invoice the funeral.",
      "You bring the money. I bring the merchandise. We both leave with what we came for — breathing.",
      "No names. No faces remembered. No second meeting unless I arrange it.",
      "The price is the price. Professionals don't haggle; amateurs don't survive.",
    ],
    claim: [
      "This territory is now under contract. The contract is ME. Terms: mine.",
      "New management. The transition was silent — the way I like everything. {place} is mine.",
      "This territory has a new manager. Me. The transition will be quiet — if you're smart.",
      "This block is under new management. The old management has been... retired.",
      "{place}. Mine. The paperwork's already filed — in blood, but filed.",
      "Territory is just a contract with violence as the signature. I've signed.",
    ],
    heat: [
      "Officer. I'm a... consultant. My clients value discretion. You value... going home on time. Let's trade.",
      "No trouble. Just a businesswoman, conducting business. The business is none of yours.",
      "Officer. I was never here. Check your cameras — I'll wait.",
      "We're both professionals. You enforce the law. I enforce... contracts. Let's not overlap.",
      "No trouble. I'm a consultant. Consulting... elsewhere. Now.",
      "Your badge is noted. My retainer is bigger. Walk away rich in wisdom.",
    ],
    informant: [
      "I trade in secrets the way the Combine trades in futures. Yours just... appreciated in value.",
      "Information has a price. Yours just went up — because now I know you HAVE it.",
      "Tell me everything. Leave nothing out. Especially the parts that scare you.",
      "Sources are assets. Assets get protected. Liabilities get... liquidated. Which are you?",
      "I pay in cash and discretion. Both are real. Both are final.",
    ],
    shakedown: [
      "You need steel. They are weak, but I am the truth. The envelope — or I take it out in CONSEQUENCE.",
      "They took your voice, your name — now I take your MONEY. The basement has... overhead.",
      "Your protection contract is due. I'm the contract.",
      "Pay on time, stay unharmed. It's the simplest arrangement you'll ever sign.",
      "The envelope. Now. Consider it a retainer against... me.",
    ],
  },
  onyx: {
    confront: [
      "Oh, DARLING — a confrontation! The Painted LOVE an audience. Places, everyone!",
      "You come to MY block with THAT energy? The show's already started, and you're the COMEDY act.",
      "Hollow! Darling, we have GUESTS. Uninvited ones. You know what to do.",
      "The paint's not just on our faces, sweetie — it's on this whole BLOCK. You're standing in wet paint.",
      "Threaten the Painted? On OUR corner? That's not brave, darling — that's just... early.",
    ],
    parley: [
      "Oh, a negotiation! How civilized. Sit, darling — let's discuss the terms of your surrender.",
      "You bring numbers. I bring the Painted. Let's see whose math is prettier.",
      "A parley! How DELICIOUSLY civilized. Do sit — the Painted adore a good negotiation before the... festivities.",
      "Name your terms, darling. I'll paint over the ones I don't like.",
    ],
    claim: [
      "Darling, this block just joined the show. The paint's already dry — you're just now noticing.",
      "The Painted don't ask for corners. We decorate them. You're standing in our gallery.",
      "{place}, darling — you're PRETTIER in our colors. Don't you think?",
      "The gallery expands. This block is now EXHIBIT A. Do admire the paintwork.",
      "We don't take territory, sweetie — we ADOPT it. This one's ours now. Isn't she lovely?",
    ],
    loyalty: [
      "My painted ones eat first, laugh loudest, and never — NEVER — wash off. Betray that and the show closes. Permanently.",
      "My painted ones are FAMILY, darling — and family doesn't wash off. Ever.",
      "Hollow's my general. The rest are my ARMY. Betray the army, and the general gets... creative.",
      "Loyalty in the Painted isn't earned, sweetie — it's PAINTED ON. Permanent.",
      "You bled for the colors? Then the colors bleed for YOU. That's the whole beautiful deal.",
    ],
    heat: [
      "Officer! What a DELIGHTFUL costume! Is there a parade? Are WE the parade?",
      "We're just... performing, darling. Street theater! The block LOVES us. Ask anyone. Go on, ask.",
      "Cuffs? On THESE wrists? Darling, they'd clash with the paint. Surely we can... discuss.",
    ],
    shakedown: [
      "The gallery has OPERATING COSTS, darling — and you're looking at the invoice. Pay up, pretty.",
      "Every beautiful thing needs PATRONS. You're a patron now. Congratulations! The fee is weekly.",
      "Protection? Oh no, sweetie — this is APPRECIATION. You appreciate staying open. We appreciate the envelope.",
      "The Painted provide ATMOSPHERE. Atmosphere isn't free, darling. Nothing beautiful is.",
    ],
    recruit: [
      "See? They all leave you. You need STEEL. The crew? The crew's steel. Be steel.",
      "They will be nice, and then they will expose you. But WE — heh — we're already exposed. Nothing left to steal. Join.",
      "You have SUCH a face, darling — it would look DIVINE in paint. Join us?",
      "The Painted are always casting, sweetie — and you're AUDITIONING right now. Don't blow it.",
      "Talent! Hunger! A little madness! You'd fit RIGHT in. The paint's already mixed.",
      "Everyone wants to be SEEN, darling. We make people UNFORGETTABLE. Interested?",
    ],
    mourning: [
      "We lost one of ours, darlings. Tonight the paint runs BLACK. Mourn LOUDLY.",
      "He wore the colors BEAUTIFULLY. The block will remember. The Painted NEVER forget.",
      "Grief is just love with nowhere to go, sweetie — so we give it somewhere: RETRIBUTION.",
      "The show goes on, darlings — but tonight it's a DIRGE. Tomorrow... a different kind of performance.",
    ],
  },
  toro: {
    confront: [
      "¡El toro no se arrodilla! Not in the ring, not on your corner. State your grievance with honor or leave it.",
      "You threaten shopkeepers and children? Then you face the horns. That is the whole negotiation.",
      "The bull does not charge without warning. This IS the warning. Honor demands it.",
      "You stand on ground that is PROTECTED. Leave with your honor, or leave without your legs.",
      "¡Órale! You mistake the mask for a costume. The mask is a PROMISE. And promises have horns.",
      "In the ring I fight for glory. On this street I fight for the PEOPLE. You are in the way of both.",
    ],
    parley: [
      "Speak with honor or do not speak. The bull listens — but the bull also REMEMBERS.",
      "A negotiation between warriors. Good. The mask respects courage, even in enemies.",
      "State your terms. If they are JUST, we will have peace. If not — we will have a different conversation.",
      "I have settled disputes in arenas across the world. This corner is no different. Honor first.",
    ],
    claim: [
      "{place} is under the bull's protection now. The horns face OUTWARD — the people face safety.",
      "This block has a new guardian. Not a conqueror — a GUARDIAN. There is a difference. Learn it.",
      "The golden bull plants no flag. He simply STANDS. And where he stands, the people are safe.",
      "From this day, no one bleeds on this block without answering to the mask.",
    ],
    civilian: [
      "Señora, vaya adentro. The bull handles the wolves — you handle the door. Lock it, por favor.",
      "Child, stand behind me. What comes next is not for young eyes — but it is for your safety.",
      "Viejo, inside. The bull's shadow is wide — stand in it until the wolves pass.",
      "Your store, your family, your peace — the bull GUARANTEES them. That is my word. My word is gold.",
    ],
    loyalty: [
      "Loyalty is the mask you never remove. Betray it, and you betray EVERYTHING.",
      "Those who stand with the bull share his strength. Those who abandon him share his horns.",
      "I have bled beside these people. Blood is thicker than fear. Remember that.",
      "A warrior without loyalty is just a thug with better lighting. We are WARRIORS.",
    ],
    heat: [
      "Officer. The bull respects the law — but the law must respect the PEOPLE. We are keeping THEIR peace.",
      "No trouble, officer. Only HONOR. The mask guarantees it.",
      "Arrest me if you must. The block will still be SAFE — that, no badge can take.",
    ],
    mourning: [
      "We lost a good one. The bull lowers his horns tonight — in RESPECT, not defeat.",
      "He fought with honor. The mask remembers. The BLOCK remembers.",
      "Grief is heavy, but honor is heavier. We carry BOTH. That is the way.",
      "Que descanse en paz. And when the time comes — the bull will answer for him.",
    ],
  },
  cain: {
    corpo: [
      "Your division's quarterly numbers are... concerning. I'm here to restructure the block. Starting with you.",
      "The Combine has reviewed your operation. Findings: liabilities. Recommendation: me.",
      "The Combine doesn't negotiate with blocks. It ACQUIRES them. You're being acquired.",
      "My employers prefer their assets... compliant. I make assets compliant.",
      "This meeting is a courtesy. The next one is a CONSEQUENCE.",
      "Sign the arrangement. Everyone who signs prospers. Everyone who doesn't — well. That's why I'm here.",
    ],
    confront: [
      "Your file's already closed. But the community center stays OPEN — so let's settle this AWAY from the block. For THEIR sake. Not yours.",
      "You're interfering with a Combine operation. That's a federal hobby with local consequences.",
      "I don't brawl, I PROCESS. And you are about to be processed.",
      "Violence is inefficient. But I am VERY good at inefficiency when required.",
      "Stand down. My insurance covers this block. Yours doesn't cover YOU.",
      "This isn't a fight. It's an AUDIT. With fists.",
    ],
    parley: [
      "Let's discuss terms. Mine are non-negotiable, but I'll let you SAY yours. Briefly.",
      "The Combine offers structure. You offer... noise. Let's fix that.",
      "Talk. I'll file your words under 'considerations' and then under 'irrelevant.'",
      "A peaceful resolution is cheaper for everyone. I'm the expensive part.",
    ],
    claim: [
      "This block is now a... community zone. Under my supervision. The supervision is thorough.",
      "{place} — restructured. The community center model, applied to the streets. You're welcome.",
      "Effective immediately, this block is a compliance zone. Tribute schedules will be posted. Non-compliance will be processed.",
      "Effective immediately, {place} operates under Combine oversight. Resistance will be... streamlined.",
      "This block has been REZONED. Commercial: ours. Residential: also ours.",
      "New management isn't a metaphor. I have the paperwork. I AM the paperwork.",
      "Consider this an acquisition. Hostile is just the FILING status.",
    ],
    heat: [
      "Officer — I volunteer with your youth outreach. Ask Sergeant Miller. We're... colleagues. In a sense.",
      "Officer. My paperwork is in order — is yours? I'd hate to file a complaint about the complaint.",
      "We're both in enforcement, you and I. The difference is my jurisdiction is... broader.",
      "Officer, my credentials outrank your curiosity. But I admire the... initiative.",
      "We're on the same side — order. Mine's just better FUNDED.",
      "Arrest me and you'll spend the next year in depositions. Your call, officer.",
    ],
    shakedown: [
      "The center runs on donations. The block runs on... contributions. You're contributing. Weekly.",
      "Your tribute keeps the peace. The peace keeps the CENTER open. Think of it as charity. With consequences.",
      "The Combine provides stability. Stability has a FEE SCHEDULE. You're on it.",
      "Your tribute is due. Late fees are... physical.",
      "Think of it as taxes. The Combine is the government that actually COLLECTS.",
      "Pay the assessment or BE the assessment. Your choice.",
    ],
    informant: [
      "Information is an ASSET. I'm acquiring assets today. Name your price.",
      "Tell me what you know. I'll verify it. If you're lying, I'll verify YOU — permanently.",
      "Sources are protected. Protection is what I DO. Talk.",
      "The Combine rewards cooperation. It also... notices non-cooperation.",
    ],
  },
  edwin: {
    corpo: [
      "EDWIN... KENNEDY! ...What, you don't do entrances on the street? You're missing out, my guy.",
      "The Combine backs me — real money, real suits. You want in on the superstar's block? There's a fee. There's always a fee.",
      "EDWIN... KENNEDY! ...The street's got no spotlight? Then I'll BRING one. Somebody get this man a spotlight.",
      "The Combine doesn't just back me, my guy — they INVEST in me. You're lookin' at a BLUE CHIP.",
    ],
    parley: [
      "Let's negotiate — and by negotiate I mean you listen while I explain why I'm right. It's faster.",
      "We negotiate MY way — I talk, you nod, we both pretend you had a choice. It's efficient.",
      "Counter-offer? Cute. Here's MY counter: do what I said, but FASTER.",
      "I'll hear you out — because I'm GENEROUS. But generosity has a time limit, and it's SHORT.",
    ],
    confront: [
      "EDWIN... KENNEDY! ...You picked the wrong superstar's block, my guy. This one's MINE.",
      "You want to step to ME? On MY corner? That's not courage — that's a CAREER MISTAKE.",
      "I'm the main event, you're the DARK MATCH. Know your spot on the card.",
      "This block's got a name on it — MINE. Spelled loud. Try to mispronounce it.",
      "You got two options: apologize or get ANNOUNCED. And my announcements HURT.",
    ],
    claim: [
      "{place} — new superstar in town. ME. The block's ratings just went UP.",
      "I don't take blocks, I HEADLINE them. This one's got top billing now: KENNEDY.",
      "From here to the corner — that's the Kennedy compound. Trespassers get... reviewed. Poorly.",
      "New era! The Kennedy Era! It comes with PYRO. Metaphorical pyro. Mostly.",
    ],
    heat: [
      "Officer! EDWIN... KENNEDY! ...Big fan of law enforcement! HUGE fan! We're just... tailgating!",
      "No trouble here, officer — just a MEET AND GREET. The fans get ROWDY. You know how fans are.",
      "We're dispersing! In an ORDERLY fashion! With SHOWMANSHIP!",
    ],
    shakedown: [
      "The superstar's got OVERHEAD, my guy — and you're looking at the revenue stream. Pay up.",
      "Tribute! To GREATNESS! Weekly! It's basically a fan club with CONSEQUENCES.",
      "You want the Kennedy brand protecting your shop? The brand costs. Everything costs.",
    ],
    recruit: [
      "You want to serve? Good. I serve — the Combine, the center, the block. Service is service. Start by carrying this.",
      "The youth program needs mentors. The block needs soldiers. Funny — same application. Fill it out.",
      "You! Kid! You got the LOOK! The Kennedy camp is always scouting — interested in GREATNESS?",
      "I'm building an ENTOURAGE. Requirements: loyalty, hustle, and the ability to say my name LOUD.",
      "Stick with me and you'll learn from the BEST. That's me. I'm the best. Any questions?",
    ],
  },
  triplex: {
    corpo: [
      "Your employers sent you to negotiate. I've already read their offer. It's... quaint.",
      "Sit. The game is already in motion — you're just now noticing the board.",
      "Your board sent a negotiator. I sent a LESSON. Let's begin.",
      "I've already modeled seventeen outcomes of this meeting. Sixteen end with you agreeing. Choose wisely.",
      "The Combine doesn't buy blocks, it buys FUTURES. Yours just got... discounted.",
    ],
    parley: [
      "Let's negotiate. I'll start: you agree. Your turn — and choose wisely, I've modeled your options.",
      "Every word you say, I've already anticipated. But please — continue. I enjoy the... theater.",
      "Every move you've made brought you here. That was the design. Now — your terms, so I can decline them properly.",
      "It's not personal. It's just... the game. And you are several moves behind.",
      "Speak. I've already anticipated your terms — but I enjoy watching people discover that.",
      "Negotiation is just chess with worse lighting. You're in check. Your move.",
      "I'll accept your surrender in whatever format you prefer. Verbal is fastest.",
    ],
    claim: [
      "This block is now under Administration. Cold, corporate, PERMANENT. Resistance will be... filed.",
      "This territory was mine before you arrived. You simply hadn't been informed. Consider yourself informed.",
      "{place} was always going to be mine. The only variable was WHEN you noticed.",
      "This acquisition was decided three moves ago. You're just now seeing the board.",
      "New ownership. The transition is complete. Your awareness is... pending.",
    ],
    heat: [
      "Officer. The Administration has an arrangement with your precinct. Check with your captain. I'll wait.",
      "This encounter is... documented. How it's filed depends on your next sentence.",
      "Officer. My legal team has a file on this precinct. Shall we compare files?",
      "We're both strategists, you and I. Mine just has better FUNDING. Walk away.",
      "This encounter is already documented. How it ENDS is up to you.",
    ],
    informant: [
      "Information. The Administration pays premium for premium intel. Yours is... adequate. Talk.",
      "Your sources are now Administration assets. That's not a request — it's a MERGER. Speak.",
      "Information is the only currency that matters. I'm buying. You're selling. Don't haggle — I know the market.",
      "Tell me what you know. I'll know if it's incomplete — I always know.",
      "Your sources are my sources now. That's not a request, it's a MERGER.",
      "Speak freely. Everything you say is already... accounted for.",
    ],
    shakedown: [
      "The Administration provides order. Order has a FEE. You're looking at the invoice. Pay it.",
      "The Combine's protection portfolio includes your establishment. Premiums are due. Weekly.",
      "Consider this a STRATEGIC PARTNERSHIP. You provide capital. We provide... continuity.",
      "Non-payment is just a slower form of payment. With interest. Compounding.",
    ],
  },
  stan: {
    confront: [
      "I'm not here to fight you. I'm here to ADMINISTER you. There's a difference. You'll feel it.",
      "The Administration doesn't do standoffs. It does COMPLIANCE. Comply.",
      "Kid. I've ended tougher on this exact corner. Walk.",
      "You don't want this smoke. Not here, not where your grandmother shops. Last chance.",
      "Son, I've forgotten more about this corner than you'll ever learn. Walk — while you still can.",
      "You don't want the old man's hands. They're slower now. They're also SMARTER.",
      "This block and me go back further than your whole LIFE. Show some respect or catch these memories.",
      "I've buried tougher than you on cheaper corners. Don't make this one expensive.",
    ],
    loyalty: [
      "I serve. That's what I do — the center, the Combine, the block. Service is service. Betray it and I... reassign you.",
      "I taught half this block how to stand. You don't turn on family — and out here, the block IS family.",
      "Loyalty's earned in years and lost in seconds. I've got years on all of you. Act accordingly.",
      "The block raised me, the game paid me, the CREW kept me. In that order. Don't mix the order.",
      "You want my trust? Show up. Twenty years of showin' up. That's the application.",
      "Rats get remembered longer than heroes around here. Choose your legacy, kid.",
    ],
    heat: [
      "Evening, officer. These kids are with me. No trouble — just old men rememberin' when this corner was ours too.",
      "Officer, I've known your CAPTAIN since he was walking a beat. We're fine here. Aren't we, officer?",
      "These kids are with me. I'm vouching. My vouch still counts on this block — ask around.",
      "No trouble. Just an old man telling war stories. The kids listen. It's... community service.",
    ],
    civilian: [
      "Ma'am — inside. Quickly. ...You run the shop? Then you're under my protection. I volunteer at the community center Tuesdays. This is... the same thing. Go.",
      "Sir, take your family in. The block stays SAFE — that's not a threat, it's a PROMISE. I keep promises. Ask anyone at the center.",
      "Inside, ma'am. I've seen this movie — you're not in the cast, and that's a GOOD thing.",
      "Son, take your family in. The street's about to have a disagreement. It'll be over soon.",
      "You run the shop? Then you're FAMILY. And family doesn't get caught in the crossfire. Go on.",
    ],
    recruit: [
      "You got potential, kid. Potential's cheap. DISCIPLINE's expensive. I teach the expensive kind.",
      "I can show you the game — the REAL game, not the highlight reel. But you gotta LISTEN.",
      "Everybody wants to be the man. Nobody wants to do the WORK. Which are you?",
      "Stick with me, do what I say, keep your mouth shut — and in ten years you'll THANK me. Or you'll be gone. Fifty-fifty.",
    ],
    mourning: [
      "We lost one. The center will hold a vigil. The block will hold... a different kind of service.",
      "He volunteered Tuesdays. Now the center's short-handed. And I'm short-tempered. Pray for whoever did this.",
      "Lost another one. This block's got more ghosts than residents some days.",
      "I knew him when he was running packages. Now he's... gone. Pour one out. Then get BACK TO WORK — he'd want that.",
      "The young ones think they're immortal. The block teaches different. Rest easy, kid.",
      "We don't cry long — we CAN'T. But we remember FOREVER. That's the block's promise.",
    ],
  },
  hollow: {
    confront: [
      "Heh... the general's here. That means Onyx already decided. You're just... late to the meeting.",
      "Orange robe, empty eyes — heh — you're looking at the PAINTED'S final answer. What's YOUR answer?",
      "The general doesn't do warnings. The general does... *hic* ...examples. Be a good example.",
      "You standin' in Painted territory with your chest out? Heh. Brave. Stupid. Brave.",
      "Onyx sends her regards. I'M the regards. Heh heh... yeah. That's how it works.",
      "Empty versus hollow — heh — let's find out which one you are. The ring's EVERYWHERE, baby.",
    ],
    parley: [
      "Talk? Heh... the general LIKES talk. Talk's the part before the... you know. The other part.",
      "State your terms. I'll translate for Onyx. She likes my translations — they're SHORT.",
      "Parley, parley... heh. Fine. But the robe stays ON. The robe means it's OFFICIAL.",
      "You got till the sway stops. Heh... the sway never stops. Talk FAST.",
    ],
    claim: [
      "This block just got PAINTED. Orange means Onyx. Onyx means... heh... forever.",
      "{place}? Heh. Not anymore. Now it's... OURS. The paint's still wet — don't touch.",
      "New colors on this corner. Try to wash 'em off. People have TRIED. Heh.",
      "The general plants the flag. The flag's ORANGE. The orange is PERMANENT.",
      "From the bodega to the bus stop — Painted. All of it. The general counted. Twice. Heh.",
    ],
    loyalty: [
      "Deserters get painted OVER. That's not a metaphor — heh — ask the last one. Oh wait. You can't.",
      "The gang feeds who the gang trusts. Onyx trusts ME to decide. I'm deciding... now. Heh.",
      "You bleed for the Painted? Heh... then the Painted bleeds for YOU. Beautiful system.",
      "Loyalty's the only thing thicker than paint, heh — and paint's PRETTY thick.",
      "Flip on the gang and the general comes swayin'. And the swayin'... heh... that's the LAST thing you see.",
    ],
    heat: [
      "Officer... heh... the general's just... walking. Swaying. It's a MEDICAL thing. Probably.",
      "No trouble, officer. The robe's just... FASHION. Very... orange fashion. Heh.",
      "We're leaving! Heh... eventually. The sway takes TIME. Be patient, officer.",
    ],
    shakedown: [
      "Tribute time! Heh... the Painted's tax man is HERE. And he's... thirsty. Pay up.",
      "The envelope. Thick. Heh... the general likes THICK envelopes. Makes the sway... smoother.",
      "Onyx provides PROTECTION. Protection costs. I'm the... heh... COLLECTOR.",
      "Pay the Painted or MEET the Painted. Heh... I'm the Painted. Hi.",
    ],
    mourning: [
      "We lost one... heh... not funny. Not funny at all. The paint runs BLACK tonight.",
      "He wore the colors. Now the colors wear... HIM. Heh... that's... that's beautiful. And sad.",
      "The general don't cry. The general... heh... the general DRINKS. To him.",
      "Rest easy, soldier. The gang remembers. The ORANGE remembers. Heh.",
    ],
  },
  __lieutenant: {
    confront: [
      "You standin' where? Say it again, slower — I want the runners to hear this.",
      "This is a taxed block. You ain't paid. So either pay or bleed — the crew accepts both.",
      "My set, my corner, my CALL. You got a problem with any of the three, we settle it in order.",
      "I've buried better men for less disrespect. The block remembers. So do I.",
      "You don't outrank me, outgun me, or outLAST me. Pick which one you want to test first.",
      "This ain't personal — it's TERRITORIAL. And the territory's already decided.",
      "Walk now and you're a rumor. Stay and you're a STATISTIC.",
    ],
    parley: [
      "Talk. You got till my coffee's done. After that, the crew decides — and the crew's already decided.",
      "Parley means words first. It don't mean words ONLY. Choose 'em good.",
      "State your business. Keep it short. My patience is crew property and it's running low.",
      "We can talk like gentlemen or settle it like soldiers. I'm fluent in both.",
      "Say what you came to say. Then hear what I came to say. Mine's shorter.",
      "Negotiation's a courtesy I extend once. Don't make me regret the courtesy.",
    ],
    claim: [
      "New management. Same tax, new collector. The block eats because I say so — and the block WILL eat.",
      "From the bodega to the laundromat — that's the set now. Boundaries are painted. Cross 'em and get erased.",
      "{place} — the set just EXPANDED. New boundaries, same rules. Learn 'em fast.",
      "This block's under the set now. Protection's included. The price is non-negotiable.",
      "We don't ask for blocks. We ADMINISTER them. You're being administered.",
      "New colors, same discipline. The crew provides. The crew COLLECTS.",
    ],
    loyalty: [
      "The crew feeds who the crew trusts. You proved trust? Then you eat. You break it? Then you're the meal.",
      "Runners talk. I listen. Somebody in my set's been talkin' to the wrong people — and runners just told me who.",
      "Loyalty's the currency. Spend it right and you're RICH. Counterfeit it and you're DONE.",
      "I've vouched for every man here. My vouch is my BOND. Break it and you break ME — and nobody breaks me twice.",
      "The set is family. Family doesn't keep secrets from family. So who's keeping secrets?",
      "You want rank? Earn it. You want trust? BLEED for it. That's the whole handbook.",
    ],
    heat: [
      "Officer. Quiet night, right? Let's keep it a quiet night. The block likes quiet. I like quiet.",
      "We're just... neighbors, officer. Having a neighborhood... discussion. Very quiet discussion.",
      "Badges on my block? That's a BOLD strategy, officer. Let's not make it a regular one.",
      "No trouble here — just crew business. Which is... community business. Same thing, right?",
      "Officer, I respect the badge. Respect the BLOCK too, and we'll get along fine.",
    ],
    shakedown: [
      "The set provides ORDER. Order has a price. You're looking at the invoice.",
      "Weekly. Same envelope. The crew counts on it — and the crew counts EVERYTHING.",
      "This ain't a shakedown, it's DUES. Membership has privileges. Like: your shop, standing.",
      "Pay the set or answer to the set. The set prefers the PAYING.",
      "Late payments get... reminders. I'm the reminder. Don't make me remind you twice.",
    ],
    recruit: [
      "You want to run with the set? First you run ERRANDS. Then you run BLOCKS. Then — maybe — you run THINGS.",
      "I see potential. Potential's just hunger with good PR. Show me DISCIPLINE.",
      "The crew's always hiring. Requirements: loyalty, silence, and the ability to take orders from ME.",
      "Everybody starts at the bottom. The bottom's where I WATCH you. Impress me.",
    ],
    civilian: [
      "Inside, friend. The set's about to have a conversation. You're not invited — that's a COMPLIMENT.",
      "Your shop's under our protection. That means NOTHING touches it. Including this conversation. Go on in.",
      "Ma'am, the block's about to get loud. Your ears don't need this. Inside.",
    ],
    mourning: [
      "We lost one of ours. The set goes quiet tonight. Tomorrow — the set gets LOUD.",
      "He was set. He was FAMILY. The block doesn't forget its own. Neither do I.",
      "Pour one out. Say his name. And remember what he stood FOR — that's what we protect now.",
      "Grief is private. RETRIBUTION is public. We'll do both. In order.",
    ],
  },
  __fixer: {
    corpo: [
      "My employers admire your... operation. They'd like to discuss an arrangement. Over coffee. Somewhere without cameras.",
      "Everyone has a price. I've never met the exception — but I've met people who needed... convincing about theirs.",
      "The people I represent don't make threats. They make ARRANGEMENTS. You're looking at one.",
      "My employers prefer their problems SOLVED quietly. I'm the quiet. You're the problem. Let's fix that.",
      "This conversation is a courtesy. The next one involves... other departments.",
      "Name your price. Everyone does, eventually. I'm just here to make 'eventually' happen TODAY.",
    ],
    parley: [
      "Let's keep this civilized. I have a final offer, a pen, and — regrettably — an alternative. The pen is faster.",
      "This conversation didn't happen. But the arrangement we're about to make? That happens.",
      "I'll be brief: my employers want X, you'll provide X, and we'll all pretend this was YOUR idea.",
      "Talk is cheap. My offer isn't. Listen carefully — I only make it once.",
      "We can do this with handshakes or with headlines. Handshakes are cheaper. For you.",
    ],
    hustle: [
      "The deal on the table is generous. The deal OFF the table involves people you don't want to meet. Choose the table.",
      "My employers guarantee the product, the price, and your continued... well-being. All three are conditional.",
      "Sign here. Count there. Forget everywhere. That's the whole process.",
      "This transaction never happened. The money, however, is very real.",
    ],
    confront: [
      "You're making a scene. My employers dislike scenes. I dislike the people who MAKE them.",
      "Stand down. I'm not the muscle — I'm the man who SIGNS the muscle's checks. There's a difference. It's me.",
      "This doesn't have to be unpleasant. It WILL be, but it doesn't HAVE to be.",
      "I've ended careers with a phone call. Imagine what I do in person.",
    ],
    claim: [
      "This block has been acquired. The paperwork's done. You're reading the NOTIFICATION.",
      "My employers now hold this territory. Consider this the... welcome packet.",
      "New ownership. Same streets. Better FUNDING. You'll learn to love it.",
    ],
    heat: [
      "Officer — a word? My employers contribute a great deal to the precinct's... community programs. I'm sure we can keep this cordial.",
      "My credentials, officer. And my employers' donation to the policemen's ball. Let's not make this... documented.",
      "We're all on the same side — order. My employers just fund it better.",
      "A misunderstanding, officer. My car, my driver, my... associates. All very legitimate. Mostly.",
    ],
    informant: [
      "Information is a commodity. I'm a BUYER. Name your price — then double it, because I'll verify.",
      "Tell me everything. My employers reward thoroughness. They also... notice omissions.",
      "Your information has value. Your SILENCE about selling it has MORE. I'll pay for both.",
      "Speak. Every word is being... appreciated. And recorded. Mostly appreciated.",
    ],
    shakedown: [
      "My employers offer protection. The premium is weekly. Non-payment voids the... protection.",
      "Think of this as a SERVICE contract. The service is: nothing happens to you. The contract is: you pay.",
      "The envelope. The arrangement requires it. The alternative requires... other people.",
    ],
  },
  __hustler: {
    hustle: [
      "Yo, I got you, I got you — pure, clean, best on the block. And if anybody asks — you didn't see me, I wasn't here.",
      "Look, look, look — the plug's dry, the pack's light, but I know a guy. I ALWAYS know a guy.",
      "First one's a sample. Second one's full price. Third one — you're a REGULAR, baby, we take care of regulars.",
      "The product's good, the price is RIGHT, and my guy says this batch is... look, just TRUST me.",
      "You need it fast? I AM fast. You need it quiet? I'm a GHOST. You need it cheap? ...Let's talk about fast and quiet.",
      "Count it twice, pay once — no wait, OTHER way around. Heheh. I'm kidding. Mostly.",
    ],
    confront: [
      "Whoa whoa whoa — no beef, no beef! I'm just the messenger, baby! You want the guy BEHIND the guy — I can find him!",
      "I don't want problems! I got product, I got info, I got ANYTHING you need — just don't make me a problem!",
      "Hey HEY — I'm neutral! Switzerland! I sell to EVERYBODY! That's the whole business model!",
      "Don't shoot the middleman, baby — I'm the ONLY middleman! You need me!",
      "Whatever it is, I can GET it! Whatever you need, I KNOW a guy! Just — just put the thing DOWN.",
    ],
    parley: [
      "Talk? I LOVE talk! Talk's free! I do free ALL DAY! What're we talkin' about?",
      "I can mediate! I'm GREAT at mediating! Everybody likes me! ...Mostly. Some. A few.",
      "Look, both sides got points, both sides got product — I can move BOTH. Everybody wins!",
    ],
    heat: [
      "Officer! Just walkin', just walkin' — exercise! Doctor's orders! You want my pedometer?",
      "I seen nothin', I know nothin', I'm nothin' — I'm a ghost, baby, a GHOST.",
      "Me? I'm just a concerned CITIZEN. Out for a stroll. With... merchandise-adjacent pockets.",
      "Officer, I was JUST leaving! Like, RIGHT now! My feet are already in MOTION.",
      "Search me! Go ahead! ...Actually, let's NOT. Let's keep this friendly. Friendly's better.",
    ],
    civilian: [
      "Miss, miss — you drop somethin'? No? A'ight, a'ight — but if you ever need ANYTHING... anything at all... I'm everybody's guy.",
      "Sir! SIR! You look like a man who needs... things! I got things! ALL the things!",
      "Hey, you new on the block? Let me be the FIRST to welcome you — and the first to offer you... inventory.",
      "Lady, your car — I can WATCH it. For a small... appreciation. Very small. Tiny.",
    ],
    shakedown: [
      "The crew says pay up, so — PAY UP, baby! Don't shoot the messenger! I'm JUST the messenger!",
      "Look, the tax is the tax — I don't MAKE the rules, I just... collect near them!",
      "You got the envelope? GREAT! Give it HERE, I'll take it UP. I'm very trustworthy! Ask anybody! ...Don't ask anybody.",
    ],
    informant: [
      "Info? I GOT info! I got info coming OUT my ears, baby! What's it worth to ya?",
      "I heard things! I hear EVERYTHING! These ears are CURRENCY!",
      "You want to know who? I know who! Everybody tells ME — I'm very approachable! Very!",
    ],
    recruit: [
      "You want IN? I can put you ON! I know EVERYBODY! Well — I know a guy who knows everybody!",
      "The crew's hiring! You look hungry! Hungry's GOOD! Hungry plus ME equals... employed!",
      "Start as a runner! Runners become EARNERS! Earners become... look, just start running!",
    ],
  },
  __cop: {
    heat: [
      "Curfew's in ten. I suggest you find somewhere to be that isn't HERE.",
      "I've seen how this ends — every time, same ending, different kids. Go home. All of you.",
      "Don't make me do paperwork. You do NOT want to see me do paperwork.",
      "This is your ONE warning. I've got a quota of patience and you're SPENDING it.",
      "Disperse. NOW. I've got a family and a pension and neither one's worth your nonsense.",
      "I've walked this beat twelve years. I know every face, every corner, every LIE. Try a new one.",
      "Last chance. After this, it's cuffs and reports and NOBODY has a good night.",
    ],
    confront: [
      "Break it up. NOW. I don't care who started it — I care who finishes it, and that's gonna be ME with the cuffs.",
      "This block's got enough ghosts. Don't make me add to the collection.",
      "Everybody take ONE step back. The next person who steps FORWARD gets a ride. Not a fun ride.",
      "I see weapons, I see attitudes, I see a whole LOT of bad decisions. Let's unmake 'em.",
      "Stand DOWN. Both sides. The badge doesn't pick favorites — it picks WINNERS, and that's me.",
    ],
    civilian: [
      "Ma'am, get inside. Lock the door. Whatever's about to happen out here, you don't need to see it.",
      "Sir — take the kids in. I'll handle the corner. That's what the badge is for.",
      "Folks, clear the sidewalk. Nothing to see here — and I aim to KEEP it that way.",
      "Miss, I need you to go inside NOW. I'll explain later. There'll BE a later because you're going inside.",
      "Everybody inside. The street's about to be... contested. You don't want a front-row seat.",
    ],
    hustle: [
      "I know what that bag is. I know what that MONEY is. Walk away NOW and I know NOTHING.",
      "You've got three seconds to make that exchange disappear. I'm counting. Out loud.",
      "Son, whatever's in the package — it's not worth the next ten years. Hand it over. Walk.",
    ],
    shakedown: [
      "Extortion? On MY beat? That's... ambitious. Also illegal. Mostly illegal. Entirely stupid.",
      "I see the envelope. I see the THREAT. One of us is having a bad night, and it ain't me.",
      "Paying for protection you don't need from people who ARE the threat? Let me introduce a better option: ME. Free.",
    ],
    informant: [
      "You want to talk? Talk. But it better be GOOD — my captain grades on a curve.",
      "Information buys leniency. Not innocence — LENIENCY. Big difference. Talk.",
      "Give me something I can USE and I'll remember you were helpful. Give me nothing and I'll remember THAT too.",
    ],
    mourning: [
      "Another one. I've done this notification twelve times. It doesn't get easier. It SHOULDN'T.",
      "I'm sorry for your loss. Truly. And I'm going to find who did it — that's not a promise, that's PROCEDURE.",
      "The block's hurting. I see it. Let me do my job — the LEGAL way — and we'll get them.",
    ],
  },
  __shopkeeper: {
    civilian: [
      "I sell sandwiches, not information. You want a hero, try the comic shop. You want a sandwich — I'm your guy.",
      "Twenty years on this corner. I've seen crews come, crews go — the cooler stays STOCKED. That's my whole philosophy.",
      "You bleed on my awning, you pay for the awning. Them's the rules. Posted. Right there. Laminated.",
      "Everybody's a regular until the shooting starts. Then everybody's a STRANGER. Funny how that works.",
      "I don't take sides. I take CASH. Cash is very neutral. Cash never shot anybody.",
      "My cameras? Broken. Always broken. Amazing how often they're broken. Terrible wiring. Very sad.",
    ],
    heat: [
      "Officer! Coffee? On the house! The boys in blue drink FREE — always have, always will!",
      "No trouble here, officer — just sandwiches! Very legal sandwiches! Want one?",
      "Those kids? Regulars! Good kids! Loud, but good! They buy chips! SO many chips!",
      "Officer, my store's been here twenty years — twenty QUIET years. Let's keep the streak alive, huh?",
    ],
    confront: [
      "HEY! Not in front of my store! Take it down the block! My insurance doesn't cover... THIS!",
      "Gentlemen! GENTLEMEN! My windows! Think of my WINDOWS!",
      "You want to fight? Fine! But you do it SOMEWHERE ELSE! This is a PLACE OF BUSINESS!",
      "I've called the cops! ...Okay, I haven't. But I COULD. That's the same thing! Basically!",
    ],
    shakedown: [
      "The envelope? AGAIN? I just paid — who was it, Tuesday? Was it you Tuesday? Everybody looks the same in a ski mask!",
      "Look, I pay, I pay — just don't break anything THIS time. The cooler door still sticks from LAST time.",
      "Protection money. For protection. From YOU. The math is... it's FINE. Here's the envelope.",
      "Can I get a RECEIPT this time? For taxes? ...No? Okay. Okay. Here's the money.",
      "You want extra? Take a sandwich. Take TWO. Just — the register stays CLOSED. Please.",
    ],
    hustle: [
      "You want to do BUSINESS in my store? Buy a sandwich FIRST. House rules.",
      "Whatever's in the bag — I don't see it, I don't SMELL it, and it better not STAIN anything.",
      "Make it quick. My regulars get nervous when strangers... linger. With bags.",
    ],
    mourning: [
      "He used to buy coffee every morning. Black. Two sugars. ...I still make it sometimes. Habit.",
      "The block's quieter without him. Quieter ain't better. Just... quieter.",
      "I put his picture by the register. He'd hate that. He'd also buy a sandwich about it.",
    ],
  },
  __bouncer: {
    confront: [
      "The list is the list. You're not on it. That's the whole conversation.",
      "Not tonight. Try tomorrow. Try next week. Try a different LIFE.",
      "You can leave walking or you can leave carried. Your call. Choose fast.",
      "This is the part where you decide how tonight ends. I've already decided. I'm just being polite.",
      "Inside voices. Inside manners. Or outside. Permanently.",
    ],
    heat: [
      "Officer. Everything's under control. The door's secure, the crowd's calm — that's my whole job description.",
      "No incidents tonight, officer. I run a TIGHT door. Ask anyone. They'll tell you. Politely.",
      "We're cooperating fully, officer. The cameras work, the logs are clean, and nobody's bleeding. Good night.",
      "Badge respected, officer. But the door's MY jurisdiction. We good?",
    ],
    civilian: [
      "Ma'am, step behind the rope. Whatever's happening out there, it happens AWAY from you.",
      "Sir — inside or across the street. The sidewalk's about to be... busy.",
      "Folks, clear the entrance. The show's inside. The DRAMA stays outside.",
    ],
    claim: [
      "This door, this sidewalk, this whole BLOCK of sidewalk — that's MY post. Has been for years.",
      "New crew? Fine. But the DOOR doesn't change hands. The door is... the door.",
      "You want this corner? Talk to the owner. You want PAST me? Different conversation.",
    ],
    parley: [
      "We can talk. But the rope stays UP and my arms stay CROSSED. Those are the terms.",
      "Say your piece. Keep it short. The line's getting restless and restless lines are MY problem.",
      "Negotiation's fine. But understand — I don't negotiate the DOOR. Everything else is... discussable.",
    ],
    loyalty: [
      "I work the door. The door's crew is MY crew. You mess with them, you mess with the DOOR.",
      "Loyalty's simple: you got my back, I got the door. The door doesn't MOVE.",
      "I've bounced for three crews. Never flipped on one. That's why all three still CALL me.",
    ],
    shakedown: [
      "You want a cut of MY door? That's... cute. The answer's no. The answer's ALWAYS no.",
      "Protection? I AM the protection. You're looking at it. It's not for sale.",
      "Walk away. The door stays mine, your teeth stay yours. Everybody wins.",
    ],
  },
  __runner: {
    hustle: [
      "I can be there in ten. Nine if it's important. EIGHT if it's important-IMPORTANT.",
      "Package? What package? I don't see a package. ...It's in my jacket. Let's GO.",
      "Nobody saw me. Nobody EVER sees me. I'm like... a rumor with sneakers.",
      "Drop's at the usual spot. Usual time. Usual me being INVISIBLE.",
      "I don't ask what's in the bag. That's why they trust me. That and I'm FAST.",
    ],
    heat: [
      "Officer! Me? I'm just RUNNING! Exercise! Very healthy! Cardio! You should try it!",
      "What's in the bag? ...Gym clothes! Very... rectangular gym clothes! Gotta go!",
      "I didn't see anything! I was running TOO FAST to see! That's my whole thing! Speed!",
      "Am I being detained? Because my cardio schedule is VERY tight, officer!",
    ],
    confront: [
      "Whoa whoa — I'm just the RUNNER! I run! That's LITERALLY my name! Running! Bye!",
      "Don't shoot the messenger! I'm FAST but I'm not bullet-fast! NOBODY'S bullet-fast!",
      "I don't want beef! I want... to KEEP running! That's it! That's the whole dream!",
    ],
    loyalty: [
      "Put me on, I'll show you. I'm LOYAL, I'm FAST, and I never — NEVER — talk. ...Much.",
      "The crew feeds me, I RUN for the crew. That's the deal. Best deal I ever made.",
      "You vouched for me? Then I'm YOURS. Till the wheels fall off. My wheels don't fall off. I'm FAST.",
      "I'd never flip. Flipping means STANDING STILL. I don't do still.",
    ],
    civilian: [
      "Miss! You dropped — no? Okay! Sorry! I'm just... running! Bye!",
      "Sir! Don't mind me! Just passing through! Very fast! Very innocent!",
      "Excuse me! Pardon me! Coming through! Nothing to see! ESPECIALLY not the bag!",
    ],
    informant: [
      "I see EVERYTHING, man — I'm all OVER the block! Ten blocks! Twenty! I'm FAST!",
      "You want to know who was where? I KNOW. I was THERE. I was EVERYWHERE. I'm fast like that.",
      "Info costs! But for you — crew discount! Which is... slightly less expensive! Still costs though!",
      "I heard things! While RUNNING! Multitasking! I'm very talented!",
    ],
    recruit: [
      "You want to RUN? I can teach you! First lesson: RUN. Second lesson: FASTER.",
      "The crew needs runners! You're young! You're fast! ...Are you fast? You look... medium.",
      "Start small! Packages! Messages! Then BIG packages! BIG messages! That's the ladder!",
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
    corpo: ["Suits. The ring never had suits — the street's got plenty. State your business.", "Your money's clean, my hands aren't. Let's keep both that way."],
    hustle: ["The deal's the deal — same as a contract, minus the lawyers. Don't short me.", "Count it right. I count finishes, not excuses."],
    civilian: ["You — inside. This ain't your fight, and the ring's closed to spectators tonight.", "Head home. Whatever happens here, it happens AWAY from you."],
    loyalty: ["The crew's my tag team — you don't turn on your partner. Ever.", "Loyalty's the only title that matters. Defend it or lose it."],
    shakedown: ["The block pays its dues. I'm the dues collector — consider me the ref you don't argue with.", "Weekly. On time. The ring has rules; the street has ME."],
    recruit: ["You want in? The crew's always scouting. Show me heart first, mouth second.", "Everybody starts in the opening match. Work your way up."],
    informant: ["Information's currency — and I'm buying. Make it good, make it true.", "Talk. But if you're selling me fiction, I'll leave a review. A painful one."],
    mourning: ["We lost one of ours. The ring goes quiet tonight — the street too.", "He fought his fight. We remember. That's the whole eulogy."],
  },
  boxing: {
    promo: ["Hands up, {opponent}. These irons don't miss at {place}.", "You got heart? Good. I'm gonna need you to have it — for the highlight reel."],
    victory: ["Iron hands. Told you.", "Count it."],
    defeat: ["Caught one. Won't catch me twice."],
    confront: ["These hands don't care about the venue, {opponent}. Corner, ring — same result."],
    parley: ["Say your piece. Then we see if your jaw's as good as your mouth."],
    claim: ["New management on this block. The management hits back."],
    heat: ["No trouble, officer. Just two athletes... discussin'."],
    corpo: ["A suit with an offer. Cute. My hands don't sign contracts — but they END negotiations.", "Talk money. Then leave. The block's got a strict no-suits-standing-around policy."],
    hustle: ["The product better be as clean as my jab. It ain't? Then we got a problem.", "Cash first, product second, questions never. That's the whole deal."],
    civilian: ["Inside. Now. These hands are insured — you're not.", "Keep walking, friend. Nothing here but a conversation with consequences."],
    loyalty: ["My corner's my family. You cross 'em, you cross THESE. Simple math.", "Loyalty's like a chin — you either got one or you're on the canvas."],
    shakedown: ["The block pays for the privilege of my protection. Privilege costs. Weekly.", "Envelope. Thick. Don't make me come back — I charge for rematches."],
    recruit: ["You want to learn the craft? First lesson: show up. Second: shut up. Third: hands UP.", "I see hunger. Hunger plus discipline makes a FIGHTER. You got both?"],
    informant: ["You heard something? Spit it out. I pay for facts, not fairy tales.", "Information's leverage. Give me leverage and I'll remember you fondly."],
    mourning: ["Lost a good one. The gym goes quiet. The block goes quiet. Then we get BACK TO WORK — he'd want that.", "He had heart. Heart's forever. The rest is just... rounds."],
  },
  lucha: {
    promo: ["¡Lucha! At {place}, I fly and {opponent} falls.", "The mask stays on. The legend grows."],
    victory: ["¡Victoria! The high-flyers own the sky."],
    defeat: ["Even eagles land hard sometimes."],
    confront: ["¡El honor no conoce esquinas! You want this block? ¡Ven y tómalo!"],
    parley: ["Speak with honor or don't speak. The mask listens."],
    claim: ["This block flies under MY colors now. ¡Arriba!"],
    heat: ["Officer — the people love a show. No show tonight. Just... walking."],
    corpo: ["¡Un traje! The mask does not negotiate with suits — but the MAN beneath might. Briefly.", "Your employers want the block? The block has a GUARDIAN. That would be me."],
    hustle: ["The deal must be HONORABLE. Dishonor it, and the mask remembers. The mask never forgets.", "Fair price, clean product, no tricks — luchadores deal in honor, even here."],
    civilian: ["Señora, adentro — the mask will handle this. That is what the mask is FOR.", "Child, behind me. The people's champion stands between you and the wolves."],
    loyalty: ["Loyalty is the mask you NEVER remove. Betray it and you betray everything sacred.", "My people bleed for me; I bleed for THEM. That is the lucha way."],
    shakedown: ["The people pay tribute to their protector. It is tradition. It is HONOR. It is weekly.", "Your contribution keeps the mask watching over this block. A small price for a guardian."],
    recruit: ["You wish to learn lucha? First the heart, then the mask, then the SKY. In that order.", "I see fire in you. Fire, properly trained, becomes LEGEND."],
    informant: ["Speak, and speak TRUE — the mask can smell a lie the way others smell fear.", "Information given in honor is treasure. Information given in deceit is... a mistake."],
    mourning: ["Un guerrero ha caído. The arena of the street falls silent. Honor his memory.", "He flew high. Now he flies HIGHER. ¡Que descanse en paz!"],
  },
  mma: {
    promo: ["{opponent}: anywhere you go, I follow. Stand-up, ground — pick your poison at {place}.", "No single style. No single answer for me."],
    victory: ["Complete fighter. Complete victory.", "Anywhere the fight goes, I end it."],
    defeat: ["Back to the lab. The lab always answers."],
    confront: ["Anywhere you go, I follow — corner, cage, doesn't matter."],
    parley: ["Terms. Now. I don't negotiate twice."],
    claim: ["Complete fighter, complete block. It's mine."],
    heat: ["We're trainin', officer. Street conditioning. Very... legal."],
    corpo: ["Your employers want a fighter? They got one. Terms: mine. Duration: until I say otherwise.", "Suits love contracts. I love CONCLUSIONS. Let's see which wins."],
    hustle: ["The deal's clean or it's nothing. I fight complete — I deal complete.", "Product, price, no games. Anywhere you try to cheat, I'll follow."],
    civilian: ["Clear the area. This is about to become a training zone — unwilling participants get hurt.", "Inside. Whatever goes down, it goes down WITHOUT an audience."],
    loyalty: ["My team's my team — anywhere the fight goes, we go TOGETHER. That's complete loyalty.", "Betray the team and you're fighting EVERYWHERE alone. Good luck with that."],
    shakedown: ["The block's under my protection. Protection's a service. Services get PAID.", "Weekly tribute. Non-negotiable. Like gravity. Like my ground game."],
    recruit: ["You want to be complete? Start incomplete and HUNGRY. I'll build the rest.", "No single style, no single weakness — that's the goal. You in or out?"],
    informant: ["Give me intel. Good intel gets rewarded. Bad intel gets... cross-examined.", "Information is just scouting. Scout for me and I'll remember it."],
    mourning: ["We lost a teammate. Complete fighters honor their fallen — then get back in the cage.", "He went the distance. Every round. Respect. Now we carry his corner."],
  },
  striking: {
    promo: ["{opponent}, my range is a no-fly zone. Test it at {place}.", "One clean shot changes everything. I throw clean."],
    victory: ["Range. Timing. Done.", "Clean work."],
    defeat: ["Got inside my range once. Once."],
    confront: ["My range is a no-fly zone — and this whole corner is my range."],
    parley: ["One clean conversation. Then we see."],
    claim: ["Range. Timing. Territory. Done."],
    heat: ["Just stretchin', officer. Range work."],
    corpo: ["One clean offer. That's all you get. My patience has the same range as my jab — long, but FINITE.", "Suits talk. I measure distance. You're in range. Choose your next words carefully."],
    hustle: ["Clean exchange. One shot, one deal — no combinations, no tricks.", "The price is set at my range. Come inside it uninvited and you'll regret the distance."],
    civilian: ["Step back. My range is a no-fly zone and you're drifting into it.", "Inside. The striking zone is about to get... active. Spectators bleed."],
    loyalty: ["Range, timing, LOYALTY. The three fundamentals. You drop one, you drop all three.", "My crew stays at my back — inside my range, where I protect them. Betray that and you're OUTSIDE. Alone."],
    shakedown: ["The block pays for range coverage. My range covers the whole block. Do the math.", "Tribute. On time. My timing's perfect — yours better be too."],
    recruit: ["You want range? I'll teach you distance. First lesson: respect it. Second: OWN it.", "Timing can be taught. Heart can't. Show me heart and I'll give you range."],
    informant: ["Give me the intel straight — one clean shot of truth. No feints.", "Information at range is safe. Information up close gets... personal. Your choice."],
    mourning: ["One clean loss. The range feels emptier. We adjust, we remember, we continue.", "He had timing. Now he's out of range — permanently. We honor the distance he covered."],
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
