# Rig Tools — Open-Source Rigging Pipeline

Tools for auto-rigging unrigged character models and repairing skin weights.
All tools use free/open-source software. See `~/workspace/agent-ops/checkpoints/rig-tools.json` for the full tool catalog.

## blender_autorig.py

Auto-rigs an unrigged GLB with a Mixamo-compatible skeleton.

**How it works:**
1. Imports the GLB, bakes parent transforms (handles scaled empty hierarchies)
2. Creates a 52-joint Mixamo-standard armature positioned by anatomical proportions
3. Parents all meshes with Blender's automatic weights
4. Exports rigged GLB

**Usage:**
```bash
blender -b --python blender_autorig.py -- <input.glb> <output.glb> mixamo_standard.json
```

**Requirements:** Blender 4.0+ (`/usr/bin/blender`)

**Bone naming:** Plain Mixamo names (Hips, Spine, etc.) — the retargeter in `tools/anim-retarget/` handles both plain and `mixamorig:` prefixed names.

## blender_render_check.py

Renders a rigged GLB for visual QA (front view, transparent background).

**Usage:**
```bash
blender -b --python blender_render_check.py -- <input.glb> <output.png>
```

## mixamo_standard.json

52-joint standard Mixamo hierarchy (no character-specific extras like hair bones).
Extracted from a verified rigged model, cleaned.

## mixamo_hierarchy.json

Full 85-joint hierarchy including extras (for reference).

## License Notes

- These scripts: MIT
- Blender: GPL (tool use is fine; outputs are ours)
- Do NOT use Rigify (GPL) in the game pipeline — quarantine only
