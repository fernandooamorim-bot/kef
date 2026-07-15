const CHECKIN_CACHE = "kf-checkin-v1";
const CHECKIN_ASSETS = [
  "./checkin.html",
  "./checkin-manifest.webmanifest",
  "./css/base.css",
  "./css/checkin.css",
  "./js/config.js",
  "./js/cache.js",
  "./js/api.js",
  "./js/checkin.js",
  "./assets/brand/favicon.svg",
  "./assets/brand/monograma-small.png",
  "./assets/icons/checkin-192.png",
  "./assets/icons/checkin-512.png",
  "./assets/images/gallery/_BQH1929-Editar.jpg.jpg"
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
  const isCheckinAsset = url.origin === self.location.origin;
  const isQrReader = url.hostname === "cdn.jsdelivr.net" && url.pathname.includes("/jsQR");
  if (!isCheckinAsset && !isQrReader) return;

  event.respondWith(
    caches.match(request).then((cached) => {
      const refresh = fetch(request)
        .then((response) => {
          if (response && (response.ok || response.type === "opaque")) {
            const copy = response.clone();
            caches.open(CHECKIN_CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => cached);

      return cached || refresh;
    })
  );
});
