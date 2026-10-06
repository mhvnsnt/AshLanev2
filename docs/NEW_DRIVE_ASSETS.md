# New Drive Assets — 2026-10-06 Pull

Source: Google Drive folder shared by owner (`1chJYomdZW6E7jqUUHZTn1w9wLTakRfvG`), 100 files.

## Contents

### Wrestling move animations (25 → `public/motion/wrestling-moves.json`)
Baked from WWE 2K FBX files via fbx2gltf → `bake_moves.py` (workspace:
`~/workspace/new-drive-assets/`). Format matches `bank.json` exactly
(`dur`, `times`, `atk`/`vic` 16-bone delta quaternions), plus an optional
`rootMotion` extension (ignored by the current loader).

| Clip | Type | Duration | Notes |
|---|---|---|---|
| `ddt2` | paired | 5.71s | alt of bank `ddt` |
| `suplex2` | paired | 6.00s | alt of bank `suplex` |
| `german2` | paired | 7.83s | alt of bank `german` |
| `popup_german` | paired | 7.00s | pop-up variant |
| `piledriver` | paired | 12.00s | snap piledrivers |
| `brainbuster2` | paired | 7.46s | alt of bank `brainbuster` |
| `vertical_brainbuster` | paired | 9.00s | delayed vertical |
| `neckbreaker` | paired | 4.38s | |
| `hurricanrana` | paired | 4.83s | |
| `dragonscrew` | paired | 6.00s | leg whip |
| `assisted_cutter` | paired | 12.00s | |
| `schoolboy_superkick` | paired | 7.00s | combo |
| `fatality` | paired | 12.00s | |
| `facegouge` | paired | 5.00s | illegal tactic |
| `table_impact` | paired | 10.00s | through-table spot |
| `cartwheel` | solo | 4.83s | evasive |
| `spinning_arms` | solo | 6.67s | taunt-ish |
| `crotch_chop` | solo | 5.00s | taunt |
| `wbtc` | solo | 3.54s | |
| `taunt_gameover` / `taunt_diva` / `taunt_headcrack` / `taunt_buttslap` / `taunt_female` / `taunt_kofi` | solo | 3–6s | taunts |

**Integration:** run `python3 tools/animation/merge_wrestling_moves.py [--dry-run]`
to merge into `bank.json`, then wire clip names into `src/game3d/animation-system.ts`
fallbacks. The animation-system agent owns playback wiring.

**Bake method:** delta quaternions `D = inverse(rest) * animated`, so clips are
rest-pose relative (same convention as `motion-bank.ts` `bakeRole`). Dropped
intermediate bones (J_Spine2, J_Neck, J_Clavicle) are baked into their children
to preserve exact world motion. 40 uniform samples per clip.

### Character models
- `public/models/cast/BRIAN_CAGE_source.glb` — WWE 2K Brian Cage rip, **unassigned**.
  Candidates discussed: Big Dawg Titus, Lion of Punjab, Ryuji Tatsu — **owner decides**.
  Do NOT assign without owner approval.
- `Chris_Jericho.fbx` → identical to existing `JUDAS.glb` (35,902 verts, same source).
  No replacement needed; Judas reskin continues on the existing file.
- `public/models/props/ShoulderBag.glb` — shoulder bag prop (6 MB, check before shipping).

### Textures (`public/textures/wrestler/`, 39 WebP)
Converted from the 70 TGA files (color + normal maps for body, hair, tights,
kneepads, shoes, masks, etc.). Original TGAs kept at
`~/workspace/new-drive-assets/textures/`. WebP versions are game-ready.

## Legal
These are **game-ripped wrestling assets** (WWE 2K). OK for prototyping and
internal development. **Exact ripped meshes/textures must be remodeled or
replaced before any paid release.** Reskin policy applies: light reskins to
match canon likeness, strip proprietary logos only.
