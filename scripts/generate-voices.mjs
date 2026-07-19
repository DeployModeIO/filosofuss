// ============================================================================
//  generate-voices.mjs
//  Generador de narración de citas con Microsoft Edge TTS (gratis, sin API key).
//
//  Soporta dos idiomas:
//    --lang es   (por defecto) usa las citas en español (quotes.ts + batches)
//                voz es-MX-JorgeNeural, rate -12%, pitch -3Hz
//    --lang en   usa las TRADUCCIONES al inglés (quotesEn.ts, generadas por
//                translate-quotes-glm.mjs) voz en-US-GuyNeural, rate -8%, pitch -2Hz
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
//    node scripts/generate-voices.mjs --lang en
//    node scripts/generate-voices.mjs --limit 5     (solo las primeras 5)
//    node scripts/generate-voices.mjs --force      (regenera aunque existan)
// ============================================================================

import { readFileSync, writeFileSync, existsSync, mkdirSync, statSync } from 'node:fs'
import { readdirSync } from 'node:fs'
import { join, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawn, spawnSync } from 'node:child_process'

// ----------------------------------------------------------------------------
//  CONFIGURACIÓN POR IDIOMA
// ----------------------------------------------------------------------------
const LANGS = {
  es: {
    voice: 'es-MX-JorgeNeural',
    rate: '-12%',
    pitch: '-3Hz',
    dataFiles: ['quotes.ts', 'quotesBatch1.ts', 'quotesBatch2.ts', 'quotesBatch3.ts', 'quotesBatch4.ts'],
    audioSubdir: 'es',
    manifestSet: 'narratedEsQuoteIds',
    label: 'español',
  },
  en: {
    voice: 'en-US-GuyNeural',
    rate: '-8%',
    pitch: '-2Hz',
    dataFiles: ['quotesEn.ts'],
    audioSubdir: 'en',
    manifestSet: 'narratedEnQuoteIds',
    label: 'inglés',
  },
}

// ----------------------------------------------------------------------------
//  PARÁMETROS DE LÍNEA DE COMANDOS
// ----------------------------------------------------------------------------
const argv = process.argv.slice(2)
function hasFlag(name) {
  return argv.includes(name)
}
function getArgValue(name) {
  const i = argv.indexOf(name)
  if (i !== -1 && argv[i + 1]) return argv[i + 1]
  return null
}
const LANG = getArgValue('--lang') || 'es'
const FORCE = hasFlag('--force')
const LIMIT = (() => {
  const i = argv.indexOf('--limit')
  if (i !== -1 && argv[i + 1]) {
    const n = parseInt(argv[i + 1], 10)
    if (!Number.isNaN(n) && n > 0) return n
  }
  return Infinity
})()

if (!LANGS[LANG]) {
  console.error(`Idioma no soportado: ${LANG}. Usa --lang es|en`)
  process.exit(1)
}
const CFG = LANGS[LANG]

const __dirname = dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = resolve(__dirname, '..')
const DATA_DIR = join(PROJECT_ROOT, 'src', 'data')
const AUDIO_DIR = join(PROJECT_ROOT, 'public', 'audio', 'voice', LANG)
const MANIFEST_PATH = join(DATA_DIR, 'voiceManifest.ts')

// ----------------------------------------------------------------------------
//  EXTRACCIÓN DE CITAS POR REGEX (sin importar TypeScript)
// ----------------------------------------------------------------------------
function extractQuotesFromText(content) {
  const quotes = []
  const idRegex = /id\s*:\s*(['"])(q-[^'"]+)\1/g
  let m
  while ((m = idRegex.exec(content)) !== null) {
    const id = m[2]
    const afterId = idRegex.lastIndex
    const window = content.slice(afterId, afterId + 4000)
    const textMatch = window.match(/text\s*:\s*(['"])((?:\\.|(?!\1).)*?)\1/)
    if (!textMatch) continue
    let text = textMatch[2]
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

function loadQuotes() {
  const map = new Map()
  for (const file of CFG.dataFiles) {
    const path = join(DATA_DIR, file)
    if (!existsSync(path)) {
      console.warn(`[aviso] No se encontró ${file}, se omite.`)
      continue
    }
    for (const q of extractQuotesFromText(readFileSync(path, 'utf8'))) {
      map.set(q.id, q.text)
    }
  }
  const list = [...map.entries()].map(([id, text]) => ({ id, text }))
  list.sort((a, b) => a.id.localeCompare(b.id))
  return list
}

// ----------------------------------------------------------------------------
//  DETECCIÓN DEL BINARIO edge-tts (CLI de Python)
// ----------------------------------------------------------------------------
function detectRunner() {
  const candidates = [
    { cmd: 'D:\\Python\\python.exe', baseArgs: ['-m', 'edge_tts'] },
    { cmd: 'edge-tts', baseArgs: [] },
    { cmd: 'python', baseArgs: ['-m', 'edge_tts'] },
    { cmd: 'py', baseArgs: ['-m', 'edge_tts'] },
    { cmd: 'python3', baseArgs: ['-m', 'edge_tts'] },
  ]
  function probe(cmd, baseArgs, shell) {
    const res = spawnSync(cmd, [...baseArgs, '--list-voices'], {
      stdio: ['ignore', 'ignore', 'ignore'],
      shell,
    })
    return res.error === undefined && res.status === 0
  }
  for (const { cmd, baseArgs } of candidates) {
    if (probe(cmd, baseArgs, false)) return { cmd, baseArgs, shell: false }
    if (probe(cmd, baseArgs, true)) return { cmd, baseArgs, shell: true }
  }
  return null
}

function printInstallInstructions() {
  console.error('\nERROR: no se pudo invocar `edge-tts` de ninguna forma.\n')
  console.error('Instálalo con Python (gratis, sin API key):')
  console.error('    pip install edge-tts\n')
  console.error('Verificación manual:')
  console.error('    python -m edge_tts --list-voices\n')
}

// ----------------------------------------------------------------------------
//  GENERACIÓN DE UN MP3 PARA UNA CITA (vía CLI edge-tts)
// ----------------------------------------------------------------------------
function generateOne({ id, text }, outPath, runner) {
  return new Promise((resolveGen) => {
    const child = spawn(
      runner.cmd,
      [...runner.baseArgs, '--voice', CFG.voice, '--rate', CFG.rate, '--pitch', CFG.pitch, '--text', text, '--write-media', outPath],
      { stdio: ['ignore', 'inherit', 'inherit'], shell: runner.shell },
    )
    child.on('error', (err) => resolveGen({ ok: false, error: err.message }))
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
//  Mantiene los dos idiomas. Si solo generamos uno, conserva el otro
//  escaneando su carpeta de audio existente.
// ----------------------------------------------------------------------------
function regenerateManifest() {
  const dirs = {
    es: join(PROJECT_ROOT, 'public', 'audio', 'voice', 'es'),
    en: join(PROJECT_ROOT, 'public', 'audio', 'voice', 'en'),
  }
  function scan(lang) {
    const d = dirs[lang]
    if (!existsSync(d)) return []
    return readdirSync(d)
      .filter((f) => f.endsWith('.mp3'))
      .map((f) => f.replace(/\.mp3$/, ''))
      .sort((a, b) => a.localeCompare(b))
  }
  const esIds = scan('es')
  const enIds = scan('en')

  const setBlock = (ids) => ids.map((id) => `  "${id}",`).join('\n')
  const content = `// Autogenerado por scripts/generate-voices.mjs — no editar a mano.
// Mapa de citas que tienen narración disponible por idioma.
export const voiceLangs = ['es', 'en'] as const
export type VoiceLang = (typeof voiceLangs)[number]

/** Set de ids de cita que tienen MP3 de narración en español. */
export const narratedEsQuoteIds: ReadonlySet<string> = new Set<string>([
${setBlock(esIds)}
])

/** Set de ids de cita que tienen MP3 de narración en inglés. */
export const narratedEnQuoteIds: ReadonlySet<string> = new Set<string>([
${setBlock(enIds)}
])

/** Devuelve la ruta pública del MP3 de una cita en el idioma dado, o null. */
export function getNarrationSrc(quoteId: string, lang: VoiceLang = 'es'): string | null {
  if (lang === 'es' && narratedEsQuoteIds.has(quoteId)) {
    return \`/audio/voice/es/\${quoteId}.mp3\`
  }
  if (lang === 'en' && narratedEnQuoteIds.has(quoteId)) {
    return \`/audio/voice/en/\${quoteId}.mp3\`
  }
  return null
}
`
  writeFileSync(MANIFEST_PATH, content, 'utf8')
  return { es: esIds.length, en: enIds.length }
}

// ----------------------------------------------------------------------------
//  CÁLCULO DE PESO TOTAL
// ----------------------------------------------------------------------------
function folderSize(dir) {
  if (!existsSync(dir)) return 0
  let total = 0
  for (const f of readdirSync(dir)) {
    try {
      total += statSync(join(dir, f)).size
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
const CONCURRENCY = 3

async function main() {
  mkdirSync(AUDIO_DIR, { recursive: true })
  console.log(`Idioma     : ${CFG.label} (${LANG})`)
  console.log(`Raíz        : ${PROJECT_ROOT}`)
  console.log(`Carpeta aud : ${AUDIO_DIR}`)

  console.log('Detectando edge-tts...')
  const runner = detectRunner()
  if (runner === null) {
    printInstallInstructions()
    process.exit(1)
  }
  console.log(`edge-tts    : ${runner.cmd} ${runner.baseArgs.join(' ')}`)

  let allQuotes = loadQuotes()
  if (Number.isFinite(LIMIT)) allQuotes = allQuotes.slice(0, LIMIT)

  const total = allQuotes.length
  console.log(`Citas       : ${total}`)
  console.log(`Voz         : ${CFG.voice} | rate ${CFG.rate} | pitch ${CFG.pitch}\n`)

  let generated = 0
  let skipped = 0
  let failed = 0

  await runLimited(allQuotes, CONCURRENCY, async (q, i) => {
    const outPath = join(AUDIO_DIR, `${q.id}.mp3`)
    if (!FORCE && existsSync(outPath) && statSync(outPath).size > 0) {
      skipped++
      console.log(`[${i + 1}/${total}] ${q.id} skip`)
      return
    }
    const res = await generateOne(q, outPath, runner)
    if (res.ok) {
      generated++
      console.log(`[${i + 1}/${total}] ${q.id} OK`)
    } else {
      failed++
      console.error(`[${i + 1}/${total}] ${q.id} FALLÓ (${res.error})`)
    }
  })

  const counts = regenerateManifest()
  const size = folderSize(AUDIO_DIR)
  console.log('\n=== Resumen ===')
  console.log(`Generados : ${generated}`)
  console.log(`Saltados  : ${skipped}`)
  console.log(`Fallidos  : ${failed}`)
  console.log(`Manifest  : es=${counts.es} en=${counts.en} ids`)
  console.log(`Peso ${LANG} : ${formatBytes(size)} (${AUDIO_DIR})`)
  if (failed > 0) {
    console.error(`\nHubo ${failed} citas fallidas. Re-ejecuta el script para reintentar solo las que faltan.`)
  }
}

main().catch((err) => {
  console.error('Error fatal:', err)
  process.exit(1)
})
