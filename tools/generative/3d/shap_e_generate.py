#!/usr/bin/env python3
"""
Shap-E text-to-3D generator for AshLane.
MIT licensed (OpenAI). Text prompt in → 3D mesh out.

Usage:
    python3 shap_e_generate.py --prompt "a wooden barrel" --output barrel.glb
    python3 shap_e_generate.py --prompt "a street lamp" --output lamp.glb --guidance 15

Best for: props, set dressing, quick concepts from text.
For characters, use TripoSR/TRELLIS with a reference image instead.
"""

import argparse
import os
import sys
import torch

def main():
    parser = argparse.ArgumentParser(description="Shap-E: text → 3D mesh")
    parser.add_argument("--prompt", required=True, help="Text description")
    parser.add_argument("--output", required=True, help="Output path (.obj or .ply)")
    parser.add_argument("--guidance", type=float, default=15.0, help="Guidance scale")
    parser.add_argument("--steps", type=int, default=64, help="Diffusion steps")
    parser.add_argument("--device", default=None)
    args = parser.parse_args()

    shap_e_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "shap-e")
    if os.path.isdir(shap_e_dir):
        sys.path.insert(0, shap_e_dir)

    from shap_e.diffusion.sample import sample_latents
    from shap_e.diffusion.gaussian_diffusion import diffusion_from_config
    from shap_e.models.download import load_model, load_config
    from shap_e.util.notebooks import create_pan_camera, decode_latent_images, gif_widget

    device = args.device or ("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Using device: {device}")

    print("Loading Shap-E models...")
    xm = load_model('transmitter', device=device)
    model = load_model('text300M', device=device)
    diffusion = diffusion_from_config(load_config('diffusion'))

    print(f"Generating: '{args.prompt}'")
    batch_size = 1
    guidance_scale = args.guidance

    # Clip embeddings from text
    from shap_e.models.clip import load_clip_model
    clip_model = load_clip_model(device=device)

    import numpy as np
    # Encode prompt
    tokens = clip_model.tokenize([args.prompt]).to(device)
    with torch.no_grad():
        text_emb = clip_model.encode_text(tokens).float()
        text_emb = text_emb / text_emb.norm(dim=-1, keepdim=True)

    latents = sample_latents(
        batch_size=batch_size,
        model=model,
        diffusion=diffusion,
        guidance_scale=guidance_scale,
        model_kwargs=dict(texts=[args.prompt]),
        progress=True,
        clip_denoised=True,
        use_fp16=True,
        use_karras=True,
        karras_steps=args.steps,
        sigma_min=1e-3,
        sigma_max=160,
        s_churn=0,
    )

    # Decode to mesh
    print("Decoding to mesh...")
    from shap_e.util.notebooks import decode_latent_mesh
    for i, latent in enumerate(latents):
        t = decode_latent_mesh(xm, latent).tri_mesh()

        os.makedirs(os.path.dirname(os.path.abspath(args.output)) or ".", exist_ok=True)
        with open(args.output, 'w') as f:
            t.write_obj(f)
        print(f"Saved: {args.output}")

    print("")
    print("Note: Shap-E outputs OBJ without textures. Run postprocess.py to optimize.")
    print("Next: python3 postprocess.py --input", args.output, "--output game-ready.glb")

if __name__ == "__main__":
    main()
