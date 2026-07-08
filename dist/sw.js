/* =====================================================================
 * Filosofuss — Service Worker (PWA, soporte offline)
 * JS plano, sin dependencias externas. Se sirve desde /sw.js
 * Estrategia:
 *   - Precacheo del app shell al instalar.
 *   - Navegaciones: network-first (fallback a /index.html y /).
 *   - Assets del mismo origen (JS/CSS/img/audio): stale-while-revalidate.
 *   - Google Fonts: network-first con caché de respaldo.
 * ===================================================================== */

const CACHE = 'filosofuss-v1';

// App shell que se precachea al instalar. Rutas absolutas (hosting en raíz).
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/audio/emand_edroff-ishopanishad_intimate-480016.mp3',
  '/audio/konstantinpazuzustudio-rain-on-the-roof-neoclassical-piano-514674.mp3',
  '/audio/meditativetiger-zen-master-bowl-wisdom-388631.mp3',
  '/audio/prettyjohn1-calming-zen-537655.mp3',
  '/audio/raspberrymusic-the-way-to-yourself-piano-cinematic-spiritual-410697.mp3',
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

  const url = new URL(request.url);
  const sameOrigin = url.origin === self.location.origin;

  // 1) Navegaciones (carga de documentos HTML): network-first.
  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          const fresh = await fetch(request);
          const cache = await caches.open(CACHE);
          cache.put('/index.html', fresh.clone()).catch(() => {});
          return fresh;
        } catch (err) {
          // Sin red: servimos el app shell cacheado.
          const cache = await caches.open(CACHE);
          return (
            (await cache.match('/index.html')) ||
            (await cache.match('/')) ||
            fetch(request).catch(() => Response.error())
          );
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
