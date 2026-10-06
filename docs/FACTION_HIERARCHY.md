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
