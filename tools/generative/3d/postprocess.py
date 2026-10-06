#!/usr/bin/env python3
"""
Post-process generated 3D models for AshLane.
Takes raw AI output → game-ready GLB.

Does:
- Decimate to target poly count (mobile-friendly)
- Remove degenerate faces, merge vertices
- Fix normals
- Center + normalize scale
- Validate for Three.js loading

Usage:
    python3 postprocess.py --input raw.glb --output game-ready.glb
    python3 postprocess.py --input raw.glb --output game-ready.glb --target-faces 15000
    python3 postprocess.py --input raw.glb --output game-ready.glb --character
        (--character: keeps higher detail, targets 20k faces, preserves proportions)

Requires: pip install trimesh numpy
"""

import argparse
import os
import sys

def main():
    parser = argparse.ArgumentParser(description="Post-process AI 3D for AshLane")
    parser.add_argument("--input", required=True, help="Input mesh (glb/obj/ply)")
    parser.add_argument("--output", required=True, help="Output GLB path")
    parser.add_argument("--target-faces", type=int, default=10000,
                        help="Target face count (default 10000)")
    parser.add_argument("--character", action="store_true",
                        help="Character mode: higher detail (20k), preserve proportions")
    args = parser.parse_args()

    import trimesh
    import numpy as np

    if args.character and args.target_faces == 10000:
        args.target_faces = 20000

    print(f"Loading: {args.input}")
    mesh = trimesh.load(args.input, force='mesh')

    # Handle scene with multiple meshes
    if isinstance(mesh, trimesh.Scene):
        print(f"Scene with {len(mesh.geometry)} geometries — combining...")
        meshes = list(mesh.geometry.values())
        mesh = trimesh.util.concatenate(meshes)

    print(f"  Input: {len(mesh.faces)} faces, {len(mesh.vertices)} verts")

    # Clean
    print("Cleaning...")
    mesh.merge_vertices()
    # remove_duplicate_faces was removed in trimesh 5.x — merge_vertices handles it
    if hasattr(mesh, 'remove_duplicate_faces'):
        mesh.remove_duplicate_faces()
    if hasattr(mesh, 'remove_degenerate_faces'):
        mesh.remove_degenerate_faces()
    mesh.remove_infinite_values()
    print(f"  After clean: {len(mesh.faces)} faces")

    # Decimate if needed
    if len(mesh.faces) > args.target_faces:
        print(f"Decimating to ~{args.target_faces} faces...")
        # trimesh doesn't have built-in decimation, use quadric simplification
        # via open3d if available, else basic face reduction
        try:
            import open3d as o3d
            o3d_mesh = o3d.geometry.TriangleMesh()
            o3d_mesh.vertices = o3d.utility.Vector3dVector(np.asarray(mesh.vertices))
            o3d_mesh.triangles = o3d.utility.Vector3iVector(np.asarray(mesh.faces))
            o3d_mesh = o3d_mesh.simplify_quadric_decimation(args.target_faces)
            mesh = trimesh.Trimesh(
                vertices=np.asarray(o3d_mesh.vertices),
                faces=np.asarray(o3d_mesh.triangles),
            )
            # Re-transfer vertex colors if they existed
            print(f"  After decimate: {len(mesh.faces)} faces")
        except ImportError:
            print("  open3d not available — skipping decimation (pip install open3d for this)")
            print("  Keeping original face count")

    # Fix normals
    print("Fixing normals...")
    mesh.fix_normals()

    # Center on origin (XZ) and put base at Y=0
    print("Normalizing transform...")
    mesh.vertices -= mesh.centroid  # center
    min_y = mesh.vertices[:, 1].min()
    mesh.vertices[:, 1] -= min_y  # base at zero

    # Scale to ~1.8m tall (human) unless --character not set for props
    # For characters we assume roughly human proportions already
    height = mesh.vertices[:, 1].max() - mesh.vertices[:, 1].min()
    if args.character and height > 0:
        target_height = 1.8
        scale = target_height / height
        # Only scale if wildly off (AI sometimes outputs tiny/huge)
        if scale < 0.5 or scale > 2.0:
            print(f"  Rescaling {height:.2f}m → {target_height}m (factor {scale:.2f})")
            mesh.vertices *= scale

    # Ensure vertex colors exist (some pipelines need them)
    # (trimesh handles this on export)

    # Export
    os.makedirs(os.path.dirname(os.path.abspath(args.output)) or ".", exist_ok=True)
    mesh.export(args.output)
    print(f"Saved: {args.output}")
    print(f"  Final: {len(mesh.faces)} faces, {len(mesh.vertices)} verts")

    # Validation
    print("")
    print("Validation:")
    print(f"  Watertight: {mesh.is_watertight}")
    print(f"  Volume: {mesh.volume:.4f}")
    if not mesh.is_watertight:
        print("  (Non-watertight is OK for game characters — only matters for 3D printing)")

    print("")
    print("Next steps:")
    print("  1. Copy to AshLanev2: public/models/generated/")
    print("  2. For characters: rig to 52-bone Mixamo skeleton (see docs/BONE_STANDARD.md)")
    print("  3. Test in game via model viewer or character select")

if __name__ == "__main__":
    main()
