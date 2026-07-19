// Autogenerado por scripts/generate-voices.mjs — no editar a mano.
// Mapa de citas que tienen narración en español disponible.
export const voiceLangs = ['es'] as const
export type VoiceLang = (typeof voiceLangs)[number]

/** Set de ids de cita que tienen MP3 de narración en español. */
export const narratedQuoteIds: ReadonlySet<string> = new Set<string>([
  "q-agustin-1",
  "q-agustin-10",
  "q-agustin-11",
  "q-agustin-12",
  "q-agustin-13",
])

/** Devuelve la ruta pública del MP3 de una cita en el idioma dado, o null. */
export function getNarrationSrc(quoteId: string, lang: VoiceLang = 'es'): string | null {
  if (lang === 'es' && narratedQuoteIds.has(quoteId)) {
    return `/audio/voice/es/${quoteId}.mp3`
  }
  return null
}
