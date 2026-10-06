# playtest/ — reusable headless playtest harness

Boots a URL in Chromium, captures screenshots on a schedule, records optional
screencast video, collects console + page errors, injects input, and dumps a
structured `report.json`. Modeled on the Bannon lane's `playtest_drive.cjs`.

## Quick start

```bash
cd tools/hands/playtest
npm install            # one-time (playwright + chromium)

# AshLane: boot straight into an exhibit bout, no menu clicking
node playtest.cjs --url "http://127.0.0.1:8080/?debug=1&autostart=bout&kind=exhibit&stage=ward" --video

# Headed (Xvfb + full GL) when headless SwiftShader crashes a page
xvfb-run -a node playtest.cjs --url ... --headed
```

Output lands in `runs/<name>-<timestamp>/`: `report.json`, `shots/*.png`,
`run.mp4` (if `--video`).

## Driving the game

`src/game3d/dev-hooks.ts` installs `window.__ashlane` (dev builds or
`?debug=1` only). The default scenario uses it: `snapshot()`, `fighters()`,
`setStick(x,y)`, `press('attack'|'grab'|...)`, `setWho(id)`, `startBout(kind,
stage)`, `camera(yaw)`, `teleport(i,x,z)`. Full surface:
`tools/hands/CONTROL_SURFACE.md`.

Custom scenarios are JSON:

```json
{
  "url": "http://127.0.0.1:8080/?debug=1&autostart=bout&kind=exhibit&stage=ward",
  "steps": [
    { "do": "goto" },
    { "do": "waitReady", "check": "window.__ashlane && window.__ashlane.snapshot().running ? 'ready' : 'waiting'", "timeoutMs": 180000 },
    { "do": "eval", "fn": "window.__ashlane.press('attack')" },
    { "do": "sleep", "ms": 900 },
    { "do": "shot", "name": "attack.png" },
    { "do": "probe", "label": "state", "fn": "window.__ashlane.snapshot()" }
  ]
}
```

Step verbs: `goto`, `waitReady`, `sleep`, `eval`, `press`, `keyDown`, `keyUp`,
`click`, `shot`, `probe`, `startCast`, `stopCast`, `fn`.

## Environment constraints (8GB box — read before scaling)

- **One browser, one page per run.** The harness is single-concurrency by
  design. Running two playtests at once risks OOM kills of the dev server.
- `--disable-dev-shm-usage` and `--renderer-process-limit=2` are set for the
  container; don't remove them.
- **Headless vs Xvfb:** headless Chromium uses SwiftShader (software GL).
  Some pages crash or render black under it; the AshLane lane found Xvfb +
  headed Chromium survives where headless doesn't. If a run dies in headless,
  retry with `--headed` under `xvfb-run -a`.
- Video is off by default — screencast frames cost RAM. Enable per-run.
- Screenshots go through CDP (`Page.captureScreenshot`), which works even
  when the page's own canvas readback is blocked.

## report.json

```json
{
  "name": "playtest", "url": "...", "headed": false, "video": true,
  "startedAt": "...", "finishedAt": "...", "ok": true,
  "steps": [{ "n": 1, "do": "goto", "ms": 812, "ok": true }],
  "screenshots": ["shots/s01_bout_start.png"],
  "pageErrors": [], "consoleErrors": [], "requestFailures": [],
  "probes": { "fighters-start": [ ... ] },
  "videoPath": "run.mp4"
}
```
