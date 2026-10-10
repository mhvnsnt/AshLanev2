# Tekken as Design Inspiration for AshLane

*Studied 2026-10-10 via match-video coverage, guides, design analyses, developer interviews, and wiki documentation. No live play (Tekken can't run in a browser). Ordered by impact ÷ implementation cost for a small indie team.*

AshLane is an Urban Reign-style street brawler — 85/15 street-to-wrestling, street-real, humans-only. Tekken's 1v1 systems don't transplant directly (Tekken learned that lesson twice — see the scope section), but its *feel and geometry systems* translate hard.

## Tier S — Do these first (cheap, transformative)

**1. Low-health slow-motion on decisive blows (Tekken 7's "super slow motion").**
When both fighters are low on health and trade blows, Tekken 7 drops into super slow motion. Harada's stated goal: so *spectators* feel the tide turn — "viewers can feel the same excitement as the player." For AshLane: trigger a timescale dip on boss kills, low-HP trades, and wave-ending launchers. Hours of implementation, massive clip value.

**2. Gravity-scaled juggles with an explicit ender decision.**
Tekken's grammar: every juggle hit pushes the opponent further away and damage scales per hit — Launcher → filler → **ender, chosen for okizeme vs. wall carry vs. raw damage** ("the wall is strong"). In crowd combat this turns the launcher from a damage tool into a **crowd-control tool that buys positioning**: launch one thug, juggle while the pack repositions, choose where the body lands — slam into the crowd (AoE), carry toward a wall, or spike down for breathing room. Scaling prevents infinites.

**3. Movement IS the defense (the single biggest Tekken lesson).**
Sidestep evades linear attacks. Sidewalk circles the opponent. Backdash creates whiff-punish spacing with cancelable recovery. For AshLane's crowds: a true dodge step with evasion frames and cancel windows — and teach that **circling the pack beats backing up**. Enemies surrounding the player is the #1 brawler death; Tekken's footwork grammar is the answer no classic brawler built.

**4. The wall as a weapon.**
Wallsplat a foe, get guaranteed follow-ups. AshLane's alleys are full of walls — storefronts, parked cars, pillars, fences. Make them combo surfaces: bounce enemies off walls for bonus hits, carry juggled enemies across the screen into them. Static geometry becomes part of the moveset.

**5. Hitstop, scaled hit sparks, impact sound.**
Freeze a few frames on launcher/heavy hits, scale spark size and sound pitch with damage, tiny camera punch-in on counter-hits. Tekken 3's hit audio is still praised 30 years later. Cheap, proven — pair with the slow-mo for finishers.

## Tier A — High impact, moderate work

**6. Stage breaks as level punctuation.**
Floor breaks (spike → floor shatters → fight continues below), balcony breaks (through a railing into a lower arena). Rules: breaks are *earned* by specific slam moves, not random — and Tekken 7 deliberately removed extra damage from floor breaks. The reward is spectacle and positional reset, not power creep. Knock a boss through a storefront window into the shop interior. Best brawler-native idea in Tekken's kit.

**7. A real wakeup game (okizeme).**
Staying down means you *can't be relaunched*; getup options are punishable; tech rolls go in chosen directions. Two-way depth: when the player is knocked down in a crowd, give a real choice (stay down safe but lose tempo, quick rise risky, wakeup attack with recovery). Enemies knocked down shouldn't just pop back up either.

**8. Stances as cheap roster multiplication.**
Eddy's handstand: more range and speed, but he cannot sidestep at all. Alternate modes that change attacks *and* trade-offs. Fewer bodies with stance toggles — a moveset remix with an explicit weakness — is far cheaper than new skeletons.

**9. Character-specific movement identity (the Mishima wavedash).**
Differentiate through how fighters *move*, not just how they hit. One slides through enemies, one shoulder-charges with armor, one backdashes into a strike. Movement identity reads instantly on screen.

**10. Asymmetric defense (resist the universal parry).**
Tekken deliberately doesn't give everyone the same defense: reversals are character-specific with different rules and counters. Give the roster *different* defensive answers — one parries, one dodge-counters, one armors through, one chain-grabs. Asymmetry is replayability; a universal parry is a solved system.

**11. Chain throws as the grappler fantasy (King's multi-throw).**
An escalating input chain — slam the grabbed enemy *into the crowd* (AoE), piledriver (single-target burst), or toss *at a wall*. Gives the player an answer to blocking/turtling enemies and makes the grappler archetype distinct without new tech. Fits AshLane's wrestling 15% perfectly.

## Tier B — Boss design

**12. Bosses transform mid-fight (Kazumi, True Ogre).**
Kazumi shifts into devil form after losing the first round — new wings, new sweeping attacks, plus a tiger companion forcing two-threat tracking. Rule: at an HP threshold the boss must visibly change and invalidate the player's current reads. Contrast Jinpachi (Tekken 5), remembered for cheapness — transformative difficulty, not unfair difficulty.

**13. The boss that steals your moves (Ogre, Mokujin).**
A late-game boss that uses the player's own signature moves — cheap to build (reuse the player animation set, retimed), psychologically nasty, teaches the player their own kit's weaknesses.

## The scope lesson — Tekken Force, not Scenario Campaign

Tekken already tried bolting a fighter onto crowd combat twice, and the postmortem is the most valuable part:

- **Steal Tekken 3's Tekken Force:** 4 compact stages, each ending with a roster character as boss, secret unlockable boss. Beloved *because it was bounded* — a side dish, not the meal.
- **Do NOT repeat Tekken 6's Scenario Campaign:** "rigid controls, uninspired enemies and boring bosses" — stiff unresponsive movement, identical corridors of identical thugs, garbage camera/lock-on, and the core error of transplanting the full 100+-move 1v1 moveset (players spam the one move that works). Notably, reviewers compared it unfavorably to **Urban Reign**, whose simplified controls felt satisfying within seconds — and Urban Reign is AshLane's direct north star.

**The synthesis:** brawler controls must be *simpler and snappier than the 1v1 moveset*, not a transplant — auto-facing, generous hitboxes, one-button launcher, crowd-framing camera, keep the dodge. Steal Scenario Campaign's item-drop/customization unlock loop, not its level design.

## What Tekken teaches that Final Fight / Streets of Rage / Metal Slug do NOT

1. **Movement as the primary defense** — dodge with cancel windows and evasion as a core verb.
2. **A real high/low/throw mixup grammar** — the block button becomes a decision.
3. **Gravity-scaled juggles as a resource** — combos with opportunity cost.
4. **The environment as combo geometry** — walls and floors as weapons.
5. **Asymmetric tools over symmetric verbs** — differentiation through exclusive mechanics.
6. **Okizeme** — the ground as a decision point.
7. **Spectator-oriented drama engineering** — slow-mo designed for the viewer.
8. **The brawler-mode failure data itself** — what happens when 1v1 systems meet crowd combat.
