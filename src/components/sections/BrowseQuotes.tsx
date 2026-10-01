import { useCallback, useDeferredValue, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { m } from 'framer-motion'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { useWindowVirtualizer } from '@tanstack/react-virtual'
import { Search, X } from 'lucide-react'
import { quotes, searchQuotes, getPhilosopherById } from '@/data/quotes'
import { localizeEra, localizeSchool } from '@/data/philosophers'
import type { Quote, Tag } from '@/types'
import { shuffle } from '@/lib/utils'
import { revealContainer, revealItem } from '@/lib/variants'
import SearchBar from '@/components/controls/SearchBar'
import FilterPanel from '@/components/controls/FilterPanel'
import QuoteCard from '@/components/quotes/QuoteCard'
import { useApp } from '@/context/AppContext'

/** Columnas de la rejilla según el ancho disponible (sm=640, lg=1024). */
function columnsForWidth(width: number): number {
  if (width >= 1024) return 3
  if (width >= 640) return 2
  return 1
}

function groupRows(items: Quote[], columns: number): Quote[][] {
  const rows: Quote[][] = []
  for (let i = 0; i < items.length; i += columns) {
    rows.push(items.slice(i, i + columns))
  }
  return rows
}

export default function BrowseQuotes() {
  const reduceMotion = usePrefersReducedMotion()
  const { t, locale } = useApp()
  const [query, setQuery] = useState('')
  const [selectedEra, setSelectedEra] = useState<string | null>(null)
  const [selectedSchool, setSelectedSchool] = useState<string | null>(null)
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null)

  // El input se actualiza de forma síncrona (query) pero el filtrado pesado usa
  // el valor diferido: teclear no bloquea el hilo principal (PERF-06).
  const deferredQuery = useDeferredValue(query)

  // Orden base estable (barajado una sola vez al montar).
  const [baseOrder] = useState(() => shuffle(quotes))

  const results = useMemo<Quote[]>(() => {
    const searching = deferredQuery.trim().length > 0
    let list: Quote[] = searching ? searchQuotes(deferredQuery) : baseOrder
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
  }, [deferredQuery, selectedEra, selectedSchool, selectedTag, baseOrder])

  // Rejilla responsive: filas virtualizadas (cada fila agrupa N tarjetas).
  const listRef = useRef<HTMLDivElement>(null)
  const [columns, setColumns] = useState(() =>
    typeof window === 'undefined' ? 1 : columnsForWidth(window.innerWidth),
  )

  useEffect(() => {
    const el = listRef.current
    if (!el || typeof ResizeObserver === 'undefined') return
    const update = () => setColumns(columnsForWidth(el.clientWidth))
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const rows = useMemo(() => groupRows(results, columns), [results, columns])

  // `scrollMargin` = offset del inicio de la lista respecto al documento.
  const [scrollMargin, setScrollMargin] = useState(0)

  const rowVirtualizer = useWindowVirtualizer({
    count: rows.length,
    estimateSize: () => 360,
    overscan: 4,
    scrollMargin,
  })

  useLayoutEffect(() => {
    const el = listRef.current
    if (!el) return
    const update = () => setScrollMargin(el.getBoundingClientRect().top + window.scrollY)
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [rows.length, columns])

  useEffect(() => {
    rowVirtualizer.measure()
  }, [rowVirtualizer, rows.length, columns])

  const clearAll = useCallback(() => {
    setQuery('')
    setSelectedEra(null)
    setSelectedSchool(null)
    setSelectedTag(null)
  }, [])

  const chips: { label: string; clear: () => void }[] = []
  if (selectedEra) {
    chips.push({
      label: localizeEra(selectedEra, locale),
      clear: () => setSelectedEra(null),
    })
  }
  if (selectedSchool) {
    chips.push({
      label: localizeSchool(selectedSchool, locale),
      clear: () => setSelectedSchool(null),
    })
  }
  if (selectedTag) {
    chips.push({
      label: t(`tag.${selectedTag}`),
      clear: () => setSelectedTag(null),
    })
  }

  const hasAny =
    deferredQuery.trim().length > 0 ||
    selectedEra !== null ||
    selectedSchool !== null ||
    selectedTag !== null

  return (
    <section className="relative mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
      <m.div
        variants={reduceMotion ? {} : revealContainer}
        whileInView={reduceMotion ? {} : 'show'}
        initial={reduceMotion ? false : 'hidden'}
        viewport={{ once: true, amount: 0.25 }}
      >
        <m.header
          variants={reduceMotion ? {} : revealItem}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            {t('browse.label')}
          </p>
          <h1 className="mt-3 font-display text-4xl text-content sm:text-5xl">
            {t('browse.titleA')}
            <span className="text-gradient-animated">{t('browse.titleB')}</span>
          </h1>
          <p className="mt-4 text-muted">
            {t('browse.subtitle')}
          </p>
        </m.header>

        <m.div
          variants={reduceMotion ? {} : revealItem}
          className="mx-auto mt-10 flex max-w-3xl flex-col gap-5"
        >
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
        </m.div>

        <m.div
          variants={reduceMotion ? {} : revealItem}
          className="mx-auto mt-8 flex max-w-6xl flex-wrap items-center justify-between gap-3"
        >
          <p className="text-sm text-muted">
            {t('browse.showing')}
            <span className="font-semibold text-content">{results.length}</span>{' '}
            {results.length === 1 ? t('browse.quote') : t('browse.quotes')}
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
                    aria-label={t('browse.removeFilter', { label: c.label })}
                    className="text-muted transition-colors hover:text-content"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </m.div>
      </m.div>

      {results.length === 0 ? (
        <div className="mx-auto mt-12 flex max-w-md flex-col items-center gap-4 rounded-3xl border border-line-soft bg-glass px-6 py-12 text-center">
          <Search className="h-10 w-10 text-muted" />
          <h3 className="font-display text-2xl text-content">
            {t('browse.empty')}
          </h3>
          <p className="text-muted">
            {t('browse.emptyHint')}
          </p>
          {hasAny && (
            <button type="button" onClick={clearAll} className="btn-ghost">
              <X className="h-4 w-4" />
              {t('browse.clear')}
            </button>
          )}
        </div>
      ) : (
        <div ref={listRef} className="mt-8">
          <div
            style={{
              height: rowVirtualizer.getTotalSize(),
              position: 'relative',
              width: '100%',
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const row = rows[virtualRow.index]
              if (!row) return null
              return (
                <div
                  key={virtualRow.key}
                  ref={rowVirtualizer.measureElement}
                  data-index={virtualRow.index}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    transform: `translateY(${virtualRow.start - scrollMargin}px)`,
                  }}
                >
                  <div
                    className="grid gap-6 pb-6"
                    style={{
                      gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
                    }}
                  >
                    {row.map((q) => (
                      <QuoteCard key={q.id} quote={q} variant="list" />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </section>
  )
}
