import { useEffect, useState } from 'react'

export type ThemeMode = 'dark' | 'light' | 'paper'

// Lee el tema activo desde la clase de <html>: AppContext aplica `light` o
// `paper`; sin clase = dark. SSR-safe: sin `document` se asume dark.
export function readThemeMode(): ThemeMode {
  if (typeof document === 'undefined') return 'dark'
  const classes = document.documentElement.classList
  if (classes.contains('light')) return 'light'
  if (classes.contains('paper')) return 'paper'
  return 'dark'
}

/**
 * Tema observado sin acoplar los efectos al provider: un MutationObserver sobre
 * el atributo `class` de <html> notifica los cambios en vivo. Los efectos
 * (partículas, aurora, spotlight) lo usan para elegir paleta; se desconecta en
 * unmount.
 */
export function useDocumentTheme(): ThemeMode {
  const [mode, setMode] = useState<ThemeMode>(readThemeMode)
  useEffect(() => {
    if (typeof MutationObserver === 'undefined') return
    const observer = new MutationObserver(() => setMode(readThemeMode()))
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })
    return () => observer.disconnect()
  }, [])
  return mode
}
