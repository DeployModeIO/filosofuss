import { afterEach, describe, expect, it, vi } from 'vitest'

interface MockStorage {
  getItem: (key: string) => string | null
  setItem: (key: string, value: string) => void
  removeItem: (key: string) => void
}

/** localStorage en memoria para aislar los tests del navegador. */
function createStorage(initial: Record<string, string> = {}): MockStorage {
  const store = new Map<string, string>(Object.entries(initial))
  return {
    getItem: (key) => store.get(key) ?? null,
    setItem: (key, value) => {
      store.set(key, value)
    },
    removeItem: (key) => {
      store.delete(key)
    },
  }
}

/**
 * Importa `@/lib/storage` con un `window` simulado. El módulo captura
 * `typeof window` al evaluarse, así que hay que reiniciar el registro de
 * módulos antes de cada import dinámico.
 */
async function importStorage(storage: MockStorage) {
  vi.resetModules()
  vi.stubGlobal('window', { localStorage: storage })
  return import('@/lib/storage')
}

const isSize = (value: unknown): value is 'sm' | 'md' | 'lg' =>
  value === 'sm' || value === 'md' || value === 'lg'

describe('safeGet', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.resetModules()
  })

  it('devuelve el fallback sin window (SSR)', async () => {
    vi.resetModules()
    const { safeGet } = await import('@/lib/storage')
    expect(safeGet('zen:size', 'md')).toBe('md')
  })

  it('lee y parsea un JSON válido', async () => {
    const storage = createStorage({ 'filosofuss:theme': JSON.stringify('paper') })
    const { safeGet } = await importStorage(storage)
    expect(safeGet('filosofuss:theme', 'dark')).toBe('paper')
  })

  it('devuelve el fallback cuando el JSON está corrupto', async () => {
    const storage = createStorage({ 'zen:size': '{esto-no-es-json' })
    const { safeGet } = await importStorage(storage)
    expect(safeGet('zen:size', 'md')).toBe('md')
  })

  it('aplica el validador y rechaza formas de otra versión', async () => {
    const storage = createStorage({ 'zen:size': JSON.stringify(999) })
    const { safeGet } = await importStorage(storage)
    expect(safeGet('zen:size', 'md', isSize)).toBe('md')
  })

  it('acepta el valor cuando pasa el validador', async () => {
    const storage = createStorage({ 'zen:size': JSON.stringify('lg') })
    const { safeGet } = await importStorage(storage)
    expect(safeGet('zen:size', 'md', isSize)).toBe('lg')
  })

  it('devuelve el fallback si localStorage lanza (modo privado)', async () => {
    const storage: MockStorage = {
      getItem: () => {
        throw new Error('acceso denegado')
      },
      setItem: () => undefined,
      removeItem: () => undefined,
    }
    const { safeGet } = await importStorage(storage)
    expect(safeGet('k', 'fallback')).toBe('fallback')
  })
})

describe('safeSet / safeRemove', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.resetModules()
  })

  it('persiste y elimina valores redondeando por JSON', async () => {
    const storage = createStorage()
    const { safeGet, safeRemove, safeSet } = await importStorage(storage)

    safeSet('favoritos', { ids: ['q-1'] })
    expect(safeGet('favoritos', null)).toEqual({ ids: ['q-1'] })

    safeRemove('favoritos')
    expect(safeGet('favoritos', 'vacio')).toBe('vacio')
  })

  it('no lanza si el almacenamiento falla al escribir', async () => {
    const storage: MockStorage = {
      getItem: () => null,
      setItem: () => {
        throw new Error('cuota agotada')
      },
      removeItem: () => {
        throw new Error('cuota agotada')
      },
    }
    const { safeRemove, safeSet } = await importStorage(storage)
    expect(() => safeSet('k', 'v')).not.toThrow()
    expect(() => safeRemove('k')).not.toThrow()
  })
})
