/**
 * Loader diferido del feature bundle de Framer Motion (Task B5 / PERF-04).
 *
 * Al reexportar `domMax` desde un módulo que sólo se importa de forma dinámica,
 * Rollup coloca `domMax` (y sus dependencias: animations, gestures, drag y
 * layout) en un chunk asíncrono que no forma parte del bundle inicial.
 *
 * Se elige `domMax` (no `domAnimation`) porque la app usa animaciones de
 * `layout`/`layoutId` (`Favorites.tsx`, `ThemeToggle.tsx`), que sólo están
 * presentes en el bundle máximo.
 */
export { domMax as motionFeatures } from 'framer-motion'
