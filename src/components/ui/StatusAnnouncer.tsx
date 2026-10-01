import { useEffect, useRef, useSyncExternalStore } from 'react'

interface Announcement {
  message: string
  seq: number
}

/**
 * Store de módulo para anuncios accesibles (Task C8 / A10). Evita re-renderizar
 * el árbol: sólo `StatusAnnouncer` (y ningún otro consumidor) se suscribe.
 */
let current: Announcement = { message: '', seq: 0 }
const listeners = new Set<() => void>()

/**
 * Publica un mensaje en la región `aria-live="polite"`. Pasa el texto YA
 * traducido (normalmente `t('status.*')`, ver `strings.ts`).
 *
 * ```ts
 * announce(t('status.copied'))
 * ```
 */
export function announce(message: string): void {
  if (!message) return
  current = { message, seq: current.seq + 1 }
  for (const listener of listeners) listener()
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function getSnapshot(): Announcement {
  return current
}

/**
 * Región `aria-live="polite"` visualmente oculta. Se monta UNA vez en
 * `App.tsx`. El texto se escribe directamente en el nodo (no vía React) y se
 * limpia antes de cada anuncio para que los lectores de pantalla repitan
 * incluso mensajes idénticos consecutivos.
 */
export function StatusAnnouncer() {
  const { message, seq } = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (seq === 0) return
    const node = ref.current
    if (!node) return
    node.textContent = ''
    const id = window.setTimeout(() => {
      node.textContent = message
    }, 50)
    return () => window.clearTimeout(id)
  }, [message, seq])

  return (
    <div
      ref={ref}
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    />
  )
}
