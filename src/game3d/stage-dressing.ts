/**
 * stage-dressing.ts — Round 3 content wiring (procedural textures + Prelinger films).
 *
 * Applies the round-3 generated assets to the 3D stage:
 *  - procedural asphalt ground overlay (public/textures/procedural/)
 *  - three in-world TV screens playing public-domain Prelinger Archive films
 *    (public/video/ — Duck and Cover 1951, Make Mine Freedom 1948,
 *    Hindenburg explodes 1937). All public domain.
 *
 * All asset URLs go through assetUrl() so GitHub Pages base paths resolve.
 */

import * as THREE from "three";
import { assetUrl } from "./asset-base";

const VIDEOS = [
  "video/DuckandC1951_512kb.mp4",
  "video/MakeMine1948_512kb.mp4",
  "video/hindenberg_explodes_512kb.mp4",
];

/** Add procedural asphalt ground detail + Prelinger TV screens to the scene. */
export function dressStage(scene: THREE.Scene): void {
  // --- Procedural asphalt overlay ------------------------------------------------
  // A second ground plane slightly above the base one, using the generated
  // asphalt albedo + roughness maps. Polygon offset avoids z-fighting.
  const texLoader = new THREE.TextureLoader();
  const albedo = texLoader.load(assetUrl("textures/procedural/asphalt.png"));
  albedo.wrapS = albedo.wrapT = THREE.RepeatWrapping;
  albedo.repeat.set(24, 24);
  albedo.colorSpace = THREE.SRGBColorSpace;
  const rough = texLoader.load(assetUrl("textures/procedural/asphalt-roughness.png"));
  rough.wrapS = rough.wrapT = THREE.RepeatWrapping;
  rough.repeat.set(24, 24);

  const overlay = new THREE.Mesh(
    new THREE.PlaneGeometry(180, 180),
    new THREE.MeshStandardMaterial({
      map: albedo,
      roughnessMap: rough,
      roughness: 1.0,
      metalness: 0.0,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    }),
  );
  overlay.rotation.x = -Math.PI / 2;
  overlay.position.y = 0.012; // just above the base ground plane
  overlay.receiveShadow = true;
  overlay.name = "procedural-asphalt";
  scene.add(overlay);

  // --- Prelinger TV screens -------------------------------------------------------
  // Three freestanding screens around the arena, each looping a different
  // public-domain film. Muted + playsinline so autoplay policies allow them;
  // they start on first user gesture if the browser blocks autoplay.
  const screens: Array<{ mesh: THREE.Mesh; video: HTMLVideoElement }> = [];
  const placements = [
    { x: -14, y: 3.2, z: -10, ry: Math.PI / 5 },
    { x: 14, y: 3.2, z: -8, ry: -Math.PI / 6 },
    { x: 0, y: 3.6, z: 14, ry: Math.PI },
  ];

  VIDEOS.forEach((file, i) => {
    const video = document.createElement("video");
    video.src = assetUrl(file);
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";

    const tex = new THREE.VideoTexture(video);
    tex.colorSpace = THREE.SRGBColorSpace;

    const group = new THREE.Group();
    const frame = new THREE.Mesh(
      new THREE.BoxGeometry(7.4, 4.4, 0.25),
      new THREE.MeshStandardMaterial({ color: 0x14161c, roughness: 0.6 }),
    );
    const panel = new THREE.Mesh(
      new THREE.PlaneGeometry(6.8, 3.8),
      new THREE.MeshBasicMaterial({ map: tex, toneMapped: false }),
    );
    panel.position.z = 0.14;
    const stand = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.28, 3.2, 10),
      new THREE.MeshStandardMaterial({ color: 0x2a2d34, roughness: 0.5, metalness: 0.6 }),
    );
    stand.position.y = -3.7;
    group.add(frame, panel, stand);

    const p = placements[i % placements.length];
    group.position.set(p.x, p.y, p.z);
    group.rotation.y = p.ry;
    group.name = `prelinger-tv-${i}`;
    scene.add(group);
    screens.push({ mesh: panel, video });

    video.play().catch(() => {
      // Autoplay blocked — start on first gesture.
      const kick = () => {
        video.play().catch(() => {});
        window.removeEventListener("pointerdown", kick);
      };
      window.addEventListener("pointerdown", kick);
    });
  });

  // Keep screens list reachable for debugging.
  (scene as unknown as { __prelingerScreens: unknown }).__prelingerScreens = screens;
}
