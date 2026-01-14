import { DRAW_MODES, SUITS } from '../constants/gameConstants'
import { Card, GameState, InitialPosition, Rank, Suit } from '../types'
import { canPlaceOnFoundation, canPlaceOnTableau, Move } from './gameLogic'

export const cloneCard = (card: Card): Card => ({ ...card, initialPosition: { ...card.initialPosition } })

export const cloneGameState = (state: GameState): GameState => ({
  stock: state.stock.map(cloneCard),
  waste: state.waste.map(cloneCard),
  foundations: state.foundations.map(pile => pile.map(cloneCard)),
  tableau: state.tableau.map(col => col.map(cloneCard)),
  drawMode: state.drawMode,
  stockIndex: state.stockIndex
})

export const stateSignature = (state: GameState) => {
  const parts: string[] = []
  parts.push('stock:' + state.stock.map(c => c.id).join(','))
  parts.push('waste:' + state.waste.map(c => c.id).join(','))
  parts.push('foundations:' + state.foundations.map(p => p.map(c => c.id).join('-')).join('|'))
  parts.push('tableau:' + state.tableau.map(col => col.map(c => c.id).join('-')).join('|'))
  return parts.join('#')
}

export const findFirstFaceUpUnknown = (state: GameState) => {
  const unknownInWaste = [...state.waste].reverse().find(card => card.faceUp && (!card.known || !card.rank || !card.suit))
  if (unknownInWaste) return { card: unknownInWaste, location: '废牌堆 Waste' }

  for (let col = 0; col < state.tableau.length; col++) {
    const unknown = state.tableau[col].find(card => card.faceUp && (!card.known || !card.rank || !card.suit))
    if (unknown) return { card: unknown, location: `牌列 Tableau ${col + 1}` }
  }

  return null
}

export const describeCard = (card: Card) => {
  if (card.suit && card.rank) return `${card.rank}${SUITS[card.suit].symbol}`
  return '未标注的牌'
}

export const describeMove = (from: string, to: string, card: Card) => `${describeCard(card)}: ${from} → ${to}`

export const drawFromStockInPlace = (state: GameState) => {
  if (state.stock.length === 0 && state.waste.length === 0) {
    return { drew: false, recycled: false }
  }

  if (state.stock.length === 0) {
    state.stock = [...state.waste].reverse()
    state.waste = []
    return { drew: true, recycled: true }
  }

  const drawCount = Math.min(state.drawMode, state.stock.length)
  for (let i = 0; i < drawCount; i++) {
    const card = state.stock.pop()
    if (card) {
      card.faceUp = true
      state.waste.push(card)
    }
  }

  return { drew: true, recycled: false }
}

export const applyMoveInPlace = (state: GameState, move: Move) => {
  let movingCard: Card | null = null

  if (move.from === 'waste') {
    movingCard = state.waste[state.waste.length - 1]
    if (!movingCard || movingCard.id !== move.card.id) return false
    state.waste.pop()
  } else if (move.from.startsWith('tableau-')) {
    const col = Number(move.from.split('-')[1])
    const column = state.tableau[col]
    movingCard = column[column.length - 1]
    if (!movingCard || movingCard.id !== move.card.id) return false
    column.pop()
    if (column.length > 0) {
      column[column.length - 1].faceUp = true
    }
  }

  if (!movingCard) return false

  if (move.to.startsWith('foundation-')) {
    const idx = Number(move.to.split('-')[1])
    const foundation = state.foundations[idx]
    if (!canPlaceOnFoundation(movingCard, foundation)) {
      if (move.from === 'waste') {
        state.waste.push(movingCard)
      } else if (move.from.startsWith('tableau-')) {
        const col = Number(move.from.split('-')[1])
        state.tableau[col].push(movingCard)
      }
      return false
    }
    foundation.push(movingCard)
    return true
  }

  if (move.to.startsWith('tableau-')) {
    const col = Number(move.to.split('-')[1])
    const column = state.tableau[col]
    if (!canPlaceOnTableau(movingCard, column)) {
      if (move.from === 'waste') {
        state.waste.push(movingCard)
      } else if (move.from.startsWith('tableau-')) {
        const sourceCol = Number(move.from.split('-')[1])
        state.tableau[sourceCol].push(movingCard)
      }
      return false
    }
    column.push(movingCard)
    return true
  }

  return false
}

export const computeUsedCards = (state: GameState): Set<string> => {
  const collected: string[] = []
  const collect = (card: Card | undefined) => {
    if (card && card.known && card.suit && card.rank) {
      collected.push(`${card.suit}-${card.rank}`)
    }
  }

  state.stock.forEach(collect)
  state.waste.forEach(collect)
  state.foundations.forEach(pile => pile.forEach(collect))
  state.tableau.forEach(col => col.forEach(collect))

  return new Set(collected)
}

const isSuit = (value: unknown): value is Suit => value === 'hearts' || value === 'diamonds' || value === 'clubs' || value === 'spades'
const isRank = (value: unknown): value is Rank =>
  value === 'A' ||
  value === '2' ||
  value === '3' ||
  value === '4' ||
  value === '5' ||
  value === '6' ||
  value === '7' ||
  value === '8' ||
  value === '9' ||
  value === '10' ||
  value === 'J' ||
  value === 'Q' ||
  value === 'K'

const normalizeInitialPosition = (value: any, context: string): InitialPosition => {
  if (!value || typeof value !== 'object') {
    throw new Error(`${context} 缺少 initialPosition`)
  }

  if (value.pile === 'stock') {
    if (typeof value.index !== 'number') {
      throw new Error(`${context} 的 initialPosition.index 无效`)
    }
    return { pile: 'stock', index: value.index, faceUp: false }
  }

  if (value.pile === 'tableau') {
    if (typeof value.column !== 'number' || typeof value.row !== 'number' || typeof value.faceUp !== 'boolean') {
      throw new Error(`${context} 的 initialPosition 无效`)
    }
    return { pile: 'tableau', column: value.column, row: value.row, faceUp: value.faceUp }
  }

  throw new Error(`${context} 的 initialPosition.pile 无效`)
}

const normalizeCard = (value: any, context: string): Card => {
  if (!value || typeof value !== 'object') {
    throw new Error(`${context} 不是有效的牌对象`)
  }

  if (typeof value.id !== 'string') {
    throw new Error(`${context} 缺少 id`)
  }

  if (typeof value.faceUp !== 'boolean') {
    throw new Error(`${context} 的 faceUp 无效`)
  }

  const suit = value.suit === null || isSuit(value.suit) ? value.suit : null
  const rank = value.rank === null || isRank(value.rank) ? value.rank : null
  const known = typeof value.known === 'boolean' ? value.known : Boolean(suit && rank)
  const initialPosition = normalizeInitialPosition(value.initialPosition, context)

  return {
    id: value.id,
    suit,
    rank,
    faceUp: value.faceUp,
    known,
    initialPosition
  }
}

const normalizeCardPile = (pile: any, context: string): Card[] => {
  if (!Array.isArray(pile)) return []
  return pile.map((card, idx) => normalizeCard(card, `${context}[${idx}]`))
}

export const normalizeGameState = (value: any): GameState => {
  if (!value || typeof value !== 'object') {
    throw new Error('导入的棋局对象无效')
  }

  const drawMode = value.drawMode === DRAW_MODES.THREE ? DRAW_MODES.THREE : DRAW_MODES.ONE
  const stock = normalizeCardPile(value.stock, 'stock')
  const waste = normalizeCardPile(value.waste, 'waste')

  const foundations = Array.from({ length: 4 }, (_, idx) =>
    normalizeCardPile(value.foundations?.[idx], `foundations[${idx}]`)
  )

  const tableau = Array.from({ length: 7 }, (_, idx) =>
    normalizeCardPile(value.tableau?.[idx], `tableau[${idx}]`)
  )

  const stockIndex = typeof value.stockIndex === 'number' ? value.stockIndex : 0

  return {
    stock,
    waste,
    foundations,
    tableau,
    drawMode,
    stockIndex
  }
}
