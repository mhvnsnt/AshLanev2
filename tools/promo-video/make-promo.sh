#!/bin/bash
# make-promo.sh -- full 50-second entrance-kit promo video pipeline.
# Usage: make-promo.sh <MODEL.glb> "CHARACTER NAME" [output.mp4] [ry]
# Example: ./make-promo.sh EL_TORO_DE_ORO.glb "EL TORO DE ORO" "" -1.57
set -e
HERE="$(cd "$(dirname "$0")" && pwd)"
MODEL="${1:?usage: make-promo.sh <MODEL.glb> \"CHARACTER NAME\" [out.mp4] [ry]}"
NAME="${2:?usage: make-promo.sh <MODEL.glb> \"CHARACTER NAME\" [out.mp4] [ry]}"
OUT="${3:-$HERE/output/${MODEL%.glb}.mp4}"
RY="${4:-}"
EXTRA=""
[ -n "$RY" ] && EXTRA="ry=$RY"
WORK="${PROMO_WORK:-$HOME/workspace/promo-work}/${MODEL%.glb}"
FRAMES="$WORK/frames"; TITLES="$WORK/titles"; THEME="$WORK/theme.wav"
mkdir -p "$FRAMES" "$TITLES" "$(dirname "$OUT")"
export NODE_PATH="/home/hatch/workspace/glb-renders/renderer/node_modules"

echo "=== [1/4] rendering 1200 frames (50s @ 24fps) ==="
if [ -n "$EXTRA" ]; then
  node "$HERE/render-frames.cjs" --model "$MODEL" --out "$FRAMES" --start 0 --end 50 --fps 24 --extra "$EXTRA"
else
  node "$HERE/render-frames.cjs" --model "$MODEL" --out "$FRAMES" --start 0 --end 50 --fps 24
fi

echo "=== [2/4] procedural entrance theme ==="
python3 "$HERE/make-music.py" --out "$THEME" --dur 50

echo "=== [3/4] title cards ==="
python3 "$HERE/make-titles.py" --name "$NAME" --sub "ASHLANE" --out "$TITLES"

echo "=== [4/4] compositing ==="
bash "$HERE/build-video.sh" "$FRAMES" "$TITLES" "$THEME" "$OUT"

echo "DONE: $OUT"
