import { useEffect, useState } from 'react'
import { useAudio } from '@/context/AudioContext'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import {
  getAnalyser,
  getAudioContext,
  isAudioAnalyserSuspended,
  levels as sampleLevels,
} from '@/audio/analyser'

/**
 * Live frequency levels for `audioEl`, sampled with `requestAnimationFrame`
 * ONLY while audio is playing and the tab is visible (§3.5).
 *
 * Returns `null` whenever there is no usable signal: unsupported browser,
 * suspended `AudioContext` (autoplay policy), paused track or reduced motion.
 * Consumers fall back to the CSS equalizer in that case.
 */
export function useAudioAnalyser(
  audioEl: HTMLAudioElement | null,
  bars: number,
): Uint8Array | null {
  const { isPlaying } = useAudio()
  const reduceMotion = usePrefersReducedMotion()
  const [levels, setLevels] = useState<Uint8Array | null>(null)

  useEffect(() => {
    if (!isPlaying || reduceMotion || !audioEl) {
      setLevels(null)
      return
    }

    const analyser = getAnalyser(audioEl)
    if (!analyser) {
      setLevels(null)
      return
    }

    const ctx = getAudioContext()
    let frame = 0
    let running = true

    const draw = () => {
      if (!running) return
      if (!document.hidden) setLevels(sampleLevels(analyser, bars))
      frame = requestAnimationFrame(draw)
    }

    const start = () => {
      if (frame === 0) frame = requestAnimationFrame(draw)
    }

    const stop = () => {
      if (frame !== 0) {
        cancelAnimationFrame(frame)
        frame = 0
      }
    }

    const onVisibility = () => {
      if (document.hidden) {
        stop()
        setLevels(null)
      } else {
        start()
      }
    }

    const onStateChange = () => {
      if (ctx && ctx.state === 'running') start()
    }

    document.addEventListener('visibilitychange', onVisibility)

    if (isAudioAnalyserSuspended()) {
      setLevels(null)
      ctx?.addEventListener('statechange', onStateChange)
    } else {
      start()
    }

    return () => {
      running = false
      stop()
      document.removeEventListener('visibilitychange', onVisibility)
      ctx?.removeEventListener('statechange', onStateChange)
    }
  }, [audioEl, bars, isPlaying, reduceMotion])

  return levels
}
