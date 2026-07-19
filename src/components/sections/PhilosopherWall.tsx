import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, Calendar, MapPin, X } from 'lucide-react'
import { philosophers } from '@/data/philosophers'
import { getQuotesByPhilosopher } from '@/data/quotes'
import type { Philosopher } from '@/types'
import { cn, formatYear, hashCode } from '@/lib/utils'
import QuoteCard from '@/components/quotes/QuoteCard'

const reduceMotion =
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

const GRADIENTS = [
  'from-accent to-accent-2',
  'from-accent-2 to-accent-3',
  'from-accent-3 to-accent',
  'from-accent to-accent-3',
]

const CONNECTORS = new Set(['y', 'de', 'del', 'la', 'el', 'da', 'di', 'le'])

function initials(name: string): string {
  const cleaned = name.replace(/\(.*?\)/g, '').trim()
  const parts = cleaned
    .split(/[\s-]+/)
    .filter((p) => p.length > 0 && !CONNECTORS.has(p.toLowerCase()))
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (
    parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
  ).toUpperCase()
}

function gradientFor(id: string): string {
  return GRADIENTS[Math.abs(hashCode(id)) % GRADIENTS.length]
}

export default function PhilosopherWall() {
  const [selected, setSelected] = useState<Philosopher | null>(null)

  useEffect(() => {
    if (!selected) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelected(null)
    }
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [selected])

  const selectedQuotes = selected ? getQuotesByPhilosopher(selected.id) : []

  return (
    <section className="relative mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
      <motion.header
        initial={reduceMotion ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mx-auto max-w-2xl text-center"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
          Panteón
        </p>
        <h2 className="mt-3 font-display text-4xl text-content sm:text-5xl">
          Los <span className="text-gradient-animated">filósofos</span>
        </h2>
        <p className="mt-4 text-muted">
          {philosophers.length} pensadores que modelaron la historia de las
          ideas. Pulsa cualquiera para conocer su obra.
        </p>
      </motion.header>

      <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
        {philosophers.map((p, i) => {
          const count = getQuotesByPhilosopher(p.id).length
          return (
            <motion.button
              key={p.id}
              type="button"
              onClick={() => setSelected(p)}
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: Math.min(i * 0.03, 0.4) }}
              className="glass card-hover group flex flex-col items-center gap-3 rounded-2xl p-5 text-center sm:p-6"
            >
              <span
                className={cn(
                  'flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br text-xl font-semibold text-[#0a0a12] shadow-glow transition-transform duration-300 group-hover:scale-105',
                  gradientFor(p.id),
                )}
              >
                {initials(p.name)}
              </span>
              <span className="flex flex-col gap-1">
                <span className="font-display text-base text-content sm:text-lg">
                  {p.name}
                </span>
                <span className="text-xs text-muted">
                  {p.era} · {p.school}
                </span>
              </span>
              <span className="text-xs font-medium text-accent">
                {count} {count === 1 ? 'cita' : 'citas'}
              </span>
            </motion.button>
          )
        })}
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.2 }}
          >
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setSelected(null)}
              aria-hidden="true"
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={`Ficha de ${selected.fullName}`}
              className="glass-strong relative z-10 max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-3xl p-6 shadow-card sm:p-8"
              initial={
                reduceMotion ? false : { opacity: 0, y: 24, scale: 0.97 }
              }
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={
                reduceMotion ? undefined : { opacity: 0, y: 24, scale: 0.97 }
              }
              transition={{ duration: reduceMotion ? 0 : 0.25, ease: 'easeOut' }}
            >
              <button
                type="button"
                onClick={() => setSelected(null)}
                aria-label="Cerrar"
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
                  {initials(selected.name)}
                </span>
                <div className="flex flex-col gap-2">
                  <h3 className="font-display text-2xl text-content sm:text-3xl">
                    {selected.fullName}
                  </h3>
                  <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm text-muted sm:justify-start">
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar className="h-4 w-4 text-accent" />
                      {formatYear(selected.birthYear)} –{' '}
                      {formatYear(selected.deathYear)}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="h-4 w-4 text-accent" />
                      {selected.nationality}
                    </span>
                  </div>
                  <p className="text-sm text-accent">
                    {selected.era} · {selected.school}
                  </p>
                </div>
              </div>

              <p className="mt-6 leading-relaxed text-muted">{selected.bio}</p>

              <div className="mt-8 flex flex-col gap-3">
                <h4 className="inline-flex items-center gap-2 font-display text-lg text-content">
                  <BookOpen className="h-5 w-5 text-accent" />
                  Citas ({selectedQuotes.length})
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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
