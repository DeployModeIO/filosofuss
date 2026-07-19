# Generador de voces (narración de citas)

Script que genera un MP3 de narración **en español latino** para cada cita del
corpus de Filosofuss, usando **Microsoft Edge TTS** (gratis, sin API key, sin
límites de uso).

## Qué hace

- Lee los archivos de datos de citas (`src/data/quotes.ts` y los lotes
  `quotesBatch1..4.ts`) como texto y extrae los pares `{ id, text }`.
- Genera un MP3 por cita con la voz **`es-MX-JorgeNeural`**, con un tono
  pausado y grave ("sabio anciano"): `rate=-12%`, `pitch=-3Hz`.
- Los archivos se guardan en `public/audio/voice/es/<id>.mp3`.
- Es **incremental**: si un MP3 ya existe y no está vacío, lo salta. Puedes
  re-ejecutarlo tantas veces como quieras sin regenerar todo.
- Al terminar, **regenera automáticamente** `src/data/voiceManifest.ts`
  escaneando la carpeta y listando qué citas tienen narración disponible.
- Muestra progreso (`[i/total] q-xxx ✓`), un resumen final (generados, saltados,
  fallidos, peso total) y continúa con las demás citas si alguna falla.

## Requisitos

- **Python 3.8+** instalado y accesible en el PATH.
- El binario **`edge-tts`** (CLI de Python). Instalación:

  ```bash
  pip install edge-tts
  # Si `pip` no está disponible, prueba:
  python -m pip install edge-tts
  python3 -m pip install edge-tts
  ```

- **Node.js 18+** para correr el script.
- Acceso a internet (Microsoft Edge TTS se ejecuta en la nube de Microsoft).

> El script prefiere el CLI de Python `edge-tts` porque es el más estable y
> común. Si el comando no existe, el script imprime instrucciones de instalación
> y sale.

## Cómo ejecutarlo

Desde la raíz del proyecto (`D:\Filosofuss`):

```bash
# Generar narración para TODAS las citas (incremental).
node scripts/generate-voices.mjs

# Generar solo una muestra de las primeras N citas (útil para probar).
node scripts/generate-voices.mjs --limit 5

# Regenerar aunque los MP3 ya existan.
node scripts/generate-voices.mjs --force
```

## Costo

Es **gratis**: Microsoft Edge TTS no requiere API key ni tarjeta de crédito y no
impone límites estrictos para uso personal. El tráfico va a los servidores de
Microsoft.

## Voz y parámetros

La voz y el tono se configuran al inicio de `scripts/generate-voices.mjs` como
constantes:

```js
const VOICE = 'es-MX-JorgeNeural'
const RATE  = '-12%'   // más lento
const PITCH = '-3Hz'   // más grave
const CONCURRENCY = 3  // conversiones simultáneas máximas
```

Para cambiar la voz, usa cualquier voz `es-*` de Edge TTS (por ejemplo
`es-MX-DaliaNeural`, `es-ES-AlvaroNeural`). Puedes listarlas con:

```bash
edge-tts --list-voices | findstr es-
```

## Dónde quedan los MP3

`public/audio/voice/es/<id>.mp3` (ej. `public/audio/voice/es/q-nietzsche-1.mp3`).

Estos archivos son **estáticos** y se sirven desde la raíz pública
(`/audio/voice/es/<id>.mp3`). Se recomienda **subirlos al repo** para no tener
que regenerarlos en cada despliegue.

## Manifiesto

`src/data/voiceManifest.ts` se reescribe solo. Exporta:

- `voiceLangs` / `VoiceLang`: idiomas soportados (`'es'` por ahora).
- `narratedQuoteIds`: `Set` de ids que tienen MP3.
- `getNarrationSrc(quoteId, lang?)`: devuelve la ruta pública o `null`.

## Peso estimado

Unas **611 citas** generan aproximadamente **15–25 MB** en total (MP3
optimizados de frases cortas).
