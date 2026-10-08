#!/usr/bin/env node
// diag-weightpaint.cjs — color vertices by dominant bone to visualize weight assignment
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
camera.position.set(0, 0.1, 4.5); camera.lookAt(0, 0.1, 0);
scene.add(new THREE.AmbientLight(0xffffff, 1.2));
const dl = new THREE.DirectionalLight(0xffffff, 1.0); dl.position.set(2, 4, 3); scene.add(dl);
const loader = new GLTFLoader(); loader.setMeshoptDecoder(MeshoptDecoder);
// bone -> color
function boneColor(name) {
  name = name.replace(/^mixamorig:?/, '');
  if (/LeftArm|LeftForeArm|LeftHand/.test(name)) return [1, 0.2, 0.2];
  if (/RightArm|RightForeArm|RightHand/.test(name)) return [0.2, 0.2, 1];
  if (/LeftUpLeg|LeftLeg|LeftFoot/.test(name)) return [1, 0.6, 0.2];
  if (/RightUpLeg|RightLeg|RightFoot/.test(name)) return [0.2, 0.8, 1];
  if (/Head|Neck/.test(name)) return [1, 1, 0.2];
  if (/Spine|Hips/.test(name)) return [0.2, 1, 0.2];
  return [0.5, 0.5, 0.5];
}
let cur = null;
window.__paint = async function (file) {
  if (cur) scene.remove(cur);
  const gltf = await loader.loadAsync('/models/' + file);
  const root = gltf.scene; scene.add(root); cur = root;
  let mesh = null;
  root.traverse(o => { if (o.isSkinnedMesh && !mesh) mesh = o; });
  const g = mesh.geometry;
  const j = g.attributes.skinIndex, w = g.attributes.skinWeight;
  const sk = mesh.skeleton;
  const n = j.count;
  const colors = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    let bi = 0, bw = -1;
    const ws = [w.getX(i), w.getY(i), w.getZ(i), w.getW(i)];
    const js = [j.getX(i), j.getY(i), j.getZ(i), j.getW(i)];
    for (let k = 0; k < 4; k++) if (ws[k] > bw) { bw = ws[k]; bi = js[k]; }
    const c = boneColor(sk.bones[bi] ? sk.bones[bi].name : '');
    colors[i*3] = c[0]; colors[i*3+1] = c[1]; colors[i*3+2] = c[2];
  }
  g.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  mesh.material = new THREE.MeshBasicMaterial({ vertexColors: true });
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
      if (urlPath === '/paint.html') { res.writeHead(200, { 'Content-Type': 'text/html' }); res.end(PAGE); return; }
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
  const out = path.join(HERE, 'diag-paint');
  fs.mkdirSync(out, { recursive: true });
  const server = await serve();
  const port = server.address().port;
  const browser = await puppeteer.launch({ headless: 'shell',
    userDataDir: path.join(require('os').homedir(), 'workspace', 'promo-work', '.chrome-profile'),
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--disable-gpu-sandbox', '--force-device-scale-factor=1'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 960, height: 1080 });
  page.on('pageerror', e => console.log('  PAGEERROR: ' + e.message.slice(0,200)));
  await page.goto(`http://127.0.0.1:${port}/paint.html`, { waitUntil: 'networkidle0', timeout: 120000 });
  await page.waitForFunction('window.__ready === true', { timeout: 120000 });
  for (const f of ['EL_TORO_DE_ORO.glb', 'ONYX_corset_skinned.glb']) {
    await page.evaluate(ff => window.__paint(ff), f);
    await page.screenshot({ path: path.join(out, f.replace('.glb','') + '_paint.png') });
    console.log('  ' + f + ' done');
  }
  await browser.close(); server.close();
  process.exit(0);
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
