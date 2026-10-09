/**
 * customizer/facepaint-adapter.ts — bridge to the paint lane's module.
 *
 * The paint lane owns src/game3d/customization/facepaint/index.ts and the
 * docs/customization/face-paint.md integration contract. Until it lands, this
 * adapter exposes a stub that reports available:false — the customizer UI
 * shows "Face paint system landing soon" instead of fake paint options
 * (deliverable-text policy: no placeholders rendered as real content).
 *
 * When the paint lane merges, this adapter needs NO changes: it dynamic-
 * imports ../facepaint/index.ts and prefers the real module when present.
 * The expected real-module shape:
 *   export const facePaint: {
 *     available: true,
 *     listStyles(): { id: string; label: string }[],
 *     applyToModel(root: THREE.Object3D, styleId: string): void,
 *     clearFromModel(root: THREE.Object3D): void,
 *   }
 */

import type { FacePaintModule } from "./types";

const STUB: FacePaintModule = {
  available: false,
  listStyles: () => [],
  applyToModel: () => {
    throw new Error("Face paint module not available yet (paint lane pending).");
  },
  clearFromModel: () => {},
};

let cached: FacePaintModule | null = null;
let attempted = false;

// Non-literal specifier on purpose: the paint lane's module doesn't exist
// yet, so a static/literal import would fail typecheck AND the production
// build. @vite-ignore keeps the bundler from trying to resolve it; at
// runtime a missing module rejects and we fall back to the stub. In dev,
// once src/game3d/customization/facepaint/index.ts lands, Vite serves it and
// the real module is picked up with no customizer changes.
const FACEPAINT_SPEC = "../facepaint/index.js";

/**
 * Get the face-paint module: the paint lane's real implementation when it has
 * landed, otherwise the unavailable stub.
 */
export async function getFacePaintModule(): Promise<FacePaintModule> {
  if (attempted) return cached ?? STUB;
  attempted = true;
  try {
    const mod = (await import(/* @vite-ignore */ FACEPAINT_SPEC).catch(() => null)) as unknown as {
      facePaint?: FacePaintModule;
      default?: FacePaintModule;
    } | null;
    const candidate = mod?.facePaint ?? mod?.default ?? null;
    if (candidate && typeof candidate.applyToModel === "function") {
      cached = { ...candidate, available: true };
    }
  } catch {
    // Paint lane not merged — fall through to the stub.
  }
  return cached ?? STUB;
}
