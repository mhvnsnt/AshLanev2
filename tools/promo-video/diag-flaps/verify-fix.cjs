#!/usr/bin/env node
/**
 * verify-fix.cjs — render Bannon armpit rest/arm45/arm90 WITHOUT and WITH
 * the armpitfix, so the fix is actually visually tested.
 */
const puppeteer = require('puppeteer');
const http = require('http');
const fs = require('fs');
const path = require('path');

const HERE = __dirname;
const RENDERER_NODE_MODULES = '/home/hatch/workspace/glb-renders/renderer/node_modules';
const MODELS_DIR = path.join(HERE, '..', '..', '..', 'public', 'models', 'cast');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.glb': 'model/gltf-binary', '.wasm': 'application/wasm' };

function serve() {
  return new Promise(resolve => {
    const server = http.createServer((req, res) => {
      const urlPath = decodeURIComponent(req.url.split('?')[0]);
      let filePath;
      if (urlPath === '/' || urlPath === '/diag-flaps.html') filePath = path.join(HERE, 'diag-flaps.html');
      else if (urlPath === '/reskin.js') filePath = path.join(HERE, '..', 'reskin.js');
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
  const server = await serve();
  const port = server.address().port;
  const browser = await puppeteer.launch({
    headless: 'shell',
    userDataDir: path.join(require('os').homedir(), 'workspace', 'promo-work', '.chrome-profile'),
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--disable-gpu-sandbox', '--force-device-scale-factor=1']
  });

  async function capture(pose, fix, wide) {
    const page = await browser.newPage();
    await page.setViewport({ width: 900, height: 900 });
    const logs = [];
    page.on('console', m => { const t = m.text(); if (t.startsWith('FLAPDIAG')) logs.push(t); });
    page.on('pageerror', e => console.error('PAGEERROR', e.message));
    let q = `model=BANNON_muscular_skinned.glb&pose=${pose}&side=left` + (fix ? '&armpitfix=1' : '') + (wide ? '&wide=1' : '');
    await page.goto(`http://127.0.0.1:${port}/diag-flaps.html?${q}`, { waitUntil: 'networkidle0', timeout: 90000 });
    await page.waitForFunction('window.__rendered === true', { timeout: 60000 });
    const tag = fix ? 'FIXED' : 'BASE';
    const fname = `verify_${tag}_${wide ? 'wide_' : ''}${pose}.png`;
    await page.screenshot({ path: path.join(HERE, fname) });
    console.log('saved', fname);
    for (const l of logs) console.log(' ', l);
    await page.close();
  }

  for (const pose of ['rest', 'arm45', 'arm90']) {
    await capture(pose, false, false);
    await capture(pose, true, false);
  }
  await capture('arm90', false, true);
  await capture('arm90', true, true);

  await browser.close();
  server.close();
}

main().catch(e => { console.error(e); process.exit(1); });
