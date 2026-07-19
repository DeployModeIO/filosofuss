import { useState } from 'react'
import { SlidersHorizontal, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { allEras, allSchools, allTags } from '@/data/quotes'

const reduceMotion =
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

export interface FilterPanelProps {
  selectedEra: string | null
  selectedSchool: string | null
  selectedTag: string | null
  onEra: (v: string | null) => void
  onSchool: (v: string | null) => void
  onTag: (v: string | null) => void
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

function FilterGroup({
  title,
  options,
  selected,
  onSelect,
}: {
  title: string
  options: string[]
  selected: string | null
  onSelect: (v: string | null) => void
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-semibold uppercase tracking-wider text-muted">
        {title}
      </span>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <Pill
            key={opt}
            active={selected === opt}
            onClick={() => onSelect(selected === opt ? null : opt)}
          >
            {opt}
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
  const [open, setOpen] = useState(false)
  const activeCount = [selectedEra, selectedSchool, selectedTag].filter(
    Boolean,
  ).length
  const hasFilters = activeCount > 0

  const groups = (
    <>
      <FilterGroup
        title="Era"
        options={allEras}
        selected={selectedEra}
        onSelect={onEra}
      />
      <FilterGroup
        title="Escuela"
        options={allSchools}
        selected={selectedSchool}
        onSelect={onSchool}
      />
      <FilterGroup
        title="Tema"
        options={allTags}
        selected={selectedTag}
        onSelect={onTag}
      />
      {hasFilters && (
        <button
          type="button"
          onClick={onClear}
          className="btn-ghost self-start px-4 py-2 text-sm"
        >
          <X className="h-4 w-4" />
          Limpiar filtros
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
        <SlidersHorizontal className="h-4 w-4" />
        Filtros
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
          <motion.div
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
