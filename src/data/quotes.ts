import { philosophers } from "./philosophers";
import type { Philosopher, Quote, QuoteEn, Tag } from "@/types";
import { hashCode, normalize, pickRandom } from "@/lib/utils";

/**
 * Corpus de citas de Filosofuss.
 *
 * El corpus (226 citas base + 4 lotes) se carga de forma diferida mediante
 * `loadQuotes()` (Task B3). Este módulo expone las funciones síncronas de
 * consulta sobre el corpus activo: el `QuotesProvider` aplica el corpus una
 * vez cargado y los consumidores se renderizan después de `ready === true`.
 *
 * Las citas están en español y se han seleccionado entre los aforismos más
 * célebres y mejor documentados de cada autor. Cuando una formulación es una
 * paráfrasis fiel (no una cita literal) o su atribución es discutida por la
 * filología moderna, se intenta conservar la idea reconocida.
 */

/**
 * Corpus activo. Se mantiene como array mutable exportado por compatibilidad
 * con consumidores que sólo leen `quotes.length` (Home, Footer). Se rellena en
 * `applyQuoteCorpus()` cuando termina la carga asíncrona.
 */
export const quotes: Quote[] = [];

/** Traducciones EN del corpus activo (vacío en locale `es`). */
let quoteTranslations: Record<string, QuoteEn> = {};

/** Índices derivados, reconstruidos una sola vez por carga de corpus. */
let quoteById = new Map<string, Quote>();
let quotesByPhilosopher = new Map<string, Quote[]>();

interface QuoteSearchEntry {
  quote: Quote;
  /** Texto normalizado (sin acentos ni mayúsculas) precalculado. */
  haystack: string;
}

let searchIndex: QuoteSearchEntry[] = [];

/** Índice estático filósofo → datos (no depende del corpus de citas). */
const philosopherById = new Map<string, Philosopher>(
  philosophers.map((p): [string, Philosopher] => [p.id, p]),
);

/** Devuelve valores únicos y ordenados (orden amigable con el español). */
function uniqueSorted<T extends string>(values: readonly T[]): T[] {
  return Array.from(new Set(values)).sort((a, b) =>
    a.localeCompare(b, "es", { sensitivity: "base" }),
  );
}

/**
 * Aplica el corpus cargado por `loadQuotes()` y reconstruye los índices
 * derivados (id → cita, filósofo → citas, índice de búsqueda normalizado).
 * Es el único punto de escritura del corpus en runtime.
 */
export function applyQuoteCorpus(
  nextQuotes: Quote[],
  translations: Record<string, QuoteEn> | null,
): void {
  quotes.length = 0;
  for (const q of nextQuotes) quotes.push(q);

  quoteTranslations = translations ?? {};

  const byId = new Map<string, Quote>();
  const byPhilosopher = new Map<string, Quote[]>();
  const search: QuoteSearchEntry[] = [];
  const tags: Tag[] = [];

  for (const quote of nextQuotes) {
    byId.set(quote.id, quote);

    const bucket = byPhilosopher.get(quote.philosopherId);
    if (bucket) bucket.push(quote);
    else byPhilosopher.set(quote.philosopherId, [quote]);

    const author = philosopherById.get(quote.philosopherId);
    search.push({
      quote,
      haystack: normalize(
        [
          quote.text,
          quote.source ?? "",
          quote.tags.join(" "),
          author?.name ?? "",
          author?.fullName ?? "",
          author?.school ?? "",
          author?.era ?? "",
        ].join(" "),
      ),
    });

    for (const tag of quote.tags) tags.push(tag);
  }

  quoteById = byId;
  quotesByPhilosopher = byPhilosopher;
  searchIndex = search;

  const sortedTags = uniqueSorted(tags);
  allTags.length = 0;
  for (const tag of sortedTags) allTags.push(tag);
}

/** Devuelve el filósofo cuyo id coincide, o `undefined`. */
export function getPhilosopherById(id: string): Philosopher | undefined {
  return philosopherById.get(id);
}

/** Devuelve todas las citas de un filósofo, en el orden del corpus. */
export function getQuotesByPhilosopher(philosopherId: string): Quote[] {
  return quotesByPhilosopher.get(philosopherId) ?? [];
}

/** Devuelve la cita con ese id, o `undefined`. */
export function getQuoteById(id: string): Quote | undefined {
  return quoteById.get(id);
}

/**
 * Texto de una cita en el idioma solicitado.
 * En inglés usa la traducción cargada; si no existe, cae al texto en español.
 */
export function getQuoteText(quote: Quote, locale: "es" | "en"): string {
  if (locale === "en") {
    const en = quoteTranslations[quote.id];
    if (en?.text) return en.text;
  }
  return quote.text;
}

/**
 * Obra/origen de una cita en el idioma solicitado.
 * En inglés usa la traducción cargada (si la tiene); si no, cae al source ES.
 */
export function getQuoteSource(
  quote: Quote,
  locale: "es" | "en",
): string | undefined {
  if (locale === "en") {
    const en = quoteTranslations[quote.id];
    if (en?.source) return en.source;
  }
  return quote.source;
}

/**
 * Devuelve una cita aleatoria. Si se pasa `excludeId`, no devolverá esa cita
 * (salvo que sea la única disponible).
 */
export function getRandomQuote(excludeId?: string): Quote {
  if (excludeId === undefined) return pickRandom(quotes);
  const pool = quotes.filter((q) => q.id !== excludeId);
  return pickRandom(pool.length > 0 ? pool : quotes);
}

/**
 * Cita del día: determinista para una misma fecha de calendario.
 * Combina el año-mes-día en una semilla mediante hashCode y selecciona
 * `quotes[seed % length]`. Siempre devuelve la misma cita para el mismo día.
 */
export function getQuoteOfTheDay(date: Date = new Date()): Quote {
  const y = date.getFullYear();
  const m = date.getMonth() + 1; // getMonth() es 0-based.
  const d = date.getDate();
  const seed = hashCode(`${y}-${m}-${d}`);
  const len = quotes.length;
  const index = ((seed % len) + len) % len; // módulo seguro para negativos.
  return quotes[index];
}

/** Eras distintas presentes en el catálogo, ordenadas. */
export const allEras: string[] = uniqueSorted(philosophers.map((p) => p.era));

/** Escuelas/movimientos distintos, ordenados. */
export const allSchools: string[] = uniqueSorted(
  philosophers.map((p) => p.school),
);

/**
 * Temas del vocabulario controlado realmente usados, ordenados. Se rellena al
 * aplicar el corpus (array mutable por compatibilidad con FilterPanel).
 */
export const allTags: Tag[] = [];

/**
 * Búsqueda libre: insensible a mayúsculas y a acentos. Busca en el texto de
 * la cita, el autor (nombre y nombre completo), escuela, era, obra y temas.
 * Usa el índice normalizado precalculado (Task B6) en lugar de normalizar el
 * corpus en cada consulta. Devuelve todas las coincidencias en orden.
 */
export function searchQuotes(query: string): Quote[] {
  const needle = normalize(query.trim());
  if (needle.length === 0) return [];
  const results: Quote[] = [];
  for (const entry of searchIndex) {
    if (entry.haystack.includes(needle)) results.push(entry.quote);
  }
  return results;
}
