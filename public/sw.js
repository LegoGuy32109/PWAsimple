const CACHE_VERSION = 12;
const STATIC_CACHE = `static-v${CACHE_VERSION}`;
const DYNAMIC_CACHE = `dynamic-v${CACHE_VERSION}`;
self.addEventListener('install', function (event)
{
    console.log('🤖 Installing Service worker...', event);
    event.waitUntil(caches.open(STATIC_CACHE).then((cache) =>
    {
        console.log('🤖 pre cacheing', cache);
        cache.addAll([
            '/',
            '/app.js',
            '/index.html',
            '/offline.html',
            '/144x144.png',
            '/ship-1024x512.png',
            '/manifest.json',
            '/db.html',
            '/db.js'
        ]);
    }));
});

// might need to close and reopen tab when adding new event listeners
self.addEventListener('activate', function (event)
{
    // Clean up cache, the tabs have been closed when this event triggers
    event.waitUntil(
        caches.keys()
            .then((keyList) => Promise.all(keyList.map((key) =>
            {
                if (![DYNAMIC_CACHE, STATIC_CACHE].includes(key))
                {
                    console.log('🤖 Deleting Cache: ', key);
                    return caches.delete(key);
                }
            })))
    );
    console.log('🤖 Activating Service worker...', event);
    return self.clients.claim();
});

self.addEventListener('fetch', function (event)
{
    event.respondWith(
        caches.match(event.request)
            .then(function (response)
            {
                if (response)
                {
                    console.log('🤖 Retrieved From Cache', response);
                    return response;
                }
                return fetch(event.request)
                    .then((res) =>
                    {
                        // Dynamically cache resources as you're returning from fetch
                        caches.open(DYNAMIC_CACHE)
                            .then((cache) =>
                            {
                                // responses are used when passed, so clone
                                cache.put(event.request.url, res.clone());
                                return res;
                            });
                    })
                    .catch((err) =>
                    {
                        return caches.open(STATIC_CACHE).then((cache) =>
                        {
                            console.log(`🤖 Couldn't fetch ${event.request}`, err);
                            return cache.match('/offline.html');
                        });
                    });
            })
    );
});

// INFO Fallback to cache strategy
// self.addEventListener('fetch', function (event)
// {
//     event.respondWith(
//         fetch(event.request)
//             // Dynamically cache in case no network in future
//             .then((res) =>
//             {
//                 // Dynamically cache resources as you're returning from fetch
//                 caches.open(DYNAMIC_CACHE)
//                     .then((cache) =>
//                     {
//                         // responses are used when passed, so clone
//                         cache.put(event.request.url, res.clone());
//                         return res;
//                     });
//             })
//             .catch((networkErr) =>
//             {
//                 caches.match(event.request)
//                     // Return offline message
//                     .catch((err) =>
//                     {
//                         return caches.open(STATIC_CACHE).then((cache) =>
//                         {
//                             console.log(`🤖 Couldn't fetch: `, event.request, networkErr, err);
//                             // Only show offline message if request is to new html page
//                             if (event.request.headers.get('accept').includes('text/html'))
//                                 return cache.match('/offline.html');
//                         });
//                     });
//             })
//     );
// });

// INFO Cache ONLY strategy - good for small projects maybe?
// self.addEventListener('fetch', (event) =>
// {
//     event.respondWith(
//         caches.match(event.request)
//     );
// });

// INFO Network ONLY strategy
// self.addEventListener('fetch', (event) =>
// {
//     event.respondWith(
//         fetch(event.request)
//     );
// });