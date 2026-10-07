# TEKKEN TEARDOWN — for AshLane

> **Research:** 2026-10-06. Sources: Tekken Wiki (Fandom), VG247, Den of Geek,
> Dot Esports, Radio Times, GameRant, TheGamer, GameSpot, TechRadar,
> esports.gg, GGRecon, PC Gamer, GameSkinny, Villains Wiki, Steam community.
> Builds on `TEKKEN_DEVIL_WITHIN_TEARDOWN.md` (Tekken lore overview in this
> folder) — read that first; this doc doesn't repeat it.
>
> **Lens:** AshLane's theme formula is UNDERLYING = Malakor + Shadow Wizard
> Money Gang (dark streets, mood, lore), OVERLYING = Tekken + Urban Reign
> (character presentation, combat, menu language). This teardown feeds the
> **OVERLYING half**: how Tekken designs character archetypes, corporate
> factions, "executive threat" villains, and costume language — and what
> AshLane should steal. AshLane is an Urban Reign-style **street brawler**,
> not a wrestling game: ~85% street / 15% wrestling flavor. Faction visual
> rule: **no matching single-color uniforms** — use patches, armbands,
> small accents, symbols. Each district gets its own color palette.
> Steal the systems and structure, not the IP.

---

## 1. Character archetypes across the roster

Tekken's design philosophy (per game director Kohei Ikeda, via TechRadar):
every roster slot must be a **unique archetype** — visually appealing AND a
distinct playstyle concept. The dev team explicitly cut "compatible
characters" (clone movesets with different skins) from Tekken 8. That is the
standard AshLane's roster should be held to: **no two characters should share
a silhouette AND a move-logic**.

Archetype table (Tekken 7/8 focus, series history where it matters):

| Archetype | Exemplar(s) | Mechanical definition | Visual definition |
|---|---|---|---|
| **Mishima karate** | Kazuya, Heihachi, Devil Jin, Reina (T8) | Wavedash + 50/50 mixups (hell sweep / Electric Wind God Fist). High execution ceiling, "fundamental pressure" identity | Bare-chested gi pants, red fighting gloves, flame motifs; tiger imagery on Heihachi's gi back |
| **Legacy heir** | Jin Kazama (T8: karate) | Defensive, fundamentals-driven; T8 shifted him to stronger offense + story arc about rejecting Mishima heritage | Black/red jacket, combat pants — T8 design deliberately blends mother Jun's black/white scheme with his own red accents |
| **Grappler** | King II, Armor King | Massive throw/command-grab chains (multi-throw sequences), suplexes, powerbombs, submissions; weak to spacing | Lucha libre mask + wrestling boots/tights; Armor King = armored variant |
| **Boxer** | Steve Fox | Hands only (no kicks) — sway/weave counter game, rapid jabs | Boxing shorts, gloves, hand wraps; T8 kit is pure British boxer |
| **Capoeira** | Eddy Gordo, Christie | Rhythmic, acrobatic low attacks from inverted/handstand positions | Brazilian flag colors, loose capoeira pants |
| **Rushdown kicker** | Hwoarang, Marshall Law | Relentless kick pressure, stance-transition strings; Hwoarang = taekwondo aggression | Hwoarang: dobok top / street-grunge; Law: Bruce Lee-style tracksuit |
| **Stance technician** | Yoshimitsu, Ling Xiaoyu, Zafina, Lei Wulong | Multiple stances (Phoenix, back-turned, etc.), evasion into punishes, unorthodox angles | Xiaoyu: Chinese opera/bagua dress; Zafina: contortionist assassin garb; Yoshimitsu: reinvented every game (T8 = cosmic blue/red armored samurai) |
| **Heavy / tank** | Jack-8, Kuma/Panda, Bryan Fury (kickboxing cyborg) | Slow, super-armor-ish pressure, huge damage; Jack = "brute force" | Jack: towering military cyborg; Kuma: full bear; Bryan: cyborg + military fatigues |
| **Counter / evasive** | Lili (self-taught), Alisa (thruster mobility), Asuka | Sidestep-heavy, counter-hit fishing; Asuka = Kazama-style counter | Lili: Monaco heiress dress → fighting gear; Asuka: Japanese school/street |
| **Military operative** | Sergei Dragunov (Commando Sambo), Shaheen (CQC) | Grapple-strike hybrid, takedowns, cold efficiency; Dragunov = the "silent" archetype | Dragunov: Russian military uniform, emotionless; Shaheen: Saudi military fatigues |
| **Street master** | Leroy Smith (Wing Chun) | Parry-heavy, cane as weapon, calm counter-puncher | Leroy: Harlem Wing Chun master, cane, "drip" — deliberately stylish elder |
| **Weapon user** | Victor Chevalier (gun + cybernetic sword), Yoshimitsu (katana), Kunimitsu (ninjutsu) | Ranged integration into 3D-fighter spacing (Victor is T8's big experiment here) | Victor: ex-French Navy / UN independent-forces officer, tactical suit |
| **Exorcist / mystic** | Claudio Serafino (Sirius Exorcism Arts), Zafina (Ancient Assassination Arts) | Projectile/star-burst zoning in a game with almost no projectiles | Claudio: white-and-gold exorcist coat; Zafina: occult desert garb |
| **Corporate spy / assassin** | Nina Williams, Anna Williams (assassination arts) | Aikido/judo-based strikes, grapples, cold professionalism | Nina T8: dark tactical dress + leather jacket + sunglasses + thigh knife; Anna S2: redesign + rocket launcher |
| **Healer / pacifist** | Jun Kazama (Kazama-style traditional martial arts) | Moves that cost her own HP; Heat state negates the cost — risk/reward as character theme | White/black kimono-style; T8 alt echoes Kazumi's T7 kimono |

### Archetype design lessons for AshLane

- **Silhouette = move-logic.** You can tell what a Tekken character *does*
  from their outfit before they throw a punch: mask = grappler, gloves =
  boxer, dobok = kicker, uniform = military. AshLane attires must do the
  same — a corpo enforcer, a biker, a cop must *read* their fighting style
  at a glance.
- **Stance/technical characters are retention engines.** Tekken keeps
  Xiaoyu/Zafina/Yoshimitsu players for years because stance mastery is a
  long-term investment. AshLane needs at least one stance-based technical
  fighter per district.
- **The heavy exists to be the wall.** Jack/Kuma are deliberately simple,
  high-damage, and visually unmistakable. AshLane's "heavy" per faction
  (e.g. a PMC juggernaut) should be readable from 50 feet: bulk + armor.
- **Cut clones, not characters.** Ikeda's rule — if two characters share a
  moveset, one goes. Apply this to AshLane's roster planning: every canon
  character gets a unique mechanical hook, never a reskin of another's kit.

---

## 2. Factions and power groups

Tekken's story is a **corporate war fought through a martial-arts
tournament**. The tournament (King of Iron Fist) is not a sporting event in
the fiction — it's a corporate weapon: ownership of the Mishima Zaibatsu is
regularly the prize, and in Tekken 8 the *losers' home countries get wiped
out*. AshLane's turf-war structure is the street-scale mirror of this:
the fight venue IS the power mechanism.

### The factions

| Faction | Leader / face | Business | What they want | How they operate |
|---|---|---|---|---|
| **Mishima Zaibatsu** | Jinpachi (founder, canon debated) → Heihachi (40 yrs) → Kazuya (T1–T2) → Jinpachi possessed (T5) → Jin Kazama (T6) → Heihachi (T7) → destroyed (T8) | World's largest military-equipment developer; arms, finance (Mishima Financial Empire), private school/training ground (Mishima Polytechnical) | Depends on the CEO: Heihachi = eternal control + harnessing demonic power; Kazuya = expansion + criminal enterprise; Jin (T6) = global war "to end evil" | Private army (**Tekken Force**), tournament-as-weapon, hostile takeovers, absorbing rivals' tech |
| **G Corporation** | Kazuya Mishima (CEO, revealed T4) | Biotech/genetics (GENOCELL), robotics (Jack series), cybernetics (resurrected Bryan Fury) | Initially R&D; under Kazuya: militarized rival to the Zaibatsu; T8 = world consolidation | Raided by Zaibatsu for tech; militarized in T6 and *praised as heroes* for opposing Jin's war; T8 wins the corporate war, runs the tournament, hires tournament fighters on parole (Azucena, Law, Dragunov) |
| **Violet Systems** | "Violet" = Lee Chaolan (Heihachi's adopted son, expelled) | Humanoid robotics (rival to G Corp in robotics) | Oppose both Mishima Zaibatsu and G Corp; play the long game | Bought G Corp shares, spied via Julia Chang, **funds the rebel army Yggdrasil** — the third corp bankrolling street-level resistance |
| **Yggdrasil** | Lars Alexandersson (Tekken Force captain, defected) | Rebel army (~30,000 — half of Tekken Force deserted in T6) | Take down both Zaibatsu and G Corp | Guerrilla strikes on corporate bases; in T8 allies with the UN to defeat G Corp |
| **Tekken Force** | CEO of the Zaibatsu = supreme commander; operational captains (Lars pre-defection) | Private corporate army (~60,000 pre-T6) | Zaibatsu's will — enforcement, skirmish-quelling, "peacekeeping" | Motto: *Potius mori quam tradere* ("better to die than betray"); public-relations deployments (foreign aid, land cultivation) mask military ops |
| **Archers of Sirius** | Claudio Serafino | Ancient secretive exorcist order | Banish supernatural entities (Devil Gene, Azazel) | Temporarily allied with Heihachi-led Zaibatsu to bring down Kazuya; in T8, Zafina (with Sirius) seals Azazel — Kazuya traps her at the Rome finals to absorb him |
| **UN independent forces** | Victor Chevalier (founder) | Supranational military | Stop the corporate war | T8: UN outwardly opposes G Corp alongside Yggdrasil |
| **Interpol (ICPO)** | Det. Lei Wulong | International police | Investigate Kazuya / G Corp | G Corp assaulted an ICPO branch office in T6 to bury an investigation |
| **Manji clan** | Yoshimitsu | Ninja clan — steal from the rich, give to the poor (Robin Hood ethic) | Oppose Zaibatsu exploitation | Corporate-raiding raids; Yoshimitsu repeatedly infiltrates the tournament |
| **Tekken Monks** | Genmaji Temple order (T8 DLC story) | Martial-arts purists | Restore the "purity" of Mishima Style | Rescued amnesiac Heihachi; were destroyed by him when his memory returned |

### How the corporate war actually works in the story

- **Tekken 6:** CEO Jin Kazama declares global war *using the Zaibatsu's
  Tekken Force*, framing it as a necessary evil. G Corporation militarizes in
  response and is **praised by the world as heroes** — Tekken's best trick:
  the "villain corp" becomes the good guys by opposing a worse corp.
- **Tekken 7:** Kazuya (G Corp CEO) destroys the Zaibatsu HQ; Heihachi vs.
  Kazuya final duel; G Corp wins the corporate war.
- **Tekken 8:** "With much of the central resistance gone, Kazuya overthrew
  the [Zaibatsu] and continued the global war... the world became
  consolidated under Kazuya within months." The eighth tournament's stakes:
  **losers' countries are erased**. G Corp hires beaten fighters on parole —
  corporate power expressed through *employment*, not just armies.
- **Violet Systems is the model AshLane should copy most directly:** a third
  corporation that never fields an army — it buys shares, plants spies
  (Julia Chang), and **funds someone else's rebellion**. That's exactly how a
  corpo faction should operate in a street game: pull strings, don't patrol
  streets.

### Faction design lessons for AshLane

- **The tournament is a corporate instrument.** Tekken's masterstroke is
  making the central spectacle *be* the corporation's weapon. AshLane's
  equivalent: the turf war / block-takeover circuit is run or sponsored by
  corpo factions — winning a block shifts corporate territory, not just
  gang prestige.
- **Morality is positional, not fixed.** G Corp goes from Kazuya's evil lab
  to world heroes to world conquerors depending on who they oppose. AshLane
  factions should likewise read differently from different districts'
  perspectives.
- **Private armies need doctrine, not just guns.** The Tekken Force has a
  motto, a uniform, public-relations cover ops, and a defection arc. A
  corpo PMC in AshLane needs the same: name, motto, insignia, a public story
  ("security", "community protection") that contradicts what players see.
- **The third-party funder is the most street-relevant corp.** Violet
  Systems never fights — it *finances*. AshLane corpo bosses should mostly
  act through proxies: hiring fighters, funding gangs, buying blocks. The
  player fights the *symptoms* for most of the game and the *executive* at
  the end.

---

## 3. Corporate villain design: how Tekken makes a CEO read as a final boss

### Heihachi Mishima — the founder-patriarch as force of nature

**Who he is:** CEO of the Mishima Zaibatsu for ~40 years, built it into the
world's biggest military-equipment developer, supreme commander of the
Tekken Force. Hosted every King of Iron Fist Tournament as a corporate
instrument. Threw his son off a cliff; threw his son into a volcano.

**Outfit:** Wing-like white hair, tiger face on the back of his blue gi,
red belt, wrist bandages. Tekken 8's update of his classic Tekken 2/5 gi:
sleeves rolled up (not torn), a **gold emblem embroidered on the chest**,
red prayer beads, yellow belt replacing the red, and flame motifs on the
pant legs echoing Kazuya's. Battle-damaged variants appear in story ("the
damaged gi" look from Tekken 7's Awakened form). His DLC monk arc flips the
silhouette entirely — flat hair, subdued monk attire — to signal a
*personality* change, proving Tekken treats outfit as character state.

**Presence:** Arrives by helicopter, holds tournaments in temples, fights on
volcanoes. His intimidation is *scale*: the stage bends around him.

**Moveset:** Mishima 50/50 (hell sweep / Electric Wind God Fist) + headbutt;
Tekken 8 made him even more aggressive with two new stances (Thunder God /
Wind God). The design philosophy: the CEO doesn't poke — he *dictates*.

**The lesson:** Heihachi reads as executive power through *heraldry* (the
gold emblem, the tiger) and *ceremony* (the tournament itself). He never
wears a suit — his "uniform of office" is the gi of the Mishima style,
because the Zaibatsu's brand IS martial tradition.

### Kazuya Mishima — the CEO-devil duality

**Who he is:** CEO of G Corporation (publicly revealed in Tekken 4).
Consolidated the world under G Corp within months in Tekken 8. Runs the
eighth tournament with nation-erasure stakes. Carries the Devil Gene.

**Outfit:** Tekken 8's default is the franchise's best "executive threat"
design: a **purple leather snakeskin jacket over a suit**, classic red
fighting gloves underneath. It fuses his Tekken 2 suit, Tag 1, and Tekken
6/7 looks into one silhouette. As TheGamer put it, it gives him "final boss
aura" that complements "his profession, wealth, and taste" — the dark
colors are intimidating and the outfit says *this battle is beneath him*.
The key detail: **he wears fighting gloves with the suit.** He is always
ready to fight. His Tekken 5-era alt — white gi pants with purple/red
flame motifs — is the same idea in martial register.

**Presence:** Tekken 8 opens with him destroying military satellites in
devil form over New York, then calmly announcing the tournament. Power
display first, bureaucracy second.

**Moveset:** Mishima 50/50 core + devil powers (laser, devil form as Heat
state in T8, "Parricide Fist"). The devil form is the *escalation*: the
executive has a second, supernatural phase.

**The lesson:** Kazuya's formula is **suit + fight-readiness accessory +
supernatural escalation**. The suit says CEO; the gloves say he doesn't need
security; the devil says the corporation's power has a metaphysical price.
This is the single most portable formula for AshLane's corpo bosses.

### Jinpachi Mishima — the corrupted founder

**Who he is:** Original founder of the Zaibatsu (canon later retconned —
Tekken 7 says Heihachi built it up; Harada clarified Jinpachi never had the
money), who regretted the arms business and tried to return the company to
martial-arts honor. Possessed by a vengeful spirit, he became Tekken 5's
final boss.

**Outfit:** Human form: gold bands on wrists/ankles/arms, ornate gold
necklace, waist sash — an ancient patriarch. Possessed form: red/purple
skin, yellow glowing eyes, back spikes, a **fanged mouth in his stomach**
firing fireballs, tattered clothes. Dark Resurrection alt: full flaming
body, magma eyes, forehead horn, hair replaced by fire. His design is
inspired by Buddhist warlike figures (Vajrapani).

**The lesson:** Jinpachi is the "founder's sin made flesh" — the company
founder corrupted into a demon. His outfit *degrades* with corruption:
jewelry falls off, clothes tatter, the body transforms. **Corruption has a
visual grammar: remove the trappings of status, add the supernatural.**
AshLane's Malakor corruption can use exactly this grammar on its corpo
bosses.

### The executive-threat formula (portable rules)

1. **Status garment + combat accessory.** Suit + gloves (Kazuya), gi +
   gold emblem (Heihachi). The accessory must imply "I fight personally."
2. **Heraldry.** Embroidered/engraved faction emblem on the chest. Instant
   allegiance read.
3. **Silhouette dominance.** Long coats, big shoulders, capes — the boss is
   bigger on screen than the rank and file, literally and figuratively.
4. **Supernatural escalation.** Every Tekken final boss has a second phase:
   devil form, possessed form, "Awakened" battle-damage state. The executive
   threat *transforms*. For AshLane: Malakor corruption = the Devil Gene —
   the corrupted second-phase form of a corpo boss.
5. **Ceremonial staging.** Tournaments, announcements, country-erasure
   stakes. The boss doesn't ambush you in an alley — he summons you to *his*
   venue. AshLane corpo bosses should be fought in their boardrooms,
   penthouses, and private arenas, not on the street.

---

## 4. Outfit / costume design language

### The design philosophy (per the directors)

Ikeda (Tekken 8 game director, via TechRadar): a new character must be
"generally appealing to all players" visually AND have a solid, unique
playstyle concept — "from a design standpoint and a gameplay standpoint
they'll appeal not only to veterans of the series but to newcomers."
Example given: Azucena — "she's a striker but she has a certain stance so
that means she can evade various different attacks which is kind of a fun
and unique characteristic." **Visual hook and mechanical hook are designed
together, never separately.** Harada adds that the team avoids "compatible
characters" (same moveset, different skin) — uniqueness is enforced at both
layers.

### What a default costume must signal (the Tekken rules)

| Signal | How Tekken does it | AshLane takeaway |
|---|---|---|
| **Nationality** | Eddy = Brazilian flag colors; Hwoarang = Korean taekwondo dobok; King = Mexican lucha mask; Dragunov = Russian military; Shaheen = Saudi fatigues; Leroy = Harlem street + Wing Chun | District of origin must be readable in the outfit — but per owner rules, via *accents*, not flags-as-uniform |
| **Fighting style** | Gi pants = karate; boxing kit = boxer; mask + tights = wrestler; cane = Wing Chun master; gun + sword = weapon user | Silhouette = move-logic (see §1) |
| **Personality** | Kazuya's snakeskin jacket = wealth + menace; Lee's flamboyant purple = playboy showman; Leroy's "drip" = stylish elder; Bryan's military gear = soldier-cyborg | Outfit is character bible — taste, age, attitude |
| **Allegiance** | Heihachi's gold Zaibatsu emblem on the gi chest; Tekken Force uniforms; Reina's school uniform hiding Mishima moves (allegiance *twist*) | Emblems/insignia on chest or shoulder = faction read without uniforms |
| **Character arc** | Jin's T8 jacket blends Jun's black/white with his red — "heroic roots" arc rendered as clothing; Heihachi's monk attire = amnesia arc | Costume changes mark story chapters — AshLane attires should evolve with the turf-war narrative |
| **Rank/threat** | Final-boss escalation: devil forms, battle-damaged "Awakened" variants, Jinpachi's corruption stages | Corrupted/second-phase forms = Malakor grammar |

### Evolution across games — why redesigns work or fail

- **Kazuya (T8):** best-received redesign in the roster — fused his T2 suit,
  T6/T7 looks, and snakeskin texture into one "final boss" silhouette. Worked
  because it *accumulated* history instead of discarding it.
- **Jin (T8):** Tekken 7's design was fine, but T8's is "the logical next
  step" — mother's color scheme + his red. Worked because the arc is legible.
- **Hwoarang (T8):** returned to Tekken 3 roots (tied-back hair, orange
  gloves, black/white) after the grungy eyepatch era. Worked — "sometimes,
  simple changes are the most effective."
- **Nina (T8):** T7's wedding-dress default was widely seen as a misstep;
  T8's dark tactical dress + leather jacket + thigh knife restored "killer
  assassin" quality. A failed experiment corrected by returning to the
  archetype's visual grammar.
- **Asuka / Paul (T8):** the cautionary tale. Asuka's redesign was hated;
  Paul's new default looked like a "midlife crisis." Harada promised classic
  costumes would be available — but they landed in the paid Tekken Shop,
  sparking a monetization backlash. **Lesson: never gate a character's
  canonical look behind paywall outrage; redesigns must respect the
  archetype's silhouette.**
- **Yoshimitsu:** reinvented every single game (T8 = cosmic blue/red armored
  samurai). The exception that proves the rule — his archetype *is*
  reinvention, and players expect it.

### Customization system (what Tekken lets players do)

- **Tekken 7:** could customize *within* the base outfit (change King's
  tights, add upper-body clothes, keep the rest).
- **Tekken 8:** full-body outfits OR full custom-clothing sets — **no mixing
  with the base outfit** (technical limitation of UE5 models). Dozens of
  upper/lower body items, hair, hats, glasses, accessories; two accessory
  slots (face, head, shoulders, arms, legs, back, hovering); position/size/
  angle adjustable; separate footwear slot; full color control.
- **Unlocks:** Fight Money (earned in-game) buys most items *per character*;
  Super Ghost Battle victories unlock alt outfits; story completion unlocks
  some; the **Tekken Shop** sells legacy costumes and avatar skins for
  **Tekken Coins (real money)** — the monetization layer that caused the
  backlash above.
- **Item moves:** back-slot accessories can have hit effects (a Tekken
  tradition since T6).
- **AshLane takeaway:** AshLane should keep Tekken 7's approach, not T8's —
  let players customize *within* the default outfit (patch swaps, color
  accents, accessories) so the archetype silhouette survives customization.
  And: canonical outfits must never be monetized in a way that angers the
  base; customization is the revenue layer, identity is sacred.

### Outfit rules to port to AshLane

1. **Design the visual hook and mechanical hook together** (Ikeda's rule).
   No character gets a look without a unique move-logic, and vice versa.
2. **Defaults must read nationality + style + personality + allegiance at a
   glance.** If a player can't tell the boxer from the grappler from the
   PMC operative in a lineup screenshot, the outfit failed.
3. **Faction allegiance = emblem/insignia, never uniforms.** Tekken's own
   rule matches the owner's binding rule: chest emblem (Heihachi), Tekken
   Force patch-equivalents, Reina's hidden twist. AshLane: patches,
   armbands, small accents, symbols — per district palette, not
   single-color matching.
4. **Redesigns accumulate, never erase.** Kazuya's T8 look works because it
   layers 30 years of history. When AshLane attires evolve, keep the
   silhouette and add, don't replace.
5. **Corruption/milestone forms are a visual grammar.** Battle damage,
   tattered clothes, supernatural aura — Jinpachi → Devil Kazuya → Malakor
   corruption. Boss fights get second-phase outfits.
6. **Customization must preserve the archetype.** Let players restyle within
   the default (T7 model); keep the canonical look free.

---

## 5. AshLane mapping: corporate-faction design + outfit direction

Concrete, actionable recommendations. Steal the structure, not the IP —
rename everything, reskin everything, keep the mechanics of *how Tekken
makes corporations feel powerful*.

### 5a. The three-corporation cold war (faction structure)

Mirror Tekken's triangle, recast for a street game:

| Tekken role | AshLane analog | Identity | How players meet them |
|---|---|---|---|
| **Mishima Zaibatsu** (incumbent megacorp + private army) | **The incumbent** — a legacy private-military/security conglomerate that "protects" the city. Owns the arena circuit the way the Zaibatsu sponsors the tournament | Old money, heraldic branding, dojo/martial tradition as corporate culture | Their PMC patrols the streets (Tekken Force analog); their sponsored fight circuit is the game's tournament structure — winning blocks shifts *their* territory map |
| **G Corporation** (rising biotech rival, militarized) | **The disruptor** — a biotech/pharma corp running clinics and "enhancement" programs in the districts. Underneath: super-soldier R&D, private army | Sleek, clinical, purple/black palette; hires street fighters as "security consultants" (T8's parole-hire model) | Players get *hired* by them before realizing what they are — the G Corp trick of looking like the good guys |
| **Violet Systems** (boutique tech, funds the resistance) | **The string-puller** — a robotics/tech firm with a charismatic exiled-founder CEO. Never fields an army; buys shares, plants people, funds gangs | High-fashion techwear, showman CEO, purple accent | Their money is behind the player's crew and rival gangs alike — reveal late that both sides were bankrolled |

Plus the street-level layers Tekken implies but never centers (AshLane's
actual playground):

- **The rebel army (Yggdrasil analog):** a deserter faction from the
  incumbent's PMC, ~half the force, fighting both corps. Gives the player a
  military-grade ally faction with a motto, insignia, and a defection story.
- **The exorcists (Archers of Sirius analog):** an old order that treats
  Malakor corruption the way Sirius treats the Devil Gene — they hunt the
  corrupted, including corrupted executives. Natural ally/antagonist pivot.
- **The cops (Interpol analog):** one detective archetype (Lei Wulong
  model) investigating the corps; the corps bury investigations by force.
  Grounds the corporate war in street-level consequences.

### 5b. "Executive threat" outfit direction (the portable formula)

For every corpo boss in AshLane, apply Tekken's five rules from §3:

1. **Status garment + combat accessory.** Tailored suit/long coat +
   fighting gloves, brass knuckles, or reinforced boots. The accessory says
   *I don't need bodyguards*.
2. **Chest/shoulder emblem.** Faction insignia embroidered or engraved —
   the allegiance read. Never a full uniform; the suit stays personal, the
   emblem says corporate (binding faction rule: patches, armbands, small
   accents, symbols).
3. **Silhouette dominance.** Long coats, wide shoulders, capes. Bosses are
   visibly larger on screen than their security detail.
4. **Corrupted second phase.** Malakor corruption IS the Devil Gene: when a
   corpo boss's health breaks, the outfit degrades (Jinpachi grammar —
   jewelry falls off, clothes tatter) and the supernatural shows (aura,
   altered skin, inhuman features). Design both phases up front.
5. **Ceremonial staging.** Corpo bosses are fought in *their* venues —
   boardrooms, penthouses, private arenas, sponsored tournament finals —
   never ambushed in alleys. The venue is part of the outfit.

**Palette discipline (owner's district rule):** each corp gets a base color
identity *filtered through the district palette* where they appear — the
incumbent reads "old gold + black" downtown and "dust gold + brown" in the
industrial district. Same emblem, different cloth. Never faction-wide
single-color uniforms.

### 5c. Archetype slots to fill (from §1, adapted)

- **House-style dojo faction:** a Mishima-karate analog — one martial
  tradition, one family/company teaching it, multiple practitioners with
  shared fundamentals but unique hooks. (Respects the "no clones" rule.)
- **The masked grappler:** one King-analog slot for the 15% wrestling
  flavor — mask, chain-throws, spectacle. Keep it to one or two slots max.
- **The street master:** a Leroy-analog — older, stylish, parry-based,
  weapon-adjacent (cane → chain, bat, umbrella). The mentor archetype every
  district needs.
- **The silent operative:** a Dragunov-analog — PMC commando, Sambo/grapple
  hybrid, no wasted motion. The incumbent corp's signature fighter.
- **The enhanced heavy:** a Jack-analog — corp security juggernaut,
  cybernetics or just armor + size. Readable from 50 feet.
- **The hired gun with a twist:** a Victor-analog — weapon-integrated
  fighter (baton, blade, sidearm as *melee* tools) for the disruptor corp.
- **The exorcist:** a Claudio-analog — Malakor-hunter with anti-corruption
  techniques; gives the mystic/stance-technician slot a story reason to
  exist.

### 5d. Structural steals (systems, not costumes)

1. **The fight circuit is the corporation's weapon.** The Zaibatsu doesn't
   just sponsor the tournament — ownership of the company is the prize, and
   in T8 losers' countries are erased. AshLane: the block/turf circuit must
   be *run* by the corps — winning a block shifts corporate territory on a
   visible map. The street fight and the corporate war are the same war.
2. **Hire the player before revealing the villain.** G Corp hires beaten
   fighters on parole; Violet Systems funds the rebellion. Let AshLane corps
   employ, sponsor, and fund the player early — the betrayal/reveal lands
   harder than a boss who was evil from minute one.
3. **Morality is positional.** G Corp are heroes when they oppose Jin's
   war, conquerors when they win it. Let districts disagree about the corps:
   the clinic corp is beloved where it heals, feared where it experiments.
4. **Private armies need doctrine.** Name, motto, insignia, public cover
   story ("community security"), and a defection arc. A PMC with no
   doctrine is just enemies with guns.
5. **Ikeda's roster rule is law:** every character = unique visual hook +
   unique mechanical hook, designed together. No "compatible characters."
   Audit the AshLane roster against this before any model work starts.

---

## Sources

- Faction relations / corporate war: https://tekken.fandom.com/wiki/G_Corporation
- Archers of Sirius / Lee / Violet Systems: https://www.vg247.com/tekken-7-story-mode-involves-a-group-of-exorcists-plus-lee-and-violet-return-in-new-trailer
- G Corp story through T8: https://villains.fandom.com/wiki/G_Corporation
- Mishima family / Zaibatsu history: https://www.denofgeek.com/games/tekken-the-strange-history-of-the-mishima-family/
- Tekken Force (soldiers, motto, ~60,000 strength): https://tekken.fandom.com/wiki/Tekken_Force_(soldiers)
- Mishima Zaibatsu corporate history: https://tekken.fandom.com/wiki/Mishima_Zaibatsu
- Character roster / styles (T8): https://dotesports.com/fgc/news/all-confirmed-characters-for-tekken-8 · https://www.radiotimes.com/technology/gaming/tekken-8-roster/ · https://dtgre.com/2024/01/tekken-8-all-characters-and-their.html · http://gamerant.com/tekken-8-roster-breakdown/
- T8 redesigns / Kazuya's suit: https://www.thegamer.com/tekken-8-the-best-new-designs/
- Heihachi T8 outfit + monk arc (Ikeda interview): http://gamespot.com/articles/heihachis-surprising-return-in-tekken-8-rights-the-fighting-game-rosters-greatest-wrong/1100-6526645/
- Ikeda on unique archetypes / cutting clones; Harada on guest characters: https://esports.gg/news/tekken-8/harada-about-heihachi-tekken8/ · https://www.techradar.com/gaming/tekken-8s-kouhei-ikeda-talks-about-cutting-classic-characters-and-bringing-together-players-both-old-and-new
- Anna Williams S2 return/redesign: https://arcader.org/news/one-of-the-most-highly-requested-legacy-characters-has-finally-been-revealed-for-tekken-8-season-2-but-at-what-cost/
- Customization system: https://www.ggrecon.com/guides/tekken-8-customisation-character-player-avatar/ · https://tekken.fandom.com/wiki/Customize · https://www.pcgamer.com/tekken-8-character-customization/ · https://tekken.fandom.com/wiki/Tekken_Shop
- Heihachi outfits detail: https://tekken.fandom.com/wiki/Heihachi_Mishima/Outfits
- Jinpachi design / outfits: https://tekken.fandom.com/wiki/Jinpachi_Mishima/Outfits · https://villains.fandom.com/wiki/Jinpachi_Mishima
- Kazuya outfits / flame-motif gi: https://tekken.fandom.com/wiki/Kazuya_Mishima/Outfits
- T8 costume critique (redesign backlash, shop controversy): https://www.dcgameblog.com/2023/10/fighting-games-friday-the-specific-threads-of-tekken-8/
