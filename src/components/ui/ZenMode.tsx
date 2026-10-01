import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { m, useScroll, useTransform } from 'framer-motion'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
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
import { localizePhilosopher } from '@/data/philosophers'
import { useLocalStorage } from '@/lib/storage'
import { cn } from '@/lib/utils'
import Dialog from '@/components/ui/Dialog'

const MAX_SIZE = 5

// Guardas de forma para las preferencias de lectura persistidas (COD-04).
const isSize = (v: unknown): v is number =>
  typeof v === 'number' && Number.isInteger(v) && v >= 0 && v <= MAX_SIZE
const isBoolean = (v: unknown): v is boolean => typeof v === 'boolean'

/**
 * Scrollable quote area with a subtle parallax shift (±12 px total, §3.3).
 * It is mounted only while a quote is open, so `useScroll` always finds its
 * container. Reduced motion leaves `y` untouched.
 */
function ParallaxQuote({
  reduceMotion,
  children,
}: {
  reduceMotion: boolean
  children: ReactNode
}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ container: scrollRef })
  const parallaxY = useTransform(scrollYProgress, [0, 1], [6, -6])
  return (
    <div
      ref={scrollRef}
      className="flex flex-1 items-center justify-center overflow-y-auto px-6 py-8"
    >
      <m.div
        style={reduceMotion ? {} : { y: parallaxY }}
        className="mx-auto flex max-w-3xl flex-col items-center text-center [will-change:transform]"
      >
        {children}
      </m.div>
    </div>
  )
}

export default function ZenMode() {
  const reduceMotion = usePrefersReducedMotion()
  const { zenQuoteId, closeZen, openZen, t, locale } = useApp()
  const { activeQuoteId, isNarrating, toggle } = useNarration()
  const [size, setSize] = useLocalStorage<number>('filosofuss:zen:size', 2, isSize)
  const [serif, setSerif] = useLocalStorage<boolean>('filosofuss:zen:serif', true, isBoolean)
  const history = useRef<string[]>([])

  const quote = zenQuoteId ? getQuoteById(zenQuoteId) : undefined
  const phil = quote ? getPhilosopherById(quote.philosopherId) : undefined
  const display = phil ? localizePhilosopher(phil, locale) : undefined

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
      if (e.key === 'ArrowRight') next()
      else if (e.key === 'ArrowLeft') prev()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quote, openZen])

  const narratingThis = isNarrating && activeQuoteId === quote?.id
  const fontSize = `${1.25 + size * 0.3}rem`

  return (
    <Dialog
      open={quote !== undefined}
      onClose={closeZen}
      variant="fullscreen"
      labelledBy="zen-title"
      className="text-content pt-0 pb-0"
    >
      {quote && (
        <>
          {/* Barra superior */}
          <div className="flex items-center justify-between px-5 pb-4 pt-[max(1rem,env(safe-area-inset-top))] sm:px-8">
            <span
              id="zen-title"
              className="font-sans text-xs font-semibold uppercase tracking-[0.3em] text-accent"
            >
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

          {/* Cita centrada + parallax */}
          <ParallaxQuote reduceMotion={reduceMotion}>
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
              {display && (
                <>
                  <span className="font-display text-xl text-accent">{display.name}</span>
                  <span className="text-sm text-muted">
                    {display.era} · {display.school}
                  </span>
                </>
              )}
              {quote.source && (
                <span className="text-xs italic text-muted">
                  — {getQuoteSource(quote, locale)}
                </span>
              )}
            </div>
          </ParallaxQuote>

          {/* Barra inferior de controles */}
          <div className="flex flex-wrap items-center justify-center gap-2 px-5 pt-5 pb-[max(1rem,env(safe-area-inset-bottom))] sm:gap-3 sm:px-8">
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
        </>
      )}
    </Dialog>
  )
}
