#!/usr/bin/env node
// diag-swap.cjs — put Onyx's geometry on EL TORO's skeleton (known-good)
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

window.__swap = async function () {
  // Load El Toro (donor skeleton) and Onyx (broken)
  const toroG = await loader.loadAsync('/models/EL_TORO_DE_ORO.glb');
  const onyxG = await loader.loadAsync('/models/ONYX_corset_skinned.glb');
  let toroMesh = null, onyxMesh = null;
  toroG.scene.traverse(o => { if (o.isSkinnedMesh && !toroMesh) toroMesh = o; });
  onyxG.scene.traverse(o => { if (o.isSkinnedMesh && !onyxMesh) onyxMesh = o; });

  const toroSk = toroMesh.skeleton;
  const toroBones = {};
  toroG.scene.traverse(o => { if (o.isBone) toroBones[o.name.replace(/^mixamorig:?/, '')] = o; });
  // POSE FIRST
  const rest = {}; for (const k in toroBones) rest[k] = toroBones[k].quaternion.clone();
  const baked = bakeClipRole(cmu.walk, 'atk', rest);
  const mid = Math.floor(baked.times.length / 2);
  for (const [bn, qs] of Object.entries(baked.bones)) {
    if (toroBones[bn]) toroBones[bn].quaternion.copy(qs[mid]);
  }
  toroG.scene.updateMatrixWorld(true);

  // Build new SkinnedMesh: Onyx geometry + El Toro skeleton (posed)
  scene.add(toroG.scene);
  const newMesh = new THREE.SkinnedMesh(onyxMesh.geometry, onyxMesh.material);
  newMesh.bind(toroSk, new THREE.Matrix4()); // bind with identity
  scene.add(newMesh);
  toroMesh.visible = false; onyxMesh.visible = false;
  // move Onyx mesh aside so we see only newMesh; hide onyx original entirely
  onyxG.scene.visible = false;

  scene.updateMatrixWorld(true);
  renderer.render(scene, camera);
  console.log('DIAG swap rendered: Onyx geo on Toro skeleton (posed)');
  return true;
};
window.__ready = true;
</scr` + `ipt></body></html>`;

function serve() {
  return new Promise(resolve => {
    const server = http.createServer((req, res) => {
      const urlPath = decodeURIComponent(req.url.split('?')[0]);
      let filePath;
      if (urlPath === '/swap.html') { res.writeHead(200, { 'Content-Type': 'text/html' }); res.end(PAGE); return; }
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
  const out = path.join(HERE, 'diag-swap');
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
  await page.goto(`http://127.0.0.1:${port}/swap.html`, { waitUntil: 'networkidle0', timeout: 180000 });
  await page.waitForFunction('window.__ready === true', { timeout: 180000 });
  await page.evaluate(() => window.__swap());
  await page.screenshot({ path: path.join(out, 'onyx_on_toro_skel.png') });
  console.log('  done');
  await browser.close(); server.close();
  process.exit(0);
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
