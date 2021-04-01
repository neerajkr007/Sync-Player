const cacheName = "cache-v1"
const resourcesToPrecache = [
    '/',
    '/index.html'
]

self.addEventListener('install', event => {
    console.log('Service worker install event !');
    event.waitUntil(
        caches.open(cacheName)
            .then(cache => {
                return cache.addAll(resourcesToPrecache);
            })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(caches.match(event.request)
        .then(cachedResponse => {
            return cachedResponse || fetch(event.request);
        })
    );
});