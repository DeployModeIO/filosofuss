<div align="center">

# 🏛️ Filosofuss

### *"Donde la sabiduría eterna cobra vida."*

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white&style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white&style=flat-square)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white&style=flat-square)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v3-06B6D4?logo=tailwindcss&logoColor=white&style=flat-square)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-11-FF0066?logo=framer&logoColor=white&style=flat-square)
![Licencia](https://img.shields.io/badge/Licencia-MIT-22C55E?style=flat-square)
![Citas](https://img.shields.io/badge/Citas-226-8B5CF6?style=flat-square)
![Filósofos](https://img.shields.io/badge/Filósofos-37-F59E0B?style=flat-square)

</div>

---

## ✨ Introducción

**Filosofuss** es una aplicación web moderna de página única (*single-page application*) que presenta una colección curada de **226 citas filosóficas** pertenecientes a **37 filósofos célebres**, abarcando eras que van desde la **Antigua Grecia** hasta el pensamiento **Contemporáneo**.

Toda la interfaz y el contenido están en **español (castellano)**. El proyecto ha sido diseñado con una estética *dark-first*, animaciones fluidas y una marcada atención a la accesibilidad y el detalle, con el objetivo de hacer que la sabiduría milenaria respire en un entorno digital contemporáneo.

---

## 🌟 Características

| | Característica | Descripción |
|---|---|---|
| 🏛️ | **Hero animado** | Landing con tipografía animada y fondo dinámico (aurora + partículas + textura de grano). |
| 🎴 | **Tarjetas glassmorphism** | Citas con efecto vidrio, borde con degradado, inclinación **3D tilt** al pasar el cursor y micro-interacciones. |
| ⭐ | **Favoritos persistentes** | Almacenados en `localStorage` con contador en vivo en la barra de navegación. |
| 🔍 | **Buscador en tiempo real** | Insensible a mayúsculas y acentos. Busca en texto, autor, escuela, era, obra y temas, con *debounce*. |
| 🧭 | **Filtros por chips** | Filtrado por **Era**, **Escuela** y **Tema** mediante chips seleccionables. |
| 📅 | **Cita del día** | Determinista: cambia cada día calendario de forma automática. |
| 👥 | **Muro de filósofos** | Galería con **modal de detalle**: biografía, fechas y todas sus citas. |
| 🌗 | **Modo claro/oscuro** | Transición suave; respeta `prefers-color-scheme` del sistema. |
| ♿ | **Accesibilidad** | Respeta `prefers-reduced-motion`, foco visible, navegación por teclado (**Esc** cierra el modal) y `aria-labels`. |
| 📱 | **Totalmente responsive** | Diseño adaptativo de móvil a escritorio. |
| 📋 | **Acciones por cita** | **Copiar** al portapapeles y **compartir** (Web Share API con *fallback*). |

---

## 🛠️ Tecnologías

| Tecnología | Versión | Uso en el proyecto |
|---|:---:|---|
| **Vite** | 5 | Bundler y servidor de desarrollo ultrarrápido. |
| **React** | 18 | Librería principal de UI. |
| **TypeScript** | 5 | Tipado estático y seguridad en tiempo de compilación. |
| **Tailwind CSS** | v3 | Sistema de diseño personalizado (*dark-first* con *toggle* a claro). |
| **Framer Motion** | 11 | Animaciones, *3D tilt* y transiciones de página. |
| **lucide-react** | — | Conjunto de iconos limpio y consistente. |
| **react-router-dom** | v6 | Enrutado de la SPA. |
| **localStorage API** | — | Persistencia de favoritos y del tema. |

**Rutas disponibles:** `/`, `/explorar`, `/filosofos`, `/favoritos`

---

## 📂 Estructura del proyecto

```text
Filosofuss/
├── index.html
├── package.json
├── tailwind.config.js
├── postcss.config.js
├── vite.config.ts
├── tsconfig.json / tsconfig.node.json
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── index.css            # Sistema de diseño
    ├── types.ts
    ├── data/
    │   ├── philosophers.ts  # 37 filósofos
    │   └── quotes.ts        # 226 citas + helpers (búsqueda, cita del día, etc.)
    ├── lib/
    │   ├── utils.ts         # cn, shuffle, formatYear, hashCode...
    │   └── storage.ts       # localStorage seguro + useLocalStorage
    ├── context/
    │   └── AppContext.tsx   # Tema + favoritos globales
    ├── hooks/
    │   ├── useTheme.ts
    │   └── useQuoteOfDay.ts
    ├── components/
    │   ├── effects/         # AuroraBackground, ParticleField, NoiseOverlay, SceneBackground
    │   ├── ui/              # Navbar, Footer, Logo, ThemeToggle, ScrollToTop
    │   ├── controls/        # SearchBar, FilterPanel
    │   ├── quotes/          # QuoteCard, QuoteOfDay
    │   └── sections/        # Hero, BrowseQuotes, PhilosopherWall, Favorites
    └── pages/
        └── Home.tsx
```

---

## 🚀 Instalación y uso

> **Requisitos:** Node.js **20+** y npm **10+**. En este equipo, Node.js se encuentra en `E:\nodejs`.

```bash
# 1. Entrar en la carpeta del proyecto
cd E:\Filosofuss

# 2. Instalar dependencias (requiere Node.js 20+ / npm 10+)
npm install

# 3. Servidor de desarrollo (http://localhost:5173)
npm run dev

# 4. Compilar para producción
npm run build

# 5. Previsualizar el build
npm run preview
```

<details>
<summary>🖥️ Notas para Windows / PowerShell</summary>

Si `npm` no está en el `PATH`, invoca el ejecutable directamente desde su ruta:

```powershell
# Ejemplos usando la ruta completa
E:\nodejs\npm.cmd install
E:\nodejs\npm.cmd run dev
```

> ⏳ La **primera** ejecución de `npm install` puede tardar un par de minutos mientras se descargan e instalan todas las dependencias.

</details>

---

## 🎨 Filosofía de diseño

Filosofuss nace de la convicción de que la profundidad del pensamiento merece un recipiente a su altura. Por ello se apoya en cuatro pilares:

- 🌑 **Dark-first** — El modo oscuro es la identidad base; el claro se ofrece como alternativa igualmente cuidada.
- 🪟 **Glassmorphism** — Superposiciones translúcidas con borde degradado que aportan profundidad y elegancia.
- 🎞️ **Animaciones profesionales** — Movimientos intencionales y nunca gratuitos: *3D tilt*, transiciones de página y micro-interacciones guiadas por Framer Motion.
- ♿ **Accesibilidad primero** — Cada decisión visual se contrasta con el respeto a `prefers-reduced-motion`, un foco visible y la navegación completa por teclado.

---

## 🧩 Personalización

### Añadir una nueva cita

Edita el archivo **`src/data/quotes.ts`** y agrega un objeto con la siguiente forma:

```ts
{
  id: "cita-unica",          // identificador único (string)
  text: "El texto de la cita...",
  philosopherId: "socrates", // debe existir en src/data/philosophers.ts
  tags: ["ética", "razón"],  // temas asociados (usados por filtros y búsqueda)
  source?: "Obra, capítulo"  // opcional: obra de referencia
}
```

> ⚠️ **Importante:** El valor de `philosopherId` debe corresponder con un filósofo registrado en **`src/data/philosophers.ts`**. Para añadir un autor nuevo, crea primero su entrada en ese archivo (con nombre, fechas, escuela, era y biografía) y luego enlázalo desde la cita.

---

## 🙏 Créditos

Las **citas** pertenecen a sus respectivos **autores** y herederos. Filosofuss es un proyecto **educativo y sin ánimo de lucro**, concebido para difundir y acercar el pensamiento filosófico al público hispanohablante.

---

## 📄 Licencia

Distribuido bajo la licencia **MIT**. Consulta el archivo `LICENSE` para más detalles.

---

<div align="center">

*«Solo sé que no sé nada.» — Sócrates*

**🏛️ Filosofuss** — *Donde la sabiduría eterna cobra vida.*

</div>

<!-- redeploy i18n completo -->
