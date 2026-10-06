// proof-render.mjs <models_dir> <model_file> <outdir> <basename>
// Model-QC: render front/back/left/right proof shots of a GLB.
// Reuses the glb-renders viewer (three.js + meshopt, studio lighting).
// NOTE: puppeteer lives in the glb-renders renderer workspace dir;
// resolved via createRequire so ESM import works without a local install.
import { createRequire } from 'module';
const require = createRequire('/home/hatch/workspace/glb-renders/renderer/package.json');
const puppeteer = require('puppeteer');
import http from 'http';
import fs from 'fs';
import path from 'path';

const RENDERER_DIR = '/home/hatch/workspace/glb-renders/renderer';
const [modelsDir, modelFile, outDir, base] = process.argv.slice(2);
if (!modelsDir || !modelFile || !outDir || !base) {
  console.error('usage: proof-render.mjs <models_dir> <model_file> <outdir> <basename>');
  process.exit(2);
}
fs.mkdirSync(outDir, { recursive: true });

const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent(req.url.split('?')[0]);
  let filePath;
  if (urlPath.startsWith('/models/')) filePath = path.join(modelsDir, urlPath.slice(8));
  else if (urlPath.startsWith('/node_modules/')) filePath = path.join(RENDERER_DIR, 'node_modules', urlPath.slice(14));
  else if (urlPath === '/viewer-rot.html') filePath = path.join(RENDERER_DIR, 'viewer-rot.html');
  else { res.writeHead(404); res.end('nf'); return; }
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); res.end('nf: ' + urlPath); return; }
    const ext = path.extname(filePath);
    const ct = ext === '.html' ? 'text/html' : ext === '.js' ? 'text/javascript' : 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': ct }); res.end(data);
  });
});
await new Promise(r => server.listen(8943, r));
let code = 0;
try {
  const browser = await puppeteer.launch({ headless: 'shell', args: ['--no-sandbox', '--disable-setuid-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--disable-gpu-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 820, height: 840 });
  await page.goto(`http://localhost:8943/viewer-rot.html?model=${encodeURIComponent(modelFile)}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForFunction('window.__ready === true', { timeout: 90000 });
  const err = await page.evaluate('window.__error || null');
  if (err) { console.log('FAIL:', String(err).slice(0, 300)); code = 1; }
  else {
    for (const [name, deg] of [['front', 0], ['back', 180], ['left', 90], ['right', 270]]) {
      await page.evaluate(d => window.__rotate(d), deg);
      await new Promise(r => setTimeout(r, 700));
      await page.screenshot({ path: path.join(outDir, `${base}-${name}.png`), clip: { x: 0, y: 0, width: 800, height: 800 } });
      console.log('saved', name);
    }
  }
  await browser.close();
} finally { server.close(); }
process.exit(code);
