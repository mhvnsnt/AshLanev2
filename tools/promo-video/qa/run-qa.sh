#!/bin/bash
# run-qa.sh — run automated video QA on a frames directory (or video file).
# Usage: run-qa.sh --frames <dir> [--out <report_dir>] [--sample 2]
#        run-qa.sh --video <file.mp4> [same]
# Exit 0 = PASS, 1 = FAIL, 2 = error. Set QA_SAMPLE to override sampling.
set -u
DIR="$(cd "$(dirname "$0")" && pwd)"
PY="$DIR/.venv/bin/python"
if [ ! -x "$PY" ]; then
  # fall back to system python (needs mediapipe + opencv installed)
  PY="python3"
fi
ARGS=()
OUT=""
while [ $# -gt 0 ]; do
  case "$1" in
    --out) OUT="$2"; ARGS+=("$1" "$2"); shift 2;;
    *) ARGS+=("$1"); shift;;
  esac
done
if [ -z "$OUT" ]; then
  # default: qa-report next to the frames dir
  for i in "${!ARGS[@]}"; do
    if [ "${ARGS[$i]}" = "--frames" ]; then
      FD="${ARGS[$((i+1))]}"
      ARGS+=(--out "$FD/qa-report")
      break
    fi
  done
fi
if [ -n "${QA_SAMPLE:-}" ]; then
  ARGS+=(--sample "$QA_SAMPLE")
fi
exec "$PY" "$DIR/video-qa.py" "${ARGS[@]}"
