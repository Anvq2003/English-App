import type { Word } from './types.ts'

// lowercase, trim, collapse spaces, strip diacritics (NFD)
export function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/gi, 'd')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
}

export const wordId = (w: Pick<Word, 'word'>): string => normalize(w.word)

// Accepted answers for a word: the word itself + altAnswers, all normalized.
export function acceptedAnswers(w: Word): string[] {
  return [w.word, ...(w.altAnswers ?? [])].map(normalize)
}

export function isCorrectAnswer(input: string, w: Word): boolean {
  return acceptedAnswers(w).includes(normalize(input))
}
