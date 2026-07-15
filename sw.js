/* Service Worker: macht das Übergabeprotokoll offline nutzbar.
   Beim ersten Besuch wird die Seite zwischengespeichert;
   danach lädt sie auch ohne Internetverbindung. */
const CACHE = "uebergabeprotokoll-v2";

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(["./", "./index.html"]))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    // Erst Netz versuchen (damit Updates ankommen), sonst Cache
    fetch(e.request)
      .then((resp) => {
        const kopie = resp.clone();
        caches.open(CACHE).then((c) => c.put(e.request, kopie));
        return resp;
      })
      .catch(() =>
        caches.match(e.request, { ignoreSearch: true })
          .then((r) => r || caches.match("./index.html"))
      )
  );
});
