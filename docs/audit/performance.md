# Auditoría de rendimiento — Filosofuss

- **Repositorio:** `/home/deploymodeio/proyectos/filosofuss`
- **Rama:** `nivel-dios`
- **Fecha:** 2026-09-30
- **Tipo:** auditoría **read-only** (rendimiento). No se modificó código fuente ni se hizo commit/push. Único artefacto creado: este documento.
- **Herramientas disponibles y usadas:** Node v22.20.0, npm 10.9.3, `tsc` 5.9.3, Vite 5.4.21, `gzip`, `ffprobe` (FFmpeg), **Chromium vía Playwright** (medición real con CDP). `brotli` y `lighthouse` **no** están instalados; no se instalaron (restricción).

---

## Resumen ejecutivo

- `npm run build` **pasa completo** (typecheck `tsc` + `vite build`), **exit 0**, `✓ 1965 modules transformed`, `✓ built in 2.14s`.
- **JS inicial real:** 558,329 B en crudo / **167,998 B gzip (~164 KiB)**. Pero el **transfer total medido en la primera carga es 370,211 B (~361 KiB)** porque **las fuentes de Google aportan 190,548 B (~186 KiB, el 51,5 %)**.
- El chunk `index` inicial (262,292 B / 72,536 gzip) **arrastra todo el corpus** (507 citas + traducciones EN + 1.014 ids de narración). El `lazy()` de 3 rutas ahorra apenas **5,398 B gzip** porque esas rutas comparten `QuoteCard` y datos con `Home` (que es *eager*).
- **Peor hallazgo de runtime:** `/explorar` monta **507 `QuoteCard` sin virtualización → 35.748 nodos DOM y 73,1 MB de heap**, con LCP 2.636 ms y 15 *long tasks* (1.619 ms). Al teclear en el buscador se disparan **35 *long tasks* adicionales (6.035 ms acumulados, máx. 619 ms)**.
- **Peor hallazgo de red/datos móviles:** el service worker **precachea las 5 pistas musicales (~34,8 MiB) en la instalación** (`sw.js`), y el `AudioContext` **pide metadatos del mp3 de 13,3 MB en el arranque**.

---

## Tabla de hallazgos

| ID | Hallazgo | Severidad | Evidencia (comando / archivo:línea) | Impacto estimado (KB/ms o cualitativo) | Esfuerzo | Recomendación |
|----|----------|-----------|--------------------------------------|-----------------------------------------|----------|---------------|
| **P-01** | El SW precachea **las 5 pistas musicales** en `install` (mp3 de hasta 13,3 MB). | **Alta** | `public/sw.js:14-23` (PRECACHE_URLS incluye los 5 mp3) + `public/sw.js:32` `cache.addAll(...)`; registro en `src/main.tsx:17-19` tras `load`. Medido: `find public/audio -maxdepth 1 -f -printf '%s\n' \| paste -sd+ \| bc` = **36.511.278 B (34,8 MiB)**. | ~34,8 MiB de descarga en 1ª visita (datos móviles); enlaces lentos saturados; el `addAll` falla si falta un archivo y aborta el precacheo. | S | Quitar los mp3 de `PRECACHE_URLS` (precachear solo app shell: `/`, `/index.html`, manifest). Cachear audio **on-demand** con `stale-while-revalidate` (ya existe) o `range` requests. |
| **P-02** | `AudioContext` asigna `src` de la pista 0 al montar con `preload='metadata'` → petición de metadatos de un mp3 de **13,3 MB** en el arranque. | Media | `src/context/AudioContext.tsx:140-151` (efecto en `trackIndex=0`) + `:159` `audio.preload='metadata'`. Medido (Playwright/CDP): en `/` se hace 1 request a `emand_edroff-ishopanishad_intimate-480016.mp3` (~300 B, range de metadatos). | Petición de red no solicitada por el usuario en cada arranque; coste de handshake/range. | S | No asignar `src` hasta la primera interacción del usuario; `audio.preload='none'`. |
| **P-03** | El corpus completo (507 citas ES + 507 traducciones EN + 1.014 ids de voz + 37 filósofos) se bundlea en el **chunk inicial**. | **Alta** | `src/data/quotes.ts:1630-1637` (spread de batches) y `:1669` (import de `quotesEn`); `src/context/NarrationContext.tsx:11` importa `voiceManifest`. Verificado: `grep -c q-socrates-1 dist/assets/index-B2q1fgVP.js` = 1. Data fuente: `cat src/data/*.ts src/i18n/strings.ts \| wc -c` = **249.442 B**. | **72.536 B gzip** del chunk `index` son mayoritariamente datos; parse/compile JS y memoria en el arranque. | M | `import()` dinámico del corpus por ruta/idioma, o `fetch()` de JSON por locale; cargar `quotesEn` solo si `locale==='en'`. |
| **P-04** | `framer-motion` se importa siempre como `motion` (bundle completo); **no se usa `LazyMotion`/`m`**. | Media | `grep -rn "from 'framer-motion'" src` → 14 archivos con `motion`; `grep -rn "LazyMotion" src` → **0**. Chunk `motion` = **117.034 B / 38.850 gzip**. | Hasta ~15–25 KB gzip potencialmente evitables (features de animación no usadas). | M | Envolver en `LazyMotion features={domAnimation}` y usar `m.*` en lugar de `motion.*`; mover animaciones pesadas a rutas no críticas. |
| **P-05** | `BrowseQuotes` renderiza **las 507 tarjetas a la vez** (sin virtualización ni paginación). | **Alta** | `src/components/sections/BrowseQuotes.tsx:164-182` (`results.map`); medido en `/explorar`: **35.748 nodos DOM**, **73,1 MB heap**, LCP **2.636 ms**, **15 long tasks / 1.619 ms**. | Frame inicial largo, memoria alta, riesgo de crash en móviles de gama baja. | L | Virtualizar (`@tanstack/react-virtual`/`react-window`) o paginar/cargar por lotes; `content-visibility:auto` en las tarjetas. |
| **P-06** | Teclear en el buscador re-renderiza todo el componente y cientos de tarjetas (no hay `React.memo`). | **Alta** | `src/components/sections/BrowseQuotes.tsx:19,29-32,102` (`query` en estado local; debounce solo afecta al filtrado) + `QuoteCard` sin memo (`grep -rn "React.memo" src` → **0**). Medido: teclear 9 chars = **+35 long tasks, 6.035 ms acumulados, máx. 619 ms**. | Jank severo por pulsación; input con lag. | M | `React.memo(QuoteCard)`, aislar el `<input>` de la lista, `useDeferredValue`/`startTransition` para el filtrado, y `useMemo` de chips. |
| **P-07** | Cada `QuoteCard` instancia 4 `useMotionValue`, 2 `useSpring`, 2 `useTransform`, 1 `useMotionTemplate` y 3 `AnimatePresence`. | **Alta** | `src/components/quotes/QuoteCard.tsx:100-114` (tilt/spotlight) y `:297-358` (3 `AnimatePresence`); ×507 tarjetas en `/explorar`. | Cientos de springs/animation frames activos; coste de CPU y memoria lineal con el nº de tarjetas. | M | Separar tarjeta "rica" (destacada) de tarjeta de lista; desactivar tilt/spotlight/`AnimatePresence` por icono en listas largas. |
| **P-08** | `AnimatePresence mode="popLayout"` + `layout` en **cada** tarjeta de la cuadrícula. | **Alta** | `src/components/sections/BrowseQuotes.tsx:164-181` (`<motion.div layout>` por resultado). | Cada cambio de filtro/orden mide y anima el layout de cientos de nodos (reflow + animación). | M | Animar solo entrada/salida de contenedores, no `layout` por tarjeta; aplicar animación solo al primer render (`viewport once`). |
| **P-09** | `AnimatedQuote` crea **un `<motion.span>` por palabra**. | Media | `src/components/quotes/AnimatedQuote.tsx:40-48`; usado en `Hero.tsx:61` y `QuoteOfDay.tsx:65`. | Decenas de nodos animados por cita; multiplica coste en textos largos. | S | Animar el bloque completo (clip/mask) o marcar palabras con CSS `animation-delay` sin Framer Motion. |
| **P-10** | `currentTime` vive en el `value` del `AudioContext` y se actualiza en cada `timeupdate` (~4 Hz) desde el provider raíz. | Media | `src/context/AudioContext.tsx:53,166,211-246`; `NarrationProvider` consume `useAudio()` y envuelve toda la app (`App.tsx:34-55`). | Re-render del árbol completo ~4 veces/seg mientras suena audio; churn de reconciliación. | M | Exponer el progreso por **suscripción** (`useSyncExternalStore`/ref) fuera del contexto, o separar un `AudioProgressContext` ligero; no incluir `currentTime` en el `value`. |
| **P-11** | Fuentes: 4 familias / 20 estilos en `index.html`; **190,5 KB medidos** en la 1ª carga. | Media | `index.html:49` (`Cinzel` 3 + `Cormorant Garamond` 6 + `Inter` 5 + `Playfair Display` 6); medido con CDP: 5 woff2 = 48.391+39.396+38.538+37.769+26.446 = **190.548 B (51,5 % del transfer inicial)**. Sí usa `display=swap` y `preconnect` (bien). | Es el mayor coste de red del arranque; bloquea el *swap* de texto (FOUT/CLS). | M | Reducir familias/pesos a los realmente usados, **self-host** con subsetting (`latin`) + `unicode-range`, `font-display:swap`, y/o `size-adjust` en la fallback. |
| **P-12** | Audio muy pesado: música **MP3 256 kbps**; voz **MP3 48 kbps**. Total `public/audio` **70,5 MB**. | Media | `ffprobe`: `bit_rate=256000` (música), `48000` (voz); `du -sb public/audio` = **70.537.614 B** (música 36.511.278; voz 34.026.336; 1.019 archivos). | Música: ~1 MB/min; 5 pistas ≈ 35 MB. Voz: ~0,5–0,6 MB por cita en MP3. | M/L | Música a **Opus 96–128 kbps** (o AAC), voz a **Opus 24–32 kbps**; servir `preload="none"` y streaming por rango. |
| **P-13** | El `lazy()` de rutas es casi inefectivo: los chunks diferidos suman **5.398 B gzip**. | Media | Chunks: `BrowseQuotes` 2.344 + `Favorites` 1.092 + `PhilosopherWall` 1.962 (gzip); comparten `QuoteCard`/datos con `Home` (eager, `App.tsx:13`). | El objetivo de "reducir bundle inicial" no se logra: lo pesado (datos+`QuoteCard`+motion) ya está en el chunk inicial. | M | Sacar datos y `QuoteCard` del camino crítico (import dinámico dentro de cada ruta); dividir el corpus por ruta. |
| **P-14** | `ParticleField` usa canvas 2D con **rAF continuo** en el hilo principal; `AuroraBackground` anima 4 blobs con `filter: blur(50px)`. | Media | `src/components/effects/ParticleField.tsx:67-85` (rAF), `:18` (`Math.min(70, …)` partículas); `AuroraBackground.tsx:81-95` (x/y/scale + `filter`), `SceneBackground.tsx` fijo (`App.tsx:37`). Bien: pausa en `visibilitychange` (`:121-125`) y respeta `prefers-reduced-motion` (CSS global `index.css:~370`). | CPU/GPU constante; `blur(50px)` sobre blobs grandes es costoso en pintado. | M | Reducir nº de partículas/blobs, evitar `filter: blur` animado (pre-renderizar o usar gradientes), `will-change: transform` en los blobs y `contain: paint` en el contenedor. |
| **P-15** | `searchQuotes` reconstruye y **normaliza el haystack de las 507 citas en cada búsqueda**; los filtros llaman `getPhilosopherById` por ítem. | Media | `src/data/quotes.ts` (`searchQuotes`: `quotes.filter(... normalize([...]) )`); `BrowseQuotes.tsx:34-51`. Medido: jank al teclear (P-06). | ~507 × `normalize()` + concatenación por consulta; coste notable en cada debounce. | M | Precomputar un índice de búsqueda normalizado (una vez) y reutilizarlo; precomputar `Map<philosopherId, era/school>`. |
| **P-16** | `PhilosopherWall` hace `getQuotesByPhilosopher(p.id)` por cada filósofo (O(F×Q)) en cada render. | Baja/Media | `src/components/sections/PhilosopherWall.tsx:83` (map sobre 37 filósofos) y `:59`; `quotes.ts` `getQuotesByPhilosopher` filtra el corpus. | 37 × 507 ≈ 18.759 iteraciones por render; se re-ejecuta sin `useMemo`. | S | Precomputar `Map<philosopherId, Quote[]>` una vez (y `useMemo` del resultado). |
| **P-17** | No se emiten `.br` (Brotli) y no hay `content-visibility`/`contain` en CSS. | Baja | `find dist -name '*.br'` → 0; `grep -rn "content-visibility\|contain:" src` → 0. | Sin Brotli se pierde ~15–20 % de compresión frente a gzip en JS/CSS. | S | Habilitar Brotli en el servidor/CDN y precompresión (`vite-plugin-compression`); añadir `content-visibility:auto` a secciones fuera de viewport. |

> Nota: P-17 depende del hosting, no del código; se incluye por impacto medible en transferencia.

---

## Bundle baseline

Comando: `npm run build` → **exit 0**. Salida de Vite (raw / gzip reportado por Vite, contrastado con `gzip -c file | wc -c`):

| Chunk (dist/assets) | Raw (B) | Gzip (B) | Carga inicial | Contenido |
|---|---:|---:|:---:|---|
| `index-B2q1fgVP.js` | 262.292 | 72.536 | **Sí** (entry) | App + todas las páginas eager + **todo el corpus de datos** (`quotes`, `quotesEn`, `philosophers`, `voiceManifest`) |
| `react-BYdsr6iT.js` | 163.451 | 53.293 | **Sí** (modulepreload) | `react` + `react-dom` + `react-router-dom` |
| `motion-LYqEdoT2.js` | 117.034 | 38.850 | **Sí** (modulepreload) | `framer-motion` (bundle completo) |
| `icons-B9VZhAlh.js` | 15.552 | 3.319 | **Sí** (modulepreload) | `lucide-react` |
| `index-CwypfDRC.css` | 26.575 | 6.192 | Sí (`<link>`) | Tailwind + design system |
| `BrowseQuotes-D-52I0ex.js` | 6.619 | 2.344 | No (lazy) | Ruta `/explorar` |
| `PhilosopherWall-DGHanQEG.js` | 5.201 | 1.962 | No (lazy) | Ruta `/filosofos` |
| `Favorites-Dev18_8X.js` | 2.402 | 1.092 | No (lazy) | Ruta `/favoritos` |
| `index.html` | 4.223 | 1.536 | Sí | Shell + `<script type=module>` + 3 `modulepreload` + `<link>` CSS |

**Totales:**
- **JS inicial (raw):** 262.292 + 163.451 + 117.034 + 15.552 = **558.329 B (~545 KiB)**.
- **JS inicial (gzip):** 72.536 + 53.293 + 38.850 + 3.319 = **167.998 B (~164 KiB)**.
- **JS+CSS inicial (gzip):** 174.190 B.
- **Transfer inicial real medido (CDP):** **370.211 B (~361 KiB)** — incluye **190.548 B de fuentes** + 1.909 B de CSS de Google + 1.794 B de HTML.
- **`dist/` total: 71.399.374 B (~68,1 MiB)**: `assets` 599.126 B, **`audio` 70.537.614 B**, `icons` 251.546 B, resto (html/manifest/sw/icon) ~11 KB.
- **Reparto de `public/audio` (70.537.614 B):** música 36.511.278 B (5 archivos) · voz 34.026.336 B (1.014 archivos: 507 `es` + 507 `en`).
- **`public/icons`:** 251.546 B (mayores: `icon-512.png` 101.498, `icon-512-maskable.png` 75.021, `icon-256.png` 33.442).

### Evaluación de `manualChunks` (`vite.config.ts:14-22`)

```ts
manualChunks: {
  react: ['react', 'react-dom', 'react-router-dom'],
  motion: ['framer-motion'],
  icons: ['lucide-react'],
}
```

- **Positivo:** separa vendors estables → buen cacheo entre despliegues; el reparto es correcto y determinista.
- **Limitación 1:** no hay chunk para **datos de la app**. Todo el corpus cae en `index` (262 KB raw), que es el chunk que cambia con más frecuencia (código de app + datos) y se re-descarga en cada release.
- **Limitación 2:** `motion` se agrupa entero, pero además **todo el proyecto usa `motion` (no `m`+`LazyMotion`)**, así que no hay tree-shaking de features (P-04).
- **Recomendación:** añadir un chunk/​import dinámico para `src/data` (o JSON por locale) y valorar `manualChunks` como función que aísle `@/data/*`. Mantener react/motion/icons como vendors está OK.

---

## Initial load waterfall (ruta `/`, 1366×900, Chromium headless, red local)

Medición real con Playwright + CDP (`Network.loadingFinished.encodedDataLength` y `performance`):

1. **HTML** `/` → 1.794 B. `modulepreload` de react/motion/icons y `<link>` de CSS en cabeza.
2. **JS entry** `index-B2q1fgVP.js` → **72.608 B** (gzip). Bloqueante para el mount de React.
3. **Chunks vendor** (en paralelo, preload): `react` **53.785 B**, `motion` **39.362 B**, `icons` **3.671 B**.
4. **CSS** `index-CwypfDRC.css` → **6.542 B**.
5. **Google Fonts**: CSS → 1.909 B → 5 archivos woff2 → **190.548 B** (`Inter` 48.391, `Cormorant Garamond` ×2 39.396+37.769, `Playfair Display` 38.538, `Cinzel` 26.446).
6. **Audio (P-02):** 1 range request de metadatos a `emand_edroff-ishopanishad_…mp3` (~300 B).
7. **En paralelo, fuera del frame:** el SW registrado (`main.tsx:18`) ejecuta `cache.addAll` de `PRECACHE_URLS` → descarga en segundo plano de los **5 mp3 (≈34,8 MiB)** (P-01).

**Métricas de `/`:**
| Métrica | Valor |
|---|---|
| DOMContentLoaded / load | 152–174 ms |
| First Paint | 164 ms |
| First Contentful Paint | 328 ms |
| **LCP** | **1.312 ms** |
| Long tasks | 1 (117 ms) |
| Nodos DOM | 659 |
| JS heap | 9,5 MB |
| Transfer total | **370.211 B** |

**Métricas de `/explorar` (ruta lazy, 507 tarjetas):**
| Métrica | Valor |
|---|---|
| LCP | **2.636 ms** |
| Long tasks (al montar) | **15** (1.619 ms acumulados; máx. 464 ms) |
| Nodos DOM | **35.748** |
| JS heap | **73,1 MB** |
| Tarjetas (`blockquote`) | 507 |

**Al teclear `sabiduria` (9 caracteres, 80 ms/char):** +35 long tasks, **6.035 ms de long-task acumulado**, máximo **619 ms** → jank severo por pulsación.

---

## Limitaciones

- **Lighthouse no está instalado** y no se instaló (restricción). No hay puntuación Lighthouse/Web Vitals “oficial”; se usaron **mediciones reales con Chromium (Playwright/CDP)** sobre `vite preview`, que son válidas para tam­año de transferencia, DOM, heap y long tasks, pero **no** son un entorno de red throttled ni un dispositivo de gama baja.
- **Brotli no está instalado**: solo se reporta `gzip`. Los servidores con Brotli transferirán típicamente ~15–20 % menos en JS/CSS.
- `vite preview` sirve con compresión (los transferSize medidos ≈ gzip); un hosting sin compresión transferiría los tamaños **raw**.
- Las cifras de **parse/compile JS** y cualquier coste de GPU del canvas/`blur` son **estimaciones cualitativas**, no medidas aisladas.
- El precacheo del SW (P-01) ocurre en el target del Service Worker, fuera del scope `Network` de la página; se cuantifica por el contenido de `PRECACHE_URLS` + `du`, no por captura de red de la página.
- `quotesEn` (77.559 B de fuente) se importa de forma eager dentro de `quotes.ts`, aunque solo se use con `locale==='en'`.
- No se han ejecutado tests de rendimiento en Android/Capacitor (solo web en Chromium de escritorio).

---

## Priorización sugerida (esfuerzo vs impacto)

1. **Rápido y gran impacto móvil:** P-01 (quitar mp3 del precache SW) y P-02 (`preload='none'`, `src` bajo interacción) → S, evitan ~35 MB en 1ª visita.
2. **Gran impacto de runtime:** P-05/P-06/P-07/P-08 (virtualización + `React.memo` + quitar `layout`/tilt masivo en listas) → reduce 35.748 nodos y los 6 s de long tasks al buscar.
3. **Bundle:** P-03/P-13/P-04 (dinamizar datos por ruta/idioma + `LazyMotion`/`m`) → reduce el chunk inicial y hace efectivo el `lazy()`.
4. **Red:** P-11 (fuentes, 51,5 % del transfer inicial) y P-12 (Opus/AAC).
5. **Barato:** P-09, P-16, P-17.
