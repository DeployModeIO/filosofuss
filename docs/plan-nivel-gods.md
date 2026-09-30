# Filosofuss — Nivel-Dios OLA 2: "Sabiduría eterna" — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Elevar Filosofuss a nivel-dios corrigiendo todos los hallazgos Críticos/Altos de las cuatro auditorías y añadiendo un sistema de diseño, una capa de efectos y una PWA/Capacitor pulidos, sin romper la identidad mármol/oro/dorado-atardecer.

**Architecture:** Tokens y tipografía centralizados en `src/index.css` + `tailwind.config.js`; efectos encapsulados en `src/lib/motion.ts` y en componentes `src/components/effects/*`; datos del corpus sacados del camino crítico por import dinámico; service worker sin precache de audio y compatible con `base:'./'` y Capacitor.

**Tech Stack:** React 18.3 + TypeScript 5.5 (tsc 5.9.3 instalado) + Vite 5.4.21 + Tailwind 3.4 + Framer Motion 11 + Capacitor 8. Sin frameworks nuevos. Toda dependencia nueva queda marcada **"requiere aprobación"**.

**Spec:** `docs/audit/security.md`, `docs/audit/code.md`, `docs/audit/performance.md`, `docs/audit/ux-a11y-seo.md` (este plan argumenta desde esas auditorías; el ejecutor lee ambas).

## Global Constraints

- **Rama de trabajo:** `nivel-dios` @ `c3fd246`. **No** push a `main`. **No** commitear salvo que el usuario lo pida explícitamente.
- **No tocar:** `node_modules/`, `android/` (salvo lo indicado en OLA D como propuesta), `dist/`.
- **No instalar** dependencias nuevas sin aprobación explícita. Marcar cada una como **"requiere aprobación"**.
- **Base Vite:** `base: './'` (`vite.config.ts:7`). Toda ruta de recurso runtime debe derivar de `import.meta.env.BASE_URL`; no usar rutas absolutas nuevas.
- **Dark-first:** los tokens base se definen en `:root` (tema oscuro) y light/paper redefinen las mismas variables (`src/index.css:10-65`). No introducir un cuarto tema.
- **i18n:** toda cadena visible debe pasar por `t()`; no añadir literales en español en componentes.
- **Paridad ES/EN:** 507 citas ES ↔ 507 EN (verificado). Cualquier cambio de corpus debe mantener paridad y pasar el test de paridad.
- **Presupuestos globales (propuesta):** JS inicial ≤120 KB gzip; LCP `/` <1.2 s y `/explorar` <1.5 s en Chromium local; Lighthouse ≥90 en las 4 categorías; `npm run typecheck` con 0 errores y flags estrictos objetivo activos; transfer inicial ≤200 KB sin fuentes (fuentes self-host objetivo ≤70 KB).
- **Reduced motion:** todo efecto respeta `prefers-reduced-motion` de forma **reactiva** (hook, no constante de módulo).
- **Números marcados "(propuesta)"** son decisiones de diseño de este plan, no valores medidos.

## Global Baseline (verificado en esta sesión, rama `nivel-dios` @ `c3fd246`)

| Métrica | Valor | Fuente |
|---|---|---|
| `dist/` total | 71 MiB (`du -sh`) ≈ 68,1 MiB exactos | performance.md + medición propia |
| `node_modules/` | 146 MiB | medición propia |
| JS inicial | 558,3 KB raw / **168,0 KB gzip** (164 KiB) | performance.md §Bundle |
| Transfer inicial medido | **370.211 B** (190.548 B fuentes = 51,5 %) | performance.md §waterfall |
| `public/audio` | 70,5 MB (música 36,5 MB · voz 34,0 MB · 1.019 archivos) | performance.md §Bundle |
| Corpus | 507 citas ES + 507 EN + 37 filósofos | medición propia (grep de ids únicos) |
| `npm run typecheck` | 0 errores | code.md |
| `npm audit` | 11 vulns (7 high, 4 moderate) | security.md |
| Toolchain | node v22.20.0 · npm 10.9.3 · tsc 5.9.3 · vite 5.4.21 | medición propia |
| Paquetes | 232 (`npm ls --all`, excl. raíz); 280 entradas en `package-lock.json` | medición propia |
| SW precache | 5 MP3 ≈ 34,8 MiB en `install` | performance.md P-01 |

---

# 1. Objetivo y principios

## 1.1 Objetivo

1. **Corregir** todos los hallazgos **Críticos y Altos** de las cuatro auditorías (2 críticos + 9 altos UX, 7 altos seguridad, 2 altos TypeScript, 4 altos rendimiento).
2. **Elevar** la experiencia visual y sonora con una identidad intencional (no plantilla) y una capa de efectos orquestada.
3. **Endurecer** distribución: PWA completa, Capacitor pulido, release hardening.

## 1.2 Principios de diseño (frontend-design)

- **Dirección estética intencional, no defaults templados.** El sujeto es "sabiduría eterna": mármol (calcita cálida) sobre obsidiana, con oro pulido y un único atardecer. El material manda: superficies como losas, tipografía como inscripción, un solo gesto cinematográfico.
- **No gastar la libertad en los tells por defecto:** evitar el eyebrow en mayúsculas sobre cada título (hoy presente en `Home.tsx:41`, `BrowseQuotes.tsx:89`, `PhilosopherWall.tsx:69`, `Favorites.tsx`), evitar `01/02/03` (el contenido no es una secuencia), evitar el degradado de texto animado como decoración.
- **Gastar la audacia en un solo lugar.** El elemento memorable es **la cita monumental del Hero revelada por máscara, con una única línea dorada-atardecer**. Todo lo demás (títulos, chips, botones) queda quieto, sólido y disciplinado.
- **El movimiento responde a la persona, no la decora.** Una sola secuencia orquestada por vista; el resto de animaciones son respuesta a acción (abrir, confirmar, compartir).
- **Suelo de calidad sin anunciarlo:** responsive, foco visible, reduced-motion reactivo, contraste AA, tap targets ≥44 px.
- **Retirar un accesorio antes de salir:** quitar Cinzel/Playfair y los `@keyframes` duplicados; que quede una tipografía serif con carácter y una sans de apoyo.

## 1.3 Qué NO cambia

Rutas (`/`, `/explorar`, `/filosofos`, `/favoritos`, `?cita=`), nombres de tokens existentes (se les añade alias), API pública de contextos, corpus y estructura de datos, y la lógica de negocio (favoritos, narración, deep links).

---

# 2. Sistema de diseño refinado "Sabiduría eterna"

## 2.1 Paleta y tokens (propuesta)

**Base de 6 hex (tema oscuro, `:root`):**

| Token | Hex | Rol | Contraste sobre `--bg #0A0A0F` |
|---|---|---|---|
| `--obsidian` / `--bg` | **#0A0A0F** | Fondo base (noche). Único negro del sistema. | — |
| `--slab` / `--bg-2` | **#14121A** | Superficie elevada (losas, tarjetas glass sobre fondo). | — |
| `--marble` / `--text` | **#ECE8E1** | Texto principal (calcita). | **16.17:1** ✅ |
| `--gold` / `--accent` | **#C9A96A** | Acento primario: títulos, logo, foco. | **8.81:1** ✅ |
| `--copper` / `--accent-2` | **#B0713F** | Acento secundario / mitad del atardecer. | **4.97:1** ✅ |
| `--ember` / `--accent-3` (redefinido) | **#C97A4A** | Tercer stop del "dorado-atardecer". **Sustituye al vino #7A2E4D.** | **5.99:1** ✅ |

**Tokens derivados (roles semánticos):**

| Token | Oscuro | Rol |
|---|---|---|
| `--muted` | #9A96AA | Texto secundario (6.88:1 sobre bg, 6.49:1 sobre bg-2) ✅ |
| `--ink` / `--on-accent` | #0A0A0F | Tinta sobre superficies doradas (botón oscuro) |
| `--rose` | #C98A6E | Acento gráfico (corazón de favoritos, discos de avatar): 6.91:1 ✅. **No usar en texto.** |
| `--border` | rgba(201,169,106,.16) | Filete de marca |
| `--glass` / `--glass-strong` | rgba(255,255,255,.045 / .08) | Superficies translúcidas (sin cambio) |
| `--glow` | rgba(176,113,63,.45) | Halo (sin cambio) |

**Decisión de identidad:** el degradado **deja de aplicarse al texto animado**. Se conserva "mármol/oro/dorado-atardecer" en: (a) una **línea hairline** `--gold → --copper → --ember` bajo la cita del Hero y en `link-underline`; (b) **superficies** (discos de avatar, barra de progreso del audio, botón de reproducción). Los títulos usan `--marble` sólido con un filete dorado. Esto corrige C1 de raíz (el vino #7A2E4D queda fuera de cualquier texto) y elimina un tell de diseño generado.

**Alias de migración:** se mantienen `--accent`, `--accent-2`, `--accent-3` (redefinidos) para no romper `tailwind.config.js` ni clases existentes; se añaden `--gold/--copper/--ember` como nombres nuevos. Migración incremental por componente.

## 2.2 Mensajes de accesibilidad AA (corrección de contraste)

Umbrales objetivo: **≥4.5:1 texto normal**, **≥3:1 texto grande (≥18.66 px bold / ≥24 px) y componentes de UI**. Todos los ratios siguientes fueron **calculados** con la fórmula de luminancia relativa sRGB.

| Hallazgo | Par afectado | Actual | Propuesta | Nuevo ratio |
|---|---|---|---|---|
| **C1** | Degradado de texto con `--accent-3` #7A2E4D sobre `--bg` | **2.19:1** ❌ | Eliminar vino del texto; degradado pasa a `gold→copper→ember` (#C9A96A/#B0713F/#C97A4A) usado en **hairlines**, no en texto; títulos sólidos | peor stop **4.97:1** ✅ |
| **A3** | `--accent` claro #9C7633 sobre `--bg` claro | **3.88:1** ❌ | `--gold` claro → **#7D5A1C** | **5.86:1** ✅ |
| **A4** | `btn-primary`: tinta #0A0A12 sobre degradado `accent→accent-2` (claro) | **3.37:1** ❌ | Botón con tinta **mármol #F4F1EA** sobre `--gold #7D5A1C → --copper #8A5A2F`; peor stop | **5.19:1** ✅ |
| **A4** | `btn-primary` papel: tinta sobre `accent→accent-2` | **2.48:1** ❌ | Tinta mármol #F4F1EA sobre `--gold paper #7A561C → --copper #6B4A2A` | peor **5.86:1** ✅ |
| **M10** | `--muted` papel sobre `--bg-2` papel | **4.36:1** ❌ | `--muted` papel → **#5B5343** | **5.59:1** ✅ |
| (nuevo) | `--accent` papel sobre `--bg` papel (borde) | 4.47:1 ⚠ | `--gold` papel → **#7A561C** | **5.53:1** ✅ |
| (nuevo) | #7A2E4D como gráfico (corazón) | 2.19:1 ❌ | `--rose` #C98A6E | **6.91:1** ✅ |

**Regla de tokens por tema (propuesta):**

| Token | Oscuro | Claro | Papel | Ratio mínimo garantizado |
|---|---|---|---|---|
| `--gold` | #C9A96A | **#7D5A1C** | **#7A561C** | ≥5.5:1 sobre bg |
| `--copper` | #B0713F | #8A5A2F | #6B4A2A | ≥5.4:1 sobre bg |
| `--ember` | #C97A4A | **#9A4A2A** | **#8A3A2A** | ≥5.3:1 sobre bg |
| `--on-accent` | #0A0A0F | **#F4F1EA** | **#F4F1EA** | ≥4.9:1 sobre gold/copper |
| `--muted` | #9A96AA | #6A6575 (se mantiene, 4.82:1 en bg-2 ✅) | **#5B5343** | ≥4.5:1 |
| `--bg` | #0A0A0F | #F9F7F3 | #F2EAD9 | — |

**Criterios de aceptación (medibles):**
- Existe un test `scripts/check-contrast.mjs` (o `vitest`) que calcula los pares usados y **falla** si algún par de texto <4.5:1 o de UI/grande <3:1.
- Cero apariciones de `#7A2E4D` en `text-gradient*` o clases `text-*`.
- Los "tres negros" (`#07070f`, `#0a0a0f`, `#0a0a12`) se unifican en `--bg #0A0A0F` + `--ink` (corrige M13). `--ink` = `#0A0A0F` en los tres temas.

### Temas light y paper — cómo quedan

- **Light:** mármol claro (`#F9F7F3`) con oro **más oscuro y más saturado** (#7D5A1C) para conservar 4.5:1; el atardecer se mantiene como filetes y superficies; botones con tinta mármol. Se siente como una galería de día.
- **Papel:** pergamino cálido (`#F2EAD9/#E8DCC3`) con oro terroso (#7A561C) y `muted` más oscuro (#5B5343). Botones con tinta mármol para el contraste del CTA. El "atardecer" (copper→ember) funciona como sello de la marca.
- Los tres temas comparten la misma escala tipográfica y las mismas reglas de efectos; solo cambian los tokens de color (y `--noise` opacidad, ya existente).

## 2.3 Tipografía y escala (propuesta)

**Decisión:** pasar de **4 familias / 20 estilos** (`index.html:49`, medidos 190,5 KB = 51,5 % del transfer) a **2 familias + 1 subset de logo**, self-host con subsetting `latin` y `font-display: swap`.

- `--font-display`: **Cormorant Garamond** — serif display. Es la cara con más carácter "inscripción/mármol" y la menos "default" que Playfair. Se usa en la cita monumental (peso 300/400/500 + itálicas) y en títulos de sección (600).
- `--font-sans`: **Inter** — UI y metadatos (400/500/600). Sin cambios de rol, se podan pesos.
- `--font-logo`: **Cinzel** — **solo** para el wordmark "Filosofuss", subset a los glifos necesarios (peso 600). Coste ~15–26 KB; preserva la marca. Si el usuario prefiere 2 familias estrictas, el logo pasa a Cormorant 600 con tracking y se elimina Cinzel.
- **Se elimina Playfair Display** (38,5 KB medidos) y se podan pesos de Cormorant/Inter.

**Escala modular (base 16 px, ratio 1.25 en UI y 1.333 en display):**

| Token | Tamaño | Uso |
|---|---|---|
| `--text-2xs` | 0.6875rem (11px) | Numeración de pista, metadatos densos (sustituye `[10px]/[11px]`) |
| `--text-xs` | 0.75rem (12px) | Chips, footer |
| `--text-sm` | 0.875rem (14px) | Metadatos, nav |
| `--text-base` | 1rem (16px) | UI, cuerpo de tarjeta compacta |
| `--text-lg` | 1.125rem (18px) | Entradillas |
| `--text-xl` | 1.25rem (20px) | Título de tarjeta |
| `--text-2xl` | 1.5rem (24px) | Subtítulos |
| `--text-3xl` | 1.875rem (30px) | Título de sección (móvil) |
| `--text-4xl` | 2.25rem (36px) | Título de sección (desktop) |
| `--text-5xl` | 3rem (48px) | Cita destacada |
| `--text-display` | clamp(2.5rem, 6vw, 4.5rem) | Cita monumental del Hero |

**Interlínea y medida:** `--leading-ui` 1.2 · `--leading-body` 1.6 · `--leading-quote` 1.35. Medida de cita `--measure-quote: 34ch` (corrige B4: hoy `max-w-3xl` con `text-5xl` supera la medida legible). **Tracking:** `--tracking-logo` 0.18em, `--tracking-eyebrow` 0.14em (se reduce desde `[0.2em]/[0.3em]`), y **los eyebrows se eliminan o pasan a `<p>` normal con filete** (no mayúsculas decorativas).

## 2.4 Layout y wireframes

**Concepto:** retícula editorial de una sola columna que respira, con el contenido anclado a un eje central; las losas (cards) se alinean al eje, no se centran todas. Alineación: **texto de cita centrado en Hero/Zen** (es un monumento) y **todo lo demás alineado a la izquierda** para las vistas de lista (hoy todo está centrado, lo que aplana la jerarquía).

### Home (`/`) — Hero cinematográfico + cita del día + 6 destacadas

```
┌───────────────────────────────────────────────┐
│ NAVBAR (sticky, glass)                        │
├───────────────────────────────────────────────┤
│                                               │
│            ┌───────── hairline ─────────┐     │
│   H1 (sr-only)  «La cita monumental»         │
│        (reveal por máscara, 1 secuencia)      │
│                   — Autor                     │
│                era · escuela                  │
│                                               │
│          [ Explorar citas ]  [ Filósofos ]    │
│                                               │
│                   ↓ (scroll cue)              │
├───────────────────────────────────────────────┤
│ CITA DEL DÍA          |  § (sin eyebrow)      │
│   blockquote          |  cita                │
│   autor/source        |  ←/→ (una acción)    │
├───────────────────────────────────────────────┤
│ CITAS DESTACADAS                              │
│  § Título de sección + filete dorado          │
│  ┌────────┐ ┌────────┐ ┌────────┐            │
│  │ card   │ │ card   │ │ card   │            │
│  └────────┘ └────────┘ └────────┘            │
│  ┌────────┐ ┌────────┐ ┌────────┐            │
├───────────────────────────────────────────────┤
│  CTA FINAL (una sola acción primaria)         │
├───────────────────────────────────────────────┤
│ FOOTER                                        │
└───────────────────────────────────────────────┘
```

### Explorar (`/explorar`) — lista virtualizada

```
┌───────────────────────────────────────────────┐
│ H1  Explorar   (izquierda, no centrado)       │
│ [ 🔍 Buscar………………………………… ]  [Filtros ▾]     │
├───────────────────────────────────────────────┤
│ Mostrando 507 citas        chips activos ✕    │
├───────────────────────────────────────────────┤
│ ┌───────────────────────────────────────────┐ │
│ │ QuoteCard (virtual: solo ~12 en viewport) │ │
│ └───────────────────────────────────────────┘ │
│ ┌───────────────────────────────────────────┐ │
│ │ QuoteCard                                 │ │
│ └───────────────────────────────────────────┘ │
│              ⋮ (scroll virtual)               │
└───────────────────────────────────────────────┘
```

### Filósofos (`/filosofos`) — muro + ficha

```
┌───────────────────────────────────────────────┐
│ H1  Filósofos                                 │
│ ┌────┐ ┌────┐ ┌────┐ ┌────┐   (grid 2/3/4)   │
│ │ ◯  │ │ ◯  │ │ ◯  │ │ ◯  │   avatar+nombre  │
│ └────┘ └────┘ └────┘ └────┘                   │
│              ⋮ (37)                           │
│        ▓ ficha (Dialog con focus trap) ▓      │
├───────────────────────────────────────────────┤
│ Favoritos (`/favoritos`) — H1 + estado vacío  │
│   (una acción: Explorar citas)                │
└───────────────────────────────────────────────┘
```

### Observabilidad / árbol de componentes (qué se toca)

```
App
├─ ErrorBoundary (NUEVO)
├─ AppProvider
│  └─ AudioProvider
│     └─ NarrationProvider
│        ├─ ScrollToTop          (reduced-motion reactivo)
│        ├─ SceneBackground      (grain estático; blobs sin blur animado)
│        ├─ Navbar               (safe-area; menú = Dialog móvil)
│        ├─ main > Suspense > Routes
│        │   ├─ Home             (Hero + QuoteOfDay + QuoteCard)
│        │   ├─ BrowseQuotes     (virtualizada; memo; deferred)
│        │   ├─ PhilosopherWall  (Dialog; mapa precomputado)
│        │   └─ Favorites        (H1 + estado vacío)
│        ├─ Footer
│        ├─ AudioPlayer          (+ Visualizer audio-reactivo)
│        ├─ ZenMode              (Dialog con focus trap; safe-area)
│        └─ QuoteDeepLink
```

## 2.5 Interfaz de tokens (contrato para el ejecutor)

```ts
// tailwind.config.js (extend) — nombres nuevos
colors: {
  gold: 'var(--gold)', copper: 'var(--copper)', ember: 'var(--ember)',
  rose: 'var(--rose)', ink: 'var(--ink)', obsidian: 'var(--obsidian)', slab: 'var(--slab)',
  // alias existentes se conservan
},
fontFamily: { display: ['var(--font-display)'], sans: ['var(--font-sans)'], logo: ['var(--font-logo)'] },
// escala tipográfica nueva como text-2xs y lineHeight/measure
```

---

# 3. Arquitectura de efectos especiales

Todo con **Framer Motion 11** (ya instalado) + APIs web nativas. **Sin dependencias nuevas.** Cada efecto declara: dónde, API, presupuesto y fallback reduced-motion.

## 3.1 Transiciones de página

- **Dónde:** `src/App.tsx` envolviendo `<Routes>` con `AnimatePresence mode="wait"` y `motion.div` por ruta (o `useLocation().key`).
- **API:** `AnimatePresence` + variantes tween `opacity` + `y: 8`.
- **Presupuesto:** ≤220 ms; solo `opacity/transform` (compositor); 0 layout; no animar durante `Suspense` (el fallback entra sin transición).
- **Reduced motion:** `initial={false}`, `animate` solo `opacity` en 1 frame (sin desplazamiento).
- **Definido en:** `src/lib/motion.ts` → `pageVariants`.

## 3.2 Reveal-on-scroll orquestado (uno por vista)

- **Dónde:** contenedor de sección de cada vista (`Home`, `BrowseQuotes`, `PhilosopherWall`, `Favorites`).
- **API:** `motion.div` con `variants={container}` + `whileInView` (`viewport={{ once: true, amount: 0.25 }}`); hijos con `variants={item}` y `staggerChildren`. **No** un `whileInView` por cada sección ni por cada tarjeta en listas largas.
- **Presupuesto:** **una sola secuencia por vista**; máx. 6 hijos escalonados; `duration ≤0.5 s`, `stagger ≤0.06 s`; el resto de contenido entra sin animación. En `/explorar` las tarjetas de la lista **no** animan entrada (solo el header).
- **Reduced motion:** `initial={false}`; contenedor sin stagger.
- **Definido en:** `src/lib/motion.ts` → `revealContainer`, `revealItem`.

## 3.3 Parallax sutil en citas

- **Dónde:** Solo Hero (`Hero.tsx`) y Zen (`ZenMode.tsx`): la cita se desplaza ±12 px respecto al scroll.
- **API:** `useScroll({ target, offset: ['start end','end start'] })` + `useTransform(scrollYProgress, [0,1], [6,-6])` aplicado a `y` de un wrapper.
- **Presupuesto:** 1 valor de scroll por vista; `will-change: transform`; **no** aplicar a fondos con blur.
- **Reduced motion:** `y` fijo 0 (transform omitido).
- **Nota:** desactivar en `(hover: none)` no es necesario (no hay hover), pero sí en reduced-motion.

## 3.4 Física de spring en tarjetas y controles (valores propuesta)

| Variante | Uso | `stiffness` | `damping` | `mass` | Sensación |
|---|---|---|---|---|---|
| `spring.tilt` | Tilt 3D de `QuoteCard` (sustituye 200/20) | 150 | 18 | 0.8 | asentado, sin rebote |
| `spring.hover` | Elevación/sombra al hover de card destacada | 260 | 26 | 0.9 | respuesta viva |
| `spring.press` | `whileTap` de iconos (sustituye 0.9 scale) | 400 | 30 | 0.6 | click seco |
| `spring.badge` | Badge de favoritos / contador | 300 | 22 | 0.8 | pop contenido |
| `tween.page` | Transición de ruta | — | — | — | `[0.22,1,0.36,1]`, 0.22 s |

- **Dónde:** `QuoteCard` (tilt, actions), `QuoteActions` (nuevo), badges.
- **Presupuesto:** máx. **2 springs por tarjeta rica**; las tarjetas de lista (`/explorar`) **no** instancian tilt/spotlight (elimina P-07). Solo la tarjeta en `variant="featured"` y las de Home lo usan.
- **Definido en:** `src/lib/motion.ts` → `spring`.

## 3.5 Visualizer audio-reactivo para `AudioPlayer`

- **Dónde:** equalizer colapsado (4 barras) y panel expandido (≤48 barras), alimentado por el `<audio>` existente de `AudioContext`.
- **API:** Web Audio nativa: singleton `AudioContext` → `createMediaElementSource(audioEl)` (una sola vez por elemento) → `AnalyserNode` (`fftSize: 128`, `smoothingTimeConstant: 0.8`) → `getByteFrequencyData()` en rAF → CSS custom props `--l0..--l3` (barras) o `fillRect` en `<canvas>` 2D para el panel.
- **Restricciones:** `createMediaElementSource` solo puede llamarse **una vez** por elemento → guardar nodos en `src/audio/analyser.ts`. Reconectar también el grafo a `destination` (si no, se pierde el sonido). Reanudar `AudioContext` en el primer gesto de usuario (política de autoplay) dentro del `onPlay` existente.
- **Presupuesto:** rAF **solo mientras `isPlaying`**; ≤1 ms/frame; 4 u 48 barras; pausa con `visibilitychange`; canvas a `devicePixelRatio` (cap 2). Sin deps.
- **Fallback:** el `Equalizer` CSS actual (basado en tiempo, `AudioPlayer.tsx:31-53`) cuando `AnalyserNode` no exista, `AudioContext` sea `suspended`, o reduced-motion.
- **Definido en:** `src/audio/analyser.ts` + `src/hooks/useAudioAnalyser.ts` + `src/components/ui/Visualizer.tsx`.
- **Riesgo:** audio de terceros cross-origin no analizable; aquí el audio es **same-origin** (`public/audio`), así que no requiere CORS.

## 3.6 Skeleton loaders y micro-interacciones

- **Skeletons:** `RouteFallback` (hoy un spinner, `App.tsx:20-29`) pasa a skeleton de la vista; skeleton de tarjeta y de muro de filósofos. Usar el `animate-shimmer` **ya definido pero sin uso** (`tailwind.config.js:95`, corrige F-20).
- **Micro-interacciones:** copiar/compartir/favorito/audio con `spring.press` + `AnimatePresence` de icono (ya existe) + **anuncio `aria-live="polite"`** ("Copiado", "Reproduciendo…") (corrige A10).
- **Presupuesto:** shimmer solo en contenedores fuera de viewport (`content-visibility:auto`); no animar más de 3 skeletons a la vez.
- **Reduced motion:** shimmer estático (gris medio).

## 3.7 Hero cinematográfico y grain/gradientes sutiles

- **Hero:** una sola secuencia al cargar: máscara que revela la cita en **2 líneas** (no por palabra, corrige P-09), la línea hairline `gold→copper→ember` se dibuja con `scaleX`, y la atribución aparece al final. Sin `motion.span` por palabra.
- **Grain:** `NoiseOverlay` existente, estático (sin rAF); opacidad por tema ya definida (`index.css:206-216`).
- **Fondos:** `AuroraBackground` reduce blobs de 4 a 2 y sustituye `filter: blur(50px)` animado por gradientes pre-renderizados + `will-change: transform` y `contain: paint`; `ParticleField` baja a ≤40 partículas y pausa en `visibilitychange` (ya lo hace) (mitiga P-14).
- **Presupuesto:** 0 blur animado sobre superficies grandes; animación de fondo limitada a `transform/opacity`; parar todo si reduced-motion.
- **Definido en:** `src/components/effects/AuroraBackground.tsx`, `ParticleField.tsx`, `NoiseOverlay.tsx`, `src/components/sections/Hero.tsx`.

## 3.8 Contratos y presupuesto resumido

```ts
// src/lib/motion.ts (NUEVO)
export const spring: {
  tilt: { stiffness: 150, damping: 18, mass: 0.8 },
  hover: { stiffness: 260, damping: 26, mass: 0.9 },
  press: { stiffness: 400, damping: 30, mass: 0.6 },
  badge: { stiffness: 300, damping: 22, mass: 0.8 },
}
export const pageVariants: Variants
export const revealContainer: Variants
export const revealItem: Variants
export const heroReveal: Variants

// src/hooks/usePrefersReducedMotion.ts (NUEVO)
export function usePrefersReducedMotion(): boolean   // reactivo vía matchMedia + 'change'

// src/audio/analyser.ts (NUEVO)
export function getAnalyser(audio: HTMLAudioElement): AnalyserNode | null
export function levels(analyser: AnalyserNode, bars: number): Uint8Array
```

| Efecto | FPS objetivo | CPU/GPU | Reduced-motion |
|---|---|---|---|
| Page transition | 60 | solo compositor | fade 1 frame |
| Reveal orquestado | 60 | 1 secuencia/vista | sin desplazamiento |
| Parallax cita | 60 | 1 transform/vista | y=0 |
| Spring cards | 60 | ≤2 springs/tarjeta rica | sin spring |
| Visualizer | 60 | rAF solo tocando | equalizer CSS estático |

---

# 4. PWA completa

## 4.1 Offline: estrategia de caché por tipo

| Tipo | Estrategia | Precache | Evidencia objetivo |
|---|---|---|---|
| App shell (HTML) | Network-first + fallback al shell versionado; **validar `fresh.ok` antes de cachear** | Sí (pequeño) | corrige **W-01** y **M15** |
| Assets JS/CSS/iconos (hashed) | Stale-while-revalidate | Solo manifest/iconos base; el resto on-demand | P-01 |
| **Audio (MP3)** | **On-demand**: network-first con caché de respaldo; **fuera del precache** | **No** | corrige **P-01/A6**: install pasa de ~34,8 MiB a ≤1 MiB |
| Fuentes | Self-host → SWR same-origin | Sí (subset) | corrige **P-11/W-03/A7** |
| Offline fallback | Página `public/offline.html` cacheada | Sí | corrige M15 |

- **Nombre de caché versionado por build:** `filosofuss-<hash>` generado en build (Vite `define` o plugin inline sin dependencia). Limpieza de cachés antiguas ya existe (`sw.js:44-48`).
- **Bug a corregir (W-01):** en `sw.js:69-72` cachear solo si `fresh.ok` y `content-type` HTML (hoy cachea redirecciones/errores como `/index.html`).
- **Presupuesto de instalación:** precache objetivo **≤1 MiB** (shell + manifest + iconos + offline.html), frente a los ~34,8 MiB actuales.
- **Range requests:** la Cache API no soporta `Range`; no se cachean respuestas parciales de audio — se cachea la respuesta completa **solo** cuando el usuario reproduce la pista por primera vez.

## 4.2 Instalable, iconos, screenshots

- **Manifest (`public/manifest.webmanifest`):** añadir `id: "/"`, `display_override: ["standalone","minimal-ui"]`, `screenshots` (móvil + escritorio), `shortcuts` ("Cita del día", "Explorar", "Favoritos"), maskable **192** además del 512. Unificar `theme_color`/`background_color` a **#0A0A0F** (corrige M1/M14).
- **Iconos:** reutilizar `public/icons/*`; generar `icon-192-maskable.png` (asset, no código). `apple-touch-icon` ya existe.
- **Screenshot assets:** crear 2 PNG (1080×1920 y 1920×1080) — **cambio de contenido/assets; requiere aprobación**.

## 4.3 Notificaciones: ¿sí o no?

**Web: NO.** Justificación: la app no tiene backend ni eventos asíncronos que notificar; pedir permiso sin valor inmediato daña la confianza y puede penalizar la instalación. Alternativa no intrusiva: **"Cita del día" en la app** (ya existe `QuoteOfDay`).

**Capacitor: opcional, solo si el usuario quiere recordatorio diario.** Requeriría `@capacitor/local-notifications` (**requiere aprobación**), permiso `POST_NOTIFICATIONS` en Android 13+, y un scheduling local. Se **propone diferir** hasta que exista la feature "recordatorio diario".

## 4.4 `base:'./'` y Capacitor

- `manifest.webmanifest` y `sw.js` deben registrarse con ruta **relativa** derivada de `import.meta.env.BASE_URL` (corrige A7). En `index.html`, el `href` del manifest pasa a relativo.
- Guardar el registro del SW: solo si `location.protocol` es `http(s)` **y** no estamos en nativo (`Capacitor.isNativePlatform() === false`). En Capacitor el shell es local y el SW es código muerto.
- `start_url` y `scope` relativos (`.`) para subruta; en Capacitor se ignora.
- **Sin dependencia nueva:** `@capacitor/core` ya está instalado.

---

# 5. Mobile-first Capacitor pulido

| Área | Acción | Evidencia | Dep |
|---|---|---|---|
| Safe-area | `viewport-fit=cover` en `index.html:5`; padding `env(safe-area-inset-*)` en Navbar (top), AudioPlayer (bottom/right), ZenMode (top/bottom) | M4 | ninguna |
| Status bar | CSS `theme-color` sincronizado (ya en `AppContext`); opcional plugin `@capacitor/status-bar` para color nativo | M1 | **requiere aprobación** |
| Splash | `@capacitor/splash-screen` con `#0A0A0F`; hoy no hay splash nativo | — | **requiere aprobación** |
| Permisos | Mantener solo `INTERNET` (`AndroidManifest.xml:40`); no añadir ninguno | security §Capacitor | ninguna |
| Back button/gestos | Handler `App.addListener('backButton')` que cierra Zen/ficha/menú antes de salir | — | **requiere aprobación** (`@capacitor/app`) |
| Audio en background | Limitación conocida: el audio web se pausa en background; solución nativa requiere plugin | P-12 | **requiere aprobación** |
| `vh` móvil | Hero `min-h-[92vh]` → `92svh` (corrige M12) | M12 | ninguna |
| Release hardening | `minifyEnabled true` + `shrinkResources true`, `signingConfigs.release`, `allowBackup=false`, restringir `file_paths.xml`, `network_security_config.xml`, `server.androidScheme:'https'`, Gradle `distributionSha256Sum` | A-01/A-02/A-03/A-04/A-05/A-06/A-07 | ninguna (config) |
| Minify/signing | Enlaza con seguridad: R8 reduce ingeniería inversa; signing controla la distribución | A-01/A-04 | keystore del usuario |

---

# 6. Corrección de hallazgos (mapeo Crítico/Alto → ola)

## Seguridad (high)

| ID | Hallazgo | Ola/Tarea |
|---|---|---|
| D-01 | postcss path traversal | OLA A / A4 |
| D-02 | Vite path traversal/NTLMv2 | OLA A / A4 (bump `postcss`; Vite mayor → riego/aprobación) |
| D-03 | @xmldom/xmldom (vía `@capacitor/cli`) | OLA A / A4 |
| D-04 | tar (vía `@capacitor/cli`) | OLA A / A4 |
| D-05 | brace-expansion | OLA A / A4 |
| D-06 | browserslist | OLA A / A4 |
| D-07 | nanoid | OLA A / A4 |
| D-10 | react-router-dom open redirect | OLA A / A4 (→ ^6.30.6) |
| H-01/H-02 | CSP + cabeceras | OLA E / E4 |
| A-01/A-04 | Android release (minify/signing) | OLA D / D6 |

## Código (Alta)

| ID | Hallazgo | Ola/Tarea |
|---|---|---|
| F-01 | Error Boundary ausente | OLA A / A8 |
| F-02 | `Tag`/`Era` no aplicados | OLA A / A9 |

## Rendimiento (Alta)

| ID | Hallazgo | Ola/Tarea |
|---|---|---|
| P-01 | SW precachea 34,8 MiB | OLA A / A1 (corrige también A6) |
| P-03 | corpus en chunk inicial | OLA B / B3 |
| P-05 | 507 tarjetas sin virtualizar | OLA B / B1 |
| P-06 | búsqueda re-renderiza todo | OLA B / B2 |
| P-07 | 4 motion values/tarjeta ×507 | OLA B / B1 + C3 |
| P-08 | `layout` por tarjeta | OLA B / B1 |
| P-02 | metadata del mp3 al arranque | OLA A / A2 |

## UX/a11y/SEO (Crítico/Alto)

| ID | Hallazgo | Ola/Tarea |
|---|---|---|
| C1 | `--accent-3` 2.19:1 | OLA A / A5 |
| C2 | sin `<h1>` | OLA A / A6 |
| A3 | `--accent` claro 3.88:1 | OLA A / A5 |
| A4 | `btn-primary` 2.48–3.37:1 | OLA A / A5 |
| A5 | tap targets <44 px | OLA A / A7 |
| A6 | SW precache 36 MB | OLA A / A1 |
| A7 | rutas absolutas vs `base:'./'`/Capacitor | OLA D / D1 |
| A8 | i18n incompleta | OLA E / E2 |
| A9 | reduced-motion parcial | OLA B / B4 + C |
| A10 | sin `aria-live` | OLA C / C6 |
| A1/A2/M8/M9 | focus en diálogos | OLA C / C7 |

---

# 7. Plan por olas (formato writing-plans)

> Todas las olas empiezan con el baseline medido y terminan con criterio de aceptación medible. Tamaños: **S** ≤0,5 j, **M** ≤1,5 j, **L** >1,5 j (estimación).

## OLA A — Quick wins P0 (impacto alto / esfuerzo bajo) — 9 tareas

### Task A1: Sacar el audio del precache del SW

**Files:**
- Modify: `public/sw.js:14-23` (quitar los 5 MP3 de `PRECACHE_URLS`), `public/sw.js:11` (nombre de caché versionado)
- Modify: `src/main.tsx:16-22` (registro relativo + guarda nativo)
- Test: `scripts/check-sw.mjs` (NUEVO)

**Interfaces:**
- Consumes: `import.meta.env.BASE_URL` (Vite)
- Produces: `PRECACHE_URLS` sin entradas `/audio/*`; `CACHE` = `filosofuss-${BUILD}`

- [ ] **Step 1:** Test que falla: `check-sw.mjs` lee `public/sw.js` y afirma que ninguna entrada de `PRECACHE_URLS` termina en `.mp3`.
- [ ] **Step 2:** Run `node scripts/check-sw.mjs` → FAIL.
- [ ] **Step 3:** Borrar las 5 líneas de audio de `PRECACHE_URLS` y añadir el fallback offline.
- [ ] **Step 4:** Run `node scripts/check-sw.mjs` → PASS.
- [ ] **Step 5:** Commit (`fix(sw): sacar audio del precache`).

**Size:** S · **Acceptance:** install precache ≤1 MiB; `du` del set de `PRECACHE_URLS` <1 MiB; P-01/A6 cerrado.

### Task A2: Audio `preload='none'` y `src` bajo interacción

**Files:**
- Modify: `src/context/AudioContext.tsx:140-159` (no asignar `src` en montaje; `preload='none'`; asignar en `play()`)
- Test: manual + CDP (sin petición de metadatos en `/` antes de tocar play)

**Interfaces:**
- Consumes: `tracks`, `loadedSrcRef`
- Produces: `AudioProvider` sin petición de red en el arranque

- [ ] **Step 1:** Reproducir el fallo: en `/` se hace 1 range request al mp3 de 13,3 MB.
- [ ] **Step 2:** Cambiar el efecto de `trackIndex` para no setear `src`; `audio.preload='none'`; setear en `play()`.
- [ ] **Step 3:** Verificar en Network: 0 requests a `/audio/*` antes del primer play.
- [ ] **Step 4:** Commit.

**Size:** S · **Acceptance:** 0 peticiones a `/audio/*` en carga inicial de `/` (P-02).

### Task A3: SW valida `fresh.ok` antes de cachear navegación

**Files:** Modify `public/sw.js:69-72`; Test `scripts/check-sw.mjs` (asegura `if (fresh && fresh.ok)`).
**Size:** S · **Acceptance:** W-01 cerrado; test estático PASS.

### Task A4: Bumps de seguridad (sin cambios mayores)

**Files:** Modify `package.json` (`postcss >=8.5.23`, `react-router-dom ^6.30.6`); regenerar `package-lock.json`.
**Interfaces:** Consumes/Produces: mismas APIs públicas.
- [ ] **Step 1:** `npm audit --json` → registrar baseline (11).
- [ ] **Step 2:** `npm audit fix` (aplica D-01/05/06/07) y editar `react-router-dom` a `^6.30.6`.
- [ ] **Step 3:** `npm install` (requiere aprobación por modificar lock) → `npm audit` sin D-01/D-05/D-06/D-07/D-10.
- [ ] **Step 4:** `npm run typecheck` → 0 errores.
- [ ] **Step 5:** Commit.
**Size:** S/M · **Acceptance:** 0 hallazgos high de D-01/05/06/07 y D-10 resuelto; Vite 8 (D-02) queda como decisión aparte (mayor, ver §9).

### Task A5: Corrección de contraste (tokens)

**Files:** Modify `src/index.css:10-65` (valores de `--gold/--copper/--ember/--rose/--muted/--ink`, nuevos alias), `src/index.css:223-248` (dejar de usar `--accent-3` en texto; gradiente solo para hairlines), `tailwind.config.js:7-27` (nuevos nombres). Test `scripts/check-contrast.mjs` (NUEVO).
**Interfaces:** Produces: tokens con los hex de §2.1/§2.2.
- [ ] **Step 1:** Test de contraste que falla con los valores actuales (C1/A3/A4/M10).
- [ ] **Step 2:** Run → FAIL (lista los pares).
- [ ] **Step 3:** Aplicar los hex propuestos en los 3 temas y en `--on-accent`.
- [ ] **Step 4:** Run → PASS (todos ≥4.5 o ≥3).
- [ ] **Step 5:** Commit.
**Size:** M · **Acceptance:** C1/A3/A4/M10 cerrados; 0 usos de `#7A2E4D` en texto; check-contrast PASS.

### Task A6: `<h1>` por ruta + SEO básico

**Files:** Modify `src/pages/Home.tsx:44` (`<h1 className="sr-only">` o el título hero), `src/components/sections/BrowseQuotes.tsx:92`, `PhilosopherWall.tsx:72`, `Favorites.tsx:41`; Modify `index.html:5` (`viewport-fit=cover`), `:20,27` (`og:image`/`twitter:image` absolutos), `:21` (`summary_large_image`), `:31` (theme-color #0A0A0F).
**Size:** S · **Acceptance:** un `<h1>` por ruta (C2); PWA/SEO meta coherentes.

### Task A7: Tap targets ≥44 px

**Files:** Modify `src/components/quotes/QuoteCard.tsx:74` (`h-9 w-9`→`h-11 w-11`), `src/components/ui/AudioPlayer.tsx:125,178,207`, `src/components/ui/Navbar.tsx:147`, `src/components/ui/ThemeToggle.tsx:40`, `src/components/controls/SearchBar.tsx:41`.
**Size:** M · **Acceptance:** todo control interactivo ≥44×44 px (A5); test de clases o auditoría manual.

### Task A8: Error Boundary global

**Files:** Create `src/components/ui/ErrorBoundary.tsx`; Modify `src/App.tsx:39-49`.
**Interfaces:** Produces `ErrorBoundary` (class con `getDerivedStateFromError` + fallback). Consumes React 18.
**Size:** S · **Acceptance:** F-01 cerrado; un error de render muestra fallback, no pantalla blanca.

### Task A9: Tipar `Era`/`Tag` y unificar `initials`

**Files:** Modify `src/types.ts:56,77` (`era: Era`, `tags: Tag[]`), `src/data/philosophers.ts`, `src/lib/utils.ts` (mover `initials` con `CONNECTORS`), `src/components/quotes/QuoteCard.tsx:37-43` (usar el compartido).
**Size:** S/M · **Acceptance:** F-02/F-09 cerrados; typecheck 0 errores; `initials` idéntico en tarjeta y muro.

## OLA B — Rendimiento + bundle — 9 tareas

### Task B1: Virtualizar `/explorar` y quitar `layout`/tilt masivos

**Files:** Modify `src/components/sections/BrowseQuotes.tsx:164-182`; Modify `src/components/quotes/QuoteCard.tsx` (tilt/spotlight solo `featured`); Create `src/hooks/useVirtualList.ts` o vendorizado propio. **`@tanstack/react-virtual` requiere aprobación**; alternativa sin deps: ventana por scroll + `content-visibility:auto` (propuesta si no se aprueba).
**Interfaces:** Produces: `virtualRange(count, rowHeight, viewport)`.
**Size:** L · **Acceptance:** `/explorar` monta ≤60 nodos de tarjeta; DOM total <5.000 nodos; LCP <1,5 s; P-05/P-07/P-08 cerrados.

### Task B2: `React.memo` + `useDeferredValue` en búsqueda

**Files:** Modify `src/components/sections/BrowseQuotes.tsx:19-51,102`; Modify `src/components/quotes/QuoteCard.tsx` (`export default memo(QuoteCard)`); Modify `src/lib/utils.ts` (sin cambios).
**Size:** M · **Acceptance:** teclear 9 chars no produce >2 long tasks; P-06 cerrado.

### Task B3: Sacar el corpus del chunk inicial

**Files:** Modify `src/data/quotes.ts:1630-1693` (carga dinámica de batches y `quotesEn`), `src/App.tsx`/vistas (import dinámico). Create `src/data/loadQuotes.ts`.
**Interfaces:** Produces `loadQuotes(locale): Promise<Quote[]>`; `getQuoteText` sigue igual.
**Size:** M · **Acceptance:** chunk `index` ≤120 KB gzip y sin ids `q-*`; P-03/P-13 cerrados.

### Task B4: `usePrefersReducedMotion` reactivo y sustitución de las 14 copias

**Files:** Create `src/hooks/usePrefersReducedMotion.ts`; Modify los 14 archivos con `prefers-reduced-motion` (`Home.tsx:12`, `QuoteCard.tsx:12`, `AudioPlayer.tsx:19`, `ZenMode.tsx:25`, `Hero.tsx:9`, `BrowseQuotes.tsx:12`, `PhilosopherWall.tsx:11`, `Favorites.tsx`, `AnimatedQuote.tsx:3`, `AuroraBackground.tsx:3`, `ParticleField.tsx`, `SceneBackground.tsx`, `NoiseOverlay.tsx`, `ThemeToggle.tsx`).
**Size:** M · **Acceptance:** F-08/F-27/B2/A9 cerrados; cambio de preferencia en vivo se refleja.

### Task B5: `LazyMotion` + `m`

**Files:** Modify `src/App.tsx` (envolver con `LazyMotion features={domAnimation}`), 14 archivos `motion.*` → `m.*`.
**Size:** M/L · **Acceptance:** chunk `motion` reducido (objetivo −15–25 KB gzip, P-04).

### Task B6: Índice de búsqueda precomputado y mapa de filósofos

**Files:** Modify `src/data/quotes.ts` (`searchQuotes` usa índice), `src/components/sections/PhilosopherWall.tsx:83` (`Map<id, Quote[]>`), `src/components/sections/BrowseQuotes.tsx`.
**Size:** M · **Acceptance:** P-15/P-16 cerrados; una búsqueda no normaliza 507 strings.

### Task B7: `currentTime` fuera del contexto raíz

**Files:** Modify `src/context/AudioContext.tsx:211-246` (quitar `currentTime` del value; exponer `useSyncExternalStore` o `AudioProgressContext`), `src/components/ui/AudioPlayer.tsx`.
**Size:** M · **Acceptance:** P-10 cerrado; la app no re-renderiza el árbol a 4 Hz.

### Task B8: Fuentes self-host con subconjunto

**Files:** Create `public/fonts/*.woff2` (assets); Modify `index.html:45-51` (quitar Google Fonts; `@font-face` local), `src/index.css` (familias), `tailwind.config.js:22-27`.
**Size:** M · **Acceptance:** transfer de fuentes ≤70 KB; sin dependencia externa de Google (mitiga P-11/U-04/A7).

### Task B9: Música a Opus/AAC y voz más ligera

**Files:** Assets en `public/audio/*` (re-encode); Modify `src/data/tracks.ts`/`voiceManifest.ts` (rutas) y `public/sw.js` (tipos).
**Nota:** cambio de assets de contenido → **requiere aprobación** (`ffmpeg` local, sin deps npm).
**Size:** M · **Acceptance:** audio total ≤25 MB (desde 70,5 MB); P-12 mitigado.

## OLA C — Sistema de diseño + efectos — 9 tareas

### Task C1: Tokens de tipografía y escala
**Files:** Modify `src/index.css` (variables y clases), `tailwind.config.js` (escala, `text-2xs`, lineHeight, measure); Modify usos arbitrarios (`Navbar.tsx:50`, `AudioPlayer.tsx:167,249`, `QuoteOfDay.tsx:27,55`, `Logo.tsx`, `Home.tsx:41`).
**Size:** M · **Acceptance:** 0 clases con tracking/tamaño arbitrarios; B1 cerrado.

### Task C2: `src/lib/motion.ts` con variantes y springs
**Files:** Create `src/lib/motion.ts`. **Size:** S · **Acceptance:** valores de §3.4 exportados y usados.

### Task C3: Transiciones de página
**Files:** Modify `src/App.tsx`; `src/lib/motion.ts`. **Size:** S · **Acceptance:** ≤220 ms, solo compositor, reduced-motion OK.

### Task C4: Reveal orquestado por vista
**Files:** Modify `Home.tsx`, `BrowseQuotes.tsx`, `PhilosopherWall.tsx`, `Favorites.tsx`; `motion.ts`. **Size:** M · **Acceptance:** una secuencia por vista; sin fade-up por sección.

### Task C5: Hero cinematográfico + grain + parallax
**Files:** Modify `src/components/sections/Hero.tsx`, `src/components/quotes/AnimatedQuote.tsx` (revelado por líneas), `src/components/effects/AuroraBackground.tsx`, `ParticleField.tsx`. **Size:** L · **Acceptance:** P-09/P-14 mitigados; una sola secuencia; parallax ±12 px.

### Task C6: Visualizer audio-reactivo
**Files:** Create `src/audio/analyser.ts`, `src/hooks/useAudioAnalyser.ts`, `src/components/ui/Visualizer.tsx`; Modify `src/components/ui/AudioPlayer.tsx`. **Size:** M/L · **Acceptance:** barras reaccionan; pausa con tab oculto; fallback CSS; A10 (aria-live) cubierto.

### Task C7: Primitivo `Dialog` con focus trap
**Files:** Create `src/components/ui/Dialog.tsx`; Modify `ZenMode.tsx:76-85`, `PhilosopherWall.tsx:132-144`, `Navbar.tsx:142-190` (menú), `AudioPlayer.tsx:141` (quitar `role="dialog"` o convertirlo). **Size:** L · **Acceptance:** A1/A2/M8/M9 cerrados; foco inicial, trap, Escape, restauración.

### Task C8: Skeletons + micro-interacciones + `aria-live`
**Files:** Create `src/components/ui/Skeleton.tsx`, `src/components/ui/StatusAnnouncer.tsx`; Modify `App.tsx:20-29` (RouteFallback), `QuoteCard.tsx` (copiar/compartir/favorito), `AudioPlayer.tsx`. **Size:** M · **Acceptance:** skeleton en lazy; `aria-live` anuncia copiado/reproducción; `animate-shimmer` usado (F-20).

### Task C9: Limpieza de keyframes duplicados y utilidades muertas
**Files:** Modify `src/index.css:267-375` (quitar los 11 `@keyframes` duplicados) o `tailwind.config.js:44-102` (fuente única); podar utilidades sin uso. **Size:** S · **Acceptance:** F-19/F-20 cerrados; una sola definición de keyframes.

## OLA D — PWA + Capacitor — 8 tareas

### Task D1: Manifest enriquecido + rutas relativas
**Files:** Modify `public/manifest.webmanifest` (`id`, `screenshots`, `shortcuts`, maskable 192, colores #0A0A0F), `src/main.tsx:16-22` (registro con `BASE_URL`, guarda nativo), `index.html:30` (href relativo).
**Size:** M · **Acceptance:** A7/M1/M14 cerrados; PWA instalable en subruta.

### Task D2: Página offline + caché versionada
**Files:** Create `public/offline.html`; Modify `public/sw.js`. **Size:** S · **Acceptance:** M15 cerrado.

### Task D3: Screenshots e icono maskable 192
**Files:** Create `public/icons/icon-192-maskable.png`, `public/screenshots/*.png`. **Content → requiere aprobación.** **Size:** S.

### Task D4: Safe-area y `svh`
**Files:** Modify `index.html:5`; `Navbar.tsx`, `AudioPlayer.tsx`, `ZenMode.tsx`, `Hero.tsx:30`, `Footer.tsx`. **Size:** M · **Acceptance:** M4/M12 cerrados; sin solapes bajo notch/home indicator.

### Task D5: `robots.txt`, `sitemap.xml`, canonical, JSON-LD
**Files:** Create `public/robots.txt`, `public/sitemap.xml`; Modify `index.html` (canonical, `og:url`, JSON-LD `WebSite`+`CreativeWork`). **Size:** S/M · **Acceptance:** M2/M3 cerrados.

### Task D6: Release hardening Android
**Files:** Modify `android/app/build.gradle:19-24` (signing + minify + shrink), `android/app/src/main/AndroidManifest.xml:5` (`allowBackup=false`), `android/app/src/main/res/xml/file_paths.xml`, add `network_security_config.xml`, `capacitor.config.ts` (`server.androidScheme`), `gradle-wrapper.properties`. **Size:** M · **Acceptance:** A-01..A-07 cerrados; `./gradlew assembleRelease` firmado.

### Task D7: CSP y cabeceras en nginx
**Files:** Modify `Dockerfile:20-26` (CSP con hash del script inline, HSTS, X-Frame-Options, Referrer-Policy, Permissions-Policy, `server_tokens off`), pin por digest, usuario no root.
**Size:** M · **Acceptance:** H-01/H-02/H-03/B-01/B-02 cerrados; cabeceras presentes en respuesta.

### Task D8: (Opcional, requiere aprobación) plugins Capacitor
**Files:** Modify `capacitor.config.ts`, `src/main.tsx`; deps `@capacitor/status-bar|splash-screen|app`. **Size:** M.

## OLA E — Pulido + validación Lighthouse — 7 tareas

### Task E1: Focus/teclado end-to-end y `aria-live` final
**Files:** varios (verificación A1/A2/M8/M9/A10). **Size:** M · **Acceptance:** navegación por teclado completa en Zen/ficha/menú/reproductor.

### Task E2: Completar i18n
**Files:** Modify `src/data/philosophers.ts`, `src/types.ts`, `src/i18n/strings.ts`, `FilterPanel.tsx:99-114`, `QuoteCard.tsx:242-247`, `QuoteOfDay.tsx:82`, `Hero.tsx:62`, `LanguageToggle.tsx:11-12`.
**Size:** L · **Acceptance:** A8/M7 cerrados; EN no mezcla español; búsqueda EN indexa texto EN.

### Task E3: Test de paridad ES/EN y dedupe de corpus
**Files:** Create `scripts/check-parity.mjs`; Modify `src/data/quotes*.ts` (8 duplicados F-10). **Size:** M · **Acceptance:** paridad 507/507 y 0 textos duplicados.

### Task E4: Bundles y presupuestos verificables
**Files:** Modify `vite.config.ts` (chunk de datos, compresión), `package.json` (script `budget`). **Size:** M · **Acceptance:** JS inicial ≤120 KB gzip; Brotli si hosting.

### Task E5: Lighthouse ≥90 ×4
**Files:** Create `scripts/lighthouse.mjs` o documento de medición. **Dep:** `lighthouse` **requiere aprobación** (o usar Chrome DevTools manual). **Size:** M · **Acceptance:** ≥90 Performance/Accessibility/Best-Practices/SEO en `/` y `/explorar`.

### Task E6: Typecheck estricto completo
**Files:** Modify `tsconfig.json:25-26` y arreglar los 28 errores (code.md §Deuda a estricto). **Size:** L · **Acceptance:** `noUnusedLocals`, `noUnusedParameters`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes` activos con 0 errores.

### Task E7: ESLint + tests mínimos
**Files:** Create `eslint.config.js`, `vitest` config; Modify `package.json` (scripts `lint`/`test`). **Deps: requiere aprobación.** **Size:** L · **Acceptance:** F-12 cerrado; `npm run lint` y `npm test` verdes.

---

# 8. Review Focus

Los cinco modos de fallo / inputs que la spec no fija y que los tests sugeridos no cubren:

1. **`prefers-reduced-motion` cambia en caliente** mientras el usuario navega: un hook no reactivo deja animaciones activas (hoy es constante de módulo, F-27). Comportamiento esperado: los efectos se detienen sin recargar. *Test en Task B4.*
2. **`localStorage` corrupto o de otra versión** (`filosofuss:theme` con JSON inválido, `zen:size` fuera de rango): `safeGet` castea sin validar (F-04). Esperado: degradar al default y no romper. *Test en Task B4/A8.*
3. **Usuario en subruta (`/app/`) o en Capacitor (`capacitor://`)**: las rutas absolutas del SW/manifest fallan silenciosamente (A7). Esperado: no registrar SW en nativo y resolver recursos con `BASE_URL`. *Test en Task D1.*
4. **Audio de una pista cuyo MP3 falla o no está**: hoy `onError` rota en silencio infinito hasta agotar pistas (F-06). Esperado: mensaje visible y stop, y el visualizer no queda colgado. *Test en Task C6.*
5. **Búsqueda en inglés con `locale==='en'`**: hoy indexa solo `quote.text` ES y no encuentra nada (A8). Esperado: encontrar por texto EN. *Test en Task E2.*

---

# 9. Supuestos, riesgos y aprobaciones

## Supuestos

- El hosting final sirve en raíz o subruta con HTTPS y `base:'./'`; si es CDN, Brotli disponible.
- Existe keystore de release para Android (si no, A-04 queda bloqueado).
- El corpus y su traducción son correctos; solo se deduplican textos repetidos, no se reescribe contenido.
- `docs/` permanece fuera del control de versiones hasta que el usuario decida commitear (hoy `?? docs/`).

## Riesgos

| Riesgo | Mitigación |
|---|---|
| Virtualizar `/explorar` cambia comportamiento de scroll/anclas | flags por feature; medir DOM/LCP antes/después |
| `createMediaElementSource` enruta el audio y puede silenciarlo si no se reconecta a `destination` | test manual de reproducción + fallback CSS |
| Self-host de fuentes puede empeorar FOUT si el subset es incompleto | `font-display: swap`, `size-adjust`, subset `latin` |
| Actualizar a Vite 8 (D-02) rompe el build | OLA A solo sube postcss/react-router; Vite 8 se decide aparte |
| Re-encode de audio (P-12) reduce fidelidad percibida | es una decisión de contenido → aprobación |
| CSP con script inline de `index.html:85-99` bloquea la app | hash SHA-256 calculado en build o mover el bootstrap a `.js` externo |

## Requiere aprobación explícita del usuario

1. **Dependencias nuevas:** `@tanstack/react-virtual` (o vendorizar), `lighthouse`, ESLint/Vitest, y plugins Capacitor (`@capacitor/app`, `status-bar`, `splash-screen`, `local-notifications`).
2. **Cambios de contenido/assets:** re-encode de audio a Opus/AAC (P-12/B9), screenshots PWA (D3).
3. **Borrar los 6 `.exe` de `scripts/`** (B-03, `edge-tts.exe`, `edge-playback.exe`, `idna.exe`, `pip3.exe`, `pip3.14.exe`, `tabulate.exe`): no los usa ningún script; borrarlos es un cambio de repositorio con historial.
4. **Cambio de paleta:** redefinir `--accent-3` (#7A2E4D → #C97A4A) y oscurecer `--gold` en light/paper altera la marca; **es la propuesta, no está aplicada.**
5. **Actualización mayor de Vite** (5.4.21 → 8.x, D-02) y deps mayores de D-11; **y** commitear/mergear la rama `nivel-dios`.
6. **Notificaciones** (web o Capacitor): se propone **NO** implementarlas ahora (§4.3).
7. **Tocar `android/`** (release hardening) y definir firma/keystore.

## Definition of Done (global)

- `npm run typecheck` 0 errores con flags estrictos.
- `npm run build` exit 0; JS inicial ≤120 KB gzip.
- `check-contrast`, `check-sw`, `check-parity` PASS.
- Lighthouse ≥90 en las 4 categorías en `/` y `/explorar`.
- LCP `/explorar` <1.5 s; install de PWA ≤1 MiB; 0 peticiones de audio en arranque.
- Todos los hallazgos Críticos/Altos de las 4 auditorías cerrados o con decisión registrada.
