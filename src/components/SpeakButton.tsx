import { speak } from '../core/speech.ts'
import { Icon } from './Icon/Icon.tsx'

export function SpeakButton({ text }: { text: string }) {
  const supported = typeof speechSynthesis !== 'undefined'
  return <button type="button" className="btn" aria-label={supported ? `Phát âm “${text}”` : 'Trình duyệt không hỗ trợ phát âm'} title={supported ? `Nghe phát âm: ${text}` : 'Trình duyệt không hỗ trợ phát âm'} disabled={!supported} onClick={() => speak(text)}><Icon name="sound" size={17} />Nghe phát âm</button>
}
