#!/usr/bin/env node
/**
 * check-sw.mjs — verificación estática del service worker (sin dependencias).
 *
 * Comprueba:
 *   (a) ninguna entrada de PRECACHE_URLS termina en `.mp3`
 *       (el audio queda fuera del precache; PERF-01 / A6).
 *   (b) el nombre de caché NO es el literal fijo `filosofuss-v1`
 *       (debe estar versionado; SEC-27 / UX-27).
 *   (c) el handler de navegación valida `fresh.ok`/`response.ok`
 *       antes de hacer `cache.put` (SEC-26 / W-01).
 *
 * Uso: node scripts/check-sw.mjs   → imprime PASS/FAIL y sale con código != 0 si falla.
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const swPath = resolve(here, '..', 'public', 'sw.js')

let source
try {
  source = readFileSync(swPath, 'utf8')
} catch (err) {
  console.error(`FAIL — no se pudo leer ${swPath}: ${err.message}`)
  process.exit(1)
}

const results = []

// (a) PRECACHE_URLS sin entradas de audio.
const precacheMatch = source.match(/const\s+PRECACHE_URLS\s*=\s*\[([\s\S]*?)\]/)
if (!precacheMatch) {
  results.push(['PRECACHE_URLS declarado', false, 'no se encontró el array PRECACHE_URLS'])
} else {
  const entries = [...precacheMatch[1].matchAll(/['"]([^'"]*)['"]/g)].map((m) => m[1])
  const mp3 = entries.filter((e) => /\.mp3$/i.test(e))
  results.push([
    'PRECACHE_URLS sin .mp3',
    entries.length > 0 && mp3.length === 0,
    entries.length === 0
      ? 'no se encontraron entradas'
      : mp3.length > 0
        ? `entradas .mp3 presentes: ${mp3.join(', ')}`
        : `${entries.length} entradas, ninguna .mp3`,
  ])
}

// (b) Nombre de caché versionado (no el literal filosfuss-v1).
const cacheMatch = source.match(/const\s+CACHE\s*=\s*([^\n;]+)/)
if (!cacheMatch) {
  results.push(['CACHE versionado', false, 'no se encontró la constante CACHE'])
} else {
  const rhs = cacheMatch[1].trim()
  const isFixedV1 = /^['"]filosofuss-v1['"]$/.test(rhs)
  const looksVersioned = /filosofuss-/.test(rhs) && !isFixedV1
  results.push([
    'CACHE versionado (no filosofuss-v1)',
    looksVersioned,
    `declaración: ${rhs}`,
  ])
}

// (c) Guarda `fresh.ok`/`response.ok` antes de cachear la navegación.
const navIndex = source.search(/request\.mode\s*===\s*['"]navigate['"]/)
if (navIndex === -1) {
  results.push(['navegación valida .ok antes de cache.put', false, 'no se encontró el handler de navegación'])
} else {
  const putIndex = source.indexOf('cache.put(', navIndex)
  const region = putIndex === -1 ? source.slice(navIndex) : source.slice(navIndex, putIndex)
  const hasGuard = /if\s*\([^)]*\b(fresh|response)\.ok\b/.test(region)
  results.push([
    'navegación valida .ok antes de cache.put',
    hasGuard && putIndex !== -1,
    putIndex === -1
      ? 'no se encontró cache.put tras el handler de navegación'
      : hasGuard
        ? 'guarda presente'
        : 'cache.put sin comprobar fresh.ok/response.ok',
  ])
}

let failed = 0
for (const [name, ok, detail] of results) {
  if (!ok) failed += 1
  console.log(`${ok ? 'PASS' : 'FAIL'} — ${name}${detail ? ` (${detail})` : ''}`)
}

if (failed > 0) {
  console.log(`\nFAIL — ${failed} comprobación(es) del service worker fallaron.`)
  process.exit(1)
}

console.log('\nPASS — service worker OK.')
