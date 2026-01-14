import { ReactNode } from 'react'
import { useDroppable } from '@dnd-kit/core'

interface PileProps {
  children?: ReactNode
  label: string
  symbol?: string
  id: string
  disabled?: boolean
}

/**
 * Pile component - Container for card piles (stock, waste, foundation)
 * Provides drop zone with visual feedback
 */
const Pile = ({ children, label, symbol, id, disabled = false }: PileProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id,
    disabled,
  })

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        ref={setNodeRef}
        className={`relative w-20 h-28 rounded-lg border-2 border-dashed transition-all duration-200 ${
          isOver 
            ? 'border-emerald-400 bg-emerald-400/30 scale-110 shadow-2xl ring-4 ring-emerald-400/50' 
            : 'border-white/30 bg-black/20'
        }`}
      >
        {symbol && (
          <div className="absolute inset-0 flex items-center justify-center text-6xl opacity-20 pointer-events-none">
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
