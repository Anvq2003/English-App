import type { Progress, Word } from './types.ts'

// Review interval (days) per Leitner box.
export const INTERVAL_DAYS = [0, 1, 3, 7, 14, 30]
export const MAX_BOX = INTERVAL_DAYS.length - 1
export const SESSION_SIZE = 20
export const MAX_NEW_PER_SESSION = 10

const DAY_MS = 24 * 60 * 60 * 1000

export const emptyProgress = (): Progress => ({
  seen: 0,
  wrong: 0,
  streak: 0,
  box: 0,
  lastSeen: null,
  nextDue: null,
})

export function applyResult(prev: Progress | undefined, correct: boolean, now: Date): Progress {
  const p = prev ?? emptyProgress()
  const box = correct ? Math.min(p.box + 1, MAX_BOX) : 0
  return {
    ...p,
    seen: p.seen + 1,
    wrong: correct ? p.wrong : p.wrong + 1,
    streak: correct ? p.streak + 1 : 0,
    box,
    lastSeen: now.toISOString(),
    nextDue: new Date(now.getTime() + INTERVAL_DAYS[box] * DAY_MS).toISOString(),
  }
}

export const isNew = (w: Word) => !w.progress || w.progress.seen === 0
export const isDue = (w: Word, now: number) =>
  !!w.progress && (!w.progress.nextDue || Date.parse(w.progress.nextDue) <= now)
const wrongRate = (w: Word) => (w.progress ? w.progress.wrong / Math.max(w.progress.seen, 1) : 0)

interface PickOptions {
  maxNew?: number
  now?: Date
}

// Priority: due (often wrong first) -> new (capped) -> not due yet (low box first).
export function pickWords(
  words: Word[],
  n = SESSION_SIZE,
  { maxNew = MAX_NEW_PER_SESSION, now = new Date() }: PickOptions = {},
): Word[] {
  const t = now.getTime()
  const seenWords = words.filter((w) => !isNew(w))
  const due = seenWords.filter((w) => isDue(w, t)).sort((a, b) => wrongRate(b) - wrongRate(a))
  const fresh = words.filter(isNew)
  const upcoming = seenWords
    .filter((w) => !isDue(w, t))
    .sort((a, b) => a.progress!.box - b.progress!.box)

  const picked = due.slice(0, n)
  picked.push(...fresh.slice(0, Math.min(maxNew, n - picked.length)))
  picked.push(...upcoming.slice(0, n - picked.length))
  return picked
}
