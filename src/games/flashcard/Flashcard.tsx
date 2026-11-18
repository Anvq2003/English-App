import { useEffect, useEffectEvent, useRef, useState } from 'react'
import { DownloadButton } from '../../components/DownloadButton.tsx'
import { Icon } from '../../components/Icon/Icon.tsx'
import { SpeakButton } from '../../components/SpeakButton.tsx'
import { wordId } from '../../core/normalize.ts'
import type { Word } from '../../core/types.ts'
import { useDeck } from '../../store/deckContext.ts'
import type { GameProps } from '../types.ts'
import './style.css'

type Direction = 'en-vi' | 'vi-en'
const DIRECTIONS: { value: Direction; title: string; description: string; from: string; to: string }[] = [
  { value: 'en-vi', title: 'Anh → Việt', description: 'Nhìn từ tiếng Anh, nhớ nghĩa tiếng Việt.', from: 'Hello', to: 'Xin chào' },
  { value: 'vi-en', title: 'Việt → Anh', description: 'Nhìn nghĩa tiếng Việt, nhớ từ tiếng Anh.', from: 'Xin chào', to: 'Hello' },
]

export function Flashcard({ onExit }: GameProps) {
  const { pickWords } = useDeck()
  const [direction, setDirection] = useState<Direction>('en-vi')
  const [started, setStarted] = useState(false)
  const [round, setRound] = useState(0)
  const size = pickWords().length
  if (started) return <Session key={round} direction={direction} onExit={onExit} onAgain={() => setRound(value => value + 1)} />
  return (
    <section className="flashcard">
      <button className="flashcard__exit" onClick={onExit}><Icon name="back" size={16} />Về tổng quan</button>
      <div className="flashcard__intro"><span className="flashcard__intro-icon"><Icon name="cards" size={30} /></span><span className="eyebrow">MỘT CHÚT TẬP TRUNG, THÊM MỘT TỪ NHỚ</span><h1>Học bằng Flashcard</h1><p>Nhìn từ, thử nhớ, rồi lật thẻ. Bạn quyết định mình đã nhớ đến đâu.</p></div>
      {size ? <div className="flashcard__setup-panel"><h2>Hôm nay, bạn muốn học theo chiều nào?</h2><fieldset className="flashcard__setup"><legend className="flashcard__sr-only">Chiều học Flashcard</legend>{DIRECTIONS.map(item => <label key={item.value} className={`flashcard__option ${direction === item.value ? 'is-selected' : ''}`}><input type="radio" name="direction" checked={direction === item.value} onChange={() => setDirection(item.value)} /><span className="flashcard__option-preview"><span>{item.from}</span><Icon name="arrow" size={18} /><span>{item.to}</span></span><strong>{item.title}</strong><span className="flashcard__option-description">{item.description}</span></label>)}</fieldset><div className="flashcard__session-info"><span><Icon name="book" size={15} />{size} từ trong phiên này</span><span><Icon name="refresh" size={15} />Ưu tiên từ cần ôn</span></div><button className="btn is-primary flashcard__start" onClick={() => setStarted(true)}>Bắt đầu phiên học<Icon name="arrow" size={17} /></button><div className="flashcard__keyboard"><Icon name="keyboard" size={16} /><span><kbd>Space</kbd> lật thẻ</span><span><kbd>1</kbd> chưa biết</span><span><kbd>2</kbd> đã biết</span></div></div> : <div className="flashcard__empty"><Icon name="book" size={35} /><h2>Thêm vài từ để bắt đầu nhé.</h2><p>Nhập bộ từ JSON trong Thư viện hoặc thử bộ từ mẫu ở trang Tổng quan.</p><button className="btn is-primary" onClick={onExit}>Về tổng quan<Icon name="arrow" size={16} /></button></div>}
      <p className="flashcard__footnote"><Icon name="shield" size={14} />Tiến độ được lưu sau mỗi câu trả lời. Cứ học theo nhịp của bạn.</p>
    </section>
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
  const startedAt = useRef(0)
  const lastAnswered = useRef('')
  const [wrongIds, setWrongIds] = useState<string[]>([])
  const summaryRef = useRef<HTMLHeadingElement>(null)
  const card = queue[index] as Word | undefined
  const enToVi = direction === 'en-vi'

  const answer = (correct: boolean) => {
    if (!card || !flipped) return
    const id = wordId(card)
    if (lastAnswered.current === id) return
    lastAnswered.current = id
    report({ wordId: id, correct, timeMs: Date.now() - startedAt.current })
    if (!correct) setWrongIds(ids => [...ids, id])
    setIndex(value => value + 1)
    setFlipped(false)
    startedAt.current = Date.now()
  }
  const onKey = useEffectEvent((event: KeyboardEvent) => {
    if (!card || event.repeat || event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return
    const target = event.target
    if (target instanceof HTMLElement && (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))) return
    if (event.key === ' ') {
      if (target instanceof HTMLElement && (target.closest('button') || target.closest('a'))) return
      event.preventDefault()
      setFlipped(value => !value)
    } else if (event.key === '1' || event.key === 'ArrowLeft') {
      event.preventDefault()
      answer(false)
    } else if (event.key === '2' || event.key === 'ArrowRight') {
      event.preventDefault()
      answer(true)
    }
  })
  useEffect(() => {
    startedAt.current = Date.now()
    const handleKey = (event: KeyboardEvent) => onKey(event)
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])
  useEffect(() => { if (!card) summaryRef.current?.focus() }, [card])

  if (!card) {
    const wrongWords = wrongIds.map(id => deck?.words.find(w => wordId(w) === id)).filter((w): w is Word => !!w).sort((a, b) => (b.progress?.wrong ?? 0) - (a.progress?.wrong ?? 0)).slice(0, 5)
    return <section className="flashcard"><div className="flashcard__summary"><span className="flashcard__summary-icon"><Icon name="check" size={38} /></span><span className="eyebrow">MỖI PHIÊN HỌC LÀ MỘT BƯỚC TIẾN</span><h1 ref={summaryRef} tabIndex={-1}>{queue.length ? 'Thêm một chút tiến bộ rồi!' : 'Chưa có từ để học.'}</h1><p>{queue.length ? 'Bạn vừa dành thời gian cho chính mình. Những từ mới sẽ dần trở nên quen thuộc.' : 'Hãy thêm bộ từ vựng để bắt đầu nhé.'}</p><div className="flashcard__summary-stats"><div><strong>{queue.length}</strong><span>Từ đã ôn</span></div><div><strong className="flashcard__good">{queue.length - wrongIds.length}</strong><span>Đã biết</span></div><div><strong className="flashcard__bad">{wrongIds.length}</strong><span>Cần ôn thêm</span></div></div>{wrongWords.length > 0 && <div className="flashcard__wrong-list"><h3>Hẹn gặp lại những từ này</h3><p>Các từ sai nhiều nhất sẽ được ưu tiên trong những lần ôn tiếp theo.</p><ul>{wrongWords.map(w => <li key={w.word}><strong>{w.word}</strong><span>{w.meaning}</span><small>Sai {w.progress?.wrong ?? 0} lần</small></li>)}</ul></div>}<div className="flashcard__actions"><button className="btn is-primary" disabled={!queue.length} onClick={onAgain}><Icon name="refresh" size={16} />Học thêm một phiên</button><DownloadButton /></div><button className="btn is-quiet" onClick={onExit}><Icon name="back" size={15} />Về tổng quan</button><p className="flashcard__footnote"><Icon name="shield" size={14} />Tiến độ đã được cập nhật. Tải JSON để giữ một bản sao.</p></div></section>
  }

  const wordBlock = <><div className="flashcard__word" lang="en">{card.word}</div><SpeakButton text={card.word} /></>
  const meaningBlock = <div className="flashcard__meaning">{card.meaning}</div>
  return (
    <section className="flashcard">
      <div className="flashcard__session-heading"><button className="flashcard__exit" onClick={onExit}><Icon name="back" size={16} />Kết thúc phiên</button><span className="badge"><Icon name="cards" size={13} />{enToVi ? 'Anh → Việt' : 'Việt → Anh'}</span></div>
      <div className="flashcard__progress"><span>Chậm một chút, nhớ lâu hơn.</span><strong role="status">Thẻ {index + 1}<span> / {queue.length}</span></strong></div><div className="flashcard__progress-track" role="progressbar" aria-label="Tiến trình phiên học" aria-valuenow={index} aria-valuemin={0} aria-valuemax={queue.length}><span style={{ width: `${index / queue.length * 100}%` }} /></div>
      <div key={index} className={`flashcard__card ${flipped ? 'is-flipped' : ''}`}><span className="flashcard__card-label">{enToVi ? 'TỪ NÀY CÓ NGHĨA LÀ GÌ?' : 'BẠN CÒN NHỚ TỪ TIẾNG ANH?'}</span><div className="flashcard__side">{enToVi ? wordBlock : meaningBlock}</div>{flipped ? <div className="flashcard__side flashcard__back" id="flashcard-answer" aria-live="polite">{enToVi ? meaningBlock : wordBlock}<div className="flashcard__metadata">{card.phonetic && <span>{card.phonetic}</span>}{card.pos && <span className="badge">{card.pos}</span>}</div>{card.examples && card.examples.length > 0 && <ul className="flashcard__examples">{card.examples.slice(0, 3).map(ex => <li key={ex.en}><div lang="en">{ex.en}</div>{ex.vi && <div className="flashcard__example-vi">{ex.vi}</div>}</li>)}</ul>}</div> : <div className="flashcard__card-hint"><Icon name="spark" size={16} /><span>Thử nhớ câu trả lời trước khi lật thẻ nhé.</span></div>}</div>
      <div className="flashcard__answer-actions"><button className="btn is-bad" disabled={!flipped} onClick={() => answer(false)}><Icon name="close" size={17} />Chưa biết<kbd>1 / ←</kbd></button><button className="btn flashcard__flip" aria-expanded={flipped} aria-controls={flipped ? 'flashcard-answer' : undefined} onClick={() => setFlipped(value => !value)}><Icon name="refresh" size={16} />{flipped ? 'Ẩn đáp án' : 'Lật thẻ'}<kbd>Space</kbd></button><button className="btn is-good" disabled={!flipped} onClick={() => answer(true)}><Icon name="check" size={18} />Đã biết<kbd>2 / →</kbd></button></div><p className="flashcard__footnote">{flipped ? 'Tự đánh giá thật lòng sẽ giúp Mầm chọn thời điểm ôn phù hợp hơn.' : 'Lật thẻ để xem đáp án, sau đó chọn “Chưa biết” hoặc “Đã biết”.'}</p>
    </section>
  )
}
