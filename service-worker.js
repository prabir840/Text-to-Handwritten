const CACHE_NAME = "handwriting-cache-v1";
const urlsToCache = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
  "https://fonts.googleapis.com/css2?family=Caveat:wght@400;500;600;700&family=Kalam:wght@300;400;700&family=Tangerine:wght@400;700&family=Tillana:wght@400;500;600;700&family=Indie+Flower&family=Shadows+Into+Light&family=Dancing+Script:wght@400;700&family=Patrick+Hand&family=Bad+Script&family=Homemade+Apple&family=Reenie+Beanie&family=Rock+Salt&display=swap",
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css",
  "https://html2canvas.hertzen.com/dist/html2canvas.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.7.1/jszip.min.js"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keyList =>
      Promise.all(
        keyList.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
});
