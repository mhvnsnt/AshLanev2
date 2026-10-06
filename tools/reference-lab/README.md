# Reference Lab

Side-by-side animation comparison: **our** character animation vs **working** reference animation.
No more guessing whether an animation looks right — put them next to each other.

## What's here

| File | Purpose |
|---|---|
| `compare.html` | Two-panel viewer. Left: reference skeleton (stick figure) playing a Schwarzerblitz animation. Right: our GLB playing the semantic equivalent. Same camera, synchronized. |
| `x-to-json.py` | Converts Schwarzerblitz `.x` skeletal animations to JSON (`python3 x-to-json.py in.x out.json`). |
| `ref-anims/` | Converted reference animations: `tutorStance` (idle), `abigailPunch` (attack), `tutorIntro`, `crouchingPunch2`, `flyingKick`. |
| `ported/` | Retarget toolkit ported from Brutal-Fist (owner-granted): `AnimationRetargeter.ts` (784 lines), `RetargetQA.ts` (pose sampling + comparison), `SemanticStateAliases.ts` (clip-name → semantic-state map), `neutralizeRootMotion.ts`, `ClipRetarget.ts`, `RetargetDiagnostics.ts`. |

## License boundaries (do not cross)

- **Schwarzerblitz ENGINE code**: BSD-3 — portable, already referenced.
- **Schwarzerblitz CHARACTER ASSETS** (models, animations, `ref-anims/`): **all rights reserved** — reference and comparison ONLY. Never ship in the game, never commit to `public/`.
- **Brutal-Fist animation_bridge**: owner-granted for his games — portable within mhvnsnt repos.
- **NightSkyEngine**: MIT — portable with attribution.

## How to run a comparison

1. Serve this directory: `cd tools/reference-lab && python3 -m http.server 8901`
2. Open `http://localhost:8901/compare.html`
3. Pick a reference anim on the left, pick our GLB + clip on the right.
4. Watch: feet on ground? Facing = travel? Natural joints or stiff/procedural?

## What the reference does right (measured)

From `tutorStance.json` / `abigailPunch.json` (41 bones, 102 keys):
- Root bone has **zero rotation** — all motion is in the joints, never the root. (Our pipeline must not bake root rotation into clips.)
- Stance keeps forearms in an 85° roll envelope — compact guard, not wide arm-swing.
- Punch drives from the shoulder with the elbow following — kinetic chain, not isolated limb flailing.
- 102 keys over ~3.4s at 30fps — dense mocap-style sampling, not sparse keyframes.

## Porting checklist (for AshLanev2)

- [ ] Wire `SemanticStateAliases.ts` into the promo/game clip picker (canonical clip-name → state map)
- [ ] Wire `neutralizeRootMotion.ts` into staging (root motion handled by staging, not clips)
- [ ] Use `RetargetQA.sampleCriticalPose` / `comparePose` in the QA gate for pose-level defect detection
- [ ] Adopt Schwarzerblitz `moves.txt` format concepts: per-move frame data, stance transitions, followups (BSD-3 engine code is portable; write our own implementation)
