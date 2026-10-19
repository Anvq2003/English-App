import { useRef, useState, type ReactNode } from 'react'
import { importDeck, parseDeck, resetProgress as clearProgress, type ImportMode } from '../core/deckIO.ts'
import { wordId } from '../core/normalize.ts'
import { applyResult, pickWords as pick } from '../core/srs.ts'
import { loadDeck, saveDeck } from '../core/storage.ts'
import type { Deck, ReportInput } from '../core/types.ts'
import { DeckContext, type DeckApi } from './deckContext.ts'

export function DeckProvider({ children }: { children: ReactNode }) {
  const [deck, setDeck] = useState<Deck | null>(loadDeck)
  const [storageOk, setStorageOk] = useState(() => saveDeck(deck))
  // Latest deck, so two quick reports in a row never overwrite each other.
  const latest = useRef(deck)

  const commit = (next: Deck | null) => {
    latest.current = next
    setDeck(next)
    setStorageOk(saveDeck(next))
  }

  const api: DeckApi = {
    deck,
    storageOk,
    importText(text: string, mode: ImportMode) {
      const parsed = parseDeck(text)
      if (!parsed.ok) return parsed.errors
      commit(importDeck(latest.current, parsed.deck, mode))
      return []
    },
    resetProgress() {
      if (latest.current) commit(clearProgress(latest.current))
    },
    pickWords: (n) => pick(latest.current?.words ?? [], n),
    report({ wordId: id, correct }: ReportInput) {
      const current = latest.current
      if (!current) return
      const now = new Date()
      commit({
        ...current,
        words: current.words.map((w) =>
          wordId(w) === id ? { ...w, progress: applyResult(w.progress, correct, now) } : w,
        ),
      })
    },
  }

  return <DeckContext value={api}>{children}</DeckContext>
}
