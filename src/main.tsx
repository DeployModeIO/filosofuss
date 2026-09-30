import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)

// Capacitor expone `isNativePlatform()` en el objeto global `window.Capacitor`.
declare global {
  interface Window {
    Capacitor?: { isNativePlatform?: () => boolean }
  }
}

// Register service worker for offline support (PWA).
// Solo se registra en web servida por http(s) y nunca dentro de Capacitor
// nativo (`file://`/`capacitor://` no pueden registrar un SW).
const isNativePlatform = window.Capacitor?.isNativePlatform?.() === true
const isHttp = location.protocol === 'http:' || location.protocol === 'https:'

if ('serviceWorker' in navigator && !isNativePlatform && isHttp) {
  window.addEventListener('load', () => {
    // URL relativa derivada de la base de Vite (`base: './'`) para soportar
    // hosting en subruta; nunca una ruta absoluta hardcodeada.
    const swUrl = `${import.meta.env.BASE_URL}sw.js`
    navigator.serviceWorker.register(swUrl).catch((err) => {
      // Silencioso: la app sigue funcionando sin SW (solo sin offline).
      console.warn('No se pudo registrar el service worker:', err)
    })
  })
}
