/**
 * Client-only boot entry for the GitHub Pages static build (PAGES_BUILD=1).
 *
 * The default TanStack Start client entry calls `hydrateRoot(document, …)` and
 * the Start hydration code requires `window.$_TSR` — the SSR bootstrap inline
 * script the server normally injects. GitHub Pages serves a purely static shell
 * (see `scripts/pages-static-plugin.mjs`), so `$_TSR` is undefined and the boot
 * crashes with `TypeError: Cannot set properties of undefined (setting 't')`
 * before React ever mounts.
 *
 * This game is client-side 3D and needs no SSR. This entry skips hydration
 * entirely: it loads the router client-side and mounts with `createRoot`
 * into `#root`.
 *
 * Wired in `vite.config.ts`: `tanstackStart({ client: { entry: './client-pages' } })`
 * only when `PAGES_BUILD=1`. All other builds keep the default Start entry.
 */
import { StrictMode, startTransition } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { getRouter } from "./router";

async function boot() {
  const router = getRouter();
  await router.load();

  const el = document.getElementById("root");
  if (!el) {
    throw new Error("[ashlane] client boot: #root element missing");
  }

  startTransition(() => {
    createRoot(el).render(
      <StrictMode>
        <RouterProvider router={router} />
      </StrictMode>,
    );
  });
}

boot().catch((err) => {
  // Surface boot failures instead of dying silently on a black screen.
  console.error("[ashlane] client boot failed:", err);
  const el = document.getElementById("root");
  if (el) {
    el.innerHTML =
      '<div style="color:#fff;background:#12100e;height:100vh;display:flex;align-items:center;justify-content:center;font-family:sans-serif;padding:24px;text-align:center">Ashlane failed to start. Check the console for details.</div>';
  }
});
