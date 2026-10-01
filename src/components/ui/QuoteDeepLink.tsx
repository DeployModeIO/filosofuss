import { useEffect } from 'react'
import { useApp } from '@/context/AppContext'
import { useQuotes } from '@/context/QuotesContext'
import { getQuoteById } from '@/data/quotes'

/**
 * Reconoce el deep link `?cita=<id>` al cargar y abre esa cita en modo
 * lectura (con su audio). Permite que un enlace compartido aterrice
 * directamente sobre la cita concreta.
 */
export default function QuoteDeepLink() {
  const { openZen } = useApp()
  const { ready } = useQuotes()

  useEffect(() => {
    if (!ready) return
    const params = new URLSearchParams(window.location.search)
    const id = params.get('cita')
    if (id && getQuoteById(id)) {
      openZen(id)
      const url = new URL(window.location.href)
      url.searchParams.delete('cita')
      window.history.replaceState({}, '', url.toString())
    }
  }, [openZen, ready])

  return null
}
