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
  // ================== WAVE 2 — street-world expansion ==================
  {
    fighter: "Hollow",
    fighterId: "hollow",
    situation: "shakedown",
    context: "Painted tax collection at a laundromat — the general sways in, laughing",
    lines: [
      "Heh... tribute time! The Painted's tax man is HERE — heh — and the machine's still running, so make it quick.",
      "The envelope. Thick. The general likes THICK — heh — makes the sway... smoother.",
      "Onyx provides PROTECTION. Protection costs. I'm the... heh... COLLECTOR. Pay the Painted or MEET the Painted. Heh... I'm the Painted. Hi.",
    ],
  },
  {
    fighter: "Static",
    fighterId: "static",
    situation: "recruit",
    context: "Static spots a hungry kid watching the corner a little too long",
    lines: [
      "Yo — kid. Yeah, you. You've been watchin' my corner for twenty minutes like it's television. You want to WATCH it or you want to EAT off it?",
      "Everybody starts runnin'. The smart ones end up OWNIN'. You look smart. Don't prove me wrong — I hate bein' wrong, my guy, it ruins my whole thing.",
      "First lesson's free: the block provides. Second lesson costs: the block REMEMBERS. You good with both? Then be here tomorrow. Early. Hungry.",
    ],
  },
  {
    fighter: "Corner Bodega Owner",
    fighterId: "__shopkeeper",
    situation: "shakedown",
    context: "Third envelope this month — the shopkeeper pays, and keeps the receipt book closed",
    lines: [
      "The envelope? AGAIN? I just paid — who was it, Tuesday? Was it you Tuesday? Everybody looks the same in a ski mask!",
      "Look, I pay, I pay — just don't break anything THIS time. The cooler door still sticks from LAST time.",
      "My cameras? Broken. Always broken. Amazing how often they're broken. Terrible wiring. Very sad. Here's the money.",
    ],
  },
  {
    fighter: "Cain Elias",
    fighterId: "cain",
    situation: "informant",
    context: "Parking garage, 2AM — Cain buying a rival crew's schedule",
    lines: [
      "Information is an ASSET. I'm acquiring assets today. Name your price — and understand I've already verified half of what you're about to say.",
      "Tell me what you know. Leave nothing out. Especially the parts that scare you — those are the parts I pay extra for.",
      "Sources are protected. Protection is what I DO. But liabilities get... liquidated. So be an asset, not a liability. Talk.",
    ],
  },
  {
    fighter: "Stan Combs",
    fighterId: "stan",
    situation: "mourning",
    context: "Corner memorial — candles, a photo taped to the light pole, Stan addressing the young ones",
    lines: [
      "I knew him when he was running packages. Now he's... gone. Pour one out.",
      "The young ones think they're immortal. The block teaches different. Listen — I need you to HEAR me on this.",
      "We don't cry long — we CAN'T. But we remember FOREVER. That's the block's promise. And when the time comes... we answer. Together.",
    ],
  },
  {
    fighter: "Stick-Up",
    fighterId: "stickup",
    situation: "informant",
    context: "Debriefing a runner who saw something on the east block",
    lines: [
      "Slow down. Start from who, then where, then WHEN. The Ashes pay for order — even in gossip.",
      "You sure? You BETTER be sure. I move on your word, your word moves ME — understand the weight?",
      "Good. That's good work. The crew remembers who brings truth. Now disappear for two days — and kid? You did right.",
    ],
  },
  {
    fighter: "Door Muscle",
    fighterId: "__bouncer",
    situation: "confront",
    context: "Two crews, one rope, one door — the bouncer holds the line",
    lines: [
      "The list is the list. Crew A's inside. Crew B — that's you — is OUTSIDE. That's geography, not disrespect.",
      "You can leave walking or you can leave carried. Your call. And before you choose — I've carried bigger than you. All night. Every night.",
      "Inside voices. Inside manners. Or outside. The rope doesn't move for NOBODY.",
    ],
  },
  {
    fighter: "Young Runner",
    fighterId: "__runner",
    situation: "heat",
    context: "Caught mid-run by the beat cop — the bag is definitely not gym clothes",
    lines: [
      "Officer! Me? I'm just RUNNING! Exercise! Very healthy! Cardio! You should try it!",
      "What's in the bag? ...Gym clothes! Very... rectangular gym clothes! Gotta go — I mean, am I FREE to go?",
      "I didn't see anything! I was running TOO FAST to see! That's my whole thing! Speed! Please don't check the bag!",
    ],
  },
  {
    fighter: "Onyx",
    fighterId: "onyx",
    situation: "recruit",
    context: "Onyx casting for the Painted — a prospect with the right face",
    lines: [
      "You have SUCH a face, darling — it would look DIVINE in paint. The bone structure, the hunger... yes.",
      "The Painted are always casting, sweetie — and you're AUDITIONING right now. Everyone wants to be SEEN. We make people UNFORGETTABLE.",
      "Talent, hunger, a little madness — you have all three, don't lie to me, I can SEE it. The paint's already mixed. Join us?",
    ],
  },
  {
    fighter: "The Fixer",
    fighterId: "__fixer",
    situation: "shakedown",
    context: "Black car collection — the fixer visits a shop behind on its arrangement",
    lines: [
      "My employers offer protection. The premium is weekly. You're... two weeks behind. Let's discuss what 'behind' means.",
      "Think of this as a SERVICE contract. The service is: nothing happens to you. The contract is: you pay. The penalty clause is: ME.",
      "The envelope. The arrangement requires it. The alternative requires... other people. People you don't want to meet.",
    ],
  },
  {
    fighter: "Echo",
    fighterId: "echo",
    situation: "mourning",
    context: "The memorial — Echo trying, for once, not to laugh",
    lines: [
      "He's gone? ...Oh. Oh no. Heheh — that's not funny. That's not funny at all. Sorry. Sorry.",
      "He was my FAVORITE audience. He laughed at ALL my impressions — even the bad ones. Especially the bad ones.",
      "We don't laugh tonight. The block's quiet. For HIM. ...I'll do his laugh, though. Forever. So he's still here. Heheh. ...Sorry.",
    ],
  },
  {
    fighter: "Cipher",
    fighterId: "cipher",
    situation: "shakedown",
    context: "Cipher collecting the shine tax from a corner store",
    lines: [
      "The shine costs money, baby — and you're lookin' at the bill. Everybody who glows under my spotlight pays for the electricity.",
      "This ain't a tax, it's a FAN CLUB fee. Membership includes: your shop, intact. Your windows, unbroken. ME, happy.",
      "The envelope, baby. Make it FAT. The hour demands it — and the hour is ALWAYS right.",
    ],
  },
  {
    fighter: "Maime",
    fighterId: "maime",
    situation: "informant",
    context: "The basement — Maime questioning someone who talked to the wrong people",
    lines: [
      "You HEARD something? Then you TOLD something. The basement wants to know the difference. Whisper it.",
      "Who told you? Tell ME. The basement has... questions. Just questions. Mostly. The other one is taking notes. In BLOOD.",
      "Information... tasty. But STALE information? I can SMELL stale. And what I smell right now... is FEAR. Good. Fear is fresh.",
    ],
  },
  {
    fighter: "Corner Lieutenant",
    fighterId: "__lieutenant",
    situation: "recruit",
    context: "Testing a prospect — the lieutenant watches, the crew watches",
    lines: [
      "You want to run with the set? First you run ERRANDS. Then you run BLOCKS. Then — maybe — you run THINGS. Most never get past errands.",
      "I see potential. Potential's just hunger with good PR. Show me DISCIPLINE. Show me SILENCE. Show me you can take an order from ME.",
      "Everybody starts at the bottom. The bottom's where I WATCH you. Impress me — or disappear. Those are the only two outcomes.",
    ],
  },
  {
    fighter: "Corner Hustler",
    fighterId: "__hustler",
    situation: "recruit",
    context: "The hustler spots a hungry kid and sees himself",
    lines: [
      "You want IN? I can put you ON! I know EVERYBODY! Well — I know a guy who knows everybody! Same thing!",
      "Start as a runner! Runners become EARNERS! Earners become... look, just start running! I'll show you the ropes! I KNOW ropes!",
      "The crew's hiring! You look hungry! Hungry's GOOD! Hungry plus ME equals... employed! Probably! Let's GO!",
    ],
  },
  {
    fighter: "Beat Cop",
    fighterId: "__cop",
    situation: "informant",
    context: "Flipping a corner kid — the cop plays it straight, for once",
    lines: [
      "You want to talk? Talk. But it better be GOOD — my captain grades on a curve, and I grade on GUTS.",
      "Information buys leniency. Not innocence — LENIENCY. Big difference. Give me something I can USE.",
      "I've walked this beat twelve years. I know you're scared. Everybody's scared. The brave ones talk ANYWAY.",
    ],
  },
  {
    fighter: "El Toro de Oro",
    fighterId: "toro",
    situation: "shakedown",
    context: "Toro interrupts a crew shaking down a laundromat owner",
    lines: [
      "¡BASTA! You collect tribute from the DEFENSELESS? Then you answer to the horns. That is the whole negotiation.",
      "Señora — the bull handles the wolves. You handle the door. Lock it, por favor.",
      "The bull does not permit TAXES on the innocent. Your operation ends HERE. With honor — or without teeth. Choose.",
    ],
  },
  {
    fighter: "Sombra Negra",
    fighterId: "sombra_negra",
    situation: "mourning",
    context: "A contractor's grave — Sombra pays respects her way",
    lines: [
      "You were professional. Clean. On time. In our business, that's... that's everything.",
      "I don't do eulogies. I do INVOICES — and yours is marked PAID IN FULL. Rest.",
      "Whoever did this mistook you for a soft target. They'll learn. Professionals always... collect.",
    ],
  },
  {
    fighter: "Edwin Kennedy",
    fighterId: "edwin",
    situation: "recruit",
    context: "Edwin building his entourage — the pitch is pure Kennedy",
    lines: [
      "You! Kid! You got the LOOK! EDWIN... KENNEDY... is always scouting! Interested in GREATNESS?",
      "I'm building an ENTOURAGE. Requirements: loyalty, hustle, and the ability to say my name LOUD. Can you say it loud? Let me HEAR it.",
      "Stick with me and you'll learn from the BEST. That's me. I'm the best. The block's ratings go UP just by association. Any questions? No? Good.",
    ],
  },
  {
    fighter: "Static",
    fighterId: "static",
    situation: "mourning",
    context: "The block after a loss — Static addresses the corner",
    lines: [
      "We lost one of ours. So tonight the block goes quiet — no music, no loud talkin'. Just... quiet.",
      "He was block. He was FAMILY. You don't get over that, my guy — you get EVEN. When it's time. Not before. WHEN IT'S TIME.",
      "Pour one out. Say his name. And remember — the corner he stood on is STILL OURS. Certified. Forever.",
    ],
  },
  // ================== WAVE 3 — Bannon repo / book port ==================
  {
    fighter: "Maime",
    fighterId: "maime",
    situation: "confront",
    context: "Book-verbatim liturgy on the street — the face-painted alter-ego holds a corner",
    lines: [
      "There is no return. There is only Bannon. And Bannon is CONTROL — and this corner? This corner is BANNON'S.",
      "They took your voice, your name. They exposed you. You need an identity that cannot be stripped, controlled, or copyrighted. I AM that identity.",
      "Your mommy can't save you! Nobody saves us! You have to feel the pain, you have to CONFESS! I know what it's like to be lied to! I HATE THE LIES!",
    ],
  },
  {
    fighter: "Stick-Up",
    fighterId: "stickup",
    situation: "parley",
    context: "The Reverend mode surfaces mid-negotiation — sermon cadence, Isaiah 55:8",
    lines: [
      "The so-called peacemakers! They preach of deals and truces! But I say to you — a deal without HONOR is the Devil's first, most seductive lie!",
      "'My thoughts are not your thoughts, neither are your ways my ways, declares the Lord.' Your terms are YOUR thoughts. My corner runs on HIGHER thoughts.",
      "I have stared into the face of death — seven times! — and the Lord used that chaos to forge me! I am the vessel! So talk — but talk TRUE.",
    ],
  },
  {
    fighter: "Cain Elias",
    fighterId: "cain",
    situation: "civilian",
    context: "The caregiver contrast — the Executioner shielding a shopkeeper, and meaning it",
    lines: [
      "Ma'am — inside. Quickly. You run the shop? Then you're under my protection.",
      "I volunteer at the community center Tuesdays. Anonymous. Nobody knows. This — right here — is the same thing. The block stays SAFE. That's not a threat, it's a PROMISE.",
      "Go. Lock the door. What happens next is... administrative. You don't need to see administration.",
    ],
  },
  {
    fighter: "Edwin Kennedy",
    fighterId: "edwin",
    situation: "promo",
    context: "Book-voiced wrestling promo — the Paralyzed Perfectionist frames the match as Greek Tragedy",
    lines: [
      "EDWIN... KENNEDY! ...You call this a RIVALRY? I've read the classics — this isn't a rivalry, it's a TRAGEDY. And you're not the hero. You're the WARNING.",
      "My legacy isn't built on matches — it's built on ERASURES. Ask the historians. Actually — don't. They work for ME.",
      "They'll write about this one. They always do. The only question, my guy, is whether you're the triumph... or the FOOTNOTE.",
    ],
  },
  {
    fighter: "Stan Combs",
    fighterId: "stan",
    situation: "promo",
    context: "Book-voiced wrestling promo — the Avid Collector applies watchmaker precision to violence",
    lines: [
      "I've restored watches worth more than your career. Precision. Patience. Pressure. That's how you take apart a MAN.",
      "The Cyborg Project taught me everything breaks on schedule. Gears. Men. Empires. Your schedule just came up.",
      "You don't want this smoke, kid. Not from me. I don't do smoke — I do MECHANISMS. And you're already inside one.",
    ],
  },
  {
    fighter: "Sombra Negra",
    fighterId: "sombra_negra",
    situation: "parley",
    context: "The mercenary tempts a street crew toward corporate control — book canon",
    lines: [
      "The Combine pays better than the street. I've done the math — I ALWAYS do the math. Consider... an upgrade.",
      "You fight for corners. I fight for CONTRACTS. One of us is thinking bigger. It's me.",
      "Negocios son negocios. The street is a business with bad margins. Let me introduce you to better margins.",
    ],
  },
  {
    fighter: "Maime",
    fighterId: "maime",
    situation: "shakedown",
    context: "The basement collects — book-verbatim liturgy as tax policy",
    lines: [
      "You need steel. They are weak, but I am the truth. The envelope — or I take it out in CONSEQUENCE.",
      "They took your voice, your name — now I take your MONEY. The basement has... overhead.",
      "There is no Justice. There is only Consequence. You want justice? Call the cops. You want CONSEQUENCE? Pay.",
    ],
  },
  {
    fighter: "Stick-Up",
    fighterId: "stickup",
    situation: "loyalty",
    context: "Vessels don't leak — the Reverend tests the crew's faith",
    lines: [
      "The Lord made me a vessel — and vessels don't LEAK. You leak, you're not a vessel. You're a PUDDLE.",
      "I am the bridge! The only way out of the pit of your doubt! You cross with me or you stay IN the pit.",
      "Seven times I've stared down death — and every time, the crew was BESIDE me. That's not loyalty, that's SCRIPTURE.",
    ],
  },
  {
    fighter: "Cain Elias",
    fighterId: "cain",
    situation: "shakedown",
    context: "Contributions — the caregiver's tax code",
    lines: [
      "The center runs on donations. The block runs on... contributions. You're contributing. Weekly.",
      "Your tribute keeps the peace. The peace keeps the CENTER open. Think of it as charity. With consequences.",
      "I volunteer Tuesdays. Anonymous. This — this is me volunteering RIGHT NOW. You're welcome.",
    ],
  },
  {
    fighter: "Maime",
    fighterId: "maime",
    situation: "parley",
    context: "A negotiation with the alter-ego — talk fast",
    lines: [
      "Talk? TALK? The nice ones talk. Then they EXPOSE you. Then they take your work. So talk FAST.",
      "He's lying! Partnership is a lie! He wants to control me too! ...What were we discussing? Oh. Terms. STATE THEM.",
      "Control? You only control the ones who haven't hurt you yet. Talk — before you hurt me.",
    ],
  },
  {
    fighter: "Stick-Up",
    fighterId: "stickup",
    situation: "mourning",
    context: "The Reverend buries a soldier — the leap of faith, landed",
    lines: [
      "We lost a soldier. The Lord giveth, the street taketh away — and the street's about to GIVE BACK. With interest.",
      "He stared down death with me. Now he's... with the Lord. The LEAP OF FAITH finally landed.",
      "No tears. Vessels don't leak — remember? We remember him LOUD, and we answer LOUDER.",
    ],
  },
  {
    fighter: "Cain Elias",
    fighterId: "cain",
    situation: "recruit",
    context: "The application — youth mentor by day, Combine enforcer by night",
    lines: [
      "You want to serve? Good. I serve — the Combine, the center, the block. Service is service. Start by carrying this.",
      "The youth program needs mentors. The block needs soldiers. Funny — same application. Fill it out.",
      "Tuesdays I teach kids to read. The other six days I teach the block to OBEY. Both are... nurturing.",
    ],
  },
  {
    fighter: "Triple X",
    fighterId: "triplex",
    situation: "heat",
    context: "The Administration encounters the badge — documented",
    lines: [
      "Officer. The Administration has an arrangement with your precinct. Check with your captain. I'll wait.",
      "This encounter is... documented. How it's filed depends on your next sentence. Choose the sentence carefully.",
      "We're both in enforcement, you and I. Mine just has better FUNDING. Walk away documented as cooperative.",
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
