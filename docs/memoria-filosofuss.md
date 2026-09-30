# Filosofuss — Memoria del proyecto y registro de decisiones

> Bitácora operativa (no hay herramienta de memoria externa). Actualizar al cerrar cada ola.
> Este archivo y `docs/plan-nivel-gods.md` son los artefactos de la OLA 2.

## 1. Estado del repositorio

- **Ruta:** `/home/deploymodeio/proyectos/filosofuss`
- **Rama:** `nivel-dios` (activa)
- **Commit auditado:** `c3fd246` — *"chore: anadir Dockerfile multi-stage (Vite build + nginx con fallback SPA) y .dockerignore"*
- **Working tree:** limpio salvo `?? docs/` (los informes de auditoría y este plan **no están commiteados**).
- **No push a `main`.** No commitear salvo petición explícita.

## 2. Stack y versiones observadas

| Componente | Versión | Nota |
|---|---|---|
| React / ReactDOM | ^18.3.1 | |
| TypeScript (tsc) | ^5.5.4 → **5.9.3** instalado | `npm run typecheck` = `tsc -p tsconfig.json && tsc -p tsconfig.node.json` |
| Vite | ^5.4.0 → **5.4.21** instalado | `base: './'` |
| Tailwind CSS | ^3.4.10 | `darkMode: 'class'` |
| Framer Motion | ^11.3.0 | bundle completo (`motion`, sin `LazyMotion`) |
| Capacitor | ^8.4.1 (android, cli, core) | `webDir: 'dist'`, appId `com.filosofuss.app` |
| React Router | ^6.26.0 → 6.30.4 instalado | vulnerable D-10 |
| lucide-react | ^0.439.0 | |
| Node / npm | v22.20.0 / 10.9.3 | |
| Paquetes | 232 (`npm ls --all`, excl. raíz); 280 entradas en `package-lock.json` | |
| `node_modules` | 146 MiB | |

## 3. Métricas baseline (medidas / auditadas)

- **`dist/` total:** 71 MiB (`du`) ≈ **68,1 MiB** exactos (performance.md).
- **JS inicial:** 558.329 B raw / **167.998 B gzip (~164 KiB)**.
- **Transfer inicial real (CDP):** **370.211 B**, de los cuales **190.548 B (51,5 %) son fuentes** de Google.
- **Chunks iniciales:** `index` 262.292 (72.536 gz, arrastra todo el corpus), `react` 163.451 (53.293 gz), `motion` 117.034 (38.850 gz), `icons` 15.552 (3.319 gz), CSS 26.575 (6.192 gz).
- **`public/audio`:** 70,5 MB (música 36,5 MB / 5 pistas · voz 34,0 MB / 1.019 archivos).
- **Corpus:** **507 citas ES + 507 traducciones EN + 37 filósofos** (verificado por ids únicos).
- **`/explorar`:** 507 `QuoteCard`, **35.748 nodos DOM**, 73,1 MB heap, LCP **2.636 ms**, 15 long tasks (1.619 ms). Al teclear 9 chars: +35 long tasks, 6.035 ms.
- **`/`:** LCP 1.312 ms, FCP 328 ms, DOM 659, heap 9,5 MB.
- **Typecheck:** **0 errores** (config actual: `strict:true`, `noUnusedLocals:false`, `noUnusedParameters:false`). Con flags estrictos completos: **28 errores**.
- **`npm audit`:** **11 vulns** = **7 high + 4 moderate** (coincide con security.md: `{"moderate":4,"high":7,"total":11}`).
- **SW precache:** 5 MP3 ≈ **34,8 MiB** en `install` (`public/sw.js:14-23`).
- **Lighthouse:** **no instalado**; no hay puntuación oficial (solo Chromium/CDP local).

## 4. Decisiones tomadas

1. **Diseño "Sabiduría eterna":** conservar mármol/oro/dorado-atardecer sobre oscuro profundo. **Eliminar el vino `#7a2e4d` del texto** (2.19:1) y redefinir `--accent-3` como *ember* `#c97a4a` (5.99:1). El degradado pasa a **hairlines y superficies**, no a texto.
2. **Gastar la audacia en un solo lugar:** la cita monumental del Hero con reveal por máscara + una línea dorada; el resto, quieto y sólido.
3. **Tipografía:** reducir de 4 familias/20 estilos a **Cormorant Garamond (display) + Inter (sans) + Cinzel solo wordmark (subset)**; eliminar Playfair Display. Self-host con subset `latin`.
4. **Corrección de contraste (propuesta):** light `--gold #7d5a1c` (5.86:1), paper `--gold #7a561c` (5.53:1), paper `--muted #5b5343` (5.59:1), `--on-accent` mármol `#f4f1ea` en light/paper (peor botón 5.19:1).
5. **Unificar los tres negros** (`#07070f`/`#0a0a0f`/`#0a0a12`) en `--bg #0a0a0f` + `--ink`.
6. **PWA:** sacar los MP3 del precache (install ≤1 MiB); audio on-demand; validar `fresh.ok` antes de cachear; caché versionada por build; rutas relativas con `BASE_URL`; PWA no registra SW en Capacitor.
7. **Notificaciones:** **NO** en web (sin backend ni valor); Capacitor local-notifications diferido (requiere aprobación).
8. **Sin dependencias nuevas sin aprobación.** Efectos con Framer Motion 11 + Web Audio nativo.
9. **Olas:** OLA A (quick wins P0, 9 tareas), OLA B (rendimiento/bundle, 9), OLA C (diseño/efectos, 9), OLA D (PWA/Capacitor, 8), OLA E (pulido/Lighthouse, 7) = **42 tareas**.
10. **Accesibilidad:** todo efecto respeta `prefers-reduced-motion` de forma **reactiva** (hook), no como constante de módulo.

## 5. Preguntas abiertas

- ¿Se aprueba la **paleta propuesta** (redefinir `--accent-3` y oscurecer `--gold` en light/paper)?
- ¿Se aprueba **virtualizar** con `@tanstack/react-virtual` o se vendoriza sin deps?
- ¿Se aprueba el **re-encode de audio** a Opus/AAC (70,5 MB → ≤25 MB)?
- ¿Se borran los **6 `.exe`** de `scripts/` (B-03)?
- ¿Se actualiza **Vite a 8.x** (D-02) y las mayores de D-11, o se posponen?
- ¿Hay **keystore de release** para Android (A-04)?
- ¿Se instalan `lighthouse`, ESLint y Vitest?
- ¿Se commitea/mergea `nivel-dios` y se incluye `docs/`?

## 6. Convenciones

- Rama de trabajo: **`nivel-dios`**. No push a `main`. No commitear salvo petición.
- **No tocar** `node_modules/`, `android/` (salvo OLA D acordada), `dist/`.
- Solo se modifican **archivos fuente** y se crean los artefactos del plan; esta OLA 2 es de documentación.
- Convención de commits del repo: `feat:`, `fix:`, `chore(ui):`, en español/inglés mezclado; seguir el estilo existente.
- Todo texto visible pasa por `t()`; paridad ES/EN 507/507 obligatoria.
- Tokens de color en `:root` + overrides `html.light`/`html.paper`; no añadir un cuarto tema.
- Los números del plan marcados **(propuesta)** no están aplicados.

## 7. Inconsistencias detectadas en las auditorías

1. **ux-a11y-seo.md:** el recuento por severidad dice **Alto 9 / Total 32**, pero la tabla lista **A1–A10 = 10 Altos**; el total real es **33**.
2. **security.md:** el resumen dice **Medio 12 · Bajo 9 · Informativo 6 · total 34**, pero la tabla da **Medio 13 · Bajo 8 · Informativo 7 · total 35**; además dice "6 controles limpios" cuando hay **7 filas informativas/limpias** (S-01, X-01..X-04, B-04, W-04).
3. **Unidades del precache del SW:** UX/security dicen "~36 MB", performance midió **34,8 MiB (36.511.278 B)** — mismo dato, unidades distintas.
4. **Tres negros distintos** (`#07070f` manifiesto, `#0a0a0f` CSS/meta, `#0a0a12` tinta) — los informes lo documentan como M1/M13, no como error, pero es una inconsistencia real de marca.
5. **`docs/` sin commitear:** los cuatro informes de auditoría existen en disco pero `git status` los muestra como `?? docs/`.
6. **Divergencia de familias tipográficas:** `index.css:27-30` define 4 familias y `tailwind.config.js:22-27` las mapea; performance midió **20 estilos** cargados, no 4 — el número de "familias" y el de "estilos" se mezclan en los informes.
7. **TypeScript:** code.md titula "TypeScript 5.5" pero el binario instalado es **5.9.3** (package.json `^5.5.4`); no es error, es caret.
