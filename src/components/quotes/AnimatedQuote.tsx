import { motion, type Variants } from 'framer-motion'

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

export interface AnimatedQuoteProps {
  text: string
  className?: string
}

/**
 * Cita con revelado palabra a palabra (respetando prefers-reduced-motion).
 * Usada en el Hero y en la Cita del día para mantener una misma cadencia.
 */
export default function AnimatedQuote({ text, className }: AnimatedQuoteProps) {
  const words = text.split(' ')
  return (
    <motion.blockquote
      variants={container}
      initial="hidden"
      animate="show"
      className={className}
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
  )
}
