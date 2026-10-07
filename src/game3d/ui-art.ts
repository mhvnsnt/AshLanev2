/**
 * AshLane UI art manifest — every usable menu/HUD/game asset, wired.
 *
 * Sources: ~/workspace/ashlane-art/menu-kit/ (sliced into public/ui/)
 * and ~/workspace/ashlane-art/faction-emblems/ (sliced into public/emblems/).
 * Slicing scripts: ~/workspace/art-wiring/slice-emblems.py, slice-ui.py.
 *
 * Concept art (districts/, faction-promos/, etc.) is NOT here; it lives in
 * the settings concept-art gallery (see ConceptGallery in ashlane-app.tsx).
 */

/** Every sliced UI asset, by key. */
export const UI_ART = {
  // Logos & titles
  "logo-main": "ui/logo-main.webp",
  "logo-gold": "ui/logo-gold.webp",
  "title-banner": "ui/title-banner.webp",
  "typography-specimen": "ui/typography-specimen.webp",
  // Menu backgrounds
  "menu-bg-texture": "ui/menu-bg-texture.webp",
  "menu-bg-2": "ui/menu-bg-2.webp",
  // Buttons
  "button-normal": "ui/button-normal.webp",
  "button-hover": "ui/button-hover.webp",
  "button-pressed": "ui/button-pressed.webp",
  "btn-fight": "ui/btn-fight.webp",
  "btn-confirm": "ui/btn-confirm.webp",
  "btn-back": "ui/btn-back.webp",
  "btn-settings": "ui/btn-settings.webp",
  "btn-refresh": "ui/btn-refresh.webp",
  "btn-close": "ui/btn-close.webp",
  // Cursors
  "cursor-glove": "ui/cursor-glove.webp",
  "cursor-spray": "ui/cursor-spray.webp",
  "cursor-chain": "ui/cursor-chain.webp",
  "cursor-knuckle": "ui/cursor-knuckle.webp",
  "cursor-wand": "ui/cursor-wand.webp",
  "cursor-knuckle-finger": "ui/cursor-knuckle-finger.webp",
  "cursor-spraycan": "ui/cursor-spraycan.webp",
  "cursor-chainlink": "ui/cursor-chainlink.webp",
  "cursor-wizard": "ui/cursor-wizard.webp",
  "hand-open": "ui/hand-open.webp",
  "hand-fist": "ui/hand-fist.webp",
  "hand-point": "ui/hand-point.webp",
  "hand-grab": "ui/hand-grab.webp",
  // HUD
  "healthbar-classic": "ui/healthbar-classic.webp",
  "healthbar-segmented": "ui/healthbar-segmented.webp",
  "healthbar-circular": "ui/healthbar-circular.webp",
  "super-flame": "ui/super-flame.webp",
  "super-lightning": "ui/super-lightning.webp",
  "super-chain": "ui/super-chain.webp",
  "combo-x2": "ui/combo-x2.webp",
  "combo-x5": "ui/combo-x5.webp",
  "combo-x10": "ui/combo-x10.webp",
  "combo-x25": "ui/combo-x25.webp",
  "combo-x50": "ui/combo-x50.webp",
  "timer-circular": "ui/timer-circular.webp",
  "timer-hex": "ui/timer-hex.webp",
  "timer-shield": "ui/timer-shield.webp",
  "hud-bar-frame": "ui/hud-bar-frame.webp",
  "hud-bar-gold": "ui/hud-bar-gold.webp",
  "hud-dial": "ui/hud-dial.webp",
  "hud-gauge": "ui/hud-gauge.webp",
  "hud-strip-purple": "ui/hud-strip-purple.webp",
  "hud-strip-mixed": "ui/hud-strip-mixed.webp",
  "hud-strip-gold": "ui/hud-strip-gold.webp",
  "hud-shield-purple": "ui/hud-shield-purple.webp",
  "hud-shield-mixed": "ui/hud-shield-mixed.webp",
  "hud-shield-gold": "ui/hud-shield-gold.webp",
  "hud-diamond-purple": "ui/hud-diamond-purple.webp",
  "hud-diamond-mixed": "ui/hud-diamond-mixed.webp",
  "hud-diamond-gold": "ui/hud-diamond-gold.webp",
  "hud-burst-purple": "ui/hud-burst-purple.webp",
  "hud-burst-mixed": "ui/hud-burst-mixed.webp",
  "hud-burst-gold": "ui/hud-burst-gold.webp",
  // Character select & dialogue
  "frame-chain": "ui/frame-chain.webp",
  "frame-spray": "ui/frame-spray.webp",
  "frame-gold": "ui/frame-gold.webp",
  "frame-concrete": "ui/frame-concrete.webp",
  "dialogue-wide": "ui/dialogue-wide.webp",
  "dialogue-small": "ui/dialogue-small.webp",
  "dialogue-purple": "ui/dialogue-purple.webp",
  // Loading & VS
  "loading-frame": "ui/loading-frame.webp",
  "vs-card-p1": "ui/vs-card-p1.webp",
  "vs-card-p2": "ui/vs-card-p2.webp",
  "vs-medallion": "ui/vs-medallion.webp",
  // Panels & dividers
  "panel-box-large": "ui/panel-box-large.webp",
  "panel-box-small": "ui/panel-box-small.webp",
  "panel-banner-wide": "ui/panel-banner-wide.webp",
  "panel-stat-square": "ui/panel-stat-square.webp",
  "panel-stat-vertical": "ui/panel-stat-vertical.webp",
  "panel-bar-wide": "ui/panel-bar-wide.webp",
  "panel-speech": "ui/panel-speech.webp",
  "panel-grid-square": "ui/panel-grid-square.webp",
  "divider-chain-gold": "ui/divider-chain-gold.webp",
  // Stickers & stencils
  "sticker-star": "ui/sticker-star.webp",
  "sticker-splat": "ui/sticker-splat.webp",
  "sticker-bolt": "ui/sticker-bolt.webp",
  "sticker-crown-neon": "ui/sticker-crown-neon.webp",
  "sticker-glove-gold": "ui/sticker-glove-gold.webp",
  "stencil-arrow-red": "ui/stencil-arrow-red.webp",
  "stencil-arrow-purple": "ui/stencil-arrow-purple.webp",
  "stencil-arrow-gold": "ui/stencil-arrow-gold.webp",
  "stencil-star-green": "ui/stencil-star-green.webp",
  "stencil-star-purple": "ui/stencil-star-purple.webp",
  "stencil-star-gold": "ui/stencil-star-gold.webp",
  "stencil-bolt-gold": "ui/stencil-bolt-gold.webp",
  "stencil-bolt-green": "ui/stencil-bolt-green.webp",
  "stencil-bolt-red": "ui/stencil-bolt-red.webp",
  "stencil-skull-purple": "ui/stencil-skull-purple.webp",
  "stencil-skull-red": "ui/stencil-skull-red.webp",
  "stencil-skull-gold": "ui/stencil-skull-gold.webp",
  "stencil-crown-gold": "ui/stencil-crown-gold.webp",
  "stencil-crown-purple": "ui/stencil-crown-purple.webp",
  "stencil-tag-red": "ui/stencil-tag-red.webp",
  "stencil-tag-green": "ui/stencil-tag-green.webp",
  // Weapons & pickups
  "weapon-chain": "ui/weapon-chain.webp",
  "weapon-bat": "ui/weapon-bat.webp",
  "weapon-pipe": "ui/weapon-pipe.webp",
  "weapon-knife": "ui/weapon-knife.webp",
  "weapon-brick": "ui/weapon-brick.webp",
  "weapon-tireiron": "ui/weapon-tireiron.webp",
  "pickup-cash": "ui/pickup-cash.webp",
  "pickup-health": "ui/pickup-health.webp",
  "pickup-armor": "ui/pickup-armor.webp",
  "pickup-bandage": "ui/pickup-bandage.webp",
  "pickup-energy": "ui/pickup-energy.webp",
  "pickup-star": "ui/pickup-star.webp",
  // Map markers
  "marker-arena": "ui/marker-arena.webp",
  "marker-shop": "ui/marker-shop.webp",
  "marker-hideout": "ui/marker-hideout.webp",
  "marker-boss": "ui/marker-boss.webp",
  "marker-checkpoint": "ui/marker-checkpoint.webp",
  "marker-danger": "ui/marker-danger.webp",
  "marker-ally": "ui/marker-ally.webp",
  "marker-mystery": "ui/marker-mystery.webp",
  // Rank badges
  "rank-s": "ui/rank-s.webp",
  "rank-a": "ui/rank-a.webp",
  "rank-b": "ui/rank-b.webp",
  "rank-c": "ui/rank-c.webp",
  "rank-d": "ui/rank-d.webp",
} as const;

export type UiArtKey = keyof typeof UI_ART;

/** Faction emblem entry. `generic` emblems are unassigned by design. */
export interface EmblemEntry {
  id: string;
  /** Display name — canon names only; generics are labeled Generic. */
  name: string;
  art: string;
  generic: boolean;
}

export const EMBLEMS: readonly EmblemEntry[] = [
  // Sheet 1: AshLane core
  { id: "ashes", name: "The Ashes", art: "emblems/emblem-ashes.webp", generic: false },
  { id: "combine", name: "The Combine", art: "emblems/emblem-combine.webp", generic: false },
  { id: "hollows", name: "The Hollows", art: "emblems/emblem-hollows.webp", generic: false },
  { id: "dynasty-authority", name: "Dynasty Authority", art: "emblems/emblem-dynasty-authority.webp", generic: false },
  { id: "halcyon-kennedy", name: "Halcyon/Kennedy", art: "emblems/emblem-halcyon-kennedy.webp", generic: false },
  { id: "kennedy-security", name: "Kennedy Security", art: "emblems/emblem-kennedy-security.webp", generic: false },
  // Sheet 2: AshLane extras
  { id: "unaffiliated", name: "Unaffiliated", art: "emblems/emblem-unaffiliated.webp", generic: false },
  { id: "onyx-crew", name: "Onyx's Crew", art: "emblems/emblem-onyx-crew.webp", generic: false },
  { id: "circuit", name: "The Circuit", art: "emblems/emblem-circuit.webp", generic: false },
  { id: "old-guard", name: "The Old Guard", art: "emblems/emblem-old-guard.webp", generic: false },
  { id: "pit", name: "The Pit", art: "emblems/emblem-pit.webp", generic: false },
  { id: "hollow-points", name: "Hollow Points", art: "emblems/emblem-hollow-points.webp", generic: false },
  // Sheet 3: wrestling companies
  { id: "awe", name: "AWE", art: "emblems/emblem-awe.webp", generic: false },
  { id: "jpcw", name: "JPCW", art: "emblems/emblem-jpcw.webp", generic: false },
  { id: "nwc", name: "NWC", art: "emblems/emblem-nwc.webp", generic: false },
  { id: "lucha-temple", name: "Lucha Temple", art: "emblems/emblem-lucha-temple.webp", generic: false },
  { id: "slaughterhouse", name: "Slaughterhouse", art: "emblems/emblem-slaughterhouse.webp", generic: false },
  { id: "hollywood", name: "Hollywood", art: "emblems/emblem-hollywood.webp", generic: false },
  // Sheet 4: book factions
  { id: "corporate-structure", name: "Corporate Structure", art: "emblems/emblem-corporate-structure.webp", generic: false },
  { id: "dynasty", name: "The Dynasty", art: "emblems/emblem-dynasty.webp", generic: false },
  { id: "resistance", name: "Resistance", art: "emblems/emblem-resistance.webp", generic: false },
  { id: "sanctuary", name: "Sanctuary", art: "emblems/emblem-sanctuary.webp", generic: false },
  { id: "straight-shooters", name: "Straight Shooters", art: "emblems/emblem-straight-shooters.webp", generic: false },
  { id: "iron-directorate", name: "Iron Directorate", art: "emblems/emblem-iron-directorate.webp", generic: false },
  // Sheet 5: book factions 2
  { id: "administration", name: "Administration", art: "emblems/emblem-administration.webp", generic: false },
  { id: "gallery", name: "Gallery", art: "emblems/emblem-gallery.webp", generic: false },
  { id: "noise", name: "Noise", art: "emblems/emblem-noise.webp", generic: false },
  { id: "temple", name: "Temple", art: "emblems/emblem-temple.webp", generic: false },
  { id: "pit-jack-slade", name: "The Pit (Jack Slade)", art: "emblems/emblem-pit-jack-slade.webp", generic: false },
  { id: "agents-of-chaos", name: "Agents of Chaos", art: "emblems/emblem-agents-of-chaos.webp", generic: false },
  // Sheet 6: book factions 3
  { id: "independent-variables", name: "Independent Variables", art: "emblems/emblem-independent-variables.webp", generic: false },
  { id: "gamer-regime", name: "Gamer Regime", art: "emblems/emblem-gamer-regime.webp", generic: false },
  // Generic set — intentionally unassigned
  { id: "generic-wizard-hat", name: "Generic: Wizard Hat", art: "emblems/emblem-generic-wizard-hat.webp", generic: true },
  { id: "generic-crown", name: "Generic: Crown", art: "emblems/emblem-generic-crown.webp", generic: true },
  { id: "generic-dice", name: "Generic: Dice", art: "emblems/emblem-generic-dice.webp", generic: true },
  { id: "generic-skull", name: "Generic: Skull", art: "emblems/emblem-generic-skull.webp", generic: true },
  { id: "generic-dragon", name: "Generic: Dragon", art: "emblems/emblem-generic-dragon.webp", generic: true },
  { id: "generic-moon", name: "Generic: Moon", art: "emblems/emblem-generic-moon.webp", generic: true },
];

export function getEmblem(id: string): EmblemEntry | undefined {
  return EMBLEMS.find((e) => e.id === id);
}

export function getCanonEmblems(): EmblemEntry[] {
  return EMBLEMS.filter((e) => !e.generic);
}

export function getGenericEmblems(): EmblemEntry[] {
  return EMBLEMS.filter((e) => e.generic);
}
