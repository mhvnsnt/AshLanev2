/**
 * director.ts — THE NARRATOR's appearance director.
 *
 * Watches story/campaign state (NOT moment-to-moment gameplay) and decides
 * when he breaks the 4th wall. Owner law: scarcity is the point. He shows up
 * at curated story-progression moments:
 *
 *   1. first_boot      — once ever. The meeting. An event.
 *   2. act_transition  — the campaign moves into a new act (6 acts total).
 *   3. rival_down      — a boss/rival mission is cleared.
 *   4. campaign_complete — the last paper.
 *   5. level_milestone — first time the player's fighter hits level 5.
 *
 * That's ~12 appearances across a full playthrough. When he appears, the
 * player knows something important happened. No mid-match play-by-play,
 * no constant banter — ever.
 *
 * Usage (React): call watch(hud) inside a useEffect on every hud snapshot.
 * The director is idempotent: repeated snapshots with no state change do nothing.
 */

import { MISSIONS, missionAt } from "../campaign";
import { lineFor, type NarratorTrigger } from "./lines";
import {
  useNarrator,
  hasMetNarrator,
  markMetNarrator,
} from "./narrator-store";

/** Minimum seconds between appearances — scarcity enforcement. */
const COOLDOWN_S = 120;
/** Level that counts as a "character progress milestone". */
const MILESTONE_LEVEL = 5;

/** Minimal hud shape the director needs (subset of the sim snapshot). */
export interface NarratorHud {
  running: boolean;
  paused: boolean;
  story: boolean;
  mission: number;
  actName: string;
  missionClear: boolean;
  clearedMission: number;
  level: number;
}

interface DirectorMemory {
  prevAct: string | null;
  prevMissionClear: boolean;
  prevLevel: number;
  lastAppearanceAt: number;
  booted: boolean;
}

const mem: DirectorMemory = {
  prevAct: null,
  prevMissionClear: false,
  prevLevel: 1,
  lastAppearanceAt: 0,
  booted: false,
};

function cooledDown(): boolean {
  return Date.now() - mem.lastAppearanceAt >= COOLDOWN_S * 1000;
}

function fire(trigger: NarratorTrigger, payload?: { from?: string; to?: string; name?: string; level?: number }) {
  if (!cooledDown()) return; // scarcity: the moment waits its turn, then passes
  mem.lastAppearanceAt = Date.now();
  useNarrator.getState().appear(lineFor(trigger, payload));
}

function bossName(missionIdx: number): string {
  try {
    const m = missionAt(missionIdx);
    return m.boss ? m.title : "";
  } catch {
    return "";
  }
}

/**
 * Observe one hud snapshot. Call on every snapshot push from the engine.
 * Safe to call with partial/duplicate data — only real transitions fire.
 */
export function watchNarrator(hud: NarratorHud): void {
  // --- 1. first boot: the meeting (menu only, once ever) ---
  if (!mem.booted) {
    mem.booted = true;
    if (!hasMetNarrator() && !hud.running) {
      // small delay so the menu lands first — he arrives, he doesn't ambush
      setTimeout(() => {
        if (!hasMetNarrator()) {
          markMetNarrator();
          fire("first_boot");
        }
      }, 2500);
    }
  }

  // --- 2. act transitions (story mode, act name changed) ---
  if (hud.story && hud.actName) {
    if (mem.prevAct !== null && mem.prevAct !== hud.actName) {
      fire("act_transition", { from: mem.prevAct, to: hud.actName });
    }
    mem.prevAct = hud.actName;
  } else if (!hud.story) {
    mem.prevAct = null;
  }

  // --- 3 & 4. mission clear: rival down, or the whole campaign ---
  if (hud.missionClear && !mem.prevMissionClear) {
    const idx = hud.mission;
    if (idx >= MISSIONS.length - 1) {
      fire("campaign_complete");
    } else if (bossName(idx)) {
      fire("rival_down", { name: bossName(idx) });
    }
  }
  mem.prevMissionClear = hud.missionClear;

  // --- 5. character milestone: first time hitting level 5 ---
  if (hud.level >= MILESTONE_LEVEL && mem.prevLevel < MILESTONE_LEVEL) {
    fire("level_milestone", { level: hud.level });
  }
  mem.prevLevel = hud.level;
}

/** Reset director memory (tests, or a fresh campaign run). */
export function resetNarratorDirector(): void {
  mem.prevAct = null;
  mem.prevMissionClear = false;
  mem.prevLevel = 1;
  mem.lastAppearanceAt = 0;
  mem.booted = false;
}
