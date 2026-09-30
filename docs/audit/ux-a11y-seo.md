# Auditoría UX · Accesibilidad (a11y) · SEO · PWA — Filosofuss

- **Proyecto:** `/home/deploymodeio/proyectos/filosofuss`
- **Rama:** `nivel-dios`
- **Fecha:** 2026-09-30
- **Alcance:** auditoría de solo lectura sobre fuentes (React 18 + TS + Vite + Tailwind + Framer Motion + Capacitor Android).
- **Método:** lectura estática de código y cálculo preciso de contraste WCAG con la fórmula de luminancia relativa sRGB (script desechable en `/tmp`). Sin Lighthouse ni navegador.
- **Estado:** no se modificó ninguna fuente; este informe es el único archivo creado.

---

## Resumen ejecutivo

La base de diseño y accesibilidad es sólida (tokens de color centralizados, 3 temas, landmarks semánticos, `focus-visible`, `aria-hidden` en fondos decorativos, `prefers-reduced-motion` en CSS, `lang`/`theme-color` sincronizados por JS, PWA con manifiesto e iconos completos, nginx con fallback SPA). Los problemas se concentran en:

1. **Contraste dentro de degradados** que incluyen `--accent-3` (vino) y en el **tema claro/papel**, que incumplen AA.
2. **Jerarquía de encabezados**: no existe ningún `<h1>` en ninguna ruta.
3. **Gestión de foco en modales** (Zen y ficha de filósofo) y ausencia de regiones `aria-live`.
4. **i18n incompleta**: era/escuela/nacionalidad/biografía/temas/filtros siguen solo en español.
5. **PWA/SW**: precache de ~36 MB de MP3 y rutas absolutas incompatibles con `base: './'` y con Capacitor.

### Recuento por severidad

| Severidad | Nº |
|---|---|
| Crítico | 2 |
| Alto | 9 |
| Medio | 15 |
| Bajo | 6 |
| **Total** | **32** |

---

## Tabla de hallazgos

| ID | Hallazgo | Severidad | Evidencia (archivo:línea) | Impacto estimado | Esfuerzo | Recomendación |
|---|---|---|---|---|---|---|
| C1 | El texto de degradado animado incluye `--accent-3` (#7a2e4d), que da **2.19:1** sobre `--bg` oscuro; se usa en el logo (todas las pantallas) y en títulos de sección | Crítico | `src/index.css:223-234,236-248`; `src/components/ui/Logo.tsx:41`; `src/pages/Home.tsx:46`; `src/components/sections/BrowseQuotes.tsx:94` | Marca y titulares con contraste oscilante/pobre; incumple WCAG 1.4.3 | M | Fijar el degradado a tonos con ≥4.5:1 (p. ej. accent→accent-2) y no incluir accent-3, o subir la luminosidad de accent-3 en texto |
| C2 | **No hay `<h1>` en ninguna ruta**; el primer encabezado es `<h2>` (y en Home el Hero no tiene encabezado) | Crítico | `src/pages/Home.tsx:44`; `src/components/sections/BrowseQuotes.tsx:92`; `src/components/sections/Favorites.tsx:41`; `src/components/sections/PhilosopherWall.tsx:72`; `src/components/sections/Hero.tsx:61` | Afecta navegación por encabezados (WCAG 1.3.1/2.4.6) y señales SEO | S | Añadir un `<h1>` (visualmente oculto si se quiere) por ruta: Home, Explorar, Filósofos, Favoritos |
| A1 | Modal **Modo Zen** con `role="dialog" aria-modal="true"` pero **sin focus trap ni foco inicial**; el foco permanece en el fondo | Alto | `src/components/ui/ZenMode.tsx:76-85` (rol), `:55-59` (solo Escape) | Teclado/SR pueden tabular al contenido de fondo; `aria-modal` no se honra (WCAG 2.4.3) | M | Mover foco al abrir, atraparlo dentro del diálogo y restaurarlo al cerrar |
| A2 | Modal de **ficha de filósofo** con `aria-modal` sin gestión de foco | Alto | `src/components/sections/PhilosopherWall.tsx:132-136,45-57` | Igual que A1 | M | Reutilizar un primitivo de diálogo con focus trap |
| A3 | `--accent` en **tema claro** (#9c7633) = **3.88:1** sobre `--bg`; se usa en eyebrow `text-xs`, links activos y nombres de autor | Alto | `src/index.css:43`; `src/components/sections/BrowseQuotes.tsx:89`; `src/components/ui/Navbar.tsx:33`; `src/components/quotes/QuoteCard.tsx:237` | Texto normal <4.5:1 en modo claro | S | Oscurecer `--accent` claro a ≥4.5:1 (p. ej. ~#8a6520) |
| A4 | `btn-primary` con degradado `accent→accent-2` y tinta `#0a0a12`: en claro el tramo cobre da **3.37:1** y en papel **2.48:1** (falla incluso 3:1) | Alto | `src/index.css:146-147`; usa en `src/components/sections/Hero.tsx:95`, `src/components/quotes/QuoteOfDay.tsx:97`, `src/pages/Home.tsx:68` | El texto del CTA principal puede quedar ilegible en temas claros/papel | S | Aclarar `--accent-2` en light/paper o usar tinta blanca con un fondo sólido más oscuro |
| A5 | **Tap targets < 44 px**: iconos de acción `h-9 w-9` (36), volumen `h-8` (32), menú móvil `h-10` (40), toggle de tema `h-8` (32), limpiar búsqueda `p-1` | Alto | `src/components/quotes/QuoteCard.tsx:74`; `src/components/ui/AudioPlayer.tsx:125,178,207`; `src/components/ui/Navbar.tsx:147`; `src/components/ui/ThemeToggle.tsx:40`; `src/components/controls/SearchBar.tsx:41` | Dificultad de pulsación en móvil (WCAG 2.5.8 objetivo AA) | M | Elevar a ≥44×44 px (área táctil con padding si el icono es menor) |
| A6 | El **SW precachea ~36 MB de MP3** en `install` (5 pistas) | Alto | `public/sw.js:14-23` | Instalación lenta, posible fallo por cuota, datos móviles | S | Sacar el audio del precache; cachearlo on-demand con SWR |
| A7 | **Rutas absolutas** `/sw.js`, `/manifest.webmanifest`, `start_url:"/"`, precache `/...` chocan con `base: './'` (subruta) y con Capacitor (`capacitor://`/`file://`, donde el SW no registra) | Alto | `vite.config.ts:7`; `src/main.tsx:16-22`; `public/sw.js:14-23`; `public/manifest.webmanifest:7-8` | PWA no funciona si se sirve en subruta; offline nativo depende del shell local | M | Usar rutas relativas (o `import.meta.env.BASE_URL`), guardar el registro del SW y documentar el caso Capacitor |
| A8 | **i18n incompleta**: era, escuela, nacionalidad, biografía, tags y opciones de filtro solo existen en español; el Hero ignora `locale` | Alto | `src/data/philosophers.ts:13-18,29`; `src/types.ts:5-45`; `src/components/controls/FilterPanel.tsx:99-114`; `src/components/quotes/QuoteCard.tsx:242-247`; `src/components/quotes/QuoteOfDay.tsx:82`; `src/components/sections/Hero.tsx:62` | En EN se mezclan idiomas; búsqueda EN no encuentra citas (busca `quote.text` ES) | L | Añadir mapas EN para era/escuela/tags/bio y usar `getQuoteText` también en Hero |
| A9 | **`prefers-reduced-motion` parcial**: los `layout` de Framer, `layoutId` del toggle de tema, `whileHover` y `AnimatePresence` del menú, y el scroll suave de ruta no se desactivan | Alto | `src/components/sections/BrowseQuotes.tsx:165,172`; `src/components/sections/Favorites.tsx:84,91`; `src/components/ui/Navbar.tsx:152,171`; `src/components/ui/ThemeToggle.tsx:44`; `src/components/ui/ScrollToTop.tsx:7` | Usuarios con sensibilidad al movimiento reciben animaciones (WCAG 2.3.3) | M | Propagar una comprobación reactiva de reducción de movimiento y desactivar `layout`/transiciones |
| A10 | **Sin regiones `aria-live`** para el estado de audio/narración ni para la cita del día | Alto | `src/components/ui/AudioPlayer.tsx` (estado), `src/context/NarrationContext.tsx`; `src/components/quotes/QuoteOfDay.tsx` | Cambios de reproducción/escucha no se anuncian a lectores de pantalla | M | Añadir `aria-live="polite"`/`role="status"` a los mensajes de estado |
| M1 | `theme_color` incoherente: manifiesto `#07070f` vs `<meta theme-color>` `#0a0a0f` vs CSS `--bg` | Medio | `public/manifest.webmanifest:11-12`; `index.html:31`; `src/index.css:12` | Barra del sistema/splash con color distinto al de la app | S | Unificar en `#0a0a0f` |
| M2 | SEO SPA: sin `canonical`, sin `og:url`, `og:image` **relativa** (`/icons/icon-512.png`), `twitter:card=summary`, sin JSON-LD | Medio | `index.html:20-27` (sin canonical/og:url) | Vista previa rota al compartir desde otro origen; sin datos enriquecidos | M | Añadir canonical y `og:url` absolutos, `summary_large_image` y JSON-LD (`WebSite`/`CreativeWork`) |
| M3 | No existen `public/robots.txt` ni `public/sitemap.xml` | Medio | ausentes en `public/` | Indexación pobre de una SPA sin prerender | S | Generar ambos; el sitemap debe listar las 4 rutas |
| M4 | Sin `viewport-fit=cover` ni `env(safe-area-inset-*)`; header sticky y controles inferiores fixed | Medio | `index.html:5`; `src/components/ui/AudioPlayer.tsx:103`; `src/components/ui/ZenMode.tsx:134` | Con notch/indicador de inicio, controles bajo la barra o el pulgar | M | Añadir `viewport-fit=cover` y padding con safe-area en header/Zen/AudioPlayer |
| M5 | Iconos decorativos sin `aria-hidden` (Sparkles del Hero, flechas de CTA, iconos de filtros/chips/basura) | Medio | `src/components/sections/Hero.tsx:56,97,100`; `src/components/controls/FilterPanel.tsx:122,137,157`; `src/components/sections/BrowseQuotes.tsx:139,158`; `src/components/sections/Favorites.tsx:79` | Ruido para lectores de pantalla | S | Añadir `aria-hidden="true"` a todo icono acompañado de texto |
| M6 | Grupos de filtros sin semántica: el título es `<span>`, sin `fieldset`/`role=group`/`aria-labelledby` | Medio | `src/components/controls/FilterPanel.tsx:60-64` | Los pills no se anuncian agrupados por categoría | S | Envolver con `fieldset`+`legend` o `role="group"`+`aria-labelledby` |
| M7 | Botón de idioma no usa i18n: `aria-label`/`title` fijos en "Cambiar idioma" aunque existe `lang.toggle` | Medio | `src/components/ui/LanguageToggle.tsx:11-12`; `src/i18n/strings.ts:31,166` | Etiqueta en español en modo EN; no indica idioma destino | S | Usar `t('lang.toggle')` y anunciar el idioma destino (p. ej. "Cambiar a inglés") |
| M8 | Menú móvil del Navbar: sin focus trap, sin cierre con Escape, sin `aria-controls` ni traslado de foco | Medio | `src/components/ui/Navbar.tsx:142-190` | Navegación de teclado inconsistente en móvil | M | Atrapar foco, cerrar con Escape y vincular con `aria-controls` |
| M9 | Panel del reproductor declarado `role="dialog"` sin `aria-modal`, sin Escape ni foco gestionado | Medio | `src/components/ui/AudioPlayer.tsx:141-143` | Semántica de diálogo engañosa para SR/teclado | S | Quitar `role="dialog"` (es un popover) o implementarlo como diálogo real con Escape |
| M10 | `--muted` sobre `--bg-2` en **papel** = **4.36:1** (footer en `text-xs`) | Medio | `src/index.css:59`; `src/components/ui/Footer.tsx:20,40,46` | Texto pequeño <4.5:1 en tema papel | S | Oscurecer `--muted` en papel o usar `--text` en el footer |
| M11 | Varios CTA primarios compiten por pantalla (Hero, Cita del día y cierre) | Medio | `src/components/sections/Hero.tsx:95`; `src/components/quotes/QuoteOfDay.tsx:97`; `src/pages/Home.tsx:68` | Jerarquía de acción poco clara | M | Definir una única acción primaria por vista; degradar el resto a ghost |
| M12 | `min-h-[92vh]` en Hero usa `vh` (incluye barras móviles) | Medio | `src/components/sections/Hero.tsx:30` | Salto/scroll incómodo en móvil | S | Usar `svh`/`dvh` (`min-h-[92svh]`) |
| M13 | Tinta `#0a0a12` hardcodeada y varios "negros" distintos (`#0a0a0f`, `#07070f`, `#0a0a12`) sin token | Medio | `src/index.css:89,146`; `src/components/quotes/QuoteCard.tsx:233`; `src/components/ui/ThemeToggle.tsx:45,52`; `src/components/controls/FilterPanel.tsx:40,140`; `src/components/ui/Navbar.tsx:50,101` | Inconsistencia de marca y de contraste entre superficies | M | Definir `--ink`/`--on-accent` y un único negro base |
| M14 | Manifiesto sin `id`, `screenshots`, `shortcuts`; maskable solo en 512 | Medio | `public/manifest.webmanifest:1-19` | Instalación menos rica; sin banners de captura en Chrome | S | Añadir `id`, `shortcuts` y `screenshots` |
| M15 | Sin página offline dedicada; nombre de caché fijo `filosofuss-v1` | Medio | `public/sw.js:11,79` | Experiencia offline mínima; riesgo de caché obsoleta | S | Cachear un fallback offline y derivar el nombre de caché de un hash de build |
| B1 | Escala tipográfica no formalizada: valores arbitrarios de tracking y tamaño (`[0.2em]`, `[0.3em]`, `[10px]`, `[11px]`, `h-[24rem]`) | Bajo | `src/index.css`; `src/components/quotes/QuoteOfDay.tsx:27,55`; `src/components/quotes/QuoteCard.tsx:50`; `src/components/ui/Navbar.tsx:50` | Microinconsistencias de ritmo visual | S | Definir tokens de tracking/tamaño (text-2xs, tracking tokens) |
| B2 | `prefersReducedMotion` se captura una sola vez al importar el módulo (no reacciona en vivo) | Bajo | `src/pages/Home.tsx:12-15`; `src/components/quotes/QuoteCard.tsx:12-15`; `src/components/effects/AuroraBackground.tsx:3-6` | Cambios del SO sin recargar no se reflejan | S | Usar un hook con `matchMedia` + listener |
| B3 | `SearchBar` declara un `placeholder` por defecto en español que nunca se usa (render usa `t(...)`) | Bajo | `src/components/controls/SearchBar.tsx:15` | Código muerto; posible confusión futura | S | Eliminar el default o traducirlo |
| B4 | Longitud de línea en cita destacada: `max-w-3xl` con `text-5xl` serif | Bajo | `src/components/quotes/QuoteOfDay.tsx:23,67` | Medida larga en desktop (legibilidad de cita) | S | Limitar el bloque de cita (~60-70ch) con `max-w-[36ch]` en el texto |
| B5 | Botón de filtros móvil sin `aria-controls` hacia el panel colapsable | Bajo | `src/components/controls/FilterPanel.tsx:131-144` | Relación botón↔panel no anunciada | S | Añadir `id` al panel y `aria-controls` al botón |
| B6 | `lang` del manifiesto fijo en `es` aunque la UI cambie a `en` | Bajo | `public/manifest.webmanifest:5` | Menor; metadato de instalación desalineado | S | Documentar limitación o generar manifiesto por locale |

---

## 1. Jerarquía visual y design tokens

**Paleta (bien centralizada).** `:root` (oscuro por defecto) define `--bg #0a0a0f`, `--bg-2 #12121a`, `--glass rgba(255,255,255,.045)`, `--glass-strong .08`, `--border rgba(201,169,106,.16)`, `--border-soft rgba(255,255,255,.08)`, `--text #ece8e1`, `--muted #9a96aa`, `--accent #c9a96a`, `--accent-2 #b0713f`, `--accent-3 #7a2e4d` (`src/index.css:10-31`). Los temas claro (`html.light`, `:33-48`) y papel (`html.paper`, `:50-65`) redefinen las mismas variables — enfoque correcto y consistente.

**Tipografía con roles claros.** `.text-gradient` / `.text-gradient-animated` (`src/index.css:223-248`). Familias: Cinzel (logo), Playfair Display (display), Cormorant Garamond (citas), Inter (UI) (`src/index.css:27-30`; `tailwind.config.js:22-27`). El uso de serif para citas y display para titulares es coherente.

**Problemas de tokens / consistencia:**
- **Degradados que incluyen `--accent-3`**: el degradado va `accent → accent-2 → accent-3` y anima (`src/index.css:236-248`). Cuando el color cae en el tramo vino, el contraste es **2.19:1** (ver §2). Se aplica al **logo** en todas las pantallas (`Logo.tsx:41`).
- **Tinta hardcodeada**: `#0a0a12` se repite en `index.css:89,146`, `QuoteCard.tsx:233`, `ThemeToggle.tsx:45,52`, `FilterPanel.tsx:40,140`, `Navbar.tsx:50,101`. Conviven tres negros: `#0a0a0f` (bg), `#07070f` (manifiesto), `#0a0a12` (tinta). Debería ser token `--ink`/`--on-accent`.
- **Valores arbitrarios**: tracking `[0.18em]` (Logo), `[0.2em]`/`[0.3em]` (`Home.tsx:41`, `QuoteOfDay.tsx:55`), tamaños `[10px]`/`[11px]` (`Navbar.tsx:50`, `AudioPlayer.tsx:167,249`), dimensiones `h-[24rem]`/`min-h-[92vh]`/`max-h-[85vh]`. No hay escala tipográfica/espaciado formal, pero el ritmo de sección sí es consistente (`px-5 py-16 sm:px-8 sm:py-24` en Home/Browse/Favorites/Wall).
- **Acción primaria por pantalla**: en Home compiten dos `btn-primary` (Hero `Hero.tsx:95`, cierre `Home.tsx:68`) más el CTA de la cita del día (`QuoteOfDay.tsx:97`); en Explorar la búsqueda actúa como acción principal sin CTA explícito. Falta una jerarquía única.
- **Sobreuso de animación**: aurora de 4 blobs 22-30 s (`AuroraBackground.tsx:19-60`), partículas canvas hasta 70 RAF (`ParticleField.tsx:18,67-85`), anillos `spin-slow` 18 s (`QuoteOfDay.tsx:27,31`), float/pulse-glow/gradient-x, y por tarjeta tilt 3D + spotlight + `whileInView` (`QuoteCard.tsx:99-128,179-205`). Impacto en batería/CPU en móvil y Capacitor.

## 2. Contraste (WCAG AA)

Cálculo con luminancia relativa sRGB. Umbrales: **4.5:1** texto normal, **3:1** texto grande/UI. `--glass` se compone por alpha sobre el `--bg` correspondiente.

### Tema oscuro (por defecto)

| Par | Ratio | ¿AA normal (4.5)? | ¿AA grande/UI (3.0)? |
|---|---:|---|---|
| `--text #ece8e1` sobre `--bg #0a0a0f` | **16.17:1** | ✅ | ✅ |
| `--muted #9a96aa` sobre `--bg` | **6.88:1** | ✅ | ✅ |
| `--muted` sobre `--bg-2 #12121a` | **6.49:1** | ✅ | ✅ |
| `--accent #c9a96a` sobre `--bg` | **8.81:1** | ✅ | ✅ |
| `--accent-2 #b0713f` sobre `--bg` | **4.97:1** | ✅ | ✅ |
| `--accent-3 #7a2e4d` sobre `--bg` | **2.19:1** | ❌ | ❌ |
| `--muted` sobre glass (.045) | **6.34:1** | ✅ | ✅ |
| `--muted` sobre glass-strong (.08) | **5.81:1** | ✅ | ✅ |
| `--accent` sobre glass (.045) | **8.12:1** | ✅ | ✅ |
| tinta `#0a0a12` sobre `--accent` (btn) | **8.79:1** | ✅ | ✅ |
| tinta sobre `--accent-2` (btn) | **4.96:1** | ✅ | ✅ |

### Tema claro

| Par | Ratio | ¿AA normal? | ¿AA grande/UI? |
|---|---:|---|---|
| `--text #181620` sobre `--bg #f9f7f3` | **16.71:1** | ✅ | ✅ |
| `--muted #6a6575` sobre `--bg` | **5.26:1** | ✅ | ✅ |
| `--muted` sobre `--bg-2 #f0ede8` | **4.82:1** | ✅ | ✅ |
| `--accent #9c7633` sobre `--bg` | **3.88:1** | ❌ | ✅ |
| `--accent` sobre glass-strong (.98 blanco) | **4.15:1** | ❌ | ✅ |
| `--accent-2 #8a5a2f` sobre `--bg` | **5.48:1** | ✅ | ✅ |
| tinta `#0a0a12` sobre `--accent` (btn) | **4.74:1** | ✅ | ✅ |
| tinta sobre `--accent-2` (btn) | **3.37:1** | ❌ | ✅ |
| texto `#f9f7f3` sobre `--accent` (badge) | **3.88:1** | ❌ | ✅ |

### Tema papel

| Par | Ratio | ¿AA normal? | ¿AA grande/UI? |
|---|---:|---|---|
| `--text #2a251c` sobre `--bg #f2ead9` | **12.72:1** | ✅ | ✅ |
| `--muted #6b6355` sobre `--bg` | **4.96:1** | ✅ | ✅ |
| `--muted` sobre `--bg-2 #e8dcc3` | **4.36:1** | ❌ | ✅ |
| `--accent #8a6420` sobre `--bg` | **4.47:1** | ❌ (límite) | ✅ |
| `--accent-2 #6b4a2a` sobre `--bg` | **6.65:1** | ✅ | ✅ |
| tinta `#0a0a12` sobre `--accent` (btn) | **3.68:1** | ❌ | ✅ |
| tinta sobre `--accent-2` (btn) | **2.48:1** | ❌ | ❌ |

**Violaciones concretas con componente:**
- **Logo y titulares de sección** — degradado con tramo `--accent-3` a **2.19:1** (`Logo.tsx:41`, `Home.tsx:46`, `BrowseQuotes.tsx:94`, `Favorites.tsx:42`, `PhilosopherWall.tsx:74`).
- **Eyebrows y nombres de autor en modo claro** — `text-accent` a **3.88:1** (`BrowseQuotes.tsx:89`, `QuoteCard.tsx:237`, `Navbar.tsx:33` activo).
- **Botones `btn-primary`** — tramo cobre en claro **3.37:1** y en papel **2.48:1** (`index.css:146-147`).
- **Footer en tema papel** — `text-muted` sobre `bg-bg-2` a **4.36:1** (`Footer.tsx:20,40,46`).
- **Icono corazón de favoritos en oscuro** — `accent-3` a **2.19:1** (`Footer.tsx:42`; también estado vacío de Favoritos `Favorites.tsx:58-59`, grande y por tanto admisible si se considera gráfico, pero justo).
- Badges `bg-accent text-bg` en claro **3.88:1** y papel **4.47:1** (`Navbar.tsx:50,101`).

## 3. Responsive / mobile-first

**Lo que funciona:** no hay `100vw` en el código; los fondos usan `fixed inset-0 overflow-hidden` (`SceneBackground.tsx:7-9`, `AuroraBackground.tsx:64`); grids responsive (`sm:grid-cols-2 lg:grid-cols-3`, `PhilosopherWall.tsx:81`); filtros colapsan solo en móvil (`FilterPanel.tsx:135,147`).

**Riesgos:**
- **Sin safe-area / `viewport-fit`**: `index.html:5` no incluye `viewport-fit=cover`, y no existe `env(safe-area-inset-*)` en ningún sitio. El header `sticky top-0` (`Navbar.tsx:124-129`) y los controles inferiores fijos (`AudioPlayer.tsx:103`; `ZenMode.tsx:134`) pueden quedar bajo la status bar o el home indicator en iPhone/Capacitor.
- **Tap targets < 44 px** (ver A5).
- **`min-h-[92vh]`** en Hero depende de `vh` (`Hero.tsx:30`) → salto con barras móviles.
- **Afordencias solo-hover**: el tilt 3D y el spotlight de las tarjetas solo responden a `MouseEvent` (`QuoteCard.tsx:116-123,198-205`); en táctil simplemente no aparecen. No oculta funcionalidad (los botones están siempre visibles), por lo que el riesgo es estético, no de operabilidad.
- **Overlap de reproductor fijo** con contenido/footer en móvil: `fixed bottom-4 right-4` sin reserva de espacio.

## 4. Accesibilidad

**Landmarks (bien):** `<header>` (`Navbar.tsx:124`), `<nav>` (`Navbar.tsx:130`, `Footer.tsx:28`), `<main>` (`App.tsx:39`), `<footer>` (`Footer.tsx:20`).

**Encabezados:** no hay `<h1>` (C2); las vistas arrancan en `<h2>`.

**Botones de icono:** la mayoría tienen `aria-label` (y `title`) — `QuoteCard.ActionButton` (`QuoteCard.tsx:66-79`), `AudioPlayer.IconButton` (`AudioPlayer.tsx:66-76`), `ZenMode` (`ZenMode.tsx:92-208`), `ThemeToggle` con `role="radiogroup"`/`role="radio"`+`aria-checked` (`ThemeToggle.tsx:23-40`). `aria-pressed` correcto en favoritos/copiar/serif. Buen trabajo.

**Imágenes/alt:** no hay elementos `<img>` (la marca es texto "Filosofuss" en `Logo.tsx:44-46` y todos los gráficos son SVG de lucide) → no hay déficits de `alt`. Punto ya resuelto.

**Foco:** `:focus-visible` global con outline dorado (`index.css:113-117`). Sin embargo falta gestión de foco en modales (A1, A2, M8, M9).

**Estado dinámico:** sin `aria-live` para audio/narración/cita del día (A10).

**Movimiento reducido:** CSS global correcto (`index.css:377-387`) pero Framer lo respeta de forma incompleta (A9).

**Idioma:** `document.documentElement.lang` se sincroniza con el locale (`AppContext.tsx:74-76`) — bien; el toggle de idioma no usa i18n (M7).

**Significado solo por color:** se evita en general (aria-pressed/aria-checked/aria-current + fill/underline), bien.

**`title`/`aria-label` del idioma:** presentes pero hardcoded (M7).

## 5. PWA

**Manifiesto** (`public/manifest.webmanifest`): `name`, `short_name`, `description`, `lang`, `dir`, `start_url:"/"`, `scope:"/"`, `display:"standalone"`, `orientation:"portrait"`, `background_color:"#07070f"`, `theme_color:"#07070f"`, `categories`, e iconos 192/256/512 `any` + 512 `maskable`. **Faltan** `id`, `screenshots`, `shortcuts` y un maskable 192 (M14). El `theme_color` no coincide con el meta ni con el CSS (M1).

**Iconos presentes** (`public/icons/`): `apple-touch-icon.png`, `favicon.png`, `icon-192.png`, `icon-256.png`, `icon-512.png`, `icon-512-maskable.png`; y `public/icon.svg`. Correcto y completo.

**Service Worker** (`public/sw.js`):
- Precache del app shell **más 5 MP3 (~36 MB)** (`:14-23`) → A6.
- Navegaciones network-first con fallback a `/index.html`/`/` (`:65-85`); Google Fonts network-first con caché (`:88-106`); mismo origen stale-while-revalidate (`:109-128`). Estrategia razonable.
- `skipWaiting` + `clients.claim` (`:36,49`) y limpieza de cachés antiguas (`:44-48`). Bien, aunque el nombre de caché es fijo (M15).
- **Rutas absolutas** y registro en `/sw.js` (`main.tsx:18`) → A7: incompatible con `base: './'` en subruta y con Capacitor, donde `file://`/`capacitor://` no registran SW (el error se silencia).

**Capacitor** (`capacitor.config.ts`): `webDir: 'dist'`, `appId`. No hay estrategia de safe-area ni de SW para nativo (el shell se sirve localmente, así que el offline es inherente, pero el SW queda como código muerto en nativo).

## 6. SEO / Meta

`index.html`: `description` (`:6-9`), `title` (`:10`), Open Graph (`:12-19`), Twitter (`:21-27`), `manifest` (`:30`), `theme-color` (`:31`), iOS/Apple (`:33-39`), favicons (`:42-43`), fuentes (`:46-51`).

**Faltantes / problemáticos:**
- Sin `canonical`, sin `og:url`, `og:image` **relativa** `/icons/icon-512.png` (`:20,27`) → se rompe al compartir desde otro origen.
- `twitter:card=summary` (`:21`) con icono 512 → conviene `summary_large_image`.
- Sin JSON-LD estructurado.
- Sin `hreflang` es/en (la app cambia idioma en cliente, misma URL) → riesgo de contenido duplicado/mal idioma para buscadores.
- Sin `robots.txt` ni `sitemap.xml` (M3).
- **Es una SPA sin prerender/SSR**: el crawler solo ve el HTML shell (`#root` vacío, `index.html:102-104`), por lo que el contenido (226 citas, filósofos) no es indexable directamente. El fallback SPA de nginx (`Dockerfile`) sirve `/index.html` en cualquier ruta, correcto para deep links.
- `viewport` sin `viewport-fit=cover` (`:5`).

## 7. Copy / i18n

- Existe traducción EN de **citas y fuentes** vía `getQuoteText`/`getQuoteSource` (`src/data/quotes.ts:1669-1693`), usada en `QuoteOfDay` y `QuoteCard`. El comentario de `strings.ts:1-3` ("no las citas, que permanecen en español") está **desactualizado**.
- **No traducido a EN:** era, escuela, nacionalidad, biografía (`philosophers.ts:13-18,29`), tags (`types.ts:21-45`), opciones de filtro (`quotes.ts:1728-1736` → `FilterPanel.tsx:99-114`), chips de tarjeta (`QuoteCard.tsx:242-247`) y atribución de cita del día (`QuoteOfDay.tsx:82`). Resultado: interfaz EN con metadatos en español y búsqueda EN que no encuentra citas (busca solo `quote.text` ES, `quotes.ts:1743-1760`).
- **Hero no usa el locale**: `text={featured.text}` (`Hero.tsx:62`) muestra la cita en español aunque la UI esté en inglés.
- **Cadena hardcoded**: `LanguageToggle` usa `"Cambiar idioma"` en lugar de `t('lang.toggle')` (`LanguageToggle.tsx:11-12`).
- `index.html` tiene `lang="es"` estático (`:2`) pero `AppContext` lo actualiza al cambiar de idioma (`AppContext.tsx:74-76`) — bien.

---

## Aspectos ya correctos (no requieren acción)

- Tokens de color centralizados en variables CSS con 3 temas coherentes (`index.css:10-65`) y mapeados en Tailwind (`tailwind.config.js:7-27`).
- Contraste correcto del texto principal y `--muted` en tema oscuro y en claro/papel (16.17/6.88/16.71/5.26/12.72…).
- Landmarks semánticos `header`/`nav`/`main`/`footer` presentes.
- `:focus-visible` global visible (`index.css:113-117`).
- `aria-label`/`title`/`aria-pressed`/`aria-checked`/`aria-current` en controles de icono.
- `aria-hidden` en fondos decorativos (`SceneBackground.tsx:7-9`, `AuroraBackground.tsx:64,80`, `ParticleField.tsx:140`, `NoiseOverlay.tsx:9`).
- `Escape` cierra Zen y la ficha de filósofo, con bloqueo del scroll de fondo (`ZenMode.tsx:55-66`; `PhilosopherWall.tsx:45-57`).
- `prefers-reduced-motion` cubre las animaciones CSS (`index.css:377-387`) y varios componentes lo comprueban en JS.
- `lang` del documento y `theme-color` sincronizados con el estado (`AppContext.tsx:66-76`).
- PWA con manifiesto e iconos completos (192/256/512 any + 512 maskable + apple-touch-icon + favicon + SVG) y fallback SPA en nginx.
- Sin imágenes raster (no hay déficits de `alt`); marca como texto real.
- Sin overflow por `100vw`; fondos con `overflow-hidden`.

---

## Mejoras sugeridas (orden propuesto)

1. **C1/A3/A4/M10** — Reajustar tokens de color para que todos los pares de texto usados cumplan 4.5:1 (en especial `--accent`/`--accent-2` en claro/papel y eliminar `--accent-3` de degradados de texto).
2. **C2** — Añadir `<h1>` por ruta.
3. **A1/A2/M8/M9** — Primitivo de diálogo con focus trap, foco inicial y `Escape`.
4. **A8** — Completar i18n de metadatos y arreglar el Hero.
5. **A6/A7** — SW: sacar MP3 del precache y usar rutas relativas/`BASE_URL`; documentar Capacitor.
6. **A9/A10/M4** — Reducción de movimiento reactiva, `aria-live`, `viewport-fit=cover` + safe-area.
7. **M2/M3/M14** — SEO/PWA: canonical, `og:url`, JSON-LD, `robots.txt`, `sitemap.xml`, `screenshots`/`shortcuts`.

---

## Limitaciones

- **Sin ejecución de navegador ni Lighthouse**: no se midieron Core Web Vitals, LCP/CLS/INP, ni comportamiento real de foco/lector de pantalla; todo es análisis estático de fuentes.
- **Sin `node_modules`**: no se compiló ni se hicieron pruebas de tipos/build; los `file:line` corresponden al árbol de fuentes en la rama `nivel-dios`.
- **Contraste de cristal**: los valores de `--glass`/`--glass-strong` se calcularon por composición alpha sobre el `--bg` plano; el contraste real sobre la aurora/partículas (con `backdrop-filter`) es variable y puede diferir.
- **Contraste de degradados**: se evalúan sus paradas de color (`accent`, `accent-2`, `accent-3`) como peor caso; el valor instantáneo depende de la posición animada del degradado.
- **Manifest/SW en Capacitor**: no se probó el registro del SW en dispositivo Android real; la afirmación se basa en la naturaleza de los esquemas `file://`/`capacitor://` y en la ausencia de guardas en `main.tsx`.
- **Búsqueda EN**: la conclusión de que no encuentra citas en inglés se deduce de que `searchQuotes` indexa `quote.text` (ES) y metadatos ES (`quotes.ts:1743-1760`), no de una prueba en vivo.
- **Tap targets**: las medidas (h-9=36 px, h-8=32 px, etc.) provienen de las clases Tailwind; en pantallas con `dpr` distinto siguen siendo px CSS.
