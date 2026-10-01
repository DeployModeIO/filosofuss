import { m } from 'framer-motion'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { heroReveal } from '@/lib/variants'

export interface AnimatedQuoteProps {
  text: string
  className?: string
}

/**
 * Cita con revelado por máscara sobre el bloque completo (Task C5 / P-09).
 * Antes se creaba un `<m.span>` por palabra; ahora es un único nodo con
 * `heroReveal` (clip-path + y), lo que elimina cientos de nodos DOM por cita
 * sin cambiar el resultado visual de forma perceptible.
 */
export default function AnimatedQuote({ text, className }: AnimatedQuoteProps) {
  const reduceMotion = usePrefersReducedMotion()

  return (
    <m.blockquote
      variants={heroReveal}
      initial={reduceMotion ? false : 'hidden'}
      animate={reduceMotion ? false : 'show'}
      style={reduceMotion ? {} : { willChange: 'transform, opacity' }}
      className={className}
    >
      {`“${text}”`}
    </m.blockquote>
  )
}
