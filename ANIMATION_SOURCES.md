# AshLane Animation Pipeline and Source Registry

This document tracks the animation and asset sources currently used in AshLane, the sources being evaluated, and the integration path for the full moveset expansion.

## Current sources

### Active and integrated

#### Quaternius CC0 library
- Status: Integrated
- Source: https://quaternius.com/
- License: CC0 / Public Domain
- Notes: Used as the primary free motion library for strikes, movement, crouch, hits, jumps, death, and idle variations.

#### KayKit humanoid fighter assets
- Status: Integrated
- Source: https://kaykit.dev/
- Notes: Open-source humanoid roster is already exposed as playable roster entries; motion bank remains aligned to the mannequin skeleton.

#### Kenney CC0 props and environment packs
- Status: Partially integrated
- Source: https://kenney.nl/
- Notes: Used for environment props, creatures, grass, trees, and some city-shell content in the world layout.

#### Existing retargeting pipeline
- Status: Integrated
- Notes: Mesh assets are retargeted to the mannequin skeleton; the mission-start freeze was fixed by switching from per-vertex nearest-bone sorting to a 4-nearest-bone approach and by deferring custom fitting to browser idle time.

### Pending integration

#### User-owned SchwarzerblitzEngine fork
- Status: Source tree audited; move data is reference-only, not imported as playable animation.
- Source: https://github.com/mhvnsnt/SchwarzerblitzEngine (default branch `master`)
- Verified inventory: only four `moves.txt` files were found: `common` (13 definitions), `chara_dummy` (24), `chara_tutor` (47), and `chara_tutor2` (47), 131 definitions total.
- Important limitation: the dummy, tutorial, and shared files are not four complete main-fighter movesets. Their 69 distinct animation references have zero exact-name matches against AshLane's 50-key baked bank. The source tree is an input/frame-data reference; it is not a plug-in set of four GLB-ready movesets.
- Next step: keep the move schema as a reference for input/state/frame/hitbox/cancel metadata, then map each intended AshLane fighter to clips that actually exist in the checked-in UAL/runtime bank. Do not claim a move works until the correct rig, input, attacker/receiver role, and in-game reaction are tested.

#### Kenney animated character packs
- Status: Under review
- Notes: Good candidate for additional non-player and enemy variants, especially if the current rig stays consistent with the mannequin hierarchy.

#### Additional open-source environment packs
- Status: Under review
- Notes: Useful for filling out market, dock, yard, office, and other district variations without breaking the existing world layout.

## Open-source fighting-game and beat-'em-up references

- https://github.com/ikemen-engine/Ikemen-GO — MIT engine; study state machines, command inputs, hit definitions, cancels, and character data. Bundled motifs and community characters have separate rights.
- https://github.com/Binoui/SlopArena — MIT 3D platform fighter; study modular fighter packages, move-slot contracts, combat simulation tests, hitstop/hitstun, and validation. Its platform-fighter rules are reference material, not a replacement for AshLane's Urban Reign-inspired gameplay.
- https://github.com/KFCheems/Fury-Fist — MIT code; useful beat-'em-up/combo architecture. The README asks redistributors to check provenance of extracted upstream assets, so code reference only until assets are cleared.
- https://github.com/ironmoose/deathblood-lazer — MIT code, but art/audio/character designs are explicitly All Rights Reserved; use code patterns only.
- https://github.com/DCurrent/openbor — permissive BSD-style engine license; useful for beat-'em-up move/collision/wave logic, but its 2D modules and art are separately licensed and are not GLB animation sources.
- https://github.com/jefersondaniel/godot-mugen — BSD-3-Clause, early-stage browser-targeted MUGEN-like project; useful for comparing state architecture, not a 3D animation source.
- https://quaternius.com/ — CC0 animation/model packs; current UAL source files are already checked into `public/motion/ual/`.
- https://github.com/KayKit-Game-Assets/KayKit-Character-Pack-Adventures-1.0 — CC0; current character files and notices are already checked in.
- https://kenney.nl/ — CC0 packs for props/environment and selected character content; audit each pack's exact files before adding more.

Do not import a whole engine or a copyrighted character pack to obtain a move list. Record the exact repository commit, asset paths, license, and integration/test status for every intake.

## Integration workflow

### 1. License and compatibility check
- Confirm CC0 / permissive usage before importing a new motion source.
- Record the source URL, author, license, and any attribution requirements in the asset manifest.
- Confirm each pack's rig matches the game skeleton closely enough to retarget safely.

### 2. Rig normalization
- Standardize on the mannequin skeleton used by the current motion bank.
- Correct bone name mismatches and orientation offsets before animation playback.
- Preserve the existing cast pipeline; do not replace the current roster or file structure unless there is a clear compatibility win.

### 3. Character assignment
- Each character or enemy variant should map to a specific move set / style sheet.
- Keep the roster and moveset mapping explicit in source data rather than scattered across runtime logic.
- Add fallback behavior for any missing clip.

### 4. Runtime validation
- Verify the following at minimum for each imported source:
  - no broken bone bindings
  - no frozen pose or misaligned limbs
  - no main-thread hitch during load or retargeting
  - correct attack timing and state transitions
  - proper idle/walk/attack/guard/death sequencing

### 5. Documentation and attribution
- Every imported source must be documented with:
  - source URL
  - license info
  - relevant animations included
  - integration status
  - any retargeting adjustments needed

## Recommended next actions

- [ ] Audit the swarzerblits moveset repo for clip coverage and rig compatibility
- [ ] Clone or vendor any compatible open-source motion packs needed to complete the roster
- [ ] Add per-character moveset manifests to the project
- [ ] Expand the CI workflow so animation inventory and roster checks run in GitHub Actions
- [ ] Add a simple asset-validation script to catch missing bone names, motion gaps, and invalid clips

## Asset manifest example

```json
{
  "name": "swarzerblits-sword-moveset",
  "source": "https://github.com/swarzerblits",
  "license": "check-license",
  "rig": "mannequin",
  "status": "pending-integration",
  "characters": ["Knight", "Rogue"],
  "clips": ["idle", "walk", "jab", "hook", "guard", "heavy_attack", "special"],
  "notes": "Retarget if bone names differ from the current mannequin skeleton."
}
```

## Summary

AshLane already includes the Quaternius UAL source glTF/BIN, a baked motion bank, KayKit CC0 character bodies, and Kenney CC0 environment assets. The next win is not blindly importing the Schwarzerblitz tutorial/dummy files: it is making every roster martial style resolve to a verified clip profile, mapping the four intended main GLB fighters once their IDs are grounded, and extending the actual clip bank only with rights-cleared assets that pass rig and runtime checks.
