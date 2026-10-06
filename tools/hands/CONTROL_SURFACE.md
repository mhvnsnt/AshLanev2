# AshLanev2 Control Surface — what an agent can command, and exactly how

The engine exposes a dev-only control surface for automation. Two layers:

1. **`window.__ashlane`** — the full API (dev builds or `?debug=1` only).
2. **URL params** — boot straight into a state, no menu clicking.

Installed by `src/game3d/dev-hooks.ts`, wired in `src/game3d/mount.ts`.
**Production builds get nothing**: `window.__ashlane` stays `undefined`
unless `import.meta.env.DEV` is true or the URL carries `?debug=1`.

## URL params (read only by dev-hooks.ts, never by game logic)

| Param | Values | Effect |
|---|---|---|
| `debug=1` | — | Force-enable `window.__ashlane` in any build |
| `autostart=bout` | — | Auto-call `startBout(kind, stage)` ~1.2s after mount |
| `autostart=story` | — | Auto-call `startStory(index)` ~1.2s after mount |
| `kind` | `exhibit` \| `practice` | Bout kind for `autostart=bout` |
| `stage` | `ward` (default) \| … | Stage id for `autostart=bout` |
| `who` | roster id | `setWho(id)` before autostart |
| `index` | number | Story index for `autostart=story` |

Example (what the playtest harness boots):
```
http://127.0.0.1:8080/AshLanev2/?debug=1&autostart=bout&kind=exhibit&stage=ward
```

## `window.__ashlane` API

### State reads
| Call | Returns |
|---|---|
| `version` | `"dev-hooks/2026-10-06"` — assert this in drivers |
| `snapshot()` | HUD snapshot: `running, paused, mode, hp, maxHp, meter, poise, combo, foes, banner, splash, face, canGrab, cleared, weapon, area, phase, phaseStep, tune` |
| `fighters()` | Every sim body: `{id, kind, name, x, y, z, yaw, hp, maxHp, state, stateT}`. `kind` ∈ `player\|grunt\|ally\|ambient`. `state` is the sim `Phase` string (`"free"`, `"grab"`, …) |
| `roster()` | `[{id, name}]` — valid ids for `setWho()` |
| `params()` | The URL params this module honoured |

### Booting / flow
| Call | Notes |
|---|---|
| `start(mode)` | `mode` ∈ `"roam"\|"belt"\|"platform"` — same as menu START |
| `startBout(kind, stage)` | `kind` ∈ `"exhibit"\|"practice"`; `stage` e.g. `"ward"` |
| `startStory(index)` | Boots story mission `index` |
| `focus(mode)` | Warp player to `mode` without full restart |
| `rematch()` | Reset the current bout |
| `pause(bool)` | Freeze/unfreeze the sim |
| `quit()` | Back to menu state |

### Input injection (the playtest's hands)
| Call | Notes |
|---|---|
| `setStick(x, y)` | Virtual stick, -1..1. **y=-1 is forward** (matches KeyW mapping in `readInput`) |
| `setBtn(name, down)` | `name` ∈ `"attack"\|"grab"\|"blast"\|"jump"\|"dash"\|"use"` |
| `press(name)` | Edge press: down, auto-up after 80ms |
| `setKeys(codes)` | Directly set the held-key set, e.g. `["KeyD","KeyJ"]`. Same set the pump loop reads. **Does not clear on its own — call `setKeys([])` when done** |

Keyboard map (from `mount.ts` WATCH): move = WASD/arrows, attacks = J/K/L/U, `Space` = special, `Shift` = dash/modifier, `Z/X/F` = misc. Prefer `setBtn`/`press` over raw keys — they bypass key-repeat quirks.

### Character / loadout / stage
| Call | Notes |
|---|---|
| `setWho(id)` | Swap player fighter by roster id (throws on unknown id — see `roster()`) |
| `setAttire(file)` | GLB attire file for the player |
| `setStage(id)` | Stage id (applies on next bout start) |
| `setStyle(id)` / `setMartial(id)` / `setStance(id)` | Combat style / martial art / stance |
| `setBuild("chibi"\|"full")` / `setCrowd("mix"\|"chibi"\|"full")` | Model build + crowd style |
| `setShape({height, bulk, head, leg, shoulder})` | Body proportions (clamped) |
| `tune(partial)` | Sim tuning knobs (see `spec.ts` `Tune`) |
| `assignClip(slot, clip)` | Retarget an animation clip onto a slot |

Roster ids (2026-10-06, from `src/game3d/roster.ts`): `bannon, maime, brutus,
cain, viper, titan, stickup, finxsse, tyneshia, onyx, cody, cipher, echo,
pablo, kobra, hollow, hall, edwin, aaron, sensei, toro, static, stan, triplex,
wreck, devil, jager, sombra_negra, quaternius_male, quaternius_female`.

### Camera & test setup
| Call | Notes |
|---|---|
| `camera(yaw)` | Set follow-cam yaw (radians). In roam mode the engine copies `sim.orbit` → `camYaw` every frame, so this sticks |
| `teleport(bodyIndex, x, z)` | Move a body to absolute (x, z); zeroes its velocity. `bodyIndex` 0 = player |

## Legacy probe: `window.__controlsTest`

Still installed by `mount.ts` (kept for compatibility): `getYaw()`, `getX()`,
`getSpeed()`, `setKeys(codes)`. Prefer `window.__ashlane` — it supersedes this.

## Driver recipe (Playwright)

```js
await page.goto('http://127.0.0.1:8080/AshLanev2/?debug=1&autostart=bout&kind=exhibit&stage=ward');
// wait for the surface
await page.waitForFunction(() => window.__ashlane && window.__ashlane.snapshot().running, null, { timeout: 120000 });
// drive
await page.evaluate(() => window.__ashlane.setWho('sombra_negra'));
await page.evaluate(() => window.__ashlane.setStick(0, -1));          // walk forward
await page.waitForTimeout(2000);
await page.evaluate(() => window.__ashlane.setStick(0, 0));
await page.evaluate(() => window.__ashlane.press('attack'));
const fighters = await page.evaluate(() => window.__ashlane.fighters());
```

The bundled harness (`tools/hands/playtest/`) does all of this; see its README.
