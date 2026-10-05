# Schwarzerblitz moveset intake for AshLane

Verified intake from the user-owned fork mhvnsnt/SchwarzerblitzEngine at master.

## Inspected move files
- bin/media/characters/common/moves.txt
- bin/media/characters/chara_dummy/moves.txt
- bin/media/characters/chara_tutor/moves.txt
- bin/media/characters/chara_tutor2/moves.txt

The catalog contains 131 move definitions. The companion JSON records move name, display name, animation reference, frame range, input, stance, range, and parsed hitbox rows where present.

Important: the Schwarzerblitz source tree explicitly marks bundled game assets/resources as restricted unless separately credited. AshLane does not copy Schwarzerblitz meshes, animation binaries, music, stages, or other restricted resources. This intake is combat/moveset reference data plus reusable engine-code concepts.

## Verified move-system structure
- Run / run-switch
- Backstep
- Side-step foreground/background and cancel variants
- Ukemi / forward and backward roll
- Ground attacks
- Air attacks
- High / medium / low attacks
- Launchers and flight reactions
- Running attacks
- Throws and throw reactions
- Follow-up chains
- Cancel windows
- Invincibility / armor windows
- Hitbox active frame ranges
- Ground / crouch / air / landing stances
- Movement during a move

## Representative verified source data
| Move | Input | Frames | Role |
| --- | --- | ---: | --- |
| Run1 | > > | 0-0 | run transition |
| BackStep | 4 4 | 0-5 | backdash/escape |
| SideStepBackground | 8 8 | 0-5 | defensive sidestep |
| SideStepForeground | 2 2 | 0-5 | defensive sidestep |
| Ukemi | T | 5-12 | recovery roll |
| RunningTackle | P | 0-14 | running attack |
| Jump_Punch | P while air | 0-5 | air attack |
| Jump_Kick | K while air | 0-6 | air attack |
| Quick_Kick | K | 0-6 | fast kick |
| Heavy_Kick | 4 + K | 0-12 | heavy attack |
| Gyaku_Zuki | 4 + P | 0-10 | directional punch |
| CrouchingKick | 2 + K | 0-9 | low attack |
| LowPunch2 | 3 + P | 0-10 | low/mid punch |
| Throw | T | 0-8 | grab starter |
| TW_KneeBash | follow-up | 0-18 | throw receiver sequence |
| GroundScarletScrew | 2 1 4 P | 0-14 | command/special |
| AirScarletScrew | 9 + P | 0-14 | air special |

These are source-data references, not claims that the corresponding Schwarzerblitz animation assets are present in AshLane.

## AshLane mapping
AshLane already exposes these gameplay slots in rig-pipeline.ts: jab, cross, launch, sweep, lunge, spin, dodge, hit, grab, throw, down, death, jump, fall, walk, run, back, strafeL, strafeR, block.

- P / quick punch / jab chains -> jab, cross
- directional strong punch / uppercut / launcher -> launch
- crouching kick / low sweep -> sweep
- running strike / shoulder / long advancing attack -> lunge
- spin / command special -> spin
- backstep / sidestep / ukemi -> back, dodge
- hit reactions -> hit
- throw starter -> grab
- throw result -> throw
- grounded/down/recovery -> down
- jumping / air attack -> jump, fall, launch

## Urban Reign bridge
Urban Reign is used only as a gameplay/input reference, not as an asset source.

- Attack button -> normal/directional attack
- Grab button -> directional/high/low/back grab
- Dash/run -> running attack state
- Dodge -> evasive/deflect state
- Target lock -> opponent-facing/targeting behavior
- Taunt -> taunt/wakeup interaction
- Direction + attack -> high/mid/low directional strike
- Direction + grab -> directional throw
- Grounded opponent + attack -> ground attack
- Running + attack/grab -> running strike/throw
- Air + attack/grab -> air attack/air grab
- Wall contact -> wall-specific follow-up

The source of truth for AshLane implementation remains the actual AshLane input/combat code. Urban Reign identifies missing gameplay categories; it does not override existing controls without an implementation check.

## No-guesswork rule
A move is not marked playable merely because a source move has a similar name.

Before a source animation is wired to a gameplay slot it must have:
1. A rights-cleared asset/source.
2. A supported skeleton family.
3. A known semantic role.
4. A verified runtime clip name.
5. A tested attacker/receiver role when it is a grapple.
6. A valid frame window.

Unknown or missing animation assets stay unassigned. The move catalog is therefore deliberately more complete than the playable motion bank.
