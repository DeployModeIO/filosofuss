# Auditoría de calidad de código — Filosofuss

- **Repositorio:** `/home/deploymodeio/proyectos/filosofuss`
- **Rama:** `nivel-dios` @ `c3fd246` (2026-09-03)
- **Stack:** React 18.3 + TypeScript 5.5 + Vite 5 + Tailwind 3.4 + Framer Motion 11 + Capacitor 8
- **Alcance:** 44 archivos `.ts/.tsx` + `index.css` + `tailwind.config.js` (12.165 LOC en `src/`)
- **Tipo:** auditoría read-only. No se modificó código fuente. Único artefacto creado: este documento.
- **Fecha:** 2026-09-30

## Resumen ejecutivo

`npm run typecheck` pasa con **0 errores** (exit code 0). El proyecto **no usa `any`,
no usa `@ts-ignore`/`@ts-expect-error` y prácticamente no usa aserciones no-nulas**
(1 sola). La base de tipos es sana. Los problemas reales son de **deuda de políticas
de compilación** (flags estrictos apagados), **código muerto**, **duplicación**
(bloque de *reduced motion* ×14, helpers reimplementados, corpus duplicado) y
**ausencia de infraestructura de calidad** (sin ESLint, sin tests, sin Error Boundary).

Bajo el endurecimiento solicitado (`noUnusedLocals`, `noUnusedParameters`,
`noImplicitAny`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`) el proyecto
pasa de 0 a **28 errores**.

Conteo por severidad de los hallazgos: **Alta 2 · Media 10 · Baja 16** (28 hallazgos).

---

## Findings

| ID | Hallazgo | Severidad | Evidencia (archivo:línea / comando) | Impacto | Esfuerzo | Recomendación |
|----|----------|-----------|--------------------------------------|---------|----------|---------------|
| F-01 | No existe **Error Boundary** global; cualquier error de render desmonta toda la app | Alta | `grep -rniE "ErrorBoundary\|componentDidCatch\|getDerivedStateFromError" src` → 0 resultados; `src/App.tsx:31-57` | Pantalla en blanco total ante un fallo de render/efecto | S | Añadir `ErrorBoundary` (class o `react-error-boundary`) envolviendo `<Routes>` con fallback y reporte |
| F-02 | Tipos `Tag` y `Era` definidos en `types.ts` pero **nunca aplicados**: `Philosopher.era: string` y `Quote.tags: string[]` | Alta | `src/types.ts:5-19` (`Era`), `src/types.ts:22-46` (`Tag`), `src/types.ts:56` (`era: string`), `src/types.ts:77` (`tags: string[]`); `grep -rnE "\b(Tag\|Era)\b" src` solo los encuentra en `types.ts` | Se pierde la validación de vocabulario controlado en compilación; typos en datos son silenciosos | S | Tipar `era: Era` y `tags: Tag[]`; romperá donde haya valores fuera del vocabulario (bueno: los localiza) |
| F-03 | Flags estrictos apagados: `noUnusedLocals`, `noUnusedParameters`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes` | Media | `tsconfig.json:25-26` (`noUnusedLocals:false`, `noUnusedParameters:false`); `npx tsc ... --noUncheckedIndexedAccess --exactOptionalPropertyTypes` → 28 errores | Bugs latentes de índice fuera de rango y props `undefined` en Framer Motion | M | Endurecer por fases (ver sección "Deuda a estricto"); arreglar primero `noUncheckedIndexedAccess` |
| F-04 | `safeGet` castea `JSON.parse` a `T` **sin validación de forma** | Media | `src/lib/storage.ts:15` (`return JSON.parse(raw) as T;`) | Datos corruptos/antiguos en `localStorage` violan el tipo en runtime y pueden romper la UI | M | Validar con un esquema (Zod/valibot) o guardas manuales; degradar a `fallback` si no valida |
| F-05 | Fallback de rutas `path="*"` renderiza `<Home />` **sin redirección ni 404** | Media | `src/App.tsx:46` (`<Route path="*" element={<Home />} />`) | URLs inválidas muestran Home con URL engañosa; SEO/accesibilidad confusos | S | Redirigir a `/` (`<Navigate replace>`) o página 404 dedicada |
| F-06 | Errores **silenciados sin feedback** al usuario (portapapeles, audio, almacenamiento) | Media | `src/components/quotes/QuoteCard.tsx:132-139` (copy devuelve `false`, sin UI), `src/context/AudioContext.tsx:84-86` (autoplay bloqueado → `setIsPlaying(false)`), `src/lib/storage.ts:29,39` | El usuario no sabe si la acción falló; parece "no responde" | M | Añadir estado/aviso (toast) y logging; distinguir "cancelado" de "error real" |
| F-07 | `catch {}` vacíos y **errores no tipados** (sin `unknown` ni tipo discriminado) | Media | `src/lib/storage.ts:16,29,39`; `src/components/quotes/QuoteCard.tsx:136,158`; `src/lib/storage.ts` (`catch {` en 3 sitios) | Diagnóstico imposible; no se distingue cuota agotada de modo privado | S | `catch (e: unknown)` + log acotado; devolver resultado tipado (`{ok:false, reason}`) |
| F-08 | Bloque `reduceMotion`/`prefersReducedMotion` **duplicado 14 veces** | Media | `grep -rn "prefers-reduced-motion" src` → 14 archivos (p.ej. `Home.tsx:12-15`, `QuoteCard.tsx:12-15`, `AudioPlayer.tsx:19-22`, `ZenMode.tsx:25-28`) | Divergencia y coste de mantenimiento; lógica no reactiva (evaluada 1 vez) | S | Extraer hook `usePrefersReducedMotion()` (con `matchMedia` reactivo) |
| F-09 | Helper `initials()` **reimplementado** con lógica distinta | Media | `src/components/quotes/QuoteCard.tsx:37-43` y `src/components/sections/PhilosopherWall.tsx:25-35` | Resultados inconsistentes para el mismo autor entre tarjeta y muro | S | Unificar en `lib/utils.ts` (versión con `CONNECTORS`) |
| F-10 | **8 textos de cita duplicados** con IDs distintos entre corpus | Media | `src/data/quotes.ts:766` = `src/data/quotesBatch2.ts:422`; `src/data/quotes.ts:860` = `src/data/quotesBatch3.ts:79`; (6 más detectadas por script) | Corpus inflado y resultados de búsqueda repetidos | M | Deduplicar por `text` normalizado en build/test; unificar IDs |
| F-11 | `QuoteCard` concentra demasiadas responsabilidades (tilt 3D, spotlight, share, narración, acciones) | Media | `src/components/quotes/QuoteCard.tsx:83-369` (369 LOC, el componente más grande) | Difícil de testear y de reutilizar; cambios con alto riesgo de regresión | L | Extraer `useTilt3D`, `useShareActions` y subcomponentes `QuoteActions`/`QuoteMeta` |
| F-12 | **Sin ESLint, sin tests y sin script de lint/test** | Media | `ls -a \| grep -iE "eslint\|prettier\|biome"` → NONE; `package.json` sin `lint`/`test`; `grep -rn eslint src` → solo un comentario | No hay red de seguridad; regresiones y deuda de hooks (`exhaustive-deps`) no se detectan | M | Añadir ESLint + `eslint-plugin-react-hooks`, Vitest + Testing Library; scripts `lint`/`test` |
| F-13 | **Exports muertos** en `utils`/hooks/i18n | Baja | `slugify` (`utils.ts:10`), `randomInt` (`utils.ts:62`), `clamp` (`utils.ts:70`) con 0 usos; `useRandomQuote` (`hooks/useQuoteOfDay.ts:13`) 0 usos; `LOCALES` (`i18n/strings.ts:7`) 0 usos; `useTheme` (`hooks/useTheme.ts:3`) 0 usos (verificado con grep) | Código sin mantener y superficie de API falsa | S | Eliminar o marcar `@internal`; validar con `noUnusedLocals` |
| F-14 | Campo `Track.filename` declarado y poblado pero **nunca leído** | Baja | `src/data/tracks.ts:3` (declaración) + 5 asignaciones; `grep -rn "\.filename" src` → solo `tracks.ts` | Datos muertos y fuente de desincronización con `src` | S | Eliminar el campo o derivar `src` de él |
| F-15 | **6 claves i18n sin uso**; una de ellas hardcodeada en el componente | Baja | `hero.tagline`, `hero.meta`, `home.featured.title`, `theme.toLight`, `theme.toDark`, `lang.toggle` (análisis de `strings.ts`); `LanguageToggle.tsx:12-14` usa `"Cambiar idioma"` literal | UI no traducible y diccionarios inflados | S | Usar `t('lang.toggle')` en `LanguageToggle`; purgar claves huérfanas |
| F-16 | Prop `placeholder` de `SearchBar` declarada y **nunca usada** (único error bajo `noUnusedLocals`) | Baja | `src/components/controls/SearchBar.tsx:15` (default) vs `SearchBar.tsx:32` (`placeholder={t('search.placeholder')}`); error `TS6133` | API engañosa (pasar `placeholder` no hace nada) | S | Usar el prop o eliminarlo; activar `noUnusedParameters` |
| F-17 | Dependencias Capacitor no importadas en `src`; `@capacitor/cli` está en `dependencies` | Baja | `grep -rn "capacitor" src` → 0; `package.json:16` (`@capacitor/cli` en deps) | Bundle/instalación más pesada; CLI no debería ir a producción | S | Mover `@capacitor/cli` a `devDependencies`; documentar deps de plataforma Android |
| F-18 | **1 única aserción no-nula** `!` | Baja | `src/main.tsx:7` (`getElementById('root')!`) | Posible `null` no controlado si cambia el HTML | S | `createRoot` con guarda o `root` validado (evitar `!`) |
| F-19 | `@keyframes` definidos **dos veces**: en `index.css` y en `tailwind.config.js` | Baja | `src/index.css:267-375` (11 keyframes) vs `tailwind.config.js:44-89` (mismos 11) | Duplicación y posible doble emisión en el CSS final | S | Dejar solo la definición de Tailwind (o solo CSS) |
| F-20 | Utilidades/anims de Tailwind **definidas y nunca usadas** | Baja | 0 usos de `bg-aurora-1`, `bg-hero-glow`, `backdrop-blur-xs`, `animate-shimmer`, `animate-fade-up`, `animate-fade-in`, `animate-drift`, `animate-aurora`, `animate-gradient-x`, `animate-gradient-y` (`tailwind.config.js:28-102`) | Config ruidosa y CSS potencialmente mayor | S | Podar utilidades no usadas o usarlas de forma consistente |
| F-21 | `import` en **mitad del archivo** | Baja | `src/data/quotes.ts:1669` (`import { quoteEnById } from "./quotesEn";` tras funciones) | Viola convención y puede sorprender al tree-shaking/hoisting | S | Subir todos los imports al encabezado |
| F-22 | **Shadowing de `t`** (función de traducción) por variables locales | Baja | `src/components/sections/BrowseQuotes.tsx:18` (`t`) vs `:30` (`const t = setTimeout`); `src/components/quotes/QuoteCard.tsx:91` (`t`) vs `:260` (`quote.tags.map((t) => …)`) | Confusión y riesgo de usar la variable equivocada | S | Renombrar (`timer`, `tag`) |
| F-23 | `key` por **índice de array** en listas | Baja | `src/components/effects/AuroraBackground.tsx:68,82`; `src/components/ui/AudioPlayer.tsx:36,39` | Riesgo bajo (listas estáticas) pero anti-patrón | S | Usar clave estable (`blob.bg`, id de pista) |
| F-24 | 20 **handlers inline** (`onX={() => …}`) en JSX | Baja | `grep -rnE "on[A-Z][a-zA-Z]*=\{\(\) =>" src` → 20 (p.ej. `QuoteCard.tsx:277,329,361`) | Re-render/memoización subóptima en listas grandes | M | `useCallback` en callbacks pasados a hijos memoizados |
| F-25 | `quotesEn.ts` (2504 LOC) **replica 507 registros** sin verificación de paridad automática | Baja | `src/data/quotesEn.ts` (2504 LOC); hoy paridad 507/507 ES↔EN (script), `quoteEnById` en `quotes.ts:1669` | Deriva silenciosa al añadir citas ES sin traducir | M | Test de paridad ES/EN en CI; fallback ya existe (`getQuoteText`) |
| F-26 | `Hero` obtiene cita aleatoria **directamente** en vez de por hook (inconsistencia) | Baja | `src/components/sections/Hero.tsx:26` (`useState(() => getRandomQuote())`) vs `src/hooks/useQuoteOfDay.ts:13` (`useRandomQuote`, muerto) | Dos patrones para lo mismo; hook muerto por desuso | S | Unificar: consumir `useRandomQuote` o eliminar el hook |
| F-27 | `reduceMotion` se evalúa **una sola vez** al cargar el módulo (no reactivo) | Baja | Constantes de módulo en `Home.tsx:12`, `QuoteCard.tsx:12`, `AudioPlayer.tsx:19`, etc.; `ParticleField.tsx:45` sí lo reevalúa | No responde si el usuario cambia la preferencia en caliente | S | Usar `matchMedia(...).addEventListener('change')` dentro de un hook |
| F-28 | Comentario `eslint-disable` **inerte** (no hay ESLint) | Baja | `src/components/ui/ZenMode.tsx:67` (`// eslint-disable-next-line react-hooks/exhaustive-deps`) | Falsa sensación de linting; deps de efecto omitidas sin verificación | S | Instalar ESLint (F-12) y revisar las deps reales |

---

## Typecheck

Comando ejecutado y salida **verbatim** (`npm run typecheck` → `tsc -p tsconfig.json && tsc -p tsconfig.node.json`):

```
> filosofuss@0.0.0 typecheck
> tsc -p tsconfig.json && tsc -p tsconfig.node.json
```

**Resultado: 0 errores. Exit code 0.**

`package.json:11` define `"typecheck": "tsc -p tsconfig.json && tsc -p tsconfig.node.json"`. No hay warnings ni errores con la configuración actual (`strict: true`, `noUnusedLocals: false`, `noUnusedParameters: false`).

### Detalle de flags

- `strict: true` (`tsconfig.json:20`) ya implica `noImplicitAny`, `strictNullChecks`, etc. Por tanto **`noImplicitAny` ya está activo** y no introduce errores nuevos.
- Los únicos flags apagados son `noUnusedLocals` y `noUnusedParameters` (`tsconfig.json:25-26`).

---

## Deuda a estricto

Salida del endurecimiento solicitado (sin editar `tsconfig.json`):

```
npx tsc -p tsconfig.json --noEmit --noUnusedLocals --noUnusedParameters \
  --noImplicitAny --noUncheckedIndexedAccess --exactOptionalPropertyTypes
```

**Total: 28 errores.** Distribución por código:

| Código | Nº | Flag responsable | Descripción |
|--------|----|------------------|-------------|
| `TS2375` | 14 | `exactOptionalPropertyTypes` | Props de Framer Motion que reciben `undefined` |
| `TS2322` | 7 | `noUncheckedIndexedAccess` | Accesos por índice devuelven `T \| undefined` |
| `TS2532` | 6 | `noUncheckedIndexedAccess` | "Object is possibly 'undefined'" |
| `TS6133` | 1 | `noUnusedLocals`/`noUnusedParameters` | Variable declarada y no leída |

### `noUnusedLocals` + `noUnusedParameters` (1 error)

```
src/components/controls/SearchBar.tsx(15,3): error TS6133: 'placeholder' is declared but its value is never read.
```

### `noUncheckedIndexedAccess` (13 errores)

```
src/components/effects/ParticleField.tsx(30,7): error TS2322: Type 'string | undefined' is not assignable to type 'string'.
src/components/quotes/QuoteCard.tsx(41,34): error TS2532: Object is possibly 'undefined'.
src/components/quotes/QuoteCard.tsx(42,11): error TS2532: Object is possibly 'undefined'.
src/components/quotes/QuoteCard.tsx(42,32): error TS2532: Object is possibly 'undefined'.
src/components/sections/PhilosopherWall.tsx(31,34): error TS2532: Object is possibly 'undefined'.
src/components/sections/PhilosopherWall.tsx(33,5): error TS2532: Object is possibly 'undefined'.
src/components/sections/PhilosopherWall.tsx(33,26): error TS2532: Object is possibly 'undefined'.
src/components/sections/PhilosopherWall.tsx(38,3): error TS2322: Type 'string | undefined' is not assignable to type 'string'.
src/context/AudioContext.tsx(214,7): error TS2322: Type 'Track | undefined' is not assignable to type 'Track'.
src/data/quotes.ts(1717,3): error TS2322: Type 'Quote | undefined' is not assignable to type 'Quote'.
src/lib/utils.ts(48,6): error TS2322: Type 'T | undefined' is not assignable to type 'T'.
src/lib/utils.ts(48,15): error TS2322: Type 'T | undefined' is not assignable to type 'T'.
src/lib/utils.ts(58,3): error TS2322: Type 'T | undefined' is not assignable to type 'T'.
```

### `exactOptionalPropertyTypes` (14 errores, todos `TS2375`)

Props opcionales de Framer Motion que hoy se pasan como `undefined`:

```
src/components/quotes/QuoteCard.tsx(66,6)   whileTap
src/components/quotes/QuoteCard.tsx(179,6)  initial/whileInView
src/components/quotes/QuoteCard.tsx(187,8)  style
src/components/quotes/QuoteCard.tsx(281,16) animate
src/components/quotes/QuoteOfDay.tsx(45,8)  animate
src/components/quotes/QuoteOfDay.tsx(71,8)  animate
src/components/quotes/QuoteOfDay.tsx(90,8)  animate
src/components/sections/BrowseQuotes.tsx(170,16) exit
src/components/sections/Favorites.tsx(89,18)     exit
src/components/sections/PhilosopherWall.tsx(132,14) exit
src/components/ui/ZenMode.tsx(76,10)             exit
src/pages/Home.tsx(27,8)   whileInView
src/pages/Home.tsx(34,10)  whileInView
src/pages/Home.tsx(61,8)   whileInView
```

Lectura: activar `exactOptionalPropertyTypes` obliga a **eliminar la propagación de
`undefined`** a props de Framer Motion (p. ej. `{...(cond ? props : {})}` o valores
por defecto) y a blindar los accesos por índice. Son cambios mecánicos, no de diseño.

---

## Top 15 archivos por LOC

Comando: `find src -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.css" \) -exec wc -l {} + | sort -rn`

| # | Archivo | LOC |
|---|---------|-----|
| 1 | `src/data/quotesEn.ts` | 2504 |
| 2 | `src/data/quotes.ts` | 1761 |
| 3 | `src/data/voiceManifest.ts` | 1037 |
| 4 | `src/data/quotesBatch1.ts` | 616 |
| 5 | `src/data/quotesBatch3.ts` | 513 |
| 6 | `src/data/quotesBatch4.ts` | 462 |
| 7 | `src/data/quotesBatch2.ts` | 462 |
| 8 | `src/data/philosophers.ts` | 416 |
| 9 | `src/index.css` | 387 |
| 10 | `src/components/quotes/QuoteCard.tsx` | 369 |
| 11 | `src/i18n/strings.ts` | 299 |
| 12 | `src/components/ui/AudioPlayer.tsx` | 265 |
| 13 | `src/context/AudioContext.tsx` | 259 |
| 14 | `src/context/NarrationContext.tsx` | 251 |
| 15 | `src/components/ui/ZenMode.tsx` | 214 |

Total `src/`: **12.165 LOC** en 44 archivos `.ts/.tsx` (+ CSS). El 75 % del código son
datos (`quotesEn`, `quotes`, `voiceManifest`, batches, `philosophers` = ~9.000 LOC). El
mayor componente React es `QuoteCard.tsx` (369 LOC).

---

## Duplicación / DRY

- **Corpus:** 507 citas con IDs únicos; **8 textos repetidos** con ID distinto
  (evidencia `quotes.ts:766` ↔ `quotesBatch2.ts:422`; `quotes.ts:860` ↔
  `quotesBatch3.ts:79`; +6 por script). `quotesEn.ts` es una estructura paralela de
  507 registros (`QuoteEn: {id,text,source}` en `types.ts:83-90`). Hoy la paridad
  ES↔EN es 507/507, pero no hay test que la garantice (**F-25**).
- **Bloque `reduced motion`:** mismo patrón de 3 líneas en **14 archivos** (**F-08**).
- **`initials()`:** dos implementaciones divergentes (**F-09**).
- **Keyframes:** 11 `@keyframes` duplicados entre `index.css:267-375` y
  `tailwind.config.js:44-89` (**F-19**).
- **Componentes pequeños no compartidos** con rol similar: `ActionButton`
  (`QuoteCard.tsx:54`), `IconButton` (`AudioPlayer.tsx:55`), `Pill`/`FilterGroup`
  (`FilterPanel.tsx:23,49`). No es duplicación literal, pero convendría un
  `ui/Button` común.
- **Tipos:** 10 archivos importan de `@/types`; consistente, excepto `Tag`/`Era`
  sin usar (**F-02**) y `Track` definido localmente en `tracks.ts:1-7`.

---

## Anti-patrones y seguridad de tipos

| Patrón | Resultado | Evidencia |
|--------|-----------|-----------|
| `any` (tipo) | **0** | `grep -rnE ":\s*any\b\|<any>\|as any" src` → 0 |
| `@ts-ignore` / `@ts-expect-error` | **0** | `grep -rnE "@ts-(ignore\|expect-error)" src` → 0 |
| `unknown` / `as unknown` | **0** | `grep -rn "unknown" src` → 0 |
| Aserciones no-nulas `!` | **1** | `src/main.tsx:7` |
| Casts inseguros `as T` | **1** | `src/lib/storage.ts:15` (`as T`); además `as const` en `voiceManifest.ts:3` (seguro) |
| `console.*` en código | **1** | `src/main.tsx:20` `console.warn` (fallback de SW; intencional) |
| `useEffect` sin deps / deps dudosas | 1 excepción silenciada | `ZenMode.tsx:53-68` con `eslint-disable` (inerte, **F-28**) |
| `useState` en render | 0 | — |
| Handlers/objetos inline | 20 | **F-24** |
| `key={index}` | 4 | **F-23** |
| Error Boundary | ausente | **F-01** |
| `TODO/FIXME/HACK` reales | **0** | El grep inicial dio falsos positivos por la palabra española "todo" dentro de textos |

---

## Manejo de errores

- **`src/lib/storage.ts`:** `safeGet`/`safeSet`/`safeRemove` capturan en silencio
  (`storage.ts:16,29,39`). No hay distinción de causa ni `Error` tipado; `safeGet`
  además confía en el cast `as T` sin validar (**F-04, F-06, F-07**).
- **`AppContext.tsx`:** sin try/catch (no lo necesita), pero los setters de favoritos
  no validan `id`. `useApp` lanza `Error` si falta provider (`AppContext.tsx:179`).
- **`AudioContext.tsx`:** `play().catch(() => setIsPlaying(false))` traga el rechazo
  (`:84`); `onError` rota de pista en silencio (`:177-186`). El usuario nunca ve por
  qué no suena (**F-06**).
- **`NarrationContext.tsx`:** buen fallback MP3→TTS→stop, con `Ref`s para closures
  (`:143-194`). Los `catch` de autoplay (`:172`) también son silenciosos.
- **`QuoteDeepLink.tsx`:** correcto; valida `getQuoteById(id)` antes de `openZen` y
  limpia la URL (`:13-22`). No hay `try/catch` alrededor de `URLSearchParams`, sin
  riesgo real.
- **`AudioPlayer.tsx`:** sin manejo de error propio (delega en `AudioContext`).
- **Tipado de errores:** **ninguno** usa `unknown` ni `catch (e: any)` — todos son
  `catch {}` sin binding. No hay unión discriminada de errores en ningún módulo.

---

## Arquitectura / estructura

- **`Home.tsx` NO es un god component** (77 LOC): compone `Hero`, `QuoteOfDay` y 6
  `QuoteCard`. Correcto.
- **God-ish real:** `QuoteCard.tsx` (369 LOC) acumula tilt 3D, spotlight, share,
  narración y acciones (**F-11**). Los contextos (`AudioContext` 259,
  `NarrationContext` 251) son grandes pero cohesionados.
- **Acoplamiento:** sano. `AppProvider > AudioProvider > NarrationProvider` en
  `App.tsx:33-35`; `NarrationContext` consume `AppContext` y `AudioContext`
  (`NarrationContext.tsx:48-49`). Hay un ligero smell de import en medio de
  `quotes.ts:1669` (**F-21**).
- **Prop drilling vs Context:** no hay prop drilling profundo; el estado global va por
  Context y los datos por `@/data`. `Home` pasa `philosopher` opcional a `QuoteCard`
  (`Home.tsx:55`) — aceptable.
- **Naming:** inconsistente para el mismo concepto: `reduceMotion` vs
  `prefersReducedMotion` (**F-08**); shadowing de `t` (**F-22**). Los
  `interface`/`type` y rutas (`/explorar`, `/filosofos`, `/favoritos`) son coherentes y
  coinciden entre `App.tsx:42-46`, `Navbar.tsx:16-21` y `Footer.tsx:12-17`. Deep link
  `?cita=` consistente entre `utils.ts:93-99` y `QuoteDeepLink.tsx:15`.

**Seams de refactor recomendados**
1. `hooks/usePrefersReducedMotion.ts` + `hooks/useTilt3D.ts` (elimina F-08/F-27).
2. `lib/utils.ts::initials()` compartido (F-09).
3. `components/ui/ErrorBoundary.tsx` (F-01).
4. `components/quotes/QuoteActions.tsx` y `QuoteMeta.tsx` a partir de `QuoteCard` (F-11).
5. Tipar `Era`/`Tag` y añadir test de paridad ES/EN (F-02/F-25).
6. `ui/IconButton`/`ui/Pill` comunes.

---

## Limitaciones

- **MCP codebase-memory no disponible:** `list_projects` devolvió 0 proyectos
  ("No projects indexed"). No se indexó el repo para respetar la restricción de
  read-only (único archivo permitido: este documento). Por tanto **no** se pudieron
  usar `search_graph`/`trace_path`/`get_snippet`/`check_index_coverage`; el análisis
  se basa en `grep`, lectura directa de fuente y análisis con `node`/`wc`/`find`.
- Los conteos de "uso" de salidas CSS/Tailwind y de claves i18n son **heurísticos por
  grep/AST-ligero**: pueden existir usos construidos dinámicamente (p. ej. claves i18n
  vía variable). Se verificaron manualmente los casos relevantes (theme.* dinámico).
- No se ejecutaron `npm run build`, tests ni la app en runtime; no hay scripts de
  lint/test en `package.json`. La evaluación de errores en runtime (localStorage
  corrupto, autoplay, SW) es **estática**, no reproducida en navegador.
- El análisis de duplicación del corpus normaliza por línea de `text:` literal; no
  detecta parafraseos ni diferencias solo de puntuación/acentos.
- `exactOptionalPropertyTypes` se evaluó de forma aislada sobre la config actual; el
  número de errores puede variar si se combinan arreglos previos.
- Versión de dependencias fijada por `package-lock.json`; no se auditaron
  vulnerabilidades de terceros (fuera del alcance de este informe).
