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
  currentTime: number
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
  )
  const [isMuted, setIsMuted] = useState(false)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)

  // Refs para evitar closures obsoletas dentro de los manejadores del elemento.
  const trackIndexRef = useRef(0)
  const loadedSrcRef = useRef('')
  const errorCountRef = useRef(0)

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
    if (loadedSrcRef.current !== track.src) {
      audio.src = track.src
      loadedSrcRef.current = track.src
      setCurrentTime(0)
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

  // Cuando cambia el índice, carga el nuevo src (para que los metadatos
  // queden listos aunque esté en pausa). La reproducción la dispara play().
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    const track = tracks[trackIndex]
    if (!track) return
    if (loadedSrcRef.current !== track.src) {
      audio.src = track.src
      loadedSrcRef.current = track.src
      setCurrentTime(0)
      setDuration(0)
    }
  }, [trackIndex])

  // Adjunta el elemento y sus listeners una sola vez.
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    audio.loop = false
    audio.preload = 'metadata'

    const onPlay = () => {
      setIsPlaying(true)
      errorCountRef.current = 0
    }
    const onPause = () => setIsPlaying(false)
    const onTimeUpdate = () => setCurrentTime(audio.currentTime || 0)
    const onLoadedMetadata = () => setDuration(audio.duration || 0)
    const onDurationChange = () => setDuration(audio.duration || 0)
    const onVolumeChange = () => setIsMuted(audio.muted)

    const onEnded = () => {
      // Bucle de la lista: avanza y sigue reproduciendo.
      goToIndex(trackIndexRef.current + 1)
      play()
    }

    const onError = () => {
      errorCountRef.current += 1
      // Si TODAS fallan, paramos para evitar un bucle infinito.
      if (errorCountRef.current >= tracks.length) {
        setIsPlaying(false)
        return
      }
      goToIndex(trackIndexRef.current + 1)
      play()
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

  const currentTrack = tracks[trackIndex]

  const value = useMemo<AudioContextValue>(
    () => ({
      isPlaying,
      currentTrack,
      trackIndex,
      volume,
      isMuted,
      duration,
      currentTime,
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
      currentTime,
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
