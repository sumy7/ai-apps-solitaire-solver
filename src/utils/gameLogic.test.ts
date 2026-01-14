import { describe, it, expect } from 'vitest'
import { canPlaceOnFoundation, canPlaceOnTableau, findValidMoves, initializeGame } from './gameLogic'
import { Card, GameState } from '../types'

describe('gameLogic', () => {
  describe('canPlaceOnFoundation', () => {
    it('should allow Ace on empty foundation', () => {
      const aceCard: Card = {
        id: 'test-1',
        suit: 'hearts',
        rank: 'A',
        faceUp: true,
        known: true,
        initialPosition: { pile: 'tableau', column: 0, row: 0, faceUp: true }
      }
      expect(canPlaceOnFoundation(aceCard, [])).toBe(true)
    })

    it('should not allow non-Ace on empty foundation', () => {
      const twoCard: Card = {
        id: 'test-1',
        suit: 'hearts',
        rank: '2',
        faceUp: true,
        known: true,
        initialPosition: { pile: 'tableau', column: 0, row: 0, faceUp: true }
      }
      expect(canPlaceOnFoundation(twoCard, [])).toBe(false)
    })

    it('should allow same suit next rank card', () => {
      const aceCard: Card = {
        id: 'test-1',
        suit: 'hearts',
        rank: 'A',
        faceUp: true,
        known: true,
        initialPosition: { pile: 'tableau', column: 0, row: 0, faceUp: true }
      }
      const twoCard: Card = {
        id: 'test-2',
        suit: 'hearts',
        rank: '2',
        faceUp: true,
        known: true,
        initialPosition: { pile: 'tableau', column: 0, row: 1, faceUp: true }
      }
      expect(canPlaceOnFoundation(twoCard, [aceCard])).toBe(true)
    })

    it('should not allow different suit card', () => {
      const aceCard: Card = {
        id: 'test-1',
        suit: 'hearts',
        rank: 'A',
        faceUp: true,
        known: true,
        initialPosition: { pile: 'tableau', column: 0, row: 0, faceUp: true }
      }
      const twoCard: Card = {
        id: 'test-2',
        suit: 'diamonds',
        rank: '2',
        faceUp: true,
        known: true,
        initialPosition: { pile: 'tableau', column: 0, row: 1, faceUp: true }
      }
      expect(canPlaceOnFoundation(twoCard, [aceCard])).toBe(false)
    })

    it('should not allow skipping ranks', () => {
      const aceCard: Card = {
        id: 'test-1',
        suit: 'hearts',
        rank: 'A',
        faceUp: true,
        known: true,
        initialPosition: { pile: 'tableau', column: 0, row: 0, faceUp: true }
      }
      const threeCard: Card = {
        id: 'test-3',
        suit: 'hearts',
        rank: '3',
        faceUp: true,
        known: true,
        initialPosition: { pile: 'tableau', column: 0, row: 1, faceUp: true }
      }
      expect(canPlaceOnFoundation(threeCard, [aceCard])).toBe(false)
    })

    it('should not allow unknown cards', () => {
      const unknownCard: Card = {
        id: 'test-1',
        suit: null,
        rank: null,
        faceUp: true,
        known: false,
        initialPosition: { pile: 'tableau', column: 0, row: 0, faceUp: true }
      }
      expect(canPlaceOnFoundation(unknownCard, [])).toBe(false)
    })
  })

  describe('canPlaceOnTableau', () => {
    it('should allow King on empty column', () => {
      const kingCard: Card = {
        id: 'test-1',
        suit: 'hearts',
        rank: 'K',
        faceUp: true,
        known: true,
        initialPosition: { pile: 'tableau', column: 0, row: 0, faceUp: true }
      }
      expect(canPlaceOnTableau(kingCard, [])).toBe(true)
    })

    it('should not allow non-King on empty column', () => {
      const queenCard: Card = {
        id: 'test-1',
        suit: 'hearts',
        rank: 'Q',
        faceUp: true,
        known: true,
        initialPosition: { pile: 'tableau', column: 0, row: 0, faceUp: true }
      }
      expect(canPlaceOnTableau(queenCard, [])).toBe(false)
    })

    it('should allow opposite color descending rank', () => {
      const redCard: Card = {
        id: 'test-1',
        suit: 'hearts',
        rank: '7',
        faceUp: true,
        known: true,
        initialPosition: { pile: 'tableau', column: 0, row: 0, faceUp: true }
      }
      const blackCard: Card = {
        id: 'test-2',
        suit: 'spades',
        rank: '6',
        faceUp: true,
        known: true,
        initialPosition: { pile: 'tableau', column: 1, row: 0, faceUp: true }
      }
      expect(canPlaceOnTableau(blackCard, [redCard])).toBe(true)
    })

    it('should not allow same color cards', () => {
      const redCard1: Card = {
        id: 'test-1',
        suit: 'hearts',
        rank: '7',
        faceUp: true,
        known: true,
        initialPosition: { pile: 'tableau', column: 0, row: 0, faceUp: true }
      }
      const redCard2: Card = {
        id: 'test-2',
        suit: 'diamonds',
        rank: '6',
        faceUp: true,
        known: true,
        initialPosition: { pile: 'tableau', column: 1, row: 0, faceUp: true }
      }
      expect(canPlaceOnTableau(redCard2, [redCard1])).toBe(false)
    })

    it('should not allow ascending rank', () => {
      const sevenCard: Card = {
        id: 'test-1',
        suit: 'hearts',
        rank: '7',
        faceUp: true,
        known: true,
        initialPosition: { pile: 'tableau', column: 0, row: 0, faceUp: true }
      }
      const eightCard: Card = {
        id: 'test-2',
        suit: 'spades',
        rank: '8',
        faceUp: true,
        known: true,
        initialPosition: { pile: 'tableau', column: 1, row: 0, faceUp: true }
      }
      expect(canPlaceOnTableau(eightCard, [sevenCard])).toBe(false)
    })

    it('should not allow placing on face-down card', () => {
      const faceDownCard: Card = {
        id: 'test-1',
        suit: 'hearts',
        rank: '7',
        faceUp: false,
        known: true,
        initialPosition: { pile: 'tableau', column: 0, row: 0, faceUp: false }
      }
      const sixCard: Card = {
        id: 'test-2',
        suit: 'spades',
        rank: '6',
        faceUp: true,
        known: true,
        initialPosition: { pile: 'tableau', column: 1, row: 0, faceUp: true }
      }
      expect(canPlaceOnTableau(sixCard, [faceDownCard])).toBe(false)
    })
  })

  describe('findValidMoves', () => {
    it('should find no moves in empty game state', () => {
      const gameState: GameState = {
        stock: [],
        waste: [],
        foundations: [[], [], [], []],
        tableau: [[], [], [], [], [], [], []],
        drawMode: 1,
        stockIndex: 0
      }
      const moves = findValidMoves(gameState)
      expect(moves).toHaveLength(0)
    })

    it('should find foundation move from waste', () => {
      const aceCard: Card = {
        id: 'test-1',
        suit: 'hearts',
        rank: 'A',
        faceUp: true,
        known: true,
        initialPosition: { pile: 'stock', index: 0, faceUp: false }
      }
      const gameState: GameState = {
        stock: [],
        waste: [aceCard],
        foundations: [[], [], [], []],
        tableau: [[], [], [], [], [], [], []],
        drawMode: 1,
        stockIndex: 0
      }
      const moves = findValidMoves(gameState)
      expect(moves.length).toBeGreaterThan(0)
      expect(moves.some(m => m.from === 'waste' && m.to === 'foundation-0')).toBe(true)
    })

    it('should find tableau move from waste', () => {
      const sixCard: Card = {
        id: 'test-1',
        suit: 'spades',
        rank: '6',
        faceUp: true,
        known: true,
        initialPosition: { pile: 'stock', index: 0, faceUp: false }
      }
      const sevenCard: Card = {
        id: 'test-2',
        suit: 'hearts',
        rank: '7',
        faceUp: true,
        known: true,
        initialPosition: { pile: 'tableau', column: 0, row: 0, faceUp: true }
      }
      const gameState: GameState = {
        stock: [],
        waste: [sixCard],
        foundations: [[], [], [], []],
        tableau: [[sevenCard], [], [], [], [], [], []],
        drawMode: 1,
        stockIndex: 0
      }
      const moves = findValidMoves(gameState)
      expect(moves.some(m => m.from === 'waste' && m.to === 'tableau-0')).toBe(true)
    })
  })

  describe('initializeGame', () => {
    it('should create correct number of cards', () => {
      const gameState = initializeGame(1)
      const totalCards = gameState.stock.length + 
                        gameState.tableau.reduce((sum, col) => sum + col.length, 0)
      expect(totalCards).toBe(52) // Standard deck
    })

    it('should create 7 tableau columns', () => {
      const gameState = initializeGame(1)
      expect(gameState.tableau).toHaveLength(7)
    })

    it('should create correct tableau structure', () => {
      const gameState = initializeGame(1)
      gameState.tableau.forEach((column, index) => {
        expect(column).toHaveLength(index + 1)
        // Last card should be face up
        expect(column[column.length - 1].faceUp).toBe(true)
        // Other cards should be face down
        for (let i = 0; i < column.length - 1; i++) {
          expect(column[i].faceUp).toBe(false)
        }
      })
    })

    it('should create 24 stock cards', () => {
      const gameState = initializeGame(1)
      expect(gameState.stock).toHaveLength(24)
    })

    it('should initialize with empty waste', () => {
      const gameState = initializeGame(1)
      expect(gameState.waste).toHaveLength(0)
    })

    it('should initialize with empty foundations', () => {
      const gameState = initializeGame(1)
      expect(gameState.foundations).toHaveLength(4)
      gameState.foundations.forEach(foundation => {
        expect(foundation).toHaveLength(0)
      })
    })

    it('should set correct draw mode', () => {
      const gameState1 = initializeGame(1)
      expect(gameState1.drawMode).toBe(1)
      
      const gameState3 = initializeGame(3)
      expect(gameState3.drawMode).toBe(3)
    })

    it('should mark all cards as unknown initially', () => {
      const gameState = initializeGame(1)
      const allCards = [
        ...gameState.stock,
        ...gameState.tableau.flat()
      ]
      allCards.forEach(card => {
        expect(card.known).toBe(false)
        expect(card.suit).toBeNull()
        expect(card.rank).toBeNull()
      })
    })

    it('should assign unique IDs to all cards', () => {
      const gameState = initializeGame(1)
      const allCards = [
        ...gameState.stock,
        ...gameState.tableau.flat()
      ]
      const ids = allCards.map(card => card.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(allCards.length)
    })
  })
})
