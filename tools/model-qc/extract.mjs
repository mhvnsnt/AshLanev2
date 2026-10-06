#!/usr/bin/env node
// extract.mjs <in.glb> <outdir>
// Model-QC pipeline step 1: decode GLB geometry (incl. EXT_meshopt_compression)
// into flat binaries + manifest.json. No DOM needed — uses three's
// MeshoptDecoder directly on bufferViews.
//
// Outputs in <outdir>:
//   manifest.json  { verts, tris, prims[], images[], hasJoints }
//   pos.bin        float32 [verts*3]
//   uv.bin         float32 [verts*2]  (NaN where primitive has no TEXCOORD_0)
//   idx.bin        uint32  [tris*3]
//   joints.bin     uint16  [verts*4]  (only if any primitive has JOINTS_0)
//   weights.bin    float32 [verts*4]  (only if any primitive has WEIGHTS_0)
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '..', '..');
const THREE_LIBS = path.join(REPO, 'node_modules', 'three', 'examples', 'jsm', 'libs');
const { MeshoptDecoder } = await import(THREE_LIBS + '/meshopt_decoder.module.js');
await MeshoptDecoder.ready;

const [inGlb, outDir] = process.argv.slice(2);
if (!inGlb || !outDir) { console.error('usage: node extract.mjs <in.glb> <outdir>'); process.exit(2); }
fs.mkdirSync(outDir, { recursive: true });

const data = fs.readFileSync(inGlb);
const dv = new DataView(data.buffer, data.byteOffset, data.byteLength);
const magic = dv.getUint32(0, true);
if (magic !== 0x46546C67) { console.error('not a GLB'); process.exit(1); }
let off = 12, json = null, binChunk = null;
while (off + 8 <= data.length) {
  const clen = dv.getUint32(off, true), ctype = dv.getUint32(off + 4, true);
  if (ctype === 0x4E4F534A) json = JSON.parse(data.subarray(off + 8, off + 8 + clen).toString('utf8'));
  else if (ctype === 0x004E4942) binChunk = data.subarray(off + 8, off + 8 + clen);
  off += 8 + ((clen + 3) & ~3);
}
if (!json || !binChunk) { console.error('GLB missing JSON or BIN chunk'); process.exit(1); }

const COMP = { 5120: Int8Array, 5121: Uint8Array, 5122: Int16Array, 5123: Uint16Array, 5125: Uint32Array, 5126: Float32Array };
const COMPMAX = { 5120: 127, 5121: 255, 5122: 32767, 5123: 65535 };
const TYPELEN = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4 };
const COMPSIZE = { 5120: 1, 5121: 1, 5122: 2, 5123: 2, 5125: 4, 5126: 4 };

function readAccessor(ai) {
  const acc = json.accessors[ai];
  const n = TYPELEN[acc.type], count = acc.count;
  const bv = json.bufferViews[acc.bufferView];
  const byteOff = (bv.byteOffset || 0) + (acc.byteOffset || 0);
  const mExt = bv.extensions && bv.extensions.EXT_meshopt_compression;
  let raw, stride, decodedCount;
  if (mExt) {
    const src = binChunk.subarray(mExt.byteOffset || 0, (mExt.byteOffset || 0) + mExt.byteLength);
    stride = mExt.byteStride;
    const target = new Uint8Array(mExt.count * stride);
    MeshoptDecoder.decodeVertexBuffer(target, mExt.count, stride, src, mExt.filter || 'NONE');
    raw = target; decodedCount = mExt.count;
  } else {
    stride = bv.byteStride || COMPSIZE[acc.componentType] * n;
    raw = binChunk.subarray(byteOff, byteOff + stride * (count - 1) + COMPSIZE[acc.componentType] * n);
    decodedCount = count;
  }
  const Arr = COMP[acc.componentType];
  const out = new Float32Array(decodedCount * n);
  const norm = !!acc.normalized;
  const cmax = COMPMAX[acc.componentType];
  for (let i = 0; i < decodedCount; i++) {
    const view = new Arr(raw.buffer, raw.byteOffset + i * stride, n);
    for (let k = 0; k < n; k++) {
      let v = view[k];
      if (norm && cmax) v = Math.max(v / cmax, -1);
      out[i * n + k] = v;
    }
  }
  return { arr: out, count: decodedCount, n };
}

function readIndices(ai, vertCount) {
  const acc = json.accessors[ai];
  const bv = json.bufferViews[acc.bufferView];
  const mExt = bv.extensions && bv.extensions.EXT_meshopt_compression;
  const count = acc.count;
  const out = new Uint32Array(count);
  if (mExt) {
    const src = binChunk.subarray(mExt.byteOffset || 0, (mExt.byteOffset || 0) + mExt.byteLength);
    const size = vertCount > 65535 ? 4 : 2;
    const target = new Uint8Array(count * size);
    MeshoptDecoder.decodeIndexBuffer(target, count, size, src);
    out.set(new (size === 4 ? Uint32Array : Uint16Array)(target.buffer, target.byteOffset, count));
  } else {
    const byteOff = (bv.byteOffset || 0) + (acc.byteOffset || 0);
    const Arr = COMP[acc.componentType];
    const v = new Arr(binChunk.buffer, binChunk.byteOffset + byteOff, count);
    for (let i = 0; i < count; i++) out[i] = v[i];
  }
  return out;
}

const posAll = [], uvAll = [], idxAll = [], jointsAll = [], weightsAll = [];
const prims = [];
let vBase = 0, iBase = 0, hasJoints = false;
const images = (json.images || []).map((im, i) => ({ index: i, mimeType: im.mimeType || 'application/octet-stream', name: im.name || `img${i}` }));
// material -> baseColor image index (handles EXT_texture_webp source relocation)
const matTex = (json.materials || []).map(m => {
  const t = m.pbrMetallicRoughness && m.pbrMetallicRoughness.baseColorTexture;
  if (!t || t.index == null) return -1;
  const tx = json.textures[t.index] || {};
  let src = tx.source;
  if (src == null && tx.extensions && tx.extensions.EXT_texture_webp)
    src = tx.extensions.EXT_texture_webp.source;
  return src == null ? -1 : src;
});

for (const mesh of json.meshes || []) {
  for (const prim of mesh.primitives) {
    if (prim.attributes.POSITION == null) continue;
    if (prim.mode != null && prim.mode !== 4) continue; // triangles only
    const pos = readAccessor(prim.attributes.POSITION);
    const vc = pos.count;
    let uv = null;
    if (prim.attributes.TEXCOORD_0 != null) uv = readAccessor(prim.attributes.TEXCOORD_0);
    let idx;
    if (prim.indices != null) idx = readIndices(prim.indices, vc);
    else { idx = new Uint32Array(vc); for (let i = 0; i < vc; i++) idx[i] = i; }
    let jn = null, wt = null;
    if (prim.attributes.JOINTS_0 != null && prim.attributes.WEIGHTS_0 != null) {
      jn = readAccessor(prim.attributes.JOINTS_0);
      wt = readAccessor(prim.attributes.WEIGHTS_0);
      hasJoints = true;
    }
    posAll.push(pos.arr);
    const uvArr = new Float32Array(vc * 2).fill(NaN);
    if (uv) uvArr.set(uv.arr.subarray(0, vc * 2));
    uvAll.push(uvArr);
    const idxOff = new Uint32Array(idx.length);
    for (let i = 0; i < idx.length; i++) idxOff[i] = idx[i] + vBase;
    idxAll.push(idxOff);
    if (hasJoints) {
      const jArr = new Uint16Array(vc * 4);
      const wArr = new Float32Array(vc * 4);
      if (jn) for (let i = 0; i < vc * 4; i++) jArr[i] = jn.arr[i] | 0;
      if (wt) wArr.set(wt.arr.subarray(0, vc * 4));
      jointsAll.push(jArr); weightsAll.push(wArr);
    }
    prims.push({
      vStart: vBase, vCount: vc,
      iStart: iBase, iCount: idx.length,
      material: prim.material == null ? -1 : prim.material,
      texImage: prim.material != null ? matTex[prim.material] : -1,
      hasUV: !!uv, mode: 4,
    });
    vBase += vc; iBase += idx.length;
  }
}

function cat(arrays, Ctor) {
  const out = new Ctor(arrays.reduce((s, a) => s + a.length, 0));
  let o = 0;
  for (const a of arrays) { out.set(a, o); o += a.length; }
  return out;
}
const V = vBase, T = iBase / 3;
fs.writeFileSync(path.join(outDir, 'pos.bin'), Buffer.from(cat(posAll, Float32Array).buffer));
fs.writeFileSync(path.join(outDir, 'uv.bin'), Buffer.from(cat(uvAll, Float32Array).buffer));
fs.writeFileSync(path.join(outDir, 'idx.bin'), Buffer.from(cat(idxAll, Uint32Array).buffer));
if (hasJoints) {
  fs.writeFileSync(path.join(outDir, 'joints.bin'), Buffer.from(cat(jointsAll, Uint16Array).buffer));
  fs.writeFileSync(path.join(outDir, 'weights.bin'), Buffer.from(cat(weightsAll, Float32Array).buffer));
}
fs.writeFileSync(path.join(outDir, 'manifest.json'), JSON.stringify({
  verts: V, tris: T, prims, images, hasJoints,
  source: path.basename(inGlb),
}, null, 1));
console.log(JSON.stringify({ verts: V, tris: T, prims: prims.length, images: images.length, hasJoints }));
