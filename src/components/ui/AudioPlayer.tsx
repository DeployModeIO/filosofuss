import { useEffect, useId, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { AnimatePresence, m } from 'framer-motion'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { spring } from '@/lib/variants'
import { announce } from '@/components/ui/StatusAnnouncer'
import Visualizer, { CssEqualizer } from '@/components/ui/Visualizer'
import { getAnalyser, resumeAudioAnalyser } from '@/audio/analyser'
import {
  ListMusic,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react'
import { useAudio, useAudioProgress } from '@/context/AudioContext'
import { useApp } from '@/context/AppContext'
import { tracks } from '@/data/tracks'
import { cn } from '@/lib/utils'

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

function IconButton({
  label,
  onClick,
  className,
  children,
  hoverScale = false,
  expanded,
  controls,
}: {
  label: string
  onClick: () => void
  className: string
  children: ReactNode
  hoverScale?: boolean
  expanded?: boolean
  controls?: string
}) {
  const reduceMotion = usePrefersReducedMotion()
  return (
    <m.button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      aria-expanded={expanded}
      aria-controls={controls}
      whileHover={reduceMotion || !hoverScale ? {} : { scale: 1.05, transition: spring.press }}
      whileTap={reduceMotion ? {} : { scale: 0.94, transition: spring.press }}
      className={className}
    >
      {children}
    </m.button>
  )
}

export default function AudioPlayer() {
  const reduceMotion = usePrefersReducedMotion()
  const {
    isPlaying,
    currentTrack,
    trackIndex,
    volume,
    isMuted,
    duration,
    error,
    audioEl,
    togglePlay,
    next,
    prev,
    selectTrack,
    setVolume,
    toggleMute,
  } = useAudio()
  const { t } = useApp()
  const [expanded, setExpanded] = useState(false)
  const panelId = useId()
  // Suscripción aislada: sólo este componente re-renderiza a ~4 Hz (Task B7).
  const currentTime = useAudioProgress()

  // Anuncia play/pausa en la región aria-live (Task C8). El ref evita anunciar
  // en el montaje inicial y al cambiar de idioma (sólo cuando cambia el estado).
  const prevPlayingRef = useRef(isPlaying)
  useEffect(() => {
    if (prevPlayingRef.current === isPlaying) return
    prevPlayingRef.current = isPlaying
    announce(isPlaying ? t('status.playing') : t('status.paused'))
  }, [isPlaying, t])

  // Anuncia el fallo de una pista (Review Focus #4).
  const prevErrorRef = useRef(error)
  useEffect(() => {
    if (error && !prevErrorRef.current) announce(t('audio.error'))
    prevErrorRef.current = error
  }, [error, t])

  // Crea el grafo de Web Audio (una sola vez) y reanuda el AudioContext dentro
  // del gesto de usuario; si no, el elemento quedaría silenciado (§3.5).
  const primeAudio = () => {
    getAnalyser(audioEl)
    resumeAudioAnalyser()
  }

  const handlePlayToggle = () => {
    if (!isPlaying) primeAudio()
    togglePlay()
  }

  const progress =
    duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0
  const sliderValue = isMuted ? 0 : volume

  return (
    <div className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-[max(1rem,env(safe-area-inset-right))] z-50 flex flex-col items-end gap-2">
      {/* Error de pista: mensaje visible y reproducción detenida */}
      {error && (
        <p
          role="alert"
          className="glass-strong max-w-[15rem] rounded-2xl px-3 py-1.5 text-right text-2xs text-ember"
        >
          {t('audio.error')}
        </p>
      )}

      {/* Controles colapsados */}
      <div className="flex items-center gap-2">
        {isPlaying && <Visualizer audioEl={audioEl} bars={4} className="h-4 w-6" />}
        <IconButton
          label={isPlaying ? t('audio.pause') : t('audio.play')}
          onClick={handlePlayToggle}
          className={cn(
            'glass-strong grid h-12 w-12 place-items-center rounded-full text-content transition-colors duration-300 hover:text-accent focus-visible:text-accent',
            isPlaying && 'animate-pulse-glow',
          )}
        >
          {isPlaying ? (
            <Pause size={18} aria-hidden="true" />
          ) : (
            <Play size={18} aria-hidden="true" className="ml-0.5" />
          )}
        </IconButton>
        <IconButton
          label={expanded ? t('audio.close') : t('audio.open')}
          onClick={() => setExpanded((v) => !v)}
          expanded={expanded}
          controls={panelId}
          className={cn(
            'glass-strong grid h-11 w-11 place-items-center rounded-full text-content transition-colors duration-300 hover:text-accent focus-visible:text-accent',
          )}
        >
          {expanded ? (
            <X size={16} aria-hidden="true" />
          ) : (
            <ListMusic size={16} aria-hidden="true" />
          )}
        </IconButton>
      </div>

      {/* Panel expandido: región etiquetada, NO un diálogo modal */}
      <AnimatePresence initial={false}>
        {expanded && (
          <m.div
            key="audio-panel"
            id={panelId}
            role="region"
            aria-label={t('audio.aria')}
            className="glass-strong overflow-hidden rounded-2xl p-4 shadow-card sm:w-80"
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8, height: 0 }}
            animate={
              reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, height: 'auto' }
            }
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8, height: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.28, ease: 'easeInOut' }}
          >
            {/* Visualizador de espectro (hasta 48 barras) */}
            <div className="mb-3 h-10">
              <Visualizer audioEl={audioEl} bars={48} className="h-10 w-full" />
            </div>

            {/* Reproduciendo ahora */}
            <div className="mb-3 min-w-0">
              <p className="truncate font-display text-base text-accent">
                {currentTrack.title}
              </p>
              <p className="truncate text-xs text-muted">{currentTrack.artist}</p>
            </div>

            {/* Progreso */}
            <div className="mb-3">
              <div className="h-1 w-full overflow-hidden rounded-full bg-line-soft">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-accent to-accent-2 transition-[width] duration-200 ease-smooth"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="mt-1 flex justify-between text-2xs tabular-nums text-muted">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Transporte */}
            <div className="mb-3 flex items-center justify-center gap-3">
              <IconButton
                label={t('audio.prev')}
                onClick={prev}
                className="grid h-11 w-11 place-items-center rounded-full text-muted transition-colors hover:text-accent"
              >
                <SkipBack size={18} aria-hidden="true" />
              </IconButton>
              <IconButton
                hoverScale
                label={isPlaying ? t('audio.pause') : t('audio.play')}
                onClick={handlePlayToggle}
                className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-accent to-accent-2 text-[#0a0a12] shadow-glow"
              >
                {isPlaying ? (
                  <Pause size={20} aria-hidden="true" />
                ) : (
                  <Play size={20} aria-hidden="true" className="ml-0.5" />
                )}
              </IconButton>
              <IconButton
                label={t('audio.next')}
                onClick={next}
                className="grid h-11 w-11 place-items-center rounded-full text-muted transition-colors hover:text-accent"
              >
                <SkipForward size={18} aria-hidden="true" />
              </IconButton>
            </div>

            {/* Volumen */}
            <div className="mb-1 flex items-center gap-2">
              <IconButton
                label={isMuted || volume === 0 ? t('audio.unmute') : t('audio.mute')}
                onClick={toggleMute}
                className="grid h-11 w-11 place-items-center rounded-full text-muted transition-colors hover:text-accent"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX size={16} aria-hidden="true" />
                ) : (
                  <Volume2 size={16} aria-hidden="true" />
                )}
              </IconButton>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={sliderValue}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                aria-label={t('audio.volume')}
                className="h-1 w-full cursor-pointer"
                style={{ accentColor: 'var(--accent)' }}
              />
            </div>

            {/* Lista de reproducción (oculta en pantallas muy pequeñas) */}
            <ul className="hidden flex-col gap-0.5 sm:flex">
              {tracks.map((track, i) => {
                const isCurrent = i === trackIndex
                return (
                  <li key={track.id}>
                    <button
                      type="button"
                      onClick={() => {
                        primeAudio()
                        selectTrack(i)
                      }}
                      aria-current={isCurrent ? 'true' : undefined}
                      className={cn(
                        'flex min-h-11 w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm transition-colors',
                        isCurrent
                          ? 'bg-glass text-accent'
                          : 'text-muted hover:bg-glass hover:text-content',
                      )}
                    >
                      <span className="grid h-4 min-w-[16px] place-items-center">
                        {isCurrent && isPlaying ? (
                          <CssEqualizer />
                        ) : (
                          <span className="text-2xs tabular-nums">
                            {i + 1}
                          </span>
                        )}
                      </span>
                      <span className="truncate">{track.title}</span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  )
}
