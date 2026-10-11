#!/usr/bin/env node
// diag-verts.cjs — dump raw vertex data for arm-region vertices
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
window.__verts = async function (file) {
  const gltf = await loader.loadAsync('/models/' + file);
  let mesh = null;
  gltf.scene.traverse(o => { if (o.isSkinnedMesh && !mesh) mesh = o; });
  const sk = mesh.skeleton;
  const g = mesh.geometry;
  const pos = g.attributes.position, sj = g.attributes.skinIndex, sw = g.attributes.skinWeight;
  // find LeftArm bone index and its world position
  const armIdx = sk.bones.findIndex(b => b.name.replace(/^mixamorig:?/, '') === 'LeftArm');
  gltf.scene.updateMatrixWorld(true);
  const armPos = new THREE.Vector3().setFromMatrixPosition(sk.bones[armIdx].matrixWorld);
  console.log('DIAG ' + file + ' LeftArm idx=' + armIdx + ' worldPos=[' + armPos.x.toFixed(3) + ',' + armPos.y.toFixed(3) + ',' + armPos.z.toFixed(3) + '] vertCount=' + pos.count);
  // find vertices weighted primarily to LeftArm, print first 5
  const v = new THREE.Vector3();
  let shown = 0, armVertCount = 0;
  const posMap = new Map();
  let dupCount = 0;
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const k = v.x.toFixed(4) + ',' + v.y.toFixed(4) + ',' + v.z.toFixed(4);
    if (posMap.has(k)) dupCount++;
    else posMap.set(k, i);
    const ws = [sw.getX(i), sw.getY(i), sw.getZ(i), sw.getW(i)];
    const js = [sj.getX(i), sj.getY(i), sj.getZ(i), sj.getW(i)];
    let bi = 0; for (let k2 = 1; k2 < 4; k2++) if (ws[k2] > ws[bi]) bi = k2;
    if (js[bi] === armIdx) {
      armVertCount++;
      if (shown < 5) {
        console.log('DIAG   v' + i + ' pos=[' + v.x.toFixed(3) + ',' + v.y.toFixed(3) + ',' + v.z.toFixed(3) + '] joints=[' + js.join(',') + '] weights=[' + ws.map(w=>w.toFixed(2)).join(',') + '] distToArm=' + v.distanceTo(armPos).toFixed(3));
        shown++;
      }
    }
  }
  console.log('DIAG   total verts weighted to LeftArm: ' + armVertCount + ', duplicate positions: ' + dupCount);
  console.log('DIAG done ' + file);
  return true;
};
window.__ready = true;
</scr` + `ipt></body></html>`;

function serve() {
  return new Promise(resolve => {
    const server = http.createServer((req, res) => {
      const urlPath = decodeURIComponent(req.url.split('?')[0]);
      let filePath;
      if (urlPath === '/v.html') { res.writeHead(200, { 'Content-Type': 'text/html' }); res.end(PAGE); return; }
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
  page.on('pageerror', e => console.log('  PAGEERROR: ' + e.message.slice(0,300)));
  await page.goto(`http://127.0.0.1:${port}/v.html`, { waitUntil: 'networkidle0', timeout: 120000 });
  await page.waitForFunction('window.__ready === true', { timeout: 120000 });
  for (const f of ['EL_TORO_DE_ORO.glb', 'ONYX_corset_skinned.glb']) {
    await page.evaluate(ff => window.__verts(ff), f);
  }
  await browser.close(); server.close();
  process.exit(0);
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
