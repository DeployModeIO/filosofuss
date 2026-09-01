import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { AppProvider } from '@/context/AppContext'
import { AudioProvider } from '@/context/AudioContext'
import { NarrationProvider } from '@/context/NarrationContext'
import SceneBackground from '@/components/effects/SceneBackground'
import Navbar from '@/components/ui/Navbar'
import Footer from '@/components/ui/Footer'
import AudioPlayer from '@/components/ui/AudioPlayer'
import ScrollToTop from '@/components/ui/ScrollToTop'
import ZenMode from '@/components/ui/ZenMode'
import QuoteDeepLink from '@/components/ui/QuoteDeepLink'
import Home from '@/pages/Home'

// Rutas secundarias cargadas bajo demanda para reducir el bundle inicial.
const BrowseQuotes = lazy(() => import('@/components/sections/BrowseQuotes'))
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

export default function App() {
  return (
    <AppProvider>
      <AudioProvider>
        <NarrationProvider>
          <ScrollToTop />
          <SceneBackground />
          <Navbar />
          <main className="relative z-0 min-h-screen">
            <Suspense fallback={<RouteFallback />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/explorar" element={<BrowseQuotes />} />
                <Route path="/filosofos" element={<PhilosopherWall />} />
                <Route path="/favoritos" element={<Favorites />} />
                <Route path="*" element={<Home />} />
              </Routes>
            </Suspense>
          </main>
          <Footer />
          <AudioPlayer />
          <ZenMode />
          <QuoteDeepLink />
        </NarrationProvider>
      </AudioProvider>
    </AppProvider>
  )
}
