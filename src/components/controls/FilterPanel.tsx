import { useId, useState } from 'react'
import { SlidersHorizontal, X } from 'lucide-react'
import { m, AnimatePresence } from 'framer-motion'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { cn } from '@/lib/utils'
import { allEras, allSchools, allTags } from '@/data/quotes'
import { localizeEra, localizeSchool } from '@/data/philosophers'
import { useApp } from '@/context/AppContext'
import type { Tag } from '@/types'

export interface FilterPanelProps {
  selectedEra: string | null
  selectedSchool: string | null
  selectedTag: Tag | null
  onEra: (v: string | null) => void
  onSchool: (v: string | null) => void
  onTag: (v: Tag | null) => void
  onClear: () => void
}

function Pill({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'rounded-full px-3.5 py-1.5 text-sm font-medium transition-all duration-200',
        active
          ? 'bg-gradient-to-br from-accent to-accent-2 text-[#0a0a12] shadow-glow'
          : 'glass text-muted hover:text-content',
      )}
    >
      {children}
    </button>
  )
}

/**
 * Grupo de filtros con semántica de grupo (UX-18): los pills se anuncian
 * agrupados bajo un `legend` visual enlazado con `aria-labelledby`. Las
 * opciones conservan su valor canónico (clave de filtro) y solo la etiqueta
 * visible se localiza.
 */
function FilterGroup<T extends string>({
  title,
  options,
  selected,
  onSelect,
  labelFor,
}: {
  title: string
  options: readonly T[]
  selected: T | null
  onSelect: (v: T | null) => void
  labelFor: (v: T) => string
}) {
  const labelId = useId()
  return (
    <div role="group" aria-labelledby={labelId} className="flex flex-col gap-2">
      <span
        id={labelId}
        className="text-xs font-semibold uppercase tracking-wider text-muted"
      >
        {title}
      </span>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <Pill
            key={opt}
            active={selected === opt}
            onClick={() => onSelect(selected === opt ? null : opt)}
          >
            {labelFor(opt)}
          </Pill>
        ))}
      </div>
    </div>
  )
}

export default function FilterPanel({
  selectedEra,
  selectedSchool,
  selectedTag,
  onEra,
  onSchool,
  onTag,
  onClear,
}: FilterPanelProps) {
  const { t, locale } = useApp()
  const reduceMotion = usePrefersReducedMotion()
  const [open, setOpen] = useState(false)
  const activeCount = [selectedEra, selectedSchool, selectedTag].filter(
    Boolean,
  ).length
  const hasFilters = activeCount > 0

  const groups = (
    <>
      <FilterGroup
        title={t('filter.era')}
        options={allEras}
        selected={selectedEra}
        onSelect={onEra}
        labelFor={(era) => localizeEra(era, locale)}
      />
      <FilterGroup
        title={t('filter.school')}
        options={allSchools}
        selected={selectedSchool}
        onSelect={onSchool}
        labelFor={(school) => localizeSchool(school, locale)}
      />
      <FilterGroup
        title={t('filter.tema')}
        options={allTags}
        selected={selectedTag}
        onSelect={onTag}
        labelFor={(tag) => t(`tag.${tag}`)}
      />
      {hasFilters && (
        <button
          type="button"
          onClick={onClear}
          className="btn-ghost self-start px-4 py-2 text-sm"
        >
          <X className="h-4 w-4" aria-hidden="true" />
          {t('filter.clear')}
        </button>
      )}
    </>
  )

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="btn-ghost self-start px-4 py-2 text-sm sm:hidden"
      >
        <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
        {t('filter.label')}
        {hasFilters && (
          <span className="ml-1 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent-2 px-1.5 text-xs text-[#0a0a12]">
            {activeCount}
          </span>
        )}
      </button>

      {/* Escritorio: siempre visible */}
      <div className="hidden flex-col gap-4 sm:flex">{groups}</div>

      {/* Móvil: colapsable */}
      <AnimatePresence initial={false}>
        {open && (
          <m.div
            key="mobile-filters"
            className="flex flex-col gap-4 overflow-hidden sm:hidden"
            initial={reduceMotion ? { opacity: 1 } : { height: 0, opacity: 0 }}
            animate={
              reduceMotion ? { opacity: 1 } : { height: 'auto', opacity: 1 }
            }
            exit={reduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.3, ease: 'easeInOut' }}
          >
            {groups}
          </m.div>
        )}
      </AnimatePresence>
    </div>
  )
}
