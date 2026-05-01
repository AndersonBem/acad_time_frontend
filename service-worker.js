const CACHE_NAME = "acadtime-v3";

const urlsToCache = [
  "./",
  "./pages/login.html",
  "./pages/dashboard.html",
  "./pages/auditoria.html",

  "./css/global.css",
  "./css/login.css",
  "./css/dashboard.css",
  "./css/auditoria.css",

  "./js/config.js",
  "./js/utils.js",
  "./js/login.js",
  "./js/dashboard.js",
  "./js/auditoria.js",


    "./assets/icons/192.png",
    "./assets/icons/512.png",
    "./assets/icons/192-maskable.png",
    "./assets/icons/512-maskable.png",

];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
});

self.addEventListener("fetch", (event) => {
  const url = event.request.url;

  // NÃO cachear API
  if (url.includes("127.0.0.1:8000") || url.includes("/api/")) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request);
    })
  );
});