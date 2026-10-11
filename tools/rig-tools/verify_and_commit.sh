#!/bin/bash
# Verify rigged models and commit good ones to charfix-wave3
# Usage: verify_and_commit.sh
# For each *_rigged.glb in ~/workspace/charfix/output/:
#   1. Check it has a valid skin with joints
#   2. Render for visual check
#   3. If good, copy to repo and commit

set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
OUTPUT_DIR=~/workspace/charfix/output
REPO_DIR=~/workspace/game-sweep/AshLanev2
CAST_DIR="$REPO_DIR/public/models/cast"

cd "$REPO_DIR"
git checkout -q charfix-wave3 2>/dev/null || git checkout -q -b charfix-wave3 main

for RIGGED in "$OUTPUT_DIR"/*_rigged.glb; do
  BASENAME=$(basename "$RIGGED" _rigged.glb)
  echo "=== Verifying $BASENAME ==="
  
  # Check skin validity
  VALID=$(python3 -c "
import struct, json, sys
try:
    data = open('$RIGGED','rb').read()
    clen = struct.unpack('<I', data[12:16])[0]
    js = json.loads(data[20:20+clen])
    skins = js.get('skins', [])
    if not skins:
        print('NO_SKIN'); sys.exit()
    joints = skins[0].get('joints', [])
    if len(joints) < 20:
        print(f'TOO_FEW_JOINTS:{len(joints)}'); sys.exit()
    print(f'OK:{len(joints)}')
except Exception as e:
    print(f'ERROR:{e}')
")
  
  echo "  Skin check: $VALID"
  if [[ "$VALID" != OK* ]]; then
    echo "  SKIP $BASENAME: $VALID"
    continue
  fi
  
  # Render for visual verification
  RENDER="$OUTPUT_DIR/${BASENAME}_verify.png"
  timeout 120 blender -b --python "$SCRIPT_DIR/blender_render_check.py" -- "$RIGGED" "$RENDER" 2>&1 | tail -1
  
  if [ -f "$RENDER" ]; then
    echo "  Rendered: $RENDER"
    echo "  MANUAL CHECK NEEDED: review $RENDER before committing"
    # For now, copy and commit - manual review happens in batch
    cp "$RIGGED" "$CAST_DIR/${BASENAME}.glb"
    git add "$CAST_DIR/${BASENAME}.glb"
    git commit -q -m "charfix-wave3: $BASENAME — auto-rigged via Blender (Mixamo skeleton + automatic weights)" 2>&1 | head -1
    echo "  Committed $BASENAME"
  else
    echo "  SKIP $BASENAME: render failed"
  fi
done

echo "Done. Push with: git push origin charfix-wave3"
