#!/usr/bin/env node
// test-reskin.cjs — apply transferred weights and test animation
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

async function loadMesh(file) {
  const gltf = await loader.loadAsync('/models/' + file);
  let mesh = null;
  gltf.scene.traverse(o => { if (o.isSkinnedMesh && !mesh) mesh = o; });
  return { gltf, mesh };
}

window.__test = async function (srcFile, dstFile) {
  const src = await loadMesh(srcFile);
  const dst = await loadMesh(dstFile);
  scene.add(dst.gltf.scene);
  const sg = src.mesh.geometry, dg = dst.mesh.geometry;
  const sp = sg.attributes.position, dp = dg.attributes.position;
  const sj = sg.attributes.skinIndex, sw = sg.attributes.skinWeight;

  // normalize: center both on their bbox, scale to same height
  const sb = new THREE.Box3().setFromBufferAttribute(sp);
  const db = new THREE.Box3().setFromBufferAttribute(dp);
  const ss = new THREE.Vector3(), ds = new THREE.Vector3();
  sb.getSize(ss); db.getSize(ds);
  const sc = new THREE.Vector3(), dc = new THREE.Vector3();
  sb.getCenter(sc); db.getCenter(dc);
  const scale = ds.y / ss.y;

  const CELL = 0.08;
  const grid = new Map();
  const sv = new THREE.Vector3();
  const skey = (x, y, z) => Math.floor(x/CELL) + ',' + Math.floor(y/CELL) + ',' + Math.floor(z/CELL);
  // store src verts in normalized space
  const snorm = [];
  for (let i = 0; i < sp.count; i++) {
    sv.fromBufferAttribute(sp, i);
    const nx = (sv.x - sc.x) * scale, ny = (sv.y - sc.y) * scale, nz = (sv.z - sc.z) * scale;
    snorm.push([nx, ny, nz]);
    const k = skey(nx, ny, nz);
    if (!grid.has(k)) grid.set(k, []);
    grid.get(k).push(i);
  }
  const dv = new THREE.Vector3();
  const nj = dg.attributes.skinIndex, nw = dg.attributes.skinWeight;
  let totalD = 0;
  for (let i = 0; i < dp.count; i++) {
    dv.fromBufferAttribute(dp, i);
    const nx = dv.x - dc.x, ny = dv.y - dc.y, nz = dv.z - dc.z;
    let best = -1, bestD = 1e9;
    for (let dx = -2; dx <= 2; dx++) for (let dy = -2; dy <= 2; dy++) for (let dz = -2; dz <= 2; dz++) {
      const k = (Math.floor(nx/CELL)+dx) + ',' + (Math.floor(ny/CELL)+dy) + ',' + (Math.floor(nz/CELL)+dz);
      const cell = grid.get(k);
      if (!cell) continue;
      for (const si of cell) {
        const s = snorm[si];
        const d = (s[0]-nx)**2 + (s[1]-ny)**2 + (s[2]-nz)**2;
        if (d < bestD) { bestD = d; best = si; }
      }
    }
    if (best < 0) best = 0;
    totalD += Math.sqrt(bestD);
    nj.setXYZW(i, sj.getX(best), sj.getY(best), sj.getZ(best), sj.getW(best));
    nw.setXYZW(i, sw.getX(best), sw.getY(best), sw.getZ(best), sw.getW(best));
  }
  nj.needsUpdate = true; nw.needsUpdate = true;
  console.log('DIAG avg transfer dist: ' + (totalD / dp.count).toFixed(4));

  // now pose with walk
  const root = dst.gltf.scene;
  const bones = {};
  root.traverse(o => { if (o.isBone) bones[o.name.replace(/^mixamorig:?/, '')] = o; });
  const rest = {}; for (const k in bones) rest[k] = bones[k].quaternion.clone();
  const baked = bakeClipRole(cmu.walk, 'atk', rest);
  const mid = Math.floor(baked.times.length / 2);
  for (const [bn, qs] of Object.entries(baked.bones)) {
    if (bones[bn]) bones[bn].quaternion.copy(qs[mid]);
  }
  renderer.render(scene, camera);
  console.log('DIAG posed with transferred weights');
  return true;
};
window.__ready = true;
</scr` + `ipt></body></html>`;

function serve() {
  return new Promise(resolve => {
    const server = http.createServer((req, res) => {
      const urlPath = decodeURIComponent(req.url.split('?')[0]);
      let filePath;
      if (urlPath === '/tr.html') { res.writeHead(200, { 'Content-Type': 'text/html' }); res.end(PAGE); return; }
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
  const out = path.join(HERE, 'diag-transfer');
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
  await page.goto(`http://127.0.0.1:${port}/tr.html`, { waitUntil: 'networkidle0', timeout: 180000 });
  await page.waitForFunction('window.__ready === true', { timeout: 180000 });
  await page.evaluate(() => window.__test('STATIC.glb', 'ONYX_corset_skinned.glb'));
  await page.screenshot({ path: path.join(out, 'onyx_transferred.png') });
  console.log('  done');
  await browser.close(); server.close();
  process.exit(0);
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
