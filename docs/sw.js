// Yanlış Defterim: uygulama dosyalarını telefona kaydeder, internetsiz açılmasını sağlar.
// Yeni sürümde aşağıdaki adı değiştirmek eski dosyaları temizler.
const CACHE = "yanlis-defterim-v24";
const FILES = [
  "./",
  "index.html",
  "manifest.webmanifest",
  "icon-v2-192.png",
  "icon-v2-512.png",
  "icon-v2-maskable-512.png",
  "apple-touch-icon-v2.png",
  "lib/jspdf.umd.min.js",
  "lib/pdf-fonts.js",
  "fonts/caveat-latin-700-normal.woff2",
  "fonts/caveat-latin-ext-700-normal.woff2",
  "fonts/lexend-latin-400-normal.woff2",
  "fonts/lexend-latin-500-normal.woff2",
  "fonts/lexend-latin-600-normal.woff2",
  "fonts/lexend-latin-700-normal.woff2",
  "fonts/lexend-latin-ext-400-normal.woff2",
  "fonts/lexend-latin-ext-500-normal.woff2",
  "fonts/lexend-latin-ext-600-normal.woff2",
  "fonts/lexend-latin-ext-700-normal.woff2"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((c) => c.addAll(FILES.map((f) => new Request(f, { cache: "reload" }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// The page itself: try the internet first (so updates arrive on their own), but give up
// after 3 seconds and use the saved copy, so the app still opens quickly offline.
// Only a real copy of the app is used: if the host answers with an error or with some other
// page (for example "site paused"), the saved copy opens instead and nothing is overwritten.
function pageFromNetwork(req) {
  // cache: "no-cache" asks the site every time; GitHub Pages otherwise lets the browser
  // reuse an old copy for 10 minutes, which delayed new versions.
  const net = fetch(req.url, { cache: "no-cache", credentials: "same-origin" }).then(async (res) => {
    if (!res.ok) return null;
    const text = await res.clone().text();
    if (text.indexOf("<title>Yanlış Defterim") < 0) return null;
    const copy = res.clone();
    caches.open(CACHE).then((c) => c.put("index.html", copy));
    return res;
  });
  const timeout = new Promise((resolve) => setTimeout(resolve, 3000));
  return Promise.race([net.catch(() => null), timeout]).then(
    (res) => res || caches.match("index.html").then((hit) => hit || net.catch(() => null).then((r) => r || fetch(req)))
  );
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) return;
  const path = new URL(req.url).pathname;
  if (req.mode === "navigate" || path.endsWith("/index.html")) {
    event.respondWith(pageFromNetwork(req));
    return;
  }
  event.respondWith(
    caches.match(req, { ignoreSearch: true }).then((hit) => {
      if (hit) return hit;
      return fetch(req)
        .then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(() => (req.mode === "navigate" ? caches.match("index.html") : Response.error()));
    })
  );
});
