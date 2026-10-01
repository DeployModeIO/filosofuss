import { Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useApp } from '@/context/AppContext'

export interface SearchBarProps {
  query: string
  onQuery: (q: string) => void
  autoFocus?: boolean
}

export default function SearchBar({
  query,
  onQuery,
  autoFocus = false,
}: SearchBarProps) {
  const { t } = useApp()
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
        placeholder={t('search.placeholder')}
        aria-label={t('search.aria')}
        className="w-full bg-transparent text-content placeholder:text-muted focus:outline-none"
      />
      {query.length > 0 && (
        <button
          type="button"
          onClick={() => onQuery('')}
          aria-label={t('search.clear')}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-muted transition-colors hover:text-content"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      )}
    </div>
  )
}
