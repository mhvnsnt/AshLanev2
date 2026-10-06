# AshLane Animation Inventory & Gap Analysis

**Date:** 2026-10-06
**License note:** CMU Mocap data is free for commercial use worldwide (mocap.cs.cmu.edu).
Acknowledgment: "The data used in this project was obtained from mocap.cs.cmu.edu.
The database was created with funding from NSF EIA-0196217."

---

## Source 1: bank.json (50 clips, in-repo)

**Strikes:** boxing, boxing1, boxing2, boxing3, jabcross, combo, bodyblow,
elbow, knee, slugger, dropkick, hurricane, capoeira

**Grapples (PAIRED — has vic track):** takedown, suplex, german, ddt,
brainbuster, chokeslam, backdrop

**Defense:** block, guardhigh, guardlow, defender, esquiva, evade, corkscrew

**Hit reactions:** hit, hithead, hitbody, hitside, hitback, rib

**Knockdown/recovery:** fallflat, flat, kip, rise, corkscrew

**Movement:** boxidle, crouch, stancecrouch, bigjump, crossjump, drunkwalk,
drunkidle, ginga, gingaback, gingaside

**Style/flavor:** au, feral, tiger

## Source 2: CMU Mocap additions (12 clips, NEW in cmu-bank.json)

| Clip | Source | Duration | Use |
|------|--------|----------|-----|
| walk | CMU 02_01 | 2.9s | Walk cycle |
| run | CMU 09_01 | 1.3s | Run cycle |
| front_kick | CMU 144_05 | 23.2s | Front kick (trim to action) |
| front_kick_left | CMU 144_09 | 28.2s | Left front kick (trim) |
| karate_maegeri | CMU 135_04 | 11.0s | Karate front kick (trim) |
| karate_mawashi | CMU 135_07 | 12.3s | Roundhouse kick (trim) |
| punch_kick | CMU 143_23 | 6.8s | Punch/kick combo |
| punch_kick2 | CMU 143_24 | 8.4s | Punch/kick combo 2 |
| punch_seq | CMU 144_20 | 18.9s | Punch sequence (trim) |
| block_left | CMU 144_07 | 20.4s | Left block (trim) |
| boxing_cmu | CMU 13_17 | 40.4s | Boxing (trim) |
| kick_punch_knee | CMU 86_06 | 82.8s | Kick/punch/knee (trim) |

**Note:** Long clips contain multiple actions with pauses. Trim to the
action segments for game use. The full takes are preserved for reference.

## Source 3: Drive FBX library (102 files, not yet converted)

Mixamo-style packs covering: boxing variants, hit reactions, falls,
capoeira/breakdance, injured locomotion, climbing, weapon swings.
Heavy overlap with bank.json. Priority conversions for gaps:
- Clean walk/run (if CMU versions don't suit)
- Weapon pickup/throw
- Additional grapple victims

## Source 4: UAL Library (in-repo, public/motion/ual/)

Universal Animation Library GLBs. Loaded via retargetUal() in motion-bank.ts.

---

## Gap Analysis: Mechanics → Animations

### ✅ COVERED (real clips in bank)
- Punches: jab, cross, hook, uppercut, overhand, body blow
- Elbows, knees
- Basic kicks: front, drop, hurricane
- All 5 hit reactions (head/body/side/back)
- Knockdowns (front/back)
- Getups (kip-up, rise)
- 7 paired grapples (takedown, suplex, german, DDT, brainbuster, chokeslam, backdrop)
- High/low blocks, dodges, parries
- Walk, run (NEW from CMU)

### ⚠️ PARTIAL (clip exists but needs work)
- **Kicks:** CMU clips are long takes — need trimming to action segments
- **Spinning attacks:** capoeira/hurricane cover the flavor, may need specific spin kick
- **Clinch entry:** takedown clip covers the takedown, clinch hold needs a loop

### ❌ MISSING (flagged for MediaPipe capture or future pull)
1. **Ground mounted strikes** — attacker on top punching down
2. **Ground transitions** — shrimp, bridge, sweep (BJJ basics)
3. **Ground submissions** — armbar, choke from guard (paired)
4. **Reversals/counters** — catch a punch, reverse into throw (paired)
5. **Weapon pickup** — bend down, grab
6. **Weapon throw** — overhand throw
7. **Wall splat** — back hits wall, slump
8. **Crowd animations** — cheer, jeer, shove-back, hold-down
9. **Clinch strikes** — knees/elbows from clinch
10. **Corner trap** — pinned in corner sequence

### MediaPipe Capture List (owner can act these out)
Priority order:
1. Ground mounted strikes (30 sec)
2. Reversal/counter (paired, 30 sec)
3. Weapon pickup + throw (30 sec)
4. Wall splat (15 sec)
5. Crowd cheer/jeer loop (15 sec each)

---

## System Architecture

```
sim.ts (game logic, states)
  → animation-system.ts (THIS — state machine, clip mapping, blending)
    → motion-bank.ts (loads bank.json + cmu-bank.json, bakes to rig)
      → universal-retarget.ts (any skeleton → any model)
        → THREE.AnimationMixer (playback)
```

**Key files:**
- `src/game3d/animation-system.ts` — state machine, paired grapples
- `public/motion/bank.json` — 50 original clips
- `public/motion/cmu-bank.json` — 12 CMU clips (NEW)
- `src/game3d/motion-bank.ts` — loader (EXTENDED to load cmu-bank.json)

**No procedural faking.** Every combat state plays a real mocap clip.
Blending between states uses crossfade (0.15s default).
Committed actions (attacks, grapples, knockdowns) lock until complete.
Hit reactions interrupt anything (forceState).
