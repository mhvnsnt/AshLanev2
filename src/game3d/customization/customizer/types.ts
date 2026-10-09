/**
 * customizer/types.ts — the data contract for the in-game character customizer.
 *
 * A CustomBuild is everything the player can change about a fighter, stored
 * per-fighter and re-applied to the live model whenever it loads (preview and
 * fight). Skin-tone likeness is LOCKED: no field here may recolor skin.
 *
 * Ownership: LANE-UI (customizer lane). The face-paint lane owns
 * src/game3d/customization/facepaint/index.ts and implements FacePaintModule;
 * this file only declares the shape we integrate against.
 */

/** One selectable iris color. `hex` is a CSS hex like "#4a2c14". */
export interface EyeColor {
  id: string;
  label: string;
  hex: string;
}

/** Body/face morph dials. All 0..1, 0.5 = the model's authored shape. */
export interface MorphValues {
  /** Arm/chest/thigh girth. */
  muscle: number;
  /** Leg length (feet stay planted — preview re-grounds the model). */
  height: number;
  /** Hip/shoulder width. */
  build: number;
  /** Jaw width / face fullness. */
  jaw: number;
}

export const DEFAULT_MORPHS: MorphValues = {
  muscle: 0.5,
  height: 0.5,
  build: 0.5,
  jaw: 0.5,
};

export const MORPH_KEYS = ["muscle", "height", "build", "jaw"] as const;
export type MorphKey = (typeof MORPH_KEYS)[number];

/**
 * Accessory slots. `chain` ships now (4 chain GLBs + manifest.json);
 * `hair` / `facialHair` / `mask` / `hood` / `gloves` / `shoes` are scaffolded
 * and read their lanes' manifest.json files as they merge.
 */
export const ACCESSORY_SLOTS = [
  "hair",
  "facialHair",
  "mask",
  "hood",
  "chain",
  "gloves",
  "shoes",
] as const;
export type AccessorySlotId = (typeof ACCESSORY_SLOTS)[number];

/**
 * manifest.json entry for one accessory asset (authored by the modeling
 * lanes under public/models/<category>/manifest.json). The customizer reads
 * these manifests at runtime — no code change needed when a lane lands.
 */
export interface AccessoryManifest {
  /** Stable id, e.g. "chain_gold_ashlane". */
  id: string;
  label: string;
  slot: AccessorySlotId;
  /** GLB path relative to public/, e.g. "models/accessories/chain_gold_ashlane_rigged.glb". */
  file: string;
  attach: {
    /**
     * Bone to hang the accessory from. Exact name preferred; the loader
     * falls back to a case-insensitive pattern match (see accessories.ts).
     */
    bone: string;
    /** Local offset from the bone origin, in meters. */
    position: [number, number, number];
    /** Local euler rotation, in degrees. */
    rotation: [number, number, number];
    /** Uniform scale. Defaults to 1. */
    scale?: number;
  };
}

/**
 * Face-paint integration contract. The paint lane implements this in
 * src/game3d/customization/facepaint/index.ts. The customizer calls
 * facepaint-adapter.ts, which prefers the real module and falls back to a
 * stub that reports available:false (the UI then shows "coming soon" instead
 * of fake paint).
 */
export interface FacePaintModule {
  /** True when the paint lane's module is actually loaded. */
  available: boolean;
  listStyles(): { id: string; label: string }[];
  /** Apply a paint style to a loaded fighter model root. */
  applyToModel(root: object, styleId: string): void;
  /** Remove any applied paint from the model root. */
  clearFromModel(root: object): void;
}

/** The player's full build for one fighter. */
export interface CustomBuild {
  /** Roster id, e.g. "judas". */
  fighterId: string;
  /** Attire id from roster.ts, e.g. "classic". */
  attireId: string;
  /** Iris color id from the eye palette, e.g. "brown". */
  eyeColor: string;
  morphs: MorphValues;
  /** Accessory manifest id per slot; null = none. */
  accessories: Record<AccessorySlotId, string | null>;
  /** Face-paint style id; null = none. */
  facePaint: string | null;
}

export function defaultBuild(fighterId: string, attireId: string): CustomBuild {
  return {
    fighterId,
    attireId,
    eyeColor: "natural",
    morphs: { ...DEFAULT_MORPHS },
    accessories: {
      hair: null,
      facialHair: null,
      mask: null,
      hood: null,
      chain: null,
      gloves: null,
      shoes: null,
    },
    facePaint: null,
  };
}
