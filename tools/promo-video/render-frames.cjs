#!/usr/bin/env node
/**
 * render-frames.js — headless frame capture for the promo-video pipeline.
 * Renders the cinematic.html scene deterministically at 24fps and saves PNGs.
 *
 * Usage:
 *   node render-frames.js --model EL_TORO_DE_ORO.glb --out ./frames [--start 0] [--end 50] [--fps 24]
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

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.glb': 'model/gltf-binary', '.wasm': 'application/wasm', '.json': 'application/json' };

function serve(page) {
  return new Promise(resolve => {
    const server = http.createServer((req, res) => {
      const urlPath = decodeURIComponent(req.url.split('?')[0]);
      let filePath;
      if (urlPath === '/' || urlPath === '/cinematic.html') filePath = path.join(HERE, page);
      else if (urlPath === '/cinematic-faction.html') filePath = path.join(HERE, 'cinematic-faction.html');
      else if (urlPath === '/real-motion.js') filePath = path.join(HERE, 'real-motion.js');
      else if (urlPath === '/faction-motion.js') filePath = path.join(HERE, 'faction-motion.js');
      else if (urlPath === '/reskin.js') filePath = path.join(HERE, 'reskin.js');
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
  const a = args();
  const model = a.model || 'EL_TORO_DE_ORO.glb';
  const out = a.out || path.join(HERE, 'frames');
  const start = parseFloat(a.start || '0');
  const end = parseFloat(a.end || '50');
  const fps = parseInt(a.fps || '24', 10);
  const extra = a.extra || '';
  const pageFile = a.page || 'cinematic.html';
  fs.mkdirSync(out, { recursive: true });

  const server = await serve(pageFile);
  const port = server.address().port;

  const browser = await puppeteer.launch({
    headless: 'shell',
    userDataDir: path.join(require('os').homedir(), 'workspace', 'promo-work', '.chrome-profile'),
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--disable-gpu-sandbox', '--force-device-scale-factor=1']
  });
  const page = await browser.newPage();
  const vw = parseInt(a.width || '1920', 10), vh = parseInt(a.height || '1080', 10);
  await page.setViewport({ width: vw, height: vh });
  await page.goto(`http://127.0.0.1:${port}/${pageFile}?model=${encodeURIComponent(model)}${extra ? '&' + extra : ''}`, { waitUntil: 'networkidle0', timeout: 120000 });
  await page.waitForFunction('window.__ready === true', { timeout: 120000 });

  const n = Math.round((end - start) * fps);
  console.log(`Rendering ${n} frames (${start}s -> ${end}s @ ${fps}fps) for ${model}`);
  const t0 = Date.now();
  for (let i = 0; i < n; i++) {
    const t = start + i / fps;
    await page.evaluate(tt => window.__renderAt(tt), t);
    const fn = path.join(out, `f_${String(Math.round(t * fps)).padStart(5, '0')}.png`);
    await page.screenshot({ path: fn });
    if (i % 48 === 0 || i === n - 1) {
      const el = ((Date.now() - t0) / 1000 / (i + 1)) * (n - i - 1);
      console.log(`  frame ${i + 1}/${n} (t=${t.toFixed(2)}s) eta ${el.toFixed(0)}s`);
    }
  }
  await browser.close();
  server.close();
  console.log(`Done in ${((Date.now() - t0) / 1000 / 60).toFixed(1)} min -> ${out}`);
  process.exit(0);
}

main().catch(e => { console.error('FATAL', e); process.exit(1); });
