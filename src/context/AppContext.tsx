import { createContext, useCallback, useContext, useEffect, useMemo } from 'react'
import type { ReactNode } from 'react'
import { useLocalStorage } from '@/lib/storage'
import { translate, type Locale } from '@/i18n/strings'

export type Theme = 'dark' | 'light'

export interface AppContextValue {
  theme: Theme
  favorites: string[]
  favoritesCount: number
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
  isFavorite: (id: string) => boolean
  toggleFavorite: (id: string) => void
  addFavorite: (id: string) => void
  removeFavorite: (id: string) => void
  clearFavorites: () => void
  locale: Locale
  setLocale: (locale: Locale) => void
  toggleLocale: () => void
  /** Traduce una clave de UI al idioma actual (con placeholders opcionales). */
  t: (key: string, vars?: Record<string, string | number>) => string
}

const AppContext = createContext<AppContextValue | undefined>(undefined)

const prefersLight =
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-color-scheme: light)').matches

const DEFAULT_THEME: Theme = prefersLight ? 'light' : 'dark'

export function AppProvider({ children }: { children: ReactNode }) {
  // NOTE: useLocalStorage's setter is typed (value: T) => void and does NOT
  // accept functional updaters, so all actions compute the next value from the
  // current state in the closure rather than via (prev) => next.
  const [theme, setThemeState] = useLocalStorage<Theme>(
    'filosofuss:theme',
    DEFAULT_THEME,
  )
  const [favorites, setFavorites] = useLocalStorage<string[]>(
    'filosofuss:favorites',
    [],
  )
  const [locale, setLocale] = useLocalStorage<Locale>(
    'filosofuss:locale',
    'es',
  )

  // Apply theme class to <html> whenever it changes (and on first mount).
  useEffect(() => {
    const root = document.documentElement
    if (theme === 'light') {
      root.classList.add('light')
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#f9f7f3')
    } else {
      root.classList.remove('light')
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#07070f')
    }
  }, [theme])

  // Keep <html lang> in sync with the active UI locale.
  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  const toggleTheme = useCallback(() => {
    setThemeState(theme === 'light' ? 'dark' : 'light')
  }, [theme, setThemeState])

  const setTheme = useCallback(
    (next: Theme) => {
      setThemeState(next)
    },
    [setThemeState],
  )

  const toggleLocale = useCallback(() => {
    setLocale(locale === 'es' ? 'en' : 'es')
  }, [locale, setLocale])

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) =>
      translate(locale, key, vars),
    [locale],
  )

  const isFavorite = useCallback((id: string) => favorites.includes(id), [favorites])

  const toggleFavorite = useCallback(
    (id: string) => {
      setFavorites(
        favorites.includes(id)
          ? favorites.filter((f) => f !== id)
          : [...favorites, id],
      )
    },
    [favorites, setFavorites],
  )

  const addFavorite = useCallback(
    (id: string) => {
      setFavorites(favorites.includes(id) ? favorites : [...favorites, id])
    },
    [favorites, setFavorites],
  )

  const removeFavorite = useCallback(
    (id: string) => {
      setFavorites(favorites.filter((f) => f !== id))
    },
    [favorites, setFavorites],
  )

  const clearFavorites = useCallback(() => {
    setFavorites([])
  }, [setFavorites])

  const value = useMemo<AppContextValue>(
    () => ({
      theme,
      favorites,
      favoritesCount: favorites.length,
      toggleTheme,
      setTheme,
      isFavorite,
      toggleFavorite,
      addFavorite,
      removeFavorite,
      clearFavorites,
      locale,
      setLocale,
      toggleLocale,
      t,
    }),
    [
      theme,
      favorites,
      toggleTheme,
      setTheme,
      isFavorite,
      toggleFavorite,
      addFavorite,
      removeFavorite,
      clearFavorites,
      locale,
      setLocale,
      toggleLocale,
      t,
    ],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext)
  if (!ctx) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return ctx
}
