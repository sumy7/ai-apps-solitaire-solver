import { useRef, useState, ChangeEvent } from 'react'
import { 
  DndContext, 
  DragEndEvent, 
  DragStartEvent, 
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core'
import { useGameState } from './hooks/useGameState'
import Controls from './components/Controls'
import GameBoard from './components/GameBoard'
import CardSelectionModal from './components/CardSelectionModal'
import NewGameModal from './components/NewGameModal'
import Card from './components/Card'
import { Card as CardType, Suit, Rank, SolverStep, SolverStepStatus } from './types'

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

  // 配置拖动传感器，添加激活约束以避免点击和拖动冲突
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 需要移动 8px 才开始拖动
      },
    })
  )

  // Modal states
  const [isSelectionModalOpen, setIsSelectionModalOpen] = useState(false)
  const [editingCard, setEditingCard] = useState<CardType | null>(null)
  
  // Start with New Game modal open if it's a fresh load or upon request
  // However, useGameState initializes with a game effectively immediately.
  // We'll overlay the modal.
  const [isNewGameModalOpen, setIsNewGameModalOpen] = useState(true)

  // Drag state
  type DragSource =
    | { type: 'waste', cards: CardType[] }
    | { type: 'tableau', column: number, startIndex: number, cards: CardType[] }
  const [dragSource, setDragSource] = useState<DragSource | null>(null)
  const [activeCards, setActiveCards] = useState<CardType[]>([])
  const [draggingCardIds, setDraggingCardIds] = useState<Set<string>>(new Set())

  /**
   * Handle card click to open selection modal
   */
  const handleCardRightClick = (card: CardType) => {
    setEditingCard(card)
    setIsSelectionModalOpen(true)
  }

  const handleCardLeftClick = (card: CardType) => {
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

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const data = active.data.current

    if (!data) return

    if (data.type === 'waste') {
      const cards = data.cards as CardType[]
      setDragSource({ type: 'waste', cards })
      setActiveCards(cards)
      setDraggingCardIds(new Set(cards.map(c => c.id)))
    } else if (data.type === 'tableau') {
      const columnCards = gameState.tableau[data.column]
      const moving = columnCards.slice(data.startIndex)

      setDragSource({ 
        type: 'tableau', 
        column: data.column, 
        startIndex: data.startIndex, 
        cards: moving 
      })
      setActiveCards(moving)
      setDraggingCardIds(new Set(moving.map(c => c.id)))
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { over } = event

    const clearDragState = () => {
      setDragSource(null)
      setActiveCards([])
      setDraggingCardIds(new Set())
    }

    if (!over || !dragSource) {
      clearDragState()
      return
    }

    const dropId = over.id as string

    // Handle foundation drops
    if (dropId.startsWith('foundation-')) {
      const index = parseInt(dropId.split('-')[1])
      moveCard(dragSource, { type: 'foundation', index })
    }
    // Handle tableau drops
    else if (dropId.startsWith('tableau-')) {
      const column = parseInt(dropId.split('-')[1])
      // Don't drop on same column if dragging from tableau
      if (dragSource.type === 'tableau' && dragSource.column === column) {
        clearDragState()
        return
      }
      moveCard(dragSource, { type: 'tableau', column })
    }

    clearDragState()
  }

  return (
    <DndContext 
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart} 
      onDragEnd={handleDragEnd}
    >
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
                isDragging={!!dragSource}
                draggingCardIds={draggingCardIds}
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

        {/* Drag Overlay */}
        <DragOverlay dropAnimation={{
          duration: 300,
          easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
        }}>
          {activeCards.length > 0 ? (
            <div className="relative" style={{ width: '80px' }}>
              {activeCards.map((card, index) => (
                <div
                  key={card.id}
                  className="absolute transition-all duration-100"
                  style={{ 
                    top: `${index * 30}px`,
                    zIndex: index,
                  }}
                >
                  <Card card={card} className="rotate-2 shadow-2xl" />
                </div>
              ))}
            </div>
          ) : null}
        </DragOverlay>

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
          canCancel={true}
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
    </DndContext>
  )
}

export default App
