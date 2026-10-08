#!/usr/bin/env node
// diag-ibm.cjs — check IBM * boneWorld at rest for each model
const puppeteer = require('puppeteer');
const http = require('http');
const fs = require('fs');
const path = require('path');

const HERE = __dirname;
const RNM = '/home/hatch/workspace/glb-renders/renderer/node_modules';
const MODELS_DIR = path.join(HERE, '..', '..', 'public', 'models', 'cast');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.glb': 'model/gltf-binary', '.json': 'application/json' };

const PAGE = `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body><script type="module">
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
const loader = new GLTFLoader(); loader.setMeshoptDecoder(MeshoptDecoder);
window.__check = async function (file) {
  const gltf = await loader.loadAsync('/models/' + file);
  const root = gltf.scene;
  let mesh = null;
  root.traverse(o => { if (o.isSkinnedMesh && !mesh) mesh = o; });
  root.updateMatrixWorld(true);
  const sk = mesh.skeleton;
  const out = [];
  const I = new THREE.Matrix4();
  const M = new THREE.Matrix4();
  for (let i = 0; i < Math.min(sk.bones.length, 12); i++) {
    const b = sk.bones[i];
    M.multiplyMatrices(sk.boneInverses[i], b.matrixWorld);
    // distance from identity
    let d = 0;
    for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) {
      const want = (r === c) ? 1 : 0;
      d = Math.max(d, Math.abs(M.elements[c * 4 + r] - want));
    }
    out.push(b.name.replace('mixamorig:', '') + ':' + d.toFixed(3));
  }
  // also check bindMatrix
  const bm = mesh.bindMatrix;
  let bmd = 0;
  for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) {
    const want = (r === c) ? 1 : 0;
    bmd = Math.max(bmd, Math.abs(bm.elements[c * 4 + r] - want));
  }
  console.log('DIAG ' + file + ' max|IBM*W-I|: ' + out.join(' '));
  console.log('DIAG ' + file + ' bindMatrix dev: ' + bmd.toFixed(4) + ' bones: ' + sk.bones.length);
  return true;
};
window.__ready = true;
</scr` + `ipt></body></html>`;

function serve() {
  return new Promise(resolve => {
    const server = http.createServer((req, res) => {
      const urlPath = decodeURIComponent(req.url.split('?')[0]);
      let filePath;
      if (urlPath === '/ibm.html') { res.writeHead(200, { 'Content-Type': 'text/html' }); res.end(PAGE); return; }
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
  await page.goto(`http://127.0.0.1:${port}/ibm.html`, { waitUntil: 'networkidle0', timeout: 120000 });
  await page.waitForFunction('window.__ready === true', { timeout: 120000 });
  for (const f of ['EL_TORO_DE_ORO.glb', 'STATIC.glb', 'ONYX_street.glb', 'HOLLOW.glb', 'ECHO.glb', 'CIPHER_rigged.glb', 'CAIN_ELIAS_gear.glb']) {
    await page.evaluate(ff => window.__check(ff), f);
  }
  await browser.close(); server.close();
  process.exit(0);
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
