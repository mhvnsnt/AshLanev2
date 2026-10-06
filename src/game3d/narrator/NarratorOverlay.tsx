/**
 * NarratorOverlay.tsx — THE NARRATOR's 4th-wall stage.
 *
 * He is rendered as an overlay ABOVE the game (own three.js canvas, own
 * scene), never inside the 3D world. Picture-in-picture:
 *   - corner: bottom-right bubble (~200px) for lighter story beats
 *   - large:  centered stage (~380px) for events — first meeting, act turns
 *
 * He floats in his own void with a purple aura. Subtitles carry his words
 * until the owner records (or approves synthesizing) the Bill $aber voice.
 * Click him to dismiss. He never blocks game input (pointer-events: none
 * except his own frame).
 */

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useNarrator } from "./narrator-store";
import { buildNarrator, createNarratorScene, type NarratorRig } from "./model";
import { speakNarrator, stopNarratorVoice } from "./voice";
import { lineDurationMs } from "./lines";

export function NarratorOverlay() {
  const active = useNarrator((s) => s.active);
  const dismiss = useNarrator((s) => s.dismiss);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rigRef = useRef<NarratorRig | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<ReturnType<typeof createNarratorScene> | null>(null);
  const rafRef = useRef(0);
  const activeIdRef = useRef<string | null>(null);

  // --- three.js stage: built once, reused across appearances ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setClearColor(0x000000, 0);
    const { scene, camera, aura } = createNarratorScene();
    const rig = buildNarrator();
    scene.add(rig.group);
    rendererRef.current = renderer;
    sceneRef.current = { scene, camera, aura };
    rigRef.current = rig;

    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const t = now / 1000;
      rig.update(dt, t);
      // aura breathes with him
      const s = 1 + Math.sin(t * 1.25) * 0.06;
      aura.scale.setScalar(s);
      (aura.material as THREE.MeshBasicMaterial).opacity =
        0.16 + Math.sin(t * 1.25) * 0.05;
      renderer.render(scene, camera);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    const onResize = () => {
      const w = canvas.clientWidth || 200;
      const h = canvas.clientHeight || 200;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(rafRef.current);
      rig.dispose();
      renderer.dispose();
    };
  }, []);

  // --- appearance lifecycle: appear -> talk -> auto-dismiss ---
  useEffect(() => {
    const rig = rigRef.current;
    if (!rig) return;
    if (!active) {
      activeIdRef.current = null;
      stopNarratorVoice();
      return;
    }
    if (activeIdRef.current === active.id) return; // already playing this one
    activeIdRef.current = active.id;
    const line = active.line;

    let cancelled = false;
    rig.setMood("appear");
    // he rises, then talks — the grill moves while the line is up
    const talkTimer = setTimeout(() => {
      if (!cancelled) {
        rig.setMood(line.mood === "talk" ? "talk" : line.mood);
        rig.talkAmount = 1;
      }
    }, 900);

    void speakNarrator(line.id, line.text).then(({ durationMs }) => {
      if (cancelled) return;
      const ms = durationMs > 0 ? durationMs : lineDurationMs(line.text);
      setTimeout(() => {
        if (!cancelled) {
          rig.talkAmount = 0;
          rig.setMood("hide");
          setTimeout(() => {
            if (!cancelled) dismiss();
          }, 700);
        }
      }, ms);
    });

    return () => {
      cancelled = true;
      clearTimeout(talkTimer);
      stopNarratorVoice();
      rig.talkAmount = 0;
    };
  }, [active, dismiss]);

  // keep the canvas hidden until the first appearance (no empty stage)
  const [everShown, setEverShown] = useState(false);
  useEffect(() => {
    if (active) setEverShown(true);
  }, [active]);
  if (!everShown && !active) return null;

  const large = active?.line.size === "large";

  return (
    <div
      className={`narrator-stage ${large ? "narrator-large" : "narrator-corner"} ${active ? "is-live" : "is-gone"}`}
      aria-hidden={!active}
    >
      <div className="narrator-frame" onClick={() => dismiss()}>
        <canvas ref={canvasRef} className="narrator-canvas" />
        <p className="narrator-name">The Narrator</p>
      </div>
      {active ? (
        <p className="narrator-line" onClick={() => dismiss()}>
          {active.line.text}
        </p>
      ) : null}
      <style>{`
        .narrator-stage {
          position: absolute; z-index: 60; pointer-events: none;
          transition: opacity .45s ease, transform .45s ease;
          font-family: var(--font-display, inherit);
        }
        .narrator-corner { right: 14px; bottom: 86px; width: 200px; }
        .narrator-large {
          left: 50%; bottom: 96px; width: min(400px, 86vw);
          transform: translateX(-50%);
        }
        .narrator-stage.is-gone { opacity: 0; transform: translateY(24px); }
        .narrator-large.is-gone { transform: translateX(-50%) translateY(24px); }
        .narrator-frame {
          position: relative; pointer-events: auto; cursor: pointer;
          border: 1px solid rgba(154, 92, 255, .55);
          border-radius: 14px;
          background: radial-gradient(120% 100% at 50% 0%, rgba(75,26,125,.55), rgba(8,4,16,.88));
          box-shadow: 0 0 34px rgba(122, 60, 255, .35), inset 0 0 24px rgba(75,26,125,.35);
          overflow: hidden;
        }
        .narrator-canvas { display: block; width: 100%; aspect-ratio: 1; }
        .narrator-name {
          position: absolute; top: 8px; left: 0; right: 0; text-align: center;
          font-size: 10px; letter-spacing: .32em; text-transform: uppercase;
          color: #d9a441; text-shadow: 0 0 12px rgba(217,164,65,.6);
          margin: 0;
        }
        .narrator-line {
          pointer-events: auto; cursor: pointer; margin: 10px 2px 0;
          padding: 10px 14px; font-size: 14px; line-height: 1.5; color: #f2ead9;
          background: rgba(10, 6, 18, .88);
          border-left: 3px solid #9a5cff; border-radius: 0 10px 10px 0;
          box-shadow: 0 6px 24px rgba(0,0,0,.5);
        }
      `}</style>
    </div>
  );
}
