# AI Behavior Teardown — Urban Reign, GTA: San Andreas, Yakuza
**For AshLane** (street-first urban brawler — "Urban Reign 2, 2026")
**Research date:** 2026-10-06 · **Focus:** moment-to-moment AI behavior in open arenas and living cities.
**NOT covered here:** the turf-war meta-layer (see `docs/teardowns/SA_TURF_WAR_TEARDOWN.md`), Def Jam's crowd-as-combatant (`DEF_JAM_TEARDOWN.md` §2), Sleeping Dogs' archetype RPS (`SLEEPING_DOGS_TEARDOWN.md` §1).

**Sources:** Eurogamer Urban Reign review, GameFAQs/Neoseeker Urban Reign FAQs (KDKM0506, KimMoonSoo guides), stinger.actieforum.com Urban Reign mechanics guide, GameSpot GTA SA "Physics, AI, Modding" Q&A (Rockstar's Gordon Yeoman + Obbe Vermeij interviews), GTA Wiki (Threatening, Glitches/Ped Behavior), HowLongToBeat Urban Reign reviews, ResetEra Yakuza combat thread, TheGamer Yakuza enemies roundup.

> **License rule:** this is behavioral research. Descriptions only — no code copied from proprietary games. AshLane implements original code inspired by observed patterns.

---

## 1. Urban Reign — Arena AI (answers owner's question 1)

Urban Reign's missions play in large multi-area arenas (junkyards, parking structures, back alleys). The owner described the observed behavior exactly right: enemies hold positions far from the player and don't all rush at once. Here's what's documented:

### 1a. Engagement model: lurkers + rushers, not a zerg
- **Off-screen lurking is real.** Eurogamer's review documents the behavior precisely: enemies "wait off-screen until you're reaching for a health pick-up on the ground and then rush you at cheetah speed while it's technically impossible to react." That's a lurker → rusher state machine: hold position outside the camera frustum, trigger a sprint when the player enters a vulnerable state (bent over a pickup) or crosses a proximity threshold.
- **Proximity-gated engagement.** Enemies hold their spawn positions across the arena and engage as the player approaches their zone. They do NOT all converge at mission start. The practical effect is a rolling 1v2 / 2v2 / 3v2 cadence across a big space rather than a 6v1 dogpile.
- **No artificial "one at a time" etiquette.** Unlike Arkham/Sleeping Dogs crowd etiquette, UR enemies gang up: the same review notes they "gang up on you (HA!) and fight perfect fights," juggling the player between attackers for seconds at a time. The difficulty control is *spatial* (who's near you), not *politeness-based* (attack cooldowns). This is the key difference from Sleeping Dogs' criticized one-at-a-time crowd.
- **Symmetric AI.** Per a HowLongToBeat reviewer: on higher difficulties "the enemies can do all the things you can, they have the same amount of health as you do and perform the same moves as you can." No dumbed-down moveset — the AI plays the same game the player does, which is why the dodge/reversal system exists (you need it).

### 1b. What non-engaged enemies do
Documented non-combat behaviors for enemies outside engagement range:
- **Taunt.** Enemies taunt from range (the L2 taunt exists for the player too — see 1d). Taunting is the "I'm aware of you but not committed" state.
- **Weapon seeking.** Enemies pick up weapons from the environment (the arena is seeded with 30 weapon types). A non-engaged enemy arming itself is a documented threat escalation.
- **Repositioning/circling.** Enemies move to flank — the dodge system exists precisely because attacks come from off-camera angles.
- **Objective behavior.** In weapon-battle and destruction modes, enemies pursue objectives (hold the weapon, smash the totem) rather than purely hunting the player — a reminder that AI needs goals beyond "kill player."

### 1c. Partner AI: commands, not babysitting
Urban Reign's AI partner (story missions) is command-driven via R2, documented across the GameFAQs/Neoseeker guides:
| Command | Effect |
|---|---|
| R2 (tap) | Call partner to your side for a **double-team attack** (if available) |
| R2 + Triangle | **Help** — partner targets the opponents *you are currently facing* |
| R2 + Circle | **Split up** — partner leaves your side to **draw aggro away** from you |
| R2 + Square | **Pass/receive weapon** (can be intercepted by enemies if line of sight isn't clear) |
| R2 + X | **Switch characters** — you take direct control of the partner |

Key design facts:
- **Aggro is a resource the player can direct.** "Split up" explicitly moves enemy attention off the player onto the partner. "Help" points the partner at the player's current target. This is a two-way attention economy.
- **Partner down ≠ mission fail.** Per the HowLongToBeat review: "for the most part if your ally lose all his HP, it's not a game over." The partner is an assist feature, not an escort objective. (Exception: Brad Hawk going down in story missions fails the mission — the *player character* is protected, the partner is expendable.)
- **Double-team attacks trigger on proximity + grapple.** Grab an enemy near your partner (or hold them still and let the partner walk up) and a team attack fires — direction-dependent (front/back grapple positions produce different team moves).

### 1d. Taunt as an aggro tool
The stinger.actieforum.com mechanics guide documents a subtle aggro mechanic: **pressing L2 to taunt while enemies are stunned causes them to stagger toward you** — a deliberate lure. Practical use given: lure 2 stunned enemies into range for a 1-on-2 throw. So UR's aggro model includes *player-initiated pull* — the player can choose to collapse the distance.

---

## 2. GTA: San Andreas — Faction Backup & Ped AI (answers owner's questions 2 and 3)

### 2a. Gang recruitment: the numbers (sourced)
| Respect level | Max recruits |
|---|---|
| 1% | 2 |
| 10% | 3 |
| 20% | 4 |
| 40% | 5 |
| 60% | 6 |
| 80%+ | 7 |

- **Recruit:** aim at a same-gang member, press G (PC) / D-pad Up (console). Only works on your own gang (Grove Street, green) — rival gang members can't be recruited.
- **Commands:** G again = follow, H = hold position (ambushes), hold Down = disband. Recruits auto-enter vehicles with you (cars hold 4, coaches 7, ambulances 6) and participate in drive-bys.
- **Combat behavior:** "homies will shoot at rival gang members and cops **in response to an attack on you**" (Pro Game Guides). They are reactive defenders, not autonomous hunters — the trigger is *you being attacked*, and they pick up your fight.
- **Weapon scaling:** recruited gang members carry better weapons as CJ completes more tags.
- **Friendly fire is real:** killing your own recruits costs respect (−2% reported).

### 2b. How recruited AI picks targets (Rockstar dev interview — GameSpot Q&A)
From Rockstar's Gordon Yeoman, this is the actual architecture and it's directly implementable:
- Every ped responds to **~40 world events**; a personality is formed by choosing responses to **~20 relevant events**; each event's response is drawn from a **weighted distribution of up to 6 actions**.
- **6 personality types** loaded per model: cop, gang member, fireman, weak, normal, tough.
- Recruited gang members "respond to events in much the same way as regular pedestrians, **except that their personalities tell them to divert some events to their group**. The group then queries its personality to compute a response for each group member."
- **"Pedestrians prioritize their event responses that require individual action above the actions dictated to them by the group."** (Self-preservation outranks orders — a fleeing recruit won't hold formation.)
- **"Targets are picked by looking for nearby pedestrians that have been flagged as enemies."** Target acquisition = proximity scan over the enemy-flagged set. No complex threat assessment.

### 2c. Threatening: the provocation interface (GTA Wiki)
- **Point a gun at an NPC = threaten.** Most peds raise hands / freeze. But **threatening cops, gang members, or military makes them retaliate** — personality-gated response to the same stimulus.
- In SA, **threatening a gang member recruits him**, and threatening is also "used to command recruited gang members to target a selected enemy." One input (aim), two meanings depending on relationship state.
- Dialogue responses can backfire: answering a ped positively/negatively can *start* a fight, especially with drug dealers and gang members (CJ tells them to leave the territory).

### 2d. Neutral → hostile transitions (observed)
- **Provoked peds retaliate with melee.** Punch a ped and a "tough"-personality ped fights back; weak/normal peds flee. (GTA Wiki glitch documentation confirms the provoke → retaliate → can-be-redirected-at-other-peds chain, and that unarmed peds who get shot "immediately flee no matter what.")
- **Bumping/aiming escalates.** Repeated collisions and weapon-aiming push peds up the reaction ladder: ignore → comment → threaten-pose → flee → fight (personality decides the top rung).
- **Riot state (End of the Line mission):** city-wide flag flips peds to aggressive — "aggressive pedestrians will attack the player" plus ambient crimes (shootings, carjackings, looting). This is the *faction-war heat* pattern: a global hostility scalar, not per-ped logic.

### 2e. Ambient ped architecture (Vermeij interview)
- **Wander = head to nearest ped node, then wander.** Obbe Vermeij (SA technical lead) on the "suicidal pedestrians": scripted peds (e.g. the photographer) run their little program, then "head for the nearest ped node and start wandering." The city is a node graph; ambient life is node-to-node drift.
- **300+ ped models, ~60,000 dialogue lines** (GameSpot). Peds comment on CJ's clothes, haircut, tattoos, fitness — appearance-reactive ambient dialogue.
- **Event reactions:** peds react to wrecks, reckless drivers, burning vehicles (flee/panic), gunfire. The weighted event-response table (§2b) is the whole system.

---

## 3. Yakuza — Street Encounters & Ambient City (answers owner's question 4)

### 3a. Thug encounters: zone-gated, not purely random
- **Random street battles** are the series' ambient combat: thugs accost Kiryu/Majima while walking Kamurocho/Sotenbori. A ResetEra thread notes the in-fiction justification is thin ("gang bosses task wannabe Yakuza with getting into a fight with Kiryu to test their metal — basically an initiation thing"), but the *mechanical* pattern is what matters: **certain streets/zones have encounter tables; entering them rolls encounters; some items reduce/negate the roll.**
- **Drunkards** (TheGamer): weak nuisance enemies placed near nightlife spots — low threat, high frequency, there to make the walk to karaoke feel alive.
- **Mr. Shakedown** (Yakuza 0): a roaming miniboss who wanders the map; losing to him costs *all* your money; you can also catch him napping and rob him back. The pattern: **a named ambient threat with a persistent world position**, not a spawned encounter.
- **Majima Everywhere** (Kiwami): the boss *himself* ambushes the player across the city, triggered by story progress + exploration. The pattern: **a recurring rival with scripted ambush logic layered over the ambient system.**

### 3b. Neutrals stay neutral
- **Shopkeepers, substory NPCs, and service peds never become hostile.** Hostility is a property of *thug-type* peds in *encounter zones*. The neutral population (shopkeepers, passersby) runs the ambient loop (walk, idle, react to fights by fleeing) and is never a combatant. This is the cleanest answer to the owner's neutral-AI question: **don't make every ped potentially hostile — type the population, and only thug types can flip.**
- During story heat (the Medium.com piece describes whole-city hostility after angering the wrong people: "random street punks attack you, doormen refuse entry"), the *encounter tables* change, not individual ped personalities.

### 3c. Kamurocho's ambient loop
Dense single-district design: peds walk node paths, enter/exit shops, gather in groups outside clubs, flee from active fights, comment on the player. The city feels alive because of **density + typed behavior**, not AI sophistication.

---

## 4. AshLane AI Spec — implementable (for the city-life worker)

Original design synthesizing the above. Nothing here is copied code — behaviors described, implementation is ours.

### 4a. Population typing (the single most important decision)
Type every AI character at spawn. Type determines the entire behavior tree:

| Type | Examples | Can fight? | Notes |
|---|---|---|---|
| **Civilian** | shoppers, workers, passersby | Never initiates; flees | Yakuza rule: neutrals stay neutral |
| **Thug** | unaffiliated street toughs | If provoked OR in encounter zone | GTA "tough" personality |
| **Faction** | gang/corpo/police/biker members | Yes — per faction rules below | GTA gang-member personality |
| **Crew** | player-recruited allies | Fights for player | GTA SA homie rules |
| **Rival** | named recurring threats | Ambush logic | Majima/Shakedown pattern |

**Owner's rule, enforced:** civilians NEVER become hostile. Only thugs and faction members flip. This kills the "everyone attacks me for no reason" failure mode.

### 4b. Aggro model (Urban Reign pattern, AshLane numbers)
Per-AI-character state machine: **Idle → Aware → Engaged → (Leashed) → Idle**.

- **Aware radius: 18 m.** AI notices the player (turns head, taunt bark, stops wandering). No movement toward player yet. Multiple AI can be Aware simultaneously — this is the "they're watching you" beat.
- **Engage radius: 8 m** (or player attacks first, or player enters their turf hotspot). Engaged AI closes distance and fights.
- **Leash: 30 m from spawn anchor.** If the player retreats past leash range, AI breaks off, returns to anchor, de-aggros to Idle. Prevents cross-map chases (the Vermeij ped-node logic: return to nearest node, resume wander).
- **Max simultaneous attackers: 3.** Hard cap — the 4th+ engaged AI holds at 4–6 m in a **circler** role (taunt, feint, pick up weapons, wait for an opening). This is UR's spatial difficulty control: the threat is real (circlers DO engage when an attacker drops), but the player is never 6v1'd in one frame.
- **Vulnerability rush (UR's signature):** if the player enters a vulnerable state (picking up an item, executing a long finisher, knocked down) while a lurker/circler is within 12 m, that AI gets a one-time **rush** — sprint directly at the player. This is the Eurogamer-documented behavior, and it's what makes AshLane's arenas feel predatory instead of polite.
- **Player taunt-pull:** taunting near *stunned* enemies (UR L2 mechanic) drags them toward the player — a deliberate player tool for collapsing distance or setting up multi-throws. Implement: taunt emits a 10 m pulse; stunned AI in radius staggers 3 m toward the player.

*Numbers above are proposed starting values, not sourced — tune in playtest. The state machine and roles are sourced patterns.*

### 4c. Ally / backup rules (GTA SA pattern, AshLane adaptation)
- **Proximity backup (no recruitment needed):** if the player is attacked while a **same-faction** AI is within **15 m and has line of sight**, that AI joins the fight on the player's side. Trigger = player takes a hit (GTA SA's "in response to an attack on you"), not player entering combat voluntarily. Target selection = nearest enemy-flagged character to the player (Yeoman: "looking for nearby pedestrians that have been flagged as enemies").
- **Recruitment (GTA SA homie system, adapted):** player can recruit up to **N faction members** where N scales with street rep (start: 2 at low rep, up to 6 at max — our curve, simpler than SA's 7-tier table). Commands: **follow / hold / disband**. Recruits auto-follow through district transitions; hold-position enables ambush setups.
- **Self-preservation outranks orders** (Yeoman, verbatim pattern): a recruit whose health drops below 25% breaks hold/follow and flees to a safe node. They rejoin when healed or when the fight ends.
- **Partner commands (UR pattern):** for the designated story partner: call-to-side (double-team setup), attack-my-target (partner engages whatever the player is locked onto), split-up (partner draws aggro — engaged enemies retarget to partner), weapon pass. **Partner down ≠ mission fail** (UR rule) except for designated protect-target missions.
- **Faction backup is rep-gated:** low rep with a faction = their members won't back you up (they're neutral); high rep = proximity backup active. Rival faction members in their turf = encounter-zone hostility (Yakuza pattern).

### 4d. Neutral → hostile transitions (thugs and faction only)
Provocation ladder per AI character (GTA weighted-response pattern, simplified to a deterministic ladder for debuggability):
1. **Ignore** (first bump, distant gunfire)
2. **React** (turn head, bark a line — uses the ambient dialogue system)
3. **Warn** (threaten pose, "walk away" gesture — 3 s window for player to back off)
4. **Flee** (civilians and weak thugs exit here — run to nearest safe node)
5. **Fight** (tough thugs, faction members — engage per §4b)

Escalators: player punch (+2 rungs), player aiming a weapon at them (+1, and faction/cops skip straight to Fight — GTA Threatening rule), player killing someone in their sight (+2), bumping repeatedly (+1 per bump within 10 s). De-escalator: player leaves 25 m radius for 10 s → drop to Idle (leash).

### 4e. Ambient behavior loops (GTA + Yakuza patterns)
- **Wander:** node-graph drift (Vermeij). Each district has a ped-node graph; ambient AI picks a random reachable node, walks, idles 2–8 s (idle anims: phone check, smoke, lean), repeats. Groups of 2–4 share a destination (hangout behavior outside clubs/stores).
- **District affinity:** faction members spawn near their faction's hangouts/turf; thugs cluster near bars/alleys; civilians everywhere. Spawn tables per district, not global randomness (owner: "in a way that makes sense, not too random").
- **Fight flight:** when a fight starts within 12 m, civilians flee to 20 m+ and watch; thugs may gather to watch (audience behavior — Def Jam crowd energy without the combatant role).
- **Roaming rivals:** 1–2 named rivals per district with persistent world positions (Shakedown pattern) — they walk a patrol route and can be fought, avoided, or caught off-guard.
- **Appearance-reactive barks:** ambient dialogue keyed to player outfit/faction colors/rep (GTA SA's 60k-line system, scoped down: ~5 bark categories × faction/heat states).

### 4f. Anti-failure rules (learned from the teardowns)
1. **Never 6v1 in one frame** — 3-attacker cap with circler roles (§4b).
2. **Civilians never flip** — typed population (§4a).
3. **Leashes everywhere** — no cross-map chases (§4b).
4. **Partner down ≠ fail** unless it's a protect mission (§4c).
5. **No duplicate-attire clustering** — spawn tables enforce one instance per character per district (owner's standing rule from the city-life brief).
6. **Self-preservation beats orders** — fleeing allies don't hold formation (§4c).

---

## 5. Source index
- Urban Reign partner commands & taunt-lure: GameFAQs guides (KDKM0506, KimMoonSoo), Neoseeker walkthrough, stinger.actieforum.com mechanics guide
- UR enemy behavior (off-screen lurk → rush, gang-ups, symmetric AI): Eurogamer review, HowLongToBeat reviews
- GTA SA ped AI architecture (40 events, weighted responses, 6 personalities, group target selection): GameSpot "Physics, AI, Modding" Q&A with Gordon Yeoman
- GTA SA recruitment numbers & commands: Pro Game Guides, India Today Gaming, GameFAQs Q&A
- GTA SA threatening/provocation: GTA Wiki (Threatening; Glitches/Ped Behavior)
- GTA SA wander/node behavior: Obbe Vermeij interview (via GamesRadar/cloudfront repost)
- Yakuza encounters (zones, drunkards, Mr. Shakedown, Majima Everywhere): ResetEra, TheGamer, Kiwami guides
- Related: `SA_TURF_WAR_TEARDOWN.md` (turf meta), `DEF_JAM_TEARDOWN.md` (crowd-as-combatant), `SLEEPING_DOGS_TEARDOWN.md` (archetype RPS — do NOT copy its one-at-a-time etiquette)
