import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.filosofuss.app',
  appName: 'Filosofuss',
  webDir: 'dist',
  // SEC-20: sirve el bundle por `https` dentro del WebView Android. Se
  // declara explícito para no depender del esquema por defecto y evitar
  // contenido mixto al cargar assets locales.
  server: {
    androidScheme: 'https',
  },
  plugins: {
    // Splash nativo con el mismo negro que el fondo web (#0A0A0F) y una
    // duración corta. Además se oculta tras montar la app (ver src/main.tsx),
    // por eso `launchAutoHide` se deja en su valor por defecto.
    SplashScreen: {
      backgroundColor: '#0A0A0F',
      launchShowDuration: 500,
    },
    // Texto claro sobre fondo oscuro. Todo esto queda inerte hasta que se
    // ejecute `npx cap sync` (que es quien copia la config a android/).
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#0A0A0F',
    },
  },
}

export default config
