import { describe, expect, it } from 'vitest'
import { isCorrectAnswer, normalize, wordId } from './normalize.ts'

describe('normalize', () => {
  it('lowercases, trims and collapses spaces', () => {
    expect(normalize('  Ice   CREAM ')).toBe('ice cream')
  })

  it('strips diacritics including đ', () => {
    expect(normalize('Café')).toBe('cafe')
    expect(normalize('Đường')).toBe('duong')
  })

  it('builds the same id for equivalent words', () => {
    expect(wordId({ word: ' Abandon ' })).toBe(wordId({ word: 'abandon' }))
  })
})

describe('isCorrectAnswer', () => {
  const w = { word: 'abandon', meaning: 'từ bỏ', altAnswers: ['Abandoned', 'abandons'] }

  it('matches the word case-insensitively', () => {
    expect(isCorrectAnswer(' ABANDON ', w)).toBe(true)
  })

  it('matches altAnswers', () => {
    expect(isCorrectAnswer('abandoned', w)).toBe(true)
  })

  it('rejects other input', () => {
    expect(isCorrectAnswer('abandonn', w)).toBe(false)
  })
})
