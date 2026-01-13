interface ControlsProps {
  onNewGame: () => void;
  onSolve: () => void;
  onHint: () => void;
  onReset: () => void;
  onExport: () => void;
  onImport: () => void;
  gameMode: number;
}

/**
 * Controls component - Game control buttons and mode display
 */
const Controls = ({
  onNewGame,
  onSolve,
  onHint,
  onReset,
  onExport,
  onImport,
  gameMode
}: ControlsProps) => {
  return (
    <div className="bg-white/10 p-4 rounded-xl flex flex-wrap gap-3 items-center justify-center mb-6 backdrop-blur-sm border border-white/10 shadow-lg">
      <button
        onClick={onNewGame}
        className="bg-gradient-to-br from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white font-bold py-2.5 px-6 rounded-lg transition-all active:scale-95 shadow-lg shadow-green-900/30 hover:shadow-xl"
      >
        <span className="flex items-center gap-2">
          <span className="text-lg">🎮</span>
          <span>新游戏 New Game</span>
        </span>
      </button>

      <div className="px-4 py-2 bg-black/20 rounded-lg border border-white/20 shadow-inner">
        <span className="text-white/60 text-xs uppercase tracking-wider block mb-0.5 font-medium">抽牌模式 Mode</span>
        <span className="text-white font-bold text-lg">Draw {gameMode}</span>
      </div>

      <button
        onClick={onSolve}
        className="bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white font-bold py-2.5 px-6 rounded-lg transition-all active:scale-95 shadow-lg shadow-purple-900/30 hover:shadow-xl"
      >
        <span className="flex items-center gap-2">
          <span className="text-lg">🤖</span>
          <span>求解 Solve</span>
        </span>
      </button>

      <button
        onClick={onHint}
        className="bg-gradient-to-br from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white font-bold py-2.5 px-6 rounded-lg transition-all active:scale-95 shadow-lg shadow-amber-900/30 hover:shadow-xl"
      >
        <span className="flex items-center gap-2">
          <span className="text-lg">💡</span>
          <span>提示 Hint</span>
        </span>
      </button>

      <button
        onClick={onReset}
        className="bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold py-2.5 px-6 rounded-lg transition-all active:scale-95 shadow-lg shadow-blue-900/30 hover:shadow-xl"
      >
        <span className="flex items-center gap-2">
          <span className="text-lg">🔄</span>
          <span>重置 Reset</span>
        </span>
      </button>

      <button
        onClick={onExport}
        className="bg-gradient-to-br from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white font-bold py-2.5 px-6 rounded-lg transition-all active:scale-95 shadow-lg shadow-slate-900/30 hover:shadow-xl"
      >
        <span className="flex items-center gap-2">
          <span className="text-lg">💾</span>
          <span>导出 Export</span>
        </span>
      </button>

      <button
        onClick={onImport}
        className="bg-gradient-to-br from-slate-500 to-slate-600 hover:from-slate-400 hover:to-slate-500 text-white font-bold py-2.5 px-6 rounded-lg transition-all active:scale-95 shadow-lg shadow-slate-900/30 hover:shadow-xl"
      >
        <span className="flex items-center gap-2">
          <span className="text-lg">📁</span>
          <span>导入 Import</span>
        </span>
      </button>
    </div>
  )
}

export default Controls
