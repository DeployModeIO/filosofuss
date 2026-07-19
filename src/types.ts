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

export interface Philosopher {
  /** slug, p. ej. "nietzsche" */
  id: string;
  /** nombre vulgar en español, p. ej. "Nietzsche" */
  name: string;
  /** nombre completo, p. ej. "Friedrich Nietzsche" */
  fullName: string;
  /** una de las cadenas de Era definidas arriba */
  era: string;
  /** escuela o movimiento */
  school: string;
  /** nacionalidad, p. ej. "Alemana" */
  nationality: string;
  /** año de nacimiento; negativo = a. C.; null si es incierto */
  birthYear: number | null;
  /** año de fallecimiento; negativo = a. C.; null si es incierto */
  deathYear: number | null;
  /** biografía breve en español (1–2 frases) */
  bio: string;
}

export interface Quote {
  /** p. ej. "q-nietzsche-1" */
  id: string;
  /** texto de la cita, en español */
  text: string;
  /** enlace con Philosopher.id */
  philosopherId: string;
  /** temas del vocabulario controlado (1–3) */
  tags: string[];
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
