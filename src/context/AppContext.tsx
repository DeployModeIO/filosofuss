import { createContext, useCallback, useContext, useEffect, useMemo } from 'react'
import type { ReactNode } from 'react'
import { useLocalStorage } from '@/lib/storage'

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

  // Apply theme class to <html> whenever it changes (and on first mount).
  useEffect(() => {
    const root = document.documentElement
    if (theme === 'light') root.classList.add('light')
    else root.classList.remove('light')
  }, [theme])

  const toggleTheme = useCallback(() => {
    setThemeState(theme === 'light' ? 'dark' : 'light')
  }, [theme, setThemeState])

  const setTheme = useCallback(
    (next: Theme) => {
      setThemeState(next)
    },
    [setThemeState],
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
