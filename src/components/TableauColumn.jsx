import Card from './Card'

/**
 * TableauColumn component - Displays a tableau column with cascading cards
 * @param {Object} props - Component props
 * @param {Array} props.cards - Array of cards in the column
 * @param {Function} props.onCardClick - Click handler for cards
 */
const TableauColumn = ({ cards, onCardClick }) => {
  return (
    <div className="min-w-[80px] min-h-[112px] relative">
      {cards.map((card, index) => (
        <div
          key={index}
          className="absolute"
          style={{ top: `${index * 30}px` }}
        >
          <Card
            card={card}
            onClick={card.faceUp && !card.known ? () => onCardClick(card) : undefined}
          />
        </div>
      ))}
    </div>
  )
}

export default TableauColumn
