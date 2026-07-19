import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { quotes } from '@/data/quotes'
import { philosophers } from '@/data/philosophers'
import Logo from './Logo'

const LINKS = [
  { to: '/', label: 'Inicio' },
  { to: '/explorar', label: 'Explorar' },
  { to: '/filosofos', label: 'Filósofos' },
  { to: '/favoritos', label: 'Favoritos' },
]

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-line-soft bg-bg-2">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-12 text-center sm:px-6">
        <Logo size="md" />

        <p className="font-serif text-lg italic text-muted sm:text-xl">
          La sabiduría no se posee, se persigue.
        </p>

        <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          {LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="link-underline text-sm text-muted transition-colors hover:text-accent"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <p className="flex items-center gap-1.5 text-xs text-muted">
          Hecho con
          <Heart size={12} className="fill-accent-3 text-accent-3" aria-hidden="true" />
          y React
        </p>

        <p className="text-xs text-muted">
          {quotes.length} citas · {philosophers.length} filósofos · © {year} Filosofuss
        </p>
      </div>
    </footer>
  )
}
