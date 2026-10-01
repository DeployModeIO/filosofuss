import { m, AnimatePresence } from 'framer-motion'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { Link } from 'react-router-dom'
import { Heart, Trash2 } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { getQuoteById } from '@/data/quotes'
import { revealContainer, revealItem } from '@/lib/variants'
import type { Quote } from '@/types'
import QuoteCard from '@/components/quotes/QuoteCard'

export default function Favorites() {
  const reduceMotion = usePrefersReducedMotion()
  const { favorites, favoritesCount, clearFavorites, t } = useApp()
  const favQuotes: Quote[] = favorites
    .map((id) => getQuoteById(id))
    .filter((q): q is Quote => q !== undefined)

  const handleClear = () => {
    if (window.confirm(t('fav.confirm'))) {
      clearFavorites()
    }
  }

  return (
    <section className="relative mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
      {/* Una única secuencia de reveal por vista (§3.2). */}
      <m.div
        variants={reduceMotion ? undefined : revealContainer}
        initial={reduceMotion ? false : 'hidden'}
        whileInView={reduceMotion ? undefined : 'show'}
        viewport={{ once: true, amount: 0.25 }}
      >
        <m.header
          variants={reduceMotion ? undefined : revealItem}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            {t('fav.label')}
          </p>
          <h1 className="mt-3 font-display text-4xl text-content sm:text-5xl">
            <span className="text-gradient-animated">{t('fav.title')}</span>
          </h1>
          <p className="mt-4 text-muted">
            {favoritesCount === 0
              ? t('fav.empty')
              : `${favoritesCount} ${favoritesCount === 1 ? t('fav.savedOne') : t('fav.savedMany')}`}
          </p>
        </m.header>

        {favQuotes.length === 0 ? (
          <m.div
            variants={reduceMotion ? undefined : revealItem}
            className="mx-auto mt-12 flex max-w-md flex-col items-center gap-5 rounded-3xl border border-line-soft bg-glass px-6 py-14 text-center"
          >
            <span className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-accent-3/30 to-accent-2/30">
              <Heart className="h-9 w-9 text-accent-3" />
            </span>
            <h3 className="font-display text-2xl text-content">
              {t('fav.emptyTitle')}
            </h3>
            <p className="text-muted">
              {t('fav.emptyHint')}
            </p>
            <Link to="/explorar" className="btn-primary">
              {t('fav.explore')}
            </Link>
          </m.div>
        ) : (
          <>
            <m.div
              variants={reduceMotion ? undefined : revealItem}
              className="mt-10 flex justify-center"
            >
              <button
                type="button"
                onClick={handleClear}
                className="btn-ghost text-sm"
              >
                <Trash2 className="h-4 w-4" />
                {t('fav.clear')}
              </button>
            </m.div>
            <m.div variants={reduceMotion ? undefined : revealItem}>
              <m.div
                layout
                className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
              >
                <AnimatePresence mode="popLayout">
                  {favQuotes.map((q, i) => (
                    <m.div
                      key={q.id}
                      layout
                      initial={false}
                      exit={reduceMotion ? undefined : { opacity: 0, scale: 0.96 }}
                      transition={{ duration: reduceMotion ? 0 : 0.25 }}
                    >
                      <QuoteCard quote={q} index={i} />
                    </m.div>
                  ))}
                </AnimatePresence>
              </m.div>
            </m.div>
          </>
        )}
      </m.div>
    </section>
  )
}
