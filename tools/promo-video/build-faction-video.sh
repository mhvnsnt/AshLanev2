#!/bin/bash
# build-faction-video.sh — assemble faction promo video from frames + audio
# Usage: build-faction-video.sh <frames_dir> <audio_wav> <output_mp4> [title_png]
set -e
FRAMES="$1"
AUDIO="$2"
OUT="$3"
TITLE_PNG="$4"

if [ -z "$FRAMES" ] || [ -z "$AUDIO" ] || [ -z "$OUT" ]; then
  echo "Usage: $0 <frames_dir> <audio_wav> <output_mp4> [title_png]"
  exit 1
fi

# --- QA gate: automated video QA on frames before assembly ---
# A render that fails QA aborts the build. Set QA_SKIP=1 to bypass (emergencies only).
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
if [ "${QA_SKIP:-0}" != "1" ] && [ -x "$SCRIPT_DIR/qa/run-qa.sh" ]; then
  echo "Running video QA gate on $FRAMES ..."
  if ! "$SCRIPT_DIR/qa/run-qa.sh" --frames "$FRAMES" \
      --out "$FRAMES/qa-report" --allow-frozen "${QA_ALLOW_FROZEN:-0-5,46-50}"; then
    echo "ERROR: video QA FAILED for $FRAMES — refusing to assemble." >&2
    echo "See report: $FRAMES/qa-report/REPORT.md" >&2
    exit 1
  fi
  echo "QA passed."
elif [ "${QA_SKIP:-0}" = "1" ]; then
  echo "WARNING: QA_SKIP=1 — bypassing video QA gate." >&2
fi

# Count frames
N=$(ls "$FRAMES"/f_*.png 2>/dev/null | wc -l)
echo "Assembling $N frames + audio -> $OUT"

# Build video from frames (24fps) with audio
# If title card provided, overlay it during last 4 seconds (46-50s)
if [ -n "$TITLE_PNG" ] && [ -f "$TITLE_PNG" ]; then
  # Overlay title from 46s to 50s
  ffmpeg -y -framerate 24 -i "$FRAMES/f_%05d.png" \
    -i "$AUDIO" \
    -i "$TITLE_PNG" \
    -filter_complex "[0:v][2:v]overlay=(W-w)/2:(H-h)/2:enable='between(t,46,50)'[v]" \
    -map "[v]" -map 1:a \
    -c:v libx264 -preset medium -crf 18 -pix_fmt yuv420p \
    -c:a aac -b:a 192k -shortest \
    "$OUT"
else
  ffmpeg -y -framerate 24 -i "$FRAMES/f_%05d.png" \
    -i "$AUDIO" \
    -c:v libx264 -preset medium -crf 18 -pix_fmt yuv420p \
    -c:a aac -b:a 192k -shortest \
    "$OUT"
fi

echo "Done: $OUT"
ls -lh "$OUT"
