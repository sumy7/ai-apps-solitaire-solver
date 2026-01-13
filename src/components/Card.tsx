import { SUITS } from '../constants/gameConstants'
import { Card as CardType } from '../types'
import type { DragEvent, MouseEvent } from 'react'

interface CardProps {
  card: CardType
  onClick?: () => void
  onContextMenu?: (event: MouseEvent<HTMLDivElement>) => void
  className?: string
  draggable?: boolean
  onDragStart?: (event: DragEvent<HTMLDivElement>) => void
  onDragEnd?: () => void
}

/**
 * Card component - Displays a single playing card
 */
const Card = ({ card, onClick, className = '', draggable = false, onDragStart, onDragEnd, onContextMenu }: CardProps) => {
  const isKnown = Boolean(card.known && card.suit && card.rank)
  const isFaceDownKnown = !card.faceUp && isKnown
  const showFace = card.faceUp && isKnown

  return (
    <div
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
        ${className}
      `}
      onClick={onClick}
      onContextMenu={onContextMenu ? (event) => { event.preventDefault(); onContextMenu(event) } : undefined}
      draggable={draggable}
      onDragStart={draggable ? onDragStart : undefined}
      onDragEnd={draggable ? onDragEnd : undefined}
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
