# mesh/ — headless mesh toolkit

`mesh_ops.py` — the ops agents need most, no Blender required. Every op prints
a single JSON report to stdout (parse it, don't eyeball it).

## Install

```bash
# System pip is PEP-668 blocked on this box — use a venv (verified 2026-10-06):
python3 -m venv /tmp/meshenv
/tmp/meshenv/bin/pip install trimesh pygltflib fast-simplification networkx
/tmp/meshenv/bin/python mesh_ops.py info --in model.glb
```
`decimate` needs `fast-simplification`; `fill-holes` needs `networkx`.

## Ops

| Op | Command | Notes |
|---|---|---|
| info | `--in m.glb` | verts/faces/meshes/nodes/bounds/watertight as JSON |
| decimate | `--in m.glb --out s.glb --ratio 0.5` | quadric decimation to a face fraction (needs `fast-simplification`) |
| weld | `--in m.glb --out w.glb` | merge duplicate verts + faces |
| fill-holes | `--in m.glb --out f.glb` | close boundary loops (needs `networkx`) |
| transform | `--in m.glb --out t.glb --translate 1,0,0 --rotate 0,90,0 --scale 1.2` | XYZ euler degrees |
| bake | `--in m.glb --out b.glb` | apply scene-graph transforms, collapse to one mesh |
| merge | `--in a.glb --in b.glb --out m.glb` | bake + concatenate N inputs |
| rescale | `--in m.glb --out h.glb --height 1.8` | scale about the base so Y-height == N meters, feet stay grounded |
| convert | `--in m.glb --out m.obj` | glb/gltf/obj/stl/ply |

Example:
```bash
python3 mesh_ops.py info --in ../../assets/characters/quaternius/Superhero_Male_FullBody.glb
python3 mesh_ops.py decimate --in model.glb --out model_small.glb --ratio 0.5
```

## Blender backend (proven 2026-10-06)

`blender_ops.py` — headless Blender 5.1.2 ops, same JSON-report contract:
```bash
B=~/workspace/vendor/blender-5.1.2-linux-x64/blender
$B --background --python blender_ops.py -- info --in model.glb
$B --background --python blender_ops.py -- decimate --in model.glb --out small.glb --ratio 0.5
$B --background --python blender_ops.py -- weld --in model.glb --out welded.glb
$B --background --python blender_ops.py -- transform --in model.glb --out moved.glb --translate 1,0,0 --rotate 0,90,0 --scale 1.2
$B --background --python blender_ops.py -- merge --in a.glb --in b.glb --out both.glb
$B --background --python blender_ops.py -- rescale --in model.glb --out tall.glb --height 1.8
```
Proven on `Superhero_Male_FullBody.glb`: info ✓ (17 objects/3 meshes/8483v/14318f),
decimate ✓ (14318→7159 faces), weld ✓ (8483→7231 verts), rescale ✓ (scale 6.175).
Use Blender for armature/weight-transfer work (trimesh can't do armatures);
use `mesh_ops.py` for fast pure-mesh ops.

## Proven runs (2026-10-06)

On `assets/characters/quaternius/Superhero_Male_FullBody.glb` (8483 verts,
14318 faces, 3 meshes) — all 9 ops green:
- `info` → correct stats JSON
- `decimate --ratio 0.5` → 14318 → 7159 faces
- `weld` → 8483 → 8161 verts
- `fill-holes` → 14318 → 14326 faces (closed loops)
- `transform --translate 1,0,0 --rotate 0,90,0 --scale 1.2` → applied
- `bake` → 3 meshes → 1
- `merge` (+ Hair_Buzzed.glb) → 15148 faces, 8949 verts
- `rescale --height 1.8` → Y size 1.82 → 1.80
- `convert` → valid `.obj` (965KB)
