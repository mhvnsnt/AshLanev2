/**
 * narrator — THE NARRATOR, AshLane's 4th-wall-breaking mascot.
 *
 * A Shadow Wizard Money Gang wizard in a PURPLE robe who exists OUTSIDE the
 * game world and talks to the PLAYER, never the character. He appears SOMETIMES
 * at curated story-progression moments (owner law: scarcity is the point).
 *
 * Modules:
 *   model.ts           — procedural three.js wizard + animation rig
 *   lines.ts           — story-moment dialogue bank (few lines, weighty)
 *   narrator-store.ts  — zustand presence store (same pattern as hud-store)
 *   director.ts        — watches story/campaign state, fires appearances
 *   voice.ts           — Bill $aber voice plumbing (owner recordings;
 *                        NO AI synthesis until the owner confirms)
 *   NarratorOverlay.tsx — picture-in-picture 4th-wall stage (React)
 *
 * Canon: purple robe = The Narrator (outside fiction).
 *        RED robe = "Ashes"/Buffalo Bill (in-world). Never mix.
 *
 * Quick use (in AshlaneApp):
 *   import { NarratorOverlay, watchNarrator } from "@/game3d/narrator";
 *   useEffect(() => { watchNarrator(hud); }, [hud]);
 *   <NarratorOverlay />
 */

export { buildNarrator, createNarratorScene } from "./model";
export type { NarratorRig, NarratorMood } from "./model";

export { lineFor, lineDurationMs, ACT_ORDER } from "./lines";
export type { NarratorTrigger, NarratorLine } from "./lines";

export { useNarrator, hasMetNarrator, markMetNarrator } from "./narrator-store";
export type { NarratorAppearance } from "./narrator-store";

export { watchNarrator, resetNarratorDirector } from "./director";
export type { NarratorHud } from "./director";

export { speakNarrator, stopNarratorVoice } from "./voice";

export { NarratorOverlay } from "./NarratorOverlay";
