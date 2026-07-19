// Sistema de internacionalización (i18n) de Filosofuss.
// Solo traduce la INTERFAZ (no las citas, que permanecen en español).
// Mantén las claves sincronizadas entre `es` y `en`.

export type Locale = 'es' | 'en'

export const LOCALES: Locale[] = ['es', 'en']

type Dict = Record<string, string>

const es: Dict = {
  // Navegación
  'nav.inicio': 'Inicio',
  'nav.explorar': 'Explorar',
  'nav.filosofos': 'Filósofos',
  'nav.favoritos': 'Favoritos',
  'nav.favoritesCount': '{n} favoritos',
  'nav.openMenu': 'Abrir menú',
  'nav.closeMenu': 'Cerrar menú',
  'nav.home': 'Filosofuss — ir al inicio',

  // Tema
  'theme.toLight': 'Activar modo claro',
  'theme.toDark': 'Activar modo oscuro',

  // Idioma
  'lang.toggle': 'Cambiar idioma',

  // Audio ambiente
  'audio.play': 'Reproducir música',
  'audio.pause': 'Pausar música',
  'audio.open': 'Abrir reproductor',
  'audio.close': 'Cerrar reproductor',
  'audio.prev': 'Pista anterior',
  'audio.next': 'Siguiente pista',
  'audio.mute': 'Silenciar',
  'audio.unmute': 'Activar sonido',
  'audio.volume': 'Volumen',
  'audio.aria': 'Reproductor de música ambiente',

  // Hero
  'hero.tagline': 'Sabiduría eterna',
  'hero.subtitle': 'Donde la filosofía cobra vida. Sumérgete en los pensamientos que dieron forma a la humanidad.',
  'hero.exploreQuotes': 'Explorar citas',
  'hero.meetPhilosophers': 'Conocer a los filósofos',
  'hero.meta': 'Sabiduría eterna · {n} citas · {m} filósofos',

  // Home
  'home.featured.label': 'Una selección',
  'home.featured.title': 'Citas destacadas',
  'home.featured.titleA': 'Citas ',
  'home.featured.titleB': 'destacadas',
  'home.featured.subtitle': 'Seis pensamientos escogidos al azar para despertar la reflexión.',
  'home.exploreAll': 'Explorar las {n} citas',
  'home.meetPhilosophers': 'Conocer a los filósofos',

  // Cita del día
  'qod.label': 'Cita del día',
  'qod.cta': 'Explorar más sabiduría',
  'qod.listen': 'Escuchar la cita del día',
  'qod.stop': 'Detener',
  'qod.listenShort': 'Escuchar',
  'qod.anon': 'Anónimo',

  // QuoteCard
  'card.favAdd': 'Añadir a favoritos',
  'card.favRemove': 'Quitar de favoritos',
  'card.copied': 'Copiado',
  'card.copy': 'Copiar cita',
  'card.share': 'Compartir cita',
  'card.listen': 'Escuchar cita',
  'card.stop': 'Detener narración',
  'card.anon': 'Anónimo',
  'card.shareTitle': 'Filosofuss',

  // Explorar
  'browse.label': 'Catálogo',
  'browse.titleA': 'Explora el ',
  'browse.titleB': 'universo filosófico',
  'browse.subtitle': 'Filtra por era, escuela o tema, o busca entre todas las citas del corpus.',
  'browse.showing': 'Mostrando ',
  'browse.quote': 'cita',
  'browse.quotes': 'citas',
  'browse.removeFilter': 'Quitar {label}',
  'browse.empty': 'No se encontraron citas',
  'browse.emptyHint': 'Prueba con otro término o limpia los filtros activos.',
  'browse.clear': 'Limpiar búsqueda',

  // Favoritos
  'fav.label': 'Tu colección',
  'fav.title': 'Favoritos',
  'fav.empty': 'Aún no has guardado ninguna cita.',
  'fav.savedOne': 'cita guardada.',
  'fav.savedMany': 'citas guardadas.',
  'fav.emptyTitle': 'Aún no has guardado citas',
  'fav.emptyHint': 'Explora el corpus y marca con el corazón las citas que más te conmuevan.',
  'fav.explore': 'Explorar citas',
  'fav.clear': 'Vaciar favoritos',
  'fav.confirm': '¿Vaciar todos tus favoritos? Esta acción no se puede deshacer.',

  // Filósofos
  'wall.label': 'Panteón',
  'wall.titleA': 'Los ',
  'wall.titleB': 'filósofos',
  'wall.subtitle': '{n} pensadores que modelaron la historia de las ideas. Pulsa cualquiera para conocer su obra.',
  'wall.quote': 'cita',
  'wall.quotes': 'citas',
  'wall.sheetOf': 'Ficha de {name}',
  'wall.close': 'Cerrar',
  'wall.quotesCount': 'Citas ({n})',

  // Buscador y filtros
  'search.placeholder': 'Buscar citas, filósofos, temas…',
  'search.aria': 'Buscar citas',
  'search.clear': 'Limpiar búsqueda',
  'filter.era': 'Era',
  'filter.school': 'Escuela',
  'filter.tema': 'Tema',
  'filter.clear': 'Limpiar filtros',
  'filter.label': 'Filtros',

  // Footer
  'footer.quote': 'La sabiduría no se posee, se persigue.',
  'footer.made': 'Hecho con',
  'footer.andReact': 'y React',
  'footer.meta': '{n} citas · {m} filósofos · © {y} Filosofuss',
}

const en: Dict = {
  // Navigation
  'nav.inicio': 'Home',
  'nav.explorar': 'Explore',
  'nav.filosofos': 'Philosophers',
  'nav.favoritos': 'Favorites',
  'nav.favoritesCount': '{n} favorites',
  'nav.openMenu': 'Open menu',
  'nav.closeMenu': 'Close menu',
  'nav.home': 'Filosofuss — go to home',

  // Theme
  'theme.toLight': 'Switch to light mode',
  'theme.toDark': 'Switch to dark mode',

  // Language
  'lang.toggle': 'Change language',

  // Ambient audio
  'audio.play': 'Play music',
  'audio.pause': 'Pause music',
  'audio.open': 'Open player',
  'audio.close': 'Close player',
  'audio.prev': 'Previous track',
  'audio.next': 'Next track',
  'audio.mute': 'Mute',
  'audio.unmute': 'Unmute',
  'audio.volume': 'Volume',
  'audio.aria': 'Ambient music player',

  // Hero
  'hero.tagline': 'Eternal wisdom',
  'hero.subtitle': 'Where philosophy comes alive. Immerse yourself in the thoughts that shaped humanity.',
  'hero.exploreQuotes': 'Explore quotes',
  'hero.meetPhilosophers': 'Meet the philosophers',
  'hero.meta': 'Eternal wisdom · {n} quotes · {m} philosophers',

  // Home
  'home.featured.label': 'A selection',
  'home.featured.title': 'Featured quotes',
  'home.featured.titleA': 'Featured ',
  'home.featured.titleB': 'quotes',
  'home.featured.subtitle': 'Six thoughts chosen at random to spark reflection.',
  'home.exploreAll': 'Explore all {n} quotes',
  'home.meetPhilosophers': 'Meet the philosophers',

  // Quote of the day
  'qod.label': 'Quote of the day',
  'qod.cta': 'Explore more wisdom',
  'qod.listen': 'Listen to the daily quote',
  'qod.stop': 'Stop',
  'qod.listenShort': 'Listen',
  'qod.anon': 'Anonymous',

  // QuoteCard
  'card.favAdd': 'Add to favorites',
  'card.favRemove': 'Remove from favorites',
  'card.copied': 'Copied',
  'card.copy': 'Copy quote',
  'card.share': 'Share quote',
  'card.listen': 'Listen to quote',
  'card.stop': 'Stop narration',
  'card.anon': 'Anonymous',
  'card.shareTitle': 'Filosofuss',

  // Explore
  'browse.label': 'Catalog',
  'browse.titleA': 'Explore the ',
  'browse.titleB': 'philosophical universe',
  'browse.subtitle': 'Filter by era, school or topic, or search across all quotes in the corpus.',
  'browse.showing': 'Showing ',
  'browse.quote': 'quote',
  'browse.quotes': 'quotes',
  'browse.removeFilter': 'Remove {label}',
  'browse.empty': 'No quotes found',
  'browse.emptyHint': 'Try another term or clear the active filters.',
  'browse.clear': 'Clear search',

  // Favorites
  'fav.label': 'Your collection',
  'fav.title': 'Favorites',
  'fav.empty': 'You have not saved any quote yet.',
  'fav.savedOne': 'quote saved.',
  'fav.savedMany': 'quotes saved.',
  'fav.emptyTitle': 'You have not saved quotes yet',
  'fav.emptyHint': 'Explore the corpus and mark with a heart the quotes that move you most.',
  'fav.explore': 'Explore quotes',
  'fav.clear': 'Clear favorites',
  'fav.confirm': 'Clear all your favorites? This action cannot be undone.',

  // Philosophers
  'wall.label': 'Pantheon',
  'wall.titleA': 'The ',
  'wall.titleB': 'philosophers',
  'wall.subtitle': '{n} thinkers who shaped the history of ideas. Tap any to discover their work.',
  'wall.quote': 'quote',
  'wall.quotes': 'quotes',
  'wall.sheetOf': 'Profile of {name}',
  'wall.close': 'Close',
  'wall.quotesCount': 'Quotes ({n})',

  // Search and filters
  'search.placeholder': 'Search quotes, philosophers, topics…',
  'search.aria': 'Search quotes',
  'search.clear': 'Clear search',
  'filter.era': 'Era',
  'filter.school': 'School',
  'filter.tema': 'Topic',
  'filter.clear': 'Clear filters',
  'filter.label': 'Filters',

  // Footer
  'footer.quote': 'Wisdom is not possessed, it is pursued.',
  'footer.made': 'Made with',
  'footer.andReact': 'and React',
  'footer.meta': '{n} quotes · {m} philosophers · © {y} Filosofuss',
}

const dictionaries: Record<Locale, Dict> = { es, en }

/**
 * Traduce una clave y reemplaza {placeholders} con los valores dados.
 * Si la clave no existe, devuelve la propia clave (útil para depurar).
 */
export function translate(
  locale: Locale,
  key: string,
  vars?: Record<string, string | number>,
): string {
  let text = dictionaries[locale][key] ?? dictionaries.es[key] ?? key
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v))
    }
  }
  return text
}
