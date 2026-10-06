#!/bin/bash
# Deploy AshLane character generation to a GPU cloud box
# Supports: RunPod, Vast.ai
# Cost: ~$0.30-$0.50/hr for RTX 3090/4090
#
# Usage:
#   ./deploy-gpu.sh runpod    # Deploy to RunPod
#   ./deploy-gpu.sh vast      # Deploy to Vast.ai
#   ./deploy-gpu.sh local     # Build and test locally (needs NVIDIA Docker)

set -e

PROVIDER="${1:-runpod}"
IMAGE_NAME="ashlane-chargen"

echo "=== AshLane GPU Character Generation Deploy ==="
echo "Provider: $PROVIDER"

# Build the image
echo ""
echo "Building Docker image..."
docker build -t $IMAGE_NAME .

case $PROVIDER in
  runpod)
    echo ""
    echo "=== RunPod Deployment ==="
    echo "1. Go to https://www.runpod.io/console/pods"
    echo "2. Click '+ Deploy'"
    echo "3. Select GPU: RTX 3090 or better (24GB+ VRAM recommended)"
    echo "4. Container Image: $IMAGE_NAME"
    echo "   (push to Docker Hub first: docker push YOUR_USER/$IMAGE_NAME)"
    echo "5. Expose HTTP Port: 7860"
    echo "6. Click Deploy"
    echo ""
    echo "Once running, set your endpoint:"
    echo "  export ASHLANE_GPU_URL=http://YOUR_POD_IP:7860"
    echo ""
    echo "Estimated cost: \$0.34/hr (RTX 3090), ~\$3 for 8 hours of generation"
    ;;
  vast)
    echo ""
    echo "=== Vast.ai Deployment ==="
    echo "Run:"
    echo "  vastai create instance \\"
    echo "    --image $IMAGE_NAME \\"
    echo "    --disk 30 \\"
    echo "    --port 7860:7860 \\"
    echo "    --gpu RTX_3090"
    echo ""
    echo "Estimated cost: \$0.25-\$0.40/hr"
    ;;
  local)
    echo ""
    echo "=== Local Test (requires NVIDIA Docker) ==="
    docker run --gpus all -p 7860:7860 $IMAGE_NAME
    ;;
  *)
    echo "Unknown provider: $PROVIDER"
    echo "Usage: $0 [runpod|vast|local]"
    exit 1
    ;;
esac

echo ""
echo "=== Test the deployment ==="
echo "curl http://YOUR_GPU_URL:7860/health"
echo ""
echo "=== Generate a character ==="
echo "python3 -c \""
echo "import base64, json, urllib.request"
echo "with open('ref.png','rb') as f: img = base64.b64encode(f.read()).decode()"
echo "req = urllib.request.Request("
echo "    'http://YOUR_GPU_URL:7860/generate',"
echo "    data=json.dumps({'image': img, 'seed': 42}).encode(),"
echo "    headers={'Content-Type': 'application/json'})"
echo "print(urllib.request.urlopen(req).read().decode())"
echo "\""
