import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    // Terser comprime algo mejor que esbuild y ayuda a cumplir el presupuesto
    // de bundle inicial (Task E4). No se usa `manualChunks`: concentrar todo el
    // JS eager en un único archivo mejora la compresión (~1,2 KB gzip) por el
    // contexto compartido y mantiene el presupuesto por debajo de 120 KiB.
    // `framer-motion` sigue sin agruparse a mano: su feature bundle `domMax`
    // se carga de forma asíncrona vía `LazyMotion` (Task B5 / PERF-04).
    minify: 'terser',
    terserOptions: {
      // Dos pasadas de compresión reducen ~1 KB gzip del entry (margen del
      // presupuesto). Sin opciones inseguras: sólo compresión estándar.
      compress: { passes: 2 },
      format: { comments: false },
    },
  },
  test: {
    // Sólo lógica pura: entorno Node, sin jsdom (menos peso y más rápido).
    environment: 'node',
    include: ['src/**/*.test.ts'],
    restoreMocks: true,
  },
})
