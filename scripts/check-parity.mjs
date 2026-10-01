#!/usr/bin/env node
/*
 * check-parity.mjs — paridad ES/EN y deduplicación del corpus (sin deps).
 *
 * Carga/parsea el código fuente del corpus (no los módulos compilados) y
 * comprueba:
 *   (a) paridad de ids ES ↔ EN: cada id del corpus (incluidos los alias de
 *       citas retiradas por duplicado) tiene traducción EN y viceversa.
 *       Objetivo de este hito: 507/507 (499 registros canónicos + 8 alias).
 *   (b) ausencia de textos de cita duplicados dentro del corpus ES,
 *       normalizando por trim/lowercase/acentos (COD-10 / F-10).
 *
 * Imprime una tabla y sale con código != 0 si alguna comprobación falla.
 *
 * Uso: node scripts/check-parity.mjs
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')

const ES_FILES = [
  'src/data/quotesBase.ts',
  'src/data/quotesBatch1.ts',
  'src/data/quotesBatch2.ts',
  'src/data/quotesBatch3.ts',
  'src/data/quotesBatch4.ts',
]
const EN_FILE = 'src/data/quotesEn.ts'
const ALIAS_FILE = 'src/data/quotes.ts'

/** Número esperado de pares id↔traducción tras el dedupe (499 + 8 alias). */
const EXPECTED_PAIRS = 507

const read = (rel) => readFileSync(resolve(ROOT, rel), 'utf8')

/**
 * Extrae pares `id`/`text` de un módulo de datos. Cada entrada ocupa varias
 * líneas con `id: '...'` seguido de `text: '...'`; el parser es lineal y
 * tolera comillas simples o dobles y apóstrofos internos (match codicioso
 * anclado al final de línea).
 */
function parseEntries(source, file) {
  const entries = []
  let id = null
  for (const line of source.split(/\r?\n/)) {
    let m = line.match(/^\s*id:\s*(["'])(.*?)\1\s*,?\s*$/)
    if (m) {
      id = m[2]
      continue
    }
    m = line.match(/^\s*text:\s*(["'])(.*)\1\s*,?\s*$/)
    if (m && id != null) {
      entries.push({ id, text: m[2], file })
      id = null
    }
  }
  return entries
}

/** Clave de comparación: sin acentos, sin mayúsculas y con espacios colapsados. */
function normalizeText(s) {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}

const esEntries = ES_FILES.flatMap((f) => parseEntries(read(f), f))
const enEntries = parseEntries(read(EN_FILE), EN_FILE)

const aliasSource = read(ALIAS_FILE)
const aliasBlock = aliasSource.match(/QUOTE_ALIASES[\s\S]*?=\s*\{([\s\S]*?)\}/)
const aliases = new Map()
if (aliasBlock) {
  for (const m of aliasBlock[1].matchAll(/["']([^"']+)["']\s*:\s*["']([^"']+)["']/g)) {
    aliases.set(m[1], m[2])
  }
}

const esIds = new Set(esEntries.map((e) => e.id))
const enIds = new Set(enEntries.map((e) => e.id))
const idNamespace = new Set([...esIds, ...aliases.keys()])

const failures = []

// Alias coherentes: el id retirado no debe seguir en el corpus y su canónico sí.
for (const [alias, canonical] of aliases) {
  if (esIds.has(alias)) {
    failures.push(`El alias '${alias}' sigue presente como registro del corpus.`)
  }
  if (!esIds.has(canonical)) {
    failures.push(`El alias '${alias}' apunta a '${canonical}', que no existe en el corpus.`)
  }
}

// (a) Paridad ES ↔ EN.
const esWithoutEn = [...idNamespace].filter((id) => !enIds.has(id))
const enWithoutEs = [...enIds].filter((id) => !idNamespace.has(id))
const parityOk =
  esWithoutEn.length === 0 &&
  enWithoutEs.length === 0 &&
  idNamespace.size === enIds.size &&
  idNamespace.size === EXPECTED_PAIRS
if (!parityOk) {
  failures.push(
    `Paridad rota: ES=${idNamespace.size}, EN=${enIds.size} (esperado ${EXPECTED_PAIRS}/${EXPECTED_PAIRS}).`,
  )
  if (esWithoutEn.length) {
    failures.push(`Ids ES sin traducción EN (${esWithoutEn.length}): ${esWithoutEn.slice(0, 10).join(', ')}`)
  }
  if (enWithoutEs.length) {
    failures.push(`Ids EN sin cita ES (${enWithoutEs.length}): ${enWithoutEs.slice(0, 10).join(', ')}`)
  }
}

// (b) Textos duplicados en ES.
const byText = new Map()
for (const e of esEntries) {
  const key = normalizeText(e.text)
  if (!byText.has(key)) byText.set(key, [])
  byText.get(key).push(e)
}
const duplicateGroups = [...byText.values()].filter((g) => g.length > 1)
const duplicatesOk = duplicateGroups.length === 0
if (!duplicatesOk) {
  failures.push(
    `Textos ES duplicados: ${duplicateGroups.length} grupo(s) (${duplicateGroups.reduce((n, g) => n + g.length, 0)} registros).`,
  )
}

/** Imprime una tabla ASCII simple. */
function printTable(rows) {
  const headers = ['Comprobación', 'Resultado', 'Detalle']
  const all = [headers, ...rows]
  const widths = headers.map((_, i) => Math.max(...all.map((r) => String(r[i]).length)))
  const line = (cells) =>
    cells.map((c, i) => String(c).padEnd(widths[i])).join('  ')
  console.log(line(headers))
  console.log(widths.map((w) => '-'.repeat(w)).join('  '))
  for (const row of rows) console.log(line(row))
}

console.log('\n=== Paridad ES/EN y dedupe de corpus — Filosofuss ===\n')
printTable([
  [
    'Registros ES (canónicos)',
    'INFO',
    `${esEntries.length} (${byText.size} textos únicos)`,
  ],
  [
    'Alias de citas retiradas',
    'INFO',
    `${aliases.size} (${[...aliases.keys()].join(', ') || 'ninguno'})`,
  ],
  [
    'Traducciones EN',
    'INFO',
    `${enEntries.length} registros`,
  ],
  [
    'Paridad ES ↔ EN',
    parityOk ? 'PASS' : 'FAIL',
    `${idNamespace.size}/${enIds.size} (esperado ${EXPECTED_PAIRS}/${EXPECTED_PAIRS})`,
  ],
  [
    'Textos ES duplicados',
    duplicatesOk ? 'PASS' : 'FAIL',
    `${duplicateGroups.length} grupo(s) sobre ${byText.size} textos`,
  ],
])

if (duplicateGroups.length) {
  console.log('\nGrupos duplicados (primeros 20):')
  for (const g of duplicateGroups.slice(0, 20)) {
    console.log(`  - ${g.map((e) => `${e.file}:${e.id}`).join(' == ')}`)
    console.log(`    "${g[0].text}"`)
  }
}

if (esWithoutEn.length || enWithoutEs.length) {
  console.log('\nDesajustes de paridad (primeros 20):')
  for (const id of esWithoutEn.slice(0, 20)) console.log(`  ES sin EN: ${id}`)
  for (const id of enWithoutEs.slice(0, 20)) console.log(`  EN sin ES: ${id}`)
}

if (failures.length) {
  console.log('\n=== Resumen ===')
  for (const f of failures) console.log(`  FAIL: ${f}`)
  console.log(`\nRESULT: FAIL — ${failures.length} comprobación(es) fallaron.\n`)
  process.exit(1)
}

console.log(
  `\nRESULT: PASS — paridad ${idNamespace.size}/${enIds.size} y 0 textos duplicados.\n`,
)
