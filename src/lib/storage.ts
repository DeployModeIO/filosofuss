import { useEffect, useState, type Dispatch, type SetStateAction } from "react";

const hasWindow = typeof window !== "undefined";

/**
 * Lee de localStorage de forma segura y lo parsea como JSON.
 * Si la clave no existe, el JSON es inválido o el acceso falla
 * (modo privado, cuota agotada…), devuelve `fallback`.
 */
export function safeGet<T>(key: string, fallback: T): T {
  if (!hasWindow) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/**
 * Serializa `value` a JSON y lo guarda en localStorage.
 * Captura cualquier error para no romper el flujo de la app.
 */
export function safeSet<T>(key: string, value: T): void {
  if (!hasWindow) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Silencioso: el almacenamiento puede no estar disponible.
  }
}

/** Elimina una clave de localStorage de forma segura. */
export function safeRemove(key: string): void {
  if (!hasWindow) return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    // Silencioso.
  }
}

/**
 * Hook de React que sincroniza un valor con localStorage.
 * Se inicializa una sola vez (perezoso) y persiste en cada cambio.
 * Es seguro para SSR porque protege `typeof window`.
 */
export function useLocalStorage<T>(
  key: string,
  initial: T,
): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => safeGet<T>(key, initial));

  useEffect(() => {
    safeSet<T>(key, value);
  }, [key, value]);

  return [value, setValue];
}
