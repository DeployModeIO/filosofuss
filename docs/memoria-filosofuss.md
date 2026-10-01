# Filosofuss — Memoria del proyecto y registro de decisiones

> Bitácora operativa (no hay herramienta de memoria externa). Actualizar al cerrar cada ola.
> Artefactos relacionados: `docs/plan-nivel-gods.md` (plan por olas), `docs/auditoria-nivel-gods.md`
> (auditorías consolidadas) y `docs/validacion-nivel-dios.md` (informe de Definition of Done + capturas).

## 1. Estado del repositorio (FINAL)

- **Ruta:** `/home/deploymodeio/proyectos/filosofuss`
- **Rama:** `nivel-dios` (activa). `main` intacta en `c3fd246`.
- **Base auditada:** `c3fd246` — *"chore: anadir Dockerfile multi-stage (Vite build + nginx con fallback SPA) y .dockerignore"*
- **Rango de la misión:** `c3fd246..c5b59c8` (**17 commits**). El commit de documentación de la OLA 4
  (`docs(nivel-dios): informe de validacion, capturas antes/despues y estado final`) se añade sobre `c5b59c8`.
- **Working tree:** limpio tras el commit de docs. **No hay push.**
- **`android/`:** sin tocar. **`node_modules/` y `dist/`:** no versionados (`.gitignore`).

## 2. Stack y versiones finales

| Componente | Versión | Nota |
|---|---|---|
| React / ReactDOM | ^18.3.1 | |
| TypeScript (tsc) | ^5.5.4 → **5.9.3** instalado | `npm run typecheck` = `tsc -p tsconfig.json && tsc -p tsconfig.node.json` |
| Vite | ^5.4.0 → **5.4.21** instalado | `base: './'`; `build.minify: 'terser'`; sin `manualChunks` |
| Tailwind CSS | ^3.4.10 | `darkMode: 'class'` |
| Framer Motion | ^11.3.0 | `LazyMotion` + `m` (feature bundle `domMax` diferido) |
| React Router | **7.18.4** | actualizado desde v6.26 (cierra SEC-10) |
| Capacitor | ^8.4.1 (android, cli, core) + `app`/`status-bar`/`splash-screen` | plugins web-inert; `npx cap sync` **pendiente** |
| Virtualización | `@tanstack/react-virtual` ^3.14.13 | `/explorar` |
| Vitest / ESLint | ^2.1.9 / ^10.11.0 | toolchain de calidad |
| Node / npm | v22.20.0 / 10.9.3 | |

## 3. Métricas finales (vs baseline `c3fd246`)

| Métrica | Baseline | Final |
|---|---|---|
| JS+CSS eager (gzip) | ~174.190 B | **121.903 B (119,05 KiB)** ≤ 120 KiB |
| `dist/` total | 71 MiB | **24,3 MiB** |
| DOM `/explorar` | 35.748 nodos | **1.189 nodos** |
| Long tasks `/explorar` | 15 (1.619 ms) | **0** |
| Heap `/explorar` | 73,1 MB | **10 MB** |
| Audio total | 70,5 MB (1.019 `.mp3`) | **24,3 MB (1.019 `.m4a`, 0 `.mp3`)** |
| Fuentes | 190.548 B (Google) | **54.456 B (self-host `.woff2`)** |
| Precache SW (install) | 5 MP3 ≈ 34,8 MiB | **11.577 B (0 audio)** |
| `npm audit` | 11 (7 high, 4 moderate) | **5 (1 critical, 1 high, 3 moderate)** |
| Corpus | 507 ES / 507 EN / 37 filósofos | 507/507, 0 duplicados (paridad) |
| Lighthouse (desktop) | — | **100/100/100/100** en `/` y `/explorar` |
| Typecheck estricto | 28 errores | **0** |

Detalle completo y capturas antes/después (16 PNG) en `docs/validacion-nivel-dios.md`.

## 4. Decisiones tomadas

1. **Diseño "Sabiduría eterna":** mármol/oro/dorado-atardecer sobre oscuro profundo; vino `#7a2e4d` retirado
   del texto; `--accent-3` redefinido como *ember* `#c97a4a`; degradado sólo en hairlines/superficies.
2. **Un solo gesto audaz:** cita monumental del Hero con reveal por máscara + línea dorada; el resto quieto.
3. **Tipografía:** Cormorant Garamond + Inter + Cinzel (wordmark), self-host con subset; Playfair retirada.
4. **Contraste:** ≥AA en dark/light/paper (33 checks PASS por `scripts/check-contrast.mjs`).
5. **PWA:** audio fuera del precache, carga on-demand, caché versionada por build, sin SW en Capacitor.
6. **Rendimiento:** corpus lazy, `/explorar` virtualizado, `LazyMotion`/`m`, `prefers-reduced-motion` reactivo.
7. **Olas A–E** completadas; estado y commit de cierre de cada una en `docs/plan-nivel-gods.md`.

## 5. Dependencias añadidas durante la misión

**Runtime:** `@tanstack/react-virtual` (^3.14.13), `react-router-dom` ^6.26.0 → **^7.18.4**,
`@capacitor/app` (^8.1.1), `@capacitor/status-bar` (^8.0.3), `@capacitor/splash-screen` (^8.0.2).

**Toolchain:** `eslint` + `@eslint/js` + `eslint-plugin-react-hooks` + `globals` + `typescript-eslint`,
`vitest`, `postcss` 8.4.45 → ^8.5.23.

> ⚠️ **Añadidas por agentes, REQUIEREN CONFIRMACIÓN DEL USUARIO:**
> - **`terser`** (^5.51.2) — habilita `build.minify: 'terser'` (presupuesto eager).
> - **`playwright-core`** (^1.63.0) — tooling de `e2e/focus-keyboard.mjs`, `scripts/lighthouse.mjs` y capturas.
> También conviene confirmar `@tanstack/react-virtual` y los plugins Capacitor, que el plan marcaba como
> «requiere aprobación» y quedaron instalados. Ver §8 de `docs/validacion-nivel-dios.md`.

## 6. Decisiones abiertas / pendiente

- **Vite major (SEC-02):** pospuesto. Quedan `vite` (high) y `esbuild` (moderate) resolubles sólo con Vite 8.
- **Vitest major:** `npm audit` reporta `vitest` (critical) + `@vitest/mocker`, `vite-node`; se limpian con Vitest 5.
- **Endurecimiento Android (D6):** diferido (firma, `minify`, `network_security_config`); sin keystore de release.
- **`npx cap sync` nativo:** pendiente; plugins instalados, `android/` sin sincronizar (no tocar en OLA 4).
- **Warnings de lint (10, 0 errores):** a decidir si se silencian o refactorizan
  (`refs during render` en Audio/Narration, `set-state-in-effect` en `useAudioAnalyser`, `setLang` en deps).
- **Push / PR:** no realizados en la OLA 4 (los maneja otro paso).

## 7. Comandos de verificación

```bash
npm run typecheck   # 0 errores (flags estrictos completos)
npm run lint        # 0 errores · 10 warnings
npm test            # 39 tests / 3 archivos
npm run build       # tsc + vite build → dist/
npm run budget      # eager JS+CSS ≤ 120 KiB gzip → PASS
node scripts/check-sw.mjs        # audio fuera del precache, caché versionada, valida .ok
node scripts/check-contrast.mjs  # AA en dark/light/paper
node scripts/check-parity.mjs    # ES/EN 507/507, 0 duplicados
npm audit --json                 # 5 vulns dev-only (Vite/Vitest majors)
BASE_URL=http://localhost:4280 node e2e/focus-keyboard.mjs   # 28/28 PASS (requiere preview)
BASE_URL=http://localhost:4280 node scripts/lighthouse.mjs   # ≥90 ×4 (npx lighthouse@12)
```

## 8. Convenciones

- Rama de trabajo: **`nivel-dios`**. No push a `main`. No commitear salvo petición explícita.
- **No tocar** `node_modules/`, `android/`, `dist/`.
- Convención de commits: `feat:`, `fix:`, `chore(...)`, en español/inglés mezclado (estilo existente).
- Todo texto visible pasa por `t()`; paridad ES/EN 507/507 obligatoria.
- Tokens de color en `:root` + overrides `html.light`/`html.paper`; sin un cuarto tema.
