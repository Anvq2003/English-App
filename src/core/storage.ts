import type { Deck } from './types.ts'

const KEY = 'english-app:deck'

export function loadDeck(): Deck | null {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as Deck) : null
  } catch {
    return null
  }
}

// Returns false when localStorage is unavailable or full, so the UI can warn the user.
export function saveDeck(deck: Deck | null): boolean {
  try {
    if (deck) localStorage.setItem(KEY, JSON.stringify(deck))
    else localStorage.removeItem(KEY)
    return true
  } catch {
    return false
  }
}
