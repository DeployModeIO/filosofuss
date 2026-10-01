#!/usr/bin/env node
/*
 * budget.mjs — presupuesto del bundle inicial (Task E4), sin dependencias.
 *
 * Lee `dist/index.html` (generado por `vite build`) y extrae los recursos que
 * el navegador descarga de forma *eager*: el `<script type="module">` de
 * entrada, los `<link rel="modulepreload">` (vendor: react, icons…) y la hoja
 * de estilos. Calcula su tamaño gzip (nivel 9) con `node:zlib`.
 *
 * Comprueba el presupuesto de la Definition of Done:
 *     JS inicial + CSS inicial  ≤  120 KiB gzip  (120 * 1024 B)
 * y sale con código != 0 si se supera.
 *
 * Además imprime los chunks diferidos (carga bajo demanda), el total de
 * `dist/` y recuerda que Brotli (`.br`) es una decisión de hosting: este
 * script no lo emite ni lo mide (no hay plugin de compresión).
 *
 * Uso: npm run budget   (equivale a `npm run build && node scripts/budget.mjs`)
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { gzipSync } from 'node:zlib'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const DIST = resolve(ROOT, 'dist')
const INDEX_HTML = resolve(DIST, 'index.html')

/** Presupuesto del bundle inicial: 120 KiB gzip (DoD). */
const BUDGET_KIB = 120
const BUDGET_BYTES = BUDGET_KIB * 1024

if (!existsSync(INDEX_HTML)) {
  console.error(
    'FAIL — no existe dist/index.html. Ejecuta `npm run build` antes que este script.',
  )
  process.exit(1)
}

const html = readFileSync(INDEX_HTML, 'utf8')

/** Convierte una ruta relativa del HTML (`./assets/x.js`) en ruta absoluta. */
function resolveAsset(href) {
  return resolve(DIST, href.replace(/^\.?\//, ''))
}

/**
 * Recursos eager declarados en `dist/index.html`:
 *   - `<script src>` (el entry module),
 *   - `<link rel="modulepreload" href>` (imports estáticos del entry),
 *   - `<link rel="stylesheet" href>` (CSS crítico).
 */
function eagerAssets(source) {
  const found = new Map()

  for (const match of source.matchAll(/<script\b[^>]*>/g)) {
    const src = match[0].match(/\bsrc=["']([^"']+)["']/)?.[1]
    if (src) found.set(src, 'js')
  }

  for (const match of source.matchAll(/<link\b[^>]*>/g)) {
    const tag = match[0]
    if (!/\brel=["'](?:stylesheet|modulepreload)["']/.test(tag)) continue
    const href = tag.match(/\bhref=["']([^"']+)["']/)?.[1]
    if (!href) continue
    found.set(href, /\.css$/i.test(href) ? 'css' : 'js')
  }

  return [...found.entries()].map(([href, kind]) => ({ href, kind, path: resolveAsset(href) }))
}

const eager = eagerAssets(html)

if (eager.length === 0) {
  console.error('FAIL — no se encontraron recursos eager en dist/index.html.')
  process.exit(1)
}

/** Tamaño en bytes de un archivo. */
const fileSize = (path) => statSync(path).size

/** Tamaño gzip (nivel 9) de un archivo, leído de disco. */
const gzipSize = (path) => gzipSync(readFileSync(path), { level: 9 }).length

const measured = eager.map((asset) => ({
  ...asset,
  raw: fileSize(asset.path),
  gzip: gzipSize(asset.path),
}))

const sum = (items, key) => items.reduce((total, item) => total + item[key], 0)

const eagerJs = measured.filter((a) => a.kind === 'js')
const eagerCss = measured.filter((a) => a.kind === 'css')
const eagerTotal = sum(measured, 'gzip')
const withinBudget = eagerTotal <= BUDGET_BYTES

/** Todos los archivos de dist/assets, para reportar diferidos y totales. */
function walk(dir) {
  const out = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) out.push(...walk(full))
    else out.push(full)
  }
  return out
}

const distFiles = walk(DIST)
const distTotal = distFiles.reduce((total, file) => total + fileSize(file), 0)

const eagerPaths = new Set(measured.map((a) => a.path))
const lazyChunks = distFiles
  .filter((file) => /\.(js|css)$/i.test(file) && !eagerPaths.has(file))
  .map((file) => ({ file, gzip: gzipSize(file) }))
  .sort((a, b) => b.gzip - a.gzip)

/** Imprime una tabla ASCII simple. */
function printTable(rows, headers) {
  const all = [headers, ...rows]
  const widths = headers.map((_, i) => Math.max(...all.map((r) => String(r[i]).length)))
  const line = (cells) => cells.map((c, i) => String(c).padEnd(widths[i])).join('  ')
  console.log(line(headers))
  console.log(widths.map((w) => '-'.repeat(w)).join('  '))
  for (const row of rows) console.log(line(row))
}

const kib = (bytes) => (bytes / 1024).toFixed(2)

console.log('\n=== Presupuesto de bundle — Filosofuss (Task E4) ===\n')
console.log('Recursos eager (carga inicial):')
printTable(
  measured.map((a) => [
    relative(DIST, a.path),
    a.kind.toUpperCase(),
    `${a.raw} B`,
    `${a.gzip} B`,
    `${kib(a.gzip)} KiB`,
  ]),
  ['Archivo', 'Tipo', 'Raw', 'Gzip', 'Gzip (KiB)'],
)

console.log(`\nJS inicial:  ${sum(eagerJs, 'gzip')} B (${kib(sum(eagerJs, 'gzip'))} KiB)`)
console.log(`CSS inicial: ${sum(eagerCss, 'gzip')} B (${kib(sum(eagerCss, 'gzip'))} KiB)`)
console.log(
  `JS+CSS eager: ${eagerTotal} B (${kib(eagerTotal)} KiB)  /  presupuesto ${BUDGET_KIB} KiB (${BUDGET_BYTES} B)`,
)

console.log(`\nChunks diferidos (carga bajo demanda): ${lazyChunks.length}`)
for (const chunk of lazyChunks) {
  console.log(`  - ${relative(DIST, chunk.file).padEnd(44)} ${chunk.gzip} B gzip`)
}

console.log(`\ndist/ total: ${distTotal} B (${kib(distTotal)} KiB) en ${distFiles.length} archivo(s)`)
console.log(
  '\nNota: Brotli no se emite aquí (sin plugin de compresión). Habilitarlo es una\n' +
    'decisión de hosting/CDN: serviría ~15-20 % menos de bytes que gzip.',
)

if (!withinBudget) {
  const over = eagerTotal - BUDGET_BYTES
  console.log(
    `\nRESULT: FAIL — el bundle inicial supera el presupuesto en ${over} B (${kib(over)} KiB).\n`,
  )
  process.exit(1)
}

console.log(
  `\nRESULT: PASS — bundle inicial ${eagerTotal} B (${kib(eagerTotal)} KiB) ≤ ${BUDGET_KIB} KiB gzip.\n`,
)
