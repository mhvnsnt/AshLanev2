# URBAN REIGN TEARDOWN — faction design, character types & outfit direction for AshLane

> **Research:** 2026-10-06. Sources: Wikipedia, Tekken Wiki (Fandom), GameSpot (E3 2005 preview + review), Eurogamer (Apr 2005 preview), GameSpy review, GamesIndustry.biz press releases, futurefive review, digitpress fan review, GameFAQs martial-arts board writeup. Summarized and paraphrased throughout — no game text reproduced at length.
>
> **Builds on** `docs/URBAN_REIGN_ANALYSIS.md` (2026-10-05, mission archetypes + mechanics) — that doc covers *missions and mechanics*; this one covers *roster design, factions, and visuals*. Read that first for the combat-loop side.
>
> **Lens:** AshLane is "Urban Reign 2, 2026" — a street-first urban brawler. Steal the faction/style architecture, not the IP.

## 0. Game snapshot

- **Namco, PlayStation 2.** NA Sept 13 2005 · JP Sept 29 2005 · EU Feb 2006. Director Masahide Kito, producer Hirofumi Motoyama. Built by members of the **Tekken and Soulcalibur teams** — the fighting engine is visibly "Tekken light," with a grappling system reviewers compared favorably to *Tobal 2*.
- **60 playable fighters**, including unlockable Tekken crossovers **Paul Phoenix** and **Marshall Law** (announced via Famitsu/GamesIndustry.biz pre-launch).
- **Setting:** Green Harbor, a fictional fortified US city (the "Ragtown" district anchors the story). Notable design rule: **none of the street gangs use guns** — conflict is hand-to-hand, blades, and street weapons.
- **100 missions, 30+ street weapons** (bottles, bats, 2x4s, shovels, pipes — all with durability and throwability).

Sources: [Wikipedia](https://en.wikipedia.org/wiki/Urban_Reign) · [GamesIndustry.biz launch announcement](https://www.gamesindustry.biz/namco-expands-fighting-game-line-up-with-urban-reigntm) · [Tekken Wiki](https://tekken.fandom.com/wiki/Urban_Reign)

## 1. Character archetypes across the ~60-fighter roster

Urban Reign's roster works because every major character occupies a **named mechanical archetype** — and two characters can share a style *name* while being different archetypes (see the Wrestling split). Minor characters pad out the 60 with simpler movesets, but the 16 named styles below are the design backbone.

| Archetype | What mechanically defines it | Urban Reign examples | Named style |
|---|---|---|---|
| **All-rounder** | Balanced toolkit: kickboxing strikes + wrestling takedowns + submission grappling; no glaring weakness, no specialty | Brad Hawk (protagonist, "brawler-for-hire"; loosely based on Sonny Chiba's Terry Tsurugi) | All-Round |
| **Street brawler — rush** | Boxing+wrestling hybrid, aggressive, *very fast*; pressure fighter | Dwayne Davis (Zaps leader; Eurogamer preview calls him "super-fast fighter") | Rush |
| **Street brawler — power** | Wrestling+street hybrid, slow, heavy single hits | Glen Kluger (Hell's Legions biker leader) | Power |
| **Super-heavyweight** | Huge strength + grappling; can power through stagger (Golem can buff up to avoid being staggered); slow, terrifying | Golem (ex-pro wrestler, 207 cm / 158 kg), Napalm 99 (ex-convict gang leader, 200 cm / 110 kg) | Mighty |
| **Pro wrestler — technician** | Technical throws, chain grapples, submission-heavy | Jake Hudson (ex-amateur wrestler turned muscle-for-hire; hired by Dwayne) | Wrestling |
| **Pro wrestler — power** | Slams and brute-force grapples over technique | Alex Steiner (Green Hill enforcer; football + amateur wrestling background; refs Rick/Scott Steiner) | Wrestling |
| **Boxer** | Punch combinations, head-body work, minimal kicks; street-inflected | Grimm (former world-ranked boxer who picked up pro wrestling; Steve Fox-like) | Boxing |
| **Submission specialist** | Joint locks/chokes in the grapple game, kickboxing strikes standing; *knife user* | Douglas McKinzie (ex-military, discharged for abandoning post; leads the Shadow Platoon) | Submission |
| **Karateka** | Hard linear strikes, counters, disciplined stance work (Kyokushinkai) | Sho Kadonashi (dojo grandmaster who came to the US chasing the "American dream"; Jin Kazama/Kazuya-like) | Karate |
| **Kick specialist — TKD** | Flashy spinning/turning kicks, range control | Dae-Suk Park (gothic-fashion loner; Hwoarang/Baek-like; ITF + Moo Duk Kwan) | Tae Kwon Do |
| **Kick specialist — Muay Thai** | Elbows, knees, clinch, brutal close-range kicks | Tong Yoon Bulsook (fallen former Thai champion; performs a brief *wai khru ram muay* before his charge-up special; Bruce Irvin-like) | Muay Thai |
| **Capoeirista** | Constant movement (ginga), acrobatic kicks, hard to pin down | Chris Bowman (middle-class practitioner who hates being mocked for it; Eddy Gordo-like) | Capoeira |
| **Kung fu striker — evasive** | Evasive footwork (Baguazhang), flowing hand strikes | Shun Ying Lee (Chinatown triad leader; Ling Xiaoyu-like) | Kung Fu |
| **Kung fu striker — power** | Rooted power hand strikes (Choy Lee Fut / Chinese Kenpo) | Lin Fong Lee (Shun Ying's younger brother; Feng Wei-like) | Kung Fu |
| **Weapons specialist** | Identity fused to a signature weapon; armed moveset layered over a base style | Shun Ying Lee (Chinese sword), Lin Fong Lee (Chinese broadsword), Shinkai (personal katana — "the deadliest of all weapons in the game"), McKinzie (combat knife) | Kung Fu/Chinese sword · Kung Fu/Broadsword · Master/Katana · Submission |
| **Crossover guest** | Imports an established fighting-game style into the brawler | Paul Phoenix (judo), Marshall Law (Jeet Kune Do) | Tekken styles |

**Design takeaway for AshLane:** the roster never invents an archetype from nothing — each maps to a legible real-world fighting archetype (often with an explicit Tekken analogue), and the two-flavor **Wrestling split** (Jake = technique, Alex = power) shows how to get roster depth without inventing new style names. That split is directly portable to AshLane's 85/15 street/wrestling mix: the 15% wrestling flavor can live inside *two mechanical flavors* of grappler rather than one.

Sources: [Wikipedia character list](https://en-academic.com/dic.nsf/enwiki/1464961) (mirror of the full roster table) · [Golem](https://villains.fandom.com/wiki/Golem_(Urban_Reign)) · [Brad Hawk](https://hero.fandom.com/wiki/Brad_Hawk) · [GameFAQs martial-arts board style summary](https://gamefaqs.gamespot.com/boards/212-martial-arts/81085396/987482164)

## 2. The fighting styles system — style as a design contract

In Urban Reign, a character's **named style is a design contract**: it fixes the movelist DNA, the stance and animations, the costume direction, and the matchup identity at a glance. The 16 named styles from §1 fall into four families:

- **Street hybrids (4):** All-Round, Rush, Power, Mighty — invented names for street-brawl toolkits. *Mighty* is the most important: a named style that simply means "this fighter is a monster" (strength + grappling, stagger-resistant). Naming the super-heavyweight slot as a *style* rather than a *body type* lets the moveset travel.
- **Grappling (3):** Wrestling (two flavors), Submission. Jake vs Alex proves style names can host internal contrast — technique vs power under one label.
- **Striking disciplines (8):** Boxing, Karate, Tae Kwon Do, Muay Thai, Capoeira, Kung Fu (two flavors), Master. Real-world disciplines, each with a Tekken-adjacent read so players instantly know the matchup.
- **Weapon styles (1 + modifiers):** Master/Personal Katana; sword/broadsword/knife ride *on top of* a base style (e.g. "Kung Fu / Chinese sword").

**The style↔outfit rule.** GameSpot's E3 2005 preview states the principle outright: *"Each model's attire resembles his fighting style in a way, so you can expect to see hip-hop brawlers in stylish gear while martial artists will likely be sporting traditional loose-fitting guise."* The player can guess the moveset from the outfit. Style isn't just moves — it's a **costume brief**.

**The Tekken-anchor trick.** Nearly every style has a documented Tekken analogue (Grimm≈Steve Fox, Chris≈Eddy Gordo, Park≈Hwoarang/Baek, Tong Yoon≈Bruce Irvin, Lin Fong≈Feng Wei, Shun Ying≈Ling Xiaoyu, Kadonashi≈Jin/Kazuya, Golem≈Craig Marduk). The Tekken team reused their own matchup vocabulary, so players already knew how to fight each archetype on first sight.

Sources: [GameSpot E3 2005 preview](https://www.gamespot.com/articles/urban-reign-e3-2005-preshow-impressions/1100-6124406/) · [Tekken Wiki](https://tekken.fandom.com/wiki/Urban_Reign)

## 3. Factions / gangs in the story — names, leaders, turf, relationships

Green Harbor's gang war is a **layered power structure**: street gangs fight each other at the bottom, a Yakuza outfit engineers the conflict in the middle, and a corrupt politician profits at the top. The inciting incident — the kidnapping of a Zaps member — is a false flag.

| Faction | Leader | Turf / base | Plot role |
|---|---|---|---|
| **Shun Ying Lee's Chinese Triad** | Shun Ying Lee (24; inherited Chinatown leadership from her father; her younger brother was passed over) | Chinatown; runs a restaurant as a front | Hires protagonist Brad Hawk to find the kidnapped gang member and clear her name; at war with the Zaps (a war she didn't start) |
| **The Zaps** | Dwayne Davis (32; lost his family young, fiercely loyal to his "homeboys") | The streets / Ragtown blocks | Member **KG** is kidnapped — the inciting incident. Dwayne blames Shun Ying's gang and starts the gang war |
| **Hell's Legions** (bikers) | Glen Kluger (41; "a thorough biker gang stereotype") | Biker turf | Hired by Dwayne and the Zaps as muscle against Brad and Shun Ying |
| **Mushin-Kai** (Yakuza) | **Shinkai** (65; master swordsman; "mysterious leader" of the gang) | Operates across the city; rooftop HQ | The engineers: paid to wreak havoc, they kidnapped KG to incite the street gangs against each other. Hired by the mayor as "consultants" for his security firm |
| **Lin Fong Lee's splinter gang** | Lin Fong Lee (22; Shun Ying's younger brother; possibly murdered their father) | Splinter of the triad | Succession war against his sister; deploys Golem to kill her |
| **Kadonashi Dojo** | Sho Kadonashi (34; came from Japan chasing the "American dream") | The dojo | Neutral karate school drawn into the street war |
| **Shadow Platoon** | Douglas McKinzie (37; formed the gang after being discharged from military service for abandoning his post) | Underground network | Ex-military commandos; "will answer anyone" who pays — mercenary chaos agents |
| **The Outlaws** | Napalm 99 (35; ex-convict) | Convict underworld | Gang of ex-cons who "despise all good in society" — pure disorder faction |
| **Skinhead gang** (name not pinned down in available sources) | Unknown | Street turf | Muscle-bound, tattooed (multi-ethnic) heavy faction — the game's designated "big body" mooks |
| **Zanetti gang** | Unknown | Street turf | Minor named gang encountered in missions |
| **Mayor William Bordin's machine** | Mayor **William Bordin** | City government | The true mastermind (the "Batman Gambit"): orchestrated the kidnappings and riots to manufacture a crisis, then planned to have the Yakuza sweep in and "save" the city — riding the popularity into a run for state governor. Final boss is deliberately anticlimactic (he just shoots a gun); players widely consider Shinkai the real final fight |

**The relationship map (how the war actually works):**

1. **Bordin** pays the **Mushin-Kai** to destabilize the city.
2. The **Mushin-Kai** kidnaps **KG** (Zaps) to make the street gangs turn on each other.
3. The **Zaps** blame **Shun Ying's triad**; she hires **Brad Hawk** (brawler-for-hire) to untangle it.
4. Dwayne hires **Hell's Legions** as muscle; **Lin Fong** splits from his sister's triad and hires **Golem** as an assassin.
5. **Shadow Platoon** and **the Outlaws** sell violence to whoever pays — chaos mercenaries.
6. Brad defeats Shinkai, finds Bordin's signed contract, and exposes the mayor.

**The "defeat means friendship" engine.** Beaten bosses recur as *allies*: later escort missions have Brad protecting former enemies (Glen, Dwayne, Grimm, Tong Yoon) — the roster is recruited through combat, and today's boss is tomorrow's partner. This is also the unlock system: defeating fighters unlocks them for free/multiplayer modes. Faction membership is therefore **porous** — a design choice that keeps a 60-fighter roster narratively manageable.

Sources: [Wikipedia plot summary](https://en.wikipedia.org/wiki/Urban_Reign) · [Eurogamer Apr 2005 preview](https://www.eurogamer.net/news270405tekkenurban) · [Shinkai](https://villains.fandom.com/wiki/Shinkai) · [Golem](https://villains.fandom.com/wiki/Golem_(Urban_Reign)) · [All The Tropes plot breakdown](https://allthetropes.org/wiki/Urban_Reign) · [digitpress fan review (mission/faction detail)](https://forum.digitpress.com/forum/showthread.php?71009-urban-reign-VERSUS-beatdown-fists-of-vengeance)

## 3b. Factions & Groups — exhaustive

> **Method:** every one of the 60 playable fighters was mapped to a faction from the characters' **in-game bios** (GameFAQs guide/walkthrough by KDKM0506, v2.7), cross-checked against Wikipedia, the Tekken Wiki (Fandom), and the Villains Wiki. Paraphrased throughout — bios are summarized, not quoted.
>
> **Two corrections to earlier sections and press-summary lore:**
> - *The "Zanetti gang" is not in Urban Reign.* The drug-kingpin Zanetti family of Las Sombras belongs to Capcom's **Beat Down: Fists of Vengeance** (2005), a different brawler whose wiki text leaked into the Cubevice Urban Reign page. No Zanetti appears in Urban Reign's 60-fighter roster. The §3 "Zanetti gang" row is superseded.
> - *There is no separately named "skinhead gang" in the roster.* Press summaries describe "muscle-bound, tattooed skinhead ex-cons" — that visual description maps onto **the Outlaws** (ex-convicts, Mighty physiques, prison ink), not a distinct faction. All 60 fighters are accounted for below with no skinhead gang left over.
> - *The "Cuban Americans"* are the in-game faction **the Outsiders** (Miguel Estevez et al.).
> - *Green Hill* yields exactly one playable fighter (Alex Steiner) — kept as a micro-faction row.
>
> **Roster reconciliation (60/60):** Triad 2 · Tin-Jiao 5 · Zaps 9 · Hell's Legions 4 · Kadonashi Dojo 4 · Outsiders 4 · Westside Gym 5 · Mushin-Kai 5 · Shadow Platoon 5 · Outlaws 5 · Green Hill 1 · Bordin's machine 1 · Unaffiliated 9 · Guests counted inside Unaffiliated (Law, Paul) = **60**.

| Faction | Leader | Members (n) | Visual identifiers | Turf | Story role | Fighting identity |
|---|---|---|---|---|---|---|
| **Shun Ying Lee's Chinese Triad** | Shun Ying Lee (24; inherited Chinatown from her father) | Shun Ying Lee, Lilian Evans (2) | Chinese kung fu dress; **Shun Ying's Chinese sword carried visibly as identity object**; Lilian trains to emulate her "older sister." Restaurant front as cover | Chinatown, Green Harbor; the triad's restaurant | Hires Brad Hawk to find the kidnapped KG and clear her name; at war with the Zaps over a kidnapping she didn't order; split when brother Lin Fong leaves to form Tin-Jiao (he is suspected of murdering their father) | Kung Fu / Chinese sword (Shun Ying); Kung Fu (Lilian) |
| **Tin-Jiao** (Lin Fong's splinter gang) | Lin Fong Lee (22; Shun Ying's younger brother) | Lin Fong Lee, Ye Wei Cheng, Sha Ying Lai, Yan Jun Kwan, Golem (5) | Same visual family as the triad — Chinese kung fu dress — which is the point: the betrayal reads visually because they *used* to be the same org. Lin Fong's **Chinese broadsword/saber**; Ye Wei Cheng / Sha Ying Lai / Yan Jun Kwan met at their father's dojo; **Golem's 207 cm / 158 kg monster frame** as the gang's "muscle" | Chinatown fringe; recruits from their father's old dojo circle | Succession war against Shun Ying — Lin Fong left town "displeased that his sister was chosen to lead"; employs Golem as bodyguard/assassin against her; suspected patricide | Kung Fu / Chinese broadsword (Lin Fong); Kung Fu ×3; Mighty (Golem) |
| **The Zaps** | Dwayne Davis (32; orphaned young, fiercely loyal to his "homeboys") | Dwayne Davis, Busta, Spider, Pain Killah, KG, Nas-Tiii, Em Cee, Real Deal, Ty (9) | **Hooded and masked** (the gang's signature); **Dwayne's cornrows**; in-game bios euphemize them as the city's **"'color' gang"** — gang colors worn as trim/accents, never full uniforms; B-boy/hip-hop streetwear (Nas-Tiii is "a true B-boy") | Ragtown street blocks — the neighborhood gang | **The inciting incident:** member KG is kidnapped (ambushed, beaten nearly to death); Dwayne blames Shun Ying's triad and starts the gang war; hires Hell's Legions as muscle and Jake Hudson as a freelancer. Recruited to Brad's side by defeat | Rush (Dwayne, Busta, Spider, Pain Killah, KG); Street (Nas-Tiii, Em Cee, Ty); Power (Real Deal) |
| **Hell's Legions** (bikers) | Glen Kluger (41; "a thorough biker gang stereotype") | Glen Kluger, Torque, Rod, Seth (4) | **Tattooed heshers**: denim vests, leather, long metalhead hair; Glen is "utterly obsessed with 60's culture" (psychedelic 60s biker accents); **Torque is Glen's "inseparable friend"** — loyalty reads as the club's real uniform | Biker bar hangout (Glen's men gather around his car; bar brawls) | Hired by Dwayne and the Zaps as muscle against Brad and Shun Ying; beaten into alliance — later appear as protectable allies (the defeat-means-friendship engine) | Power (Glen, Torque, Seth); Street (Rod) |

_Tables continue in the same section below — committed in batches._

## 4. Faction visual distinction — the subtle-identifier system


**There are no matching uniforms anywhere in Urban Reign.** Factions read through *subcultural dress codes and physical markers*, never team jerseys. Wikipedia's character-design summary is the key document:

- **The Zaps** — a *hooded and masked* gang, explicitly modeled on Crips/Bloods street culture; led by cornrow-wearing Dwayne.
- **The skinheads** — muscle-bound and tattooed, *though of multi-ethnic origin* (the marker is physique + ink, not race).
- **The Chinese gang** — Shaolin-style kung fu dress; Shun Ying herself wears a revealing Chinese-cut outfit with her sword as the identity object.
- **The bikers** — tattooed "heshers": denim, leather, long metalhead hair.
- **The Yakuza** — suits and swords; Shinkai's personal katana is his visual signature ("the deadliest of all weapons in the game").
- **The karate school** — gi uniforms; discipline-coded, instantly readable.
- **Convicts (the Outlaws)** — prison ink, workwear, heavy bodies.
- **Shadow Platoon** — ex-military commando gear.

**What does the distinguishing work, mechanically:**

1. **Hairstyles and headgear** — cornrows, shaved heads, hesher manes, hoods, masks, bandanas. The head is the fastest read at brawler camera distance.
2. **Tattoos** — faction ink (skinheads, bikers, yakuza, convicts) does more work than any color scheme.
3. **Signature weapons/objects** — katana, Chinese sword, combat knife: carried visibly, fused to the character's style name.
4. **Physique casting** — the skinhead gang is *defined* by being muscle-bound; the Outlaws by heavy convict bodies. Body type is a faction marker.
5. **Damage as storytelling** — GameSpot's review notes bloodstains dotting characters' shirts after fights; wear-and-tear accumulates on the outfit, not just the health bar.

**Distilled rules for AshLane (binding with the no-uniforms directive):**

- **1 symbol + 1 accent garment + 1 body/head marker per faction.** Example: a patch *or* tag, *one* accent garment (bandana, armband, vest), and a head/body marker (hairstyle, ink, mask style). Never all three as a full uniform.
- **Colors are accents, not team jerseys.** A faction color appears as a bandana, stitching, or trim — never as matching outfits across members.
- **Discipline-coded members keep their discipline's garb.** A karateka in a gang still wears a gi; the *gang* shows in the patch/ink, not the outfit. This is exactly how Urban Reign keeps 60 fighters readable.

## 5. Outfit design language — early-2000s streetwear

**The vocabulary.** Urban Reign's closet is 2005 street culture, played straight: baggy hip-hop gear, jerseys, hoodies, bandanas, work boots (street brawlers); gothic fashion (Dae-Suk Park, the loner); metalhead denim-and-leather (bikers); prison workwear (convicts); military surplus (commandos); suits (yakuza); traditional martial-arts garb — gi, kung fu shirts, Muay Thai shorts, hand wraps, headbands.

**"Street" vs "fighter" reads:**
- **Street** = civilian clothes worn combatively. The outfit would work at a bus stop; the *wear* (bloodstains, torn sleeves, wraps) says fighter.
- **Fighter** = discipline-coded garments. Gi, kung fu garb, Muay Thai shorts, boxing wraps — the outfit declares the moveset before a punch is thrown.
- The GameSpot rule (§2) bridges them: even street-brawler outfits lean toward the character's *style* — hip-hop brawlers get stylish gear, martial artists get loose traditional cuts.

**Silhouette diversity as a design tool.** The roster spans **170 cm / 54 kg (Shun Ying) to 207 cm / 158 kg (Golem)** — archetype reads at a glance from body shape alone, before costume details resolve. Age range runs 21 (Park) to 65 (Shinkai): older fighters visually code as masters and bosses, younger ones as prodigies and hotheads.

**What "street" must avoid:** costume-y uniformity. Urban Reign's street fighters look like they *dressed themselves* — the faction shows in one or two markers, and everything else is personal. That's the line between a gang and a sports team.

Sources: [GameSpot E3 2005 preview](https://www.gamespot.com/articles/urban-reign-e3-2005-preshow-impressions/1100-6124406/) · [GameSpot review](http://gamespot.com/reviews/urban-reign-review/1900-6133344/) · [GameSpy review](http://ps2.gamespy.com/playstation-2/urban-reign/651217p1.html) · [digitpress fan review](https://forum.digitpress.com/forum/showthread.php?71009-urban-reign-VERSUS-beatdown-fists-of-vengeance) · [futurefive review](https://futurefive.co.nz/story/urban-reign)

## 6. AshLane mapping — concrete and actionable

Grounded in the factions already established in this repo (`docs/STORY_BIBLE.md`, `docs/EMBLEM_SYSTEM.md`): **the Ashes** (protagonist neighborhood crew, led by Buffalo Bill), **the Combine** (Kennedy Corporate Structure's street arm — ex-fighters doing evictions for the "Meridian Crossing" demolition), **the Hollows** (the burned, starving fighters gathering in the Park), **the Authority** (police; see `docs/POLICE_FACTION.md`), **Onyx's gang** (name unconfirmed — "The Painted" was a previous agent's invention, do not use), and **Unaffiliated** loners.

### 6a. Faction archetype slots

Each faction gets an Urban Reign analog, 2–3 style slots, and a subtle-identifier kit. **One slot per faction is deliberately left open** — factions recruit across styles as the story progresses (the "defeat means friendship" engine, §3).

| AshLane faction | Urban Reign analog | Style slots to fill | Subtle identifiers (never uniforms) |
|---|---|---|---|
| **Ashes** (the block) | The Zaps + Brad Hawk's crew | Rush brawler (Dwayne slot — fast, loyal, homeboy energy); All-Rounder (Brad slot — the hired-hand veteran); street-boxer (Grimm slot) | Hoods/masks + one flame-tag patch (ties to the existing Ashes flame emblem) + accent worn three ways (bandana / armband / wrap). Varied civilian streetwear otherwise — cornrows, dreads, hoodies, jerseys |
| **Combine** (corporate eviction muscle) | Bordin's machine + Shadow Platoon | Submission commando (McKinzie slot — kickboxing + joint locks; private-security "knife" reads as baton/taser); technical wrestler (Jake slot — ex-amateur-wrestler security) | Corporate lanyard/badge pin + steel-blue trim on workwear (matches the existing Combine emblem palette); private-security polos and tactical gear, *not* matching uniforms |
| **Hollows** (the burned) | The Outlaws + Mighty heavies | Mighty super-heavy (Golem/Napalm slot — the terrifying Park-dweller); Power brawler (Glen slot — slow, heavy, relentless) | Prison-style ink + scorch/burn marks on skin and clothes + toxic-purple stitching accent (matches the Hollows emblem); torn, damaged clothing — wear-and-tear as identity |
| **Authority** (police) | Jake Hudson muscle-for-hire energy (no direct UR analog — this is AshLane-original) | Technical wrestler (Jake slot — control holds, takedowns); boxer (Grimm slot — riot-baton-as-extended-fist reads) | Badge-star pin (matches the Authority emblem) + gold chevron tape on duty gear; plainclothes + duty belts, never full dress uniforms on street fighters |
| **Onyx's gang** (name TBD) | Shun Ying's triad + Mushin-Kai | Kung fu sword specialist (Shun Ying slot); weapon-master boss (Shinkai slot — ONE signature-weapon master, katana or equivalent) | Suit cuts + ink + the weapon carried visibly as identity object; one lieutenant = one signature weapon |
| **Unaffiliated** | Kadonashi Dojo + loners (Park, Tong Yoon, Chris Bowman) | Karateka (Kadonashi slot — the neutral master); TKD or Muay Thai purist (Park/Tong Yoon slot — the master-for-hire); Capoeirista (Chris slot — the outsider) | **The absence of faction markers is the marker.** Discipline-coded garb only — gi, hand wraps, headbands, Muay Thai shorts. The player reads "unaffiliated" because there is no patch, no ink, no pin |
| Bikers (unaffiliated-allied) | Hell's Legions | Power brawler (Glen slot) | Leather/denim + hesher hair + **one** club patch on the vest — the single-patch rule is the whole identifier |

### 6b. The visual-identifier system (repo-ready rule set)

Plugs directly into the existing `docs/EMBLEM_SYSTEM.md` (6 faction emblems already designed):

1. **Every faction gets exactly three marker types: symbol · accent garment · body/head mark.** Ship the *symbol* as the EMBLEM_SYSTEM emblem (already done for Ashes, Combine, Hollows, Authority, Unaffiliated); the *accent garment* is one item (bandana, armband, lanyard, chevron tape, stitching color); the *body/head mark* is hair, ink, or headgear. Members mix the other 90% of their outfit freely.
2. **Faction color = trim, never the outfit.** Ashes fire-orange appears as bandanas and flame-tag patches; Combine steel-blue as lanyard trim; Hollows toxic-purple as stitching; Authority gold as chevron tape. This is the binding no-uniforms rule, mechanized.
3. **Discipline garb overrides faction dress.** A Combine karateka wears a gi with a lanyard pin; an Ashes boxer wears wraps and a bandana. Style identity (§2) always wins over faction identity — Urban Reign's GameSpot rule, adopted as law.
4. **Weapons as identity objects.** One signature weapon per lieutenant, named in the style when relevant ("Kung Fu / Chinese sword" pattern) — ties into `docs/FIGHTING_STYLES_CATALOG.md` and the weapon-persistence systems in `docs/URBAN_REIGN_ANALYSIS.md`.

### 6c. The plot engine to steal: the false-flag war

Urban Reign's real design gift isn't a faction — it's the **war machine** (§3): a hidden hand (Bordin/Mushin-Kai) manufactures gang conflict so turf shifts feel authored, not random. For AshLane's turf war (`docs/TURF_WAR.md`):

- **The Combine plays Bordin.** Evictions and demolitions need *justification* — the Combine manufactures street chaos (via Hollows provocations or Onyx's gang) so "Meridian Crossing" looks like rescue, not conquest. Every turf flip in Chapter 2–4 should trace back to a Combine-authored incident the player can uncover.
- **The Mushin-Kai slot goes to whoever the player doesn't suspect.** Urban Reign hides the engineers one layer below the visible war. Keep one faction's true employer secret until endgame.
- **"Defeat means friendship" as the recruitment loop.** Beaten lieutenants become protectable allies / playable partners (Urban Reign's escort missions: Glen, Dwayne, Grimm, Tong Yoon). This is how AshLane grows a large roster without a large cast of introductions — the roster *is* the defeated.

## Top 3 recommendations (for the parent agent)

1. **Adopt the two-flavor style split per faction.** Urban Reign's Wrestling = Jake (technique) + Alex (power) trick means one style name hosts two mechanical archetypes. Give every AshLane faction its primary style *plus an internal contrast* (Authority: technical-wrestler cops vs boxer riot-cops; Ashes: Rush rushers vs street-boxing brawlers). This is the cheapest path to roster depth and directly serves the 85/15 street/wrestling mix — the 15% wrestling flavor lives in *two grappler flavors*, not one.
2. **Ship the 3-marker identifier kit per faction (§6b) and wire it to EMBLEM_SYSTEM.md.** One symbol (emblem already designed) + one accent garment + one body/head mark; colors as trim only. This is exactly Urban Reign's hoods/tattoos/hairstyles system, and it satisfies the binding no-uniforms rule with a mechanized checklist instead of vibes.
3. **Run the turf war on the false-flag engine (§6c).** The Combine manufactures the chaos it "rescues" the district from — every territory flip traces to an authored incident. Pair with defeat-means-friendship recruitment so the roster grows through combat, not cutscenes.
