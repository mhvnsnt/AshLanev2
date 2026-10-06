#!/bin/bash
# Real-ESRGAN setup — BSD-2-Clause licensed AI upscaler
# https://github.com/xinntao/Real-ESRGAN
#
# Usage: bash upscale_setup.sh

set -e

echo "=== Real-ESRGAN Setup (BSD-2-Clause) ==="

python3 --version || { echo "Python 3 not found"; exit 1; }

if [ ! -d "upscale-env" ]; then
  python3 -m venv upscale-env
fi

source upscale-env/bin/activate

if command -v nvidia-smi &> /dev/null; then
  pip install torch torchvision --index-url https://download.pytorch.org/whl/cu121
else
  pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu
fi

pip install realesrgan opencv-python numpy Pillow

# Download weights
mkdir -p weights
if [ ! -f "weights/RealESRGAN_x4plus.pth" ]; then
  echo "Downloading RealESRGAN_x4plus weights..."
  curl -sL -o weights/RealESRGAN_x4plus.pth \
    "https://github.com/xinntao/Real-ESRGAN/releases/download/v0.1.0/RealESRGAN_x4plus.pth"
fi

echo ""
echo "=== Real-ESRGAN ready ==="
echo "Upscale: python3 upscale.py --input blurry.png --output sharp.png"
echo "Activate env: source upscale-env/bin/activate"
