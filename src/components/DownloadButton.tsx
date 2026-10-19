import { exportDeck } from '../core/deckIO.ts'
import { useDeck } from '../store/deckContext.ts'

export function DownloadButton() {
  const { deck } = useDeck()

  const download = () => {
    if (!deck) return
    const url = URL.createObjectURL(new Blob([exportDeck(deck)], { type: 'application/json' }))
    const a = document.createElement('a')
    a.href = url
    a.download = `${deck.name || 'english-app'}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <button type="button" className="btn" disabled={!deck} onClick={download}>
      ⬇ Download JSON
    </button>
  )
}
