/**
 * reskin.js — runtime weight repair for broken faction models.
 * Onyx/Hollow/Echo have broken skin weights (ribbon geometry under animation).
 * This applies Laplacian smoothing to fix abrupt weight transitions.
 * Safe to run on working models too (smoothing is conservative).
 */
export function repairSkinWeights(skinnedMesh, iterations = 10) {
  const g = skinnedMesh.geometry;
  const pos = g.attributes.position;
  const sj = g.attributes.skinIndex, sw = g.attributes.skinWeight;
  if (!sj || !sw) return false;
  const n = pos.count;
  const NB = skinnedMesh.skeleton.bones.length;

  // Build adjacency from index buffer
  const idx = g.index ? g.index.array : null;
  const adj = Array.from({ length: n }, () => new Set());
  if (idx) {
    for (let i = 0; i < idx.length; i += 3) {
      const a = idx[i], b = idx[i + 1], c = idx[i + 2];
      adj[a].add(b); adj[a].add(c);
      adj[b].add(a); adj[b].add(c);
      adj[c].add(a); adj[c].add(b);
    }
  } else {
    // non-indexed: use spatial proximity (fallback, slower)
    return false;
  }

  // Convert to dense per-vertex bone weights
  let W = new Float32Array(n * NB);
  for (let i = 0; i < n; i++) {
    W[i * NB + sj.getX(i)] += sw.getX(i);
    W[i * NB + sj.getY(i)] += sw.getY(i);
    W[i * NB + sj.getZ(i)] += sw.getZ(i);
    W[i * NB + sj.getW(i)] += sw.getW(i);
  }

  // Laplacian smooth
  for (let it = 0; it < iterations; it++) {
    const Wn = new Float32Array(n * NB);
    for (let i = 0; i < n; i++) {
      const nbrs = [...adj[i]];
      if (nbrs.length === 0) {
        for (let b = 0; b < NB; b++) Wn[i * NB + b] = W[i * NB + b];
        continue;
      }
      const selfW = 0.5, nbrW = 0.5 / nbrs.length;
      for (let b = 0; b < NB; b++) {
        let s = W[i * NB + b] * selfW;
        for (const j of nbrs) s += W[j * NB + b] * nbrW;
        Wn[i * NB + b] = s;
      }
    }
    W = Wn;
  }

  // Convert back to 4 influences
  for (let i = 0; i < n; i++) {
    const pairs = [];
    for (let b = 0; b < NB; b++) {
      const w = W[i * NB + b];
      if (w > 0.001) pairs.push([w, b]);
    }
    pairs.sort((a, b) => b[0] - a[0]);
    const ji = [0, 0, 0, 0], ww = [0, 0, 0, 0];
    let sum = 0;
    const k = Math.min(4, pairs.length);
    for (let j = 0; j < k; j++) { ji[j] = pairs[j][1]; ww[j] = pairs[j][0]; sum += pairs[j][0]; }
    if (sum > 0) {
      for (let j = 0; j < 4; j++) ww[j] /= sum;
    } else { ji[0] = 0; ww[0] = 1; }
    sj.setXYZW(i, ji[0], ji[1], ji[2], ji[3]);
    sw.setXYZW(i, ww[0], ww[1], ww[2], ww[3]);
  }
  sj.needsUpdate = true;
  sw.needsUpdate = true;
  return true;
}

// Models known to need repair (broken weight transfers)
export const NEEDS_RESKIN = new Set([
  'ONYX_street.glb',
  'ONYX_corset_skinned.glb',
  'ONYX_latex_skinned.glb',
  'ONYX_casual_skinned.glb',
  'HOLLOW.glb',
  'ECHO.glb',
]);
