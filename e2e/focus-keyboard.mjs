#!/usr/bin/env node
/**
 * E1 — Validación de teclado/foco end-to-end (Playwright).
 *
 * Comprueba, en el build servido, que al abrir cada overlay el foco entra
 * dentro, queda atrapado (Tab/Shift+Tab), Escape cierra y el foco vuelve al
 * disparador; además de que los anuncios `aria-live` se emiten al copiar,
 * marcar favorito y reproducir.
 *
 *   npm run preview            # en otra terminal (build ya generado)
 *   node e2e/focus-keyboard.mjs
 *   BASE_URL=http://localhost:4173 CHROME_PATH=/ruta/chrome node e2e/focus-keyboard.mjs
 *
 * Sale con código 1 si alguna comprobación falla.
 */

import { chromium } from 'playwright-core'
import { existsSync, readdirSync, statSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

const BASE = process.env.BASE_URL ?? 'http://localhost:4173'

function resolveChrome() {
  if (process.env.CHROME_PATH && existsSync(process.env.CHROME_PATH)) {
    return process.env.CHROME_PATH
  }
  const cache = join(homedir(), '.cache', 'ms-playwright')
  if (existsSync(cache)) {
    for (const dir of readdirSync(cache).filter((d) => d.startsWith('chromium'))) {
      for (const rel of ['chrome-linux64/chrome', 'chrome-linux/chrome']) {
        const candidate = join(cache, dir, rel)
        if (existsSync(candidate) && statSync(candidate).isFile()) return candidate
      }
    }
  }
  return undefined
}

const results = []
const rec = (name, ok, detail = '') => {
  results.push({ name, ok, detail })
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  :: ' + detail : ''}`)
}

const insideSel = (page, sel) =>
  page.evaluate((s) => {
    const el = document.activeElement
    const c = document.querySelector(s)
    return !!(c && el && c.contains(el))
  }, sel)

const activeInfo = (page) =>
  page.evaluate(() => {
    const el = document.activeElement
    return {
      tag: el?.tagName,
      label: el?.getAttribute?.('aria-label') ?? null,
      text: (el?.textContent ?? '').trim().slice(0, 40),
    }
  })

async function trapCheck(page, containerSel, label) {
  const sel =
    containerSel +
    ' a[href], ' +
    containerSel +
    ' button:not([disabled]), ' +
    containerSel +
    ' input:not([disabled]), ' +
    containerSel +
    ' [tabindex]:not([tabindex="-1"])'
  const count = await page.locator(sel).count()
  let ok = true
  let detail = ''
  for (let i = 0; i < count + 3; i++) {
    await page.keyboard.press('Tab')
    if (!(await insideSel(page, containerSel))) {
      const a = await activeInfo(page)
      ok = false
      detail = `Tab#${i + 1} escapó → ${a.tag} "${a.label ?? a.text}"`
      break
    }
  }
  rec(`[${label}] Tab queda atrapado (${count} focusables)`, ok, detail)
}

async function wrapCheck(page, containerSel, label) {
  const sel =
    containerSel +
    ' a[href], ' +
    containerSel +
    ' button:not([disabled]), ' +
    containerSel +
    ' input:not([disabled]), ' +
    containerSel +
    ' [tabindex]:not([tabindex="-1"])'
  const f = page.locator(sel)
  const n = await f.count()
  if (n < 2) {
    rec(`[${label}] wrap`, false, 'menos de 2 focusables')
    return
  }
  await f.nth(0).focus()
  await page.keyboard.press('Shift+Tab')
  const backOk = await f
    .nth(n - 1)
    .evaluate((el) => el === document.activeElement)
    .catch(() => false)
  await f.nth(n - 1).focus()
  await page.keyboard.press('Tab')
  const fwdOk = await f
    .nth(0)
    .evaluate((el) => el === document.activeElement)
    .catch(() => false)
  rec(`[${label}] Shift+Tab envuelve al último`, backOk)
  rec(`[${label}] Tab envuelve al primero`, fwdOk)
}

const isActive = (locator) => locator.evaluate((el) => el === document.activeElement).catch(() => false)

/** Activa un control por teclado (foco + Enter), como haría un usuario. */
const activate = async (page, locator) => {
  await locator.focus()
  await page.keyboard.press('Enter')
}

async function run() {
  const executablePath = resolveChrome()
  const browser = await chromium.launch({
    ...(executablePath ? { executablePath } : {}),
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  })

  // A) Home: diálogo Zen
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } })
    await ctx.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: BASE })
    const page = await ctx.newPage()
    await page.goto(BASE, { waitUntil: 'networkidle' })
    const trigger = page.locator('button[aria-label="Modo zen"]').first()
    await trigger.waitFor({ state: 'visible' })
    await activate(page, trigger)
    const dialog = page.locator('[role="dialog"]')
    await dialog.first().waitFor({ state: 'visible' })
    const ai = await activeInfo(page)
    rec('[Zen] el foco entra en el diálogo', await insideSel(page, '[role="dialog"]'), `${ai.tag} "${ai.label ?? ai.text}"`)
    await trapCheck(page, '[role="dialog"]', 'Zen')
    await wrapCheck(page, '[role="dialog"]', 'Zen')
    await page.keyboard.press('Escape')
    await dialog.first().waitFor({ state: 'detached' }).catch(() => {})
    rec('[Zen] Escape lo cierra', (await page.locator('[role="dialog"]').count()) === 0)
    rec('[Zen] el foco vuelve al disparador', await isActive(trigger))
    await ctx.close()
  }

  // B) Home: reproductor de audio
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } })
    const page = await ctx.newPage()
    await page.goto(BASE, { waitUntil: 'networkidle' })
    const trigger = page.locator('button[aria-label="Abrir reproductor"]')
    await trigger.waitFor({ state: 'visible' })
    await activate(page, trigger)
    const panelSel = '[role="dialog"][aria-label="Reproductor de música ambiente"]'
    const panel = page.locator(panelSel)
    await panel.waitFor({ state: 'visible' })
    const ai = await activeInfo(page)
    rec('[Audio] el foco entra en el panel', await insideSel(page, panelSel), `${ai.tag} "${ai.label ?? ai.text}"`)
    await trapCheck(page, panelSel, 'Audio')
    await wrapCheck(page, panelSel, 'Audio')
    await page.keyboard.press('Escape')
    await panel.waitFor({ state: 'detached' }).catch(() => {})
    rec('[Audio] Escape lo cierra', (await page.locator(panelSel).count()) === 0)
    rec('[Audio] el foco vuelve al disparador', await isActive(trigger))
    await ctx.close()
  }

  // C) /filosofos: ficha de filósofo
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } })
    const page = await ctx.newPage()
    await page.goto(BASE + '/filosofos', { waitUntil: 'networkidle' })
    const trigger = page.locator('button.card-hover').first()
    await trigger.waitFor({ state: 'visible' })
    await activate(page, trigger)
    const dialog = page.locator('[role="dialog"]')
    await dialog.first().waitFor({ state: 'visible' })
    const ai = await activeInfo(page)
    rec('[Ficha] el foco entra en el diálogo', await insideSel(page, '[role="dialog"]'), `${ai.tag} "${ai.label ?? ai.text}"`)
    await trapCheck(page, '[role="dialog"]', 'Ficha')
    await wrapCheck(page, '[role="dialog"]', 'Ficha')
    await page.keyboard.press('Escape')
    await dialog.first().waitFor({ state: 'detached' }).catch(() => {})
    rec('[Ficha] Escape la cierra', (await page.locator('[role="dialog"]').count()) === 0)
    rec('[Ficha] el foco vuelve al disparador', await isActive(trigger))
    await ctx.close()
  }

  // D) Móvil: menú del Navbar
  {
    const ctx = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
    })
    const page = await ctx.newPage()
    await page.goto(BASE, { waitUntil: 'networkidle' })
    const layout = await page.evaluate(() => ({
      innerW: window.innerWidth,
      scrollW: document.documentElement.scrollWidth,
    }))
    rec('[Menu] sin desbordamiento horizontal', layout.scrollW <= layout.innerW + 1, JSON.stringify(layout))
    const trigger = page.locator('button[aria-label="Abrir menú"]')
    await trigger.waitFor({ state: 'visible' })
    await activate(page, trigger)
    const panelSel = 'header nav.flex-col'
    await page.locator(panelSel).first().waitFor({ state: 'visible' })
    const ai = await activeInfo(page)
    rec('[Menu] el foco entra en el menú', await insideSel(page, panelSel), `${ai.tag} "${ai.label ?? ai.text}"`)
    await trapCheck(page, panelSel, 'Menu')
    await wrapCheck(page, panelSel, 'Menu')
    await page.keyboard.press('Escape')
    await page.waitForTimeout(500)
    rec('[Menu] Escape lo cierra', (await page.locator('button[aria-label="Cerrar menú"]').count()) === 0)
    rec('[Menu] el foco vuelve al disparador', await isActive(trigger))
    await ctx.close()
  }

  // E) aria-live en copiar / favorito / reproducir
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } })
    await ctx.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: BASE })
    const page = await ctx.newPage()
    await page.goto(BASE, { waitUntil: 'networkidle' })
    const status = page.locator('[role="status"][aria-live="polite"]')
    const expectStatus = async (expected, label) => {
      let got = ''
      for (let i = 0; i < 30; i++) {
        got = ((await status.textContent()) ?? '').trim()
        if (got.includes(expected)) break
        await page.waitForTimeout(80)
      }
      rec(`[aria-live] ${label} → "${got}"`, got.includes(expected), `esperado "${expected}"`)
    }
    await activate(page, page.locator('button[aria-label="Copiar cita"]').first())
    await expectStatus('Copiado', 'copiar')
    await activate(page, page.locator('button[aria-label="Añadir a favoritos"]').first())
    await expectStatus('Añadido a favoritos', 'favorito')
    await activate(page, page.locator('button[aria-label="Reproducir música"]').first())
    await expectStatus('Reproduciendo', 'reproducir')
    await ctx.close()
  }

  await browser.close()
  const failed = results.filter((r) => !r.ok)
  console.log(`\n==== ${results.length - failed.length}/${results.length} PASS ====`)
  if (failed.length) {
    console.log('FALLOS:')
    for (const f of failed) console.log(' - ' + f.name + (f.detail ? ' :: ' + f.detail : ''))
  }
  process.exit(failed.length ? 1 : 0)
}

run().catch((e) => {
  console.error('ERROR', e)
  process.exit(2)
})
