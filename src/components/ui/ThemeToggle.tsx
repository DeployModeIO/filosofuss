import { AnimatePresence, motion } from 'framer-motion'
import { Moon, Sun } from 'lucide-react'
import { useApp } from '@/context/AppContext'

export default function ThemeToggle() {
  const { theme, toggleTheme, t } = useApp()
  const isLight = theme === 'light'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isLight ? t('theme.toDark') : t('theme.toLight')}
      title={isLight ? t('theme.toDark') : t('theme.toLight')}
      className="glass-strong grid h-10 w-10 place-items-center rounded-full text-content transition-colors duration-300 hover:text-accent focus-visible:text-accent"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={theme}
          initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
          className="grid place-items-center"
        >
          {isLight ? (
            <Sun size={18} aria-hidden="true" />
          ) : (
            <Moon size={18} aria-hidden="true" />
          )}
        </motion.span>
      </AnimatePresence>
    </button>
  )
}
