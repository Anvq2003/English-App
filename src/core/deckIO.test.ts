import { describe, expect, it } from 'vitest'
import { exportDeck, importDeck, parseDeck, resetProgress } from './deckIO.ts'
import { emptyProgress } from './srs.ts'
import type { Deck } from './types.ts'

const parseOk = (obj: unknown): Deck => {
  const r = parseDeck(JSON.stringify(obj))
  if (!r.ok) throw new Error(r.errors.join('; '))
  return r.deck
}
const errorsOf = (obj: unknown) => {
  const r = parseDeck(typeof obj === 'string' ? obj : JSON.stringify(obj))
  return r.ok ? [] : r.errors
}

describe('parseDeck', () => {
  it('accepts a minimal deck without progress, examples without vi', () => {
    const deck = parseOk({ words: [{ word: 'abandon', meaning: 'từ bỏ', examples: [{ en: 'He left.' }] }] })
    expect(deck.version).toBe(1)
    expect(deck.words[0].progress).toBeUndefined()
  })

  it('keeps unknown fields on deck and words', () => {
    const deck = parseOk({ extra: 1, words: [{ word: 'a', meaning: 'b', level: 'C1' }] })
    expect(deck.extra).toBe(1)
    expect(deck.words[0].level).toBe('C1')
    expect(JSON.parse(exportDeck(deck)).words[0].level).toBe('C1')
  })

  it('reports invalid JSON', () => {
    expect(errorsOf('{oops')[0]).toMatch(/JSON/)
  })

  it('reports missing word/meaning, too many examples and duplicates', () => {
    const ex = { en: 'x' }
    const errors = errorsOf({
      words: [
        { meaning: 'x' },
        { word: 'b' },
        { word: 'c', meaning: 'x', examples: [ex, ex, ex, ex] },
        { word: 'D', meaning: 'x' },
        { word: ' d ', meaning: 'y' },
      ],
    })
    expect(errors).toHaveLength(4)
  })

  it('rejects a newer version', () => {
    expect(errorsOf({ version: 2, words: [] })).toHaveLength(1)
  })
})

describe('importDeck', () => {
  const old = parseOk({
    name: 'old',
    words: [
      { word: 'a', meaning: 'old a', progress: { ...emptyProgress(), seen: 3, lastSeen: '2026-10-10T00:00:00Z' } },
      { word: 'keep', meaning: 'only in old' },
    ],
  })
  const incoming = parseOk({
    name: 'new',
    words: [
      { word: 'A', meaning: 'new a', progress: { ...emptyProgress(), seen: 1, lastSeen: '2026-10-01T00:00:00Z' } },
      { word: 'b', meaning: 'new b' },
    ],
  })

  it('replace returns the incoming deck', () => {
    expect(importDeck(old, incoming, 'replace')).toBe(incoming)
  })

  it('merge takes content from incoming and the progress with newer lastSeen', () => {
    const merged = importDeck(old, incoming, 'merge')
    expect(merged.words.map((w) => w.meaning)).toEqual(['new a', 'only in old', 'new b'])
    expect(merged.words[0].progress?.seen).toBe(3)
    expect(merged.name).toBe('new')
  })
})

describe('resetProgress', () => {
  it('removes progress and keeps content', () => {
    const deck = parseOk({ words: [{ word: 'a', meaning: 'b', progress: emptyProgress() }] })
    expect(resetProgress(deck).words[0]).toEqual({ word: 'a', meaning: 'b' })
  })
})
