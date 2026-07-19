import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { quotes } from '@/data/quotes'
import { philosophers } from '@/data/philosophers'
import { useApp } from '@/context/AppContext'
import Logo from './Logo'

export default function Footer() {
  const { t } = useApp()
  const year = new Date().getFullYear()

  const LINKS = [
    { to: '/', label: t('nav.inicio') },
    { to: '/explorar', label: t('nav.explorar') },
    { to: '/filosofos', label: t('nav.filosofos') },
    { to: '/favoritos', label: t('nav.favoritos') },
  ]

  return (
    <footer className="border-t border-line-soft bg-bg-2">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-12 text-center sm:px-6">
        <Logo size="md" />

        <p className="font-serif text-lg italic text-muted sm:text-xl">
          {t('footer.quote')}
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
          {t('footer.made')}
          <Heart size={12} className="fill-accent-3 text-accent-3" aria-hidden="true" />
          {t('footer.andReact')}
        </p>

        <p className="text-xs text-muted">
          {t('footer.meta', { n: quotes.length, m: philosophers.length, y: year })}
        </p>
      </div>
    </footer>
  )
}
