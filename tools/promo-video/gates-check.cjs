#!/usr/bin/env node
/**
 * gates-check.js — automated defect gates across the WHOLE promo timeline.
 * Per AGENTS.md verification law: feet never below ground, no crab-walking,
 * computed from animation data via window.__gates(t) — dense sampling,
 * fails loudly. Eyeballs alone don't ship.
 *
 * Usage: node gates-check.js [--start 0] [--end 50] [--step 0.25]
 */
const puppeteer = require('puppeteer');
const http = require('http');
const fs = require('fs');
const path = require('path');

const HERE = __dirname;
const RNM = '/home/hatch/workspace/glb-renders/renderer/node_modules';
const MODELS_DIR = path.join(HERE, '..', '..', 'public', 'models', 'cast');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.glb': 'model/gltf-binary', '.wasm': 'application/wasm', '.json': 'application/json' };

function args() {
  const a = {};
  for (let i = 2; i < process.argv.length; i += 2) a[process.argv[i].replace(/^--/, '')] = process.argv[i + 1];
  return a;
}

(async () => {
  const a = args();
  const start = parseFloat(a.start || '0'), end = parseFloat(a.end || '50'), step = parseFloat(a.step || '0.25');
  const server = http.createServer((req, res) => {
    const urlPath = decodeURIComponent(req.url.split('?')[0]);
    let fp;
    if (urlPath === '/') fp = path.join(HERE, 'cinematic-faction.html');
    else if (urlPath === '/faction-motion.js') fp = path.join(HERE, 'faction-motion.js');
    else if (urlPath === '/staging.js') fp = path.join(HERE, 'staging.js');
    else if (urlPath === '/reskin.js') fp = path.join(HERE, 'reskin.js');
    else if (urlPath === '/env-textures.js') fp = path.join(HERE, 'env-textures.js');
    else if (urlPath.startsWith('/models/')) fp = path.join(MODELS_DIR, urlPath.slice(8));
    else if (urlPath.startsWith('/motion/')) fp = path.join(HERE, '..', '..', 'public', 'motion', urlPath.slice(8));
    else if (urlPath.startsWith('/textures/')) fp = path.join(HERE, '..', '..', 'public', 'textures', urlPath.slice(10));
    else if (urlPath.startsWith('/node_modules/')) fp = path.join(RNM, urlPath.slice(14));
    else { res.writeHead(404); res.end('nf'); return; }
    fs.readFile(fp, (err, data) => {
      if (err) { res.writeHead(404); res.end('nf:' + urlPath); return; }
      res.writeHead(200, { 'Content-Type': MIME[path.extname(fp)] || 'application/octet-stream' });
      res.end(data);
    });
  });
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const port = server.address().port;
  const browser = await puppeteer.launch({
    headless: 'shell',
    args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--force-device-scale-factor=1'],
  });
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(String(e).slice(0, 200)));
  await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'networkidle0', timeout: 120000 });
  await page.waitForFunction('window.__ready === true', { timeout: 120000 });
  if (errors.length) { console.log('PAGE ERRORS:', errors); process.exit(2); }

  let fails = 0, samples = 0;
  const worst = { foot: { v: 0, at: null }, crab: { v: 0, at: null } };
  for (let t = start; t <= end + 1e-6; t += step) {
    const g = await page.evaluate(tt => window.__gates(tt), t);
    samples++;
    for (const [name, r] of Object.entries(g)) {
      if (!r.visible) continue;
      if (r.minFootY < -0.05) {
        fails++;
        if (r.minFootY < worst.foot.v) worst.foot = { v: r.minFootY, at: `${name}@t=${t.toFixed(2)}` };
      }
      if (r.facingVsVelocityDeg !== null && r.facingVsVelocityDeg > 40) {
        fails++;
        if (r.facingVsVelocityDeg > worst.crab.v) worst.crab = { v: r.facingVsVelocityDeg, at: `${name}@t=${t.toFixed(2)}` };
      }
    }
  }
  console.log(`samples: ${samples} (${start}s..${end}s step ${step}s)`);
  console.log(`violations: ${fails}`);
  console.log(`worst footY: ${worst.foot.v.toFixed(3)} at ${worst.foot.at}`);
  console.log(`worst crab angle: ${worst.crab.v.toFixed(1)}° at ${worst.crab.at}`);
  await browser.close();
  server.close();
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error('FATAL', e.message); process.exit(2); });
