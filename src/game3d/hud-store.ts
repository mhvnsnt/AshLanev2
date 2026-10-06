/**
 * hud-store.ts — the React ↔ three.js bridge for AshLane's HUD.
 *
 * Pattern (open-source standard): the three.js engine lives OUTSIDE React's
 * render cycle. It writes to this zustand store (MIT, already a dependency)
 * only when values CHANGE. HUD components subscribe to slices and re-render
 * only on change — zero per-frame React work.
 *
 * Mobile perf rules:
 *   - engine pushes events (hit(), setHp()), never per-frame setState
 *   - timer display throttled to 1 Hz (sim keeps 60 Hz internally)
 *   - CSS animates width/opacity/transform only (GPU-composited, no reflow)
 *
 * Engine usage (from three.js hit handler):
 *   import { useHud } from "./hud-store";
 *   useHud.getState().hit(12, screenX, screenY);  // HP, combo, damage number
 *   useHud.getState().setTimeLeft(87.4);          // throttled display
 */
import { create } from "zustand";

export interface DamageEvent {
  id: number;
  amount: number;
  /** screen-space coords (px) for DOM damage numbers */
  x: number;
  y: number;
  key: number;
}

interface HudState {
  hp: number;
  maxHp: number;
  enemyHp: number;
  enemyMaxHp: number;
  combo: number;
  timeLeft: number;
  round: number;
  damageEvents: DamageEvent[];
  setHp: (hp: number) => void;
  setEnemyHp: (hp: number) => void;
  hit: (amount: number, screenX: number, screenY: number) => void;
  enemyHit: (amount: number, screenX: number, screenY: number) => void;
  setTimeLeft: (t: number) => void;
  setRound: (r: number) => void;
  reset: () => void;
}

let dmgId = 0;
const MAX_DAMAGE_EVENTS = 24;

const initial = {
  hp: 100,
  maxHp: 100,
  enemyHp: 100,
  enemyMaxHp: 100,
  combo: 0,
  timeLeft: 99,
  round: 1,
  damageEvents: [] as DamageEvent[],
};

export const useHud = create<HudState>()((set) => ({
  ...initial,

  setHp: (hp) => set({ hp: Math.max(0, Math.min(initial.maxHp, hp)) }),
  setEnemyHp: (hp) => set({ enemyHp: Math.max(0, Math.min(initial.maxHp, hp)) }),

  hit: (amount, x, y) =>
    set((s) => ({
      hp: Math.max(0, s.hp - amount),
      combo: s.combo + 1,
      damageEvents: [
        ...s.damageEvents.slice(-(MAX_DAMAGE_EVENTS - 1)),
        { id: dmgId++, amount, x, y, key: Date.now() },
      ],
    })),

  enemyHit: (amount, x, y) =>
    set((s) => ({
      enemyHp: Math.max(0, s.enemyHp - amount),
      combo: s.combo + 1,
      damageEvents: [
        ...s.damageEvents.slice(-(MAX_DAMAGE_EVENTS - 1)),
        { id: dmgId++, amount, x, y, key: Date.now() },
      ],
    })),

  // 1 Hz display throttle — the sim runs at 60 Hz, the HUD doesn't need to.
  setTimeLeft: (t) =>
    set((s) =>
      Math.floor(s.timeLeft) !== Math.floor(t) ? { timeLeft: t } : s,
    ),

  setRound: (round) => set({ round }),
  reset: () => set({ ...initial, damageEvents: [] }),
}));

/**
 * Project a 3D world position to screen pixels for DOM damage numbers.
 * Call from the three.js hit handler; feed the result into hit()/enemyHit().
 */
export function worldToScreen(
  world: { x: number; y: number; z: number },
  camera: { project: (v: { x: number; y: number; z: number }) => void },
  out: { x: number; y: number; z: number },
): { x: number; y: number } {
  out.x = world.x;
  out.y = world.y;
  out.z = world.z;
  camera.project(out);
  return {
    x: (out.x * 0.5 + 0.5) * window.innerWidth,
    y: (-out.y * 0.5 + 0.5) * window.innerHeight,
  };
}
