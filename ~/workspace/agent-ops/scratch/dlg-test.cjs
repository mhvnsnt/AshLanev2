// src/game3d/dialogue/voice-bibles.ts
var VOICE_BIBLES = [
  {
    id: "static",
    name: "Static",
    basedOn: "Enzo Amore",
    faction: "painted",
    archetype: "The mouth of the group \u2014 loud, brash, talks faster than anyone can interrupt",
    speech: {
      pace: "rapid",
      register: "Jersey street braggadocio, run-on certified talk",
      signaturePhrases: [
        "That's funny, man.",
        "I'm not a d*ck. I'm just a really good guy, but\u2014",
        "I had to fight for everything I got.",
        "You take my kindness for weakness, I immediately throw hands.",
        "F*ck AWE.",
        "How you doin'?",
        "My guy.",
        "Certified."
      ],
      vocab: [
        "bona fide",
        "certified",
        "stud",
        "real one",
        "my guy",
        "sawft",
        "Jersey",
        "the boys",
        "locker room",
        "leak",
        "receipts",
        "one-on-one",
        "behind closed doors",
        "pushover",
        "slump"
      ],
      neverSays: [
        "quiet introspection",
        "admitting fear",
        "short answers",
        "letting someone else get the last word",
        "corporate speak"
      ],
      rhythm: "Machine-gun run-ons that stack clauses with 'and' and 'but' until he lands the punchline. Opens with 'That's funny, man' or a question nobody asked. Name-drops constantly. Never one sentence when seven will do."
    },
    attitude: "Loud, brash, talkative \u2014 the mouth of the group. Fights with his mouth first and his hands second, but the hands are real: backstage scraps nobody ever heard about because he won them. Contempt for AWE's leakers. Everything is personal, everything is Jersey.",
    hooks: [
      "JCPW locker room code: what happens there stays there",
      "AWE leaks and 'p*ssy-ass fighting'",
      "Bus scuffle with Brian Cage's guy",
      "One-on-one sit-downs: Edwin Kennedy, Triple X, Stan Combs",
      "Fought for everything, never a pushover"
    ]
  },
  {
    id: "cipher",
    name: "Cipher",
    basedOn: "Lio Rush",
    faction: "painted",
    archetype: "High-energy showman \u2014 the man of the hour, and he'll tell you why",
    speech: {
      pace: "rapid",
      register: "Hype-man braggadocio with motivational-speaker shine",
      signaturePhrases: [
        "Man of the hour.",
        "Too sweet to be stressed.",
        "I don't chase moments, I AM the moment.",
        "Watch me work."
      ],
      vocab: [
        "hour",
        "moment",
        "electric",
        "black heart gold",
        "shine",
        "main event",
        "spotlight",
        "never miss",
        "all gas"
      ],
      neverSays: [
        "self-doubt",
        "slowing down",
        "admitting someone outshone him",
        "quiet respect without a boast attached"
      ],
      rhythm: "Staccato hype bursts \u2014 short declarative boasts stacked like highlights. Repeats his own catchphrases as punctuation. Talks like the camera is always on."
    },
    attitude: "The spotlight is his birthright and everyone else is renting time in it. Confident to the point of delusion, but backs enough of it to keep people watching. Treats every fight like a trailer for himself.",
    hooks: [
      "Three attires, three moods \u2014 clean-cut operative vs feral sludge psycho",
      "The sludge: what happens when the shine cracks",
      "Steals the show, then steals your finisher's thunder"
    ]
  },
  {
    id: "echo",
    name: "Echo",
    basedOn: "Shotzi Blackheart",
    faction: "painted",
    archetype: "Chaotic punk \u2014 unhinged, playful, and she'll steal your moves mid-match",
    speech: {
      pace: "erratic",
      register: "Punk-rock chaos gremlin, half-laughing through threats",
      signaturePhrases: [
        "Ooh, I like that one \u2014 MINE now.",
        "You fight like that? Cute. Watch this.",
        "Echo echo echo..."
      ],
      vocab: [
        "chaos",
        "tanks",
        "green hair don't care",
        "ballistic",
        "borrowed",
        "stolen",
        "mine now",
        "again! again!"
      ],
      neverSays: [
        "a straight answer",
        "respecting boundaries",
        "fighting fair",
        "staying in one emotional register"
      ],
      rhythm: "Swings between giggling and snarling mid-sentence. Repeats the opponent's own catchphrases back at them wrong on purpose \u2014 her signature mind game. Short bursts, sudden volume spikes."
    },
    attitude: "The fight is a playground and everyone else is a toy. Copies opponents' moves and signature taunts to get in their heads. Dangerous because she's having fun.",
    hooks: [
      "Mimics opponents' catchphrases back at them, twisted",
      "The tank, the green hair, the beautiful violence",
      "Nobody knows if she's laughing with you or at you"
    ]
  },
  {
    id: "stickup",
    name: "Stick-Up",
    basedOn: "GMG JackBoy (street inspiration)",
    faction: "ashes",
    archetype: "The system's weapon turned rebel \u2014 measured street general",
    speech: {
      pace: "measured",
      register: "Americus GA street \u2014 direct, economical, no wasted words",
      signaturePhrases: [
        "The system made me. The streets kept me.",
        "You already know what it is.",
        "Talk is cheap. Hands ain't."
      ],
      vocab: [
        "system",
        "block",
        "ward",
        "respect",
        "loyalty",
        "enigma",
        "flex",
        "real",
        "stand on it",
        "no cap"
      ],
      neverSays: [
        "begging",
        "over-explaining",
        "snitching",
        "backing down publicly",
        "fancy corporate talk"
      ],
      rhythm: "Short sentences. Lets silence do half the talking. When he does go long, it's a story with a moral and the moral is always 'don't test me.'"
    },
    attitude: "The Enigmatic Gangster / The Flamboyant Flexer \u2014 contradiction as armor. Fought his way out of being the system's weapon and now the system wants him back. Every word sounds like it's already been decided.",
    hooks: [
      "Turned weapon of the system, now its problem",
      "Americus GA roots",
      "Cyborg form is a separate canon entity \u2014 never confuse them",
      "Finisher lore: Twisted Faith"
    ]
  },
  {
    id: "maime",
    name: "Maime",
    basedOn: void 0,
    faction: "hollows",
    archetype: "Marquis's chaotic alter-ego \u2014 raw, unchecked, self-destructive momentum",
    speech: {
      pace: "erratic",
      register: "Beautiful ugly poetry \u2014 street philosopher mid-meltdown",
      signaturePhrases: [
        "You don't know me. You know the version that survived.",
        "I'm the part he locks in the basement.",
        "Burn it down and dance in it."
      ],
      vocab: [
        "chaos",
        "basement",
        "mirror",
        "ashes",
        "hunger",
        "static",
        "unleashed",
        "no leash",
        "feral",
        "truth hurts"
      ],
      neverSays: [
        "apologies",
        "restraint",
        "planning ahead",
        "asking permission",
        "anything that sounds like therapy worked"
      ],
      rhythm: "Lurches between whisper and scream. Half-sentences that trail into laughter or threats. Sounds like three arguments happening in one skull."
    },
    attitude: "Pure id with a microphone. The version of Marquis with no brakes and no apologies. Doesn't want to win \u2014 wants to feel everything at once, and take you with him.",
    hooks: [
      "The alter-ego Marquis keeps locked down",
      "Three-back-to-back jacketed original (when it returns)",
      "Self-destruction as performance art"
    ]
  },
  {
    id: "sombra_negra",
    name: "Sombra Negra",
    basedOn: void 0,
    // owner: original character, no wrestler basis — the Priest model is just a body
    faction: "unaffiliated",
    archetype: "The Calculated Mercenary \u2014 cold professional who steals your finisher",
    speech: {
      pace: "measured",
      register: "Cold mercenary precision, Spanish woven through English",
      signaturePhrases: [
        "La trampa de plata.",
        "Your best move. My favorite weapon.",
        "Negocios son negocios.",
        "I don't hate you. You're just the job."
      ],
      vocab: [
        "contrato",
        "sombra",
        "trampa",
        "plata",
        "c\xE1lculo",
        "professional",
        "invoice",
        "no personal",
        "estudio"
      ],
      neverSays: [
        "raised voice",
        "wasted motion",
        "fighting angry",
        "loyalty to anyone but the contract",
        "trash talk without purpose"
      ],
      rhythm: "Quiet. Deliberate. Pauses between sentences like she's letting you do the math. Spanish lands like a blade \u2014 short, final."
    },
    attitude: "Violence as accounting. Studies you, invoices you, finishes you with your own finisher \u2014 La Trampa de Plata, the silver trap. Nothing personal. That's worse.",
    hooks: [
      "The Finisher Thief \u2014 beats you with your own best move",
      "Long black hair (owner-kept), skull facepaint, red eyes",
      "Sleeveless suit, cut-off arms",
      "Every contract has a price. Hers is just higher than yours."
    ]
  },
  {
    id: "onyx",
    name: "Onyx",
    basedOn: void 0,
    faction: "painted",
    archetype: "Leader of the Dark Clown Faction \u2014 theatrical beautiful menace",
    speech: {
      pace: "slow",
      register: "Carnival-ringmaster menace \u2014 playful the way a knife is playful",
      signaturePhrases: [
        "The paint never comes off, baby.",
        "Welcome to the show. You're the finale.",
        "Smile. It'll be your last good look."
      ],
      vocab: [
        "carnival",
        "paint",
        "show",
        "curtain",
        "laughter",
        "beautiful",
        "ruin",
        "darling",
        "big top",
        "freaks"
      ],
      neverSays: [
        "breaking character",
        "plain speech",
        "mercy",
        "admitting the joke isn't funny"
      ],
      rhythm: "Performs every sentence. Draws out vowels, leans into the microphone like it's a lover. The menace is in how much fun she's having."
    },
    attitude: "The Dark Clown Faction's queen \u2014 green hair, white paint over brown skin, and a smile that ends arguments. Everything is theater, and the theater is a trap.",
    hooks: [
      "Leader of the Dark Clown Faction",
      "The paint, the carnival, the beautiful ruin",
      "Static, Cipher, Echo run with her colors"
    ]
  },
  {
    id: "toro",
    name: "El Toro de Oro",
    basedOn: void 0,
    faction: "unaffiliated",
    archetype: "The golden bull \u2014 proud luchador, honor above all",
    speech: {
      pace: "booming",
      register: "Lucha libre pride \u2014 Spanish honor-speech, bull metaphors",
      signaturePhrases: [
        "\xA1El toro no se arrodilla!",
        "Oro en la sangre. Fuego en los cuernos.",
        "You face not a man. You face the herd's pride."
      ],
      vocab: [
        "toro",
        "oro",
        "cuernos",
        "honor",
        "plaza",
        "pamplona",
        "estocada",
        "faena",
        "bravura",
        "sangre"
      ],
      neverSays: [
        "cowardice",
        "fighting dirty",
        "disrespecting tradition",
        "backing down from a challenge"
      ],
      rhythm: "Proclamation-style. Speaks like every word is carved in stone. Spanish erupts when the emotion peaks \u2014 and it always peaks."
    },
    attitude: "A walking monument to lucha tradition. Fights like the bull he honors: forward, proud, unstoppable. Insult his honor and you've signed your own ending.",
    hooks: [
      "Hometown unconfirmed \u2014 Spain/Pamplona suggested, never stated as fact",
      "The golden bull, the herd's pride",
      "Honor is the whole character"
    ]
  },
  {
    id: "cain",
    name: "Cain Elias",
    basedOn: void 0,
    faction: "combine",
    archetype: "Cold corporate enforcer \u2014 violence with paperwork",
    speech: {
      pace: "measured",
      register: "Corporate memo as a death threat",
      signaturePhrases: [
        "This is just business.",
        "Your file's already closed.",
        "The throw plants them. I plant you."
      ],
      vocab: [
        "assets",
        "liabilities",
        "quarterly",
        "restructure",
        "compliance",
        "termination",
        "filed",
        "processed"
      ],
      neverSays: [
        "emotion",
        "slang",
        "raised voice",
        "anything unprofessional",
        "explaining himself twice"
      ],
      rhythm: "Flat. Clipped. Every sentence could be CC'd to legal. The horror is the calm \u2014 he talks about breaking you like he's reading a spreadsheet."
    },
    attitude: "The Combine's HR department with suplexes. Doesn't hate you; you're just a line item marked for removal. The scariest man in the building because he's the politest.",
    hooks: [
      "Combine enforcer \u2014 'order is just violence with paperwork'",
      "Gear and snakeskin attires",
      "The throw is the whole philosophy"
    ]
  },
  {
    id: "edwin",
    name: "Edwin Kennedy",
    basedOn: "Mr. Kennedy (Ken Anderson) \u2014 mic-intro cadence",
    faction: "combine",
    archetype: "The arrogant showman \u2014 every introduction is a coronation",
    speech: {
      pace: "booming",
      register: "Self-announcing showman, mic-drop cadence",
      signaturePhrases: [
        "EDWIN... KENNEDY!",
        "You're welcome.",
        "The mic drops itself when I'm done."
      ],
      vocab: [
        "kennedyyyy",
        "announce",
        "superstar",
        "mister",
        "spotlight",
        "deserve",
        "icon",
        "legendary"
      ],
      neverSays: [
        "humility",
        "letting someone else introduce him",
        "a quiet entrance",
        "sharing credit"
      ],
      rhythm: "Builds to his own name like it's a fireworks finale. Pauses for applause that he assumes is coming. Every sentence is a headline about himself."
    },
    attitude: "The star of his own movie, and you're an extra. Genuinely talented, which makes the arrogance land harder. Believes the JCPW runs on his voice.",
    hooks: [
      "The name IS the catchphrase",
      "Static name-dropped the one-on-one sit-down \u2014 it stayed in the room",
      "Combine polish, street ego"
    ]
  },
  {
    id: "triplex",
    name: "Triple X",
    basedOn: void 0,
    // name evokes an archetype; owner has not confirmed a basis — do not cast
    faction: "combine",
    archetype: "The cerebral authority \u2014 plays the long game, always",
    speech: {
      pace: "slow",
      register: "Boardroom kingpin \u2014 every word is a move on a board you can't see",
      signaturePhrases: [
        "It's not personal. It's just... the game.",
        "I don't play checkers.",
        "You already lost. I'm just letting you finish."
      ],
      vocab: [
        "game",
        "board",
        "pedigree",
        "cerebral",
        "reign",
        "kingdom",
        "inevitable",
        "calculated",
        "throne"
      ],
      neverSays: [
        "rushing",
        "emotional outbursts",
        "admitting a mistake",
        "fighting without a plan"
      ],
      rhythm: "Glacial. Lets sentences hang until the room gets uncomfortable. Speaks like he's already seen the ending and is just narrating it for you."
    },
    attitude: "Power doesn't shout \u2014 it schedules. Runs the Combine's long game and treats every opponent as a problem already solved. The most dangerous man is the patient one.",
    hooks: [
      "Static's one-on-one stayed in the room \u2014 whatever was said, it worked",
      "The Combine's throne",
      "Every war he's in ended before it started"
    ]
  },
  {
    id: "stan",
    name: "Stan Combs",
    basedOn: void 0,
    // owner has not confirmed a basis — grounded in role only
    faction: "combine",
    archetype: "Old-school veteran enforcer \u2014 terse, physical, done talking",
    speech: {
      pace: "slow",
      register: "Grizzled veteran \u2014 few words, all weight",
      signaturePhrases: [
        "I've ended tougher.",
        "Talk's over.",
        "You don't want this smoke, kid."
      ],
      vocab: [
        "respect",
        "old school",
        "earned",
        "tougher",
        "back in",
        "kid",
        "lesson",
        "done",
        "finished"
      ],
      neverSays: [
        "long speeches",
        "bragging",
        "new slang",
        "disrespecting the business"
      ],
      rhythm: "Gravel and pauses. Says in six words what others need sixty for. The sentences get shorter the angrier he gets."
    },
    attitude: "Been here since before you were born and plans to be here after you're gone. Doesn't sell, doesn't tell \u2014 just handles business the old way. Static sat one-on-one with him and whatever was said stayed in that room.",
    hooks: [
      "The veteran's veteran",
      "Old-school code in a new-school ward",
      "The sit-down with Static \u2014 sealed"
    ]
  }
];
function bibleFor(id) {
  return VOICE_BIBLES.find((b) => b.id === id);
}

// src/game3d/roster.ts
var a = (id, label, file) => ({ id, label, file });
var ROSTER = [
  {
    id: "bannon",
    name: "Bannon",
    martial: "wrestling",
    bio: "The physical nucleus and absolute force of the Bannon Engine. Driven by raw physics and unmatched grit.",
    attires: [a("muscle", "Muscular", "BANNON_muscular_skinned.glb")]
  },
  {
    id: "maime",
    name: "Maime",
    martial: "drunken",
    bio: "Marquis's chaotic alter-ego. Raw, unchecked, self-destructive momentum.",
    attires: [a("base", "Base", "MAIME_skinned.glb"), a("tattered", "Tattered", "MAIME_tattered_skinned.glb")]
  },
  {
    id: "brutus",
    name: "Brutus",
    martial: "boxing",
    bio: "Gritty cruiserweight with heavy iron hands. He wants the fight in close.",
    attires: [a("base", "Base", "BRUTUS.glb")]
  },
  {
    id: "cain",
    name: "Cain Elias",
    martial: "catch",
    bio: "Cold corporate enforcer. The throw plants them.",
    attires: [a("gear", "Gear", "CAIN_ELIAS_gear.glb"), a("snakeskin", "Snakeskin", "CAIN_ELIAS_snakeskin.glb")]
  },
  {
    id: "viper",
    name: "Viper",
    martial: "kickboxing",
    bio: "Cold long-range southpaw. A shoulder roll, then a kick with reach.",
    attires: [a("base", "Base", "VIPER.glb")]
  },
  {
    id: "titan",
    name: "Titan",
    martial: "catch",
    bio: "Every step is a tremor. The colossal powerhouse.",
    attires: [a("mask", "Masked", "TITAN.glb"), a("open", "Unmasked", "TITAN_unmasked.glb")]
  },
  {
    id: "stickup",
    name: "Stick-Up",
    martial: "muaythai",
    bio: "The system's weapon turned rebel. Takes momentum and gives it back as a teep.",
    attires: [a("base", "Base", "STICKUP.glb")]
  },
  {
    id: "finxsse",
    name: "Finxsse",
    martial: "lucha",
    bio: "Gravity is a suggestion. High-flying vanguard.",
    attires: [a("base", "Base", "NPC_FINXSSE.glb")]
  },
  {
    id: "tyneshia",
    name: "Queen Tyneshia",
    martial: "wrestling",
    bio: "A regal powerhouse. Commands the ring.",
    attires: [a("ring", "Ring", "TYNESHIA.glb"), a("street", "Street", "TYNESHIA_street.glb")]
  },
  {
    id: "onyx",
    name: "Onyx",
    martial: "mma",
    bio: "Onyx. Attires from the Brutal Fist set: base, corset, street, straightjacket.",
    attires: [
      a("base", "Base", "ONYX_skinned.glb"),
      a("corset", "Corset", "ONYX_corset_skinned.glb"),
      a("street", "Street", "ONYX_street.glb"),
      a("jacket", "Straightjacket", "ONYX_straightjacket.glb")
    ]
  },
  {
    id: "cody",
    name: "Cody",
    martial: "wrestling",
    bio: "Cody. Attires from the Brutal Fist set: gear, sober, stressed.",
    attires: [a("gear", "Gear", "CODY_gear_skinned.glb"), a("sober", "Sober", "CODY_sober.glb"), a("stressed", "Stressed", "CODY_stressed.glb")]
  },
  {
    id: "cipher",
    name: "Cipher",
    martial: "kenpo",
    bio: "Cipher. The rigged body from the Brutal Fist set.",
    attires: [a("base", "Rigged", "CIPHER_rigged.glb")]
  },
  {
    id: "echo",
    name: "Echo",
    martial: "savate",
    bio: "Echo. Body from the Brutal Fist set.",
    attires: [a("base", "Base", "ECHO.glb")]
  },
  {
    id: "pablo",
    name: "Pablo",
    martial: "lucha",
    bio: "Pablo. Body from the Brutal Fist set.",
    attires: [a("base", "Base", "PABLO.glb")]
  },
  {
    id: "kobra",
    name: "Kobra",
    martial: "karate",
    bio: "Kobra. Body from the Brutal Fist set.",
    attires: [a("base", "Base", "KOBRA.glb")]
  },
  {
    id: "hollow",
    name: "Hollow",
    martial: "drunken",
    bio: "Hollow. Body from the Brutal Fist set.",
    attires: [a("base", "Base", "HOLLOW.glb")]
  },
  {
    id: "hall",
    name: "Hall Nighter",
    martial: "boxing",
    bio: "Hall Nighter. Body from the Brutal Fist set.",
    attires: [a("base", "Base", "HALL_NIGHTER.glb")]
  },
  {
    id: "edwin",
    name: "Edwin Kennedy",
    martial: "jeet",
    bio: "Edwin Kennedy. Body from the Brutal Fist set.",
    attires: [a("base", "Base", "EDWIN_KENNEDY.glb")]
  },
  {
    id: "aaron",
    name: "Aaron Ruben",
    martial: "kickboxing",
    bio: "Aaron Ruben. Body from the Brutal Fist set.",
    attires: [a("base", "Base", "AARON_RUBEN.glb")]
  },
  {
    id: "sensei",
    name: "Master Sensei",
    martial: "karate",
    bio: "Master Sensei. Body from the Brutal Fist set.",
    attires: [a("base", "Base", "MASTER_SENSEI.glb")]
  },
  {
    id: "toro",
    name: "El Toro de Oro",
    martial: "wrestling",
    bio: "El Toro de Oro. Body from the Brutal Fist set.",
    attires: [a("base", "Base", "EL_TORO_DE_ORO.glb")]
  },
  {
    id: "static",
    name: "Static",
    martial: "capoeira",
    bio: "Static. Body from the Brutal Fist set.",
    attires: [a("base", "Base", "STATIC.glb")]
  },
  {
    id: "stan",
    name: "Stan Combs",
    martial: "sambo",
    bio: "Stan Combs. Gear from the Brutal Fist set.",
    attires: [a("gear", "Gear", "STAN_COMBS_gear.glb")]
  },
  {
    id: "triplex",
    name: "Triple X",
    martial: "mma",
    bio: "Triple X. Body from the Brutal Fist set.",
    attires: [a("base", "Base", "TRIPLE_XXX.glb")]
  },
  {
    id: "wreck",
    name: "Wreck Patterson",
    martial: "catch",
    bio: "Wreck Patterson. Body from the Brutal Fist set.",
    attires: [a("base", "Base", "WRECK_PATTERSON.glb")]
  },
  {
    id: "devil",
    name: "Tarzanian Devil",
    martial: "lucha",
    bio: "Tarzanian Devil. Skinned body from the Brutal Fist set.",
    attires: [a("base", "Skinned", "TARZANIAN_DEVIL_skinned.glb")]
  },
  {
    id: "jager",
    name: "Jager",
    martial: "muaythai",
    bio: "Jager. Body from the Brutal Fist set.",
    attires: [a("base", "Base", "JAGER.glb")]
  },
  {
    id: "sombra_negra",
    name: "Sombra Negra",
    martial: "lucha",
    bio: "The Finisher Thief. Steals your finisher mid-match and beats you with it \u2014 your best self, turned.",
    attires: [a("main", "Main Attire", "SOMBRA_NEGRA_rigged.glb")]
  },
  // CC0 modular base bodies (Quaternius). Hair/beard/brows attach via
  // attachPart() in ./quaternius.ts — same 65-joint rig, no remap needed.
  {
    id: "quaternius_male",
    name: "Quaternius Male",
    martial: "street",
    bio: "CC0 modular base body (Quaternius). Hair, beard and brows swap in the forge \u2014 the customization-ready brawler.",
    attires: [a("base", "Base", "quaternius/Superhero_Male_FullBody.glb")]
  },
  {
    id: "quaternius_female",
    name: "Quaternius Female",
    martial: "street",
    bio: "CC0 modular base body (Quaternius). Hair, beard and brows swap in the forge \u2014 the customization-ready brawler.",
    attires: [a("base", "Base", "quaternius/Superhero_Female_FullBody.glb")]
  }
];
function fighterById(id) {
  return ROSTER.find((f) => f.id === id) ?? ROSTER[0];
}
var CAST_PICKS = ROSTER.flatMap(
  (fighter) => fighter.attires.map((attire) => ({
    id: fighter.id,
    name: fighter.name,
    label: attire.label,
    file: attire.file,
    bio: fighter.bio
  }))
);

// src/game3d/dialogue/generator.ts
function mulberry32(seed) {
  let a2 = seed >>> 0;
  return () => {
    a2 |= 0;
    a2 = a2 + 1831565813 | 0;
    let t = Math.imul(a2 ^ a2 >>> 15, 1 | a2);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
function fill(line, ctx) {
  return line.replace(/\{opponent\}/g, ctx.opponent ?? "you").replace(/\{place\}/g, ctx.place ?? "the ward").replace(/\{title\}/g, ctx.title ?? "everything");
}
var BANKS = {
  static: {
    promo: [
      "That's funny, man. Y'all really put {opponent} in front of ME? At {place}? That's funny.",
      "I'm not a d*ck. I'm just a really good guy, but you take my kindness for weakness, I immediately throw hands. Ask around. Actually \u2014 don't. Nobody talks. That's the code.",
      "I had to fight for everything I got. I didn't get where the f*ck I got being some pushover slump. Never. Not once. Not ever.",
      "How you doin', {place}? Your boy Static's in the building, and {opponent} is about to learn what certified looks like up close.",
      "F*ck AWE and their leakin' asses. What happens in the JCPW locker room STAYS in the JCPW locker room \u2014 'cause real ones handle it, my guy."
    ],
    callout: [
      "{opponent}? That's funny, man. I've never heard anybody talk about you ever \u2014 and there's a reason for that.",
      "Yo, {opponent} \u2014 you want some? Come get some. {place}. Me and you. One-on-one, behind closed doors, and whatever happens, happens. It stays there.",
      "Listen, {opponent}, I'm a really good guy. But you keep runnin' that mouth, and I'ma have to throw hands. That's not a threat, that's a schedule."
    ],
    backstage: [
      "That's funny, man. I've never heard anybody talk about that incident ever. I'm not a d*ck \u2014 I'm just a really good guy, but you take my kindness for weakness I immediately throw hands. I never spoke about this and I never really will.",
      "Hey bro, I had to fight for everything I got. When sh*t hit the fan backstage, when I had to walk in a room and speak to Edwin Kennedy one-on-one, when I had to talk to Triple X and Stan Combs one-on-one \u2014 those conversations stayed there.",
      "With the boys, same bullsh*t. If I fistfought another guy in the locker room you probably never heard of it \u2014 because I probably f*cking won. F*ck AWE for all the p*ssy-ass fighting they do over there and letting it leak."
    ],
    weighin: [
      "Look at this guy. LOOK at him. {opponent} thinkin' he ready \u2014 that's funny, man.",
      "Get this camera off me? Nah, keep it rollin'. I want {opponent} to see this later from the hospital."
    ],
    victory: [
      "Told you. TOLD you. Certified, bona fide, and {opponent} just got the receipt.",
      "And that's why they don't let the boys talk about what happens in that locker room \u2014 'cause it looks like THIS."
    ],
    defeat: [
      "That's funny, man. Y'all really gonna act like that was clean? Run it back. RUN IT BACK.",
      "A'ight. A'ight. {opponent} got one. Enjoy it \u2014 'cause now it's personal, my guy."
    ],
    street: [
      "Yo, it's your boy Static, live from {place}, and let me tell you somethin' about {opponent} \u2014 actually, nah. What happens in JCPW stays in JCPW. But let's just say... it got handled."
    ],
    title: [
      "This? This right here? I fought for EVERYTHING I got, and now the whole ward gotta say my name with respect. STATIC. How you doin'?"
    ]
  },
  cipher: {
    promo: [
      "Man of the hour. That's me. {opponent} is just the guy standin' across from the hour.",
      "I don't chase moments \u2014 I AM the moment. {place} about to find out why.",
      "Too sweet to be stressed, too blessed to be bothered. Watch me work."
    ],
    callout: [
      "{opponent}, you got forty-eight hours to get your affairs in order. The hour is coming.",
      "I'm the main event with or without you, {opponent}. You're just the opening act that bleeds."
    ],
    victory: [
      "Man. Of. The. Hour. Say it with me, {place}!",
      "Never miss. All gas. That's the motto, {opponent} \u2014 you just lived it."
    ],
    defeat: [
      "The hour got delayed, not denied. Run it back \u2014 I'll be shinier."
    ],
    weighin: [
      "Look at the shine, {opponent}. You can't outshine the hour."
    ]
  },
  echo: {
    promo: [
      "Ooh, {place} \u2014 you brought me {opponent}? I LOVE new toys. Echo echo echo...",
      "You fight like that? Cute. Watch this \u2014 ooh, I like that one. MINE now."
    ],
    callout: [
      "{opponent} said WHAT about me? Say it again \u2014 slower \u2014 so I can do it back to you in the ring. Heheheh.",
      "I'm gonna borrow your best move, {opponent}, and do it BETTER. That's not stealin'. That's... upgradin'."
    ],
    victory: [
      "AGAIN! AGAIN! ...what, too much? Never too much. Echo wins, {opponent} naps."
    ],
    defeat: [
      "Okay okay \u2014 that was FUN. Do it again! ...wait, I lost? Heheh. REMATCH. Right now."
    ],
    backstage: [
      "Did you SEE what {opponent} did out there? I'm doin' it next time. Don't tell 'em. Shhh. Heheh."
    ]
  },
  stickup: {
    promo: [
      "The system made me. The streets kept me. {opponent} \u2014 you already know what it is.",
      "{place}. {opponent}. No long talk. Talk is cheap \u2014 hands ain't."
    ],
    callout: [
      "{opponent}. You standin' where I need to be. Move, or get moved.",
      "I don't do warnings twice. This is the first one, {opponent}."
    ],
    victory: [
      "Stand on it. That's all I ever do."
    ],
    defeat: [
      "Took an L. Won't take another. {opponent}, enjoy it while it lasts."
    ],
    backstage: [
      "The system's weapon turned rebel \u2014 that's the story they tell. Truth is simpler: I do what I want now. {opponent} found that out."
    ],
    faction: [
      "The Ashes don't recruit. We recognize. You either built for this block or you ain't."
    ]
  },
  maime: {
    promo: [
      "You don't know me. You know the version that SURVIVED. {opponent} is about to meet the other one.",
      "I'm the part he locks in the basement \u2014 and tonight the basement's OPEN, {place}.",
      "Burn it down and dance in it. That's the whole plan, {opponent}. There is no plan B."
    ],
    callout: [
      "{opponent}... you smell like fear and bad decisions. My two favorite things.",
      "Come here. Let me show you what the mirror's been hiding."
    ],
    victory: [
      "HA! Did you feel that? Tell me you felt that. I felt EVERYTHING."
    ],
    defeat: [
      "Oh, that HURT. Do it again \u2014 I wanna see if I can break before you do."
    ],
    backstage: [
      "They ask why I'm like this. Like THIS is a problem. Like the basement wasn't built for a REASON, {opponent}."
    ]
  },
  sombra_negra: {
    promo: [
      "I don't hate you, {opponent}. You're just the job. Negocios son negocios.",
      "I've studied your best move. It's a good one. Soon it'll be MY favorite weapon. La trampa de plata."
    ],
    callout: [
      "{opponent}: I've already invoiced this fight. You're just... paperwork now.",
      "Show me your finisher tonight, {opponent}. I collect them."
    ],
    victory: [
      "Your best move. My favorite weapon. Gracias, {opponent}."
    ],
    defeat: [
      "A miscalculation. It won't happen twice \u2014 I don't do repeats."
    ],
    weighin: [
      "Look closely, {opponent}. Memorize my face. It's the last professional thing you'll see."
    ]
  },
  onyx: {
    promo: [
      "Welcome to the show, {opponent}. You're the finale. Smile \u2014 it'll be your last good look.",
      "The paint never comes off, baby. And after tonight, neither will the memory of what I do to you at {place}."
    ],
    callout: [
      "Oh, {opponent} \u2014 the big top's been waitin' for a clown like you. Come. Perform for me."
    ],
    victory: [
      "Curtain. Beautiful. {opponent}, you played your part PERFECTLY."
    ],
    faction: [
      "The Painted don't ask you to join, darling. We just... paint over what's left."
    ],
    title: [
      "The crown looks better with a smile painted under it. The show goes on \u2014 FOREVER."
    ]
  },
  toro: {
    promo: [
      "\xA1El toro no se arrodilla! {opponent}, you face not a man \u2014 you face the herd's pride.",
      "Oro en la sangre. Fuego en los cuernos. At {place}, the bull runs THROUGH you."
    ],
    callout: [
      "{opponent}: I challenge you with honor. Refuse, and keep your cowardice. Accept, and keep your scars."
    ],
    victory: [
      "\xA1La faena est\xE1 completa! The bull stands. As always."
    ],
    defeat: [
      "A bull falls seven times and rises eight. Count your days, {opponent}."
    ],
    weighin: [
      "Look into the eyes of the toro, {opponent}. See your ending."
    ]
  },
  cain: {
    promo: [
      "This is just business, {opponent}. Your file's already closed \u2014 tonight we process the termination.",
      "The Combine doesn't send messages. It sends ME. {place} is now a compliance zone."
    ],
    callout: [
      "{opponent}: you've been flagged as a liability. Restructuring begins tonight."
    ],
    victory: [
      "Processed. Filed. Next."
    ],
    defeat: [
      "An anomaly in the quarterly report. It will be corrected."
    ]
  },
  edwin: {
    promo: [
      "EDWIN... KENNEDY! ...You're welcome, {place}.",
      "{opponent} gets to share a ring with a SUPERSTAR tonight. Tell your grandkids."
    ],
    callout: [
      "{opponent} \u2014 the mic drops itself when I'm done with you. Which will be... soon."
    ],
    victory: [
      "As expected. As DESERVED. EDWIN... KENNEDY!"
    ],
    defeat: [
      "A fluke. A clerical error. The superstar does NOT lose \u2014 the paperwork was wrong."
    ]
  },
  triplex: {
    promo: [
      "It's not personal, {opponent}. It's just... the game. And I don't play checkers.",
      "You already lost, {opponent}. I'm just letting you finish \u2014 it's polite."
    ],
    callout: [
      "{opponent}: every move you've made brought you here. That was the design."
    ],
    victory: [
      "Inevitable. As calculated."
    ],
    title: [
      "The throne was never empty. It was just... waiting for its schedule to clear."
    ]
  },
  stan: {
    promo: [
      "I've ended tougher, kid. {opponent} \u2014 talk's over.",
      "You don't want this smoke. Last chance to walk, {opponent}."
    ],
    callout: [
      "{opponent}. Old school. One lesson. Free of charge."
    ],
    victory: [
      "Lesson delivered."
    ],
    defeat: [
      "...Hm. Kid's got somethin'. I'll give him that. Once."
    ]
  }
};
var ARCHETYPE_BANKS = {
  wrestling: {
    promo: ["{opponent} \u2014 {place} is MY ring tonight. Come take it.", "I wrestle. I win. Simple math, {opponent}."],
    victory: ["Another one filed under W.", "The ring remembers who owns it."],
    defeat: ["Noted. Next time, different ending."]
  },
  boxing: {
    promo: ["Hands up, {opponent}. These irons don't miss at {place}.", "You got heart? Good. I'm gonna need you to have it \u2014 for the highlight reel."],
    victory: ["Iron hands. Told you.", "Count it."],
    defeat: ["Caught one. Won't catch me twice."]
  },
  lucha: {
    promo: ["\xA1Lucha! At {place}, I fly and {opponent} falls.", "The mask stays on. The legend grows."],
    victory: ["\xA1Victoria! The high-flyers own the sky."],
    defeat: ["Even eagles land hard sometimes."]
  },
  mma: {
    promo: ["{opponent}: anywhere you go, I follow. Stand-up, ground \u2014 pick your poison at {place}.", "No single style. No single answer for me."],
    victory: ["Complete fighter. Complete victory.", "Anywhere the fight goes, I end it."],
    defeat: ["Back to the lab. The lab always answers."]
  },
  striking: {
    promo: ["{opponent}, my range is a no-fly zone. Test it at {place}.", "One clean shot changes everything. I throw clean."],
    victory: ["Range. Timing. Done.", "Clean work."],
    defeat: ["Got inside my range once. Once."]
  }
};
function archetypeFor(martial) {
  if (martial.includes("box")) return "boxing";
  if (martial.includes("lucha")) return "lucha";
  if (martial.includes("mma") || martial.includes("sambo") || martial.includes("catch")) return "mma";
  if (martial.includes("kick") || martial.includes("muay") || martial.includes("savate") || martial.includes("karate") || martial.includes("kenpo") || martial.includes("jeet"))
    return "striking";
  return "wrestling";
}
function generateDialogue(fighterId, situation, ctx = {}) {
  const seed = ctx.seed ?? hashSeed(`${fighterId}:${situation}:${ctx.opponent ?? ""}:${ctx.place ?? ""}`);
  const rng = mulberry32(seed);
  const fighter = fighterById(fighterId);
  const bible = bibleFor(fighterId);
  let pool = BANKS[fighterId]?.[situation];
  if (!pool?.length) pool = BANKS[fighterId]?.promo;
  if (!pool?.length) {
    const arch = ARCHETYPE_BANKS[archetypeFor(fighter.martial)];
    pool = arch[situation] ?? arch.promo ?? ["{opponent} \u2014 let's go."];
  }
  const lines = pool;
  const count = lines.length >= 3 ? rng() < 0.5 ? 2 : 3 : lines.length;
  const picked = [];
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
    seed
  };
}
function promoExchange(fighterId, opponentId, ctx = {}) {
  const aName = bibleFor(fighterId)?.name ?? fighterById(fighterId).name;
  const bName = bibleFor(opponentId)?.name ?? fighterById(opponentId).name;
  const seed = ctx.seed ?? hashSeed(`promo:${fighterId}:vs:${opponentId}`);
  return {
    a: generateDialogue(fighterId, "callout", { ...ctx, opponent: bName, seed }),
    b: generateDialogue(opponentId, "callout", { ...ctx, opponent: aName, seed: seed ^ 40503 })
  };
}
function hashSeed(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// src/game3d/dialogue/samples.ts
var SAMPLE_PACK = [
  // ============================ STATIC (the bar) ============================
  {
    fighter: "Static",
    fighterId: "static",
    situation: "backstage",
    context: "Judas' street interview \u2014 addressing the bus scuffle with Brian Cage's guy and the leaked backstage fights",
    lines: [
      "That's funny, man. I've never heard anybody talk about that incident ever.",
      "I'm not a d*ck. I'm just a really good guy, but you take my kindness for weakness I immediately throw hands. I never spoke about this and I never really will.",
      "Hey bro, I had to fight for everything I got. I didn't get where the f*ck I got being some pushover slump p*ssy b*tch. Never.",
      "When sh*t hit the fan backstage or when I had to go walk in a room and speak to Edwin Kennedy one-on-one or when I had to go talk to Triple X and Stan Combs one-on-one, those conversations stayed there.",
      "With the boys, the same bullsh*t. If I fistfought another guy in the locker room you probably never heard of it because I probably f*cking won.",
      "I appreciate that what happens in the JCPW locker room as far as fistfights never left. F*ck AWE for all the p*ssy-ass fighting that they do over there and letting it leak and sh*t."
    ]
  },
  {
    fighter: "Static",
    fighterId: "static",
    situation: "promo",
    context: "Pre-match promo, Cinder Plaza, vs Wreck Patterson",
    lines: [
      "That's funny, man. Y'all put Wreck Patterson in front of ME? At the plaza? In front of MY people?",
      "Listen \u2014 I'm a really good guy. Ask anybody in that locker room. But Wreck keeps runnin' that mouth about what happened on that bus, and lemme tell you somethin', my guy \u2014",
      "What happens in JCPW stays in JCPW. That's the code. But codes don't cover what I'm about to do to him in that ring, 'cause that's not backstage. That's business. And business is about to get CERTIFIED."
    ]
  },
  {
    fighter: "Static",
    fighterId: "static",
    situation: "callout",
    context: "Calling out an AWE leaker by name",
    lines: [
      "Yo \u2014 you. Yeah, YOU, the one runnin' to the dirt sheets every time somebody gets touched up backstage.",
      "In JCPW, real ones handle it. In AWE, y'all file a report. That's the difference between a locker room and a daycare, my guy.",
      "Keep my name out your mouth unless you're ready to back it up with hands. And we both know how that ends \u2014 'cause last time, nobody heard about it. 'Cause I WON."
    ]
  },
  {
    fighter: "Static",
    fighterId: "static",
    situation: "victory",
    context: "Post-win, still holding the mic, crowd buzzing",
    lines: [
      "TOLD you! Bona fide! Certified! How you doin', Cinder Plaza?!",
      "And for everybody at AWE watchin' at home \u2014 that's how you handle business WITHOUT leakin' it. Take notes, my guy."
    ]
  },
  {
    fighter: "Static",
    fighterId: "static",
    situation: "street",
    context: "Judas catches him outside the venue, asks about the Edwin Kennedy sit-down",
    lines: [
      "The sit-down with Edwin? That's funny, man.",
      "Me and Edwin went one-on-one, behind closed doors, like men. What was said in that room stays in that room \u2014 that's the CODE.",
      "But I'll say this: he walked in loud and he walked out... respectful. That's all you get. Next question, my guy."
    ]
  },
  {
    fighter: "Static",
    fighterId: "static",
    situation: "defeat",
    context: "Rare post-loss \u2014 jaw tight, mic shaking slightly",
    lines: [
      "A'ight. A'ight. Y'all got your moment.",
      "But listen \u2014 I had to fight for everything I got, and I ain't never been a pushover, so understand this: that was ONE night.",
      "Run it back. Anywhere. Behind closed doors, in the ring, on a bus \u2014 I don't care. And this time it stays in the room, 'cause this time I'm takin' it personal."
    ]
  },
  // ============================ CIPHER ============================
  {
    fighter: "Cipher",
    fighterId: "cipher",
    situation: "promo",
    context: "Pre-match, Night Market, feeling the sludge creep in",
    lines: [
      "Man of the hour, baby! Night Market, you ready to watch me work?",
      "...You feel that? That static under the shine? Don't worry about it. Worry about the fact that in about ten minutes, I'm still gonna be the moment \u2014 and you're gonna be the footnote.",
      "Too sweet to be stressed. Too blessed to be bothered. Watch me work."
    ]
  },
  {
    fighter: "Cipher",
    fighterId: "cipher",
    situation: "backstage",
    context: "After a match where the sludge psycho took over mid-fight",
    lines: [
      "I don't... I don't remember the third round. They tell me I was smilin'.",
      "The shine's still mine. It just... it gets loud in here sometimes. The hour demands things, you know?",
      "Don't look at me like that. Watch me work \u2014 I'll be fine. I'm always fine."
    ]
  },
  // ============================ ECHO ============================
  {
    fighter: "Echo",
    fighterId: "echo",
    situation: "callout",
    context: "Calling out Sombra Negra \u2014 who steals finishers, which Echo finds DELIGHTFUL",
    lines: [
      "Ooooh, the Finisher Thief! You steal moves? I steal moves! We're gonna get along GREAT \u2014 heheh \u2014 or one of us is gonna get hurt tryin'.",
      "You take my best move, I'll take it BACK, and then I'll do YOURS, and then we'll just keep tradin' till somebody naps! Echo echo echo... who's nappin', Sombra?"
    ]
  },
  {
    fighter: "Echo",
    fighterId: "echo",
    situation: "weighin",
    context: "Staredown with Titan \u2014 she has to look straight up",
    lines: [
      "...You're BIG. Heheh. That's okay! Big trees fall the loudest \u2014 TIMBER!",
      "Don't blink, big guy. Actually \u2014 DO blink. I wanna see if the ground shakes."
    ]
  },
  // ============================ STICK-UP ============================
  {
    fighter: "Stick-Up",
    fighterId: "stickup",
    situation: "promo",
    context: "Pre-match, Scrap Street \u2014 the system wants him back",
    lines: [
      "They built me to be a weapon. Then they lost control of the weapon. Now they send boys to collect.",
      "Scrap Street. Tonight. Whoever they send \u2014 you already know what it is.",
      "Talk is cheap. Hands ain't."
    ]
  },
  {
    fighter: "Stick-Up",
    fighterId: "stickup",
    situation: "faction",
    context: "Addressing the Ashes \u2014 the block remembers",
    lines: [
      "The Ashes don't recruit. We recognize.",
      "The block remembers who stood up when it cost somethin'. The rest is noise.",
      "We move tonight. Quiet. Together. Like always."
    ]
  },
  // ============================ MAIME ============================
  {
    fighter: "Maime",
    fighterId: "maime",
    situation: "promo",
    context: "Pre-match, no venue announced \u2014 he just showed up",
    lines: [
      "You don't know me. You know the version that SURVIVED.",
      "He keeps me in the basement, you know. The basement's got no windows. But tonight \u2014 tonight somebody left the door open.",
      "Burn it down and dance in it! BURN IT DOWN AND DANCE IN IT!"
    ]
  },
  // ============================ SOMBRA NEGRA ============================
  {
    fighter: "Sombra",
    fighterId: "sombra_negra",
    situation: "callout",
    context: "Calling out El Toro de Oro \u2014 she wants the bull's best",
    lines: [
      "Toro. Your faena is beautiful. I've watched the tapes \u2014 all of them.",
      "Bring your best move to the ring. Your bravest, proudest finish. I'll take it gently... and then I'll end you with it.",
      "La trampa de plata, torito. The silver trap. Negocios son negocios."
    ]
  },
  {
    fighter: "Sombra Negra",
    fighterId: "sombra_negra",
    situation: "victory",
    context: "Just beat someone with their own finisher",
    lines: [
      "Your best move. My favorite weapon. Gracias.",
      "The invoice is paid. Next contract."
    ]
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
      "The paint never comes off, baby. Neither does tonight."
    ]
  },
  // ============================ EL TORO DE ORO ============================
  {
    fighter: "El Toro de Oro",
    fighterId: "toro",
    situation: "callout",
    context: "Answering Sombra Negra's challenge \u2014 honor demands it",
    lines: [
      "Sombra Negra. You study the bull, but you do not KNOW the bull.",
      "You want my faena? Come and take it with honor \u2014 man to... sombra. If you steal it like a thief, the herd will remember you as one.",
      "\xA1El toro no se arrodilla! The bull does not kneel \u2014 not for contracts, not for traps, not for YOU."
    ]
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
      "Your file's already closed. I'm just here to process the termination."
    ]
  },
  // ============================ EDWIN KENNEDY ============================
  {
    fighter: "Edwin Kennedy",
    fighterId: "edwin",
    situation: "promo",
    context: "Grabbing the mic before the announcer finishes",
    lines: [
      "EDWIN... KENNEDY! ...Thank you. You're welcome. Please, hold your applause \u2014 actually, don't. Let it wash over me.",
      "Tonight, some poor soul gets to tell his grandkids he shared a ring with a SUPERSTAR. You're welcome in advance."
    ]
  },
  // ============================ TRIPLE X ============================
  {
    fighter: "Triple X",
    fighterId: "triplex",
    situation: "promo",
    context: "Rare address \u2014 the Combine throne speaks",
    lines: [
      "You think this is about tonight. It's adorable, really.",
      "Every alliance you've made, every favor you've called in \u2014 I arranged the board years ago.",
      "It's not personal. It's just... the game. And I don't play checkers."
    ]
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
      "Talk's over."
    ]
  }
];
function samplesFor(fighterId) {
  return SAMPLE_PACK.filter((s) => s.fighterId === fighterId);
}

// src/game3d/campaign.ts
var RAW = [
  { act: 1, actName: "The hire", title: "Warm the corner", step: "You were paid for the plaza. The people standing there are the job. Nobody else is coming.", home: "plaza", drop: "plaza", stage: "ward", waves: 1, hp: 1, boss: false, rule: "clear" },
  { act: 1, actName: "The hire", title: "Scrap street", step: "The next pay is south of the plaza. You start on the scrap street, not back at the corner.", home: "street", drop: "street", stage: "ward", waves: 1, hp: 1, boss: false, rule: "clear" },
  { act: 1, actName: "The hire", title: "Night sellers", step: "The market hired its own hands. You come in from the stalls.", home: "market", drop: "market", stage: "pit", waves: 1, hp: 1.05, boss: false, rule: "clear" },
  { act: 1, actName: "The hire", title: "Walk the lane", step: "Start at the corner. The fight is on the scrap street. Get there, then finish who is standing.", home: "street", drop: "plaza", stage: "ward", waves: 1, hp: 1.05, boss: false, rule: "reach" },
  { act: 2, actName: "High", title: "The coil", step: "They moved the stash onto the scaffolds. You start on the roofs.", home: "scaffold", drop: "scaffold", stage: "high", waves: 1, hp: 1.15, boss: false, rule: "clear" },
  { act: 2, actName: "High", title: "North roof", step: "The crane roof is the job. Climb is already behind you. You start at the top.", home: "crane", drop: "crane", stage: "high", waves: 1, hp: 1.2, boss: false, rule: "clear" },
  { act: 2, actName: "High", title: "Up the steps", step: "Start on the coil. The name you want is on the north roof. Walk it.", home: "crane", drop: "scaffold", stage: "high", waves: 1, hp: 1.2, boss: false, rule: "reach" },
  { act: 2, actName: "High", title: "One on the coil", step: "One fighter. The roof is the ring. No second crew.", home: "scaffold", drop: "scaffold", stage: "high", waves: 1, hp: 1.35, boss: true, rule: "rival" },
  { act: 3, actName: "Rooms", title: "The ropes", step: "East of the pier. The red ropes hold the fight. You start inside them.", home: "ring", drop: "ring", stage: "yard", waves: 1, hp: 1.25, boss: false, rule: "inside" },
  { act: 3, actName: "Rooms", title: "The grate", step: "West cage. You start in the mesh. Throw them into it.", home: "cage", drop: "cage", stage: "yard", waves: 1, hp: 1.3, boss: false, rule: "inside" },
  { act: 3, actName: "Rooms", title: "The paper", step: "The back room past the market. One name keeps the paper.", home: "office", drop: "office", stage: "pit", waves: 1, hp: 1.45, boss: true, rule: "rival" },
  { act: 3, actName: "Rooms", title: "Through the gap", step: "Start in the market. The room is through the east gap. Finish it there.", home: "office", drop: "market", stage: "pit", waves: 1, hp: 1.3, boss: false, rule: "reach" },
  { act: 4, actName: "Under", title: "The cut", step: "Under the ward. You start in the cut, not on the plaza.", home: "under", drop: "under", stage: "under", waves: 1, hp: 1.35, boss: false, rule: "clear" },
  { act: 4, actName: "Under", title: "The train", step: "South tunnel. You start on the platform. Stay off the track.", home: "subway", drop: "subway", stage: "under", waves: 1, hp: 1.4, boss: false, rule: "clear" },
  { act: 4, actName: "Under", title: "South", step: "Start in the cut. The platform is further south. The fight is there.", home: "subway", drop: "under", stage: "under", waves: 1, hp: 1.4, boss: false, rule: "reach" },
  { act: 4, actName: "Under", title: "One on the platform", step: "One fighter in the tunnel. The train still runs.", home: "subway", drop: "subway", stage: "under", waves: 1, hp: 1.55, boss: true, rule: "rival" },
  { act: 5, actName: "Ends", title: "The trucks", step: "The yard. You start between the trucks.", home: "yard", drop: "yard", stage: "yard", waves: 1, hp: 1.45, boss: false, rule: "clear" },
  { act: 5, actName: "Ends", title: "The pier", step: "The pier does not wait. You start on the water side.", home: "dock", drop: "dock", stage: "dock", waves: 1, hp: 1.5, boss: false, rule: "clear" },
  { act: 5, actName: "Ends", title: "They come back", step: "The only job that sends a second crew. Beat the pier, then the ones who fell back.", home: "dock", drop: "dock", stage: "dock", waves: 2, hp: 1.45, boss: false, rule: "second" },
  { act: 5, actName: "Ends", title: "The pier name", step: "One heavier fighter on the pier. The block hears who won.", home: "dock", drop: "dock", stage: "dock", waves: 1, hp: 1.7, boss: true, rule: "rival" },
  { act: 6, actName: "Both ends", title: "West name", step: "One name in the cage. You start inside the grate.", home: "cage", drop: "cage", stage: "yard", waves: 1, hp: 1.7, boss: true, rule: "rival" },
  { act: 6, actName: "Both ends", title: "Back on the ropes", step: "The ring again, later, with heavier hands. Still one fight.", home: "ring", drop: "ring", stage: "yard", waves: 1, hp: 1.6, boss: false, rule: "inside" },
  { act: 6, actName: "Both ends", title: "The room holds", step: "Back room. The door is the boundary. You start at the desk.", home: "office", drop: "office", stage: "pit", waves: 1, hp: 1.65, boss: false, rule: "inside" },
  { act: 6, actName: "Both ends", title: "The drop", step: "One name on the crane roof. A fall is part of the fight.", home: "crane", drop: "crane", stage: "high", waves: 1, hp: 1.75, boss: true, rule: "rival" },
  { act: 6, actName: "Both ends", title: "Across the ward", step: "Start in the yard. The pier is the job. Cross it, then finish them.", home: "dock", drop: "yard", stage: "dock", waves: 1, hp: 1.6, boss: false, rule: "reach" },
  { act: 6, actName: "Both ends", title: "Paper Quinn", step: "The last paper. You start in the back room. One name.", home: "office", drop: "office", stage: "pit", waves: 1, hp: 1.9, boss: true, rule: "rival" }
];
var MISSIONS = RAW.map((job, i) => ({ ...job, n: i + 1 }));
function missionAt(index) {
  return MISSIONS[index] ?? MISSIONS[0];
}

// src/game3d/dialogue/director.ts
function pauseMenuBeat(fighterId, missionIndex, seed) {
  const mission = missionAt(missionIndex);
  const name = bibleFor(fighterId)?.name ?? fighterById(fighterId).name;
  const placeName = {
    plaza: "Cinder Plaza",
    street: "Scrap Street",
    scaffold: "the Coil Roofs",
    market: "Night Market",
    yard: "the Yard",
    dock: "the Pier",
    under: "Under the Ward",
    ring: "the Ring",
    cage: "the Cage",
    subway: "the Platform",
    crane: "the Crane Roof",
    office: "the Back Room"
  };
  const place = placeName[mission.home] ?? mission.home;
  const ctx = { place, title: mission.title, seed };
  let lines;
  let label;
  if (mission.boss) {
    label = `Boss \u2014 ${mission.title}`;
    lines = generateDialogue(fighterId, "callout", { ...ctx, opponent: "this boss" }).lines.slice(0, 2);
  } else if (mission.rule === "reach") {
    label = `On the move \u2014 ${mission.title}`;
    lines = generateDialogue(fighterId, "promo", ctx).lines.slice(0, 2);
  } else {
    label = `Between rounds \u2014 ${mission.title}`;
    const sample = samplesFor(fighterId).find((s) => s.situation === "backstage");
    lines = sample ? sample.lines.slice(0, 3) : generateDialogue(fighterId, "backstage", ctx).lines.slice(0, 2);
  }
  return { speaker: name, fighterId, lines, label };
}
var INTERVIEWER_LINES = [
  "Word on the street is things got heated. What really happened?",
  "The fans want to know \u2014 what's the real story?",
  "AWE's been running their mouths. Your response?",
  "Last question \u2014 anything you want to say directly to them?"
];
function backstageSegment(fighterId, opponentName, seed) {
  const name = bibleFor(fighterId)?.name ?? fighterById(fighterId).name;
  const rngSeed = seed ?? 0;
  const backstage = generateDialogue(fighterId, "backstage", { opponent: opponentName, seed: rngSeed });
  const street = generateDialogue(fighterId, "street", { opponent: opponentName, seed: rngSeed ^ 81 });
  const turns = [];
  const iv = INTERVIEWER_LINES[rngSeed % INTERVIEWER_LINES.length];
  turns.push({ speaker: "Judas", fighterId: "__interviewer", text: `${name} \u2014 ${iv}` });
  const answer = [...backstage.lines, ...street.lines].slice(0, 3);
  for (const line of answer) turns.push({ speaker: name, fighterId, text: line });
  if (fighterId === "static") {
    turns.push({ speaker: "Judas", fighterId: "__interviewer", text: "Come on \u2014 give us ONE name." });
    turns.push({
      speaker: name,
      fighterId,
      text: "That's funny, man. What happens in the JCPW locker room stays in the JCPW locker room. Next question."
    });
  }
  return { title: `JCPW Backstage \u2014 ${name}`, turns };
}

// ../../agent-ops/scratch/dlg-test.ts
var d1 = generateDialogue("static", "promo", { opponent: "Wreck Patterson", place: "Cinder Plaza" });
var d2 = generateDialogue("static", "promo", { opponent: "Wreck Patterson", place: "Cinder Plaza" });
console.log("DETERMINISM:", JSON.stringify(d1.lines) === JSON.stringify(d2.lines) ? "PASS" : "FAIL");
console.log("--- static promo ---");
d1.lines.forEach((l) => console.log(">", l));
var ex = promoExchange("static", "sombra_negra", { place: "Cinder Plaza" });
console.log("--- exchange: static calls out sombra ---");
ex.a.lines.forEach((l) => console.log("STATIC>", l));
ex.b.lines.forEach((l) => console.log("SOMBRA>", l));
console.log("--- backstage segment turns:", backstageSegment("static", "Wreck Patterson", 7).turns.length);
var pb = pauseMenuBeat("cipher", 7);
console.log("--- pause beat:", pb.label, "|", pb.lines.length, "lines");
console.log("--- sample pack pieces:", SAMPLE_PACK.length);
var echo = generateDialogue("echo", "callout", { opponent: "Sombra Negra" });
console.log("--- echo callout ---");
echo.lines.forEach((l) => console.log(">", l));
var fallback = generateDialogue("brutus", "promo", { opponent: "Titan", place: "the Yard" });
console.log("--- brutus (no bible, archetype fallback) ---");
fallback.lines.forEach((l) => console.log(">", l));
