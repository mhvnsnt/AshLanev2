# 44-Repo Audit — Animation & Model Lens (2026-10-06)

**Auditor:** Muse (subagent). **Lens:** what can fix AshLane's character animation/model pipeline.
**Method:** cloned + API-browsed all mhvnsnt repos. Prior audit (2026-10-05, money lens) at `~/workspace/repo-audit/REPO_AUDIT_2026-10-05.md` — this audit does not redo it.
**Scope:** 52 repos found on the account (44 install-accessible + 8 public outside the install selection).

## License ledger

| Source | License | What we can do |
|---|---|---|
| Schwarzerblitz **engine code** | BSD-3 (Andrea Demetrio) | Port with copyright notice retained |
| Schwarzerblitz **character assets** (models, `.x` anims) | **All rights reserved** | Reference/compare ONLY. Never ship. |
| Brutal-Fist `animation_bridge/` + `src/engine/retarget/` | Owner-granted (registry says: "Owner granted use of mhvnsnt motion, Schwarzerblitz engine, NightSky, and Tekken research for Brutal Fist") | Port within mhvnsnt repos |
| NightSkyEngine | MIT (WistfulHopes) | Port with attribution |
| M_Unity_FreeflowCombat FBX (Frank_RPG_2Handed, Mixamo) | Unity Asset Store / Mixamo — **verify before ship** | Prototype internally; license-check before any release |
| Bannon motion bank | Owner's own | Free to use |

## Tier 1 — Direct animation pipeline value

### 1. SchwarzerblitzEngine (public, NEW — not in prior audit)
**The "Sworcer Blitz" the owner meant.** Complete open-source 3D fighting game engine (C++, Irrlicht).
- **Engine (BSD-3, portable):** `FK_AnimationKeyMap` (per-joint key arrays + offset rotations), `FK_Character` (state machine), `moves.txt` format (per-move frame data, stances, followups, invincibility frames — a complete fighting-move definition language).
- **Assets (all-rights-reserved, compare only):** `bin/media/characters/` — `chara_tutor` (23 real fight anims: stance, punches, kicks, intro, guard), `chara_tutor2` (8 anims), `chara_dummy` (26 test anims). Each character ships `bones.txt` (semantic→armature bone map), `moves.txt`, `character.txt`.
- **Converted for the lab:** 5 anims → `tools/reference-lab/ref-anims/` (41 bones, 102 keys each).
- **Verdict:** engine concepts → port; assets → reference lab only.

### 2. Brutal-Fist (public) — `animation_bridge/` + `src/engine/retarget/`
Already-built retargeting pipeline, owner-granted:
- `AnimationRetargeter.ts` (784 lines), `RetargetQA.ts` (pose sampling + `comparePose`), `SemanticStateAliases.ts` (clip-name → semantic-state canonical map), `neutralizeRootMotion.ts`, `ClipRetarget.ts`, `RetargetDiagnostics.ts`, `MixamoFightingMotionBank.ts`, `FighterMotionBank.ts`
- `SOURCE_REGISTRY.json` documents the license grant explicitly.
- **Ported to:** `tools/reference-lab/ported/`. **Next:** wire into AshLanev2's clip picker + QA gate (checklist in `tools/reference-lab/README.md`).

### 3. M_Unity_FreeflowCombat (public, NEW — 808MB Unity project)
- `Frank_RPG_2Handed` FBX set: 8-way directional run, combos 01–05, block, whirlwind, rolling — full root-motion moveset as **portable FBX**.
- Mixamo FBX animations (Flying Kick, MMA Kick, Uppercut).
- `Assets/Scripts/`: `PlayerControl.cs`, `EnemyBase.cs`, `TargetDetectionControl.cs` — combat AI reference.
- **Use:** download specific FBX files as needed, convert to GLB. Asset-Store license → internal prototype only until verified.

### 4. NightSkyEngine (public, NEW — MIT)
Unreal Engine fighting-game framework (WistfulHopes). `Content/ControlRig` — ControlRig-based animation tooling. UE-only, so value is architectural (how they structure fight animation graphs), not directly portable to Three.js.

### 5. Bannon (public) — motion bank + repair harness
Owner's wrestling game. Motion bank (`assets/moves/clips`), model-repair QA harness, video capture pipeline. Already cross-pollinating with AshLanev2.

## Tier 2 — Useful tooling

| Repo | What's useful |
|---|---|
| `God-molecule-production-stage` (priv) | Stub (2 files) — skip, nothing to pull |
| `Funnel-and-rod-...-simulator-` (priv) | Physics/biomechanics playground — prototype, check `assets/` later for rig helpers |
| `texture-customizer` (public, NEW) | PWA texture tool — evaluate for the texture pipeline |
| `M-Hero-Simulator-` (public) | `fix_bvh.cjs` turned out to be a Rapier physics patch, not BVH animation — skip |
| `Infinity-Fighter` (priv) | React stub — skip |
| `URBAN-MAYHEM-` (priv) | UE5 + Lyra-based; `mhvnsnt/Lyra` and `mhvnsnt/UnrealEngine` exist as public repos — foundation now resolvable |
| `Brutal-Fist` (rest) | PS1 fighter, shares pipeline with Bannon |
| `Physics-sandbox-playground-` (priv) | Physics material sandbox + unreal-plugin |

## Tier 3 — Not animation-relevant (skipped)

`M.-Engine-` (Kotlin APK CI — useful for mobile builds, not animation), `GAME-Emulator`, `money-machine-hq`, `Moneymachine*`, `CODEDUMMY*`, `God-Mode-OS*`, `M-OS-Daywalker*`, `TRIPPEDD-Production-studios-`, `God-Molecule-Show-Studio`, `Dream-Infinite-World`, `Core-blueprint-*`, `Combat-RPG-prototype-`, `Wrestli6game-3`, `SMOKE-MIRROR-S-`, `bolt.diy-M`, `brutalfistgrokversion*` (13 dupes), `brutalfist11`, `theyard`, `AshLane` (v1).

## The Reference Lab (`tools/reference-lab/`)

**Purpose:** stop guessing whether animations look right — compare side-by-side against working references.

| Component | Status |
|---|---|
| `x-to-json.py` — Schwarzerblitz `.x` → JSON | ✅ working, 5 anims converted |
| `compare.html` — two-panel viewer (ref skeleton vs our GLB) | ✅ built |
| `ported/` — Brutal-Fist retarget toolkit | ✅ ported (6 files) |
| `ref-anims/` — 5 converted reference animations | ✅ |
| `README.md` — license boundaries + porting checklist | ✅ |

**Measured findings (reference vs ours):**
1. Reference keeps **zero rotation on the root bone** — all motion in joints. Our pipeline must not bake root rotation into clips.
2. Reference stance holds forearms in a compact ~85° roll envelope (guard), not wide swings.
3. Reference uses dense 30fps key sampling (102 keys / 3.4s), not sparse keyframes.
4. Schwarzerblitz `moves.txt` shows the value of explicit per-move frame data (startup/active/recovery, stance transitions) — our clips lack this metadata.

## What was wired in (this audit)

1. ✅ Reference lab built in `tools/reference-lab/` (converter, viewer, 5 ref anims, ported toolkit, README)
2. ✅ Brutal-Fist retarget toolkit ported (owner-granted)
3. ⏳ Next: wire `SemanticStateAliases` + `neutralizeRootMotion` into AshLanev2's clip pipeline; add `RetargetQA.comparePose` to the QA gate; adopt per-move frame-data metadata

## Open questions for the owner

1. M_Unity_FreeflowCombat FBX assets (Frank_RPG_2Handed, Mixamo) — confirm we're clear to use these in AshLane (you own the repo; Asset Store terms need a check before ship).
2. The 13 `brutalfistgrokversion*` dupes + `brutalfist11` + `theyard` — still pending your kill/fold decision from the Oct-5 audit.
