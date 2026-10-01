import { useMemo, useState } from 'react'
import { m } from 'framer-motion'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { BookOpen, Calendar, MapPin, X } from 'lucide-react'
import { localizePhilosopher, philosophers } from '@/data/philosophers'
import { getQuotesByPhilosopher } from '@/data/quotes'
import type { Philosopher, Quote } from '@/types'
import { cn, formatYear, hashCode, initials } from '@/lib/utils'
import { revealContainer, revealItem } from '@/lib/variants'
import { useApp } from '@/context/AppContext'
import QuoteCard from '@/components/quotes/QuoteCard'
import Dialog from '@/components/ui/Dialog'

const GRADIENTS = [
  'from-accent to-accent-2',
  'from-accent-2 to-accent-3',
  'from-accent-3 to-accent',
  'from-accent to-accent-3',
] as const

const DEFAULT_GRADIENT = GRADIENTS[0]

function gradientFor(id: string): string {
  return GRADIENTS[Math.abs(hashCode(id)) % GRADIENTS.length] ?? DEFAULT_GRADIENT
}

export default function PhilosopherWall() {
  const reduceMotion = usePrefersReducedMotion()
  const { t, locale } = useApp()
  const [selected, setSelected] = useState<Philosopher | null>(null)
  const selectedDisplay = selected
    ? localizePhilosopher(selected, locale)
    : undefined

  // Mapa id → citas precomputado una sola vez (Task B6), en lugar de filtrar
  // el corpus por cada filósofo en cada render.
  const quotesByPhilosopher = useMemo<Map<string, Quote[]>>(() => {
    const map = new Map<string, Quote[]>()
    for (const p of philosophers) map.set(p.id, getQuotesByPhilosopher(p.id))
    return map
  }, [])

  const selectedQuotes = selected
    ? quotesByPhilosopher.get(selected.id) ?? []
    : []

  return (
    <section className="relative mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
      <m.div
        variants={reduceMotion ? {} : revealContainer}
        whileInView={reduceMotion ? {} : 'show'}
        initial={reduceMotion ? false : 'hidden'}
        viewport={{ once: true, amount: 0.25 }}
      >
        <m.header
          variants={reduceMotion ? {} : revealItem}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            {t('wall.label')}
          </p>
          <h1 className="mt-3 font-display text-4xl text-content sm:text-5xl">
            {t('wall.titleA')}
            <span className="text-gradient-animated">{t('wall.titleB')}</span>
          </h1>
          <p className="mt-4 text-muted">
            {t('wall.subtitle', { n: philosophers.length })}
          </p>
        </m.header>

        {/* El muro entra como un único nodo: sin fade-up por tarjeta (§3.2). */}
        <m.div
          variants={reduceMotion ? {} : revealItem}
          className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4"
        >
          {philosophers.map((p) => {
            const count = quotesByPhilosopher.get(p.id)?.length ?? 0
            const display = localizePhilosopher(p, locale)
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelected(p)}
                className="glass card-hover group flex flex-col items-center gap-3 rounded-2xl p-5 text-center sm:p-6"
              >
                <span
                  className={cn(
                    'flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br text-xl font-semibold text-[#0a0a12] shadow-glow transition-transform duration-300 group-hover:scale-105',
                    gradientFor(p.id),
                  )}
                >
                  {initials(display.name)}
                </span>
                <span className="flex flex-col gap-1">
                  <span className="font-display text-base text-content sm:text-lg">
                    {display.name}
                  </span>
                  <span className="text-xs text-muted">
                    {display.era} · {display.school}
                  </span>
                </span>
                <span className="text-xs font-medium text-accent">
                  {count} {count === 1 ? t('wall.quote') : t('wall.quotes')}
                </span>
              </button>
            )
          })}
        </m.div>
      </m.div>

      <Dialog
        open={selected !== null}
        onClose={() => setSelected(null)}
        labelledBy="philosopher-sheet-title"
        variant="modal"
      >
        {selected && (
          <div className="relative p-6 sm:p-8">
            <button
              type="button"
              onClick={() => setSelected(null)}
              aria-label={t('wall.close')}
              className="glass absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:text-content"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-start sm:text-left">
              <span
                className={cn(
                  'flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-2xl font-semibold text-[#0a0a12] shadow-glow',
                  gradientFor(selected.id),
                )}
              >
                {initials(selectedDisplay?.name ?? selected.name)}
              </span>
              <div className="flex flex-col gap-2">
                <h3
                  id="philosopher-sheet-title"
                  className="font-display text-2xl text-content sm:text-3xl"
                >
                  {selectedDisplay?.fullName ?? selected.fullName}
                </h3>
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm text-muted sm:justify-start">
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-accent" />
                    {formatYear(selected.birthYear, locale)} –{' '}
                    {formatYear(selected.deathYear, locale)}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-accent" />
                    {selectedDisplay?.nationality ?? selected.nationality}
                  </span>
                </div>
                <p className="text-sm text-accent">
                  {selectedDisplay?.era ?? selected.era} ·{' '}
                  {selectedDisplay?.school ?? selected.school}
                </p>
              </div>
            </div>

            <p className="mt-6 leading-relaxed text-muted">
              {selectedDisplay?.bio ?? selected.bio}
            </p>

            <div className="mt-8 flex flex-col gap-3">
              <h4 className="inline-flex items-center gap-2 font-display text-lg text-content">
                <BookOpen className="h-5 w-5 text-accent" />
                {t('wall.quotesCount', { n: selectedQuotes.length })}
              </h4>
              <div className="flex flex-col gap-3">
                {selectedQuotes.map((q, i) => (
                  <QuoteCard
                    key={q.id}
                    quote={q}
                    philosopher={selected}
                    variant="compact"
                    index={i}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </Dialog>
    </section>
  )
}
