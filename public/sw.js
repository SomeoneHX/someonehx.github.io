/* Someone.HX PWA Service Worker
 * 策略：
 *  - 导航请求（HTML）：network-first，离线回退缓存或首页
 *  - 其余同源 GET（JS/CSS/图片/feed 等）：stale-while-revalidate
 * 发布新版本时递增 VERSION 即可让客户端更新缓存。
 */
const VERSION = 'v1'

const PRECACHE_URLS = [
  '/',
  '/manifest.webmanifest',
  '/icon-192.png',
  '/icon-512.png',
  '/favicon.svg',
  '/og-default.png',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(VERSION)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  const req = event.request
  if (req.method !== 'GET' || !req.url.startsWith(self.location.origin)) return

  /* 页面导航：network-first，离线时用缓存页面，再退到首页 */
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone()
          caches.open(VERSION).then((cache) => cache.put(req, copy))
          return res
        })
        .catch(async () => {
          const cached = await caches.match(req)
          return cached || caches.match('/')
        })
    )
    return
  }

  /* 静态资源：缓存优先，后台更新 */
  event.respondWith(
    caches.match(req).then((cached) => {
      const network = fetch(req)
        .then((res) => {
          if (res && res.status === 200) {
            const copy = res.clone()
            caches.open(VERSION).then((cache) => cache.put(req, copy))
          }
          return res
        })
        .catch(() => cached)
      return cached || network
    })
  )
})
