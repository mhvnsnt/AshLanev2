/**
 * AshLane faction visual identity — SUBTLE markers, Urban Reign style.
 *
 * Owner direction (2026-10-06): do NOT dress all faction members in the same
 * single color. Factions are identified the way Urban Reign does it — each
 * gang is a subculture archetype and members share ONE subtle marker:
 * a patch, an armband, a small color accent, a symbol, a specific accessory.
 * Members look like individuals who happen to share a marker, not a uniform team.
 *
 * Urban Reign reference (research): gangs read as archetypes — bikers, skinhead
 * ex-cons, kung-fu crew, yakuza, karate school — with one shared identifier
 * (a jacket symbol, a bandana worn a specific way). AshLane follows that law.
 */

import type { FactionId } from "../worldgen";

export type FactionMarkerKind =
  | "armband"      // cloth band around upper arm
  | "patch"        // sewn patch on chest/back
  | "bandana"      // worn a faction-specific way
  | "lapel-pin"    // small corporate pin
  | "charm"        // bone/wood charm on a cord
  | "stripe"       // thin stripe on jacket/pants
  | "none";        // unaffiliated / player-neutral

export interface FactionMarker {
  kind: FactionMarkerKind;
  /** small accent color (hex) — used on the marker ONLY, not the outfit */
  accent: number;
  /** secondary color for the marker detail */
  detail: number;
  /** canvas-drawn symbol name for patch/tag rendering */
  symbol: string;
  /** where the marker sits on the body */
  placement: string;
  /** short description of how members wear it */
  wear: string;
}

export interface FactionVisual {
  id: FactionId;
  name: string;
  tagline: string;
  /** colors used ONLY for: tags, UI, marker accent, lighting wash */
  colors: number[];
  marker: FactionMarker;
  /** tag style painted on walls in their turf */
  tagStyle: "burn" | "corporate" | "carved" | "official" | "wildstyle" | "faded";
  /** territory cleanliness 0..1 (1 = pristine, 0 = scorched/ruined) */
  cleanliness: number;
  /** how heavily they tag: 0..1 */
  tagDensity: number;
}

/**
 * Canonical faction visuals. FactionId comes from worldgen.ts; "painted"
 * is carried as existing data (unconfirmed canon — do not present as official).
 */
export const FACTION_VISUALS: Record<FactionId, FactionVisual> = {
  ashes: {
    id: "ashes", name: "The Ashes",
    tagline: "Outcasts and exiles. Burn marks and ash handprints.",
    colors: [0xe4572e, 0x1a1a1a],
    marker: {
      kind: "armband", accent: 0xe4572e, detail: 0x1a1a1a,
      symbol: "ash-hand", placement: "left upper arm",
      wear: "charred cloth armband, scarlet. Each member's clothes are their own — the armband is the only shared piece.",
    },
    tagStyle: "burn", cleanliness: 0.25, tagDensity: 0.9,
  },
  combine: {
    id: "combine", name: "The Combine",
    tagline: "Corporate power. Gold lapel pins, navy accents.",
    colors: [0xd4a017, 0x16283f],
    marker: {
      kind: "lapel-pin", accent: 0xd4a017, detail: 0x16283f,
      symbol: "hex-k", placement: "left lapel",
      wear: "gold hexagonal lapel pin. Members dress corporate-casual or tactical — the pin is the tell.",
    },
    tagStyle: "corporate", cleanliness: 0.95, tagDensity: 0.15,
  },
  hollows: {
    id: "hollows", name: "The Hollows",
    tagline: "They own what's beneath. Bone charms, carved symbols.",
    colors: [0xcc6a1a, 0x0c0c12],
    marker: {
      kind: "charm", accent: 0xcc6a1a, detail: 0xe8d8b0,
      symbol: "spiral-eye", placement: "neck cord",
      wear: "carved bone charm on a cord, orange thread binding. Members dress dark and layered — the charm catches light.",
    },
    tagStyle: "carved", cleanliness: 0.4, tagDensity: 0.6,
  },
  authority: {
    id: "authority", name: "The Authority",
    tagline: "Cold order. Steel-blue stripe, official signage.",
    colors: [0x4a6fa5, 0xe8f0ff],
    marker: {
      kind: "stripe", accent: 0x4a6fa5, detail: 0xe8f0ff,
      symbol: "shield-check", placement: "right shoulder stripe",
      wear: "thin steel-blue shoulder stripe. Members wear uniforms or plainclothes — the stripe is the tell.",
    },
    tagStyle: "official", cleanliness: 1.0, tagDensity: 0.0,
  },
  painted: {
    id: "painted", name: "The Painted",
    tagline: "Wildstyle color. Paint-splatter bandana.",
    colors: [0xff2e88, 0x00e5ff],
    marker: {
      kind: "bandana", accent: 0xff2e88, detail: 0x00e5ff,
      symbol: "splat", placement: "wrist wrap",
      wear: "paint-splatter wrist wrap. Members dress loud and varied — the wrap is the tell.",
    },
    tagStyle: "wildstyle", cleanliness: 0.5, tagDensity: 1.0,
  },
  unaffiliated: {
    id: "unaffiliated", name: "Unaffiliated",
    tagline: "No colors. No marker.",
    colors: [0x9a9a9a],
    marker: {
      kind: "none", accent: 0x9a9a9a, detail: 0x9a9a9a,
      symbol: "", placement: "",
      wear: "No marker. Random faded tags, varied dress.",
    },
    tagStyle: "faded", cleanliness: 0.6, tagDensity: 0.3,
  },
};

/**
 * Draw a faction patch texture (canvas) — sewn patch with the faction symbol.
 * Used on NPC chests; the REST of the outfit stays individual.
 */
export function drawFactionPatch(faction: FactionId, size = 64): string {
  const v = FACTION_VISUALS[faction];
  const hex = (n: number) => "#" + n.toString(16).padStart(6, "0");
  // returns an SVG data-uri so callers can make a CanvasTexture from an Image
  const accent = hex(v.marker.accent), detail = hex(v.marker.detail);
  let glyph = "";
  switch (v.marker.symbol) {
    case "ash-hand": glyph = `<ellipse cx="32" cy="30" rx="10" ry="13" fill="${accent}"/><rect x="22" y="8" width="20" height="18" rx="6" fill="${accent}"/>`; break;
    case "hex-k": glyph = `<polygon points="32,8 52,20 52,44 32,56 12,44 12,20" fill="none" stroke="${accent}" stroke-width="4"/><text x="32" y="42" font-size="22" text-anchor="middle" fill="${accent}" font-family="sans-serif" font-weight="bold">K</text>`; break;
    case "spiral-eye": glyph = `<circle cx="32" cy="32" r="14" fill="none" stroke="${accent}" stroke-width="4"/><circle cx="32" cy="32" r="5" fill="${accent}"/><path d="M32 18 a14 14 0 0 1 12 7" stroke="${detail}" stroke-width="3" fill="none"/>`; break;
    case "shield-check": glyph = `<path d="M32 8 L50 14 V30 C50 44 42 52 32 56 C22 52 14 44 14 30 V14 Z" fill="none" stroke="${accent}" stroke-width="4"/><path d="M25 31 l5 5 10 -11" stroke="${detail}" stroke-width="4" fill="none"/>`; break;
    case "splat": glyph = `<circle cx="32" cy="32" r="12" fill="${accent}"/><circle cx="20" cy="22" r="4" fill="${detail}"/><circle cx="44" cy="40" r="5" fill="${detail}"/><circle cx="40" cy="18" r="3" fill="${accent}"/>`; break;
    default: glyph = `<circle cx="32" cy="32" r="10" fill="${accent}"/>`;
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 64 64"><rect x="4" y="4" width="56" height="56" rx="8" fill="#141416" stroke="${accent}" stroke-width="3"/>${glyph}</svg>`;
  return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
}
