import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { useApp } from '@/context/AppContext'
import { loadQuotes, type QuoteLocale } from '@/data/loadQuotes'

export interface QuotesContextValue {
  /** true cuando el corpus del locale actual está cargado y aplicado. */
  ready: boolean
  /** Error de carga del corpus, si lo hubo. */
  error: Error | null
}

const QuotesContext = createContext<QuotesContextValue | undefined>(undefined)

/**
 * Carga el corpus de citas del locale activo y expone su estado. El árbol que
 * dependa de las citas debe renderizarse sólo cuando `ready === true`
 * (ver `QuotesGate` en `App.tsx`).
 */
export function QuotesProvider({ children }: { children: ReactNode }) {
  const { locale } = useApp()
  const [loadedLocale, setLoadedLocale] = useState<QuoteLocale | null>(null)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let cancelled = false
    loadQuotes(locale)
      .then(() => {
        if (cancelled) return
        setLoadedLocale(locale)
        setError(null)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setError(err instanceof Error ? err : new Error(String(err)))
      })
    return () => {
      cancelled = true
    }
  }, [locale])

  const ready = loadedLocale === locale
  const value = useMemo<QuotesContextValue>(
    () => ({ ready, error }),
    [ready, error],
  )

  return (
    <QuotesContext.Provider value={value}>{children}</QuotesContext.Provider>
  )
}

export function useQuotes(): QuotesContextValue {
  const ctx = useContext(QuotesContext)
  if (!ctx) {
    throw new Error('useQuotes debe usarse dentro de un QuotesProvider')
  }
  return ctx
}
