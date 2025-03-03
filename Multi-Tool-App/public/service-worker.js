const CACHE_NAME = "multi-tool-app-v1"
const urlsToCache = [
  "/",
  "/todo",
  "/notes",
  "/budget",
  "/image-editor",
  "/audio-cutter",
  "/analytics",
  "/manifest.json",
  "/icon-192x192.png",
  "/icon-512x512.png",
]

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache)))
})

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response
      }
      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200 || response.type !== "basic") {
          return response
        }
        const responseToCache = response.clone()
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache)
        })
        return response
      })
    }),
  )
})

self.addEventListener("activate", (event) => {
  const cacheWhitelist = [CACHE_NAME]
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName)
          }
        }),
      )
    }),
  )
})

// Add offline fallback
self.addEventListener("fetch", (event) => {
  if (
    event.request.mode === "navigate" ||
    (event.request.method === "GET" && event.request.headers.get("accept").includes("text/html"))
  ) {
    event.respondWith(
      fetch(event.request.url).catch(() => {
        return caches.match("/offline.html")
      }),
    )
  }
})

