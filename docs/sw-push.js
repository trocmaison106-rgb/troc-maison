self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

// Réseau d'abord, copie en cache si hors ligne (nécessaire à l'installation PWA)
self.addEventListener("fetch", (e) => {
  const r = e.request;
  if (r.method !== "GET" || new URL(r.url).origin !== self.location.origin) return;
  e.respondWith(
    fetch(r).then((res) => {
      if (res.ok) { const c = res.clone(); caches.open("tm-v1").then((x) => x.put(r, c)); }
      return res;
    }).catch(async () =>
      (await caches.match(r)) ||
      (r.mode === "navigate" && (await caches.match(self.registration.scope))) ||
      Response.error()
    )
  );
});

self.addEventListener("push", (e) => {
  let p = {};
  try { p = e.data ? e.data.json() : {}; } catch (_) {}
  const d = p.data || p.notification || p;
  e.waitUntil(self.registration.showNotification(d.title || "Troc Maison", {
    body: d.body || "", tag: d.tag || undefined, data: { link: d.link || "./" },
  }));
});
self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.link) || "./";
  e.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((cs) => {
    for (const c of cs) if ("focus" in c) return c.focus();
    return self.clients.openWindow(url);
  }));
});
