/**
 * lines.ts — THE NARRATOR's dialogue bank.
 *
 * Owner law: he appears SOMETIMES, at curated story-progression moments.
 * Scarcity is the point. Fewer lines, each one carrying weight. No banter,
 * no play-by-play, no roasting every mistake.
 *
 * Voice: cocky, all-knowing, funny. Talks to YOU the player, never the
 * character. He knows he's outside the glass. Aligned with the voice bible
 * (dialogue/voice-bibles.ts, id "__narrator").
 *
 * Voice audio: Bill $aber's voice. The owner may record these himself —
 * DO NOT AI-generate narrator voice lines until he confirms. voice.ts
 * plays owner recordings when present, subtitle-only otherwise.
 */

export type NarratorTrigger =
  | "first_boot" // once ever — the meeting. An event.
  | "act_transition" // moving into a new act (payload: { from, to })
  | "rival_down" // a boss/rival mission cleared (payload: { name })
  | "campaign_complete" // the last paper
  | "level_milestone"; // character progress milestone (payload: { level })

export interface NarratorLine {
  id: string;
  text: string;
  /** rig mood while delivering */
  mood: "talk" | "point" | "shrug" | "facepalm" | "hype" | "idle";
  /** overlay size for this moment */
  size: "corner" | "large";
}

interface LineDef {
  text: string;
  mood?: NarratorLine["mood"];
  size?: NarratorLine["size"];
}

const BANK: Record<NarratorTrigger, LineDef[]> = {
  first_boot: [
    {
      text: "Heheh. You made it. Purple robe — remember that, it's how you know it's me. I watch from outside the glass. This ward? It's mine to narrate. Yours to survive. Let's see who's better at their job, player.",
      mood: "talk",
      size: "large",
    },
  ],

  act_transition: [
    {
      // The hire -> High
      text: "The plaza's done bleeding. Now they want you on the roofs. The Coil doesn't forgive climbers, player — watch your step up there.",
      mood: "point",
      size: "large",
    },
    {
      // High -> Rooms
      text: "Down from the sky, into the rooms where the real paper lives. Everybody in this ward keeps books. You're about to read them.",
      mood: "talk",
      size: "large",
    },
    {
      // Rooms -> Under
      text: "You went under the ward now. It gets dark down here — darker than my face, and that's saying something.",
      mood: "talk",
      size: "large",
    },
    {
      // Under -> Ends
      text: "The tunnel's behind you. What's left are the ends of everything — the yard, the pier, and the names that run them.",
      mood: "point",
      size: "large",
    },
    {
      // Ends -> Both ends
      text: "Both ends now. No more going around it. The ward's been watching you, player. Time to let it see you finish.",
      mood: "hype",
      size: "large",
    },
  ],

  rival_down: [
    {
      text: "That's a name crossed out. The ward felt that one.",
      mood: "talk",
      size: "corner",
    },
    {
      text: "Heheh. Hear that silence? That's what a fallen name sounds like.",
      mood: "shrug",
      size: "corner",
    },
    {
      text: "One less name on the paper. You're writing quite the story down there, player.",
      mood: "point",
      size: "corner",
    },
  ],

  campaign_complete: [
    {
      text: "The last paper. It's done, player. The ward's yours. I'll be watching — the shadows keep receipts.",
      mood: "talk",
      size: "large",
    },
  ],

  level_milestone: [
    {
      text: "Level five. You're not the same hire who walked into the plaza. The ward noticed. So did I.",
      mood: "point",
      size: "corner",
    },
  ],
};

/** Act names in campaign order — index into act_transition lines. */
export const ACT_ORDER = [
  "The hire",
  "High",
  "Rooms",
  "Under",
  "Ends",
  "Both ends",
] as const;

export function lineFor(
  trigger: NarratorTrigger,
  payload?: { from?: string; to?: string; name?: string; level?: number },
): NarratorLine {
  const defs = BANK[trigger];
  let def: LineDef = defs[0];

  if (trigger === "act_transition" && payload?.to) {
    const idx = ACT_ORDER.indexOf(payload.to as (typeof ACT_ORDER)[number]);
    // act_transition lines are keyed by the act being ENTERED (index 1..5 -> defs 0..4)
    if (idx >= 1 && idx - 1 < defs.length) def = defs[idx - 1];
  } else if (trigger === "rival_down" || trigger === "level_milestone") {
    // rotate variants deterministically-ish; scarcity means repeats are rare
    def = defs[Math.floor(Math.random() * defs.length)];
  }

  let text = def.text;
  if (payload?.name) text = text.replace(/\{name\}/g, payload.name);

  return {
    id: `${trigger}-${Date.now()}`,
    text,
    mood: def.mood ?? "talk",
    size: def.size ?? "corner",
  };
}

/** How long a line stays on screen — ~165 wpm reading pace, min 4s, max 12s. */
export function lineDurationMs(text: string): number {
  const words = text.split(/\s+/).length;
  return Math.min(12000, Math.max(4000, (words / 165) * 60000));
}
