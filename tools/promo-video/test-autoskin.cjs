#!/usr/bin/env node
// test-autoskin.cjs — bone-distance auto-skinning, test if it fixes ribbons
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

// point-to-segment distance
function ptSegDist(p, a, b) {
  const abx = b.x-a.x, aby = b.y-a.y, abz = b.z-a.z;
  const t = Math.max(0, Math.min(1, ((p.x-a.x)*abx + (p.y-a.y)*aby + (p.z-a.z)*abz) / (abx*abx+aby*aby+abz*abz || 1e-9)));
  const cx = a.x+abx*t, cy = a.y+aby*t, cz = a.z+abz*t;
  return Math.sqrt((p.x-cx)**2 + (p.y-cy)**2 + (p.z-cz)**2);
}

window.__autoskin = async function (file) {
  const gltf = await loader.loadAsync('/models/' + file);
  const root = gltf.scene; scene.add(root);
  let mesh = null;
  root.traverse(o => { if (o.isSkinnedMesh && !mesh) mesh = o; });
  const sk = mesh.skeleton;
  root.updateMatrixWorld(true);
  // bone segments: for each bone, segment from its world pos to its first child's world pos (or itself)
  const segs = [];
  const bp = new THREE.Vector3(), cp = new THREE.Vector3();
  for (let i = 0; i < sk.bones.length; i++) {
    const b = sk.bones[i];
    bp.setFromMatrixPosition(b.matrixWorld);
    if (b.children.length > 0 && b.children[0].isBone) {
      cp.setFromMatrixPosition(b.children[0].matrixWorld);
    } else {
      cp.copy(bp);
    }
    segs.push({ a: bp.clone(), b: cp.clone() });
  }
  const g = mesh.geometry;
  const pos = g.attributes.position;
  const nj = g.attributes.skinIndex, nw = g.attributes.skinWeight;
  const v = new THREE.Vector3();
  const t0 = Date.now();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    // find 4 nearest bones
    const ds = [];
    for (let bi = 0; bi < segs.length; bi++) {
      ds.push([ptSegDist(v, segs[bi].a, segs[bi].b), bi]);
    }
    ds.sort((a, b) => a[0] - b[0]);
    // weights = inverse distance squared, normalized; only keep 4
    const k = 4;
    let ws = [];
    for (let j = 0; j < k; j++) {
      const d = Math.max(ds[j][0], 0.01);
      ws.push([1 / (d * d), ds[j][1]]);
    }
    const sum = ws.reduce((s, x) => s + x[0], 0);
    // sort by weight desc for consistent ordering
    ws.sort((a, b) => b[0] - a[0]);
    const ji = [0, 0, 0, 0], ww = [0, 0, 0, 0];
    for (let j = 0; j < k; j++) { ji[j] = ws[j][1]; ww[j] = ws[j][0] / sum; }
    nj.setXYZW(i, ji[0], ji[1], ji[2], ji[3]);
    nw.setXYZW(i, ww[0], ww[1], ww[2], ww[3]);
  }
  nj.needsUpdate = true; nw.needsUpdate = true;
  console.log('DIAG autoskin done in ' + ((Date.now()-t0)/1000).toFixed(1) + 's for ' + pos.count + ' verts');

  // pose with walk
  const bones = {};
  root.traverse(o => { if (o.isBone) bones[o.name.replace(/^mixamorig:?/, '')] = o; });
  const rest = {}; for (const k in bones) rest[k] = bones[k].quaternion.clone();
  const baked = bakeClipRole(cmu.walk, 'atk', rest);
  const mid = Math.floor(baked.times.length / 2);
  for (const [bn, qs] of Object.entries(baked.bones)) {
    if (bones[bn]) bones[bn].quaternion.copy(qs[mid]);
  }
  renderer.render(scene, camera);
  console.log('DIAG posed with autoskin weights');
  return true;
};
window.__ready = true;
</scr` + `ipt></body></html>`;

function serve() {
  return new Promise(resolve => {
    const server = http.createServer((req, res) => {
      const urlPath = decodeURIComponent(req.url.split('?')[0]);
      let filePath;
      if (urlPath === '/as.html') { res.writeHead(200, { 'Content-Type': 'text/html' }); res.end(PAGE); return; }
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
  const out = path.join(HERE, 'diag-autoskin');
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
  await page.goto(`http://127.0.0.1:${port}/as.html`, { waitUntil: 'networkidle0', timeout: 180000 });
  await page.waitForFunction('window.__ready === true', { timeout: 180000 });
  await page.evaluate(() => window.__autoskin('ONYX_corset_skinned.glb'));
  await page.screenshot({ path: path.join(out, 'onyx_autoskin.png') });
  console.log('  done');
  await browser.close(); server.close();
  process.exit(0);
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
