#!/usr/bin/env node
// diag-matrix.cjs — print boneWorld, IBM, and product before/after rotation
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
const loader = new GLTFLoader(); loader.setMeshoptDecoder(MeshoptDecoder);
function matStr(m) {
  const e = m.elements;
  return 't(' + e[12].toFixed(2) + ',' + e[13].toFixed(2) + ',' + e[14].toFixed(2) + ')';
}
window.__mx = async function (file) {
  const gltf = await loader.loadAsync('/models/' + file);
  const root = gltf.scene;
  let mesh = null;
  root.traverse(o => { if (o.isSkinnedMesh && !mesh) mesh = o; });
  const bones = {};
  root.traverse(o => { if (o.isBone) bones[o.name.replace(/^mixamorig:?/, '')] = o; });
  const sk = mesh.skeleton;
  const idx = sk.bones.findIndex(b => b.name.replace(/^mixamorig:?/, '') === 'LeftArm');
  root.updateMatrixWorld(true);
  const M = new THREE.Matrix4();
  M.multiplyMatrices(sk.boneInverses[idx], sk.bones[idx].matrixWorld);
  console.log('DIAG ' + file + ' rest: boneWorld ' + matStr(sk.bones[idx].matrixWorld) + ' product ' + matStr(M));
  // parent world
  console.log('DIAG ' + file + ' rest: parentWorld ' + matStr(sk.bones[idx].parent.matrixWorld) + ' bonePos ' + sk.bones[idx].position.toArray().map(x=>x.toFixed(2)).join(','));
  // now rotate
  bones['LeftArm'].quaternion.multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, THREE.MathUtils.degToRad(30))));
  root.updateMatrixWorld(true);
  M.multiplyMatrices(sk.boneInverses[idx], sk.bones[idx].matrixWorld);
  console.log('DIAG ' + file + ' rot30: boneWorld ' + matStr(sk.bones[idx].matrixWorld) + ' product ' + matStr(M));
  // what does the product do to a point at the elbow (0.25 below shoulder)?
  const p = new THREE.Vector3(0, -0.25, 0).applyMatrix4(M);
  console.log('DIAG ' + file + ' rot30: elbow point -> (' + p.x.toFixed(2) + ',' + p.y.toFixed(2) + ',' + p.z.toFixed(2) + ')');
  return true;
};
window.__ready = true;
</scr` + `ipt></body></html>`;

function serve() {
  return new Promise(resolve => {
    const server = http.createServer((req, res) => {
      const urlPath = decodeURIComponent(req.url.split('?')[0]);
      let filePath;
      if (urlPath === '/mx.html') { res.writeHead(200, { 'Content-Type': 'text/html' }); res.end(PAGE); return; }
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
  const server = await serve();
  const port = server.address().port;
  const browser = await puppeteer.launch({ headless: 'shell',
    userDataDir: path.join(require('os').homedir(), 'workspace', 'promo-work', '.chrome-profile'),
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--disable-gpu-sandbox', '--force-device-scale-factor=1'] });
  const page = await browser.newPage();
  page.on('console', m => { const t = m.text(); if (t.startsWith('DIAG')) console.log('  ' + t); });
  page.on('pageerror', e => console.log('  PAGEERROR: ' + e.message.slice(0,200)));
  await page.goto(`http://127.0.0.1:${port}/mx.html`, { waitUntil: 'networkidle0', timeout: 120000 });
  await page.waitForFunction('window.__ready === true', { timeout: 120000 });
  for (const f of ['EL_TORO_DE_ORO.glb', 'ONYX_corset_skinned.glb']) {
    await page.evaluate(ff => window.__mx(ff), f);
  }
  await browser.close(); server.close();
  process.exit(0);
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
