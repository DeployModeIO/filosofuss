import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { quotes } from '@/data/quotes'
import { shuffle } from '@/lib/utils'
import Hero from '@/components/sections/Hero'
import QuoteOfDay from '@/components/quotes/QuoteOfDay'
import QuoteCard from '@/components/quotes/QuoteCard'
import type { Quote } from '@/types'

const reduceMotion =
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

export default function Home() {
  const featured = useState(() => shuffle(quotes).slice(0, 6))[0]

  return (
    <>
      <Hero />
      <QuoteOfDay />

      {/* Citas destacadas */}
      <motion.section
        initial={reduceMotion ? false : { opacity: 0, y: 20 }}
        whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.5 }}
        className="relative mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 sm:py-24"
      >
        <motion.header
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            Una selección
          </p>
          <h2 className="mt-3 font-display text-4xl text-content sm:text-5xl">
            Citas <span className="text-gradient-animated">destacadas</span>
          </h2>
          <p className="mt-4 text-muted">
            Seis pensamientos escogidos al azar para despertar la reflexión.
          </p>
        </motion.header>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((quote: Quote, i: number) => (
            <QuoteCard key={quote.id} quote={quote} index={i} />
          ))}
        </div>
      </motion.section>

      {/* CTA final */}
      <motion.section
        initial={reduceMotion ? false : { opacity: 0, y: 20 }}
        whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.5 }}
        className="relative mx-auto flex w-full max-w-3xl flex-col items-center gap-4 px-5 py-16 text-center sm:flex-row sm:justify-center sm:px-8 sm:py-24"
      >
        <Link to="/explorar" className="btn-primary text-base">
          Explorar las {quotes.length} citas
        </Link>
        <Link to="/filosofos" className="btn-ghost text-base">
          Conocer a los filósofos
        </Link>
      </motion.section>
    </>
  )
}
