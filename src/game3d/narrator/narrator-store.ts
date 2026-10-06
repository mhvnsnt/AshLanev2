/**
 * narrator-store.ts — zustand store for THE NARRATOR's on-screen presence.
 *
 * Same pattern as hud-store: the engine/director writes only when something
 * changes; the overlay subscribes and renders. Zero per-frame React work.
 *
 * Owner law: appearances are EVENTS, not ambience. The director enforces
 * scarcity (cooldowns, one at a time, small queue). The store just holds
 * what's currently showing.
 */

import { create } from "zustand";
import type { NarratorLine } from "./lines";

export interface NarratorAppearance {
  id: string;
  line: NarratorLine;
  at: number;
}

interface NarratorState {
  active: NarratorAppearance | null;
  queued: NarratorAppearance | null;
  /** show a line now, or queue it if one is already showing (max 1 queued) */
  appear: (line: NarratorLine) => void;
  /** clear the current appearance; promotes the queued one if present */
  dismiss: () => void;
  /** hard clear — used on unmount */
  reset: () => void;
}

export const useNarrator = create<NarratorState>()((set) => ({
  active: null,
  queued: null,

  appear: (line) =>
    set((s) => {
      const app: NarratorAppearance = { id: line.id, line, at: Date.now() };
      if (s.active) return { queued: app }; // scarcity: never stack, never interrupt
      return { active: app };
    }),

  dismiss: () =>
    set((s) => ({
      active: s.queued,
      queued: null,
    })),

  reset: () => set({ active: null, queued: null }),
}));

/** localStorage flags — the meeting happens once, ever. */
const MET_KEY = "al_narrator_met_v1";

export function hasMetNarrator(): boolean {
  try {
    return localStorage.getItem(MET_KEY) === "1";
  } catch {
    return false;
  }
}

export function markMetNarrator(): void {
  try {
    localStorage.setItem(MET_KEY, "1");
  } catch {
    /* private mode — he'll just introduce himself again. He'll pretend it's the first time. */
  }
}
