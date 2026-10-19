import { createContext, useContext } from 'react'
import type { ImportMode } from '../core/deckIO.ts'
import type { Deck, ReportInput, Word } from '../core/types.ts'

export interface DeckApi {
  deck: Deck | null
  // false when localStorage is unavailable: the app keeps working but data is lost on reload.
  storageOk: boolean
  // Returns validation errors; an empty array means the import succeeded.
  importText: (text: string, mode: ImportMode) => string[]
  resetProgress: () => void
  pickWords: (n?: number) => Word[]
  report: (input: ReportInput) => void
}

export const DeckContext = createContext<DeckApi | null>(null)

export function useDeck(): DeckApi {
  const api = useContext(DeckContext)
  if (!api) throw new Error('useDeck must be used inside <DeckProvider>')
  return api
}
