import { useEffect, useState } from 'react'
import { DownloadButton } from '../../components/DownloadButton.tsx'
import { SpeakButton } from '../../components/SpeakButton.tsx'
import { wordId } from '../../core/normalize.ts'
import type { Word } from '../../core/types.ts'
import { useDeck } from '../../store/deckContext.ts'
import type { GameProps } from '../types.ts'
import './style.css'

type Direction = 'en-vi' | 'vi-en'

const DIRECTIONS: { value: Direction; label: string }[] = [
  { value: 'en-vi', label: 'Anh → Việt (thấy từ, đoán nghĩa)' },
  { value: 'vi-en', label: 'Việt → Anh (thấy nghĩa, đoán từ)' },
]

export function Flashcard({ onExit }: GameProps) {
  const [direction, setDirection] = useState<Direction>('en-vi')
  const [started, setStarted] = useState(false)
  // Remount the session on "play again" so it picks a fresh set of words.
  const [round, setRound] = useState(0)

  if (!started) {
    return (
      <section className="flashcard">
        <h2>Flashcard</h2>
        <div className="flashcard__setup">
          {DIRECTIONS.map((d) => (
            <label key={d.value} className="flashcard__option">
              <input
                type="radio"
                name="direction"
                checked={direction === d.value}
                onChange={() => setDirection(d.value)}
              />
              {d.label}
            </label>
          ))}
        </div>
        <div className="flashcard__actions">
          <button type="button" className="btn is-primary" onClick={() => setStarted(true)}>
            Bắt đầu
          </button>
          <button type="button" className="btn" onClick={onExit}>
            Về trang chủ
          </button>
        </div>
      </section>
    )
  }

  return (
    <Session
      key={round}
      direction={direction}
      onExit={onExit}
      onAgain={() => setRound((r) => r + 1)}
    />
  )
}

interface SessionProps {
  direction: Direction
  onExit: () => void
  onAgain: () => void
}

function Session({ direction, onExit, onAgain }: SessionProps) {
  const { deck, pickWords, report } = useDeck()
  const [queue] = useState<Word[]>(() => pickWords())
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [startedAt, setStartedAt] = useState(() => Date.now())
  const [wrongIds, setWrongIds] = useState<string[]>([])

  const card = queue[index] as Word | undefined

  const answer = (correct: boolean) => {
    if (!card || !flipped) return
    const id = wordId(card)
    report({ wordId: id, correct, timeMs: Date.now() - startedAt })
    if (!correct) setWrongIds((ids) => [...ids, id])
    setIndex((i) => i + 1)
    setFlipped(false)
    setStartedAt(Date.now())
  }

  useEffect(() => {
    if (!card) return
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (e.key === ' ') {
        e.preventDefault()
        setFlipped((f) => !f)
      } else if (e.key === '1' || e.key === 'ArrowLeft') answer(false)
      else if (e.key === '2' || e.key === 'ArrowRight') answer(true)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  if (queue.length === 0) {
    return (
      <section className="flashcard">
        <h2>Flashcard</h2>
        <p className="notice">Chưa có từ nào để học. Hãy import bộ từ vựng ở trang Quản lý.</p>
        <button type="button" className="btn" onClick={onExit}>
          Về trang chủ
        </button>
      </section>
    )
  }

  if (!card) {
    const wrongWords = wrongIds
      .map((id) => deck?.words.find((w) => wordId(w) === id))
      .filter((w): w is Word => !!w)
      .sort((a, b) => (b.progress?.wrong ?? 0) - (a.progress?.wrong ?? 0))
      .slice(0, 5)
    return (
      <section className="flashcard">
        <h2>Tổng kết</h2>
        <p>
          {queue.length} từ · <strong className="flashcard__good">{queue.length - wrongIds.length} đúng</strong> ·{' '}
          <strong className="flashcard__bad">{wrongIds.length} sai</strong>
        </p>
        {wrongWords.length > 0 && (
          <div className="flashcard__wrong-list">
            <h3>Từ sai nhiều nhất</h3>
            <ul>
              {wrongWords.map((w) => (
                <li key={w.word}>
                  <strong>{w.word}</strong> — {w.meaning} (sai {w.progress?.wrong ?? 0} lần)
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="flashcard__actions">
          <button type="button" className="btn is-primary" onClick={onAgain}>
            Chơi tiếp
          </button>
          <DownloadButton />
          <button type="button" className="btn" onClick={onExit}>
            Về trang chủ
          </button>
        </div>
      </section>
    )
  }

  const wordBlock = (
    <>
      <div className="flashcard__word">{card.word}</div>
      <SpeakButton text={card.word} />
    </>
  )
  const meaningBlock = <div className="flashcard__meaning">{card.meaning}</div>
  const enToVi = direction === 'en-vi'

  return (
    <section className="flashcard">
      <div className="flashcard__progress">
        {index + 1} / {queue.length}
      </div>
      <div className="flashcard__card">
        <div className="flashcard__side">{enToVi ? wordBlock : meaningBlock}</div>
        {flipped && (
          <div className="flashcard__side flashcard__back">
            {enToVi ? meaningBlock : wordBlock}
            {card.phonetic && <div className="flashcard__phonetic">{card.phonetic}</div>}
            {card.pos && <div className="flashcard__pos">{card.pos}</div>}
            {card.examples && (
              <ul className="flashcard__examples">
                {card.examples.map((ex) => (
                  <li key={ex.en}>
                    <div>{ex.en}</div>
                    {ex.vi && <div className="flashcard__example-vi">{ex.vi}</div>}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
      <div className="flashcard__actions">
        {!flipped && (
          <button type="button" className="btn is-primary" onClick={() => setFlipped(true)}>
            Lật thẻ (Space)
          </button>
        )}
        <button type="button" className="btn is-bad" disabled={!flipped} onClick={() => answer(false)}>
          Chưa biết (1)
        </button>
        <button type="button" className="btn is-good" disabled={!flipped} onClick={() => answer(true)}>
          Biết (2)
        </button>
      </div>
    </section>
  )
}
