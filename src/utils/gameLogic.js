import { SUITS, RANK_VALUES, SUIT_TO_INDEX } from '../constants/gameConstants'

/**
 * Check if a card can be placed on a foundation pile
 * @param {Object} card - The card to place
 * @param {Array} foundation - The foundation pile
 * @returns {boolean} True if the move is valid
 */
export const canPlaceOnFoundation = (card, foundation) => {
  if (!card.known) return false
  
  // Ace must be placed on empty foundation
  if (foundation.length === 0) {
    return card.rank === 'A'
  }
  
  const topCard = foundation[foundation.length - 1]
  if (!topCard.known) return false
  
  // Must be same suit and next rank in sequence
  return card.suit === topCard.suit && 
         RANK_VALUES[card.rank] === RANK_VALUES[topCard.rank] + 1
}

/**
 * Check if a card can be placed on a tableau column
 * @param {Object} card - The card to place
 * @param {Array} column - The tableau column
 * @returns {boolean} True if the move is valid
 */
export const canPlaceOnTableau = (card, column) => {
  if (!card.known) return false
  
  // Only Kings can be placed on empty columns
  if (column.length === 0) {
    return card.rank === 'K'
  }
  
  const topCard = column[column.length - 1]
  if (!topCard.faceUp || !topCard.known) return false
  
  // Must alternate colors and be descending rank
  return SUITS[card.suit].color !== SUITS[topCard.suit].color &&
         RANK_VALUES[card.rank] === RANK_VALUES[topCard.rank] - 1
}

/**
 * Find all valid moves in the current game state
 * @param {Object} gameState - Current game state
 * @returns {Array} Array of possible moves
 */
export const findValidMoves = (gameState) => {
  const moves = []

  // Check waste pile card moves
  if (gameState.waste.length > 0) {
    const wasteCard = gameState.waste[gameState.waste.length - 1]
    if (wasteCard.known) {
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
      if (topCard.faceUp && topCard.known) {
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
 * @param {number} drawMode - Draw mode (1 or 3)
 * @returns {Object} Initial game state
 */
export const initializeGame = (drawMode) => {
  const gameState = {
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
      gameState.tableau[col].push({
        faceUp: row === col,
        suit: null,
        rank: null,
        known: false
      })
    }
  }

  // Create stock (remaining 24 cards)
  for (let i = 0; i < 24; i++) {
    gameState.stock.push({
      faceUp: false,
      suit: null,
      rank: null,
      known: false
    })
  }

  return gameState
}
