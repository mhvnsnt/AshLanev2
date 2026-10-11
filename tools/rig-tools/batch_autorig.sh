#!/bin/bash
# Batch auto-rig unrigged models
# Usage: batch_autorig.sh
# Processes all models listed in UNRIGGED_MODELS, outputs to ~/workspace/charfix/output/

set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
OUTPUT_DIR=~/workspace/charfix/output
CAST_DIR=~/workspace/game-sweep/AshLanev2/public/models/cast

UNRIGGED_MODELS=(
  "ASTRID"
  "BILL_DOZER"
  "CAIN_ELIAS_attire2"
  "CAIN_ELIAS_attire3"
  "CAIN_ELIAS_attire4"
  "EDWIN_KENNEDY_attire3"
  "EDWIN_KENNEDY_ring1"
  "JAGER"
  "JAGER_model1"
  "JAGER_nobeard"
  "JAGER_trench"
  "MARKS"
  "MASTER_SENSEI_gokublack"
  "PABLO_attire2"
  "PABLO_attire3"
  "SOMBRA_NEGRA"
  "TARZANIAN_DEVIL_attire2"
  "TITAN_attire1"
  "TITAN_white"
  "WRECK_PATTERSON_attire2"
  "WRECK_PATTERSON_attire3"
  "WRECK_PATTERSON_attire4"
)

mkdir -p "$OUTPUT_DIR"

for MODEL in "${UNRIGGED_MODELS[@]}"; do
  INPUT="$CAST_DIR/${MODEL}.glb"
  OUTPUT="$OUTPUT_DIR/${MODEL}_rigged.glb"
  if [ ! -f "$INPUT" ]; then
    echo "SKIP $MODEL: not found"
    continue
  fi
  if [ -f "$OUTPUT" ]; then
    echo "SKIP $MODEL: already done"
    continue
  fi
  echo "=== Processing $MODEL ==="
  timeout 300 blender -b --python "$SCRIPT_DIR/blender_autorig.py" -- \
    "$INPUT" "$OUTPUT" "$SCRIPT_DIR/mixamo_standard.json" 2>&1 | grep -E "Exported|DONE|Error:" | head -3
done

echo "Batch complete. Outputs in $OUTPUT_DIR"
