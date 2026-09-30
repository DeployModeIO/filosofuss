import { useState } from 'react'
import { Link } from 'react-router-dom'
import { m } from 'framer-motion'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { quotes } from '@/data/quotes'
import { shuffle } from '@/lib/utils'
import Hero from '@/components/sections/Hero'
import QuoteOfDay from '@/components/quotes/QuoteOfDay'
import QuoteCard from '@/components/quotes/QuoteCard'
import type { Quote } from '@/types'
import { useApp } from '@/context/AppContext'

export default function Home() {
  const reduceMotion = usePrefersReducedMotion()
  const { t } = useApp()
  const featured = useState(() => shuffle(quotes).slice(0, 6))[0]

  return (
    <>
      <h1 className="sr-only">{t('hero.tagline')}</h1>
      <Hero />
      <QuoteOfDay />

      {/* Citas destacadas */}
      <m.section
        initial={reduceMotion ? false : { opacity: 0, y: 20 }}
        whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.5 }}
        className="relative mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 sm:py-24"
      >
        <m.header
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="text-xs font-semibold uppercase tracking-eyebrow text-accent">
            {t('home.featured.label')}
          </p>
          <h2 className="mt-3 font-display text-4xl text-content sm:text-5xl">
            {t('home.featured.titleA')}
            <span className="text-gradient-animated">{t('home.featured.titleB')}</span>
          </h2>
          <p className="mt-4 text-muted">
            {t('home.featured.subtitle')}
          </p>
        </m.header>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((quote: Quote, i: number) => (
            <QuoteCard key={quote.id} quote={quote} index={i} />
          ))}
        </div>
      </m.section>

      {/* CTA final */}
      <m.section
        initial={reduceMotion ? false : { opacity: 0, y: 20 }}
        whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.5 }}
        className="relative mx-auto flex w-full max-w-3xl flex-col items-center gap-4 px-5 py-16 text-center sm:flex-row sm:justify-center sm:px-8 sm:py-24"
      >
        <Link to="/explorar" className="btn-primary text-base">
          {t('home.exploreAll', { n: quotes.length })}
        </Link>
        <Link to="/filosofos" className="btn-ghost text-base">
          {t('home.meetPhilosophers')}
        </Link>
      </m.section>
    </>
  )
}
