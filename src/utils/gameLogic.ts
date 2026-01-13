import { SUITS, RANK_VALUES, SUIT_TO_INDEX } from '../constants/gameConstants'
import { Card, GameState } from '../types'

/**
 * Check if a card can be placed on a foundation pile
 */
export const canPlaceOnFoundation = (card: Card, foundation: Card[]): boolean => {
  if (!card.known || !card.rank || !card.suit) return false
  
  // Ace must be placed on empty foundation
  if (foundation.length === 0) {
    return card.rank === 'A'
  }
  
  const topCard = foundation[foundation.length - 1]
  if (!topCard.known || !topCard.rank || !topCard.suit) return false
  
  // Must be same suit and next rank in sequence
  return card.suit === topCard.suit && 
         RANK_VALUES[card.rank] === RANK_VALUES[topCard.rank] + 1
}

/**
 * Check if a card can be placed on a tableau column
 */
export const canPlaceOnTableau = (card: Card, column: Card[]): boolean => {
  if (!card.known || !card.rank || !card.suit) return false
  
  // Only Kings can be placed on empty columns
  if (column.length === 0) {
    return card.rank === 'K'
  }
  
  const topCard = column[column.length - 1]
  if (!topCard.faceUp || !topCard.known || !topCard.rank || !topCard.suit) return false
  
  // Must alternate colors and be descending rank
  return SUITS[card.suit].color !== SUITS[topCard.suit].color &&
         RANK_VALUES[card.rank] === RANK_VALUES[topCard.rank] - 1
}

export interface Move {
  from: string
  to: string
  card: Card
}

/**
 * Find all valid moves in the current game state
 */
export const findValidMoves = (gameState: GameState): Move[] => {
  const moves: Move[] = []

  // Check waste pile card moves
  if (gameState.waste.length > 0) {
    const wasteCard = gameState.waste[gameState.waste.length - 1]
    if (wasteCard.known && wasteCard.suit) {
      // Check foundation moves
      const suitIndex = SUIT_TO_INDEX[wasteCard.suit]
      const foundation = gameState.foundations[suitIndex]
      if (canPlaceOnFoundation(wasteCard, foundation)) {
        moves.push({
          from: 'waste',
          to: `foundation-${suitIndex}`,
          card: wasteCard
        })
      }

      // Check tableau moves
      for (let col = 0; col < 7; col++) {
        const column = gameState.tableau[col]
        if (canPlaceOnTableau(wasteCard, column)) {
          moves.push({
            from: 'waste',
            to: `tableau-${col}`,
            card: wasteCard
          })
        }
      }
    }
  }

  // Check tableau card moves
  for (let col = 0; col < 7; col++) {
    const column = gameState.tableau[col]
    if (column.length > 0) {
      const topCard = column[column.length - 1]
      if (topCard.faceUp && topCard.known && topCard.suit) {
        // Check foundation moves
        const suitIndex = SUIT_TO_INDEX[topCard.suit]
        const foundation = gameState.foundations[suitIndex]
        if (canPlaceOnFoundation(topCard, foundation)) {
          moves.push({
            from: `tableau-${col}`,
            to: `foundation-${suitIndex}`,
            card: topCard
          })
        }

        // Check moves to other tableau columns
        for (let targetCol = 0; targetCol < 7; targetCol++) {
          if (targetCol !== col) {
            const targetColumn = gameState.tableau[targetCol]
            if (canPlaceOnTableau(topCard, targetColumn)) {
              moves.push({
                from: `tableau-${col}`,
                to: `tableau-${targetCol}`,
                card: topCard
              })
            }
          }
        }
      }
    }
  }

  return moves
}

/**
 * Initialize a new game state
 */
export const initializeGame = (drawMode: number): GameState => {
  let cardCounter = 0
  const nextCardId = () => `card-${cardCounter++}`

  const gameState: GameState = {
    stock: [],
    waste: [],
    foundations: [[], [], [], []],
    tableau: [[], [], [], [], [], [], []],
    drawMode,
    stockIndex: 0
  }

  // Create tableau with face-down and one face-up card per column
  for (let col = 0; col < 7; col++) {
    for (let row = 0; row <= col; row++) {
      const faceUp = row === col
      gameState.tableau[col].push({
        id: nextCardId(),
        faceUp,
        suit: null,
        rank: null,
        known: false,
        initialPosition: { pile: 'tableau', column: col, row, faceUp }
      })
    }
  }

  // Create stock (remaining 24 cards)
  for (let i = 0; i < 24; i++) {
    gameState.stock.push({
      id: nextCardId(),
      faceUp: false,
      suit: null,
      rank: null,
      known: false,
      initialPosition: { pile: 'stock', index: i, faceUp: false }
    })
  }

  return gameState
}
