import { describe, it, expect } from 'vitest'
import {
  cloneCard,
  cloneGameState,
  stateSignature,
  findFirstFaceUpUnknown,
  describeCard,
  describeMove,
  drawFromStockInPlace,
  applyMoveInPlace,
  computeUsedCards,
  normalizeGameState
} from './gameStateUtils'
import { Card, GameState } from '../types'

describe('gameStateUtils', () => {
  describe('cloneCard', () => {
    it('should create a deep copy of a card', () => {
      const original: Card = {
        id: 'test-1',
        suit: 'hearts',
        rank: 'A',
        faceUp: true,
        known: true,
        initialPosition: { pile: 'tableau', column: 0, row: 0, faceUp: true }
      }
      const cloned = cloneCard(original)
      
      expect(cloned).toEqual(original)
      expect(cloned).not.toBe(original)
      expect(cloned.initialPosition).not.toBe(original.initialPosition)
    })
  })

  describe('cloneGameState', () => {
    it('should create a deep copy of game state', () => {
      const original: GameState = {
        stock: [{
          id: 'test-1',
          suit: null,
          rank: null,
          faceUp: false,
          known: false,
          initialPosition: { pile: 'stock', index: 0, faceUp: false }
        }],
        waste: [],
        foundations: [[], [], [], []],
        tableau: [[], [], [], [], [], [], []],
        drawMode: 1,
        stockIndex: 0
      }
      
      const cloned = cloneGameState(original)
      
      expect(cloned).toEqual(original)
      expect(cloned).not.toBe(original)
      expect(cloned.stock).not.toBe(original.stock)
      expect(cloned.waste).not.toBe(original.waste)
    })
  })

  describe('stateSignature', () => {
    it('should generate consistent signature for same state', () => {
      const state: GameState = {
        stock: [{
          id: 'card-1',
          suit: null,
          rank: null,
          faceUp: false,
          known: false,
          initialPosition: { pile: 'stock', index: 0, faceUp: false }
        }],
        waste: [],
        foundations: [[], [], [], []],
        tableau: [[], [], [], [], [], [], []],
        drawMode: 1,
        stockIndex: 0
      }
      
      const sig1 = stateSignature(state)
      const sig2 = stateSignature(state)
      
      expect(sig1).toBe(sig2)
    })

    it('should generate different signatures for different states', () => {
      const state1: GameState = {
        stock: [{
          id: 'card-1',
          suit: null,
          rank: null,
          faceUp: false,
          known: false,
          initialPosition: { pile: 'stock', index: 0, faceUp: false }
        }],
        waste: [],
        foundations: [[], [], [], []],
        tableau: [[], [], [], [], [], [], []],
        drawMode: 1,
        stockIndex: 0
      }
      
      const state2: GameState = {
        stock: [],
        waste: [{
          id: 'card-1',
          suit: null,
          rank: null,
          faceUp: true,
          known: false,
          initialPosition: { pile: 'stock', index: 0, faceUp: false }
        }],
        foundations: [[], [], [], []],
        tableau: [[], [], [], [], [], [], []],
        drawMode: 1,
        stockIndex: 0
      }
      
      const sig1 = stateSignature(state1)
      const sig2 = stateSignature(state2)
      
      expect(sig1).not.toBe(sig2)
    })
  })

  describe('findFirstFaceUpUnknown', () => {
    it('should return null when no unknown cards', () => {
      const state: GameState = {
        stock: [],
        waste: [],
        foundations: [[], [], [], []],
        tableau: [[], [], [], [], [], [], []],
        drawMode: 1,
        stockIndex: 0
      }
      
      expect(findFirstFaceUpUnknown(state)).toBeNull()
    })

    it('should find unknown card in waste', () => {
      const unknownCard: Card = {
        id: 'test-1',
        suit: null,
        rank: null,
        faceUp: true,
        known: false,
        initialPosition: { pile: 'stock', index: 0, faceUp: false }
      }
      
      const state: GameState = {
        stock: [],
        waste: [unknownCard],
        foundations: [[], [], [], []],
        tableau: [[], [], [], [], [], [], []],
        drawMode: 1,
        stockIndex: 0
      }
      
      const result = findFirstFaceUpUnknown(state)
      expect(result).not.toBeNull()
      expect(result?.card).toBe(unknownCard)
      expect(result?.location).toBe('废牌堆 Waste')
    })

    it('should find unknown card in tableau', () => {
      const unknownCard: Card = {
        id: 'test-1',
        suit: null,
        rank: null,
        faceUp: true,
        known: false,
        initialPosition: { pile: 'tableau', column: 0, row: 0, faceUp: true }
      }
      
      const state: GameState = {
        stock: [],
        waste: [],
        foundations: [[], [], [], []],
        tableau: [[unknownCard], [], [], [], [], [], []],
        drawMode: 1,
        stockIndex: 0
      }
      
      const result = findFirstFaceUpUnknown(state)
      expect(result).not.toBeNull()
      expect(result?.card).toBe(unknownCard)
      expect(result?.location).toBe('牌列 Tableau 1')
    })
  })

  describe('describeCard', () => {
    it('should describe known card', () => {
      const card: Card = {
        id: 'test-1',
        suit: 'hearts',
        rank: 'A',
        faceUp: true,
        known: true,
        initialPosition: { pile: 'tableau', column: 0, row: 0, faceUp: true }
      }
      
      expect(describeCard(card)).toBe('A♥')
    })

    it('should describe unknown card', () => {
      const card: Card = {
        id: 'test-1',
        suit: null,
        rank: null,
        faceUp: true,
        known: false,
        initialPosition: { pile: 'tableau', column: 0, row: 0, faceUp: true }
      }
      
      expect(describeCard(card)).toBe('未标注的牌')
    })
  })

  describe('describeMove', () => {
    it('should describe a move', () => {
      const card: Card = {
        id: 'test-1',
        suit: 'hearts',
        rank: 'A',
        faceUp: true,
        known: true,
        initialPosition: { pile: 'tableau', column: 0, row: 0, faceUp: true }
      }
      
      const description = describeMove('waste', 'foundation-0', card)
      expect(description).toContain('A♥')
      expect(description).toContain('waste')
      expect(description).toContain('foundation-0')
    })
  })

  describe('drawFromStockInPlace', () => {
    it('should draw card from stock to waste', () => {
      const stockCard: Card = {
        id: 'test-1',
        suit: null,
        rank: null,
        faceUp: false,
        known: false,
        initialPosition: { pile: 'stock', index: 0, faceUp: false }
      }
      
      const state: GameState = {
        stock: [stockCard],
        waste: [],
        foundations: [[], [], [], []],
        tableau: [[], [], [], [], [], [], []],
        drawMode: 1,
        stockIndex: 0
      }
      
      const result = drawFromStockInPlace(state)
      
      expect(result.drew).toBe(true)
      expect(result.recycled).toBe(false)
      expect(state.stock).toHaveLength(0)
      expect(state.waste).toHaveLength(1)
      expect(state.waste[0].faceUp).toBe(true)
    })

    it('should draw multiple cards in draw-3 mode', () => {
      const cards = [
        {
          id: 'test-1',
          suit: null,
          rank: null,
          faceUp: false,
          known: false,
          initialPosition: { pile: 'stock', index: 0, faceUp: false }
        },
        {
          id: 'test-2',
          suit: null,
          rank: null,
          faceUp: false,
          known: false,
          initialPosition: { pile: 'stock', index: 1, faceUp: false }
        },
        {
          id: 'test-3',
          suit: null,
          rank: null,
          faceUp: false,
          known: false,
          initialPosition: { pile: 'stock', index: 2, faceUp: false }
        }
      ]
      
      const state: GameState = {
        stock: [...cards],
        waste: [],
        foundations: [[], [], [], []],
        tableau: [[], [], [], [], [], [], []],
        drawMode: 3,
        stockIndex: 0
      }
      
      const result = drawFromStockInPlace(state)
      
      expect(result.drew).toBe(true)
      expect(state.stock).toHaveLength(0)
      expect(state.waste).toHaveLength(3)
    })

    it('should recycle waste to stock when stock is empty', () => {
      const wasteCard: Card = {
        id: 'test-1',
        suit: null,
        rank: null,
        faceUp: true,
        known: false,
        initialPosition: { pile: 'stock', index: 0, faceUp: false }
      }
      
      const state: GameState = {
        stock: [],
        waste: [wasteCard],
        foundations: [[], [], [], []],
        tableau: [[], [], [], [], [], [], []],
        drawMode: 1,
        stockIndex: 0
      }
      
      const result = drawFromStockInPlace(state)
      
      expect(result.drew).toBe(true)
      expect(result.recycled).toBe(true)
      expect(state.stock).toHaveLength(1)
      expect(state.waste).toHaveLength(0)
    })

    it('should return false when both stock and waste are empty', () => {
      const state: GameState = {
        stock: [],
        waste: [],
        foundations: [[], [], [], []],
        tableau: [[], [], [], [], [], [], []],
        drawMode: 1,
        stockIndex: 0
      }
      
      const result = drawFromStockInPlace(state)
      
      expect(result.drew).toBe(false)
    })
  })

  describe('applyMoveInPlace', () => {
    it('should move card from waste to foundation', () => {
      const aceCard: Card = {
        id: 'test-1',
        suit: 'hearts',
        rank: 'A',
        faceUp: true,
        known: true,
        initialPosition: { pile: 'stock', index: 0, faceUp: false }
      }
      
      const state: GameState = {
        stock: [],
        waste: [aceCard],
        foundations: [[], [], [], []],
        tableau: [[], [], [], [], [], [], []],
        drawMode: 1,
        stockIndex: 0
      }
      
      const move = {
        from: 'waste',
        to: 'foundation-0',
        card: aceCard
      }
      
      const result = applyMoveInPlace(state, move)
      
      expect(result).toBe(true)
      expect(state.waste).toHaveLength(0)
      expect(state.foundations[0]).toHaveLength(1)
    })

    it('should move card from tableau to tableau', () => {
      const sevenCard: Card = {
        id: 'test-1',
        suit: 'hearts',
        rank: '7',
        faceUp: true,
        known: true,
        initialPosition: { pile: 'tableau', column: 0, row: 0, faceUp: true }
      }
      
      const sixCard: Card = {
        id: 'test-2',
        suit: 'spades',
        rank: '6',
        faceUp: true,
        known: true,
        initialPosition: { pile: 'tableau', column: 1, row: 0, faceUp: true }
      }
      
      const state: GameState = {
        stock: [],
        waste: [],
        foundations: [[], [], [], []],
        tableau: [[sevenCard], [sixCard], [], [], [], [], []],
        drawMode: 1,
        stockIndex: 0
      }
      
      const move = {
        from: 'tableau-1',
        to: 'tableau-0',
        card: sixCard
      }
      
      const result = applyMoveInPlace(state, move)
      
      expect(result).toBe(true)
      expect(state.tableau[0]).toHaveLength(2)
      expect(state.tableau[1]).toHaveLength(0)
    })

    it('should flip face-down card when top card is removed', () => {
      const faceDownCard: Card = {
        id: 'test-1',
        suit: null,
        rank: null,
        faceUp: false,
        known: false,
        initialPosition: { pile: 'tableau', column: 0, row: 0, faceUp: false }
      }
      
      const aceCard: Card = {
        id: 'test-2',
        suit: 'hearts',
        rank: 'A',
        faceUp: true,
        known: true,
        initialPosition: { pile: 'tableau', column: 0, row: 1, faceUp: true }
      }
      
      const state: GameState = {
        stock: [],
        waste: [],
        foundations: [[], [], [], []],
        tableau: [[faceDownCard, aceCard], [], [], [], [], [], []],
        drawMode: 1,
        stockIndex: 0
      }
      
      const move = {
        from: 'tableau-0',
        to: 'foundation-0',
        card: aceCard
      }
      
      const result = applyMoveInPlace(state, move)
      
      expect(result).toBe(true)
      expect(state.tableau[0]).toHaveLength(1)
      expect(state.tableau[0][0].faceUp).toBe(true)
    })

    it('should reject invalid move', () => {
      const twoCard: Card = {
        id: 'test-1',
        suit: 'hearts',
        rank: '2',
        faceUp: true,
        known: true,
        initialPosition: { pile: 'stock', index: 0, faceUp: false }
      }
      
      const state: GameState = {
        stock: [],
        waste: [twoCard],
        foundations: [[], [], [], []],
        tableau: [[], [], [], [], [], [], []],
        drawMode: 1,
        stockIndex: 0
      }
      
      const move = {
        from: 'waste',
        to: 'foundation-0',
        card: twoCard
      }
      
      const result = applyMoveInPlace(state, move)
      
      expect(result).toBe(false)
      expect(state.waste).toHaveLength(1)
      expect(state.foundations[0]).toHaveLength(0)
    })
  })

  describe('computeUsedCards', () => {
    it('should compute empty set for new game', () => {
      const state: GameState = {
        stock: [{
          id: 'test-1',
          suit: null,
          rank: null,
          faceUp: false,
          known: false,
          initialPosition: { pile: 'stock', index: 0, faceUp: false }
        }],
        waste: [],
        foundations: [[], [], [], []],
        tableau: [[], [], [], [], [], [], []],
        drawMode: 1,
        stockIndex: 0
      }
      
      const used = computeUsedCards(state)
      expect(used.size).toBe(0)
    })

    it('should compute used cards from all piles', () => {
      const aceHearts: Card = {
        id: 'test-1',
        suit: 'hearts',
        rank: 'A',
        faceUp: true,
        known: true,
        initialPosition: { pile: 'stock', index: 0, faceUp: false }
      }
      
      const twoHearts: Card = {
        id: 'test-2',
        suit: 'hearts',
        rank: '2',
        faceUp: true,
        known: true,
        initialPosition: { pile: 'tableau', column: 0, row: 0, faceUp: true }
      }
      
      const state: GameState = {
        stock: [],
        waste: [aceHearts],
        foundations: [[], [], [], []],
        tableau: [[twoHearts], [], [], [], [], [], []],
        drawMode: 1,
        stockIndex: 0
      }
      
      const used = computeUsedCards(state)
      expect(used.size).toBe(2)
      expect(used.has('hearts-A')).toBe(true)
      expect(used.has('hearts-2')).toBe(true)
    })
  })

  describe('normalizeGameState', () => {
    it('should normalize valid game state', () => {
      const input = {
        stock: [],
        waste: [],
        foundations: [[], [], [], []],
        tableau: [[], [], [], [], [], [], []],
        drawMode: 1,
        stockIndex: 0
      }
      
      const normalized = normalizeGameState(input)
      
      expect(normalized.stock).toEqual([])
      expect(normalized.waste).toEqual([])
      expect(normalized.foundations).toHaveLength(4)
      expect(normalized.tableau).toHaveLength(7)
      expect(normalized.drawMode).toBe(1)
    })

    it('should default to draw-1 for invalid draw mode', () => {
      const input = {
        stock: [],
        waste: [],
        foundations: [[], [], [], []],
        tableau: [[], [], [], [], [], [], []],
        drawMode: 5
      }
      
      const normalized = normalizeGameState(input)
      expect(normalized.drawMode).toBe(1)
    })

    it('should normalize draw mode 3', () => {
      const input = {
        stock: [],
        waste: [],
        foundations: [[], [], [], []],
        tableau: [[], [], [], [], [], [], []],
        drawMode: 3
      }
      
      const normalized = normalizeGameState(input)
      expect(normalized.drawMode).toBe(3)
    })

    it('should throw error for invalid input', () => {
      expect(() => normalizeGameState(null)).toThrow()
      expect(() => normalizeGameState(undefined)).toThrow()
      expect(() => normalizeGameState('invalid')).toThrow()
    })
  })
})
