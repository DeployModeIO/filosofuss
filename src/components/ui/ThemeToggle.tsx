import { m } from 'framer-motion'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { Moon, Sun, FileText } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import type { Theme } from '@/context/AppContext'

interface ThemeOption {
  value: Theme
  icon: LucideIcon
  key: string
}

const OPTIONS: ThemeOption[] = [
  { value: 'dark', icon: Moon, key: 'theme.dark' },
  { value: 'light', icon: Sun, key: 'theme.light' },
  { value: 'paper', icon: FileText, key: 'theme.paper' },
]

export default function ThemeToggle() {
  const { theme, setTheme, t } = useApp()
  const reduceMotion = usePrefersReducedMotion()

  return (
    <div
      role="radiogroup"
      aria-label={t('theme.label')}
      className="glass-strong flex items-center rounded-full p-1"
    >
      {OPTIONS.map((option) => {
        const Icon = option.icon
        const active = theme === option.value
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={t(option.key)}
            title={t(option.key)}
            onClick={() => setTheme(option.value)}
            className="relative grid h-11 w-11 place-items-center rounded-full transition-colors duration-200 focus-visible:text-accent"
          >
            {active &&
              (reduceMotion ? (
                <span className="absolute inset-0 rounded-full bg-gradient-to-br from-accent to-accent-2 shadow-glow" />
              ) : (
                <m.span
                  layoutId="theme-pill"
                  className="absolute inset-0 rounded-full bg-gradient-to-br from-accent to-accent-2 shadow-glow"
                  transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                />
              ))}
            <Icon
              size={16}
              aria-hidden="true"
              className={active ? 'relative z-10 text-[#0a0a12]' : 'relative z-10 text-muted hover:text-content'}
            />
          </button>
        )
      })}
    </div>
  )
}

