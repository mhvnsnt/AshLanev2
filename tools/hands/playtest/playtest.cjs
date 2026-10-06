#!/usr/bin/env node
/* playtest.cjs — CLI over harness.cjs.
 *
 *   node playtest.cjs --url http://127.0.0.1:8080/ [options]
 *
 * Options:
 *   --url URL            page to boot (required unless --script sets it)
 *   --out DIR            output dir (default: runs/<name>-<timestamp>)
 *   --name NAME          run name (default: playtest)
 *   --video              record screencast -> run.mp4 (default: off)
 *   --headed             run Chromium headed under Xvfb (full GL) instead of
 *                        headless SwiftShader. Use when the page crashes or
 *                        renders black under headless.
 *   --script FILE.json   step list JSON (see scenarios/). Default: built-in
 *                        AshLane smoke scenario.
 *   --timeout MS         goto timeout (default 90000)
 *
 * Example (AshLane bout, no menus):
 *   node playtest.cjs --url "http://127.0.0.1:8080/?debug=1&autostart=bout&kind=exhibit&stage=ward" --video
 */
const { runScenario } = require('./harness.cjs');
const fs = require('fs');
const path = require('path');

function args() {
  const out = {};
  const a = process.argv.slice(2);
  for (let i = 0; i < a.length; i++) {
    if (a[i].startsWith('--')) {
      const k = a[i].slice(2);
      out[k] = (a[i + 1] && !a[i + 1].startsWith('--')) ? a[++i] : true;
    }
  }
  return out;
}

// Built-in default: AshLane smoke — boot straight into an exhibit bout via
// the dev-hooks URL params, walk, punch, probe state, screenshot.
function defaultScenario(url) {
  const ready = `(() => {
    const h = window.__ashlane;
    if (!h) return 'waiting:__ashlane';
    const s = h.snapshot();
    if (!s.running) return 'waiting:running';
    if (s.mode !== 'belt' && !/exhibit|practice/i.test(s.bout || '')) return 'running:' + s.mode;
    return 'ready';
  })`;
  return [
    { do: 'goto', url },
    { do: 'waitReady', label: 'bout-ready', check: ready, timeoutMs: 180000 },
    { do: 'sleep', ms: 4000 },
    { do: 'shot', name: 's01_bout_start.png' },
    { do: 'probe', label: 'snapshot-start', fn: 'window.__ashlane.snapshot()' },
    { do: 'probe', label: 'fighters-start', fn: 'window.__ashlane.fighters()' },
    { do: 'eval', label: 'walk-forward', fn: `window.__ashlane.setStick(0,-1)` },
    { do: 'sleep', ms: 2500 },
    { do: 'eval', label: 'stop', fn: `window.__ashlane.setStick(0,0)` },
    { do: 'probe', label: 'fighters-after-walk', fn: 'window.__ashlane.fighters()' },
    { do: 'shot', name: 's02_after_walk.png' },
    { do: 'eval', label: 'attack', fn: `window.__ashlane.press('attack')` },
    { do: 'sleep', ms: 900 },
    { do: 'probe', label: 'snapshot-after-attack', fn: 'window.__ashlane.snapshot()' },
    { do: 'shot', name: 's03_attack.png' },
    { do: 'eval', label: 'grab', fn: `window.__ashlane.press('grab')` },
    { do: 'sleep', ms: 1200 },
    { do: 'shot', name: 's04_grab.png' },
    { do: 'probe', label: 'fighters-final', fn: 'window.__ashlane.fighters()' },
  ];
}

(async () => {
  const a = args();
  let steps, url = a.url;
  if (a.script) {
    const sc = JSON.parse(fs.readFileSync(path.resolve(a.script), 'utf8'));
    steps = sc.steps; url = sc.url || url;
  } else {
    if (!url) {
      console.error('need --url or --script');
      process.exit(2);
    }
    steps = defaultScenario(url);
  }
  const name = a.name || 'playtest';
  const outDir = a.out || path.join(__dirname, 'runs', name + '-' + new Date().toISOString().replace(/[:.]/g, '-'));
  const report = await runScenario({
    name, url, steps, outDir,
    video: !!a.video, headed: !!a.headed,
    gotoTimeout: parseInt(a.timeout || '90000', 10),
  });
  console.log('REPORT:', path.join(outDir, 'report.json'));
  process.exit(report.ok ? 0 : 1);
})().catch((e) => { console.error('FATAL:', e.message); process.exit(1); });
