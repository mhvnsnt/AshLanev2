# AshLane GPU Character Generation - Docker Fallback
# 
# If all free API options fail, this Docker image provides a self-hosted
# GPU character generation server. Deploy on RunPod, Vast.ai, or any GPU box.
#
# Usage:
#   docker build -t ashlane-chargen .
#   
#   # RunPod (one command):
#   # Create a pod with this image, GPU (RTX 3090+), expose port 7860
#   
#   # Vast.ai:
#   # vastai create instance --image ashlane-chargen --gpu RTX_3090

FROM nvidia/cuda:12.1.0-runtime-ubuntu22.04

ENV DEBIAN_FRONTEND=noninteractive
ENV PYTHONUNBUFFERED=1

# System dependencies
RUN apt-get update && apt-get install -y \
    python3 python3-pip git curl \
    libgl1-mesa-glx libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Python dependencies
RUN pip3 install --no-cache-dir \
    torch torchvision --index-url https://download.pytorch.org/whl/cu121 \
    && pip3 install --no-cache-dir \
    gradio \
    huggingface_hub \
    Pillow \
    numpy \
    trimesh \
    pygltflib

# Install TripoSR (MIT)
RUN git clone https://github.com/VAST-AI-Research/TripoSR.git /opt/TripoSR
WORKDIR /opt/TripoSR
RUN pip3 install --no-cache-dir -r requirements.txt || true

# Download TripoSR weights on first run (cached in image)
# RUN python3 -c "from huggingface_hub import snapshot_download; snapshot_download('stabilityai/TripoSR')"

# Copy the generation server
COPY server.py /opt/server.py

EXPOSE 7860

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=120s \
    CMD curl -f http://localhost:7860/ || exit 1

CMD ["python3", "/opt/server.py"]
