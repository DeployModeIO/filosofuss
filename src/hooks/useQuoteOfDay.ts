import { useCallback, useMemo, useState } from 'react'
import type { Quote, Philosopher } from '@/types'
import { getPhilosopherById, getQuoteOfTheDay, getRandomQuote } from '@/data/quotes'

export function useQuoteOfDay(): { quote: Quote; philosopher: Philosopher | undefined } {
  const { quote, philosopher } = useMemo(() => {
    const q = getQuoteOfTheDay()
    return { quote: q, philosopher: getPhilosopherById(q.philosopherId) }
  }, [])
  return { quote, philosopher }
}

export function useRandomQuote(): {
  quote: Quote
  philosopher: Philosopher | undefined
  refresh: () => void
} {
  const [quote, setQuote] = useState<Quote>(() => getRandomQuote())
  const philosopher = useMemo(
    () => getPhilosopherById(quote.philosopherId),
    [quote],
  )
  const refresh = useCallback(() => {
    setQuote((prev) => getRandomQuote(prev.id))
  }, [])
  return { quote, philosopher, refresh }
}
