#!/usr/bin/env node
// diag-pose.cjs — render models at REST and with walk clip to diagnose collapse
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
renderer.setSize(960, 1080);
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111116);
const camera = new THREE.PerspectiveCamera(35, 960/1080, 0.05, 100);
camera.position.set(0, 1.4, 4.2); camera.lookAt(0, 1.0, 0);
scene.add(new THREE.AmbientLight(0xffffff, 0.9));
const dl = new THREE.DirectionalLight(0xffffff, 1.2); dl.position.set(2, 4, 3); scene.add(dl);
const ground = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), new THREE.MeshStandardMaterial({ color: 0x222228 }));
ground.rotation.x = -Math.PI/2; scene.add(ground);

const loader = new GLTFLoader(); loader.setMeshoptDecoder(MeshoptDecoder);
const bank = await fetch('/motion/bank.json').then(r => r.json()).then(j => j.clips);
const cmu = await fetch('/motion/cmu-bank.json').then(r => r.json()).then(j => j.clips);

window.__diag = async function (file, mode) {
  // clear previous
  for (let i = scene.children.length - 1; i >= 0; i--) {
    const o = scene.children[i];
    if (o.isGroup || o.isMesh || o.isObject3D) { if (o !== ground && !o.isLight && o.type !== 'AmbientLight' && o.type !== 'DirectionalLight') scene.remove(o); }
  }
  // re-add lights/ground references kept separately - simpler: rebuild
  const gltf = await loader.loadAsync('/models/' + file);
  const root = gltf.scene; scene.add(root);
  const bbox = new THREE.Box3().setFromObject(root);
  const center = bbox.getCenter(new THREE.Vector3());
  root.position.x -= center.x; root.position.z -= center.z; root.position.y -= bbox.min.y;
  const bones = {};
  root.traverse(o => { if (o.isBone) bones[o.name.replace(/^mixamorig:?/, '')] = o; });
  const rest = {}; for (const k in bones) rest[k] = bones[k].quaternion.clone();
  console.log('DIAG bones: ' + Object.keys(bones).length + ' file=' + file);
  if (mode !== 'rest') {
    const clip = mode === 'walk' ? cmu.walk : bank[mode];
    const baked = bakeClipRole(clip, 'atk', rest);
    // sample mid-clip
    const mid = Math.floor(baked.times.length / 2);
    for (const [bn, qs] of Object.entries(baked.bones)) {
      if (bones[bn]) bones[bn].quaternion.copy(qs[mid]);
    }
  }
  renderer.render(scene, camera);
  return true;
};

window.__ibmcheck = async function (file) {
  const gltf = await loader.loadAsync('/models/' + file);
  const root = gltf.scene;
  let mesh = null;
  root.traverse(o => { if (o.isSkinnedMesh && !mesh) mesh = o; });
  root.updateMatrixWorld(true);
  const sk = mesh.skeleton;
  const M = new THREE.Matrix4();
  let worst = 0; const per = [];
  for (let i = 0; i < Math.min(sk.bones.length, 12); i++) {
    M.multiplyMatrices(sk.boneInverses[i], sk.bones[i].matrixWorld);
    let d = 0;
    for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) {
      const want = (r === c) ? 1 : 0;
      d = Math.max(d, Math.abs(M.elements[c * 4 + r] - want));
    }
    worst = Math.max(worst, d);
    per.push(sk.bones[i].name.replace('mixamorig:', '') + ':' + d.toFixed(2));
  }
  console.log('DIAG ' + file + ' worst=' + worst.toFixed(2) + ' ' + per.join(' '));
  return true;
};
window.__ready = true;
</scr` + `ipt></body></html>`;

function serve() {
  return new Promise(resolve => {
    const server = http.createServer((req, res) => {
      const urlPath = decodeURIComponent(req.url.split('?')[0]);
      let filePath, body;
      if (urlPath === '/diag.html') { res.writeHead(200, { 'Content-Type': 'text/html' }); res.end(PAGE); return; }
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
  const server = await serve();
  const port = server.address().port;
  const browser = await puppeteer.launch({ headless: 'shell',
    userDataDir: path.join(require('os').homedir(), 'workspace', 'promo-work', '.chrome-profile'),
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--disable-gpu-sandbox', '--force-device-scale-factor=1'] });
  const page = await browser.newPage();
  page.on('console', m => { const t = m.text(); if (t.startsWith('DIAG')) console.log('  ' + t); });
  page.on('pageerror', e => console.log('  PAGEERROR: ' + e.message.slice(0,200)));
  await page.goto(`http://127.0.0.1:${port}/diag.html`, { waitUntil: 'networkidle0', timeout: 120000 });
  await page.waitForFunction('window.__ready === true', { timeout: 120000 });
  for (const f of ['EL_TORO_DE_ORO.glb', 'STATIC.glb', 'ONYX_street.glb', 'HOLLOW.glb', 'ECHO.glb', 'CIPHER_rigged.glb']) {
    await page.evaluate(ff => window.__ibmcheck(ff), f);
  }
  await browser.close(); server.close();
  process.exit(0);
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
