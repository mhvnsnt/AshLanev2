/**
 * reskin.js — runtime weight repair for broken faction models.
 * Onyx/Hollow/Echo have broken skin weights (ribbon geometry under animation).
 * This applies Laplacian smoothing to fix abrupt weight transitions.
 * Safe to run on working models too (smoothing is conservative).
 *
 * PORTABILITY (owner 2026-10-06): game-agnostic — fix once, apply everywhere
 * (AshLane, Bannon, Brutal Fist). cleanStrayWeights() and autoSkinByDistance()
 * derive anatomical regions from the model's OWN bone positions (scale-invariant,
 * no hardcoded measurements). The NEEDS_* / DO_NOT_TOUCH_* sets are per-game
 * roster lists — copy the module, replace the sets for the target roster.
 * Brutal Fist EXCEPTION: PS1 low-poly is intentional — do NOT run weight repair
 * there; the sets should be empty for that game.
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
 * repairArmpitWeights — targeted re-skin of the armpit transition zone.
 *
 * DEFECT (2026-10-06, owner-verified): "arm flaps/wings" — when the arm raises,
 * a giant sail/web of stretched mesh bridges the arm to the torso (bat wing).
 * cleanStrayWeights() does NOT fix this: the webbing verts have PLAUSIBLE but
 * CHAOTIC blends (e.g. Spine2 0.71 + Shoulder 0.29, or LeftArm 1.0 next to
 * Spine2 1.0 on adjacent verts). The XFER transfer's blend band across the
 * armpit is wide and noisy instead of a narrow smooth falloff, so rotating the
 * arm drags a huge region of torso skin with it.
 *
 * FIX: for verts within R of the shoulder joint (currently dominated by
 * shoulder/arm/spine bones), discard the transfer weights and reassign by
 * inverse-square distance to BONE SEGMENTS (not joint points — that's why
 * autoSkinByDistance collapsed torsos). Segments used: ipsilateral
 * Shoulder->Arm, Arm->ForeArm, plus Spine1->Spine2->Neck. The Shoulder bone is
 * never animated by our mocap retarget (no shoulder slot in SLOT_TO_BONE), so
 * verts bound to it stay glued to the torso — no sail.
 *
 * Laterality is enforced: left-zone verts only see left-side arm segments.
 * Verts dominated by Head/Neck/Hand are left untouched.
 *
 * Returns { reassigned: <verts> }.
 */
export function repairArmpitWeights(skinnedMesh, radius = 0.28) {
  const g = skinnedMesh.geometry;
  const pos = g.attributes.position;
  const sj = g.attributes.skinIndex, sw = g.attributes.skinWeight;
  if (!sj || !sw) return { reassigned: 0 };
  const bones = skinnedMesh.skeleton.bones;
  const nb = bones.length;
  skinnedMesh.updateWorldMatrix(true, true);
  const wm = skinnedMesh.matrixWorld;

  const canon = (nm) => (nm || '').replace(/^mixamorig:?/, '');
  const bname = bones.map((b) => canon(b.name));
  const bpos = bones.map((b) => { const v = new THREE.Vector3(); b.getWorldPosition(v); return v; });
  const find = (n) => bname.indexOf(n);
  // segments: [proximalBoneIdx, distalBoneIdx, assignedBoneIdx]
  function seg(a, b, assign) {
    const ia = find(a), ib = find(b), ic = find(assign || b);
    if (ia < 0 || ib < 0 || ic < 0) return null;
    return { a: bpos[ia], b: bpos[ib], bone: ic };
  }
  // point-to-segment squared distance + parametric t
  function segDist2(p, s) {
    const abx = s.b.x - s.a.x, aby = s.b.y - s.a.y, abz = s.b.z - s.a.z;
    const apx = p.x - s.a.x, apy = p.y - s.a.y, apz = p.z - s.a.z;
    const len2 = abx * abx + aby * aby + abz * abz;
    let t = len2 > 1e-12 ? (apx * abx + apy * aby + apz * abz) / len2 : 0;
    t = Math.max(0, Math.min(1, t));
    const cx = s.a.x + abx * t - p.x, cy = s.a.y + aby * t - p.y, cz = s.a.z + abz * t - p.z;
    return cx * cx + cy * cy + cz * cz;
  }

  const v = new THREE.Vector3();
  const DOMINANT_OK = /^(LeftShoulder|RightShoulder|LeftArm|RightArm|LeftForeArm|RightForeArm|Spine|Spine1|Spine2)$/;
  let reassigned = 0;

  for (const side of ['Left', 'Right']) {
    const iSh = find(side + 'Shoulder');
    if (iSh < 0) continue;
    // ipsilateral segments only (laterality enforced)
    const segs = [
      seg(side + 'Shoulder', side + 'Arm', side + 'Shoulder'),
      seg(side + 'Arm', side + 'ForeArm', side + 'Arm'),
      seg('Spine1', 'Spine2', 'Spine2'),
      seg('Spine2', 'Neck', 'Spine2'),
    ].filter(Boolean);
    if (!segs.length) continue;
    const shP = bpos[iSh];
    const r2 = radius * radius;

    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i).applyMatrix4(wm);
      const dx = v.x - shP.x, dy = v.y - shP.y, dz = v.z - shP.z;
      if (dx * dx + dy * dy + dz * dz > r2) continue;
      // only touch verts currently dominated by shoulder/arm/spine bones
      let dw = -1, db = -1;
      const ws = [sw.getX(i), sw.getY(i), sw.getZ(i), sw.getW(i)];
      const js = [sj.getX(i), sj.getY(i), sj.getZ(i), sj.getW(i)];
      for (let k = 0; k < 4; k++) if (ws[k] > dw) { dw = ws[k]; db = js[k]; }
      if (db < 0 || db >= nb || !DOMINANT_OK.test(bname[db])) continue;
      // reassign by inverse-square segment distance
      const ds = segs.map((s) => [segDist2(v, s), s.bone]);
      ds.sort((a, b2) => a[0] - b2[0]);
      const k = Math.min(3, ds.length);
      let wsum = 0;
      for (let j = 0; j < k; j++) wsum += 1 / Math.max(1e-10, ds[j][0]);
      const ji = [0, 0, 0, 0], ww = [0, 0, 0, 0];
      for (let j = 0; j < k; j++) { ji[j] = ds[j][1]; ww[j] = (1 / Math.max(1e-10, ds[j][0])) / wsum; }
      sj.setXYZW(i, ji[0], ji[1], ji[2], ji[3]);
      sw.setXYZW(i, ww[0], ww[1], ww[2], ww[3]);
      reassigned++;
    }
  }
  sj.needsUpdate = true;
  sw.needsUpdate = true;
  return { reassigned };
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

/**
 * NEEDS_WEIGHT_REPAIR — models with the "hip-pivot" defect (2026-10-06):
 * body parts pivoting from the hips instead of their own joints, arms/legs
 * swinging out like they're flying off. Root cause: stray skin weights —
 * verts bound to anatomically-impossible bones (waist verts on ForeArm,
 * hip verts on Arm, etc.). Fixed by cleanStrayWeights() at load time.
 *
 * Verified 2026-10-06: MAIME fan eliminated, BANNON spike eliminated,
 * rest pose intact for both. BANNON still twists at extreme (>60°) joint
 * angles due to 63% stray transfer — acceptable for walk/idle promo motions.
 */
export const NEEDS_WEIGHT_REPAIR = new Set([
  'BANNON_muscular_skinned.glb',
  'MAIME_skinned.glb',
  'MAIME_tattered_skinned.glb',
]);

/**
 * DO_NOT_TOUCH_WEIGHTS — owner directive 2026-10-06: WWE-related models are
 * already reskinned canon versions (Cena→John Ford, Goldberg→Bill Dozer,
 * Cole→Marks, Jericho→Judas, Priest→Sombra Negra). Never apply weight repair,
 * reskin, or QA-flag them. If a gate flags them, it's a false positive.
 */
export const DO_NOT_TOUCH_WEIGHTS = new Set([
  'BILL_DOZER.glb',
  'JUDAS.glb',
  'JUDAS_alt_source.glb',
  'JUDAS_classic.glb',
  'JUDAS_crow.glb',
  'JUDAS_lionheart.glb',
  'JUDAS_painmaker.glb',
  'JUDAS_y2j.glb',
  'MARKS.glb',
  'SOMBRA_NEGRA.glb',
]);

/**
 * repairArmSkinningV2 — full arm-chain re-skin.
 * Polyline: Shoulder -> Elbow -> Wrist -> HandTip.
 * - Verts inside tube: clean segment weights with joint blends.
 * - Verts outside tube but holding arm weight (the fold): move to Shoulder.
 * - Finger verts (Unused17/18/19 dominant): untouched.
 */
export function repairArmSkinningV2(skinnedMesh, side) {
  const g = skinnedMesh.geometry;
  const pos = g.attributes.position;
  const sj = g.attributes.skinIndex, sw = g.attributes.skinWeight;
  const bones = skinnedMesh.skeleton.bones;
  skinnedMesh.updateWorldMatrix(true, true);
  const wm = skinnedMesh.matrixWorld;
  const canon = (nm) => (nm || '').replace(/^mixamorig:?/, '');
  const bname = bones.map((b) => canon(b.name));
  const bpos = bones.map((b) => { const v = new THREE.Vector3(); b.getWorldPosition(v); return v; });
  const find = (n) => bname.indexOf(n);
  const iSh = find(side + 'Shoulder'), iArm = find(side + 'Arm'),
        iFo = find(side + 'ForeArm'), iHa = find(side + 'Hand');
  if (iSh < 0 || iArm < 0 || iFo < 0 || iHa < 0) return { fixed: 0 };
  // extend past hand for fingers: hand tip = hand pos + (hand - wrist) normalized * 0.15
  const handTip = bpos[iHa].clone().add(bpos[iHa].clone().sub(bpos[iFo]).normalize().multiplyScalar(0.15));
  const segs = [
    { a: bpos[iSh], b: bpos[iArm], r: 0.080, j0: iSh, j1: iArm },
    { a: bpos[iArm], b: bpos[iFo], r: 0.065, j0: iArm, j1: iFo },
    { a: bpos[iFo], b: bpos[iHa], r: 0.055, j0: iFo, j1: iHa },
    { a: bpos[iHa], b: handTip, r: 0.050, j0: iHa, j1: iHa },
  ];
  const v = new THREE.Vector3();
  let fixed = 0;
  const n = pos.count;
  const fingerRe = /Unused1[789]/;
  for (let i = 0; i < n; i++) {
    const js = [sj.getX(i), sj.getY(i), sj.getZ(i), sj.getW(i)];
    const ws = [sw.getX(i), sw.getY(i), sw.getZ(i), sw.getW(i)];
    // skip finger verts
    let domW = -1, domJ = -1;
    for (let k = 0; k < 4; k++) if (ws[k] > domW) { domW = ws[k]; domJ = js[k]; }
    if (fingerRe.test(bname[domJ] || '')) continue;
    // arm-chain weight?
    let armW = 0;
    for (let k = 0; k < 4; k++) {
      const nm = bname[js[k]];
      if (nm === side+'Shoulder' || nm === side+'Arm' || nm === side+'ForeArm' || nm === side+'Hand') armW += ws[k];
    }
    if (armW < 0.05) continue;
    v.fromBufferAttribute(pos, i).applyMatrix4(wm);
    // closest point on polyline
    let best = null;
    for (let si = 0; si < segs.length; si++) {
      const s = segs[si];
      const abx = s.b.x - s.a.x, aby = s.b.y - s.a.y, abz = s.b.z - s.a.z;
      const len2 = abx*abx + aby*aby + abz*abz;
      let t = len2 > 1e-12 ? ((v.x-s.a.x)*abx + (v.y-s.a.y)*aby + (v.z-s.a.z)*abz) / len2 : 0;
      const tc = Math.max(0, Math.min(1, t));
      const cx = s.a.x + abx*tc - v.x, cy = s.a.y + aby*tc - v.y, cz = s.a.z + abz*tc - v.z;
      const d2 = cx*cx + cy*cy + cz*cz;
      if (!best || d2 < best.d2) best = { s, si, d2, t: tc };
    }
    const dist = Math.sqrt(best.d2);
    if (dist < best.s.r) {
      // ON the arm: clean weights with joint blend
      const t = best.t, s = best.s;
      let w1 = 0;
      // blend across the joint at segment start (except first segment start)
      if (best.si > 0 && t < 0.3) w1 = 0; // handled by previous segment's end blend
      // blend toward next joint at segment end
      let bA = s.j0, bB = s.j1, wb = 1;
      if (t > 0.7 && best.si < segs.length - 1) {
        // blend to next segment's bone
        const nb = segs[best.si + 1].j1;
        const f = (t - 0.7) / 0.3;
        bA = s.j1; bB = nb; wb = 1 - f;
        sj.setXYZW(i, bA, bB, 0, 0);
        sw.setXYZW(i, wb, 1 - wb, 0, 0);
      } else if (t < 0.3 && best.si > 0) {
        const pb = segs[best.si - 1].j0;
        const f = t / 0.3;
        bA = pb; bB = s.j0; wb = 1 - f;
        sj.setXYZW(i, bA, bB, 0, 0);
        sw.setXYZW(i, wb, 1 - wb, 0, 0);
      } else {
        // mid-segment: single bone, except first segment blends shoulder->arm
        if (best.si === 0) {
          const f = Math.min(1, t / 0.35);
          sj.setXYZW(i, iSh, iArm, 0, 0);
          sw.setXYZW(i, 1 - f, f, 0, 0);
        } else {
          sj.setXYZW(i, s.j1, 0, 0, 0);
          sw.setXYZW(i, 1, 0, 0, 0);
        }
      }
      fixed++;
    } else if (dist < best.s.r + 0.12) {
      // FOLD: near arm but off it, holding arm weight -> to Shoulder
      let shW = 0, armW2 = 0;
      const oj = [], ow = [];
      for (let k = 0; k < 4; k++) {
        const nm = bname[js[k]];
        if (nm === side+'Shoulder' || nm === 'Spine2' || nm === 'Spine1') shW += ws[k];
        else if (nm === side+'Arm' || nm === side+'ForeArm' || nm === side+'Hand') armW2 += ws[k];
        else { oj.push(js[k]); ow.push(ws[k]); }
      }
      if (armW2 > 0.10) {
        const newSh = Math.min(1, shW + armW2);
        const ji = [iSh, 0, 0, 0], ww = [newSh, 0, 0, 0];
        for (let k = 0; k < oj.length && k+1 < 4; k++) { ji[k+1] = oj[k]; ww[k+1] = ow[k]; }
        let sum = ww[0]+ww[1]+ww[2]+ww[3] || 1;
        sj.setXYZW(i, ji[0], ji[1], ji[2], ji[3]);
        sw.setXYZW(i, ww[0]/sum, ww[1]/sum, ww[2]/sum, ww[3]/sum);
        fixed++;
      }
    }
  }
  // STRIP PASS: the Shoulder bone never rotates. Any Shoulder weight on an
  // arm-dominated vert tears on rotation. Strip Shoulder weight < 0.35 from
  // verts dominated by arm-chain bones (>0.6). Keeps blend only where the
  // shoulder genuinely dominates (trapezius).
  for (let i = 0; i < n; i++) {
    const js = [sj.getX(i), sj.getY(i), sj.getZ(i), sj.getW(i)];
    const ws = [sw.getX(i), sw.getY(i), sw.getZ(i), sw.getW(i)];
    let domW = -1, domN = '';
    let shW = 0, shK = -1;
    for (let k = 0; k < 4; k++) {
      const nm = bname[js[k]] || '';
      if (ws[k] > domW) { domW = ws[k]; domN = nm; }
      if (nm === side+'Shoulder') { shW += ws[k]; shK = k; }
    }
    const armDom = (domN === side+'Arm' || domN === side+'ForeArm' || domN === side+'Hand');
    if (armDom && domW > 0.6 && shW > 0.01 && shW < 0.35) {
      // move shoulder weight to dominant arm bone
      const ww = [ws[0], ws[1], ws[2], ws[3]];
      ww[shK] = 0;
      for (let k = 0; k < 4; k++) if ((bname[js[k]]||'') === domN) ww[k] += shW;
      let sum = ww[0]+ww[1]+ww[2]+ww[3] || 1;
      sw.setXYZW(i, ww[0]/sum, ww[1]/sum, ww[2]/sum, ww[3]/sum);
      fixed++;
    }
  }
  sj.needsUpdate = true; sw.needsUpdate = true;
  return { fixed };
}
