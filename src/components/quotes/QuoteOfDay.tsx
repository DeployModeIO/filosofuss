import { Link } from 'react-router-dom'
import { motion, type Variants } from 'framer-motion'
import { Quote as QuoteIcon, Volume2, Square } from 'lucide-react'
import { useQuoteOfDay } from '@/hooks/useQuoteOfDay'
import { formatYear } from '@/lib/utils'
import { useNarration } from '@/context/NarrationContext'

const prefersReducedMotion =
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

const container: Variants = prefersReducedMotion
  ? { hidden: {}, show: {} }
  : {
      hidden: {},
      show: { transition: { staggerChildren: 0.04, delayChildren: 0.1 } },
    }

const word: Variants = prefersReducedMotion
  ? { hidden: { opacity: 1, y: 0 }, show: { opacity: 1, y: 0 } }
  : {
      hidden: { opacity: 0, y: 12 },
      show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
    }

export default function QuoteOfDay() {
  const { quote, philosopher } = useQuoteOfDay()
  const { activeQuoteId, isNarrating, toggle } = useNarration()
  const narratingThis = isNarrating && activeQuoteId === quote.id
  const words = quote.text.split(' ')

  return (
    <section className="relative mx-auto flex w-full max-w-3xl flex-col items-center overflow-hidden px-4 py-16 text-center sm:py-24">
      {/* Decorative rotating rings */}
      <div
        aria-hidden="true"
        className="animate-spin-slow pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[24rem] w-[24rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-line-soft opacity-40 sm:h-[32rem] sm:w-[32rem]"
      />
      <div
        aria-hidden="true"
        className="animate-spin-slow pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[16rem] w-[16rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-line opacity-30 sm:h-[22rem] sm:w-[22rem]"
      />

      {/* Floating quotation marks */}
      <QuoteIcon
        aria-hidden="true"
        className="animate-float pointer-events-none absolute left-1 top-6 h-14 w-14 text-accent opacity-20 sm:left-4 sm:h-20 sm:w-20"
      />
      <QuoteIcon
        aria-hidden="true"
        className="animate-float-slow pointer-events-none absolute right-1 top-6 h-14 w-14 rotate-180 text-accent-2 opacity-20 sm:right-4 sm:h-20 sm:w-20"
      />

      {/* Label */}
      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0, y: -8 }}
        animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 mb-8 flex items-center gap-3"
      >
        <span
          aria-hidden="true"
          className="h-px w-8 bg-gradient-to-r from-transparent to-accent"
        />
        <span className="font-sans text-xs font-semibold uppercase tracking-[0.3em] text-accent">
          Cita del día
        </span>
        <span
          aria-hidden="true"
          className="h-px w-8 bg-gradient-to-l from-transparent to-accent"
        />
      </motion.div>

      {/* Quote text — word stagger reveal */}
      <motion.blockquote
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 font-serif text-3xl italic leading-snug text-content sm:text-5xl"
      >
        {words.map((w, i) => (
          <motion.span
            key={`${i}-${w}`}
            variants={word}
            className="mr-[0.25em] inline-block"
          >
            {i === 0 ? `“${w}` : i === words.length - 1 ? `${w}”` : w}
          </motion.span>
        ))}
      </motion.blockquote>

      {/* Attribution */}
      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
        animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="relative z-10 mt-8 flex flex-col items-center gap-1"
      >
        <span className="font-display text-xl text-accent">
          {philosopher?.name ?? 'Anónimo'}
        </span>
        {philosopher && (
          <span className="text-sm text-muted">
            {philosopher.era} · {philosopher.school} · {formatYear(philosopher.birthYear)}–
            {formatYear(philosopher.deathYear)}
          </span>
        )}
        {quote.source && <span className="text-xs italic text-muted">— {quote.source}</span>}
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
        animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="relative z-10 mt-10"
      >
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link to="/explorar" className="btn-primary">
            Explorar más sabiduría
          </Link>
          <button
            type="button"
            onClick={() => toggle(quote.id)}
            aria-label={narratingThis ? 'Detener narración' : 'Escuchar la cita del día'}
            className="btn-ghost inline-flex items-center gap-2"
          >
            {narratingThis ? <Square size={18} aria-hidden="true" /> : <Volume2 size={18} aria-hidden="true" />}
            {narratingThis ? 'Detener' : 'Escuchar'}
          </button>
        </div>
      </motion.div>
    </section>
  )
}
