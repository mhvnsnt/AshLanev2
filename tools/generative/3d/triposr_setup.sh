#!/bin/bash
# TripoSR setup — MIT licensed image-to-3D (Stability AI + Tripo AI)
# https://github.com/VAST-AI-Research/TripoSR
#
# Fastest open-source image-to-3D. MIT code + MIT weights = safe for commercial use.
# GPU: ~0.5-1s per model. CPU: 2-10 min per model.
#
# Usage: bash triposr_setup.sh

set -e

echo "=== TripoSR Setup (MIT) ==="

# Check Python
python3 --version || { echo "Python 3 not found"; exit 1; }

# Create venv
if [ ! -d "triposr-env" ]; then
  python3 -m venv triposr-env
  echo "Created venv: triposr-env"
fi

source triposr-env/bin/activate

# Install PyTorch (CPU or CUDA)
if command -v nvidia-smi &> /dev/null; then
  echo "GPU detected — installing CUDA PyTorch"
  pip install torch torchvision --index-url https://download.pytorch.org/whl/cu121
else
  echo "No GPU — installing CPU PyTorch (slower but works)"
  pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu
fi

# Install TripoSR
if [ ! -d "TripoSR" ]; then
  git clone https://github.com/VAST-AI-Research/TripoSR.git
fi

cd TripoSR
pip install omegaconf==2.3.0 Pillow==10.1.0 einops==0.7.0
pip install git+https://github.com/tatsy/torchmcubes.git
pip install transformers==4.35.0 trimesh==4.0.5 rembg huggingface-hub "imageio[ffmpeg]"
pip install xatlas==0.0.9 moderngl==5.10.0
cd ..

# Download weights
python3 -c "
from huggingface_hub import snapshot_download
snapshot_download('stabilityai/TripoSR', local_dir='./TripoSR/weights')
print('Weights downloaded')
"

echo ""
echo "=== TripoSR ready ==="
echo "Generate: python3 triposr_generate.py --input photo.jpg --output model.glb"
echo "Activate env: source triposr-env/bin/activate"
