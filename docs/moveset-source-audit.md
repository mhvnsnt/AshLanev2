# Moveset source audit — AshLanev2

Audit date: 2026-10-04/05. This is a source-data and integration audit, not visual certification.

## Schwarzerblitz fork: what the 131 definitions actually mean

The user-owned fork inspected is `mhvnsnt/SchwarzerblitzEngine`, branch `master`. The available `moves.txt` files are:

| File | Definitions | Meaning |
| --- | ---: | --- |
| `chara_dummy/moves.txt` | 24 | dummy/test move data |
| `chara_tutor/moves.txt` | 47 | tutorial character move data |
| `chara_tutor2/moves.txt` | 47 | second tutorial character move data |
| `common/moves.txt` | 13 | shared/common movement and combat definitions |
| **Total** | **131** | Not 131 unique character-specific moves |

Therefore, this intake is **not yet four complete character movesets**. It is two tutorial-character move files, a dummy/test file, and shared/common definitions. Do not assign these as four finished main-fighter kits without finding and auditing additional character-specific data.

## Actual bank compatibility check

Compared the source animation references in the 131 move definitions with the current `public/motion/bank.json` keys.

- Schwarzerblitz move definitions: 131
- Distinct non-empty source animation references: 69
- Current AshLane baked bank keys: 50
- Exact animation-name matches: **0**

The zero-match result means the catalog is useful as a *move structure/frame-data reference*, but it does not prove any Schwarzerblitz animation is playable in AshLane. Do not wire source animation names into the runtime bank as if those clips exist. For each desired move, select a rights-cleared clip from a compatible source, map its semantic role, and test it on the target rig.

## Verified data worth reusing as a design schema

The Schwarzerblitz move format contains input commands, stance/state restrictions, animation references, active frame ranges, hitbox rows, movement, cancel/follow-up data, and reactions. This provides a useful structure for AshLane's own moveset manifest:

- `input`: actual AshLane control route, including directional modifier
- `state`: grounded, crouching, running, airborne, downed, or recovery
- `startup/active/recovery`: only fill when supported by authored source data or measured gameplay
- `hitbox`: geometry and active frame interval
- `reaction`: hit, launch, knockdown, wall response, or throw receiver
- `animation`: exact bank key only; unresolved mappings remain null
- `source/license`: provenance and redistribution permission
- `verification`: catalogued, mapped, rig-tested, gameplay-tested

Do not translate Schwarzerblitz keyboard notation literally into AshLane controller buttons. Preserve AshLane's Urban Reign-inspired button grammar and translate move intent into AshLane's input layer.

## Main-fighter assignment policy

The four main GLB fighters should be chosen from the actual project roster and user-provided GOB assets, not guessed from tutorial character names. Once their intended IDs are confirmed in the project assets, build a move matrix for each one:

1. Neutral stance and movement.
2. Jab/cross and character-specific chain.
3. High/mid/low directional strikes.
4. Launcher, juggle/air strike, and landing recovery.
5. Sweep and grounded-opponent attack.
6. Front high/low throw, rear throw, counter, and receiver reactions.
7. Dodge/deflect, backstep, and wake-up/ukemi.
8. Wall follow-up, running strike, and signature move.
9. Hit, launch, knockdown, prone, and get-up reactions.

Shared foundations can be reused, but each fighter's animation choices and timing must be verified against the character's style and the actual clips available.

## Open-source source-selection rules

Use open-source game repositories first for architecture, state machines, move schemas, tests, and input ideas. Use asset repositories for actual animation files only when their license explicitly allows redistribution and the rig/clip can be inspected.

- [SchwarzerblitzEngine](https://github.com/mhvnsnt/SchwarzerblitzEngine): primary user-owned move-data reference. The upstream engine code is BSD-3-Clause; bundled game assets have separate restrictions unless specifically credited. Do not copy those game assets into AshLane.
- [SlopArena](https://github.com/Binoui/SlopArena): MIT-licensed 3D platform-fighter architecture with character packages, move-slot manifests, and tests. Useful for package/validation design; its Smash-like combat is not a direct Urban Reign moveset source.
- [PyFighter](https://github.com/gamesketches/PyFighter): text-defined 2D fighter moves, hitboxes, animation frames, and inputs. Treat as schema/architecture reference only until its repository license and any bundled assets are explicitly checked; its 2D sprites are not directly usable as AshLane 3D animations.
- [Universal Smash System / TUSSLE](https://github.com/digiholic/universalSmashSystem): GPL-3.0 project with fighter modules and mod-oriented architecture. Review GPL compatibility before importing code; do not take bundled character sprites or music without checking their individual rights.
- [Quaternius Universal Animation Library](https://quaternius.com/): candidate for CC0 animation intake. Each downloaded archive still needs provenance, exact clip inventory, skeleton audit, and a runtime test before a clip is marked usable.
- [Kenney assets](https://kenney.nl/assets): CC0 assets are useful for prototypes and environment/character variety; only use a specific animation pack for combat when its actual contents support the needed move roles.

## Acceptance gates

A move is not considered playable until all of these pass:

1. Rights/provenance recorded.
2. Exact animation asset exists in the checked-in bank or licensed source package.
3. Rig and retarget result inspected.
4. Correct attacker/receiver role verified for throws.
5. Correct state/input mapping confirmed in AshLane.
6. Startup/active/recovery and hit reaction checked in gameplay.
7. Existing roster, movement, and mission-start tests still pass.

Unknown remains unknown; do not substitute a similar clip silently.
