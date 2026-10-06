//#region ../game-sweep/AshLanev2/node_modules/.nitro/vite/services/ssr/assets/asset-base-DeZoSF86.js
/**
* Asset base path helper.
*
* All runtime fetches of files under public/ MUST go through assetUrl().
* Vite serves public/ at import.meta.env.BASE_URL, which is "/" in dev
* but "/AshLanev2/" on GitHub Pages. Hardcoding "/models/..." etc. 404s
* on Pages — that was the 2026-10-06 playtest blocker (131 failed requests,
* blob fighters, black streets, no animations).
*
* Usage:
*   import { assetUrl } from "./asset-base";
*   loader.loadAsync(assetUrl("models/cast/STICKUP.glb"));
*/
var ASSET_BASE = "/AshLanev2/";
/** Prefix a public/ asset path (e.g. "models/cast/X.glb") with the deploy base. */
function assetUrl(path) {
	const clean = path.replace(/^\/+/, "");
	return "/AshLanev2/".endsWith("/") ? `${ASSET_BASE}${clean}` : `${ASSET_BASE}/${clean}`;
}
//#endregion
export { assetUrl as t };
