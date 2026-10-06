/**
 * gen-city-proof.mjs — Generate a seeded city, verify determinism,
 * render it, screenshot it. Working proof for the Seeded World pipeline.
 *
 * Usage: node gen-city-proof.mjs [seed] [outdir]
 */
import fs from 'fs';
import path from 'path';
import http from 'http';
import puppeteer from 'puppeteer';
import { generateCity } from './city-seed.js';
import { cityTo3D, isDeterministic } from './world/city-3d.js';

const seed = process.argv[2] || 'ashlane-01';
const outDir = process.argv[3] || '/tmp/genpipe-proof';
fs.mkdirSync(outDir, { recursive: true });

const RENDERER_DIR = '/home/hatch/workspace/genpipe/world';
const NODE_MODULES = '/home/hatch/workspace/glb-renders/renderer/node_modules';

// 1. Generate city plan
const city = generateCity({ seed });
console.log(`City plan: ${city.blocks.length} blocks, seed="${seed}"`);

// 2. Determinism check
const det = isDeterministic(city);
console.log(`Determinism check: ${det ? 'PASS' : 'FAIL'}`);
if (!det) { console.error('NON-DETERMINISTIC — aborting'); process.exit(1); }

// 3. Convert to 3D
const scene3d = cityTo3D(city);
console.log(`3D scene: ${JSON.stringify(scene3d.stats)}`);
const jsonPath = path.join(outDir, `city-${seed}.json`);
fs.writeFileSync(jsonPath, JSON.stringify(scene3d));

// 4. Serve viewer + three.js, screenshot
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json' };
const server = http.createServer((req, res) => {
  const p = decodeURIComponent(req.url.split('?')[0]);
  let fp = null;
  if (p === '/') fp = path.join(RENDERER_DIR, 'viewer.html');
  else if (p === '/city.json') fp = jsonPath;
  else if (p.startsWith('/node_modules/')) fp = path.join(NODE_MODULES, p.slice(14));
  if (!fp || !fs.existsSync(fp)) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(fp)] || 'application/octet-stream' });
  fs.createReadStream(fp).pipe(res);
});
await new Promise(r => server.listen(8935, r));

const browser = await puppeteer.launch({
  headless: 'shell',
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader'],
});
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 800 });
const errors = [];
page.on('pageerror', e => errors.push(String(e).slice(0, 200)));
page.on('console', m => { if (m.type() === 'error') errors.push(m.text().slice(0, 200)); });
await page.goto('http://localhost:8935/', { waitUntil: 'networkidle0', timeout: 60000 });
await page.evaluate(`fetch('/city.json').then(r => r.json()).then(d => window.renderCity(d))`);
await page.waitForFunction('window.__ready === true', { timeout: 90000 });
const renderErr = await page.evaluate('window.__error || null');
const shotPath = path.join(outDir, `city-${seed}.png`);
await page.screenshot({ path: shotPath });
await browser.close(); server.close();

console.log(`Screenshot: ${shotPath}`);
if (renderErr) console.log(`Render error: ${renderErr.slice(0, 300)}`);
if (errors.length) console.log(`Console errors: ${errors.slice(0, 3).join(' | ')}`);
console.log(`PROOF COMPLETE: ${!renderErr && errors.length === 0 ? 'CLEAN' : 'WITH ISSUES'}`);
