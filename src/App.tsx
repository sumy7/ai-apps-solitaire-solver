import { useRef, useState, ChangeEvent } from 'react'
import { useGameState } from './hooks/useGameState'
import Controls from './components/Controls'
import GameBoard from './components/GameBoard'
import CardSelectionModal from './components/CardSelectionModal'
import NewGameModal from './components/NewGameModal'
import { Card, Suit, Rank, SolverStep, SolverStepStatus } from './types'
import { SUITS, RANK_VALUES } from './constants/gameConstants'

const statusBadge: Record<SolverStepStatus, string> = {
  start: 'bg-slate-700 text-white',
  move: 'bg-emerald-700 text-white',
  draw: 'bg-blue-700 text-white',
  blocked: 'bg-amber-700 text-white',
  solved: 'bg-purple-700 text-white'
}

const SolverStepsPanel = ({
  steps,
  activeId,
  onSelect
}: {
  steps: SolverStep[]
  activeId: number | null
  onSelect: (id: number) => void
}) => {
  return (
    <div className="bg-white/10 border border-white/10 rounded-xl p-4 backdrop-blur-sm h-full">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white font-semibold text-lg">求解步骤</h3>
        <span className="text-white/70 text-sm">{steps.length ? `${steps.length - 1} 步` : '等待求解'}</span>
      </div>

      <div className="space-y-2 max-h-[640px] overflow-y-auto pr-1">
        {steps.length === 0 && (
          <p className="text-white/60 text-sm leading-relaxed">
            点击“求解”后，系统会自动尝试移动/翻牌并在此记录每一步。点击任何步骤可回放到当时的棋盘状态。
          </p>
        )}

        {steps.map(step => (
          <button
            key={step.id}
            onClick={() => onSelect(step.id)}
            className={`w-full text-left p-3 rounded-lg border transition-colors ${
              activeId === step.id
                ? 'border-emerald-400/70 bg-emerald-400/10'
                : 'border-white/10 bg-white/5 hover:border-white/30'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-white/80 text-sm font-mono">#{step.id}</span>
                <span className="text-white font-semibold">{step.title}</span>
              </div>
              <span className={`px-2 py-0.5 text-xs rounded-full ${statusBadge[step.status]}`}>
                {step.status === 'start' && '开始'}
                {step.status === 'move' && '移动'}
                {step.status === 'draw' && '翻牌'}
                {step.status === 'blocked' && '暂停'}
                {step.status === 'solved' && '完成'}
              </span>
            </div>
            {step.detail && <p className="text-white/70 text-sm mt-1 leading-snug">{step.detail}</p>}
          </button>
        ))}
      </div>
    </div>
  )
}

/**
 * Main App component
 * Manages the overall solitaire solver application
 */
function App() {
  const {
    gameState,
    usedCards,
    infoMessage,
    resetGame,
    changeDrawMode,
    drawCards,
    revealCard,
    getHint,
    solve,
    autoMoveCard,
    moveCard,
    solverSteps,
    activeSolverStepId,
    restoreSolverStep,
    exportGameState,
    importGameState
  } = useGameState()

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Modal states
  const [isSelectionModalOpen, setIsSelectionModalOpen] = useState(false)
  const [editingCard, setEditingCard] = useState<Card | null>(null)
  
  // Start with New Game modal open if it's a fresh load or upon request
  // However, useGameState initializes with a game effectively immediately.
  // We'll overlay the modal.
  const [isNewGameModalOpen, setIsNewGameModalOpen] = useState(true)

  // Drag state
  type DragSource =
    | { type: 'waste', cards: Card[] }
    | { type: 'tableau', column: number, startIndex: number, cards: Card[] }
  const [dragSource, setDragSource] = useState<DragSource | null>(null)

  /**
   * Handle card click to open selection modal
   */
  const handleCardRightClick = (card: Card) => {
    setEditingCard(card)
    setIsSelectionModalOpen(true)
  }

  const handleCardLeftClick = (card: Card) => {
    autoMoveCard(card)
  }

  /**
   * Handle selection from the modal
   */
  const handleCardSelect = (suit: Suit, rank: Rank) => {
    if (editingCard) {
      if (revealCard(editingCard, suit, rank)) {
        setIsSelectionModalOpen(false)
        setEditingCard(null)
      }
    }
  }

  /**
   * Handle Starting a New Game (from Modal)
   */
  const handleStartNewGame = (mode: number) => {
    // Always reinitialize to clear all markings and reset board layout
    changeDrawMode(mode)
    setIsNewGameModalOpen(false)
  }

  /**
   * Handle "New Game" button click
   */
  const handleNewGameClick = () => {
    setIsNewGameModalOpen(true)
  }

  const handleExportState = () => {
    const data = exportGameState()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `solitaire-state-${timestamp}.json`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  const handleImportRequest = () => {
    fileInputRef.current?.click()
  }

  const handleImportFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    file
      .text()
      .then(text => {
        const result = importGameState(text)
        if (!result.ok && result.error) {
          window.alert(`导入失败: ${result.error}`)
          return
        }
        setIsNewGameModalOpen(false)
      })
      .catch(() => {
        window.alert('导入失败：无法读取文件。')
      })
      .finally(() => {
        event.target.value = ''
      })
  }

  const handleDragStart = (card: Card, source: { type: 'waste' } | { type: 'tableau', column: number, startIndex: number }) => {
    if (!card.faceUp || !card.known || !card.rank || !card.suit) return

    if (source.type === 'waste') {
      setDragSource({ type: 'waste', cards: [card] })
      return
    }

    const columnCards = gameState.tableau[source.column]
    const moving = columnCards.slice(source.startIndex)

    // moving run already validated in TableauColumn, but double-check
    const isValid = moving.every((c, idx) => {
      if (!c.faceUp || !c.known || !c.rank || !c.suit) return false
      if (idx === moving.length - 1) return true
      const next = moving[idx + 1]
      if (!next.faceUp || !next.known || !next.rank || !next.suit) return false
      return SUITS[c.suit].color !== SUITS[next.suit].color && RANK_VALUES[c.rank] === RANK_VALUES[next.rank] + 1
    })

    if (!isValid) return

    setDragSource({ type: 'tableau', column: source.column, startIndex: source.startIndex, cards: moving })
  }

  const handleDragEnd = () => {
    setDragSource(null)
  }

  const handleDropFoundation = (index: number) => {
    if (!dragSource) return
    moveCard(dragSource, { type: 'foundation', index })
    setDragSource(null)
  }

  const handleDropTableau = (column: number) => {
    if (!dragSource) return
    if (dragSource.type === 'tableau' && dragSource.column === column) {
      setDragSource(null)
      return
    }
    moveCard(dragSource, { type: 'tableau', column })
    setDragSource(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-felt-dark to-felt-light p-6 relative">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="text-center mb-6">
          <h1 className="text-5xl font-bold text-white mb-3 drop-shadow-lg">
            🃏 Solitaire Solver 纸牌求解器
          </h1>
        </header>

        {/* Controls */}
        <Controls
          onNewGame={handleNewGameClick}
          onSolve={solve}
          onHint={getHint}
          onReset={resetGame}  // "Reset" button just resets current game
          onExport={handleExportState}
          onImport={handleImportRequest}
          gameMode={gameState.drawMode}
        />

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 space-y-4">
            <GameBoard
              gameState={gameState}
              onStockClick={drawCards}
              onCardLeftClick={handleCardLeftClick}
              onCardRightClick={handleCardRightClick}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDropFoundation={handleDropFoundation}
              onDropTableau={handleDropTableau}
              isDragging={!!dragSource}
            />

            <div className="p-4 bg-gradient-to-r from-white/10 to-white/5 rounded-xl text-center text-white backdrop-blur-sm border border-white/10 shadow-xl">
              <p className="text-sm md:text-base font-medium">ℹ️ {infoMessage}</p>
            </div>
          </div>

          <div className="w-full lg:w-80 xl:w-96">
            <SolverStepsPanel
              steps={solverSteps}
              activeId={activeSolverStepId}
              onSelect={restoreSolverStep}
            />
          </div>
        </div>
      </div>

      {/* Modals */}
      <CardSelectionModal
        isOpen={isSelectionModalOpen}
        onClose={() => setIsSelectionModalOpen(false)}
        onSelect={handleCardSelect}
        usedCards={usedCards}
      />
      
      <NewGameModal 
        isOpen={isNewGameModalOpen}
        onStartGame={handleStartNewGame}
        canCancel={!isNewGameModalOpen} // Can't cancel if it's the initial load
        // Actually, if we are already playing, we can cancel "New Game" action.
        // We need a state tracking if game is valid.
        // Simplified: If there are cards on board, we can cancel.
        // But simpler: just always allow cancel if we passed a boolean prop "hasActiveGame".
        // Let's pass `true` for canCancel usually, unless it's first load.
        // But how to track first load? 
        // We'll rely on the fact that if they close it without starting, nothing happens.
        onCancel={() => setIsNewGameModalOpen(false)}
      />

      <input
        ref={fileInputRef}
        type="file"
        accept="application/json"
        className="hidden"
        onChange={handleImportFile}
      />
    </div>
  )
}

export default App
