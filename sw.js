// Worker para la pwa (Progressive Web App)
self.addEventListener('fetch', event => {
  // No hacemos cache ni interceptamos nada, solo dejamos que siga normal.
  event.respondWith(fetch(event.request));
});
