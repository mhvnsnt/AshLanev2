#!/bin/bash
# render-chunks.sh — crash-resistant chunked frame rendering.
# Renders in chunks with a fresh browser per chunk; resumes from first missing frame.
# Usage: render-chunks.sh <MODEL.glb> <frames_dir> [fps] [extra]
set -e
HERE="$(cd "$(dirname "$0")" && pwd)"
MODEL="$1"; FRAMES="$2"; FPS="${3:-24}"; EXTRA="$4"
DUR=50; CHUNK=200  # frames per chunk
export NODE_PATH="/home/hatch/workspace/glb-renders/renderer/node_modules"
mkdir -p "$FRAMES"

total=$((DUR * FPS))

# find first missing frame
first_missing=-1
for ((f=0; f<total; f++)); do
  fn=$(printf "$FRAMES/f_%05d.png" $f)
  if [ ! -f "$fn" ]; then first_missing=$f; break; fi
done
if [ $first_missing -eq -1 ]; then
  echo "ALL FRAMES COMPLETE ($total/$total)"
  exit 0
fi
echo "resuming from frame $first_missing/$total"

i=$first_missing
while [ $i -lt $total ]; do
  end_f=$((i + CHUNK)); [ $end_f -gt $total ] && end_f=$total
  start_t=$(python3 -c "print($i/$FPS)")
  end_t=$(python3 -c "print($end_f/$FPS)")
  echo "=== frames $i-$end_f (t=$start_t-$end_t) ==="
  for attempt in 1 2 3; do
    if [ -n "$EXTRA" ]; then
      node "$HERE/render-frames.cjs" --model "$MODEL" --out "$FRAMES" --start "$start_t" --end "$end_t" --fps "$FPS" --extra "$EXTRA" && break
    else
      node "$HERE/render-frames.cjs" --model "$MODEL" --out "$FRAMES" --start "$start_t" --end "$end_t" --fps "$FPS" && break
    fi
    echo "attempt $attempt failed, retrying in 5s..."
    sleep 5
  done
  # advance i to next missing (in case of partial chunk)
  for ((f=i; f<total; f++)); do
    fn=$(printf "$FRAMES/f_%05d.png" $f)
    if [ ! -f "$fn" ]; then i=$f; break; fi
    if [ $f -eq $((total-1)) ]; then i=$total; fi
  done
done

found=$(ls "$FRAMES"/f_*.png 2>/dev/null | wc -l)
echo "frames: $found/$total"
[ "$found" -eq "$total" ] && echo "ALL FRAMES COMPLETE" || { echo "MISSING FRAMES"; exit 1; }
