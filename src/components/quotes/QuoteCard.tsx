import { useState } from 'react'
import type { MouseEvent, ReactNode } from 'react'
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { Check, Copy, Heart, Quote as QuoteIcon, Share2, Volume2, Square } from 'lucide-react'
import type { Philosopher, Quote } from '@/types'
import { getPhilosopherById } from '@/data/quotes'
import { cn, formatYear } from '@/lib/utils'
import { useApp } from '@/context/AppContext'
import { useNarration } from '@/context/NarrationContext'

const prefersReducedMotion =
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

export interface QuoteCardProps {
  quote: Quote
  philosopher?: Philosopher
  variant?: 'default' | 'compact' | 'featured'
  index?: number
  showActions?: boolean
}

const VARIANT_TEXT: Record<NonNullable<QuoteCardProps['variant']>, string> = {
  default: 'text-xl sm:text-2xl',
  compact: 'text-base sm:text-lg',
  featured: 'text-2xl sm:text-4xl',
}

const ICON_SWAP = {
  initial: { opacity: 0, scale: 0.5 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.5 },
}

function ActionButton({
  children,
  onClick,
  label,
  active,
}: {
  children: ReactNode
  onClick: () => void
  label: string
  active?: boolean
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      aria-pressed={typeof active === 'boolean' ? active : undefined}
      whileTap={prefersReducedMotion ? undefined : { scale: 0.9 }}
      className={cn(
        'glass grid h-9 w-9 place-items-center rounded-full transition-colors duration-200 hover:text-accent',
        active ? 'text-accent' : 'text-muted',
      )}
    >
      {children}
    </motion.button>
  )
}

export default function QuoteCard({
  quote,
  philosopher,
  variant = 'default',
  index = 0,
  showActions = true,
}: QuoteCardProps) {
  const phil = philosopher ?? getPhilosopherById(quote.philosopherId)
  const { isFavorite, toggleFavorite } = useApp()
  const { activeQuoteId, isNarrating, toggle } = useNarration()
  const fav = isFavorite(quote.id)
  const narratingThis = isNarrating && activeQuoteId === quote.id

  const [copied, setCopied] = useState(false)
  const [shared, setShared] = useState(false)

  // 3D tilt motion values
  const px = useMotionValue(0)
  const py = useMotionValue(0)
  const rotateX = useSpring(useTransform(py, [-0.5, 0.5], [8, -8]), {
    stiffness: 200,
    damping: 20,
  })
  const rotateY = useSpring(useTransform(px, [-0.5, 0.5], [-8, 8]), {
    stiffness: 200,
    damping: 20,
  })

  const handlePointerMove = (e: MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion) return
    const rect = e.currentTarget.getBoundingClientRect()
    px.set((e.clientX - rect.left) / rect.width - 0.5)
    py.set((e.clientY - rect.top) / rect.height - 0.5)
  }

  const resetTilt = () => {
    px.set(0)
    py.set(0)
  }

  const attribution = () => `"${quote.text}" — ${phil?.name ?? 'Anónimo'}`

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(attribution())
      return true
    } catch {
      return false
    }
  }

  const handleCopy = async () => {
    if (await copyToClipboard()) {
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    }
  }

  const handleShare = async () => {
    const text = attribution()
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: 'Filosofuss',
          text,
          url: typeof window !== 'undefined' ? window.location.href : '',
        })
        return
      } catch {
        // El usuario canceló o no está soportado: caer al copiado.
      }
    }
    if (await copyToClipboard()) {
      setShared(true)
      setTimeout(() => setShared(false), 1600)
    }
  }

  const isFeatured = variant === 'featured'
  const isCompact = variant === 'compact'
  const depth = prefersReducedMotion ? undefined : { transform: 'translateZ(40px)' }
  const depthShallow = prefersReducedMotion ? undefined : { transform: 'translateZ(25px)' }

  return (
    <motion.div
      initial={prefersReducedMotion ? undefined : { opacity: 0, y: 24 }}
      whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ delay: Math.min(index * 0.05, 0.4), duration: 0.5, ease: 'easeOut' }}
      style={{ perspective: 1000 }}
      className="h-full"
    >
      <motion.div
        onMouseMove={handlePointerMove}
        onMouseLeave={resetTilt}
        style={
          prefersReducedMotion ? undefined : { rotateX, rotateY, transformStyle: 'preserve-3d' }
        }
        className={cn(
          'glass card-hover relative h-full overflow-hidden rounded-2xl p-6 sm:p-8',
          isFeatured && 'p-8 sm:p-12',
        )}
      >
        <QuoteIcon
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute -right-3 -top-3 text-accent opacity-20',
            isFeatured ? 'h-24 w-24' : 'h-16 w-16',
          )}
        />

        <blockquote
          style={depth}
          className={cn(
            'relative font-serif leading-snug text-content',
            VARIANT_TEXT[variant],
            isFeatured && 'text-center italic',
          )}
        >
          {quote.text}
        </blockquote>

        <div
          style={depthShallow}
          className={cn('mt-5 flex flex-col gap-1', isFeatured && 'items-center text-center')}
        >
          <span className="font-display text-accent">{phil?.name ?? 'Anónimo'}</span>
          {phil && (
            <span className="text-xs text-muted">
              {phil.era} · {phil.school} · {formatYear(phil.birthYear)}–{formatYear(phil.deathYear)}
            </span>
          )}
          {quote.source && <span className="text-xs italic text-muted">— {quote.source}</span>}
        </div>

        {!isCompact && quote.tags.length > 0 && (
          <div
            style={depthShallow}
            className={cn('mt-4 flex flex-wrap gap-2', isFeatured && 'justify-center')}
          >
            {quote.tags.map((t) => (
              <span
                key={t}
                className="rounded-full border border-line-soft px-2.5 py-0.5 text-xs text-muted"
              >
                #{t}
              </span>
            ))}
          </div>
        )}

        {showActions && (
          <div
            style={depthShallow}
            className={cn('mt-6 flex items-center gap-2', isFeatured && 'justify-center')}
          >
            <ActionButton
              onClick={() => toggleFavorite(quote.id)}
              label={fav ? 'Quitar de favoritos' : 'Añadir a favoritos'}
              active={fav}
            >
              <motion.span
                animate={
                  prefersReducedMotion ? undefined : { scale: fav ? [1, 1.35, 1] : 1 }
                }
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="grid place-items-center"
              >
                <Heart
                  size={18}
                  aria-hidden="true"
                  className={cn('transition-colors', fav ? 'fill-current text-accent' : 'text-muted')}
                />
              </motion.span>
            </ActionButton>

            <ActionButton onClick={handleCopy} label={copied ? 'Copiado' : 'Copiar cita'}>
              <AnimatePresence mode="wait" initial={false}>
                {copied ? (
                  <motion.span key="check" {...ICON_SWAP} transition={{ duration: 0.18 }}>
                    <Check size={18} className="text-accent" aria-hidden="true" />
                  </motion.span>
                ) : (
                  <motion.span key="copy" {...ICON_SWAP} transition={{ duration: 0.18 }}>
                    <Copy size={18} className="text-muted" aria-hidden="true" />
                  </motion.span>
                )}
              </AnimatePresence>
            </ActionButton>

            <ActionButton onClick={handleShare} label="Compartir cita">
              <AnimatePresence mode="wait" initial={false}>
                {shared ? (
                  <motion.span key="check" {...ICON_SWAP} transition={{ duration: 0.18 }}>
                    <Check size={18} className="text-accent" aria-hidden="true" />
                  </motion.span>
                ) : (
                  <motion.span key="share" {...ICON_SWAP} transition={{ duration: 0.18 }}>
                    <Share2 size={18} className="text-muted" aria-hidden="true" />
                  </motion.span>
                )}
              </AnimatePresence>
            </ActionButton>

            <ActionButton
              onClick={() => toggle(quote.id)}
              label={narratingThis ? 'Detener narración' : 'Escuchar cita'}
              active={narratingThis}
            >
              <AnimatePresence mode="wait" initial={false}>
                {narratingThis ? (
                  <motion.span
                    key="stop"
                    {...ICON_SWAP}
                    transition={{ duration: 0.18 }}
                    className="grid place-items-center"
                  >
                    {prefersReducedMotion ? (
                      <Square size={18} className="text-accent" aria-hidden="true" />
                    ) : (
                      <motion.span
                        animate={{ scale: [1, 1.15, 1] }}
                        transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                        className="grid place-items-center"
                      >
                        <Square size={18} className="text-accent" aria-hidden="true" />
                      </motion.span>
                    )}
                  </motion.span>
                ) : (
                  <motion.span key="listen" {...ICON_SWAP} transition={{ duration: 0.18 }}>
                    <Volume2 size={18} className="text-muted" aria-hidden="true" />
                  </motion.span>
                )}
              </AnimatePresence>
            </ActionButton>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}
