const CHECKIN_CACHE = "kf-checkin-v16";
const CHECKIN_ASSETS = [
  "./checkin.html",
  "./convite.html",
  "./cancelar.html",
  "./admin.html",
  "./checkin-manifest.webmanifest",
  "./css/base.css",
  "./css/checkin.css",
  "./css/convite.css",
  "./css/admin.css",
  "./js/config.js",
  "./js/cache.js",
  "./js/api.js",
  "./js/checkin.js",
  "./js/convite.js",
  "./js/cancelar.js",
  "./js/admin.js",
  "./assets/vendor/jsQR.js",
  "./assets/brand/favicon.svg",
  "./assets/brand/monograma-small.png",
  "./assets/icons/checkin-192.png",
  "./assets/icons/checkin-512.png",
  "./assets/images/gallery/_BQH1929-Editar.jpg.jpg",
  "./assets/images/gallery/_BQH1940.jpg.jpg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CHECKIN_CACHE)
      .then((cache) => cache.addAll(CHECKIN_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((key) => key.startsWith("kf-checkin-") && key !== CHECKIN_CACHE)
          .map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  const asset = CHECKIN_ASSETS.find((path) => new URL(path, self.registration.scope).pathname === url.pathname);
  if (!asset) return;
  const cacheKey = new URL(asset, self.registration.scope);

  // Installation precaches a complete version, available even on a stalled connection.
  event.respondWith(
    caches.open(CHECKIN_CACHE).then(async (cache) => {
      const cached = await cache.match(cacheKey);
      if (cached) return cached;
      const response = await fetch(request);
      if (response.ok) await cache.put(cacheKey, response.clone());
      return response;
    })
  );
});
