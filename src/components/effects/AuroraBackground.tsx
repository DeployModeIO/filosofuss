import type { CSSProperties } from 'react'
import { m } from 'framer-motion'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

interface AuroraBlob {
  bg: string
  size: string
  left: string
  top: string
  duration: number
  x: number[]
  y: number[]
  scale: number[]
}

/**
 * Dos blobs (antes 4, Task C5 / P-14) con gradientes pre-renderizados. Se
 * elimina el `filter: blur(50px)` animado sobre superficies grandes: sólo se
 * animan `transform`, con `will-change: transform` y `contain: paint`.
 */
const BLOBS: AuroraBlob[] = [
  {
    bg: 'radial-gradient(circle at center, rgba(176,113,63,0.55), rgba(176,113,63,0) 62%)',
    size: 'min(640px, 64vw)',
    left: '-8%',
    top: '-10%',
    duration: 26,
    x: [0, 70, -40, 0],
    y: [0, 50, 30, 0],
    scale: [1, 1.12, 0.96, 1],
  },
  {
    bg: 'radial-gradient(circle at center, rgba(201,169,106,0.52), rgba(201,169,106,0) 60%)',
    size: 'min(620px, 60vw)',
    left: '50%',
    top: '26%',
    duration: 30,
    x: [0, -70, 50, 0],
    y: [0, 40, -30, 0],
    scale: [1, 0.92, 1.1, 1],
  },
]

const BLOB_STYLE = (blob: AuroraBlob): CSSProperties => ({
  width: blob.size,
  height: blob.size,
  left: blob.left,
  top: blob.top,
  background: blob.bg,
  opacity: 0.45,
  willChange: 'transform',
  contain: 'paint',
})

export default function AuroraBackground() {
  const prefersReducedMotion = usePrefersReducedMotion()
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {BLOBS.map((blob, i) =>
        prefersReducedMotion ? (
          <div
            key={i}
            className="absolute rounded-full"
            style={BLOB_STYLE(blob)}
          />
        ) : (
          <m.div
            key={i}
            className="absolute rounded-full"
            style={BLOB_STYLE(blob)}
            animate={{ x: blob.x, y: blob.y, scale: blob.scale }}
            transition={{ duration: blob.duration, repeat: Infinity, ease: 'easeInOut' }}
          />
        ),
      )}
    </div>
  )
}
