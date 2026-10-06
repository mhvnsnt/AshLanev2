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
