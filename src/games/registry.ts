import { Flashcard } from './flashcard/Flashcard.tsx'
import type { GameDef } from './types.ts'

export const games: GameDef[] = [
  {
    id: 'flashcard',
    name: 'Flashcard',
    description: 'Lật thẻ, tự chấm Biết / Chưa biết.',
    component: Flashcard,
  },
]
