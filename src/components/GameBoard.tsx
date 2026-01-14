import Card from './Card'
import Pile from './Pile'
import TableauColumn from './TableauColumn'
import { GameState, Card as CardType } from '../types'

interface GameBoardProps {
  gameState: GameState
  onStockClick: () => void
  onCardLeftClick: (card: CardType) => void
  onCardRightClick: (card: CardType) => void
  isDragging: boolean
  draggingCardIds: Set<string>
}

// Foundation pile configuration
const FOUNDATIONS = [
  { label: '红桃 ♥', symbol: '♥' },
  { label: '方片 ♦', symbol: '♦' },
  { label: '梅花 ♣', symbol: '♣' },
  { label: '黑桃 ♠', symbol: '♠' }
] as const

/**
 * GameBoard component - Main game board with all piles
 */
const GameBoard = ({ gameState, onStockClick, onCardLeftClick, onCardRightClick, isDragging, draggingCardIds }: GameBoardProps) => {
  const wasteToShow = gameState.waste.slice(-3)

  return (
    <div className="bg-black/20 p-6 rounded-xl min-h-[600px] backdrop-blur-sm border border-white/5 shadow-2xl">
      {/* Top area: Stock, Waste, and Foundations */}
      <div className="flex justify-between mb-10">
        {/* Stock and Waste */}
        <div className="flex gap-4">
          <Pile id="stock" label={`库存 Stock (${gameState.stock.length})`} disabled>
            {gameState.stock.length > 0 ? (
              <Card
                card={gameState.stock[gameState.stock.length - 1]}
                onClick={onStockClick}
                className="absolute top-0 left-0"
              />
            ) : gameState.waste.length > 0 ? (
              <button
                onClick={onStockClick}
                className="absolute inset-0 flex items-center justify-center gap-2 rounded-lg text-xl font-bold text-emerald-600 bg-gradient-to-br from-emerald-50 to-emerald-100 border-2 border-emerald-300 shadow-lg hover:from-emerald-100 hover:to-emerald-200 active:scale-95 transition-all hover:border-emerald-400"
                aria-label="回收废牌到库存 (Recycle waste to stock)"
              >
                <span aria-hidden className="text-2xl">♻️</span>
                <span className="text-sm font-bold text-emerald-700">回收</span>
              </button>
            ) : null}
          </Pile>
          <Pile id="waste" label={`废牌堆 Waste (${gameState.waste.length})`} disabled>
            {wasteToShow.map((card, idx) => {
              const isCardDragging = draggingCardIds.has(card.id)
              return (
                <div
                  key={card.id}
                  className={`absolute transition-all duration-200 ${isCardDragging ? 'opacity-0' : ''}`}
                  style={{ left: `${idx * 12}px`, top: `${idx * -3}px`, zIndex: idx }}
                >
                  <Card
                    card={card}
                    onClick={() => onCardLeftClick(card)}
                    onContextMenu={() => onCardRightClick(card)}
                    draggable={card.faceUp && card.known && !isCardDragging}
                    dragData={card.faceUp && card.known ? { type: 'waste', cards: [card] } : undefined}
                    className="shadow-lg"
                  />
                </div>
              )
            })}
          </Pile>
        </div>

        {/* Foundations */}
        <div className="flex gap-4">
          {FOUNDATIONS.map((foundation, index) => {
            const topCard = gameState.foundations[index].length > 0
              ? gameState.foundations[index][gameState.foundations[index].length - 1]
              : null

            return (
              <Pile
                key={`foundation-${index}`}
                id={`foundation-${index}`}
                label={foundation.label}
                symbol={foundation.symbol}
                disabled={!isDragging}
              >
                {topCard && (
                  <Card
                    card={topCard}
                    className="absolute top-0 left-0"
                  />
                )}
              </Pile>
            )
          })}
        </div>
      </div>

      {/* Tableau - 7 columns */}
      <div className="flex gap-4 justify-center">
        {gameState.tableau.map((column, index) => (
          <TableauColumn
            key={index}
            columnIndex={index}
            cards={column}
            onCardLeftClick={onCardLeftClick}
            onCardRightClick={onCardRightClick}
            id={`tableau-${index}`}
            disabled={!isDragging}
            draggingCardIds={draggingCardIds}
          />
        ))}
      </div>
    </div>
  )
}

export default GameBoard
