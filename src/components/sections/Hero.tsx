import { useRef, useState } from 'react'
import { m, useScroll, useTransform } from 'framer-motion'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { Link } from 'react-router-dom'
import { ArrowRight, ChevronDown, Quote, Sparkles, Users } from 'lucide-react'
import { getPhilosopherById, getRandomQuote } from '@/data/quotes'
import { useApp } from '@/context/AppContext'
import AnimatedQuote from '@/components/quotes/AnimatedQuote'

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

export default function Hero() {
  const reduceMotion = usePrefersReducedMotion()
  const { t } = useApp()
  const [featured] = useState(() => getRandomQuote())
  const philosopher = getPhilosopherById(featured.philosopherId)

  // Parallax sutil de la cita (±12 px totales, §3.3). No se aplica a fondos
  // con blur; solo al wrapper del bloque de cita.
  const sectionRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  })
  const parallaxY = useTransform(scrollYProgress, [0, 1], [6, -6])

  // Una sola secuencia de carga: máscara de cita → hairline → atribución →
  // subtítulo → CTAs. `initial={false}` bajo reduced-motion (sin animación).
  const fadeUp = (delay: number) => ({
    initial: reduceMotion ? false : { opacity: 0, y: 12 },
    animate: reduceMotion ? undefined : { opacity: 1, y: 0 },
    transition: { delay: reduceMotion ? 0 : delay, duration: 0.4, ease: EASE },
  })

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-[92svh] w-full items-center justify-center overflow-hidden px-5 py-24 sm:px-8"
    >
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

      <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center text-center">
        {/* Eyebrow — marca */}
        <m.p
          {...fadeUp(0)}
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-line-soft bg-glass px-4 py-1.5 font-logo text-xs uppercase tracking-[0.3em] text-accent sm:text-sm"
        >
          <Sparkles className="h-4 w-4" />
          Filosofuss
        </m.p>

        {/* Hairline gold → copper → ember, dibujada con scaleX */}
        <m.div
          aria-hidden="true"
          className="mb-8 h-px w-44 origin-center bg-gradient-to-r from-gold via-copper to-ember sm:w-56"
          initial={reduceMotion ? false : { scaleX: 0 }}
          animate={reduceMotion ? undefined : { scaleX: 1 }}
          transition={{ delay: reduceMotion ? 0 : 0.55, duration: 0.4, ease: EASE }}
        />

        {/* Cita monumental — revelado por máscara + parallax (Δ ≤ 12 px) */}
        <m.div
          style={reduceMotion ? undefined : { y: parallaxY }}
          className="[will-change:transform]"
        >
          <AnimatedQuote
            text={featured.text}
            className="font-serif text-3xl italic leading-snug text-content sm:text-5xl lg:text-6xl"
          />
        </m.div>

        {/* Atribución */}
        <m.div
          {...fadeUp(0.8)}
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
        </m.div>

        <m.p
          {...fadeUp(0.9)}
          className="mt-6 max-w-xl font-serif text-base italic text-muted sm:text-lg"
        >
          {t('hero.subtitle')}
        </m.p>

        {/* CTAs */}
        <m.div
          {...fadeUp(1)}
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
        </m.div>
      </div>

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
