import { beforeEach, describe, expect, it } from 'vitest'
import type { Quote, QuoteEn } from '@/types'
import {
  applyQuoteCorpus,
  getQuoteById,
  getQuoteOfTheDay,
  getQuoteSource,
  getQuoteText,
  getQuotesByPhilosopher,
  searchQuotes,
} from '@/data/quotes'

const CORPUS: Quote[] = [
  {
    id: 'q-socrates-1',
    text: 'Sólo sé que no sé nada',
    philosopherId: 'socrates',
    tags: ['conocimiento'],
  },
  {
    id: 'q-nietzsche-1',
    text: 'Sin música la vida sería un error',
    philosopherId: 'nietzsche',
    tags: ['vida'],
  },
  {
    id: 'q-seneca-1',
    text: 'No es que tengamos poco tiempo',
    philosopherId: 'seneca',
    tags: ['tiempo'],
    source: 'Cartas a Lucilio',
  },
]

const TRANSLATIONS: Record<string, QuoteEn> = {
  'q-socrates-1': {
    id: 'q-socrates-1',
    text: 'I only know that I know nothing',
  },
  'q-nietzsche-1': {
    id: 'q-nietzsche-1',
    text: 'Without music life would be a mistake',
    source: 'Twilight of the Idols',
  },
}

beforeEach(() => {
  applyQuoteCorpus(CORPUS, TRANSLATIONS)
})

describe('searchQuotes', () => {
  it('devuelve [] con consultas vacías o sólo espacios', () => {
    expect(searchQuotes('')).toEqual([])
    expect(searchQuotes('   ')).toEqual([])
  })

  it('ignora mayúsculas y acentos', () => {
    const ids = searchQuotes('MUSICA').map((q) => q.id)
    expect(ids).toContain('q-nietzsche-1')
  })

  it('encuentra por texto en español', () => {
    expect(searchQuotes('solo se').map((q) => q.id)).toEqual(['q-socrates-1'])
  })

  it('indexa el texto en inglés cuando hay traducción', () => {
    expect(searchQuotes('nothing').map((q) => q.id)).toEqual(['q-socrates-1'])
  })

  it('busca en la obra/origen', () => {
    expect(searchQuotes('Lucilio').map((q) => q.id)).toEqual(['q-seneca-1'])
  })

  it('busca por nombre de autor', () => {
    expect(searchQuotes('Seneca').map((q) => q.id)).toContain('q-seneca-1')
  })
})

describe('índices del corpus', () => {
  it('getQuoteById resuelve por id', () => {
    expect(getQuoteById('q-nietzsche-1')?.text).toContain('música')
    expect(getQuoteById('q-inexistente')).toBeUndefined()
  })

  it('resuelve los alias de citas retiradas al registro canónico', () => {
    applyQuoteCorpus(
      [
        {
          id: 'q-spinoza-1',
          text: 'El deseo es la esencia misma del hombre',
          philosopherId: 'spinoza',
          tags: ['deseo'],
        },
      ],
      null,
    )
    expect(getQuoteById('q-spinoza-8')?.id).toBe('q-spinoza-1')
  })

  it('agrupa las citas por filósofo', () => {
    expect(getQuotesByPhilosopher('socrates').map((q) => q.id)).toEqual([
      'q-socrates-1',
    ])
    expect(getQuotesByPhilosopher('inexistente')).toEqual([])
  })
})

describe('getQuoteText / getQuoteSource', () => {
  it('usa la traducción en locale en y cae al español si falta', () => {
    const socrates = getQuoteById('q-socrates-1')
    const seneca = getQuoteById('q-seneca-1')
    expect(socrates).toBeDefined()
    expect(seneca).toBeDefined()
    if (!socrates || !seneca) return

    expect(getQuoteText(socrates, 'en')).toBe('I only know that I know nothing')
    expect(getQuoteText(socrates, 'es')).toBe('Sólo sé que no sé nada')
    // Sin traducción EN: cae al texto/origen en español.
    expect(getQuoteText(seneca, 'en')).toBe('No es que tengamos poco tiempo')
    expect(getQuoteSource(socrates, 'en')).toBeUndefined()
    expect(getQuoteSource(seneca, 'es')).toBe('Cartas a Lucilio')
  })
})

describe('getQuoteOfTheDay', () => {
  it('es determinista para la misma fecha', () => {
    const date = new Date(2026, 0, 15)
    const first = getQuoteOfTheDay(date)
    const second = getQuoteOfTheDay(date)
    expect(second.id).toBe(first.id)
    expect(CORPUS.map((q) => q.id)).toContain(first.id)
  })

  it('no depende de la hora del día', () => {
    const morning = new Date(2026, 5, 10, 8, 0, 0)
    const night = new Date(2026, 5, 10, 23, 59, 59)
    expect(getQuoteOfTheDay(night).id).toBe(getQuoteOfTheDay(morning).id)
  })

  it('lanza si el corpus está vacío', () => {
    applyQuoteCorpus([], null)
    expect(() => getQuoteOfTheDay(new Date(2026, 0, 1))).toThrow()
  })
})
