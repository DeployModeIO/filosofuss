import { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
  Type,
  Volume2,
  Square,
  X,
} from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { useNarration } from '@/context/NarrationContext'
import {
  getQuoteById,
  getPhilosopherById,
  getQuoteSource,
  getQuoteText,
  getRandomQuote,
} from '@/data/quotes'
import { useLocalStorage } from '@/lib/storage'
import { cn } from '@/lib/utils'

const reduceMotion =
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

const MAX_SIZE = 5

export default function ZenMode() {
  const { zenQuoteId, closeZen, openZen, t, locale } = useApp()
  const { activeQuoteId, isNarrating, toggle } = useNarration()
  const [size, setSize] = useLocalStorage<number>('filosofuss:zen:size', 2)
  const [serif, setSerif] = useLocalStorage<boolean>('filosofuss:zen:serif', true)
  const history = useRef<string[]>([])

  const quote = zenQuoteId ? getQuoteById(zenQuoteId) : undefined
  const phil = quote ? getPhilosopherById(quote.philosopherId) : undefined

  const next = () => {
    if (!quote) return
    history.current.push(quote.id)
    openZen(getRandomQuote(quote.id).id)
  }

  const prev = () => {
    const last = history.current.pop()
    if (last) openZen(last)
  }

  useEffect(() => {
    if (!quote) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeZen()
      else if (e.key === 'ArrowRight') next()
      else if (e.key === 'ArrowLeft') prev()
    }
    window.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quote, closeZen, openZen])

  const narratingThis = isNarrating && activeQuoteId === quote?.id
  const fontSize = `${1.25 + size * 0.3}rem`

  return (
    <AnimatePresence>
      {quote && (
        <motion.div
          key="zen"
          role="dialog"
          aria-modal="true"
          aria-label={t('zen.label')}
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduceMotion ? undefined : { opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[60] flex flex-col bg-[var(--bg)]"
        >
          {/* Barra superior */}
          <div className="flex items-center justify-between px-5 py-4 sm:px-8">
            <span className="font-sans text-xs font-semibold uppercase tracking-[0.3em] text-accent">
              {t('zen.label')}
            </span>
            <button
              type="button"
              onClick={closeZen}
              aria-label={t('zen.close')}
              title={t('zen.close')}
              className="glass grid h-10 w-10 place-items-center rounded-full text-muted transition-colors hover:text-content"
            >
              <X size={18} aria-hidden="true" />
            </button>
          </div>
          {/* Cita centrada */}
          <div className="flex flex-1 items-center justify-center overflow-y-auto px-6 py-8">
            <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
              <blockquote
                className={cn(
                  'leading-relaxed text-content',
                  serif ? 'font-serif italic' : 'font-sans',
                )}
                style={{ fontSize }}
              >
                {getQuoteText(quote, locale)}
              </blockquote>

              <div className="mt-8 flex flex-col items-center gap-1.5">
                {phil && (
                  <>
                    <span className="font-display text-xl text-accent">{phil.name}</span>
                    <span className="text-sm text-muted">
                      {phil.era} · {phil.school}
                    </span>
                  </>
                )}
                {quote.source && (
                  <span className="text-xs italic text-muted">
                    — {getQuoteSource(quote, locale)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Barra inferior de controles */}
          <div className="flex flex-wrap items-center justify-center gap-2 px-5 py-5 sm:gap-3 sm:px-8">
            <button
              type="button"
              onClick={prev}
              aria-label={t('zen.prev')}
              title={t('zen.prev')}
              className="glass grid h-11 w-11 place-items-center rounded-full text-muted transition-colors hover:text-accent"
            >
              <ChevronLeft size={18} aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={() => toggle(quote.id)}
              aria-label={narratingThis ? t('zen.stop') : t('zen.listen')}
              title={narratingThis ? t('zen.stop') : t('zen.listen')}
              className={cn(
                'glass grid h-11 w-11 place-items-center rounded-full transition-colors hover:text-accent',
                narratingThis ? 'text-accent' : 'text-muted',
              )}
            >
              {narratingThis ? (
                <Square size={18} aria-hidden="true" />
              ) : (
                <Volume2 size={18} aria-hidden="true" />
              )}
            </button>

            <button
              type="button"
              onClick={next}
              aria-label={t('zen.next')}
              title={t('zen.next')}
              className="glass grid h-11 w-11 place-items-center rounded-full text-muted transition-colors hover:text-accent"
            >
              <ChevronRight size={18} aria-hidden="true" />
            </button>

            <span className="mx-1 hidden h-6 w-px bg-line-soft sm:block" aria-hidden="true" />

            <button
              type="button"
              onClick={() => setSize(Math.max(0, size - 1))}
              aria-label={t('zen.fontSmaller')}
              title={t('zen.fontSmaller')}
              disabled={size <= 0}
              className="glass grid h-11 w-11 place-items-center rounded-full text-muted transition-colors hover:text-accent disabled:opacity-40"
            >
              <Minus size={18} aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={() => setSize(Math.min(MAX_SIZE, size + 1))}
              aria-label={t('zen.fontLarger')}
              title={t('zen.fontLarger')}
              disabled={size >= MAX_SIZE}
              className="glass grid h-11 w-11 place-items-center rounded-full text-muted transition-colors hover:text-accent disabled:opacity-40"
            >
              <Plus size={18} aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={() => setSerif(!serif)}
              aria-label={t('zen.serif')}
              title={t('zen.serif')}
              aria-pressed={serif}
              className={cn(
                'glass grid h-11 w-11 place-items-center rounded-full transition-colors hover:text-accent',
                serif ? 'text-accent' : 'text-muted',
              )}
            >
              <Type size={18} aria-hidden="true" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
