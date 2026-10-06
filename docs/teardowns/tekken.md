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
