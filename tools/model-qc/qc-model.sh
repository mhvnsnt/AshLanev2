#!/bin/bash
# qc-model.sh <model.glb> [outdir] [--repair] [--proof]
# Full QC gate for a single model:
#   extract -> detect -> (repair -> rebuild -> before/after proof renders)
set -e
QCDIR="$(cd "$(dirname "$0")" && pwd)"
MODEL="$1"; shift || true
OUT="${1:-}"; shift || true
REPAIR=""; PROOF=""
for a in "$@"; do
  [ "$a" = "--repair" ] && REPAIR="--repair"
  [ "$a" = "--proof" ] && PROOF="--proof"
done
if [ -z "$MODEL" ]; then echo "usage: qc-model.sh <model.glb> [outdir] [--repair] [--proof]"; exit 2; fi
NAME="$(basename "$MODEL" .glb)"
OUT="${OUT:-$QCDIR/out/$NAME}"
WORK="$OUT/work"
mkdir -p "$WORK"

echo "=== [1/5] extract geometry ==="
node "$QCDIR/extract.mjs" "$MODEL" "$WORK"
echo "=== [2/5] extract textures ==="
python3 "$QCDIR/extract_tex.py" "$MODEL" "$WORK"
echo "=== [3/5] detect ==="
python3 "$QCDIR/qc.py" "$WORK" $REPAIR
if [ -n "$REPAIR" ] && [ -n "$(ls "$WORK"/fixed/*.png 2>/dev/null)" ]; then
  echo "=== [4/5] rebuild GLB ==="
  python3 "$QCDIR/rebuild.py" "$MODEL" "$WORK" "$OUT/fixed.glb"
fi
if [ -n "$PROOF" ]; then
  echo "=== [5/5] proof renders ==="
  export NODE_PATH="/home/hatch/workspace/glb-renders/renderer/node_modules"
  mkdir -p "$OUT/proof/models"
  cp "$MODEL" "$OUT/proof/models/orig.glb"
  node "$QCDIR/proof-render.mjs" "$OUT/proof/models" "orig.glb" "$OUT/proof" "before"
  if [ -f "$OUT/fixed.glb" ]; then
    cp "$OUT/fixed.glb" "$OUT/proof/models/fixed.glb"
    node "$QCDIR/proof-render.mjs" "$OUT/proof/models" "fixed.glb" "$OUT/proof" "after"
    python3 - "$OUT" <<'EOF'
import sys, os
from PIL import Image
out = sys.argv[1]
for ang in ('front','back','left','right'):
    b = os.path.join(out, 'proof', f'before-{ang}.png')
    a = os.path.join(out, 'proof', f'after-{ang}.png')
    if os.path.exists(b) and os.path.exists(a):
        bi, ai = Image.open(b), Image.open(a)
        combo = Image.new('RGB', (bi.width*2, bi.height), 'white')
        combo.paste(bi, (0,0)); combo.paste(ai, (bi.width,0))
        combo.save(os.path.join(out, 'proof', f'compare-{ang}.png'))
print('comparisons done')
EOF
  fi
fi
echo "=== done: $OUT ==="
echo "--- REPORT ---"
cat "$WORK/REPORT.md"
