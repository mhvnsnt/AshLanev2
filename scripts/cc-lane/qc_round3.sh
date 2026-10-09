#!/bin/bash
cd ~/workspace/game-sweep/cc-3dhead
BL="env -u PYTHONPATH $HOME/workspace/tools/blender/blender-4.0.2-linux-x64/blender --background --python scripts/cc-lane/qc_render.py --"
run() {
  local f="$3_$4.png"
  if [ -f "$f" ]; then echo "SKIP $f"; return 0; fi
  $BL "$1" "$2" "$3" "$4" "$5" "$6" >>scripts/cc-lane/qc_round3.log 2>&1 || echo "FAIL $3 $4"
}
A=public/models/cast/ASTRID.glb
for m in mask_luchador_sombra mask_luchador_crimson mask_luchador_azul mask_bandana_black mask_bandana_red mask_bandana_camo hood_purple_robe_dark; do
  if [[ $m == hood* ]]; then P=public/models/hoods; else P=public/models/masks; fi
  for v in front side turn; do
    run $A $P/$m.glb $P/qc/${m}_astrid $v 1.0 ""
  done
done
echo ROUND3_DONE
