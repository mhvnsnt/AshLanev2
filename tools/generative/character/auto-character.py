#!/usr/bin/env python3
"""
AshLane Auto Character Generator
=================================
Fully automated 3D character generation from text/images using free GPU backends.
No manual steps. No browser clicks. The machines do everything.

Backends (tried in order):
1. TRELLIS (trellis-community/TRELLIS) - highest quality, image-to-3D
2. Stable Fast 3D (stabilityai/stable-fast-3d) - fast, image-to-3D

Usage:
    python auto-character.py --image input.png --output ./output/
    python auto-character.py --batch characters.json
    python auto-character.py --prompt "muscular wrestler" --reference input.png

Batch JSON format:
    [
        {"name": "vato", "image": "vato_ref.png", "seed": 42},
        {"name": "cyborg", "image": "cyborg_ref.png", "seed": 123}
    ]

License: MIT
"""

import argparse
import json
import logging
import os
import sys
import time
import subprocess
from pathlib import Path
from datetime import datetime

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('auto-character.log')
    ]
)
log = logging.getLogger(__name__)

# Fix proxy issues with Python HTTP libs in this environment
os.environ['no_proxy'] = 'localhost,127.0.0.1'
os.environ['NO_PROXY'] = 'localhost,127.0.0.1'


class ShapEBackend:
    """Shap-E via hysts/Shap-E HuggingFace Space (raw REST API).
    Supports both text-to-3D and image-to-3D. MIT licensed model."""

    SPACE_URL = "https://hysts-shap-e.hf.space"

    def _curl(self, method, url, data=None, headers=None, timeout=30):
        cmd = ['curl', '-s', '-m', str(timeout), '-X', method, url]
        if headers:
            for k, v in headers.items():
                cmd.extend(['-H', f'{k}: {v}'])
        if data:
            cmd.extend(['-d', json.dumps(data) if isinstance(data, dict) else data])
        result = subprocess.run(cmd, capture_output=True, text=True)
        return result.stdout

    def upload(self, image_path):
        cmd = ['curl', '-s', '-m', '60', '-X', 'POST',
               f'{self.SPACE_URL}/gradio_api/upload', '-F', f'files=@{image_path}']
        result = subprocess.run(cmd, capture_output=True, text=True)
        try:
            return json.loads(result.stdout)[0]
        except Exception:
            return None

    def generate_from_text(self, prompt, seed=42, guidance=15.0, steps=64, timeout=600):
        """Generate 3D model from text prompt. Returns GLB download URL or None."""
        log.info(f"Shap-E text-to-3d: '{prompt[:50]}...'")

        response = self._curl('POST',
            f'{self.SPACE_URL}/gradio_api/call/text-to-3d',
            data={"data": [prompt, seed, guidance, steps]},
            headers={'Content-Type': 'application/json'})

        try:
            event_id = json.loads(response).get('event_id')
            if not event_id:
                log.error("No event_id from Shap-E")
                return None
        except Exception as e:
            log.error(f"Shap-E call failed: {e}")
            return None

        return self._poll(event_id, "text-to-3d", timeout)

    def generate_from_image(self, image_path, seed=42, guidance=15.0, steps=64, timeout=600):
        """Generate 3D model from image. Returns GLB download URL or None."""
        server_path = self.upload(image_path)
        if not server_path:
            return None

        file_data = {
            "path": server_path,
            "url": f"{self.SPACE_URL}/gradio_api/file={server_path}",
            "orig_name": Path(image_path).name,
            "meta": {"_type": "gradio.FileData"}
        }

        response = self._curl('POST',
            f'{self.SPACE_URL}/gradio_api/call/image-to-3d',
            data={"data": [file_data, seed, guidance, steps]},
            headers={'Content-Type': 'application/json'})

        try:
            event_id = json.loads(response).get('event_id')
            if not event_id:
                return None
        except Exception:
            return None

        return self._poll(event_id, "image-to-3d", timeout)

    def _poll(self, event_id, api_name, timeout=600):
        """Poll SSE stream for completed generation."""
        import threading, queue
        result_queue = queue.Queue()

        def reader():
            try:
                cmd = ['curl', '-s', '-m', str(timeout), '-N',
                       f'{self.SPACE_URL}/gradio_api/call/{api_name}/{event_id}']
                proc = subprocess.Popen(cmd, stdout=subprocess.PIPE, text=True)
                last = None
                for line in proc.stdout:
                    line = line.strip()
                    if line.startswith('data: ') and line != 'data: null':
                        try:
                            data = json.loads(line[6:])
                            # Look for completion (not just progress)
                            if isinstance(data, list) and len(data) > 0:
                                last = data
                        except:
                            pass
                proc.wait()
                result_queue.put(last)
            except Exception as e:
                result_queue.put(None)

        t = threading.Thread(target=reader, daemon=True)
        t.start()
        t.join(timeout + 30)

        try:
            result = result_queue.get_nowait()
        except queue.Empty:
            result = None

        if result:
            return self._extract_glb(result)
        log.error("Shap-E: no result received")
        return None

    def _extract_glb(self, payload):
        def search(obj):
            if isinstance(obj, dict):
                url = obj.get('url', '')
                if url and ('.glb' in url or '.obj' in url):
                    return url if url.startswith('http') else f"{self.SPACE_URL}{url}"
                for v in obj.values():
                    r = search(v)
                    if r:
                        return r
            elif isinstance(obj, list):
                for item in obj:
                    r = search(item)
                    if r:
                        return r
            return None
        url = search(payload)
        if url:
            log.info(f"Shap-E: got model URL")
        return url

    def generate(self, image_path=None, prompt=None, seed=42, **kwargs):
        """Unified generate: image takes priority, falls back to text."""
        if image_path and Path(image_path).exists():
            return self.generate_from_image(image_path, seed=seed)
        elif prompt:
            return self.generate_from_text(prompt, seed=seed)
        return None


class TRELLISBackend:
    """TRELLIS via trellis-community HuggingFace Space (raw REST API)."""
    
    SPACE_URL = "https://trellis-community-trellis.hf.space"
    API_NAME = "generate_and_extract_glb"
    
    def __init__(self):
        self.session = None
    
    def _curl(self, method, url, data=None, headers=None, timeout=30):
        """Run curl and return stdout."""
        cmd = ['curl', '-s', '-m', str(timeout), '-X', method, url]
        if headers:
            for k, v in headers.items():
                cmd.extend(['-H', f'{k}: {v}'])
        if data:
            cmd.extend(['-d', json.dumps(data) if isinstance(data, dict) else data])
        result = subprocess.run(cmd, capture_output=True, text=True)
        return result.stdout
    
    def upload(self, image_path):
        """Upload image to the Space, return the server path."""
        log.info(f"Uploading {image_path} to TRELLIS space...")
        cmd = [
            'curl', '-s', '-m', '60',
            '-X', 'POST', f'{self.SPACE_URL}/gradio_api/upload',
            '-F', f'files=@{image_path}'
        ]
        result = subprocess.run(cmd, capture_output=True, text=True)
        try:
            paths = json.loads(result.stdout)
            server_path = paths[0]
            log.info(f"Uploaded: {server_path}")
            return server_path
        except Exception as e:
            log.error(f"Upload failed: {e}, output: {result.stdout[:200]}")
            return None
    
    def generate(self, image_path, seed=42, texture_size=1024, timeout=600):
        """
        Generate 3D model from image.
        Returns path to downloaded GLB or None.
        """
        server_path = self.upload(image_path)
        if not server_path:
            return None
        
        # Build FileData object
        file_data = {
            "path": server_path,
            "url": f"{self.SPACE_URL}/gradio_api/file={server_path}",
            "orig_name": Path(image_path).name,
            "meta": {"_type": "gradio.FileData"}
        }
        
        # Call the API
        payload = {
            "data": [
                file_data,  # Image Prompt
                [],         # Gallery (empty)
                seed,       # Seed
                7.5,        # Guidance Strength
                30,         # Sampling Steps
                3.0,        # Guidance Strength (2nd)
                30,         # Sampling Steps (2nd)
                "Stochastic",  # Multi-image Algorithm
                0.9,        # Simplify
                texture_size,  # Texture Size
            ]
        }
        
        log.info("Submitting generation request...")
        response = self._curl(
            'POST',
            f'{self.SPACE_URL}/gradio_api/call/{self.API_NAME}',
            data=payload,
            headers={'Content-Type': 'application/json'},
            timeout=30
        )
        
        try:
            event_data = json.loads(response)
            event_id = event_data.get('event_id')
            if not event_id:
                log.error(f"No event_id in response: {response[:200]}")
                return None
            log.info(f"Event ID: {event_id}, waiting for generation...")
        except Exception as e:
            log.error(f"Failed to parse event response: {e}")
            return None
        
        # Poll SSE stream for results
        return self._poll_result(event_id, timeout)
    
    def _poll_result(self, event_id, timeout=600):
        """Poll the SSE stream until generation completes."""
        import threading
        import queue
        
        result_queue = queue.Queue()
        
        def stream_reader():
            try:
                cmd = [
                    'curl', '-s', '-m', str(timeout), '-N',
                    f'{self.SPACE_URL}/gradio_api/call/{self.API_NAME}/{event_id}'
                ]
                proc = subprocess.Popen(cmd, stdout=subprocess.PIPE, text=True)
                buffer = ""
                for line in proc.stdout:
                    buffer += line
                    # Look for completed data messages
                    if 'data: [' in line:
                        result_queue.put(('data', line))
                proc.wait()
                result_queue.put(('done', None))
            except Exception as e:
                result_queue.put(('error', str(e)))
        
        thread = threading.Thread(target=stream_reader, daemon=True)
        thread.start()
        
        start = time.time()
        last_data = None
        
        while time.time() - start < timeout:
            try:
                msg_type, msg = result_queue.get(timeout=5)
                if msg_type == 'data':
                    last_data = msg
                    log.debug(f"Progress update received")
                elif msg_type == 'done':
                    break
                elif msg_type == 'error':
                    log.error(f"Stream error: {msg}")
                    break
            except queue.Empty:
                continue
        
        if last_data:
            return self._parse_result(last_data)
        
        log.error("Generation timed out or produced no result")
        return None
    
    def _parse_result(self, sse_data):
        """Extract GLB download URL from SSE data."""
        try:
            # SSE data lines start with "data: "
            for line in sse_data.split('\n'):
                line = line.strip()
                if line.startswith('data: '):
                    payload = json.loads(line[6:])
                    # Payload is typically [state, video_info, glb_info, download_info]
                    # Look for .glb URLs in the payload
                    payload_str = json.dumps(payload)
                    if '.glb' in payload_str:
                        log.info("Found GLB in result")
                        return self._extract_glb_url(payload)
            return None
        except Exception as e:
            log.error(f"Failed to parse SSE result: {e}")
            return None
    
    def _extract_glb_url(self, payload):
        """Find and return the GLB download URL from the API payload."""
        def search(obj):
            if isinstance(obj, dict):
                url = obj.get('url', '')
                path = obj.get('path', '')
                if url and '.glb' in url:
                    return url
                if path and '.glb' in path:
                    # Construct full URL
                    if path.startswith('/'):
                        return f"{self.SPACE_URL}/gradio_api/file={path}"
                    return f"{self.SPACE_URL}/gradio_api/file=/{path}"
                for v in obj.values():
                    r = search(v)
                    if r:
                        return r
            elif isinstance(obj, list):
                for item in obj:
                    r = search(item)
                    if r:
                        return r
            return None
        
        return search(payload)


class StableFast3DBackend:
    """Stable Fast 3D via stabilityai HuggingFace Space (raw REST API)."""
    
    SPACE_URL = "https://stabilityai-stable-fast-3d.hf.space"
    API_NAME = "run_button"
    
    def generate(self, image_path, **kwargs):
        """Generate 3D model from image. Returns GLB path or None."""
        # Similar implementation to TRELLIS but with different params
        # [Button, Image, State, Foreground Ratio, Remeshing, Vertex Count, Texture Size]
        log.info("StableFast3D backend: attempting generation...")
        # Implementation follows same pattern as TRELLIS
        # Upload, call API, poll, download
        return None  # Placeholder - TRELLIS is primary


def download_file(url, output_path, timeout=120):
    """Download a file via curl."""
    log.info(f"Downloading {url[:80]}...")
    cmd = ['curl', '-s', '-m', str(timeout), '-L', '-o', str(output_path), url]
    result = subprocess.run(cmd)
    if result.returncode == 0 and Path(output_path).exists():
        size = Path(output_path).stat().st_size
        log.info(f"Downloaded: {output_path} ({size//1024}KB)")
        return True
    log.error(f"Download failed: {url[:80]}")
    return False


def postprocess(glb_path, output_path, target_tris=25000):
    """
    Postprocess generated GLB: validate, decimate if needed.
    Uses gltf-transform if available.
    """
    log.info(f"Postprocessing {glb_path}...")
    
    # Basic validation: check it's a real GLB
    with open(glb_path, 'rb') as f:
        magic = f.read(4)
        if magic != b'glTF':
            log.error(f"Not a valid GLB: {glb_path}")
            return False
    
    # TODO: Add decimation via gltf-transform or Blender
    # For now, just copy to output
    import shutil
    shutil.copy2(glb_path, output_path)
    log.info(f"Postprocessed: {output_path}")
    return True


def generate_character(name, image_path=None, prompt=None, output_dir="./output", seed=42, backends=None):
    """
    Generate a single character. Tries backends in order.
    Returns path to final GLB or None.
    """
    output_dir = Path(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)
    
    log.info(f"=" * 60)
    log.info(f"Generating character: {name}")
    log.info(f"Input: {image_path}, Seed: {seed}")
    log.info(f"=" * 60)
    
    backends = backends or [ShapEBackend(), TRELLISBackend(), StableFast3DBackend()]
    
    for backend in backends:
        backend_name = backend.__class__.__name__
        log.info(f"Trying backend: {backend_name}")
        
        try:
            glb_url = backend.generate(image_path=image_path, prompt=prompt, seed=seed)
            if not glb_url:
                log.warning(f"{backend_name}: no result, trying next backend")
                continue
            
            # Download
            temp_glb = output_dir / f"{name}_raw.glb"
            if not download_file(glb_url, temp_glb):
                continue
            
            # Postprocess
            final_glb = output_dir / f"{name}.glb"
            if postprocess(temp_glb, final_glb):
                log.info(f"✅ {name}: {final_glb}")
                return str(final_glb)
            
        except Exception as e:
            log.error(f"{backend_name} failed: {e}")
            continue
    
    log.error(f"❌ {name}: all backends failed")
    return None


def batch_generate(batch_file, output_dir):
    """Generate multiple characters from a JSON batch file."""
    with open(batch_file) as f:
        characters = json.load(f)
    
    log.info(f"Batch mode: {len(characters)} characters")
    results = {}
    
    for char in characters:
        name = char['name']
        image = char.get('image')
        prompt = char.get('prompt')
        seed = char.get('seed', 42)
        
        result = generate_character(name, image_path=image, prompt=prompt, output_dir=output_dir, seed=seed)
        results[name] = result
        
        # Brief pause between generations to avoid rate limits
        time.sleep(5)
    
    # Summary
    log.info("=" * 60)
    log.info("BATCH COMPLETE")
    log.info("=" * 60)
    for name, path in results.items():
        status = "✅" if path else "❌"
        log.info(f"  {status} {name}: {path or 'FAILED'}")
    
    # Save results manifest
    manifest_path = Path(output_dir) / "manifest.json"
    with open(manifest_path, 'w') as f:
        json.dump({
            "generated_at": datetime.now().isoformat(),
            "results": results
        }, f, indent=2)
    
    return results


def main():
    parser = argparse.ArgumentParser(description="AshLane Auto Character Generator")
    parser.add_argument('--image', help='Input reference image')
    parser.add_argument('--prompt', help='Text prompt for generation (Shap-E)')
    parser.add_argument('--name', default='character', help='Character name for output')
    parser.add_argument('--seed', type=int, default=42, help='Random seed')
    parser.add_argument('--output', default='./output', help='Output directory')
    parser.add_argument('--batch', help='JSON batch file for multiple characters')
    
    args = parser.parse_args()
    
    if args.batch:
        batch_generate(args.batch, args.output)
    elif args.image or args.prompt:
        result = generate_character(args.name, image_path=args.image, prompt=args.prompt, output_dir=args.output, seed=args.seed)
        if result:
            print(f"\n✅ Generated: {result}")
            sys.exit(0)
        else:
            print(f"\n❌ Generation failed")
            sys.exit(1)
    else:
        parser.print_help()
        sys.exit(1)


if __name__ == '__main__':
    main()
