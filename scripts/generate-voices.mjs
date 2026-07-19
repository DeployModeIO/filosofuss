// ============================================================================
//  generate-voices.mjs
//  Generador de narración de citas con Microsoft Edge TTS (gratis, sin API key).
//
//  ESTE SCRIPT ES Node ESM (.mjs). NO importa los .ts de citas directamente
//  (porque usan TypeScript y alias "@/"); en su lugar LEE los archivos de
//  datos como texto y extrae los pares {id, text} con expresiones regulares.
//
//  Requisitos (ver scripts/README.md):
//    - Python 3 instalado.
//    - `pip install edge-tts`  (CLI de Python: edge-tts)
//    - Node.js 18+ para correr este script.
//
//  Ejecución:
//    node scripts/generate-voices.mjs
//    node scripts/generate-voices.mjs --limit 5     (solo las primeras 5, para muestra)
//    node scripts/generate-voices.mjs --force      (regenera aunque existan)
// ============================================================================

import { readFileSync, writeFileSync, existsSync, mkdirSync, statSync } from 'node:fs'
import { readdirSync } from 'node:fs'
import { join, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync, spawn } from 'node:child_process'

// ----------------------------------------------------------------------------
//  CONFIGURACIÓN  (cámbiala aquí para usar otra voz / tono / velocidad)
// ----------------------------------------------------------------------------
const VOICE = 'es-MX-JorgeNeural' // Voz neutra masculina, español de México.
const RATE = '-12%'               // Más lento: tono pausado, "sabio anciano".
const PITCH = '-3Hz'              // Tono ligeramente más grave.
const CONCURRENCY = 3             // Máximo de conversiones en paralelo.

// Rutas relativas a la raíz del proyecto (donde está scripts/).
const __dirname = dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = resolve(__dirname, '..')
const DATA_DIR = join(PROJECT_ROOT, 'src', 'data')
const AUDIO_DIR = join(PROJECT_ROOT, 'public', 'audio', 'voice', 'es')
const MANIFEST_PATH = join(DATA_DIR, 'voiceManifest.ts')

// Archivos de datos de donde extraer las citas (la base + los 4 lotes).
const QUOTE_FILES = [
  'quotes.ts',
  'quotesBatch1.ts',
  'quotesBatch2.ts',
  'quotesBatch3.ts',
  'quotesBatch4.ts',
]

// ----------------------------------------------------------------------------
//  PARÁMETROS DE LÍNEA DE COMANDOS
// ----------------------------------------------------------------------------
const argv = process.argv.slice(2)
function hasFlag(name) {
  return argv.includes(name)
}
function getLimit() {
  const i = argv.indexOf('--limit')
  if (i !== -1 && argv[i + 1]) {
    const n = parseInt(argv[i + 1], 10)
    if (!Number.isNaN(n) && n > 0) return n
  }
  return Infinity
}
const FORCE = hasFlag('--force')
const LIMIT = getLimit()

// ----------------------------------------------------------------------------
//  EXTRACCIÓN DE CITAS POR REGEX (sin importar TypeScript)
// ----------------------------------------------------------------------------
// Buscamos objetos que contengan un `id: "q-..."` (o comillas simples) y su
// `text: "..."` (o comillas simples). Soportamos comillas escapadas dentro del
// texto (ej. \" o \'). El regex no es un parser completo, pero es suficiente
// para el formato uniforme de estos archivos.
//
// Estrategia: encontrar cada `id:` y, justo después (antes del siguiente `id:`,
// `}` o `,` de cierre de objeto), encontrar el `text:`.
function extractQuotesFromText(content) {
  const quotes = []
  // Coincide: id: <quote>  donde <quote> es un string con comillas simple o doble
  // y admite escapes. También texto potencialmente multilínea.
  const idRegex = /id\s*:\s*(['"])(q-[^'"]+)\1/g
  let m
  while ((m = idRegex.exec(content)) !== null) {
    const id = m[2]
    // Buscar `text:` a partir de la posición actual, hasta el siguiente `id:` o `}`.
    const afterId = idRegex.lastIndex
    // Recortamos una "ventana" razonable para no atravesar todo el archivo.
    const window = content.slice(afterId, afterId + 4000)
    const textMatch = window.match(/text\s*:\s*(['"])((?:\\.|(?!\1).)*?)\1/)
    if (!textMatch) continue
    let text = textMatch[2]
    // Des-escapar comillas y barras que el TS habría escapado.
    text = text
      .replace(/\\(['"])/g, '$1')
      .replace(/\\n/g, '\n')
      .replace(/\\\\/g, '\\')
      .trim()
    if (text.length > 0) {
      quotes.push({ id, text })
    }
  }
  return quotes
}

function loadAllQuotes() {
  const map = new Map() // deduplica por id (el último encontrado gana).
  for (const file of QUOTE_FILES) {
    const path = join(DATA_DIR, file)
    if (!existsSync(path)) {
      console.warn(`[aviso] No se encontró ${file}, se omite.`)
      continue
    }
    const content = readFileSync(path, 'utf8')
    const found = extractQuotesFromText(content)
    for (const q of found) {
      map.set(q.id, q.text)
    }
  }
  // Orden estable por id.
  const list = [...map.entries()].map(([id, text]) => ({ id, text }))
  list.sort((a, b) => a.id.localeCompare(b.id))
  return list
}

// ----------------------------------------------------------------------------
//  DETECCIÓN DEL BINARIO edge-tts (CLI de Python)
// ----------------------------------------------------------------------------
// En Windows, tras `pip install edge-tts`, el binario `edge-tts` NO siempre
// queda en el PATH, pero SIEMPRE se puede invocar como módulo con
// `python -m edge_tts`. Por eso probamos varias formas de invocación y nos
// quedamos con la primera que funcione.
function detectRunner() {
  // Candidatas EN ORDEN de preferencia: binario directo, módulo de Python,
  // launcher de Windows (py) y python3 (Linux/mac).
  const candidates = [
    { cmd: 'edge-tts', baseArgs: [] },              // binario directo
    { cmd: 'python', baseArgs: ['-m', 'edge_tts'] }, // módulo de Python
    { cmd: 'py', baseArgs: ['-m', 'edge_tts'] },     // Windows py launcher
    { cmd: 'python3', baseArgs: ['-m', 'edge_tts'] },// Linux/mac
  ]

  // Prueba una candidata con un modo de shell concreto. Se considera OK si el
  // proceso no dio error al lanzarse Y terminó con código 0.
  function probe(cmd, baseArgs, shell) {
    const res = spawnSync(cmd, [...baseArgs, '--list-voices'], {
      stdio: ['ignore', 'ignore', 'ignore'],
      shell,
    })
    return res.error === undefined && res.status === 0
  }

  for (const { cmd, baseArgs } of candidates) {
    // En Windows a veces hace falta shell:true para resolver comandos .cmd.
    // Probamos primero shell:false y, si falla, shell:true; guardamos el modo
    // que funcionó para reutilizarlo luego en generateOne.
    if (probe(cmd, baseArgs, false)) {
      return { cmd, baseArgs, shell: false }
    }
    if (probe(cmd, baseArgs, true)) {
      return { cmd, baseArgs, shell: true }
    }
  }

  // Ninguna forma de invocación funcionó.
  return null
}

function printInstallInstructions() {
  console.error('')
  console.error('ERROR: no se pudo invocar `edge-tts` de ninguna forma.')
  console.error('')
  console.error('Instálalo con Python (gratis, sin API key):')
  console.error('    pip install edge-tts')
  console.error('')
  console.error('Si pip no está en el PATH, prueba:')
  console.error('    python -m pip install edge-tts')
  console.error('    # o bien con Python 3 explícito:')
  console.error('    python3 -m pip install edge-tts')
  console.error('')
  console.error('En Windows: tras instalar, si el comando `edge-tts` no se reconoce,')
  console.error('este script YA intenta automáticamente `python -m edge_tts`, así que')
  console.error('basta con tener Python + el paquete edge_tts instalados (no hace falta')
  console.error('que `edge-tts` esté en el PATH).')
  console.error('')
  console.error('Verificación manual:')
  console.error('    python -m edge_tts --list-voices')
  console.error('')
  console.error('Requisitos: Python 3.8+ y acceso a internet (Microsoft Edge TTS).')
  console.error('')
}

// ----------------------------------------------------------------------------
//  GENERACIÓN DE UN MP3 PARA UNA CITA (vía CLI edge-tts)
// ----------------------------------------------------------------------------
function generateOne({ id, text }, outPath, runner) {
  return new Promise((resolveGen) => {
    // edge-tts --voice es-MX-JorgeNeural --rate=-12% --pitch=-3Hz \
    //          --text "..." --write-media salida.mp3
    // Se usa el runner detectado (binario directo o `python -m edge_tts`, etc.)
    // junto con su modo de shell, para máxima compatibilidad en Windows.
    const child = spawn(
      runner.cmd,
      [...runner.baseArgs, '--voice', VOICE, '--rate', RATE, '--pitch', PITCH, '--text', text, '--write-media', outPath],
      { stdio: ['ignore', 'inherit', 'inherit'], shell: runner.shell },
    )
    child.on('error', (err) => {
      resolveGen({ ok: false, error: err.message })
    })
    child.on('close', (code) => {
      if (code === 0 && existsSync(outPath) && statSync(outPath).size > 0) {
        resolveGen({ ok: true })
      } else {
        resolveGen({ ok: false, error: `código de salida ${code}` })
      }
    })
  })
}

// ----------------------------------------------------------------------------
//  REGENERACIÓN DEL MANIFIESTO src/data/voiceManifest.ts
// ----------------------------------------------------------------------------
function regenerateManifest() {
  let ids = []
  if (existsSync(AUDIO_DIR)) {
    ids = readdirSync(AUDIO_DIR)
      .filter((f) => f.endsWith('.mp3'))
      .map((f) => f.replace(/\.mp3$/, ''))
      .sort((a, b) => a.localeCompare(b))
  }

  const lines = ids.map((id) => `  "${id}",`).join('\n')
  const content = `// Autogenerado por scripts/generate-voices.mjs — no editar a mano.
// Mapa de citas que tienen narración en español disponible.
export const voiceLangs = ['es'] as const
export type VoiceLang = (typeof voiceLangs)[number]

/** Set de ids de cita que tienen MP3 de narración en español. */
export const narratedQuoteIds: ReadonlySet<string> = new Set<string>([
${lines}
])

/** Devuelve la ruta pública del MP3 de una cita en el idioma dado, o null. */
export function getNarrationSrc(quoteId: string, lang: VoiceLang = 'es'): string | null {
  if (lang === 'es' && narratedQuoteIds.has(quoteId)) {
    return \`/audio/voice/es/\${quoteId}.mp3\`
  }
  return null
}
`
  writeFileSync(MANIFEST_PATH, content, 'utf8')
  return ids.length
}

// ----------------------------------------------------------------------------
//  CÁLCULO DE PESO TOTAL DE LA CARPETA DE AUDIO
// ----------------------------------------------------------------------------
function folderSize(dir) {
  if (!existsSync(dir)) return 0
  let total = 0
  for (const f of readdirSync(dir)) {
    const p = join(dir, f)
    try {
      total += statSync(p).size
    } catch {
      /* ignora */
    }
  }
  return total
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// ----------------------------------------------------------------------------
//  PROCESAMIENTO CON CONCURRENCIA LIMITADA
// ----------------------------------------------------------------------------
async function runLimited(items, limit, worker) {
  const results = []
  let index = 0
  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (index < items.length) {
      const i = index++
      results[i] = await worker(items[i], i)
    }
  })
  await Promise.all(runners)
  return results
}

// ----------------------------------------------------------------------------
//  MAIN
// ----------------------------------------------------------------------------
async function main() {
  // Creamos SIEMPRE la carpeta de destino primero, para que exista aunque la
  // detección de edge-tts falle después (así el usuario ve que el script arrancó).
  mkdirSync(AUDIO_DIR, { recursive: true })
  console.log(`Raíz del proyecto: ${PROJECT_ROOT}`)
  console.log(`Carpeta de audio : ${AUDIO_DIR}`)

  console.log('Detectando edge-tts...')
  const runner = detectRunner()
  if (runner === null) {
    printInstallInstructions()
    process.exit(1)
  }
  console.log(`edge-tts detectado vía: ${runner.cmd} ${runner.baseArgs.join(' ')}`)

  let allQuotes = loadAllQuotes()
  if (!Number.isFinite(LIMIT)) {
    // sin límite
  } else {
    allQuotes = allQuotes.slice(0, LIMIT)
  }

  const total = allQuotes.length
  console.log(`Citas a procesar: ${total}`)
  console.log(`Voz: ${VOICE} | rate ${RATE} | pitch ${PITCH}`)
  console.log(`Destino: ${AUDIO_DIR}`)
  console.log('')

  let generated = 0
  let skipped = 0
  let failed = 0

  await runLimited(allQuotes, CONCURRENCY, async (q, i) => {
    const outPath = join(AUDIO_DIR, `${q.id}.mp3`)
    // Incremental: saltar si ya existe y no está vacío (salvo --force).
    if (!FORCE && existsSync(outPath) && statSync(outPath).size > 0) {
      skipped++
      console.log(`[${i + 1}/${total}] ${q.id} skip`)
      return
    }
    const res = await generateOne(q, outPath, runner)
    if (res.ok) {
      generated++
      console.log(`[${i + 1}/${total}] ${q.id} ✓`)
    } else {
      failed++
      console.error(`[${i + 1}/${total}] ${q.id} ✗ (${res.error})`)
    }
  })

  // Regenerar manifiesto escaneando la carpeta.
  const manifestCount = regenerateManifest()

  const size = folderSize(AUDIO_DIR)
  console.log('')
  console.log('=== Resumen ===')
  console.log(`Generados : ${generated}`)
  console.log(`Saltados  : ${skipped}`)
  console.log(`Fallidos  : ${failed}`)
  console.log(`Manifiesto: ${manifestCount} ids en voiceManifest.ts`)
  console.log(`Peso total: ${formatBytes(size)} (${AUDIO_DIR})`)
  if (failed > 0) {
    console.error(`\nHubo ${failed} citas fallidas. Re-ejecuta el script para reintentar solo las que faltan.`)
  }
}

main().catch((err) => {
  console.error('Error fatal:', err)
  process.exit(1)
})
