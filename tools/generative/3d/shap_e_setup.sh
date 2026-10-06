#!/bin/bash
# Shap-E setup — MIT licensed text-to-3D (OpenAI)
# https://github.com/openai/shap-e
#
# Text prompt in → 3D mesh out. MIT = safe for commercial use.
# Slow on CPU (can take 30+ min), fast on GPU (seconds).
# Best for: quick concept meshes, props from text descriptions.
#
# Usage: bash shap_e_setup.sh

set -e

echo "=== Shap-E Setup (MIT, OpenAI) ==="

python3 --version || { echo "Python 3 not found"; exit 1; }

if [ ! -d "shap-e-env" ]; then
  python3 -m venv shap-e-env
  echo "Created venv: shap-e-env"
fi

source shap-e-env/bin/activate

if command -v nvidia-smi &> /dev/null; then
  echo "GPU detected"
  pip install torch torchvision --index-url https://download.pytorch.org/whl/cu121
else
  echo "WARNING: Shap-E is SLOW on CPU (30+ min per mesh). GPU recommended."
  pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu
fi

if [ ! -d "shap-e" ]; then
  git clone https://github.com/openai/shap-e.git
fi

cd shap-e
pip install -e .
cd ..

echo ""
echo "=== Shap-E ready ==="
echo 'Generate: python3 shap_e_generate.py --prompt "a wooden crate" --output crate.glb'
echo "Activate env: source shap-e-env/bin/activate"
