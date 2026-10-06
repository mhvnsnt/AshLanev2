/**
 * AshLane PWA intro sequence.
 *
 * Flow: tap-to-start (audio unlock) -> fullscreen intro video -> start screen.
 * Skip: on-screen button, Esc, Enter, or gamepad Start.
 * If the video is missing/unplayable, falls through to the start screen —
 * never a black screen, never a crash.
 *
 * Configure via src/game3d/intro-config.ts. Branch-only until verified.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { INTRO_CONFIG } from "@/game3d/intro-config";
import { unlockMenuAudio, sfxFight } from "@/game3d/menu-sfx";
import { AshlaneLogo } from "@/game3d/menu-icons";
import "@/game3d/intro.css";

type Phase = "tap" | "video" | "done";

export function IntroSequence({ children }: { children: React.ReactNode }) {
  const [phase, setPhase] = useState<Phase>(INTRO_CONFIG.enabled ? "tap" : "done");
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoArmedAt = useRef(0);
  const finish = useCallback(() => setPhase("done"), []);

  const begin = useCallback(() => {
    // User gesture: unlock Web Audio for the video + menu SFX, then roll video.
    unlockMenuAudio();
    try { sfxFight(); } catch { /* SFX is best-effort */ }
    setPhase("video");
  }, []);

  /* ---------- video phase: playback, watchdog, skip inputs ---------- */
  useEffect(() => {
    if (phase !== "video") return;
    videoArmedAt.current = performance.now();
    const video = videoRef.current;

    const play = () => {
      if (!video) return;
      const p = video.play();
      if (p && typeof p.catch === "function") {
        p.catch((err: unknown) => {
          // Autoplay with sound blocked despite the tap: degrade to muted
          // playback rather than stalling. Menu audio stays unlocked.
          if (err instanceof DOMException && err.name === "NotAllowedError") {
            video.muted = true;
            video.play().catch(() => finish());
          } else {
            finish();
          }
        });
      }
    };
    play();

    // Watchdog: missing/slow file with no error event -> don't hold on black.
    const watchdog = window.setTimeout(() => {
      if (video && video.readyState < 2) finish();
    }, INTRO_CONFIG.loadTimeoutMs);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { finish(); return; }
      if (INTRO_CONFIG.skip.keys.includes(e.key)) {
        // Ignore the Enter that started the video (key held from tap screen).
        if (performance.now() - videoArmedAt.current > 800) finish();
      }
    };
    window.addEventListener("keydown", onKey);

    // Gamepad Start button skips.
    let raf = 0;
    const pollPad = () => {
      try {
        const pads = navigator.getGamepads ? navigator.getGamepads() : [];
        for (const pad of pads) {
          if (pad?.buttons[INTRO_CONFIG.skip.gamepadStartButton]?.pressed) { finish(); return; }
        }
      } catch { /* gamepad API unavailable */ }
      raf = requestAnimationFrame(pollPad);
    };
    raf = requestAnimationFrame(pollPad);

    return () => {
      window.clearTimeout(watchdog);
      window.removeEventListener("keydown", onKey);
      cancelAnimationFrame(raf);
    };
  }, [phase, finish]);

  /* ---------- tap phase: gamepad Start also starts ---------- */
  useEffect(() => {
    if (phase !== "tap") return;
    let raf = 0;
    const pollPad = () => {
      try {
        const pads = navigator.getGamepads ? navigator.getGamepads() : [];
        for (const pad of pads) {
          if (pad?.buttons[INTRO_CONFIG.skip.gamepadStartButton]?.pressed) { begin(); return; }
        }
      } catch { /* gamepad API unavailable */ }
      raf = requestAnimationFrame(pollPad);
    };
    raf = requestAnimationFrame(pollPad);
    return () => cancelAnimationFrame(raf);
  }, [phase, begin]);

  if (phase === "done") return <>{children}</>;

  return (
    <div className="al-intro" data-phase={phase}>
      {phase === "tap" && (
        <button
          type="button"
          className="al-intro-tap"
          onClick={begin}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") begin(); }}
          aria-label="Tap to start Ashlane"
        >
          <AshlaneLogo className="al-intro-logo" />
          <div className="al-intro-tagline">CONCRETE JUNGLE</div>
          <div className="al-intro-tap-hint">TAP TO START</div>
          <div className="al-intro-sub">
            Best with sound on. An intro video plays — skip anytime.
          </div>
        </button>
      )}
      {phase === "video" && (
        <div className="al-intro-video-wrap">
          <video
            ref={videoRef}
            className="al-intro-video"
            src={INTRO_CONFIG.videoSrc}
            playsInline
            preload="auto"
            disablePictureInPicture
            onEnded={finish}
            onError={finish}
            aria-label="Ashlane intro video"
          />
          {INTRO_CONFIG.skip.showButton && (
            <button type="button" className="al-intro-skip" onClick={finish}>
              {INTRO_CONFIG.skip.buttonLabel} &rsaquo;
            </button>
          )}
          <div className="al-intro-skip-hint">Esc / Enter to skip</div>
        </div>
      )}
    </div>
  );
}
