import type { CSSProperties } from 'react'

const paths = {
  book: 'M12 7v14m0-14C9 4 5 4 2 5v14c4-1 7 0 10 2 3-2 6-3 10-2V5c-3-1-7-1-10 2Z',
  home: 'm3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z',
  cards: 'm8 3 12 3-4 15-12-3Zm0 4H3v13h10',
  library: 'M4 4h4v16H4Zm7 0h4v16h-4Zm7 1 3-1 3 15-3 1Z',
  arrow: 'M4 12h16m-6-6 6 6-6 6',
  back: 'M20 12H4m6-6-6 6 6 6',
  chevron: 'm9 5 7 7-7 7',
  plus: 'M12 5v14M5 12h14',
  upload: 'M12 16V3m-5 5 5-5 5 5M4 15v5a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-5',
  download: 'M12 3v13m-5-5 5 5 5-5M4 16v4a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-4',
  check: 'm5 12 4 4L19 6',
  clock: 'M12 8v5l3 2M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',
  spark: 'm12 2 2.8 7.2L22 12l-7.2 2.8L12 22l-2.8-7.2L2 12l7.2-2.8Z',
  leaf: 'M20 3C10 2 3 6 4 13c1 7 11 9 14 2 2-4 2-8 2-12ZM4 21l11-11',
  shield: 'm12 3 9 4v5c0 5-5 8-9 10-4-2-9-5-9-10V7Zm-4 9 3 3 5-6',
  help: 'M9 9a3 3 0 1 1 4 3c-1 0-1 1-1 2m0 3h.01M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',
  keyboard: 'M3 5h18v14H3ZM6 9h.01M10 9h.01M14 9h.01M18 9h.01M6 12h.01M10 12h.01M14 12h.01M18 12h.01M7 16h10',
  sound: 'm11 4-6 5H2v6h3l6 5Zm5 4a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14',
  search: 'm21 21-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0',
  refresh: 'M20 7V2m0 5h-5M4 17v5m0-5h5M4 8a9 9 0 0 1 15-3l1 2M4 17l1 2a9 9 0 0 0 15-3',
  close: 'm6 6 12 12M6 18 18 6',
  text: 'M4 5h16M12 5v15M8 20h8',
  headphones: 'M3 14v-3a9 9 0 0 1 18 0v3M3 12h4v8H3Zm14 0h4v8h-4Z',
  edit: 'm16 3 5 5-12 12H4v-5Zm-3 3 5 5',
} as const

export type IconName = keyof typeof paths

export function Icon({ name, size = 20, style }: { name: IconName; size?: number; style?: CSSProperties }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={style}><path d={paths[name]} /></svg>
}
