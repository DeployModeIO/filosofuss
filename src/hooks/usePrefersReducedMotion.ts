import { useSyncExternalStore } from 'react'

const QUERY = '(prefers-reduced-motion: reduce)'

function getMediaQueryList(): MediaQueryList | null {
  if (
    typeof window === 'undefined' ||
    typeof window.matchMedia !== 'function'
  ) {
    return null
  }
  return window.matchMedia(QUERY)
}

// Un único `MediaQueryList` a nivel de módulo: es un objeto vivo, por lo que
// `.matches` se actualiza y emite `change` sin volver a crearlo (SSR-safe).
const mediaQueryList = getMediaQueryList()

function subscribe(onStoreChange: () => void): () => void {
  if (!mediaQueryList) return () => {}
  mediaQueryList.addEventListener('change', onStoreChange)
  return () => mediaQueryList.removeEventListener('change', onStoreChange)
}

function getSnapshot(): boolean {
  return mediaQueryList ? mediaQueryList.matches : false
}

function getServerSnapshot(): boolean {
  return false
}

/**
 * Devuelve `true` si el sistema pide movimiento reducido y **se actualiza en
 * vivo** cuando la preferencia cambia (Task B4 / COD-08, sustituye las
 * constantes de módulo que sólo leían `matchMedia` una vez).
 */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
