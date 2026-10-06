# Physics — Round 4

## Rapier (@dimforge/rapier3d-compat)
- **License:** Apache-2.0 — commercial-safe (verified in package + repo).
- **Why:** Deterministic rigid-body physics (needed for rollback netcode), fast WASM, works in browser + Node with zero native deps via the `-compat` build.
- **Proof:** `rapier-proof/rapier-proof.mjs` — run `node rapier-proof.mjs`:
  - 5-box stack falls and settles under gravity ✅
  - Impulse knockback moves a body 19+ units ✅ (hit-reaction base)
  - Two identical runs produce bit-identical positions ✅ (rollback requirement)
- **AshLane use:** destructible props (crates, tables), knockback/ragdoll on KO, debris. Determinism makes it rollback-netcode compatible.

## Next steps for game integration
1. `npm install @dimforge/rapier3d-compat` in the game (already a dep of three.js ecosystem).
2. One Rapier `World` per fight; static colliders for stage, dynamic bodies for props/fighters-on-KO.
3. Sync fighter root motion kinematically; switch to dynamic on KO for ragdoll finish.
