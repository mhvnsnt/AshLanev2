#!/usr/bin/env node
/**
 * diag-flaps.cjs — headless armpit/flap diagnosis renders for BANNON (one model).
 * Serves diag-flaps.html, captures rest / arm45 / arm90 close-ups of the
 * shoulder/armpit region, and dumps the vertex/weight analysis to console.
 *
 * Usage: node diag-flaps.cjs [--model BANNON_muscular_skinned.glb] [--side left]
 */
const puppeteer = require('puppeteer');
const http = require('http');
const fs = require('fs');
const path = require('path');

const HERE = __dirname;
const RENDERER_NODE_MODULES = '/home/hatch/workspace/glb-renders/renderer/node_modules';
const MODELS_DIR = path.join(HERE, '..', '..', 'public', 'models', 'cast');

function args() {
  const a = {};
  for (let i = 2; i < process.argv.length; i += 2) a[process.argv[i].replace(/^--/, '')] = process.argv[i + 1];
  return a;
}

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.glb': 'model/gltf-binary', '.wasm': 'application/wasm' };

function serve() {
  return new Promise(resolve => {
    const server = http.createServer((req, res) => {
      const urlPath = decodeURIComponent(req.url.split('?')[0]);
      let filePath;
      if (urlPath === '/' || urlPath === '/diag-flaps.html') filePath = path.join(HERE, 'diag-flaps.html');
      else if (urlPath === '/reskin.js') filePath = path.join(HERE, 'reskin.js');
      else if (urlPath.startsWith('/models/')) filePath = path.join(MODELS_DIR, urlPath.slice(8));
      else if (urlPath.startsWith('/node_modules/')) filePath = path.join(RENDERER_NODE_MODULES, urlPath.slice(14));
      else { res.writeHead(404); res.end('nf'); return; }
      fs.readFile(filePath, (err, data) => {
        if (err) { res.writeHead(404); res.end('nf: ' + urlPath); return; }
        res.writeHead(200, { 'Content-Type': MIME[path.extname(filePath)] || 'application/octet-stream' });
        res.end(data);
      });
    });
    server.listen(0, '127.0.0.1', () => resolve(server));
  });
}

async function main() {
  const a = args();
  const model = a.model || 'BANNON_muscular_skinned.glb';
  const side = a.side || 'left';
  const out = path.join(HERE, 'diag-flaps');
  fs.mkdirSync(out, { recursive: true });

  const server = await serve();
  const port = server.address().port;

  const browser = await puppeteer.launch({
    headless: 'shell',
    userDataDir: path.join(require('os').homedir(), 'workspace', 'promo-work', '.chrome-profile'),
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--disable-gpu-sandbox', '--force-device-scale-factor=1']
  });

  async function capture(pose, analysis) {
    const page = await browser.newPage();
    await page.setViewport({ width: 900, height: 900 });
    const logs = [];
    page.on('console', m => { const t = m.text(); if (t.startsWith('FLAPDIAG')) logs.push(t); });
    page.on('pageerror', e => console.error('PAGEERROR', e.message));
    const q = `model=${encodeURIComponent(model)}&pose=${pose}&side=${side}` + (analysis ? '&analysis=1' : '');
    await page.goto(`http://127.0.0.1:${port}/diag-flaps.html?${q}`, { waitUntil: 'networkidle0', timeout: 90000 });
    await page.waitForFunction('window.__rendered === true', { timeout: 60000 });
    const fname = `${model.replace('.glb', '')}_armpit_${side}_${pose}.png`;
    await page.screenshot({ path: path.join(out, fname) });
    console.log('saved', fname);
    for (const l of logs) console.log(l);
    await page.close();
  }

  // analysis pass first (rest pose), then renders
  await capture('rest', true);
  await capture('rest', false);
  await capture('arm45', false);
  await capture('arm90', false);

  await browser.close();
  server.close();
}

main().catch(e => { console.error(e); process.exit(1); });
