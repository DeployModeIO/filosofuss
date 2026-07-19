import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Combina clases condicionales y resuelve conflictos de Tailwind. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/** Convierte un texto en un slug seguro para URLs / ids. */
export function slugify(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
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
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** Devuelve un elemento aleatorio del array. */
export function pickRandom<T>(arr: T[]): T {
  if (arr.length === 0) {
    throw new Error("pickRandom: el array no puede estar vacío");
  }
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Entero aleatorio en [min, max] (ambos inclusive). */
export function randomInt(min: number, max: number): number {
  if (max < min) {
    [min, max] = [max, min];
  }
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Limita un número al rango [min, max]. */
export function clamp(n: number, min: number, max: number): number {
  if (max < min) {
    [min, max] = [max, min];
  }
  return Math.min(Math.max(n, min), max);
}

/**
 * Formatea un año para mostrar: negativos como "a. C.", null como "—".
 * @example formatYear(-470) → "470 a. C."
 * @example formatYear(1844) → "1844"
 * @example formatYear(null) → "—"
 */
export function formatYear(year: number | null): string {
  if (year === null) return "—";
  if (year < 0) return `${Math.abs(year)} a. C.`;
  return String(year);
}
