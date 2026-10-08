#!/usr/bin/env node
// diag-mat4.cjs — dump IBM*world as full 4x4 for arm bones under walk pose
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
window.__mat = async function (file) {
  const gltf = await loader.loadAsync('/models/' + file);
  const root = gltf.scene;
  let mesh = null;
  root.traverse(o => { if (o.isSkinnedMesh && !mesh) mesh = o; });
  const sk = mesh.skeleton;
  const bones = {};
  root.traverse(o => { if (o.isBone) bones[o.name.replace(/^mixamorig:?/, '')] = o; });
  const rest = {}; for (const k in bones) rest[k] = bones[k].quaternion.clone();
  const baked = bakeClipRole(cmu.walk, 'atk', rest);
  const mid = Math.floor(baked.times.length / 2);
  for (const [bn, qs] of Object.entries(baked.bones)) {
    if (bones[bn]) bones[bn].quaternion.copy(qs[mid]);
  }
  root.updateMatrixWorld(true);
  const M = new THREE.Matrix4();
  for (const bn of ['Hips', 'LeftShoulder', 'LeftArm', 'LeftForeArm', 'LeftHand']) {
    const i = sk.bones.findIndex(b => b.name.replace(/^mixamorig:?/, '') === bn);
    M.multiplyMatrices(sk.boneInverses[i], sk.bones[i].matrixWorld);
    const e = M.elements;
    const isRigid = (() => {
      // check columns 0,1,2 are orthonormal
      const c0 = [e[0],e[1],e[2]], c1 = [e[4],e[5],e[6]], c2 = [e[8],e[9],e[10]];
      const dot = (a,b) => a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
      const len = a => Math.sqrt(dot(a,a));
      return Math.abs(len(c0)-1)<0.01 && Math.abs(len(c1)-1)<0.01 && Math.abs(len(c2)-1)<0.01 &&
             Math.abs(dot(c0,c1))<0.01 && Math.abs(dot(c0,c2))<0.01 && Math.abs(dot(c1,c2))<0.01 &&
             Math.abs(e[3])<0.001 && Math.abs(e[7])<0.001 && Math.abs(e[11])<0.001 && Math.abs(e[15]-1)<0.001;
    })();
    console.log('DIAG ' + bn + ' rigid=' + isRigid + ' trans=[' + e[12].toFixed(3) + ',' + e[13].toFixed(3) + ',' + e[14].toFixed(3) + '] col0len=' + Math.sqrt(e[0]**2+e[1]**2+e[2]**2).toFixed(3));
  }
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
      if (urlPath === '/m4.html') { res.writeHead(200, { 'Content-Type': 'text/html' }); res.end(PAGE); return; }
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
  await page.goto(`http://127.0.0.1:${port}/m4.html`, { waitUntil: 'networkidle0', timeout: 120000 });
  await page.waitForFunction('window.__ready === true', { timeout: 120000 });
  for (const f of ['EL_TORO_DE_ORO.glb', 'ONYX_corset_skinned.glb']) {
    console.log('  === ' + f + ' ===');
    await page.evaluate(ff => window.__mat(ff), f);
  }
  await browser.close(); server.close();
  process.exit(0);
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
