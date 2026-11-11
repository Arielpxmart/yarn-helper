// 離線快取：改了 App 檔案就把版本號 +1（index.html 的 APP_VERSION 也要一起改），手機重開後會更新
const CACHE = 'yarn-helper-v14';
const ASSETS = ['./', './index.html', './core.js', './howto.js', './manifest.webmanifest', './icon-180.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// 先用快取（離線可用），同時在背景抓新版更新快取
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;
  e.respondWith(
    caches.open(CACHE).then(async cache => {
      const key = e.request.mode === 'navigate' ? './index.html' : e.request;
      const cached = await cache.match(key, { ignoreSearch: true });
      const network = fetch(e.request)
        .then(res => { if (res.ok) cache.put(key, res.clone()); return res; })
        .catch(() => null);
      return cached || (await network) || new Response('離線中，且尚未快取', { status: 503 });
    })
  );
});
