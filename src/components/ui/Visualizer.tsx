import { useEffect, useRef } from 'react'
import { m } from 'framer-motion'
import { useAudioAnalyser } from '@/hooks/useAudioAnalyser'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { useAudio } from '@/context/AudioContext'
import { cn } from '@/lib/utils'

const FALLBACK_COLOR = '#c9a96a'

/**
 * CSS equalizer used as the fallback of `Visualizer` (and by the playlist row):
 * it is time-based, so it runs with no Web Audio graph at all.
 */
export function CssEqualizer({
  active = true,
  className,
}: {
  active?: boolean
  className?: string
}) {
  const reduceMotion = usePrefersReducedMotion()
  const animate = active && !reduceMotion
  return (
    <span className={cn('flex h-4 items-end gap-[2px]', className)} aria-hidden="true">
      {[0, 1, 2, 3].map((i) =>
        animate ? (
          <m.span
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
        ) : (
          <span key={i} className="h-3 w-[2px] rounded-full bg-accent" />
        ),
      )}
    </span>
  )
}

interface VisualizerProps {
  audioEl: HTMLAudioElement | null
  /** 4 for the collapsed player, up to 48 for the expanded panel. */
  bars?: number
  className?: string
}

/**
 * Audio-reactive bars drawn on a 2D canvas. Falls back to `CssEqualizer` when
 * the analyser is unavailable, the context is suspended, or motion is reduced.
 */
export default function Visualizer({ audioEl, bars = 4, className }: VisualizerProps) {
  const { isPlaying } = useAudio()
  const levels = useAudioAnalyser(audioEl, bars)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const colorRef = useRef(FALLBACK_COLOR)

  useEffect(() => {
    const value = getComputedStyle(document.documentElement)
      .getPropertyValue('--accent')
      .trim()
    if (value) colorRef.current = value
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !levels) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const width = canvas.clientWidth
    const height = canvas.clientHeight
    if (width === 0 || height === 0) return

    const pixelWidth = Math.max(1, Math.round(width * dpr))
    const pixelHeight = Math.max(1, Math.round(height * dpr))
    if (canvas.width !== pixelWidth) canvas.width = pixelWidth
    if (canvas.height !== pixelHeight) canvas.height = pixelHeight

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, width, height)

    const count = levels.length
    const gap = count > 8 ? 1 : 2
    const barWidth = Math.max(1, (width - gap * (count - 1)) / count)
    ctx.fillStyle = colorRef.current
    for (let i = 0; i < count; i++) {
      const ratio = (levels[i] ?? 0) / 255
      const barHeight = Math.max(1, ratio * height)
      ctx.fillRect(i * (barWidth + gap), height - barHeight, barWidth, barHeight)
    }
  }, [levels])

  if (!levels) {
    return <CssEqualizer active={isPlaying} className={className} />
  }

  return (
    <canvas
      ref={canvasRef}
      className={cn('block', className)}
      aria-hidden="true"
    />
  )
}
