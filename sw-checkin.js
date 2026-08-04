const CHECKIN_CACHE = "kf-checkin-v5";
const CHECKIN_ASSETS = [
  "./checkin.html",
  "./convite.html",
  "./checkin-manifest.webmanifest",
  "./css/base.css",
  "./css/checkin.css",
  "./css/convite.css",
  "./js/config.js",
  "./js/cache.js",
  "./js/api.js",
  "./js/checkin.js",
  "./js/convite.js",
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
  const isCachedCheckinAsset = url.origin === self.location.origin
    && CHECKIN_ASSETS.includes(`.${url.pathname}`);
  const isQrReader = url.hostname === "cdn.jsdelivr.net" && url.pathname.includes("/jsQR");
  if (!isCachedCheckinAsset && !isQrReader) return;

  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response && (response.ok || response.type === "opaque")) {
          const copy = response.clone();
          caches.open(CHECKIN_CACHE).then((cache) => cache.put(request, copy));
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
});
