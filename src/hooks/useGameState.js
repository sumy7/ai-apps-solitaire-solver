import { useState, useCallback } from 'react'
import { initializeGame, findValidMoves } from '../utils/gameLogic'
import { DRAW_MODES } from '../constants/gameConstants'

/**
 * Custom hook for managing the solitaire game state
 * Handles all game logic including card management, moves, and solver
 * @param {number} initialDrawMode - Initial draw mode (1 or 3)
 * @returns {Object} Game state and methods
 */
export const useGameState = (initialDrawMode = DRAW_MODES.ONE) => {
  const [gameState, setGameState] = useState(() => initializeGame(initialDrawMode))
  const [usedCards, setUsedCards] = useState(new Set())
  const [infoMessage, setInfoMessage] = useState('游戏已初始化。点击未知牌来填充信息。Game initialized. Click unknown cards to fill in.')

  /**
   * Reset the game to initial state
   */
  const resetGame = useCallback(() => {
    setGameState(initializeGame(gameState.drawMode))
    setUsedCards(new Set())
    setInfoMessage('游戏已初始化。点击未知牌来填充信息。Game initialized. Click unknown cards to fill in.')
  }, [gameState.drawMode])

  /**
   * Change the draw mode
   */
  const changeDrawMode = useCallback((newMode) => {
    setGameState(prev => ({ ...prev, drawMode: newMode }))
    setInfoMessage(`抽牌模式已设置为: ${newMode} 张 | Draw mode set to: ${newMode}`)
  }, [])

  /**
   * Draw cards from stock pile
   */
  const drawCards = useCallback(() => {
    setGameState(prev => {
      if (prev.stock.length === 0) {
        // Reset stock from waste
        return {
          ...prev,
          stock: prev.waste.reverse(),
          waste: [],
          stockIndex: 0
        }
      }

      const drawCount = Math.min(prev.drawMode, prev.stock.length)
      const newStock = [...prev.stock]
      const newWaste = [...prev.waste]

      for (let i = 0; i < drawCount; i++) {
        const card = newStock.pop()
        card.faceUp = true
        newWaste.push(card)
      }

      return {
        ...prev,
        stock: newStock,
        waste: newWaste
      }
    })
  }, [])

  /**
   * Reveal a card by setting its suit and rank
   */
  const revealCard = useCallback((card, suit, rank) => {
    const cardKey = `${suit}-${rank}`
    
    if (usedCards.has(cardKey)) {
      setInfoMessage(`此牌已被使用！Card already used!`)
      return false
    }

    card.suit = suit
    card.rank = rank
    card.known = true
    setUsedCards(prev => new Set([...prev, cardKey]))
    setInfoMessage(`已添加: ${suit} ${rank} | Added: ${suit} ${rank}`)
    
    // Trigger re-render
    setGameState(prev => ({ ...prev }))
    return true
  }, [usedCards])

  /**
   * Get solver hints
   */
  const getHint = useCallback(() => {
    const moves = findValidMoves(gameState)
    if (moves.length > 0) {
      const move = moves[0]
      setInfoMessage(`提示: 从 ${move.from} 移动到 ${move.to} | Hint: Move from ${move.from} to ${move.to}`)
      return move
    } else {
      setInfoMessage('未找到可行的移动 | No valid moves found')
      return null
    }
  }, [gameState])

  /**
   * Run solver to find all valid moves
   */
  const solve = useCallback(() => {
    const moves = findValidMoves(gameState)
    if (moves.length > 0) {
      setInfoMessage(`找到 ${moves.length} 个可能的移动 | Found ${moves.length} possible moves`)
    } else {
      setInfoMessage('未找到可行的移动。尝试翻更多牌！ | No valid moves found. Try drawing more cards!')
    }
    return moves
  }, [gameState])

  return {
    gameState,
    usedCards,
    infoMessage,
    resetGame,
    changeDrawMode,
    drawCards,
    revealCard,
    getHint,
    solve
  }
}
