const CACHE_NAME = "gm-assistant-v6";

const APP_SHELL = [
  "./",
  "./manifest.webmanifest",
  "./icon.svg",
  "./history-fix.js"
];

function injectHistoryFix(html) {
  if (html.includes('history-fix.js')) return html;
  return html.replace('</body>', '<script src="history-fix.js"></script>\n</body>');
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
