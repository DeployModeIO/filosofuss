import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Heart, Trash2 } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { getQuoteById } from '@/data/quotes'
import type { Quote } from '@/types'
import QuoteCard from '@/components/quotes/QuoteCard'

const reduceMotion =
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

export default function Favorites() {
  const { favorites, favoritesCount, clearFavorites } = useApp()
  const favQuotes: Quote[] = favorites
    .map((id) => getQuoteById(id))
    .filter((q): q is Quote => q !== undefined)

  const handleClear = () => {
    if (
      window.confirm(
        '¿Vaciar todos tus favoritos? Esta acción no se puede deshacer.',
      )
    ) {
      clearFavorites()
    }
  }

  return (
    <section className="relative mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
      <motion.header
        initial={reduceMotion ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mx-auto max-w-2xl text-center"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
          Tu colección
        </p>
        <h2 className="mt-3 font-display text-4xl text-content sm:text-5xl">
          <span className="text-gradient-animated">Favoritos</span>
        </h2>
        <p className="mt-4 text-muted">
          {favoritesCount === 0
            ? 'Aún no has guardado ninguna cita.'
            : `${favoritesCount} ${favoritesCount === 1 ? 'cita guardada' : 'citas guardadas'}.`}
        </p>
      </motion.header>

      {favQuotes.length === 0 ? (
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mx-auto mt-12 flex max-w-md flex-col items-center gap-5 rounded-3xl border border-line-soft bg-glass px-6 py-14 text-center"
        >
          <span className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-accent-3/30 to-accent-2/30">
            <Heart className="h-9 w-9 text-accent-3" />
          </span>
          <h3 className="font-display text-2xl text-content">
            Aún no has guardado citas
          </h3>
          <p className="text-muted">
            Explora el corpus y marca con el corazón las citas que más te
            conmuevan.
          </p>
          <Link to="/explorar" className="btn-primary">
            Explorar citas
          </Link>
        </motion.div>
      ) : (
        <>
          <div className="mt-10 flex justify-center">
            <button
              type="button"
              onClick={handleClear}
              className="btn-ghost text-sm"
            >
              <Trash2 className="h-4 w-4" />
              Vaciar favoritos
            </button>
          </div>
          <motion.div
            layout
            className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            <AnimatePresence mode="popLayout">
              {favQuotes.map((q, i) => (
                <motion.div
                  key={q.id}
                  layout
                  initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={reduceMotion ? undefined : { opacity: 0, scale: 0.96 }}
                  transition={{ duration: reduceMotion ? 0 : 0.25 }}
                >
                  <QuoteCard quote={q} index={i} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </section>
  )
}
