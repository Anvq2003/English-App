import { describe, expect, it } from 'vitest'
import { applyResult, emptyProgress, MAX_BOX, pickWords } from './srs.ts'
import type { Progress, Word } from './types.ts'

const now = new Date('2026-10-19T08:00:00Z')
const day = 24 * 60 * 60 * 1000

describe('applyResult', () => {
  it('correct: box and streak go up, nextDue follows the interval', () => {
    const p = applyResult(undefined, true, now)
    expect(p).toMatchObject({ seen: 1, wrong: 0, streak: 1, box: 1 })
    expect(p.lastSeen).toBe(now.toISOString())
    expect(p.nextDue).toBe(new Date(now.getTime() + 1 * day).toISOString())
  })

  it('wrong: resets box and streak, counts wrong', () => {
    const prev: Progress = { ...emptyProgress(), seen: 4, streak: 3, box: 3 }
    expect(applyResult(prev, false, now)).toMatchObject({ seen: 5, wrong: 1, streak: 0, box: 0 })
  })

  it('caps box at the max', () => {
    const prev: Progress = { ...emptyProgress(), box: MAX_BOX }
    expect(applyResult(prev, true, now).box).toBe(MAX_BOX)
  })
})

const word = (name: string, progress?: Partial<Progress>): Word => ({
  word: name,
  meaning: name,
  ...(progress && { progress: { ...emptyProgress(), seen: 1, ...progress } }),
})
const due = new Date(now.getTime() - day).toISOString()
const later = new Date(now.getTime() + day).toISOString()

describe('pickWords', () => {
  it('orders due words by wrong rate, then new words, then upcoming by low box', () => {
    const words = [
      word('upHigh', { box: 4, nextDue: later }),
      word('upLow', { box: 1, nextDue: later }),
      word('fresh'),
      word('dueOk', { wrong: 0, nextDue: due }),
      word('dueBad', { wrong: 1, nextDue: due }),
    ]
    const names = pickWords(words, 10, { now }).map((w) => w.word)
    expect(names).toEqual(['dueBad', 'dueOk', 'fresh', 'upLow', 'upHigh'])
  })

  it('caps new words and the session size', () => {
    const words = Array.from({ length: 30 }, (_, i) => word(`w${i}`))
    expect(pickWords(words, 20, { now, maxNew: 10 })).toHaveLength(10)
    expect(pickWords(words, 5, { now })).toHaveLength(5)
  })

  it('does not use upcoming words when enough are due', () => {
    const words = [word('a', { nextDue: due }), word('b', { nextDue: later })]
    expect(pickWords(words, 1, { now }).map((w) => w.word)).toEqual(['a'])
  })
})
