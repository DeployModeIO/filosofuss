#!/usr/bin/env node
/**
 * Lighthouse ≥90 ×4 en todas las rutas — Task E5.
 *
 * No añade `lighthouse` a `package.json` (requiere aprobación): lo ejecuta vía
 * `npx --yes lighthouse@12`. Tampoco arranca el servidor: apunta a una URL ya
 * servida (`npm run preview`, por defecto http://localhost:4173).
 *
 *   node scripts/lighthouse.mjs                 # mobile + desktop, rutas por defecto
 *   node scripts/lighthouse.mjs --preset=mobile # sólo el preset móvil
 *   BASE_URL=http://localhost:4173 node scripts/lighthouse.mjs
 *   CHROME_PATH=/ruta/a/chrome node scripts/lighthouse.mjs
 *
 * Salida: JSON + HTML en `--out` (por defecto /tmp/lighthouse) y una tabla con
 * las cuatro categorías. Sale con código 1 si alguna categoría < `--min`
 * (por defecto 90).
 */

import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

const argv = process.argv.slice(2)
const flag = (name, fallback) => {
  const hit = argv.find((a) => a.startsWith(`--${name}=`))
  return hit ? hit.slice(name.length + 3) : fallback
}

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:4173'
const OUT_DIR = flag('out', '/tmp/lighthouse')
const PRESET = flag('preset', 'both') // both | mobile | desktop
const MIN = Number(flag('min', '90'))
const ROUTES = [
  { name: 'home', path: '/' },
  { name: 'explorar', path: '/explorar' },
]

/** Localiza un Chromium ejecutable: env → Playwright → sistema. */
function resolveChrome() {
  if (process.env.CHROME_PATH && existsSync(process.env.CHROME_PATH)) {
    return process.env.CHROME_PATH
  }
  const cache = join(homedir(), '.cache', 'ms-playwright')
  const patterns = [
    (d) => join(cache, d, 'chrome-linux64', 'chrome'),
    (d) => join(cache, d, 'chrome-linux', 'chrome'),
    (d) => join(cache, d, 'chrome-linux', 'headless_shell'),
  ]
  if (existsSync(cache)) {
    const dirs = readdirSync(cache).filter((d) => d.startsWith('chromium'))
    for (const dir of dirs) {
      for (const make of patterns) {
        const candidate = make(dir)
        if (existsSync(candidate) && statSync(candidate).isFile()) return candidate
      }
    }
  }
  for (const p of [
    '/opt/google/chrome/chrome',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
  ]) {
    if (existsSync(p)) return p
  }
  return undefined
}

/** Lanza `lighthouse` y devuelve el score por categoría. */
function runLighthouse(url, preset, outputPath) {
  const args = [
    '--yes',
    'lighthouse@12',
    url,
    '--only-categories=performance,accessibility,best-practices,seo',
    '--output=json',
    '--output=html',
    `--output-path=${outputPath}`,
    '--quiet',
    '--chrome-flags=--headless=new --no-sandbox --disable-dev-shm-usage --disable-gpu',
  ]
  if (preset === 'desktop') args.push('--preset=desktop')

  const res = spawnSync('npx', args, {
    stdio: 'inherit',
    env: { ...process.env, ...(chrome ? { CHROME_PATH: chrome } : {}) },
  })
  if (res.status !== 0) throw new Error(`lighthouse falló (exit ${res.status}) para ${url}`)

  const report = JSON.parse(readFileSync(`${outputPath}.report.json`, 'utf8'))
  const scores = {}
  for (const key of ['performance', 'accessibility', 'best-practices', 'seo']) {
    scores[key] = Math.round((report.categories[key]?.score ?? 0) * 100)
  }
  return scores
}

const chrome = resolveChrome()
if (!chrome) {
  console.warn('Aviso: no se encontró Chromium; Lighthouse usará el navegador por defecto.')
} else {
  console.log(`Chromium: ${chrome}`)
}

mkdirSync(OUT_DIR, { recursive: true })

const presets = PRESET === 'both' ? ['mobile', 'desktop'] : [PRESET]
const rows = []
let failed = false

for (const preset of presets) {
  for (const route of ROUTES) {
    const url = `${BASE_URL}${route.path}`
    const out = join(OUT_DIR, `${route.name}-${preset}`)
    console.log(`\n▶ ${preset}  ${url}`)
    const scores = runLighthouse(url, preset, out)
    rows.push({ preset, route: route.path, ...scores })
    if (Object.values(scores).some((s) => s < MIN)) failed = true
  }
}

const pad = (v, n) => String(v).padEnd(n)
console.log('\n===== Lighthouse (umbral ≥' + MIN + ') =====')
console.log([pad('preset', 9), pad('route', 11), pad('perf', 6), pad('a11y', 6), pad('bp', 6), pad('seo', 6)].join(''))
for (const r of rows) {
  console.log([pad(r.preset, 9), pad(r.route, 11), pad(r.performance, 6), pad(r.accessibility, 6), pad(r['best-practices'], 6), pad(r.seo, 6)].join(''))
}
console.log(`\nReportes en ${OUT_DIR}`)

process.exit(failed ? 1 : 0)
