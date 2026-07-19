import { useState } from 'react'
import type { ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
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
import { useAudio } from '@/context/AudioContext'
import { useApp } from '@/context/AppContext'
import { tracks } from '@/data/tracks'
import { cn } from '@/lib/utils'

const reduceMotion =
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

function Equalizer() {
  return (
    <span className="flex h-4 items-end gap-[2px]" aria-hidden="true">
      {[0, 1, 2, 3].map((i) =>
        reduceMotion ? (
          <span key={i} className="h-3 w-[2px] rounded-full bg-accent" />
        ) : (
          <motion.span
            key={i}
            className="h-4 w-[2px] origin-bottom rounded-full bg-accent"
            animate={{ scaleY: [0.25, 1, 0.5, 0.85, 0.25] }}
            transition={{
              duration: 0.9,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.12,
            }}
          />
        ),
      )}
    </span>
  )
}

function IconButton({
  label,
  onClick,
  className,
  children,
}: {
  label: string
  onClick: () => void
  className: string
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={className}
    >
      {children}
    </button>
  )
}

export default function AudioPlayer() {
  const {
    isPlaying,
    currentTrack,
    trackIndex,
    volume,
    isMuted,
    duration,
    currentTime,
    togglePlay,
    next,
    prev,
    selectTrack,
    setVolume,
    toggleMute,
  } = useAudio()
  const { t } = useApp()
  const [expanded, setExpanded] = useState(false)

  const progress =
    duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0
  const sliderValue = isMuted ? 0 : volume

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
      {/* Controles colapsados */}
      <div className="flex items-center gap-2">
        {isPlaying && <Equalizer />}
        <IconButton
          label={isPlaying ? t('audio.pause') : t('audio.play')}
          onClick={togglePlay}
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
          className={cn(
            'glass-strong grid h-10 w-10 place-items-center rounded-full text-content transition-colors duration-300 hover:text-accent focus-visible:text-accent',
          )}
        >
          {expanded ? (
            <X size={16} aria-hidden="true" />
          ) : (
            <ListMusic size={16} aria-hidden="true" />
          )}
        </IconButton>
      </div>

      {/* Panel expandido */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="audio-panel"
            role="dialog"
            aria-label={t('audio.aria')}
            className="glass-strong overflow-hidden rounded-2xl p-4 shadow-card sm:w-80"
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8, height: 0 }}
            animate={
              reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, height: 'auto' }
            }
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8, height: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.28, ease: 'easeInOut' }}
          >
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
              <div className="mt-1 flex justify-between text-[10px] tabular-nums text-muted">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Transporte */}
            <div className="mb-3 flex items-center justify-center gap-3">
              <IconButton
                label={t('audio.prev')}
                onClick={prev}
                className="grid h-9 w-9 place-items-center rounded-full text-muted transition-colors hover:text-accent"
              >
                <SkipBack size={18} aria-hidden="true" />
              </IconButton>
               <IconButton
                label={isPlaying ? t('audio.pause') : t('audio.play')}
                onClick={togglePlay}
                className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-accent to-accent-2 text-[#0a0a12] shadow-glow transition-transform duration-200 hover:scale-105"
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
                className="grid h-9 w-9 place-items-center rounded-full text-muted transition-colors hover:text-accent"
              >
                <SkipForward size={18} aria-hidden="true" />
              </IconButton>
            </div>

            {/* Volumen */}
            <div className="mb-1 flex items-center gap-2">
              <IconButton
                label={isMuted || volume === 0 ? t('audio.unmute') : t('audio.mute')}
                onClick={toggleMute}
                className="grid h-8 w-8 place-items-center rounded-full text-muted transition-colors hover:text-accent"
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
                      onClick={() => selectTrack(i)}
                      aria-current={isCurrent ? 'true' : undefined}
                      className={cn(
                        'flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm transition-colors',
                        isCurrent
                          ? 'bg-glass text-accent'
                          : 'text-muted hover:bg-glass hover:text-content',
                      )}
                    >
                      <span className="grid h-4 min-w-[16px] place-items-center">
                        {isCurrent && isPlaying ? (
                          <Equalizer />
                        ) : (
                          <span className="text-[10px] tabular-nums">
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
