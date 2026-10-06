#!/usr/bin/env node
// test-frames.cjs — render specific timestamps for QA
const puppeteer = require('puppeteer');
const http = require('http');
const fs = require('fs');
const path = require('path');

const HERE = __dirname;
const RENDERER_NODE_MODULES = '/home/hatch/workspace/glb-renders/renderer/node_modules';
const MODELS_DIR = path.join(HERE, '..', '..', 'public', 'models', 'cast');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.glb': 'model/gltf-binary', '.wasm': 'application/wasm', '.json': 'application/json', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png' };

function serve() {
  return new Promise(resolve => {
    const server = http.createServer((req, res) => {
      const urlPath = decodeURIComponent(req.url.split('?')[0]);
      let filePath;
      if (urlPath === '/cinematic-faction.html') filePath = path.join(HERE, 'cinematic-faction.html');
      else if (urlPath === '/faction-motion.js') filePath = path.join(HERE, 'faction-motion.js');
      else if (urlPath.startsWith('/models/')) filePath = path.join(MODELS_DIR, urlPath.slice(8));
      else if (urlPath.startsWith('/motion/')) filePath = path.join(HERE, '..', '..', 'public', 'motion', urlPath.slice(8));
      else if (urlPath.startsWith('/node_modules/')) filePath = path.join(RENDERER_NODE_MODULES, urlPath.slice(14));
      else if (urlPath === '/env-textures.js') filePath = path.join(HERE, 'env-textures.js');
      else if (urlPath.startsWith('/textures/')) filePath = path.join(HERE, '..', '..', 'public', 'textures', urlPath.slice(10));
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
  const times = process.argv[2] ? process.argv[2].split(',').map(parseFloat) : [2, 8, 15, 22, 29, 38, 40, 41.5, 43, 48];
  const out = process.argv[3] || path.join(HERE, 'test-frames');
  fs.mkdirSync(out, { recursive: true });

  const server = await serve();
  const port = server.address().port;
  const browser = await puppeteer.launch({
    headless: 'shell',
    userDataDir: path.join(require('os').homedir(), 'workspace', 'promo-work', '.chrome-profile'),
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--disable-gpu-sandbox', '--force-device-scale-factor=1']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  const errors = [];
  page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push('CONSOLE: ' + m.text().slice(0, 200)); });

  await page.goto(`http://127.0.0.1:${port}/cinematic-faction.html`, { waitUntil: 'networkidle0', timeout: 120000 });
  await page.waitForFunction('window.__ready === true', { timeout: 180000 });

  for (const t of times) {
    await page.evaluate(tt => window.__renderAt(tt), t);
    const fn = path.join(out, `t_${t.toFixed(1).replace('.', '_')}.png`);
    await page.screenshot({ path: fn });
    console.log(`  t=${t}s -> ${fn}`);
  }
  console.log(errors.length ? `ERRORS:\n${errors.join('\n')}` : 'no page errors');
  await browser.close();
  server.close();
  process.exit(0);
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
