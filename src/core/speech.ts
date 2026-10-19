const supported = () => typeof speechSynthesis !== 'undefined'

const englishVoices = () => speechSynthesis.getVoices().filter((v) => v.lang.startsWith('en'))

export function speak(text: string): void {
  if (!supported()) return
  speechSynthesis.cancel()
  const utter = new SpeechSynthesisUtterance(text)
  utter.lang = 'en-US'
  speechSynthesis.speak(utter)
}

// Voices load asynchronously in some browsers, so wait for `voiceschanged` (max 1.5s).
export function hasEnglishVoice(): Promise<boolean> {
  if (!supported()) return Promise.resolve(false)
  if (englishVoices().length) return Promise.resolve(true)
  return new Promise((resolve) => {
    const done = () => {
      speechSynthesis.removeEventListener('voiceschanged', done)
      clearTimeout(timer)
      resolve(englishVoices().length > 0)
    }
    const timer = setTimeout(done, 1500)
    speechSynthesis.addEventListener('voiceschanged', done)
  })
}
