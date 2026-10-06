/**
 * GitHub Pages static HTML plugin.
 *
 * TanStack Start's client environment uses a virtual entry
 * (`virtual:tanstack-start-client-entry`), so `vite build` emits JS/CSS
 * chunks but no `index.html`. For the GitHub Pages static deploy
 * (PAGES_BUILD=1) we generate a minimal HTML shell that loads the client
 * bundle. The TanStack client entry boots the router with client-side
 * rendering when no SSR HTML is present.
 *
 * Also flattens the client output: TanStack Start defaults to
 * `<outDir>/client/`, but Pages needs everything at the artifact root.
 */
const PAGES_BASE = "/AshLanev2/";

export function pagesStaticPlugin() {
  const enabled = !!process.env.PAGES_BUILD;
  return {
    name: "ashlane:pages-static",
    apply: (config, env) => enabled && env.command === "build",

    configEnvironment(name, config) {
      if (!enabled) return;
      if (name === "client") {
        // Flatten: emit client files directly into .output/public/
        config.build.outDir = ".output/public";
      }
      if (name === "ssr") {
        // The SSR bundle is never executed on GitHub Pages (no server).
        // Keep it out of the uploaded artifact.
        config.build.outDir = ".output/ssr-tmp";
      }
    },

    generateBundle(options, bundle) {
      if (!enabled) return;
      if (this.environment?.name !== "client") return;

      const entryChunks = [];
      const cssAssets = [];
      for (const file of Object.values(bundle)) {
        if (file.type === "chunk" && file.isEntry) entryChunks.push(file.fileName);
        else if (file.type === "asset" && file.fileName.endsWith(".css"))
          cssAssets.push(file.fileName);
      }
      if (entryChunks.length === 0) {
        this.warn("[ashlane:pages-static] no entry chunk found; skipping index.html");
        return;
      }

      const cssLinks = cssAssets
        .map((f) => `    <link rel="stylesheet" href="${PAGES_BASE}${f}" />`)
        .join("\n");
      // modulepreload for the entry chunk helps first paint
      const preloads = entryChunks
        .map(
          (f) =>
            `    <link rel="modulepreload" href="${PAGES_BASE}${f}" />`
        )
        .join("\n");
      const scripts = entryChunks
        .map(
          (f) =>
            `    <script type="module" src="${PAGES_BASE}${f}"></script>`
        )
        .join("\n");

      const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <meta name="theme-color" content="#12100e" />
    <meta name="description" content="Ashlane is one ward: free-roam the plaza, brawl the side street, and jump the scaffolds with the same fighter." />
    <title>Ashlane</title>
    <link rel="icon" type="image/svg+xml" href="${PAGES_BASE}favicon.svg" />
    <link rel="manifest" href="${PAGES_BASE}__grok/manifest.webmanifest" />
    <link rel="apple-touch-icon" href="${PAGES_BASE}__grok/icon-180.png" />
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Anton&family=Outfit:wght@500;600;700&family=Silkscreen:wght@400;700&display=swap" />
${cssLinks}
${preloads}
  </head>
  <body>
    <div id="root"></div>
${scripts}
  </body>
</html>
`;
      this.emitFile({ type: "asset", fileName: "index.html", source: html });

      // SPA fallback: GitHub Pages serves 404.html for unknown routes,
      // which lets TanStack Router handle client-side navigation.
      this.emitFile({ type: "asset", fileName: "404.html", source: html });

      // Prevent Jekyll processing (underscore-prefixed asset dirs like __grok)
      this.emitFile({ type: "asset", fileName: ".nojekyll", source: "" });
    },
  };
}
