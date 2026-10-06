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
