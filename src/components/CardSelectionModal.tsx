import { SUITS, RANKS } from '../constants/gameConstants'
import { Suit, Rank } from '../types'

interface CardSelectionModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (suit: Suit, rank: Rank) => void
  usedCards: Set<string>
}

const SUIT_ORDER: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades']

const CardSelectionModal = ({ isOpen, onClose, onSelect, usedCards }: CardSelectionModalProps) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="bg-slate-800 p-4 flex justify-between items-center text-white">
          <h2 className="text-xl font-bold">选择卡牌进行标注 (Select Card to Mark)</h2>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-8 space-y-4">
          <p className="text-sm text-slate-500">4 × 13 平铺展示。已用的牌会置灰，点击任意可用牌进行标注。</p>

          <div className="space-y-4">
            {SUIT_ORDER.map((suit) => (
              <div
                key={suit}
                className="rounded-xl border border-slate-200 bg-slate-50/60 p-3 shadow-sm"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-2xl ${SUITS[suit].color === 'red' ? 'text-red-600' : 'text-slate-800'}`}>
                    {SUITS[suit].symbol}
                  </span>
                  <span className="text-slate-600 capitalize text-sm">{suit}</span>
                </div>

                <div
                  className="grid gap-2"
                  style={{ gridTemplateColumns: 'repeat(13, minmax(48px, 1fr))' }}
                >
                  {RANKS.map((rank) => {
                    const cardKey = `${suit}-${rank}`
                    const isUsed = usedCards.has(cardKey)
                    const colorClass = SUITS[suit].color === 'red'
                      ? 'text-red-600 border-red-100 hover:border-red-500 hover:bg-red-50'
                      : 'text-slate-800 border-slate-200 hover:border-slate-800 hover:bg-slate-50'

                    return (
                      <button
                        key={cardKey}
                        disabled={isUsed}
                        onClick={() => onSelect(suit, rank)}
                        className={`
                          h-12 rounded-lg text-sm font-semibold border-2 transition-all
                          ${isUsed
                            ? 'bg-slate-100 text-slate-300 border-transparent cursor-not-allowed'
                            : `bg-white ${colorClass} active:scale-95`}
                        `}
                      >
                        {rank}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CardSelectionModal
