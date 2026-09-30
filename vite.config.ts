import { defineConfig } from 'vite'
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
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          // `framer-motion` NO se agrupa a mano: si se fuerza un único chunk
          // estático, el feature bundle (domMax) no puede cargarse de forma
          // asíncrona y `LazyMotion` no aporta ahorro (Task B5 / PERF-04).
          icons: ['lucide-react'],
        },
      },
    },
  },
})
