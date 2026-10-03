import { useEffect, useRef } from 'react'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { useDocumentTheme, type ThemeMode } from '@/hooks/useDocumentTheme'

interface Particle {
  x: number
  y: number
  r: number
  vy: number
  sway: number
  swaySpeed: number
  phase: number
  alpha: number
  color: string
}

// Paletas por tema: dark = las históricas (inertes); light/paper = los oros
// profundos de los tokens, para que el dorado se vea sobre fondo claro.
const PALETTES: Record<ThemeMode, string[]> = {
  dark: ['rgba(201,169,106,', 'rgba(176,113,63,', 'rgba(122,46,77,'],
  light: ['rgba(168,112,20,', 'rgba(138,90,47,', 'rgba(154,74,42,'],
  paper: ['rgba(158,102,22,', 'rgba(107,74,42,', 'rgba(138,58,42,'],
}

// Rango de alpha [base, span] por tema: dark conserva 0.2–0.7 (intacto);
// light/paper suben a 0.6–1.0: con 0.35–0.75 el dorado sobre #f9f7f3 daba
// ~2.1:1 de contraste y resultaba casi imperceptible.
const ALPHA_RANGE: Record<ThemeMode, [number, number]> = {
  dark: [0.2, 0.5],
  light: [0.6, 0.4],
  paper: [0.6, 0.4],
}

function createParticles(width: number, height: number, theme: ThemeMode): Particle[] {
  // Cap de partículas (P-14): en dark se conserva el cap duro de 40 con
  // width/32, exacto como estaba; en light/paper se sube a 56 con width/24
  // porque sobre fondo claro hacen falta más puntos para el contraste.
  const count =
    theme === 'dark'
      ? Math.min(40, Math.max(16, Math.floor(width / 32)))
      : Math.min(56, Math.max(16, Math.floor(width / 24)))
  const palette = PALETTES[theme]
  const fallback = palette[0] ?? 'rgba(201,169,106,'
  const [alphaBase, alphaSpan] = ALPHA_RANGE[theme]
  const particles: Particle[] = []
  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      // Radio por tema: dark conserva la fórmula exacta (0.6–2.8); en
      // light/paper 1.8–4.8 CSS px para un Ø efectivo de 5–6 px o más.
      r: theme === 'dark' ? Math.random() * 2.2 + 0.6 : Math.random() * 3 + 1.8,
      vy: -(Math.random() * 0.35 + 0.12),
      sway: Math.random() * 0.6 + 0.2,
      swaySpeed: Math.random() * 0.6 + 0.3,
      phase: Math.random() * Math.PI * 2,
      alpha: Math.random() * alphaSpan + alphaBase,
      color: palette[Math.floor(Math.random() * palette.length)] ?? fallback,
    })
  }
  return particles
}

export default function ParticleField() {
  const reduceMotion = usePrefersReducedMotion()
  // Tema observado desde <html>: al cambiar, este efecto se re-ejecuta y
  // regenera las partículas con la paleta/alpha del tema nuevo.
  const themeMode = useDocumentTheme()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    let width = window.innerWidth
    let height = window.innerHeight
    let particles: Particle[] = []
    let raf = 0
    let last = performance.now()

    const resize = () => {
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      particles = createParticles(width, height, themeMode)
    }

    const draw = (now: number) => {
      const dt = Math.min((now - last) / 16.6667, 3)
      last = now
      ctx.clearRect(0, 0, width, height)
      for (const p of particles) {
        p.y += p.vy * dt
        p.phase += p.swaySpeed * 0.02 * dt
        const x = p.x + Math.sin(p.phase) * p.sway * 12
        if (p.y < -p.r) {
          p.y = height + p.r
          p.x = Math.random() * width
        }
        ctx.beginPath()
        ctx.arc(x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `${p.color}${p.alpha})`
        ctx.fill()
      }
      raf = requestAnimationFrame(draw)
    }

    const drawStatic = () => {
      ctx.shadowBlur = 0
      ctx.clearRect(0, 0, width, height)
      for (const p of particles) {
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `${p.color}${p.alpha})`
        ctx.fill()
      }
    }

    resize()

    let running = !reduceMotion
    const stop = () => {
      running = false
      cancelAnimationFrame(raf)
    }
    const start = () => {
      if (running || reduceMotion) return
      running = true
      raf = requestAnimationFrame(draw)
    }

    if (reduceMotion) {
      drawStatic()
    } else {
      raf = requestAnimationFrame(draw)
    }

    const onResize = () => {
      resize()
      if (reduceMotion) drawStatic()
    }
    const onVisibility = () => {
      if (reduceMotion) return
      if (document.hidden) stop()
      else start()
    }
    window.addEventListener('resize', onResize)
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [reduceMotion, themeMode])

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden="true"
    />
  )
}
