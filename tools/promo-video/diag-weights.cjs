#!/usr/bin/env node
// diag-weights.cjs — dump skin weights/joints for arm-region vertices
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
window.__w = async function (file) {
  const gltf = await loader.loadAsync('/models/' + file);
  const root = gltf.scene;
  let mesh = null;
  root.traverse(o => { if (o.isSkinnedMesh && !mesh) mesh = o; });
  const g = mesh.geometry;
  const pos = g.attributes.position, j = g.attributes.skinIndex, w = g.attributes.skinWeight;
  const sk = mesh.skeleton;
  const jname = i => sk.bones[i] ? sk.bones[i].name.replace(/^mixamorig:?/, '') : '?';
  // find vertices near the left forearm: x < -0.15 (left side), y in [0.9, 1.3], z any
  // (model faces +z after our centering? use bbox)
  root.updateMatrixWorld(true);
  const bbox = new THREE.Box3().setFromObject(root);
  console.log('DIAG ' + file + ' verts: ' + pos.count + ' bboxY: ' + bbox.min.y.toFixed(2) + '-' + bbox.max.y.toFixed(2));
  const v = new THREE.Vector3();
  let shown = 0, wsum_bad = 0, j_oor = 0;
  for (let i = 0; i < pos.count && shown < 8; i++) {
    v.fromBufferAttribute(pos, i);
    // left arm region: x negative-ish, mid height
    if (v.x < -0.18 && v.y > 0.8 && v.y < 1.35) {
      const js = [j.getX(i), j.getY(i), j.getZ(i), j.getW(i)];
      const ws = [w.getX(i), w.getY(i), w.getZ(i), w.getW(i)];
      const s = ws.reduce((a,b)=>a+b,0);
      if (Math.abs(s - 1) > 0.01) wsum_bad++;
      if (js.some(x => x < 0 || x >= sk.bones.length)) j_oor++;
      console.log('DIAG v' + i + ' pos(' + v.x.toFixed(2) + ',' + v.y.toFixed(2) + ',' + v.z.toFixed(2) + ') ' +
        js.map((jj,k) => jname(jj) + ':' + ws[k].toFixed(2)).join(' '));
      shown++;
    }
  }
  console.log('DIAG ' + file + ' wsum_bad=' + wsum_bad + ' joint_oor=' + j_oor);
  return true;
};
window.__ready = true;
</scr` + `ipt></body></html>`;

function serve() {
  return new Promise(resolve => {
    const server = http.createServer((req, res) => {
      const urlPath = decodeURIComponent(req.url.split('?')[0]);
      let filePath;
      if (urlPath === '/w.html') { res.writeHead(200, { 'Content-Type': 'text/html' }); res.end(PAGE); return; }
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
  await page.goto(`http://127.0.0.1:${port}/w.html`, { waitUntil: 'networkidle0', timeout: 120000 });
  await page.waitForFunction('window.__ready === true', { timeout: 120000 });
  for (const f of ['EL_TORO_DE_ORO.glb', 'ONYX_corset_skinned.glb']) {
    await page.evaluate(ff => window.__w(ff), f);
  }
  await browser.close(); server.close();
  process.exit(0);
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
