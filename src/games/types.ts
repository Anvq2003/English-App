import type { ComponentType } from 'react'

export interface GameProps {
  onExit: () => void
}

export interface GameDef {
  id: string
  name: string
  description: string
  component: ComponentType<GameProps>
}
