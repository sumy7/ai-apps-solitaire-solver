import { ReactNode, type DragEventHandler } from 'react'

interface PileProps {
  children?: ReactNode
  label: string
  symbol?: string
  allowDrop?: boolean
  onDrop?: () => void
  onDragEnter?: () => void
  onDragLeave?: () => void
}

/**
 * Pile component - Container for card piles (stock, waste, foundation)
 */
const Pile = ({ children, label, symbol, allowDrop = false, onDrop, onDragEnter, onDragLeave }: PileProps) => {
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

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="relative w-20 h-28 rounded-lg border-2 border-dashed border-white/30 bg-black/20"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onDragEnter={allowDrop ? onDragEnter : undefined}
        onDragLeave={allowDrop ? onDragLeave : undefined}
      >
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
