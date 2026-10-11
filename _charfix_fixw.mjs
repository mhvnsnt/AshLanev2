// fix_weights3.mjs — three.js based zero-weight repair. Handles Meshopt.
// Usage: node fix_weights3.mjs <in.glb> <out.glb>
// Node shims for GLTFLoader browser globals:
globalThis.self = globalThis;
if (!globalThis.FileReader) {
  globalThis.FileReader = class {
    readAsArrayBuffer(blob) {
      blob.arrayBuffer().then(buf => {
        this.result = buf;
        this.onload && this.onload();
      }).catch(e => { this.onerror && this.onerror(e); });
    }
    readAsDataURL(blob) {
      blob.arrayBuffer().then(buf => {
        this.result = 'data:application/octet-stream;base64,' + Buffer.from(buf).toString('base64');
        this.onload && this.onload();
      }).catch(e => { this.onerror && this.onerror(e); });
    }
  };
}
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import fs from 'fs';

const [src, dst] = process.argv.slice(2);
const buf = fs.readFileSync(src);

const loader = new GLTFLoader();
loader.setMeshoptDecoder(MeshoptDecoder);

const gltf = await loader.parseAsync(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
let totalFixed = 0;

gltf.scene.traverse((o) => {
  if (!o.isSkinnedMesh) return;
  const g = o.geometry;
  const pos = g.attributes.position;
  const sw = g.attributes.skinWeight;
  const si = g.attributes.skinIndex;
  if (!pos || !sw || !si) return;
  const n = pos.count;
  const zero = [], good = [];
  for (let i = 0; i < n; i++) {
    const s = sw.getX(i) + sw.getY(i) + sw.getZ(i) + sw.getW(i);
    (s < 1e-6 ? zero : good).push(i);
  }
  if (!zero.length || !good.length) return;
  // nearest good vert per zero vert (chunked)
  const gp = good.map(i => [pos.getX(i), pos.getY(i), pos.getZ(i)]);
  const CH = 256;
  for (let s = 0; s < zero.length; s += CH) {
    const e = Math.min(s + CH, zero.length);
    for (let k = s; k < e; k++) {
      const zi = zero[k];
      const zx = pos.getX(zi), zy = pos.getY(zi), zz = pos.getZ(zi);
      let best = 0, bd = Infinity;
      for (let j = 0; j < gp.length; j++) {
        const dx = zx - gp[j][0], dy = zy - gp[j][1], dz = zz - gp[j][2];
        const d = dx*dx + dy*dy + dz*dz;
        if (d < bd) { bd = d; best = j; }
      }
      const gi = good[best];
      let wsum = 0;
      for (let c = 0; c < 4; c++) {
        si.setComponent(zi, c, si.getComponent(gi, c));
        const w = sw.getComponent(gi, c);
        sw.setComponent(zi, c, w);
        wsum += w;
      }
      if (wsum > 1e-9) for (let c = 0; c < 4; c++) sw.setComponent(zi, c, sw.getComponent(zi, c) / wsum);
    }
  }
  sw.needsUpdate = true; si.needsUpdate = true;
  totalFixed += zero.length;
  console.log(`fixed ${zero.length} zero-weight verts on ${o.name || 'mesh'}`);
});

// Materials kept as-is (Node 24 has real URL.createObjectURL for texture blobs)
gltf.scene.traverse((o) => {
  if (o.isMesh) o.material = o.material; // no-op, keep originals
});

// normalize skeleton: ensure bones have no stale state
const exporter = new GLTFExporter();
const out = await exporter.parseAsync(gltf.scene, { binary: true });
fs.writeFileSync(dst, Buffer.from(out));
console.log(`TOTAL fixed: ${totalFixed} -> ${dst}`);
