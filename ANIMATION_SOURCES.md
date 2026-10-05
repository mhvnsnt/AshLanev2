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

#### swarzerblits fork movesets
- Status: High priority
- Source: Your swarzerblits fork (same animation/moveset stack that is already known to be richer than the current free set)
- Goal: import the full moveset library and wire each character to the appropriate attack, block, fall, guard, and special state clips.
- Suggested path:
  1. Audit all move files and identify the exact rig conventions
  2. Check for bone naming or rotation differences against the mannequin rig
  3. Retarget only the clips that do not match the current skeleton
  4. Assign export metadata per character and move set
  5. Validate run-time state transitions and hit timing

#### Kenney animated character packs
- Status: Under review
- Notes: Good candidate for additional non-player and enemy variants, especially if the current rig stays consistent with the mannequin hierarchy.

#### Additional open-source environment packs
- Status: Under review
- Notes: Useful for filling out market, dock, yard, office, and other district variations without breaking the existing world layout.

## Candidate repositories to review

The following should be reviewed for compatible open-source combat and animation assets:

- https://github.com/KenneyNL/kenney-animations
- https://github.com/KenneyNL/kenney-micro-roguelike
- https://github.com/KenneyNL/kenney-asset-pack-3d
- https://github.com/Quaternius/Quaternius
- https://github.com/KayKit-3D
- https://github.com/swarzerblits
- Any downstream repos that mirror or re-export the same open-source animator packs in GLB format

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

The project is now in a good place to expand from the current free/open-source base into a richer, more complete combat animation stack. The main near-term win is to absorb the swarzerblits fork movesets and then evaluate additional CC0 motion sources that maintain the same rig conventions.
