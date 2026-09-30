/* =====================================================================
 * Filosofuss — Service Worker (PWA, soporte offline)
 * JS plano, sin dependencias externas. Se sirve desde /sw.js
 * Estrategia:
 *   - Precacheo del app shell al instalar.
 *   - Navegaciones: network-first (fallback a /index.html y /).
 *   - Assets del mismo origen (JS/CSS/img/audio): stale-while-revalidate.
 *   - Google Fonts: network-first con caché de respaldo.
 * ===================================================================== */

// Nombre de caché versionado por build. `public/` es estático, así que la
// versión se mantiene aquí: al publicar una release, actualiza BUILD (fecha o
// hash) para invalidar las cachés antiguas (el `activate` ya borra las demás).
const BUILD = '2026-09-30';
const CACHE = `filosofuss-${BUILD}`;

// App shell que se precachea al instalar. Rutas absolutas (hosting en raíz).
// El audio (MP3) NO se precachea: se cachea on-demand al reproducir (SWR).
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
];

// Fallback offline mínimo inline (evita depender de un asset externo que no
// forma parte del precache). Se sirve solo cuando no hay red ni app shell cacheado.
const OFFLINE_HTML =
  '<!doctype html><html lang="es"><head><meta charset="utf-8">' +
  '<meta name="viewport" content="width=device-width,initial-scale=1">' +
  '<title>Sin conexión · Filosofuss</title>' +
  '<style>body{margin:0;min-height:100svh;display:flex;align-items:center;' +
  'justify-content:center;background:#0A0A0F;color:#ECE8E1;' +
  'font:16px/1.6 system-ui,sans-serif;text-align:center;padding:24px}' +
  'a{color:#C9A96A}</style></head><body><main><h1>Sin conexión</h1>' +
  '<p>Comprueba tu conexión y vuelve a intentarlo.</p>' +
  '<p><a href="./">Reintentar</a></p></main></body></html>';

// --- Instalación: precacheo del app shell. ---------------------------
self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(CACHE);
        // addAll falla si falta un archivo; lo envolvemos para no romper la instalación.
        await cache.addAll(PRECACHE_URLS);
      } catch (err) {
        console.warn('[SW] Precacheo parcial (algunos archivos pueden faltar):', err);
      }
      self.skipWaiting();
    })()
  );
});

// --- Activación: limpiar cachés antiguas y tomar el control. ---------
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))
      );
      await self.clients.claim();
    })()
  );
});

// --- Fetch: estrategias por tipo de petición. ------------------------
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Solo gestionamos GET. El resto pasa al navegador.
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  const sameOrigin = url.origin === self.location.origin;

  // 1) Navegaciones (carga de documentos HTML): network-first.
  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          const fresh = await fetch(request);
          // Solo cacheamos respuestas correctas y de tipo HTML (SEC-26/W-01):
          // nunca errores, redirecciones ni respuestas opacas como app shell.
          const contentType = fresh.headers.get('content-type') || '';
          if (fresh.ok && contentType.includes('text/html')) {
            const cache = await caches.open(CACHE);
            cache.put('/index.html', fresh.clone()).catch(() => {});
          }
          return fresh;
        } catch (err) {
          // Sin red: app shell cacheado o fallback offline mínimo inline.
          const cache = await caches.open(CACHE);
          const cached =
            (await cache.match('/index.html')) || (await cache.match('/'));
          if (cached) return cached;
          return new Response(OFFLINE_HTML, {
            status: 200,
            headers: { 'content-type': 'text/html; charset=utf-8' },
          });
        }
      })()
    );
    return;
  }

  // 2) Google Fonts: network-first con caché de respaldo (offline tras 1ª visita).
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(
      (async () => {
        try {
          const fresh = await fetch(request);
          if (fresh && fresh.ok) {
            const cache = await caches.open(CACHE);
            cache.put(request, fresh.clone()).catch(() => {});
          }
          return fresh;
        } catch (err) {
          const cache = await caches.open(CACHE);
          const cached = await cache.match(request);
          return cached || fetch(request).catch(() => Response.error());
        }
      })()
    );
    return;
  }

  // 3) Recursos del mismo origen (JS/CSS/imagen/audio): stale-while-revalidate.
  if (sameOrigin) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE);
        const cached = await cache.match(request);
        // En paralelo: traemos de red y actualizamos el caché (revalidación).
        const networkPromise = fetch(request)
          .then((fresh) => {
            if (fresh && fresh.ok) {
              cache.put(request, fresh.clone()).catch(() => {});
            }
            return fresh;
          })
          .catch(() => null);
        // Si hay caché, lo devolvemos ya; si no, esperamos a la red.
        return cached || (await networkPromise) || Response.error();
      })()
    );
    return;
  }

  // 4) Resto de peticiones (cross-origin no gestionadas): navegador normal.
  //    No usamos event.respondWith: la petición pasa a la red por defecto.
});
