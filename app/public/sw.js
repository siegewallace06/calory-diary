const CACHE_NAME = 'calorie-diary-v1.0.0';
const STATIC_CACHE = 'calorie-diary-static-v1.0.0';
const DYNAMIC_CACHE = 'calorie-diary-dynamic-v1.0.0';

// Assets to cache on install
const STATIC_ASSETS = [
    '/',
    '/log',
    '/summary',
    '/settings',
    '/css/style.css',
    '/manifest.json',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png',
    // External resources
    'https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css',
    'https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js',
    'https://cdn.jsdelivr.net/npm/chart.js',
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
];

// Install event - cache static assets
self.addEventListener('install', event => {
    console.log('Service Worker installing...');

    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache => {
                console.log('Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .catch(error => {
                console.error('Failed to cache static assets:', error);
            })
    );

    self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    console.log('Service Worker activating...');

    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );

    self.clients.claim();
});

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }

    // Skip Chrome extensions and non-http(s) requests
    if (!request.url.startsWith('http')) {
        return;
    }

    event.respondWith(
        caches.match(request)
            .then(cachedResponse => {
                if (cachedResponse) {
                    console.log('Serving from cache:', request.url);
                    return cachedResponse;
                }

                // Not in cache, fetch from network
                return fetch(request)
                    .then(networkResponse => {
                        // Only cache successful responses
                        if (networkResponse.status === 200) {
                            // Determine which cache to use
                            let cacheName = DYNAMIC_CACHE;

                            // Cache API responses separately
                            if (url.pathname.startsWith('/api/')) {
                                // Don't cache API responses for real-time data
                                return networkResponse;
                            }

                            // Cache static assets in static cache
                            if (STATIC_ASSETS.includes(url.pathname)) {
                                cacheName = STATIC_CACHE;
                            }

                            // Clone the response before caching
                            const responseClone = networkResponse.clone();
                            caches.open(cacheName)
                                .then(cache => {
                                    cache.put(request, responseClone);
                                });
                        }

                        return networkResponse;
                    })
                    .catch(error => {
                        console.error('Network fetch failed:', error);

                        // Serve offline fallback for pages
                        if (request.destination === 'document') {
                            return caches.match('/');
                        }

                        // For other resources, just fail
                        throw error;
                    });
            })
    );
});

// Background sync for offline food entries
self.addEventListener('sync', event => {
    if (event.tag === 'food-entry-sync') {
        event.waitUntil(syncFoodEntries());
    }
});

// Push notifications (future enhancement)
self.addEventListener('push', event => {
    if (!event.data) return;

    const data = event.data.json();
    const options = {
        body: data.body,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        data: data.data,
        actions: [
            {
                action: 'view',
                title: 'View App',
                icon: '/icons/icon-72x72.png'
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
    event.notification.close();

    if (event.action === 'view' || !event.action) {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// Sync offline food entries when back online
async function syncFoodEntries() {
    try {
        const cache = await caches.open(DYNAMIC_CACHE);
        const requests = await cache.keys();

        const offlineEntries = requests.filter(request =>
            request.url.includes('/api/log') && request.method === 'POST'
        );

        for (const request of offlineEntries) {
            try {
                await fetch(request);
                await cache.delete(request);
                console.log('Synced offline entry:', request.url);
            } catch (error) {
                console.error('Failed to sync entry:', error);
            }
        }
    } catch (error) {
        console.error('Background sync failed:', error);
    }
}

// Message handling
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});