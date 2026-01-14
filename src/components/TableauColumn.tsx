import Card from './Card'
import { Card as CardType } from '../types'
import { SUITS, RANK_VALUES } from '../constants/gameConstants'
import { useDroppable } from '@dnd-kit/core'

interface TableauColumnProps {
  columnIndex: number
  cards: CardType[]
  onCardLeftClick: (card: CardType) => void
  onCardRightClick: (card: CardType) => void
  id: string
  disabled?: boolean
  draggingCardIds: Set<string>
}

/**
 * TableauColumn component - Displays a tableau column with cascading cards
 * Supports multi-card drag from valid runs
 */
const TableauColumn = ({ columnIndex, cards, onCardLeftClick, onCardRightClick, id, disabled = false, draggingCardIds }: TableauColumnProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id,
    disabled,
  })

  // Calculate minimum height: 30px per card + 112px base height for empty column
  const minHeight = cards.length * 30 + 112

  /**
   * Check if cards from startIndex onwards form a valid alternating-color descending sequence
   */
  const isValidRunFrom = (startIndex: number): boolean => {
    for (let i = startIndex; i < cards.length - 1; i++) {
      const current = cards[i]
      const next = cards[i + 1]
      
      // Both cards must be face-up and known
      if (!current.faceUp || !current.known || !current.rank || !current.suit ||
          !next.faceUp || !next.known || !next.rank || !next.suit) {
        return false
      }

      // Check alternating colors and descending rank
      const colorDiffers = SUITS[current.suit].color !== SUITS[next.suit].color
      const isDescending = RANK_VALUES[current.rank] === RANK_VALUES[next.rank] + 1
      
      if (!colorDiffers || !isDescending) return false
    }
    
    return cards[startIndex].faceUp && cards[startIndex].known
  }

  return (
    <div
      ref={setNodeRef}
      className={`min-w-[80px] relative transition-all duration-200 ${
        isOver ? 'bg-emerald-400/20 rounded-xl scale-105 shadow-xl ring-4 ring-emerald-400/50' : ''
      }`}
      style={{ minHeight: `${minHeight}px` }}
    >
      {/* Empty column placeholder */}
      <div className="absolute top-0 left-0 w-20 h-28 rounded-lg border-2 border-dashed border-white/30 bg-black/10 pointer-events-none" />

      {cards.map((card, index) => {
        const canDrag = card.faceUp && card.known && isValidRunFrom(index)
        const isDragging = draggingCardIds.has(card.id)
        
        const dragData = canDrag ? {
          type: 'tableau',
          column: columnIndex,
          startIndex: index,
          cards: cards.slice(index)
        } : undefined

        return (
          <div
            key={card.id}
            className={`absolute transition-opacity duration-150 ${isDragging ? 'opacity-0' : ''}`}
            style={{ top: `${index * 30}px` }}
          >
            <Card
              card={card}
              onClick={card.faceUp ? () => onCardLeftClick(card) : undefined}
              onContextMenu={() => onCardRightClick(card)}
              draggable={canDrag && !isDragging}
              dragData={dragData}
            />
          </div>
        )
      })}
    </div>
  )
}

export default TableauColumn
