import { useMemo } from 'react'
import type { Quote, Philosopher } from '@/types'
import { getPhilosopherById, getQuoteOfTheDay } from '@/data/quotes'

export function useQuoteOfDay(): { quote: Quote; philosopher: Philosopher | undefined } {
  const { quote, philosopher } = useMemo(() => {
    const q = getQuoteOfTheDay()
    return { quote: q, philosopher: getPhilosopherById(q.philosopherId) }
  }, [])
  return { quote, philosopher }
}
