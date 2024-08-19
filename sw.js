const CACHE_NAME = "Page Transition SW";
let pageCache = [
    "./node_modules/pagewave/transition.js",
    "./node_modules/pagewave/OverlayPreset.css",
    "./node_modules/pagewave/KeyFramePreset.css",
];
self.addEventListener("fetch", (e) => {
    e.respondWith(
        caches.match(e.request).then(
            (response) => {
                if(response){
                    return response;
                }
                return fetch(e.request);
            }
        )
    )
});
self.addEventListener("install", (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then(
            (cache) => {return cache.addAll(pageCache);}
        )
    );
});
self.addEventListener("message", (event) => {
    fetch(event.data).then((response) => {
        if (!response.ok) {
          throw new TypeError("Bad response status");
        }
        caches.open(CACHE_NAME).then(
            (cache) => {return cache.put(event.data, response);}
        )  
    });

    
});