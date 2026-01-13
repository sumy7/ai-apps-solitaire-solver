import { DRAW_MODES } from '../constants/gameConstants'

/**
 * Controls component - Game control buttons and mode selector
 * @param {Object} props - Component props
 * @param {Function} props.onNewGame - Handler for new game button
 * @param {Function} props.onSolve - Handler for solve button
 * @param {Function} props.onHint - Handler for hint button
 * @param {Function} props.onReset - Handler for reset button
 * @param {number} props.drawMode - Current draw mode
 * @param {Function} props.onDrawModeChange - Handler for draw mode change
 */
const Controls = ({
  onNewGame,
  onSolve,
  onHint,
  onReset,
  drawMode,
  onDrawModeChange
}) => {
  return (
    <div className="bg-white/10 p-4 rounded-xl flex flex-wrap gap-4 items-center justify-center mb-6">
      <button
        onClick={onNewGame}
        className="bg-green-700 hover:bg-green-600 text-white font-bold py-2 px-5 rounded-lg transition-colors active:scale-95"
      >
        新游戏 New Game
      </button>

      <div className="flex items-center gap-3">
        <label className="text-white font-bold">抽牌模式 Draw Mode:</label>
        <select
          value={drawMode}
          onChange={(e) => onDrawModeChange(Number(e.target.value))}
          className="py-2 px-4 rounded-lg border-none cursor-pointer text-sm bg-white"
        >
          <option value={DRAW_MODES.ONE}>抽 1 张 (Draw 1)</option>
          <option value={DRAW_MODES.THREE}>抽 3 张 (Draw 3)</option>
        </select>
      </div>

      <button
        onClick={onSolve}
        className="bg-green-700 hover:bg-green-600 text-white font-bold py-2 px-5 rounded-lg transition-colors active:scale-95"
      >
        求解 Solve
      </button>

      <button
        onClick={onHint}
        className="bg-green-700 hover:bg-green-600 text-white font-bold py-2 px-5 rounded-lg transition-colors active:scale-95"
      >
        提示 Hint
      </button>

      <button
        onClick={onReset}
        className="bg-green-700 hover:bg-green-600 text-white font-bold py-2 px-5 rounded-lg transition-colors active:scale-95"
      >
        重置 Reset
      </button>
    </div>
  )
}

export default Controls
