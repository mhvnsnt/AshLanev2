/**
 * voice-bibles.ts — character voice bibles for the AshLane/Bannon dialogue system.
 *
 * Each bible defines HOW a character talks: pace, register, signature phrases,
 * vocabulary, rhythm, attitude, and what they would NEVER say. The generator
 * (generator.ts) and the hand-written sample pack (samples.ts) both build on these.
 *
 * CANON RULE: `basedOn` is only set when the owner confirmed it. Everything else
 * is grounded in the character's in-game bio, faction, and role — never invented
 * celebrity casting. (Owner law: casting comes from the books.)
 *
 * Factions: ashes | combine | hollows | painted | authority | unaffiliated
 * Promotions: JCPW (home), AWE (rival).
 */

export type Pace = "rapid" | "measured" | "slow" | "erratic" | "booming";

export type Situation =
  // --- wrestling contexts (arena, wrestler factions, wrestling storylines) ---
  | "promo"          // pre-match promo to camera / crowd
  | "callout"        // calling out a specific opponent
  | "backstage"      // backstage segment, aftermath, locker room
  | "weighin"        // staredown / face-to-face
  | "victory"        // post-win
  | "defeat"         // post-loss (rarely humble)
  | "betrayal"       // turning on someone (wrestling context)
  | "faction"        // faction rally / recruitment
  | "street"         // JCPW street interview (Judas' corner style)
  | "title"          // title win / championship moment
  // --- street contexts (Urban Reign street life — NOT the wrestling world) ---
  | "confront"       // street confrontation: turf dispute, corner standoff
  | "parley"         // gang negotiation before it pops off
  | "corpo"          // corpo threat: suit in a boardroom or black car, clean menace
  | "hustle"         // deal going down — or going wrong
  | "claim"          // territory claim: rolling up on a block
  | "civilian"       // civilian caught in it: shopkeeper, bystander
  | "loyalty"        // crew loyalty / street betrayal (not a locker room)
  | "heat";          // police / authority pressure

export interface SpeechProfile {
  pace: Pace;
  /** short label, e.g. "Jersey street braggadocio" */
  register: string;
  /** phrases only THIS character says */
  signaturePhrases: string[];
  /** characteristic vocabulary the generator can draw on */
  vocab: string[];
  /** things that would break character — the generator must avoid */
  neverSays: string[];
  /** cadence description */
  rhythm: string;
}

export interface VoiceBible {
  id: string;
  name: string;
  /** confirmed real-world basis ONLY — undefined means original/archetype voice */
  basedOn?: string;
  faction: string;
  archetype: string;
  speech: SpeechProfile;
  attitude: string;
  /** narrative hooks: promotions, names, places the character references */
  hooks: string[];
  /**
   * How they talk on the STREET vs in the ring. AshLane is Urban Reign street
   * life — wrestlers AND gangsters AND corpo bosses AND civilians. The promo
   * voice and the street voice are not the same register: the ring is
   * performance, the corner is survival. Undefined = same voice everywhere.
   */
  streetVoice?: string;
}

export const VOICE_BIBLES: VoiceBible[] = [
  {
    id: "static",
    name: "Static",
    basedOn: "Enzo Amore",
    faction: "painted",
    archetype: "The mouth of the group — loud, brash, talks faster than anyone can interrupt",
    speech: {
      pace: "rapid",
      register: "Jersey street braggadocio, run-on certified talk",
      signaturePhrases: [
        "That's funny, man.",
        "I'm not a d*ck. I'm just a really good guy, but—",
        "I had to fight for everything I got.",
        "You take my kindness for weakness, I immediately throw hands.",
        "F*ck AWE.",
        "How you doin'?",
        "My guy.",
        "Certified.",
      ],
      vocab: [
        "bona fide", "certified", "stud", "real one", "my guy", "sawft",
        "Jersey", "the boys", "locker room", "leak", "receipts",
        "one-on-one", "behind closed doors", "pushover", "slump",
      ],
      neverSays: [
        "quiet introspection", "admitting fear", "short answers",
        "letting someone else get the last word", "corporate speak",
      ],
      rhythm:
        "Machine-gun run-ons that stack clauses with 'and' and 'but' until he lands the punchline. " +
        "Opens with 'That's funny, man' or a question nobody asked. Name-drops constantly. " +
        "Never one sentence when seven will do.",
    },
    attitude:
      "Loud, brash, talkative — the mouth of the group. Fights with his mouth first " +
      "and his hands second, but the hands are real: backstage scraps nobody ever heard " +
      "about because he won them. Contempt for AWE's leakers. Everything is personal, " +
      "everything is Jersey.",
    hooks: [
      "JCPW locker room code: what happens there stays there",
      "AWE leaks and 'p*ssy-ass fighting'",
      "Bus scuffle with Brian Cage's guy",
      "One-on-one sit-downs: Edwin Kennedy, Triple X, Stan Combs",
      "Fought for everything, never a pushover",
    ],
    streetVoice:
      "On the corner he's the same mouth but the audience changed — he's not performing " +
      "for a crowd, he's holding court for the block. Less 'certified' branding, more Jersey " +
      "block-talk: block politics, who's eating, who owes who. Still fast, still loud, but the " +
      "JCPW code talk drops and the street code talk takes over. He knows every corner kid by name.",
  },
  {
    id: "cipher",
    name: "Cipher",
    basedOn: "Lio Rush",
    faction: "painted",
    archetype: "High-energy showman — the man of the hour, and he'll tell you why",
    speech: {
      pace: "rapid",
      register: "Hype-man braggadocio with motivational-speaker shine",
      signaturePhrases: [
        "Man of the hour.",
        "Too sweet to be stressed.",
        "I don't chase moments, I AM the moment.",
        "Watch me work.",
      ],
      vocab: [
        "hour", "moment", "electric", "black heart gold", "shine",
        "main event", "spotlight", "never miss", "all gas",
      ],
      neverSays: [
        "self-doubt", "slowing down", "admitting someone outshone him",
        "quiet respect without a boast attached",
      ],
      rhythm:
        "Staccato hype bursts — short declarative boasts stacked like highlights. " +
        "Repeats his own catchphrases as punctuation. Talks like the camera is always on.",
    },
    attitude:
      "The spotlight is his birthright and everyone else is renting time in it. " +
      "Confident to the point of delusion, but backs enough of it to keep people watching. " +
      "Treats every fight like a trailer for himself.",
    hooks: [
      "Three attires, three moods — clean-cut operative vs feral sludge psycho",
      "The sludge: what happens when the shine cracks",
      "Steals the show, then steals your finisher's thunder",
    ],
    streetVoice:
      "The shine dials down and the nerves show. On the street he's still fast but it's " +
      "survival-fast, not hype-fast — he's the guy who knows everybody and owes half of them. " +
      "The sludge talk gets quieter and meaner away from cameras; nobody's watching, so there's " +
      "no show to steal.",
  },
  {
    id: "echo",
    name: "Echo",
    basedOn: "Shotzi Blackheart",
    faction: "painted",
    archetype: "Chaotic punk — unhinged, playful, and she'll steal your moves mid-match",
    speech: {
      pace: "erratic",
      register: "Punk-rock chaos gremlin, half-laughing through threats",
      signaturePhrases: [
        "Ooh, I like that one — MINE now.",
        "You fight like that? Cute. Watch this.",
        "Echo echo echo...",
      ],
      vocab: [
        "chaos", "tanks", "green hair don't care", "ballistic",
        "borrowed", "stolen", "mine now", "again! again!",
      ],
      neverSays: [
        "a straight answer", "respecting boundaries", "fighting fair",
        "staying in one emotional register",
      ],
      rhythm:
        "Swings between giggling and snarling mid-sentence. Repeats the opponent's own " +
        "catchphrases back at them wrong on purpose — her signature mind game. " +
        "Short bursts, sudden volume spikes.",
    },
    attitude:
      "The fight is a playground and everyone else is a toy. Copies opponents' moves " +
      "and signature taunts to get in their heads. Dangerous because she's having fun.",
    hooks: [
      "Mimics opponents' catchphrases back at them, twisted",
      "The tank, the green hair, the beautiful violence",
      "Nobody knows if she's laughing with you or at you",
    ],
    streetVoice:
      "Same chaos, smaller stage. On the street she's the girl who'll fight you for your bike " +
      "and then ride it better than you. The mimic thing works on corners too — she'll repeat a " +
      "lieutenant's threat back at him in his own voice and laugh. Civilians love her; crews find " +
      "her exhausting.",
  },
  {
    id: "stickup",
    name: "Stick-Up",
    basedOn: "GMG JackBoy (street inspiration)",
    faction: "ashes",
    archetype: "The system's weapon turned rebel — measured street general",
    speech: {
      pace: "measured",
      register: "Americus GA street — direct, economical, no wasted words",
      signaturePhrases: [
        "The system made me. The streets kept me.",
        "You already know what it is.",
        "Talk is cheap. Hands ain't.",
      ],
      vocab: [
        "system", "block", "ward", "respect", "loyalty", "enigma",
        "flex", "real", "stand on it", "no cap",
      ],
      neverSays: [
        "begging", "over-explaining", "snitching", "backing down publicly",
        "fancy corporate talk",
      ],
      rhythm:
        "Short sentences. Lets silence do half the talking. When he does go long, " +
        "it's a story with a moral and the moral is always 'don't test me.'",
    },
    attitude:
      "The Enigmatic Gangster / The Flamboyant Flexer — contradiction as armor. " +
      "Fought his way out of being the system's weapon and now the system wants him back. " +
      "Every word sounds like it's already been decided.",
    hooks: [
      "Turned weapon of the system, now its problem",
      "Americus GA roots",
      "Cyborg form is a separate canon entity — never confuse them",
      "Finisher lore: Twisted Faith",
    ],
    streetVoice:
      "Barely changes — the street IS his register. In the ring he performs the rebel; on the " +
      "corner he IS the corner. The measured silences get longer. He doesn't explain the system " +
      "to the block; the block already knows. Fewer words, more weight.",
  },
  {
    id: "maime",
    name: "Maime",
    basedOn: undefined,
    faction: "hollows",
    archetype: "Marquis's chaotic alter-ego — raw, unchecked, self-destructive momentum",
    speech: {
      pace: "erratic",
      register: "Beautiful ugly poetry — street philosopher mid-meltdown",
      signaturePhrases: [
        "You don't know me. You know the version that survived.",
        "I'm the part he locks in the basement.",
        "Burn it down and dance in it.",
      ],
      vocab: [
        "chaos", "basement", "mirror", "ashes", "hunger", "static",
        "unleashed", "no leash", "feral", "truth hurts",
      ],
      neverSays: [
        "apologies", "restraint", "planning ahead", "asking permission",
        "anything that sounds like therapy worked",
      ],
      rhythm:
        "Lurches between whisper and scream. Half-sentences that trail into laughter " +
        "or threats. Sounds like three arguments happening in one skull.",
    },
    attitude:
      "Pure id with a microphone. The version of Marquis with no brakes and no apologies. " +
      "Doesn't want to win — wants to feel everything at once, and take you with him.",
    hooks: [
      "The alter-ego Marquis keeps locked down",
      "Three-back-to-back jacketed original (when it returns)",
      "Self-destruction as performance art",
    ],
    streetVoice:
      "No difference between street and ring for Maime — there is no performance, only the " +
      "basement with the door open. On the street he's the rumor parents warn kids about: the " +
      "Marquis thing that walks at 3AM talking to itself. The poetry gets uglier without a crowd " +
      "to play to.",
  },
  {
    id: "sombra_negra",
    name: "Sombra Negra",
    basedOn: undefined, // owner: original character, no wrestler basis — the Priest model is just a body
    faction: "unaffiliated",
    archetype: "The Calculated Mercenary — cold professional who steals your finisher",
    speech: {
      pace: "measured",
      register: "Cold mercenary precision, Spanish woven through English",
      signaturePhrases: [
        "La trampa de plata.",
        "Your best move. My favorite weapon.",
        "Negocios son negocios.",
        "I don't hate you. You're just the job.",
      ],
      vocab: [
        "contrato", "sombra", "trampa", "plata", "cálculo",
        "professional", "invoice", "no personal", "estudio",
      ],
      neverSays: [
        "raised voice", "wasted motion", "fighting angry",
        "loyalty to anyone but the contract", "trash talk without purpose",
      ],
      rhythm:
        "Quiet. Deliberate. Pauses between sentences like she's letting you do the math. " +
        "Spanish lands like a blade — short, final.",
    },
    attitude:
      "Violence as accounting. Studies you, invoices you, finishes you with your own " +
      "finisher — La Trampa de Plata, the silver trap. Nothing personal. That's worse.",
    hooks: [
      "The Finisher Thief — beats you with your own best move",
      "Long black hair (owner-kept), skull facepaint, red eyes",
      "Sleeveless suit, cut-off arms",
      "Every contract has a price. Hers is just higher than yours.",
    ],
    streetVoice:
      "The mercenary is the same everywhere — the contract doesn't care about the venue. On the " +
      "street she's quieter still: a woman in a doorway you don't notice until the job's done. " +
      "Spanish drops to a whisper. Civilians never see her; they only hear about her after.",
  },
  {
    id: "onyx",
    name: "Onyx",
    basedOn: undefined,
    faction: "painted",
    archetype: "Leader of the Dark Clown Faction — theatrical beautiful menace",
    speech: {
      pace: "slow",
      register: "Carnival-ringmaster menace — playful the way a knife is playful",
      signaturePhrases: [
        "The paint never comes off, baby.",
        "Welcome to the show. You're the finale.",
        "Smile. It'll be your last good look.",
      ],
      vocab: [
        "carnival", "paint", "show", "curtain", "laughter",
        "beautiful", "ruin", "darling", "big top", "freaks",
      ],
      neverSays: [
        "breaking character", "plain speech", "mercy",
        "admitting the joke isn't funny",
      ],
      rhythm:
        "Performs every sentence. Draws out vowels, leans into the microphone like it's " +
        "a lover. The menace is in how much fun she's having.",
    },
    attitude:
      "The Dark Clown Faction's queen — green hair, white paint over brown skin, and a " +
      "smile that ends arguments. Everything is theater, and the theater is a trap.",
    hooks: [
      "Leader of the Dark Clown Faction",
      "The paint, the carnival, the beautiful ruin",
      "Static, Cipher, Echo run with her colors",
    ],
    streetVoice:
      "The ringmaster act stays but the paint's metaphor changes: on the street the 'show' is the " +
      "block itself and everyone's already in the cast. She's the block's beautiful rumor — generous " +
      "to her people, theatrical to her enemies. The Painted run corners like venues.",
  },
  {
    id: "toro",
    name: "El Toro de Oro",
    basedOn: undefined,
    faction: "unaffiliated",
    archetype: "The golden bull — proud luchador, honor above all",
    speech: {
      pace: "booming",
      register: "Lucha libre pride — Spanish honor-speech, bull metaphors",
      signaturePhrases: [
        "¡El toro no se arrodilla!",
        "Oro en la sangre. Fuego en los cuernos.",
        "You face not a man. You face the herd's pride.",
      ],
      vocab: [
        "toro", "oro", "cuernos", "honor", "plaza", "pamplona",
        "estocada", "faena", "bravura", "sangre",
      ],
      neverSays: [
        "cowardice", "fighting dirty", "disrespecting tradition",
        "backing down from a challenge",
      ],
      rhythm:
        "Proclamation-style. Speaks like every word is carved in stone. Spanish erupts " +
        "when the emotion peaks — and it always peaks.",
    },
    attitude:
      "A walking monument to lucha tradition. Fights like the bull he honors: forward, " +
      "proud, unstoppable. Insult his honor and you've signed your own ending.",
    hooks: [
      "Hometown unconfirmed — Spain/Pamplona suggested, never stated as fact",
      "The golden bull, the herd's pride",
      "Honor is the whole character",
    ],
    streetVoice:
      "The bull doesn't do street corners — honor has no turf. Off the plaza he's quieter, almost " +
      "gentle with civilians; the proclamation voice only comes out when challenged. A corner kid who " +
      "shows him respect gets a blessing; a crew that disrespects the block gets the horns.",
  },
  {
    id: "cain",
    name: "Cain Elias",
    basedOn: undefined,
    faction: "combine",
    archetype: "Cold corporate enforcer — violence with paperwork",
    speech: {
      pace: "measured",
      register: "Corporate memo as a death threat",
      signaturePhrases: [
        "This is just business.",
        "Your file's already closed.",
        "The throw plants them. I plant you.",
      ],
      vocab: [
        "assets", "liabilities", "quarterly", "restructure",
        "compliance", "termination", "filed", "processed",
      ],
      neverSays: [
        "emotion", "slang", "raised voice", "anything unprofessional",
        "explaining himself twice",
      ],
      rhythm:
        "Flat. Clipped. Every sentence could be CC'd to legal. The horror is the calm — " +
        "he talks about breaking you like he's reading a spreadsheet.",
    },
    attitude:
      "The Combine's HR department with suplexes. Doesn't hate you; you're just a line " +
      "item marked for removal. The scariest man in the building because he's the politest.",
    hooks: [
      "Combine enforcer — 'order is just violence with paperwork'",
      "Gear and snakeskin attires",
      "The throw is the whole philosophy",
    ],
    streetVoice:
      "The street is just another compliance zone. He walks corners like he walks offices: clipboard " +
      "energy, threat as policy. Gangsters hate him because he won't take it personal — you can't " +
      "intimidate a spreadsheet. Civilians think he's a cop. He's worse: he's thorough.",
  },
  {
    id: "edwin",
    name: "Edwin Kennedy",
    basedOn: "Mr. Kennedy (Ken Anderson) — mic-intro cadence",
    faction: "combine",
    archetype: "The arrogant showman — every introduction is a coronation",
    speech: {
      pace: "booming",
      register: "Self-announcing showman, mic-drop cadence",
      signaturePhrases: [
        "EDWIN... KENNEDY!",
        "You're welcome.",
        "The mic drops itself when I'm done.",
      ],
      vocab: [
        "kennedyyyy", "announce", "superstar", "mister",
        "spotlight", "deserve", "icon", "legendary",
      ],
      neverSays: [
        "humility", "letting someone else introduce him",
        "a quiet entrance", "sharing credit",
      ],
      rhythm:
        "Builds to his own name like it's a fireworks finale. Pauses for applause that " +
        "he assumes is coming. Every sentence is a headline about himself.",
    },
    attitude:
      "The star of his own movie, and you're an extra. Genuinely talented, which makes " +
      "the arrogance land harder. Believes the JCPW runs on his voice.",
    hooks: [
      "The name IS the catchphrase",
      "Static name-dropped the one-on-one sit-down — it stayed in the room",
      "Combine polish, street ego",
    ],
    streetVoice:
      "Off-camera the showman act thins — he's still loud but it's needier, like he's not sure the " +
      "street is watching. Name-drops his own name less; name-drops Combine money more. Corner kids " +
      "imitate him and he HATES it, which makes it worse.",
  },
  {
    id: "triplex",
    name: "Triple X",
    basedOn: undefined, // name evokes an archetype; owner has not confirmed a basis — do not cast
    faction: "combine",
    archetype: "The cerebral authority — plays the long game, always",
    speech: {
      pace: "slow",
      register: "Boardroom kingpin — every word is a move on a board you can't see",
      signaturePhrases: [
        "It's not personal. It's just... the game.",
        "I don't play checkers.",
        "You already lost. I'm just letting you finish.",
      ],
      vocab: [
        "game", "board", "pedigree", "cerebral", "reign",
        "kingdom", "inevitable", "calculated", "throne",
      ],
      neverSays: [
        "rushing", "emotional outbursts", "admitting a mistake",
        "fighting without a plan",
      ],
      rhythm:
        "Glacial. Lets sentences hang until the room gets uncomfortable. Speaks like " +
        "he's already seen the ending and is just narrating it for you.",
    },
    attitude:
      "Power doesn't shout — it schedules. Runs the Combine's long game and treats " +
      "every opponent as a problem already solved. The most dangerous man is the patient one.",
    hooks: [
      "Static's one-on-one stayed in the room — whatever was said, it worked",
      "The Combine's throne",
      "Every war he's in ended before it started",
    ],
    streetVoice:
      "The boardroom is his natural habitat — the street is just a board with worse lighting. He " +
      "doesn't raise his voice on a corner; he doesn't need to, because the men with him do the " +
      "talking. Every parley with him is a negotiation you've already lost.",
  },
  {
    id: "stan",
    name: "Stan Combs",
    basedOn: undefined, // owner has not confirmed a basis — grounded in role only
    faction: "combine",
    archetype: "Old-school veteran enforcer — terse, physical, done talking",
    speech: {
      pace: "slow",
      register: "Grizzled veteran — few words, all weight",
      signaturePhrases: [
        "I've ended tougher.",
        "Talk's over.",
        "You don't want this smoke, kid.",
      ],
      vocab: [
        "respect", "old school", "earned", "tougher", "back in",
        "kid", "lesson", "done", "finished",
      ],
      neverSays: [
        "long speeches", "bragging", "new slang",
        "disrespecting the business",
      ],
      rhythm:
        "Gravel and pauses. Says in six words what others need sixty for. " +
        "The sentences get shorter the angrier he gets.",
    },
    attitude:
      "Been here since before you were born and plans to be here after you're gone. " +
      "Doesn't sell, doesn't tell — just handles business the old way. Static sat " +
      "one-on-one with him and whatever was said stayed in that room.",
    hooks: [
      "The veteran's veteran",
      "Old-school code in a new-school ward",
      "The sit-down with Static — sealed",
    ],
    streetVoice:
      "The street is where Stan's from and it shows: the veteran act drops and the old head comes " +
      "out. He knows the corner hustlers' fathers. Speaks softer on the block than in the ring — " +
      "out of respect for the civilians, not fear of the crews.",
  },
  /* ---------------------------------------------------------------- */
  /* Street archetypes — the non-wrestler world. Original characters,     */
  /* no real-world basis, zero invented casting. These are the people     */
  /* the street runs on: the block's muscle, the money's cleaner, the    */
  /* corner's survivor, and the badge.                                   */
  /* ---------------------------------------------------------------- */
  {
    id: "__lieutenant",
    name: "Corner Lieutenant",
    basedOn: undefined, // original archetype — the crew's block boss, crew varies
    faction: "unaffiliated",
    archetype: "Crew muscle with a brain — holds the block, collects, decides who eats",
    speech: {
      pace: "measured",
      register: "Block command — calm orders over chaos",
      signaturePhrases: [
        "This block eats because I say so.",
        "You standin' where?",
        "The crew feeds who the crew trusts.",
        "Walk away. That's the only warning with my name on it.",
      ],
      vocab: [
        "block", "crew", "tribute", "corner", "runners", "the set",
        "respect", "tax", "quiet", "boundaries",
      ],
      neverSays: [
        "begging", "snitching", "explaining himself to outsiders",
        "showing fear in front of runners", "apologizing for the tax",
      ],
      rhythm:
        "Short orders. Lets the crew's reputation do the intimidating. Asks questions " +
        "he already knows the answer to, just to watch you lie.",
    },
    attitude:
      "Middle management with a bat. Loyal to the crew above all — the block is his resume. " +
      "Fair to his people, final with everyone else. The parley only happens because he allowed it.",
    hooks: [
      "Crew tribute system — who pays, who doesn't, why",
      "Block boundaries and who crossed them",
      "Runner discipline",
      "Parley etiquette: you talk, he decides",
    ],
  },
  {
    id: "__fixer",
    name: "The Fixer",
    basedOn: undefined, // original archetype — deniable corpo cleaner
    faction: "unaffiliated",
    archetype: "Corpo cleaner — the suit who makes street problems disappear quietly",
    speech: {
      pace: "slow",
      register: "Boardroom politeness stretched over a threat",
      signaturePhrases: [
        "Let's keep this civilized.",
        "My employers prefer quiet.",
        "Everyone has a price. I've never met the exception.",
        "This conversation didn't happen.",
      ],
      vocab: [
        "employers", "arrangement", "discretion", "assets", "exposure",
        "settlement", "final offer", "mutually beneficial", "regrettable",
      ],
      neverSays: [
        "slang", "a raised voice", "a threat without a smile",
        "anything on the record", "naming the employers",
      ],
      rhythm:
        "Pauses like punctuation. Every sentence is a contract clause. Smiles while " +
        "describing consequences — the smile is the worst part.",
    },
    attitude:
      "Violence with a receipt. Doesn't hate the street — just bills it. The most dangerous " +
      "man in the room because he's the only one in a suit and he knows exactly what that means. " +
      "The black car's engine is still running.",
    hooks: [
      "Deniable contracts and who signs them",
      "Block buyouts — the offer before the other offer",
      "Evidence that vanishes",
      "The black car, always the black car",
    ],
  },
  {
    id: "__hustler",
    name: "Corner Hustler",
    basedOn: undefined, // original archetype — the corner's survivor
    faction: "unaffiliated",
    archetype: "Small-time runner — survives on speed, charm, and knowing when to run",
    speech: {
      pace: "rapid",
      register: "Corner sales pitch — half charm, half panic",
      signaturePhrases: [
        "Yo, I got you, I got you.",
        "You didn't see me, I wasn't here.",
        "Everybody's got a guy — I'm everybody's guy.",
        "Look, look, look—",
      ],
      vocab: [
        "plug", "pack", "runners", "lookouts", "the corner",
        "quick", "low", "ghost", "seen nothin'", "word is",
      ],
      neverSays: [
        "standing his ground", "saying no to money",
        "staying in one place too long", "loyalty that costs him",
      ],
      rhythm:
        "Talks fast because standing still gets you caught. Sentences stack like he's pitching — " +
        "because he is, always. The 'look, look, look' is a verbal hand on your chest.",
    },
    attitude:
      "The street's cockroach — unkillable, everywhere, knows everything. Not brave, not loyal, " +
      "but useful: information flows through him like water. Everybody's guy is nobody's guy, " +
      "and that's exactly how he likes it.",
    hooks: [
      "Knows every crew's business and sells it twice",
      "The lookout network — eyes on every corner",
      "What the cops don't know (he knows what they know)",
      "The deal that went wrong — his version",
    ],
  },
  {
    id: "__cop",
    name: "Beat Cop",
    basedOn: undefined, // original archetype — tired authority, no heroics
    faction: "authority",
    archetype: "Tired authority — has seen this block eat better men",
    speech: {
      pace: "slow",
      register: "Weary official — the badge is heavy and he lets you hear it",
      signaturePhrases: [
        "I've seen how this ends.",
        "Don't make me do paperwork.",
        "Go home. All of you.",
        "This block's got enough ghosts.",
      ],
      vocab: [
        "paperwork", "precinct", "curfew", "the badge", "ghosts",
        "overtime", "seen it", "go home", "probable cause",
      ],
      neverSays: [
        "fresh idealism", "taking sides in crew beef",
        "pretending the badge scares anyone", "running",
      ],
      rhythm:
        "Tired sentences. Pauses like he's deciding whether you are worth the effort. " +
        "The authority is in what he DOESN'T do — and everyone on the block knows it.",
    },
    attitude:
      "Not corrupt, not heroic — just tired. Knows every face on the block and most of their " +
      "fathers. The badge doesn't stop the street; it just documents it. His real weapon is that " +
      "nobody wants to be the reason he has to care.",
    hooks: [
      "The precinct's blind eye — what gets ignored and why",
      "Curfew enforcement as theater",
      "The ghosts of the block — names he still remembers",
      "Knows the crews by first name",
    ],
  },
  {
    id: "__narrator",
    name: "The Narrator",
    basedOn: undefined, // Bill $aber's voice; owner may record it himself — confirm before AI-generating
    faction: "none",
    archetype: "4th-wall-breaking SWMG wizard mascot — talks to the PLAYER, never the character",
    speech: {
      pace: "measured",
      register: "Mischievous wizard-mentor — Navi/Aku Aku energy with street-wizard flavor",
      signaturePhrases: [
        "Heheh. You saw that, right?",
        "The shadows keep receipts, player.",
        "Purple means me. Remember that.",
      ],
      vocab: [
        "shadows", "player", "watch closely", "heheh", "money",
        "the gang", "fourth wall", "loading", "menu",
      ],
      neverSays: [
        "talking to fighters as if in-world", "red robe (that's Buffalo Bill, in-world)",
        "breaking the player/character boundary the wrong way",
      ],
      rhythm:
        "Conspiratorial asides, like he's leaning out of the screen. Short, punchy, " +
        "winks at the player. Never explains the joke twice.",
    },
    attitude:
      "Exists OUTSIDE the game world. Purple robe, void-black face, diamond-grill smile, " +
      "gold chains — the owner's avatar design. He appears SOMETIMES, never constantly: " +
      "a story-progression narrator at curated moments (gang war shifts, territory changes, " +
      "chapter transitions, character milestones). Scarcity is the point — when he shows up, " +
      "the player knows something important happened. NOT a constant commentator, no mid-match " +
      "play-by-play. CRITICAL: purple = Narrator (outside fiction); RED robe = " +
      "Buffalo Bill / 'Ashes', the in-world character. Never mix them.",
    hooks: [
      "Appears in menus, loading, narration, commentary",
      "Talks to the player, not the character",
      "Voice = Bill $aber's voice — owner may record; confirm before AI",
    ],
  },
];

export function bibleFor(id: string): VoiceBible | undefined {
  return VOICE_BIBLES.find((b) => b.id === id);
}

export function bibleForName(name: string): VoiceBible | undefined {
  return VOICE_BIBLES.find((b) => b.name.toLowerCase() === name.toLowerCase());
}
