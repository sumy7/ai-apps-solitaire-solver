import { useState, useCallback } from 'react'
import { initializeGame, findValidMoves, canPlaceOnFoundation, canPlaceOnTableau } from '../utils/gameLogic'
import { DRAW_MODES, RANK_VALUES, SUIT_TO_INDEX, SUITS } from '../constants/gameConstants'
import { Card, GameState, Rank, Suit, SolverStep, SolverStepStatus } from '../types'
import {
  applyMoveInPlace,
  cloneGameState,
  computeUsedCards,
  describeCard,
  describeMove,
  drawFromStockInPlace,
  findFirstFaceUpUnknown,
  normalizeGameState,
  stateSignature
} from '../utils/gameStateUtils'

const isSolved = (state: GameState) => state.foundations.every(pile => pile.length === 13)

/**
 * Custom hook for managing the solitaire game state
 * Handles all game logic including card management, moves, and solver
 * @param {number} initialDrawMode - Initial draw mode (1 or 3)
 * @returns {Object} Game state and methods
 */
export const useGameState = (initialDrawMode: number = DRAW_MODES.ONE) => {
  const [gameState, setGameState] = useState<GameState>(() => initializeGame(initialDrawMode))
  const [usedCards, setUsedCards] = useState<Set<string>>(new Set())
  const [infoMessage, setInfoMessage] = useState<string>('游戏已初始化。点击未知牌来填充信息。Game initialized. Click unknown cards to fill in.')
  const [solverSteps, setSolverSteps] = useState<SolverStep[]>([])
  const [activeSolverStepId, setActiveSolverStepId] = useState<number | null>(null)

  const clearSolverSteps = useCallback(() => {
    setSolverSteps([])
    setActiveSolverStepId(null)
  }, [])

  /**
   * Reset the game to initial state
   */
  const resetGame = useCallback(() => {
    clearSolverSteps()

    setGameState(prev => {
      const drawMode = prev.drawMode
      const allCards = [
        ...prev.stock,
        ...prev.waste,
        ...prev.foundations.flat(),
        ...prev.tableau.flat()
      ]

      const maxStockIndex = allCards.reduce((max, card) => {
        return card.initialPosition.pile === 'stock'
          ? Math.max(max, card.initialPosition.index)
          : max
      }, 0)

      const tableauHeights = allCards.reduce((acc, card) => {
        if (card.initialPosition.pile === 'tableau') {
          const { column, row } = card.initialPosition
          acc[column] = Math.max(acc[column] ?? 0, row + 1)
        }
        return acc
      }, Array.from({ length: 7 }, (_, col) => col + 1))

      const nextStockSlots: Array<Card | undefined> = Array(maxStockIndex + 1).fill(undefined)
      const nextTableauSlots: Array<Array<Card | undefined>> = tableauHeights.map(height =>
        Array(height).fill(undefined)
      )

      allCards.forEach(card => {
        const pos = card.initialPosition
        const resetCard: Card = {
          ...card,
          faceUp: pos.faceUp
        }

        if (pos.pile === 'stock') {
          nextStockSlots[pos.index] = resetCard
        } else {
          nextTableauSlots[pos.column][pos.row] = resetCard
        }
      })

      const next: GameState = {
        stock: nextStockSlots.filter((c): c is Card => Boolean(c)),
        waste: [],
        foundations: [[], [], [], []],
        tableau: nextTableauSlots.map(col => col.filter((c): c is Card => Boolean(c))),
        drawMode,
        stockIndex: 0
      }

      const updatedUsed = computeUsedCards(next)
      setUsedCards(updatedUsed)
      setInfoMessage('棋盘已重置，已标注的花色保留。Board reset; marked cards kept.')
      return next
    })
  }, [clearSolverSteps])

  /**
   * Change the draw mode and reset the game immediately
   */
  const changeDrawMode = useCallback((newMode: number) => {
    clearSolverSteps()
    setGameState(initializeGame(newMode))
    setUsedCards(new Set())
    setInfoMessage(`新游戏开始！抽牌模式: ${newMode} 张 | New Game Started! Draw mode: ${newMode}`)
  }, [clearSolverSteps])

  const exportGameState = useCallback(() => {
    const payload = {
      version: 1,
      gameState
    }
    return JSON.stringify(payload, null, 2)
  }, [gameState])

  const importGameState = useCallback((raw: string) => {
    try {
      const parsed = JSON.parse(raw)
      const candidate = parsed?.gameState ?? parsed
      const normalized = normalizeGameState(candidate)

      clearSolverSteps()
      setGameState(normalized)
      const updatedUsed = computeUsedCards(normalized)
      setUsedCards(updatedUsed)
      setInfoMessage('棋局已导入完成。Imported game state applied.')
      return { ok: true as const }
    } catch (error) {
      const message = error instanceof Error ? error.message : '未知错误'
      setInfoMessage(`导入失败: ${message}`)
      return { ok: false as const, error: message }
    }
  }, [clearSolverSteps])

  /**
   * Draw cards from stock pile
   */
  const drawCards = useCallback(() => {
    clearSolverSteps()
    setGameState(prev => {
      if (prev.stock.length === 0) {
        // Reset stock from waste
        return {
          ...prev,
          stock: [...prev.waste].reverse(),
          waste: [],
          stockIndex: 0
        }
      }

      const drawCount = Math.min(prev.drawMode, prev.stock.length)
      const newStock = [...prev.stock]
      const newWaste = [...prev.waste]

      for (let i = 0; i < drawCount; i++) {
        const card = newStock.pop()
        if (card) {
          card.faceUp = true
          newWaste.push(card)
        }
      }

      return {
        ...prev,
        stock: newStock,
        waste: newWaste
      }
    })
  }, [clearSolverSteps])

  /**
   * Reveal a card by setting its suit and rank
   */
  const revealCard = useCallback((card: Card, suit: Suit, rank: Rank) => {
    const newKey = `${suit}-${rank}`
    const prevKey = card.suit && card.rank ? `${card.suit}-${card.rank}` : null

    // 如果该点数已被其他牌占用（并且不是自己原来的值），拒绝
    if (usedCards.has(newKey) && newKey !== prevKey) {
      setInfoMessage(`此牌组合已被使用 (${suit} ${rank})，请选择其他点数。`)
      return false
    }

    card.suit = suit
    card.rank = rank
    card.known = true

    clearSolverSteps()

    setGameState(prev => {
      const next = { ...prev }
      const updatedUsed = computeUsedCards(next)
      setUsedCards(updatedUsed)
      setInfoMessage(`已记录: ${suit} ${rank} | Recorded: ${suit} ${rank}`)
      return next
    })

    return true
  }, [clearSolverSteps, usedCards])

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
   * Run DFS solver; returns the explored path (success, blocked, or unknown stop)
   */
  const solve = useCallback(() => {
    clearSolverSteps()

    const start = cloneGameState(gameState)
    const visited = new Set<string>()
    const startSig = stateSignature(start)
    visited.add(startSig)

    const createStep = (snapshot: GameState, title: string, detail: string, status: SolverStepStatus, id: number): SolverStep => ({
      id,
      title,
      detail,
      snapshot: cloneGameState(snapshot),
      status
    })

    const orderMoves = (moves: ReturnType<typeof findValidMoves>) => {
      // Prioritize foundation moves, then tableau moves
      return [...moves].sort((a, b) => {
        const score = (m: typeof a) => m.to.startsWith('foundation-') ? 0 : 1
        return score(a) - score(b)
      })
    }

    const MAX_DEPTH = 600

    const dfs = (state: GameState, path: SolverStep[], depth: number): SolverStep[] | null => {
      if (depth > MAX_DEPTH) {
        return [...path, createStep(state, '达到深度上限', 'DFS 防护触发，停止搜索。', 'blocked', path.length)]
      }

      if (isSolved(state)) {
        return [...path, createStep(state, '完成！', '所有牌已归入基础堆。', 'solved', path.length)]
      }

      const unknown = findFirstFaceUpUnknown(state)
      if (unknown) {
        return [...path, createStep(state, '遇到未标注的翻开牌', `${unknown.location} 出现 ${describeCard(unknown.card)}，需要先标注。`, 'blocked', path.length)]
      }

      const moves = orderMoves(findValidMoves(state))
      for (const move of moves) {
        const next = cloneGameState(state)
        applyMoveInPlace(next, move)
        const sig = stateSignature(next)
        if (visited.has(sig)) continue
        visited.add(sig)

        const step = createStep(next, '移动', describeMove(move.from, move.to, move.card), 'move', path.length)
        const result = dfs(next, [...path, step], depth + 1)
        if (result) return result
      }

      const drawn = cloneGameState(state)
      const drawResult = drawFromStockInPlace(drawn)
      if (drawResult.drew) {
        const sig = stateSignature(drawn)
        if (!visited.has(sig)) {
          visited.add(sig)
          const title = drawResult.recycled ? '回收废牌到库存' : '翻牌'
          const step = createStep(drawn, title, `库存: ${drawn.stock.length} | 废牌: ${drawn.waste.length}`, 'draw', path.length)
          const result = dfs(drawn, [...path, step], depth + 1)
          if (result) return result
        }
      }

      return [...path, createStep(state, '无可行步', '需要玩家继续标注或操作。', 'blocked', path.length)]
    }

    const path = dfs(start, [createStep(start, '起始状态', '当前棋盘', 'start', 0)], 0)
    const finalSteps = path ?? [createStep(start, '求解失败', '未找到路径。', 'blocked', 0)]

    setSolverSteps(finalSteps)
    setActiveSolverStepId(finalSteps[finalSteps.length - 1]?.id ?? null)
    const finalState = cloneGameState(finalSteps[finalSteps.length - 1]?.snapshot ?? start)
    setGameState(finalState)
    setUsedCards(computeUsedCards(finalState))

    const last = finalSteps[finalSteps.length - 1]
    const message = last.status === 'solved'
      ? 'DFS 求解完成！所有可用牌已归位。'
      : last.title
    setInfoMessage(message)

    return finalSteps
  }, [clearSolverSteps, gameState])

  type MoveSource =
    | { type: 'waste', cards: Card[] }
    | { type: 'tableau', column: number, startIndex: number, cards: Card[] }
  type MoveTarget = { type: 'foundation', index: number } | { type: 'tableau', column: number }

  const moveCard = useCallback((source: MoveSource, target: MoveTarget): boolean => {
    let moved = false
    clearSolverSteps()
    setGameState(prev => {
      const next: GameState = {
        ...prev,
        stock: [...prev.stock],
        waste: [...prev.waste],
        foundations: prev.foundations.map(f => [...f]),
        tableau: prev.tableau.map(col => [...col])
      }

      const movingCards = source.cards
      if (movingCards.length === 0) return prev

      if (target.type === 'foundation' && movingCards.length > 1) {
        setInfoMessage('基础堆一次只能放一张牌。')
        return prev
      }

      const ensureSourceRemoval = () => {
        if (source.type === 'waste') {
          for (let i = 0; i < movingCards.length; i++) {
            next.waste.pop()
          }
        } else {
          next.tableau[source.column] = next.tableau[source.column].slice(0, source.startIndex)
          const col = next.tableau[source.column]
          if (col.length > 0) {
            col[col.length - 1].faceUp = true
          }
        }
      }

      const restoreSource = () => {
        if (source.type === 'waste') {
          next.waste.push(...movingCards)
        } else {
          next.tableau[source.column].push(...movingCards)
        }
      }

      // validate source still matches movingCards
      if (source.type === 'waste') {
        const slice = next.waste.slice(-movingCards.length)
        if (slice.length !== movingCards.length || slice.some((c, idx) => c.id !== movingCards[idx].id)) {
          setInfoMessage('拖拽的牌已变化，移动取消。')
          return prev
        }
      } else {
        const slice = next.tableau[source.column].slice(source.startIndex)
        if (slice.length !== movingCards.length || slice.some((c, idx) => c.id !== movingCards[idx].id)) {
          setInfoMessage('拖拽的牌已变化，移动取消。')
          return prev
        }
      }

      const leadCard = movingCards[0]
      if (!leadCard.faceUp || !leadCard.known || !leadCard.rank || !leadCard.suit) {
        setInfoMessage('这组牌未标注完整，无法移动。')
        return prev
      }

      if (target.type === 'foundation') {
        const foundation = next.foundations[target.index]
        if (!canPlaceOnFoundation(leadCard, foundation)) {
          setInfoMessage('该牌无法放入该基础堆。')
          return prev
        }
        ensureSourceRemoval()
        foundation.push(leadCard)
      } else {
        if (source.type === 'tableau' && source.column === target.column) {
          return prev
        }
        const col = next.tableau[target.column]
        if (!canPlaceOnTableau(leadCard, col)) {
          setInfoMessage('该牌无法放入该列。')
          return prev
        }
        ensureSourceRemoval()
        col.push(...movingCards)
      }

      moved = true
      setInfoMessage('移动完成。')
      return next
    })

    return moved
  }, [clearSolverSteps])

  const buildTableauRun = (column: Card[], startIndex: number): Card[] | null => {
    if (startIndex < 0 || startIndex >= column.length) return null
    const run = column.slice(startIndex)
    if (run.length === 0) return null

    for (let i = 0; i < run.length; i++) {
      const card = run[i]
      if (!card.faceUp || !card.known || !card.rank || !card.suit) return null
      if (i < run.length - 1) {
        const next = run[i + 1]
        if (!next.faceUp || !next.known || !next.rank || !next.suit) return null
        const colorDiffers = SUITS[card.suit].color !== SUITS[next.suit].color
        const isDescending = RANK_VALUES[card.rank] === RANK_VALUES[next.rank] + 1
        if (!colorDiffers || !isDescending) return null
      }
    }

    return run
  }

  const findCardLocation = (state: GameState, cardId: string) => {
    const wasteIndex = state.waste.findIndex(c => c.id === cardId)
    if (wasteIndex !== -1) return { type: 'waste' as const, index: wasteIndex }

    for (let col = 0; col < state.tableau.length; col++) {
      const row = state.tableau[col].findIndex(c => c.id === cardId)
      if (row !== -1) return { type: 'tableau' as const, column: col, row }
    }

    return null
  }

  const autoMoveCard = useCallback((card: Card): boolean => {
    clearSolverSteps()

    if (!card.faceUp) {
      setInfoMessage('请先翻开这张牌。')
      return false
    }

    if (!card.known || !card.rank || !card.suit) {
      setInfoMessage('请先右键标注该牌。')
      return false
    }

    const location = findCardLocation(gameState, card.id)
    if (!location) {
      setInfoMessage('无法定位该牌，操作取消。')
      return false
    }

    let movingCards: Card[] = []
    let source: MoveSource

    if (location.type === 'waste') {
      if (location.index !== gameState.waste.length - 1) {
        setInfoMessage('只能移动废牌堆顶部的牌。')
        return false
      }
      movingCards = [card]
      source = { type: 'waste', cards: movingCards }
    } else {
      const run = buildTableauRun(gameState.tableau[location.column], location.row)
      if (!run) {
        setInfoMessage('该序列不满足移动规则。')
        return false
      }
      movingCards = run
      source = { type: 'tableau', column: location.column, startIndex: location.row, cards: movingCards }
    }

    const tryFoundationFirst = () => {
      const suitIndex = SUIT_TO_INDEX[card.suit!]
      const foundation = gameState.foundations[suitIndex]
      if (canPlaceOnFoundation(card, foundation)) {
        return moveCard(source, { type: 'foundation', index: suitIndex })
      }
      return false
    }

    const tryTableauLeftToRight = () => {
      for (let col = 0; col < gameState.tableau.length; col++) {
        if (source.type === 'tableau' && col === source.column) continue
        const targetCol = gameState.tableau[col]
        if (canPlaceOnTableau(movingCards[0], targetCol)) {
          return moveCard(source, { type: 'tableau', column: col })
        }
      }
      return false
    }

    if (movingCards.length === 1) {
      if (tryFoundationFirst()) return true
      if (tryTableauLeftToRight()) return true
      setInfoMessage('未找到可放置该牌的位置。')
      return false
    }

    if (tryTableauLeftToRight()) return true
    setInfoMessage('未找到可放置该序列的牌堆。')
    return false
  }, [clearSolverSteps, gameState, moveCard])

  const restoreSolverStep = useCallback((stepId: number) => {
    const step = solverSteps.find(item => item.id === stepId)
    if (!step) return false

    const snapshot = cloneGameState(step.snapshot)
    setGameState(snapshot)
    setUsedCards(computeUsedCards(snapshot))
    setActiveSolverStepId(stepId)
    setInfoMessage(`已回到步骤 #${stepId}: ${step.title}`)
    return true
  }, [solverSteps])

  return {
    gameState,
    usedCards,
    infoMessage,
    resetGame,
    changeDrawMode,
    drawCards,
    revealCard,
    getHint,
    solve,
    moveCard,
    autoMoveCard,
    exportGameState,
    importGameState,
    solverSteps,
    activeSolverStepId,
    restoreSolverStep
  }
}
