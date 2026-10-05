# AshLane animation and content integration pipeline

This document defines the asset pipeline for AshLanev2: where animation sources come from, how they are validated, and how new open-source content is integrated without regressing the game loop.

## Goals

- Keep the existing KayKit/humanoid and custom cast pipeline working
- Preserve the low-friction roster with selectable characters
- Add more complete movesets from external open-source repos without breaking rig compatibility
- Track asset provenance, licensing, and integration status

## Current source inventory

### Active sources

- Quaternius CC0 animation library
  - Status: Active
  - Notes: Used as the main free motion set; several clips retargeted onto the mannequin hierarchy
- KayKit humanoid fighters
  - Status: Active
  - Notes: Selectable roster entries retained; cast mesh pipeline preserved
- Kenney CC0 environment packs
  - Status: Active
  - Notes: Props, cover, creatures, and world clutter already integrated
- Existing custom cast roster
  - Status: Active
  - Notes: Keep the current roster as the compatibility baseline

### Audited sources and next intake

- User-owned SchwarzerblitzEngine fork — https://github.com/mhvnsnt/SchwarzerblitzEngine
  - Status: Audited; reference-only.
  - Its `master` tree contains four `moves.txt` files: common (13), dummy (24), tutor (47), tutor2 (47). These are shared/tutorial/test definitions, not four complete main-fighter kits.
  - 69 distinct source animation references have zero exact-name matches in AshLane's 50-key baked bank. Do not wire those names as if the animations exist.
- Quaternius UAL2 / additional CC0 packs
  - Status: Candidate, not yet imported as a second binary pack.
  - Require exact archive/file inventory, license confirmation, clip-name extraction, rig test, and runtime validation before integration.
- Open-source combat-engine references
  - Ikemen GO (MIT engine), SlopArena (MIT 3D platform fighter), Fury-Fist (MIT code with separate asset provenance), Deathblood Lazer (MIT code but art/audio/character designs All Rights Reserved), and Godot Mugen (BSD-3-Clause early-stage) are tracked for code/data-schema study. They are not direct drop-in animation libraries.

## Recommended repo sources

These are useful starting points to keep the motion library broad and open-source-friendly:

- User-owned SchwarzerblitzEngine fork: https://github.com/mhvnsnt/SchwarzerblitzEngine; its available move files are tutorial/dummy/common data and must not be mislabeled as four complete fighter kits
- https://github.com/KayKit-Game-Assets/KayKit-Character-Pack-Adventures-1.0 (CC0 KayKit source already used)
- https://quaternius.com/ (CC0 UAL source already checked in; additional packs remain candidates)
- https://kenney.nl/ (CC0 environment/asset packs; audit exact pack before adding)
- https://github.com/Unity-Technologies/ (reference animation and rigging examples, when needed)

## Integration rules

### 1. Licensing first

Before a source is accepted into the game:
- verify the license is compatible
- record the source URL and file provenance
- note whether the rig is humanoid/mannequin-compatible or requires retargeting

### 2. Retarget safety

Retargeting must preserve the existing motion bank contract:
- root and hips align to the main skeleton
- arm flex direction matches the KayKit rig behavior
- bone names are normalized before clip binding
- retarget step avoids expensive per-frame/mission-start sorting

### 3. Moveset assignment

Each character should have an explicit moveset manifest, not implicit defaults.

Example schema:

```json
{
  "character": "Knight",
  "source": "kaykit",
  "moveSet": ["idle", "walk", "jab", "hook", "guard", "throw"],
  "animationBank": "quaternius-core",
  "retargetProfile": "humanoid-standard"
}
```

This keeps the roster and motion content traceable.

### 4. Performance guardrails

Any new content must not reintroduce:
- per-vertex bone searches in the mission start path
- long-running sort work on character setup
- idle-time blocking during roster or spawn initialization

The retarget path should prefer a bounded nearest-bone look-up and deferred fitting.

### 5. Source tracking

Maintain a source manifest in the repo for every motion package:

```yaml
sources:
  - name: quaternius-core
    url: https://quaternius.com/
    license: CC0
    status: active
    notes: Core fighter motion library
  - name: swarzerblits-movesets
    url: pending-user-repo-url
    license: review-required
    status: awaiting-source
    notes: Full move variants and custom attacks; import only rights-cleared assets
```

## Recommended workflow for new motion packs

1. Download the asset pack into a staging folder
2. Check the asset metadata and license
3. Run an automated validation pass for rig compatibility
4. Retarget to the project skeleton using the existing mannequin mapping
5. Attach the new clips to a target roster entry or variant
6. Validate timing, range, and animation state transitions in play
7. Update the source manifest and docs

## Suggested repo tasks

- Add a manifest for all character motions and enemy variants
- Add a dedicated issue for swarzerblits moveset merge
- Keep a shortlist of additional permissive repos for future expansion
- Add CI checks to fail when a roster entry has no moveset metadata

## Next action list

- [ ] Inventory the swarzerblits motions and compare them against current roster coverage
- [ ] Review Kenney animated character pack compatibility
- [ ] Add a motion-source manifest to the project
- [ ] Expand CI to include asset validation and roster coverage
- [ ] Keep track of all open-source repositories used as future motion sources
