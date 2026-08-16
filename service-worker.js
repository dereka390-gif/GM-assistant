const CACHE_NAME = "gm-assistant-v15";

const APP_SHELL = [
  "./",
  "./manifest.webmanifest",
  "./icon.svg",
  "./history-fix.js",
  "./week-ending-fix.js",
  "./communication-studio.js",
  "./communication-customizer.js",
  "./mascot-safe.js",
  "./mascot-click-fix.js",
  "./communication-drag-layout.js",
  "./communication-pinch-scale.js"
];

function injectHistoryFix(html) {
  let out = html;
  out = out.replace(/<script[^>]*src=["']poster-builder\.js["'][^>]*><\/script>\s*/gi, '');
  out = out.replace(/<script[^>]*src=["']mascot-pack\.js["'][^>]*><\/script>\s*/gi, '');
  out = out.replace(/<script[^>]*src=["']communication-customizer-v2\.js["'][^>]*><\/script>\s*/gi, '');
  if (!out.includes('history-fix.js')) out = out.replace('</body>', '<script src="history-fix.js"></script>\n</body>');
  if (!out.includes('week-ending-fix.js')) out = out.replace('</body>', '<script src="week-ending-fix.js"></script>\n</body>');
  if (!out.includes('communication-studio.js')) out = out.replace('</body>', '<script src="communication-studio.js"></script>\n</body>');
  if (!out.includes('communication-customizer.js')) out = out.replace('</body>', '<script src="communication-customizer.js"></script>\n</body>');
  if (!out.includes('mascot-safe.js')) out = out.replace('</body>', '<script src="mascot-safe.js"></script>\n</body>');
  if (!out.includes('mascot-click-fix.js')) out = out.replace('</body>', '<script src="mascot-click-fix.js"></script>\n</body>');
  if (!out.includes('communication-drag-layout.js')) out = out.replace('</body>', '<script src="communication-drag-layout.js"></script>\n</body>');
  if (!out.includes('communication-pinch-scale.js')) out = out.replace('</body>', '<script src="communication-pinch-scale.js"></script>\n</body>');
  return out;
}

function patchedHtmlResponse(html, sourceResponse) {
  const headers = new Headers(sourceResponse ? sourceResponse.headers : {});
  headers.set('content-type', 'text/html; charset=utf-8');
  return new Response(injectHistoryFix(html), {
    status: sourceResponse ? sourceResponse.status : 200,
    statusText: sourceResponse ? sourceResponse.statusText : 'OK',
    headers
  });
}

self.addEventListener("install", event => {
  self.skipWaiting();
  event.waitUntil(
    Promise.all([
      caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)),
      fetch('./index.html', { cache: 'no-store' })
        .then(response => response.text().then(html => ({ response, html })))
        .then(({ response, html }) => caches.open(CACHE_NAME).then(cache => cache.put('./index.html', patchedHtmlResponse(html, response))))
        .catch(() => undefined)
    ])
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    Promise.all([
      caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))),
      self.clients.claim()
    ])
  );
});

self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request, { cache: "no-store" })
        .then(response => response.text().then(html => ({ response, html })))
        .then(({ response, html }) => {
          const patched = patchedHtmlResponse(html, response);
          const cacheCopy = patched.clone();
          caches.open(CACHE_NAME).then(cache => cache.put("./index.html", cacheCopy));
          return patched;
        })
        .catch(() => caches.match("./index.html"))
    );
    return;
  }
  if (new URL(request.url).origin === self.location.origin) {
    event.respondWith(
      fetch(request, { cache: "no-store" })
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match(request))
    );
  }
});