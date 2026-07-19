import { Routes, Route } from 'react-router-dom'
import { AppProvider } from '@/context/AppContext'
import { AudioProvider } from '@/context/AudioContext'
import { NarrationProvider } from '@/context/NarrationContext'
import SceneBackground from '@/components/effects/SceneBackground'
import Navbar from '@/components/ui/Navbar'
import Footer from '@/components/ui/Footer'
import AudioPlayer from '@/components/ui/AudioPlayer'
import ScrollToTop from '@/components/ui/ScrollToTop'
import Home from '@/pages/Home'
import BrowseQuotes from '@/components/sections/BrowseQuotes'
import PhilosopherWall from '@/components/sections/PhilosopherWall'
import Favorites from '@/components/sections/Favorites'

export default function App() {
  return (
    <AppProvider>
      <AudioProvider>
        <NarrationProvider>
          <ScrollToTop />
          <SceneBackground />
          <Navbar />
          <main className="relative z-0 min-h-screen">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/explorar" element={<BrowseQuotes />} />
              <Route path="/filosofos" element={<PhilosopherWall />} />
              <Route path="/favoritos" element={<Favorites />} />
              <Route path="*" element={<Home />} />
            </Routes>
          </main>
          <Footer />
          <AudioPlayer />
        </NarrationProvider>
      </AudioProvider>
    </AppProvider>
  )
}
