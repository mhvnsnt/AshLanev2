#!/bin/bash
# TRELLIS setup — MIT licensed image-to-3D (Microsoft)
# https://github.com/microsoft/TRELLIS
#
# Higher quality than TripoSR, slower. MIT = safe for commercial use.
# Best for hero characters and important props.
#
# Usage: bash trellis_setup.sh

set -e

echo "=== TRELLIS Setup (MIT, Microsoft) ==="

python3 --version || { echo "Python 3 not found"; exit 1; }

if [ ! -d "trellis-env" ]; then
  python3 -m venv trellis-env
  echo "Created venv: trellis-env"
fi

source trellis-env/bin/activate

if command -v nvidia-smi &> /dev/null; then
  echo "GPU detected — installing CUDA PyTorch"
  pip install torch torchvision --index-url https://download.pytorch.org/whl/cu121
else
  echo "WARNING: TRELLIS is very slow on CPU. GPU strongly recommended."
  pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu
fi

if [ ! -d "TRELLIS" ]; then
  git clone https://github.com/microsoft/TRELLIS.git
fi

cd TRELLIS
pip install -e .
cd ..

echo ""
echo "=== TRELLIS ready ==="
echo "Generate: python3 trellis_generate.py --input photo.jpg --output model.glb"
echo "Activate env: source trellis-env/bin/activate"
