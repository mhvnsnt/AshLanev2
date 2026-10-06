#!/bin/bash
# build-video.sh — composite frames + music + title cards -> 50s 1080p MP4
# Usage: build-video.sh <frames_dir> <titles_dir> <theme.wav> <out.mp4>
set -e
FRAMES="$1"; TITLES="$2"; THEME="$3"; OUT="$4"
if [ -z "$OUT" ]; then echo "usage: build-video.sh <frames> <titles> <theme.wav> <out.mp4>"; exit 1; fi

ffmpeg -y \
  -framerate 24 -i "$FRAMES/f_%05d.png" \
  -i "$THEME" \
  -loop 1 -framerate 24 -i "$TITLES/name.png" \
  -loop 1 -framerate 24 -i "$TITLES/sub.png" \
  -loop 1 -framerate 24 -i "$TITLES/end.png" \
  -filter_complex "\
[0:v]fade=t=in:st=0:d=1.2,fade=t=out:st=48.4:d=1.6[v0]; \
[2:v]fade=t=in:st=38.4:d=0.6:alpha=1,fade=t=out:st=44.5:d=0.8:alpha=1,format=yuva420p[n]; \
[3:v]fade=t=in:st=39.4:d=0.6:alpha=1,fade=t=out:st=44.5:d=0.8:alpha=1,format=yuva420p[s]; \
[4:v]fade=t=in:st=46.5:d=0.8:alpha=1,format=yuva420p[e]; \
[v0][n]overlay=0:0:enable='between(t,38.4,45.5)'[v1]; \
[v1][s]overlay=0:0:enable='between(t,39.4,45.5)'[v2]; \
[v2][e]overlay=0:0:enable='gte(t,46.5)'[v3]; \
[v3]format=yuv420p[vout]; \
[1:a]afade=t=in:st=0:d=1,afade=t=out:st=48.4:d=1.6[aout]" \
  -map "[vout]" -map "[aout]" \
  -c:v libx264 -preset medium -crf 18 -pix_fmt yuv420p \
  -c:a aac -b:a 192k -ar 44100 \
  -movflags +faststart -shortest "$OUT"
echo "wrote $OUT"
