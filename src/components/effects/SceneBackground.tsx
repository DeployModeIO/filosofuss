import AuroraBackground from './AuroraBackground'
import ParticleField from './ParticleField'
import NoiseOverlay from './NoiseOverlay'

export default function SceneBackground() {
  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      aria-hidden="true"
    >
      <AuroraBackground />
      <ParticleField />
      <NoiseOverlay />
    </div>
  )
}
