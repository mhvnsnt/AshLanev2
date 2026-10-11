#!/usr/bin/env node
// diag-weightsanity.cjs — check if weights are anatomically plausible
const puppeteer = require('puppeteer');
const http = require('http');
const fs = require('fs');
const path = require('path');

const HERE = __dirname;
const RNM = '/home/hatch/workspace/glb-renders/renderer/node_modules';
const MODELS_DIR = path.join(HERE, '..', '..', 'public', 'models', 'cast');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.glb': 'model/gltf-binary', '.json': 'application/json' };

const PAGE = `<!DOCTYPE html><html><head><meta charset="utf-8">
<script type="importmap">{ "imports": { "three": "/node_modules/three/build/three.module.js", "three/addons/": "/node_modules/three/examples/jsm/" } }</script>
</head><body><script type="module">
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
const loader = new GLTFLoader(); loader.setMeshoptDecoder(MeshoptDecoder);
// body part by bone name
function part(name) {
  name = name.replace(/^mixamorig:?/, '');
  if (/Head|Neck/.test(name)) return 'head';
  if (/Arm|Hand|Shoulder/.test(name)) return 'arm';
  if (/UpLeg|Leg|Foot|Toe/.test(name)) return 'leg';
  if (/Spine|Hips|Pelvis/.test(name)) return 'torso';
  return 'other';
}
function expectedPart(y) {
  // model centered: y in [-0.95, 0.95]
  if (y > 0.62) return 'head';
  if (y > 0.30) return 'arm';   // shoulder/upper arm height (arms at sides)
  if (y > -0.05) return 'torso';
  return 'leg';
}
window.__ws = async function (file) {
  const gltf = await loader.loadAsync('/models/' + file);
  const root = gltf.scene;
  let mesh = null;
  root.traverse(o => { if (o.isSkinnedMesh && !mesh) mesh = o; });
  const g = mesh.geometry;
  const pos = g.attributes.position, j = g.attributes.skinIndex, w = g.attributes.skinWeight;
  const sk = mesh.skeleton;
  const jname = i => sk.bones[i] ? sk.bones[i].name : '?';
  const v = new THREE.Vector3();
  let total = 0, mismatch = 0;
  const examples = [];
  for (let i = 0; i < pos.count; i += 7) {
    v.fromBufferAttribute(pos, i);
    // dominant joint
    let bi = 0, bw = -1;
    const ws = [w.getX(i), w.getY(i), w.getZ(i), w.getW(i)];
    const js = [j.getX(i), j.getY(i), j.getZ(i), j.getW(i)];
    for (let k = 0; k < 4; k++) if (ws[k] > bw) { bw = ws[k]; bi = js[k]; }
    if (bw < 0.5) continue; // skip blended verts
    const actual = part(jname(bi));
    const exp = expectedPart(v.y);
    // arms at sides: allow arm/torso mix in mid region
    const ok = (actual === exp) || (exp === 'arm' && actual === 'torso') || (exp === 'torso' && actual === 'arm');
    total++;
    if (!ok) {
      mismatch++;
      if (examples.length < 5) examples.push('y=' + v.y.toFixed(2) + ' exp=' + exp + ' got=' + actual + '(' + jname(bi).replace(/^mixamorig:?/,'') + ':' + bw.toFixed(2) + ')');
    }
  }
  console.log('DIAG ' + file + ' anatomical mismatch: ' + mismatch + '/' + total + ' (' + (100*mismatch/Math.max(1,total)).toFixed(1) + '%)');
  examples.forEach(e => console.log('DIAG   ex: ' + e));
  return true;
};
window.__ready = true;
</scr` + `ipt></body></html>`;

function serve() {
  return new Promise(resolve => {
    const server = http.createServer((req, res) => {
      const urlPath = decodeURIComponent(req.url.split('?')[0]);
      let filePath;
      if (urlPath === '/ws.html') { res.writeHead(200, { 'Content-Type': 'text/html' }); res.end(PAGE); return; }
      else if (urlPath.startsWith('/models/')) filePath = path.join(MODELS_DIR, urlPath.slice(8));
      else if (urlPath.startsWith('/node_modules/')) filePath = path.join(RNM, urlPath.slice(14));
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
  const browser = await puppeteer.launch({ headless: 'shell',
    userDataDir: path.join(require('os').homedir(), 'workspace', 'promo-work', '.chrome-profile'),
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--disable-gpu-sandbox', '--force-device-scale-factor=1'] });
  const page = await browser.newPage();
  page.on('console', m => { const t = m.text(); if (t.startsWith('DIAG')) console.log('  ' + t); });
  page.on('pageerror', e => console.log('  PAGEERROR: ' + e.message.slice(0,200)));
  await page.goto(`http://127.0.0.1:${port}/ws.html`, { waitUntil: 'networkidle0', timeout: 120000 });
  await page.waitForFunction('window.__ready === true', { timeout: 120000 });
  for (const f of ['EL_TORO_DE_ORO.glb', 'STATIC.glb', 'CIPHER_rigged.glb', 'ONYX_street.glb', 'ONYX_corset_skinned.glb', 'HOLLOW.glb', 'ECHO.glb']) {
    await page.evaluate(ff => window.__ws(ff), f);
  }
  await browser.close(); server.close();
  process.exit(0);
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
