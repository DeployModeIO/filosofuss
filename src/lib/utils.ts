import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Combina clases condicionales y resuelve conflictos de Tailwind. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Hash determinista de 32 bits (estilo Java String.hashCode).
 * Devuelve siempre el mismo número para la misma cadena de entrada.
 */
export function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    // Operadores a nivel de bits intencionados (estilo Java String.hashCode).
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0; // Fuerza conversión a entero con signo de 32 bits.
  }
  return hash;
}

/** Versión sin acentos ni mayúsculas, útil para búsquedas. */
export function normalize(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

/** Baraja una copia del array usando Fisher–Yates. No muta el original. */
export function shuffle<T>(arr: T[]): T[] {
  const copy = arr.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const a = copy[i];
    const b = copy[j];
    if (a === undefined || b === undefined) continue;
    copy[i] = b;
    copy[j] = a;
  }
  return copy;
}

/** Devuelve un elemento aleatorio del array. */
export function pickRandom<T>(arr: T[]): T {
  const item = arr[Math.floor(Math.random() * arr.length)];
  if (arr.length === 0 || item === undefined) {
    throw new Error("pickRandom: el array no puede estar vacío");
  }
  return item;
}

/**
 * Formatea un año para mostrar: negativos como "a. C." (o "BC" en inglés),
 * null como "—".
 * @example formatYear(-470) → "470 a. C."
 * @example formatYear(-470, "en") → "470 BC"
 * @example formatYear(1844) → "1844"
 * @example formatYear(null) → "—"
 */
export function formatYear(
  year: number | null,
  locale: "es" | "en" = "es",
): string {
  if (year === null) return "—";
  if (year < 0) return `${Math.abs(year)} ${locale === "en" ? "BC" : "a. C."}`;
  return String(year);
}

const CONNECTORS = new Set([
  "y",
  "de",
  "del",
  "la",
  "el",
  "da",
  "di",
  "le",
  "von",
]);

/**
 * Iniciales de un nombre para avatares.
 * Ignora el contenido entre paréntesis y las partículas (de, von, da…).
 * @example initials("Simone de Beauvoir") → "SB"
 * @example initials("Lao-Tsé (Laozi)") → "LT"
 */
export function initials(name: string): string {
  const cleaned = name.replace(/\(.*?\)/g, "").trim();
  const parts = cleaned
    .split(/[\s-]+/)
    .filter((p) => p.length > 0 && !CONNECTORS.has(p.toLowerCase()));
  const first = parts[0];
  if (first === undefined) return "?";
  if (parts.length === 1) return first.charAt(0).toUpperCase();
  const last = parts[parts.length - 1];
  if (last === undefined) return "?";
  return (first.charAt(0) + last.charAt(0)).toUpperCase();
}

/**
 * Construye la URL compartible de una cita (deep link con ?cita=<id>).
 * Al abrirla, la app reconoce el parámetro y abre la cita en modo lectura.
 */
export function buildQuoteShareUrl(quoteId: string): string {
  if (typeof window === "undefined") return "";
  const url = new URL(window.location.href);
  url.search = "";
  url.hash = "";
  url.searchParams.set("cita", quoteId);
  return url.toString();
}
