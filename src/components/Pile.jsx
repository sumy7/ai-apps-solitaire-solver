/**
 * Pile component - Container for card piles (stock, waste, foundation)
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child elements (cards)
 * @param {string} props.label - Label text for the pile
 * @param {string} props.symbol - Symbol to display on empty pile (optional)
 */
const Pile = ({ children, label, symbol }) => {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-20 h-28 rounded-lg border-2 border-dashed border-white/30 bg-black/20">
        {symbol && (
          <div className="absolute inset-0 flex items-center justify-center text-6xl opacity-20">
            {symbol}
          </div>
        )}
        {children}
      </div>
      <span className="text-xs text-white/70">{label}</span>
    </div>
  )
}

export default Pile
