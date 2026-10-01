import { useEffect, useState, type Dispatch, type SetStateAction } from "react";

const hasWindow = typeof window !== "undefined";

/** Guarda de forma: estrecha un `unknown` a `T` validándolo en runtime. */
export type Validator<T> = (value: unknown) => value is T;

/**
 * Lee de localStorage de forma segura y lo parsea como JSON.
 * Si la clave no existe, el JSON es inválido, el acceso falla (modo privado,
 * cuota agotada…) o `validate` rechaza la forma, devuelve `fallback`.
 *
 * `validate` es opcional y retrocompatible: sin él se conserva el
 * comportamiento anterior (confiar en `JSON.parse`), pero cualquier consumidor
 * que quiera blindarse frente a datos corruptos o de otra versión puede pasar
 * una guarda que garantice `T` en runtime (COD-04).
 */
export function safeGet<T>(
  key: string,
  fallback: T,
  validate?: Validator<T>,
): T {
  if (!hasWindow) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return fallback;
    const parsed: unknown = JSON.parse(raw);
    if (validate === undefined) return parsed as T;
    return validate(parsed) ? parsed : fallback;
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
 *
 * `validate` (opcional) se aplica al valor leído: si no cumple la forma, se
 * usa `initial` en lugar del dato corrupto.
 */
export function useLocalStorage<T>(
  key: string,
  initial: T,
  validate?: Validator<T>,
): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() =>
    safeGet<T>(key, initial, validate),
  );

  useEffect(() => {
    safeSet<T>(key, value);
  }, [key, value]);

  return [value, setValue];
}
