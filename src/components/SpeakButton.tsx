import { speak } from '../core/speech.ts'

export function SpeakButton({ text }: { text: string }) {
  return (
    <button type="button" className="btn" aria-label={`Phát âm "${text}"`} onClick={() => speak(text)}>
      🔊 Nghe
    </button>
  )
}
