import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X } from 'lucide-react'
import { quotes, searchQuotes, getPhilosopherById } from '@/data/quotes'
import type { Quote } from '@/types'
import { shuffle } from '@/lib/utils'
import SearchBar from '@/components/controls/SearchBar'
import FilterPanel from '@/components/controls/FilterPanel'
import QuoteCard from '@/components/quotes/QuoteCard'

const reduceMotion =
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

export default function BrowseQuotes() {
  const [query, setQuery] = useState('')
  const [debounced, setDebounced] = useState('')
  const [selectedEra, setSelectedEra] = useState<string | null>(null)
  const [selectedSchool, setSelectedSchool] = useState<string | null>(null)
  const [selectedTag, setSelectedTag] = useState<string | null>(null)

  // Orden base estable (barajado una sola vez al montar) para que las
  // animaciones de `layout` no salten entre renderizados.
  const [baseOrder] = useState(() => shuffle(quotes))

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), 200)
    return () => clearTimeout(t)
  }, [query])

  const results = useMemo<Quote[]>(() => {
    const searching = debounced.trim().length > 0
    let list: Quote[] = searching ? searchQuotes(debounced) : baseOrder
    if (selectedEra) {
      list = list.filter(
        (q) => getPhilosopherById(q.philosopherId)?.era === selectedEra,
      )
    }
    if (selectedSchool) {
      list = list.filter(
        (q) => getPhilosopherById(q.philosopherId)?.school === selectedSchool,
      )
    }
    if (selectedTag) {
      list = list.filter((q) => q.tags.includes(selectedTag))
    }
    return list
  }, [debounced, selectedEra, selectedSchool, selectedTag, baseOrder])

  const clearAll = () => {
    setQuery('')
    setDebounced('')
    setSelectedEra(null)
    setSelectedSchool(null)
    setSelectedTag(null)
  }

  const chips: { label: string; clear: () => void }[] = []
  if (selectedEra) {
    chips.push({ label: selectedEra, clear: () => setSelectedEra(null) })
  }
  if (selectedSchool) {
    chips.push({
      label: selectedSchool,
      clear: () => setSelectedSchool(null),
    })
  }
  if (selectedTag) {
    chips.push({ label: selectedTag, clear: () => setSelectedTag(null) })
  }

  const hasAny =
    debounced.trim().length > 0 ||
    selectedEra !== null ||
    selectedSchool !== null ||
    selectedTag !== null

  return (
    <section className="relative mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
      <motion.header
        initial={reduceMotion ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mx-auto max-w-2xl text-center"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
          Catálogo
        </p>
        <h2 className="mt-3 font-display text-4xl text-content sm:text-5xl">
          Explora el <span className="text-gradient-animated">universo filosófico</span>
        </h2>
        <p className="mt-4 text-muted">
          Filtra por era, escuela o tema, o busca entre todas las citas del
          corpus.
        </p>
      </motion.header>

      <div className="mx-auto mt-10 flex max-w-3xl flex-col gap-5">
        <SearchBar query={query} onQuery={setQuery} />
        <FilterPanel
          selectedEra={selectedEra}
          selectedSchool={selectedSchool}
          selectedTag={selectedTag}
          onEra={setSelectedEra}
          onSchool={setSelectedSchool}
          onTag={setSelectedTag}
          onClear={() => {
            setSelectedEra(null)
            setSelectedSchool(null)
            setSelectedTag(null)
          }}
        />
      </div>

      <div className="mx-auto mt-8 flex max-w-6xl flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">
          Mostrando{' '}
          <span className="font-semibold text-content">{results.length}</span>{' '}
          {results.length === 1 ? 'cita' : 'citas'}
        </p>

        {chips.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {chips.map((c) => (
              <span
                key={c.label}
                className="inline-flex items-center gap-1.5 rounded-full border border-line bg-glass px-3 py-1 text-xs text-content"
              >
                {c.label}
                <button
                  type="button"
                  onClick={c.clear}
                  aria-label={`Quitar ${c.label}`}
                  className="text-muted transition-colors hover:text-content"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {results.length === 0 ? (
        <div className="mx-auto mt-12 flex max-w-md flex-col items-center gap-4 rounded-3xl border border-line-soft bg-glass px-6 py-12 text-center">
          <Search className="h-10 w-10 text-muted" />
          <h3 className="font-display text-2xl text-content">
            No se encontraron citas
          </h3>
          <p className="text-muted">
            Prueba con otro término o limpia los filtros activos.
          </p>
          {hasAny && (
            <button type="button" onClick={clearAll} className="btn-ghost">
              <X className="h-4 w-4" />
              Limpiar búsqueda
            </button>
          )}
        </div>
      ) : (
        <motion.div
          layout
          className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          <AnimatePresence mode="popLayout">
            {results.map((q, i) => (
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
      )}
    </section>
  )
}
