import Card from './Card'
import Pile from './Pile'
import TableauColumn from './TableauColumn'

/**
 * GameBoard component - Main game board with all piles
 * @param {Object} props - Component props
 * @param {Object} props.gameState - Current game state
 * @param {Function} props.onStockClick - Handler for stock pile clicks
 * @param {Function} props.onCardClick - Handler for card clicks (revealing)
 */
const GameBoard = ({ gameState, onStockClick, onCardClick }) => {
  return (
    <div className="bg-black/20 p-6 rounded-xl min-h-[600px]">
      {/* Top area: Stock, Waste, and Foundations */}
      <div className="flex justify-between mb-10">
        {/* Stock and Waste */}
        <div className="flex gap-4">
          <Pile label="库存 Stock">
            {gameState.stock.length > 0 && (
              <Card
                card={gameState.stock[gameState.stock.length - 1]}
                onClick={onStockClick}
                className="absolute top-0 left-0"
              />
            )}
          </Pile>
          <Pile label="废牌堆 Waste">
            {gameState.waste.length > 0 && (
              <Card
                card={gameState.waste[gameState.waste.length - 1]}
                onClick={
                  !gameState.waste[gameState.waste.length - 1].known
                    ? () => onCardClick(gameState.waste[gameState.waste.length - 1])
                    : undefined
                }
                className="absolute top-0 left-0"
              />
            )}
          </Pile>
        </div>

        {/* Foundations */}
        <div className="flex gap-4">
          <Pile label="红桃 ♥" symbol="♥">
            {gameState.foundations[0].length > 0 && (
              <Card
                card={gameState.foundations[0][gameState.foundations[0].length - 1]}
                className="absolute top-0 left-0"
              />
            )}
          </Pile>
          <Pile label="方片 ♦" symbol="♦">
            {gameState.foundations[1].length > 0 && (
              <Card
                card={gameState.foundations[1][gameState.foundations[1].length - 1]}
                className="absolute top-0 left-0"
              />
            )}
          </Pile>
          <Pile label="梅花 ♣" symbol="♣">
            {gameState.foundations[2].length > 0 && (
              <Card
                card={gameState.foundations[2][gameState.foundations[2].length - 1]}
                className="absolute top-0 left-0"
              />
            )}
          </Pile>
          <Pile label="黑桃 ♠" symbol="♠">
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
            cards={column}
            onCardClick={onCardClick}
          />
        ))}
      </div>
    </div>
  )
}

export default GameBoard
