/* =====================================================================
 * Filosofuss — Service Worker (PWA, soporte offline)
 * JS plano, sin dependencias externas. Se sirve desde /sw.js
 * Estrategia:
 *   - Precacheo del app shell + página offline al instalar.
 *   - Navegaciones: network-first (fallback al shell cacheado y a
 *     /offline.html). No cachea errores ni respuestas no-HTML.
 *   - Assets del mismo origen (JS/CSS/img): stale-while-revalidate.
 *   - Audio (.m4a/.mp3): on-demand, fuera del precache (SWR).
 *   - Resto de peticiones (cross-origin, p. ej. Google Fonts): directas.
 * ===================================================================== */

// Nombre de caché versionado por build. `public/` es estático, así que la
// versión se mantiene aquí: al publicar una release, actualiza BUILD (fecha o
// hash) para invalidar las cachés antiguas (el `activate` ya borra las demás).
const BUILD = '2026-10-01';
const CACHE = `filosofuss-${BUILD}`;

// App shell que se precachea al instalar. Rutas absolutas (hosting en raíz).
// El audio (.m4a/.mp3) NO se precachea: se cachea on-demand al reproducir (SWR).
// Presupuesto de instalación: ≤1 MiB (HTML shell + manifest + página offline).
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/offline.html',
];

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

  // El propio SW nunca se cachea (SEC-27/W-02): siempre se sirve de la red.
  const url = new URL(request.url);
  if (url.pathname.endsWith('/sw.js')) return;

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
          // Sin red: app shell cacheado o página offline dedicada.
          const cache = await caches.open(CACHE);
          const cached =
            (await cache.match('/index.html')) ||
            (await cache.match('/')) ||
            (await cache.match('/offline.html'));
          if (cached) return cached;
          return Response.error();
        }
      })()
    );
    return;
  }

  // 2) Recursos del mismo origen (JS/CSS/imagen/audio): stale-while-revalidate.
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

  // 3) Resto de peticiones (cross-origin no gestionadas, p. ej. Google Fonts):
  //    no usamos event.respondWith: la petición pasa a la red por defecto.
});
