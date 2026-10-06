import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { assetUrl } from "@/game3d/asset-base";
import {
  ensureRapier,
  PhysicsWorld,
  HumanoidRagdoll,
} from "@/game3d/physics/ragdoll";

export const Route = createFileRoute("/ragdoll-demo")({
  component: RagdollDemo,
});

type DemoState = "loading" | "standing" | "ko" | "settled" | "error";

function RagdollDemo() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<DemoState>("loading");
  const [note, setNote] = useState("Loading Rapier WASM + fighter…");
  const koRef = useRef<() => void>(() => {});

  useEffect(() => {
    let cancelled = false;
    let renderer: THREE.WebGLRenderer | null = null;
    let physics: PhysicsWorld | null = null;
    let ragdoll: HumanoidRagdoll | null = null;
    let raf = 0;
    let koAt = 0;
    let timeScale = 1;

    // Harness hook: Playwright asserts status + displacement without DOM scraping.
    const win = window as unknown as {
      __ragdollDemo?: { status: DemoState; displaced: number; error?: string };
    };
    const report = (s: DemoState, displaced = 0, error?: string) => {
      win.__ragdollDemo = { status: s, displaced, error };
    };
    report("loading");

    async function run() {
      try {
        await ensureRapier();
        if (cancelled) return;
        setNote("Rapier WASM ready — building arena…");

        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.shadowMap.enabled = true;
        mountRef.current!.appendChild(renderer.domElement);

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x0d0d12);
        scene.fog = new THREE.Fog(0x0d0d12, 8, 30);

        const camera = new THREE.PerspectiveCamera(
          42,
          window.innerWidth / window.innerHeight,
          0.1,
          100,
        );
        camera.position.set(2.6, 1.9, 4.4);
        camera.lookAt(0, 1.0, 0);

        scene.add(new THREE.HemisphereLight(0x8899bb, 0x221a12, 0.9));
        const key = new THREE.DirectionalLight(0xfff2e0, 2.2);
        key.position.set(4, 7, 3);
        key.castShadow = true;
        key.shadow.mapSize.set(1024, 1024);
        scene.add(key);
        const rim = new THREE.DirectionalLight(0x66aaff, 0.8);
        rim.position.set(-5, 3, -4);
        scene.add(rim);

        // Physics world + concrete ground slab (CC0 texture wired from asset_fetch.sh)
        physics = new PhysicsWorld();
        physics.addGround(12, 0, 1.0);
        const texLoader = new THREE.TextureLoader();
        const concreteUrl = assetUrl("textures/pbr/concrete_floor_02_1k_Color.jpg");
        const groundMat = new THREE.MeshStandardMaterial({
          color: 0x8a8a8a,
          roughness: 0.95,
          metalness: 0.0,
        });
        texLoader.load(
          concreteUrl,
          (tex) => {
            tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
            tex.repeat.set(6, 6);
            tex.colorSpace = THREE.SRGBColorSpace;
            groundMat.map = tex;
            groundMat.color.set(0xffffff);
            groundMat.needsUpdate = true;
          },
          undefined,
          () => {},
        );
        const ground = new THREE.Mesh(
          new THREE.PlaneGeometry(24, 24),
          groundMat,
        );
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        scene.add(ground);

        // Neon ring posts — AshLane street flavor, doubles as physics props demo
        const postGeo = new THREE.CylinderGeometry(0.06, 0.06, 2.4, 10);
        const postMat = new THREE.MeshStandardMaterial({
          color: 0x111111,
          emissive: 0xff2fd6,
          emissiveIntensity: 1.6,
        });
        for (const [x, z] of [[-3, -3], [3, -3], [-3, 3], [3, 3]] as const) {
          const post = new THREE.Mesh(postGeo, postMat);
          post.position.set(x, 1.2, z);
          scene.add(post);
        }

        // The fighter: CIPHER_rigged.glb — bone-standard reference, real roster model
        setNote("Loading CIPHER (Static) — bone-standard roster model…");
        const gltf = await new GLTFLoader().loadAsync(
          assetUrl("models/cast/CIPHER_rigged.glb"),
        );
        if (cancelled) return;
        const fighter = gltf.scene;
        fighter.traverse((o) => {
          if ((o as THREE.Mesh).isMesh) {
            o.castShadow = true;
            o.frustumCulled = false; // ragdoll moves bones beyond bind bounds
          }
        });
        // Normalize: feet on ground, ~1.8 m tall
        const bbox = new THREE.Box3().setFromObject(fighter);
        const size = bbox.getSize(new THREE.Vector3());
        const s = 1.8 / Math.max(size.y, 0.01);
        fighter.scale.setScalar(s);
        const bbox2 = new THREE.Box3().setFromObject(fighter);
        fighter.position.y -= bbox2.min.y;
        scene.add(fighter);

        ragdoll = HumanoidRagdoll.fromFighter(physics, fighter);
        setStatus("standing");
        setNote("CIPHER standing — KO in 2s…");
        report("standing");
        koAt = performance.now() + 2000;

        koRef.current = () => {
          if (!ragdoll || koAt === 0) return;
          doKO();
        };

        function doKO() {
          if (!ragdoll) return;
          // Punch comes from camera-left, slightly upward — classic KO uppercut line
          ragdoll.knockout(new THREE.Vector3(-0.7, 0.35, 0.6), 7);
          timeScale = 0.22; // KO slow-mo
          setTimeout(() => { timeScale = 1; }, 1100);
          setStatus("ko");
          setNote("K.O.! Rapier ragdoll — click canvas to KO again");
          report("ko", ragdoll.displacementFromRest());
          koAt = -1; // consumed; click re-arms
        }

        const onClick = () => {
          if (!ragdoll || !physics) return;
          // reset: rebuild is cheapest reliable reset for a demo
          ragdoll.dispose(physics);
          ragdoll = HumanoidRagdoll.fromFighter(physics, fighter);
          doKO();
        };
        renderer.domElement.addEventListener("click", onClick);

        const clock = new THREE.Clock();
        let settledReported = false;
        const tick = () => {
          raf = requestAnimationFrame(tick);
          const dt = Math.min(clock.getDelta(), 0.05);
          if (koAt > 0 && performance.now() >= koAt) doKO();
          if (ragdoll && koAt < 0) {
            physics!.step(dt * timeScale);
            ragdoll.sync();
            if (!settledReported && ragdoll.displacementFromRest() > 2.5) {
              settledReported = true;
              setStatus("settled");
              report("settled", ragdoll.displacementFromRest());
            }
          }
          renderer!.render(scene, camera);
        };
        tick();
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        setStatus("error");
        setNote(`Demo failed: ${msg}`);
        report("error", 0, msg);
      }
    }

    run();
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      ragdoll?.dispose(physics!);
      physics?.free();
      renderer?.dispose();
      if (mountRef.current) mountRef.current.innerHTML = "";
    };
  }, []);

  return (
    <div style={{ position: "fixed", inset: 0, background: "#0d0d12" }}>
      <div ref={mountRef} style={{ position: "absolute", inset: 0 }} />
      <div
        style={{
          position: "absolute",
          top: 16,
          left: 16,
          color: "#fff",
          fontFamily: "monospace",
          background: "rgba(0,0,0,0.55)",
          padding: "10px 14px",
          borderRadius: 8,
          maxWidth: 420,
        }}
      >
        <div style={{ fontWeight: "bold", fontSize: 15 }}>
          RAGDOLL KO DEMO — Rapier WASM × Three.js
        </div>
        <div style={{ fontSize: 12, opacity: 0.85, marginTop: 4 }}>{note}</div>
        <div style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>
          status: {status} · click canvas to re-KO
        </div>
        <button
          onClick={() => koRef.current()}
          style={{
            marginTop: 8,
            padding: "6px 14px",
            background: "#ff2fd6",
            color: "#000",
            border: "none",
            borderRadius: 6,
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          KO AGAIN
        </button>
      </div>
      {(status === "ko" || status === "settled") && (
        <div
          style={{
            position: "absolute",
            top: "38%",
            width: "100%",
            textAlign: "center",
            color: "#ff3355",
            fontSize: 84,
            fontWeight: 900,
            fontFamily: "Impact, sans-serif",
            textShadow: "0 0 30px rgba(255,51,85,0.8)",
            pointerEvents: "none",
            letterSpacing: 8,
          }}
        >
          K.O.
        </div>
      )}
    </div>
  );
}
