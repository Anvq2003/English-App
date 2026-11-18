import { useState } from 'react'
import { exportDeck } from '../core/deckIO.ts'
import { useDeck } from '../store/deckContext.ts'
import { Icon } from './Icon/Icon.tsx'

export function DownloadButton() {
  const { deck } = useDeck()
  const [error, setError] = useState(false)
  const download = () => {
    if (!deck) return
    try {
      const url = URL.createObjectURL(new Blob([exportDeck(deck)], { type: 'application/json' }))
      const a = document.createElement('a')
      a.href = url
      a.download = `${deck.name || 'mam-english'}.json`
      document.body.appendChild(a)
      a.click()
      a.remove()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
      setError(false)
    } catch {
      setError(true)
    }
  }
  return <><button type="button" className="btn" disabled={!deck} onClick={download}><Icon name="download" size={16} />Tải JSON sao lưu</button>{error && <span role="alert">Chưa tải được file. Vui lòng thử lại.</span>}</>
}
