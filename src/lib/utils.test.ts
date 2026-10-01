import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  buildQuoteShareUrl,
  cn,
  formatYear,
  hashCode,
  initials,
  normalize,
  pickRandom,
  shuffle,
} from '@/lib/utils'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('initials', () => {
  it('usa la primera y la última parte y omite partículas', () => {
    expect(initials('Simone de Beauvoir')).toBe('SB')
  })

  it('ignora el contenido entre paréntesis', () => {
    expect(initials('Lao-Tsé (Laozi)')).toBe('LT')
  })

  it('con una sola palabra devuelve su inicial', () => {
    expect(initials('Platón')).toBe('P')
  })

  it('devuelve "?" cuando no hay partes utilizables', () => {
    expect(initials('')).toBe('?')
    expect(initials('de la')).toBe('?')
  })
})

describe('normalize', () => {
  it('quita acentos y pasa a minúsculas', () => {
    expect(normalize('Árbol Ñandú')).toBe('arbol nandu')
  })

  it('es idempotente sobre texto ya normalizado', () => {
    expect(normalize(normalize('Música'))).toBe('musica')
  })
})

describe('hashCode', () => {
  it('es determinista y sin signo para la misma cadena', () => {
    expect(hashCode('abc')).toBe(96354)
    expect(hashCode('abc')).toBe(hashCode('abc'))
    expect(hashCode('')).toBe(0)
  })

  it('produce valores distintos para cadenas distintas', () => {
    expect(hashCode('2024-1-1')).not.toBe(hashCode('2024-1-2'))
  })
})

describe('shuffle', () => {
  it('no muta el array original y conserva todos los elementos', () => {
    const original = [1, 2, 3, 4, 5]
    const result = shuffle(original)

    expect(original).toEqual([1, 2, 3, 4, 5])
    expect(result).not.toBe(original)
    expect([...result].sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5])
  })

  it('aplica Fisher–Yates de forma determinista con Math.random fijo', () => {
    const spy = vi.spyOn(Math, 'random').mockReturnValue(0)
    expect(shuffle([1, 2, 3])).toEqual([2, 3, 1])
    spy.mockRestore()
  })

  it('con un array vacío devuelve un array vacío', () => {
    expect(shuffle([])).toEqual([])
  })
})

describe('pickRandom', () => {
  it('lanza si el array está vacío', () => {
    expect(() => pickRandom([])).toThrow()
  })

  it('elige el índice marcado por Math.random', () => {
    const spy = vi.spyOn(Math, 'random').mockReturnValue(0.5)
    expect(pickRandom(['a', 'b', 'c', 'd'])).toBe('c')
    spy.mockRestore()
  })
})

describe('formatYear', () => {
  it('formatea años negativos como a. C. / BC', () => {
    expect(formatYear(-470)).toBe('470 a. C.')
    expect(formatYear(-470, 'en')).toBe('470 BC')
  })

  it('deja los años positivos tal cual y null como raya', () => {
    expect(formatYear(1844)).toBe('1844')
    expect(formatYear(null)).toBe('—')
  })
})

describe('cn', () => {
  it('combina clases condicionales y resuelve conflictos de Tailwind', () => {
    const isHidden = false
    expect(cn('p-2', isHidden && 'hidden', 'p-4')).toBe('p-4')
  })
})

describe('buildQuoteShareUrl', () => {
  it('devuelve cadena vacía sin window (SSR)', () => {
    expect(buildQuoteShareUrl('q-1')).toBe('')
  })

  it('construye un deep link con ?cita= y sin hash ni query previos', () => {
    vi.stubGlobal('window', {
      location: { href: 'https://filosofuss.app/explorar?filtro=1#seccion' },
    })
    expect(buildQuoteShareUrl('q-nietzsche-1')).toBe(
      'https://filosofuss.app/explorar?cita=q-nietzsche-1',
    )
  })
})
