/**
 * Card suits configuration
 * Defines the symbols and colors for each suit in the deck
 */
export const SUITS = {
  hearts: { symbol: '♥', color: 'red' },
  diamonds: { symbol: '♦', color: 'red' },
  clubs: { symbol: '♣', color: 'black' },
  spades: { symbol: '♠', color: 'black' }
}

/**
 * Suit to foundation index mapping
 * Ensures consistent mapping between suits and foundation piles
 */
export const SUIT_TO_INDEX = {
  hearts: 0,
  diamonds: 1,
  clubs: 2,
  spades: 3
}

/**
 * Card ranks in order
 */
export const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']

/**
 * Numeric values for each rank
 * Used for game logic and move validation
 */
export const RANK_VALUES = {
  'A': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6,
  '7': 7, '8': 8, '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13
}

/**
 * Draw mode options
 */
export const DRAW_MODES = {
  ONE: 1,
  THREE: 3
}
