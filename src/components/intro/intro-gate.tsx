/* IntroGate — tap-to-start -> intro video -> game.
 *
 * Wraps the whole app at the route level so menu work inside AshlaneApp
 * is untouched. Every path ends at the game: a missing or unplayable
 * video falls straight through, never a black screen.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { INTRO_CONFIG } from "./intro-config";
import { introNext, type IntroState } from "./intro-machine";
import "./intro-gate.css";

async function probeVideo(src: string, timeoutMs: number): Promise<boolean> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    // HEAD first; some static hosts reject HEAD, so fall back to a 1-byte range GET.
    let res = await fetch(src, { method: "HEAD", signal: ctrl.signal });
    if (!res.ok && (res.status === 405 || res.status === 501)) {
      res = await fetch(src, {
        headers: { Range: "bytes=0-0" },
        signal: ctrl.signal,
      });
    }
    return res.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

export function IntroGate({ children }: { children: React.ReactNode }) {
  const [phase, setPhase] = useState<IntroState>("tap");
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  const advance = useCallback(
    (event: Parameters<typeof introNext>[1]) => {
      setPhase((p) => introNext(p, event));
    },
    []
  );

  // After tap: probe sources in order, first reachable wins.
  useEffect(() => {
    if (phase !== "checking") return;
    let cancelled = false;
    (async () => {
      for (const src of INTRO_CONFIG.sources) {
        if (cancelled) return;
        if (await probeVideo(src, INTRO_CONFIG.probeTimeoutMs)) {
          if (cancelled) return;
          setVideoSrc(src);
          advance({ type: "VIDEO_FOUND" });
          return;
        }
      }
      if (!cancelled) advance({ type: "VIDEO_MISSING" });
    })();
    return () => {
      cancelled = true;
    };
  }, [phase, advance]);

  // Skip controls while the video plays: click button, keyboard, gamepad Start.
  useEffect(() => {
    if (phase !== "video") return;
    const onKey = (e: KeyboardEvent) => {
      if (INTRO_CONFIG.skipKeys.includes(e.key)) {
        e.preventDefault();
        advance({ type: "SKIP" });
      }
    };
    window.addEventListener("keydown", onKey);

    let raf = 0;
    let wasPressed = false;
    const pollGamepad = () => {
      try {
        const pads = navigator.getGamepads ? navigator.getGamepads() : [];
        for (const pad of pads) {
          const btn = pad?.buttons?.[INTRO_CONFIG.gamepadSkipButton];
          if (btn?.pressed && !wasPressed) {
            wasPressed = true;
            advance({ type: "SKIP" });
            break;
          }
          if (!btn?.pressed) wasPressed = false;
        }
      } catch {
        /* gamepad API unavailable — keyboard/click still work */
      }
      if (phaseRef.current === "video") raf = requestAnimationFrame(pollGamepad);
    };
    raf = requestAnimationFrame(pollGamepad);

    return () => {
      window.removeEventListener("keydown", onKey);
      cancelAnimationFrame(raf);
    };
  }, [phase, advance]);

  // Autoplay once the video element mounts (tap was the user gesture).
  useEffect(() => {
    if (phase !== "video" || !videoSrc) return;
    const v = videoRef.current;
    if (!v) return;
    const p = v.play();
    if (p && typeof p.catch === "function") {
      p.catch(() => {
        // Autoplay with sound blocked: fall back to muted rather than stalling.
        v.muted = true;
        v.play().catch(() => advance({ type: "VIDEO_ERROR" }));
      });
    }
  }, [phase, videoSrc, advance]);

  if (phase === "app") return <>{children}</>;

  if (phase === "video" && videoSrc) {
    return (
      <div className="intro-gate" data-phase="video">
        <video
          ref={videoRef}
          className="intro-gate-video"
          src={videoSrc}
          playsInline
          preload="auto"
          onEnded={() => advance({ type: "VIDEO_ENDED" })}
          onError={() => advance({ type: "VIDEO_ERROR" })}
        />
        <button
          className="intro-gate-skip"
          onClick={() => advance({ type: "SKIP" })}
          aria-label="Skip intro"
        >
          SKIP
        </button>
      </div>
    );
  }

  // "tap" and "checking" share the gate screen; checking shows a loader.
  return (
    <div
      className="intro-gate"
      data-phase={phase}
      onClick={() => {
        if (phaseRef.current === "tap") advance({ type: "TAP" });
      }}
      onKeyDown={(e) => {
        if (phaseRef.current === "tap" && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          advance({ type: "TAP" });
        }
      }}
      role="button"
      tabIndex={0}
      aria-label="Tap to start"
    >
      <div className="intro-gate-inner">
        <div className="intro-gate-title">ASHLANE</div>
        <div className="intro-gate-tag">CONCRETE JUNGLE</div>
        {phase === "tap" ? (
          <div className="intro-gate-prompt">TAP TO START</div>
        ) : (
          <div className="intro-gate-prompt intro-gate-loading">LOADING…</div>
        )}
      </div>
    </div>
  );
}
