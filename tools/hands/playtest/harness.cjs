#!/usr/bin/env node
/* harness.cjs — reusable headless playtest harness for AshLanev2 (and any page).
 *
 * Patterns reused from the Bannon lane's playtest_drive.cjs:
 *   - CDP Page.captureScreenshot for stills
 *   - CDP Page.startScreencast -> jpeg frames -> ffmpeg mp4
 *   - pageerror + console-error collectors, route aborts for flaky CDNs
 *   - poll-until-ready loops instead of fixed sleeps
 *
 * Environment constraints baked in (8GB box):
 *   - ONE browser / ONE page per run. Concurrency is a config error here.
 *   - Video is off by default; screenshots on a schedule are cheap.
 *   - Headless Chromium + SwiftShader crashes some pages in this env;
 *     pass { headed: true } to run under Xvfb with full GL instead
 *     (requires xvfb-run on PATH; checked at launch).
 *
 * Usage:
 *   const { runScenario } = require('./harness.cjs');
 *   const report = await runScenario({ url, name, steps, outDir, video, headed });
 */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const { execSync, execFileSync } = require('child_process');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();
const log = (...a) => console.log(ts().slice(11, 19), ...a);

/** Build a page-side function from a JS string. Single expressions get their
 *  value returned; multi-statement strings run as a body. */
function pageFn(src) {
  try {
    return new Function('return (' + src + ')');
  } catch {
    return new Function(src);
  }
}

const DEFAULT_ABORT = [
  '**://raw.githubusercontent.com/**',
  '**://fonts.googleapis.com/**',
];

async function launchBrowser({ headed = false, abortPatterns = DEFAULT_ABORT } = {}) {
  if (headed) {
    try { execFileSync('which', ['xvfb-run'], { stdio: 'ignore' }); }
    catch { throw new Error('headed:true needs xvfb-run on PATH (apt: xvfb)'); }
  }
  const launchOpts = {
    headless: !headed,
    args: [
      '--no-sandbox',
      '--disable-dev-shm-usage',          // /dev/shm is tiny in containers
      '--autoplay-policy=no-user-gesture-required',
      // keep the renderer from eating the 8GB box
      '--js-flags=--max-old-space-size=2048',
      '--renderer-process-limit=2',
    ],
  };
  if (!headed) launchOpts.args.push('--use-gl=swiftshader');
  const browser = await chromium.launch(launchOpts);
  return browser;
}

/** Run a scenario. Returns the report object (also written to outDir/report.json). */
async function runScenario({
  name = 'run',
  url,
  steps = [],
  outDir,
  video = false,
  videoFpsCap = 30,
  headed = false,
  abortPatterns,
  shotOnError = true,
  gotoTimeout = 90000,
} = {}) {
  if (!url) throw new Error('runScenario: url is required');
  outDir = outDir || path.join(__dirname, 'runs', name + '-' + Date.now());
  const shotsDir = path.join(outDir, 'shots');
  const framesDir = path.join(outDir, 'frames');
  fs.mkdirSync(shotsDir, { recursive: true });

  const report = {
    name, url, headed, video,
    startedAt: ts(), finishedAt: null,
    steps: [], screenshots: [],
    pageErrors: [], consoleErrors: [], requestFailures: [],
    probes: {}, videoPath: null, ok: false,
  };

  const browser = await launchBrowser({ headed, abortPatterns });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  let CDP = null;
  const errors = report.pageErrors, cerrors = report.consoleErrors;

  page.on('pageerror', (e) => errors.push('PAGEERROR: ' + String(e.message || e).split('\n')[0].slice(0, 200)));
  page.on('console', (m) => {
    if (m.type() === 'error') cerrors.push('CONSOLE: ' + m.text().slice(0, 200));
  });
  page.on('requestfailed', (r) => {
    report.requestFailures.push(r.url().slice(0, 160) + ' :: ' + (r.failure()?.errorText || 'failed'));
  });
  for (const pat of (abortPatterns === undefined ? DEFAULT_ABORT : abortPatterns || [])) {
    await page.route(pat, (r) => r.abort('failed')).catch(() => {});
  }

  const cdp = async () => {
    if (!CDP) CDP = await page.context().newCDPSession(page);
    return CDP;
  };
  async function shot(sname) {
    const s = await cdp();
    const { data } = await s.send('Page.captureScreenshot', { format: 'png' });
    const fp = path.join(shotsDir, sname);
    fs.writeFileSync(fp, Buffer.from(data, 'base64'));
    report.screenshots.push('shots/' + sname);
    log('shot:', sname);
    return fp;
  }
  async function waitForReady(check, timeoutMs, label) {
    const t0 = Date.now();
    let last = '';
    while (Date.now() - t0 < timeoutMs) {
      last = await page.evaluate(check).catch((e) => 'eval-failed:' + String(e).slice(0, 80));
      if (last === true || last === 'ready') return last;
      await sleep(2000);
    }
    throw new Error(`waitForReady timeout (${label}): last=${JSON.stringify(last)}`);
  }

  // optional screencast -> video
  let castFrames = [], castT0 = 0, casting = false;
  async function startCast() {
    const s = await cdp();
    fs.mkdirSync(framesDir, { recursive: true });
    s.on('Page.screencastFrame', async (ev) => {
      try {
        fs.writeFileSync(path.join(framesDir, 'f' + String(castFrames.length).padStart(5, '0') + '.jpg'),
          Buffer.from(ev.data, 'base64'));
        castFrames.push(1);
      } catch {}
      try { await s.send('Page.screencastFrameAck', { sessionId: ev.sessionId }); } catch {}
    });
    await s.send('Page.startScreencast', { format: 'jpeg', quality: 55, everyNthFrame: 2, maxWidth: 1280, maxHeight: 720 });
    castT0 = Date.now(); casting = true;
    log('screencast started');
  }
  async function stopCast() {
    if (!casting) return;
    const s = await cdp();
    await s.send('Page.stopScreencast').catch(() => {});
    await sleep(1200);
    casting = false;
    const secs = (Date.now() - castT0) / 1000;
    if (castFrames.length > 10) {
      const fps = Math.max(2, Math.min(videoFpsCap, Math.round(castFrames.length / secs)));
      const out = path.join(outDir, 'run.mp4');
      execSync(`ffmpeg -y -v error -framerate ${fps} -i "${framesDir}/f%05d.jpg" -c:v libx264 -pix_fmt yuv420p -crf 23 "${out}"`);
      report.videoPath = 'run.mp4';
      log(`video: run.mp4 (${castFrames.length} frames, ${fps}fps)`);
      fs.rmSync(framesDir, { recursive: true, force: true });
    } else {
      log('screencast too short, no video written');
    }
  }

  const ctx = {
    page, shot, sleep, waitForReady, startCast, stopCast, log,
    // fnSource is a JS *string*; it must run IN THE PAGE. Passing a Function
    // object (not its result) lets Playwright serialize + call it page-side.
    // (Calling it in Node first — `new Function(s)()` — was the classic bug:
    //  "window is not defined".)
    probe: async (label, fnSource) => {
      const r = await page.evaluate(pageFn(fnSource)).catch((e) => ({ err: String(e).slice(0, 150) }));
      report.probes[label] = r;
      log('PROBE[' + label + ']:', JSON.stringify(r).slice(0, 300));
      return r;
    },
  };

  try {
    let i = 0;
    for (const st of steps) {
      i++;
      const t0 = Date.now();
      const rec = { n: i, do: st.do, label: st.label || '', ms: 0, ok: true, err: null };
      try {
        switch (st.do) {
          case 'goto':
            await page.goto(st.url || url, { waitUntil: st.waitUntil || 'commit', timeout: gotoTimeout });
            break;
          case 'waitReady':
            await waitForReady(st.check, st.timeoutMs || 120000, st.label || st.do);
            break;
          case 'sleep':
            await sleep(st.ms || 1000);
            break;
          case 'eval':
            await page.evaluate(pageFn(st.fn));
            break;
          case 'press':
            await page.keyboard.press(st.key);
            break;
          case 'keyDown': await page.keyboard.down(st.key); break;
          case 'keyUp': await page.keyboard.up(st.key); break;
          case 'click': await page.click(st.selector, { timeout: st.timeoutMs || 15000 }); break;
          case 'shot': await shot(st.name || ('s' + i + '.png')); break;
          case 'probe': await ctx.probe(st.label || ('p' + i), st.fn); break;
          case 'startCast': await startCast(); break;
          case 'stopCast': await stopCast(); break;
          case 'fn': await st.fn(ctx); break;
          default: throw new Error('unknown step: ' + st.do);
        }
      } catch (e) {
        rec.ok = false; rec.err = String(e.message || e).slice(0, 300);
        log('STEP FAILED [' + st.do + ']:', rec.err);
        if (shotOnError) { try { await shot('error-step' + i + '.png'); } catch {} }
        if (st.fatal === false) { /* keep going */ } else throw e;
      } finally {
        rec.ms = Date.now() - t0;
        report.steps.push(rec);
      }
    }
    report.ok = true;
  } catch (e) {
    report.fatal = String(e.message || e).slice(0, 300);
  } finally {
    try { await stopCast(); } catch {}
    report.finishedAt = ts();
    fs.writeFileSync(path.join(outDir, 'report.json'), JSON.stringify(report, null, 1));
    await browser.close();
  }
  log('DONE ok=' + report.ok + ' out=' + outDir);
  return report;
}

module.exports = { runScenario, launchBrowser, sleep };
