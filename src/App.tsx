import { lazy, Suspense } from 'react'
import type { ReactNode } from 'react'
import { AnimatePresence, LazyMotion, m } from 'framer-motion'
import type { Variants } from 'framer-motion'
import { Routes, Route, useLocation } from 'react-router-dom'
import { AppProvider, useApp } from '@/context/AppContext'
import { AudioProvider } from '@/context/AudioContext'
import { NarrationProvider } from '@/context/NarrationContext'
import { QuotesProvider, useQuotes } from '@/context/QuotesContext'
import SceneBackground from '@/components/effects/SceneBackground'
import Navbar from '@/components/ui/Navbar'
import Footer from '@/components/ui/Footer'
import AudioPlayer from '@/components/ui/AudioPlayer'
import ScrollToTop from '@/components/ui/ScrollToTop'
import ZenMode from '@/components/ui/ZenMode'
import QuoteDeepLink from '@/components/ui/QuoteDeepLink'
import ErrorBoundary from '@/components/ui/ErrorBoundary'
import Skeleton from '@/components/ui/Skeleton'
import { StatusAnnouncer } from '@/components/ui/StatusAnnouncer'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { pageVariants } from '@/lib/variants'
import Home from '@/pages/Home'

// Rutas secundarias cargadas bajo demanda para reducir el bundle inicial.
const BrowseQuotes = lazy(() => import('@/components/sections/BrowseQuotes'))
// Feature bundle de Framer Motion cargado en un chunk asíncrono (Task B5 /
// PERF-04). `domMax` incluye `layout`/drag, necesarios para `Favorites` y
// `ThemeToggle`; con `domAnimation` se perderían esas animaciones.
const loadMotionFeatures = () =>
  import('@/lib/motion').then((mod) => mod.motionFeatures)
const PhilosopherWall = lazy(() => import('@/components/sections/PhilosopherWall'))
const Favorites = lazy(() => import('@/components/sections/Favorites'))

/**
 * Variante de página para `prefers-reduced-motion`: sólo opacidad, sin
 * desplazamiento y sin duración (se resuelve en 1 frame). Se usa junto a
 * `initial={false}` para que no haya animación de entrada.
 */
const reducedPageVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0 } },
  exit: { opacity: 0, transition: { duration: 0 } },
}

/**
 * Fallback de carga (Suspense del chunk + gate del corpus): skeleton genérico
 * de la vista objetivo en lugar de un spinner aislado (Task C8 / §3.6).
 * Máximo 3 tarjetas shimmer a la vez.
 */
function RouteFallback() {
  const { t } = useApp()
  return (
    <div
      className="mx-auto w-full max-w-5xl px-6 py-20"
      role="status"
      aria-label={t('status.loading')}
    >
      <Skeleton className="h-3 w-24" />
      <Skeleton className="mt-5 h-10 w-3/4 max-w-lg" />
      <Skeleton className="mt-3 h-10 w-1/2 max-w-sm" />
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} variant="card" />
        ))}
      </div>
    </div>
  )
}

/**
 * Puerta de render: muestra el skeleton mientras el corpus de citas del locale
 * activo se está cargando. Evita que componentes que leen el corpus
 * sincrónicamente (Footer, Hero, ZenMode, QuoteDeepLink…) se monten sin datos.
 */
function QuotesGate({ children }: { children: ReactNode }) {
  const { ready, error } = useQuotes()

  if (error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-6 text-center text-muted">
        No se pudieron cargar las citas. Vuelve a intentarlo.
      </div>
    )
  }

  if (!ready) return <RouteFallback />

  return <>{children}</>
}

export default function App() {
  const location = useLocation()
  const prefersReducedMotion = usePrefersReducedMotion()
  const pageMotion = prefersReducedMotion ? reducedPageVariants : pageVariants

  return (
    <LazyMotion features={loadMotionFeatures} strict>
      <AppProvider>
      <AudioProvider>
        <NarrationProvider>
          <QuotesProvider>
            <ScrollToTop />
            <StatusAnnouncer />
            <SceneBackground />
            <Navbar />
            <QuotesGate>
              <main className="relative z-0 min-h-screen">
                <Suspense fallback={<RouteFallback />}>
                  <ErrorBoundary>
                    {/* Transición de ruta (§3.1): `mode="wait"` + tween
                        0.22 s sólo `opacity`/`y`. El fallback de `Suspense`
                        queda FUERA de `AnimatePresence`, así que entra sin
                        transición. `key` por pathname: los cambios de query
                        (filtros) no reaniman. */}
                    <AnimatePresence mode="wait">
                      <m.div
                        key={location.pathname}
                        variants={pageMotion}
                        initial={prefersReducedMotion ? false : 'initial'}
                        animate="animate"
                        exit="exit"
                      >
                        <Routes location={location}>
                          <Route path="/" element={<Home />} />
                          <Route path="/explorar" element={<BrowseQuotes />} />
                          <Route path="/filosofos" element={<PhilosopherWall />} />
                          <Route path="/favoritos" element={<Favorites />} />
                          <Route path="*" element={<Home />} />
                        </Routes>
                      </m.div>
                    </AnimatePresence>
                  </ErrorBoundary>
                </Suspense>
              </main>
              <Footer />
              <AudioPlayer />
              <ZenMode />
              <QuoteDeepLink />
            </QuotesGate>
          </QuotesProvider>
        </NarrationProvider>
      </AudioProvider>
      </AppProvider>
    </LazyMotion>
  )
}
