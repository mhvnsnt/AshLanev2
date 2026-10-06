#!/usr/bin/env python3
"""
AshLane Character Generation Server
Runs on GPU box (RunPod/Vast.ai). Exposes a simple HTTP API for character generation.

Endpoints:
    POST /generate - Generate 3D model from image
        Body: {"image": "base64...", "seed": 42}
        Returns: {"glb_url": "/output/xxx.glb"}

    GET /health - Health check
    GET /output/<file> - Download generated GLB

License: MIT
"""

import base64
import io
import os
import uuid
from pathlib import Path

OUTPUT_DIR = Path("/opt/output")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# Lazy load TripoSR on first request (saves startup time)
_triposr_model = None

def get_triposr():
    global _triposr_model
    if _triposr_model is None:
        print("Loading TripoSR model...")
        import torch
        from TripoSR.tsr.system import TSR
        _triposr_model = TSR.from_pretrained(
            "stabilityai/TripoSR",
            config_name="config.yaml",
            weight_name="model.ckpt",
        )
        _triposr_model.renderer.set_chunk_size(8192)
        device = "cuda:0" if torch.cuda.is_available() else "cpu"
        _triposr_model.to(device)
        print(f"TripoSR loaded on {device}")
    return _triposr_model


def generate_from_image(image_bytes, seed=42):
    """Generate 3D mesh from image bytes using TripoSR."""
    import torch
    import numpy as np
    from PIL import Image
    from TripoSR.tsr.utils import remove_background, resize_foreground
    
    model = get_triposr()
    device = next(model.parameters()).device
    
    # Preprocess
    image = Image.open(io.BytesIO(image_bytes))
    if image.mode == "RGBA":
        image = remove_background(image)
        image = resize_foreground(image, 0.85)
        image = np.array(image).astype(np.float32) / 255.0
        image = image[:, :, :3] * image[:, :, 3:4] + (1 - image[:, :, 3:4]) * 0.5
        image = Image.fromarray((image * 255.0).astype(np.uint8))
    
    # Generate
    with torch.no_grad():
        scene_codes = model.encode([image], device=device)
    
    # Extract mesh
    import trimesh
    mesh = model.extract_mesh(scene_codes, has_vertex_color=True)[0]
    
    # Save
    job_id = str(uuid.uuid4())[:8]
    output_path = OUTPUT_DIR / f"{job_id}.glb"
    
    # Convert to GLB via trimesh
    # (TripoSR outputs with vertex colors)
    mesh.export(str(output_path))
    
    return str(output_path)


# Simple HTTP server using stdlib (no Flask dependency)
from http.server import HTTPServer, BaseHTTPRequestHandler
import json

class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/health':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"status": "ok"}).encode())
        elif self.path.startswith('/output/'):
            filepath = OUTPUT_DIR / self.path[8:]
            if filepath.exists() and filepath.suffix == '.glb':
                self.send_response(200)
                self.send_header('Content-Type', 'model/gltf-binary')
                self.end_headers()
                self.wfile.write(filepath.read_bytes())
            else:
                self.send_response(404)
                self.end_headers()
        else:
            self.send_response(404)
            self.end_headers()
    
    def do_POST(self):
        if self.path == '/generate':
            length = int(self.headers['Content-Length'])
            body = json.loads(self.rfile.read(length))
            
            try:
                image_bytes = base64.b64decode(body['image'])
                seed = body.get('seed', 42)
                
                output_path = generate_from_image(image_bytes, seed)
                filename = Path(output_path).name
                
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({
                    "glb_url": f"/output/{filename}",
                    "path": output_path
                }).encode())
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode())
        else:
            self.send_response(404)
            self.end_headers()
    
    def log_message(self, format, *args):
        print(f"[{self.log_date_time_string()}] {format % args}")


if __name__ == '__main__':
    import torch
    print(f"CUDA available: {torch.cuda.is_available()}")
    if torch.cuda.is_available():
        print(f"GPU: {torch.cuda.get_device_name(0)}")
    
    port = int(os.environ.get('PORT', 7860))
    server = HTTPServer(('0.0.0.0', port), Handler)
    print(f"Serving on port {port}...")
    server.serve_forever()
