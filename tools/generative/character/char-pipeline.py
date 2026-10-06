#!/usr/bin/env python3
"""
char-pipeline.py — AshLane character generation pipeline (orchestrator).

End-to-end: input -> 3D -> postprocess -> rig -> validate -> game-ready GLB.

Stages:
  1. GENERATE   image/text -> raw 3D mesh
     - GPU: TripoSR / TRELLIS / Shap-E (tools/generative/3d/*.py)
     - CPU:  procedural assembly (char-procedural.py)  <-- runs anywhere
  2. POSTPROCESS decimate, clean, normalize, validate (postprocess.py)
  3. RIG         bind to 58-joint Mixamo skeleton (auto-rig.py)
  4. VALIDATE    load test: mesh, skin, joints, bounds sane
  5. DEPLOY      copy to public/models/generated/ + register

Usage:
    # Full CPU proof (no GPU needed):
    python3 char-pipeline.py --mode procedural --name brawler-01
    # With GPU + reference image:
    python3 char-pipeline.py --mode triposr --input ref.jpg --name mychar
    # Text prompt (GPU):
    python3 char-pipeline.py --mode shap-e --prompt "a wooden crate" --name crate

License: MIT (pipeline code). AI model weights: MIT (TripoSR, TRELLIS, Shap-E).
"""
import argparse, os, sys, shutil, subprocess, json

HERE = os.path.dirname(os.path.abspath(__file__))

def run(cmd, **kw):
    print(f'  $ {" ".join(cmd)}')
    r = subprocess.run(cmd, capture_output=True, text=True, **kw)
    if r.returncode != 0:
        print(r.stdout[-2000:]); print(r.stderr[-2000:], file=sys.stderr)
        raise SystemExit(f'stage failed: {cmd[0]}')
    tail = (r.stdout or '').strip().split('\n')[-3:]
    for line in tail:
        if line.strip(): print(f'    {line.strip()[:120]}')
    return r

def validate_glb(path):
    """Load GLB, check it has meshes; report skins/joints/bounds."""
    from pygltflib import GLTF2
    import struct
    g = GLTF2().load(path)
    with open(path, 'rb') as f: data = f.read()
    off = 12; bind = None
    while off < len(data):
        clen, ctype = struct.unpack('<II', data[off:off+8])
        if ctype == 0x004E4942: bind = data[off+8:off+8+clen]; break
        off += 8 + clen
    n_meshes = len(g.meshes or [])
    assert n_meshes > 0, 'no meshes'
    info = {'meshes': n_meshes, 'skins': len(g.skins or []),
            'joints': len((g.skins[0].joints if g.skins else []))}
    # bounds from POSITION accessors
    import numpy as np
    mins, maxs = [], []
    for mesh in g.meshes:
        for prim in mesh.primitives:
            a = g.accessors[prim.attributes.POSITION]
            mins.append(a.min); maxs.append(a.max)
    info['bounds'] = [min(m[1] for m in mins), max(m[1] for m in maxs)]
    h = info['bounds'][1] - info['bounds'][0]
    assert 0.3 < h < 3.5, f'height {h:.2f}m out of sane range'
    return info

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--mode', choices=['procedural', 'triposr', 'trellis', 'shap-e'],
                    default='procedural')
    ap.add_argument('--input', help='reference image (triposr/trellis)')
    ap.add_argument('--prompt', help='text prompt (shap-e)')
    ap.add_argument('--name', required=True, help='character name (output prefix)')
    ap.add_argument('--outdir', default='/tmp/charpipe')
    ap.add_argument('--skip-rig', action='store_true')
    args = ap.parse_args()
    os.makedirs(args.outdir, exist_ok=True)
    D = os.path.join(HERE, '3d')

    print(f'=== AshLane character pipeline: {args.name} (mode={args.mode}) ===')

    # 1. GENERATE
    raw = os.path.join(args.outdir, f'{args.name}-raw.glb')
    print('[1/5] GENERATE')
    if args.mode == 'procedural':
        run([sys.executable, os.path.join(HERE, 'char-procedural.py'), '--output', raw])
    elif args.mode == 'triposr':
        run([sys.executable, os.path.join(D, 'triposr_generate.py'),
             '--input', args.input, '--output', raw])
    elif args.mode == 'trellis':
        run([sys.executable, os.path.join(D, 'trellis_generate.py'),
             '--input', args.input, '--output', raw])
    elif args.mode == 'shap-e':
        run([sys.executable, os.path.join(D, 'shap_e_generate.py'),
             '--prompt', args.prompt, '--output', raw])

    # 2. POSTPROCESS
    game = os.path.join(args.outdir, f'{args.name}-game.glb')
    print('[2/5] POSTPROCESS')
    pp = os.path.join(HERE, 'postprocess.py')
    if not os.path.exists(pp):
        pp = os.path.join(D, 'postprocess.py')
    run([sys.executable, pp, '--input', raw, '--output', game, '--character'])

    # 3. RIG
    final = game
    if not args.skip_rig:
        rigged = os.path.join(args.outdir, f'{args.name}-rigged.glb')
        print('[3/5] RIG')
        run([sys.executable, os.path.join(HERE, 'auto-rig.py'),
             '--input', game, '--output', rigged])
        final = rigged
    else:
        print('[3/5] RIG (skipped)')

    # 4. VALIDATE
    print('[4/5] VALIDATE')
    info = validate_glb(final)
    print(f'    meshes={info["meshes"]} skins={info["skins"]} '
          f'joints={info["joints"]} height={info["bounds"][1]-info["bounds"][0]:.2f}m')

    # 5. DEPLOY (local staging; repo push is a separate step)
    print('[5/5] DEPLOY (staged)')
    print(f'    game-ready: {final}')

    manifest = {'name': args.name, 'mode': args.mode, 'file': final, **info}
    with open(os.path.join(args.outdir, f'{args.name}.json'), 'w') as f:
        json.dump(manifest, f, indent=1)
    print(f'\nPIPELINE COMPLETE: {final}')

if __name__ == '__main__':
    main()
