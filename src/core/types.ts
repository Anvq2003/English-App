export interface Example {
  en: string
  vi?: string
}

export interface Progress {
  seen: number
  wrong: number
  streak: number
  box: number
  lastSeen: string | null
  nextDue: string | null
}

// Unknown fields are kept as-is so the schema can grow without losing data.
export interface Word {
  word: string
  meaning: string
  phonetic?: string
  pos?: string
  examples?: Example[]
  altAnswers?: string[]
  tags?: string[]
  progress?: Progress
  [key: string]: unknown
}

export interface Deck {
  version: number
  name?: string
  words: Word[]
  [key: string]: unknown
}

export interface ReportInput {
  wordId: string
  correct: boolean
  timeMs: number
}
