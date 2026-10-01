export interface Track {
  id: string
  title: string
  artist: string
  src: string
}

/**
 * Playlist de ambiente. Se modela como tupla no vacía: `tracks[0]` es siempre
 * un `Track` definido, de modo que `currentTrack` nunca es `undefined` aunque
 * `trackIndex` venga de una fuente no validada.
 */
export const tracks: [Track, ...Track[]] = [
  {
    id: 'ishopanishad-intimo',
    title: 'Íshopanishad íntimo',
    artist: 'Emand Edroff',
    src: '/audio/emand_edroff-ishopanishad_intimate-480016.m4a',
  },
  {
    id: 'lluvia-en-el-tejado',
    title: 'Lluvia en el tejado',
    artist: 'Konstantin Pazuzu Studio',
    src: '/audio/konstantinpazuzustudio-rain-on-the-roof-neoclassical-piano-514674.m4a',
  },
  {
    id: 'cuenco-zen-sabiduria',
    title: 'Cuenco zen de la sabiduría',
    artist: 'Meditative Tiger',
    src: '/audio/meditativetiger-zen-master-bowl-wisdom-388631.m4a',
  },
  {
    id: 'zen-calmante',
    title: 'Zen calmante',
    artist: 'Pretty John',
    src: '/audio/prettyjohn1-calming-zen-537655.m4a',
  },
  {
    id: 'el-camino-hacia-ti',
    title: 'El camino hacia ti',
    artist: 'Raspberry Music',
    src: '/audio/raspberrymusic-the-way-to-yourself-piano-cinematic-spiritual-410697.m4a',
  },
]
