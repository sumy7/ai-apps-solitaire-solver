import Card from './Card'
import { Card as CardType } from '../types'
import type { DragEventHandler } from 'react'
import { SUITS, RANK_VALUES } from '../constants/gameConstants'

interface TableauColumnProps {
  columnIndex: number
  cards: CardType[]
  onCardLeftClick: (card: CardType) => void
  onCardRightClick: (card: CardType) => void
  onDrop?: () => void
  allowDrop?: boolean
  onDragStartCard?: (card: CardType, index: number) => void
  onDragEndCard?: () => void
}

/**
 * TableauColumn component - Displays a tableau column with cascading cards
 */
const TableauColumn = ({ columnIndex, cards, onCardLeftClick, onCardRightClick, onDrop, allowDrop = false, onDragStartCard, onDragEndCard }: TableauColumnProps) => {
  const handleDragOver: DragEventHandler<HTMLDivElement> = (e) => {
    if (!allowDrop) return
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop: DragEventHandler<HTMLDivElement> = (e) => {
    if (!allowDrop) return
    e.preventDefault()
    onDrop?.()
  }

  const isValidRunFrom = (startIndex: number) => {
    for (let i = startIndex; i < cards.length; i++) {
      const card = cards[i]
      if (!card.faceUp || !card.known || !card.rank || !card.suit) return false
      if (i < cards.length - 1) {
        const next = cards[i + 1]
        if (!next.faceUp || !next.known || !next.rank || !next.suit) return false
        const colorDiffers = SUITS[card.suit].color !== SUITS[next.suit].color
        const isDescending = RANK_VALUES[card.rank] === RANK_VALUES[next.rank] + 1
        if (!colorDiffers || !isDescending) return false
      }
    }
    return true
  }

  return (
    <div
      className="min-w-[80px] min-h-[112px] relative"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="absolute top-0 left-0 w-20 h-28 rounded-lg border-2 border-dashed border-white/30 bg-black/10 pointer-events-none" />

      {cards.map((card, index) => {
        const canDrag = card.faceUp && card.known && isValidRunFrom(index)

        return (
          <div
            key={card.id}
            className="absolute"
            style={{ top: `${index * 30}px` }}
          >
            <Card
              card={card}
              onClick={card.faceUp ? () => onCardLeftClick(card) : undefined}
              onContextMenu={() => onCardRightClick(card)}
              draggable={canDrag}
              onDragStart={canDrag ? (event) => { event.dataTransfer.effectAllowed = 'move'; onDragStartCard?.(card, index) } : undefined}
              onDragEnd={canDrag ? onDragEndCard : undefined}
            />
          </div>
        )
      })}
    </div>
  )
}

export default TableauColumn
