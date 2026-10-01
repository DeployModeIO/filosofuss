import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react'
import type { ReactNode } from 'react'
import { useLocalStorage } from '@/lib/storage'
import { tracks } from '@/data/tracks'
import type { Track } from '@/data/tracks'

export interface AudioContextValue {
  isPlaying: boolean
  currentTrack: Track
  trackIndex: number
  volume: number
  isMuted: boolean
  duration: number
  /** `true` after the current track failed to load. Cleared on the next play. */
  error: boolean
  /** The single `<audio>` element, exposed for the audio-reactive visualizer. */
  audioEl: HTMLAudioElement | null
  play: () => void
  pause: () => void
  togglePlay: () => void
  next: () => void
  prev: () => void
  selectTrack: (index: number) => void
  setVolume: (v: number) => void
  toggleMute: () => void
}

const AudioContext = createContext<AudioContextValue | undefined>(undefined)

const VOLUME_KEY = 'filosofuss:volume'
const INITIAL_VOLUME = 0.4

// Guarda de forma: un volumen persistido corrupto degrada al valor por defecto.
const isVolume = (v: unknown): v is number =>
  typeof v === 'number' && Number.isFinite(v) && v >= 0 && v <= 1

/**
 * Progreso de reproducción fuera del contexto raíz (Task B7 / PERF-10).
 * `timeupdate` emite ~4 Hz; mantenerlo en el `value` del provider re-renderiza
 * todo el árbol mientras suena. Con un store externo + `useSyncExternalStore`
 * sólo se re-renderiza quien consume `useAudioProgress` (el AudioPlayer).
 */
let audioProgress = 0
const progressListeners = new Set<() => void>()

function subscribeProgress(listener: () => void): () => void {
  progressListeners.add(listener)
  return () => {
    progressListeners.delete(listener)
  }
}

function getProgressSnapshot(): number {
  return audioProgress
}

function setProgress(next: number): void {
  const value = Number.isFinite(next) && next > 0 ? next : 0
  if (value === audioProgress) return
  audioProgress = value
  for (const listener of progressListeners) listener()
}

/** Tiempo de reproducción actual, aislado del resto del árbol (Task B7). */
export function useAudioProgress(): number {
  return useSyncExternalStore(
    subscribeProgress,
    getProgressSnapshot,
    getProgressSnapshot,
  )
}

export function AudioProvider({ children }: { children: ReactNode }) {
  // Una sola instancia de <audio>, creada perezosamente (sólo en cliente).
  const audioRef = useRef<HTMLAudioElement | null>(null)
  if (audioRef.current === null && typeof window !== 'undefined') {
    audioRef.current = new Audio()
  }

  const [trackIndex, setTrackIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolumeState] = useLocalStorage<number>(
    VOLUME_KEY,
    INITIAL_VOLUME,
    isVolume,
  )
  const [isMuted, setIsMuted] = useState(false)
  const [duration, setDuration] = useState(0)
  const [error, setError] = useState(false)

  // Refs para evitar closures obsoletas dentro de los manejadores del elemento.
  const trackIndexRef = useRef(0)
  const loadedSrcRef = useRef('')

  // Avanza/envuelve el índice de forma síncrona (ref + state).
  const goToIndex = useCallback((index: number) => {
    const len = tracks.length
    if (len === 0) return
    const wrapped = (((index % len) + len) % len)
    trackIndexRef.current = wrapped
    setTrackIndex(wrapped)
  }, [])

  const play = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    const track = tracks[trackIndexRef.current]
    if (!track) return
    setError(false)
    if (loadedSrcRef.current !== track.src) {
      audio.src = track.src
      loadedSrcRef.current = track.src
      setProgress(0)
      setDuration(0)
    }
    const maybePromise = audio.play()
    if (maybePromise && typeof maybePromise.then === 'function') {
      // Autoplay bloqueado por la política del navegador: no lanzamos,
      // la UI ofrecerá un botón de reproducción.
      maybePromise.catch(() => {
        setIsPlaying(false)
      })
    }
  }, [])

  const pause = useCallback(() => {
    audioRef.current?.pause()
  }, [])

  const togglePlay = useCallback(() => {
    if (isPlaying) pause()
    else play()
  }, [isPlaying, pause, play])

  const next = useCallback(() => {
    goToIndex(trackIndexRef.current + 1)
    if (isPlaying) play()
  }, [goToIndex, isPlaying, play])

  const prev = useCallback(() => {
    goToIndex(trackIndexRef.current - 1)
    if (isPlaying) play()
  }, [goToIndex, isPlaying, play])

  const selectTrack = useCallback(
    (index: number) => {
      goToIndex(index)
      play()
    },
    [goToIndex, play],
  )

  const setVolume = useCallback(
    (v: number) => {
      const clamped = Math.min(1, Math.max(0, v))
      setVolumeState(clamped)
      if (clamped > 0 && isMuted) setIsMuted(false)
    },
    [setVolumeState, isMuted],
  )

  const toggleMute = useCallback(() => {
    setIsMuted((m) => !m)
  }, [])

  // Sincroniza el volumen/realce del elemento con el estado.
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.volume = volume
    audio.muted = isMuted
  }, [volume, isMuted])

  // No se asigna `src` al montar ni al cambiar de pista: el audio no hace
  // ninguna petición de red hasta que el usuario pulsa play (o la narración/
  // deep-link pide reproducción). `play()` es quien fija el `src`.

  // Adjunta el elemento y sus listeners una sola vez.
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    audio.loop = false
    audio.preload = 'none'

    const onPlay = () => {
      setIsPlaying(true)
      setError(false)
    }
    const onPause = () => setIsPlaying(false)
    const onTimeUpdate = () => setProgress(audio.currentTime || 0)
    const onLoadedMetadata = () => setDuration(audio.duration || 0)
    const onDurationChange = () => setDuration(audio.duration || 0)
    const onVolumeChange = () => setIsMuted(audio.muted)

    const onEnded = () => {
      // Bucle de la lista: avanza y sigue reproduciendo.
      goToIndex(trackIndexRef.current + 1)
      play()
    }

    const onError = () => {
      // Un fallo de pista NO rota en silencio: se detiene la reproducción, se
      // avisa en la UI y el visualizador cae al fallback (Review Focus #4).
      setIsPlaying(false)
      setError(true)
      audio.pause()
      // Permitir reintentar la misma pista en el próximo play.
      loadedSrcRef.current = ''
    }

    audio.addEventListener('play', onPlay)
    audio.addEventListener('pause', onPause)
    audio.addEventListener('timeupdate', onTimeUpdate)
    audio.addEventListener('loadedmetadata', onLoadedMetadata)
    audio.addEventListener('durationchange', onDurationChange)
    audio.addEventListener('volumechange', onVolumeChange)
    audio.addEventListener('ended', onEnded)
    audio.addEventListener('error', onError)

    return () => {
      audio.removeEventListener('play', onPlay)
      audio.removeEventListener('pause', onPause)
      audio.removeEventListener('timeupdate', onTimeUpdate)
      audio.removeEventListener('loadedmetadata', onLoadedMetadata)
      audio.removeEventListener('durationchange', onDurationChange)
      audio.removeEventListener('volumechange', onVolumeChange)
      audio.removeEventListener('ended', onEnded)
      audio.removeEventListener('error', onError)
    }
  }, [goToIndex, play])

  // `tracks` es una tupla no vacía: `tracks[0]` cubre el caso (inalcanzable) de
  // un índice fuera de rango sin recurrir a aserciones.
  const currentTrack = tracks[trackIndex] ?? tracks[0]
  const audioEl = audioRef.current

  const value = useMemo<AudioContextValue>(
    () => ({
      isPlaying,
      currentTrack,
      trackIndex,
      volume,
      isMuted,
      duration,
      error,
      audioEl,
      play,
      pause,
      togglePlay,
      next,
      prev,
      selectTrack,
      setVolume,
      toggleMute,
    }),
    [
      isPlaying,
      currentTrack,
      trackIndex,
      volume,
      isMuted,
      duration,
      error,
      audioEl,
      play,
      pause,
      togglePlay,
      next,
      prev,
      selectTrack,
      setVolume,
      toggleMute,
    ],
  )

  return (
    <AudioContext.Provider value={value}>{children}</AudioContext.Provider>
  )
}

export function useAudio(): AudioContextValue {
  const ctx = useContext(AudioContext)
  if (!ctx) {
    throw new Error('useAudio debe usarse dentro de un AudioProvider')
  }
  return ctx
}
