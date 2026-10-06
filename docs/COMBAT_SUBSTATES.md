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
