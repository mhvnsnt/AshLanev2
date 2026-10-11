#!/usr/bin/env node
// diag-trace.cjs — manually compute skinned position of one arm vertex, compare to rendered
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
import { bakeClipRole } from './faction-motion.js';
const loader = new GLTFLoader(); loader.setMeshoptDecoder(MeshoptDecoder);
const cmu = await fetch('/motion/cmu-bank.json').then(r => r.json()).then(j => j.clips);
window.__trace = async function (file, vertIdx) {
  const gltf = await loader.loadAsync('/models/' + file);
  const root = gltf.scene;
  let mesh = null;
  root.traverse(o => { if (o.isSkinnedMesh && !mesh) mesh = o; });
  const sk = mesh.skeleton;
  const g = mesh.geometry;
  const pos = g.attributes.position, sj = g.attributes.skinIndex, sw = g.attributes.skinWeight;
  const bones = {};
  root.traverse(o => { if (o.isBone) bones[o.name.replace(/^mixamorig:?/, '')] = o; });
  const rest = {}; for (const k in bones) rest[k] = bones[k].quaternion.clone();
  const baked = bakeClipRole(cmu.walk, 'atk', rest);
  const mid = Math.floor(baked.times.length / 2);
  for (const [bn, qs] of Object.entries(baked.bones)) {
    if (bones[bn]) bones[bn].quaternion.copy(qs[mid]);
  }
  root.updateMatrixWorld(true);
  // manually skin vertIdx
  const v = new THREE.Vector3().fromBufferAttribute(pos, vertIdx);
  const js = [sj.getX(vertIdx), sj.getY(vertIdx), sj.getZ(vertIdx), sj.getW(vertIdx)];
  const ws = [sw.getX(vertIdx), sw.getY(vertIdx), sw.getZ(vertIdx), sw.getW(vertIdx)];
  console.log('DIAG vert ' + vertIdx + ' restPos=[' + v.x.toFixed(3) + ',' + v.y.toFixed(3) + ',' + v.z.toFixed(3) + ']');
  const M = new THREE.Matrix4();
  const tv = new THREE.Vector3();
  const result = new THREE.Vector3(0, 0, 0);
  for (let k = 0; k < 4; k++) {
    if (ws[k] === 0) continue;
    const bn = sk.bones[js[k]].name.replace(/^mixamorig:?/, '');
    M.multiplyMatrices(sk.boneInverses[js[k]], sk.bones[js[k]].matrixWorld);
    tv.copy(v).applyMatrix4(M);
    console.log('DIAG   influence ' + k + ': bone=' + bn + ' (idx ' + js[k] + ') w=' + ws[k].toFixed(3) + ' -> [' + tv.x.toFixed(3) + ',' + tv.y.toFixed(3) + ',' + tv.z.toFixed(3) + ']');
    result.addScaledVector(tv, ws[k]);
  }
  console.log('DIAG   SKINNED RESULT: [' + result.x.toFixed(3) + ',' + result.y.toFixed(3) + ',' + result.z.toFixed(3) + ']');
  console.log('DIAG done');
  return true;
};
window.__ready = true;
</scr` + `ipt></body></html>`;

function serve() {
  return new Promise(resolve => {
    const server = http.createServer((req, res) => {
      const urlPath = decodeURIComponent(req.url.split('?')[0]);
      let filePath;
      if (urlPath === '/t.html') { res.writeHead(200, { 'Content-Type': 'text/html' }); res.end(PAGE); return; }
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
  page.on('pageerror', e => console.log('  PAGEERROR: ' + e.message.slice(0,300)));
  await page.goto(`http://127.0.0.1:${port}/t.html`, { waitUntil: 'networkidle0', timeout: 120000 });
  await page.waitForFunction('window.__ready === true', { timeout: 120000 });
  // trace an arm vertex (v754 from earlier)
  await page.evaluate(() => window.__trace('EL_TORO_DE_ORO.glb', 592));
  await browser.close(); server.close();
  process.exit(0);
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
