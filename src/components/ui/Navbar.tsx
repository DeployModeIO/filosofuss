import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Heart, Menu, X } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useApp } from '@/context/AppContext'
import Logo from './Logo'
import ThemeToggle from './ThemeToggle'
import LanguageToggle from './LanguageToggle'

interface NavItem {
  to: string
  key: string
}

const NAV_ITEMS: NavItem[] = [
  { to: '/', key: 'nav.inicio' },
  { to: '/explorar', key: 'nav.explorar' },
  { to: '/filosofos', key: 'nav.filosofos' },
  { to: '/favoritos', key: 'nav.favoritos' },
]

function DesktopLink({ item, favoritesCount }: { item: NavItem; favoritesCount: number }) {
  const { t } = useApp()
  const isFav = item.to === '/favoritos'
  return (
    <NavLink
      to={item.to}
      end={item.to === '/'}
      className={({ isActive }) =>
        cn(
          'link-underline relative inline-flex items-center gap-1.5 py-1 text-sm font-medium transition-colors duration-200',
          isActive ? 'text-accent' : 'text-muted hover:text-content',
        )
      }
    >
      {({ isActive }) => (
        <>
          <span>{t(item.key)}</span>
          {isFav && (
            <Heart
              size={14}
              aria-hidden="true"
              className={cn('transition-colors', isActive ? 'fill-current text-accent' : '')}
            />
          )}
          {isFav && favoritesCount > 0 && (
            <span
              aria-label={t('nav.favoritesCount', { n: favoritesCount })}
              className="grid h-4 min-w-[1rem] place-items-center rounded-full bg-accent px-1 text-[10px] font-bold leading-none text-bg"
            >
              {favoritesCount}
            </span>
          )}
          {isActive && (
            <span
              aria-hidden="true"
              className="absolute -bottom-0.5 left-0 h-0.5 w-full rounded-full bg-gradient-to-r from-accent to-accent-2"
            />
          )}
        </>
      )}
    </NavLink>
  )
}

function MobileLink({
  item,
  favoritesCount,
  onNavigate,
}: {
  item: NavItem
  favoritesCount: number
  onNavigate: () => void
}) {
  const { t } = useApp()
  const isFav = item.to === '/favoritos'
  return (
    <NavLink
      to={item.to}
      end={item.to === '/'}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-2 rounded-xl px-4 py-3 text-base font-medium transition-colors',
          isActive ? 'bg-glass text-accent' : 'text-muted hover:bg-glass hover:text-content',
        )
      }
    >
      {({ isActive }) => (
        <>
          <span>{t(item.key)}</span>
          {isFav && (
            <Heart
              size={16}
              aria-hidden="true"
              className={cn('transition-colors', isActive ? 'fill-current text-accent' : '')}
            />
          )}
          {isFav && favoritesCount > 0 && (
            <span className="ml-auto grid h-5 min-w-[1.25rem] place-items-center rounded-full bg-accent px-1.5 text-[11px] font-bold leading-none text-bg">
              {favoritesCount}
            </span>
          )}
        </>
      )}
    </NavLink>
  )
}

export default function Navbar() {
  const { favoritesCount, t } = useApp()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={cn(
        'sticky top-0 z-50 border-b border-line-soft transition-all duration-300',
        scrolled ? 'glass-strong shadow-card' : 'glass',
      )}
    >
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Logo size="md" />

        <div className="hidden items-center gap-8 md:flex">
          {NAV_ITEMS.map((item) => (
            <DesktopLink key={item.to} item={item} favoritesCount={favoritesCount} />
          ))}
        </div>

        <div className="flex items-center gap-2">
          <LanguageToggle />
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? t('nav.closeMenu') : t('nav.openMenu')}
            aria-expanded={open}
            className="glass-strong grid h-10 w-10 place-items-center rounded-full text-content transition-colors hover:text-accent md:hidden"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={open ? 'x' : 'menu'}
                initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
                transition={{ duration: 0.2 }}
                className="grid place-items-center"
              >
                {open ? (
                  <X size={18} aria-hidden="true" />
                ) : (
                  <Menu size={18} aria-hidden="true" />
                )}
              </motion.span>
            </AnimatePresence>
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden border-t border-line-soft md:hidden"
          >
            <div className="glass-strong flex flex-col gap-1 px-3 py-3">
              {NAV_ITEMS.map((item) => (
                <MobileLink
                  key={item.to}
                  item={item}
                  favoritesCount={favoritesCount}
                  onNavigate={() => setOpen(false)}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
