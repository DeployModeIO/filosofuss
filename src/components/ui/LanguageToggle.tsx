import { useApp } from '@/context/AppContext'

export default function LanguageToggle() {
  const { locale, toggleLocale, t } = useApp()
  const next = locale === 'es' ? 'EN' : 'ES'
  // La etiqueta usa el diccionario activo e indica el idioma destino (UX-19).
  const label = `${t('lang.toggle')}: ${next}`

  return (
    <button
      type="button"
      onClick={toggleLocale}
      aria-label={label}
      title={label}
      className="glass-strong grid h-10 min-w-[2.5rem] place-items-center rounded-full px-2 text-xs font-bold uppercase tracking-wider text-content transition-colors duration-300 hover:text-accent focus-visible:text-accent"
    >
      {next}
    </button>
  )
}
