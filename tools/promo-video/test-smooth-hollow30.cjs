#!/usr/bin/env node
// test-smooth.cjs — Laplacian smooth the ORIGINAL weights, test if it fixes ribbons
const puppeteer = require('puppeteer');
const http = require('http');
const fs = require('fs');
const path = require('path');

const HERE = __dirname;
const RNM = '/home/hatch/workspace/glb-renders/renderer/node_modules';
const MODELS_DIR = path.join(HERE, '..', '..', 'public', 'models', 'cast');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.glb': 'model/gltf-binary', '.json': 'application/json' };

const PAGE = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>html,body{margin:0;background:#111}canvas{display:block}</style>
<script type="importmap">{ "imports": { "three": "/node_modules/three/build/three.module.js", "three/addons/": "/node_modules/three/examples/jsm/" } }</script>
</head><body><script type="module">
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { bakeClipRole } from './faction-motion.js';
const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setSize(960, 1080); renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);
const scene = new THREE.Scene(); scene.background = new THREE.Color(0x111116);
const camera = new THREE.PerspectiveCamera(35, 960/1080, 0.05, 100);
camera.position.set(0, 0.1, 4.5); camera.lookAt(0, 0.1, 0);
scene.add(new THREE.AmbientLight(0xffffff, 1.0));
const dl = new THREE.DirectionalLight(0xffffff, 1.5); dl.position.set(2, 4, 3); scene.add(dl);
const loader = new GLTFLoader(); loader.setMeshoptDecoder(MeshoptDecoder);
const cmu = await fetch('/motion/cmu-bank.json').then(r => r.json()).then(j => j.clips);

window.__smooth = async function (file, iterations) {
  const gltf = await loader.loadAsync('/models/' + file);
  const root = gltf.scene; scene.add(root);
  let mesh = null;
  root.traverse(o => { if (o.isSkinnedMesh && !mesh) mesh = o; });
  const g = mesh.geometry;
  const pos = g.attributes.position;
  const sj = g.attributes.skinIndex, sw = g.attributes.skinWeight;
  const n = pos.count;

  // Build adjacency from index buffer
  const idx = g.index.array;
  const adj = Array.from({length: n}, () => new Set());
  for (let i = 0; i < idx.length; i += 3) {
    const a = idx[i], b = idx[i+1], c = idx[i+2];
    adj[a].add(b); adj[a].add(c);
    adj[b].add(a); adj[b].add(c);
    adj[c].add(a); adj[c].add(b);
  }
  console.log('DIAG adjacency built, avg degree: ' + (adj.reduce((s,x)=>s+x.size,0)/n).toFixed(1));

  // Convert to per-vertex bone->weight maps (58 bones max)
  const NB = mesh.skeleton.bones.length;
  let W = new Float32Array(n * NB);
  for (let i = 0; i < n; i++) {
    W[i*NB + sj.getX(i)] += sw.getX(i);
    W[i*NB + sj.getY(i)] += sw.getY(i);
    W[i*NB + sj.getZ(i)] += sw.getZ(i);
    W[i*NB + sj.getW(i)] += sw.getW(i);
  }

  // Laplacian smooth
  for (let it = 0; it < iterations; it++) {
    const Wn = new Float32Array(n * NB);
    for (let i = 0; i < n; i++) {
      const nbrs = [...adj[i]];
      if (nbrs.length === 0) { for (let b = 0; b < NB; b++) Wn[i*NB+b] = W[i*NB+b]; continue; }
      for (let b = 0; b < NB; b++) {
        let s = W[i*NB+b] * 0.5; // keep 50% self
        for (const j of nbrs) s += W[j*NB+b] * 0.5 / nbrs.length;
        Wn[i*NB+b] = s;
      }
    }
    W = Wn;
  }

  // Convert back to 4 influences (top 4 by weight)
  for (let i = 0; i < n; i++) {
    const pairs = [];
    for (let b = 0; b < NB; b++) if (W[i*NB+b] > 0.001) pairs.push([W[i*NB+b], b]);
    pairs.sort((a, b) => b[0] - a[0]);
    const ji = [0,0,0,0], ww = [0,0,0,0];
    let sum = 0;
    for (let k = 0; k < Math.min(4, pairs.length); k++) { ji[k] = pairs[k][1]; ww[k] = pairs[k][0]; sum += pairs[k][0]; }
    if (sum > 0) for (let k = 0; k < 4; k++) ww[k] /= sum;
    else { ji[0] = 0; ww[0] = 1; }
    sj.setXYZW(i, ji[0], ji[1], ji[2], ji[3]);
    sw.setXYZW(i, ww[0], ww[1], ww[2], ww[3]);
  }
  sj.needsUpdate = true; sw.needsUpdate = true;
  console.log('DIAG smoothing done (' + iterations + ' iters)');

  // pose
  const bones = {};
  root.traverse(o => { if (o.isBone) bones[o.name.replace(/^mixamorig:?/, '')] = o; });
  const rest = {}; for (const k in bones) rest[k] = bones[k].quaternion.clone();
  const baked = bakeClipRole(cmu.walk, 'atk', rest);
  const mid = Math.floor(baked.times.length / 2);
  for (const [bn, qs] of Object.entries(baked.bones)) {
    if (bones[bn]) bones[bn].quaternion.copy(qs[mid]);
  }
  renderer.render(scene, camera);
  console.log('DIAG posed with smoothed weights');
  return true;
};
window.__ready = true;
</scr` + `ipt></body></html>`;

function serve() {
  return new Promise(resolve => {
    const server = http.createServer((req, res) => {
      const urlPath = decodeURIComponent(req.url.split('?')[0]);
      let filePath;
      if (urlPath === '/sm.html') { res.writeHead(200, { 'Content-Type': 'text/html' }); res.end(PAGE); return; }
      else if (urlPath === '/faction-motion.js') filePath = path.join(HERE, 'faction-motion.js');
      else if (urlPath.startsWith('/models/')) filePath = path.join(MODELS_DIR, urlPath.slice(8));
      else if (urlPath.startsWith('/motion/')) filePath = path.join(HERE, '..', '..', 'public', 'motion', urlPath.slice(8));
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
  const out = path.join(HERE, 'diag-smooth');
  fs.mkdirSync(out, { recursive: true });
  const server = await serve();
  const port = server.address().port;
  const browser = await puppeteer.launch({ headless: 'shell',
    userDataDir: path.join(require('os').homedir(), 'workspace', 'promo-work', '.chrome-profile'),
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--disable-gpu-sandbox', '--force-device-scale-factor=1'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 960, height: 1080 });
  page.on('console', m => { const t = m.text(); if (t.startsWith('DIAG')) console.log('  ' + t); });
  page.on('pageerror', e => console.log('  PAGEERROR: ' + e.message.slice(0,300)));
  await page.goto(`http://127.0.0.1:${port}/sm.html`, { waitUntil: 'networkidle0', timeout: 180000 });
  await page.waitForFunction('window.__ready === true', { timeout: 180000 });
  await page.evaluate(() => window.__smooth('HOLLOW.glb', 30));
  await page.screenshot({ path: path.join(out, 'hollow_smooth30.png') });
  console.log('  done');
  await browser.close(); server.close();
  process.exit(0);
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
