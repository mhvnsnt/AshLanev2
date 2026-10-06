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

  // ================== STREET WORLD (Urban Reign street life) ==================
  // Not the wrestling world. Turf, parleys, corpo suits, hustles, civilians, heat.
  {
    fighter: "Static",
    fighterId: "static",
    situation: "claim",
    context: "First night holding the corner off Cinder Plaza — addressing the block",
    lines: [
      "A'ight, listen up — this corner's got a new landlord, and the rent is RESPECT.",
      "I'm a really good guy, ask anybody — but this block eats when I say it eats, and it stays quiet when I say quiet. That's the menu.",
      "Y'all know the code: what happens on this corner stays on this corner. F*ck anybody who leaks — that's AWE behavior, and we don't do that here.",
    ],
  },
  {
    fighter: "Stick-Up",
    fighterId: "stickup",
    situation: "parley",
    context: "Two crews on Scrap Street, guns down, talking before it pops off",
    lines: [
      "Nobody moves. We talk.",
      "Your crew crossed the line at the market. My crew noticed. Now you got two choices: tribute, or consequences — and I don't repeat myself.",
      "The system made me. The streets kept me. Don't make the streets bury you.",
    ],
  },
  {
    fighter: "Corner Lieutenant",
    fighterId: "__lieutenant",
    situation: "confront",
    context: "Tax collection — a runner's crew hasn't paid, corner standoff at the bodega",
    lines: [
      "You standin' where? This is a taxed block, and your name ain't on the paid list.",
      "I don't care who your plug is. The crew feeds who the crew trusts — and right now, the crew don't trust your wallet.",
      "Walk away. That's the only warning with my name on it. The next one's got the crew's name on it.",
    ],
  },
  {
    fighter: "The Fixer",
    fighterId: "__fixer",
    situation: "corpo",
    context: "Black car idling by the curb — buyout offer for the block, no witnesses",
    lines: [
      "My employers admire what you've built here. Truly. They'd like to discuss an arrangement.",
      "Everyone has a price. I've never met the exception — but I've met people who needed convincing about theirs, and the convincing is... regrettable.",
      "This conversation didn't happen. The check I'm leaving on your hood? That happened.",
    ],
  },
  {
    fighter: "Corner Hustler",
    fighterId: "__hustler",
    situation: "hustle",
    context: "The deal goes wrong — buyer's crew shows up heavy, hustler talking fast",
    lines: [
      "Whoa whoa whoa — look, look, look, the pack's light 'cause the plug got pinched, not 'cause I'm playin' you!",
      "I can make this right — I know a guy, I ALWAYS know a guy, just don't make me a headline, baby!",
      "You didn't see me, I wasn't here — but if you need me tomorrow, I'm everybody's guy. EVERYBODY'S.",
    ],
  },
  {
    fighter: "Beat Cop",
    fighterId: "__cop",
    situation: "heat",
    context: "Curfew sweep — two crews gathering on the corner, he's alone and tired",
    lines: [
      "Evening. Curfew's in ten, and I can count at least three reasons to start writin'.",
      "I've seen how this ends — every time, same ending, different kids. This block's got enough ghosts.",
      "Go home. All of you. Don't make me do paperwork — you do NOT want to see me do paperwork.",
    ],
  },
  {
    fighter: "Sombra Negra",
    fighterId: "sombra_negra",
    situation: "hustle",
    context: "Hired for a street job — meeting the client in a doorway off Night Market",
    lines: [
      "Name the target. Name the price. Then leave — the less you know about the method, the cleaner your conscience.",
      "Negocios son negocios. Your crew's war is not my war. Your money, however... your money is very much my business.",
      "La trampa de plata. When it's done, you'll hear about it. You won't see it. That's what you paid for.",
    ],
  },
  {
    fighter: "Onyx",
    fighterId: "onyx",
    situation: "claim",
    context: "The Painted roll up on a rival corner — theatrical takeover, no shots fired",
    lines: [
      "Darlings! What a LOVELY corner. Shame about the... previous management. The paint's already dry — you're just now noticing.",
      "The Painted don't ask for blocks. We decorate them. And you, sweet thing — you're standing in our gallery now.",
      "Smile. It'll be your last good look at the old arrangement.",
    ],
  },
  {
    fighter: "Stan Combs",
    fighterId: "stan",
    situation: "loyalty",
    context: "Old head addressing the block — somebody's been talking to the cops",
    lines: [
      "I taught half this block how to stand. So when I say there's a rat, I know what a rat smells like.",
      "Loyalty's earned in years and lost in seconds. Whoever's been whisperin' to the badge — you got till sundown to come see me like a man.",
      "The block IS family out here. And family handles family business... in the family.",
    ],
  },
  {
    fighter: "Cipher",
    fighterId: "cipher",
    situation: "confront",
    context: "Corner standoff at the Pier — the shine cracking, sludge creeping in mid-talk",
    lines: [
      "Man of the hour, baby — and the hour says you're in MY spot. Back up.",
      "...You hear that? That static under the shine? Don't worry about it. Worry about the ten seconds it'll take me to end this.",
      "Too sweet to be stressed. Too blessed to be bothered. But the sludge? The sludge is BORED. And you look like entertainment.",
    ],
  },
  {
    fighter: "El Toro de Oro",
    fighterId: "toro",
    situation: "civilian",
    context: "A crew shaking down a shopkeeper — Toro steps between them",
    lines: [
      "¡BASTA! You shake down shopkeepers? Then you answer to the horns.",
      "Señora, vaya adentro. Lock the door. What the bull does to wolves is not for gentle eyes.",
      "Honor has no turf, but it has a POSTCODE — and this street is under my protection tonight.",
    ],
  },
  {
    fighter: "Triple X",
    fighterId: "triplex",
    situation: "parley",
    context: "Back-room negotiation — rival crew thinks they're bargaining, they're not",
    lines: [
      "Sit. I've read your terms. They're... quaint.",
      "You came here to negotiate territory. I've already redrawn the map — you're just now seeing the new borders.",
      "It's not personal. It's just... the game. And you, my friend, are several moves behind. Sign, or don't. The outcome's the same.",
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
