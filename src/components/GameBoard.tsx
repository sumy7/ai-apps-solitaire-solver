import Card from './Card'
import Pile from './Pile'
import TableauColumn from './TableauColumn'
import { GameState, Card as CardType } from '../types'

interface GameBoardProps {
  gameState: GameState
  onStockClick: () => void
  onCardLeftClick: (card: CardType) => void
  onCardRightClick: (card: CardType) => void
  onDragStart: (card: CardType, source: { type: 'waste' } | { type: 'tableau', column: number, startIndex: number }) => void
  onDragEnd: () => void
  onDropFoundation: (index: number) => void
  onDropTableau: (index: number) => void
  isDragging: boolean
}

/**
 * GameBoard component - Main game board with all piles
 */
const GameBoard = ({ gameState, onStockClick, onCardLeftClick, onCardRightClick, onDragStart, onDragEnd, onDropFoundation, onDropTableau, isDragging }: GameBoardProps) => {
  const wasteToShow = gameState.waste.slice(-3)

  return (
    <div className="bg-black/20 p-6 rounded-xl min-h-[600px]">
      {/* Top area: Stock, Waste, and Foundations */}
      <div className="flex justify-between mb-10">
        {/* Stock and Waste */}
        <div className="flex gap-4">
          <Pile label={`库存 Stock (${gameState.stock.length})`} allowDrop={false}>
            {gameState.stock.length > 0 ? (
              <Card
                card={gameState.stock[gameState.stock.length - 1]}
                onClick={onStockClick}
                className="absolute top-0 left-0"
              />
            ) : gameState.waste.length > 0 ? (
              <button
                onClick={onStockClick}
                className="absolute inset-0 flex items-center justify-center gap-2 rounded-lg text-xl font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 shadow-inner hover:bg-emerald-100 active:scale-95 transition-all"
                aria-label="回收废牌到库存 (Recycle waste to stock)"
              >
                <span aria-hidden>♻️</span>
                <span className="text-sm font-semibold text-emerald-700">回收</span>
              </button>
            ) : null}
          </Pile>
          <Pile label={`废牌堆 Waste (${gameState.waste.length})`} allowDrop={false}>
            {wasteToShow.map((card, idx) => (
              <div
                key={card.id}
                className="absolute"
                style={{ left: `${idx * 12}px`, top: `${idx * -3}px` }}
              >
                <Card
                  card={card}
                  onClick={() => onCardLeftClick(card)}
                  onContextMenu={() => onCardRightClick(card)}
                  draggable={card.faceUp && card.known}
                  onDragStart={card.faceUp && card.known ? (event) => { event.dataTransfer.effectAllowed = 'move'; onDragStart(card, { type: 'waste' }) } : undefined}
                  onDragEnd={card.faceUp && card.known ? onDragEnd : undefined}
                  className="shadow-lg"
                />
              </div>
            ))}
          </Pile>
        </div>

        {/* Foundations */}
        <div className="flex gap-4">
          <Pile
            label="红桃 ♥"
            symbol="♥"
            allowDrop={isDragging}
            onDrop={() => onDropFoundation(0)}
          >
            {gameState.foundations[0].length > 0 && (
              <Card
                card={gameState.foundations[0][gameState.foundations[0].length - 1]}
                className="absolute top-0 left-0"
              />
            )}
          </Pile>
          <Pile
            label="方片 ♦"
            symbol="♦"
            allowDrop={isDragging}
            onDrop={() => onDropFoundation(1)}
          >
            {gameState.foundations[1].length > 0 && (
              <Card
                card={gameState.foundations[1][gameState.foundations[1].length - 1]}
                className="absolute top-0 left-0"
              />
            )}
          </Pile>
          <Pile
            label="梅花 ♣"
            symbol="♣"
            allowDrop={isDragging}
            onDrop={() => onDropFoundation(2)}
          >
            {gameState.foundations[2].length > 0 && (
              <Card
                card={gameState.foundations[2][gameState.foundations[2].length - 1]}
                className="absolute top-0 left-0"
              />
            )}
          </Pile>
          <Pile
            label="黑桃 ♠"
            symbol="♠"
            allowDrop={isDragging}
            onDrop={() => onDropFoundation(3)}
          >
            {gameState.foundations[3].length > 0 && (
              <Card
                card={gameState.foundations[3][gameState.foundations[3].length - 1]}
                className="absolute top-0 left-0"
              />
            )}
          </Pile>
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
            allowDrop={isDragging}
            onDrop={() => onDropTableau(index)}
            onDragStartCard={(card, cardIndex) => onDragStart(card, { type: 'tableau', column: index, startIndex: cardIndex })}
            onDragEndCard={onDragEnd}
          />
        ))}
      </div>
    </div>
  )
}

export default GameBoard
