#!/usr/bin/env node
// reskin.cjs — transfer skin weights from a working model to a broken one via nearest-vertex
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
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
const loader = new GLTFLoader(); loader.setMeshoptDecoder(MeshoptDecoder);

async function loadMesh(file) {
  const gltf = await loader.loadAsync('/models/' + file);
  let mesh = null;
  gltf.scene.traverse(o => { if (o.isSkinnedMesh && !mesh) mesh = o; });
  return { gltf, mesh };
}

window.__reskin = async function (srcFile, dstFile) {
  const src = await loadMesh(srcFile);
  const dst = await loadMesh(dstFile);
  const sg = src.mesh.geometry, dg = dst.mesh.geometry;
  const sp = sg.attributes.position, dp = dg.attributes.position;
  const sj = sg.attributes.skinIndex, sw = sg.attributes.skinWeight;
  console.log('DIAG src verts: ' + sp.count + ' dst verts: ' + dp.count);

  // Build a spatial hash of src vertices
  const CELL = 0.1;
  const grid = new Map();
  const sv = new THREE.Vector3();
  const key = (x, y, z) => Math.floor(x/CELL) + ',' + Math.floor(y/CELL) + ',' + Math.floor(z/CELL);
  for (let i = 0; i < sp.count; i++) {
    sv.fromBufferAttribute(sp, i);
    const k = key(sv.x, sv.y, sv.z);
    if (!grid.has(k)) grid.set(k, []);
    grid.get(k).push(i);
  }
  const dv = new THREE.Vector3();
  const nj = dg.attributes.skinIndex, nw = dg.attributes.skinWeight;
  let totalDist = 0;
  for (let i = 0; i < dp.count; i++) {
    dv.fromBufferAttribute(dp, i);
    let best = -1, bestD = 1e9;
    // search neighboring cells
    for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) for (let dz = -1; dz <= 1; dz++) {
      const k = Math.floor(dv.x/CELL)+dx + ',' + (Math.floor(dv.y/CELL)+dy) + ',' + (Math.floor(dv.z/CELL)+dz);
      const cell = grid.get(k);
      if (!cell) continue;
      for (const si of cell) {
        sv.fromBufferAttribute(sp, si);
        const d = (sv.x-dv.x)**2 + (sv.y-dv.y)**2 + (sv.z-dv.z)**2;
        if (d < bestD) { bestD = d; best = si; }
      }
    }
    if (best < 0) { // fallback: brute force (shouldn't happen)
      for (let si = 0; si < sp.count; si += 10) {
        sv.fromBufferAttribute(sp, si);
        const d = (sv.x-dv.x)**2 + (sv.y-dv.y)**2 + (sv.z-dv.z)**2;
        if (d < bestD) { bestD = d; best = si; }
      }
    }
    totalDist += Math.sqrt(bestD);
    nj.setXYZW(i, sj.getX(best), sj.getY(best), sj.getZ(best), sj.getW(best));
    nw.setXYZW(i, sw.getX(best), sw.getY(best), sw.getZ(best), sw.getW(best));
  }
  nj.needsUpdate = true; nw.needsUpdate = true;
  console.log('DIAG avg transfer dist: ' + (totalDist / dp.count).toFixed(4));
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
      if (urlPath === '/reskin.html') { res.writeHead(200, { 'Content-Type': 'text/html' }); res.end(PAGE); return; }
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
  const [src, dst] = [process.argv[2], process.argv[3]];
  if (!src || !dst) { console.log('usage: reskin.cjs <src_working.glb> <dst_broken.glb>'); process.exit(1); }
  const server = await serve();
  const port = server.address().port;
  const browser = await puppeteer.launch({ headless: 'shell',
    userDataDir: path.join(require('os').homedir(), 'workspace', 'promo-work', '.chrome-profile'),
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--disable-gpu-sandbox', '--force-device-scale-factor=1'] });
  const page = await browser.newPage();
  page.on('console', m => { const t = m.text(); if (t.startsWith('DIAG')) console.log('  ' + t); });
  page.on('pageerror', e => console.log('  PAGEERROR: ' + e.message.slice(0,300)));
  await page.goto(`http://127.0.0.1:${port}/reskin.html`, { waitUntil: 'networkidle0', timeout: 120000 });
  await page.waitForFunction('window.__ready === true', { timeout: 120000 });
  await page.evaluate((s, d) => window.__reskin(s, d), src, dst);
  await browser.close(); server.close();
  process.exit(0);
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
