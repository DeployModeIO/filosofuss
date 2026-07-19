import { Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface SearchBarProps {
  query: string
  onQuery: (q: string) => void
  placeholder?: string
  autoFocus?: boolean
}

export default function SearchBar({
  query,
  onQuery,
  placeholder = 'Buscar citas, filósofos, temas…',
  autoFocus = false,
}: SearchBarProps) {
  return (
    <div
      className={cn(
        'glass flex items-center gap-3 rounded-full px-5 py-3 transition-shadow',
        'focus-within:ring-2 focus-within:ring-accent/40',
      )}
    >
      <Search className="h-5 w-5 shrink-0 text-muted" aria-hidden="true" />
      <input
        type="text"
        value={query}
        autoFocus={autoFocus}
        onChange={(e) => onQuery(e.target.value)}
        placeholder={placeholder}
        aria-label="Buscar citas"
        className="w-full bg-transparent text-content placeholder:text-muted focus:outline-none"
      />
      {query.length > 0 && (
        <button
          type="button"
          onClick={() => onQuery('')}
          aria-label="Limpiar búsqueda"
          className="shrink-0 rounded-full p-1 text-muted transition-colors hover:text-content"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
