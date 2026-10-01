# Validación Nivel-Dios — Informe de Definition of Done

> **Rama:** `nivel-dios` · **Rango de commits:** `c3fd246..c5b59c8` (17 commits) · **Fecha:** 2026-10-01
> **Alcance:** OLA 4 (validación + documentación). No se hizo push; el push/PR lo maneja otro paso.
> **Fuera de alcance:** `android/` no se tocó.

---

## 1. Resumen ejecutivo

Todas las compuertas duras del DoD se cumplen: **typecheck estricto 0**, **build 0**, **check scripts PASS**,
**Lighthouse ≥94 en las 4 categorías** (desktop 100/100/100/100), **presupuesto eager 119,05 KiB ≤ 120 KiB**,
**precache de instalación 11,6 KiB (0 audio)** y **0 peticiones de audio en el arranque**.

Mejoras materiales frente a `main` (`c3fd246`): DOM de `/explorar` 35.748 → 1.189 (−96,7 %),
long tasks en `/explorar` 15 (1.619 ms) → 0, heap 73,1 MB → 10 MB, audio 70,5 MB → 24,3 MB,
fuentes 190,5 KB (Google) → 54,5 KB (self-host), precache 34,8 MiB → 11,6 KiB y `npm audit` 11 → 5.

Dos desviaciones requieren decisión del usuario: el binario **`terser`** y **`playwright-core`** se añadieron
como dependencias de desarrollo sin aprobación explícita, y el `npm audit` restante **no** es sólo
esbuild+vite: incluye también la cadena de **Vitest** (critical). Ver §8.

---

## 2. Batería de validación (comandos y resultados)

| Comando | Exit | Resultado medido |
|---|---|---|
| `npm run typecheck` | **0** | 0 errores (`tsc -p tsconfig.json && tsc -p tsconfig.node.json`) |
| `npm run lint` | **0** | 0 errores · **10 warnings** en 3 archivos (ver §2.1) |
| `npm test` | **0** | 3 archivos · **39 tests** pasan (554 ms) |
| `npm run build` | **0** | 1997 módulos; `index` 350,66 kB raw / **115,11 kB gzip**; CSS 30,78 kB / 6,99 kB gzip |
| `npm run budget` | **0** | **PASS** — eager JS+CSS **121.903 B (119,05 KiB)** / 120 KiB |
| `node scripts/check-sw.mjs` | **0** | PASS — PRECACHE sin `.mp3` (4 entradas); caché versionada; valida `.ok` |
| `node scripts/check-contrast.mjs` | **0** | PASS — 33 comprobaciones, 0 fallos, 3 temas ≥ AA |
| `node scripts/check-parity.mjs` | **0** | PASS — paridad 507/507; 0 textos duplicados |
| `node e2e/focus-keyboard.mjs` (extra) | **0** | **28/28 PASS** (focus trap, Escape, restauración, aria-live) |
| `npm audit --json` | 1 (esperado) | **5 vulns** = 1 critical + 1 high + 3 moderate (ver §2.2) |
| `git log --oneline c3fd246..HEAD` | 0 | 17 commits (ver §7) |
| `git status --short` | 0 | limpio (sólo `?? docs/capturas/` antes del commit) |

### 2.1 Desglose de warnings de lint (0 errores)

| Archivo | Nº | Regla |
|---|---|---|
| `src/context/AudioContext.tsx` | 5 | `Cannot access refs during render` (85:7 ×3, 245:19, 287:35) |
| `src/context/NarrationContext.tsx` | 4 | `Cannot access refs during render` (62:7 ×3) + `react-hooks/exhaustive-deps` (271:5, `setLang`) |
| `src/hooks/useAudioAnalyser.ts` | 1 | `react-hooks/set-state-in-effect` (29:7) |
| **Total** | **10** | **0 errores** |

### 2.2 `npm audit --json` (5 pendientes, todas devDependencies)

| Paquete | Severidad | Fix disponible | Vía |
|---|---|---|---|
| `vitest` | **critical** | 5.0.3 | major de Vitest |
| `vite` | high | 8.3.1 | major de Vite |
| `@vitest/mocker` | moderate | 5.0.3 | major de Vitest |
| `esbuild` | moderate | 8.3.1 | major de Vite |
| `vite-node` | moderate | 5.0.3 | major de Vitest |

**Nota (desviación):** el plan/encargo anticipaba «esbuild + vite como únicos restantes». La medición real
muestra además la cadena de **Vitest** (`vitest` critical, `@vitest/mocker`, `vite-node`). Ninguna afecta al
runtime de producción (todas `devDependencies`); se resuelven con **upgrade mayor** Vite 8 / Vitest 5.

---

## 3. Definition of Done — mapeo ítem → resultado

| Ítem DoD | Objetivo | Medido | Estado |
|---|---|---|---|
| Typecheck estricto completo | 0 errores con `noUnusedLocals`, `noUnusedParameters`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes` | `npm run typecheck` exit 0, 0 errores | ✅ |
| Build de producción | 0 errores | `npm run build` exit 0 | ✅ |
| Scripts de verificación | `check-sw` / `check-contrast` / `check-parity` PASS | 3/3 exit 0 | ✅ |
| Lighthouse ≥90 ×4 | ≥90 en Performance/Accessibility/Best-Practices/SEO | Desktop **100/100/100/100**; mobile **94/100/100/100** | ✅ |
| Presupuesto eager JS+CSS | ≤120 KiB gzip | **119,05 KiB** (JS 112,23 + CSS 6,82) | ✅ |
| LCP `/explorar` | <1,5 s en Chromium local (desktop) | **0,657 s** desktop · 2,721 s mobile (throttled, informativo) | ✅ desktop |
| Precache de instalación / PWA | ≤1 MiB, sin audio | **11.577 B (0,011 MiB)**, 0 archivos de audio | ✅ |
| 0 peticiones de audio en arranque | 0 requests a `/audio/*` en `/` antes de interacción | **0** | ✅ |

---

## 4. Lighthouse (fuente: `/tmp/lighthouse/`)

| Ruta | Dispositivo | Perf | A11y | Best-Practices | SEO | LCP | TBT | CLS |
|---|---|---|---|---|---|---|---|---|
| `/` | desktop **antes** | 100 | 100 | 100 | 100 | 604 ms | 0 ms | 0,001 |
| `/` | desktop **después** | 100 | 100 | 100 | 100 | 670 ms | 0 ms | 0,001 |
| `/explorar` | desktop **antes** | 100 | 100 | 100 | 100 | 660 ms | 0 ms | 0,001 |
| `/explorar` | desktop **después** | 100 | 100 | 100 | 100 | 657 ms | 0 ms | 0,001 |
| `/` | mobile **antes** | 94 | 100 | 100 | 100 | 2.727 ms | 13 ms | 0,013 |
| `/` | mobile **después** | 94 | 100 | 100 | 100 | 2.728 ms | 20 ms | 0,000 |
| `/explorar` | mobile **antes** | 94 | 100 | 100 | 100 | 2.720 ms | 25 ms | 0,000 |
| `/explorar` | mobile **después** | 94 | 100 | 100 | 100 | 2.721 ms | 11 ms | 0,000 |

Generado con `scripts/lighthouse.mjs` (invoca `npx --yes lighthouse@12`, no instala la dependencia) contra
`vite preview`. El LCP móvil está dominado por el throttling del preset mobile (Slow 4G + CPU 4×); en desktop
(Chromium local) es 0,66 s, dentro del presupuesto <1,5 s. Existen además `home-mobile.report.json` y
`explorar-mobile.report.json` (última pasada) con scores idénticos.

---

## 5. Métricas antes / después

| Métrica | Antes (`c3fd246`) | Después (`c5b59c8`) | Δ |
|---|---|---|---|
| JS eager (gzip) | 167.998 B (164 KiB) | **114.924 B (112,23 KiB)** | −53.074 B (−31,6 %) |
| CSS eager (gzip) | 6.192 B | 6.979 B | +787 B |
| JS+CSS eager (gzip) | ~174.190 B | **121.903 B (119,05 KiB)** | −52.287 B (~−30 %) |
| `dist/` total | 71 MiB (68,1 MiB exactos) | **25.472.885 B (24,3 MiB)** | ~−65 % |
| Transfer inicial | 370.211 B (190.548 B fuentes Google) | fuentes self-host (sin origen externo) | — |
| DOM `/` | 659 | 626 | −33 |
| DOM `/explorar` | 35.748 | **1.189** | **−96,7 %** |
| Heap `/explorar` | 73,1 MB | **10 MB** | −86 % |
| Long tasks `/explorar` | 15 (1.619 ms) | **0 (0 ms)** | −100 % |
| LCP `/explorar` (Lighthouse desktop) | 660 ms | 657 ms | ≈ |
| LCP `/explorar` (Lighthouse mobile) | 2.720 ms | 2.721 ms | ≈ |
| Audio total | 70,5 MB (36,5 música + 34,0 voz; 1.019 `.mp3`) | **24.269.356 B (24,3 MB; 1.019 `.m4a`, 0 `.mp3`)** | −65,5 % |
| Fuentes | 190.548 B (Google, 4 familias) | **54.456 B (4 `.woff2` self-host)** | −71 % |
| Precache SW (install) | 5 MP3 ≈ 34,8 MiB | **11.577 B (0 audio)** | −99,97 % |
| `npm audit` | 11 (7 high, 4 moderate) | **5 (1 critical, 1 high, 3 moderate)** | −6 |
| Corpus | 507 ES / 507 EN / 37 filósofos | 507/507, 0 duplicados | paridad |

Mediciones de DOM/heap/long tasks tomadas con Chromium local (Playwright) sobre el build servido; las de
Lighthouse desde `/tmp/lighthouse/`. El heap depende de `performance.memory` (Chromium).

---

## 6. Capturas antes / después (16 imágenes)

Rutas relativas a `docs/capturas/`. Viewport desktop 1440×900, mobile 390×844; Chromium del repo
(`playwright-core` + `~/.cache/ms-playwright`). ANTES = worktree temporal de `main` @ `c3fd246` en
`/tmp/filosofuss-before` (`npm ci` + build + `vite preview :4180`), ya eliminado. DESPUÉS = árbol actual.

### `antes/`

| Archivo | Tamaño |
|---|---|
| `antes/home-desktop.png` | 85.524 B |
| `antes/home-mobile.png` | 66.149 B |
| `antes/explorar-desktop.png` | 121.967 B |
| `antes/explorar-mobile.png` | 63.646 B |
| `antes/filosofos-desktop.png` | 110.109 B |
| `antes/filosofos-mobile.png` | 65.055 B |
| `antes/favoritos-desktop.png` | 56.310 B |
| `antes/favoritos-mobile.png` | 42.433 B |

### `despues/`

| Archivo | Tamaño |
|---|---|
| `despues/home-desktop.png` | 118.294 B |
| `despues/home-mobile.png` | 60.139 B |
| `despues/explorar-desktop.png` | 118.925 B |
| `despues/explorar-mobile.png` | 59.497 B |
| `despues/filosofos-desktop.png` | 104.894 B |
| `despues/filosofos-mobile.png` | 58.803 B |
| `despues/favoritos-desktop.png` | 54.541 B |
| `despues/favoritos-mobile.png` | 37.789 B |

Total: **16 PNG**. El worktree de ANTES se eliminó con `git worktree remove --force` + `git worktree prune`;
no quedan restos y `android/` no se tocó.

---

## 7. Commits (`c3fd246..HEAD`, 17)

| # | Hash | Mensaje |
|---|---|---|
| 1 | `fa109ea` | docs(nivel-dios): auditoría consolidada, plan por olas y memoria |
| 2 | `146b239` | fix(nivel-dios): OLA A — SW/audio, contraste AA, h1+SEO, tap targets, tipos Era/Tag, ErrorBoundary |
| 3 | `267bc0c` | perf(audio): reencodear a AAC .m4a (70.5→24.3 MB) y eliminar binarios .exe |
| 4 | `e081996` | perf(fonts): self-host y subset (190.5→54.5 KB) y retirar caché de Google Fonts |
| 5 | `cd505ec` | perf(nivel-dios): OLA B — corpus lazy, virtualización /explorar, LazyMotion/m, reduced-motion reactivo, audio progress store |
| 6 | `4c2c83b` | chore(deps): actualizar react-router-dom a v7 (cierra SEC-10) |
| 7 | `8c77070` | feat(design): OLA C base — escala tipográfica, tokens de motion y limpieza de keyframes |
| 8 | `c2ea231` | feat(ui): transiciones de página, skeletons, aria-live y micro-interacciones |
| 9 | `00b69f8` | feat(a11y): Dialog con focus trap y visualizer audio-reactivo |
| 10 | `bddae84` | feat(ui): reveal orquestado, hero cinematográfico y presupuesto de efectos |
| 11 | `1284a65` | feat(capacitor): preparar status bar, splash y back button (web-inert, requiere cap sync) |
| 12 | `d994b51` | feat(pwa): OLA D — manifest, offline, SEO, iconos y safe-area |
| 13 | `d50bb10` | security(docker): CSP, cabeceras, nginx non-root y pinning de imagenes |
| 14 | `74a0890` | feat(i18n): ESL/EN completo, paridad de corpus y deduplicacion |
| 15 | `9f5d1e5` | refactor(types): endurecer TypeScript (noUncheckedIndexedAccess, exactOptionalPropertyTypes, sin codigo muerto) |
| 16 | `6fd2afd` | chore(quality): ESLint, Vitest y presupuesto de bundle |
| 17 | `c5b59c8` | test(a11y): Lighthouse >=90 x4 y validacion de foco/teclado |

---

## 8. Deviations / pendiente

### 8.1 Cambios de agentes fuera del alcance aprobado (aceptar o revertir)

| # | Desviación | Evidencia | Impacto | Acción sugerida |
|---|---|---|---|---|
| D1 | **`terser`** añadido a `devDependencies` y `build.minify: 'terser'` | `package.json`, `vite.config.ts:21-27` | Dependencia no aprobada; ayuda a cumplir el presupuesto eager (~1 KB gzip) | Confirmar o revertir a `esbuild` (el presupuesto quedaría al filo) |
| D2 | **`playwright-core`** añadido a `devDependencies` | `package.json` | Dependencia no aprobada; usada por `e2e/`, `scripts/lighthouse.mjs` y capturas | Confirmar (es sólo dev/tooling) |
| D3 | **`manualChunks` eliminado** de `vite.config.ts` | diff `vite.config.ts` vs `main`: se quitan los chunks `react`/`motion`/`icons` | El JS eager queda en un único chunk (mejor gzip por contexto compartido); cambia la forma de los bundles | Confirmar o restaurar los chunks de `main` |
| D4 | **`react-router-dom` v6 → v7.18.4** (major, no el `^6.30.6` previsto en A4) | `package.json`; commit `4c2c83b` | Cierra SEC-10 pero salta una major | Confirmar; valida build/tests verdes |
| D5 | **`@tanstack/react-virtual`** instalado (el plan lo marcaba «requiere aprobación») | `package.json`; commit `cd505ec` | Habilita la virtualización de `/explorar` (DOM −96,7 %) | Confirmar |
| D6 | **`@capacitor/app`, `@capacitor/status-bar`, `@capacitor/splash-screen`** instalados (D8 marcaba «requiere aprobación») | `package.json`; commit `1284a65` | Plugins web-inert; falta `npx cap sync` nativo | Confirmar y decidir sync nativo |
| D7 | **Toolchain ESLint + Vitest** instalado (E7 marcaba «requiere aprobación») | `package.json`; commit `6fd2afd` | Habilita lint/tests/presupuesto | Confirmar |
| D8 | `postcss` 8.4.45 → ^8.5.23 | `package.json` | Bump de seguridad previsto en A4 | Aceptar |

### 8.2 Pendiente / decisiones abiertas

- **Vite major (SEC-02):** no aplicado. Quedan `vite` (high) y `esbuild` (moderate) sólo resolubles con **Vite 8**.
- **Vitest major:** `npm audit` reporta `vitest` (critical) + `@vitest/mocker`, `vite-node`; se limpian con **Vitest 5**.
- **Endurecimiento Android (D6):** diferido (firma, `minify`, `network_security_config`); sin keystore de release.
- **`npx cap sync` nativo:** pendiente; los plugins Capacitor están instalados pero `android/` no se sincronizó
  (y no debe tocarse en este paso).
- **Push / PR:** **no** realizados en esta tarea (los maneja otro paso).
- **Warnings de lint (10):** no bloquean (`0 errores`); pendiente decidir si se silencian o se refactorizan
  (`refs during render` en Audio/Narration context, `setState` en efecto del analizador, `setLang` en deps).
