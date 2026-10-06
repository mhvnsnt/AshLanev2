/**
 * reskin.js — runtime weight repair for broken faction models.
 * Onyx/Hollow/Echo have broken skin weights (ribbon geometry under animation).
 * This applies Laplacian smoothing to fix abrupt weight transitions.
 * Safe to run on working models too (smoothing is conservative).
 */
import * as THREE from 'three';
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

/**
 * cleanStrayWeights — remove anatomically-impossible bone influences.
 *
 * ROOT CAUSE (2026-10-06 audit): the BANNON_XFER_MESH weight transfer assigned
 * 30-50% of vertices to impossible bones (leg verts bound to Head/Neck/Arms,
 * etc.). Laplacian smoothing cannot fix wrong assignments — it only smooths
 * neighbors. This pass zeroes implausible influences per body region and
 * reassigns fully-stray verts to their nearest bones by distance.
 *
 * Regions are derived from the model's own bone positions (scale-invariant):
 *   legs   = below Hips        plausible: Hips, UpLeg, Leg, Foot, ToeBase
 *   pelvis = Hips..waist       plausible: Hips, Spine, UpLeg
 *   torso  = waist..Neck       plausible: Spine*, Shoulder, Arm, ForeArm
 *   head   = above Neck        plausible: Neck, Head
 * Arms are handled by lateral distance: verts far from the body centerline at
 * torso height are treated as arms (plausible: Shoulder, Arm, ForeArm, Hand).
 *
 * Returns { cleaned: <verts reassigned>, zeroed: <influences removed> }.
 */
export function cleanStrayWeights(skinnedMesh) {
  const g = skinnedMesh.geometry;
  const pos = g.attributes.position;
  const sj = g.attributes.skinIndex, sw = g.attributes.skinWeight;
  if (!sj || !sw) return { cleaned: 0, zeroed: 0 };
  const n = pos.count;
  const bones = skinnedMesh.skeleton.bones;
  const nb = bones.length;
  skinnedMesh.updateWorldMatrix(true, true);

  const canon = (nm) => nm.replace(/^mixamorig:?/, '');
  const bname = bones.map((b) => canon(b.name || ''));
  const bpos = bones.map((b) => { const v = new THREE.Vector3(); b.getWorldPosition(v); return v; });

  const find = (re) => bname.findIndex((x) => re.test(x));
  const iHips = find(/^Hips$/), iNeck = find(/^Neck$/), iHead = find(/^Head$/);
  const hipsY = iHips >= 0 ? bpos[iHips].y : 1.0;
  const neckY = iNeck >= 0 ? bpos[iNeck].y : 1.5;
  const waistY = hipsY + (neckY - hipsY) * 0.35;
  // body centerline X/Z at torso height (for arm detection)
  const spineX = iHips >= 0 ? bpos[iHips].x : 0;
  const spineZ = iHips >= 0 ? bpos[iHips].z : 0;

  const PLAUSIBLE = {
    legs: /^(Hips|LeftUpLeg|RightUpLeg|LeftLeg|RightLeg|LeftFoot|RightFoot|LeftToeBase|RightToeBase)$/,
    pelvis: /^(Hips|Spine|LeftUpLeg|RightUpLeg)$/,
    torso: /^(Hips|Spine|Spine1|Spine2|LeftShoulder|RightShoulder|LeftArm|RightArm|LeftForeArm|RightForeArm)$/,
    arms: /^(LeftShoulder|RightShoulder|LeftArm|RightArm|LeftForeArm|RightForeArm|LeftHand|RightHand)$/,
    head: /^(Neck|Head)$/,
  };
  const v = new THREE.Vector3();
  let cleaned = 0, zeroed = 0;
  const ji = [0, 0, 0, 0], ww = [0, 0, 0, 0];

  // nearest-bone fallback for fully-stray verts (squared distance to joints)
  function nearestBones(p, k, allowRe) {
    const ds = [];
    for (let b = 0; b < nb; b++) {
      if (!allowRe.test(bname[b])) continue;
      const dx = p.x - bpos[b].x, dy = p.y - bpos[b].y, dz = p.z - bpos[b].z;
      ds.push([dx * dx + dy * dy + dz * dz, b]);
    }
    ds.sort((a, b2) => a[0] - b2[0]);
    return ds.slice(0, k);
  }

  for (let i = 0; i < n; i++) {
    v.fromBufferAttribute(pos, i);
    // apply mesh world matrix so we compare in the same space as bpos
    skinnedMesh.localToWorld(v);
    let region;
    if (v.y < hipsY) region = 'legs';
    else if (v.y < waistY) region = 'pelvis';
    else if (v.y < neckY) {
      const lat = Math.hypot(v.x - spineX, v.z - spineZ);
      region = lat > 0.16 ? 'arms' : 'torso';
    } else region = 'head';
    const ok = PLAUSIBLE[region];

    // gather influences
    const inf = [
      [sw.getX(i), sj.getX(i)], [sw.getY(i), sj.getY(i)],
      [sw.getZ(i), sj.getZ(i)], [sw.getW(i), sj.getW(i)],
    ];
    let kept = 0, sum = 0;
    for (let k = 0; k < 4; k++) {
      const w = inf[k][0], b = inf[k][1];
      if (w > 0.001 && b < nb && ok.test(bname[b])) {
        ji[kept] = b; ww[kept] = w; sum += w; kept++;
      } else if (w > 0.001) {
        zeroed++;
      }
    }
    if (kept === 0 || sum < 1e-6) {
      // fully stray: reassign to nearest plausible bones by inverse-square distance
      const near = nearestBones(v, 4, ok);
      if (!near.length) continue;
      let wsum = 0;
      for (let k = 0; k < near.length; k++) wsum += 1 / Math.max(1e-8, near[k][0]);
      for (let k = 0; k < 4; k++) {
        if (k < near.length) { ji[k] = near[k][1]; ww[k] = (1 / Math.max(1e-8, near[k][0])) / wsum; }
        else { ji[k] = 0; ww[k] = 0; }
      }
      cleaned++;
    } else {
      for (let k = 0; k < 4; k++) {
        if (k < kept) { ww[k] /= sum; }
        else { ji[k] = 0; ww[k] = 0; }
      }
      // ji[] already holds kept bones in slots 0..kept-1 from the loop above;
      // rebuild explicitly to be safe:
      let w2 = 0;
      const kj = [], kw = [];
      for (let k = 0; k < 4; k++) {
        const w = inf[k][0], b = inf[k][1];
        if (w > 0.001 && b < nb && ok.test(bname[b])) { kj.push(b); kw.push(w); w2 += w; }
      }
      for (let k = 0; k < 4; k++) {
        if (k < kj.length) { ji[k] = kj[k]; ww[k] = kw[k] / w2; }
        else { ji[k] = 0; ww[k] = 0; }
      }
    }
    sj.setXYZW(i, ji[0], ji[1], ji[2], ji[3]);
    sw.setXYZW(i, ww[0], ww[1], ww[2], ww[3]);
  }
  sj.needsUpdate = true;
  sw.needsUpdate = true;
  return { cleaned, zeroed };
}

/**
 * autoSkinByDistance — replace broken transfer weights with distance-based skinning.
 *
 * Decisive fix for the BANNON_XFER_MESH transfer catastrophe (30-63% stray
 * weights roster-wide, 2026-10-06 audit). For each vertex, finds the 4 nearest
 * bones by joint distance and assigns inverse-square-distance weights.
 * This discards the broken transfer entirely — use when cleanStrayWeights
 * (which preserves plausible transfer weights) is insufficient.
 *
 * Returns { reskinned: <verts> }.
 */
export function autoSkinByDistance(skinnedMesh, maxInfluences = 4) {
  const g = skinnedMesh.geometry;
  const pos = g.attributes.position;
  const sj = g.attributes.skinIndex, sw = g.attributes.skinWeight;
  if (!sj || !sw) return { reskinned: 0 };
  const n = pos.count;
  const bones = skinnedMesh.skeleton.bones;
  const nb = bones.length;
  skinnedMesh.updateWorldMatrix(true, true);

  const bpos = bones.map((b) => { const v = new THREE.Vector3(); b.getWorldPosition(v); return v; });
  const v = new THREE.Vector3();
  const wm = skinnedMesh.matrixWorld;

  for (let i = 0; i < n; i++) {
    v.fromBufferAttribute(pos, i).applyMatrix4(wm);
    const ds = [];
    for (let b = 0; b < nb; b++) {
      const dx = v.x - bpos[b].x, dy = v.y - bpos[b].y, dz = v.z - bpos[b].z;
      ds.push([dx * dx + dy * dy + dz * dz, b]);
    }
    ds.sort((a, b2) => a[0] - b2[0]);
    const k = Math.min(maxInfluences, ds.length);
    let wsum = 0;
    for (let j = 0; j < k; j++) wsum += 1 / Math.max(1e-10, ds[j][0]);
    // set all 4 properly
    const ji = [0, 0, 0, 0], ww = [0, 0, 0, 0];
    for (let j = 0; j < k; j++) {
      ji[j] = ds[j][1];
      ww[j] = (1 / Math.max(1e-10, ds[j][0])) / wsum;
    }
    sj.setXYZW(i, ji[0], ji[1], ji[2], ji[3]);
    sw.setXYZW(i, ww[0], ww[1], ww[2], ww[3]);
  }
  sj.needsUpdate = true;
  sw.needsUpdate = true;
  return { reskinned: n };
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
