import { memo, useState } from 'react'
import type { MouseEvent, ReactNode } from 'react'
import { AnimatePresence, m, useMotionTemplate, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { useDocumentTheme, type ThemeMode } from '@/hooks/useDocumentTheme'
import { spring } from '@/lib/variants'
import { announce } from '@/components/ui/StatusAnnouncer'
import type { LucideIcon } from 'lucide-react'
import { Calendar, Check, Clock, Copy, Heart, Landmark, Linkedin, Maximize2, Quote as QuoteIcon, Share2, Volume2, Square } from 'lucide-react'
import type { Philosopher, Quote } from '@/types'
import { getPhilosopherById, getQuoteSource, getQuoteText } from '@/data/quotes'
import { localizePhilosopher } from '@/data/philosophers'
import { buildQuoteShareUrl, cn, formatYear, initials } from '@/lib/utils'
import { useApp } from '@/context/AppContext'
import { useNarration } from '@/context/NarrationContext'

export type QuoteCardVariant = 'default' | 'compact' | 'featured' | 'list'

export interface QuoteCardProps {
  quote: Quote
  philosopher?: Philosopher
  variant?: QuoteCardVariant
  index?: number
  showActions?: boolean
}

const VARIANT_TEXT: Record<QuoteCardVariant, string> = {
  default: 'text-xl sm:text-2xl',
  compact: 'text-base sm:text-lg',
  featured: 'text-2xl sm:text-4xl',
  list: 'text-xl sm:text-2xl',
}

const ICON_SWAP = {
  initial: { opacity: 0, scale: 0.5 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.5 },
}

// Spotlight por tema: dark conserva el oro histórico exacto; en light/paper el
// oro claro casi no se ve sobre fondo claro, así que el resaltado se pinta con
// el oro profundo del token a 0.10 (tinte cálido sutil, coherente con aurora).
const SPOTLIGHT_INK: Record<ThemeMode, string> = {
  dark: 'rgba(201, 169, 106, 0.12)',
  light: 'rgba(125, 90, 28, 0.1)',
  paper: 'rgba(122, 86, 28, 0.1)',
}

type Translate = (key: string, vars?: Record<string, string | number>) => string

function MetaChip({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-line-soft bg-glass px-2.5 py-1 text-xs text-muted">
      <Icon size={12} className="text-accent" aria-hidden="true" />
      {label}
    </span>
  )
}

function ActionButton({
  children,
  onClick,
  label,
  active,
  animated,
}: {
  children: ReactNode
  onClick: () => void
  label: string
  active?: boolean
  animated: boolean
}) {
  const prefersReducedMotion = usePrefersReducedMotion()
  const className = cn(
    'glass grid h-11 w-11 place-items-center rounded-full transition-colors duration-200 hover:text-accent',
    active ? 'text-accent' : 'text-muted',
  )

  if (!animated) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label={label}
        title={label}
        aria-pressed={typeof active === 'boolean' ? active : undefined}
        className={className}
      >
        {children}
      </button>
    )
  }

  return (
    <m.button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      aria-pressed={typeof active === 'boolean' ? active : undefined}
      whileTap={prefersReducedMotion ? {} : { scale: 0.9, transition: spring.press }}
      className={className}
    >
      {children}
    </m.button>
  )
}

interface CardBodyProps {
  quote: Quote
  phil?: Philosopher | undefined
  variant: QuoteCardVariant
  fav: boolean
  narratingThis: boolean
  copied: boolean
  shared: boolean
  showActions: boolean
  depth?: { transform: string } | undefined
  depthShallow?: { transform: string } | undefined
  animated: boolean
  t: Translate
  locale: 'es' | 'en'
  onToggleFavorite: () => void
  onCopy: () => void
  onShare: () => void
  onLinkedIn: () => void
  onNarrate: () => void
  onZen: () => void
}

/**
 * Shared card markup. `animated` is false for the lightweight variants
 * (`list`/`compact`) so they avoid every per-card motion value and
 * `AnimatePresence` (PERF-07); the static visual identity is identical.
 */
function CardBody({
  quote,
  phil,
  variant,
  fav,
  narratingThis,
  copied,
  shared,
  showActions,
  depth,
  depthShallow,
  animated,
  t,
  locale,
  onToggleFavorite,
  onCopy,
  onShare,
  onLinkedIn,
  onNarrate,
  onZen,
}: CardBodyProps) {
  const prefersReducedMotion = usePrefersReducedMotion()
  const isFeatured = variant === 'featured'
  const isCompact = variant === 'compact'
  const display = phil ? localizePhilosopher(phil, locale) : undefined

  return (
    <>
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
        {getQuoteText(quote, locale)}
      </blockquote>

      <div
        style={depthShallow}
        className={cn('mt-5 flex flex-col gap-2.5', isFeatured && 'items-center text-center')}
      >
        {/* Author chip */}
        <div className="flex items-center gap-2.5">
          <span
            aria-hidden="true"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-accent to-accent-2 text-xs font-bold text-[#0a0a12]"
          >
            {display ? initials(display.name) : '?'}
          </span>
          <span className="font-display text-base text-accent">{display?.name ?? t('card.anon')}</span>
        </div>

        {/* School / era / years chips */}
        <div className={cn('flex flex-wrap gap-2', isFeatured && 'justify-center')}>
          {display?.school && <MetaChip icon={Landmark} label={display.school} />}
          {display?.era && <MetaChip icon={Calendar} label={display.era} />}
          {phil && (
            <MetaChip
              icon={Clock}
              label={`${formatYear(phil.birthYear, locale)}–${formatYear(phil.deathYear, locale)}`}
            />
          )}
        </div>

        {quote.source && <span className="text-xs italic text-muted">— {getQuoteSource(quote, locale)}</span>}
      </div>

      {!isCompact && quote.tags.length > 0 && (
        <div
          style={depthShallow}
          className={cn('mt-4 flex flex-wrap gap-2', isFeatured && 'justify-center')}
        >
          {quote.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-line-soft bg-glass px-2.5 py-0.5 text-xs text-muted transition-colors hover:border-line hover:text-accent"
            >
              #{t(`tag.${tag}`)}
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
            animated={animated}
            onClick={onToggleFavorite}
            label={fav ? t('card.favRemove') : t('card.favAdd')}
            active={fav}
          >
            {animated ? (
              <m.span
                animate={
                  prefersReducedMotion ? false : { scale: fav ? [1, 1.35, 1] : 1 }
                }
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="grid place-items-center"
              >
                <Heart
                  size={18}
                  aria-hidden="true"
                  className={cn('transition-colors', fav ? 'fill-current text-accent' : 'text-muted')}
                />
              </m.span>
            ) : (
              <Heart
                size={18}
                aria-hidden="true"
                className={cn('transition-colors', fav ? 'fill-current text-accent' : 'text-muted')}
              />
            )}
          </ActionButton>

          <ActionButton
            animated={animated}
            onClick={onCopy}
            label={copied ? t('card.copied') : t('card.copy')}
          >
            {animated ? (
              <AnimatePresence mode="wait" initial={false}>
                {copied ? (
                  <m.span key="check" {...ICON_SWAP} transition={{ duration: 0.18 }}>
                    <Check size={18} className="text-accent" aria-hidden="true" />
                  </m.span>
                ) : (
                  <m.span key="copy" {...ICON_SWAP} transition={{ duration: 0.18 }}>
                    <Copy size={18} className="text-muted" aria-hidden="true" />
                  </m.span>
                )}
              </AnimatePresence>
            ) : copied ? (
              <Check size={18} className="text-accent" aria-hidden="true" />
            ) : (
              <Copy size={18} className="text-muted" aria-hidden="true" />
            )}
          </ActionButton>

          <ActionButton animated={animated} onClick={onShare} label={t('card.share')}>
            {animated ? (
              <AnimatePresence mode="wait" initial={false}>
                {shared ? (
                  <m.span key="check" {...ICON_SWAP} transition={{ duration: 0.18 }}>
                    <Check size={18} className="text-accent" aria-hidden="true" />
                  </m.span>
                ) : (
                  <m.span key="share" {...ICON_SWAP} transition={{ duration: 0.18 }}>
                    <Share2 size={18} className="text-muted" aria-hidden="true" />
                  </m.span>
                )}
              </AnimatePresence>
            ) : shared ? (
              <Check size={18} className="text-accent" aria-hidden="true" />
            ) : (
              <Share2 size={18} className="text-muted" aria-hidden="true" />
            )}
          </ActionButton>

          <ActionButton animated={animated} onClick={onLinkedIn} label={t('card.shareLinkedIn')}>
            <Linkedin size={18} className="text-muted" aria-hidden="true" />
          </ActionButton>

          <ActionButton
            animated={animated}
            onClick={onNarrate}
            label={narratingThis ? t('card.stop') : t('card.listen')}
            active={narratingThis}
          >
            {animated ? (
              <AnimatePresence mode="wait" initial={false}>
                {narratingThis ? (
                  <m.span
                    key="stop"
                    {...ICON_SWAP}
                    transition={{ duration: 0.18 }}
                    className="grid place-items-center"
                  >
                    {prefersReducedMotion ? (
                      <Square size={18} className="text-accent" aria-hidden="true" />
                    ) : (
                      <m.span
                        animate={{ scale: [1, 1.15, 1] }}
                        transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                        className="grid place-items-center"
                      >
                        <Square size={18} className="text-accent" aria-hidden="true" />
                      </m.span>
                    )}
                  </m.span>
                ) : (
                  <m.span key="listen" {...ICON_SWAP} transition={{ duration: 0.18 }}>
                    <Volume2 size={18} className="text-muted" aria-hidden="true" />
                  </m.span>
                )}
              </AnimatePresence>
            ) : narratingThis ? (
              <Square size={18} className="text-accent" aria-hidden="true" />
            ) : (
              <Volume2 size={18} className="text-muted" aria-hidden="true" />
            )}
          </ActionButton>

          <ActionButton animated={animated} onClick={onZen} label={t('zen.enter')}>
            <Maximize2 size={18} className="text-muted" aria-hidden="true" />
          </ActionButton>
        </div>
      )}
    </>
  )
}

/**
 * Rich frame: 3D tilt + cursor spotlight. Reserved for the curated, few-card
 * contexts (`default` used by Home/Favorites and `featured`). It is the only
 * place that instantiates per-card motion values (PERF-07).
 */
function RichCardFrame({
  variant,
  children,
}: {
  variant: QuoteCardVariant
  children: ReactNode
}) {
  const prefersReducedMotion = usePrefersReducedMotion()
  const isFeatured = variant === 'featured'
  // Tema activo desde <html> para la tinta del spotlight.
  const themeMode = useDocumentTheme()

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

  const sx = useMotionValue(50)
  const sy = useMotionValue(50)
  const spotlight = useMotionTemplate`radial-gradient(360px circle at ${sx}% ${sy}%, ${SPOTLIGHT_INK[themeMode]}, transparent 65%)`

  const handlePointerMove = (e: MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion) return
    const rect = e.currentTarget.getBoundingClientRect()
    px.set((e.clientX - rect.left) / rect.width - 0.5)
    py.set((e.clientY - rect.top) / rect.height - 0.5)
    sx.set(((e.clientX - rect.left) / rect.width) * 100)
    sy.set(((e.clientY - rect.top) / rect.height) * 100)
  }

  const resetTilt = () => {
    px.set(0)
    py.set(0)
  }

  return (
    <div style={{ perspective: 1000 }} className="h-full">
      <m.div
        onMouseMove={handlePointerMove}
        onMouseLeave={resetTilt}
        style={
          prefersReducedMotion ? {} : { rotateX, rotateY, transformStyle: 'preserve-3d' }
        }
        className={cn(
          'glass card-hover relative h-full overflow-hidden rounded-2xl p-6 sm:p-8',
          isFeatured && 'p-8 sm:p-12',
        )}
      >
        <m.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{ background: spotlight }}
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />
        {children}
      </m.div>
    </div>
  )
}

/**
 * Light frame: no motion values, no `AnimatePresence`. Used by the virtualized
 * explorer list (`list`) and the philosopher wall (`compact`).
 */
function LightCardFrame({
  variant,
  children,
}: {
  variant: QuoteCardVariant
  children: ReactNode
}) {
  return (
    <div
      className={cn(
        'glass card-hover relative h-full overflow-hidden rounded-2xl p-6 sm:p-8',
        variant === 'featured' && 'p-8 sm:p-12',
      )}
    >
      {children}
    </div>
  )
}

function QuoteCard({
  quote,
  philosopher,
  variant = 'default',
  showActions = true,
}: QuoteCardProps) {
  const prefersReducedMotion = usePrefersReducedMotion()
  const phil = philosopher ?? getPhilosopherById(quote.philosopherId)
  const { isFavorite, toggleFavorite, t, locale, openZen } = useApp()
  const { activeQuoteId, isNarrating, toggle } = useNarration()
  const fav = isFavorite(quote.id)
  const narratingThis = isNarrating && activeQuoteId === quote.id

  const [copied, setCopied] = useState(false)
  const [shared, setShared] = useState(false)

  const attribution = () =>
    `"${getQuoteText(quote, locale)}" — ${phil ? localizePhilosopher(phil, locale).name : t('card.anon')}`

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
      announce(t('status.copied'))
      setTimeout(() => setCopied(false), 1600)
    }
  }

  const handleShare = async () => {
    const text = attribution()
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: t('card.shareTitle'),
          text,
          url: buildQuoteShareUrl(quote.id),
        })
        announce(t('status.shared'))
        return
      } catch {
        // El usuario canceló o no está soportado: caer al copiado.
      }
    }
    if (await copyToClipboard()) {
      setShared(true)
      announce(t('status.copied'))
      setTimeout(() => setShared(false), 1600)
    }
  }

  const handleLinkedInShare = () => {
    const linkedIn = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(buildQuoteShareUrl(quote.id))}`
    window.open(linkedIn, '_blank', 'noopener,noreferrer')
  }

  // Rich (tilt + spotlight) effects are reserved for the curated, few-card
  // contexts: the `featured` variant and the `default` variant used by Home.
  // The explorer list opts into `list` and the philosopher wall into `compact`,
  // both of which render without per-card motion values (PERF-07).
  const isRich = variant === 'featured' || variant === 'default'

  const body = (
    <CardBody
      quote={quote}
      phil={phil}
      variant={variant}
      fav={fav}
      narratingThis={narratingThis}
      copied={copied}
      shared={shared}
      showActions={showActions}
      animated={isRich}
      depth={isRich && !prefersReducedMotion ? { transform: 'translateZ(40px)' } : undefined}
      depthShallow={isRich && !prefersReducedMotion ? { transform: 'translateZ(25px)' } : undefined}
      t={t}
      locale={locale}
      onToggleFavorite={() => {
        announce(fav ? t('status.favRemoved') : t('status.favAdded'))
        toggleFavorite(quote.id)
      }}
      onCopy={handleCopy}
      onShare={handleShare}
      onLinkedIn={handleLinkedInShare}
      onNarrate={() => toggle(quote.id)}
      onZen={() => openZen(quote.id)}
    />
  )

  if (isRich) {
    return (
      <RichCardFrame variant={variant}>
        {body}
      </RichCardFrame>
    )
  }

  return <LightCardFrame variant={variant}>{body}</LightCardFrame>
}

export default memo(QuoteCard)
