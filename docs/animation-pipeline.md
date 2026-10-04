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

### Upcoming sources to integrate

- swarzerblits fork
  - Status: Planned / In progress
  - Goal: Bring in fuller movesets and animation variants
- Kenney animated character pack
  - Status: Planned
  - Goal: Additional humanoid animation coverage and variants
- Additional public asset packs with permissive licensing
  - Status: Planned
  - Goal: More environmental clutter, props, and combat-ready poses

## Recommended repo sources

These are useful starting points to keep the motion library broad and open-source-friendly:

- https://github.com/swarzerblits/ (personal fork / motion set repo)
- https://github.com/KayKit3D/ (KayKit assets)
- https://github.com/quaternius/ (public model and animation packs)
- https://github.com/KennyNL/ (Kenney asset repositories)
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
    url: https://github.com/swarzerblits/
    license: review-required
    status: planned
    notes: Full move variants and custom attacks
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
