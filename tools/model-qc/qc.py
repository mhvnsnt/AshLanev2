#!/usr/bin/env python3
# qc.py <workdir> [--repair]
# Model-QC pipeline step 2: automated glitch detection + safe auto-repair.
# Input:  workdir/manifest.json, pos.bin, uv.bin, idx.bin, [joints.bin, weights.bin], tex/
# Output: workdir/findings.json, workdir/REPORT.md, workdir/fixed/img_*.png (if --repair)
#
# Detection covers: NaN positions, orphan verts, degenerate tris, unweighted
# skin verts, missing/Out-of-range UVs, texture issues, misclassified texels
# (3D-aware zone voting — the Bannon blotch method, generalized with k-means
# zones), UV seam color discontinuity.
import json, os, sys, time
import numpy as np
from PIL import Image
from scipy.spatial import cKDTree

REPAIR = '--repair' in sys.argv
TEX_MAX_REPAIR_FRAC = 0.15   # never auto-repaint more than 15% of a texture
VOTE_K = 12
VOTE_RADIUS_FRAC = 0.02      # of bbox diagonal

def load_workdir(wd):
    man = json.load(open(os.path.join(wd, 'manifest.json')))
    N, T = man['verts'], man['tris']
    pos = np.fromfile(os.path.join(wd, 'pos.bin'), dtype=np.float32).reshape(N, 3)
    uv = np.fromfile(os.path.join(wd, 'uv.bin'), dtype=np.float32).reshape(N, 2)
    idx = np.fromfile(os.path.join(wd, 'idx.bin'), dtype=np.uint32).reshape(T, 3)
    joints = weights = None
    if man.get('hasJoints'):
        joints = np.fromfile(os.path.join(wd, 'joints.bin'), dtype=np.uint16).reshape(N, 4)
        weights = np.fromfile(os.path.join(wd, 'weights.bin'), dtype=np.float32).reshape(N, 4)
    texmap = {}
    tdir = os.path.join(wd, 'tex')
    if os.path.isdir(tdir):
        for f in sorted(os.listdir(tdir)):
            # img_<index>.<ext>
            try:
                ii = int(f.split('_')[1].split('.')[0])
                texmap[ii] = Image.open(os.path.join(tdir, f)).convert('RGB')
            except Exception:
                pass
    return man, pos, uv, idx, joints, weights, texmap

def kmeans(X, K, iters=25, seed=0):
    rng = np.random.default_rng(seed)
    n = len(X)
    C = [X[rng.integers(n)]]
    for _ in range(1, K):
        Cc = np.stack(C)
        d2 = ((X[:, None, :] - Cc[None, :, :]) ** 2).sum(-1).min(1)
        s = d2.sum()
        C.append(X[rng.integers(n)] if s <= 0 else X[rng.choice(n, p=d2 / s)])
    C = np.stack(C).astype(np.float64)
    Xf = X.astype(np.float64)
    for _ in range(iters):
        d2 = ((Xf[:, None, :] - C[None, :, :]) ** 2).sum(-1)
        lab = d2.argmin(1)
        nC = C.copy()
        for k in range(K):
            m = lab == k
            if m.any():
                nC[k] = Xf[m].mean(0)
        if np.allclose(nC, C):
            break
        C = nC
    d2 = ((Xf[:, None, :] - C[None, :, :]) ** 2).sum(-1)
    return d2.argmin(1), C

def zone_label(rgb):
    r, g, b = rgb
    lum = (r + g + b) / 3
    if lum < 60: return 'dark'
    if lum > 200 and abs(r - g) < 30 and abs(g - b) < 30: return 'near-white'
    if r > g + 25 and r > b + 25: return 'warm/red'
    if b > r + 25 and b > g + 15: return 'cool/blue'
    if g > r + 15 and g > b + 15: return 'green'
    if abs(r - g) < 40 and r > b + 30: return 'skin/yellow-ish'
    return 'mid-gray'

def sample_tex(tex, u, v):
    W, H = tex.size
    ta = np.asarray(tex).astype(np.float32)
    px = np.clip((u * (W - 1)).astype(int), 0, W - 1)
    py = np.clip((v * (H - 1)).astype(int), 0, H - 1)
    return ta[py, px]

# ---------------- geometry + UV + texture checks ----------------
def geom_checks(pos, idx, joints, weights):
    f = []
    N = len(pos)
    bad = int((~np.isfinite(pos)).any(axis=1).sum())
    if bad:
        f.append(('error', 'nan_positions', bad, f'{bad} vertices with NaN/Inf positions'))
    used = np.zeros(N, dtype=bool)
    used[np.unique(idx)] = True
    orph = int((~used).sum())
    if orph:
        f.append(('warn', 'orphan_vertices', orph, f'{orph} vertices not referenced by any triangle'))
    p0, p1, p2 = pos[idx[:, 0]], pos[idx[:, 1]], pos[idx[:, 2]]
    area = np.linalg.norm(np.cross(p1 - p0, p2 - p0), axis=1) / 2
    diag = float(np.linalg.norm(pos.max(0) - pos.min(0)))
    degen = int((area < (1e-6 * diag) ** 2).sum())
    if degen:
        sev = 'error' if degen > 0.001 * len(idx) else 'warn'
        f.append((sev, 'degenerate_triangles', degen, f'{degen} zero-area triangles'))
    if joints is not None and weights is not None:
        wsum = weights.sum(axis=1)
        unw = int((wsum < 1e-6).sum())
        if unw:
            f.append(('error', 'unweighted_vertices', unw, f'{unw} skinned vertices with ~zero weight'))
    return f, diag

def uv_checks(uv, man):
    f = []
    no_uv_prims = [i for i, p in enumerate(man['prims']) if not p['hasUV'] and p['texImage'] >= 0]
    if no_uv_prims:
        f.append(('error', 'textured_prim_missing_uv', len(no_uv_prims),
                  f'{len(no_uv_prims)} textured primitives have no TEXCOORD_0'))
    ok = ~np.isnan(uv[:, 0])
    bad = int(((uv[ok] < -1e-3) | (uv[ok] > 1 + 1e-3)).any(axis=1).sum())
    if bad and ok.sum():
        frac = bad / ok.sum()
        if frac > 0.01:
            f.append(('warn', 'uv_out_of_range', bad, f'{bad} verts ({frac:.1%}) with UV outside [0,1]'))
    return f

def tex_checks(texmap):
    f = []
    for ii, tex in texmap.items():
        W, H = tex.size
        if min(W, H) < 256:
            f.append(('info', 'tiny_texture', ii, f'texture {ii}: {W}x{H} below 256px'))
        if (W & (W - 1)) or (H & (H - 1)):
            f.append(('info', 'non_pow2_texture', ii, f'texture {ii}: {W}x{H} not power-of-two'))
    return f

# ---------------- misclassified-texel (blotch) detection ----------------
def blotch_detect(pos, uv, idx, man, texmap, diag):
    """Per texture: cluster vertex colors into zones, vote 3D consensus,
    flag verts whose zone disagrees. Returns dict img -> result."""
    res = {}
    radius = VOTE_RADIUS_FRAC * diag
    for ii, tex in texmap.items():
        vids = []
        for p in man['prims']:
            if p['texImage'] == ii and p['hasUV']:
                vids.append(np.arange(p['vStart'], p['vStart'] + p['vCount']))
        if not vids:
            continue
        vids = np.concatenate(vids)
        u, v = uv[vids, 0], uv[vids, 1]
        valid = np.isfinite(u) & np.isfinite(v)
        vids = vids[valid]
        if len(vids) < 50:
            continue
        cols = sample_tex(tex, u[valid], v[valid])
        # k-means zones (fit on sample for speed)
        K = 6
        fit_n = min(len(cols), 30000)
        rng = np.random.default_rng(0)
        samp = cols[rng.choice(len(cols), fit_n, replace=False)]
        _, C = kmeans(samp, K)
        d2 = ((cols.astype(np.float64)[:, None, :] - C[None, :, :]) ** 2).sum(-1)
        zone = d2.argmin(1).astype(np.int8)
        # merge tiny zones into nearest centroid
        counts = np.bincount(zone, minlength=K)
        tiny = np.where(counts < 0.005 * len(zone))[0]
        for t in tiny:
            dd = np.linalg.norm(C - C[t], axis=1)
            dd[t] = np.inf
            zone[zone == t] = dd.argmin()
        K2 = int(zone.max()) + 1
        # 3D consensus vote (distance-weighted)
        P = pos[vids]
        tree = cKDTree(P)
        k = min(VOTE_K, len(P))
        dists, nb = tree.query(P, k=k)
        if nb.ndim == 1:
            nb = nb[:, None]; dists = dists[:, None]
        w = 1.0 / (dists[:, 1:] + 1e-3)
        w[dists[:, 1:] > radius] = 0
        wsum = w.sum(axis=1)
        cons = np.zeros(len(P), dtype=np.int8)
        conf = np.zeros(len(P))
        for c in range(K2):
            s = (w * (zone[nb[:, 1:]] == c)).sum(axis=1)
            frac = s / np.maximum(wsum, 1e-9)
            m = frac > conf
            cons[m] = c
            conf[m] = frac[m]
        own_w = np.array([(w[i] * (zone[nb[i, 1:]] == zone[i])).sum() / max(wsum[i], 1e-9)
                          for i in range(len(P))])
        flagged = (cons != zone) & (conf >= 0.7) & (own_w <= 0.35) & (wsum > 0)
        nflag = int(flagged.sum())
        res[ii] = {
            'tex_size': tex.size, 'verts': len(P), 'zones': K2,
            'zone_desc': [(int(c), [int(x) for x in C[c].astype(int)], zone_label(C[c]),
                           int((zone == c).sum())) for c in range(K2)],
            'flagged_verts': nflag,
            'flagged_frac': nflag / len(P),
            'flagged_vids': vids[flagged],
            'zone': zone, 'cons': cons, 'centroids': C, 'vids': vids,
        }
    return res

def rasterize_expected(px, py, tri_ids, tri_zone, W, H):
    """Vectorized per-triangle rasterization. Returns int8 (H,W) expected-zone
    map (-1 = unset)."""
    exp = np.full((H, W), -1, dtype=np.int8)
    for t, z in zip(tri_ids, tri_zone):
        x = px[t]; y = py[t]
        minx, maxx = int(max(0, x.min())), int(min(W - 1, x.max()))
        miny, maxy = int(max(0, y.min())), int(min(H - 1, y.max()))
        if maxx < minx or maxy < miny:
            continue
        yy, xx = np.mgrid[miny:maxy + 1, minx:maxx + 1]
        d = (y[1] - y[2]) * (x[0] - x[2]) + (x[2] - x[1]) * (y[0] - y[2])
        if abs(d) < 1e-9:
            continue
        w0 = ((y[1] - y[2]) * (xx - x[2]) + (x[2] - x[1]) * (yy - y[2])) / d
        w1 = ((y[2] - y[0]) * (xx - x[2]) + (x[0] - x[2]) * (yy - y[2])) / d
        inside = (w0 >= 0) & (w1 >= 0) & (w0 + w1 <= 1)
        sub = exp[miny:maxy + 1, minx:maxx + 1]
        sub[inside & (sub == -1)] = z
    return exp

def blotch_repair(wd, det, texmap, uv, idx, man):
    """Repaint misclassified texels. Returns {img: (fixed_texels, path)}."""
    out = {}
    fdir = os.path.join(wd, 'fixed')
    os.makedirs(fdir, exist_ok=True)
    for ii, r in det.items():
        if r['flagged_verts'] < 5:
            continue
        tex = texmap[ii]
        W, H = tex.size
        ta = np.asarray(tex).astype(np.float32)
        C = r['centroids'].astype(np.float64)
        # classify every texel to nearest centroid (chunked rows)
        actual = np.full((H, W), -1, dtype=np.int8)
        for y0 in range(0, H, 128):
            blk = ta[y0:y0 + 128].astype(np.float64)
            d2 = ((blk[:, :, None, :] - C[None, None, :, :]) ** 2).sum(-1)
            actual[y0:y0 + 128] = d2.argmin(-1).astype(np.int8)
        # triangles touching flagged verts; require zone unanimity
        fset = set(r['flagged_vids'].tolist())
        vids = r['vids']
        g2l = {int(g): l for l, g in enumerate(vids)}
        tri_ids, tri_zone = [], []
        for p in man['prims']:
            if p['texImage'] != ii or not p['hasUV']:
                continue
            tris = idx[p['iStart']:p['iStart'] + p['iCount']].reshape(-1, 3)
            for t in tris:
                if t[0] in fset or t[1] in fset or t[2] in fset:
                    z = r['cons'][[g2l[int(x)] for x in t]]
                    if z[0] == z[1] == z[2]:
                        tri_ids.append([g2l[int(x)] for x in t])
                        tri_zone.append(int(z[0]))
        if not tri_ids:
            continue
        u = uv[vids, 0]; v = uv[vids, 1]
        px = np.clip(u * (W - 1), 0, W - 1)
        py = np.clip(v * (H - 1), 0, H - 1)
        exp = rasterize_expected(px, py, np.array(tri_ids), np.array(tri_zone), W, H)
        clean_cols = {}
        for c in range(r['zones']):
            m = (exp == c) & (actual == c)
            if m.sum() >= 50:
                clean_cols[c] = np.median(ta[m], axis=0)
        fixed = ta.copy()
        fix_total = 0
        for c, cc in clean_cols.items():
            m = (exp == c) & (actual != c) & (actual != -1)
            fixed[m] = cc
            fix_total += int(m.sum())
        frac = fix_total / (W * H)
        r['repair_texels'] = fix_total
        r['repair_frac'] = frac
        if fix_total and frac <= TEX_MAX_REPAIR_FRAC:
            Image.fromarray(np.clip(fixed, 0, 255).astype(np.uint8)).save(
                os.path.join(fdir, f'img_{ii}.png'))
            out[ii] = (fix_total, os.path.join(fdir, f'img_{ii}.png'))
            r['repaired'] = True
        else:
            r['repaired'] = False
            r['repair_skip_reason'] = (f'{fix_total} texels ({frac:.1%}) exceeds auto-repair cap'
                                      if fix_total else 'no texels to repaint')
    return out

# ---------------- UV seam discontinuity check (bounded) ----------------
def seam_check(pos, uv, idx, man, texmap, diag):
    f = []
    T = len(idx)
    if T > 300000:
        return [('info', 'seam_check_skipped', T, 'seam check skipped: too many tris')], {}
    q = 1e-4 * max(diag, 1e-6)
    wmap, weld = {}, np.zeros(len(pos), dtype=np.int64)
    for i, p in enumerate(pos):
        key = (round(p[0] / q), round(p[1] / q), round(p[2] / q))
        if key not in wmap:
            wmap[key] = len(wmap)
        weld[i] = wmap[key]
    tri_tex = np.full(T, -1, dtype=np.int32)
    for p in man['prims']:
        s = p['iStart'] // 3
        e = s + p['iCount'] // 3
        if p['hasUV']:
            tri_tex[s:e] = p['texImage']
    edge = {}
    bad = 0
    worst = []
    ta_cache = {}
    for ti in range(T):
        t = idx[ti]
        tx = tri_tex[ti]
        if tx < 0 or tx not in texmap:
            continue
        for a, b in ((t[0], t[1]), (t[1], t[2]), (t[2], t[0])):
            wa, wb = weld[a], weld[b]
            if wa == wb:
                continue
            key = (wa, wb) if wa < wb else (wb, wa)
            e = edge.get(key)
            if e is None:
                edge[key] = (ti, uv[a].copy(), uv[b].copy())
            else:
                ti2, uva2, uvb2 = e
                del edge[key]
                if tri_tex[ti2] != tx:
                    continue
                if tx not in ta_cache:
                    ta_cache[tx] = np.asarray(texmap[tx]).astype(np.float32)
                ta = ta_cache[tx]
                W, H = texmap[tx].size
                mu1 = (uv[a] + uv[b]) / 2
                mu2 = (uva2 + uvb2) / 2
                if abs(mu1 - mu2).max() * max(W, H) < 2:
                    continue
                x1 = int(np.clip(mu1[0] * (W - 1), 0, W - 1)); y1 = int(np.clip(mu1[1] * (H - 1), 0, H - 1))
                x2 = int(np.clip(mu2[0] * (W - 1), 0, W - 1)); y2 = int(np.clip(mu2[1] * (H - 1), 0, H - 1))
                cd = float(np.linalg.norm(ta[y1, x1] - ta[y2, x2]))
                if cd > 60:
                    bad += 1
                    if len(worst) < 5:
                        worst.append((round(float(abs(mu1 - mu2).max() * max(W, H)), 1), round(cd, 1)))
    if bad:
        f.append(('warn', 'uv_seam_discontinuity', bad,
                  f'{bad} welded UV seams with visible color discontinuity'))
    return f, {'bad_seam_edges': bad, 'worst': worst}

# ---------------- report ----------------
def write_report(wd, man, findings, det, repaired):
    lines = [f"# Model QC report — {man.get('source', '?')}", '']
    errs = [x for x in findings if x[0] == 'error']
    warns = [x for x in findings if x[0] == 'warn']
    infos = [x for x in findings if x[0] == 'info']
    lines.append(f"**Verdict:** {'FAIL' if errs else 'WARN' if warns else 'PASS'}  "
                 f"({len(errs)} errors, {len(warns)} warnings, {len(infos)} info)")
    lines.append(f"Geometry: {man['verts']} verts / {man['tris']} tris / {len(man['prims'])} prims / "
                 f"{len(man['images'])} textures" + (' / skinned' if man.get('hasJoints') else ''))
    lines.append('')
    for sev, code, n, msg in findings:
        icon = {'error': 'ERR', 'warn': 'WARN', 'info': 'INFO'}[sev]
        lines.append(f"- [{icon}] **{code}**: {msg}")
    if not findings:
        lines.append('- no issues detected')
    lines.append('')
    for ii, r in det.items():
        lines.append(f"### Texture {ii} zone analysis ({r['tex_size'][0]}x{r['tex_size'][1]})")
        for c, rgb, lab, cnt in r['zone_desc']:
            lines.append(f"- zone {c}: rgb{tuple(rgb)} ~{lab} — {cnt} verts")
        lines.append(f"- flagged verts: **{r['flagged_verts']}** ({r['flagged_frac']:.2%})")
        if 'repair_texels' in r:
            if r.get('repaired'):
                lines.append(f"- REPAIRED **{r['repair_texels']}** texels -> `fixed/img_{ii}.png`")
            else:
                lines.append(f"- repair skipped: {r.get('repair_skip_reason', '?')}")
        lines.append('')
    if repaired:
        lines.append(f"**Rebuilt GLB:** `fixed.glb` ({len(repaired)} textures replaced)")
        lines.append('')
    lines.append('_Generated by tools/model-qc/qc.py. Every repair ships with before/after renders._')
    open(os.path.join(wd, 'REPORT.md'), 'w').write('\n'.join(lines))

def main():
    wd = sys.argv[1]
    t0 = time.time()
    man, pos, uv, idx, joints, weights, texmap = load_workdir(wd)
    findings = []
    f, diag = geom_checks(pos, idx, joints, weights)
    findings += f
    findings += uv_checks(uv, man)
    findings += tex_checks(texmap)
    if not man['images']:
        findings.append(('info', 'untextured', 0, 'model has no textures'))
    det = {}
    if texmap and len(pos) <= 800000:
        det = blotch_detect(pos, uv, idx, man, texmap, diag)
        for ii, r in det.items():
            if r['flagged_verts'] >= 5 and r['flagged_frac'] > 0.005:
                findings.append(('warn', 'misclassified_texels', r['flagged_verts'],
                    f"texture {ii}: {r['flagged_verts']} verts ({r['flagged_frac']:.2%}) disagree "
                    f"with 3D-neighborhood zone — likely blotch"))
    sf, _ = seam_check(pos, uv, idx, man, texmap, diag)
    findings += sf
    repaired = {}
    if REPAIR and det:
        repaired = blotch_repair(wd, det, texmap, uv, idx, man)
        for ii, r in det.items():
            if 'repair_texels' in r and not r.get('repaired'):
                findings.append(('warn', 'repair_skipped', ii,
                    f"texture {ii}: {r['repair_skip_reason']} — needs human review"))
    serial = {k: {kk: (vv.tolist() if isinstance(vv, np.ndarray) else vv)
                  for kk, vv in v.items() if kk not in ('zone', 'cons', 'centroids', 'vids', 'flagged_vids')}
              for k, v in det.items()}
    json.dump({'findings': findings, 'textures': serial,
               'elapsed_s': round(time.time() - t0, 1)},
              open(os.path.join(wd, 'findings.json'), 'w'), indent=1)
    write_report(wd, man, findings, det, repaired)
    n_err = sum(1 for x in findings if x[0] == 'error')
    n_warn = sum(1 for x in findings if x[0] == 'warn')
    print(json.dumps({'errors': n_err, 'warnings': n_warn, 'repaired_textures': len(repaired),
                      'elapsed_s': round(time.time() - t0, 1)}))

if __name__ == '__main__':
    main()
