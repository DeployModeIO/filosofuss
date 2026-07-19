import { useApp } from '@/context/AppContext'

export function useTheme() {
  const { theme, toggleTheme, setTheme } = useApp()
  return { theme, toggleTheme, setTheme }
}
