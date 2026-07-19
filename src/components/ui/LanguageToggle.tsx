import { useApp } from '@/context/AppContext'

export default function LanguageToggle() {
  const { locale, toggleLocale } = useApp()
  const next = locale === 'es' ? 'EN' : 'ES'

  return (
    <button
      type="button"
      onClick={toggleLocale}
      aria-label="Cambiar idioma"
      title="Cambiar idioma"
      className="glass-strong grid h-10 min-w-[2.5rem] place-items-center rounded-full px-2 text-xs font-bold uppercase tracking-wider text-content transition-colors duration-300 hover:text-accent focus-visible:text-accent"
    >
      {next}
    </button>
  )
}
