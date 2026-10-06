# Moveset Library — URBAN REIGN

**Date:** 2026-10-06
**Purpose:** Per-character combat reference for AshLane fighter design. Urban Reign is AshLane's PRIMARY reference — a Namco-made 3D street brawler (PS2, 2005) by the Tekken/Soulcalibur teams. 60 playable fighters, 100 missions, 4-button combat.
**Systems reference:** `COMBAT_TEARDOWN.md` section 7.
**How to read:** UR inputs are 4-button — Strike, Grapple, Dash, Evade — plus stick direction selecting hit region (up = head/chest, neutral = mid, down = legs). Special Art = Strike+Grapple together (costs meter, uncounterable except by another special).

Sources: Tekken Wiki Urban Reign page, Wikipedia, GameFAQs FAQs, GameSpot/Eurogamer coverage. Summarized in our own words.

---

## THE STYLE FRAMEWORK

Urban Reign's named fighting styles — each is a full kit identity, not a costume:

| Style | Identity | Tekken parallel |
|---|---|---|
| All-Round | Kickboxing + wrestling + submission grappling | Balanced fundamentals |
| Kung Fu / Chinese sword | Baguazhang flow + sword | Xiaoyu + Xianghua |
| Rush | Street boxing + wrestling, fast | Paul-style pressure |
| Power | Wrestling + street fighting, heavy | Big-body grappler |
| Karate | Kyokushinkai, Mishima-flavored | Jin/Kazuya lite |
| Wrestling (technical) | Pro/amateur technique, submissions | — |
| Wrestling (power) | Power slams over technique | — |
| Boxing | Street boxing + grapples | Steve Fox |
| Capoeira | Authentic capoeira + acrobatics | Eddy/Christie |
| Tae Kwon Do | ITF + Moo Duk Kwan + Olympic TKD | Hwoarang/Baek |
| Muay Thai | Knees, elbows, kicks, clinch | Bruce Irvin |
| Submission | Submission holds + kickboxing strikes | — |
| Mighty | Strength + grappling, street | Marduk-like |
| Master / Personal Katana | Karate + street + katana | — |
| Kung Fu / Chinese Broadsword | Feng-Wei-like hands + broadsword | Feng Wei |

Design lesson: **styles are named, documented, and mechanically distinct** — "Rush" isn't "Boxing but faster," it's boxing+wrestling with its own grapple set. AshLane's 14 styles should each have this level of documented identity.

---

## PROTAGONISTS

### Brad Hawk — All-Round
- **Style:** All-Round (kickboxing + wrestling + submission grappling). The template brawler.
- **Role:** Main protagonist; "brawler-for-hire" with a mysterious past (voiced by Steve Blum; inspired by Takuma Tsurugi).
- **Signature tools:** Balanced strike strings (3-hit into juggle); full grapple suite — low/high grapples, air grapples off juggles, submission holds; competent with every weapon.
- **Grapples:** The complete set — technical wrestling takedowns plus submission finishes. The measuring stick for the whole grapple system.
- **Special arts:** Straightforward power special arts; the baseline every other character is compared against.
- **What makes them distinct:** Deliberately the "no gimmick" center — every tool works, nothing is flashy. The design anchor: if Brad can't do it, it's a specialist tool.
- **AshLane pull:** Brad IS the AshLane default fighter template — all-round kit, full grapple suite, weapon competence. Our "balanced" archetype should be built by cloning Brad's philosophy.

### Shun Ying Lee — Kung Fu / Chinese sword
- **Style:** Baguazhang-based kung fu (resembles Ling Xiaoyu) + Chinese sword (resembles Soulcalibur's Xianghua).
- **Role:** Deuteragonist; Chinatown operator framed for a gang attack; hires Brad.
- **Signature tools:** Flowing circular strikes; sword gives her range no one else has; evasive footwork.
- **Grapples:** Kung fu throws — leverage and redirection over power.
- **Special arts:** Sword-based specials with wide arcs (multi-enemy coverage).
- **What makes them distinct:** The only sword user in the core cast — range + flow. Xiaoyu-like evasiveness in a brawler.
- **AshLane pull:** Weapon-integrated style — the sword isn't a pickup, it's her kit. Template for AshLane's weapon-specialist fighters.

### Dwayne Davis — Rush
- **Style:** Rush — street boxing + wrestling, very fast.
- **Role:** Leader of the Zaps gang; lost his family young; the kidnapping of his member KG drives the plot.
- **Signature tools:** Fast boxing combinations into wrestling takedowns; rushdown strings.
- **Grapples:** Wrestling takedowns at boxing speed — the fastest grappler in the cast.
- **Special arts:** Aggressive closing specials.
- **What makes them distinct:** Speed-grappler — boxing hands with a wrestler's takedown threat. The "in your face" gang leader.
- **AshLane pull:** Rush style for AshLane's gang-leader archetypes — fast strikes that branch into takedowns. (Dwayne is the direct ancestor of AshLane's "biker/street leader" fighters.)

### Glen Kluger — Power
- **Style:** Power — wrestling + street fighting, heavy.
- **Role:** Leader of the Hell's Legions biker gang; hired muscle.
- **Signature tools:** Heavy strikes, power slams, biker-brawl dirtiness.
- **Grapples:** Power wrestling — suplexes, slams, brute throws.
- **Special arts:** Devastating close-range power specials.
- **What makes them distinct:** The biker-bruiser — slow, huge damage, intimidation as a mechanic. Every hit feels heavy.
- **AshLane pull:** Power style = AshLane's bruiser template. Biker-gang flavor directly maps to AshLane's biker factions.

### Sho Kadonashi — Karate
- **Style:** Kyokushinkai karate; moves based on Jin Kazama and Kazuya Mishima.
- **Role:** Grandmaster of the Kadonashi Dojo; Japanese immigrant chasing the American dream.
- **Signature tools:** Mishima-flavored karate — heavy mids, axe kicks, karate strings adapted to 4-button.
- **Grapples:** Karate throws — sweeps and hip throws.
- **Special arts:** Kyokushin power specials.
- **What makes them distinct:** Tekken DNA in a brawler body — the closest thing to a Mishima in Urban Reign. Proof that Tekken kits compress into 4 buttons.
- **AshLane pull:** The Tekken-compression proof — Jin/Kazuya moves work in a brawler. Validates AshLane's Tekken-notation movesets.

### Jake Hudson — Wrestling (technical)
- **Style:** Technical pro/amateur wrestling — more technique than Alex Steiner.
- **Role:** Muscle-for-hire; ex-amateur wrestler (injury ended his career).
- **Signature tools:** Technical takedowns, chain wrestling, submissions.
- **Grapples:** The deepest technical grapple set — amateur-style takedowns plus pro-style throws.
- **Special arts:** Technical submission specials.
- **What makes them distinct:** Technique over power — the wrestler's wrestler.
- **AshLane pull:** Technical-wrestling sub-style for AshLane's wrestling style (vs power-wrestling).

### Grimm — Boxing
- **Style:** Street boxing + grapples (similar to Steve Fox; hoodie reads "Iron Fist").
- **Role:** Former world-ranked boxer, Westside Boxing Gym.
- **Signature tools:** Boxing combinations, street-fight infighting, boxing-to-grapple transitions.
- **Grapples:** Boxer's clinch grapples.
- **Special arts:** Power-punch specials.
- **What makes them distinct:** The boxer who brawls — Steve Fox's kit with street dirt on it.
- **AshLane pull:** Street-boxing template — boxing style with brawler flavor (maps to AshLane's boxing style, Akon).

### Chris Bowman — Capoeira
- **Style:** Authentic capoeira + acrobatics/gymnastics (resembles Eddy/Christie).
- **Role:** Middle-class capoeirista with a temper about being mocked for it.
- **Signature tools:** Ginga flow, acrobatic kicks, handstand/grounded transitions.
- **Grapples:** Capoeira takedowns and sweeps.
- **Special arts:** Acrobatic multi-hit specials.
- **What makes them distinct:** Real capoeira in a street brawler — proof the style works outside Tekken.
- **AshLane pull:** Direct validation for AshLane's capoeira style (we have 16+ capoeira clips). Chris is the reference for how capoeira reads in a brawler.

### Dae-Suk Park — Tae Kwon Do
- **Style:** ITF + Moo Duk Kwan + Olympic TKD (similar to Hwoarang/Baek).
- **Role:** Mysterious gothic loner.
- **Signature tools:** TKD kick strings, spinning kicks, stance transitions.
- **Grapples:** TKD takedowns (limited — he's a kicker).
- **Special arts:** Aerial kick specials.
- **What makes them distinct:** The kick specialist — longest-range striker in the cast.
- **AshLane pull:** TKD kick-style reference for AshLane's kick-heavy fighters.

### Tong Yoon Bulsook — Muay Thai
- **Style:** Muay Thai — knees, elbows, kicks, clinch (similar to Bruce Irvin; loosely based on Tony Jaa's Kham).
- **Role:** Former Thai champion, lone wolf fallen on hard times.
- **Signature tools:** Brutal knees/elbows, clinch strikes, roundhouse kicks; brief Wai Khru ram muay before his charge-up special.
- **Grapples:** Clinch grapples — knees from the plum.
- **Special arts:** Charge-up special (with the Wai Khru ritual).
- **What makes them distinct:** The clinch fighter — Muay Thai's close-range brutality, plus cultural authenticity (the ram muay).
- **AshLane pull:** Muay Thai style reference (knees/elbows/clinch) + ritual-before-special as personality. Direct map to AshLane's Muay Thai style.

### Alex Steiner — Wrestling (power)
- **Style:** Power wrestling — football + amateur wrestling + street experience.
- **Role:** Enforcer from Green Hill.
- **Signature tools:** Power slams, shoulder tackles, football-style hits.
- **Grapples:** Power over technique (contrast with Jake Hudson).
- **Special arts:** Tackle-based specials.
- **What makes them distinct:** The Jake/Alex contrast is the design lesson — same "Wrestling" label, completely different kits (technique vs power).
- **AshLane pull:** Sub-style differentiation — AshLane's wrestling style needs technical/power/lucha sub-kits, not one list.

---

## ANTAGONISTS

### Douglas McKinzie — Submission
- **Style:** Submission holds + kickboxing strikes (similar to Bryan Fury); signature weapon: combat knives.
- **Role:** Ex-military; formed the Shadow Platoon; kidnapped and tortured KG; allied with the Outlaws.
- **Signature tools:** Submission grapples, kickboxing strikes, knife strikes (deadliest when armed).
- **Grapples:** Submission holds — the best pure submission kit in the game.
- **Special arts:** Knife/submission specials.
- **What makes them distinct:** The submission specialist + the knife fighter — two identities in one. Military brutality.
- **AshLane pull:** Submission-as-style (not just a move property) + weapon-specialist design. AshLane's `submission` move property needs a fighter built around it.

### Napalm 99 — Mighty
- **Style:** Mighty — street fighting with huge strength + grappling (wrestling-like).
- **Role:** Ex-con; founded the Outlaws from fellow convicts; allied with Shadow Platoon; despises social order.
- **Signature tools:** Heavy street strikes, power grapples.
- **Grapples:** Strength-based throws and slams.
- **Special arts:** Raw power specials.
- **What makes them distinct:** The convict-boss — pure destructive strength, no technique.
- **AshLane pull:** Mighty style = AshLane's convict/prison-fighter flavor.

### Golem — Mighty
- **Style:** Mighty (same style family as Napalm 99); physically similar to Craig Marduk.
- **Role:** Killed an opponent in a wrestling match; now underground; bodyguard for the Tin-Jiao triad. Devoid of pride/humanity.
- **Signature tools:** Underground-fight brutality — no-rules grappling.
- **Grapples:** The heaviest throws in the game.
- **Special arts:** Bodyguard-brutality specials.
- **What makes them distinct:** The monster — a Marduk-like in a street brawler. (Note: AshLane's "Golem" name was misassigned to a wrong model in a Bannon playtest — the REAL Golem reference is this character's archetype, not any existing GLB.)
- **AshLane pull:** Monster-heavy archetype — huge, no wasted motion, terrifying throws.

### Lin Fong Lee — Kung Fu / Chinese Broadsword
- **Style:** Kung fu hands (similar to Feng Wei) + Chinese broadsword (Soulcalibur-like).
- **Role:** Shun Ying's younger brother; left to form the Tin-Jiao; murdered their father.
- **Signature tools:** Feng-Wei-like hand strikes + broadsword range.
- **Grapples:** Kung fu throws.
- **Special arts:** Broadsword specials.
- **What makes them distinct:** The dark mirror of Shun Ying — same kung fu roots, broadsword instead of straight sword, fratricide instead of loyalty.
- **AshLane pull:** Sibling-mirror fighter design — same base style, different weapon and morality. Good story-mode boss pattern.

### Shinkai — Master / Personal Katana
- **Style:** Master (karate + street fighting) + personal katana — the Shinkai Katana is the deadliest weapon in the game in its master's hands.
- **Role:** Leader of the Mushin-Kai Yakuza; hired to turn Green Harbor into chaos.
- **Signature tools:** Karate/street hybrid strikes; katana techniques no one else has.
- **Grapples:** Yakuza-style throws.
- **Special arts:** Katana specials — the weapon-scaling showcase.
- **What makes them distinct:** The weapon master — proof that a signature weapon multiplies a kit. Yakuza-boss archetype.
- **AshLane pull:** Yakuza-boss template (directly relevant to AshLane's syndicate factions) + signature-weapon scaling design.

### William Bordin — Power
- **Style:** Power (street fighting + wrestling); personal weapon: pistol (unlockable).
- **Role:** Mayor of Green Harbor; head of a security firm; the overarching antagonist — secretly hired Mushin-Kai, Tin-Jiao, Shadow Platoon, and Outlaws to engineer chaos for his governorship run. The weakest close-combat character.
- **Signature tools:** Minimal — he's a politician, not a fighter. Pistol when unlocked.
- **Grapples:** Basic.
- **Special arts:** Unremarkable — deliberately.
- **What makes them distinct:** The weak final boss — wins through conspiracy, not fists. The design lesson: not every boss needs to be the strongest fighter.
- **AshLane pull:** The puppet-master boss archetype — AshLane's corporate villains (Director Cole Vane!) follow this pattern: power through systems, not combos.

---

## SECONDARY CHARACTERS

### Lilian Evans — Kung Fu
- Chinatown resident; idolizes Shun Ying; daily ascetic training to match her. The "aspirant" archetype — weaker version of a main style, narratively motivated.

### Kelly Bowman — Capoeira
- Chris's younger sister; brash capoeirista. Sibling-style variant — same style, different personality and stats.

### Vera Ross — Wrestling
- Jake Hudson's high-school sweetheart; former amateur wrestler. The "don't get between them" duo design — paired with Jake narratively.

---

## TEKKEN GUEST CHARACTERS (unlockable)

### Paul Phoenix (in Urban Reign)
- Tekken 5-era Paul adapted to 4 buttons. Keeps his iconic tools — Deathfist-style shoulder charges, Demolition Man strings — compressed into strike/grapple/dash/evade. Proof that a full Tekken kit survives the 4-button translation with its identity intact.

### Marshall Law (in Urban Reign)
- Tekken 5-era Law adapted to 4 buttons. Keeps the Jeet Kune Do pressure — Dragon tail sweeps, Junkyard strings, slide mixups. Same lesson as Paul: Tekken depth is in the *decisions*, not the button count.

**AshLane lesson from both:** If Paul and Law keep their souls at 4 buttons, AshLane's Tekken-notation movesets (which are *more* expressive) have nothing to fear. Depth comes from the grapple/stance/position systems around the inputs.

---

## ROSTER SWEEP — GANGS & THE REMAINING ROSTER

60 playable fighters total. Verified structure:

| Gang/Faction | Verified members | Identity |
|---|---|---|
| Zaps | Dwayne Davis (leader), KG (kidnapped member) | Street gang; Rush style |
| Hell's Legions | Glen Kluger (leader) | Biker gang; Power style |
| Shadow Platoon | Douglas McKinzie (leader) | Ex-military; Submission style |
| Outlaws | Napalm 99 (leader) | Ex-convicts; Mighty style |
| Tin-Jiao | Lin Fong Lee (leader), Golem (bodyguard) | Triad splinter; Kung Fu/Broadsword + Mighty |
| Mushin-Kai | Shinkai (leader) | Yakuza; Master/Katana |
| Chinatown (Shun Ying's) | Shun Ying Lee, Lin Fong Lee (defected), Lilian Evans | Kung Fu/sword |
| Kadonashi Dojo | Sho Kadonashi | Karate |
| Westside Boxing Gym | Grimm | Boxing |
| Green Harbor government | William Bordin (mayor) | Power (weak) |

The only gangs with NO major-character member: **Outsiders** and **Colors** (per Tekken Wiki trivia) — their fighters are minor-roster only.

**Minor roster:** the remaining ~40 fighters are mission opponents and multiplayer picks sharing the style framework above (Boxer/Wrestler/Karateka/Street Brawler and the named styles). Per all sources, minor fighters use the archetype kits with stat/personality variation rather than unique movelists — the design lesson being that **a strong archetype kit carries the roster**, and unique kits are reserved for major characters. (Individual minor-fighter names beyond those listed here were not verifiable from available sources — marked accordingly rather than invented.)

**Mission structure note:** 100 missions, many multi-enemy; AI partners take orders; 4-player multiplayer via multitap. The roster exists to serve *missions*, not versus — every fighter is a potential ally or enemy in story contexts. AshLane's lieutenants/jobs system follows the same philosophy.

---

## URBAN REIGN → ASHLANE PULL LIST (top 10)

1. **4-button philosophy, Tekken depth** — depth lives in grapple/stance/position systems, not input count.
2. **No-block option** — timed evade + up/down reversal as a defensive layer.
3. **Directional regions** — stick direction selects head/mid/legs; region-specific damage effects.
4. **Low/high/air/counter/recounter grapples** — the grapple taxonomy AshLane's `grapple-system.ts` should grow into.
5. **3-hit-into-juggle grammar** — simple combo entry, branching finish.
6. **Special arts** — meter-cost uncounterable specials (AshLane's "Rage" finishers are the descendant).
7. **Team-up tandem grapples** — two fighters, one victim (AshLane lieutenants!).
8. **Weapon durability + throw-to-stun** — weapons as resources, not permanent upgrades.
9. **Wall-run + environmental damage** — the arena is a weapon.
10. **Named styles with documented identity** — every style is a design document, not a label.
