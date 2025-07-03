// This would be in a separate service-worker.js file in a real implementation
        const CACHE_NAME = 'text-to-handwriting-v1';
        const urlsToCache = [
            '/',
            '/index.html',
            '/styles.css',
            '/script.js',
            'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
            'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js',
            'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js',
            'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.11.338/pdf.min.js',
            'https://fonts.googleapis.com/css2?family=Caveat:wght@400;700&family=Kalam:wght@300;400;700&family=Tangerine:wght@400;700&family=Indie+Flower&family=Patrick+Hand&family=Gochi+Hand&family=Homemade+Apple&family=Reenie+Beanie&family=Rock+Salt&family=Shadows+Into+Light&family=Dancing+Script:wght@400;700&display=swap',
            'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
        ];

        self.addEventListener('install', event => {
            event.waitUntil(
                caches.open(CACHE_NAME)
                    .then(cache => {
                        return cache.addAll(urlsToCache);
                    })
            );
        });

        self.addEventListener('fetch', event => {
            event.respondWith(
                caches.match(event.request)
                    .then(response => {
                        if (response) {
                            return response;
                        }
                        return fetch(event.request);
                    })
            );
        });

        self.addEventListener('activate', event => {
            const cacheWhitelist = [CACHE_NAME];
            event.waitUntil(
                caches.keys().then(cacheNames => {
                    return Promise.all(
                        cacheNames.map(cacheName => {
                            if (cacheWhitelist.indexOf(cacheName) === -1) {
                                return caches.delete(cacheName);
                            }
                        })
                    );
                })
            );
        });
