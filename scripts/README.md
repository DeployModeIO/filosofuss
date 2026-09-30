# Generador de voces (narración de citas)

Script que genera un audio **AAC (.m4a)** de narración para cada cita del corpus
de Filosofuss, usando **Microsoft Edge TTS** (gratis, sin API key, sin límites de
uso) y **ffmpeg** para reencodear la salida temporal a `.m4a` mono a 24 kbps.

## Qué hace

- Lee los archivos de datos de citas (`src/data/quotes.ts` y los lotes
  `quotesBatch1..4.ts`) como texto y extrae los pares `{ id, text }`.
- Genera la narración de cada cita con Edge TTS. En español usa la voz
  **`es-MX-JorgeNeural`** (`rate=-12%`, `pitch=-3Hz`); en inglés
  (`--lang en`) usa **`en-US-GuyNeural`** (`rate=-8%`, `pitch=-2Hz`).
- Convierte cada salida temporal `.mp3` a **`.m4a` (AAC, mono, 24 kbps)** con
  `ffmpeg -c:a aac -b:a 24k -ac 1` y borra el temporal.
- Los archivos se guardan en `public/audio/voice/<lang>/<id>.m4a`
  (ej. `public/audio/voice/es/q-nietzsche-1.m4a`).
- Es **incremental**: si un `.m4a` ya existe y no está vacío, lo salta. Puedes
  re-ejecutarlo tantas veces como quieras sin regenerar todo.
- Al terminar, **regenera automáticamente** `src/data/voiceManifest.ts`
  escaneando la carpeta y listando qué citas tienen narración disponible.
- Muestra progreso (`[i/total] q-xxx OK`), un resumen final (generados,
  saltados, fallidos, peso total) y continúa con las demás citas si alguna falla.

## Requisitos

- **Python 3.8+** instalado y accesible en el PATH.
- El binario **`edge-tts`** (CLI de Python). Instalación:

  ```bash
  pip install edge-tts
  # Si `pip` no está disponible, prueba:
  python -m pip install edge-tts
  python3 -m pip install edge-tts
  ```

- **ffmpeg** en el PATH (conversión MP3 temporal → AAC `.m4a`):

  ```bash
  winget install Gyan.FFmpeg     # Windows
  brew install ffmpeg            # macOS
  sudo apt install ffmpeg        # Debian/Ubuntu
  ```

  Si falta, el script imprime instrucciones y sale con error antes de generar.

- **Node.js 18+** para correr el script.
- Acceso a internet (Microsoft Edge TTS se ejecuta en la nube de Microsoft).

> El script prefiere el CLI de Python `edge-tts` porque es el más estable y
> común. Si el comando no existe, el script imprime instrucciones de instalación
> y sale.

## Cómo ejecutarlo

Desde la raíz del proyecto:

```bash
# Generar narración en español para TODAS las citas (incremental).
node scripts/generate-voices.mjs

# Generar la narración en inglés (usa quotesEn.ts).
node scripts/generate-voices.mjs --lang en

# Generar solo una muestra de las primeras N citas (útil para probar).
node scripts/generate-voices.mjs --limit 5

# Regenerar aunque los .m4a ya existan.
node scripts/generate-voices.mjs --force
```

## Costo

Es **gratis**: Microsoft Edge TTS no requiere API key ni tarjeta de crédito y no
impone límites estrictos para uso personal. El tráfico va a los servidores de
Microsoft.

## Voz y parámetros

La configuración por idioma está al inicio de `scripts/generate-voices.mjs`:

```js
const LANGS = {
  es: { voice: 'es-MX-JorgeNeural', rate: '-12%', pitch: '-3Hz', audioSubdir: 'es' },
  en: { voice: 'en-US-GuyNeural',  rate: '-8%',  pitch: '-2Hz', audioSubdir: 'en' },
}
const CONCURRENCY = 3           // conversiones simultáneas máximas
const AUDIO_EXT = '.m4a'        // formato final (AAC en contenedor MP4)
const TMP_MEDIA_EXT = '.mp3'    // salida temporal de edge-tts antes de ffmpeg
```

Para cambiar la voz, usa cualquier voz `es-*` / `en-*` de Edge TTS. Puedes
listarlas con:

```bash
edge-tts --list-voices
```

## Dónde quedan los audios

`public/audio/voice/es/<id>.m4a` (ej. `public/audio/voice/es/q-nietzsche-1.m4a`)
y, para inglés, `public/audio/voice/en/<id>.m4a`.

Estos archivos son **estáticos** y se sirven desde la raíz pública
(`/audio/voice/es/<id>.m4a`). Se recomienda **subirlos al repo** para no tener
que regenerarlos en cada despliegue.

## Manifiesto

`src/data/voiceManifest.ts` se reescribe solo. Exporta:

- `voiceLangs` / `VoiceLang`: idiomas soportados (`['es', 'en']`).
- `narratedEsQuoteIds` / `narratedEnQuoteIds`: `Set` de ids que tienen `.m4a`.
- `getNarrationSrc(quoteId, lang?)`: devuelve la ruta pública del `.m4a` o `null`.

## Peso estimado

Las 1019 narraciones actuales (es + en) ocupan aproximadamente **24 MB** en
total (AAC mono de 24 kbps para frases cortas).
