# 3D Generation Tools

Open-source AI 3D generation for AshLane. All MIT licensed (code + weights).

## Tools

| Tool | License | What | Speed (GPU) | Speed (CPU) | Best for |
|------|---------|------|-------------|-------------|----------|
| **TripoSR** | MIT | Image → 3D mesh | ~1s | 2-10 min | Fast iteration, props, quick characters |
| **TRELLIS** | MIT | Image → 3D mesh | ~30s | 30+ min | Hero characters, quality matters |
| **Shap-E** | MIT | Text → 3D mesh | ~10s | 30+ min | Props from text descriptions |

### License note
- **Stable Fast 3D** was evaluated but uses Stability AI Community License (NOT fully open for commercial use). We use TripoSR + TRELLIS instead (both MIT).
- **Hunyuan3D-2** was evaluated but uses Tencent license with territorial restrictions. Not used.

## Quick Start

```bash
cd tools/generative/3d/

# 1. Setup (one time per tool)
bash triposr_setup.sh    # Fast image-to-3D
bash trellis_setup.sh    # Quality image-to-3D
bash shap_e_setup.sh     # Text-to-3D

# 2. Generate
python3 triposr_generate.py --input photo.jpg --output raw.glb
python3 trellis_generate.py --input photo.jpg --output raw.glb
python3 shap_e_generate.py --prompt "a wooden crate" --output raw.obj

# 3. Post-process for game
python3 postprocess.py --input raw.glb --output game-ready.glb --character

# 4. Buffalo Bill (character-specific pipeline)
python3 buffalo_bill.py --method triposr
```

## Pipeline

```
Reference image / Text prompt
    ↓
TripoSR / TRELLIS / Shap-E  (AI generation)
    ↓
raw.glb (high poly, unoptimized)
    ↓
postprocess.py  (decimate, clean, normalize)
    ↓
game-ready.glb (10-20k faces, centered, Y-up)
    ↓
Copy to AshLanev2: public/models/generated/
    ↓
Rig to 52-bone Mixamo skeleton (docs/BONE_STANDARD.md)
    ↓
In game via roster.ts / char-gen.ts
```

## Output Locations

| Output | Goes to |
|--------|---------|
| Generated models | `public/models/generated/` |
| Character models | `public/models/generated/` → rig → `public/models/cast/` |
| Props | `public/models/generated/` → `public/models/props/` |

## Tips

- **Background removal**: TripoSR works best with clean subject on plain background. The script does this automatically with `rembg`.
- **Multiple angles**: For better results, generate from the clearest front-facing image.
- **Characters need rigging**: AI models are unrigged. Use the bone-standard pipeline to rig them to the 52-bone Mixamo skeleton.
- **Ram horn braids** (Buffalo Bill): After generation, rigid-bind braid geometry to the head bone. Don't try to simulate them as soft body on mobile.
- **Poly counts**: Characters 15-20k, props 2-10k, background 1-5k.

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Out of memory | Reduce `--mc-resolution` to 128 |
| Blurry textures | Run `../upscale/upscale.py` on the texture |
| Model facing wrong way | Rotate in postprocess or in Three.js loader |
| Too many faces | Lower `--target-faces` in postprocess.py |
| No GPU, too slow | Use TripoSR (fastest on CPU) or use a cloud GPU |
