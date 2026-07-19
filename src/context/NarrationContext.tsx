import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import type { ReactNode } from 'react'
import { getNarrationSrc, type VoiceLang, voiceLangs } from '@/data/voiceManifest'
import { getQuoteById } from '@/data/quotes'
import { useLocalStorage } from '@/lib/storage'
import { useAudio } from '@/context/AudioContext'

export interface NarrationContextValue {
  /** id de la cita que se está narrando ahora, o null */
  activeQuoteId: string | null
  /** true si hay narración en curso (audio o TTS) */
  isNarrating: boolean
  /** idioma de narración seleccionado */
  lang: VoiceLang
  setLang: (lang: VoiceLang) => void
  /** true si la narración está soportada (hay audio manifiesto o Web Speech disponible) */
  isSupported: boolean
  /** Reproduce/alterna la narración de una cita por su id. Si ya se está narrando esa misma cita, la detiene. */
  toggle: (quoteId: string) => void
  /** Detiene cualquier narración en curso. */
  stop: () => void
}

const NarrationContext = createContext<NarrationContextValue | undefined>(undefined)

const LANG_KEY = 'filosofuss:narration-lang'

export function NarrationProvider({ children }: { children: ReactNode }) {
  // Una sola instancia de <audio>, creada perezosamente (sólo en cliente).
  const audioRef = useRef<HTMLAudioElement | null>(null)
  if (audioRef.current === null && typeof window !== 'undefined') {
    audioRef.current = new Audio()
  }

  const [lang, setLang] = useLocalStorage<VoiceLang>(LANG_KEY, 'es')
  const [activeQuoteId, setActiveQuoteId] = useState<string | null>(null)
  const [isNarrating, setIsNarrating] = useState(false)

  const { pause, isPlaying } = useAudio()

  // Refs para evitar closures obsoletas dentro de los manejadores.
  const activeQuoteIdRef = useRef<string | null>(null)
  const isNarratingRef = useRef(false)
  const musicWasPlayingRef = useRef(false)
  const errorQuoteIdRef = useRef<string | null>(null)

  const isSupported =
    typeof window !== 'undefined' &&
    ('speechSynthesis' in window || voiceLangs.length > 0)

  // Mantiene los refs sincronizados con el estado.
  useEffect(() => {
    activeQuoteIdRef.current = activeQuoteId
  }, [activeQuoteId])
  useEffect(() => {
    isNarratingRef.current = isNarrating
  }, [isNarrating])

  // Hace ducking de la música: la pausa si estaba sonando.
  const duckMusic = useCallback(() => {
    if (isPlaying) {
      musicWasPlayingRef.current = true
      pause()
    } else {
      musicWasPlayingRef.current = false
    }
  }, [isPlaying, pause])

  const stop = useCallback(() => {
    const audio = audioRef.current
    if (audio) {
      audio.pause()
      audio.currentTime = 0
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }
    // Dejamos la música pausada (más predecible): NO la reanudamos.
    musicWasPlayingRef.current = false
    setActiveQuoteId(null)
    setIsNarrating(false)
  }, [])

  // Narra una cita mediante Web Speech API (fallback cuando no hay MP3).
  // Los handlers de estado van en la utterance, no en window.speechSynthesis,
  // porque los eventos globales no son fiables entre navegadores.
  const speakWithFallback = useCallback(
    (quoteId: string): boolean => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) return false
      const q = getQuoteById(quoteId)
      if (!q) return false

      const synth = window.speechSynthesis
      const utter = new SpeechSynthesisUtterance(q.text)
      utter.lang = lang === 'es' ? 'es-MX' : 'en-US'
      utter.rate = 0.85
      utter.pitch = 0.9

      // Intenta elegir una voz masculina en español si existe.
      const voices = synth.getVoices()
      const esVoice = voices.find((v) => v.lang.startsWith('es'))
      if (esVoice) utter.voice = esVoice

      utter.onstart = () => {
        setActiveQuoteId(quoteId)
        setIsNarrating(true)
      }
      utter.onend = () => {
        setActiveQuoteId(null)
        setIsNarrating(false)
      }
      utter.onerror = () => {
        setActiveQuoteId(null)
        setIsNarrating(false)
      }

      synth.cancel()
      synth.speak(utter)
      return true
    },
    [lang, setActiveQuoteId, setIsNarrating],
  )

  const toggle = useCallback(
    (quoteId: string) => {
      // 1. Si ya se narra esta cita, la detenemos.
      if (activeQuoteIdRef.current === quoteId && isNarratingRef.current) {
        stop()
        return
      }

      // 2. Detener cualquier narración en curso.
      if (isNarratingRef.current) {
        const audio = audioRef.current
        if (audio) {
          audio.pause()
          audio.currentTime = 0
        }
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
          window.speechSynthesis.cancel()
        }
        setActiveQuoteId(null)
        setIsNarrating(false)
      }

      // 3. Intentar reproducir el MP3.
      const src = getNarrationSrc(quoteId, lang)
      if (src !== null) {
        const audio = audioRef.current
        if (!audio) return
        duckMusic()
        errorQuoteIdRef.current = quoteId
        audio.src = src
        const maybePromise = audio.play()
        if (maybePromise && typeof maybePromise.then === 'function') {
          maybePromise.catch(() => {
            // El autoplay pudo ser bloqueado: caer al TTS.
            if (errorQuoteIdRef.current === quoteId) {
              errorQuoteIdRef.current = null
              if (speakWithFallback(quoteId)) {
                setActiveQuoteId(quoteId)
                setIsNarrating(true)
              }
            }
          })
        } else {
          setActiveQuoteId(quoteId)
          setIsNarrating(true)
        }
        return
      }

      // 4. Fallback Web Speech API.
      if (!speakWithFallback(quoteId)) return
      duckMusic()
    },
    [lang, duckMusic, stop, speakWithFallback],
  )

  // Listeners del <audio> (una sola vez).
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const onEnded = () => {
      setActiveQuoteId(null)
      setIsNarrating(false)
    }

    const onError = () => {
      // Solo caemos al fallback si el error ocurrió durante una reproducción activa.
      const erroredId = errorQuoteIdRef.current
      errorQuoteIdRef.current = null
      if (erroredId && isNarratingRef.current) {
        if (!speakWithFallback(erroredId)) {
          setActiveQuoteId(null)
          setIsNarrating(false)
        }
      }
    }

    audio.addEventListener('ended', onEnded)
    audio.addEventListener('error', onError)

    return () => {
      audio.removeEventListener('ended', onEnded)
      audio.removeEventListener('error', onError)
    }
  }, [speakWithFallback])

  const value = useMemo<NarrationContextValue>(
    () => ({
      activeQuoteId,
      isNarrating,
      lang,
      setLang,
      isSupported,
      toggle,
      stop,
    }),
    [activeQuoteId, isNarrating, lang, isSupported, toggle, stop],
  )

  return (
    <NarrationContext.Provider value={value}>{children}</NarrationContext.Provider>
  )
}

export function useNarration(): NarrationContextValue {
  const ctx = useContext(NarrationContext)
  if (!ctx) {
    throw new Error('useNarration debe usarse dentro de un NarrationProvider')
  }
  return ctx
}
