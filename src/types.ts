// Tipos centrales de Filosofuss.
// Otros módulos confían en este contrato de forma literal: no modificar
// la firma pública sin coordinar el cambio con el resto del proyecto.

export type Era =
  | "Antigua Grecia"
  | "Antigua Roma"
  | "Antigua China"
  | "Tradición India"
  | "Edad Media"
  | "Renacimiento"
  | "Racionalismo"
  | "Empirismo"
  | "Ilustración"
  | "Idealismo alemán"
  | "Siglo XIX"
  | "Pragmatismo"
  | "Siglo XX"
  | "Contemporáneo";

/** Vocabulario controlado de temas (1–3 por cita, siempre en minúsculas). */
export type Tag =
  | "vida"
  | "muerte"
  | "conocimiento"
  | "sabiduría"
  | "felicidad"
  | "virtud"
  | "tiempo"
  | "amor"
  | "libertad"
  | "verdad"
  | "poder"
  | "dios"
  | "alma"
  | "naturaleza"
  | "sufrimiento"
  | "ética"
  | "existencia"
  | "razón"
  | "deseo"
  | "cambio"
  | "esperanza"
  | "miedo"
  | "mente"
  | "justicia";

/**
 * Par de cadenas equivalentes en español e inglés.
 * Se usa para los vocabularios controlados que no son metadatos de filósofo
 * (p. ej. las etiquetas de los temas).
 */
export interface Localized {
  es: string;
  en: string;
}

/**
 * Metadatos bilingües de un filósofo.
 *
 * `era` y `school` se conservan como la clave canónica en español porque son
 * las que usan los filtros (`BrowseQuotes`) y las búsquedas; cada campo visible
 * tiene su pareja `*En` con la traducción al inglés. Shape elegido: campos
 * pareados `*En`, aplicado de forma consistente a todo el metadata mostrado.
 */
export interface Philosopher {
  /** slug, p. ej. "nietzsche" */
  id: string;
  /** nombre vulgar en español, p. ej. "Nietzsche" */
  name: string;
  /** nombre vulgar en inglés, p. ej. "Nietzsche" */
  nameEn: string;
  /** nombre completo en español, p. ej. "Friedrich Nietzsche" */
  fullName: string;
  /** nombre completo en inglés */
  fullNameEn: string;
  /** una de las cadenas de Era definidas arriba (clave canónica de filtro) */
  era: Era;
  /** etiqueta de la era en inglés */
  eraEn: string;
  /** escuela o movimiento (clave canónica de filtro) */
  school: string;
  /** etiqueta de la escuela en inglés */
  schoolEn: string;
  /** nacionalidad, p. ej. "Alemana" */
  nationality: string;
  /** nacionalidad en inglés, p. ej. "German" */
  nationalityEn: string;
  /** año de nacimiento; negativo = a. C.; null si es incierto */
  birthYear: number | null;
  /** año de fallecimiento; negativo = a. C.; null si es incierto */
  deathYear: number | null;
  /** biografía breve en español (1–2 frases) */
  bio: string;
  /** biografía breve en inglés (1–2 frases) */
  bioEn: string;
}

export interface Quote {
  /** p. ej. "q-nietzsche-1" */
  id: string;
  /** texto de la cita, en español */
  text: string;
  /** enlace con Philosopher.id */
  philosopherId: string;
  /** temas del vocabulario controlado (1–3) */
  tags: Tag[];
  /** obra u origen opcional, p. ej. "Así habló Zaratustra" */
  source?: string;
}

/** Traducción de una cita al inglés (generada por scripts/translate-quotes-glm.mjs). */
export interface QuoteEn {
  /** id de la cita original (p. ej. "q-nietzsche-1") */
  id: string;
  /** texto de la cita en inglés */
  text: string;
  /** obra u origen en inglés, si aplica */
  source?: string;
}
