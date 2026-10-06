/**
 * cinematics.ts — in-engine cutscene / entrance camera system for AshLane.
 *
 * What it does:
 *   - Shot-based camera direction: each shot = a camera path (CatmullRomCurve3)
 *     + a look-at target path + duration + easing + optional FOV punch.
 *   - A Cinematic plays shots in sequence, drives the game camera, fires
 *     timeline events (lighting changes, animation triggers, letterbox, SFX).
 *   - Letterbox bars + skip prompt handled here (DOM overlay, transform-only).
 *
 * Player-visible uses: block arrivals / roll-ups, KO slow-mo replays, round
 * intros, story-mode cutscenes.
 *
 * Identity note (owner 2026-10-06): AshLane is a street brawler, not a
 * wrestling game. Pre-fight presentation is a STREET arrival — rolling up on
 * a block, turf standoff, crew face-off. Wrestling ring entrances belong
 * ONLY at wrestling-arena locations and in wrestler-character promos
 * (El Toro de Oro, Static, Hollow — wrestling-industry by book canon).
 *
 * Video export (promo videos): pair this with `vfxmajmuni/html-to-video`
 * (MIT) — deterministic frame-by-frame headless Chromium render of any
 * three.js page → MP4. See docs/FREE_APIS_AND_PUBLIC_DOMAIN.md §25.
 *
 * Engine-agnostic by design: depends only on a minimal CameraLike interface,
 * so it works with the real three.js camera or a mock in tests.
 */

export interface Vec3Like {
  x: number;
  y: number;
  z: number;
}

export interface CameraLike {
  position: Vec3Like & {
    set(x: number, y: number, z: number): void;
    lerpVectors(a: Vec3Like, b: Vec3Like, t: number): void;
  };
  lookAt(x: number, y: number, z: number): void;
  fov: number;
  updateProjectionMatrix(): void;
}

/** Easing functions for shot interpolation. */
export const Ease = {
  linear: (t: number) => t,
  inOut: (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),
  out: (t: number) => 1 - Math.pow(1 - t, 3),
  in: (t: number) => t * t * t,
  /** whip-pan: fast start, hard settle */
  whip: (t: number) => 1 - Math.pow(1 - t, 5),
} as const;

export type EasingName = keyof typeof Ease;

export interface Shot {
  /** display name for the director / debug overlay */
  name: string;
  /** camera path control points (world space) */
  camFrom: Vec3Like;
  camTo: Vec3Like;
  /** look-at path control points */
  lookFrom: Vec3Like;
  lookTo: Vec3Like;
  /** seconds */
  duration: number;
  ease?: EasingName;
  /** optional FOV animation: [from, to] */
  fovFrom?: number;
  fovTo?: number;
  /** timeline events: [timeIntoShot, callback] */
  events?: Array<[number, () => void]>;
}

export interface CinematicOptions {
  camera: CameraLike;
  shots: Shot[];
  /** show letterbox bars during playback */
  letterbox?: boolean;
  /** allow skip via Escape / tap */
  skippable?: boolean;
  onShotStart?: (index: number, shot: Shot) => void;
  onComplete?: () => void;
  onSkip?: () => void;
}

const _cam = { x: 0, y: 0, z: 0 };
const _look = { x: 0, y: 0, z: 0 };

function lerp3(
  out: { x: number; y: number; z: number },
  a: Vec3Like,
  b: Vec3Like,
  t: number,
): void {
  out.x = a.x + (b.x - a.x) * t;
  out.y = a.y + (b.y - a.y) * t;
  out.z = a.z + (b.z - a.z) * t;
}

/**
 * Cinematic — plays a shot list. Call update(dt) every frame from the game
 * loop while active. finish() restores control to gameplay.
 */
export class Cinematic {
  private opts: CinematicOptions;
  private shotIndex = 0;
  private timeInShot = 0;
  private firedEvents = new Set<number>();
  private done = false;
  private letterboxEl: HTMLElement | null = null;

  constructor(opts: CinematicOptions) {
    this.opts = opts;
    if (opts.letterbox !== false) this.showLetterbox();
    if (opts.skippable !== false) this.bindSkip();
  }

  get active(): boolean {
    return !this.done;
  }

  get currentShot(): number {
    return this.shotIndex;
  }

  update(dt: number): void {
    if (this.done) return;
    const shots = this.opts.shots;
    if (this.shotIndex >= shots.length) {
      this.finish(false);
      return;
    }
    const shot = shots[this.shotIndex];
    if (this.timeInShot === 0) {
      this.firedEvents.clear();
      this.opts.onShotStart?.(this.shotIndex, shot);
    }
    this.timeInShot += dt;
    const t = Math.min(1, this.timeInShot / shot.duration);
    const e = (Ease[shot.ease ?? "inOut"] as (t: number) => number)(t);

    lerp3(_cam, shot.camFrom, shot.camTo, e);
    lerp3(_look, shot.lookFrom, shot.lookTo, e);
    this.opts.camera.position.set(_cam.x, _cam.y, _cam.z);
    this.opts.camera.lookAt(_look.x, _look.y, _look.z);

    if (shot.fovFrom !== undefined && shot.fovTo !== undefined) {
      this.opts.camera.fov = shot.fovFrom + (shot.fovTo - shot.fovFrom) * e;
      this.opts.camera.updateProjectionMatrix();
    }

    for (let i = 0; i < (shot.events?.length ?? 0); i++) {
      const [at, fn] = shot.events![i];
      if (this.timeInShot >= at && !this.firedEvents.has(i)) {
        this.firedEvents.add(i);
        try {
          fn();
        } catch {
          /* event errors must not kill the cinematic */
        }
      }
    }

    if (t >= 1) {
      this.shotIndex++;
      this.timeInShot = 0;
    }
  }

  skip(): void {
    this.finish(true);
  }

  private finish(skipped: boolean): void {
    if (this.done) return;
    this.done = true;
    this.hideLetterbox();
    this.unbindSkip();
    if (skipped) this.opts.onSkip?.();
    else this.opts.onComplete?.();
  }

  // --- letterbox (transform-only, GPU-composited) ---

  private showLetterbox(): void {
    const top = document.createElement("div");
    top.className = "ashlane-letterbox ashlane-letterbox-top";
    const bottom = document.createElement("div");
    bottom.className = "ashlane-letterbox ashlane-letterbox-bottom";
    const css = document.createElement("style");
    css.textContent = `
      .ashlane-letterbox { position: fixed; left: 0; right: 0; height: 8vh;
        background: #000; z-index: 40; pointer-events: none;
        transition: transform .6s cubic-bezier(.2,.8,.2,1); }
      .ashlane-letterbox-top { top: 0; transform: translateY(-100%); }
      .ashlane-letterbox-bottom { bottom: 0; transform: translateY(100%); }
      .ashlane-letterbox.show-top { transform: translateY(0); }
      .ashlane-letterbox.show-bottom { transform: translateY(0); }
      .ashlane-skip-hint { position: fixed; bottom: 10vh; right: 4vw; z-index: 41;
        color: rgba(255,255,255,.6); font-size: 12px; pointer-events: none; }
    `;
    document.head.appendChild(css);
    document.body.appendChild(top);
    document.body.appendChild(bottom);
    requestAnimationFrame(() => {
      top.classList.add("show-top");
      bottom.classList.add("show-bottom");
    });
    this.letterboxEl = top;
    (this as unknown as { _lbBottom: HTMLElement })._lbBottom = bottom;
    (this as unknown as { _lbCss: HTMLElement })._lbCss = css;

    const hint = document.createElement("div");
    hint.className = "ashlane-skip-hint";
    hint.textContent = "ESC / tap to skip";
    document.body.appendChild(hint);
    (this as unknown as { _lbHint: HTMLElement })._lbHint = hint;
  }

  private hideLetterbox(): void {
    const self = this as unknown as {
      _lbBottom?: HTMLElement;
      _lbCss?: HTMLElement;
      _lbHint?: HTMLElement;
    };
    this.letterboxEl?.classList.remove("show-top");
    self._lbBottom?.classList.remove("show-bottom");
    setTimeout(() => {
      this.letterboxEl?.remove();
      self._lbBottom?.remove();
      self._lbCss?.remove();
      self._lbHint?.remove();
    }, 700);
  }

  private onKey = (e: KeyboardEvent): void => {
    if (e.key === "Escape") this.skip();
  };

  private bindSkip(): void {
    window.addEventListener("keydown", this.onKey);
  }

  private unbindSkip(): void {
    window.removeEventListener("keydown", this.onKey);
  }
}

// ---------------------------------------------------------------------------
// Preset: 50-second street-arrival shot list (matches the promo video pipeline)
// ---------------------------------------------------------------------------

/**
 * Builds a dramatic block-arrival sequence for a fighter standing at `focus`.
 * Total runtime ≈ 50s: dark open (5s) → hero reveal → orbit → close-ups →
 * wide stage → title hold. Pair with the promo-video pipeline's staged
 * arrival: same shots, same timing, in-engine and in-video.
 *
 * This is a STREET arrival (rolling up on the block). A ring-entrance variant
 * for wrestling-arena locations lives with the wrestling presentation kit —
 * never the default.
 */
export function arrivalShots(focus: Vec3Like): Shot[] {
  const f = focus;
  return [
    {
      name: "dark-open",
      camFrom: { x: f.x, y: f.y + 1.6, z: f.z + 9 },
      camTo: { x: f.x, y: f.y + 1.6, z: f.z + 9 },
      lookFrom: { x: f.x, y: f.y + 1.2, z: f.z },
      lookTo: { x: f.x, y: f.y + 1.2, z: f.z },
      duration: 5,
      ease: "linear",
    },
    {
      name: "hero-reveal",
      camFrom: { x: f.x - 4, y: f.y + 0.6, z: f.z + 6 },
      camTo: { x: f.x - 2.5, y: f.y + 1.1, z: f.z + 4 },
      lookFrom: { x: f.x, y: f.y + 0.8, z: f.z },
      lookTo: { x: f.x, y: f.y + 1.4, z: f.z },
      duration: 6,
      ease: "inOut",
      fovFrom: 55,
      fovTo: 40,
    },
    {
      name: "orbit-left",
      camFrom: { x: f.x - 2.5, y: f.y + 1.1, z: f.z + 4 },
      camTo: { x: f.x + 2.5, y: f.y + 1.4, z: f.z + 3 },
      lookFrom: { x: f.x, y: f.y + 1.4, z: f.z },
      lookTo: { x: f.x, y: f.y + 1.2, z: f.z },
      duration: 10,
      ease: "linear",
    },
    {
      name: "face-closeup",
      camFrom: { x: f.x + 1.2, y: f.y + 1.7, z: f.z + 2.2 },
      camTo: { x: f.x + 0.8, y: f.y + 1.65, z: f.z + 1.8 },
      lookFrom: { x: f.x, y: f.y + 1.6, z: f.z },
      lookTo: { x: f.x, y: f.y + 1.55, z: f.z },
      duration: 7,
      ease: "out",
      fovFrom: 40,
      fovTo: 32,
    },
    {
      name: "low-angle-power",
      camFrom: { x: f.x - 1.5, y: f.y + 0.4, z: f.z + 3.5 },
      camTo: { x: f.x - 1.5, y: f.y + 0.9, z: f.z + 3 },
      lookFrom: { x: f.x, y: f.y + 1.0, z: f.z },
      lookTo: { x: f.x, y: f.y + 1.5, z: f.z },
      duration: 8,
      ease: "inOut",
    },
    {
      name: "wide-stage",
      camFrom: { x: f.x - 6, y: f.y + 3, z: f.z + 10 },
      camTo: { x: f.x - 5, y: f.y + 2.5, z: f.z + 8 },
      lookFrom: { x: f.x, y: f.y + 1.0, z: f.z },
      lookTo: { x: f.x, y: f.y + 1.0, z: f.z },
      duration: 9,
      ease: "out",
      fovFrom: 45,
      fovTo: 50,
    },
    {
      name: "title-hold",
      camFrom: { x: f.x, y: f.y + 1.5, z: f.z + 5 },
      camTo: { x: f.x, y: f.y + 1.5, z: f.z + 5 },
      lookFrom: { x: f.x, y: f.y + 1.3, z: f.z },
      lookTo: { x: f.x, y: f.y + 1.3, z: f.z },
      duration: 5,
      ease: "linear",
    },
  ];
}
