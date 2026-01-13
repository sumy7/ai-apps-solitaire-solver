import { SUITS } from '../constants/gameConstants'

/**
 * Card component - Displays a single playing card
 * @param {Object} props - Component props
 * @param {Object} props.card - Card data (suit, rank, faceUp, known)
 * @param {Function} props.onClick - Click handler for the card
 * @param {string} props.className - Additional CSS classes
 */
const Card = ({ card, onClick, className = '' }) => {
  const isUnknown = !card.faceUp || !card.known

  return (
    <div
      className={`
        w-20 h-28 rounded-lg shadow-md transition-all duration-200
        ${isUnknown 
          ? 'bg-gradient-to-br from-felt-dark to-felt-light border-2 border-green-600 cursor-pointer hover:translate-y-[-5px] hover:shadow-lg' 
          : 'bg-white border border-gray-300'
        }
        ${onClick && isUnknown ? 'cursor-pointer' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {isUnknown ? (
        // Unknown card - show question mark
        <div className="flex items-center justify-center h-full">
          <span className="text-5xl text-white/50 font-bold">?</span>
        </div>
      ) : (
        // Known card - show suit and rank
        <div className={`flex flex-col justify-between p-2 h-full ${SUITS[card.suit].color === 'red' ? 'text-red-600' : 'text-black'}`}>
          <div className="flex flex-col">
            <span className="text-lg font-bold">{card.rank}</span>
            <span className="text-2xl">{SUITS[card.suit].symbol}</span>
          </div>
          <div className="flex items-center justify-center">
            <span className="text-4xl">{SUITS[card.suit].symbol}</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default Card
