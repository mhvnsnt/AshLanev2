#!/bin/bash
cd ~/workspace/game-sweep/cc-3dhead
BL="env -u PYTHONPATH $HOME/workspace/tools/blender/blender-4.0.2-linux-x64/blender --background --python scripts/cc-lane/qc_render.py --"
run() { # char asset out views scale hide
  local out="$3"
  case "$4" in *turn*) f="${out}_turn.png";; *side*) f="${out}_side.png";; *) f="${out}_front.png";; esac
  if [ -f "$f" ]; then echo "SKIP $f"; return 0; fi
  $BL "$1" "$2" "$3" "$4" "$5" "$6" >>scripts/cc-lane/qc_round2.log 2>&1 || echo "FAIL $3 $4"
}
A=public/models/cast/ASTRID.glb
# turn views (bone-follow) on ASTRID
run $A public/models/hair/hair_echo_long_green.glb public/models/hair/qc/hair_echo_long_green_astrid turn 1.0 Hair
run $A public/models/hair/hair_static_blond_beard.glb public/models/hair/qc/hair_static_blond_beard_astrid turn 1.0 Hair
run $A public/models/hair/hair_hollow_long_black.glb public/models/hair/qc/hair_hollow_long_black_astrid turn 1.0 Hair
run $A public/models/hair/hair_theory_locs_beads.glb public/models/hair/qc/hair_theory_locs_beads_astrid turn 1.0 ""
run $A public/models/hair/hair_theory_locs_pinned.glb public/models/hair/qc/hair_theory_locs_pinned_nohair turn 1.0 Hair
run $A public/models/hoods/hood_purple_robe.glb public/models/hoods/qc/hood_purple_robe_astrid turn 1.0 ""
# second head shape: real canon heads (meshopt-decoded), accessory scaled to head height
run /tmp/qcwork/hollow_plain.glb public/models/masks/mask_hollow_superdragon.glb public/models/masks/qc/mask_hollow_superdragon_hollow front 0.4458 ""
run /tmp/qcwork/hollow_plain.glb public/models/hair/hair_hollow_long_black.glb public/models/hair/qc/hair_hollow_long_black_hollow front 0.4458 ""
run /tmp/qcwork/echo_plain.glb public/models/hair/hair_echo_long_green.glb public/models/hair/qc/hair_echo_long_green_echo front 0.4494 ""
run /tmp/qcwork/static_plain.glb public/models/hair/hair_static_blond_beard.glb public/models/hair/qc/hair_static_blond_beard_static front 0.4494 ""
echo ROUND2_DONE
