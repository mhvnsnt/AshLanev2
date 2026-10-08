#!/usr/bin/env node
// diag-smallrot.cjs — apply a small known rotation to one bone, see if skin follows correctly
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
const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setSize(960, 1080); renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);
const scene = new THREE.Scene(); scene.background = new THREE.Color(0x111116);
const camera = new THREE.PerspectiveCamera(35, 960/1080, 0.05, 100);
camera.position.set(0, 1.2, 4.5); camera.lookAt(0, 0.9, 0);
scene.add(new THREE.AmbientLight(0xffffff, 1.0));
const dl = new THREE.DirectionalLight(0xffffff, 1.5); dl.position.set(2, 4, 3); scene.add(dl);
const loader = new GLTFLoader(); loader.setMeshoptDecoder(MeshoptDecoder);
let cur = null;
window.__rot = async function (file, boneName, deg) {
  if (cur) scene.remove(cur);
  const gltf = await loader.loadAsync('/models/' + file);
  const root = gltf.scene; scene.add(root); cur = root;
  const bones = {};
  root.traverse(o => { if (o.isBone) bones[o.name.replace(/^mixamorig:?/, '')] = o; });
  console.log('DIAG ' + file + ' bones found: ' + Object.keys(bones).length + ' has ' + boneName + ': ' + !!bones[boneName]);
  const b = bones[boneName];
  if (b) {
    const e = new THREE.Euler(0, 0, THREE.MathUtils.degToRad(deg));
    b.quaternion.multiply(new THREE.Quaternion().setFromEuler(e));
    // check: how many skeleton bones share the name?
    let mesh = null; root.traverse(o => { if (o.isSkinnedMesh && !mesh) mesh = o; });
    const matches = mesh.skeleton.bones.filter(x => x.name.replace(/^mixamorig:?/, '') === boneName);
    console.log('DIAG skeleton bones matching ' + boneName + ': ' + matches.length + ' same object: ' + (matches[0] === b));
  }
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
      if (urlPath === '/rot.html') { res.writeHead(200, { 'Content-Type': 'text/html' }); res.end(PAGE); return; }
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
  const out = path.join(HERE, 'diag-rot');
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
  await page.goto(`http://127.0.0.1:${port}/rot.html`, { waitUntil: 'networkidle0', timeout: 120000 });
  await page.waitForFunction('window.__ready === true', { timeout: 120000 });
  // rotate LeftArm 30 degrees outward for toro (works) and onyx (broken)
  for (const [f, bn, deg] of [['EL_TORO_DE_ORO.glb','LeftArm',30], ['ONYX_street.glb','LeftArm',30], ['HOLLOW.glb','LeftArm',30], ['STATIC.glb','LeftArm',30]]) {
    await page.evaluate((ff, bb, dd) => window.__rot(ff, bb, dd), f, bn, deg);
    await page.screenshot({ path: path.join(out, `${f.replace('.glb','')}_arm30.png`) });
    console.log(`  ${f} done`);
  }
  await browser.close(); server.close();
  process.exit(0);
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
