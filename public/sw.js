const V = 'sk-v3'
const SHELL = ['/', '/index.html', '/manifest.webmanifest', '/logo.png', '/logo-light.png']
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(V).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()))
})
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== V).map((k) => caches.delete(k)))).then(() => self.clients.claim()))
})
self.addEventListener('fetch', (e) => {
  const req = e.request
  if (req.method !== 'GET') return
  const url = new URL(req.url)
  if (url.origin !== location.origin) return // Supabase & font Google tidak disentuh
  if (url.pathname === '/version.json' || url.pathname === '/sw.js') return // selalu dari jaringan
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req).then((r) => { if (r.ok) { const c = r.clone(); caches.open(V).then((x) => x.put('/index.html', c)) } return r })
        .catch(() => caches.match('/index.html'))
    )
    return
  }
  e.respondWith(caches.match(req).then((hit) => {
    const net = fetch(req).then((r) => { if (r.ok) { const c = r.clone(); caches.open(V).then((x) => x.put(req, c)) } return r }).catch(() => hit)
    return hit || net
  }))
})
self.addEventListener('notificationclick', (e) => {
  e.notification.close()
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((cs) => (cs[0] ? cs[0].focus() : self.clients.openWindow('/app'))))
})
