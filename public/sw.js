/* AshLane PWA offline support. Keep navigation online-first so deploys and
   account/session changes are never hidden behind a stale document. Cache only
   same-origin static assets; never cache auth, API, or mutation requests. */
const SHELL_CACHE = "ashlane-shell-v1";
const ASSET_CACHE = "ashlane-assets-v1";
const SHELL_URLS = ["/", "/__grok/manifest.webmanifest", "/__grok/icon-180.png", "/favicon.svg"];
const MAX_ASSETS = 55;
const MAX_ASSET_BYTES = 15 * 1024 * 1024;

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(SHELL_CACHE);
    await Promise.all(SHELL_URLS.map(async (url) => {
      try {
        const response = await fetch(url, { cache: "reload" });
        if (response.ok) await cache.put(url, response);
      } catch {
        // A failed optional shell request must not block installation.
      }
    }));
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keep = new Set([SHELL_CACHE, ASSET_CACHE]);
    const keys = await caches.keys();
    await Promise.all(keys.filter((key) => key.startsWith("ashlane-") && !keep.has(key)).map((key) => caches.delete(key)));
    await self.clients.claim();
  })());
});

function isPrivateOrDynamic(url) {
  return url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/auth/") ||
    url.pathname.startsWith("/_server/") ||
    url.pathname.startsWith("/__app-env") ||
    url.pathname.startsWith("/__grok/install") ||
    url.pathname.endsWith(".map");
}

function isStaticAsset(url) {
  return /\.(?:js|css|json|glb|gltf|bin|png|jpe?g|webp|svg|woff2?)$/i.test(url.pathname) ||
    url.pathname === "/__grok/manifest.webmanifest" ||
    url.pathname === "/__grok/icon-180.png";
}

async function trimAssetCache(cache) {
  const keys = await cache.keys();
  if (keys.length <= MAX_ASSETS) return;
  await Promise.all(keys.slice(0, keys.length - MAX_ASSETS).map((request) => cache.delete(request)));
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || isPrivateOrDynamic(url)) return;

  if (request.mode === "navigate") {
    event.respondWith((async () => {
      try {
        const response = await fetch(request);
        if (response.ok && url.pathname === "/") {
          const cache = await caches.open(SHELL_CACHE);
          await cache.put("/", response.clone());
        }
        return response;
      } catch {
        const cache = await caches.open(SHELL_CACHE);
        return (await cache.match(url.pathname === "/" ? "/" : request)) ||
          (await cache.match("/")) ||
          new Response("AshLane is offline. Open the app once while connected to cache the game shell and assets.", {
            status: 503,
            headers: { "content-type": "text/plain; charset=utf-8" },
          });
      }
    })());
    return;
  }

  if (!isStaticAsset(url)) return;
  event.respondWith((async () => {
    const cache = await caches.open(ASSET_CACHE);
    const cached = await cache.match(request);
    if (cached) {
      event.waitUntil(fetch(request).then(async (response) => {
        if (response.ok) {
          const size = Number(response.headers.get("content-length") || 0);
          if (!size || size <= MAX_ASSET_BYTES) {
            await cache.put(request, response.clone());
            await trimAssetCache(cache);
          }
        }
      }).catch(() => {}));
      return cached;
    }
    const response = await fetch(request);
    if (response.ok) {
      const size = Number(response.headers.get("content-length") || 0);
      if (!size || size <= MAX_ASSET_BYTES) {
        await cache.put(request, response.clone());
        await trimAssetCache(cache);
      }
    }
    return response;
  })());
});
