#!/usr/bin/env bash
#
# AshLane GLB optimization pipeline — MIT-licensed tools only.
#
# Takes a raw/repaired character or prop GLB and produces:
#   <name>.game.glb      — full-quality, meshopt-compressed + WebP textures
#   <name>.lod1.glb      — ~50% triangle LOD (mid distance)
#   <name>.lod2.glb      — ~25% triangle LOD (far / mobile fallback)
#
# Verified 2026-10-06 on TARZANIAN_DEVIL_dec_repaired.glb (5.86 MB, 82k tris):
#   game.glb  = 1.26 MB  (78% smaller, skinning + morphs intact, gltf-transform validate clean)
#   lod2      = 63k tris at --ratio 0.25 (tune --ratio down to 0.1-0.15 for the 15-25k mobile target)
#
# Requires:  npm install -g @gltf-transform/cli
#            (glTF-Transform is MIT licensed: https://github.com/donmccurdy/glTF-Transform)
#
# Usage:  ./optimize-glb.sh input.glb [output-dir]
#
set -euo pipefail

if ! command -v gltf-transform >/dev/null 2>&1; then
  echo "ERROR: gltf-transform not found. Install it first:"
  echo "  npm install -g @gltf-transform/cli"
  exit 1
fi

INPUT="${1:?Usage: $0 input.glb [output-dir]}"
OUTDIR="${2:-./optimized}"
BASENAME="$(basename "$INPUT" .glb)"
NAME="$(echo "$BASENAME" | tr '[:upper:]' '[:lower:]' | tr ' ' '_' | tr -cd 'a-z0-9_-')"

mkdir -p "$OUTDIR"

echo "=== AshLane GLB pipeline: $INPUT -> $OUTDIR/$NAME.* ==="
echo ""
echo "--- [1/4] inspect input ---"
gltf-transform inspect "$INPUT" 2>/dev/null | head -25 || true
echo ""

echo "--- [2/4] game-ready (meshopt + webp) ---"
# optimize = dedup + prune + weld + simplify(light) + resample + sparse
#            + textureCompress(webp) + meshopt geometry compression
gltf-transform optimize "$INPUT" "$OUTDIR/$NAME.game.glb" --texture-compress webp
echo ""

echo "--- [3/4] LODs (meshoptimizer simplify, skinning-aware) ---"
# NOTE: simplify keeps JOINTS_/WEIGHTS_ attributes; verify visually after.
gltf-transform simplify "$INPUT" "$OUTDIR/$NAME.lod1.src.glb" --ratio 0.5 --error 0.02
gltf-transform optimize "$OUTDIR/$NAME.lod1.src.glb" "$OUTDIR/$NAME.lod1.glb" --texture-compress webp
rm "$OUTDIR/$NAME.lod1.src.glb"

gltf-transform simplify "$INPUT" "$OUTDIR/$NAME.lod2.src.glb" --ratio 0.15 --error 0.05
gltf-transform optimize "$OUTDIR/$NAME.lod2.src.glb" "$OUTDIR/$NAME.lod2.glb" --texture-compress webp
rm "$OUTDIR/$NAME.lod2.src.glb"
echo ""

echo "--- [4/4] validate outputs ---"
for f in "$OUTDIR/$NAME.game.glb" "$OUTDIR/$NAME.lod1.glb" "$OUTDIR/$NAME.lod2.glb"; do
  echo ">> $f"
  gltf-transform inspect "$f" 2>/dev/null | grep -E "TRIANGLES" | head -2 || true
  gltf-transform validate "$f" 2>&1 | tail -2 || true
done
echo ""
echo "=== sizes ==="
ls -la "$OUTDIR/$NAME".*.glb
echo ""
echo "DONE. Visually verify each LOD in the render rig before shipping"
echo "(simplify can pinch fingers/faces at aggressive ratios)."
