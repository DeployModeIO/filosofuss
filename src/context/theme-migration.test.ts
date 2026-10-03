import { afterEach, describe, expect, it, vi } from 'vitest'

interface MockStorage {
  getItem: (key: string) => string | null
  setItem: (key: string, value: string) => void
  removeItem: (key: string) => void
}

const THEME_KEY = 'filosofuss:theme'
const FLAG_KEY = 'filosofuss:theme-migrated-v2'

/** localStorage en memoria, igual que en lib/storage.test.ts. */
function createStorage(initial: Record<string, string> = {}): MockStorage & {
  dump: () => Record<string, string>
} {
  const store = new Map<string, string>(Object.entries(initial))
  return {
    getItem: (key) => store.get(key) ?? null,
    setItem: (key, value) => {
      store.set(key, value)
    },
    removeItem: (key) => {
      store.delete(key)
    },
    dump: () => Object.fromEntries(store),
  }
}

/**
 * La migración es un efecto de módulo de AppContext: hay que reiniciar el
 * registro de módulos y stubear `window` ANTES del import dinámico para que
 * se evalúe contra el storage simulado (mismo truco que storage.test.ts).
 */
async function importAppContext(storage: MockStorage) {
  vi.resetModules()
  vi.stubGlobal('window', { localStorage: storage })
  await import('@/context/AppContext')
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('migración única dark-legacy → light', () => {
  it('convierte el dark heredado y pone el flag (usuario sin elección explícita)', async () => {
    const storage = createStorage({ [THEME_KEY]: JSON.stringify('dark') })
    await importAppContext(storage)
    expect(storage.dump()[THEME_KEY]).toBe(JSON.stringify('light'))
    expect(storage.getItem(FLAG_KEY)).toBe('1')
  })

  it('respeta el dark cuando el flag ya está puesto (elección post-migración)', async () => {
    const storage = createStorage({
      [THEME_KEY]: JSON.stringify('dark'),
      [FLAG_KEY]: '1',
    })
    await importAppContext(storage)
    expect(storage.getItem(THEME_KEY)).toBe(JSON.stringify('dark'))
  })
})
