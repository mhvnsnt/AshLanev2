# New Drive Assets — Wrestling Moves & Models

**Source:** https://drive.google.com/drive/folders/1chJYomdZW6E7jqUUHZTn1w9wLTakRfvG
**Pulled:** 2026-10-06
**Total:** 100 files (28 FBX, 72 TGA)

## Wrestling Move Animations (25)

Real wrestling move animations converted from FBX to GLB. Each contains full skeletal animation data.

| Move | File | Type |
|------|------|------|
| DDT | `DDT.glb` | Finisher |
| Suplex | `Suplex.glb` | Throw |
| German Suplex | `GermanSuplex.glb` | Throw |
| Pop-Up German Suplex | `PopUpGermanSuplex.glb` | Throw |
| Snap Piledrivers | `SnapPiledrivers.glb` | Finisher |
| Brain Buster | `BrainBuster.glb` | Finisher |
| Vertical Brain Buster | `VerticalBrainBuster.glb` | Finisher |
| Neck Breaker | `NeckBreaker.glb` | Strike/Throw |
| Hurricanrana | `HurricaneRana.glb` | Aerial |
| Dragon Screw | `DragonScrew.glb` | Leg attack |
| Assisted Cutter | `AssistedCutter.glb` | Tag finisher |
| School Boy Superkick | `SchoolBoySuperkick.glb` | Strike combo |
| Fatality | `Fatality.glb` | Finisher |
| Face Gouge | `FaceGouge.glb` | Illegal attack |
| Table Impact | `TableImpact.glb` | Environmental |
| Cartwheel | `Cartwheel.glb` | Movement |
| Spinning Arms Spread | `SpinningArmsSpread.fbx` | Taunt |
| Crotch Chop | `CrotchChop.glb` | Taunt |
| WBTC | `WBTC.glb` | Taunt |
| Tau GameOver | `Tau_GameOver.glb` | Taunt |
| Tau Diva | `Tau_Diva.glb` | Taunt |
| Tau Headcrack | `Tau_HEADCRACK.glb` | Strike |
| Tau ButtSlap | `Tau_ButtSlap.glb` | Taunt |
| Tau General Female | `Tau_GeneralFemale.glb` | Taunt |
| Kofi Kingston Taunt | `Taunt_KofiKingston.glb` | Taunt |

**Location:** `public/motion/wrestling/`

**Integration:** These feed into `src/game3d/animation-system.ts`. Each GLB contains skeletal animation clips that can be retargeted to character rigs.

## Character Models (3)

| File | Status |
|------|--------|
| `BRIAN_CAGE_source.glb` | Needs character assignment + reskin. Muscular powerhouse with mohawk. |
| `JUDAS_alt_source.glb` | Alternate Chris Jericho source. Compare with existing `JUDAS.glb`. |
| `ShoulderBag.glb` | Prop/accessory model. |

### Brian Cage — Character Assignment Candidates

**Not assigned.** Owner to decide. Candidates from canon roster (no model yet):

1. **"Big Dawg" Titus** — Corporate guard/powerhouse. Build matches.
2. **The Lion of Punjab** — Punjabi powerhouse. Build matches.
3. **Ryuji Tatsu ("The Dragon")** — Physical wall. Build matches.

**Do NOT assign without owner confirmation.**

## Wrestler Textures (39 WebP)

Converted from TGA to WebP (~90% size reduction). Body parts, clothing, accessories.

**Location:** `public/textures/wrestler/`

Types: body, eye, eyelash, hair, kneepads, masks, mouth, piercings, scarf, shirts, shoes, tights, trunks, wrist.

## ⚠️ LEGAL NOTE

These assets appear to be **game-ripped wrestling content** (WWE/AEW game models, animations, and textures).

**Allowed:**
- Internal prototyping and development
- Animation reference and retargeting research
- Texture study for original reskin work

**NOT allowed:**
- Shipping exact ripped meshes/textures in a paid release
- Redistributing raw ripped assets

**Before any commercial release:** Ripped meshes must be remodeled (not just reskinned). Reskinning alone does not clear copyright. See `Bannon/docs/ASSET_RENAME_PLAN.md` for the established reskin/remodel policy.

**Animations:** Mocap-style wrestling move data is generally safer than mesh rips, but verify provenance before commercial use. When in doubt, use as reference to create original animations via the MediaPipe mocap pipeline.
