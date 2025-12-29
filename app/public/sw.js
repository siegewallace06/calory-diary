const CACHE_NAME = 'calorie-diary-v1.0.1';
const STATIC_CACHE = 'calorie-diary-static-v1.0.1';
const DYNAMIC_CACHE = 'calorie-diary-dynamic-v1.0.1';

// Assets to cache on install (ONLY truly static assets)
const STATIC_ASSETS = [
    // Remove dynamic pages from static cache - they need fresh data!
    // '/', '/log', '/summary', '/settings', - REMOVED
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

// Pages that need fresh data (network-first strategy)
const DYNAMIC_PAGES = ['/', '/log', '/summary', '/settings'];

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

// Fetch event - network-first for dynamic pages, cache-first for static assets
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

    // API requests - always fetch fresh (no caching)
    if (url.pathname.startsWith('/api/')) {
        event.respondWith(fetch(request));
        return;
    }

    // Dynamic pages - Network First strategy (always try network first)
    if (DYNAMIC_PAGES.includes(url.pathname) || url.pathname === '/') {
        event.respondWith(
            fetch(request)
                .then(networkResponse => {
                    console.log('Network first - serving fresh:', request.url);
                    // Don't cache dynamic pages to ensure fresh data
                    return networkResponse;
                })
                .catch(error => {
                    console.log('Network failed, trying cache:', request.url);
                    // If network fails, try cache as fallback
                    return caches.match(request)
                        .then(cachedResponse => {
                            if (cachedResponse) {
                                console.log('Serving stale cache (offline):', request.url);
                                return cachedResponse;
                            }
                            // No cache available, show offline page
                            return new Response(
                                '<h1>Offline</h1><p>Please check your internet connection.</p>',
                                { headers: { 'Content-Type': 'text/html' } }
                            );
                        });
                })
        );
        return;
    }

    // Static assets - Cache First strategy
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
                            // Cache static assets only
                            if (STATIC_ASSETS.includes(url.pathname) ||
                                url.origin !== location.origin) {
                                const responseClone = networkResponse.clone();
                                caches.open(STATIC_CACHE)
                                    .then(cache => {
                                        cache.put(request, responseClone);
                                    });
                            }
                        }
                        return networkResponse;
                    })
                    .catch(error => {
                        console.error('Network fetch failed:', error);
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