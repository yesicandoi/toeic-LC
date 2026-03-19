const CACHE_NAME = "no-cache-app";

/* 설치 즉시 활성화 */
self.addEventListener("install", (event) => {
  self.skipWaiting();
});

/* 이전 캐시 전부 삭제 */
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(key => caches.delete(key)))
    )
  );
  self.clients.claim();
});

/* 🔥 모든 요청 → 항상 최신 네트워크 */
self.addEventListener("fetch", (event) => {
  event.respondWith(
    fetch(event.request, { cache: "no-store" })
      .catch(() => caches.match(event.request))
  );
});
