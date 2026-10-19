import { useState } from 'react'
import { isDue, isNew } from '../../core/srs.ts'
import { games } from '../../games/registry.ts'
import { useDeck } from '../../store/deckContext.ts'
import './style.css'

interface HomeProps {
  onPlay: (gameId: string) => void
  onManage: () => void
}

export function Home({ onPlay, onManage }: HomeProps) {
  const { deck } = useDeck()
  const [now] = useState(() => Date.now())

  if (!deck || deck.words.length === 0) {
    return (
      <section className="home">
        <h1>Học từ vựng tiếng Anh</h1>
        <p>Chưa có bộ từ vựng. Import 1 file JSON để bắt đầu.</p>
        <button type="button" className="btn is-primary" onClick={onManage}>
          Import từ vựng
        </button>
      </section>
    )
  }

  const fresh = deck.words.filter(isNew).length
  const due = deck.words.filter((w) => isDue(w, now)).length

  return (
    <section className="home">
      <h1>{deck.name || 'Bộ từ vựng'}</h1>
      <p className="home__stats">
        {deck.words.length} từ · {fresh} từ mới · {due} từ đến hạn ôn
      </p>
      <div className="home__games">
        {games.map((g) => (
          <button key={g.id} type="button" className="home__game" onClick={() => onPlay(g.id)}>
            <strong>{g.name}</strong>
            <span>{g.description}</span>
          </button>
        ))}
      </div>
    </section>
  )
}
