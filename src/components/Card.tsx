import { SUITS } from '../constants/gameConstants'
import { Card as CardType } from '../types'
import type { MouseEvent } from 'react'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'

interface CardProps {
  card: CardType
  onClick?: () => void
  onContextMenu?: (event: MouseEvent<HTMLDivElement>) => void
  className?: string
  draggable?: boolean
  dragData?: {
    type: 'waste' | 'tableau'
    cards: CardType[]
    column?: number
    startIndex?: number
  }
}

/**
 * Card component - Displays a single playing card
 */
const Card = ({ card, onClick, className = '', draggable = false, dragData, onContextMenu }: CardProps) => {
  const isKnown = Boolean(card.known && card.suit && card.rank)
  const isFaceDownKnown = !card.faceUp && isKnown
  const showFace = card.faceUp && isKnown

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: card.id,
    data: dragData,
    disabled: !draggable,
  })

  const style = transform ? {
    transform: CSS.Translate.toString(transform),
    transition: 'transform 150ms cubic-bezier(0.25, 0.1, 0.25, 1)',
  } : undefined

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...(draggable ? listeners : {})}
      {...attributes}
      className={`
        relative w-20 h-28 rounded-lg shadow-md transition-all duration-200
        ${showFace 
          ? 'bg-white border border-gray-300 hover:shadow-xl'
          : isFaceDownKnown
            ? 'bg-white/20 border border-white/30 backdrop-blur-md'
            : 'bg-gradient-to-br from-felt-dark to-felt-light border-2 border-green-600 cursor-pointer hover:translate-y-[-3px] hover:shadow-xl hover:border-green-400'
        }
        ${onClick ? 'cursor-pointer' : ''}
        ${draggable ? 'cursor-move hover:scale-105' : ''}
        ${isDragging ? 'opacity-50' : ''}
        ${className}
      `}
      onClick={onClick}
      onContextMenu={onContextMenu ? (event) => { event.preventDefault(); onContextMenu(event) } : undefined}
    >
      {!isKnown ? (
        <div className="flex items-center justify-center h-full">
          <span className="text-5xl text-white/50 font-bold select-none">?</span>
        </div>
      ) : (
        card.suit && card.rank && (
          <div
            className={`flex flex-col justify-between p-2 h-full select-none ${SUITS[card.suit].color === 'red' ? 'text-red-600' : 'text-black'} ${isFaceDownKnown ? 'opacity-60' : ''}`}
          >
            <div className="flex flex-col">
              <span className="text-lg font-bold leading-none">{card.rank}</span>
              <span className="text-2xl leading-none mt-0.5">{SUITS[card.suit].symbol}</span>
            </div>
            <div className="flex items-center justify-center">
              <span className="text-4xl opacity-90">{SUITS[card.suit].symbol}</span>
            </div>
          </div>
        )
      )}

      {isFaceDownKnown && (
        <div className="absolute inset-0 rounded-lg bg-black/10 pointer-events-none" aria-hidden />
      )}
    </div>
  )
}

export default Card
