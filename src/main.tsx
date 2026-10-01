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

// Capacitor inyecta el objeto global `window.Capacitor` ANTES de cargar el JS
// (lo hace el bridge nativo). Leerlo aquí no importa el runtime de Capacitor,
// así que el bundle eager de web no crece por plugins.
declare global {
  interface Window {
    Capacitor?: { isNativePlatform?: () => boolean }
  }
  interface WindowEventMap {
    /**
     * Evento cancelable que se emite al pulsar el botón físico "atrás" en
     * Android. Cualquier overlay (Zen, dialog, menú…) puede escucharlo,
     * cerrarse y llamar a `event.preventDefault()` para impedir que la app
     * salga. Contrato desacoplado: `src/main.tsx` no conoce el estado de los
     * overlays.
     */
    'filosofuss:back': CustomEvent<void>
  }
}

/**
 * Inicialización de la UI nativa. Todo el código de los plugins vive en
 * `await import()` dinámicos, así que Rollup lo emite en chunks asíncronos:
 * en web ni se descarga ni se ejecuta. Se re-comprueba `isNativePlatform()`
 * con el runtime real de Capacitor por si el global `window.Capacitor` no
 * fuese fiable. Esta función sólo se invoca bajo el gate nativo de abajo.
 */
async function initNativeUi(): Promise<void> {
  const { Capacitor } = await import('@capacitor/core')
  if (!Capacitor.isNativePlatform()) return

  const [{ StatusBar, Style }, { SplashScreen }, { App }] = await Promise.all([
    import('@capacitor/status-bar'),
    import('@capacitor/splash-screen'),
    import('@capacitor/app'),
  ])

  // Texto claro sobre fondo oscuro (dark mode de la app).
  await StatusBar.setStyle({ style: Style.Dark })

  // Back de Android: prioridad para la app vía evento cancelable. Si nadie lo
  // intercepta y hay un modal abierto, se cierra con Escape (los focus traps
  // compartidos de Zen/Dialog cerrar con Escape). Sólo si no queda nada abierto
  // se permite salir.
  const onBackButton = (): void => {
    const backEvent = new CustomEvent<void>('filosofuss:back', {
      cancelable: true,
    })
    // `dispatchEvent` devuelve `false` si algún listener llamó a
    // `preventDefault()`: en ese caso un overlay ya se ocupó del "atrás".
    if (!window.dispatchEvent(backEvent)) return
    if (document.querySelector('[role="dialog"]')) {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
      return
    }
    void App.exitApp()
  }

  await App.addListener('backButton', onBackButton)

  // Oculta el splash tras el primer paint posterior al render (app montada),
  // sin depender sólo del auto-hide.
  requestAnimationFrame(() =>
    requestAnimationFrame(() => {
      void SplashScreen.hide()
    }),
  )
}

// Gate nativo "gratis": sin Capacitor en `window` es `false` y no se importa
// nada. En web, por tanto, los plugins no se piden por red.
if (window.Capacitor?.isNativePlatform?.() === true) {
  void initNativeUi()
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
