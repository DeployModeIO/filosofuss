import { useState } from 'react'
import { motion, type Variants } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, ChevronDown, Quote, Sparkles, Users } from 'lucide-react'
import { getPhilosopherById, getRandomQuote } from '@/data/quotes'
import { useApp } from '@/context/AppContext'
import AnimatedQuote from '@/components/quotes/AnimatedQuote'

const reduceMotion =
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
}

const item: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
}

export default function Hero() {
  const { t } = useApp()
  const [featured] = useState(() => getRandomQuote())
  const philosopher = getPhilosopherById(featured.philosopherId)

  return (
    <section className="relative flex min-h-[92vh] w-full items-center justify-center overflow-hidden px-5 py-24 sm:px-8">
      {/* Elementos decorativos */}
      <Quote
        aria-hidden="true"
        className="pointer-events-none absolute left-[8%] top-[16%] h-24 w-24 rotate-12 text-accent/10 animate-float sm:h-32 sm:w-32"
      />
      <Quote
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[14%] right-[10%] h-28 w-28 -rotate-12 text-accent-2/10 animate-float-slow sm:h-40 sm:w-40"
      />
      <Sparkles
        aria-hidden="true"
        className="pointer-events-none absolute right-[20%] top-[24%] h-8 w-8 text-accent-3/40 animate-float-slow"
      />

      <motion.div
        variants={container}
        initial={reduceMotion ? 'show' : 'hidden'}
        animate="show"
        className="relative z-10 mx-auto flex max-w-4xl flex-col items-center text-center"
      >
        {/* Eyebrow — marca */}
        <motion.p
          variants={item}
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-line-soft bg-glass px-4 py-1.5 font-logo text-xs uppercase tracking-[0.3em] text-accent sm:text-sm"
        >
          <Sparkles className="h-4 w-4" />
          Filosofuss
        </motion.p>

        {/* Cita monumental */}
        <AnimatedQuote
          text={featured.text}
          className="font-serif text-3xl italic leading-snug text-content sm:text-5xl lg:text-6xl"
        />

        {/* Atribución */}
        <motion.div
          variants={item}
          className="mt-8 flex flex-col items-center gap-1"
        >
          {philosopher && (
            <>
              <span className="font-display text-xl text-accent sm:text-2xl">
                {philosopher.name}
              </span>
              <span className="text-sm text-muted">
                {philosopher.era} · {philosopher.school}
              </span>
            </>
          )}
        </motion.div>

        <motion.p
          variants={item}
          className="mt-6 max-w-xl font-serif text-base italic text-muted sm:text-lg"
        >
          {t('hero.subtitle')}
        </motion.p>

        {/* CTAs */}
        <motion.div
          variants={item}
          className="mt-10 flex flex-col items-center gap-4 sm:flex-row"
        >
          <Link to="/explorar" className="btn-primary text-base">
            {t('hero.exploreQuotes')}
            <ArrowRight className="h-5 w-5" />
          </Link>
          <Link to="/filosofos" className="btn-ghost text-base">
            <Users className="h-5 w-5" />
            {t('hero.meetPhilosophers')}
          </Link>
        </motion.div>
      </motion.div>

      {/* Indicador de scroll */}
      <div
        aria-hidden="true"
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2"
      >
        <span className="glass flex h-11 w-11 items-center justify-center rounded-full">
          <ChevronDown className="h-5 w-5 animate-float-slow text-accent" />
        </span>
      </div>
    </section>
  )
}

