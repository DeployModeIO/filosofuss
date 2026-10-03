import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { useLocalStorage } from '@/lib/storage'
import { translate, type Locale } from '@/i18n/strings'

export type Theme = 'dark' | 'light' | 'paper'

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
  /** Modo zen / lectura enfocada: id de la cita abierta, o null si está cerrado. */
  zenQuoteId: string | null
  openZen: (id: string) => void
  closeZen: () => void
}

const AppContext = createContext<AppContextValue | undefined>(undefined)

// Preferencia GLOBAL del usuario: el modo por defecto en todos los proyectos es
// CLARO (patrón brigada-nfpa10). El toggle dark→light→paper y el valor
// persistido en localStorage siguen mandando sobre este default.
const DEFAULT_THEME: Theme = 'light'

// Guardas de forma para los valores persistidos (COD-04): un localStorage
// corrupto o de otra versión degrada al valor por defecto en lugar de violar
// el tipo en runtime.
const isTheme = (v: unknown): v is Theme => v === 'dark' || v === 'light' || v === 'paper'
const isStringArray = (v: unknown): v is string[] =>
  Array.isArray(v) && v.every((x) => typeof x === 'string')
const isLocale = (v: unknown): v is Locale => v === 'es' || v === 'en'

export function AppProvider({ children }: { children: ReactNode }) {
  // NOTE: useLocalStorage's setter is typed (value: T) => void and does NOT
  // accept functional updaters, so all actions compute the next value from the
  // current state in the closure rather than via (prev) => next.
  const [theme, setThemeState] = useLocalStorage<Theme>(
    'filosofuss:theme',
    DEFAULT_THEME,
    isTheme,
  )
  const [favorites, setFavorites] = useLocalStorage<string[]>(
    'filosofuss:favorites',
    [],
    isStringArray,
  )
  const [locale, setLocale] = useLocalStorage<Locale>(
    'filosofuss:locale',
    'es',
    isLocale,
  )
  const [zenQuoteId, setZenQuoteId] = useState<string | null>(null)

  // Apply theme class to <html> whenever it changes (and on first mount).
  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('light', 'paper')
    if (theme === 'light') {
      root.classList.add('light')
    } else if (theme === 'paper') {
      root.classList.add('paper')
    }
    const meta = document.querySelector('meta[name="theme-color"]')
    meta?.setAttribute(
      'content',
      theme === 'light' ? '#f9f7f3' : theme === 'paper' ? '#f2ead9' : '#0a0a0f',
    )
  }, [theme])

  // Keep <html lang> in sync with the active UI locale.
  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  const toggleTheme = useCallback(() => {
    setThemeState(theme === 'dark' ? 'light' : theme === 'light' ? 'paper' : 'dark')
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

  const openZen = useCallback((id: string) => setZenQuoteId(id), [])
  const closeZen = useCallback(() => setZenQuoteId(null), [])

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
      zenQuoteId,
      openZen,
      closeZen,
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
      zenQuoteId,
      openZen,
      closeZen,
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
