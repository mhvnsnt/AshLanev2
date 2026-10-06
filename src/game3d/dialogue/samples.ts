/**
 * samples.ts — hand-written dialogue showcase pack.
 *
 * This is the bar: every generated line should feel like it could sit next to
 * these. Static gets the most — his voice is the owner's spec.
 *
 * Format: each sample = { fighter, situation, context, lines[] }.
 * The game can play these verbatim; the generator (generator.ts) covers the
 * long tail of fighter × situation combos these don't.
 */

import type { Situation } from "./voice-bibles";

export interface DialogueSample {
  fighter: string;
  fighterId: string;
  situation: Situation;
  context: string;
  lines: string[];
}

export const SAMPLE_PACK: DialogueSample[] = [
  // ============================ STATIC (the bar) ============================
  {
    fighter: "Static",
    fighterId: "static",
    situation: "backstage",
    context: "Judas' street interview — addressing the bus scuffle with Brian Cage's guy and the leaked backstage fights",
    lines: [
      "That's funny, man. I've never heard anybody talk about that incident ever.",
      "I'm not a d*ck. I'm just a really good guy, but you take my kindness for weakness I immediately throw hands. I never spoke about this and I never really will.",
      "Hey bro, I had to fight for everything I got. I didn't get where the f*ck I got being some pushover slump p*ssy b*tch. Never.",
      "When sh*t hit the fan backstage or when I had to go walk in a room and speak to Edwin Kennedy one-on-one or when I had to go talk to Triple X and Stan Combs one-on-one, those conversations stayed there.",
      "With the boys, the same bullsh*t. If I fistfought another guy in the locker room you probably never heard of it because I probably f*cking won.",
      "I appreciate that what happens in the JCPW locker room as far as fistfights never left. F*ck AWE for all the p*ssy-ass fighting that they do over there and letting it leak and sh*t.",
    ],
  },
  {
    fighter: "Static",
    fighterId: "static",
    situation: "promo",
    context: "Pre-match promo, Cinder Plaza, vs Wreck Patterson",
    lines: [
      "That's funny, man. Y'all put Wreck Patterson in front of ME? At the plaza? In front of MY people?",
      "Listen — I'm a really good guy. Ask anybody in that locker room. But Wreck keeps runnin' that mouth about what happened on that bus, and lemme tell you somethin', my guy —",
      "What happens in JCPW stays in JCPW. That's the code. But codes don't cover what I'm about to do to him in that ring, 'cause that's not backstage. That's business. And business is about to get CERTIFIED.",
    ],
  },
  {
    fighter: "Static",
    fighterId: "static",
    situation: "callout",
    context: "Calling out an AWE leaker by name",
    lines: [
      "Yo — you. Yeah, YOU, the one runnin' to the dirt sheets every time somebody gets touched up backstage.",
      "In JCPW, real ones handle it. In AWE, y'all file a report. That's the difference between a locker room and a daycare, my guy.",
      "Keep my name out your mouth unless you're ready to back it up with hands. And we both know how that ends — 'cause last time, nobody heard about it. 'Cause I WON.",
    ],
  },
  {
    fighter: "Static",
    fighterId: "static",
    situation: "victory",
    context: "Post-win, still holding the mic, crowd buzzing",
    lines: [
      "TOLD you! Bona fide! Certified! How you doin', Cinder Plaza?!",
      "And for everybody at AWE watchin' at home — that's how you handle business WITHOUT leakin' it. Take notes, my guy.",
    ],
  },
  {
    fighter: "Static",
    fighterId: "static",
    situation: "street",
    context: "Judas catches him outside the venue, asks about the Edwin Kennedy sit-down",
    lines: [
      "The sit-down with Edwin? That's funny, man.",
      "Me and Edwin went one-on-one, behind closed doors, like men. What was said in that room stays in that room — that's the CODE.",
      "But I'll say this: he walked in loud and he walked out... respectful. That's all you get. Next question, my guy.",
    ],
  },
  {
    fighter: "Static",
    fighterId: "static",
    situation: "defeat",
    context: "Rare post-loss — jaw tight, mic shaking slightly",
    lines: [
      "A'ight. A'ight. Y'all got your moment.",
      "But listen — I had to fight for everything I got, and I ain't never been a pushover, so understand this: that was ONE night.",
      "Run it back. Anywhere. Behind closed doors, in the ring, on a bus — I don't care. And this time it stays in the room, 'cause this time I'm takin' it personal.",
    ],
  },

  // ============================ CIPHER ============================
  {
    fighter: "Cipher",
    fighterId: "cipher",
    situation: "promo",
    context: "Pre-match, Night Market, feeling the sludge creep in",
    lines: [
      "Man of the hour, baby! Night Market, you ready to watch me work?",
      "...You feel that? That static under the shine? Don't worry about it. Worry about the fact that in about ten minutes, I'm still gonna be the moment — and you're gonna be the footnote.",
      "Too sweet to be stressed. Too blessed to be bothered. Watch me work.",
    ],
  },
  {
    fighter: "Cipher",
    fighterId: "cipher",
    situation: "backstage",
    context: "After a match where the sludge psycho took over mid-fight",
    lines: [
      "I don't... I don't remember the third round. They tell me I was smilin'.",
      "The shine's still mine. It just... it gets loud in here sometimes. The hour demands things, you know?",
      "Don't look at me like that. Watch me work — I'll be fine. I'm always fine.",
    ],
  },

  // ============================ ECHO ============================
  {
    fighter: "Echo",
    fighterId: "echo",
    situation: "callout",
    context: "Calling out Sombra Negra — who steals finishers, which Echo finds DELIGHTFUL",
    lines: [
      "Ooooh, the Finisher Thief! You steal moves? I steal moves! We're gonna get along GREAT — heheh — or one of us is gonna get hurt tryin'.",
      "You take my best move, I'll take it BACK, and then I'll do YOURS, and then we'll just keep tradin' till somebody naps! Echo echo echo... who's nappin', Sombra?",
    ],
  },
  {
    fighter: "Echo",
    fighterId: "echo",
    situation: "weighin",
    context: "Staredown with Titan — she has to look straight up",
    lines: [
      "...You're BIG. Heheh. That's okay! Big trees fall the loudest — TIMBER!",
      "Don't blink, big guy. Actually — DO blink. I wanna see if the ground shakes.",
    ],
  },

  // ============================ STICK-UP ============================
  {
    fighter: "Stick-Up",
    fighterId: "stickup",
    situation: "promo",
    context: "Pre-match, Scrap Street — the system wants him back",
    lines: [
      "They built me to be a weapon. Then they lost control of the weapon. Now they send boys to collect.",
      "Scrap Street. Tonight. Whoever they send — you already know what it is.",
      "Talk is cheap. Hands ain't.",
    ],
  },
  {
    fighter: "Stick-Up",
    fighterId: "stickup",
    situation: "faction",
    context: "Addressing the Ashes — the block remembers",
    lines: [
      "The Ashes don't recruit. We recognize.",
      "The block remembers who stood up when it cost somethin'. The rest is noise.",
      "We move tonight. Quiet. Together. Like always.",
    ],
  },

  // ============================ MAIME ============================
  {
    fighter: "Maime",
    fighterId: "maime",
    situation: "promo",
    context: "Pre-match, no venue announced — he just showed up",
    lines: [
      "You don't know me. You know the version that SURVIVED.",
      "He keeps me in the basement, you know. The basement's got no windows. But tonight — tonight somebody left the door open.",
      "Burn it down and dance in it! BURN IT DOWN AND DANCE IN IT!",
    ],
  },

  // ============================ SOMBRA NEGRA ============================
  {
    fighter: "Sombra",
    fighterId: "sombra_negra",
    situation: "callout",
    context: "Calling out El Toro de Oro — she wants the bull's best",
    lines: [
      "Toro. Your faena is beautiful. I've watched the tapes — all of them.",
      "Bring your best move to the ring. Your bravest, proudest finish. I'll take it gently... and then I'll end you with it.",
      "La trampa de plata, torito. The silver trap. Negocios son negocios.",
    ],
  },
  {
    fighter: "Sombra Negra",
    fighterId: "sombra_negra",
    situation: "victory",
    context: "Just beat someone with their own finisher",
    lines: [
      "Your best move. My favorite weapon. Gracias.",
      "The invoice is paid. Next contract.",
    ],
  },

  // ============================ ONYX ============================
  {
    fighter: "Onyx",
    fighterId: "onyx",
    situation: "promo",
    context: "Dark Clown Faction rally before a big card",
    lines: [
      "Welcome, my lovelies, to the greatest show the ward has ever SEEN.",
      "Tonight the Painted dance, the crowd screams, and somebody's beautiful face learns what the paint is FOR.",
      "The paint never comes off, baby. Neither does tonight.",
    ],
  },

  // ============================ EL TORO DE ORO ============================
  {
    fighter: "El Toro de Oro",
    fighterId: "toro",
    situation: "callout",
    context: "Answering Sombra Negra's challenge — honor demands it",
    lines: [
      "Sombra Negra. You study the bull, but you do not KNOW the bull.",
      "You want my faena? Come and take it with honor — man to... sombra. If you steal it like a thief, the herd will remember you as one.",
      "¡El toro no se arrodilla! The bull does not kneel — not for contracts, not for traps, not for YOU.",
    ],
  },

  // ============================ CAIN ELIAS ============================
  {
    fighter: "Cain Elias",
    fighterId: "cain",
    situation: "promo",
    context: "Combine-mandated statement before a restructuring match",
    lines: [
      "Per the quarterly review, your performance has been flagged as a liability.",
      "Restructuring begins tonight at the venue. This is just business.",
      "Your file's already closed. I'm just here to process the termination.",
    ],
  },

  // ============================ EDWIN KENNEDY ============================
  {
    fighter: "Edwin Kennedy",
    fighterId: "edwin",
    situation: "promo",
    context: "Grabbing the mic before the announcer finishes",
    lines: [
      "EDWIN... KENNEDY! ...Thank you. You're welcome. Please, hold your applause — actually, don't. Let it wash over me.",
      "Tonight, some poor soul gets to tell his grandkids he shared a ring with a SUPERSTAR. You're welcome in advance.",
    ],
  },

  // ============================ TRIPLE X ============================
  {
    fighter: "Triple X",
    fighterId: "triplex",
    situation: "promo",
    context: "Rare address — the Combine throne speaks",
    lines: [
      "You think this is about tonight. It's adorable, really.",
      "Every alliance you've made, every favor you've called in — I arranged the board years ago.",
      "It's not personal. It's just... the game. And I don't play checkers.",
    ],
  },

  // ============================ STAN COMBS ============================
  {
    fighter: "Stan Combs",
    fighterId: "stan",
    situation: "backstage",
    context: "Asked about the sit-down with Static",
    lines: [
      "What was said in that room stays in that room.",
      "...Kid's got fire. I'll give him that. Once.",
      "Talk's over.",
    ],
  },
  // ============================ THE NARRATOR ============================
  {
    fighter: "The Narrator",
    fighterId: "__narrator",
    situation: "street",
    context: "Loading screen / menu idle — talking to the player",
    lines: [
      "Heheh. You saw that, right? The shadows keep receipts, player.",
      "While this loads — purple means me. Red means... somebody you'll meet later. Remember that.",
    ],
  },

];

/** Samples for one fighter — for character-select flavor, bios, etc. */
export function samplesFor(fighterId: string): DialogueSample[] {
  return SAMPLE_PACK.filter((s) => s.fighterId === fighterId);
}

/** All situations covered in the pack. */
export function sampleSituations(): Situation[] {
  return [...new Set(SAMPLE_PACK.map((s) => s.situation))];
}
