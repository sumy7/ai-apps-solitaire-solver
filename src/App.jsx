import { useGameState } from './hooks/useGameState'
import Controls from './components/Controls'
import GameBoard from './components/GameBoard'
import { SUITS, RANKS } from './constants/gameConstants'

/**
 * Main App component
 * Manages the overall solitaire solver application
 */
function App() {
  const {
    gameState,
    infoMessage,
    resetGame,
    changeDrawMode,
    drawCards,
    revealCard,
    getHint,
    solve
  } = useGameState()

  /**
   * Handle card revelation dialog
   * Shows prompts to select suit and rank for unknown cards
   */
  const handleCardClick = (card) => {
    // Prompt for suit
    const suitInput = prompt(
      '选择花色 Choose suit:\n1 = ♥ hearts\n2 = ♦ diamonds\n3 = ♣ clubs\n4 = ♠ spades'
    )
    if (!suitInput) return

    let suit
    if (suitInput === '1') suit = 'hearts'
    else if (suitInput === '2') suit = 'diamonds'
    else if (suitInput === '3') suit = 'clubs'
    else if (suitInput === '4') suit = 'spades'
    else {
      alert('无效的花色！Invalid suit!')
      return
    }

    // Prompt for rank
    const rankInput = prompt(
      '选择点数 Choose rank:\nA, 2, 3, 4, 5, 6, 7, 8, 9, 10, J, Q, K'
    )
    if (!rankInput) return

    const rank = rankInput.toUpperCase()
    if (!RANKS.includes(rank)) {
      alert('无效的点数！Invalid rank!')
      return
    }

    revealCard(card, suit, rank)
  }

  /**
   * Handle reset with confirmation
   */
  const handleReset = () => {
    if (confirm('确定要重置游戏吗？所有进度将丢失。Reset game? All progress will be lost.')) {
      resetGame()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-felt-dark to-felt-light p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="text-center mb-6">
          <h1 className="text-5xl font-bold text-white mb-3 drop-shadow-lg">
            🃏 Solitaire Solver 纸牌求解器
          </h1>
        </header>

        {/* Controls */}
        <Controls
          onNewGame={resetGame}
          onSolve={solve}
          onHint={getHint}
          onReset={handleReset}
          drawMode={gameState.drawMode}
          onDrawModeChange={changeDrawMode}
        />

        {/* Game Board */}
        <GameBoard
          gameState={gameState}
          onStockClick={drawCards}
          onCardClick={handleCardClick}
        />

        {/* Info Message */}
        <div className="mt-6 p-4 bg-white/10 rounded-xl text-center text-white">
          {infoMessage}
        </div>
      </div>
    </div>
  )
}

export default App
