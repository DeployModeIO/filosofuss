import { useMemo } from 'react'
import { m, type Variants } from 'framer-motion'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

export interface AnimatedQuoteProps {
  text: string
  className?: string
}

/**
 * Cita con revelado palabra a palabra (respetando prefers-reduced-motion de
 * forma reactiva, Task B4). Usada en el Hero y en la Cita del día para mantener
 * una misma cadencia.
 */
export default function AnimatedQuote({ text, className }: AnimatedQuoteProps) {
  const prefersReducedMotion = usePrefersReducedMotion()

  const container: Variants = useMemo(
    () =>
      prefersReducedMotion
        ? { hidden: {}, show: {} }
        : {
            hidden: {},
            show: { transition: { staggerChildren: 0.04, delayChildren: 0.1 } },
          },
    [prefersReducedMotion],
  )

  const word: Variants = useMemo(
    () =>
      prefersReducedMotion
        ? { hidden: { opacity: 1, y: 0 }, show: { opacity: 1, y: 0 } }
        : {
            hidden: { opacity: 0, y: 12 },
            show: {
              opacity: 1,
              y: 0,
              transition: { duration: 0.4, ease: 'easeOut' },
            },
          },
    [prefersReducedMotion],
  )

  const words = text.split(' ')
  return (
    <m.blockquote
      variants={container}
      initial="hidden"
      animate="show"
      className={className}
    >
      {words.map((w, i) => (
        <m.span
          key={`${i}-${w}`}
          variants={word}
          className="mr-[0.25em] inline-block"
        >
          {i === 0 ? `“${w}` : i === words.length - 1 ? `${w}”` : w}
        </m.span>
      ))}
    </m.blockquote>
  )
}
