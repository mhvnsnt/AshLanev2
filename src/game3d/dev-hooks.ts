/**
 * dev-hooks.ts — DEV-ONLY control surface for agents and the playtest harness.
 *
 * Installs `window.__ashlane`: a stable, documented API that lets an external
 * driver (Playwright, a human with devtools, a CI smoke test) command the
 * game without clicking through menus:
 *   - boot into a bout / story directly (`startBout`, `startStory`, `?autostart=`)
 *   - read full sim state (`snapshot`, `fighters`)
 *   - inject input (`setStick`, `setBtn`, `press`, `setKeys`)
 *   - swap fighters / attires / stages (`setWho`, `setAttire`, `setStage`, ...)
 *   - move the camera (`camera`) and teleport bodies for test setups
 *
 * GUARDS (never shipped to players):
 *   - Installed ONLY when `import.meta.env.DEV` is true OR the URL carries
 *     `?debug=1`. Production builds get zero surface — `window.__ashlane`
 *     stays undefined.
 *   - URL params (`?autostart=`, `?stage=`, `?who=`) are read ONLY through this
 *     module, never in game logic.
 *
 * Docs: tools/hands/CONTROL_SURFACE.md
 */
import type { Handle } from "./mount";
import { snapshot, type Body, type Sim } from "./sim";
import { ROSTER } from "./roster";

export type AshlaneHooks = {
  /** "dev-hooks/<date>" — lets drivers assert which surface version they got. */
  version: string;
  enabled: boolean;
  /** Raw HUD snapshot (mode, hp, meter, combo, foes, banner, ...). */
  snapshot: () => ReturnType<typeof snapshot>;
  /** All sim bodies: id, kind, name, x/y/z, hp, state, yaw. */
  fighters: () => Array<{
    id: number; kind: Body["kind"]; name: string;
    x: number; y: number; z: number; yaw: number;
    hp: number; maxHp: number; state: string; stateT: number;
  }>;
  /** Roster ids + display names the driver can pick via setWho(). */
  roster: () => Array<{ id: string; name: string }>;
  /** Boot helpers — same calls the menu buttons make. */
  start: (mode: "roam" | "belt" | "platform") => void;
  startBout: (kind: "exhibit" | "practice", stage: string) => void;
  startStory: (index: number) => void;
  rematch: () => void;
  quit: () => void;
  pause: (paused: boolean) => void;
  focus: (mode: "roam" | "belt" | "platform") => void;
  /** Input injection. press() = down then up 80ms later (edge-triggered moves). */
  setStick: (x: number, y: number) => void;
  setBtn: (name: "attack" | "grab" | "blast" | "jump" | "dash" | "use", down: boolean) => void;
  press: (name: "attack" | "grab" | "blast" | "jump" | "dash" | "use") => void;
  setKeys: (codes: string[]) => void;
  /** Character / loadout / stage swaps. */
  setWho: (id: string) => void;
  setAttire: (file: string) => void;
  setStage: (id: string) => void;
  setCrowd: (id: "mix" | "chibi" | "full") => void;
  setBuild: (id: "chibi" | "full") => void;
  setMartial: (id: string) => void;
  setStyle: (id: string) => void;
  setStance: (id: string) => void;
  setShape: (p: { height?: number; bulk?: number; head?: number; leg?: number; shoulder?: number }) => void;
  tune: (p: Partial<import("./spec").Tune>) => void;
  /** Camera: yaw rotates the follow cam (roam uses sim.orbit). */
  camera: (yaw: number) => void;
  /** Test setup: move a body to an absolute position. */
  teleport: (bodyIndex: number, x: number, z: number) => void;
  /** Parsed URL params, for drivers that want to echo what booted. */
  params: () => Record<string, string>;
};

const VERSION = "dev-hooks/2026-10-06";

declare global {
  interface Window {
    __ashlane?: AshlaneHooks;
  }
}

export function devHooksEnabled(): boolean {
  try {
    const q = new URLSearchParams(location.search);
    if (q.get("debug") === "1") return true;
  } catch {}
  try {
    return import.meta.env.DEV === true;
  } catch {
    return false;
  }
}

/** Read the automation URL params this module honours. */
export function readHookParams(): Record<string, string> {
  const out: Record<string, string> = {};
  try {
    const q = new URLSearchParams(location.search);
    for (const key of ["autostart", "kind", "stage", "who", "index", "debug"]) {
      const v = q.get(key);
      if (v !== null) out[key] = v;
    }
  } catch {}
  return out;
}

/**
 * Install `window.__ashlane`. Call once from mount() after the Handle exists.
 * Applies `?autostart=` params (bout/story) after a short settle delay so the
 * app's own mount effect has finished.
 */
export function installDevHooks(sim: Sim, handle: Handle): void {
  if (!devHooksEnabled()) return;
  if (typeof window === "undefined") return;

  const hooks: AshlaneHooks = {
    version: VERSION,
    enabled: true,
    snapshot: () => snapshot(sim),
    fighters: () =>
      sim.bodies.map((b) => ({
        id: b.id, kind: b.kind, name: b.name,
        x: +b.x.toFixed(3), y: +b.y.toFixed(3), z: +b.z.toFixed(3),
        yaw: +b.yaw.toFixed(4),
        hp: Math.round(b.hp), maxHp: b.maxHp, state: String(b.state), stateT: +b.stateT.toFixed(3),
      })),
    roster: () => ROSTER.map((r) => ({ id: r.id, name: r.name })),
    start: (mode) => handle.start(mode),
    startBout: (kind, stage) => handle.startBout(kind, stage),
    startStory: (index) => handle.startStory(index),
    rematch: () => handle.rematch(),
    quit: () => handle.quit(),
    pause: (paused) => handle.pause(paused),
    focus: (mode) => handle.focus(mode),
    setStick: (x, y) => handle.setStick(x, y),
    setBtn: (name, down) => handle.setBtn(name, down),
    press: (name) => {
      handle.setBtn(name, true);
      setTimeout(() => handle.setBtn(name, false), 80);
    },
    setKeys: (codes) => {
      // Mirror window.__controlsTest.setKeys — same key-set the pump loop reads.
      window.__controlsTest?.setKeys(codes);
    },
    setWho: (id) => {
      // Strict validation: the engine's fighterById() silently falls back to
      // ROSTER[0] on unknown ids, which would mislead a driver. Fail loud.
      if (!ROSTER.some((r) => r.id === id)) {
        throw new Error(`setWho: unknown fighter id "${id}" (see __ashlane.roster())`);
      }
      handle.setWho(id);
    },
    setAttire: (file) => handle.setAttire(file),
    setStage: (id) => handle.setStage(id),
    setCrowd: (id) => handle.setCrowd(id),
    setBuild: (id) => handle.setBuild(id),
    setMartial: (id) => handle.setMartial(id),
    setStyle: (id) => handle.setStyle(id),
    setStance: (id) => handle.setStance(id),
    setShape: (p) => handle.setShape(p),
    tune: (p) => handle.tune(p),
    camera: (yaw) => {
      sim.orbit = yaw;
      sim.camYaw = yaw;
    },
    teleport: (bodyIndex, x, z) => {
      const b = sim.bodies[bodyIndex];
      if (!b) throw new Error(`teleport: no body at index ${bodyIndex}`);
      b.x = x; b.z = z; b.vx = 0; b.vz = 0;
    },
    params: () => readHookParams(),
  };

  window.__ashlane = hooks;

  // URL-driven boot for headless playtests: ?autostart=bout&kind=exhibit&stage=ward
  const p = readHookParams();
  if (p.autostart === "bout" || p.autostart === "story") {
    const who = p.who;
    const apply = () => {
      try {
        if (who) handle.setWho(who);
        if (p.autostart === "bout") handle.startBout((p.kind as "exhibit" | "practice") || "exhibit", p.stage || "ward");
        else handle.startStory(parseInt(p.index || "0", 10) || 0);
      } catch (e) {
        console.error("[dev-hooks] autostart failed:", e);
      }
    };
    // Let React finish mounting before we drive it.
    setTimeout(apply, 1200);
  }
}
