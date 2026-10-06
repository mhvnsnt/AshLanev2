# FACTION HIERARCHY & RANK SYSTEM — AshLane

**Status:** design doc (research-backed, fiction-original)
**Related:** `docs/teardowns/AI_BEHAVIOR_TEARDOWN.md` (aggro/backup/provocation — rank layers ON TOP),
`docs/WORLD_STORY_DESIGN.md` (rank gates story progression), `docs/teardowns/SA_TURF_WAR_TEARDOWN.md` (turf meta)

**Owner's directive (2026-10-06):** study real gangs, factions, police, armies, corporations and their
hierarchies — then build proprietary ~10-rank ladders per AshLane faction type, with rank driving AI
behavior: higher-rank players intimidate lower-rank enemies (hesitation, fear, fleeing, desperate
last stands), lower-rank allies show respect, rivals may back down.

**Canon law:** rank titles below are ORIGINAL fiction. Real-world terms are described in Part 1 for
research only and are NOT used verbatim as game ranks (per owner rule: no copying real gang rank names
into the game). Story/canon questions are flagged OPEN QUESTION — never invented.

---

## PART 1 — Real-world hierarchy research

> Brief structural summaries in our own words. Sources linked, not reproduced.

### 1.1 Street gangs (Bloods, Crips, Vice Lords, Latin Kings, Gangster Disciples, Hoovers)

- **Shape:** LA-style sets are a broad-based pyramid — a wide base of foot soldiers in semi-autonomous
  cliques, narrowing toward the top more through attrition (death, prison, desertion) than formal
  promotion (PoliceMag, "The Structure of Gangs").
- **Rank ladder (common pattern):** associate → baby gangster → member → shot caller → OG
  (Original Gangster). Sureno sets use soldier → shot caller → homeboy → veterano.
  (Sources: Brainscape POST gang flashcards; answers.com street-gang ranks summary.)
- **Authority at the top is informal:** OGs/veteranos hold honorary figurehead status and their
  advice carries enormous weight, but they rarely issue direct orders — closer to senior officers
  running a shift by experience than a chain of command (PoliceMag).
- **Two arms:** every set has a militant "right arm" (fighters, hierarchy, the part police target)
  and a support base that regenerates it — dismantling the fighters doesn't kill the set.
- **Rank is earned by:** age/time in, violence committed ("put in work" is the most important
  criterion), arrests survived, and hustle quality. Initiation is typically a beating ("jumped in").
- **Latin Kings (Chicago):** the most formally structured — a constitution, chapters ("tribes"),
  dues, and a hierarchy with Inca/Supreme Inca titles at the top; the KMC (Motherland) faction
  oversees chapters. (FBI National Gang Threat Assessment 2009.)
- **Gangster Disciples:** famously bureaucratic — board of directors, governors, regents, coordinators
  over street-level soldiers; position papers and written rules.
- **Prison influence:** shot callers for many sets operate from inside prison; street members follow
  orders relayed outward (FBI National Gang Report 2013).

**Design takeaways:** informal-but-real authority at top; rank earned through *deeds* (work put in),
not appointments; the set regenerates from its base; prison can be a leadership vector.

### 1.2 Yakuza (Japanese syndicates)

- **Family model:** the oyabun (father-figure, titled kumicho/kaicho) commands kobun (children) —
  a pseudo-family built on the senpai-kohai senior-junior pattern. Members cut real family ties and
  transfer loyalty to the oyabun; they address each other as fathers, uncles, brothers.
  (Source: Wikipedia, "Yakuza".)
- **Executive office (shikkobu):** the three key posts are kumicho (head), wakagashira
  (second-in-command, pseudo eldest son — directly commands the soldiers), and shateigashira
  (pseudo eldest younger brother — commands distant/separate soldiery). Below them: honbucho
  (general manager), fuku-kumicho (deputy), saiko-komon (senior advisor), jimukyokucho
  (secretary general). Yamaguchi-gumi 2024 pecking order: kumicho → wakagashira →
  shateigashira → honbucho.
- **Layered subsidiaries:** a large syndicate is 5–6 organizations deep — heads of subsidiary groups
  are executives of the parent; a kobun can become oyabun of his own sub-group, nesting indefinitely.
- **Bond mechanism:** the sakazuki (sake-sharing) ritual formally creates the parent-child bond and
  fixes rank relative to who shared with whom.
- **Penal code:** yubitsume (finger shortening) as atonement; expulsion = social death.

**Design takeaways:** family-as-organization; rank is *relational* (who your father is) as much as
positional; subsidiaries nest — a captain can be a boss of his own crew; ritual formalizes promotion.

### 1.3 Outlaw bikers (MC clubs)

- **Officers:** president, vice president, secretary, treasurer, road captain, sergeant-at-arms
  (enforcer — internal discipline). Chapters are local units; the mother chapter (or a national
  president) sets club-wide policy. (Source: Wikipedia, "Outlaw motorcycle club".)
- **Pipeline:** hang-around → prospect → full-patch member. Prospect is *not* membership — prospects
  do menial labor for patched members, wear the club name but not the full logo, and need a member
  vote (sometimes unanimous) to patch in.
- **Democratic core:** one member one vote on club business; officers are elected. Loyalty is proven
  through service and time, not bought.
- **Sergeant-at-arms** is the internal police: enforces club rules against members.

**Design takeaways:** the prospect pipeline is the clearest *earn-your-place* ladder in any faction
type; democracy + loyalty tests; the enforcer polices *inward*, not outward.

### 1.4 Mafia / cartel families

- **Pyramid:** Don (boss) → underboss (second, usually the heir) → consigliere (counselor/advisor,
  #3) → caporegime/capo (crew leader, ~10 soldiers) → soldier (made man, lowest official rank) →
  associate (unofficial, earns under a made man's protection). (Sources: Wikipedia "Sicilian Mafia"
  clan hierarchy via Buscetta testimony; NY Five Families structure.)
- **Insulation:** orders pass down the chain so the top never touches the act — the structure is
  designed to shield leadership from law enforcement.
- **Cartels** run a parallel corporate-military hybrid: plaza bosses (territory), sicarios (enforcers),
  halcones (lookouts — the eyes), money operators; cells are compartmented.

**Design takeaways:** insulation by layers; crew = the atomic unit (~10); lookouts are the sensory
organ of the org; associates orbit without membership.

### 1.5 Police

- **Standard municipal ladder:** recruit/cadet → patrol officer → detective *or* senior officer →
  sergeant (first-line supervisor) → lieutenant → captain → commander → deputy chief → chief.
  Rank is earned by exam, time in grade, and record.
- **Tactical track:** SWAT operators are selected from patrol, trained as a team — entry/breacher/
  sniper roles, team leader, commander. Authority in a raid flows from the tactical commander, not
  patrol rank.
- **Internal affairs** polices the police — the inward-facing enforcer, same slot as the MC
  sergeant-at-arms and the yakuza shikkobu.

**Design takeaways:** dual tracks (patrol vs tactical); promotion is tested and time-gated; IA is the
self-policing organ every faction type has a version of.

### 1.6 Military / private military

- **Enlisted → NCO → officer:** recruit → private → corporal → sergeant → staff sergeant →
  lieutenant → captain → major → colonel → general. NCOs (sergeants) are the backbone — they run
  the unit day-to-day while officers plan.
- **Unit nesting:** fireteam (4) → squad (8–12) → platoon (~40) → company (~150) → battalion.
  Same nesting pattern as yakuza subsidiaries and mafia crews, different scale.
- **PMCs** compress this: contractor → team member → team leader → operations manager → regional
  director — corporate titles over military bones.

**Design takeaways:** the NCO insight — the *sergeant* tier, not the top, is what makes units work;
nesting units of ~4/10/40 is universal across faction types.

### 1.7 Corporate (+ corporate security, Arasaka-pattern)

- **Ladder:** associate → senior associate → manager → senior manager → director → VP → SVP →
  C-suite (CFO/COO/CEO) → board. Promotion by performance review, visibility, and politics.
- **Corporate security** mirrors it with tactical flavor: guard → officer → supervisor → manager →
  director → VP of security → chief security officer. In cyberpunk fiction the security arm becomes
  a private army with its own chain of command parallel to the business side.
- **Key dynamic:** the security apparatus serves the *company*, not the street — its members'
  loyalty is to the paycheck and the badge, which makes defection and bribery story levers.

**Design takeaways:** parallel chains (business vs security); loyalty is transactional — a design
lever for bribable/corruptible AI.

### 1.8 Fighting-game rank flavor (Tekken dans)

- Tekken's online ranks run kyu → dan (1st–Tekken God etc.). The owner explicitly referenced
  "first dan, second dan" as a *feel* reference. Dans are personal-skill ranks, not org positions —
  useful as the *fighter* rank layer distinct from *faction* rank (see §3.5).

---

## PART 2 — AshLane proprietary rank ladders (30 ranks, 10 tiers)

**Owner directive:** Tekken 8 runs 30 ranks in 10 color divisions (Brown → Silver → Teal → Green →
Yellow → Orange → Red → Purple → Blue → Gold; Beginner → 1st/2nd Dan → … → God of Destruction).
AshLane mirrors that skeleton — **30 ranks, 10 tiers of 3, color-banded for UI** — but every title
is original fiction flavored to its faction's real-world inspiration (Part 1). No real gang rank
names are used verbatim.

### Universal mechanical curve (all factions, ranks 1–30)

Rank drives the same four levers everywhere; flavor differs per faction.

| Ranks | Tier (color) | Recruit cap | Backup radius | Intimidation radius | Territory actions |
|---|---|---|---|---|---|
| 1–3 | I — Ash (brown) | 0 | 10 m | — | none |
| 4–6 | II — Rust (silver) | 1 | 15 m | — | none |
| 7–9 | III — Teal | 2 | 15 m | 5 m | none |
| 10–12 | IV — Green | 3 | 20 m | 5 m | claim corners/spots |
| 13–15 | V — Yellow | 3 | 20 m | 8 m | run a block |
| 16–18 | VI — Orange | 4 | 25 m | 8 m | declare turf challenges |
| 19–21 | VII — Red | 4 | 25 m | 12 m | negotiate terms |
| 22–24 | VIII — Purple | 5 | 30 m | 12 m | call truces / all-out war |
| 25–27 | IX — Blue | 5 | 30 m | 18 m | city-wide operations |
| 28–30 | X — Gold | 6 | 30 m | 18 m | rewrite the map |

- **Demotion (Tekken rule):** from Tier IV (rank 10) up, repeated losses demote. Below rank 10,
  ranks are safe — beginners never slide backwards.
- **Rank-up ritual:** each faction gates tier transitions (IV, VII, X) behind a deed, not just
  points — a fight, a tribute, a vote, an exam. Mirrors the prospect vote, the sakazuki, the
  sergeant's board.
- **Display:** rank title + tier color on nameplates, pause-menu roster card, and faction UI.

### How rank is earned (all factions)

- **Fights won** — scaled by opponent rank delta (beating someone 5+ above you pays triple).
- **Turf taken/held** — per district tick while your faction holds it.
- **Missions completed** — story and job payouts in rank XP.
- **Faction deeds** — per-faction flavor objectives (see ladders).
- **Decay:** none below rank 10; above, inactivity slowly bleeds XP (keeps the top honest).

---

### LADDER 1 — Street crew (the set)

*Inspiration: LA set structure (Part 1.1). Rank is earned by work put in; the top rules by
reputation, not paperwork. Faction deed: hold a corner through a full night cycle.*

| # | Tier | Title | Fiction |
|---|---|---|---|
| 1 | I Ash | **Lookout** | Eyes on the block. You watch, you learn, you say nothing. |
| 2 | I Ash | **Runner** | Errands. Packages move because you move. |
| 3 | I Ash | **Tagger** | Your name goes up on walls. The set starts to know it. |
| 4 | II Rust | **Hustler** | You earn. Money flows uphill and the hill notices. |
| 5 | II Rust | **Earner** | Consistent money. Reliability is a rank. |
| 6 | II Rust | **Banger** | First fights. Heart proven in public. |
| 7 | III Teal | **Soldier** | Foot soldier of turf disputes. You hold lines. |
| 8 | III Teal | **Rider** | You roll with the crew. Trusted in motion. |
| 9 | III Teal | **Debt Hand** | Debts get collected. Yours is the knock on the door. |
| 10 | IV Green | **Enforcer** | The set's muscle has a name, and it's yours. *Unlocks: claim corners.* |
| 11 | IV Green | **Corner Boss** | A corner is yours to run and defend. |
| 12 | IV Green | **Muscle Lead** | You point; soldiers move. |
| 13 | V Yellow | **Block Captain** | The block answers to you. |
| 14 | V Yellow | **Turf Holder** | Ground stays yours because you bled for it. |
| 15 | V Yellow | **War Dog** | First one through the door when sets collide. |
| 16 | VI Orange | **War Chief** | You run the set's violence like an instrument. *Unlocks: turf challenges.* |
| 17 | VI Orange | **Arsenal Keeper** | What the set fights with flows through you. |
| 18 | VI Orange | **Strike Lead** | Coordinated hits. Three blocks, one signal. |
| 19 | VII Red | **Street Lieutenant** | Officers of the set. Your word moves dozens. |
| 20 | VII Red | **The Second** | The top's right hand. Everyone knows it. |
| 21 | VII Red | **Heir** | Being groomed. The crown is visible from here. |
| 22 | VIII Purple | **Block Baron** | Multiple blocks, one name. *Unlocks: truces / total war.* |
| 23 | VIII Purple | **Turf Baron** | Districts check with you before they move. |
| 24 | VIII Purple | **City Baron** | The city's underworld knows your price and your temper. |
| 25 | IX Blue | **Street Legend** | Kids tag your name. You haven't done anything in years — you don't need to. |
| 26 | IX Blue | **City Legend** | Your story is told wrong in every barbershop, and that's fine. |
| 27 | IX Blue | **Living Legend** | Walking history. Wars pause when you arrive. |
| 28 | X Gold | **Myth** | Half the city thinks you're dead. The other half hopes you are. |
| 29 | X Gold | **Immortal** | Your name outlives your enemies. It already has. |
| 30 | X Gold | **The One** | There is the set, and then there is you. |

### LADDER 2 — The Syndicate (Yakuza-style family)

*Inspiration: oyabun/kobun family model, layered subsidiaries (Part 1.2). Rank is relational —
who shared sake with whom. Tier transitions (IV, VII, X) require the **oath ritual**, not just XP.
Faction deed: tribute delivered upward without skimming.*

| # | Tier | Title | Fiction |
|---|---|---|---|
| 1 | I Ash | **Outsider** | Not family. Useful, watched, temporary. |
| 2 | I Ash | **Errand** | You run for the house. The house barely knows your name. |
| 3 | I Ash | **Sworn Prospect** | You've asked for the cup. Now prove you deserve it. |
| 4 | II Rust | **Sworn Brother** | The oath is taken. You are family — the lowest kind. |
| 5 | II Rust | **Earner** | Money flows up. Yours flows clean and on time. |
| 6 | II Rust | **Collector** | Tribute, debts, respect — you gather all three. |
| 7 | III Teal | **Family Soldier** | The house's fists. Deployed, not asked. |
| 8 | III Teal | **Driver** | You move important people. You hear important things. You repeat none of them. |
| 9 | III Teal | **Doorkeeper** | Nothing enters the house's rooms without passing you. |
| 10 | IV Green | **Crew Lead** | Your own handful of soldiers. A subsidiary begins. *Oath ritual. Claim fronts.* |
| 11 | IV Green | **Territory Hand** | A neighborhood's tribute is your responsibility. |
| 12 | IV Green | **House Enforcer** | The family's discipline wears your face. |
| 13 | V Yellow | **Captain** | A crew with a name. The name is yours. |
| 14 | V Yellow | **House Lieutenant** | You speak for a captain's interests at the table. |
| 15 | V Yellow | **Treasurer** | The money passes through your hands. It arrives intact. |
| 16 | VI Orange | **Advisor** | Counsel to power. Your advice has ended careers. *Unlocks: turf challenges.* |
| 17 | VI Orange | **Second of the House** | The head's shadow. Where you stand, authority stands. |
| 18 | VI Orange | **Blade Captain** | The house's sharp end, commanded as one weapon. |
| 19 | VII Red | **Elder Brother** | Seniority made formal. Younger brothers obey. |
| 20 | VII Red | **Heir Apparent** | Named. Everyone in the house adjusts their plans around you. |
| 21 | VII Red | **Regent** | You rule in the head's absence — and the head is often absent. |
| 22 | VIII Purple | **High Seat** | A seat at the executive table. *Oath ritual. Truces / total war.* |
| 23 | VIII Purple | **Elder Seat** | Your vote outweighs captains'. |
| 24 | VIII Purple | **Supreme Seat** | One step below the head. The view is excellent. |
| 25 | IX Blue | **Family Head** | Your own family, sworn to the greater house — subsidiaries nest. |
| 26 | IX Blue | **Grand Head** | Multiple families answer upward to you. |
| 27 | IX Blue | **Eternal Head** | You've survived successions that killed better people. |
| 28 | X Gold | **Living Ancestor** | Retired in name only. The current head still asks. |
| 29 | X Gold | **Immortal Head** | Your sake cup is in a museum. You're still drinking from it. |
| 30 | X Gold | **The Eternal Patriarch** | The family *is* you. There is no distinction anymore. |

### LADDER 3 — The Pack (bikers)

*Inspiration: MC officer structure, prospect pipeline, democratic core (Part 1.3). Tier IV
requires the **patch vote** (unanimous); Tier VII requires a chapter vote; Tier X requires the
mother chapter. Faction deed: miles ridden with the pack + club service.*

| # | Tier | Title | Fiction |
|---|---|---|---|
| 1 | I Ash | **Hang-Around** | You're around. Nobody vouches for you yet. |
| 2 | I Ash | **Prospect** | You wear the name, not the colors. You do what you're told. |
| 3 | I Ash | **Probate** | Final testing. One dissenting vote ends you. |
| 4 | II Rust | **Full Patch** | Voted in. The colors are yours. The debt is yours too. |
| 5 | II Rust | **Rider** | You hold formation. The pack moves as one because of riders like you. |
| 6 | II Rust | **Road Dog** | Loyal to a fault. First to arrive, last to leave. |
| 7 | III Teal | **Tail Gunner** | You ride last. Nobody gets left behind on your watch. |
| 8 | III Teal | **Wrench** | The bikes run because you bleed on them. |
| 9 | III Teal | **Nomad** | Chapterless by choice. Every chapter is your chapter. |
| 10 | IV Green | **Enforcer** | Club rules, enforced. Inward first, outward second. *Patch vote. Claim clubhouses.* |
| 11 | IV Green | **Pack Lead** | You lead rides. The road obeys. |
| 12 | IV Green | **War Rider** | When the pack fights, you are the tip of it. |
| 13 | V Yellow | **Road Captain** | Routes, formations, timing — the pack's movement is your craft. |
| 14 | V Yellow | **Keeper** | The treasury. Every dollar accounted, every fine collected. |
| 15 | V Yellow | **Scribe** | The minutes, the records, the memory of the club. |
| 16 | VI Orange | **Sergeant** | Discipline. Your word ends arguments. *Unlocks: turf challenges.* |
| 17 | VI Orange | **Master Sergeant** | Discipline across chapters. |
| 18 | VI Orange | **War Sergeant** | In wartime, the sergeants *are* the chain of command. |
| 19 | VII Red | **Second** | The president's right hand. *Chapter vote.* |
| 20 | VII Red | **Heir** | Being shaped for the gavel. |
| 21 | VII Red | **Regent** | You hold the gavel when the president can't. |
| 22 | VIII Purple | **Chapter Head** | Your chapter, your rules — within the colors. *Unlocks: truces / total war.* |
| 23 | VIII Purple | **Regional Head** | Chapters answer to you. |
| 24 | VIII Purple | **National Head** | The mother chapter's voice in your mouth. |
| 25 | IX Blue | **Legend of the Road** | Your runs are club scripture. |
| 26 | IX Blue | **Eternal Rider** | You'll die on a bike. Everyone knows it. You know it. |
| 27 | IX Blue | **Ghost of the Highway** | Rivals tell stories about the rider they never caught. |
| 28 | X Gold | **First Patch** | You were there at the founding. The colors mean what you say they mean. |
| 29 | X Gold | **Founder's Heir** | Chosen by the founders. The vote was unanimous because it had to be. |
| 30 | X Gold | **The Original** | The pack began with you. It ends when you say. |

### LADDER 4 — The Authority (police)

*Inspiration: municipal rank ladder, dual patrol/tactical tracks, tested promotion (Part 1.5).
Tier transitions require **exams and time-in-grade** — the only ladder where waiting is mandatory.
Faction deed: cases closed, districts kept under the Heat threshold.*

| # | Tier | Title | Fiction |
|---|---|---|---|
| 1 | I Ash | **Cadet** | Academy. You know nothing, and everyone knows it. |
| 2 | I Ash | **Probationer** | Field training. Your FTO's word is law. |
| 3 | I Ash | **Patrol Officer** | The beat is yours. Walk it. |
| 4 | II Rust | **Senior Officer** | Rookies ask you things. Answer carefully. |
| 5 | II Rust | **Detective** | Cases, not beats. You follow threads. |
| 6 | II Rust | **Field Trainer** | You make officers. The department's future wears your patience thin. |
| 7 | III Teal | **Sergeant** | First-line supervisor. The backbone — everything runs through you. |
| 8 | III Teal | **Staff Sergeant** | Sergeants report to you. The machine has layers. |
| 9 | III Teal | **Detective Sergeant** | You run investigations and the people running them. |
| 10 | IV Green | **Lieutenant** | A watch, a unit, a division's daily reality. *Exam. Claim precinct actions.* |
| 11 | IV Green | **Captain** | A precinct is yours. The CompStat board has your name on it. |
| 12 | IV Green | **Detective Lieutenant** | Major cases bend toward you. |
| 13 | V Yellow | **Commander** | Multiple units. Your signature moves resources. |
| 14 | V Yellow | **Deputy Inspector** | Inspections, audits, standards — the department polices itself through you. |
| 15 | V Yellow | **Inspector** | Internal affairs territory. Nobody likes you. Everybody needs you. |
| 16 | VI Orange | **Tactical Operator** | SWAT-selected. Entry is your language. *Unlocks: raid declarations.* |
| 17 | VI Orange | **Breacher Lead** | Doors stop existing when you arrive. |
| 18 | VI Orange | **Tactical Team Leader** | The stack follows you into the dark. |
| 19 | VII Red | **Deputy Chief** | The chief's bench. *Exam + time-in-grade.* |
| 20 | VII Red | **Bureau Chief** | An entire bureau — patrol, investigations, or tactical — answers to you. |
| 21 | VII Red | **Assistant Chief** | One heartbeat from the top. |
| 22 | VIII Purple | **Chief of Staff** | The chief's will, executed. *Unlocks: city-wide crackdowns.* |
| 23 | VIII Purple | **Executive Chief** | Policy with a badge. |
| 24 | VIII Purple | **Commissioner** | Appointed, confirmed, untouchable. The department is your instrument. |
| 25 | IX Blue | **Superintendent** | Multiple agencies coordinate through you. |
| 26 | IX Blue | **Director of Public Safety** | The city's safety is a line item with your name on it. |
| 27 | IX Blue | **Metro Chief** | The whole metro grid. Every siren, theoretically yours. |
| 28 | X Gold | **Legend of the Force** | Academy classes study your cases. |
| 29 | X Gold | **The Untouchable** | Scandal-proof. The badge polished itself around you. |
| 30 | X Gold | **Chief of Chiefs** | When chiefs need a chief, they call you. |

### LADDER 5 — Corporate Security (the firm's private army)

*Inspiration: corporate ladder over military bones, Arasaka-pattern parallel chains (Part 1.7).
Promotion is by **performance review** — quarterly, political, documented. Loyalty is transactional,
which makes defection a story lever. Faction deed: assets protected, incidents sanitized.*

| # | Tier | Title | Fiction |
|---|---|---|---|
| 1 | I Ash | **Temp Guard** | Contract labor. The badge is rented. |
| 2 | I Ash | **Contractor** | Signed on. Still disposable. |
| 3 | I Ash | **Associate Guard** | Full-time. The firm owns your schedule now. |
| 4 | II Rust | **Security Officer** | Badged. You are the firm's visible deterrent. |
| 5 | II Rust | **Senior Officer** | Trusted posts. Executive floors. |
| 6 | II Rust | **Dispatcher** | You see every camera. Knowledge is leverage — spend it wisely. |
| 7 | III Teal | **Patrol Lead** | A team walks because you say so. |
| 8 | III Teal | **Monitor** | Surveillance craft. You know things the executives don't. |
| 9 | III Teal | **Response Agent** | When alarms sound, you are the answer. |
| 10 | IV Green | **Asset Protection** | People and property worth millions sleep because of you. *Review. Claim corporate zones.* |
| 11 | IV Green | **Supervisor** | Shifts, rosters, incident reports with your signature. |
| 12 | IV Green | **Tactical Guard** | The firm's quiet professionals. Heavier kit, heavier secrets. |
| 13 | V Yellow | **Manager** | A site is yours. Budgets, headcount, liability. |
| 14 | V Yellow | **Senior Manager** | Multiple sites. Your review packet is thick. |
| 15 | V Yellow | **Operations Lead** | City-wide security posture bends around your planning. |
| 16 | VI Orange | **Black Badge** | Internal investigations. You police the police. *Unlocks: sanctioned operations.* |
| 17 | VI Orange | **Investigator** | Corporate espionage, leak hunts, quiet terminations of employment. |
| 18 | VI Orange | **Fixer** | Problems disappear. The paperwork never existed. |
| 19 | VII Red | **Director** | A division's security is your P&L. *Board review.* |
| 20 | VII Red | **Senior Director** | Regional authority. Your signature moves armored columns. |
| 21 | VII Red | **Regional Director** | The firm's interests in a whole territory, defended. |
| 22 | VIII Purple | **VP of Security** | C-suite adjacent. You brief the board on threats. *Unlocks: corporate warfare.* |
| 23 | VIII Purple | **Senior VP** | Global policy flows through you. |
| 24 | VIII Purple | **Executive VP** | One step from the C-suite. The firm's paranoia has your name on it. |
| 25 | IX Blue | **Chief Security Officer** | The entire apparatus. Every guard, every camera, every secret. |
| 26 | IX Blue | **Deputy Chief Executive** | Security *and* operations. The firm trusts you with itself. |
| 27 | IX Blue | **Co-Chief** | You run the company. The title just hasn't caught up. |
| 28 | X Gold | **The Chairman's Shield** | You personally guarantee the chairman's safety. And power. |
| 29 | X Gold | **Corporate Immortal** | Your contract renews itself. It always has. |
| 30 | X Gold | **The Board's Fist** | The board votes. You execute — in every sense. |

### LADDER 6 — The Stable (wrestler stables)

*Inspiration: wrestling card hierarchy + Tekken dan flavor (Part 1.8). The most **public**
ladder — rank is crowd reaction made formal. Tier transitions require **winning a ranked bout**,
not points. Faction deed: put on a five-star match (crowd meter maxed). Demotion is the most
visible here — losing streaks drop you down the card in front of everyone.*

| # | Tier | Title | Fiction |
|---|---|---|---|
| 1 | I Ash | **Trainee** | Ring rust. Rope burns. You are clay. |
| 2 | I Ash | **Rookie** | First matches. The crowd doesn't know your name yet. |
| 3 | I Ash | **Dark Match** | You wrestle before the show. Someday the show will notice. |
| 4 | II Rust | **Opener** | First on the card. The crowd is still finding seats. |
| 5 | II Rust | **Prospect** | Someone important sees something in you. Don't waste it. |
| 6 | II Rust | **Workhorse** | You make everyone look good. The locker room respects it. |
| 7 | III Teal | **Midcarder** | The middle of the card is yours. Solid, dependable, hungry. |
| 8 | III Teal | **Upper Midcarder** | One feud away from the main event. Everyone can feel it. |
| 9 | III Teal | **Gatekeeper** | You decide who moves up. Beat you, and you're real. |
| 10 | IV Green | **Rising Star** | The crowd chants your name. *Ranked bout win. Title contention.* |
| 11 | IV Green | **Breakout** | Merch moves. Your face is on posters. |
| 12 | IV Green | **Fan Favorite** | The building shakes when your music hits. |
| 13 | V Yellow | **Main Eventer** | You close shows. The card is built around you. |
| 14 | V Yellow | **Contender** | Ranked #1. The champion is avoiding eye contact. |
| 15 | V Yellow | **Top Contender** | The next title shot has your name on it in ink. |
| 16 | VI Orange | **Champion** | Gold around your waist. The target on your back is bigger. *Unlocks: stable warfare.* |
| 17 | VI Orange | **Double Champion** | Two belts. Twice the challengers. |
| 18 | VI Orange | **Defending Champion** | Every defense makes the legend heavier. |
| 19 | VII Red | **Top Star** | The company's face. *Championship feud win.* |
| 20 | VII Red | **Franchise Player** | The business runs through you. |
| 21 | VII Red | **The Draw** | Arenas sell out on your name alone. |
| 22 | VIII Purple | **Icon** | Your pose is a tattoo on strangers. *Unlocks: cross-promotion wars.* |
| 23 | VIII Purple | **Superstar** | Mainstream. Your name works outside wrestling. |
| 24 | VIII Purple | **Megastar** | The industry's gravity bends around you. |
| 25 | IX Blue | **Hall of Famer** | Immortalized. The speech made everyone cry. |
| 26 | IX Blue | **Legend** | Kids who never saw you wrestle know your finisher. |
| 27 | IX Blue | **Living Legend** | Still here. Still dangerous. The young ones are terrified and honored. |
| 28 | X Gold | **Immortal** | Your matches are scripture. |
| 29 | X Gold | **The Standard** | Every wrestler is measured against you. Most fail. |
| 30 | X Gold | **The Greatest** | The debate is over. It ended years ago. |

### LADDER 7 — The Block (civilian crews)

*Inspiration: block associations, mutual-aid networks. The only ladder where **rank can't be
taken by force** — it's granted by the community. No demotion, ever; but the community can
withdraw it (public trust loss). Faction deed: organize a block defense or feed the block.*

| # | Tier | Title | Fiction |
|---|---|---|---|
| 1 | I Ash | **Newcomer** | You just got here. The block is deciding about you. |
| 2 | I Ash | **Neighbor** | Known. Nodded at. A start. |
| 3 | I Ash | **Regular** | The corner store knows your order. |
| 4 | II Rust | **Volunteer** | You show up. Cleanups, watches, whatever's needed. |
| 5 | II Rust | **Helper** | People ask you for things. You deliver. |
| 6 | II Rust | **Watch Member** | Block watch. Eyes the block trusts. |
| 7 | III Teal | **Vendor** | You feed the block. Legit hustle, respected. |
| 8 | III Teal | **Shopkeep** | Your store is neutral ground. Everyone honors it. |
| 9 | III Teal | **Block Captain** | The block's organizer. When something needs doing, you know who to call. |
| 10 | IV Green | **Organizer** | Movements start with your phone calls. *Community vote. Claim community spaces.* |
| 11 | IV Green | **Fundraiser** | Money for the block flows through trusted hands — yours. |
| 12 | IV Green | **Mediator** | Feuds end at your table. Both sides leave alive. |
| 13 | V Yellow | **Spokesperson** | You speak for the block to the city. Microphone-ready. |
| 14 | V Yellow | **Chair** | The association's meetings run on your gavel. |
| 15 | V Yellow | **Coalition Builder** | Blocks unite because you introduced them. |
| 16 | VI Orange | **Pillar of the Block** | If you left, the block would feel it like a death. *Unlocks: block-wide actions.* |
| 17 | VI Orange | **Steward** | You hold the block's resources in trust. |
| 18 | VI Orange | **Guardian** | The block's safety is your personal religion. |
| 19 | VII Red | **Elder** | Decades of respect, formalized. *Elders' council.* |
| 20 | VII Red | **Grand Elder** | Your word settles what mediators can't. |
| 21 | VII Red | **Council Seat** | A permanent voice in the block's future. |
| 22 | VIII Purple | **Council Head** | The elders follow your lead. *Unlocks: district coalitions.* |
| 23 | VIII Purple | **District Rep** | The district's civilians speak through you. |
| 24 | VIII Purple | **Coalition Lead** | Multiple districts, one voice — yours. |
| 25 | IX Blue | **Legacy Keeper** | The block's history lives in you. |
| 26 | IX Blue | **Founder's Kin** | Descended from the ones who built this place. The name carries weight. |
| 27 | IX Blue | **Living History** | You *are* the block's story. |
| 28 | X Gold | **Saint of the Streets** | Canonized by the people. No church required. |
| 29 | X Gold | **The People's Champion** | The block would fight a war for you. It has. |
| 30 | X Gold | **Eternal Neighbor** | You'll never leave, and the block will never let you. |

### LADDER 8 — The Unit (military / private military)

*Inspiration: enlisted→NCO→officer chain, unit nesting (Part 1.6). The most **formal** ladder —
every promotion has a board, a test, a ceremony. NCOs (Tier III–IV) are the backbone: the design
notes that sergeants, not generals, make units work. Faction deed: extract your unit with zero
losses, or hold an objective against superior numbers.*

| # | Tier | Title | Fiction |
|---|---|---|---|
| 1 | I Ash | **Recruit** | Boot. You are raw material. |
| 2 | I Ash | **Private** | Graduated. The real education starts now. |
| 3 | I Ash | **Private First Class** | Proven you won't wash out. Low bar, cleared. |
| 4 | II Rust | **Corporal** | First stripe. Someone's responsible for you being responsible. |
| 5 | II Rust | **Specialist** | A skill the unit needs. You're the one who has it. |
| 6 | II Rust | **Squad Member** | A fireteam trusts you with their lives. Don't be weird about it. |
| 7 | III Teal | **Sergeant** | The backbone begins. You run the squad day-to-day. |
| 8 | III Teal | **Staff Sergeant** | Squads plural. The officers plan; you execute. |
| 9 | III Teal | **Squad Leader** | Your squad is the unit's standard. Other squads are measured against it. |
| 10 | IV Green | **Sergeant First Class** | The platoon's conscience. *Board. Claim operational zones.* |
| 11 | IV Green | **Master Sergeant** | Technical mastery. The officers ask *you* how things work. |
| 12 | IV Green | **First Sergeant** | The company's parent. Discipline, morale, welfare — yours. |
| 13 | V Yellow | **Lieutenant** | Commissioned. Theory meets the street. |
| 14 | V Yellow | **Captain** | A company is yours. 150 lives, your signature. |
| 15 | V Yellow | **Platoon Leader** | You lead from the front. The NCOs make sure you survive it. |
| 16 | VI Orange | **Major** | Staff work. Plans with your fingerprints become operations. *Unlocks: coordinated ops.* |
| 17 | VI Orange | **Lieutenant Colonel** | A battalion's second. The machine's middle management, armed. |
| 18 | VI Orange | **Colonel** | A battalion is yours. The buck stops on your desk. |
| 19 | VII Red | **Brigadier** | General officer. Stars begin. *Selection board.* |
| 20 | VII Red | **Major General** | A division's weight behind your decisions. |
| 21 | VII Red | **Lieutenant General** | Corps-level command. Maps with your initials on them. |
| 22 | VIII Purple | **General** | Theater command. *Unlocks: theater-wide operations.* |
| 23 | VIII Purple | **Theater Commander** | The whole area of operations answers to you. |
| 24 | VIII Purple | **Joint Chief** | Services unified under your planning. |
| 25 | IX Blue | **Supreme Commander** | The final authority in the field. |
| 26 | IX Blue | **War Legend** | Your campaigns are taught. Your mistakes are taught louder. |
| 27 | IX Blue | **The Undefeated** | You've never lost an engagement. The record is the intimidation. |
| 28 | X Gold | **The Doctrine** | Armies fight the way you wrote. |
| 29 | X Gold | **Immortal General** | Retired. Consulted. Feared. In that order. |
| 30 | X Gold | **The Art of War** | Your name is the textbook. There is no higher rank. There can't be. |

---

## PART 3 — Rank-based AI behavior spec

**Layers on top of** `docs/teardowns/AI_BEHAVIOR_TEARDOWN.md` §4. Nothing in the AI teardown is
replaced — rank *modifies* the aggro state machine (§4b), backup rules (§4c), and provocation
ladder (§4d). All numbers below are starting tunables for playtest.

### 3.1 Rank delta bands

`delta = player_rank − AI_rank` (ranks 1–30). Checked at **Aware** transition (18 m) and
re-checked whenever either party's rank changes mid-fight or a higher-rank character enters the
scene. Tier difference amplifies: if the two characters are in different tiers, treat delta as
+1 per tier crossed (a rank-12 vs rank-9 across the Green/Teal boundary hits harder than the raw
3 suggests).

| Delta | Band | Behavior |
|---|---|---|
| ≤ 0 | **Peer or superior** | Normal AI-teardown behavior. If negative (AI outranks player), the *player* gets the fear UI treatment — screen-edge pulse, heartbeat audio — but no mechanical penalty. Fair is fair. |
| 1–2 | **Wary** | +0.5 s hesitation before Engage; barks acknowledge the player's rank ("that's [Title]…"). Attack frequency −10%. |
| 3–5 | **Intimidated** | Provocation ladder gains a **Cower** rung (see §3.2). 40% chance to **refuse initiation** — backs away instead of engaging. Attack frequency −20%, block frequency +15% (defensive shell). |
| 6–9 | **Afraid** | 70% chance to **flee at Aware** (before ever engaging). Those who stay fight at −30% aggression. First hit taken triggers a morale check (§3.4). |
| 10+ | **Terror** | Flees **on sight** (Aware range). Only fights if cornered (§3.5) or ordered (§3.6). Civilians already flee; this makes *thugs* flee. |

**Intimidation radius** (universal curve, Part 2) is the aura check: inside it, the AI *knows* the
player's rank without needing line-of-sight history. Outside it, rank is assessed on first visual
contact (Aware transition).

### 3.2 The Cower rung (provocation ladder insertion)

AI teardown §4d ladder was: Ignore → React → Warn → Flee → Fight. With rank, it becomes:

1. **Ignore** → 2. **React** → 3. **Warn** → **3b. Cower** (NEW, only when delta ≥ 3) → 4. **Flee** → 5. **Fight**

- **Cower:** hands-up/backing-away animation, 2–3 s window. The AI is *asking* not to fight.
  - Player backs off → de-escalates to Flee (AI leaves) or back to React.
  - Player attacks → jumps to **desperate Fight** (§3.5), not normal Fight.
  - Player issues a faction command (stand down / pay tribute, if implemented) → resolves peacefully, small rank XP ("mercy" deed).
- Cower uses the ambient dialogue system (AI teardown §4e bark categories) — faction-specific
  fear lines, not generic screams.

### 3.3 Respect displays (same faction, AI rank < player rank)

When the player encounters **same-faction** AI at delta ≥ 3:

- **Deference:** AI steps aside (clears the player's path node), plays a respect gesture
  (nod, fist-to-chest, bow — per faction flavor), barks a respect line using the player's *title*
  ("Captain." / "Elder." / "Champ.").
- **Unprompted backup:** respect extends the proximity-backup radius by +50% (AI teardown §4c:
  15 m → 22.5 m at high respect). They still wait for the player to *take a hit* before joining —
  respect doesn't make them start your fights.
- **Refusal to spar:** same-faction AI never initiates against a higher-rank player. Ever.
  (Prevents the "my own crew jumps me" bug class.)
- **Tribute:** at delta ≥ 6, same-faction low ranks may offer small gifts (cash, items, info) —
  the yakuza tribute pattern, player-side.

### 3.4 Morale checks and group behavior

- **First-blood check:** when an Intimidated-or-worse AI (delta ≥ 3) takes its first hit in a
  fight, it rolls morale: 50% (delta 3–5) / 75% (delta 6–9) / 95% (delta 10+) to **break and flee**
  immediately. This is the owner's "they know they're going to lose" beat.
- **Leader-break cascade:** when the highest-rank visible ally of a group flees *or* drops, every
  remaining ally with delta ≥ 3 vs the threat rolls the same morale check at +10%. Groups rout.
- **Rally:** when a higher-rank ally (rank ≥ player's − 2) *enters* the scene, all fleeing/cowering
  allies of that faction clear fear and re-engage — the cavalry arrived. This is also the
  mechanical answer to "ordered to fight" (§3.6).
- **Bodyguard override:** AI flagged as a bodyguard (protecting a superior) ignores fear while
  the principal is in danger. Self-preservation < 25% HP (AI teardown §4c) still applies — a
  bodyguard at death's door flees, because a dead guard protects no one.

### 3.5 Cornered: the desperate fight (the owner's key beat)

When a fearful AI **cannot flee** — no path to a leash/safe node within 30 m, or backed against
geometry — it fights **desperate**, not normal:

- **Wild swings:** attack speed +30%, defense/block −30%, accuracy −20%. It looks and feels like
  panic — because it is.
- **Getting back up:** one free knockdown recovery per fight at 25% HP ("still try and get back
  up"), with a 1.5 s vulnerability window where the player can finish it or let it stand.
- **Survival targeting:** desperate AI targets *escape*, not victory — its movement AI biases
  toward the nearest exit node between attacks. If an exit opens (player moves, ally arrives),
  it takes it and the fight ends.
- **Never hopeless:** desperate AI can still *hurt* the player — wild swings connect. The fantasy
  is "dangerous but doomed," not "free punching bag."

### 3.6 When a grunt fights anyway (fear overrides)

Fear loses to, in priority order:

1. **Direct order from a present superior** — a higher-rank faction member within 20 m and line
   of sight issuing an attack order. The chain of command is the oldest courage technology.
   (If the superior flees or drops → immediate morale re-check at +10%.)
2. **Defending home turf** — on faction-owned ground, effective delta is reduced by 2
   ("home courage"). A rank-8 defending his own corner against a rank-12 plays it as delta 2
   (Wary), not delta 4 (Intimidated).
3. **Cornered** — §3.5. No choice is also a kind of courage.
4. **Protecting a principal** — bodyguard override (§3.4).
5. **Fearless flag** — a per-character personality trait (bosses, fanatics, the mentally
   unwell). Used sparingly; if everyone is fearless, rank means nothing.
6. **Blood debt** — story-flagged vendettas ignore fear entirely (narrative override, set by
   WORLD_STORY_DESIGN faction arcs).

### 3.7 Rank vs the AI teardown systems (integration map)

| AI teardown §4 system | How rank modifies it |
|---|---|
| §4b Aggro (Aware 18 m / Engage 8 m / Leash 30 m, max 3 attackers) | Engage transition gated by morale check when delta ≥ 3. Max-3-attacker cap unchanged — rank doesn't let you get mobbed *harder*. Leash unchanged. |
| §4c Proximity backup (15 m + LoS, trigger = player takes hit) | Radius scales with player rank (universal curve: 10→30 m). Respect extends it +50% (§3.3). Recruit cap follows the universal curve (0→6). |
| §4c Self-preservation (< 25% HP flees) | Unchanged — outranks everything except bodyguard duty, and even that bends at death's door. |
| §4d Provocation ladder | Gains the Cower rung at delta ≥ 3 (§3.2). |
| §4e Ambient barks | Fear/respect bark categories added, keyed to delta bands and player title. |
| Turf meta (SA_TURF_WAR_TEARDOWN) | Home-turf courage (−2 effective delta, §3.6.2). |

### 3.8 Rank gates for story progression (WORLD_STORY_DESIGN hooks)

Recommended gates — the world-story worker should treat these as the default contract:

- **Rank 4** (Tier II): faction membership formalized (patch vote / oath / exam passed). Before
  this, you're an associate — the story treats you as outside.
- **Rank 10** (Tier IV): tournament/contender storylines unlock; turf-claim actions unlock.
  WORLD_STORY_DESIGN's "rep gates" section maps here.
- **Rank 16** (Tier VI): turf *challenge* declaration — the mid-game war arc.
- **Rank 22** (Tier VIII): the city notices. **Narrator milestone trigger** — the purple robe
  appears to mark "you're a power now" (per NARRATOR.md: curated milestones only).
- **Rank 28** (Tier X): endgame faction arcs; rival bosses take the field personally.

### 3.9 Anti-failure rules

- **Civilians never check rank.** The Block ladder is social, not martial — civilians don't cower,
  don't fight, don't care about your 30 ranks. (Owner's rule, preserved.)
- **Rank is per-faction.** Being The One (street 30) means nothing to a police Captain — cross-
  faction delta uses the *relevant* ladder only. Global Street Rep (WORLD_STORY_DESIGN dual-axis)
  adds a small universal intimidation floor (+1 effective delta at max rep), nothing more.
- **No fear-stunlock:** an AI that fails a morale check and flees can't be re-feared into
  fleeing *further* — it just keeps running. Fear resolves, it doesn't loop.
- **Bosses are fear-capped:** named/story bosses never go above Afraid, and never flee at Aware.
  They can Cower (great drama) but they don't run off-screen. Story needs its confrontations.
- **The player is never debuffed by being outranked** — only UI pressure (heartbeat, edge pulse).
  Losing because the game decided you're scared is not a mechanic we're shipping.

---

## OPEN QUESTIONS (owner decisions needed)

1. **One rank per faction, or one ladder the player climbs?** Recommended: per-faction rank
   (you can be a Street Legend *and* a Police Probationer — the comedy writes itself) + global
   Street Rep as the universal floor. Needs owner sign-off.
2. **Demotion yes/no?** Recommended: Tekken-style, from rank 10 up. Below 10 is safe.
3. **Cross-faction recognition:** should a max-rank Syndicate head intimidate street thugs at
   all? Recommended: only via global Street Rep floor (+1), not the full ladder.
4. **The Block ladder in combat:** civilians don't fight — but should a rank-30 Eternal Neighbor
   be able to *stop* a street fight by showing up? (Recommended: yes — "the block intervenes"
   event. Great Urban Reign/GTA texture.)
5. **Wrestler-stable rank vs faction rank:** is a Champion (stable 16) automatically respected by
   street crews? Recommended: stable rank converts to Street Rep at 50% — fame crosses over,
   authority doesn't.

## Sources (Part 1)

- Wikipedia: "Yakuza" (family structure, shikkobu posts, Yamaguchi-gumi 2024 order);
  "Outlaw motorcycle club" (officer structure, prospect pipeline, chapters);
  "Sicilian Mafia" (Buscetta clan hierarchy: boss/underboss/consigliere/decina).
- FBI National Gang Threat Assessment 2009 & National Gang Report 2013 (Latin Kings structure,
  prison shot-caller dynamics, Sureño/Eme hierarchy).
- PoliceMag via pitag.com, "The Structure of Gangs" (Aztec-pyramid model, OG/veterano informal
  authority, two-arm structure).
- Brainscape POST gang flashcards; answers.com street-gang ranks (associate → BG → member →
  shot caller → OG ladder pattern).
- Fandom wikis (Sopranos/Godfather/Mafia): Don → underboss → consigliere → capo → soldier →
  associate chain (summarized, not reproduced).
- Tekken 8 rank structure: 30 ranks / 10 color divisions (dotesports, tekken.fandom.com,
  esports.gg, estnn.com) — structural inspiration for the tier system only; no titles copied.
