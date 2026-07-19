import { useEffect, useRef } from 'react'

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

const COLORS = ['rgba(201,169,106,', 'rgba(124,92,255,', 'rgba(230,101,159,']

function createParticles(width: number, height: number): Particle[] {
  const count = Math.min(70, Math.max(22, Math.floor(width / 24)))
  const particles: Particle[] = []
  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 2.2 + 0.6,
      vy: -(Math.random() * 0.35 + 0.12),
      sway: Math.random() * 0.6 + 0.2,
      swaySpeed: Math.random() * 0.6 + 0.3,
      phase: Math.random() * Math.PI * 2,
      alpha: Math.random() * 0.5 + 0.2,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    })
  }
  return particles
}

export default function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reduceMotion =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

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
      particles = createParticles(width, height)
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
        ctx.shadowBlur = 8
        ctx.shadowColor = `${p.color}${p.alpha * 0.6})`
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

    if (reduceMotion) {
      drawStatic()
    } else {
      raf = requestAnimationFrame(draw)
    }

    const onResize = () => {
      resize()
      if (reduceMotion) drawStatic()
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden="true"
    />
  )
}
