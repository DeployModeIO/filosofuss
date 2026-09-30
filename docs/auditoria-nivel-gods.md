# Auditoría Nivel Dios — Filosofuss

> Informe ejecutivo consolidado de 4 auditorías independientes (seguridad, código/TypeScript, rendimiento/bundle y UX/a11y/SEO/PWA).

## 1. Portada

| Campo | Valor |
|---|---|
| **Proyecto** | `filosofuss` — `/home/deploymodeio/proyectos/filosofuss` |
| **Stack** | React 18.3 · TypeScript 5.5 · Vite 5.4.21 · Tailwind 3.4 · Framer Motion 11 · Capacitor 8 (Android) |
| **Rama** | `nivel-dios` |
| **Commit base** | `c3fd246` (2026-09-03) |
| **Fecha del informe** | **2026-09-30** |
| **Alcance** | Dependencias y secretos, XSS/CSP/cabeceras, Capacitor/Android, service worker; calidad de código y tipos; bundle, red y runtime; UX, accesibilidad WCAG, SEO y PWA |
| **Tipo** | Auditoría **100 % READ-ONLY**. No se modificó código fuente. Único artefacto: este documento. |

### Metodología

Cuatro auditorías paralelas sobre la misma rama, consolidadas sin re-ejecutar pruebas:

| Área | Informe fuente | Herramientas |
|---|---|---|
| Seguridad | `docs/audit/security.md` | `npm audit --json` (y `--package-lock-only`), `npm outdated`, grep de sinks/secretos, `git log -S`/escaneo de blobs, inspección de `Dockerfile`, `AndroidManifest.xml`, `build.gradle`, `public/sw.js` |
| Código / TS | `docs/audit/code.md` | `npm run typecheck` (tsc 5.9.3), `tsc` endurecido, grep/AST-ligero, `wc`/`find`, análisis de duplicación por script |
| Rendimiento / bundle | `docs/audit/performance.md` | `npm run build` (Vite 5.4.21), `gzip`, `du`, `ffprobe`, **Chromium vía Playwright + CDP** (métricas reales sobre `vite preview`) |
| UX / a11y / SEO / PWA | `docs/audit/ux-a11y-seo.md` | Lectura estática + cálculo de contraste WCAG con luminancia relativa sRGB |
| Baseline de entorno | `docs/audit/baseline-install.md` | `npm ci` (exit 0), Node v22.20.0, npm 10.9.3 |

### Limitaciones transversales de método

- **Sin Lighthouse instalado** (y no se instaló): no hay puntuación oficial de Web Vitals; el rendimiento se midió con Playwright/CDP sobre `vite preview` (no red throttled ni dispositivo de gama baja).
- **Contraste `glass` aproximado**: los valores de `--glass`/`--glass-strong` se calcularon por composición alpha sobre `--bg` plano; el contraste real sobre aurora/partículas (`backdrop-filter`) es variable.
- **Contraste de degradados evaluado por paradas de color** (peor caso), no por posición animada.
- **Service Worker en Capacitor inferido**: no se probó en dispositivo Android real; la conclusión se basa en los esquemas `file://`/`capacitor://` y la ausencia de guardas en `src/main.tsx`.
- **Sin DAST ni build Android**: cabeceras no probadas en servidor vivo; no se generó APK/AAB.
- **MCP codebase-memory no disponible** en la auditoría de código (0 proyectos indexados); análisis por grep/lectura directa.
- Sin Brotli instalado: el ahorro por Brotli (~15–20 % en JS/CSS) es estimado.

---

## 2. Resumen ejecutivo

### 2.1 Conteo por severidad (4 áreas, deduplicado)

Las cifras siguientes son las del **listado maestro consolidado** (§5), donde los hallazgos solapados se cuentan una sola vez (p. ej. precache de MP3 aparece en UX A6 y Rendimiento P-01 → una fila `PERF-01`).

| Área | Crítico | Alto | Medio | Bajo | Total |
|---|---:|---:|---:|---:|---:|
| Seguridad | 0 | 7 | 13 | 7 | 27 |
| Código / TypeScript | 0 | 3 | 9 | 15 | 27 |
| Rendimiento / Bundle | 0 | 6 | 9 | 2 | 17 |
| UX / A11y / SEO / PWA | 2 | 8 | 13 | 4 | 27 |
| **TOTAL** | **2** | **24** | **44** | **28** | **98** |

Además hay **6 controles de seguridad verificados limpios** (secretos, XSS, `noopener`, allowlist de audio, `npm ci`/`.dockerignore`, scope del SW) y un bloque amplio de **aspectos ya correctos** (§6), no contabilizados como hallazgos.

> Nota de consolidación: los informes originales reportan totales ligeramente distintos por su propio conteo y por solapamientos entre áreas (§7.3). El total de 98 es el número de hallazgos **únicos** tras fusionar duplicados.

### 2.2 Top 10 «los que más duelen» (impacto / esfuerzo)

| # | ID | Hallazgo | Sev. | Esf. | Por qué duele |
|---|---|---|---|---|---|
| 1 | `UX-02` | No existe ningún `<h1>` en ninguna ruta | Crítico | S | Fallo WCAG 1.3.1/2.4.6 + señal SEO; arreglo trivial |
| 2 | `PERF-01` | El SW precachea las 5 pistas MP3 (**~34,8 MiB**) en `install` | Alto | S | Descarga brutal en 1ª visita móvil; se arregla borrando entradas de `PRECACHE_URLS` |
| 3 | `PERF-05` | `/explorar` monta **507 `QuoteCard`** sin virtualizar → **35.748 nodos DOM / 73,1 MB heap** | Alto | L | Frame inicial largo, riesgo de crash en gama baja |
| 4 | `PERF-06` | Buscar re-renderiza cientos de tarjetas sin `React.memo` → **+35 long tasks / 6.035 ms** | Alto | M | Jank severo por pulsación |
| 5 | `UX-01` | Degradado de texto con `--accent-3` a **2.19:1** en logo y titulares | Crítico | M | Incumple WCAG 1.4.3 en todas las pantallas |
| 6 | `PERF-03` | Todo el corpus (507 ES + 507 EN + voz) va en el **chunk inicial** | Alto | M | 72.536 B gzip de datos parseados en el arranque |
| 7 | `COD-01` | Sin **Error Boundary** global → un fallo de render deja pantalla en blanco | Alta | S | Robustez mínima ausente; arreglo barato |
| 8 | `PERF-11` | Fuentes Google: **190,5 KB = 51,5 %** del transfer inicial | Media | M | Mayor coste de red del arranque y causa de CLS/FOUT |
| 9 | `SEC-10` | `react-router-dom@6.30.4`: **open redirect → XSS** (única dependencia productiva directa vulnerable) | Medio (pot. Alto) | S | Bump a `6.30.6`; explotabilidad actual baja pero es runtime productivo |
| 10 | `SEC-12` | **Sin CSP ni cabeceras de seguridad** en nginx | Medio | M | Es el riesgo principal según la auditoría de seguridad |

### 2.3 Mensaje clave (5 bullets)

- **La base es sana, la deuda es de políticas e infraestructura, no de tipos.** `typecheck` = 0 errores, sin `any`/`@ts-ignore`, sin secretos, sin sinks XSS; los problemas reales son flags estrictos apagados, ausencia de ESLint/tests/Error Boundary y falta de CSP/cabeceras.
- **El mayor riesgo de seguridad es la ausencia total de CSP y cabeceras HTTP**, seguida de la vulnerabilidad runtime de `react-router-dom` y un toolchain de build desactualizado (7 altas, todas en dev/build salvo `react-router`).
- **El peor problema de rendimiento es de runtime, no de bundle:** `/explorar` renderiza 507 tarjetas (35.748 nodos, 73 MB, LCP 2,6 s) y teclear dispara 6 s de long tasks; el `lazy()` de rutas apenas ahorra 5,4 KB gzip porque datos y `QuoteCard` ya están en el chunk inicial.
- **El SW y el audio son el mayor coste de red/datos móviles:** precache de ~34,8 MiB de MP3 en la instalación + petición de metadatos de un MP3 de 13,3 MB al arrancar + fuentes de 190 KB.
- **La accesibilidad tiene 2 fallos críticos baratos** (contraste del degradado y ausencia de `<h1>`) más gestión de foco en modales, i18n incompleta en metadatos y `prefers-reduced-motion` parcial.

---

## 3. Estado de salud por área

### 3.1 Seguridad

**Veredicto.** No hay secretos filtrados, no hay sinks de XSS en código propio y el manifiesto Android es restrictivo (solo `INTERNET`). El riesgo principal es la **ausencia total de CSP y cabeceras** en nginx, seguida de la **vulnerabilidad de open-redirect → XSS en `react-router-dom@6.30.4`** y de un **toolchain de build desactualizado**. Las 7 altas son de dependencias de desarrollo/build (no alcanzan al usuario final salvo que el dev server se exponga); la única vulnerabilidad runtime en dependencia directa productiva es `react-router-dom`.

| ID | Hallazgo | Severidad | Evidencia | Impacto | Esf. | Recomendación |
|---|---|---|---|---|---|---|
| SEC-01 | `postcss@8.5.16` path traversal en `sourceMappingURL` | Alto | `package-lock.json`; audit `high`, rango `<=8.5.22` | Fuga de `.map` en build | S | Subir a `>=8.5.23` |
| SEC-02 | `vite@5.4.21` path traversal / bypass `fs.deny` / NTLMv2 | Alto | `package-lock.json`; fix `8.3.1` (major) | Fuga de ficheros del dev server | M | Migrar a Vite 8; no exponer dev server |
| SEC-03 | `@xmldom/xmldom@0.9.10` — 12 advisories XML/DoS | Alto | `@capacitor/cli → plist → @xmldom/xmldom` | DoS/inyección en tooling | S | Actualizar `@capacitor/cli`/`plist` |
| SEC-04 | `tar@7.5.19` stack overflow (DoS) | Alto | `@capacitor/cli → tar`; rango `<=7.5.20` | DoS en build | S | Actualizar cadena `@capacitor/cli` |
| SEC-05 | `brace-expansion@5.0.7` DoS por expansión | Alto | `minimatch → brace-expansion` | DoS en tooling | S | `npm audit fix` |
| SEC-06 | `browserslist@4.28.5` OOM / prototype write | Alto | `autoprefixer`/`@babel/* → browserslist` | OOM/DoS en build | S | `npm audit fix` |
| SEC-07 | `nanoid@3.3.15` bucle indefinido | Alto | `postcss → nanoid` | DoS en build | S | `npm audit fix` |
| SEC-08 | `esbuild@0.21.5` — cualquier web puede leer respuestas del dev server | Medio | `vite → esbuild`; GHSA-67mh-4wv8-2f99 | Fuga de código si el dev server se expone | M | Ligado a SEC-02 |
| SEC-09 | `baseline-browser-mapping@2.10.42` DoS | Medio | `browserslist → baseline-browser-mapping` | DoS en build | S | Actualizar `browserslist` |
| SEC-10 | `react-router-dom@6.30.4` open redirect → XSS / constructor injection | Medio (pot. Alto) | `package.json` `^6.26.0`; GHSA-jjmj-jmhj-qwj2, GHSA-wrjc-x8rr-h8h6, GHSA-337j-9hxr-rhxg; `wanted=6.30.6` | **Única vuln. runtime en dep. directa productiva** | S | Subir a `^6.30.6` (o 7.18.4) |
| SEC-11 | Versiones mayores desactualizadas (react 19, vite 8, tailwind 4, framer 13, ts 7, lucide 1.x, router 7) | Bajo | `npm outdated --json` (18 paquetes) | Deuda/seguridad futura | L | Upgrades por fases |
| SEC-12 | **No existe CSP** (ni meta ni nginx); incluye el conflicto de `<script>`/`<style>` inline | Medio | `index.html` sin CSP; `Dockerfile:20-26` sin `add_header`; `index.html:53-83` (`<style>`), `:85-99` (`<script>`) | Sin mitigación de XSS/terceros | M | CSP con `sha256`/nonce o script externo (ver §8) |
| SEC-13 | Faltan `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, HSTS | Medio | `Dockerfile:20-26` | Clickjacking, MIME sniffing, fuga de referrer | S | Bloque `add_header` |
| SEC-14 | nginx divulga versión (`server_tokens on`) | Bajo | `Dockerfile:15,20-26` | Fingerprinting | S | `server_tokens off;` |
| SEC-15 | Android release con `minifyEnabled false` | Medio | `android/app/build.gradle:21` | Ingeniería inversa; binario mayor | S | R8 + ProGuard |
| SEC-16 | `android:allowBackup="true"` | Bajo | `AndroidManifest.xml:5` | Extracción vía `adb backup` | S | `allowBackup="false"` |
| SEC-17 | `file_paths.xml` expone `external-path "."` y `cache-path "."` | Medio | `res/xml/file_paths.xml:3-4` | FileProvider demasiado amplio | S | Restringir subdirectorios |
| SEC-18 | Sin `signingConfig` de release | Medio | `android/app/build.gradle:19-24` | Firma no controlada | M | Keystore + `signingConfigs` |
| SEC-19 | Sin `network_security_config` explícito | Bajo | ausente; `AndroidManifest.xml` no lo referencia | Sin política explícita (cleartext ya bloqueado en targetSdk 36) | S | `cleartextTrafficPermitted="false"` |
| SEC-20 | `capacitor.config.ts` sin `server.androidScheme` explícito | Bajo | `capacitor.config.ts:1-9` | Default `https` (seguro) pero no fijado | S | Añadir `server.androidScheme:'https'` |
| SEC-21 | Gradle wrapper sin `distributionSha256Sum` | Bajo | `gradle/wrapper/gradle-wrapper.properties:3` | Sin verificación de integridad | S | Añadir hash |
| SEC-22 | Imágenes base sin pin por digest | Medio | `Dockerfile:4` (`node:22-alpine`), `:15` (`nginx:1.27-alpine`) | Tags mutables (supply chain) | S | Pin `@sha256:...` |
| SEC-23 | nginx corre como root | Medio | `Dockerfile:15,33` (sin `USER`) | Escalada si se compromete | M | `USER nginx` + listen 8080 |
| SEC-24 | 6 binarios `.exe` de Windows comiteados y no usados | Medio | `git ls-files scripts/`; `scripts/generate-voices.mjs:137-157` usa PATH | Supply chain / bloat | S | Eliminar del repo |
| SEC-25 | Google Fonts remoto sin SRI (+ respuestas cross-origin cacheadas) | Bajo | `index.html:45-51`; `public/sw.js:88-106` | Dependencia de terceros | S | Self-host o `font-src` restrictivo |
| SEC-26 | SW cachea navegación **sin comprobar `fresh.ok`** | Medio | `public/sw.js:65-84` (`:71` `cache.put('/index.html', …)`) | App shell erróneo offline / envenenamiento de caché | S | Guardar solo si `fresh.ok` y `content-type` HTML |
| SEC-27 | SWR cachea todas las GET de mismo origen sin exclusión y con caché fijo `filosofuss-v1` (solapa UX M15) | Medio | `public/sw.js:108-128`, `:11` | Caché amplia; busting frágil; sin fallback offline dedicado | S | Excluir `/sw.js`; versionar caché por build (ver `UX-27`) |

### 3.2 Código / TypeScript

**Veredicto.** `npm run typecheck` pasa con **0 errores**; el proyecto **no usa `any`, ni `@ts-ignore`/`@ts-expect-error`, ni `unknown`**, y solo 1 aserción no-nula. La base de tipos es sana. Los problemas reales son de **deuda de políticas de compilación** (flags estrictos apagados → 28 errores al endurecer), **código muerto**, **duplicación** (reduced-motion ×14, `initials()`, corpus) y **ausencia de infraestructura de calidad** (sin ESLint, sin tests, sin Error Boundary). `QuoteCard.tsx` (369 LOC) es el mayor componente y acumula demasiadas responsabilidades.

| ID | Hallazgo | Severidad | Evidencia | Impacto | Esf. | Recomendación |
|---|---|---|---|---|---|---|
| COD-01 | Sin **Error Boundary** global | Alta | `grep -rniE "ErrorBoundary\|componentDidCatch\|getDerivedStateFromError" src` → 0; `src/App.tsx:31-57` | Pantalla en blanco ante fallo de render/efecto | S | Envolver `<Routes>` con fallback + reporte |
| COD-02 | Tipos `Tag`/`Era` definidos pero nunca aplicados (`era: string`, `tags: string[]`) | Alta | `src/types.ts:5-19,22-46,56,77`; grep solo aparecen en `types.ts` | Pierde validación de vocabulario; typos silenciosos | S | `era: Era`, `tags: Tag[]` |
| COD-03 | Flags estrictos apagados (`noUnusedLocals`, `noUnusedParameters`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`) | Media | `tsconfig.json:25-26`; endurecido → **28 errores** (TS2375×14, TS2322×7, TS2532×6, TS6133×1) | Bugs latentes de índice/props `undefined` | M | Endurecer por fases; empezar por `noUncheckedIndexedAccess` |
| COD-04 | `safeGet` castea `JSON.parse` a `T` sin validar forma | Media | `src/lib/storage.ts:15` (`as T`) | Datos corruptos violan el tipo en runtime | M | Esquema (Zod/valibot) o guardas |
| COD-05 | Ruta `path="*"` renderiza `<Home />` sin redirección ni 404 | Media | `src/App.tsx:46` | URL inválida con Home engañoso; SEO/a11y confusos | S | `<Navigate replace>` o 404 |
| COD-06 | Errores silenciados sin feedback (portapapeles, audio, storage) | Media | `QuoteCard.tsx:132-139`; `AudioContext.tsx:84-86`; `storage.ts:29,39` | El usuario no sabe si falló | M | Toast/estado + logging |
| COD-07 | `catch {}` vacíos y errores no tipados | Media | `storage.ts:16,29,39`; `QuoteCard.tsx:136,158` | Diagnóstico imposible | S | `catch (e: unknown)` + resultado tipado |
| COD-08 | **Movimiento reducido** no reactivo, duplicado ×14 y parcial en Framer (solapa UX A9/B2) | Alta | 14 archivos con `prefers-reduced-motion`; `Home.tsx:12-15`, `QuoteCard.tsx:12-15`, `BrowseQuotes.tsx:165,172`; `ThemeToggle.tsx:44`; `ScrollToTop.tsx:7` | WCAG 2.3.3; no responde a cambios en vivo | S | Hook `usePrefersReducedMotion()` reactivo + desactivar `layout` |
| COD-09 | `initials()` reimplementado con lógica distinta | Media | `QuoteCard.tsx:37-43` vs `PhilosopherWall.tsx:25-35` | Resultados inconsistentes entre tarjeta y muro | S | Unificar en `lib/utils.ts` |
| COD-10 | 8 textos de cita duplicados con IDs distintos | Media | `quotes.ts:766`=`quotesBatch2.ts:422`; `quotes.ts:860`=`quotesBatch3.ts:79`; +6 | Corpus inflado; búsqueda repetida | M | Deduplicar en build/test |
| COD-11 | `QuoteCard` con demasiadas responsabilidades (369 LOC) | Media | `QuoteCard.tsx:83-369` | Difícil de testear/reutilizar | L | Extraer `useTilt3D`, `useShareActions`, subcomponentes |
| COD-12 | Sin ESLint, sin tests, sin scripts `lint`/`test` | Media | `ls -a` → sin eslint/prettier/biome; `package.json` sin `lint`/`test` | Sin red de seguridad | M | ESLint + `eslint-plugin-react-hooks` + Vitest |
| COD-13 | Exports muertos (`slugify`, `randomInt`, `clamp`, `useRandomQuote`, `LOCALES`, `useTheme`) | Bajo | `utils.ts:10,62,70`; `hooks/useQuoteOfDay.ts:13`; `i18n/strings.ts:7`; `hooks/useTheme.ts:3` | API falsa y código sin mantener | S | Eliminar o marcar `@internal` |
| COD-14 | `Track.filename` declarado y poblado pero nunca leído | Bajo | `src/data/tracks.ts:3` + 5 asignaciones | Datos muertos | S | Eliminar o derivar `src` |
| COD-15 | 6 claves i18n sin uso; `lang.toggle` hardcodeado (solapa UX M7) | Bajo | análisis `strings.ts`; `LanguageToggle.tsx:12-14` usa `"Cambiar idioma"` | UI no traducible; diccionario inflado | S | Usar `t('lang.toggle')`; purgar claves (ver `UX-19`) |
| COD-16 | Prop `placeholder` de `SearchBar` declarada y nunca usada (solapa UX B3) | Bajo | `SearchBar.tsx:15` vs `:32`; error TS6133 | API engañosa | S | Usar o eliminar el prop |
| COD-17 | `@capacitor/cli` en `dependencies` (no se importa en `src`) | Bajo | `grep capacitor src` → 0; `package.json:16` | Instalación más pesada | S | Mover a `devDependencies` |
| COD-18 | 1 aserción no-nula `!` | Bajo | `src/main.tsx:7` (`getElementById('root')!`) | `null` no controlado | S | Guarda explícita |
| COD-19 | `@keyframes` definidos dos veces | Bajo | `index.css:267-375` (11) vs `tailwind.config.js:44-89` (11) | Duplicación / doble emisión | S | Dejar una sola definición |
| COD-20 | Utilidades/anims de Tailwind sin uso (10) | Bajo | `tailwind.config.js:28-102` | Config ruidosa | S | Podar |
| COD-21 | `import` en mitad del archivo | Bajo | `src/data/quotes.ts:1669` | Viola convención | S | Subir imports |
| COD-22 | Shadowing de `t` (traducción) por variables locales | Bajo | `BrowseQuotes.tsx:18` vs `:30`; `QuoteCard.tsx:91` vs `:260` | Confusión/riesgo | S | Renombrar (`timer`, `tag`) |
| COD-23 | `key` por índice de array | Bajo | `AuroraBackground.tsx:68,82`; `AudioPlayer.tsx:36,39` | Anti-patrón (listas estáticas) | S | Clave estable |
| COD-24 | 20 handlers inline en JSX | Bajo | `grep` → 20 (p. ej. `QuoteCard.tsx:277,329,361`) | Memoización subóptima | M | `useCallback` |
| COD-25 | `quotesEn.ts` replica 507 registros sin test de paridad | Bajo | `quotesEn.ts` (2504 LOC); paridad 507/507 hoy | Deriva silenciosa al añadir ES | M | Test de paridad ES/EN en CI |
| COD-26 | `Hero` obtiene cita aleatoria directamente (hook `useRandomQuote` muerto) | Bajo | `Hero.tsx:26` vs `hooks/useQuoteOfDay.ts:13` | Dos patrones para lo mismo | S | Unificar |
| COD-27 | `reduceMotion` evaluado una sola vez al importar (no reactivo) | Bajo | constantes de módulo en `Home.tsx:12`, `QuoteCard.tsx:12`, `AudioPlayer.tsx:19` | No responde en vivo (→ fusionado en `COD-08`) | S | Hook con `matchMedia` + listener |
| COD-28 | Comentario `eslint-disable` inerte (no hay ESLint) | Bajo | `src/components/ui/ZenMode.tsx:67` | Falsa sensación de linting | S | Instalar ESLint (COD-12) |

### 3.3 Rendimiento / Bundle

**Veredicto.** `npm run build` pasa completo (exit 0, 1965 módulos, 2,14 s). **JS inicial:** 558.329 B raw / **167.998 B gzip (~164 KiB)**; **transfer inicial real medido: 370.211 B (~361 KiB)**, de los que **190.548 B (51,5 %) son fuentes Google**. El chunk `index` arrastra todo el corpus; el `lazy()` de rutas apenas ahorra **5.398 B gzip**. El peor problema de runtime es `/explorar` (507 tarjetas, **35.748 nodos DOM, 73,1 MB heap, LCP 2.636 ms, 15 long tasks**) con jank severo al buscar (**+35 long tasks, 6.035 ms**). El peor coste de red móvil es el **precache del SW (~34,8 MiB de MP3)** y la **petición de metadatos de un MP3 de 13,3 MB al arrancar**.

| ID | Hallazgo | Severidad | Evidencia | Impacto | Esf. | Recomendación |
|---|---|---|---|---|---|---|
| PERF-01 | SW precachea las 5 pistas MP3 (**34,8 MiB**) en `install` (solapa UX A6) | Alta | `public/sw.js:14-23,32`; `find public/audio` = **36.511.278 B** | ~34,8 MiB en 1ª visita; `addAll` aborta si falta un archivo | S | Quitar mp3 de `PRECACHE_URLS`; cachear on-demand (SWR) |
| PERF-02 | `AudioContext` asigna `src` de pista 0 al montar con `preload='metadata'` (mp3 13,3 MB) | Media | `AudioContext.tsx:140-151,159`; medido 1 request de metadatos | Petición no pedida en cada arranque | S | `preload='none'` y `src` bajo interacción |
| PERF-03 | Corpus completo en el chunk inicial | Alta | `quotes.ts:1630-1637,1669`; `NarrationContext.tsx:11`; `grep -c q-socrates-1 dist/...` = 1; fuente datos = 249.442 B | 72.536 B gzip de datos en arranque | M | `import()` dinámico por ruta/idioma o JSON por locale |
| PERF-04 | `framer-motion` bundle completo; sin `LazyMotion`/`m` | Media | 14 archivos con `motion`; `LazyMotion` → 0; chunk `motion` = 117.034 B / 38.850 gzip | ~15–25 KB gzip evitables | M | `LazyMotion features={domAnimation}` + `m.*` |
| PERF-05 | `BrowseQuotes` renderiza las 507 tarjetas a la vez | Alta | `BrowseQuotes.tsx:164-182`; `/explorar` = 35.748 nodos, 73,1 MB heap, LCP 2.636 ms, 15 long tasks | Frame inicial largo; crash en gama baja | L | Virtualizar (react-virtual/react-window) o paginar |
| PERF-06 | Buscar re-renderiza todo y cientos de tarjetas (sin `React.memo`) | Alta | `BrowseQuotes.tsx:19,29-32,102`; `React.memo` → 0; +35 long tasks, 6.035 ms, máx. 619 ms | Jank severo por pulsación | M | `React.memo(QuoteCard)`, aislar input, `useDeferredValue` |
| PERF-07 | Cada `QuoteCard` instancia 4 `useMotionValue`, 2 `useSpring`, 2 `useTransform`, 1 `useMotionTemplate`, 3 `AnimatePresence` | Alta | `QuoteCard.tsx:100-114,297-358`; ×507 en `/explorar` | Cientos de springs/CPU-memoria lineal | M | Tarjeta "rica" vs lista; desactivar efectos en listas |
| PERF-08 | `AnimatePresence mode="popLayout"` + `layout` en cada tarjeta | Alta | `BrowseQuotes.tsx:164-181` | Reflow + animación de cientos de nodos al filtrar | M | Animar contenedores, no `layout` por tarjeta |
| PERF-09 | `AnimatedQuote` crea un `<motion.span>` por palabra | Media | `AnimatedQuote.tsx:40-48`; usado en `Hero.tsx:61`, `QuoteOfDay.tsx:65` | Decenas de nodos animados por cita | S | Animar bloque completo o CSS `animation-delay` |
| PERF-10 | `currentTime` en el `value` del contexto y actualizado ~4 Hz desde el provider raíz | Media | `AudioContext.tsx:53,166,211-246`; `App.tsx:34-55` | Re-render de todo el árbol ~4/s mientras suena | M | Suscripción (`useSyncExternalStore`/ref) o contexto ligero |
| PERF-11 | Fuentes: 4 familias / 20 estilos; **190,5 KB** en 1ª carga | Media | `index.html:49`; medido CDP: 5 woff2 = 48.391+39.396+38.538+37.769+26.446 | 51,5 % del transfer inicial; CLS/FOUT | M | Reducir pesos, self-host + subsetting, `size-adjust` |
| PERF-12 | Audio pesado: música MP3 256 kbps; voz 48 kbps; total `public/audio` **70,5 MB** | Media | `ffprobe` (256000/48000); `du -sb public/audio` = 70.537.614 B (1.019 archivos) | Música ~1 MB/min; voz ~0,5 MB/cita | M/L | Opus 96–128 (música) / 24–32 (voz); `preload="none"` |
| PERF-13 | `lazy()` de rutas casi inefectivo (chunks diferidos = 5.398 B gzip) | Media | `BrowseQuotes` 2.344 + `Favorites` 1.092 + `PhilosopherWall` 1.962 gzip; comparten `QuoteCard`/datos con `Home` (eager, `App.tsx:13`) | No se reduce el bundle inicial | M | Sacar datos y `QuoteCard` del camino crítico |
| PERF-14 | `ParticleField` canvas con rAF continuo; `AuroraBackground` 4 blobs con `filter:blur(50px)` | Media | `ParticleField.tsx:67-85,18`; `AuroraBackground.tsx:81-95` | CPU/GPU constante; `blur` costoso | M | Menos partículas/blobs; evitar blur animado; `contain: paint` |
| PERF-15 | `searchQuotes` normaliza el haystack de 507 citas en cada búsqueda | Media | `quotes.ts` (`searchQuotes`); `BrowseQuotes.tsx:34-51` | 507 × `normalize()` por consulta | M | Índice normalizado precomputado + `Map` de filósofos |
| PERF-16 | `PhilosopherWall` hace `getQuotesByPhilosopher` por filósofo (O(F×Q)) en cada render | Baja/Media | `PhilosopherWall.tsx:83,59` | ~18.759 iteraciones/render sin `useMemo` | S | Precomputar `Map<philosopherId, Quote[]>` |
| PERF-17 | Sin Brotli y sin `content-visibility`/`contain` | Baja | `find dist -name '*.br'` → 0; grep → 0 | ~15–20 % de compresión perdida | S | Brotli (CDN/precompresión); `content-visibility:auto` |

### 3.4 UX / A11y / SEO / PWA

**Veredicto.** La base de diseño y accesibilidad es sólida (tokens centralizados, 3 temas, landmarks semánticos, `focus-visible`, `aria-hidden` en fondos, `prefers-reduced-motion` en CSS, `lang`/`theme-color` sincronizados, PWA con manifiesto e iconos completos, fallback SPA en nginx). Los problemas se concentran en: **contraste** dentro de degradados con `--accent-3` (vino) y en tema claro/papel; **jerarquía de encabezados** (no hay `<h1>`); **gestión de foco en modales** y ausencia de `aria-live`; **i18n incompleta** (era/escuela/nacionalidad/biografía/tags/filtros solo en español) y **PWA/SW** (precache de ~36 MB y rutas absolutas incompatibles con `base:'./'` y Capacitor).

| ID | Hallazgo | Severidad | Evidencia | Impacto | Esf. | Recomendación |
|---|---|---|---|---|---|---|
| UX-01 | Degradado de texto incluye `--accent-3` (#7a2e4d) → **2.19:1** sobre `--bg` (logo y titulares) | Crítico | `index.css:223-234,236-248`; `Logo.tsx:41`; `Home.tsx:46`; `BrowseQuotes.tsx:94` | Marca/titulares incumplen WCAG 1.4.3 | M | Degradado sin `accent-3` (accent→accent-2) o subir luminosidad |
| UX-02 | **No hay `<h1>` en ninguna ruta**; primer encabezado es `<h2>` | Crítico | `Home.tsx:44`; `BrowseQuotes.tsx:92`; `Favorites.tsx:41`; `PhilosopherWall.tsx:72`; `Hero.tsx:61` | WCAG 1.3.1/2.4.6 + SEO | S | `<h1>` por ruta (visualmente oculto si se quiere) |
| UX-03 | Modal Modo Zen sin focus trap ni foco inicial | Alto | `ZenMode.tsx:76-85,55-59` | Tabula al fondo; `aria-modal` no honrado (WCAG 2.4.3) | M | Focus trap + foco inicial + restaurar |
| UX-04 | Modal ficha de filósofo `aria-modal` sin gestión de foco | Alto | `PhilosopherWall.tsx:132-136,45-57` | Igual que UX-03 | M | Primitivo de diálogo reutilizable |
| UX-05 | `--accent` en tema claro (#9c7633) = **3.88:1** sobre `--bg` | Alto | `index.css:43`; `BrowseQuotes.tsx:89`; `Navbar.tsx:33`; `QuoteCard.tsx:237` | Texto normal <4.5:1 en claro | S | Oscurecer a ≥4.5:1 (~#8a6520) |
| UX-06 | `btn-primary` degradado: en claro tramo cobre **3.37:1** y en papel **2.48:1** | Alto | `index.css:146-147`; `Hero.tsx:95`; `QuoteOfDay.tsx:97`; `Home.tsx:68` | CTA principal ilegible en claros/papel | S | Aclarar `accent-2` o usar tinta blanca sobre fondo sólido oscuro |
| UX-07 | Tap targets < 44 px (h-9=36, h-8=32, menú h-10=40, limpiar p-1) | Alto | `QuoteCard.tsx:74`; `AudioPlayer.tsx:125,178,207`; `Navbar.tsx:147`; `ThemeToggle.tsx:40`; `SearchBar.tsx:41` | Dificultad de pulsación móvil (WCAG 2.5.8) | M | Área táctil ≥44×44 px |
| UX-09 | Rutas absolutas `/sw.js`, `/manifest.webmanifest`, `start_url:"/"` chocan con `base:'./'` y Capacitor | Alto | `vite.config.ts:7`; `main.tsx:16-22`; `sw.js:14-23`; `manifest.webmanifest:7-8` | PWA rota en subruta; offline nativo depende del shell | M | Rutas relativas / `import.meta.env.BASE_URL`; documentar Capacitor |
| UX-10 | i18n incompleta: era, escuela, nacionalidad, biografía, tags y filtros solo en ES; Hero ignora `locale` | Alto | `philosophers.ts:13-18,29`; `types.ts:5-45`; `FilterPanel.tsx:99-114`; `QuoteCard.tsx:242-247`; `QuoteOfDay.tsx:82`; `Hero.tsx:62` | UI EN con metadatos ES; búsqueda EN no encuentra citas | L | Mapas EN + `getQuoteText` en Hero |
| UX-12 | Sin regiones `aria-live` (audio/narración/cita del día) | Alto | `AudioPlayer.tsx`; `NarrationContext.tsx`; `QuoteOfDay.tsx` | Cambios no anunciados a lectores de pantalla | M | `aria-live="polite"`/`role="status"` |
| UX-13 | `theme_color` incoherente (#07070f vs #0a0a0f vs CSS `--bg`) | Medio | `manifest.webmanifest:11-12`; `index.html:31`; `index.css:12` | Barra/splash con color distinto | S | Unificar en `#0a0a0f` |
| UX-14 | SEO SPA: sin `canonical`, sin `og:url`, `og:image` relativa, `twitter:card=summary`, sin JSON-LD | Medio | `index.html:20-27` | Vista previa rota al compartir; sin datos enriquecidos | M | Añadir canonical/`og:url` absolutos, `summary_large_image`, JSON-LD |
| UX-15 | No existen `robots.txt` ni `sitemap.xml` | Medio | ausentes en `public/` | Indexación pobre | S | Generar ambos con las 4 rutas |
| UX-16 | Sin `viewport-fit=cover` ni `env(safe-area-inset-*)` | Medio | `index.html:5`; `AudioPlayer.tsx:103`; `ZenMode.tsx:134` | Controles bajo notch/home indicator | M | `viewport-fit=cover` + padding safe-area |
| UX-17 | Iconos decorativos sin `aria-hidden` | Medio | `Hero.tsx:56,97,100`; `FilterPanel.tsx:122,137,157`; `BrowseQuotes.tsx:139,158`; `Favorites.tsx:79` | Ruido para lectores de pantalla | S | `aria-hidden="true"` en icono con texto |
| UX-18 | Grupos de filtros sin semántica (`<span>`, sin `fieldset`/`role=group`) | Medio | `FilterPanel.tsx:60-64` | Pills no se anuncian agrupados | S | `fieldset`+`legend` o `role="group"`+`aria-labelledby` |
| UX-19 | Botón de idioma no usa i18n (`"Cambiar idioma"` fijo) (solapa COD-15) | Medio | `LanguageToggle.tsx:11-12`; `strings.ts:31,166` | Etiqueta ES en modo EN; no indica idioma destino | S | `t('lang.toggle')` + anunciar destino |
| UX-20 | Menú móvil del Navbar: sin focus trap, sin Escape, sin `aria-controls` | Medio | `Navbar.tsx:142-190` | Navegación de teclado inconsistente | M | Trapar foco, Escape, `aria-controls` |
| UX-21 | Panel del reproductor `role="dialog"` sin `aria-modal` ni Escape ni foco | Medio | `AudioPlayer.tsx:141-143` | Semántica engañosa | S | Quitar `role="dialog"` o implementarlo bien |
| UX-22 | `--muted` sobre `--bg-2` en papel = **4.36:1** (footer `text-xs`) | Medio | `index.css:59`; `Footer.tsx:20,40,46` | Texto pequeño <4.5:1 en papel | S | Oscurecer `--muted` en papel o usar `--text` |
| UX-23 | Varios CTA primarios compiten por pantalla | Medio | `Hero.tsx:95`; `QuoteOfDay.tsx:97`; `Home.tsx:68` | Jerarquía de acción poco clara | M | Una acción primaria por vista |
| UX-24 | `min-h-[92vh]` en Hero usa `vh` | Medio | `Hero.tsx:30` | Salto/scroll incómodo en móvil | S | `svh`/`dvh` |
| UX-25 | Tinta `#0a0a12` hardcodeada; conviven tres "negros" | Medio | `index.css:89,146`; `QuoteCard.tsx:233`; `ThemeToggle.tsx:45,52`; `FilterPanel.tsx:40,140`; `Navbar.tsx:50,101` | Inconsistencia de marca/contraste | M | Tokens `--ink`/`--on-accent` |
| UX-26 | Manifiesto sin `id`, `screenshots`, `shortcuts`; maskable solo 512 | Medio | `manifest.webmanifest:1-19` | Instalación menos rica | S | Añadir `id`/`shortcuts`/`screenshots` |
| UX-27 | Sin página offline dedicada; nombre de caché fijo `filosofuss-v1` (solapa SEC-27) | Medio | `sw.js:11,79` | Offline mínimo; caché obsoleta posible | S | Fallback offline + nombre por hash de build |
| UX-28 | Escala tipográfica no formalizada (tracking/tamaños arbitrarios) | Bajo | `index.css`; `QuoteOfDay.tsx:27,55`; `QuoteCard.tsx:50`; `Navbar.tsx:50` | Microinconsistencias de ritmo | S | Tokens de tracking/tamaño |
| UX-31 | Longitud de línea en cita destacada (`max-w-3xl` con `text-5xl`) | Bajo | `QuoteOfDay.tsx:23,67` | Medida larga en desktop | S | Limitar bloque (~60–70ch) |
| UX-32 | Botón de filtros móvil sin `aria-controls` | Bajo | `FilterPanel.tsx:131-144` | Relación botón↔panel no anunciada | S | `id` + `aria-controls` |
| UX-33 | `lang` del manifiesto fijo en `es` aunque la UI cambie a `en` | Bajo | `manifest.webmanifest:5` | Metadato de instalación desalineado | S | Documentar o manifiesto por locale |

---

## 4. Métricas objetivas de partida

### 4.1 Baseline de entorno

| Métrica | Valor |
|---|---|
| Node / npm | v22.20.0 / 10.9.3 |
| `npm ci` | exit 0 — «added 232 packages, audited 233 packages in 2s» |
| Vulnerabilidades npm | **11** = **7 high + 4 moderate** (0 critical) |
| `npm ls --all \| wc -l` | 422 |
| Tamaño `node_modules` | 146 MB |
| `npm run typecheck` | **0 errores** (exit 0; `tsc` 5.9.3) |
| Flags estrictos endurecidos | 28 errores (TS2375×14, TS2322×7, TS2532×6, TS6133×1) |
| `npm run build` | exit 0 · 1965 módulos · 2,14 s |
| Corpus | **507 citas ES** + 507 traducciones EN + 1.014 ids de voz + 37 filósofos |
| LOC `src/` | 12.165 LOC en 44 archivos `.ts/.tsx` (~75 % son datos) |

### 4.2 Bundle por chunk (raw / gzip)

Comando: `npm run build` (gzip de Vite contrastado con `gzip -c file | wc -c`).

| Chunk (`dist/assets`) | Raw (B) | Gzip (B) | Inicial | Contenido |
|---|---:|---:|:---:|---|
| `index-B2q1fgVP.js` | 262.292 | 72.536 | **Sí** (entry) | App + páginas eager + **todo el corpus** |
| `react-BYdsr6iT.js` | 163.451 | 53.293 | Sí (modulepreload) | react + react-dom + react-router-dom |
| `motion-LYqEdoT2.js` | 117.034 | 38.850 | Sí (modulepreload) | framer-motion (completo) |
| `icons-B9VZhAlh.js` | 15.552 | 3.319 | Sí (modulepreload) | lucide-react |
| `index-CwypfDRC.css` | 26.575 | 6.192 | Sí (`<link>`) | Tailwind + design system |
| `BrowseQuotes-D-52I0ex.js` | 6.619 | 2.344 | No (lazy) | Ruta `/explorar` |
| `PhilosopherWall-DGHanQEG.js` | 5.201 | 1.962 | No (lazy) | Ruta `/filosofos` |
| `Favorites-Dev18_8X.js` | 2.402 | 1.092 | No (lazy) | Ruta `/favoritos` |
| `index.html` | 4.223 | 1.536 | Sí | Shell + modulepreload + CSS |

**Totales**

| Métrica | Valor |
|---|---|
| **JS inicial (raw)** | 262.292 + 163.451 + 117.034 + 15.552 = **558.329 B (~545 KiB)** |
| **JS inicial (gzip)** | 72.536 + 53.293 + 38.850 + 3.319 = **167.998 B (~164 KiB)** |
| JS+CSS inicial (gzip) | 174.190 B |
| **Transfer inicial real medido (CDP)** | **370.211 B (~361 KiB)** (incluye **190.548 B de fuentes** + 1.909 B CSS Google + 1.794 B HTML) |
| **`dist/` total** | **71.399.374 B (~68,1 MiB)**: assets 599.126 · **audio 70.537.614** · icons 251.546 · resto ~11 KB |
| **`public/audio`** | **70.537.614 B** = música 36.511.278 (5 archivos) + voz 34.026.336 (1.014 archivos: 507 es + 507 en) |
| `public/icons` | 251.546 B (mayor: `icon-512.png` 101.498) |
| Diferido total (`lazy`) | **5.398 B gzip** (2.344 + 1.962 + 1.092) |

### 4.3 Initial load waterfall (ruta `/`)

`HTML` 1.794 B → `index.js` 72.608 B gzip → vendors en paralelo (`react` 53.785, `motion` 39.362, `icons` 3.671) → `CSS` 6.542 B → **Google Fonts** CSS 1.909 B + 5 woff2 **190.548 B** → audio 1 range (~300 B) → **SW: `cache.addAll` de 5 mp3 ≈34,8 MiB en segundo plano**.

| Métrica | `/` | `/explorar` |
|---|---:|---:|
| DOMContentLoaded / load | 152–174 ms | — |
| First Paint | 164 ms | — |
| FCP | 328 ms | — |
| **LCP** | **1.312 ms** | **2.636 ms** |
| Long tasks | 1 (117 ms) | **15 (1.619 ms; máx. 464 ms)** |
| **Nodos DOM** | 659 | **35.748** |
| JS heap | 9,5 MB | **73,1 MB** |
| Tarjetas (`blockquote`) | — | **507** |

**Al teclear `sabiduria` (9 chars, 80 ms/char):** +35 long tasks, **6.035 ms** acumulados, máximo **619 ms**.

### 4.4 Ratios de contraste WCAG (aprox., salvo indicación)

**Tema oscuro (por defecto)**

| Par | Ratio | AA (4.5) | AA grande/UI (3.0) |
|---|---:|---|---|
| `--text #ece8e1` sobre `--bg #0a0a0f` | 16.17:1 | ✅ | ✅ |
| `--muted #9a96aa` sobre `--bg` | 6.88:1 | ✅ | ✅ |
| `--muted` sobre `--bg-2 #12121a` | 6.49:1 | ✅ | ✅ |
| `--accent #c9a96a` sobre `--bg` | 8.81:1 | ✅ | ✅ |
| `--accent-2 #b0713f` sobre `--bg` | 4.97:1 | ✅ | ✅ |
| **`--accent-3 #7a2e4d` sobre `--bg`** | **2.19:1** | ❌ | ❌ |
| `--muted` sobre glass (.045) | 6.34:1 | ✅ | ✅ |
| `--muted` sobre glass-strong (.08) | 5.81:1 | ✅ | ✅ |
| `--accent` sobre glass (.045) | 8.12:1 | ✅ | ✅ |
| tinta `#0a0a12` sobre `--accent` | 8.79:1 | ✅ | ✅ |
| tinta sobre `--accent-2` | 4.96:1 | ✅ | ✅ |

**Tema claro**

| Par | Ratio | AA normal | AA grande/UI |
|---|---:|---|---|
| `--text #181620` sobre `--bg #f9f7f3` | 16.71:1 | ✅ | ✅ |
| `--muted #6a6575` sobre `--bg` | 5.26:1 | ✅ | ✅ |
| `--muted` sobre `--bg-2 #f0ede8` | 4.82:1 | ✅ | ✅ |
| **`--accent #9c7633` sobre `--bg`** | **3.88:1** | ❌ | ✅ |
| **`--accent` sobre glass-strong (.98)** | **4.15:1** | ❌ | ✅ |
| `--accent-2 #8a5a2f` sobre `--bg` | 5.48:1 | ✅ | ✅ |
| tinta `#0a0a12` sobre `--accent` | 4.74:1 | ✅ | ✅ |
| **tinta sobre `--accent-2` (btn)** | **3.37:1** | ❌ | ✅ |
| **texto `#f9f7f3` sobre `--accent` (badge)** | **3.88:1** | ❌ | ✅ |

**Tema papel**

| Par | Ratio | AA normal | AA grande/UI |
|---|---:|---|---|
| `--text #2a251c` sobre `--bg #f2ead9` | 12.72:1 | ✅ | ✅ |
| `--muted #6b6355` sobre `--bg` | 4.96:1 | ✅ | ✅ |
| **`--muted` sobre `--bg-2 #e8dcc3`** | **4.36:1** | ❌ | ✅ |
| **`--accent #8a6420` sobre `--bg`** | **4.47:1** | ❌ (límite) | ✅ |
| `--accent-2 #6b4a2a` sobre `--bg` | 6.65:1 | ✅ | ✅ |
| **tinta `#0a0a12` sobre `--accent`** | **3.68:1** | ❌ | ✅ |
| **tinta sobre `--accent-2` (btn)** | **2.48:1** | ❌ | ❌ |

> `--glass` calculado por composición alpha sobre `--bg` plano (aprox.; sobre aurora/partículas puede diferir). Degradados evaluados por peor parada.

---

## 5. Tabla maestra priorizada (todos los hallazgos, deduplicado)

**Leyenda.** `Prioridad`: P0 = crítico/bloqueante o alto impacto barato · P1 = alto/medio relevante · P2 = deuda/limpieza. `Ola`: 1 = primero · 2 = segundo · 3 = después. `Dependencias` = ID del que depende el arreglo.

| ID | Prioridad | Área | Hallazgo | Severidad | Impacto estimado | Esf. | Ola | Dependencias |
|---|---|---|---|---|---|---|---|---|
| SEC-01 | P1 | Seguridad | postcss path traversal | Alto | Fuga de `.map` en build | S | 1 | — |
| SEC-02 | P1 | Seguridad | vite path traversal / fs.deny / NTLMv2 | Alto | Fuga en dev server | M | 2 | — |
| SEC-03 | P2 | Seguridad | @xmldom/xmldom advisories | Alto | DoS tooling Capacitor | S | 3 | — |
| SEC-04 | P2 | Seguridad | tar stack overflow | Alto | DoS build | S | 3 | — |
| SEC-05 | P2 | Seguridad | brace-expansion DoS | Alto | DoS build | S | 3 | — |
| SEC-06 | P2 | Seguridad | browserslist OOM/proto | Alto | OOM build | S | 3 | — |
| SEC-07 | P2 | Seguridad | nanoid bucle | Alto | DoS build | S | 3 | — |
| SEC-08 | P2 | Seguridad | esbuild dev server leak | Medio | Fuga de código | M | 3 | SEC-02 |
| SEC-09 | P2 | Seguridad | baseline-browser-mapping DoS | Medio | DoS build | S | 3 | SEC-06 |
| SEC-10 | P0 | Seguridad | react-router open redirect → XSS | Medio (pot. Alto) | Vuln. runtime productiva | S | 1 | — |
| SEC-11 | P2 | Seguridad | mayores desactualizadas | Bajo | Deuda | L | 3 | — |
| SEC-12 | P0 | Seguridad | Sin CSP (incl. inline script/style) | Medio | XSS/terceros | M | 1 | SEC-13 |
| SEC-13 | P1 | Seguridad | Cabeceras HTTP faltantes | Medio | Clickjacking/sniffing | S | 1 | — |
| SEC-14 | P2 | Seguridad | nginx server_tokens | Bajo | Fingerprinting | S | 3 | — |
| SEC-15 | P1 | Seguridad | Android minifyEnabled false | Medio | Reversing | S | 2 | — |
| SEC-16 | P2 | Seguridad | allowBackup=true | Bajo | Extracción datos | S | 3 | — |
| SEC-17 | P1 | Seguridad | file_paths FileProvider amplio | Medio | Exposición storage | S | 2 | — |
| SEC-18 | P1 | Seguridad | sin signingConfig release | Medio | Firma no controlada | M | 2 | — |
| SEC-19 | P2 | Seguridad | sin network_security_config | Bajo | Sin política explícita | S | 3 | — |
| SEC-20 | P2 | Seguridad | sin server.androidScheme | Bajo | Default seguro no fijado | S | 3 | — |
| SEC-21 | P2 | Seguridad | gradle sin sha | Bajo | Sin verificación integridad | S | 3 | — |
| SEC-22 | P1 | Seguridad | imágenes base sin digest | Medio | Supply chain | S | 2 | — |
| SEC-23 | P1 | Seguridad | nginx root | Medio | Escalada | M | 2 | SEC-22 |
| SEC-24 | P1 | Seguridad | 6 `.exe` comiteados | Medio | Supply chain/bloat | S | 2 | — |
| SEC-25 | P2 | Seguridad | Google Fonts sin SRI / cacheadas | Bajo | Terceros | S | 3 | PERF-11 |
| SEC-26 | P1 | Seguridad | SW navegación sin `fresh.ok` | Medio | App shell erróneo offline | S | 2 | — |
| SEC-27 | P2 | Seguridad | SW SWR amplio + caché fija | Medio | Caché obsoleta/amplia | S | 3 | UX-27 |
| COD-01 | P0 | Código | Sin Error Boundary | Alta | Pantalla en blanco | S | 1 | — |
| COD-02 | P0 | Código | Tag/Era sin aplicar | Alta | Validación vocabulario | S | 1 | — |
| COD-03 | P1 | Código | Flags estrictos apagados | Media | Bugs de índice/props | M | 2 | COD-04,COD-27 |
| COD-04 | P1 | Código | safeGet cast sin validar | Media | Datos corruptos | M | 2 | COD-03 |
| COD-05 | P1 | Código | path=* sin 404 | Media | UX/SEO confusos | S | 2 | — |
| COD-06 | P1 | Código | Errores silenciosos | Media | Sin feedback | M | 2 | COD-07 |
| COD-07 | P2 | Código | catch vacíos | Media | Diagnóstico imposible | S | 3 | — |
| COD-08 | P0 | Código/UX | reduced motion duplicado/no reactivo/parcial | Alta | WCAG 2.3.3 | S | 1 | — |
| COD-09 | P2 | Código | initials() duplicado | Media | Inconsistencia autores | S | 3 | — |
| COD-10 | P1 | Código | 8 citas duplicadas | Media | Corpus/búsqueda | M | 2 | — |
| COD-11 | P1 | Código | QuoteCard god (369 LOC) | Media | Test/reutilización | L | 2 | PERF-07 |
| COD-12 | P1 | Código | Sin ESLint/tests | Media | Sin red de seguridad | M | 2 | — |
| COD-13 | P2 | Código | Exports muertos | Bajo | API falsa | S | 3 | COD-03 |
| COD-14 | P2 | Código | Track.filename muerto | Bajo | Datos muertos | S | 3 | — |
| COD-15 | P2 | Código | claves i18n sin uso / lang hardcoded | Bajo | UI no traducible | S | 3 | UX-19 |
| COD-16 | P2 | Código | SearchBar placeholder muerto | Bajo | API engañosa | S | 3 | — |
| COD-17 | P2 | Código | @capacitor/cli en deps | Bajo | Peso instalación | S | 3 | — |
| COD-18 | P2 | Código | aserción no-nula | Bajo | Null no controlado | S | 3 | — |
| COD-19 | P2 | Código | keyframes duplicados | Bajo | Doble emisión CSS | S | 3 | — |
| COD-20 | P2 | Código | utilidades Tailwind sin uso | Bajo | Config ruidosa | S | 3 | — |
| COD-21 | P2 | Código | import en medio | Bajo | Convención | S | 3 | — |
| COD-22 | P2 | Código | shadowing de t | Bajo | Confusión | S | 3 | — |
| COD-23 | P2 | Código | key=index | Bajo | Anti-patrón | S | 3 | — |
| COD-24 | P2 | Código | 20 handlers inline | Bajo | Memoización | M | 3 | PERF-06 |
| COD-25 | P2 | Código | quotesEn sin test paridad | Bajo | Deriva ES/EN | M | 3 | — |
| COD-26 | P2 | Código | Hero cita aleatoria inconsistente | Bajo | Patrón duplicado | S | 3 | COD-13 |
| COD-27 | P2 | Código | reduceMotion no reactivo | Bajo | No responde en vivo | S | — | fusionado en COD-08 |
| COD-28 | P2 | Código | eslint-disable inerte | Bajo | Falsa seguridad | S | 3 | COD-12 |
| PERF-01 | P0 | Rendimiento | SW precachea 34,8 MiB de MP3 | Alta | +34,8 MiB 1ª visita | S | 1 | — |
| PERF-02 | P1 | Rendimiento | preload metadata mp3 13,3 MB | Media | Request no pedido | S | 2 | PERF-12 |
| PERF-03 | P0 | Rendimiento | Corpus en chunk inicial | Alta | 72.536 B gzip arranque | M | 2 | PERF-13 |
| PERF-04 | P1 | Rendimiento | framer-motion completo | Media | ~15–25 KB gzip | M | 2 | PERF-07 |
| PERF-05 | P0 | Rendimiento | 507 tarjetas sin virtualizar | Alta | 35.748 nodos / 73 MB | L | 2 | PERF-07,PERF-08 |
| PERF-06 | P0 | Rendimiento | Búsqueda sin memo | Alta | 6.035 ms long tasks | M | 2 | PERF-15 |
| PERF-07 | P0 | Rendimiento | Motion values por tarjeta | Alta | CPU/memoria lineal | M | 2 | COD-11 |
| PERF-08 | P0 | Rendimiento | layout animado por tarjeta | Alta | Reflow cientos nodos | M | 2 | PERF-05 |
| PERF-09 | P1 | Rendimiento | span por palabra | Media | Nodos animados | S | 2 | — |
| PERF-10 | P1 | Rendimiento | currentTime en contexto | Media | Re-render 4/s | M | 2 | — |
| PERF-11 | P0 | Rendimiento | Fuentes 190,5 KB | Media | 51,5 % transfer | M | 1 | SEC-25 |
| PERF-12 | P1 | Rendimiento | audio 70,5 MB MP3 | Media | Datos móviles | M/L | 2 | — |
| PERF-13 | P1 | Rendimiento | lazy() inefectivo | Media | No reduce bundle | M | 2 | PERF-03 |
| PERF-14 | P1 | Rendimiento | Particle/Aurora costosos | Media | CPU/GPU constante | M | 2 | — |
| PERF-15 | P1 | Rendimiento | searchQuotes normaliza | Media | 507 normalize/consulta | M | 2 | PERF-06 |
| PERF-16 | P2 | Rendimiento | PhilosopherWall O(F×Q) | Baja/Media | 18.759 iter/render | S | 3 | — |
| PERF-17 | P1 | Rendimiento | sin Brotli/content-visibility | Baja | ~15–20 % transfer | S | 2 | — |
| UX-01 | P0 | UX/A11y | degradado `--accent-3` 2.19:1 | Crítico | WCAG 1.4.3 | M | 1 | UX-25 |
| UX-02 | P0 | UX/A11y | sin `<h1>` | Crítico | WCAG 1.3.1/2.4.6 + SEO | S | 1 | — |
| UX-03 | P0 | UX/A11y | Zen sin focus trap | Alto | WCAG 2.4.3 | M | 1 | UX-04 |
| UX-04 | P0 | UX/A11y | ficha filósofo sin focus | Alto | Igual que UX-03 | M | 1 | — |
| UX-05 | P0 | UX/A11y | accent claro 3.88:1 | Alto | <4.5:1 | S | 1 | — |
| UX-06 | P0 | UX/A11y | btn-primary 3.37/2.48:1 | Alto | CTA ilegible | S | 1 | UX-25 |
| UX-07 | P0 | UX/A11y | tap targets < 44 px | Alto | WCAG 2.5.8 | M | 1 | — |
| UX-09 | P0 | UX/PWA | rutas absolutas vs base/Capacitor | Alto | PWA rota en subruta | M | 2 | SEC-26 |
| UX-10 | P0 | UX/i18n | i18n incompleta + Hero | Alto | Búsqueda EN vacía | L | 2 | — |
| UX-12 | P0 | UX/A11y | sin aria-live | Alto | SR sin anuncios | M | 1 | — |
| UX-13 | P1 | UX/PWA | theme_color incoherente | Medio | Splash distinto | S | 2 | — |
| UX-14 | P1 | UX/SEO | meta SEO incompleta | Medio | Preview roto | M | 2 | UX-15 |
| UX-15 | P1 | UX/SEO | sin robots/sitemap | Medio | Indexación pobre | S | 2 | — |
| UX-16 | P1 | UX/Mobile | sin safe-area | Medio | Controles bajo notch | M | 2 | — |
| UX-17 | P1 | UX/A11y | iconos sin aria-hidden | Medio | Ruido SR | S | 2 | — |
| UX-18 | P1 | UX/A11y | filtros sin semántica | Medio | Pills no agrupados | S | 2 | — |
| UX-19 | P1 | UX/i18n | botón idioma sin i18n | Medio | Etiqueta ES | S | 2 | COD-15 |
| UX-20 | P1 | UX/A11y | menú móvil sin focus trap | Medio | Teclado inconsistente | M | 2 | UX-03 |
| UX-21 | P1 | UX/A11y | audio panel role=dialog | Medio | Semántica engañosa | S | 2 | — |
| UX-22 | P0 | UX/Contraste | muted papel 4.36:1 | Medio | <4.5:1 footer | S | 1 | — |
| UX-23 | P1 | UX | CTAs compiten | Medio | Jerarquía confusa | M | 2 | — |
| UX-24 | P2 | UX/Mobile | Hero vh | Medio | Salto móvil | S | 3 | — |
| UX-25 | P1 | UX/Tokens | tinta hardcodeada | Medio | Inconsistencia | M | 2 | UX-01,UX-06 |
| UX-26 | P1 | UX/PWA | manifest incompleto | Medio | Instalación pobre | S | 2 | UX-13 |
| UX-27 | P1 | UX/PWA | sin offline + caché fija | Medio | Offline mínimo | S | 2 | SEC-27 |
| UX-28 | P2 | UX/Tokens | escala tipográfica informal | Bajo | Ritmo visual | S | 3 | — |
| UX-31 | P2 | UX | línea larga cita | Bajo | Legibilidad | S | 3 | — |
| UX-32 | P2 | UX/A11y | filtros sin aria-controls | Bajo | Relación no anunciada | S | 3 | — |
| UX-33 | P2 | UX/PWA | manifest lang fijo | Bajo | Metadato desalineado | S | 3 | — |

> Solapamientos fusionados (una sola fila): `PERF-01`=UX A6 · `COD-08`=UX A9 + UX B2 + COD-27 · `COD-15`=UX M7 · `COD-16`=UX B3 · `SEC-12`=H-01+H-04 · `SEC-27`=UX M15 · `SEC-25`=X-04+W-03.

---

## 6. Lo que YA está bien (verificado, no requiere acción)

**Seguridad**
- Sin secretos: `.env`/`.env.*` ignorados y nunca rastreados; escaneo de todos los blobs históricos (`sk-*`, `Bearer`, hexadecimales, Zhipu) → 0 coincidencias; `GLM_API_KEY` leída solo de entorno (`scripts/translate-quotes-glm.mjs:28`).
- Sin sinks XSS: `dangerouslySetInnerHTML`/`innerHTML`/`eval`/`new Function`/`document.write`/`srcdoc` → 0 en `src/` y `public/`.
- `window.open(..., '_blank', 'noopener,noreferrer')` correcto (`QuoteCard.tsx:170`).
- `audio.src` desde constantes o allowlist (`NarrationContext.tsx:163-169`, `voiceManifest.ts`).
- Android restrictivo: solo permiso `INTERNET` (`AndroidManifest.xml:40`); `exported="true"` solo en `MainActivity` con `LAUNCHER`; FileProvider `exported="false"`; sin `usesCleartextTraffic`; sin `setWebContentsDebuggingEnabled`.
- `npm ci` + `.dockerignore` + `.env` excluidos; scope del SW `/` y `start_url:"/"` correctos.

**Código**
- `npm run typecheck` = **0 errores**; 0 `any`, 0 `@ts-ignore`/`@ts-expect-error`, 0 `unknown`; 1 sola aserción no-nula; `strict:true` ya activo.
- `Home.tsx` no es god component (77 LOC); acoplamiento sano (`AppProvider > AudioProvider > NarrationProvider`); rutas y deep link `?cita=` coherentes.
- `QuoteDeepLink.tsx` valida `getQuoteById` antes de `openZen` y limpia la URL.

**Rendimiento**
- `npm run build` pasa completo (exit 0, 2,14 s); `manualChunks` bien repartido (react/motion/icons separados → buen cacheo).
- `ParticleField` pausa en `visibilitychange` y respeta `prefers-reduced-motion`; `display=swap` + `preconnect` en fuentes.

**UX / A11y / SEO / PWA**
- Tokens de color centralizados (3 temas coherentes) mapeados en Tailwind.
- Contraste correcto de texto principal y `--muted` en oscuro/claro/papel (16.17/6.88/16.71/5.26/12.72…).
- Landmarks `header`/`nav`/`main`/`footer`; `:focus-visible` global visible.
- `aria-label`/`title`/`aria-pressed`/`aria-checked`/`aria-current` en controles de icono; `aria-hidden` en fondos decorativos.
- `Escape` cierra Zen y ficha de filósofo con bloqueo de scroll de fondo.
- `prefers-reduced-motion` cubre animaciones CSS; `lang` y `theme-color` sincronizados con el estado.
- PWA con manifiesto e iconos completos (192/256/512 any + 512 maskable + apple-touch + favicon + SVG) y fallback SPA en nginx.
- Sin imágenes raster (sin déficits de `alt`); sin overflow por `100vw`.

---

## 7. Riesgos y supuestos · Limitaciones

### 7.1 Riesgos y supuestos

- **Se asume hosting con HTTPS delante** para que HSTS (SEC-13) sea aplicable; sin TLS la cabecera no debe emitirse.
- **La CSP (SEC-12) exige resolver primero el `<script>`/`<style>` inline** de `index.html:53-99` (hash SHA-256 o `nonce`), o la app se bloquea. Es un riesgo de regresión si se aplica sin ese paso.
- **`react-router` (SEC-10)**: no se encontraron `<Link>`/`useNavigate` con destino controlado por el usuario, por lo que la explotabilidad actual es baja; el riesgo sube si en el futuro se usa navegación con input.
- **Las 7 altas de seguridad son de dev/build**, salvo `react-router`; el riesgo real depende de no exponer el dev server en red (SEC-02/SEC-08).
- **Capacitor**: el SW queda como código muerto en nativo (`file://`/`capacitor://` no registran SW); el offline es inherente al shell local, según inferencia (no probado en dispositivo).
- **Hosting sin compresión** transferiría los tamaños **raw** (no gzip); sin Brotli se pierde ~15–20 % adicional.
- **`PERF-17` depende del hosting/CDN**, no del código.
- Se asume que `package-lock.json` es la fuente de verdad de versiones (no se recalcularon CVSS propios).

### 7.2 Limitaciones de la auditoría

- Sin **Lighthouse** (rendimiento/Web Vitals oficiales) ni **DAST** (cabeceras en servidor vivo); métricas de runtime vía Playwright/CDP sobre `vite preview`, no en red throttled ni gama baja.
- Sin **build Android** (APK/AAB): `signingConfig`/`debuggable` reales no confirmables sin keystore.
- **Contraste `glass` aproximado** por composición alpha; **degradados** evaluados por peor parada; el valor real varía con la animación.
- **Sin `node_modules`** en la auditoría UX (no compiló); análisis estático de fuentes.
- Análisis de duplicación de corpus **normaliza solo por línea `text:` literal** (no parafraseos ni diferencias de puntuación/acentos).
- Conteos de uso de CSS/Tailwind e i18n **heurísticos por grep/AST-ligero** (posibles usos dinámicos).
- Escaneo de secretos **heurístico** por patrones conocidos; una clave de formato atípico podría no coincidir.
- Binarios `.exe` identificados por `file` (PE/Zip) pero **no desensamblados ni verificados por firma/entropía**.
- `exactOptionalPropertyTypes` evaluado de forma aislada; el nº de errores puede variar con arreglos previos.
- Capacitor/SW en nativo **inferido**, no probado en dispositivo.

### 7.3 Inconsistencias detectadas entre los cuatro informes

1. **`security.md` — conteo de severidad erróneo (off-by-one).** El resumen declara *«Medio 12»* y total implícito 28 hallazgos, pero la tabla tiene **13 filas marcadas Medio** (D-08, D-09, D-10, H-01, H-02, H-04, A-01, A-03, A-04, B-01, B-02, B-03, W-01) → **29 hallazgos**. Alto 7 y Bajo 9 sí coinciden; el error es en Medio.
2. **`ux-a11y-seo.md` — conteo de severidad erróneo.** El resumen declara *«Alto 9 · total 32»*, pero la tabla tiene **10 filas Alto** (A1–A10) → **total 33**. Crítico 2, Medio 15 y Bajo 6 sí coinciden.
3. **`ux-a11y-seo.md` §6 cita «226 citas»** (línea 198) para el contenido no indexable, mientras el resto de informes y de su propio documento hablan de **507 citas** (corpus). Inconsistencia interna/vs. resto.
4. **`performance.md` no incluye tabla resumen de severidad**; el recuento «6 Alta / 9 Media / 2 Baja» (17) de este informe es una derivación nuestra, no una cifra declarada por el autor.
5. **Solapamientos no señalados por los informes originales** (fusionados aquí): precache de MP3 en UX A6 ↔ Rendimiento P-01; `prefers-reduced-motion` en Código F-08/F-27 ↔ UX A9/B2; `SearchBar.placeholder` en Código F-16 ↔ UX B3; `lang.toggle` en Código F-15 ↔ UX M7; nombre de caché SW en UX M15 ↔ Seguridad W-02.
6. Detalle menor: `code.md` fecha el commit como `c3fd246 (2026-09-03)`; el resto de informes solo indican la rama `nivel-dios` sin commit. No es contradicción, pero conviene fijar `c3fd246` como base (hecho en este informe).

---

## 8. Anexo — Comandos de verificación reproducibles

```bash
# Entorno
node -v && npm -v

# 1) Typecheck (esperado: 0 errores, exit 0)
npm run typecheck
#    ("typecheck": "tsc -p tsconfig.json && tsc -p tsconfig.node.json")

# 1b) Endurecimiento de tipos (esperado hoy: 28 errores)
npx tsc -p tsconfig.json --noEmit --noUnusedLocals --noUnusedParameters \
  --noImplicitAny --noUncheckedIndexedAccess --exactOptionalPropertyTypes

# 2) Build de producción (esperado: exit 0; ~1965 módulos)
npm run build

# 2b) Tamaño de chunks raw/gzip (contraste con el de Vite)
find dist/assets -name '*.js' -printf '%f %s\n' | sort -k2 -nr
gzip -c dist/assets/index-*.js | wc -c

# 3) Auditoría de dependencias (esperado: 11 = 7 high + 4 moderate)
npm audit --json
npm audit --package-lock-only --json
npm outdated --json

# 4) Inventario y medición de audio (esperado: ~70,5 MB; 1.019 archivos)
find public/audio -type f | wc -l
du -sb public/audio
find public/audio -maxdepth 1 -type f -printf '%s\n' | paste -sd+ | bc
ffprobe -v error -show_entries format=bit_rate -of csv=p=0 "<archivo>.mp3"   # música ~256 kbps

# 5) Fuentes / SW precache (evidencia)
grep -n "PRECACHE_URLS" -A 12 public/sw.js
grep -n "add_header\|server_tokens" Dockerfile || echo "sin cabeceras/CSP"

# 6) Sinks y secretos (esperado: 0)
grep -rnE "dangerouslySetInnerHTML|innerHTML|eval\(|new Function|document\.write|srcdoc" src public || echo "limpio"
git ls-files | grep -iE "\.env|secret|credential"
```

> Nota: los comandos 1–3 no modifican el repo; el 2 escribe `dist/`. Ninguno de los informes originales modificó fuentes ni hizo commit/push.
