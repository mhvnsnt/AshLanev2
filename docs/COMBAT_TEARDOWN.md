# Combat Teardown: Tekken + Urban Reign Systems for AshLane

**Date:** 2026-10-06
**Purpose:** Mechanical breakdown of how Tekken and Urban Reign combat actually works, mapped to AshLane's combat code. What we adopt, what we adapt, what's missing.
**Companion docs:** `MOVESET_LIBRARY_TEKKEN.md`, `MOVESET_LIBRARY_URBAN_REIGN.md` (per-character reference).

> Sources: Tekken Wiki, Wavu Wiki, sdtekken.com Tekken 101, SuperCombo Wiki, GameSpot/Eurogamer Urban Reign coverage, GameFAQs movelist FAQs. Summarized in our own words; notation kept because it's the community standard.

---

## 1. TEKKEN — Input System

### 1.1 Limb-based buttons
Tekken maps buttons to limbs, not to punch/kick strength:

| Input | Limb |
|---|---|
| `1` | Left punch |
| `2` | Right punch |
| `3` | Left kick |
| `4` | Right kick |

Combinations: `1+2`, `3+4`, `1+4`, `2+3`, `1+3`, `2+4` (the last two are the generic throw inputs).

**AshLane status:** ✅ ADOPTED — `docs/MOVESETS.md` input legend and `movesets.ts` already use this notation (`1`, `2`, `f+2`, `d/f+2`, `WS+2`, `WR+3`, `1+2`).

### 1.2 Directional notation
`f` forward, `b` back, `u` up, `d` down, `d/f`, `d/b`, `u/f`, `u/b`, `n` neutral. State prefixes: `WS` (while standing = rising from crouch), `FC` (full crouch), `WR` (while running), `BT` (back turned), `SS` (sidestep).

**AshLane status:** ✅ ADOPTED in notation; ⚠️ verify the *engine* actually implements WS/WR/BT states as distinct cancel windows, not just labels.

### 1.3 Movement — the real Tekken depth
- **Sidestep (SS):** tap `u` or `d`. Quick lateral step; cancels into `f` (forward), `b` (block), `d/b` (crouch), jump, or attack. Some attacks only exist as `SS+button`.
- **Sidewalk (SW):** double-tap and hold `u`/`d` (`u~U`). Continuous evasive circling — far more evasive than a single SS.
- **Backdash (BD):** `b,b`. Creates space, forces whiffs. Has vulnerable recovery frames at the end (can't block briefly).
- **Backdash cancel / Korean backdash (KBD):** `b,b,d/b,b,n,b` repeating — cancels the backdash recovery into another backdash. The core high-level movement skill; lets a player retreat at full speed while staying actionable.
- **Crouch dash (CD):** `f,n,d,d/f`. Character-specific flavors (Paul's Cormorant Step, Bryan's Slither Step, Dragunov's Sneak). Mishima CD enables **wavedash** (`f,n,d,d/f,f` repeating) — the iconic aggressive approach, plus access to WS moves out of dash.
- **Homing moves:** every character has at least one move that cannot be sidestepped/walked — the answer to excessive lateral movement.

**AshLane mapping:**
- ADOPT: SS as a cancelable lateral step with `SS+button` attacks; backdash with real recovery vulnerability; homing property on designated moves.
- ADAPT: KBD/wavedash are execution-heavy; give AshLane a simpler "dash-cancel" (dash → dash) that captures 80% of the feel without frame-perfect inputs. Keep wavedash-style approach as a per-style perk (e.g. Mishima-inspired fighters), not universal.
- MISSING (verify in sim): confirm sidestep exists with i-frames/cancel windows; confirm backdash has vulnerable recovery; add homing flag to move properties.

---

## 2. TEKKEN — Hit Levels, Crush, Counter

### 2.1 Hit levels
- **High (h):** blocked standing; ducked (whiffs vs crouchers).
- **Mid (m):** blocked standing; cannot be ducked. The backbone of offense.
- **Low (l):** must be blocked crouching (`d/b`).
- **Special mid (Sm):** can be blocked either way.
- **Unblockable (!):** must be moved away from; some can be ducked `(!)`.

### 2.2 Crush system
Moves carry **high-crush** or **low-crush**: during active frames, highs (or lows) whiff against them. This is how Tekken handles "my hopkick beats your jab" without invincibility frames.

### 2.3 Counter hits (CH)
Interrupting an opponent's attack = counter hit: bonus damage and often upgraded properties (a move that only launches on CH). CH game is a pillar of Tekken neutral.

**AshLane status:** ✅ `low`/`high`/`mid`/`counter-hit`/`unblockable` properties exist in `movesets.ts`. ⚠️ ADD: crush properties (`high-crush`, `low-crush`) and CH-specific property upgrades (e.g. `launcher-on-CH`).

---

## 3. TEKKEN — Juggle / Combo System

The combo engine, in order:

1. **Launcher:** a move that puts the opponent airborne (juggle starter). Fast launchers (~15f, e.g. hopkick `u/f+4`) vs big launchers (slower, more damage).
2. **Juggle filler:** airborne opponent takes scaled damage; gravity pulls them down.
3. **Screw (T7+) / Bound (T6):** once per combo, a move that slams the airborne opponent into a spinning/grounded extension state, extending the juggle. (Bound: opponent slammed to ground, body flips up, helpless for a beat.)
4. **Ender:** final hit, often a spike (slams opponent down so they can't tech roll) or a knockdown that sets up oki.
5. **Wall splat:** carrying the opponent to the wall splats them — bonus wall combo.
6. **Floor/balcony break:** certain stages; breaking the floor re-bounces the opponent like a bound.
7. **Heat Burst bound (T8):** Heat Burst on an airborne opponent triggers a bound (no floor break from it).

Damage scaling, juggle gravity, and the one-screw-per-combo limit are what keep combos bounded.

**AshLane mapping:**
- ADOPT: launcher → filler → screw-equivalent → ender grammar; spike enders that deny tech roll; wall splat combos.
- ADAPT: AshLane is a multi-enemy brawler, not 1v1 — juggles should be shorter and punchier than Tekken's. One extension per combo max.
- MISSING (verify): a formal juggle state with gravity + damage scaling; the "one extension per combo" rule; spike property denying tech.

---

## 4. TEKKEN — Throws / Grapples

### 4.1 Generic throws
Every character: `1+3` (left-hand throw) and `2+4` (right-hand throw). In modern Tekken, generics are broken by pressing **either** `1` or `2`.

### 4.2 Command throws and the break system
- Most throws are broken by pressing the punch matching the **lead arm**: left arm extended → `1`, right arm → `2`, both arms → `1+2`. Tiny break window — you react to the wind-up, not the animation.
- **Back throws:** unbreakable (but can be ducked, except tackle-style).
- **Side throws:** break `1` if thrown from your left, `2` from your right.
- **Crouch throws / ground throws:** no distinct visual tell — pure 50/50 guess.
- Some throws are fully unbreakable (e.g. King's muscle-buster setups, stance throws).
- Throws beat **Power Crush** (armor) — the designed counter to armor is the throw.
- In Tekken 8, generic throws are **homing** (can't be stepped).

### 4.3 Chain throws (King and friends)
King has ~48 throws including **multi-throw chains**: a starter throw branches into follow-up throws (throw A → B or C → D/E…), each link breakable by the correct `1`/`2`/`1+2` input read off the lead arm *during* the chain animation. Long chains end in unbreakable finishers. This is Tekken's most dramatic grapple system — a knowledge-check minigame mid-match.

**AshLane mapping:**
- ADOPT: lead-arm break reads (`1`/`2`/`1+2`); back throws unbreakable; throws beat armor; generic throws homing.
- ADAPT: AshLane's `grapple-system.ts` already does paired deliverer/receiver playback with position contexts — ahead of most brawlers. Add the **break window**: a short reactable window at grab start where the defender inputs the matching break. Add a simplified **2-link chain throw** for grappler-style characters (King-inspired): starter → branch A/B, each breakable, ending in an unbreakable slam.
- MISSING: throw-break inputs entirely (verify — `movesets.ts` marks grapples `unblockable` but is there a break mechanic?); side/back throw distinctions; crouch-throw 50/50s.

---

## 5. TEKKEN — Combat States

### 5.1 Stance states
- **Standing / crouching (FC):** full crouch enables FC moves; rising gives WS moves.
- **While standing (WS):** the rising frames — WS moves (e.g. `WS+2`) are often launchers; a core punish tool.
- **Backturned (BT):** back to opponent; some characters have BT-only moves; being BT is dangerous.
- **While running (WR):** running attacks (`WR+2` etc.) — big commitment moves.

### 5.2 Hit-reaction states
- **Stuns:** minor stun (MS), kneel stun (KS), crumple stun (CS — slow collapse, comboable), crumple fall (CF/CFS — collapses, different combo routing), double-over stun (DS), fall-back stun (FS), stagger (SH).
- **Spike:** slams airborne opponent straight down — denies tech roll.
- **Wallsplat:** stuck on wall, bonus combo available.
- **Ground throw / pounce states:** opponent fully grounded.

### 5.3 Grounded positions and oki (wakeup game)
Grounded positions: face-up feet-toward (KND — most common), face-up head-toward (PLD/"play dead"), face-down variants (SLD/FCD), and **off-axis** (lying sideways — some moves only hit grounded opponents off-axis).

Wakeup options from KND: quickstand (`u`, fastest/safest, then block), tech/ukemi roll (attack button on ground impact — side roll + stand), back roll, spring-up attack, wakeup mid kick, wakeup low kick, toe kick, forward roll into attack, or just stay down (some situations staying down avoids worse).

Attacking grounded opponents: pounce (`u/u/f+2`-style), trample (run-up stomp), sliding kick, cross chop — plus character-specific ground-hitting moves.

**AshLane mapping:**
- ADOPT: the grounded-position vocabulary (KND/PLD/off-axis at minimum); quickstand vs tech-roll vs stay-down as real choices; spike denying tech; pounce attacks on grounded opponents.
- ADAPT: simplify to 3 grounded positions (face-up, face-down, off-axis) — Tekken's 8-way split is overkill for a brawler.
- MISSING (verify): formal oki layer — does AshLane's knockdown currently offer tech-roll/quickstand/wakeup-kick choices, or is wakeup automatic? `movesets.ts` has `rise`/`kip` clips and armor-on-rise moves, which suggests partial coverage. The **attacker's** oki tools (meaty timing, ground-hit moves) need design.

---

## 6. TEKKEN — Stances & Style Differentiation

How Tekken makes characters mechanically distinct beyond movelists:

- **Mishima style (Kazuya/Jin/Heihachi/Reina/Devil Jin):** wavedash approach, crouch-dash mixups (hellsweep low vs mid launcher 50/50), Electric Wind God Fist (just-frame launcher, the execution skill-check), strong punishment.
- **Capoeira (Eddy):** ginga sway, handstand/grounded stances, unpredictable low/high flow.
- **Wrestling grappler (King/Armor King):** 40+ throws, chain throws, strong oki, weaker neutral.
- **Boxing (Steve):** sway/duck/bob weave stances, no kicks — rushdown through stance evasion.
- **Stance dancers (Hwoarang, Xiaoyu, Zafina):** multiple named stances with their own movelists; offense flows stance→stance.
- **Tricksters (Yoshimitsu, Lei):** huge stance count, unorthodox tools (sword, suicide moves, play-dead).
- **Turtles (Jack, Kuma):** big bodies, keepout, strong punishment, weak sidestep.

Design lesson: **a stance is a sub-moveset with its own risk profile**, and style = which questions the character asks (Mishima: "guess the 50/50"; King: "break the throw"; Steve: "catch me swaying").

**AshLane status:** ✅ 14 styles in `FIGHTING_STYLES.md` (street, boxing, kickboxing, wrestling, martial-arts, lucha, capoeira, drunken, muay-thai, …); ✅ `stance` property on moves; ✅ Kiko Tanaka has a Five-Animals stance set. ⚠️ Push further: give each style 1–2 **named stances with real sub-movelists**, and define each style's core question like Tekken does.

---

## 7. URBAN REIGN — The Brawler Blueprint

### 7.1 Inputs (4 buttons, directional regions)
- **Strike, Grapple, Dash, Evade** — that's the whole controller.
- **No block button.** Defense is a **timed evade** (must match the attack's timing); pressing **up/down + evade** at the right moment = **reversal** of the incoming attack. Even surrounded, perfect timing beats everything.
- **Directional regions:** stick direction selects hit region — up-flavors (`u/b,u,u/f`) = head/chest, neutral-flavors (`b,n,f`) = mid/abdomen, down-flavors (`d/b,d,d/f`) = legs. Damage is **limb/region-specific**: targeting legs degrades mobility, head shots open different reactions.
- **Strike + Grapple together = Special Art:** costs special meter, **cannot be countered/reversed/dodged except by another special**, and can be buffered.

### 7.2 Combo grammar
Deliberately simple: most combos open with **three strike presses, the third juggles**. Then branch: air grapple, special art, continue the string, or disengage (grab a weapon, reposition). Depth comes from positioning and grapple choices, not memorized strings.

### 7.3 Grapple system (the richest part)
- **Low and high grapples** (region-selected), **air grapples** (catching juggled opponents mid-air — character-specific animations), **counters and recounters** (grapple-counter chains, Tobal 2 lineage).
- **Team-up grapples:** you + AI partner (or co-op player) grab the same enemy simultaneously = tandem attack.
- **Ground grapples:** straddle a downed enemy and strike; pile drivers and twisty throws.
- Every character has their own animations for each grapple type.

### 7.4 Multi-directional movement & targeting (THE differentiator vs Tekken)
Full 3D arena movement, free targeting between multiple opponents, dash for repositioning, and **wall-run**: agile characters run up walls into aerial attacks. Environmental damage — smashing enemies into cars, crates, walls, railings for bonus damage.

### 7.5 Weapons
Pick up bats, pipes, knives, bottles, swords. Each has a **durability meter**; can be thrown to stun or used to extend combos. Weapons change the risk math without dominating.

**AshLane mapping:**
- ADOPT: timed-evade-instead-of-block as a defensive *option* (keep block too — AshLane already has guard); reversal on up/down+evade; region-based strike targeting; air grapples off juggles; team-up tandem grapples (lieutenants system!); weapon durability; wall-run attacks; environmental bonus damage.
- ADAPT: 4-button simplicity → AshLane's limb-based Tekken inputs are already deeper; keep Tekken inputs, add Urban Reign's *grapple variety* (low/high/air/counter/recounter) and *multi-enemy targeting*.
- MISSING (verify): air grapples; grapple counters/recounters; tandem team-up grapples; wall-run; weapon durability; region-specific damage effects (AshLane has head/chest/legs per-body damage per COMBAT_INTEGRATION — wire it to *effects*, not just numbers).

---

## 8. AshLane Gap Checklist (verify in code, then implement)

### Inputs & movement
- [ ] Sidestep with cancel windows + `SS+button` attacks
- [ ] Backdash with vulnerable recovery frames
- [ ] Dash-cancel (simplified KBD) for fast repositioning
- [ ] `homing` move property
- [ ] Confirm WS/WR/BT are real engine states, not notation labels

### Defense
- [ ] Timed evade option alongside block (Urban Reign style)
- [ ] Reversal: up/down + evade at the right moment
- [ ] Throw-break system: `1`/`2`/`1+2` lead-arm reads, break window at grab start
- [ ] Throws beat armor (Power Crush rule)
- [ ] Back/side/crouch throw distinctions

### Offense
- [ ] `high-crush` / `low-crush` properties
- [ ] CH-upgraded properties (`launcher-on-CH` etc.)
- [ ] Formal juggle state: gravity + damage scaling + one-extension-per-combo rule
- [ ] `spike` property denying tech roll
- [ ] Screw/bound-style extension move (one per combo)

### Grapples
- [ ] Low vs high grapple selection
- [ ] Air grapples (catch juggled opponents)
- [ ] Grapple counters and recounters
- [ ] 2-link chain throws for grappler characters
- [ ] Tandem team-up grapples (player + ally on one enemy)

### Oki / grounded
- [ ] 3 grounded positions (face-up / face-down / off-axis)
- [ ] Wakeup choices: quickstand / tech-roll / stay-down / wakeup kicks
- [ ] Attacker oki tools: ground-hitting moves, pounce, meaty timing

### Styles
- [ ] 1–2 named stances per style with real sub-movelists
- [ ] Each style's "core question" defined (Mishima 50/50, King throw-break, Steve sway…)

### Multi-enemy (Urban Reign's home turf)
- [ ] Free multi-target switching in combos
- [ ] Weapon durability meters
- [ ] Wall-run attacks for agile styles
- [ ] Environmental bonus damage (walls, cars, railings)

---

*End of systems teardown. Per-character reference: MOVESET_LIBRARY_TEKKEN.md, MOVESET_LIBRARY_URBAN_REIGN.md.*
