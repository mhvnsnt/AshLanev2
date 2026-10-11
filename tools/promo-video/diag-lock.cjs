#!/usr/bin/env node
// diag-lock.cjs — lock ALL vertices to Hips bone; if ribbons persist, it's not weights
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
let cur = null;
window.__lock = async function (file) {
  if (cur) scene.remove(cur);
  const gltf = await loader.loadAsync('/models/' + file);
  const root = gltf.scene; scene.add(root); cur = root;
  let mesh = null;
  root.traverse(o => { if (o.isSkinnedMesh && !mesh) mesh = o; });
  const sk = mesh.skeleton;
  const hipsIdx = sk.bones.findIndex(b => b.name.replace(/^mixamorig:?/, '') === 'Hips');
  console.log('DIAG hips index: ' + hipsIdx);
  const g = mesh.geometry;
  const nj = g.attributes.skinIndex, nw = g.attributes.skinWeight;
  for (let i = 0; i < nj.count; i++) {
    nj.setXYZW(i, hipsIdx, 0, 0, 0);
    nw.setXYZW(i, 1, 0, 0, 0);
  }
  nj.needsUpdate = true; nw.needsUpdate = true;
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
  console.log('DIAG locked to hips and posed');
  return true;
};
window.__ready = true;
</scr` + `ipt></body></html>`;

function serve() {
  return new Promise(resolve => {
    const server = http.createServer((req, res) => {
      const urlPath = decodeURIComponent(req.url.split('?')[0]);
      let filePath;
      if (urlPath === '/lock.html') { res.writeHead(200, { 'Content-Type': 'text/html' }); res.end(PAGE); return; }
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
  const out = path.join(HERE, 'diag-lock');
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
  await page.goto(`http://127.0.0.1:${port}/lock.html`, { waitUntil: 'networkidle0', timeout: 120000 });
  await page.waitForFunction('window.__ready === true', { timeout: 120000 });
  await page.evaluate(() => window.__lock('ONYX_corset_skinned.glb'));
  await page.screenshot({ path: path.join(out, 'onyx_lockhips.png') });
  console.log('  done');
  await browser.close(); server.close();
  process.exit(0);
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
