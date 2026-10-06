// asset-base.stub.mjs — node-safe stub of src/game3d/asset-base.ts for tests.
// The real module reads import.meta.env.BASE_URL (vite-only) at import time.
export const ASSET_BASE = "/";
export const assetUrl = (p) => "/" + String(p).replace(/^\/+/, "");
