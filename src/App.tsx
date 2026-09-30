import { lazy, Suspense } from 'react'
import type { ReactNode } from 'react'
import { LazyMotion } from 'framer-motion'
import { Routes, Route } from 'react-router-dom'
import { AppProvider } from '@/context/AppContext'
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

function RouteFallback() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <span
        aria-hidden="true"
        className="h-9 w-9 animate-spin rounded-full border-2 border-line-soft border-t-accent"
      />
    </div>
  )
}

/**
 * Puerta de render: muestra un fallback (spinner) mientras el corpus de citas
 * del locale activo se está cargando. Evita que componentes que leen el corpus
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
  return (
    <LazyMotion features={loadMotionFeatures} strict>
      <AppProvider>
      <AudioProvider>
        <NarrationProvider>
          <QuotesProvider>
            <ScrollToTop />
            <SceneBackground />
            <Navbar />
            <QuotesGate>
              <main className="relative z-0 min-h-screen">
                <Suspense fallback={<RouteFallback />}>
                  <ErrorBoundary>
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/explorar" element={<BrowseQuotes />} />
                      <Route path="/filosofos" element={<PhilosopherWall />} />
                      <Route path="/favoritos" element={<Favorites />} />
                      <Route path="*" element={<Home />} />
                    </Routes>
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
