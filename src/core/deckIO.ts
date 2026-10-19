import { wordId } from './normalize.ts'
import type { Deck, Word } from './types.ts'

export const DECK_VERSION = 1
export const MAX_EXAMPLES = 3

export type ParseResult = { ok: true; deck: Deck } | { ok: false; errors: string[] }
export type ImportMode = 'replace' | 'merge'

const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v)
const isText = (v: unknown): v is string => typeof v === 'string' && v.trim() !== ''
const isTextArray = (v: unknown) => Array.isArray(v) && v.every((x) => typeof x === 'string')

function validateWord(w: unknown, label: string): string[] {
  if (!isObject(w)) return [`${label}: không phải object`]
  const errors: string[] = []
  const name = isText(w.word) ? `"${w.word}"` : label
  if (!isText(w.word)) errors.push(`${label}: thiếu "word"`)
  if (!isText(w.meaning)) errors.push(`${name}: thiếu "meaning"`)
  for (const key of ['phonetic', 'pos'])
    if (w[key] !== undefined && typeof w[key] !== 'string') errors.push(`${name}: "${key}" phải là chuỗi`)
  for (const key of ['altAnswers', 'tags'])
    if (w[key] !== undefined && !isTextArray(w[key])) errors.push(`${name}: "${key}" phải là mảng chuỗi`)
  if (w.examples !== undefined) {
    if (!Array.isArray(w.examples)) errors.push(`${name}: "examples" phải là mảng`)
    else {
      if (w.examples.length > MAX_EXAMPLES) errors.push(`${name}: "examples" tối đa ${MAX_EXAMPLES} câu`)
      for (const ex of w.examples) {
        if (!isObject(ex) || !isText(ex.en)) errors.push(`${name}: mỗi ví dụ cần "en"`)
        else if (ex.vi !== undefined && typeof ex.vi !== 'string') errors.push(`${name}: "vi" phải là chuỗi`)
      }
    }
  }
  if (w.progress !== undefined) {
    const p = w.progress
    const numbers = isObject(p) && ['seen', 'wrong', 'streak', 'box'].every((k) => typeof p[k] === 'number')
    const dates = isObject(p) && ['lastSeen', 'nextDue'].every((k) => p[k] == null || typeof p[k] === 'string')
    if (!numbers || !dates) errors.push(`${name}: "progress" không hợp lệ`)
  }
  return errors
}

// Validates everything first; never returns a partially imported deck.
export function parseDeck(text: string): ParseResult {
  let data: unknown
  try {
    data = JSON.parse(text)
  } catch (e) {
    return { ok: false, errors: [`JSON sai cú pháp: ${(e as Error).message}`] }
  }
  if (!isObject(data)) return { ok: false, errors: ['File phải là một object JSON'] }
  if (!Array.isArray(data.words)) return { ok: false, errors: ['Thiếu mảng "words"'] }

  const errors: string[] = []
  const version = data.version ?? DECK_VERSION
  if (typeof version !== 'number') errors.push('"version" phải là số')
  else if (version > DECK_VERSION) errors.push(`File version ${version} mới hơn app hỗ trợ (${DECK_VERSION})`)
  if (data.name !== undefined && typeof data.name !== 'string') errors.push('"name" phải là chuỗi')

  const seen = new Set<string>()
  data.words.forEach((w, i) => {
    const wordErrors = validateWord(w, `Từ #${i + 1}`)
    errors.push(...wordErrors)
    if (wordErrors.length) return
    const id = wordId(w as Word)
    if (seen.has(id)) errors.push(`Từ trùng: "${(w as Word).word}"`)
    seen.add(id)
  })
  if (errors.length) return { ok: false, errors }
  return { ok: true, deck: { ...data, version: DECK_VERSION, words: data.words } as Deck }
}

const time = (iso: string | null | undefined) => (iso ? Date.parse(iso) : -Infinity)

// Merge: content comes from the incoming file, progress keeps whichever was seen more recently.
export function importDeck(current: Deck | null, incoming: Deck, mode: ImportMode): Deck {
  if (mode === 'replace' || !current) return incoming
  const byId = new Map(current.words.map((w) => [wordId(w), w]))
  for (const w of incoming.words) {
    const old = byId.get(wordId(w))
    const keepOld = old?.progress && time(old.progress.lastSeen) > time(w.progress?.lastSeen)
    byId.set(wordId(w), keepOld ? { ...w, progress: old.progress } : w)
  }
  return { ...current, ...incoming, words: [...byId.values()] }
}

export const exportDeck = (deck: Deck): string => JSON.stringify(deck, null, 2)

export function resetProgress(deck: Deck): Deck {
  return {
    ...deck,
    words: deck.words.map((w) => {
      const copy = { ...w }
      delete copy.progress
      return copy
    }),
  }
}
