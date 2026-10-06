# COMBAT SUB-STATES TEARDOWN

Deep fighting-system layer teardown: the actual sub-states, transitions, and
environmental-destruction mechanics of Urban Reign, Tekken 1-8, Yakuza (early
PS2 + recent), and the Capcom lineage — and what AshLane's combat state machine
needs, mapped to `src/game3d/sim.ts`.

All mechanics described in our own words from public guides, wikis, and
reviews. No proprietary code or assets reproduced.

---

## 1. URBAN REIGN (Namco, PS2, 2005)

### 1.1 Core state list

| State | What it is | Entry | Exit |
|---|---|---|---|
| **Neutral** | Free stance, full movement | Default | Any action |
| **Strike** | 3-hit combo strings; 3rd hit juggles | Attack button | Hit/blocked/dodge |
| **High/Low grapple** | Throw attempt, region-selected | Grapple button + direction | Whiff / connect / reversed |
| **Air grapple** | Grab a juggled opponent mid-air | Grapple during juggle | Connect / whiff |
| **Restrain** | Hold opponent in place (beat on them) | Grapple (hold variant) | Break / timeout |
| **Dodge** | Timed sidestep, single button | Dodge at attack moment | Success → neutral; fail → hit |
| **Reversal** | Dodge + up/down at the right time → counter the attack | Timed dodge+direction | Counterattack |
| **Grapple struggle** | Caught in enemy grapple; guess region to reverse | Being grappled | Reverse (correct guess) / thrown |
| **Stagger** | Brief stun from hits | Taking hits | Recovers; can be broken with Special Arts |
| **Dizzy** | Longer stun state | Accumulated hits | Mash out or Special Arts break |
| **Knockdown** | On the ground | Launchers, throws, sweeps | Getup / stay down |
| **Ground punish** | Pounce on downed enemy (face punches) | Near downed enemy | Whiff / connect |
| **Wall run** | Agile characters run up walls, flip off with kick | Dash toward wall | Aerial kick |
| **Weapon held** | Holding one of 30 weapons | Pickup | Drop / thrown / broken |
| **Special Arts** | Unblockable 2-button super | 2 buttons + meter | Cinematic, uncounterable |
| **Partner sync** | Double-team grapple with AI/human partner | Both grapple same enemy | Double-team animation |

### 1.2 The defensive layer (UR's signature)

UR **replaces blocking with dodge**. There is no hold-back guard:
- **Dodge**: single button, must be timed to the attack moment. Chained
  dodges against multiple attackers auto-convert into a shove — the character
  grabs the dodged opponents and pushes them aside, stealing initiative.
- **Reversal**: dodge + up/down on the d-pad at the correct time reverses the
  attack outright (counterattack).
- **Grapple reversal**: when caught, guess the grapple region (head/upper/lower)
  and reverse out into your own counter.
- **Special Arts as combo-breaker**: SP moves can break out of stagger and
  dizziness — a universal "get off me" that costs meter.

Feel contribution: defense is *active and rhythmic*, not passive. You are
always doing something — dodging is a beat you play, and a well-timed reversal
chain against 3 attackers feels like a martial-arts film.

### 1.3 Damage regions

Three regions — head, body, legs — selected by stick direction
(up = head/chest, neutral = mid, down = legs). Repeated damage to one region
gives **bonus damage** and shows on the enemy's stamina bar. Strikes, grapples,
and reversals all respect regions.

### 1.4 Juggle rules

- Most combos start with three attack presses; the **third hit juggles**.
- After the juggle pop, the player chooses: air grapple, special move,
  continue the combo, or disengage (grab a weapon / reposition).
- Enemies can be juggled and then caught with air grapples — the juggle is a
  *decision point*, not just damage.

### 1.5 Special Arts meter

- Built by hitting opponents, taking damage, and successful dodges.
- SP moves: unblockable, uncounterable, unreversible (except by another SP),
  bufferable. The universal answer to stagger/dizzy.
- Cost is meter bars; meter is *shared* between offense (SP attacks) and
  defense (combo-breaker).

### 1.6 Partner system states

- AI partner takes R2 commands (call in, attack target, split/draw aggro,
  weapon pass).
- **Double-team grapple**: both players/AI grapple the same enemy → synced
  two-man animation (suplexes, hold-and-beat).
- Partner down ≠ mission fail.

### 1.7 Weapons

- 30 weapons (pipes, bats, knives, bottles, swords...). Each has a **durability
  meter**; weapons can be **thrown to stun** or used to extend combos.
- Multiplayer modes built around weapons (hot-potato hold-the-weapon,
  statue-destruction with weapons).

### 1.8 Environment interaction

- Throw/smash opponents into **cars, crates, shelves, tables** for bonus damage.
- Wall run → flip-off kick for agile characters.
- Big open arenas (alleys, car parks), not tiny rings.

---

## 2. TEKKEN 1–8 (Namco/Bandai Namco, 1994–2024)

### 2.1 The state machine, evolved

**T1–T3: the foundation.** Neutral, high/low block (hold back / down-back),
sidestep (introduced T3), 10-hit strings, basic juggles from launchers.
Throws: 1-break / 2-break by input. Ground game: face-up / face-down,
getup kicks (3 = low, 4 = mid), tech rolls.

**T4: walls and positioning.** First walled stages. Uneven terrain. The wall
game begins — positioning becomes a resource.

**T5: juggle refinement.** Juggle finishers that "spike" the opponent into the
ground (no tech roll). Crush system matures: high-crush and low-crush moves
evade specific heights. Stances deepen.

**T6: Bound (B!).** Hitting an airborne opponent with a Bound move slams them
groundward and *re-extends* the juggle — the combo continues after a
ground spike. Rules: **one Bound per combo**; low parries also cause Bound.
Breakable floors/walls: slamming through a floor drops both fighters to a
lower level and the combo can continue. Wall splat (W!): knockback into wall
→ opponent stuck → ~3 follow-up hits by speed (fast mids get more).

**TTT2:** Tag Assault extends Bound combos with partner; rage (comeback damage
buff at low HP).

**T7: Screw (Tornado).** Bound replaced by Screw — airborne opponent spins
(tailspin), thrown *backward* instead of downward. Consequences: Screw does
not work next to walls, cannot cause floor breaks. **Once per combo.** Rage
Art (armored cinematic super, one input for all characters) and Rage Drive
(enhanced move) as comeback mechanics. Power crush (armor through attacks).
Screw lost if the move was already used as a wall/balcony break.

**T8: Heat + Tornado.** Screw renamed Tornado. The **Heat system**: 10-second
aggression window (blue flames), activated by Heat Burst (power crush, +1 on
block) or Heat Engagers (auto-dash to opponent on hit). During Heat: chip
damage on *every* attack, enhanced moves per character, Heat Smash (consumes
all Heat, big damage, can trigger Hard Wall/Floor Break in one hit).
Recoverable health (white bar refills by landing hits, adapted from Tag).
Rage Art stays (unified input). **Hard Floor Break** (new): needs two hits
instead of one. Wall Blast / Floor Blast stage gimmicks.

### 2.2 Sub-state catalog (applies across the series)

| State | Notes |
|---|---|
| **Standing block** | Hold back; blocks highs/mids, chip damage |
| **Crouch block** | Down-back; blocks lows, vulnerable to mids |
| **Sidestep (SSL/SSR)** | T3+; evades linear moves, loses to homing |
| **Crush** | Move-specific: high-crush beats highs, low-crush beats lows |
| **Counter hit (CH)** | Hitting during opponent's startup → bonus damage/frames, some moves gain launcher properties only on CH |
| **Launcher** | Puts opponent airborne → juggle |
| **Juggle** | Airborne combo; damage scales per hit |
| **Bound (T6/TT2)** | Ground-spike re-extends juggle; 1/combo |
| **Screw/Tornado (T7/T8)** | Tailspin re-extends juggle; 1/combo; no wall/floor interaction |
| **Wall splat (W!)** | Knockback into wall → stuck, ~3 follow-up hits |
| **Wall break** | Strong impact on splatted opponent → wall breaks, extra hits, new area |
| **Balcony break** | Knock through railing → drop to lower level, combo continues |
| **Floor break** | Slam down → floor breaks, both drop, combo continues |
| **Hard floor break (T8)** | Two hits required |
| **Ground: face up / face down** | Different getup options each |
| **Tech roll** | Quick ground recovery, direction choice |
| **Getup kicks** | 3 (low) / 4 (mid) from ground; punishable |
| **Spring kick** | b+3+4 or f+1+2; fast wakeup attack, punishable on whiff |
| **Toe kick (d+4)** | Tiny ground poke, very negative — a trap option |
| **Throw break** | 1 or 2 input at grab moment |
| **Low parry** | d/f on low → Bound (T6+) / spike |
| **Power crush** | Armor through mids/highs while attacking |
| **Rage** | Low-HP damage buff (T6–T7), then Rage Art/Drive |
| **Heat (T8)** | 10s aggression state, chip on everything, Heat Smash finisher |
| **Recoverable HP (T8)** | White bar; landing hits refills it |

### 2.3 The "one of each" combo grammar

Tekken combos read as: **launcher → filler → extender (Bound/Screw/Tornado,
once) → ender**, with optional **wall carry → wall splat → wall combo** and
optional **break (wall/floor/balcony)**. Each extender is a *single-use token*
per combo — the design lesson is *scarcity creates routing decisions*.

### 2.4 Okizeme (wake-up game)

The downed opponent chooses: stay down (can't be re-launched), tech roll
(direction), getup kick (3/4), spring kick, stand up. The attacker chooses:
meaty (hit on wakeup), whiff-punish the getup kick, re-splat, back off.
Grounded opponents cannot be launched — this single rule shapes the entire
ground game.

---

## 3. YAKUZA (Sega, PS2 2005 → Dragon Engine present)

### 3.1 Heat: the contextual super system

- **Heat gauge** fills by landing attacks, grabs, taunts; some styles charge it
  differently (Brawler block charges, Rush quickstep charges Climax).
- **Heat Actions**: contextual cinematic finishers. Trigger = gauge level +
  *situation*: enemy near wall (Wall Crush), grabbed near car, holding a
  specific weapon (bat/knife/katana/umbrella each have their own), enemy
  downed (ground finishers), enemy wielding a weapon (disarm-and-punish).
- **Damage variety rule**: repeating the same Heat Action deals *less* — the
  game rewards situational awareness over spamming.
- **Extreme Heat (0/Kiwami+)**: temporary powered mode — more damage, harder
  to knock down, exclusive Heat Actions.
- **Boss heat**: bosses can glow and regenerate — counter with heat items or
  burst them down.
- Feel: Heat turns *positioning* into a resource. "Near a wall with a bat and
  full gauge" is a different game state than open ground.

### 3.2 Weapon economy (durability as design)

- Street weapons: bats, knives, traffic cones, bikes, signs — picked up,
  swung, **each hit costs durability**, break after N hits.
- **Weapon Heat Actions cost only 1 durability** — the economy pushes you to
  finish with style rather than chip away.
- Finishing a fight with a weapon Heat Action costs **zero** durability for
  that action.
- Special weapons break the rules in specific ways (some never lose durability
  on normal use, some only on Heat, some only when blocking) — chase items.
- Repair economy: good weapons cost serious money to repair — weapons are a
  *budget decision*, not just a pickup.
- Feel: weapons are *fireworks* — spectacular, temporary, worth saving for the
  right moment.

### 3.3 Grab/throw states

- Grabs lead to: free hits, throws (directional), or Heat Action setups.
- **Wall grabs**: grab near wall/car → environmental Heat Action.
- **Disarm grabs**: grab a weapon-wielding enemy → take their weapon, punish.
- Throw-the-guy-off-the-pier style: some Heat Actions *remove* enemies from
  the fight (ring-outs by context).

### 3.4 Style stances (0/Kiwami/LAD)

- **Brawler**: balanced; block charges heat.
- **Rush**: fast, weak, quickstep evades; Climax heat charges on evade.
- **Beast**: slow, super-armor-ish, auto-picks-up weapons, environmental
  destruction focus.
- **Dragon**: the mastered hybrid; Komaki/Majima-learned techniques gate
  weapon Heat Actions (sword school, stick mastery).
- Stance-switching mid-fight = adapting to the situation (crowd → Beast,
  duelist → Rush).

### 3.5 Physics states (Dragon Engine)

- Ragdoll-ish knockback with *weight*: enemies crumple over objects, slide,
  bounce off walls with readable arcs.
- Environmental takedowns read as *physical events*, not canned animations —
  the comedy and impact come from the simulation.

### 3.6 Early vs recent

- **Early (1/2/Kenzan)**: simpler combos, Heat Actions already contextual,
  weapons everywhere, boss patterns basic.
- **Recent (0/Kiwami/6/LAD)**: style systems, Extreme Heat, deeper economy,
  Dragon Engine physics, substory-gated techniques (beat X to learn Y).
- Constant: the *situation* is the move list. Yakuza's depth is in reading the
  room, not memorizing inputs.

---

## 4. CAPCOM LINEAGE (Street Fighter II → III → IV → V → VI, Final Fight)

### 4.1 The state vocabulary Capcom invented

| State | Notes |
|---|---|
| **Blockstun** | Blocking still locks you briefly — pressure is real |
| **Chip damage** | Blocked specials still hurt (small); blocking isn't free |
| **Dizzy/Stun** | Hidden (SF2/4) or visible (3S/V) meter; fills on hits, drains after ~1s untouched; full = free punish combo. Throws add stun. Mash + wiggle to recover faster (SF2). 3S dizzy doesn't auto-knockdown → bonus juggles possible |
| **Juggle** | Airborne-hit rules per game; some moves juggle, most don't — the *juggle flag* is a per-move property |
| **Throw tech** | Simultaneous throw → both pushed apart, no damage (3S) |
| **Super meter** | Built by whiffing mediums+, specials, hitting, being hit (3S). Spent on supers |
| **Super/Ultra/Critical Art** | Cinematic, high damage; later games: *no stun damage* (avoids accidental dizzy mid-super) |
| **V-Reversal (SFV)** | Metered defensive reversal; also *empties your stun gauge* — defense that manages the dizzy economy |
| **Drive (SF6)** | Unified resource: parry, rush-cancel, overdrive — one meter, many states |

### 4.2 Design lessons

- **Stun as a visible meter (3S/SFV)** turns dizzy into *shared information* —
  both players play around it. Hidden stun (SF2/4) is scarier but feels cheaper.
- **Juggle as a per-move flag** (not a global system) gives designers surgical
  control: only chosen moves extend air combos.
- **Supers dealing no stun** is a kindness rule: don't let the reward system
  interfere with itself.
- **V-Reversal emptying stun** links defense to the dizzy economy — blocking
  your way out of trouble is a *decision*, not a stall.

### 4.3 Final Fight lineage (the brawler side)

- Walk in 8 directions on a belt plane; facing is binary (left/right).
- Grab-from-behind states, piledriver-style throws, weapon pickups (pipes,
  knives) with simple durability.
- Crowd control via knockback arcs — one swing hits a *line*, positioning is
  everything.

---

## 5. ENVIRONMENTAL DESTRUCTION LAYER

### 5.1 Walls: splat → break (the Tekken grammar)

- **Wall splat (W!)**: knockback attack connects near wall → opponent sticks to
  wall, vulnerable. Follow-up window ≈ 3 fast hits (slow power moves: ~2).
- **Wall break**: *specific strong moves* on a splatted opponent break the
  wall — extra damage, opponent left stunned and open, sometimes a new area.
  Breakable vs solid walls are a *stage property* (designers choose per wall).
- **Balcony break**: knock through railing → both drop a level → combo can
  continue on landing.
- **Screw/Tornado vs walls**: tailspin extenders do NOT work at walls and can't
  cause floor breaks (they throw backward, not downward) — extender choice is
  *positional*.
- **One wall splat per wall per combo** — but carrying to a *second* wall can
  earn another. Positioning compounds.

### 5.2 Floors: break and drop

- **Floor break**: slam-down moves on marked floors → both fighters drop to a
  lower level; combo continues after landing.
- **Hard floor break (T8)**: requires *two* hits — the floor has HP.
- **Heat Smash shortcut (T8)**: Heat Smash triggers hard breaks in one hit.
- Design lesson: floors/walls as *HP objects* with thresholds, not binary flags.

### 5.3 Yakuza wall heat actions

- Contextual: grab near wall → Wall Crush (punch then head-into-wall),
  Back Crush (leg sweep, crush against wall with body weight),
  guardrail drops (pick up, back-first onto rail).
- The wall is a *move list extension* — same grab input, different output by
  proximity.

### 5.4 Juggle rules, unified

1. **Launcher** puts opponent airborne (launchers are per-move flags).
2. **Filler**: air hits keep them up; damage scales per hit (scaling is the
   anti-infinite).
3. **Extender (once per combo)**: Bound (spike down, T6) / Screw-Tornado
   (tailspin back, T7/8). One token per combo — routing decision.
4. **Ender**: spike/finisher; grounded opponents can't be re-launched (Tekken's
   foundational rule).
5. **Wall carry**: juggle drift toward wall → splat → wall combo.
6. **Ground bounce**: some slams bounce (vs splat) — bounce *continues*,
   splat *pauses*.

### 5.5 Breakables: object HP states

- **States**: intact → damaged → broken. Each transition is a *feel event*
  (crack sound, debris, banner).
- **What breaks what**: tables/chairs/crates break from body slams and heavy
  hits; bottles shatter on first weapon-hit; cars dent (multi-stage) but don't
  shatter.
- **Broken pieces as weapons**: table → board (fewer swings, heavier);
  bottle → shard. The debris is *loot*.
- **Yakuza economy**: every weapon swing costs 1 durability; Heat Actions
  cost 1 (not per-swing); fight-ending weapon Heat costs 0. Repair costs money
  → weapons are budget decisions.

### 5.6 Weapons: full state list

| State | Notes |
|---|---|
| **On ground** | Pickup prompt in radius |
| **Equipped** | Moveset override (swing arcs, reach) |
| **Thrown** | Projectile; stuns on hit (UR) |
| **Durability tick** | Per swing (Yakuza) or per hit |
| **Broken** | Auto-drop; may spawn shard/board piece |
| **Dropped** | Knock-away on big hits; stealable (UR hot-potato) |
| **Disarmed** | Enemy grab → weapon taken (Yakuza disarm heat) |

---

## 6. ASHLANE MAPPING — what sim.ts has vs what's missing

Current `src/game3d/sim.ts` body states: `free, atk, windup, dash, spin,
hit, launch, down, grab, throw, out`. Systems present: `poise` (stagger
meter), `meter` (0-100, builds on hits), `stopT` (hit-stop), `splat` +
`wallSlam()` (wall splat with follow-up bonus), `tech` (wake flag),
`hitProps()` (crate/chair/table/car break → debris loot, "Through the
table" body slams), weapons with durability numbers (pipe 8, spear 7,
blade 6, board 5, bottle 3), variable hit-stop (jabs ~5f, big counters
12f — done), stick-aimed body-zone targeting (head/body/legs — done).

| Sub-state / mechanic | Source | sim.ts status | Priority |
|---|---|---|---|
| Variable hit-stop by power | UR feel | **HAVE** (2471e45) | — |
| Body-region targeting | UR | **HAVE** (9e02999) | — |
| Reversals / grab escapes | UR | PARTIAL (in progress) | P0 |
| Wall splat + follow-up bonus | Tekken/UR | **HAVE** (`wallSlam`, `splat`) | — |
| Wall *break* (walls with HP, post-break area) | Tekken | MISSING | P1 |
| Floor break / drop to lower level | Tekken | MISSING | P2 |
| Balcony break | Tekken | MISSING | P3 |
| Juggle extender token (once/combo) | Tekken | MISSING (launch exists, no extender rule) | P1 |
| Damage scaling per juggle hit | Tekken/Capcom | MISSING | P1 |
| Grounded-can't-relaunch rule | Tekken | MISSING | P1 |
| Okizeme: tech roll / getup kick / spring kick | Tekken | PARTIAL (`down` + `tech` flag exist, no option select) | P1 |
| Cheap shot from behind + telegraph | UR feel | PARTIAL (in progress) | P0 |
| Dodge as timed button (no hold-block) | UR | MISSING (no dodge state) | P0 |
| Chained-dodge auto-shove | UR | MISSING | P2 |
| Special Arts meter (shared offense/defense) | UR | PARTIAL (`meter` exists, no SP moves) | P1 |
| SP as combo-breaker | UR | MISSING | P2 |
| Stun/dizzy meter (visible) | Capcom | MISSING (`poise` is stagger, not dizzy) | P1 |
| Throw tech | Capcom/UR | MISSING | P2 |
| Air grapple | UR | MISSING | P2 |
| Double-team sync grapple | UR | MISSING | P2 |
| Weapon throw (stun projectile) | UR | MISSING (weapons are melee only) | P2 |
| Weapon durability economy (heat-action discount) | Yakuza | PARTIAL (durability numbers exist, no economy) | P2 |
| Contextual heat actions (wall/car/weapon/down) | Yakuza | MISSING | P2 |
| Disarm grab | Yakuza | MISSING | P3 |
| Breakable → debris-as-weapon (board/shard) | Yakuza | **HAVE** (table → board) | — |
| Object HP states (intact→damaged→broken) | All | PARTIAL (props have hp, no damaged visual state) | P2 |
| Crush system (high/low evasion) | Tekken | MISSING | P3 |
| Counter-hit bonus states | Tekken | MISSING | P2 |
| Stance system | Tekken/Yakuza | MISSING | P3 |
| Heat/aggression window (chip on everything) | T8 | MISSING | P3 |
| V-Reversal (defense that clears stun) | Capcom | MISSING | P3 |

### Build order rationale

- **P0** (feel-critical, UR identity): timed dodge, reversals/grab escapes,
  telegraphed cheap shots. Without these the game doesn't *feel* like Urban
  Reign no matter what else ships.
- **P1** (combo/depth layer): wall breaks, juggle extender + scaling,
  no-relaunch rule, okizeme options, visible stun meter, SP meter with
  actual SP moves.
- **P2** (texture): chained-dodge shove, SP combo-breaker, throw tech, air
  grapple, double-teams, weapon throws, durability economy, heat actions,
  object damage states.
- **P3** (mastery layer): crush, counter-hits, stances, Heat window,
  V-Reversal, disarms, balcony breaks.

### Open-source fills (per gap)

- **Timed dodge + i-frames**: standard fighting-game pattern; implement in
  sim.ts (`dash` exists — add dodge variant with invuln window). No external
  dependency needed.
- **Juggle scaling / extender token**: pure state-machine rules; implement
  directly (combo counter + one-extender flag on Body).
- **Okizeme options**: extend `down` state with getup choice inputs
  (tech roll dir, getup kick 3/4, spring kick) — input layer + state exits.
- **Visible stun meter**: HUD element bound to a new `stun` field; drains
  after 1s untouched (SFV pattern).
- **Wall/floor break**: mark stage walls/floors with `breakHp`; `wallSlam()`
  decrements; on break, swap geometry + allow combo continuation.
- **CC0 mocap for new states**: the 220-clip retarget library
  (tools/anim-retarget) covers walk/idle/attack; gap-fill with CC0 mocap
  (CMU, Mixamo free packs) for dodge rolls, getup, air grapple — run through
  the retargeter + model-QC gate.

---

*Sources: Wikipedia (Urban Reign gameplay), Tekken Wiki (Heat, Screw, Bound),
SuperCombo Wiki (SF2T/SFIV system, Tekken dictionary), sdtekken.com (Tekken
101), gamingbolt.com (T8 guide), gamerant.com (T8 features, Yakuza tips),
Steam community guides (Yakuza Kiwami), yakuza.fandom.com (Y0 heat actions),
gamefaqs.gamespot.com (Yakuza 3 weapon thread), polygon.com (SFV stun),
gamespot.com + gamesradar.com + ps2.gamespy.com (Urban Reign reviews),
forum.digitpress.com (UR player guide), vectree.io (UR knowledge map).
Mechanics described in our own words; no proprietary code/assets reproduced.*
