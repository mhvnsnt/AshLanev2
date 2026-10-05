# Animation/model source registry

This registry is deliberately provenance-first. A source being useful does not automatically mean its files can be copied into AshLanev2.

| Source | License | Useful content | Status |
|---|---|---|---|
| Quaternius Universal Animation Library / free UAL distribution | CC0 1.0 | Humanoid combat, locomotion, hit, jump and interaction coverage | Active/reference |
| J-Ponzo/gltf-universal-animation-library | CC0 1.0 distribution mirror | glTF UAL files useful for automated intake | Candidate |
| Kenney animated-character packs | CC0 | Character variants and animation/pose material | Candidate |
| Kenney environment packs | CC0 | Urban props, cover, buildings, arena/world dressing | Candidate |
| AndreaJens/SchwarzerblitzEngine | BSD-3-Clause for engine code; game assets excluded by upstream notice | Fighter-engine architecture/reference | Reference only |
| User-owned Schwarzerblitz fork | Verify exact repo + license/ownership | Full movesets and custom animations | Awaiting exact URL |

## Intake rule

Do not vendor a whole external repository just to obtain a few clips. Pull only the specific files that have a clear redistribution right, preserve the source license/notice where applicable, and record the exact source commit/tag.

## High-value next sources

### Quaternius UAL

The free glTF distribution is the first external animation source to audit against the existing `public/motion/bank.json`. Compare clips by semantic role before adding duplicates.

### Kenney

Use CC0 character/environment packs for additional roster skins, enemy variants, props, cover, and world dressing. These are especially useful for adding variety without introducing restrictive licenses.

### Schwarzerblitz

Use the upstream engine repository for code/reference ideas only. Its README explicitly excludes the game's character, stage, and music assets from the engine license. Do not copy those assets into AshLanev2.

## Certification status

No new external binary pack is claimed as imported by this registry. Existing AshLanev2 assets remain the certified baseline until each new intake item passes rig, semantic, and runtime checks.
