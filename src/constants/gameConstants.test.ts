import { describe, it, expect } from 'vitest'
import { SUITS, SUIT_TO_INDEX, RANKS, RANK_VALUES, DRAW_MODES } from './gameConstants'

describe('gameConstants', () => {
  describe('SUITS', () => {
    it('should have correct suit symbols', () => {
      expect(SUITS.hearts.symbol).toBe('♥')
      expect(SUITS.diamonds.symbol).toBe('♦')
      expect(SUITS.clubs.symbol).toBe('♣')
      expect(SUITS.spades.symbol).toBe('♠')
    })

    it('should have correct suit colors', () => {
      expect(SUITS.hearts.color).toBe('red')
      expect(SUITS.diamonds.color).toBe('red')
      expect(SUITS.clubs.color).toBe('black')
      expect(SUITS.spades.color).toBe('black')
    })

    it('should have all four suits', () => {
      expect(Object.keys(SUITS)).toHaveLength(4)
    })
  })

  describe('SUIT_TO_INDEX', () => {
    it('should map suits to correct indices', () => {
      expect(SUIT_TO_INDEX.hearts).toBe(0)
      expect(SUIT_TO_INDEX.diamonds).toBe(1)
      expect(SUIT_TO_INDEX.clubs).toBe(2)
      expect(SUIT_TO_INDEX.spades).toBe(3)
    })

    it('should have all four suits mapped', () => {
      expect(Object.keys(SUIT_TO_INDEX)).toHaveLength(4)
    })
  })

  describe('RANKS', () => {
    it('should have 13 ranks', () => {
      expect(RANKS).toHaveLength(13)
    })

    it('should have ranks in correct order', () => {
      expect(RANKS).toEqual(['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'])
    })

    it('should start with Ace and end with King', () => {
      expect(RANKS[0]).toBe('A')
      expect(RANKS[12]).toBe('K')
    })
  })

  describe('RANK_VALUES', () => {
    it('should have values for all 13 ranks', () => {
      expect(Object.keys(RANK_VALUES)).toHaveLength(13)
    })

    it('should map Ace to 1', () => {
      expect(RANK_VALUES.A).toBe(1)
    })

    it('should map number cards correctly', () => {
      expect(RANK_VALUES['2']).toBe(2)
      expect(RANK_VALUES['3']).toBe(3)
      expect(RANK_VALUES['10']).toBe(10)
    })

    it('should map face cards correctly', () => {
      expect(RANK_VALUES.J).toBe(11)
      expect(RANK_VALUES.Q).toBe(12)
      expect(RANK_VALUES.K).toBe(13)
    })

    it('should have sequential values from 1 to 13', () => {
      const values = RANKS.map(rank => RANK_VALUES[rank])
      expect(values).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13])
    })
  })

  describe('DRAW_MODES', () => {
    it('should have ONE mode equal to 1', () => {
      expect(DRAW_MODES.ONE).toBe(1)
    })

    it('should have THREE mode equal to 3', () => {
      expect(DRAW_MODES.THREE).toBe(3)
    })
  })
})
