/* 聖經Bible Service Worker：應用外殼快取，提供離線與加速。
   僅在同源（https / localhost，GitHub Pages 亦可）下運作；file:// 不會註冊。 */
const CACHE = "bible-v1";
const CORE = [
  "./",
  "./index.html",
  "./bible_v3_sticky_dropdown.html",
  "./bible.html",
  "./favicon.svg",
  "./favicon-32.png",
  "./favicon-192.png",
  "./favicon-512.png",
  "./apple-touch-icon.png",
  "./manifest.json",
  "./assets/bible_text.js",
  "./assets/hero-bible.jpg"
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => c.addAll(CORE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  const u = new URL(e.request.url);
  if (u.origin !== location.origin) return; // 不同源不攔截（如外部字型）
  e.respondWith(
    caches.match(e.request).then((cached) => {
      if (cached) return cached;
      return fetch(e.request)
        .then((res) => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(e.request, copy));
          }
          return res;
        })
        .catch(() => caches.match("./index.html")); // 離線退回首頁
    })
  );
});
