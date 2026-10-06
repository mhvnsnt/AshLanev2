# Urban Reign Mechanics Gap Analysis — the Master Build List

**Date:** 2026-10-06
**Purpose:** Deep mechanical teardown of Urban Reign (Namco, PS2, 2005) beyond movesets, a gap analysis against AshLane's actual combat code (`src/game3d/sim.ts`), and concrete open-source fills for every gap — prioritized by gameplay impact.
**Companion docs (referenced, not duplicated):**
- `MOVESET_LIBRARY_URBAN_REIGN.md` — per-character kits and styles
- `COMBAT_TEARDOWN.md` §7–8 — systems summary + AshLane gap checklist
- `YAKUZA_URBANREIGN_DEFJAM_SYSTEMS.md` — cross-game synthesis (Heat/Momentum, crowd, shops)
- `docs/teardowns/AI_BEHAVIOR_TEARDOWN.md` — enemy AI (lurker/rusher, engagement rules)
- `docs/WORLD_STORY_DESIGN.md` — mission structure → open world
- `docs/COMBAT_SUBSTATES.md` — sub-state machine layer (parallel worker)
- `docs/URBAN_REIGN_ANALYSIS.md` — mission archetypes (GameFAQs 1–45)

**Sources for this doc:** GameSpot review + multiplayer hands-on, GameSpy review, Eurogamer review, Tekken Wiki Urban Reign page, Wikipedia, HowLongToBeat player review, DigitPress forum control/map breakdown, GameFAQs community knowledge. Mechanics described in our own words as design principles for original implementation. No copyrighted assets, code, or substantial text reproduced.

---

## PART 1 — Deep Urban Reign Mechanics Teardown

### 1.1 Controls (full map, from community documentation)

| Input | Action |
|---|---|
| Strike button | Strike / combo |
| Grapple button | Grapple; also cancels |
| Dash button | Run (press again to stop); confirms in menus |
| Evade button | Timed dodge / deflect / defense (character-specific behavior) |
| Strike + Grapple | Special Art (costs meter) |
| Taunt (L2) | Taunt — a *risk*: leaves you open, per GameSpy |
| Pickup/discard (L1) | Pick up or drop weapons/items |
| Partner command (R2) | Issue AI partner command |
| Lock target (R1) | Lock-on; while held, right analog switches target |
| Right analog | Move camera; switch target while R1 held |
| Camera reset (R3) | Snap camera behind player |
| Camera zoom (Select) | Zoom in/out |
| Stick/D-pad | Move; select hit region (up/head, neutral/mid, down/legs); menu nav |

**Design lesson:** every button does exactly one combat job, and *modifiers are directional, not chorded*. Region targeting lives on the stick you already move with — zero extra buttons. AshLane's Tekken inputs are deeper; the lesson is *economy*, not simplicity.

### 1.2 Locomotion

- **Walk** (stick), **run** (dash button, toggle), **lunging attacks** out of run (running strikes, running grapples — e.g. Brad's running powerbomb).
- **Wall-run / wall-vault:** agile characters sprint up walls and flip off into aerial attacks; walls are also an *evasion* tool (GameSpy: run up walls to evade oncoming opponents).
- **Dash** for repositioning in multi-enemy fights; the arena is fully 3D with free movement.

### 1.3 Striking & combo grammar

- Deliberately simple entry: most combos open with **three strike presses, the third juggles**. Branch after: air grapple, special art, continue the string, or disengage (grab weapon, reposition).
- **Animations vary by context:** per Eurogamer, move animations change based on analog-stick direction *and how many enemies are nearby* — the game picks from a pool rather than playing one canned string. This is why fights "look like a choreographed martial arts movie."
- **Hit reactions are physical:** collision detection praised as "excellent" — hits feel solid despite a ropey-looking engine. Lesson: *collision quality > visual fidelity* for hit feel.

### 1.4 Regional damage (head / upper / lower)

- Stick direction selects target region on strikes AND grapples: up-flavors → head/chest, neutral → mid/abdomen, down-flavors → legs.
- Sustained damage to one region causes **"devastating damage"** — region-specific breakdown states (limb damage → crumple/knockdown). The targeted enemy's stamina bar is visible so the player can *see* the region wearing down.
- This is Tekken's high/mid/low applied to a brawler, and it's the game's signature tactical layer.

### 1.5 Defense — the deepest layer

- **No block button.** Defense is entirely active:
  - **3-level defend:** the evade button behaves as block/parry/escape matched to attack level — high attacks defended with up-flavor evade, etc. (community FAQ). Character-specific: different fighters parry, deflect, or slip.
  - **Timed dodge:** tap evade close to the incoming attack to sidestep it cleanly. **Dodge chains:** consecutive clean dodges escalate — after a few in a row, the character *automatically grabs the attacker and shoves them aside*, granting initiative. Defense that *rewards* streaks.
  - **Reversal:** press up or down + evade at the right moment → reverse the incoming strike into a counter. Even surrounded/cornered, perfect timing beats everything (Wikipedia: "it is possible to dodge all oncoming normal attacks").
  - **Grapple reversal:** when caught in a grapple, guess which *region* the grapple targets (head/upper/lower) and input the matching reversal to counter out of it.
  - **Meter economy of defense:** successfully defending a *series* builds your special meter and *drains the opponent's*. Defense is a resource engine, not a stall.
  - **SUPER DEFLECT** (Eurogamer's term): the high-skill deflect → immediate counter-strike.

### 1.6 Special Arts meter

- **Build sources:** landing strikes, *taking damage*, successfully dodging. (Tekken Wiki: meter "increases when characters take damage, successfully dodge attacks, or strike their opponents.")
- **Cost:** each Special Art costs meter bars; meter must be at threshold to attempt.
- **Properties:** cannot be countered, reversed, or dodged *except by another special*; can be buffered; **invulnerable frames** during startup (community FAQ).
- **Special-vs-special:** firing your own special cancels the opponent's — a resource-war minigame.
- **Utility uses:** break out of combos, break out of dizziness/stagger states (GameSpot: "special arts attacks that you can use to hit multiple enemies or to break out of combos and dizziness"). Stagger is *never* a death sentence — there's always a metered answer.
- **Variety:** fast barrage punches, power super punch, "Matrix-style twisty air-kick things" — multi-enemy and single-target variants.

### 1.7 Grapple system (the richest part)

- **Low / high grapples** (region-selected), **air grapples** (catch juggled opponents mid-air, character-specific animations), **counters and recounters** (grapple-counter chains), **restrain** (hold the opponent in place and beat on them — GameSpot).
- **Ground grapples:** straddle a downed enemy and punch them in the face; piledrivers; twisty throws (Eurogamer: "clever twisty-body throws").
- **Team-up tandem grapples:** you + AI partner (or co-op player) grab the same enemy simultaneously → tandem attack. Works in co-op.
- **Running grapples:** dash into grapple range for running throws.
- Every character has unique animations per grapple type.

### 1.8 Ground game

- Downed enemies can be **pounced on** (dive onto them), **punched in the face** while straddled, or simply **kicked** while down.
- No complex okizeme layer like Tekken — the ground game is *opportunistic*, not systematic. Fast and brutal, matching the game's pace.

### 1.9 Weapons

- **~30 weapons** (community cheat-code list verifies: 2x4, copper pipe, Chinese sword/saber, Lin's saber, barbwire bat, steel/wood bat, spiked club, sledgehammer, 4x4, wood swords S/L, katana, Shinkai's katana, sai, butterfly sword/knife, knives, bottle, axe, wrenches S/L, crowbar, galvanized pipe, shovel).
- **Pickup/discard** on L1; **throw to stun**; **durability** (weapons wear — per prior research); weapons extend combos without dominating.
- **Disarm as objective:** missions built around knocking a weapon out of an enemy's hand and taking it (M28 crowbar).
- **Character-weapon identity:** Shinkai's katana is "the deadliest weapon in the game *in its master's hands*" — weapon scaling by wielder.

### 1.10 Partner system

- **R2 commands:** come to aid, perform double-team, hand over weapon (GameSpy).
- **Partners fight autonomously** and respond to commands; **partner KO ≠ mission fail** (HowLongToBeat) — the no-babysitting rule.
- **Double-team attacks:** tag-wrestling style — two-man suplexes, "you hold him and I'll break his ribs," launch-into-air for partner to catch and slam.
- Partners introduced at mission 31 (forced first, then optional/pickable).

### 1.11 Enemy design & AI

- **Symmetric combat:** enemies have the *same health* and *same moves* as the player (HowLongToBeat) — difficulty comes from numbers and AI ferocity, not stat cheats. (Eurogamer notes the AI "gangs up," juggles, rushes pickups — ferocious but fair.)
- **AI variety:** deflect-heavy (Jose, Miguel), grapplers (Jake), special-art users (Chris) — archetypes, not clones.
- **Lurker → rusher:** enemies wait off-screen and rush when the player is vulnerable (reaching for pickups) — see `AI_BEHAVIOR_TEARDOWN.md` §1.
- **Boss patterns:** Wendel (jail warden, 3000 HP, stun rod at half HP), Fatima (dual katanas, 4000 HP, sweep-into-slice), Ignacy (claws, 5000 HP, 7-hit Corkscrew, backflip evade, blocks mid/high 80%), Eugene (knives, 6300 HP, explosive jumping knee) — bosses *change behavior at HP thresholds* and *punish specific approaches*.

### 1.12 Progression

- **1–3 stat points per mission**, spent on **9 regional body stats** (Eurogamer: "Can you upgrade stats between levels? Hell yeah"). Upgrades are *regional* — tied to the head/body/legs damage model.
- **Move unlocks over time:** "advanced moves that unlock after a few levels" (Eurogamer) — the kit *grows* as you play; the mission mode is a tutorial in disguise.
- **Roster unlocks:** 60 fighters unlock through story; Free Mode lets you replay missions with any unlocked character.

### 1.13 Missions & modes

- **100 missions** (see `URBAN_REIGN_ANALYSIS.md` for the 8 archetypes; `WORLD_STORY_DESIGN.md` for the open-world mapping). Fast fail/retry — dying restarts *the fight*, not a level.
- **Modes:** NEW GAME / CONTINUE / FREE (replay with any unlocked fighter) / MULTIPLAYER (up to 4 via multitap; co-op mission code exists but camera follows P1) / EXTRAS (Tutorial, Practice with unlimited health/time, Fighter Files, Credits).
- **Options:** 5 difficulty levels, camera control + target marker settings, controller configs, display, sound (music/voice/SE separately), autosave.

### 1.14 HUD/UI

- **Per-target stamina bar** visible when targeting — you *see* the region wearing down.
- **Special arts gauge** (bars) — always visible, the resource both players manage.
- Target marker customization (options menu).

### 1.15 Camera

- **R1 lock-on**, right-analog target switching while R1 held, R3 snap-behind, Select zoom. Lock-on "works well"; switching "can spazz out at times" — the lesson being that target-switching is *the* camera risk in brawlers.
- 4-player: panning camera keeps everyone on screen (gets distant — readability tradeoff).

### 1.16 Sound design

- **Rock/metal soundtrack** matched to street-brawling; **impact-heavy SFX** — GameSpy: sound effects "do a great job of making the player feel like he's causing some real damage." Sound is a *feel* pillar, not background.
- Separate music/voice/SE volume — the mix is player-tunable.

### 1.17 Taunt

- Dedicated taunt button (L2) — but it's a **risk/reward tool**: GameSpy notes it mostly "leaves you open to a brutal attack." Taunts are *bait*, not free meter. (Contrast Def Jam where taunts build momentum — UR's taunt is psychological.)

### 1.18 Multiplayer

- Up to **4 players** (multitap), battle modes; **co-op story** via code (camera follows P1 — a known limitation). Tandem grapples work human+human.

---

## PART 2 — Gap Analysis vs AshLane (`src/game3d/sim.ts`, verified 2026-10-06)

Status key: **HAVE** (in code, working) · **PARTIAL** (exists but incomplete) · **MISSING** (not in code) · **IN-PROGRESS** (a worker is on it — don't re-spec) · **DONE** (landed this week).

### Defense
| UR mechanic | AshLane status | Notes |
|---|---|---|
| Timed evade (no block button) | PARTIAL | `dodgeChain` timed evade exists (sim.ts:1106-1182); chained clean evades slip behind attacker. AshLane also has guard/block — UR's evade is the *option* layer |
| Dodge-chain → auto-grab push-aside + initiative | MISSING | UR escalates consecutive dodges into an automatic grab-and-shove |
| Reversal (up/down+evade at the right moment) | IN-PROGRESS | Direction-pick reversal worker active |
| 3-level defend (high/mid/low matched) | PARTIAL | `guard` + `lowGuard` exist; not wired to attack-level matching |
| Grapple reversal (guess the region) | MISSING | No region-guess counter on grapples |
| Defense builds meter / drains opponent's | MISSING | Meter builds on hits only (sim.ts:1214,1433,1951,1986) — not on successful defense |
| SUPER DEFLECT → counter | PARTIAL | Just-frame parry via `federated/counters.ts` exists; no deflect-chain escalation |
| Break out of stagger/combo via special | MISSING | No metered breakout mechanic |

### Meter & specials
| UR mechanic | AshLane status | Notes |
|---|---|---|
| Special Arts meter | HAVE | `meter` 0-100, `SPEC.meterCost` (sim.ts:3347) |
| Meter builds on: strikes, taking damage, dodging | PARTIAL | Builds on strikes dealt (1433, 1951, 1986, 2958, 3106) — taking-damage and dodge build MISSING |
| Specials uncounterable except by another special | MISSING | No special-vs-special cancel |
| Special invulnerable frames | MISSING | No i-frames on specials |
| Specials buffered | PARTIAL | Input buffering status unverified |

### Offense
| UR mechanic | AshLane status | Notes |
|---|---|---|
| Variable hit-stop (jabs ~5f, big counters 12f) | DONE | Commit 2471e45 |
| Body-zone targeting (head/body/legs via stick) | DONE | Commit 9e02999 |
| Region breakdown states (dizzy/winded/crumple) | PARTIAL | Zones exist; region-specific *states* need wiring |
| 3-hit-into-juggle grammar | PARTIAL | `launch` state exists; formal juggle rules (gravity, scaling, one-extension) unverified |
| Contextual animations (stick + enemy count) | MISSING | Animation picks don't vary by surroundings |
| Running attacks (running strikes/grapples) | PARTIAL | `dash` state exists; running-grapple variants unverified |

### Grapples
| UR mechanic | AshLane status | Notes |
|---|---|---|
| Low vs high grapple selection | PARTIAL | `grapple-system.ts` has ground context; region selection unverified |
| Air grapples (catch juggled opponents) | MISSING | Paired playback exists for ground/standing; no air-grapple path |
| Grapple counters / recounters | MISSING | No counter-grapple chains |
| Restrain (hold + beat on) | MISSING | |
| Ground grapples (straddle, piledriver) | PARTIAL | Ground context exists in grapple-system (line 83, 158); straddle/piledriver variants unverified |
| Tandem team-up grapples (2v1) | MISSING | Lieutenants system exists; no tandem-grapple mechanic |
| Running grapples | MISSING | |

### Ground game
| UR mechanic | AshLane status | Notes |
|---|---|---|
| Pounce on downed enemy | MISSING | `down` state exists; no pounce move |
| Kicks on downed enemy | PARTIAL | `stomp` exists in hitGrunts (low tag); needs verification as a real move |
| Straddle + face punches | MISSING | |

### Wall / environment
| UR mechanic | AshLane status | Notes |
|---|---|---|
| Wall slams | IN-PROGRESS | `wallSlam()` exists (sim.ts:1968); worker extending |
| Wall-run / wall-vault attacks | MISSING | No wall-run |
| Environmental bonus damage (cars, shelves, railings) | PARTIAL | Props + hitProps exist; wall/prop *bonus* damage unverified |
| Cheap shot from behind (telegraphed) | IN-PROGRESS | Worker active |

### Weapons
| UR mechanic | AshLane status | Notes |
|---|---|---|
| Weapon pickup / discard | PARTIAL | Pickup prompt status unclear — verify |
| Weapon durability | MISSING | No durability meter |
| Throw weapon to stun | MISSING | |
| Disarm (knock out of hand, steal) | MISSING | No disarm mechanic |
| Wielder-scaled weapons | MISSING | |
| 30-weapon variety | PARTIAL | Quaternius medieval weapons wired (prior research); street weapons (bats, pipes, bottles) need audit |

### Partners
| UR mechanic | AshLane status | Notes |
|---|---|---|
| AI partner fights autonomously | PARTIAL | Lieutenants exist; autonomy depth unverified |
| Partner commands (help / double-team / give weapon) | MISSING | No command menu |
| Partner KO ≠ mission fail | PARTIAL | Verify mission-fail rules in campaign.ts |
| Double-team tandem attacks | MISSING | (same as tandem grapples above) |

### Enemies / AI
| UR mechanic | AshLane status | Notes |
|---|---|---|
| Symmetric health/moves (fair, not stat-cheats) | PARTIAL | Verify grunt scaling |
| AI archetypes (deflectors, grapplers, special-users) | PARTIAL | `opponent-brain.ts` exists; archetype variety unverified |
| Lurker → rusher | HAVE | `AI_BEHAVIOR_TEARDOWN.md` §1 specced; verify wired |
| Bosses change behavior at HP thresholds | MISSING | No phase-change bosses |
| Bosses punish specific approaches | MISSING | |

### Progression
| UR mechanic | AshLane status | Notes |
|---|---|---|
| 1–3 stat points per mission → 9 regional stats | MISSING | No post-mission stat spend; char-gen stats exist but static |
| Move unlocks over missions | MISSING | Kit doesn't grow |
| Roster unlocks through story | PARTIAL | Roster exists; unlock gating unverified |
| Free Mode (replay with any fighter) | PARTIAL | Exhibition exists; story-mission replay unverified |

### Modes / HUD / camera / sound
| UR mechanic | AshLane status | Notes |
|---|---|---|
| Tutorial / Practice (unlimited HP) | PARTIAL | Practice mode exists per playtest; tutorial unverified |
| Fighter Files (profiles) | MISSING | |
| Per-target stamina bar | MISSING | HUD shows own HP; targeted enemy region wear not shown |
| Special gauge always visible | HAVE | `meter` in HUD (sim.ts:3961) |
| R1 lock-on + stick target-switch | HAVE | Per prior research |
| Camera reset / zoom | PARTIAL | Verify |
| Rock/metal soundtrack + impact SFX | PARTIAL | `music.ts`, `combat-sfx.ts` exist; direction/audit needed |
| Separate music/voice/SE volume | MISSING | Verify audio settings |
| Taunt (risk/reward) | MISSING | No taunt mechanic at all |
| 4-player multiplayer | PARTIAL | `nakama-client.ts` exists; 4-player brawl unverified |
| 5 difficulty levels | MISSING | Verify difficulty settings |

---

## PART 3 — Open-Source Fills (concrete, licensed, wire-in path)

**Honest framing:** UR's combat mechanics are *design patterns*, not library code — the right "fill" for most rows is implementing the pattern in `sim.ts`, informed by the teardown. The open-source pulls that genuinely accelerate this work are: animation clips, state-machine frameworks, audio, and test harnesses. Every item below was chosen for a specific gap row.

### P1 — Combat-critical (implement now)

**G1. Dodge-chain escalation → auto-grab push-aside**
- *Fill:* design port into `sim.ts` dodgeChain (already tracked at :1127-1182). No library needed — ~30 lines.
- *Test asset:* none needed.

**G2. Grapple reversal guessing game (region match)**
- *Fill:* design port into `grapple-system.ts` — on grapple connect, open a ~300ms window where defender's region input (up/neutral/down) vs attacker's region decides reversal.
- *Animation:* needs reversal clips per region — CC0 mocap (see clip sources below).

**G3. Meter economy: defense builds, specials have i-frames, special-vs-special cancel**
- *Fill:* design port — meter gain on successful evade/parry (+10), on damage taken (+5), i-frames on special startup (~6f), special-cancel rule.
- *No library.*

**G4. Air grapples**
- *Fill:* extend `playPairedGrapple` with an airborne context (`grapple-system.ts` already switches on `context_`; add `"air"` alongside `"ground"`).
- *Animation clips (CC0):* CMU Motion Capture Database (free, already in pipeline) — jump-grab / aerial-takedown clips; Mixamo (free with account) jumping packs. License: CMU free for research/use; Mixamo free with account, no raw redistribution — bake into our bank (pipeline already does this).

**G5. Weapon durability + throw-to-stun + disarm**
- *Fill:* design port — `durability` int on held weapons, decrement per hit, break at 0 (debris via existing `impact-particles.ts`); throw = projectile with stun; disarm = grapple move vs armed opponent drops weapon.
- *No library.*

**G6. Wall-run / wall-vault attacks**
- *Fill:* design port — wall proximity check (wallSlam infra exists) → wall-run state (~1.2s, stick steers) → vault attack. Agile styles only (style flag in char-gen).
- *Animation:* Mixamo "Parkour" pack (free with account) has wall-run/vault; CMU has climbing clips.

**G7. Tandem team-up grapples (2v1)**
- *Fill:* extend paired playback to 3 participants — attacker + partner + victim. The sync system (`playPairedGrapple`) is the foundation; add a third track.
- *Depends on:* partner command menu (G8).

**G8. Partner commands (help / double-team / give weapon)**
- *Fill:* design port — D-pad command menu → lieutenant AI orders. Lieutenants system exists; add the command layer + double-team trigger (calls G7).
- *No library.*

**G9. 3-level defense matching (high/mid/low)**
- *Fill:* design port — `guard`/`lowGuard` already exist; add high-guard, match evade direction to incoming attack level.
- *No library.*

**G10. Stagger/combo breakout via special (metered escape)**
- *Fill:* design port — during hitstun, if meter ≥ cost, special input breaks out (costs full bar — UR's "never a death sentence" rule).
- *No library.*

### P2 — High value (next)

**G11. Boss HP-threshold phase changes + approach punishes**
- *Fill:* design port in `opponent-brain.ts` — boss archetype with 2–3 phases keyed to HP%, each phase changes move preferences and adds one punish (anti-air, anti-turtle).
- *No library.*

**G12. AI archetypes (deflector / grappler / special-user)**
- *Fill:* design port — parameterize `opponent-brain.ts` with archetype profiles (deflect chance, grapple preference, special usage). UR's Jose/Miguel/Jake/Chris are the templates.
- *No library.*

**G13. Per-target stamina bar + region wear HUD**
- *Fill:* design port — HUD element showing locked target's region damage (zones already tracked per 9e02999).
- *No library.*

**G14. Post-mission stat spend (1–3 pts → regional stats)**
- *Fill:* design port — mission-complete screen → points → 9 regional stats. char-gen has stats; add the spend flow in campaign.ts.
- *No library.*

**G15. Move unlocks over missions (kit growth)**
- *Fill:* design port — mission-gated move unlocks; mission mode as tutorial-in-disguise.
- *Animation:* gate existing bank clips behind unlocks — zero new assets needed.

**G16. Ground pounce + straddle**
- *Fill:* design port — pounce move vs `down` state; straddle = grapple on downed opponent → face-punch loop.
- *Animation:* CMU/Mixamo ground-and-pound clips (Mixamo ground packs have mount punches).

**G17. Taunt (risk/reward)**
- *Fill:* design port — taunt button: brief meter gain + *vulnerability window* (UR's bait design, not free meter).
- *Animation:* 1 taunt clip per archetype — Mixamo has taunt/idle-variation clips.

**G18. Contextual animation variation (stick + enemy count)**
- *Fill:* animation-system.ts — pick strike variants by stick direction and nearby enemy count (UR's "choreographed movie" feel). Needs 2–3 variants per strike.
- *Animation clips:* multiply via existing bank; new variants from Mixamo strike packs.

### P3 — Infrastructure & content

**G19. State-machine framework for combat states**
- *Fill:* the combat sub-state machine is being built (`COMBAT_SUBSTATES.md` parallel worker, 3/6 committed). If a framework is wanted instead of hand-rolled: **XState** (MIT) — the standard open-source hierarchical state machine, battle-tested, serializable, visualizable. Wire-in: model fighter states in XState, drive sim.ts from it. License: MIT ✓.
- *Alternative:* hand-rolled (current path) — fine at this scale; XState pays off if states exceed ~40.

**G20. Dialogue/substory engine (mission flavor)**
- *Fill:* **YarnSpinner** (MIT) — already on the wiring list from prior research. For mission briefings, partner barks, Fighter Files text.

**G21. Impact SFX + soundtrack direction**
- *Fill:* **freesound.org** — CC0/CC-BY impact sounds (punches, slams, breaks). License: filter CC0 only for zero-attribution; CC-BY with attribution file if needed.
- *Music:* owner directive 2026-10-06 — hybrid: open-source loops/samples + code synthesis. Sources: **Looperman** (free loops, check per-loop license), **Free Music Archive** (CC mixes). Wire-in: `music.ts` stem mixer.

**G22. 4-player multiplayer test harness**
- *Fill:* `nakama-client.ts` exists. For *testing* 4-player brawls without 4 humans: **bot clients** — scripted headless players via the existing playtest harness pattern. No library needed.

**G23. Godot brawler references (research only until license verified)**
- *Candidates from prior research:* `xkwn/BeatEmUp-Godot`, `Jadebravo6/kulunakiller`, `Jetss3/Beat-Em-UP-Godot-3.4` — all UNVERIFIED licenses. Action: verify license (need MIT/Apache/CC0/BSD); if clean, port camera/targeting/AI patterns. If GPL — research only, do not merge.

**G24. Motion-matching evaluation**
- *Fill:* the animation-harvest worker (active) is evaluating open-source motion-matching. If it lands, locomotion (walk/run/dash/wall-run) gets AAA-grade naturalism from the existing 220-clip library. Watch that workstream — don't duplicate.

### License manifest (this doc's pulls)
| Source | License | Use |
|---|---|---|
| CMU Motion Capture Database | Free (research/use) | Grapple/air/ground/taunt clips |
| Mixamo | Free with account (no raw redistribution) | Vault, strike-variant, taunt clips — baked into our bank |
| XState | MIT | Optional combat state machine |
| YarnSpinner | MIT | Dialogue/briefings |
| freesound.org | CC0 (filtered) | Impact SFX |
| Looperman / Free Music Archive | Per-item (verify) | Music stems |
| Godot brawler repos | UNVERIFIED — check first | Research/patterns only until verified |

**Quarantine note:** no GPL/AGPL code is pulled by this plan. The Godot repos stay research-only until their licenses are verified.

---

## PART 4 — Master Build List (prioritized by gameplay impact)

### Tier 1 — the UR feel (do first)
1. G3 — meter economy (defense builds, i-frames, special-cancel) + G10 (metered breakout) — *defense becomes a resource engine*
2. G1 — dodge-chain escalation — *rewards defensive streaks*
3. G2 — grapple reversal guessing — *grapples become mind games*
4. G9 — 3-level defense matching — *completes the defense triangle*

### Tier 2 — the brawler depth
5. G5 — weapon durability/throw/disarm — *weapons become resources*
6. G4 — air grapples — *juggles become interactive*
7. G7 + G8 — tandem grapples + partner commands — *the UR signature*
8. G6 — wall-run/vault — *agile styles earn their identity*
9. G16 — ground pounce/straddle — *ground game stops being dead time*

### Tier 3 — the campaign layer
10. G14 — post-mission stat spend — *progression loop*
11. G15 — move unlocks — *kit growth*
12. G11 + G12 — boss phases + AI archetypes — *enemies stop feeling samey*
13. G13 — target stamina/region HUD — *see the damage you're doing*

### Tier 4 — presentation & flavor
14. G17 — taunt (risk/reward)
15. G18 — contextual animation variation
16. G21 — SFX/music direction pass
17. G20 — YarnSpinner for briefings/Fighter Files

### Already covered elsewhere (don't duplicate)
- Variable hit-stop (DONE 2471e45), body-zone targeting (DONE 9e02999)
- Reversals, wall-slams, cheap-shots (IN-PROGRESS workers)
- Combat sub-states (COMBAT_SUBSTATES.md parallel worker — 3/6 committed, builds on this doc's §1)
- Motion matching / auto-rig (animation-harvest worker)
- AI behavior (AI_BEHAVIOR_TEARDOWN.md), missions→open-world (WORLD_STORY_DESIGN.md)

---

*End of gap analysis. Mechanics described as design principles for original implementation; no copyrighted assets, code, or text reproduced.*
