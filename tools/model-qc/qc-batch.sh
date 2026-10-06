#!/bin/bash
# qc-batch.sh <models_dir> [outdir] [jobs]
# Detection-only sweep over every GLB in a directory.
# Produces one line per model + a BATCH_REPORT.md summary.
# Usage: ./qc-batch.sh ../public/models/cast ./out/batch 4
set -u
QCDIR="$(cd "$(dirname "$0")" && pwd)"
MODELDIR="$1"
OUT="${2:-$QCDIR/out/batch}"
JOBS="${3:-4}"
mkdir -p "$OUT"

run_one() {
  local model="$1"
  local name
  name="$(basename "$model" .glb)"
  local w="$OUT/$name/work"
  mkdir -p "$w"
  if ! node "$QCDIR/extract.mjs" "$model" "$w" >/dev/null 2>&1; then
    echo "$name|EXTRACT_FAIL|0|0"
    return
  fi
  python3 "$QCDIR/extract_tex.py" "$model" "$w" >/dev/null 2>&1
  local res
  res=$(python3 "$QCDIR/qc.py" "$w" 2>/dev/null)
  local err warn
  err=$(echo "$res" | python3 -c "import json,sys; print(json.load(sys.stdin).get('errors',-1))")
  warn=$(echo "$res" | python3 -c "import json,sys; print(json.load(sys.stdin).get('warnings',-1))")
  echo "$name|$err|$warn"
}
export -f run_one
export QCDIR OUT

find "$MODELDIR" -maxdepth 1 -name '*.glb' | sort | \
  xargs -P "$JOBS" -I{} bash -c 'run_one "$@"' _ {} > "$OUT/results.tsv"

python3 - "$OUT" <<'EOF'
import sys, os
out = sys.argv[1]
rows = []
for line in open(os.path.join(out, 'results.tsv')):
    p = line.strip().split('|')
    if len(p) == 3:
        rows.append(p)
rows.sort(key=lambda r: (r[1] != 'EXTRACT_FAIL', -(int(r[2]) if r[2].lstrip('-').isdigit() else -1)))
total = len(rows)
fails = [r for r in rows if r[1] == 'EXTRACT_FAIL']
errs = [r for r in rows if r[1] not in ('0', 'EXTRACT_FAIL')]
warns = [r for r in rows if r[1] == '0' and r[2] != '0']
clean = [r for r in rows if r[1] == '0' and r[2] == '0']
L = [f"# Model QC batch report", '',
     f"Models scanned: **{total}** — clean: {len(clean)}, warnings: {len(warns)}, "
     f"errors: {len(errs)}, extract failures: {len(fails)}", '']
if errs:
    L += ['## Errors', ''] + [f'- ❌ {n}: {e} errors, {w} warnings' for n, e, w in errs] + ['']
if warns:
    L += ['## Warnings', ''] + [f'- ⚠️ {n}: {w} warnings' for n, e, w in warns] + ['']
if fails:
    L += ['## Extract failures', ''] + [f'- ⛔ {n}' for n, e, w in fails] + ['']
L += ['## Clean', ''] + [f'- ✅ {n}' for n, e, w in clean]
open(os.path.join(out, 'BATCH_REPORT.md'), 'w').write('\n'.join(L))
print(f'{total} models: {len(clean)} clean, {len(warns)} warn, {len(errs)} error, {len(fails)} extract-fail')
EOF
echo "report: $OUT/BATCH_REPORT.md"
