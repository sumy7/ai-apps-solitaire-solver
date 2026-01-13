export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades'

export type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K'

export type InitialPosition =
  | { pile: 'tableau'; column: number; row: number; faceUp: boolean }
  | { pile: 'stock'; index: number; faceUp: false }

export interface Card {
  id: string
  suit: Suit | null
  rank: Rank | null
  faceUp: boolean
  known?: boolean
  initialPosition: InitialPosition
}

export interface GameState {
  stock: Card[]
  waste: Card[]
  foundations: Card[][]
  tableau: Card[][]
  drawMode: number
  stockIndex?: number // 看起来 gameLogic.ts 用这个
}

export type SolverStepStatus = 'start' | 'move' | 'draw' | 'blocked' | 'solved'

export interface SolverStep {
  id: number
  title: string
  detail?: string
  snapshot: GameState
  status: SolverStepStatus
}
