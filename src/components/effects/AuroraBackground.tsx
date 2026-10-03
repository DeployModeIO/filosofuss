import type { CSSProperties } from 'react'
import type { MotionStyle } from 'framer-motion'
import { m } from 'framer-motion'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { useDocumentTheme, type ThemeMode } from '@/hooks/useDocumentTheme'

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

// Tintas por tema: `dark` conserva EXACTAMENTE los gradientes de BLOBS; light
// y paper sustituyen los oros claros por los oros profundos del token a menor
// fuerza — sobre fondo claro un alfa bajo se lee como aguatinta elegante.
const THEME_BGS: Partial<Record<ThemeMode, string[]>> = {
  light: [
    'radial-gradient(circle at center, rgba(125,90,28,0.22), rgba(125,90,28,0) 62%)',
    'radial-gradient(circle at center, rgba(154,74,42,0.2), rgba(154,74,42,0) 60%)',
  ],
  paper: [
    'radial-gradient(circle at center, rgba(122,86,28,0.22), rgba(122,86,28,0) 62%)',
    'radial-gradient(circle at center, rgba(138,58,42,0.2), rgba(138,58,42,0) 60%)',
  ],
}

// Opacidad del layer de blobs por tema (dark = 0.45 histórico; en claro sube
// algo para compensar los alfas bajos de los gradientes).
const THEME_OPACITY: Record<ThemeMode, number> = { dark: 0.45, light: 0.55, paper: 0.55 }

// La intersección permite asignar el mismo objeto tanto a un `style` de DOM
// (`CSSProperties`) como al `style` de un componente de Framer Motion
// (`MotionStyle`), cuyos índices de propiedad no admiten `undefined`.
const BLOB_STYLE = (
  blob: AuroraBlob,
  index: number,
  theme: ThemeMode,
): CSSProperties & MotionStyle => ({
  width: blob.size,
  height: blob.size,
  left: blob.left,
  top: blob.top,
  background: THEME_BGS[theme]?.[index] ?? blob.bg,
  opacity: THEME_OPACITY[theme],
  willChange: 'transform',
  contain: 'paint',
})

export default function AuroraBackground() {
  const prefersReducedMotion = usePrefersReducedMotion()
  // Tema activo desde <html>: sólo cambia tintas/opacidad, nunca la geometría.
  const themeMode = useDocumentTheme()
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {BLOBS.map((blob, i) =>
        prefersReducedMotion ? (
          <div
            key={i}
            className="absolute rounded-full"
            style={BLOB_STYLE(blob, i, themeMode)}
          />
        ) : (
          <m.div
            key={i}
            className="absolute rounded-full"
            style={BLOB_STYLE(blob, i, themeMode)}
            animate={{ x: blob.x, y: blob.y, scale: blob.scale }}
            transition={{ duration: blob.duration, repeat: Infinity, ease: 'easeInOut' }}
          />
        ),
      )}
    </div>
  )
}
