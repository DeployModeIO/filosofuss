import type { Quote, QuoteEn } from "@/types";
import { applyQuoteCorpus } from "./quotes";

export type QuoteLocale = "es" | "en";

/**
 * Carga diferida del corpus de citas (Task B3).
 *
 * Los módulos de datos (`quotesBase`, `quotesBatch1..4`, `quotesEn`) se
 * importan de forma dinámica para que Rollup emita chunks separados y el
 * corpus quede fuera del bundle inicial. Los módulos quedan cacheados por el
 * runtime, de modo que sucesivos cambios de idioma no re-descargan datos.
 */

let corpusPromise: Promise<Quote[]> | null = null;

function loadCorpus(): Promise<Quote[]> {
  if (corpusPromise === null) {
    corpusPromise = Promise.all([
      import("./quotesBase"),
      import("./quotesBatch1"),
      import("./quotesBatch2"),
      import("./quotesBatch3"),
      import("./quotesBatch4"),
    ]).then(([base, batch1, batch2, batch3, batch4]) => [
      ...base.quotesBase,
      ...batch1.quotesBatch1,
      ...batch2.quotesBatch2,
      ...batch3.quotesBatch3,
      ...batch4.quotesBatch4,
    ]);
  }
  return corpusPromise;
}

let translationsPromise: Promise<Record<string, QuoteEn>> | null = null;

function loadTranslations(): Promise<Record<string, QuoteEn>> {
  if (translationsPromise === null) {
    translationsPromise = import("./quotesEn").then((m) => m.quoteEnById);
  }
  return translationsPromise;
}

/**
 * Último idioma solicitado. Si una carga anterior termina después de que se
 * haya pedido otro idioma, se descarta para no sobrescribir el corpus activo.
 */
let requestedLocale: QuoteLocale | null = null;

/**
 * Carga el corpus del idioma indicado y lo deja activo para las consultas
 * síncronas de `quotes.ts`. Devuelve las citas cargadas.
 */
export async function loadQuotes(locale: QuoteLocale): Promise<Quote[]> {
  requestedLocale = locale;
  const corpus = await loadCorpus();
  const translations = locale === "en" ? await loadTranslations() : null;
  // Otra llamada más reciente pidió otro idioma: no aplicamos este resultado.
  if (requestedLocale !== locale) return corpus;
  applyQuoteCorpus(corpus, translations);
  return corpus;
}
