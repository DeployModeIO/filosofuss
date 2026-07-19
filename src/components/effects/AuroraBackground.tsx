import { motion } from 'framer-motion'

const prefersReducedMotion =
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

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

const BLOBS: AuroraBlob[] = [
  {
    bg: 'radial-gradient(circle at center, rgba(124,92,255,0.55), rgba(124,92,255,0) 62%)',
    size: 'min(620px, 62vw)',
    left: '-6%',
    top: '-10%',
    duration: 26,
    x: [0, 90, -40, 0],
    y: [0, 60, 30, 0],
    scale: [1, 1.15, 0.95, 1],
  },
  {
    bg: 'radial-gradient(circle at center, rgba(201,169,106,0.50), rgba(201,169,106,0) 60%)',
    size: 'min(560px, 56vw)',
    left: '60%',
    top: '2%',
    duration: 30,
    x: [0, -70, 50, 0],
    y: [0, 50, -30, 0],
    scale: [1, 0.9, 1.1, 1],
  },
  {
    bg: 'radial-gradient(circle at center, rgba(230,101,159,0.45), rgba(230,101,159,0) 60%)',
    size: 'min(600px, 60vw)',
    left: '28%',
    top: '56%',
    duration: 28,
    x: [0, 60, -70, 0],
    y: [0, -40, 20, 0],
    scale: [1, 1.2, 0.9, 1],
  },
  {
    bg: 'radial-gradient(circle at center, rgba(124,92,255,0.40), rgba(124,92,255,0) 62%)',
    size: 'min(500px, 50vw)',
    left: '6%',
    top: '58%',
    duration: 22,
    x: [0, -50, 60, 0],
    y: [0, 30, -50, 0],
    scale: [1, 1.05, 0.95, 1],
  },
]

export default function AuroraBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {BLOBS.map((blob, i) =>
        prefersReducedMotion ? (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: blob.size,
              height: blob.size,
              left: blob.left,
              top: blob.top,
              background: blob.bg,
              filter: 'blur(70px)',
              opacity: 0.5,
            }}
          />
        ) : (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: blob.size,
              height: blob.size,
              left: blob.left,
              top: blob.top,
              background: blob.bg,
              filter: 'blur(70px)',
              opacity: 0.5,
            }}
            animate={{ x: blob.x, y: blob.y, scale: blob.scale }}
            transition={{ duration: blob.duration, repeat: Infinity, ease: 'easeInOut' }}
          />
        ),
      )}
    </div>
  )
}
