#!/usr/bin/env node
// diag-isolate.cjs — apply walk clip to bone groups separately to isolate the break
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
camera.position.set(0, 1.4, 4.2); camera.lookAt(0, 1.0, 0);
scene.add(new THREE.AmbientLight(0xffffff, 0.9));
const dl = new THREE.DirectionalLight(0xffffff, 1.2); dl.position.set(2, 4, 3); scene.add(dl);
const ground = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), new THREE.MeshStandardMaterial({ color: 0x222228 }));
ground.rotation.x = -Math.PI/2; scene.add(ground);
const loader = new GLTFLoader(); loader.setMeshoptDecoder(MeshoptDecoder);
const cmu = await fetch('/motion/cmu-bank.json').then(r => r.json()).then(j => j.clips);

let cur = null;
window.__iso = async function (file, skipGroups) {
  if (cur) scene.remove(cur);
  const gltf = await loader.loadAsync('/models/' + file);
  const root = gltf.scene; scene.add(root); cur = root;
  const bbox = new THREE.Box3().setFromObject(root);
  const center = bbox.getCenter(new THREE.Vector3());
  root.position.x -= center.x; root.position.z -= center.z; root.position.y -= bbox.min.y;
  const bones = {};
  root.traverse(o => { if (o.isBone) bones[o.name.replace(/^mixamorig:?/, '')] = o; });
  const rest = {}; for (const k in bones) rest[k] = bones[k].quaternion.clone();
  const baked = bakeClipRole(cmu.walk, 'atk', rest);
  const mid = Math.floor(baked.times.length / 2);
  const SKIP = {
    arms: ['LeftArm','LeftForeArm','LeftHand','RightArm','RightForeArm','RightHand','LeftShoulder','RightShoulder'],
    legs: ['LeftUpLeg','LeftLeg','LeftFoot','LeftToeBase','RightUpLeg','RightLeg','RightFoot','RightToeBase'],
    spine: ['Hips','Spine','Spine1','Spine2','Neck','Head'],
  };
  const skip = new Set();
  for (const g of skipGroups) for (const b of (SKIP[g] || [])) skip.add(b);
  for (const [bn, qs] of Object.entries(baked.bones)) {
    if (bones[bn] && !skip.has(bn)) bones[bn].quaternion.copy(qs[mid]);
  }
  // report bone world positions for arms
  const rw = new THREE.Vector3();
  if (bones['LeftArm']) { bones['LeftArm'].getWorldPosition(rw); console.log('DIAG LArm world: ' + rw.x.toFixed(2) + ',' + rw.y.toFixed(2) + ',' + rw.z.toFixed(2)); }
  renderer.render(scene, camera);
  return true;
};
window.__ready = true;
</scr` + `ipt></body></html>`;

function serve() {
  return new Promise(resolve => {
    const server = http.createServer((req, res) => {
      const urlPath = decodeURIComponent(req.url.split('?')[0]);
      let filePath;
      if (urlPath === '/iso.html') { res.writeHead(200, { 'Content-Type': 'text/html' }); res.end(PAGE); return; }
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
  const out = path.join(HERE, 'diag-iso');
  fs.mkdirSync(out, { recursive: true });
  const server = await serve();
  const port = server.address().port;
  const browser = await puppeteer.launch({ headless: 'shell',
    userDataDir: path.join(require('os').homedir(), 'workspace', 'promo-work', '.chrome-profile'),
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--disable-gpu-sandbox', '--force-device-scale-factor=1'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 960, height: 1080 });
  page.on('console', m => { const t = m.text(); if (t.startsWith('DIAG')) console.log('  ' + t); });
  await page.goto(`http://127.0.0.1:${port}/iso.html`, { waitUntil: 'networkidle0', timeout: 120000 });
  await page.waitForFunction('window.__ready === true', { timeout: 120000 });
  const cases = [
    ['noarms', ['arms']], ['nolegs', ['legs']], ['nospine', ['spine']],
    ['onlyarms', ['legs', 'spine']],
  ];
  for (const [label, skip] of cases) {
    await page.evaluate((s) => window.__iso('ONYX_street.glb', s), skip);
    await page.screenshot({ path: path.join(out, `onyx_${label}.png`) });
    console.log(`  onyx ${label} done`);
  }
  await browser.close(); server.close();
  process.exit(0);
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
